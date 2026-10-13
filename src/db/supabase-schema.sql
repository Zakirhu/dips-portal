-- ==============================================================================
-- LEARN WITH ZAKIR - SUPABASE POSTGRESQL DATABASE SCHEMA
-- Compatible with Supabase & Render Deployment
-- ==============================================================================

-- Enable UUID generation extension if not present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Student Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    class_level TEXT NOT NULL CHECK (class_level IN ('VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII')),
    avatar_seed TEXT DEFAULT 'Scholar',
    target_exam_year TEXT DEFAULT '2026',
    enrolled_subjects TEXT[] DEFAULT ARRAY['it-402', 'ip-065']::TEXT[],
    bookmarks TEXT[] DEFAULT ARRAY[]::TEXT[],
    bookmarked_questions TEXT[] DEFAULT ARRAY[]::TEXT[],
    badges JSONB DEFAULT '[]'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Quiz Attempts & Assessment Records Table
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
    id TEXT PRIMARY KEY,
    user_email TEXT NOT NULL,
    quiz_id TEXT NOT NULL,
    quiz_title TEXT NOT NULL,
    class_level TEXT NOT NULL,
    subject_id TEXT NOT NULL,
    chapter_title TEXT NOT NULL,
    mode TEXT NOT NULL CHECK (mode IN ('practice', 'exam', 'flashcards')),
    score NUMERIC NOT NULL,
    total_marks NUMERIC NOT NULL,
    percentage NUMERIC NOT NULL,
    time_spent_seconds INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    correct_answers_count INTEGER NOT NULL,
    user_answers JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Student Doubts & Query Portal Table
CREATE TABLE IF NOT EXISTS public.doubt_queries (
    id TEXT PRIMARY KEY,
    student_name TEXT NOT NULL,
    student_class TEXT NOT NULL,
    subject TEXT NOT NULL,
    topic TEXT NOT NULL,
    query TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'replied')),
    reply TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Virtual Study Room Messages Table
CREATE TABLE IF NOT EXISTS public.study_room_messages (
    id TEXT PRIMARY KEY,
    room_id TEXT NOT NULL,
    author_name TEXT NOT NULL,
    author_class TEXT NOT NULL,
    author_avatar TEXT,
    text TEXT NOT NULL,
    code_snippet TEXT,
    is_question BOOLEAN DEFAULT FALSE,
    likes INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_email ON public.quiz_attempts(user_email);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_class_subject ON public.quiz_attempts(class_level, subject_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_percentage ON public.quiz_attempts(percentage DESC);
CREATE INDEX IF NOT EXISTS idx_doubt_queries_created_at ON public.doubt_queries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_study_room_messages_room ON public.study_room_messages(room_id, created_at ASC);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doubt_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_room_messages ENABLE ROW LEVEL SECURITY;

-- Allow public read/write access for public educational applet access (or link with Supabase Auth)
CREATE POLICY "Public Read Access for Profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public Upsert Access for Profiles" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Access for Profiles" ON public.profiles FOR UPDATE USING (true);

CREATE POLICY "Public Read Access for Quiz Attempts" ON public.quiz_attempts FOR SELECT USING (true);
CREATE POLICY "Public Insert Access for Quiz Attempts" ON public.quiz_attempts FOR INSERT WITH CHECK (true);

CREATE POLICY "Public Read Access for Doubt Queries" ON public.doubt_queries FOR SELECT USING (true);
CREATE POLICY "Public Insert Access for Doubt Queries" ON public.doubt_queries FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Access for Doubt Queries" ON public.doubt_queries FOR UPDATE USING (true);

CREATE POLICY "Public Read Access for Study Messages" ON public.study_room_messages FOR SELECT USING (true);
CREATE POLICY "Public Insert Access for Study Messages" ON public.study_room_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Access for Study Messages" ON public.study_room_messages FOR UPDATE USING (true);

-- ==============================================================================
-- SEED INITIAL MOCK DATA (OPTIONAL)
-- ==============================================================================
INSERT INTO public.doubt_queries (id, student_name, student_class, subject, topic, query, status, reply, created_at)
VALUES 
('doubt-1', 'Aarav Sharma', 'X', 'Information Technology (402)', 'Digital Documentation', 'What is the exact difference between Character Style and Paragraph Style in LibreOffice Writer?', 'replied', 'Character styles apply formatting (font, size, color) to selected words or characters inside a line, whereas Paragraph styles apply to the entire paragraph including line spacing, alignment, and borders.', NOW() - INTERVAL '2 hours'),
('doubt-2', 'Priya Verma', 'XII', 'Informatics Practices (065)', 'SQL & Aggregate Functions', 'Why cannot we write WHERE count(*) > 5 in a SQL query?', 'replied', 'WHERE clause filters individual records before grouping occurs. To filter groups based on aggregate results (like COUNT, SUM, AVG), you must use the HAVING clause following GROUP BY.', NOW() - INTERVAL '4 hours')
ON CONFLICT (id) DO NOTHING;
