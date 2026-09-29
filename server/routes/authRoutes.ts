import { Router } from 'express';
import * as otplib from 'otplib';
import qrcode from 'qrcode';
import rateLimit from 'express-rate-limit';

// Strict rate limiter for authentication routes to prevent brute-force attacks
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Max 10 attempts per IP per 15 min
  message: { error: 'Too many login attempts from this IP. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 15, // Max 15 registrations per IP per hour
  message: { error: 'Too many account registrations from this IP. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
import crypto from 'crypto';
import { db, verifyPassword, hashPassword } from '../db.js';
import { generateToken, authMiddleware, AuthenticatedRequest, requireAdmin, getActiveSessionsList, terminateSession, terminateAllUserSessions } from '../auth.js';
import { syncUserToSupabase, syncActivityLogToSupabase, getSupabaseClient } from '../supabase.js';

export const authRouter = Router();

// RFC 6238 TOTP Two-Factor Authentication implementation
function generateBase32Key(length = 16): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let secret = '';
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    secret += chars[bytes[i] % 32];
  }
  return secret;
}

function getTotp(secret: string, timeOffset = 0): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = '';
  for (let i = 0; i < secret.length; i++) {
    const val = chars.indexOf(secret.charAt(i).toUpperCase());
    if (val === -1) continue;
    bits += val.toString(2).padStart(5, '0');
  }
  const keyBytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    keyBytes.push(parseInt(bits.substr(i, 8), 2));
  }
  const key = Buffer.from(keyBytes);

  const epoch = Math.floor(Date.now() / 1000) + timeOffset;
  const timeStep = 30;
  const currentCounter = Math.floor(epoch / timeStep);

  const buf = Buffer.alloc(8);
  buf.writeBigInt64BE(BigInt(currentCounter));
  const hmac = crypto.createHmac('sha1', key).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0xf;
  const code =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);
  return (code % 1000000).toString().padStart(6, '0');
}

function verifyTotp(secret: string, token: string, window = 1): boolean {
  if (!token) return false;
  const cleanToken = token.toString().trim();
  for (let error = -window; error <= window; error++) {
    const expected = getTotp(secret, error * 30);
    if (expected === cleanToken) return true;
  }
  return false;
}


// In production, disable user account harvesting endpoint
authRouter.get('/demo-accounts', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Endpoint disabled in production.' });
  }
  // Even in development, only return non-sensitive high-level test roles
  const users = db.getRawData().users.slice(0, 3).map((u) => ({
    id: u.id,
    username: u.username,
    role: u.role,
    fullName: u.fullName,
    branchName: u.branchName,
  }));
  res.json({ accounts: users });
});

// Teacher Self-Registration
authRouter.post('/register-teacher', registrationLimiter, async (req, res) => {
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
  const passwordHash = hashPassword(password);

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
  const token = generateToken(safeUser, req);

  return res.status(201).json({
    token,
    user: safeUser,
    message: 'Faculty account registered successfully! You can now access your teacher workspace or log in anytime using your Employee ID or Email.',
  });
});


// GET /api/auth/active-sessions - List all current active logged-in sessions across the institution
authRouter.get('/active-sessions', authMiddleware, requireAdmin, (req: AuthenticatedRequest, res) => {
  const currentSessionId = req.sessionId;
  const sessions = getActiveSessionsList(currentSessionId);
  return res.json({ sessions });
});

// POST /api/auth/active-sessions/:sessionId/terminate - Remotely revoke / log out a specific session
authRouter.post('/active-sessions/:sessionId/terminate', authMiddleware, requireAdmin, (req: AuthenticatedRequest, res) => {
  const targetSessionId = req.params.sessionId;
  if (!targetSessionId) {
    return res.status(400).json({ error: 'Session ID is required.' });
  }

  // Prevent admin from accidentally locking themselves out through this single endpoint without confirmation
  const isCurrent = targetSessionId === req.sessionId;
  const success = terminateSession(targetSessionId);

  if (!success) {
    return res.status(404).json({ error: 'Session not found or already terminated.' });
  }

  db.logActivity({
    userId: req.user!.id,
    userName: req.user!.fullName,
    userRole: req.user!.role,
    branchName: req.user!.branchName || 'DIPS Central',
    action: 'DELETE',
    details: 'Administrator remotely terminated active session ' + targetSessionId + (isCurrent ? ' (Self current session)' : ''),
    ipAddress: req.ip,
  });

  return res.json({
    success: true,
    message: isCurrent
      ? 'Your current session was terminated. You will be logged out.'
      : 'User session has been revoked and terminated successfully.',
    isCurrent,
  });
});

// POST /api/auth/active-sessions/terminate-user/:userId - Terminate all sessions for a specific user
authRouter.post('/active-sessions/terminate-user/:userId', authMiddleware, requireAdmin, (req: AuthenticatedRequest, res) => {
  const { userId } = req.params;
  const count = terminateAllUserSessions(userId);

  db.logActivity({
    userId: req.user!.id,
    userName: req.user!.fullName,
    userRole: req.user!.role,
    branchName: req.user!.branchName || 'DIPS Central',
    action: 'DELETE',
    details: 'Administrator terminated all active sessions (' + count + ' sessions) for user ID ' + userId,
    ipAddress: req.ip,
  });

  return res.json({
    success: true,
    message: 'Terminated ' + count + ' active session(s) for the selected user.',
    count,
  });
});

authRouter.post('/login', loginLimiter, async (req, res) => {
  const { username, password, expectedRole } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username/ID and password are required.' });
  }

  let user = db.findUserByLogin(username);

  // If user not in local memory, check live Supabase database (e.g. newly registered or restored)
  if (!user) {
    try {
      const client = getSupabaseClient();
      const clean = username.trim().toLowerCase();
      const { data, error } = await client
        .from('users')
        .select('*')
        .or(`username.ilike.${clean},email.ilike.${clean},employee_id.ilike.${clean}`)
        .limit(1);

      if (!error && data && data.length > 0) {
        db.mergeRemoteUsers(data);
        user = db.findUserByLogin(username);
      }
    } catch (supErr) {
      console.warn('[Supabase Live Auth] Query notice:', supErr);
    }
  }

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

  // 2FA / TOTP Check: If Two-Factor Authentication is enabled on this account
  const { twoFactorCode } = req.body;
  if (user.twoFactorEnabled && user.twoFactorSecret) {
    if (!twoFactorCode) {
      return res.status(200).json({
        requires2FA: true,
        message: 'Two-Factor Authentication required. Please enter the 6-digit code from your Authenticator app.',
      });
    }
    if (!verifyTotp(user.twoFactorSecret, twoFactorCode)) {
      return res.status(401).json({ error: 'Invalid 2FA code. Please check your authenticator app and try again.' });
    }
  }

  // If role filter is provided, ensure matches or admin
  if (expectedRole && user.role !== 'admin' && user.role !== expectedRole) {
    return res.status(403).json({
      error: `You are trying to log in via the ${expectedRole} portal, but your account role is "${user.role}". Please select the correct login tab.`,
    });
  }

  const { passwordHash, ...safeUser } = user;
  const token = generateToken(safeUser, req);

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

// GET /api/auth/2fa/setup - Generate TOTP secret and QR code for Authenticator apps (Google / MS / Apple Authenticator)
authRouter.get('/2fa/setup', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const secret = otplib.generateSecret();
  const label = encodeURIComponent(user.email || user.username || user.fullName);
  const issuer = encodeURIComponent('DIPS Educational Institutions');
  const otpauthUrl = `otpauth://totp/${issuer}:${label}?secret=${secret}&issuer=${issuer}&digits=6&period=30`;

  let qrCodeDataUrl = '';
  try {
    qrCodeDataUrl = await qrcode.toDataURL(otpauthUrl, {
      width: 240,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    });
  } catch (qrErr) {
    console.warn('Failed to generate 2FA QR code:', qrErr);
  }

  res.json({
    secret,
    otpauthUrl,
    qrCodeDataUrl,
    enabled: !!user.twoFactorEnabled,
    role: user.role,
    user: {
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    },
  });
});

// POST /api/auth/2fa/verify - Verify and activate 2FA
authRouter.post('/2fa/verify', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const { secret, token } = req.body;
  if (!secret || !token) {
    return res.status(400).json({ error: 'Secret and 6-digit verification code are required.' });
  }
  if (!verifyTotp(secret, token)) {
    return res.status(400).json({ error: 'Verification code is invalid. Please try again.' });
  }
  const updatedUser = db.updateUser(req.user!.id, {
    twoFactorEnabled: true,
    twoFactorSecret: secret,
  });
  if (updatedUser) {
    try {
      const full = db.findUserById(req.user!.id);
      if (full) {
        await syncUserToSupabase(full, full.passwordHash);
      }
    } catch {}
  }
  db.logActivity({
    userId: req.user!.id,
    userName: req.user!.fullName,
    userRole: req.user!.role,
    branchName: req.user!.branchName || 'DIPS Central',
    action: 'PERMISSION_CHANGE',
    details: 'Enabled Two-Factor Authentication (TOTP 2FA) on account.',
    ipAddress: req.ip,
  });
  return res.json({
    success: true,
    message: 'Two-Factor Authentication is now enabled for your account!',
  });
});

// POST /api/auth/2fa/disable - Disable 2FA with current password confirmation
authRouter.post('/2fa/disable', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const { currentPassword } = req.body;
  if (!currentPassword) {
    return res.status(400).json({ error: 'Current password is required to disable 2FA.' });
  }
  const userWithHash = db.findUserById(req.user!.id);
  if (!userWithHash || !verifyPassword(currentPassword, userWithHash.passwordHash)) {
    return res.status(400).json({ error: 'Current password does not match.' });
  }
  db.updateUser(req.user!.id, {
    twoFactorEnabled: false,
    twoFactorSecret: undefined,
  });
  try {
    const full = db.findUserById(req.user!.id);
    if (full) {
      await syncUserToSupabase(full, full.passwordHash);
    }
  } catch {}
  db.logActivity({
    userId: req.user!.id,
    userName: req.user!.fullName,
    userRole: req.user!.role,
    branchName: req.user!.branchName || 'DIPS Central',
    action: 'PERMISSION_CHANGE',
    details: 'Disabled Two-Factor Authentication (2FA) on account.',
    ipAddress: req.ip,
  });
  return res.json({
    success: true,
    message: 'Two-Factor Authentication has been disabled.',
  });
});

authRouter.post('/change-credentials', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const { currentPassword, newPassword, newUsername, newEmail } = req.body;
  if (!currentPassword) {
    return res.status(400).json({ error: 'Current password is required to verify your authorization.' });
  }
  const userWithHash = db.findUserById(req.user!.id);
  if (!userWithHash) return res.status(404).json({ error: 'User account not found.' });
  if (!verifyPassword(currentPassword, userWithHash.passwordHash)) {
    return res.status(400).json({ error: 'Current password does not match.' });
  }
  const updates: any = {};
  let passwordHash = userWithHash.passwordHash;
  if (newPassword && newPassword.trim()) {
    if (newPassword.trim().length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
    }
    passwordHash = hashPassword(newPassword.trim());
    updates.passwordHash = passwordHash;
  }
  if (newUsername && newUsername.trim()) {
    const cleanUser = newUsername.trim();
    const existing = db.findUserByLogin(cleanUser);
    if (existing && existing.id !== userWithHash.id) {
      return res.status(400).json({ error: 'The User ID / Username "' + cleanUser + '" is already in use.' });
    }
    updates.username = cleanUser;
  }
  if (newEmail && newEmail.trim()) {
    const cleanMail = newEmail.trim().toLowerCase();
    const existing = db.findUserByLogin(cleanMail);
    if (existing && existing.id !== userWithHash.id) {
      return res.status(400).json({ error: 'The email "' + cleanMail + '" is already registered to another account.' });
    }
    updates.email = cleanMail;
  }
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'Please specify a new User ID / Email or a new Password.' });
  }
  const updatedUser = db.updateUser(req.user!.id, updates);
  if (!updatedUser) {
    return res.status(500).json({ error: 'Failed to update credentials in database.' });
  }
  try {
    await syncUserToSupabase(updatedUser, passwordHash);
  } catch (supErr) {
    console.warn('[Supabase Credentials Sync Notice]:', supErr);
  }
  const { passwordHash: _, ...safeUser } = updatedUser;
  const newToken = generateToken(safeUser, req);
  return res.json({
    success: true,
    message: 'Admin credentials updated successfully!',
    user: safeUser,
    token: newToken,
  });
});

authRouter.post('/change-password', authMiddleware, async (req: AuthenticatedRequest, res) => {
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
  const newHash = hashPassword(newPassword);
  const updatedUser = db.updateUser(req.user!.id, { passwordHash: newHash });
  if (updatedUser) {
    try { await syncUserToSupabase(updatedUser, newHash); } catch {}
  }
  return res.json({ success: true, message: 'Password successfully updated.' });
});
