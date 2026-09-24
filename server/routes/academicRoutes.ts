import { Router } from 'express';
import { db } from '../db.js';
import { authMiddleware, requireAdmin, AuthenticatedRequest } from '../auth.js';
import {
  syncClassToSupabase,
  deleteClassFromSupabase,
  syncSubjectToSupabase,
  deleteSubjectFromSupabase,
} from '../supabase.js';
import type { AcademicClass, Subject, AcademicSession } from '../../src/types.js';

export const academicRouter = Router();

// Classes
academicRouter.get('/classes', (req, res) => {
  res.json({ classes: db.getClasses() });
});

academicRouter.post('/classes', authMiddleware, requireAdmin, async (req: AuthenticatedRequest, res) => {
  const { name, code, order, sections } = req.body;
  if (!name || !code) return res.status(400).json({ error: 'Class name and code are required.' });

  const newClass: AcademicClass = {
    id: 'class-' + code.toLowerCase().replace(/[^a-z0-9]/g, '') + '-' + Date.now().toString().slice(-4),
    name,
    code,
    order: Number(order) || 1,
    sections: Array.isArray(sections) && sections.length > 0 ? sections : ['A', 'B'],
  };

  db.addClass(newClass);

  // Sync class to Supabase
  try {
    await syncClassToSupabase(newClass);
  } catch (syncErr) {
    console.warn('[Supabase] Class sync notice:', syncErr);
  }

  return res.status(201).json({ class: newClass });
});

academicRouter.put('/classes/:id', authMiddleware, requireAdmin, async (req: AuthenticatedRequest, res) => {
  const updated = db.updateClass(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Class not found' });

  // Sync update to Supabase
  try {
    await syncClassToSupabase(updated);
  } catch (syncErr) {
    console.warn('[Supabase] Class update sync notice:', syncErr);
  }

  return res.json({ class: updated });
});

academicRouter.delete('/classes/:id', authMiddleware, requireAdmin, async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  db.deleteClass(id);

  // Sync deletion to Supabase
  try {
    await deleteClassFromSupabase(id);
  } catch (syncErr) {
    console.warn('[Supabase] Class delete sync notice:', syncErr);
  }

  return res.json({ success: true });
});

// Subjects
academicRouter.get('/subjects', (req, res) => {
  res.json({ subjects: db.getSubjects() });
});

academicRouter.post('/subjects', authMiddleware, requireAdmin, async (req: AuthenticatedRequest, res) => {
  const { name, code, department, applicableClasses, description } = req.body;
  if (!name || !code) return res.status(400).json({ error: 'Subject name and code are required.' });

  const newSubject: Subject = {
    id: 'sub-' + code.toLowerCase().replace(/[^a-z0-9]/g, '') + '-' + Date.now().toString().slice(-4),
    name,
    code,
    department: department || 'General',
    applicableClasses: Array.isArray(applicableClasses) ? applicableClasses : [],
    description: description || '',
  };

  db.addSubject(newSubject);

  // Sync subject to Supabase
  try {
    await syncSubjectToSupabase(newSubject);
  } catch (syncErr) {
    console.warn('[Supabase] Subject sync notice:', syncErr);
  }

  return res.status(201).json({ subject: newSubject });
});

academicRouter.put('/subjects/:id', authMiddleware, requireAdmin, async (req: AuthenticatedRequest, res) => {
  const updated = db.updateSubject(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Subject not found' });

  // Sync update to Supabase
  try {
    await syncSubjectToSupabase(updated);
  } catch (syncErr) {
    console.warn('[Supabase] Subject update sync notice:', syncErr);
  }

  return res.json({ subject: updated });
});

academicRouter.delete('/subjects/:id', authMiddleware, requireAdmin, async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  db.deleteSubject(id);

  // Sync deletion to Supabase
  try {
    await deleteSubjectFromSupabase(id);
  } catch (syncErr) {
    console.warn('[Supabase] Subject delete sync notice:', syncErr);
  }

  return res.json({ success: true });
});

// Sessions
academicRouter.get('/sessions', (req, res) => {
  res.json({ sessions: db.getSessions() });
});

