import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const SUPABASE_PROJECT_ID = 'rqqjqflxbtfcrbywwtpc';
export const DEFAULT_SUPABASE_URL = `https://${SUPABASE_PROJECT_ID}.supabase.co`;
export const DEFAULT_SUPABASE_KEY = 'sb_publishable_Rpydb7voi4Ent3T2exz8qQ_TsaaTtH4';

export const SUPABASE_URL = process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL;
export const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || DEFAULT_SUPABASE_KEY;

// Create lazy/singleton Supabase client instance
let supabaseClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        persistSession: false,
      },
    });
  }
  return supabaseClient;
}

export const supabase = getSupabaseClient();

/**
 * SQL Schema script that the user can execute in their Supabase SQL Editor
 * to provision Postgres tables for resources, users, branches, announcements, and activity logs.
 */
export const SUPABASE_SQL_SCHEMA = `-- DIPS Central Portal Schema for Supabase
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/sql)

-- 1. Branches Table
CREATE TABLE IF NOT EXISTS public.branches (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  principal_name TEXT,
  established_year INT,
  total_students INT DEFAULT 0,
  total_teachers INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Classes Table
CREATE TABLE IF NOT EXISTS public.classes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  sort_order INT DEFAULT 1,
  sections TEXT[] DEFAULT ARRAY['A', 'B'],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Subjects Table
CREATE TABLE IF NOT EXISTS public.subjects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  department TEXT NOT NULL,
  applicable_classes TEXT[] DEFAULT ARRAY[]::TEXT[],
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Users Table (Admin, Teachers, Students)
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'teacher', 'student', 'coordinator')),
  branch_id TEXT REFERENCES public.branches(id) ON DELETE SET NULL,
  branch_name TEXT,
  phone TEXT,
  employee_id TEXT,
  admission_no TEXT,
  designation TEXT,
  class_id TEXT,
  class_name TEXT,
  section TEXT,
  assigned_subject_ids TEXT[] DEFAULT ARRAY[]::TEXT[],
  assigned_class_ids TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  password_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Resources / Learning Materials Table
CREATE TABLE IF NOT EXISTS public.resources (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  resource_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT,
  file_size_bytes BIGINT DEFAULT 0,
  subject_id TEXT,
  subject_name TEXT,
  class_id TEXT,
  class_name TEXT,
  branch_id TEXT,
  branch_name TEXT,
  uploaded_by_id TEXT,
  uploaded_by_name TEXT,
  uploaded_by_role TEXT,
  status TEXT DEFAULT 'published',
  download_count INT DEFAULT 0,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Announcements Table
CREATE TABLE IF NOT EXISTS public.announcements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  priority TEXT DEFAULT 'normal',
  target_role TEXT DEFAULT 'all',
  author_name TEXT,
  author_role TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Activity Logs Table
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  user_name TEXT,
  user_role TEXT,
  branch_name TEXT,
  action TEXT NOT NULL,
  details TEXT,
  ip_address TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) and grant read access for anon
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon read branches" ON public.branches FOR SELECT USING (true);
CREATE POLICY "Allow anon read classes" ON public.classes FOR SELECT USING (true);
CREATE POLICY "Allow anon read subjects" ON public.subjects FOR SELECT USING (true);
CREATE POLICY "Allow anon read users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Allow anon read resources" ON public.resources FOR SELECT USING (true);
CREATE POLICY "Allow anon read announcements" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Allow anon read activity_logs" ON public.activity_logs FOR SELECT USING (true);

-- Allow authenticated/anon insert/update for demo portal
CREATE POLICY "Allow anon insert users" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update users" ON public.users FOR UPDATE USING (true);
CREATE POLICY "Allow anon insert resources" ON public.resources FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update resources" ON public.resources FOR UPDATE USING (true);
CREATE POLICY "Allow anon insert announcements" ON public.announcements FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon insert activity_logs" ON public.activity_logs FOR INSERT WITH CHECK (true);

-- 7. Supabase Storage: Public bucket for resources
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('dips-resources', 'dips-resources', true, 52428800, null)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage public read policy
CREATE POLICY "Public Access DIPS Resources" ON storage.objects FOR SELECT USING (bucket_id = 'dips-resources');
-- Storage upload policy
CREATE POLICY "Allow Upload DIPS Resources" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'dips-resources');
CREATE POLICY "Allow Update DIPS Resources" ON storage.objects FOR UPDATE USING (bucket_id = 'dips-resources');
`;

export const BUCKET_NAME = 'dips-resources';

/**
 * Uploads a file buffer permanently into Supabase Storage
 */
export async function uploadFileToSupabaseStorage(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<{ success: boolean; publicUrl?: string; error?: string }> {
  try {
    const client = getSupabaseClient();
    const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `uploads/${Date.now()}-${Math.round(Math.random() * 1e4)}-${cleanFileName}`;

    // Upload directly to Supabase storage bucket
    const { data, error } = await client.storage
      .from(BUCKET_NAME)
      .upload(storagePath, fileBuffer, {
        contentType: mimeType || 'application/octet-stream',
        upsert: true,
      });

    if (error) {
      console.warn(`[Supabase Storage] Notice: ${error.message}`);
      return { success: false, error: error.message };
    }

    // Get public URL
    const { data: publicUrlData } = client.storage.from(BUCKET_NAME).getPublicUrl(data.path);

    return {
      success: true,
      publicUrl: publicUrlData.publicUrl,
    };
  } catch (err: any) {
    console.error('[Supabase Storage] Error:', err);
    return { success: false, error: err?.message };
  }
}

/**
 * Checks connectivity to the Supabase endpoint
 */
export async function checkSupabaseHealth(): Promise<{
  connected: boolean;
  status: number | string;
  projectId: string;
  url: string;
  latencyMs: number;
  message: string;
  tablesDetected: string[];
}> {
  const start = Date.now();
  const tablesFound: string[] = [];

  try {
    const client = getSupabaseClient();
    const tableNames = ['branches', 'resources', 'classes', 'subjects', 'announcements', 'activity_logs'];

    // Test first table to determine connectivity and auth status
    const probe = await client.from('branches').select('count', { count: 'exact', head: true });
    const latencyMs = Date.now() - start;

    // Check if auth failed completely
    if (probe.error && (probe.error.code === 'PGRST301' || probe.status === 401)) {
      return {
        connected: false,
        status: probe.status || 401,
        projectId: SUPABASE_PROJECT_ID,
        url: SUPABASE_URL,
        latencyMs,
        message: probe.error.message || 'Supabase authentication failed. Please check publishable key.',
        tablesDetected: [],
      };
    }

    // Now check which tables exist in Postgres
    for (const tbl of tableNames) {
      try {
        const { error, data } = await client.from(tbl).select('id').limit(1);
        if (!error && data !== null) {
          tablesFound.push(tbl);
        }
      } catch {
        // Table not present
      }
    }

    const hasTables = tablesFound.length > 0;

    return {
      connected: true,
      status: probe.status || 200,
      projectId: SUPABASE_PROJECT_ID,
      url: SUPABASE_URL,
      latencyMs,
      message: hasTables
        ? `Successfully connected! Active tables detected: ${tablesFound.join(', ')}`
        : 'Successfully connected to Supabase! Run the provided SQL schema in your Supabase SQL Editor to create portal tables.',
      tablesDetected: tablesFound,
    };
  } catch (error: any) {
    return {
      connected: false,
      status: 'error',
      projectId: SUPABASE_PROJECT_ID,
      url: SUPABASE_URL,
      latencyMs: Date.now() - start,
      message: error?.message || 'Could not reach Supabase endpoint',
      tablesDetected: [],
    };
  }
}

/**
 * Syncs a resource record to Supabase if the table exists
 */
export async function syncResourceToSupabase(resource: any) {
  try {
    const client = getSupabaseClient();
    const { error } = await client.from('resources').upsert({
      id: resource.id,
      title: resource.title,
      description: resource.description || '',
      resource_type: resource.contentType || resource.resourceType || 'document',
      file_url: resource.fileUrl,
      file_name: resource.fileName,
      file_size_bytes: resource.fileSize || resource.fileSizeBytes || 0,
      subject_id: resource.subjectId,
      subject_name: resource.subjectName,
      class_id: resource.classId,
      class_name: resource.className,
      branch_id: resource.branchId,
      branch_name: resource.branchName,
      uploaded_by_id: resource.uploadedByUserId || resource.uploadedById,
      uploaded_by_name: resource.uploadedByName,
      uploaded_by_role: 'Teacher',
      status: resource.status || 'published',
      download_count: resource.downloadsCount || resource.downloadCount || 0,
      chapter: resource.chapter || '',
      topic: resource.topic || '',
      current_version: resource.currentVersion || 1,
      versions: resource.versions || [],
      ratings: resource.ratings || [],
      average_rating: resource.averageRating || 0,
      rating_count: resource.ratingsCount || 0,
    });
    if (error) {
      console.warn(`[Supabase Sync] Resource sync notice: ${error.message}`);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

/**
 * Syncs an announcement record to Supabase
 */
export async function syncAnnouncementToSupabase(anc: any) {
  try {
    const client = getSupabaseClient();
    const { error } = await client.from('announcements').upsert({
      id: anc.id,
      title: anc.title,
      content: anc.content,
      priority: anc.priority || 'normal',
      target_role: anc.targetRole || 'all',
      author_name: anc.authorName,
      author_role: anc.authorRole,
    });
    if (error) {
      console.warn(`[Supabase Sync] Announcement sync notice: ${error.message}`);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

/**
 * Loads resources from Supabase into memory if present
 */
export async function loadResourcesFromSupabase(): Promise<any[]> {
  try {
    const client = getSupabaseClient();
    const { data, error } = await client.from('resources').select('*');
    if (error || !data) return [];
    return data;
  } catch {
    return [];
  }
}
/**
 * Syncs a user record (Teacher, Admin, Student) permanently to Supabase
 */
export async function syncUserToSupabase(user: any, passwordHash?: string) {
  try {
    const client = getSupabaseClient();
    const { error } = await client.from('users').upsert({
      id: user.id,
      username: user.username,
      email: user.email,
      full_name: user.fullName,
      role: user.role,
      branch_id: user.branchId || null,
      branch_name: user.branchName || null,
      phone: user.phone || null,
      employee_id: user.employeeId || null,
      admission_no: user.admissionNo || null,
      designation: user.designation || null,
      class_id: user.classId || null,
      class_name: user.className || null,
      section: user.section || null,
      assigned_subject_ids: user.assignedSubjectIds || [],
      assigned_class_ids: user.assignedClassIds || [],
      is_active: user.isActive !== false,
      password_hash: passwordHash || user.passwordHash || null,
    });
    if (error) {
      console.warn(`[Supabase Sync] User sync notice: ${error.message}`);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

/**
 * Loads registered users from Supabase PostgreSQL
 */
export async function loadUsersFromSupabase(): Promise<any[]> {
  try {
    const client = getSupabaseClient();
    const { data, error } = await client.from('users').select('*');
    if (error || !data) return [];
    return data;
  } catch {
    return [];
  }
}

export async function syncActivityLogToSupabase(log: any) {
  try {
    const client = getSupabaseClient();
    const { error } = await client.from('activity_logs').upsert({
      id: log.id,
      user_id: log.userId,
      user_name: log.userName,
      user_role: log.userRole,
      branch_name: log.branchName,
      action: log.action,
      details: log.details,
      ip_address: log.ipAddress || '',
    });
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

/**
 * Syncs a branch record immediately to Supabase
 */
export async function syncBranchToSupabase(branch: any) {
  try {
    const client = getSupabaseClient();
    const { error } = await client.from('branches').upsert({
      id: branch.id,
      name: branch.name,
      code: branch.code,
      city: branch.city,
      address: branch.address || '',
      phone: branch.phone || '',
      principal_name: branch.principalName || '',
      established_year: branch.establishedYear || null,
      total_students: branch.totalStudents || 0,
      total_teachers: branch.totalTeachers || 0,
    });
    if (error) {
      console.warn(`[Supabase Sync] Branch sync notice: ${error.message}`);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

/**
 * Deletes a branch record from Supabase
 */
export async function deleteBranchFromSupabase(branchId: string) {
  try {
    const client = getSupabaseClient();
    const { error } = await client.from('branches').delete().eq('id', branchId);
    if (error) {
      console.warn(`[Supabase Sync] Branch deletion notice: ${error.message}`);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

/**
 * Deletes a resource from Supabase
 */
export async function deleteResourceFromSupabase(resourceId: string) {
  try {
    const client = getSupabaseClient();
    const { error } = await client.from('resources').delete().eq('id', resourceId);
    if (error) {
      console.warn(`[Supabase Sync] Resource deletion notice: ${error.message}`);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

/**
 * Deletes an announcement from Supabase
 */
export async function deleteAnnouncementFromSupabase(announcementId: string) {
  try {
    const client = getSupabaseClient();
    const { error } = await client.from('announcements').delete().eq('id', announcementId);
    if (error) {
      console.warn(`[Supabase Sync] Announcement deletion notice: ${error.message}`);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

/**
 * Deletes a user from Supabase
 */
export async function deleteUserFromSupabase(userId: string) {
  try {
    const client = getSupabaseClient();
    const { error } = await client.from('users').delete().eq('id', userId);
    if (error) {
      console.warn(`[Supabase Sync] User deletion notice: ${error.message}`);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

/**
 * Syncs an academic class to Supabase
 */
export async function syncClassToSupabase(cls: any) {
  try {
    const client = getSupabaseClient();
    const { error } = await client.from('classes').upsert({
      id: cls.id,
      name: cls.name,
      code: cls.code,
      sort_order: cls.sortOrder || 1,
      sections: cls.sections || ['A', 'B'],
    });
    if (error) {
      console.warn(`[Supabase Sync] Class sync notice: ${error.message}`);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

/**
 * Deletes an academic class from Supabase
 */
export async function deleteClassFromSupabase(classId: string) {
  try {
    const client = getSupabaseClient();
    const { error } = await client.from('classes').delete().eq('id', classId);
    if (error) {
      console.warn(`[Supabase Sync] Class deletion notice: ${error.message}`);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

/**
 * Syncs an academic subject to Supabase
 */
export async function syncSubjectToSupabase(subj: any) {
  try {
    const client = getSupabaseClient();
    const { error } = await client.from('subjects').upsert({
      id: subj.id,
      name: subj.name,
      code: subj.code,
      department: subj.department || '',
      applicable_classes: subj.applicableClasses || [],
      description: subj.description || '',
    });
    if (error) {
      console.warn(`[Supabase Sync] Subject sync notice: ${error.message}`);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

/**
 * Deletes an academic subject from Supabase
 */
export async function deleteSubjectFromSupabase(subjectId: string) {
  try {
    const client = getSupabaseClient();
    const { error } = await client.from('subjects').delete().eq('id', subjectId);
    if (error) {
      console.warn(`[Supabase Sync] Subject deletion notice: ${error.message}`);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}


