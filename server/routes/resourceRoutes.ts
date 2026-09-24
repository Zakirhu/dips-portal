import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { db } from '../db.js';
import {
  authMiddleware,
  requireTeacherOrAdmin,
  canTeacherAccessSubject,
  canEditResource,
  AuthenticatedRequest,
} from '../auth.js';
import {
  uploadFileToSupabaseStorage,
  syncResourceToSupabase,
  deleteResourceFromSupabase,
} from '../supabase.js';
import type { Resource, ResourceVersion, ContentCategory, ContentType, ResourceStatus } from '../../src/types.js';

export const resourceRouter = Router();

// Configure multer file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e4);
    cb(null, `${uniqueSuffix}-${cleanName}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
});

// GET /api/resources with rich filters
resourceRouter.get('/', authMiddleware, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const {
    subjectId,
    classId,
    branchId,
    category,
    contentType,
    academicSession,
    status,
    search,
    mine,
    mySubjectsOnly,
  } = req.query as Record<string, string>;

  let resources = db.getResources();

  // Role Scoping:
  // 1. Students can ONLY view approved/published content for their class
  if (user.role === 'student') {
    resources = resources.filter((r) => {
      // Must match student's class
      if (user.classId && r.classId !== user.classId) return false;
      // Must be published
      return r.status === 'published';
    });
  }

  // 2. Teachers can filter to their subjects or their own uploads
  if ((user.role === 'teacher' || user.role === 'coordinator') && mySubjectsOnly === 'true') {
    resources = resources.filter((r) => user.assignedSubjectIds?.includes(r.subjectId));
  }

  if (mine === 'true') {
    resources = resources.filter((r) => r.uploadedByUserId === user.id || r.lastUpdatedByUserId === user.id);
  }

  // Query parameter filters
  if (subjectId && subjectId !== 'all') {
    resources = resources.filter((r) => r.subjectId === subjectId);
  }

  if (classId && classId !== 'all') {
    resources = resources.filter((r) => r.classId === classId);
  }

  if (branchId && branchId !== 'all') {
    resources = resources.filter((r) => r.branchId === branchId);
  }

  if (category && category !== 'all') {
    resources = resources.filter((r) => r.category === category);
  }

  if (contentType && contentType !== 'all') {
    resources = resources.filter((r) => r.contentType === contentType);
  }

  if (academicSession && academicSession !== 'all') {
    resources = resources.filter((r) => r.academicSession === academicSession);
  }

  if (status && status !== 'all') {
    resources = resources.filter((r) => r.status === status);
  }

  if (search) {
    const q = search.toLowerCase().trim();
    resources = resources.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.chapter.toLowerCase().includes(q) ||
        r.topic.toLowerCase().includes(q) ||
        r.subjectName.toLowerCase().includes(q) ||
        r.className.toLowerCase().includes(q) ||
        r.uploadedByName.toLowerCase().includes(q) ||
        r.branchName.toLowerCase().includes(q) ||
        r.fileName.toLowerCase().includes(q)
    );
  }

  res.json({ resources });
});

// GET /api/resources/:id
resourceRouter.get('/:id', authMiddleware, (req: AuthenticatedRequest, res) => {
  const resource = db.findResourceById(req.params.id);
  if (!resource) return res.status(404).json({ error: 'Resource not found' });

  // Student class boundary check
  if (req.user!.role === 'student' && req.user!.classId && resource.classId !== req.user!.classId) {
    return res.status(403).json({ error: 'You are not authorized to view content from another class.' });
  }

  // Increment view counter
  resource.viewsCount = (resource.viewsCount || 0) + 1;
  db.persist();

  res.json({ resource });
});

// POST /api/resources - Upload new resource
resourceRouter.post(
  '/',
  authMiddleware,
  requireTeacherOrAdmin,
  upload.single('file'),
  async (req: AuthenticatedRequest, res) => {
    const user = req.user!;
    const {
      title,
      description,
      subjectId,
      classId,
      branchId,
      chapter,
      topic,
      category,
      contentType,
      academicSession,
      externalLink,
      contentSnippet,
    } = req.body;

    if (!title || !subjectId || !classId || !chapter) {
      return res.status(400).json({ error: 'Title, Subject, Class, and Chapter are required.' });
    }

    // Permission check: Teacher must be assigned to the subject (unless Admin)
    if (!canTeacherAccessSubject(user, subjectId)) {
      return res.status(403).json({
        error: 'You can only upload content for subjects assigned to your teaching profile.',
      });
    }

    const subject = db.getSubjects().find((s) => s.id === subjectId);
    const cls = db.getClasses().find((c) => c.id === classId);
    const branch = db.getBranches().find((b) => b.id === (branchId || user.branchId));

    let fileUrl = '';
    let fileName = '';
    let fileSize = 0;
    let fileType = '';

    if (req.file) {
      fileName = req.file.originalname;
      fileSize = req.file.size;
      fileType = req.file.mimetype;

      // Upload file directly to Supabase Storage for 100% permanent retention
      try {
        const fileBuffer = fs.readFileSync(req.file.path);
        const uploadRes = await uploadFileToSupabaseStorage(fileBuffer, req.file.originalname, req.file.mimetype);
        if (uploadRes.success && uploadRes.publicUrl) {
          fileUrl = uploadRes.publicUrl;
        } else {
          fileUrl = `/uploads/${req.file.filename}`;
        }
      } catch (uploadErr) {
        console.warn('[Storage] Upload fallback to local:', uploadErr);
        fileUrl = `/uploads/${req.file.filename}`;
      }
    } else if (externalLink) {
      fileUrl = externalLink;
      fileName = title + (contentType ? ` (${contentType})` : '');
      fileSize = 0;
      fileType = 'link';
    } else {
      fileUrl = '/uploads/sample-cs-looping-notes.pdf';
      fileName = `${title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      fileSize = 1024 * 100;
      fileType = 'application/pdf';
    }

    const settings = db.getSettings();
    const initialStatus: ResourceStatus =
      user.role === 'admin' || settings.directPublishing ? 'published' : 'pending_approval';

    const now = new Date().toISOString();
    const resourceId = 'res-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);

    const initialVersion: ResourceVersion = {
      versionNumber: 1,
      versionTitle: 'Initial Release',
      changelog: 'Initial upload of resource to DIPS portal.',
      fileUrl,
      fileName,
      fileSize,
      fileType,
      uploadedByUserId: user.id,
      uploadedByUserName: user.fullName,
      uploadedByUserBranch: branch?.name || user.branchName || 'DIPS Branch',
      uploadedAt: now,
      contentSnippet: contentSnippet || description,
    };

    const newResource: Resource = {
      id: resourceId,
      title,
      description: description || '',
      subjectId,
      subjectName: subject?.name || 'Subject',
      classId,
      className: cls?.name || 'Class',
      branchId: branch?.id || user.branchId,
      branchName: branch?.name || user.branchName || 'DIPS Branch',
      chapter,
      topic: topic || 'General',
      category: (category as ContentCategory) || 'Study Material',
      contentType: (contentType as ContentType) || 'PDF',
      academicSession: academicSession || settings.activeSession || '2026-27',
      status: initialStatus,
      currentVersion: 1,
      versions: [initialVersion],
      fileName,
      fileUrl,
      fileSize,
      externalLink: externalLink || undefined,
      uploadedByUserId: user.id,
      uploadedByName: user.fullName,
      uploadedByBranch: branch?.name || user.branchName || 'DIPS Branch',
      uploadedByEmployeeId: user.employeeId,
      lastUpdatedByUserId: user.id,
      lastUpdatedByName: user.fullName,
      lastUpdatedByBranch: branch?.name || user.branchName || 'DIPS Branch',
      createdAt: now,
      updatedAt: now,
      downloadsCount: 0,
      viewsCount: 0,
    };

    db.addResource(newResource);

    // Sync resource metadata permanently to Supabase database
    try {
      await syncResourceToSupabase(newResource);
    } catch (syncErr) {
      console.warn('[Supabase] Resource sync warning:', syncErr);
    }

    // Activity Log
    db.logActivity({
      userId: user.id,
      userName: `${user.fullName} (${user.employeeId || user.role})`,
      userRole: user.role,
      branchName: branch?.name || user.branchName || 'DIPS Branch',
      action: 'UPLOAD',
      resourceTitle: title,
      subjectName: subject?.name,
      details: `Uploaded new ${contentType} resource for ${cls?.name} ${subject?.name} (${initialStatus}).`,
    });

    // Notify other teachers teaching the same subject across branches
    const allTeachers = db.getRawData().users.filter(
      (u) =>
        (u.role === 'teacher' || u.role === 'coordinator') &&
        u.id !== user.id &&
        u.assignedSubjectIds?.includes(subjectId)
    );

    allTeachers.forEach((t) => {
      db.addNotification({
        id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        userId: t.id,
        title: `New Resource: ${subject?.name}`,
        message: `${user.fullName} (${branch?.name}) shared "${title}" for ${cls?.name}.`,
        type: 'resource_upload',
        link: `/resources?subjectId=${subjectId}`,
        isRead: false,
        createdAt: now,
      });
    });

    // Notify students of that class if published
    if (initialStatus === 'published') {
      const studentsOfClass = db.getRawData().users.filter(
        (u) => u.role === 'student' && u.classId === classId
      );
      studentsOfClass.forEach((st) => {
        db.addNotification({
          id: 'notif-st-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          userId: st.id,
          title: `New Study Material in ${subject?.name}`,
          message: `New ${contentType} uploaded for ${chapter}: "${title}".`,
          type: 'resource_upload',
          link: `/student/study-material`,
          isRead: false,
          createdAt: now,
        });
      });
    }

    return res.status(201).json({ resource: newResource });
  }
);

// POST /api/resources/:id/versions - SAME SUBJECT TEACHER COLLABORATION: Add new version
resourceRouter.post(
  '/:id/versions',
  authMiddleware,
  requireTeacherOrAdmin,
  upload.single('file'),
  async (req: AuthenticatedRequest, res) => {
    const user = req.user!;
    const resource = db.findResourceById(req.params.id);
    if (!resource) return res.status(404).json({ error: 'Resource not found' });

    // Check same subject permission rule:
    // Teachers teaching the same subject can improve / add new versions
    if (!canEditResource(user, resource)) {
      return res.status(403).json({
        error: `Permission denied. You can only collaborate on and update resources for subjects assigned to you (${resource.subjectName}).`,
      });
    }

    const { versionTitle, changelog, externalLink, contentSnippet } = req.body;

    let fileUrl = resource.fileUrl;
    let fileName = resource.fileName;
    let fileSize = resource.fileSize;
    let fileType = 'application/pdf';

    if (req.file) {
      fileName = req.file.originalname;
      fileSize = req.file.size;
      fileType = req.file.mimetype;

      // Upload version file directly to permanent Supabase Storage
      try {
        const fileBuffer = fs.readFileSync(req.file.path);
        const uploadRes = await uploadFileToSupabaseStorage(fileBuffer, req.file.originalname, req.file.mimetype);
        if (uploadRes.success && uploadRes.publicUrl) {
          fileUrl = uploadRes.publicUrl;
        } else {
          fileUrl = `/uploads/${req.file.filename}`;
        }
      } catch (uploadErr) {
        console.warn('[Storage] Version upload fallback to local:', uploadErr);
        fileUrl = `/uploads/${req.file.filename}`;
      }
    } else if (externalLink) {
      fileUrl = externalLink;
      fileName = `${resource.title} (Updated Link)`;
      fileSize = 0;
      fileType = 'link';
    }

    const nextVersionNumber = resource.currentVersion + 1;
    const now = new Date().toISOString();
    const userBranch = db.getBranches().find((b) => b.id === user.branchId);

    const newVersion: ResourceVersion = {
      versionNumber: nextVersionNumber,
      versionTitle: versionTitle || `Version ${nextVersionNumber} Update`,
      changelog: changelog || `Collaborative update by ${user.fullName} (${userBranch?.name || user.branchName}).`,
      fileUrl,
      fileName,
      fileSize,
      fileType,
      uploadedByUserId: user.id,
      uploadedByUserName: user.fullName,
      uploadedByUserBranch: userBranch?.name || user.branchName || 'DIPS Branch',
      uploadedAt: now,
      contentSnippet: contentSnippet || undefined,
    };

    resource.versions.unshift(newVersion);
    resource.currentVersion = nextVersionNumber;
    resource.fileUrl = fileUrl;
    resource.fileName = fileName;
    resource.fileSize = fileSize;
    resource.lastUpdatedByUserId = user.id;
    resource.lastUpdatedByName = user.fullName;
    resource.lastUpdatedByBranch = userBranch?.name || user.branchName || 'DIPS Branch';
    resource.updatedAt = now;

    db.persist();

    // Sync updated resource to Supabase database
    try {
      await syncResourceToSupabase(resource);
    } catch (syncErr) {
      console.warn('[Supabase] Resource version sync warning:', syncErr);
    }

    // Log Activity
    db.logActivity({
      userId: user.id,
      userName: `${user.fullName} (${user.employeeId || user.role})`,
      userRole: user.role,
      branchName: userBranch?.name || user.branchName || 'DIPS Branch',
      action: 'UPDATE',
      resourceTitle: resource.title,
      subjectName: resource.subjectName,
      details: `Teacher collaboration: Updated "${resource.title}" to Version ${nextVersionNumber} (${changelog || 'Material updated'}).`,
    });

    // Notify the original uploader if different
    if (resource.uploadedByUserId !== user.id) {
      db.addNotification({
        id: 'notif-' + Date.now(),
        userId: resource.uploadedByUserId,
        title: 'Resource Enhanced by Colleague',
        message: `${user.fullName} (${userBranch?.name}) added Version ${nextVersionNumber} to your resource "${resource.title}".`,
        type: 'resource_updated',
        isRead: false,
        createdAt: now,
      });
    }

    return res.json({ resource, newVersion });
  }
);

// POST /api/resources/:id/restore-version - Admin or authorized teacher can restore older version
resourceRouter.post('/:id/restore-version', authMiddleware, requireTeacherOrAdmin, async (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const resource = db.findResourceById(req.params.id);
  if (!resource) return res.status(404).json({ error: 'Resource not found' });

  if (!canEditResource(user, resource)) {
    return res.status(403).json({ error: 'Unauthorized to modify this resource' });
  }

  const { versionNumber } = req.body;
  const targetVersion = resource.versions.find((v) => v.versionNumber === Number(versionNumber));
  if (!targetVersion) return res.status(404).json({ error: 'Specified version not found' });

  // Update current active file to matched version
  resource.fileUrl = targetVersion.fileUrl;
  resource.fileName = targetVersion.fileName;
  resource.fileSize = targetVersion.fileSize;
  resource.currentVersion = targetVersion.versionNumber;
  resource.lastUpdatedByUserId = user.id;
  resource.lastUpdatedByName = user.fullName;
  resource.updatedAt = new Date().toISOString();

  db.persist();

  // Sync update to Supabase
  try {
    await syncResourceToSupabase(resource);
  } catch (syncErr) {
    console.warn('[Supabase] Resource restore version sync notice:', syncErr);
  }

  db.logActivity({
    userId: user.id,
    userName: user.fullName,
    userRole: user.role,
    branchName: user.branchName || 'DIPS Central',
    action: 'RESTORE',
    resourceTitle: resource.title,
    subjectName: resource.subjectName,
    details: `Restored version ${targetVersion.versionNumber} ("${targetVersion.versionTitle}") for "${resource.title}".`,
  });

  return res.json({ resource, restoredVersion: targetVersion });
});

// POST /api/resources/:id/status - Approve or Reject (Admin or Subject Head)
resourceRouter.post('/:id/status', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  if (user.role !== 'admin' && user.role !== 'coordinator') {
    return res.status(403).json({ error: 'Only Administrators or Academic Coordinators can approve/reject content.' });
  }

  const resource = db.findResourceById(req.params.id);
  if (!resource) return res.status(404).json({ error: 'Resource not found' });

  const { status, remarks } = req.body;
  if (!['published', 'rejected', 'pending_approval'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  resource.status = status;
  resource.approvalRemarks = remarks || '';
  resource.updatedAt = new Date().toISOString();
  db.persist();

  // Sync update to Supabase
  try {
    await syncResourceToSupabase(resource);
  } catch (syncErr) {
    console.warn('[Supabase] Resource status sync notice:', syncErr);
  }

  db.logActivity({
    userId: user.id,
    userName: user.fullName,
    userRole: user.role,
    branchName: user.branchName || 'DIPS Central',
    action: status === 'published' ? 'APPROVE' : 'REJECT',
    resourceTitle: resource.title,
    subjectName: resource.subjectName,
    details: `${status === 'published' ? 'Approved' : 'Rejected'} content "${resource.title}". Remarks: ${remarks || 'None'}.`,
  });

  // Notify creator
  db.addNotification({
    id: 'notif-' + Date.now(),
    userId: resource.uploadedByUserId,
    title: `Resource ${status === 'published' ? 'Approved' : 'Status Updated'}`,
    message: `Your resource "${resource.title}" was marked as ${status} by ${user.fullName}. ${remarks ? `Remarks: ${remarks}` : ''}`,
    type: 'approval',
    isRead: false,
    createdAt: new Date().toISOString(),
  });

  return res.json({ resource });
});

// POST /api/resources/:id/download - Track download
resourceRouter.post('/:id/download', authMiddleware, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const resource = db.findResourceById(req.params.id);
  if (!resource) return res.status(404).json({ error: 'Resource not found' });

  resource.downloadsCount = (resource.downloadsCount || 0) + 1;
  db.persist();

  db.logActivity({
    userId: user.id,
    userName: `${user.fullName} (${user.admissionNo || user.employeeId || user.role})`,
    userRole: user.role,
    branchName: user.branchName || 'DIPS Branch',
    action: 'DOWNLOAD',
    resourceTitle: resource.title,
    subjectName: resource.subjectName,
    details: `Downloaded "${resource.fileName}" (Version ${resource.currentVersion}).`,
  });

  res.json({ success: true, downloadsCount: resource.downloadsCount, fileUrl: resource.fileUrl });
});

// DELETE /api/resources/:id
resourceRouter.delete('/:id', authMiddleware, requireTeacherOrAdmin, async (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const resource = db.findResourceById(req.params.id);
  if (!resource) return res.status(404).json({ error: 'Resource not found' });

  // Admin can delete any resource. Teacher can delete their own.
  if (user.role !== 'admin' && resource.uploadedByUserId !== user.id) {
    return res.status(403).json({ error: 'You can only delete resources uploaded by yourself.' });
  }

  db.deleteResource(resource.id);

  // Sync deletion to Supabase
  try {
    await deleteResourceFromSupabase(resource.id);
  } catch (syncErr) {
    console.warn('[Supabase] Resource delete sync notice:', syncErr);
  }

  db.logActivity({
    userId: user.id,
    userName: user.fullName,
    userRole: user.role,
    branchName: user.branchName || 'DIPS Central',
    action: 'DELETE',
    resourceTitle: resource.title,
    subjectName: resource.subjectName,
    details: `Deleted educational resource: "${resource.title}".`,
  });

  return res.json({ success: true });
});

// POST /api/resources/:id/rate - Star-based rating & qualitative review
resourceRouter.post('/:id/rate', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const resource = db.findResourceById(req.params.id);
  if (!resource) return res.status(404).json({ error: 'Resource not found' });

  // Student class boundary check: students can only rate resources in their class
  if (user.role === 'student' && user.classId && resource.classId !== user.classId) {
    return res.status(403).json({ error: 'You can only rate curriculum content for your enrolled class.' });
  }

  const { rating, feedback } = req.body;
  const numRating = Number(rating);

  if (isNaN(numRating) || numRating < 1 || numRating > 5) {
    return res.status(400).json({ error: 'Rating must be an integer between 1 and 5 stars.' });
  }

  const cleanRating = Math.round(numRating);
  const result = db.rateResource(resource.id, {
    userId: user.id,
    userName: user.fullName,
    userRole: user.role,
    userBranch: user.branchName || '',
    rating: cleanRating,
    feedback: typeof feedback === 'string' ? feedback.trim() : '',
  });

  if (!result) {
    return res.status(500).json({ error: 'Failed to record rating.' });
  }

  // Sync updated rating and average to Supabase
  try {
    await syncResourceToSupabase(result.resource);
  } catch (syncErr) {
    console.warn('[Supabase] Resource rating sync notice:', syncErr);
  }

  // Activity log for auditing
  db.logActivity({
    userId: user.id,
    userName: user.fullName,
    userRole: user.role,
    branchName: user.branchName || 'DIPS Branch',
    action: 'RATE',
    resourceTitle: resource.title,
    subjectName: resource.subjectName,
    details: `Rated ${cleanRating} stars for "${resource.title}". Feedback: ${feedback ? `"${feedback}"` : 'No written comment'}.`,
  });

  // Notify author if rating has high praise or constructive feedback
  if (resource.uploadedByUserId !== user.id) {
    db.addNotification({
      id: 'notif-rate-' + Date.now(),
      userId: resource.uploadedByUserId,
      title: `New Rating for "${resource.title}"`,
      message: `${user.fullName} (${user.role === 'student' ? 'Student' : 'Faculty'}) rated your content ${cleanRating}★${feedback ? `: "${feedback}"` : '.'}`,
      type: 'rating',
      isRead: false,
      createdAt: new Date().toISOString(),
    });
  }

  res.json({
    success: true,
    resource: result.resource,
    rating: result.rating,
    averageRating: result.resource.averageRating,
    ratingsCount: result.resource.ratingsCount,
  });
});

// GET /api/resources/:id/ratings - Retrieve ratings and feedback comments
resourceRouter.get('/:id/ratings', authMiddleware, (req: AuthenticatedRequest, res) => {
  const resource = db.findResourceById(req.params.id);
  if (!resource) return res.status(404).json({ error: 'Resource not found' });

  const ratings = resource.ratings || [];
  res.json({
    ratings,
    averageRating: resource.averageRating || 0,
    ratingsCount: resource.ratingsCount || 0,
  });
});
