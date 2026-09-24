import { Router } from 'express';
import { db } from '../db.js';
import { authMiddleware, requireAdmin, AuthenticatedRequest } from '../auth.js';
import { syncBranchToSupabase, deleteBranchFromSupabase } from '../supabase.js';
import type { Branch } from '../../src/types.js';

export const branchRouter = Router();

// Publicly readable so login/register/branch selector can see branch options
branchRouter.get('/', (req, res) => {
  const branches = db.getBranches();
  const allUsers = db.getRawData().users;

  // Calculate live teacher & student counts
  const enriched = branches.map((b) => {
    const totalTeachers = allUsers.filter((u) => u.branchId === b.id && (u.role === 'teacher' || u.role === 'coordinator')).length;
    const totalStudents = allUsers.filter((u) => u.branchId === b.id && u.role === 'student').length;
    return {
      ...b,
      totalTeachers: totalTeachers || b.totalTeachers,
      totalStudents: totalStudents || b.totalStudents,
    };
  });

  res.json({ branches: enriched });
});

branchRouter.post('/', authMiddleware, requireAdmin, async (req: AuthenticatedRequest, res) => {
  const { name, code, city, address, phone, principalName, establishedYear } = req.body;
  if (!name || !code || !city) {
    return res.status(400).json({ error: 'Branch name, code, and city are required.' });
  }

  const newBranch: Branch = {
    id: 'branch-' + code.toLowerCase().replace(/[^a-z0-9]/g, '') + '-' + Date.now().toString().slice(-4),
    name,
    code: code.toUpperCase(),
    city,
    address: address || '',
    phone: phone || '',
    principalName: principalName || '',
    establishedYear: Number(establishedYear) || new Date().getFullYear(),
    totalStudents: 0,
    totalTeachers: 0,
  };

  db.addBranch(newBranch);

  // Sync real-time to Supabase
  try {
    await syncBranchToSupabase(newBranch);
  } catch (syncErr) {
    console.warn('[Supabase] Branch creation sync notice:', syncErr);
  }

  db.logActivity({
    userId: req.user!.id,
    userName: req.user!.fullName,
    userRole: req.user!.role,
    branchName: 'Central Admin',
    action: 'UPLOAD',
    details: `Added new DIPS branch: "${name}" (${code}).`,
  });

  return res.status(201).json({ branch: newBranch });
});

branchRouter.put('/:id', authMiddleware, requireAdmin, async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const updated = db.updateBranch(id, req.body);
  if (!updated) return res.status(404).json({ error: 'Branch not found' });

  // Sync update immediately to Supabase
  try {
    await syncBranchToSupabase(updated);
  } catch (syncErr) {
    console.warn('[Supabase] Branch update sync notice:', syncErr);
  }

  db.logActivity({
    userId: req.user!.id,
    userName: req.user!.fullName,
    userRole: req.user!.role,
    branchName: 'Central Admin',
    action: 'UPDATE',
    details: `Updated details for DIPS branch: "${updated.name}".`,
  });

  return res.json({ branch: updated });
});

branchRouter.delete('/:id', authMiddleware, requireAdmin, async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const branch = db.getBranches().find((b) => b.id === id);
  if (!branch) return res.status(404).json({ error: 'Branch not found' });

  db.deleteBranch(id);

  // Sync deletion immediately to Supabase
  try {
    await deleteBranchFromSupabase(id);
  } catch (syncErr) {
    console.warn('[Supabase] Branch delete sync notice:', syncErr);
  }

  db.logActivity({
    userId: req.user!.id,
    userName: req.user!.fullName,
    userRole: req.user!.role,
    branchName: 'Central Admin',
    action: 'DELETE',
    details: `Deleted DIPS branch: "${branch.name}".`,
  });

  return res.json({ success: true, message: 'Branch removed successfully.' });
});

