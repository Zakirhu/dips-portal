import { Router } from 'express';
import { db } from '../db.js';
import { authMiddleware, requireAdmin, AuthenticatedRequest } from '../auth.js';

export const settingRouter = Router();

settingRouter.get('/', (req, res) => {
  res.json({ settings: db.getSettings() });
});

settingRouter.put('/', authMiddleware, requireAdmin, (req: AuthenticatedRequest, res) => {
  const updated = db.updateSettings(req.body);
  db.logActivity({
    userId: req.user!.id,
    userName: req.user!.fullName,
    userRole: req.user!.role,
    branchName: 'DIPS Central',
    action: 'UPDATE',
    details: `Updated platform settings (Direct Publishing: ${updated.directPublishing}).`,
  });
  res.json({ settings: updated });
});
