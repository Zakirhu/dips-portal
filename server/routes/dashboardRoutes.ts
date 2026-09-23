import { Router } from 'express';
import { db } from '../db.js';
import { authMiddleware, AuthenticatedRequest } from '../auth.js';
import type { AdminStats } from '../../src/types.js';

export const dashboardRouter = Router();

// Admin Stats
dashboardRouter.get('/admin', authMiddleware, (req: AuthenticatedRequest, res) => {
  if (req.user!.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const raw = db.getRawData();
  const teachers = raw.users.filter((u) => u.role === 'teacher' || u.role === 'coordinator');
  const students = raw.users.filter((u) => u.role === 'student');
  const activeUsers = raw.users.filter((u) => u.isActive);

  // Storage usage estimation based on versions
  let totalStorageBytes = 0;
  raw.resources.forEach((r) => {
    r.versions.forEach((v) => {
      totalStorageBytes += v.fileSize || 0;
    });
  });

  const recentlyUploaded = [...raw.resources]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const recentlyUpdated = [...raw.resources]
    .filter((r) => r.currentVersion > 1 || r.updatedAt !== r.createdAt)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  const pendingApprovals = raw.resources.filter((r) => r.status === 'pending_approval').length;

  const stats: AdminStats = {
    totalBranches: raw.branches.length,
    totalTeachers: teachers.length,
    totalStudents: students.length,
    totalSubjects: raw.subjects.length,
    totalClasses: raw.classes.length,
    totalResources: raw.resources.length,
    pendingApprovals,
    storageUsageBytes: totalStorageBytes,
    activeUsersCount: activeUsers.length,
    recentlyUploaded,
    recentlyUpdated,
  };

  res.json({ stats });
});

// Teacher Stats
dashboardRouter.get('/teacher', authMiddleware, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const raw = db.getRawData();

  const mySubjects = raw.subjects.filter((s) => user.assignedSubjectIds?.includes(s.id));
  const myClasses = raw.classes.filter((c) => user.assignedClassIds?.includes(c.id));

  const myUploaded = raw.resources.filter((r) => r.uploadedByUserId === user.id);
  const mySubjectResources = raw.resources.filter((r) => user.assignedSubjectIds?.includes(r.subjectId));

  const recentSubjectResources = [...mySubjectResources]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 6);

  const unreadNotifs = raw.notifications.filter((n) => n.userId === user.id && !n.isRead).length;

  res.json({
    mySubjects,
    myClasses,
    myUploadedCount: myUploaded.length,
    totalSubjectResourcesCount: mySubjectResources.length,
    recentSubjectResources,
    unreadNotifs,
  });
});

// Student Stats
dashboardRouter.get('/student', authMiddleware, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const raw = db.getRawData();

  const myClass = raw.classes.find((c) => c.id === user.classId);
  // Subjects applicable to student's class
  const classSubjects = raw.subjects.filter((s) => s.applicableClasses.includes(user.classId || ''));

  const availableResources = raw.resources.filter(
    (r) => r.classId === user.classId && r.status === 'published'
  );

  const recentMaterials = [...availableResources]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 6);

  res.json({
    studentClass: myClass,
    classSubjects,
    totalResourcesCount: availableResources.length,
    recentMaterials,
  });
});
