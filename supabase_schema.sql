-- ==============================================================================
-- DIPS INSTITUTIONS PORTAL - SUPABASE POSTGRESQL SCHEMA
-- Project ID: rqqjqflxbtfcrbywwtpc
-- Instructions: 
-- 1. Go to https://supabase.com/dashboard/project/rqqjqflxbtfcrbywwtpc/sql
-- 2. Click "New Query", paste this entire script, and click "RUN".
-- ==============================================================================

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

-- 6. Announcements Table
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

-- 7. Activity Logs Table
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

-- ==============================================================================
-- ENABLE ROW LEVEL SECURITY (RLS) & ACCESS POLICIES
-- ==============================================================================
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Read policies for public / anon
CREATE POLICY "Allow read branches" ON public.branches FOR SELECT USING (true);
CREATE POLICY "Allow read classes" ON public.classes FOR SELECT USING (true);
CREATE POLICY "Allow read subjects" ON public.subjects FOR SELECT USING (true);
CREATE POLICY "Allow read users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Allow read resources" ON public.resources FOR SELECT USING (true);
CREATE POLICY "Allow read announcements" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Allow read activity_logs" ON public.activity_logs FOR SELECT USING (true);

-- Insert & Update policies
CREATE POLICY "Allow insert resources" ON public.resources FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update resources" ON public.resources FOR UPDATE USING (true);
CREATE POLICY "Allow insert announcements" ON public.announcements FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert activity_logs" ON public.activity_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert users" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update users" ON public.users FOR UPDATE USING (true);

-- ==============================================================================
-- SEED INITIAL BRANCHES
-- ==============================================================================
INSERT INTO public.branches (id, name, code, city, address, phone, principal_name, established_year)
VALUES
  ('branch-begowal', 'DIPS Begowal', 'BEG', 'Begowal, Kapurthala', 'Near Main GT Road, Begowal, Punjab', '+91 1822 245100', 'Mrs. Jaswinder Kaur', 2004),
  ('branch-jalandhar', 'DIPS Urban Estate Jalandhar', 'JAL', 'Jalandhar', 'Phase-I, Urban Estate, Jalandhar, Punjab', '+91 181 2284900', 'Dr. Gurveen Kaur', 2001),
  ('branch-gilzian', 'DIPS Gilzian', 'GIL', 'Gilzian, Hoshiarpur', 'Tanda-Gilzian Highway, Punjab', '+91 1886 271220', 'Mr. Harvinder Singh', 2008),
  ('branch-nurmahal', 'DIPS Nurmahal', 'NUR', 'Nurmahal, Jalandhar', 'Kot Badal Khan Road, Nurmahal, Punjab', '+91 1826 244510', 'Mrs. Ritu Pathak', 2011),
  ('branch-tanda', 'DIPS Tanda', 'TAN', 'Urmar Tanda', 'Near Bus Stand, Urmar Tanda, Punjab', '+91 1886 223400', 'Mrs. Seema Sharma', 2014)
ON CONFLICT (id) DO NOTHING;

-- SEED SUPER ADMIN USER (Password: dips@1630502)
INSERT INTO public.users (id, username, email, full_name, role, branch_id, branch_name, phone, password_hash)
VALUES (
  'user-admin',
  'dipsbegowal@gmail.com',
  'dipsbegowal@gmail.com',
  'DIPS Begowal Administration',
  'admin',
  'branch-begowal',
  'DIPS Begowal',
  '+91 1822 245100',
  'a8bf76b701e20cf0c59bc46940f520c78271c198462079480abb04baadcb9d25'
)
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- 7. SUPABASE STORAGE BUCKET (For Permanent File Uploads)
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('dips-resources', 'dips-resources', true, 52428800)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing storage policies if re-running
DO $$
BEGIN
  DROP POLICY IF EXISTS "Public Access DIPS Resources" ON storage.objects;
  DROP POLICY IF EXISTS "Allow Upload DIPS Resources" ON storage.objects;
  DROP POLICY IF EXISTS "Allow Update DIPS Resources" ON storage.objects;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "Public Access DIPS Resources" ON storage.objects FOR SELECT USING (bucket_id = 'dips-resources');
CREATE POLICY "Allow Upload DIPS Resources" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'dips-resources');
CREATE POLICY "Allow Update DIPS Resources" ON storage.objects FOR UPDATE USING (bucket_id = 'dips-resources');
