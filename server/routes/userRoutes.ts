import { Router } from 'express';
import crypto from 'crypto';
import { db } from '../db.js';
import { authMiddleware, requireAdmin, AuthenticatedRequest } from '../auth.js';
import { syncUserToSupabase, deleteUserFromSupabase } from '../supabase.js';
import type { User } from '../../src/types.js';

export const userRouter = Router();

// Teachers List
userRouter.get('/teachers', authMiddleware, (req: AuthenticatedRequest, res) => {
  const allUsers = db.getRawData().users;
  const teachers = allUsers
    .filter((u) => u.role === 'teacher' || u.role === 'coordinator')
    .map(({ passwordHash, ...safeUser }) => safeUser);
  res.json({ teachers });
});

// Add Teacher
userRouter.post('/teachers', authMiddleware, requireAdmin, async (req: AuthenticatedRequest, res) => {
  const {
    fullName,
    employeeId,
    email,
    phone,
    branchId,
    designation,
    assignedSubjectIds,
    assignedClassIds,
    initialPassword,
    role,
  } = req.body;

  if (!fullName || !employeeId || !branchId) {
    return res.status(400).json({ error: 'Full name, Employee ID, and Branch are required.' });
  }

  // Check if username/employeeId already exists
  if (db.findUserByLogin(employeeId)) {
    return res.status(400).json({ error: `An account with Employee ID/Username "${employeeId}" already exists.` });
  }

  const branch = db.getBranches().find((b) => b.id === branchId);
  const password = initialPassword || 'teacher123';
  const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

  const newTeacher: User & { passwordHash: string } = {
    id: 'user-tea-' + Date.now().toString().slice(-5),
    username: employeeId.toLowerCase().replace(/[^a-z0-9]/g, ''),
    email: email || `${employeeId.toLowerCase()}@dips.edu.in`,
    fullName,
    role: role === 'coordinator' ? 'coordinator' : 'teacher',
    branchId,
    branchName: branch?.name || 'DIPS Branch',
    employeeId,
    designation: designation || 'TGT Teacher',
    assignedSubjectIds: Array.isArray(assignedSubjectIds) ? assignedSubjectIds : [],
    assignedClassIds: Array.isArray(assignedClassIds) ? assignedClassIds : [],
    phone: phone || '',
    isActive: true,
    createdAt: new Date().toISOString(),
    passwordHash,
  };

  db.addUser(newTeacher);

  // Permanently save teacher account to Supabase
  try {
    await syncUserToSupabase(newTeacher, passwordHash);
  } catch (syncErr) {
    console.warn('[Supabase] Teacher sync warning:', syncErr);
  }

  db.logActivity({
    userId: req.user!.id,
    userName: req.user!.fullName,
    userRole: req.user!.role,
    branchName: 'Central Admin',
    action: 'UPLOAD',
    details: `Added new faculty member: ${fullName} (${employeeId}) at ${branch?.name}.`,
  });

  const { passwordHash: _, ...safe } = newTeacher;
  return res.status(201).json({ teacher: safe });
});

// Edit Teacher
userRouter.put('/teachers/:id', authMiddleware, requireAdmin, async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const teacher = db.findUserById(id);
  if (!teacher || (teacher.role !== 'teacher' && teacher.role !== 'coordinator')) {
    return res.status(404).json({ error: 'Teacher not found' });
  }

  const {
    fullName,
    employeeId,
    email,
    phone,
    branchId,
    designation,
    assignedSubjectIds,
    assignedClassIds,
    isActive,
    role,
  } = req.body;

  let branchName = teacher.branchName;
  if (branchId) {
    const b = db.getBranches().find((item) => item.id === branchId);
    if (b) branchName = b.name;
  }

  const updated = db.updateUser(id, {
    fullName: fullName ?? teacher.fullName,
    employeeId: employeeId ?? teacher.employeeId,
    email: email ?? teacher.email,
    phone: phone ?? teacher.phone,
    branchId: branchId ?? teacher.branchId,
    branchName,
    designation: designation ?? teacher.designation,
    assignedSubjectIds: assignedSubjectIds ?? teacher.assignedSubjectIds,
    assignedClassIds: assignedClassIds ?? teacher.assignedClassIds,
    isActive: typeof isActive === 'boolean' ? isActive : teacher.isActive,
    role: role ?? teacher.role,
  });

  db.logActivity({
    userId: req.user!.id,
    userName: req.user!.fullName,
    userRole: req.user!.role,
    branchName: 'Central Admin',
    action: 'UPDATE',
    details: `Updated teacher profile & assignments for ${teacher.fullName}.`,
  });

  const { passwordHash: _, ...safe } = updated!;

  // Sync update to Supabase
  try {
    await syncUserToSupabase(updated!, updated!.passwordHash);
  } catch (syncErr) {
    console.warn('[Supabase] Teacher update sync notice:', syncErr);
  }

  return res.json({ teacher: safe });
});

// Delete Teacher
userRouter.delete('/teachers/:id', authMiddleware, requireAdmin, async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const teacher = db.findUserById(id);
  if (!teacher) return res.status(404).json({ error: 'Teacher not found' });

  db.deleteUser(id);

  // Sync deletion to Supabase
  try {
    await deleteUserFromSupabase(id);
  } catch (syncErr) {
    console.warn('[Supabase] Teacher delete sync notice:', syncErr);
  }

  db.logActivity({
    userId: req.user!.id,
    userName: req.user!.fullName,
    userRole: req.user!.role,
    branchName: 'Central Admin',
    action: 'DELETE',
    details: `Removed teacher account: ${teacher.fullName} (${teacher.employeeId}).`,
  });

  return res.json({ success: true });
});

// Students List
userRouter.get('/students', authMiddleware, (req: AuthenticatedRequest, res) => {
  const allUsers = db.getRawData().users;
  const students = allUsers
    .filter((u) => u.role === 'student')
    .map(({ passwordHash, ...safeUser }) => safeUser);
  res.json({ students });
});

// Add Student
userRouter.post('/students', authMiddleware, requireAdmin, async (req: AuthenticatedRequest, res) => {
  const {
    fullName,
    admissionNo,
    email,
    phone,
    branchId,
    classId,
    section,
    rollNo,
    academicSessionId,
    initialPassword,
  } = req.body;

  if (!fullName || !admissionNo || !branchId || !classId) {
    return res.status(400).json({ error: 'Full name, Admission No, Branch, and Class are required.' });
  }

  if (db.findUserByLogin(admissionNo)) {
    return res.status(400).json({ error: `A student with Admission No "${admissionNo}" already exists.` });
  }

  const branch = db.getBranches().find((b) => b.id === branchId);
  const cls = db.getClasses().find((c) => c.id === classId);
  const password = initialPassword || 'student123';
  const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

  const newStudent: User & { passwordHash: string } = {
    id: 'user-stu-' + Date.now().toString().slice(-5),
    username: admissionNo,
    email: email || `${admissionNo.toLowerCase()}@student.dips.edu.in`,
    fullName,
    role: 'student',
    branchId,
    branchName: branch?.name || 'DIPS Branch',
    admissionNo,
    classId,
    className: cls?.name || 'Class VII',
    section: section || 'A',
    rollNo: rollNo || '01',
    academicSessionId: academicSessionId || 'sess-2026-27',
    phone: phone || '',
    isActive: true,
    createdAt: new Date().toISOString(),
    passwordHash,
  };

  db.addUser(newStudent);

  // Sync Student to Supabase for permanent storage
  try {
    await syncUserToSupabase(newStudent, passwordHash);
  } catch (syncErr) {
    console.warn('[Supabase] Student sync notice:', syncErr);
  }

  db.logActivity({
    userId: req.user!.id,
    userName: req.user!.fullName,
    userRole: req.user!.role,
    branchName: 'Central Admin',
    action: 'UPLOAD',
    details: `Enrolled new student: ${fullName} (${admissionNo}) in ${cls?.name}-${section} at ${branch?.name}.`,
  });

  const { passwordHash: _, ...safe } = newStudent;
  return res.status(201).json({ student: safe });
});

// Edit Student
userRouter.put('/students/:id', authMiddleware, requireAdmin, async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const student = db.findUserById(id);
  if (!student || student.role !== 'student') {
    return res.status(404).json({ error: 'Student not found' });
  }

  const {
    fullName,
    admissionNo,
    email,
    phone,
    branchId,
    classId,
    section,
    rollNo,
    academicSessionId,
    isActive,
  } = req.body;

  let branchName = student.branchName;
  if (branchId) {
    const b = db.getBranches().find((item) => item.id === branchId);
    if (b) branchName = b.name;
  }

  let className = student.className;
  if (classId) {
    const c = db.getClasses().find((item) => item.id === classId);
    if (c) className = c.name;
  }

  const updated = db.updateUser(id, {
    fullName: fullName ?? student.fullName,
    admissionNo: admissionNo ?? student.admissionNo,
    email: email ?? student.email,
    phone: phone ?? student.phone,
    branchId: branchId ?? student.branchId,
    branchName,
    classId: classId ?? student.classId,
    className,
    section: section ?? student.section,
    rollNo: rollNo ?? student.rollNo,
    academicSessionId: academicSessionId ?? student.academicSessionId,
    isActive: typeof isActive === 'boolean' ? isActive : student.isActive,
  });

  // Sync update to Supabase
  try {
    if (updated) {
      await syncUserToSupabase(updated, updated.passwordHash);
    }
  } catch (syncErr) {
    console.warn('[Supabase] Student update sync notice:', syncErr);
  }

  const { passwordHash: _, ...safe } = updated!;
  return res.json({ student: safe });
});

// Delete Student
userRouter.delete('/students/:id', authMiddleware, requireAdmin, async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const student = db.findUserById(id);
  if (!student) return res.status(404).json({ error: 'Student not found' });

  db.deleteUser(id);

  // Sync deletion to Supabase
  try {
    await deleteUserFromSupabase(id);
  } catch (syncErr) {
    console.warn('[Supabase] Student delete sync notice:', syncErr);
  }

  return res.json({ success: true });
});

// Reset Password
userRouter.post('/:id/reset-password', authMiddleware, requireAdmin, async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;
  const user = db.findUserById(id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const targetPassword = newPassword || (user.role === 'student' ? 'student123' : 'teacher123');
  const newHash = crypto.createHash('sha256').update(targetPassword).digest('hex');
  const updated = db.updateUser(id, { passwordHash: newHash });

  // Sync to Supabase
  try {
    if (updated) {
      await syncUserToSupabase(updated, newHash);
    }
  } catch (syncErr) {
    console.warn('[Supabase] Password reset sync notice:', syncErr);
  }

  db.logActivity({
    userId: req.user!.id,
    userName: req.user!.fullName,
    userRole: req.user!.role,
    branchName: 'Central Admin',
    action: 'UPDATE',
    details: `Reset password for ${user.fullName} (${user.username}).`,
  });

  return res.json({ success: true, message: `Password reset to "${targetPassword}".` });
});

// Toggle Active/Inactive
userRouter.post('/:id/toggle-status', authMiddleware, requireAdmin, async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const user = db.findUserById(id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const updated = db.updateUser(id, { isActive: !user.isActive });

  // Sync to Supabase
  try {
    if (updated) {
      await syncUserToSupabase(updated, updated.passwordHash);
    }
  } catch (syncErr) {
    console.warn('[Supabase] Toggle status sync notice:', syncErr);
  }

  db.logActivity({
    userId: req.user!.id,
    userName: req.user!.fullName,
    userRole: req.user!.role,
    branchName: 'Central Admin',
    action: 'UPDATE',
    details: `${updated?.isActive ? 'Activated' : 'Deactivated'} account for ${user.fullName}.`,
  });

  return res.json({ success: true, isActive: updated?.isActive });
});

// Self-service profile & assigned subjects/classes update for current teacher
userRouter.put('/profile', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const user = db.findUserById(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const {
    fullName,
    phone,
    designation,
    assignedSubjectIds,
    assignedClassIds,
  } = req.body;

  const updated = db.updateUser(userId, {
    fullName: fullName !== undefined ? fullName : user.fullName,
    phone: phone !== undefined ? phone : user.phone,
    designation: designation !== undefined ? designation : user.designation,
    assignedSubjectIds: Array.isArray(assignedSubjectIds) ? assignedSubjectIds : user.assignedSubjectIds,
    assignedClassIds: Array.isArray(assignedClassIds) ? assignedClassIds : user.assignedClassIds,
  });

  try {
    if (updated) {
      await syncUserToSupabase(updated, updated.passwordHash);
    }
  } catch (syncErr) {
    console.warn('[Supabase] Profile update sync notice:', syncErr);
  }

  db.logActivity({
    userId: user.id,
    userName: updated?.fullName || user.fullName,
    userRole: user.role,
    branchName: user.branchName || 'DIPS Branch',
    action: 'UPDATE',
    details: `Updated personal profile & assigned subjects/classes.`,
  });

  const { passwordHash: _, ...safe } = updated!;
  return res.json({ success: true, user: safe });
});

