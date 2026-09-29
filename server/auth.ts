import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { db } from './db.js';
import type { User, Resource, ActiveSession } from '../src/types.js';

// Simple, fast, secure signed token using Node crypto
const SECRET_KEY = process.env.SESSION_SECRET || crypto.randomBytes(64).toString('hex');

interface SessionRecord {
  id: string; // sessionId
  userId: string;
  userName: string;
  userEmail?: string;
  userRole: any;
  branchName?: string;
  ipAddress?: string;
  userAgent?: string;
  deviceType: 'Desktop' | 'Mobile' | 'Tablet' | 'Unknown';
  browser: string;
  os: string;
  createdAt: string;
  lastActiveAt: string;
  exp: number;
}

// In-memory active session map (SessionId -> SessionRecord)
const activeSessions = new Map<string, SessionRecord>();

function parseUserAgent(ua?: string): { deviceType: 'Desktop' | 'Mobile' | 'Tablet' | 'Unknown'; browser: string; os: string } {
  if (!ua) return { deviceType: 'Unknown', browser: 'Browser Client', os: 'Unknown OS' };
  
  let deviceType: 'Desktop' | 'Mobile' | 'Tablet' | 'Unknown' = 'Desktop';
  if (/ipad|tablet|(android(?!.*mobile))/i.test(ua)) {
    deviceType = 'Tablet';
  } else if (/mobile|iphone|ipod|android/i.test(ua)) {
    deviceType = 'Mobile';
  }

  let browser = 'Browser Client';
  if (/edg/i.test(ua)) browser = 'Microsoft Edge';
  else if (/chrome|crios/i.test(ua)) browser = 'Google Chrome';
  else if (/firefox|fxios/i.test(ua)) browser = 'Mozilla Firefox';
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Apple Safari';
  else if (/opera|opr/i.test(ua)) browser = 'Opera';

  let os = 'Unknown OS';
  if (/windows/i.test(ua)) os = 'Windows';
  else if (/macintosh|mac os x/i.test(ua)) os = 'macOS';
  else if (/linux/i.test(ua)) os = 'Linux';
  else if (/android/i.test(ua)) os = 'Android';
  else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS';

  return { deviceType, browser, os };
}

export function generateToken(user: User, req?: Request): string {
  const sessionId = 'sess-' + Date.now() + '-' + crypto.randomBytes(6).toString('hex');
  const now = new Date().toISOString();
  const exp = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days

  const ua = req?.headers['user-agent'] as string | undefined;
  const { deviceType, browser, os } = parseUserAgent(ua);
  const rawIp = (req?.headers['x-forwarded-for'] as string) || req?.socket?.remoteAddress || req?.ip || '127.0.0.1';
  const ipAddress = rawIp.split(',')[0].trim().replace(/^::ffff:/, '');

  const record: SessionRecord = {
    id: sessionId,
    userId: user.id,
    userName: user.fullName,
    userEmail: user.email,
    userRole: user.role,
    branchName: user.branchName || 'DIPS Central',
    ipAddress,
    userAgent: ua || 'Browser Client',
    deviceType,
    browser,
    os,
    createdAt: now,
    lastActiveAt: now,
    exp,
  };

  activeSessions.set(sessionId, record);

  const payload = {
    id: user.id,
    sessionId,
    role: user.role,
    exp,
  };

  const str = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', SECRET_KEY).update(str).digest('base64url');
  return str + '.' + sig;
}

export function parseToken(token: string): { id: string; role: string; sessionId?: string } | null {
  try {
    const [payloadStr, sig] = token.split('.');
    if (!payloadStr || !sig) return null;

    const expectedSig = crypto.createHmac('sha256', SECRET_KEY).update(payloadStr).digest('base64url');
    if (sig.length !== expectedSig.length) return null;
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) return null;

    const payload = JSON.parse(Buffer.from(payloadStr, 'base64url').toString('utf-8'));
    if (payload.exp && Date.now() > payload.exp) return null;

    // Check if session has been explicitly terminated
    if (payload.sessionId) {
      const session = activeSessions.get(payload.sessionId);
      if (!session) {
        // Session was remotely revoked or expired
        return null;
      }
      // Touch session activity
      session.lastActiveAt = new Date().toISOString();
    }

    return payload;
  } catch (err) {
    return null;
  }
}

export function getActiveSessionsList(currentSessionId?: string): ActiveSession[] {
  const now = Date.now();
  const list: ActiveSession[] = [];
  for (const [id, s] of activeSessions.entries()) {
    if (s.exp <= now) {
      activeSessions.delete(id);
      continue;
    }
    list.push({
      id: s.id,
      userId: s.userId,
      userName: s.userName,
      userEmail: s.userEmail,
      userRole: s.userRole,
      branchName: s.branchName,
      ipAddress: s.ipAddress,
      userAgent: s.userAgent,
      deviceType: s.deviceType,
      browser: s.browser,
      os: s.os,
      createdAt: s.createdAt,
      lastActiveAt: s.lastActiveAt,
      isCurrentSession: currentSessionId ? s.id === currentSessionId : false,
    });
  }
  list.sort((a, b) => new Date(b.lastActiveAt).getTime() - new Date(a.lastActiveAt).getTime());
  return list;
}

export function terminateSession(sessionId: string): boolean {
  return activeSessions.delete(sessionId);
}

export function terminateAllUserSessions(userId: string): number {
  let count = 0;
  for (const [id, s] of activeSessions.entries()) {
    if (s.userId === userId) {
      activeSessions.delete(id);
      count++;
    }
  }
  return count;
}

export interface AuthenticatedRequest extends Request {
  user?: User;
  sessionId?: string;
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. Missing token.' });
  }

  const token = authHeader.split(' ')[1];
  const payload = parseToken(token);
  if (!payload) {
    return res.status(401).json({
      error: 'Invalid, expired, or terminated session. Please log in again.',
      sessionTerminated: true,
    });
  }

  const user = db.findUserById(payload.id);
  if (!user || !user.isActive) {
    return res.status(401).json({ error: 'User account not found or deactivated.' });
  }

  const { passwordHash, ...safeUser } = user;
  req.user = safeUser as User;
  req.sessionId = payload.sessionId;
  next();
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
  }
  next();
}

export function requireTeacherOrAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user || (req.user.role !== 'teacher' && req.user.role !== 'coordinator' && req.user.role !== 'admin')) {
    return res.status(403).json({ error: 'Access denied. Teacher or Admin privileges required.' });
  }
  next();
}

export function canTeacherAccessSubject(user: User, subjectId: string): boolean {
  if (user.role === 'admin') return true;
  if (user.role === 'teacher' || user.role === 'coordinator') {
    return user.assignedSubjectIds?.includes(subjectId) || false;
  }
  return false;
}

export function canEditResource(user: User, resource: Resource): boolean {
  if (user.role === 'admin') return true;
  if (user.role === 'teacher' || user.role === 'coordinator') {
    return canTeacherAccessSubject(user, resource.subjectId);
  }
  return false;
}
