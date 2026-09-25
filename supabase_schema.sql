-- ==============================================================================
-- DIPS INSTITUTIONS PORTAL - COMPLETE SUPABASE POSTGRESQL SCHEMA
-- Includes: ALL 19 DIPS Branches, ALL 16 Classes, ALL 34 Subjects, Teacher Logins, File Storage, & Realtime
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

-- 4. Users Table (Super Admin, Branch Admins, Teachers, Students)
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
  status TEXT DEFAULT 'active',
  password_hash TEXT,
  avatar TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure backwards-compatibility columns exist if table was already created
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS class_name TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- 5. Resources / Learning Content Table
CREATE TABLE IF NOT EXISTS public.resources (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  subject_id TEXT REFERENCES public.subjects(id) ON DELETE RESTRICT,
  subject_name TEXT NOT NULL,
  class_id TEXT REFERENCES public.classes(id) ON DELETE RESTRICT,
  class_name TEXT NOT NULL,
  branch_id TEXT REFERENCES public.branches(id) ON DELETE SET NULL,
  branch_name TEXT,
  chapter TEXT,
  topic TEXT,
  category TEXT DEFAULT 'Lesson Plan',
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INT DEFAULT 0,
  storage_path TEXT,
  uploaded_by_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
  uploaded_by_name TEXT NOT NULL,
  uploaded_by_role TEXT NOT NULL,
  current_version INT DEFAULT 1,
  versions JSONB DEFAULT '[]'::jsonb,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  downloads_count INT DEFAULT 0,
  views_count INT DEFAULT 0,
  likes_count INT DEFAULT 0,
  average_rating NUMERIC(3, 2) DEFAULT 0,
  rating_count INT DEFAULT 0,
  ratings JSONB DEFAULT '[]'::jsonb,
  is_verified BOOLEAN DEFAULT false,
  verified_by TEXT,
  is_curriculum_standard BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
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
-- ROW LEVEL SECURITY (RLS) & ACCESS POLICIES
-- ==============================================================================
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  DROP POLICY IF EXISTS "Allow read branches" ON public.branches;
  DROP POLICY IF EXISTS "Allow read classes" ON public.classes;
  DROP POLICY IF EXISTS "Allow read subjects" ON public.subjects;
  DROP POLICY IF EXISTS "Allow read users" ON public.users;
  DROP POLICY IF EXISTS "Allow read resources" ON public.resources;
  DROP POLICY IF EXISTS "Allow read announcements" ON public.announcements;
  DROP POLICY IF EXISTS "Allow read activity_logs" ON public.activity_logs;

  DROP POLICY IF EXISTS "Allow insert resources" ON public.resources;
  DROP POLICY IF EXISTS "Allow update resources" ON public.resources;
  DROP POLICY IF EXISTS "Allow delete resources" ON public.resources;
  DROP POLICY IF EXISTS "Allow insert announcements" ON public.announcements;
  DROP POLICY IF EXISTS "Allow delete announcements" ON public.announcements;
  DROP POLICY IF EXISTS "Allow insert activity_logs" ON public.activity_logs;
  DROP POLICY IF EXISTS "Allow insert users" ON public.users;
  DROP POLICY IF EXISTS "Allow update users" ON public.users;
  DROP POLICY IF EXISTS "Allow delete users" ON public.users;
  DROP POLICY IF EXISTS "Allow insert branches" ON public.branches;
  DROP POLICY IF EXISTS "Allow update branches" ON public.branches;
  DROP POLICY IF EXISTS "Allow insert classes" ON public.classes;
  DROP POLICY IF EXISTS "Allow update classes" ON public.classes;
  DROP POLICY IF EXISTS "Allow insert subjects" ON public.subjects;
  DROP POLICY IF EXISTS "Allow update subjects" ON public.subjects;
END $$;

CREATE POLICY "Allow read branches" ON public.branches FOR SELECT USING (true);
CREATE POLICY "Allow read classes" ON public.classes FOR SELECT USING (true);
CREATE POLICY "Allow read subjects" ON public.subjects FOR SELECT USING (true);
CREATE POLICY "Allow read users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Allow read resources" ON public.resources FOR SELECT USING (true);
CREATE POLICY "Allow read announcements" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Allow read activity_logs" ON public.activity_logs FOR SELECT USING (true);

CREATE POLICY "Allow insert resources" ON public.resources FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update resources" ON public.resources FOR UPDATE USING (true);
CREATE POLICY "Allow delete resources" ON public.resources FOR DELETE USING (true);

CREATE POLICY "Allow insert announcements" ON public.announcements FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow delete announcements" ON public.announcements FOR DELETE USING (true);

CREATE POLICY "Allow insert activity_logs" ON public.activity_logs FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow insert users" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update users" ON public.users FOR UPDATE USING (true);
CREATE POLICY "Allow delete users" ON public.users FOR DELETE USING (true);

CREATE POLICY "Allow insert branches" ON public.branches FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update branches" ON public.branches FOR UPDATE USING (true);

CREATE POLICY "Allow insert classes" ON public.classes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update classes" ON public.classes FOR UPDATE USING (true);

CREATE POLICY "Allow insert subjects" ON public.subjects FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update subjects" ON public.subjects FOR UPDATE USING (true);

-- ==============================================================================
-- ENABLE SUPABASE REALTIME (Live Sync)
-- ==============================================================================
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.resources;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.announcements;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.branches;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.classes;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.subjects;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_logs;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;

-- ==============================================================================
-- STORAGE BUCKET FOR UPLOADED FILES
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('dips-resources', 'dips-resources', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DO $$
BEGIN
  DROP POLICY IF EXISTS "Public Access dips-resources" ON storage.objects;
  DROP POLICY IF EXISTS "Public Upload dips-resources" ON storage.objects;
  DROP POLICY IF EXISTS "Public Update dips-resources" ON storage.objects;
  DROP POLICY IF EXISTS "Public Delete dips-resources" ON storage.objects;
END $$;

CREATE POLICY "Public Access dips-resources"
ON storage.objects FOR SELECT
USING (bucket_id = 'dips-resources');

CREATE POLICY "Public Upload dips-resources"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'dips-resources');

CREATE POLICY "Public Update dips-resources"
ON storage.objects FOR UPDATE
USING (bucket_id = 'dips-resources');

CREATE POLICY "Public Delete dips-resources"
ON storage.objects FOR DELETE
USING (bucket_id = 'dips-resources');

-- ==============================================================================
-- 1. SEED ALL 19 DIPS BRANCHES
-- ==============================================================================
INSERT INTO public.branches (id, name, code, city, address, phone, principal_name, established_year, total_students, total_teachers)
VALUES 
  ('branch-dipsimt', 'DIPS Institute of Management & Technology (DIPSIMT) (Jalandhar)', 'DIPSIMT', 'Jalandhar', 'DIPSIMT Campus, Jalandhar, Punjab', '+91 181 2780001', 'Director DIPSIMT', 2005, 0, 0),
  ('branch-poly-tanda', 'DIPS Polytechic College (Tanda)', 'DPC-TAN', 'Tanda, Hoshiarpur', 'DIPS Polytechnic College Campus, Urmar Tanda, Punjab', '+91 1886 223402', 'Principal DPC', 2007, 0, 0),
  ('branch-gilzian', 'DIPS School, Gilzian (Hoshiarpur)', 'GIL', 'Gilzian, Hoshiarpur', 'Tanda-Gilzian Highway, Gilzian, Hoshiarpur, Punjab', '+91 1886 271220', 'Mr. Harvinder Singh', 2008, 0, 0),
  ('branch-urban-estate', 'DIPS School, Urban Estate Phase-1', 'UE-1', 'Jalandhar', 'Phase-1, Urban Estate, Jalandhar, Punjab', '+91 181 2284900', 'Dr. Gurveen Kaur', 2001, 0, 0),
  ('branch-suranussi', 'DIPS School, Suranussi', 'SUR', 'Suranussi, Jalandhar', 'GT Road, Suranussi, Jalandhar, Punjab', '+91 181 2671200', 'Mrs. Bela Kapoor', 2002, 0, 0),
  ('branch-karol-bagh', 'DIPS School, Karol Bagh', 'KB', 'Karol Bagh, Jalandhar', 'Karol Bagh, Jalandhar, Punjab', '+91 181 2401500', 'Mrs. Rajeshwari', 2003, 0, 0),
  ('branch-blooming-dales', 'DIPS Blooming Dales Public School', 'BDPS', 'Begowal, Kapurthala', 'Blooming Dales Campus, Begowal, Punjab', '+91 1822 245200', 'Mrs. Gurmeet Kaur', 2000, 0, 0),
  ('branch-bhogpur', 'DIPS School, Bhogpur', 'BHG', 'Bhogpur, Jalandhar', 'Main GT Road, Bhogpur, Punjab', '+91 181 272300', 'Mrs. Raminder Kaur', 2005, 0, 0),
  ('branch-mehatpur', 'DIPS School, Mehatpur', 'MHT-JAL', 'Mehatpur, Jalandhar', 'Nakodar-Mehatpur Road, Mehatpur, Punjab', '+91 1821 240300', 'Mrs. Ritu Pathak', 2012, 0, 0),
  ('branch-nurmahal', 'DIPS School, Nurmahal', 'NUR', 'Nurmahal, Jalandhar', 'Kot Badal Khan Road, Nurmahal, Punjab', '+91 1826 244510', 'Mrs. Ritu Pathak', 2011, 0, 0),
  ('branch-uggi', 'DIPS School, Uggi', 'UGG', 'Uggi, Jalandhar', 'Nakodar-Kapurthala Road, Uggi, Punjab', '+91 1821 255100', 'Mrs. Ravinder Kaur', 2013, 0, 0),
  ('branch-batala', 'DIPS School, Batala (Gurdaspur)', 'BAT', 'Batala, Gurdaspur', 'Aliwal Road, Batala, Gurdaspur, Punjab', '+91 1871 245600', 'Mrs. Maninder Kaur', 2010, 0, 0),
  ('branch-begowal', 'DIPS School, Begowal (Kapurthala)', 'BEG', 'Begowal, Kapurthala', 'Near Main GT Road, Begowal, Punjab', '+91 1822 245100', 'Mrs. Jaswinder Kaur', 2004, 0, 0),
  ('branch-dhilwan', 'DIPS School, Dhilwan (Kapurthala)', 'DHL', 'Dhilwan, Kapurthala', 'GT Road, Dhilwan, Kapurthala, Punjab', '+91 1822 274100', 'Mrs. Shanti Sharma', 2010, 0, 0),
  ('branch-hariana', 'DIPS School, Hariana (Hoshiarpur)', 'HAR', 'Hariana, Hoshiarpur', 'Hariana-Hoshiarpur Road, Hariana, Punjab', '+91 1886 250300', 'Mrs. Monica Sachdeva', 2011, 0, 0),
  ('branch-kapurthala', 'DIPS School, Kapurthala', 'KAP', 'Kapurthala', 'Sultanpur Road, Kapurthala, Punjab', '+91 1822 233400', 'Mrs. Radha Rani', 2008, 0, 0),
  ('branch-mehta-chowk', 'DIPS School, Mehta Chowk (Amritsar)', 'MHT-ASR', 'Mehta Chowk, Amritsar', 'Mehta Chowk Highway, Amritsar, Punjab', '+91 183 277200', 'Mrs. Pankaj Sharma', 2006, 0, 0),
  ('branch-rayya', 'DIPS School, Rayya (Amritsar)', 'RAY', 'Rayya, Amritsar', 'GT Road, Rayya, Amritsar, Punjab', '+91 183 248900', 'Mrs. Jagwinder Kaur', 2008, 0, 0),
  ('branch-tanda', 'DIPS School, Tanda (Hoshiarpur)', 'TAN', 'Tanda, Hoshiarpur', 'Near Bus Stand, Urmar Tanda, Punjab', '+91 1886 223400', 'Mrs. Seema Sharma', 2014, 0, 0)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  code = EXCLUDED.code,
  city = EXCLUDED.city,
  address = EXCLUDED.address,
  phone = EXCLUDED.phone,
  principal_name = EXCLUDED.principal_name,
  established_year = EXCLUDED.established_year;

-- ==============================================================================
-- 2. SEED ALL 16 ACADEMIC CLASSES (Pre-Nursery through Class XII with Streams)
-- ==============================================================================
INSERT INTO public.classes (id, name, code, sort_order, sections)
VALUES
  ('class-pre-nursery', 'Pre-Nursery', 'Pre-Nur', -2, ARRAY['A', 'B']),
  ('class-nursery', 'Nursery', 'Nur', -1, ARRAY['A', 'B']),
  ('class-lkg', 'LKG', 'LKG', 0, ARRAY['A', 'B']),
  ('class-ukg', 'UKG', 'UKG', 0.5, ARRAY['A', 'B']),
  ('class-1', 'Class I', 'I', 1, ARRAY['A', 'B', 'C']),
  ('class-2', 'Class II', 'II', 2, ARRAY['A', 'B', 'C']),
  ('class-3', 'Class III', 'III', 3, ARRAY['A', 'B', 'C']),
  ('class-4', 'Class IV', 'IV', 4, ARRAY['A', 'B', 'C']),
  ('class-5', 'Class V', 'V', 5, ARRAY['A', 'B', 'C']),
  ('class-6', 'Class VI', 'VI', 6, ARRAY['A', 'B', 'C']),
  ('class-7', 'Class VII', 'VII', 7, ARRAY['A', 'B', 'C']),
  ('class-8', 'Class VIII', 'VIII', 8, ARRAY['A', 'B', 'C']),
  ('class-9', 'Class IX', 'IX', 9, ARRAY['A', 'B', 'C', 'D']),
  ('class-10', 'Class X', 'X', 10, ARRAY['A', 'B', 'C', 'D']),
  ('class-11', 'Class XI', 'Class XI (Science / Commerce / Humanities / Vocational)', 11, ARRAY['Science', 'Commerce', 'Humanities', 'Vocational']),
  ('class-12', 'Class XII', 'Class XII (Science / Commerce / Humanities / Vocational)', 12, ARRAY['Science', 'Commerce', 'Humanities', 'Vocational'])
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  code = EXCLUDED.code,
  sort_order = EXCLUDED.sort_order,
  sections = EXCLUDED.sections;

-- ==============================================================================
-- 3. SEED ALL 27 SUBJECTS (Pre-Primary, Primary, Middle, Secondary, Senior Secondary)
-- ==============================================================================
INSERT INTO public.subjects (id, name, code, department, applicable_classes, description)
VALUES
  ('sub-eng-pp', 'English', 'ENG', 'Languages', ARRAY['class-pre-nursery', 'class-nursery', 'class-lkg', 'class-ukg', 'class-1', 'class-2', 'class-3', 'class-4', 'class-5', 'class-6', 'class-7', 'class-8', 'class-9', 'class-10'], 'English Alphabet, Phonics, Vocabulary, Reading, and Grammar.'),
  ('sub-hindi', 'Hindi', 'HINDI', 'Languages', ARRAY['class-pre-nursery', 'class-nursery', 'class-lkg', 'class-ukg', 'class-1', 'class-2', 'class-3', 'class-4', 'class-5', 'class-6', 'class-7', 'class-8', 'class-9', 'class-10'], 'Hindi Varnmala, Shabd Gyan, Vyakaran, and Literature.'),
  ('sub-punjabi', 'Punjabi', 'PUN', 'Languages', ARRAY['class-6', 'class-7', 'class-8', 'class-9', 'class-10'], 'Punjabi Vyakaran, Reader, and Poetry for Punjab Board / CBSE standards.'),
  ('sub-math', 'Mathematics', 'MATH', 'Mathematics', ARRAY['class-pre-nursery', 'class-nursery', 'class-lkg', 'class-ukg', 'class-1', 'class-2', 'class-3', 'class-4', 'class-5', 'class-6', 'class-7', 'class-8', 'class-9', 'class-10'], 'Number work, Counting, Arithmetic, Algebra, Geometry, and Advanced Mathematics.'),
  ('sub-evs', 'Environmental Studies (EVS)', 'EVS', 'Sciences', ARRAY['class-1', 'class-2', 'class-3', 'class-4', 'class-5'], 'Surroundings, Nature, Health, and Basic Science concepts for Primary classes.'),
  ('sub-sci', 'Science', 'SCI', 'Sciences', ARRAY['class-6', 'class-7', 'class-8', 'class-9', 'class-10'], 'General Science covering Physics, Chemistry, and Life Sciences.'),
  ('sub-sst', 'Social Science', 'SST', 'Social Studies', ARRAY['class-6', 'class-7', 'class-8', 'class-9', 'class-10'], 'History, Civics, Geography, Economics, and Disaster Management.'),
  ('sub-computer', 'Computer / ICT / IT', 'ICT', 'Information Technology', ARRAY['class-1', 'class-2', 'class-3', 'class-4', 'class-5', 'class-6', 'class-7', 'class-8', 'class-9', 'class-10'], 'Computer basics, MS Office, coding fundamentals, and Information Technology.'),
  ('sub-gk', 'General Knowledge', 'GK', 'General Studies', ARRAY['class-1', 'class-2', 'class-3', 'class-4', 'class-5', 'class-6', 'class-7', 'class-8'], 'World facts, current affairs, and general awareness.'),
  ('sub-art', 'Art & Craft / Art Education', 'ART', 'Creative Arts', ARRAY['class-pre-nursery', 'class-nursery', 'class-lkg', 'class-ukg', 'class-1', 'class-2', 'class-3', 'class-4', 'class-5', 'class-6', 'class-7', 'class-8', 'class-9', 'class-10'], 'Drawing, sketching, coloring, craft work, and fine arts.'),
  ('sub-music', 'Music', 'MUSIC', 'Creative Arts', ARRAY['class-1', 'class-2', 'class-3', 'class-4', 'class-5'], 'Vocal, rhythm, and school prayer/anthem training.'),
  ('sub-pe', 'Physical Education and Well-being', 'PE', 'Sports', ARRAY['class-1', 'class-2', 'class-3', 'class-4', 'class-5', 'class-6', 'class-7', 'class-8', 'class-9', 'class-10', 'class-11', 'class-12'], 'Sports, yoga, physical fitness, and mental well-being.'),
  ('sub-skill', 'Skill Education / Skill Module', 'SKILL', 'Vocational', ARRAY['class-6', 'class-7', 'class-8', 'class-11', 'class-12'], 'Vocational training, skill modules, and hands-on professional learning.'),
  ('sub-ai', 'Computational Thinking & AI (CT & AI)', 'AI', 'Information Technology', ARRAY['class-9', 'class-10'], 'Artificial Intelligence, machine learning basics, and computational thinking.'),
  ('sub-eng-core', 'English Core', 'ENG-CORE', 'Languages', ARRAY['class-11', 'class-12'], 'Advanced English Literature, Writing Skills, and Comprehension for Senior Secondary.'),
  ('sub-phy', 'Physics', 'PHY', 'Sciences', ARRAY['class-11', 'class-12'], 'Mechanics, Optics, Thermodynamics, Electromagnetism, and Modern Physics.'),
  ('sub-chem', 'Chemistry', 'CHEM', 'Sciences', ARRAY['class-11', 'class-12'], 'Physical, Organic, and Inorganic Chemistry CBSE Curriculum.'),
  ('sub-bio', 'Biology', 'BIO', 'Sciences', ARRAY['class-11', 'class-12'], 'Botany, Zoology, Genetics, Biotechnology, and Human Physiology.'),
  ('sub-cs-sr', 'Computer Science', 'CS', 'Information Technology', ARRAY['class-11', 'class-12'], 'Python programming, data structures, SQL databases, and computer networks.'),
  ('sub-ip', 'Informatics Practices', 'IP', 'Information Technology', ARRAY['class-11', 'class-12'], 'Pandas, Matplotlib, MySQL, and internet security.'),
  ('sub-biotech', 'Biotechnology', 'BIOTECH', 'Sciences', ARRAY['class-11', 'class-12'], 'Recombinant DNA technology, protein structure, and bioinformatics.'),
  ('sub-psych', 'Psychology', 'PSYCH', 'Humanities', ARRAY['class-11', 'class-12'], 'Human behavior, cognitive processes, mental health, and psychological disorders.'),
  ('sub-eco', 'Economics', 'ECO', 'Commerce & Humanities', ARRAY['class-11', 'class-12'], 'Microeconomics, Macroeconomics, and Indian Economic Development.'),
  ('sub-applied-math', 'Applied Mathematics', 'APPL-MATH', 'Mathematics', ARRAY['class-11', 'class-12'], 'Financial mathematics, calculus, probability, and statistics.'),
  ('sub-acc', 'Accountancy', 'ACC', 'Commerce', ARRAY['class-11', 'class-12'], 'Financial accounting, partnership accounts, company accounts, and financial statement analysis.'),
  ('sub-bs', 'Business Studies', 'BS', 'Commerce', ARRAY['class-11', 'class-12'], 'Principles of management, business finance, marketing, and entrepreneurship.'),
  ('sub-entre', 'Entrepreneurship', 'ENTRE', 'Commerce & Humanities', ARRAY['class-11', 'class-12'], 'Business planning, resource mobilization, enterprise creation, and market dynamics.'),
  ('sub-history', 'History', 'HIST', 'Humanities', ARRAY['class-11', 'class-12'], 'Ancient, medieval, and modern world history, Indian history, and cultural heritage.'),
  ('sub-pol-sci', 'Political Science', 'POL-SCI', 'Humanities', ARRAY['class-11', 'class-12'], 'Indian constitution, political theory, international relations, and global politics.'),
  ('sub-geog', 'Geography', 'GEOG', 'Humanities', ARRAY['class-11', 'class-12'], 'Physical geography, human geography, India physical environment, and map work.'),
  ('sub-socio', 'Sociology', 'SOCIO', 'Humanities', ARRAY['class-11', 'class-12'], 'Indian society, social change, social institutions, and stratification.'),
  ('sub-legal', 'Legal Studies', 'LEGAL', 'Humanities', ARRAY['class-11', 'class-12'], 'Judiciary, law of property, contracts, torts, and criminal law in India.'),
  ('sub-fine-arts', 'Fine Arts / Painting', 'ARTS', 'Creative Arts', ARRAY['class-11', 'class-12'], 'History of Indian art, painting techniques, sculpture, and practical aesthetics.'),
  ('sub-home-sci', 'Home Science', 'HOME-SCI', 'Humanities', ARRAY['class-11', 'class-12'], 'Food science, nutrition, human development, fabric & apparel, and resource management.')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  code = EXCLUDED.code,
  department = EXCLUDED.department,
  applicable_classes = EXCLUDED.applicable_classes,
  description = EXCLUDED.description;

-- ==============================================================================
-- 4. SEED SUPER ADMIN AND FACULTY LOGINS
-- ==============================================================================
-- Super Admin: dipsbegowal@gmail.com | Password: dips@1630502
INSERT INTO public.users (id, username, email, full_name, role, branch_id, branch_name, phone, password_hash)
VALUES (
  'user-admin-begowal',
  'dipsbegowal@gmail.com',
  'dipsbegowal@gmail.com',
  'DIPS Central Admin (Begowal)',
  'admin',
  'branch-begowal',
  'DIPS School, Begowal (Kapurthala)',
  '+91 1822 245100',
  'a8bf76b701e20cf0c59bc46940f520c78271c198462079480abb04baadcb9d25'
)
ON CONFLICT (username) DO NOTHING;

-- Demo Teacher: Begowal Campus | Password: Teacher@123
INSERT INTO public.users (id, username, email, full_name, role, branch_id, branch_name, employee_id, designation, assigned_subject_ids, assigned_class_ids, phone, password_hash)
VALUES (
  'user-teacher-begowal',
  'teacher.begowal@dips.edu',
  'teacher.begowal@dips.edu',
  'Harpreet Kaur (Maths Faculty)',
  'teacher',
  'branch-begowal',
  'DIPS School, Begowal (Kapurthala)',
  'TCH-BEG-01',
  'Senior Mathematics Teacher',
  ARRAY['sub-math'],
  ARRAY['class-7', 'class-8', 'class-9'],
  '+91 98140 12345',
  'd041c3d3ca4ed64c5b54c5d807bd9a0bd2d6ae3609ecd2d06ac383db449360e1'
)
ON CONFLICT (username) DO NOTHING;

-- Demo Teacher: Urban Estate Jalandhar | Password: Teacher@123
INSERT INTO public.users (id, username, email, full_name, role, branch_id, branch_name, employee_id, designation, assigned_subject_ids, assigned_class_ids, phone, password_hash)
VALUES (
  'user-teacher-jalandhar',
  'teacher.jalandhar@dips.edu',
  'teacher.jalandhar@dips.edu',
  'Gurpreet Singh (Science Faculty)',
  'teacher',
  'branch-urban-estate',
  'DIPS School, Urban Estate Phase-1',
  'TCH-JAL-02',
  'Head of Science Department',
  ARRAY['sub-sci', 'sub-cs-sr'],
  ARRAY['class-7', 'class-8', 'class-10'],
  '+91 98141 54321',
  'd041c3d3ca4ed64c5b54c5d807bd9a0bd2d6ae3609ecd2d06ac383db449360e1'
)
ON CONFLICT (username) DO NOTHING;

-- Demo Teacher: Suranussi | Password: Teacher@123
INSERT INTO public.users (id, username, email, full_name, role, branch_id, branch_name, employee_id, designation, assigned_subject_ids, assigned_class_ids, phone, password_hash)
VALUES (
  'user-teacher-suranussi',
  'teacher.suranussi@dips.edu',
  'teacher.suranussi@dips.edu',
  'Bela Kapoor (English Faculty)',
  'teacher',
  'branch-suranussi',
  'DIPS School, Suranussi',
  'TCH-SUR-03',
  'Senior English Lecturer',
  ARRAY['sub-eng-core', 'sub-eng-pp'],
  ARRAY['class-9', 'class-10', 'class-11', 'class-12'],
  '+91 181 2671200',
  'd041c3d3ca4ed64c5b54c5d807bd9a0bd2d6ae3609ecd2d06ac383db449360e1'
)
ON CONFLICT (username) DO NOTHING;

-- 5. Welcome Announcement
INSERT INTO public.announcements (id, title, content, priority, target_role, author_name, author_role)
VALUES (
  'anc-welcome-2026',
  'Central Academic Sharing Portal Live for All 19 DIPS Branches',
  'Welcome to the unified DIPS institutions curriculum platform. Teachers from all 19 branches can now upload, access, and review verified lesson materials and worksheets across all grades and streams.',
  'high',
  'all',
  'DIPS Begowal Administration',
  'Super Admin'
)
ON CONFLICT (id) DO NOTHING;
