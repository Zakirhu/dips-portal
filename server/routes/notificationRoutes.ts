import { Router } from 'express';
import { db } from '../db.js';
import { authMiddleware, AuthenticatedRequest } from '../auth.js';

export const notificationRouter = Router();

notificationRouter.get('/', authMiddleware, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const notifs = db.getNotifications(user.id);
  res.json({ notifications: notifs, unreadCount: notifs.filter((n) => !n.isRead).length });
});

notificationRouter.post('/:id/read', authMiddleware, (req: AuthenticatedRequest, res) => {
  db.markNotificationRead(req.params.id);
  res.json({ success: true });
});

notificationRouter.post('/read-all', authMiddleware, (req: AuthenticatedRequest, res) => {
  db.markAllNotificationsRead(req.user!.id);
  res.json({ success: true });
});
