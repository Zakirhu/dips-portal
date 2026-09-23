import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { db } from './db.js';
import type { User, Resource } from '../src/types.js';

// Simple, fast, secure signed token using Node crypto
const SECRET_KEY = process.env.SESSION_SECRET || 'dips-centralized-portal-secret-key-2026';

export function generateToken(user: User): string {
  const payload = {
    id: user.id,
    role: user.role,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  };
  const str = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', SECRET_KEY).update(str).digest('base64url');
  return `${str}.${sig}`;
}

export function parseToken(token: string): { id: string; role: string } | null {
  try {
    const [payloadStr, sig] = token.split('.');
    if (!payloadStr || !sig) return null;
    const expectedSig = crypto.createHmac('sha256', SECRET_KEY).update(payloadStr).digest('base64url');
    if (sig !== expectedSig) return null;
    const payload = JSON.parse(Buffer.from(payloadStr, 'base64url').toString('utf-8'));
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch (err) {
    return null;
  }
}

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. Missing token.' });
  }

  const token = authHeader.split(' ')[1];
  const payload = parseToken(token);
  if (!payload) {
    return res.status(401).json({ error: 'Invalid or expired authentication token.' });
  }

  const user = db.findUserById(payload.id);
  if (!user || !user.isActive) {
    return res.status(401).json({ error: 'User account not found or deactivated.' });
  }

  // Populate user without passwordHash
  const { passwordHash, ...safeUser } = user;
  req.user = safeUser as User;
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
  // Teachers teaching the same subject can collaborate and update/edit
  if (user.role === 'teacher' || user.role === 'coordinator') {
    return canTeacherAccessSubject(user, resource.subjectId);
  }
  return false;
}
