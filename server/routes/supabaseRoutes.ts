import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { db } from '../db.js';
import {
  checkSupabaseHealth,
  SUPABASE_PROJECT_ID,
  SUPABASE_URL,
  SUPABASE_KEY,
  SUPABASE_SQL_SCHEMA,
  getSupabaseClient,
  syncUserToSupabase,
} from '../supabase.js';

export const supabaseRouter = Router();

// GET /api/supabase/status
supabaseRouter.get('/status', async (req, res) => {
  try {
    const health = await checkSupabaseHealth();
    // Mask key for safety (show first 14 chars and last 4)
    const maskedKey =
      SUPABASE_KEY.length > 18
        ? `${SUPABASE_KEY.substring(0, 15)}...${SUPABASE_KEY.substring(SUPABASE_KEY.length - 4)}`
        : '***';

    let schemaContent = SUPABASE_SQL_SCHEMA;
    try {
      const fileSchemaPath = path.join(process.cwd(), 'supabase_schema.sql');
      if (fs.existsSync(fileSchemaPath)) {
        schemaContent = fs.readFileSync(fileSchemaPath, 'utf-8');
      }
    } catch {
      // fallback
    }

    res.json({
      ...health,
      maskedKey,
      sqlSchema: schemaContent,
    });
  } catch (err: any) {
    res.status(500).json({
      connected: false,
      error: err.message,
      projectId: SUPABASE_PROJECT_ID,
      url: SUPABASE_URL,
    });
  }
});

// POST /api/supabase/sync - Bulk sync memory data to Supabase
supabaseRouter.post('/sync', async (req, res) => {
  try {
    const client = getSupabaseClient();
    const results: Record<string, { attempted: number; successful: number; error?: string }> = {};

    // 1. Sync Branches
    const branches = db.getBranches();
    try {
      const payload = branches.map((b) => ({
        id: b.id,
        name: b.name,
        code: b.code,
        city: b.city,
        address: b.address,
        phone: b.phone,
        principal_name: b.principalName,
        established_year: b.establishedYear,
        total_students: b.totalStudents,
        total_teachers: b.totalTeachers,
      }));
      const { error } = await client.from('branches').upsert(payload);
      results['branches'] = {
        attempted: branches.length,
        successful: error ? 0 : branches.length,
        error: error?.message,
      };
    } catch (e: any) {
      results['branches'] = { attempted: branches.length, successful: 0, error: e.message };
    }

    // 2. Sync Classes
    const classes = db.getClasses();
    try {
      const payload = classes.map((c) => ({
        id: c.id,
        name: c.name,
        code: c.code,
        sort_order: c.order,
        sections: c.sections,
      }));
      const { error } = await client.from('classes').upsert(payload);
      results['classes'] = {
        attempted: classes.length,
        successful: error ? 0 : classes.length,
        error: error?.message,
      };
    } catch (e: any) {
      results['classes'] = { attempted: classes.length, successful: 0, error: e.message };
    }

    // 3. Sync Subjects
    const subjects = db.getSubjects();
    try {
      const payload = subjects.map((s) => ({
        id: s.id,
        name: s.name,
        code: s.code,
        department: s.department,
        applicable_classes: s.applicableClasses,
        description: s.description,
      }));
      const { error } = await client.from('subjects').upsert(payload);
      results['subjects'] = {
        attempted: subjects.length,
        successful: error ? 0 : subjects.length,
        error: error?.message,
      };
    } catch (e: any) {
      results['subjects'] = { attempted: subjects.length, successful: 0, error: e.message };
    }

    // 4. Sync Resources
    const resources = db.getResources();
    try {
      const payload = resources.map((r) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        resource_type: r.contentType,
        file_url: r.fileUrl,
        file_name: r.fileName,
        file_size_bytes: r.fileSize,
        subject_id: r.subjectId,
        subject_name: r.subjectName,
        class_id: r.classId,
        class_name: r.className,
        branch_id: r.branchId,
        branch_name: r.branchName,
        uploaded_by_id: r.uploadedByUserId,
        uploaded_by_name: r.uploadedByName,
        uploaded_by_role: 'Teacher',
        status: r.status,
        download_count: r.downloadsCount,
        chapter: r.chapter,
        topic: r.topic,
        category: r.category,
      }));
      const { error } = await client.from('resources').upsert(payload);
      results['resources'] = {
        attempted: resources.length,
        successful: error ? 0 : resources.length,
        error: error?.message,
      };
    } catch (e: any) {
      results['resources'] = { attempted: resources.length, successful: 0, error: e.message };
    }

    // 5. Sync Users (Admin, Teachers, Students)
    const users = db.getRawData().users;
    try {
      let userSuccess = 0;
      const userErrors: string[] = [];

      for (const u of users) {
        try {
          const syncRes = await syncUserToSupabase(u);
          if (syncRes.success) {
            userSuccess++;
          } else {
            userErrors.push(`${u.username || u.id}: ${syncRes.error}`);
          }
        } catch (uErr: any) {
          userErrors.push(`${u.username || u.id}: ${uErr.message}`);
        }
      }

      results['users'] = {
        attempted: users.length,
        successful: userSuccess,
        error: userErrors.length > 0 ? userErrors.slice(0, 3).join('; ') : undefined,
      };
    } catch (e: any) {
      results['users'] = { attempted: users.length, successful: 0, error: e.message };
    }

    // 6. Sync Announcements
    const announcements = db.getAnnouncements();
    try {
      const payload = announcements.map((a) => ({
        id: a.id,
        title: a.title,
        content: a.content,
        priority: a.priority,
        target_role: a.targetRole,
        author_name: a.authorName,
        author_role: a.authorRole,
      }));
      const { error } = await client.from('announcements').upsert(payload);
      results['announcements'] = {
        attempted: announcements.length,
        successful: error ? 0 : announcements.length,
        error: error?.message,
      };
    } catch (e: any) {
      results['announcements'] = { attempted: announcements.length, successful: 0, error: e.message };
    }

    res.json({
      success: true,
      message: 'Supabase synchronization run finished.',
      results,
      projectId: SUPABASE_PROJECT_ID,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});
