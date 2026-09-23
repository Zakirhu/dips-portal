import { Router } from 'express';
import { db } from '../db.js';
import { authMiddleware, requireAdmin, AuthenticatedRequest } from '../auth.js';
import type { Announcement } from '../../src/types.js';

export const announcementRouter = Router();

// GET announcements scoped to user's branch / class / role
announcementRouter.get('/', authMiddleware, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const all = db.getAnnouncements();

  const filtered = all.filter((a) => {
    // Branch filter: if specified, must match user's branch
    if (a.targetBranchId && a.targetBranchId !== user.branchId && user.role !== 'admin') {
      return false;
    }
    // Role filter: if specified, must match user's role
    if (a.targetRole && a.targetRole !== 'all' && a.targetRole !== user.role && user.role !== 'admin') {
      return false;
    }
    // Class filter: for students
    if (a.targetClassId && user.role === 'student' && a.targetClassId !== user.classId) {
      return false;
    }
    return true;
  });

  res.json({ announcements: filtered });
});

// Create announcement
announcementRouter.post('/', authMiddleware, requireAdmin, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const { title, content, priority, targetBranchId, targetRole, targetClassId } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required.' });
  }

  const newAnnouncement: Announcement = {
    id: 'anc-' + Date.now(),
    title,
    content,
    priority: priority || 'normal',
    targetBranchId: targetBranchId || undefined,
    targetRole: targetRole || 'all',
    targetClassId: targetClassId || undefined,
    authorName: user.fullName,
    authorRole: 'Administrator',
    createdAt: new Date().toISOString(),
  };

  db.addAnnouncement(newAnnouncement);

  db.logActivity({
    userId: user.id,
    userName: user.fullName,
    userRole: user.role,
    branchName: 'DIPS Central',
    action: 'UPLOAD',
    details: `Published organization announcement: "${title}".`,
  });

  return res.status(201).json({ announcement: newAnnouncement });
});

// Delete announcement
announcementRouter.delete('/:id', authMiddleware, requireAdmin, (req: AuthenticatedRequest, res) => {
  db.deleteAnnouncement(req.params.id);
  return res.json({ success: true });
});
