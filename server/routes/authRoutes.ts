import { Router } from 'express';
import crypto from 'crypto';
import { db, verifyPassword } from '../db.js';
import { generateToken, authMiddleware, AuthenticatedRequest } from '../auth.js';
import { syncUserToSupabase, syncActivityLogToSupabase } from '../supabase.js';

export const authRouter = Router();

// Quick login accounts list for easy testing & demo role switching
authRouter.get('/demo-accounts', (req, res) => {
  const users = db.getRawData().users.map((u) => ({
    id: u.id,
    username: u.username,
    role: u.role,
    fullName: u.fullName,
    branchName: u.branchName,
    employeeId: u.employeeId,
    admissionNo: u.admissionNo,
    designation: u.designation,
    className: u.className,
    section: u.section,
  }));
  res.json({ accounts: users });
});

// Teacher Self-Registration
authRouter.post('/register-teacher', async (req, res) => {
  const {
    fullName,
    email,
    employeeId: customEmployeeId,
    password,
    branchId,
    phone,
    designation,
    assignedSubjectIds,
    assignedClassIds,
  } = req.body;

  if (!fullName || !email || !password || !branchId) {
    return res.status(400).json({ error: 'Full name, email, password, and branch campus are required.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const existingByEmail = db.findUserByLogin(cleanEmail);
  if (existingByEmail) {
    return res.status(400).json({ error: `An account with email "${cleanEmail}" already exists. Please login instead.` });
  }

  const branch = db.getBranches().find((b) => b.id === branchId);
  if (!branch) {
    return res.status(400).json({ error: 'Selected DIPS branch campus was not found.' });
  }

  const branchCode = branch.code || 'DIPS';
  const employeeId = (customEmployeeId && customEmployeeId.trim())
    ? customEmployeeId.trim().toUpperCase()
    : `EMP-${branchCode}-${Math.floor(100 + Math.random() * 900)}`;

  const existingByEmpId = db.findUserByLogin(employeeId);
  if (existingByEmpId) {
    return res.status(400).json({ error: `An account with Employee ID "${employeeId}" already exists.` });
  }

  const username = employeeId.toLowerCase().replace(/[^a-z0-9]/g, '') || cleanEmail.split('@')[0];
  const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

  const newTeacher = {
    id: 'user-tea-' + Date.now().toString().slice(-6),
    username,
    email: cleanEmail,
    fullName: fullName.trim(),
    role: 'teacher' as const,
    branchId: branch.id,
    branchName: branch.name,
    employeeId,
    designation: designation || 'TGT Teacher',
    assignedSubjectIds: Array.isArray(assignedSubjectIds) ? assignedSubjectIds : [],
    assignedClassIds: Array.isArray(assignedClassIds) ? assignedClassIds : [],
    phone: phone ? phone.trim() : '',
    isActive: true,
    createdAt: new Date().toISOString(),
    passwordHash,
  };

  db.addUser(newTeacher);

  // Permanently save teacher account to Supabase
  try {
    await syncUserToSupabase(newTeacher, passwordHash);
  } catch (syncErr) {
    console.warn('[Supabase] Teacher account sync warning:', syncErr);
  }

  if (typeof branch.totalTeachers === 'number') {
    db.updateBranch(branch.id, { totalTeachers: branch.totalTeachers + 1 });
  }

  db.logActivity({
    userId: newTeacher.id,
    userName: newTeacher.fullName,
    userRole: newTeacher.role,
    branchName: branch.name,
    action: 'LOGIN',
    details: `Teacher self-registered institutional account (${newTeacher.fullName}, ${employeeId}) at ${branch.name}.`,
    ipAddress: req.ip,
  });

  const { passwordHash: _, ...safeUser } = newTeacher;
  const token = generateToken(safeUser);

  return res.status(201).json({
    token,
    user: safeUser,
    message: 'Faculty account registered successfully! You can now access your teacher workspace or log in anytime using your Employee ID or Email.',
  });
});

authRouter.post('/login', async (req, res) => {
  const { username, password, expectedRole } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username/ID and password are required.' });
  }

  const user = db.findUserByLogin(username);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials. User not found.' });
  }

  if (!user.isActive) {
    return res.status(403).json({ error: 'Your account has been deactivated by the DIPS administration.' });
  }

  // Validate password
  if (!verifyPassword(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid credentials. Incorrect password.' });
  }

  // If role filter is provided, ensure matches or admin
  if (expectedRole && user.role !== 'admin' && user.role !== expectedRole) {
    return res.status(403).json({
      error: `You are trying to log in via the ${expectedRole} portal, but your account role is "${user.role}". Please select the correct login tab.`,
    });
  }

  const { passwordHash, ...safeUser } = user;
  const token = generateToken(safeUser);

  const logEntry = {
    userId: user.id,
    userName: user.fullName,
    userRole: user.role,
    branchName: user.branchName || 'DIPS Central',
    action: 'LOGIN' as const,
    details: `User (${user.fullName}, ${user.role}) logged in from ${user.branchName || 'central system'}.`,
    ipAddress: req.ip,
  };

  db.logActivity(logEntry);

  try {
    await syncActivityLogToSupabase(logEntry);
  } catch (logErr) {
    // Non-blocking log sync
  }

  return res.json({
    token,
    user: safeUser,
  });
});

authRouter.get('/me', authMiddleware, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  // Hydrate assigned subjects and classes for rich profile
  const allSubjects = db.getSubjects();
  const allClasses = db.getClasses();
  const allBranches = db.getBranches();

  const branch = allBranches.find((b) => b.id === user.branchId);

  let enrichedUser = {
    ...user,
    branchName: branch?.name || user.branchName,
  };

  if (user.role === 'teacher' || user.role === 'coordinator') {
    enrichedUser = {
      ...enrichedUser,
      assignedSubjects: allSubjects.filter((s) => user.assignedSubjectIds?.includes(s.id)),
      assignedClasses: allClasses.filter((c) => user.assignedClassIds?.includes(c.id)),
    };
  }

  return res.json({ user: enrichedUser });
});

authRouter.post('/change-password', authMiddleware, (req: AuthenticatedRequest, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Both current and new passwords are required.' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
  }

  const userWithHash = db.findUserById(req.user!.id);
  if (!userWithHash) return res.status(404).json({ error: 'User not found' });

  if (!verifyPassword(currentPassword, userWithHash.passwordHash)) {
    return res.status(400).json({ error: 'Current password is incorrect.' });
  }

  const newHash = crypto.createHash('sha256').update(newPassword).digest('hex');
  db.updateUser(req.user!.id, { passwordHash: newHash });

  return res.json({ success: true, message: 'Password successfully updated.' });
});
