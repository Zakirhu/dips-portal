import { Router } from 'express';
import { db } from '../db.js';
import { authMiddleware, requireAdmin, AuthenticatedRequest } from '../auth.js';

export const activityLogRouter = Router();

activityLogRouter.get('/', authMiddleware, requireAdmin, (req: AuthenticatedRequest, res) => {
  const { userId, branchName, subjectName, action, search } = req.query as Record<string, string>;

  let logs = db.getActivityLogs();

  if (userId && userId !== 'all') {
    logs = logs.filter((l) => l.userId === userId);
  }

  if (branchName && branchName !== 'all') {
    logs = logs.filter((l) => l.branchName?.toLowerCase().includes(branchName.toLowerCase()));
  }

  if (subjectName && subjectName !== 'all') {
    logs = logs.filter((l) => l.subjectName === subjectName);
  }

  if (action && action !== 'all') {
    logs = logs.filter((l) => l.action === action);
  }

  if (search) {
    const q = search.toLowerCase();
    logs = logs.filter(
      (l) =>
        l.userName.toLowerCase().includes(q) ||
        l.details.toLowerCase().includes(q) ||
        l.resourceTitle?.toLowerCase().includes(q) ||
        l.branchName.toLowerCase().includes(q)
    );
  }

  res.json({ logs });
});
