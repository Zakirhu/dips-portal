import React, { useState, useRef, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { 
  ShieldCheck, 
  PlusCircle, 
  Upload, 
  CheckCircle2, 
  Trash2, 
  Layers, 
  FileText, 
  HelpCircle, 
  Eye, 
  Clock,
  Sparkles, 
  BookOpen, 
  Laptop, 
  Check, 
  ToggleLeft, 
  ToggleRight, 
  Search, 
  Users, 
  Award, 
  BarChart, 
  ArrowLeft, 
  AlertCircle, 
  FileSpreadsheet, 
  UserPlus, 
  Download, 
  X, 
  RefreshCw, 
  UserCheck,
  Edit3,
  ArrowUp,
  ArrowDown,
  Filter,
  Calendar,
  Lock,
  Unlock,
  Play,
  AlertTriangle,
  FileCheck,
  Key,
  School,
  ExternalLink,
  SlidersHorizontal,
  GraduationCap,
  Monitor,
  RotateCcw,
  Copy,
  TrendingUp,
  TrendingDown,
  Target,
  PieChart,
  Printer,
  FileDown,
  Database,
  Activity,
  Server,
  Globe,
  UploadCloud
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { 
  ClassLevel, 
  SubjectId, 
  MaterialType, 
  StudyMaterial,
  Question, 
  QuestionDifficulty, 
  SubjectInfo, 
  Chapter,
  UserAccount,
  LabExamConfig,
  LabExamStatus,
  LabExamQuestion,
  LabExamStudentSession,
  QuizAttempt,
  LearningResource,
  ChapterResourceType
} from '../../types';
import { SEO } from '../SEO';
import { ChapterPdfUploader } from '../ChapterPdfUploader';
import { PdfMcqExtractorModal } from '../PdfMcqExtractorModal';
import { PYQPdfUploaderModal } from '../PYQPdfUploaderModal';
import { LmsResourceFormModal } from '../lms/LmsResourceFormModal';
import { 
  testSupabaseConnection, 
  isSupabaseConfigured, 
  getSupabaseConfig, 
  SupabaseTestResult,
  syncAllAppDataToSupabase
} from '../../lib/supabase';

interface AdminPanelViewProps {
  onBackToHome?: () => void;
}

type AdminModuleTab = 
  | 'classes' 
  | 'subjects' 
  | 'chapters' 
  | 'resources'
  | 'materials' 
  | 'students' 
  | 'tests' 
  | 'results' 
  | 'overview';

export const AdminPanelView: React.FC<AdminPanelViewProps> = ({ onBackToHome }) => {
  const { 
    currentUser,
    userRole,
    openAuthModal,
    customClasses,
    addCustomClass,
    updateCustomClass,
    deleteCustomClass,
    reorderClasses,
    customSubjects,
    addCustomSubject,
    updateCustomSubject,
    deleteCustomSubject,
    reorderSubjects,
    customChapters,
    addCustomChapter,
    updateCustomChapter,
    deleteCustomChapter,
    reorderChapters,
    learningResources,
    reorderLearningResources,
    togglePublishLearningResource,
    deleteLearningResource,
    studyMaterials, 
    addStudyMaterial, 
    updateStudyMaterial,
    replaceStudyMaterial,
    deleteStudyMaterial, 
    togglePublishMaterial,
    questionBank,
    registeredStudents,
    addStudentManually,
    addStudentsBulk,
    updateStudent,
    deleteStudent,
    toggleStudentLock,
    setStudentPassword,
    sendSupabaseResetEmail,
    labExams,
    createLabExam,
    updateLabExam,
    deleteLabExam,
    duplicateLabExam,
    setLabExamStatus,
    quizAttempts,
    labExamSessions,
    evaluateLabExamSession,
    reopenLabExamForStudent,
    releaseExamResults,
    quizzes,
    doubts,
    academicSessions,
    pyqPapers,
    notifications,
    syncStoreToBackend
  } = useApp();

  // Active Module State
  const [activeTab, setActiveTab] = useState<AdminModuleTab>('overview');

  // Notification Toast State
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Supabase Live Connectivity & Diagnostics State
  const [supabaseTesting, setSupabaseTesting] = useState(false);
  const [supabaseSyncing, setSupabaseSyncing] = useState(false);
  const [supabaseTestResult, setSupabaseTestResult] = useState<SupabaseTestResult | null>(null);
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const handleTestSupabase = async () => {
    setSupabaseTesting(true);
    try {
      const res = await testSupabaseConnection();
      setSupabaseTestResult(res);
      if (res.connected) {
        showToast(`Supabase Connected! Ping: ${res.latencyMs}ms (${Object.values(res.tables).filter(t => t.ok).length}/12 tables)`, 'success');
      } else {
        showToast(res.message || 'Supabase check failed.', 'error');
      }
    } catch (err: any) {
      showToast(err?.message || 'Error executing Supabase test.', 'error');
    } finally {
      setSupabaseTesting(false);
    }
  };

  const handleSyncAllToSupabase = async () => {
    setSupabaseSyncing(true);
    try {
      const res = await syncAllAppDataToSupabase({
        classes: customClasses,
        subjects: customSubjects,
        chapters: customChapters,
        learningResources,
        studyMaterials,
        questionBank,
        quizzes,
        tests: labExams,
        students: registeredStudents,
        attempts: quizAttempts,
        doubts,
        labSessions: labExamSessions,
        academicSessions,
        pyqPapers,
        notifications
      });
      if (res.success) {
        showToast(res.message, 'success');
        const refreshed = await testSupabaseConnection();
        setSupabaseTestResult(refreshed);
      } else {
        showToast(res.message, 'error');
      }
    } catch (err: any) {
      showToast(err?.message || 'Failed to save all data to Supabase.', 'error');
    } finally {
      setSupabaseSyncing(false);
    }
  };

  const fullSupabaseSqlScript = `-- ====================================================================
-- LEARN WITH ZAKIR - COMPLETE SUPABASE DATABASE PERSISTENCE SCHEMA
-- Run this entire script in Supabase SQL Editor (SQL Editor -> New Query)
-- ====================================================================

-- 1. Create pdf_chapters table for uploaded chapter resources and MCQs
create table if not exists public.pdf_chapters (
    id text primary key,
    file_name text not null,
    class_level text not null,
    subject_id text not null,
    chapter_title text not null,
    question_count integer default 0,
    extracted_questions jsonb default '[]'::jsonb,
    pdf_data_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create learning_resources table (All LMS chapter resources, notes, assignments)
create table if not exists public.learning_resources (
    id text primary key,
    title text not null,
    description text default '',
    resource_type text not null,
    class_level text not null,
    subject_id text not null,
    chapter_id text not null,
    chapter_title text default '',
    published boolean default true,
    uploaded_date text,
    "order" integer default 1,
    file_name text,
    file_size text,
    file_url text,
    page_count integer,
    content text,
    qa_items jsonb default '[]'::jsonb,
    mcq_items jsonb default '[]'::jsonb,
    test_duration_minutes integer,
    total_marks integer,
    passing_marks integer,
    author text default 'Zakir Hussain',
    tags jsonb default '[]'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create study_materials table
create table if not exists public.study_materials (
    id text primary key,
    class_level text not null,
    subject_id text not null,
    chapter_id text not null,
    chapter_title text not null,
    title text not null,
    type text not null,
    description text default '',
    read_time_minutes integer default 5,
    uploaded_date text,
    author text default 'Zakir Hussain',
    content text default '',
    downloadable_file_name text,
    pdf_data_url text,
    tags jsonb default '[]'::jsonb,
    published boolean default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Create quizzes table
create table if not exists public.quizzes (
    id text primary key,
    title text not null,
    class_level text not null,
    subject_id text not null,
    chapter_id text,
    chapter_title text,
    mode text default 'practice',
    time_limit_minutes integer default 15,
    total_marks integer default 20,
    questions_count integer default 10,
    difficulty text default 'all',
    questions jsonb default '[]'::jsonb,
    description text default '',
    published boolean default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Create question_bank table
create table if not exists public.question_bank (
    id text primary key,
    class_level text not null,
    subject_id text not null,
    chapter_id text not null,
    chapter_title text not null,
    question text not null,
    type text default 'mcq',
    difficulty text default 'medium',
    marks integer default 1,
    options jsonb default '[]'::jsonb,
    correct_option_index integer default 0,
    correct_answer_text text,
    explanation text default '',
    published boolean default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Create quiz_attempts table
create table if not exists public.quiz_attempts (
    id text primary key,
    user_email text,
    student_id text,
    quiz_id text,
    quiz_title text,
    class_level text,
    subject_id text,
    chapter_title text,
    mode text,
    score integer,
    total_marks integer,
    percentage numeric,
    time_spent_seconds integer,
    total_questions integer,
    correct_answers_count integer,
    user_answers jsonb default '{}'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Create doubt_queries table
create table if not exists public.doubt_queries (
    id text primary key,
    student_name text,
    student_class text,
    subject text,
    topic text,
    query text,
    status text default 'pending',
    reply text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. Create user_logins audit table
create table if not exists public.user_logins (
    id serial primary key,
    user_id text,
    email text,
    name text,
    role text,
    class_level text,
    login_time timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. Create profiles table (Student & Admin Accounts)
create table if not exists public.profiles (
    email text primary key,
    name text,
    class_level text,
    student_id text,
    school_name text,
    target_exam_year text,
    avatar_seed text,
    role text default 'student',
    enrolled_subjects jsonb default '[]'::jsonb,
    bookmarks jsonb default '[]'::jsonb,
    bookmarked_questions jsonb default '[]'::jsonb,
    badges jsonb default '[]'::jsonb,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 10. Create lab_exams table (Online Computer Lab Examination System)
create table if not exists public.lab_exams (
    id text primary key,
    title text not null,
    exam_code text not null,
    class_level text not null,
    subject_id text not null,
    academic_session_id text,
    duration_minutes integer default 45,
    total_marks integer default 25,
    passing_marks integer default 10,
    status text default 'published',
    questions jsonb default '[]'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 11. Create lab_exam_sessions table (Student Exam Submissions & Answers)
create table if not exists public.lab_exam_sessions (
    id text primary key,
    exam_id text not null,
    student_id text not null,
    student_name text,
    roll_number text,
    class_level text,
    workstation_ip text,
    status text default 'submitted',
    started_at text,
    submitted_at text,
    answers jsonb default '{}'::jsonb,
    auto_score numeric default 0,
    final_score numeric default 0,
    total_marks numeric default 25,
    percentage numeric default 0,
    passed boolean default false,
    is_evaluated boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 12. Create site_store table (Stores curriculum hierarchy, academic sessions, notices)
create table if not exists public.site_store (
    key text primary key,
    data jsonb not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS) on all 12 tables
alter table public.pdf_chapters enable row level security;
alter table public.learning_resources enable row level security;
alter table public.study_materials enable row level security;
alter table public.quizzes enable row level security;
alter table public.question_bank enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.doubt_queries enable row level security;
alter table public.user_logins enable row level security;
alter table public.profiles enable row level security;
alter table public.lab_exams enable row level security;
alter table public.lab_exam_sessions enable row level security;
alter table public.site_store enable row level security;

-- Drop and recreate permissive RLS policies for clean idempotent execution
drop policy if exists "Allow all access on pdf_chapters" on public.pdf_chapters;
drop policy if exists "Allow all access on learning_resources" on public.learning_resources;
drop policy if exists "Allow all access on study_materials" on public.study_materials;
drop policy if exists "Allow all access on quizzes" on public.quizzes;
drop policy if exists "Allow all access on question_bank" on public.question_bank;
drop policy if exists "Allow all access on quiz_attempts" on public.quiz_attempts;
drop policy if exists "Allow all access on doubt_queries" on public.doubt_queries;
drop policy if exists "Allow all access on user_logins" on public.user_logins;
drop policy if exists "Allow all access on profiles" on public.profiles;
drop policy if exists "Allow all access on lab_exams" on public.lab_exams;
drop policy if exists "Allow all access on lab_exam_sessions" on public.lab_exam_sessions;
drop policy if exists "Allow all access on site_store" on public.site_store;

create policy "Allow all access on pdf_chapters" on public.pdf_chapters for all using (true) with check (true);
create policy "Allow all access on learning_resources" on public.learning_resources for all using (true) with check (true);
create policy "Allow all access on study_materials" on public.study_materials for all using (true) with check (true);
create policy "Allow all access on quizzes" on public.quizzes for all using (true) with check (true);
create policy "Allow all access on question_bank" on public.question_bank for all using (true) with check (true);
create policy "Allow all access on quiz_attempts" on public.quiz_attempts for all using (true) with check (true);
create policy "Allow all access on doubt_queries" on public.doubt_queries for all using (true) with check (true);
create policy "Allow all access on user_logins" on public.user_logins for all using (true) with check (true);
create policy "Allow all access on profiles" on public.profiles for all using (true) with check (true);
create policy "Allow all access on lab_exams" on public.lab_exams for all using (true) with check (true);
create policy "Allow all access on lab_exam_sessions" on public.lab_exam_sessions for all using (true) with check (true);
create policy "Allow all access on site_store" on public.site_store for all using (true) with check (true);

-- Create Supabase Storage bucket for PDF materials
insert into storage.buckets (id, name, public)
values ('pdf-materials', 'pdf-materials', true)
on conflict (id) do update set public = true;

-- Storage bucket security policies for pdf-materials
drop policy if exists "Public Access to pdf-materials" on storage.objects;
drop policy if exists "Allow uploads to pdf-materials" on storage.objects;
drop policy if exists "Allow updates/deletes in pdf-materials" on storage.objects;

create policy "Public Access to pdf-materials"
on storage.objects for select
using ( bucket_id = 'pdf-materials' );

create policy "Allow uploads to pdf-materials"
on storage.objects for insert
with check ( bucket_id = 'pdf-materials' );

create policy "Allow updates/deletes in pdf-materials"
on storage.objects for update
using ( bucket_id = 'pdf-materials' );`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(fullSupabaseSqlScript);
    setCopiedSql(true);
    showToast('SQL Script copied to clipboard! Paste it into Supabase SQL Editor.', 'success');
    setTimeout(() => setCopiedSql(false), 3000);
  };

  // Reusable Confirmation Dialog State
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    dangerLevel?: 'danger' | 'warning';
    confirmLabel?: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    dangerLevel: 'danger',
    confirmLabel: 'Confirm Delete',
    onConfirm: () => {}
  });

  const openConfirm = (
    title: string, 
    message: string, 
    onConfirm: () => void, 
    dangerLevel: 'danger' | 'warning' = 'danger',
    confirmLabel = 'Delete Permanently'
  ) => {
    setConfirmDialog({
      isOpen: true,
      title,
      message,
      dangerLevel,
      confirmLabel,
      onConfirm: () => {
        onConfirm();
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // Quick Tools Modals
  const [showPdfExtractor, setShowPdfExtractor] = useState(false);
  const [showChapterPdfUploader, setShowChapterPdfUploader] = useState(false);
  const [showPyqModal, setShowPyqModal] = useState(false);

  // Sync state with backend database
  const [isSyncing, setIsSyncing] = useState(false);
  const handleSyncToBackend = async () => {
    setIsSyncing(true);
    try {
      await syncStoreToBackend();
      showToast('Database synchronization complete! All changes saved to server database.');
    } catch {
      showToast('Error syncing to server database', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  // ==========================================
  // MODULE 1: CLASS MANAGEMENT STATE & HANDLERS
  // ==========================================
  const [classSearch, setClassSearch] = useState('');
  const [classFilterStatus, setClassFilterStatus] = useState<'ALL' | 'active' | 'inactive'>('ALL');
  const [isAddClassModalOpen, setIsAddClassModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<{ level: string; name: string; subtitle: string } | null>(null);
  const [classFormData, setClassFormData] = useState({
    level: '',
    name: '',
    subtitle: '',
    isActive: true
  });

  const filteredClasses = useMemo(() => {
    return customClasses.filter(c => {
      const matchesSearch = 
        c.level.toLowerCase().includes(classSearch.toLowerCase()) || 
        c.name.toLowerCase().includes(classSearch.toLowerCase()) || 
        c.subtitle.toLowerCase().includes(classSearch.toLowerCase());
      
      const isActive = c.isActive !== false && c.isHidden !== true;
      if (classFilterStatus === 'active' && !isActive) return false;
      if (classFilterStatus === 'inactive' && isActive) return false;
      return matchesSearch;
    });
  }, [customClasses, classSearch, classFilterStatus]);

  const handleSaveClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classFormData.level.trim() || !classFormData.name.trim()) {
      showToast('Please enter both Class Level and Name.', 'error');
      return;
    }

    if (editingClass) {
      updateCustomClass(editingClass.level, {
        level: classFormData.level.trim().toUpperCase(),
        name: classFormData.name.trim(),
        subtitle: classFormData.subtitle.trim() || 'Curriculum Specialization',
        isActive: classFormData.isActive,
        isHidden: !classFormData.isActive
      });
      showToast(`Class ${classFormData.level} updated successfully!`);
      setEditingClass(null);
    } else {
      addCustomClass({
        level: classFormData.level.trim().toUpperCase(),
        name: classFormData.name.trim(),
        subtitle: classFormData.subtitle.trim() || 'Curriculum Specialization',
        order: customClasses.length + 1,
        isActive: classFormData.isActive,
        isHidden: !classFormData.isActive
      });
      showToast(`Class ${classFormData.level} created successfully!`);
      setIsAddClassModalOpen(false);
    }

    setClassFormData({ level: '', name: '', subtitle: '', isActive: true });
    handleSyncToBackend();
  };

  const handleDeleteClass = (level: string) => {
    // Check dependent items
    const studentsInClass = registeredStudents.filter(s => s.classLevel === level).length;
    const chaptersInClass = customChapters.filter(ch => ch.classLevel === level).length;

    let warningMsg = `Are you sure you want to permanently delete Class ${level}?`;
    if (studentsInClass > 0 || chaptersInClass > 0) {
      warningMsg = `Warning: Class ${level} has ${studentsInClass} student(s) and ${chaptersInClass} chapter(s) registered. Deleting this class will remove its access from students. Continue?`;
    }

    openConfirm(`Delete Class ${level}`, warningMsg, () => {
      deleteCustomClass(level);
      showToast(`Class ${level} deleted.`);
      handleSyncToBackend();
    });
  };

  const handleToggleClassActive = (cls: { level: string; isActive?: boolean; isHidden?: boolean }) => {
    const currentActive = cls.isActive !== false && cls.isHidden !== true;
    updateCustomClass(cls.level, {
      isActive: !currentActive,
      isHidden: currentActive
    });
    showToast(`Class ${cls.level} is now ${!currentActive ? 'Active' : 'Deactivated'}.`);
    handleSyncToBackend();
  };

  // ==========================================
  // MODULE 2: SUBJECT MANAGEMENT STATE & HANDLERS
  // ==========================================
  const [subSearch, setSubSearch] = useState('');
  const [subClassFilter, setSubClassFilter] = useState<ClassLevel | 'ALL'>('ALL');
  const [isAddSubjectModalOpen, setIsAddSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<SubjectInfo | null>(null);
  const [subFormData, setSubFormData] = useState<{
    id: string;
    code: string;
    name: string;
    classes: ClassLevel[];
    description: string;
    iconName: string;
    accentColor: string;
    isActive: boolean;
  }>({
    id: '',
    code: '',
    name: '',
    classes: ['X'],
    description: '',
    iconName: 'Laptop',
    accentColor: 'from-blue-600 to-indigo-600',
    isActive: true
  });

  const filteredSubjects = useMemo(() => {
    return customSubjects.filter(sub => {
      const matchesSearch = 
        sub.name.toLowerCase().includes(subSearch.toLowerCase()) || 
        sub.code.toLowerCase().includes(subSearch.toLowerCase()) ||
        sub.description.toLowerCase().includes(subSearch.toLowerCase());
      
      const matchesClass = subClassFilter === 'ALL' || sub.classes.includes(subClassFilter);
      return matchesSearch && matchesClass;
    });
  }, [customSubjects, subSearch, subClassFilter]);

  const handleSaveSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subFormData.name.trim() || !subFormData.code.trim()) {
      showToast('Please enter Subject Name and CBSE Code.', 'error');
      return;
    }
    if (subFormData.classes.length === 0) {
      showToast('Please assign at least one class to this subject.', 'error');
      return;
    }

    const targetId = editingSubject 
      ? editingSubject.id 
      : (subFormData.id.trim() || subFormData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'));

    const subjectPayload: SubjectInfo = {
      id: targetId,
      code: subFormData.code.trim(),
      name: subFormData.name.trim(),
      classes: subFormData.classes,
      description: subFormData.description.trim() || 'Curated CBSE Subject Curriculum',
      iconName: subFormData.iconName || 'Laptop',
      accentColor: subFormData.accentColor || 'from-blue-600 to-indigo-600',
      isActive: subFormData.isActive,
      isHidden: !subFormData.isActive
    };

    if (editingSubject) {
      updateCustomSubject(editingSubject.id, subjectPayload);
      showToast(`Subject ${subFormData.name} updated successfully!`);
      setEditingSubject(null);
    } else {
      addCustomSubject(subjectPayload);
      showToast(`Subject ${subFormData.name} (${subFormData.code}) added!`);
      setIsAddSubjectModalOpen(false);
    }

    setSubFormData({
      id: '',
      code: '',
      name: '',
      classes: ['X'],
      description: '',
      iconName: 'Laptop',
      accentColor: 'from-blue-600 to-indigo-600',
      isActive: true
    });
    handleSyncToBackend();
  };

  const handleDeleteSubject = (sub: SubjectInfo) => {
    const chaptersInSub = customChapters.filter(ch => ch.subjectId === sub.id).length;
    const materialsInSub = studyMaterials.filter(m => m.subjectId === sub.id).length;

    let warningMsg = `Are you sure you want to delete ${sub.name} (${sub.code})?`;
    if (chaptersInSub > 0 || materialsInSub > 0) {
      warningMsg = `Warning: ${sub.name} has ${chaptersInSub} chapter(s) and ${materialsInSub} study material(s) associated with it. Deleting will unassign these items.`;
    }

    openConfirm(`Delete Subject: ${sub.name}`, warningMsg, () => {
      deleteCustomSubject(sub.id);
      showToast(`Subject ${sub.name} removed.`);
      handleSyncToBackend();
    });
  };

  // ==========================================
  // MODULE 3: CHAPTER MANAGEMENT STATE & HANDLERS
  // ==========================================
  const [chapSearch, setChapSearch] = useState('');
  const [chapClassFilter, setChapClassFilter] = useState<ClassLevel | 'ALL'>('ALL');
  const [chapSubjectFilter, setChapSubjectFilter] = useState<SubjectId | 'ALL'>('ALL');
  const [isAddChapterModalOpen, setIsAddChapterModalOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [chapFormData, setChapFormData] = useState<{
    id: string;
    classLevel: ClassLevel;
    subjectId: SubjectId;
    chapterNumber: number;
    title: string;
    description: string;
    topics: string;
    isActive: boolean;
  }>({
    id: '',
    classLevel: 'X',
    subjectId: 'it-402',
    chapterNumber: 1,
    title: '',
    description: '',
    topics: '',
    isActive: true
  });

  const filteredChapters = useMemo(() => {
    return customChapters.filter(ch => {
      const matchesSearch = 
        ch.title.toLowerCase().includes(chapSearch.toLowerCase()) || 
        ch.description.toLowerCase().includes(chapSearch.toLowerCase());
      const matchesClass = chapClassFilter === 'ALL' || ch.classLevel === chapClassFilter;
      const matchesSubject = chapSubjectFilter === 'ALL' || ch.subjectId === chapSubjectFilter;
      return matchesSearch && matchesClass && matchesSubject;
    });
  }, [customChapters, chapSearch, chapClassFilter, chapSubjectFilter]);

  const handleSaveChapter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chapFormData.title.trim()) {
      showToast('Please enter a Chapter Title.', 'error');
      return;
    }

    const targetId = editingChapter 
      ? editingChapter.id 
      : `ch-${chapFormData.classLevel.toLowerCase()}-${chapFormData.subjectId}-${chapFormData.chapterNumber}-${Date.now()}`;

    const chapterPayload: Chapter = {
      id: targetId,
      classLevel: chapFormData.classLevel,
      subjectId: chapFormData.subjectId,
      chapterNumber: Number(chapFormData.chapterNumber) || 1,
      title: chapFormData.title.trim(),
      description: chapFormData.description.trim() || 'Comprehensive chapter curriculum',
      topics: chapFormData.topics ? chapFormData.topics.split(',').map(t => t.trim()).filter(Boolean) : [],
      order: Number(chapFormData.chapterNumber) || 1,
      isActive: chapFormData.isActive,
      isHidden: !chapFormData.isActive
    };

    if (editingChapter) {
      updateCustomChapter(editingChapter.id, chapterPayload);
      showToast(`Chapter ${chapFormData.chapterNumber}: "${chapFormData.title}" updated!`);
      setEditingChapter(null);
    } else {
      addCustomChapter(chapterPayload);
      showToast(`Chapter ${chapFormData.chapterNumber}: "${chapFormData.title}" created!`);
      setIsAddChapterModalOpen(false);
    }

    setChapFormData({
      id: '',
      classLevel: 'X',
      subjectId: 'it-402',
      chapterNumber: (customChapters.length + 1),
      title: '',
      description: '',
      topics: '',
      isActive: true
    });
    handleSyncToBackend();
  };

  // SAFETY GUARD ON CHAPTER DELETION
  const handleDeleteChapter = (ch: Chapter) => {
    const linkedMaterials = studyMaterials.filter(m => m.chapterId === ch.id || m.chapterTitle.toLowerCase() === ch.title.toLowerCase());
    const linkedQuestions = questionBank.filter(q => q.chapterId === ch.id || q.chapterTitle?.toLowerCase() === ch.title.toLowerCase());

    if (linkedMaterials.length > 0 || linkedQuestions.length > 0) {
      // PREVENT ACCIDENTAL DELETION OF CHAPTERS CONTAINING MATERIALS OR QUESTIONS
      openConfirm(
        `🛑 Accidental Deletion Blocked: "${ch.title}"`,
        `This chapter currently contains ${linkedMaterials.length} Study Material document(s) and ${linkedQuestions.length} Question Bank question(s).\n\nTo prevent catastrophic data loss for enrolled students, you must first reassign or delete the associated materials and test questions before removing this chapter.`,
        () => {},
        'warning',
        'Understood (Cancel)'
      );
      return;
    }

    openConfirm(
      `Delete Chapter: Ch ${ch.chapterNumber}`,
      `Are you sure you want to permanently delete Chapter ${ch.chapterNumber}: "${ch.title}"?`,
      () => {
        deleteCustomChapter(ch.id);
        showToast(`Chapter "${ch.title}" deleted.`);
        handleSyncToBackend();
      }
    );
  };

  // ==========================================
  // MODULE: CHAPTER LMS RESOURCES MANAGEMENT
  // ==========================================
  const [lmsResClassFilter, setLmsResClassFilter] = useState<ClassLevel | 'ALL'>('ALL');
  const [lmsResSubjectFilter, setLmsResSubjectFilter] = useState<SubjectId | 'ALL'>('ALL');
  const [lmsResChapterFilter, setLmsResChapterFilter] = useState<string | 'ALL'>('ALL');
  const [lmsResTypeFilter, setLmsResTypeFilter] = useState<ChapterResourceType | 'ALL'>('ALL');
  const [lmsResSearch, setLmsResSearch] = useState('');
  const [isLmsFormModalOpen, setIsLmsFormModalOpen] = useState(false);
  const [lmsResourceToEdit, setLmsResourceToEdit] = useState<LearningResource | null>(null);
  const [isLmsReplaceMode, setIsLmsReplaceMode] = useState(false);
  const [lmsResourceToDelete, setLmsResourceToDelete] = useState<LearningResource | null>(null);

  const filteredLmsResources = useMemo(() => {
    return learningResources.filter(res => {
      if (lmsResClassFilter !== 'ALL' && res.classLevel !== lmsResClassFilter) return false;
      if (lmsResSubjectFilter !== 'ALL' && res.subjectId !== lmsResSubjectFilter) return false;
      if (lmsResChapterFilter !== 'ALL' && res.chapterId !== lmsResChapterFilter) return false;
      if (lmsResTypeFilter !== 'ALL' && res.resourceType !== lmsResTypeFilter) return false;
      if (lmsResSearch.trim()) {
        const q = lmsResSearch.toLowerCase();
        const matchesTitle = res.title.toLowerCase().includes(q);
        const matchesDesc = res.description.toLowerCase().includes(q);
        const matchesChapter = res.chapterTitle?.toLowerCase().includes(q) ?? false;
        if (!matchesTitle && !matchesDesc && !matchesChapter) return false;
      }
      return true;
    }).sort((a, b) => a.order - b.order);
  }, [learningResources, lmsResClassFilter, lmsResSubjectFilter, lmsResChapterFilter, lmsResTypeFilter, lmsResSearch]);

  // ==========================================
  // MODULE 4: STUDY MATERIAL MANAGEMENT
  // ==========================================
  const [matSearch, setMatSearch] = useState('');
  const [matClassFilter, setMatClassFilter] = useState<ClassLevel | 'ALL'>('ALL');
  const [matSubjectFilter, setMatSubjectFilter] = useState<SubjectId | 'ALL'>('ALL');
  const [matTypeFilter, setMatTypeFilter] = useState<MaterialType | 'ALL'>('ALL');
  const [matPublishFilter, setMatPublishFilter] = useState<'ALL' | 'published' | 'draft'>('ALL');
  const [matCurrentPage, setMatCurrentPage] = useState(1);
  const MAT_PAGE_SIZE = 8;

  // Add & Edit Material Modal States
  const [isAddMaterialModalOpen, setIsAddMaterialModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<StudyMaterial | null>(null);
  const [replacingMaterial, setReplacingMaterial] = useState<StudyMaterial | null>(null);

  const [materialForm, setMaterialForm] = useState<{
    title: string;
    classLevel: ClassLevel;
    subjectId: SubjectId;
    chapterId: string;
    chapterTitle: string;
    type: MaterialType;
    description: string;
    readTimeMinutes: number;
    author: string;
    content: string;
    tags: string;
    downloadableFileName: string;
    pdfDataUrl?: string;
    published: boolean;
  }>({
    title: '',
    classLevel: 'X',
    subjectId: 'it-402',
    chapterId: '',
    chapterTitle: '',
    type: 'notes',
    description: '',
    readTimeMinutes: 15,
    author: 'Zakir Hussain (PGT Computer Science)',
    content: '',
    tags: 'CBSE, Notes, 2026',
    downloadableFileName: '',
    pdfDataUrl: undefined,
    published: true
  });

  const filteredMaterials = useMemo(() => {
    return studyMaterials.filter(m => {
      const matchesSearch = 
        m.title.toLowerCase().includes(matSearch.toLowerCase()) || 
        m.description.toLowerCase().includes(matSearch.toLowerCase()) ||
        m.tags.some(t => t.toLowerCase().includes(matSearch.toLowerCase()));
      
      const matchesClass = matClassFilter === 'ALL' || m.classLevel === matClassFilter;
      const matchesSubject = matSubjectFilter === 'ALL' || m.subjectId === matSubjectFilter;
      const matchesType = matTypeFilter === 'ALL' || m.type === matTypeFilter;
      
      const isPub = m.published !== false;
      const matchesPub = 
        matPublishFilter === 'ALL' || 
        (matPublishFilter === 'published' && isPub) || 
        (matPublishFilter === 'draft' && !isPub);

      return matchesSearch && matchesClass && matchesSubject && matchesType && matchesPub;
    });
  }, [studyMaterials, matSearch, matClassFilter, matSubjectFilter, matTypeFilter, matPublishFilter]);

  const pagedMaterials = useMemo(() => {
    const start = (matCurrentPage - 1) * MAT_PAGE_SIZE;
    return filteredMaterials.slice(start, start + MAT_PAGE_SIZE);
  }, [filteredMaterials, matCurrentPage]);

  const totalMaterialPages = Math.ceil(filteredMaterials.length / MAT_PAGE_SIZE) || 1;

  const handleSaveMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialForm.title.trim()) {
      showToast('Please enter a Material Title.', 'error');
      return;
    }

    const payload = {
      title: materialForm.title.trim(),
      classLevel: materialForm.classLevel,
      subjectId: materialForm.subjectId,
      chapterId: materialForm.chapterId || 'general-chapter',
      chapterTitle: materialForm.chapterTitle || 'Chapter Assessment',
      type: materialForm.type,
      description: materialForm.description.trim() || 'Comprehensive study material for CBSE students.',
      readTimeMinutes: Number(materialForm.readTimeMinutes) || 15,
      author: materialForm.author || 'Zakir Hussain (PGT CS)',
      content: materialForm.content.trim() || `# ${materialForm.title}\n\nComprehensive notes prepared for CBSE Class ${materialForm.classLevel}.`,
      tags: materialForm.tags.split(',').map(t => t.trim()).filter(Boolean),
      downloadableFileName: materialForm.downloadableFileName || `${materialForm.title.replace(/[^a-z0-9]/gi, '_')}.pdf`,
      pdfDataUrl: materialForm.pdfDataUrl,
      published: materialForm.published
    };

    if (editingMaterial) {
      updateStudyMaterial(editingMaterial.id, payload);
      showToast(`Material "${materialForm.title}" updated successfully!`);
      setEditingMaterial(null);
    } else {
      addStudyMaterial(payload);
      showToast(`New Material "${materialForm.title}" published!`);
      setIsAddMaterialModalOpen(false);
    }

    setMaterialForm({
      title: '',
      classLevel: 'X',
      subjectId: 'it-402',
      chapterId: '',
      chapterTitle: '',
      type: 'notes',
      description: '',
      readTimeMinutes: 15,
      author: 'Zakir Hussain (PGT Computer Science)',
      content: '',
      tags: 'CBSE, Notes, 2026',
      downloadableFileName: '',
      pdfDataUrl: undefined,
      published: true
    });
    handleSyncToBackend();
  };

  // Replacement file upload
  const replaceFileInputRef = useRef<HTMLInputElement>(null);
  const handleFileReplacement = (file: File) => {
    if (!replacingMaterial) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = typeof reader.result === 'string' ? reader.result : '';
      const sizeStr = `${(file.size / 1024).toFixed(1)} KB`;
      replaceStudyMaterial(replacingMaterial.id, {
        downloadableFileName: file.name,
        pdfDataUrl: base64,
        fileSize: sizeStr
      });
      showToast(`File replaced successfully with "${file.name}"!`);
      setReplacingMaterial(null);
      handleSyncToBackend();
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteMaterial = (mat: StudyMaterial) => {
    openConfirm(
      `Delete Material: "${mat.title}"`,
      `Are you sure you want to permanently delete this study material? Students will no longer be able to read or download this document.`,
      () => {
        deleteStudyMaterial(mat.id);
        showToast(`Material "${mat.title}" deleted.`);
        handleSyncToBackend();
      }
    );
  };

  // ==========================================
  // MODULE 5: STUDENT MANAGEMENT STATE & HANDLERS
  // ==========================================
  const [studentSearch, setStudentSearch] = useState('');
  const [studentClassFilter, setStudentClassFilter] = useState<ClassLevel | 'ALL'>('ALL');
  const [studentSectionFilter, setStudentSectionFilter] = useState<string>('ALL');
  const [studentStatusFilter, setStudentStatusFilter] = useState<'ALL' | 'active' | 'locked'>('ALL');
  const [studentCurrentPage, setStudentCurrentPage] = useState(1);
  const STUDENT_PAGE_SIZE = 10;

  // Add Student Manually Modal
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<UserAccount | null>(null);
  const [studentFormData, setStudentFormData] = useState<{
    name: string;
    username: string;
    rollNumber: string;
    email: string;
    studentId: string;
    classLevel: ClassLevel;
    section: string;
    schoolName: string;
    password: string;
  }>({
    name: '',
    username: '',
    rollNumber: '',
    email: '',
    studentId: '',
    classLevel: 'X',
    section: 'A',
    schoolName: 'Zakir Learning Hub Partner School',
    password: ''
  });

  // Reset Password Modal
  const [resetPasswordStudent, setResetPasswordStudent] = useState<UserAccount | null>(null);
  const [newPasswordValue, setNewPasswordValue] = useState('');

  // Bulk Excel Import State
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [parsedBulkStudents, setParsedBulkStudents] = useState<Array<{
    name: string;
    username?: string;
    rollNumber?: string;
    email: string;
    studentId: string;
    classLevel: ClassLevel;
    section?: string;
    schoolName?: string;
    password?: string;
  }>>([]);
  const [bulkError, setBulkError] = useState<string | null>(null);

  const filteredStudents = useMemo(() => {
    return registeredStudents.filter(st => {
      if (st.role === 'admin') return false; // exclude admin from student directory

      const matchesSearch = 
        st.name.toLowerCase().includes(studentSearch.toLowerCase()) || 
        st.email.toLowerCase().includes(studentSearch.toLowerCase()) || 
        (st.studentId && st.studentId.toLowerCase().includes(studentSearch.toLowerCase()));
      
      const matchesClass = studentClassFilter === 'ALL' || st.classLevel === studentClassFilter;
      const matchesSection = studentSectionFilter === 'ALL' || (st.section || 'A') === studentSectionFilter;
      
      const isLocked = st.isLocked === true;
      const matchesStatus = 
        studentStatusFilter === 'ALL' || 
        (studentStatusFilter === 'active' && !isLocked) || 
        (studentStatusFilter === 'locked' && isLocked);

      return matchesSearch && matchesClass && matchesSection && matchesStatus;
    });
  }, [registeredStudents, studentSearch, studentClassFilter, studentSectionFilter, studentStatusFilter]);

  const pagedStudents = useMemo(() => {
    const start = (studentCurrentPage - 1) * STUDENT_PAGE_SIZE;
    return filteredStudents.slice(start, start + STUDENT_PAGE_SIZE);
  }, [filteredStudents, studentCurrentPage]);

  const totalStudentPages = Math.ceil(filteredStudents.length / STUDENT_PAGE_SIZE) || 1;

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentFormData.name.trim() || !studentFormData.email.trim()) {
      showToast('Please provide Student Name and Email.', 'error');
      return;
    }

    if (editingStudent) {
      updateStudent(editingStudent.id, {
        name: studentFormData.name.trim(),
        username: studentFormData.username.trim() || undefined,
        rollNumber: studentFormData.rollNumber.trim() || undefined,
        email: studentFormData.email.trim(),
        studentId: studentFormData.studentId.trim() || editingStudent.studentId,
        classLevel: studentFormData.classLevel,
        section: studentFormData.section || 'A',
        schoolName: studentFormData.schoolName
      });
      showToast(`Student ${studentFormData.name} profile updated!`);
      setEditingStudent(null);
    } else {
      const res = addStudentManually({
        name: studentFormData.name.trim(),
        username: studentFormData.username.trim() || undefined,
        rollNumber: studentFormData.rollNumber.trim() || undefined,
        email: studentFormData.email.trim(),
        studentId: studentFormData.studentId.trim() || undefined,
        classLevel: studentFormData.classLevel,
        section: studentFormData.section || 'A',
        schoolName: studentFormData.schoolName,
        password: studentFormData.password || 'Student@123'
      });
      if (res.success) {
        showToast(res.message);
        setIsAddStudentModalOpen(false);
      } else {
        showToast(res.message, 'error');
        return;
      }
    }

    setStudentFormData({
      name: '',
      username: '',
      rollNumber: '',
      email: '',
      studentId: '',
      classLevel: 'X',
      section: 'A',
      schoolName: 'Zakir Learning Hub Partner School',
      password: ''
    });
    handleSyncToBackend();
  };

  const handleToggleLockStudent = (st: UserAccount) => {
    toggleStudentLock(st.id);
    showToast(`Student ${st.name} account is now ${st.isLocked ? 'Activated' : 'Deactivated / Locked'}.`);
    handleSyncToBackend();
  };

  const handleDeleteStudent = (st: UserAccount) => {
    openConfirm(
      `Delete Student Account: ${st.name}`,
      `Are you sure you want to remove ${st.name} (${st.studentId || st.email}) from the school roster? This action permanently removes their account and login permissions.`,
      () => {
        deleteStudent(st.id);
        showToast(`Student ${st.name} deleted.`);
        handleSyncToBackend();
      }
    );
  };

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPasswordStudent || !newPasswordValue.trim()) return;

    const res = setStudentPassword(resetPasswordStudent.id, newPasswordValue.trim());
    if (res.success) {
      showToast(res.message);
      setResetPasswordStudent(null);
      setNewPasswordValue('');
      handleSyncToBackend();
    } else {
      showToast(res.message, 'error');
    }
  };

  // Bulk Excel Handling
  const handleBulkExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBulkError(null);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<any>(sheet);

        if (!json || json.length === 0) {
          setBulkError('Spreadsheet contains no rows.');
          return;
        }

        const parsed = json.map((row: any, i: number) => {
          const name = row['Student Name'] || row['Name'] || row['name'] || `Student ${i + 1}`;
          const email = row['Email'] || row['email'] || `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}${100 + i}@school.edu`;
          const rawClass = String(row['Class Level'] || row['Class'] || row['class'] || 'X').toUpperCase();
          const classLevel: ClassLevel = ['VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'].includes(rawClass) ? (rawClass as ClassLevel) : 'X';
          const rollNumber = String(row['Admission Number'] || row['Admission No'] || row['Roll Number'] || row['Roll No'] || row['rollNumber'] || 1000 + i);
          const studentId = row['Student ID / Roll No'] || row['Student ID'] || row['ID'] || `STD-${classLevel}-${rollNumber}`;
          const username = (row['Username'] || row['username'] || `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}_${classLevel.toLowerCase()}`).trim().toLowerCase();
          const section = row['Section'] || row['section'] || 'A';
          const schoolName = row['School Name'] || row['School'] || 'CBSE Partner School';

          return { name, username, rollNumber, email, studentId, classLevel, section, schoolName, password: 'Student@123' };
        });

        setParsedBulkStudents(parsed);
      } catch (err: any) {
        setBulkError(`Failed to parse Excel file: ${err.message}`);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleConfirmBulkEnroll = () => {
    if (parsedBulkStudents.length === 0) return;
    const res = addStudentsBulk(parsedBulkStudents);
    showToast(res.message);
    setParsedBulkStudents([]);
    setIsBulkModalOpen(false);
    handleSyncToBackend();
  };

  // ==========================================
  // MODULE 6: TEST MANAGEMENT STATE & HANDLERS
  // ==========================================
  const [testSearch, setTestSearch] = useState('');
  const [testClassFilter, setTestClassFilter] = useState<ClassLevel | 'ALL'>('ALL');
  const [testSubjectFilter, setTestSubjectFilter] = useState<SubjectId | 'ALL'>('ALL');
  const [testStatusFilter, setTestStatusFilter] = useState<'ALL' | LabExamStatus>('ALL');
  const [isCreateTestModalOpen, setIsCreateTestModalOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<LabExamConfig | null>(null);

  // New Lab Examination Modals
  const [isLabMonitorModalOpen, setIsLabMonitorModalOpen] = useState(false);
  const [selectedExamForMonitor, setSelectedExamForMonitor] = useState<LabExamConfig | null>(null);
  const [monitorSessions, setMonitorSessions] = useState<LabExamStudentSession[]>([]);

  const [isPreviewTestModalOpen, setIsPreviewTestModalOpen] = useState(false);
  const [selectedExamForPreview, setSelectedExamForPreview] = useState<LabExamConfig | null>(null);

  const [isAuditLogModalOpen, setIsAuditLogModalOpen] = useState(false);
  const [auditLogsList, setAuditLogsList] = useState<any[]>([]);

  const [isQBankPickerOpen, setIsQBankPickerOpen] = useState(false);
  const [reopenSessionTarget, setReopenSessionTarget] = useState<LabExamStudentSession | null>(null);
  const [reopenAdditionalMins, setReopenAdditionalMins] = useState<number>(10);
  const [reopenReason, setReopenReason] = useState<string>('Workstation power glitch / PC restarted');

  const [testFormData, setTestFormData] = useState<{
    title: string;
    examCode: string;
    classLevel: ClassLevel;
    subjectId: SubjectId;
    chapterId?: string;
    topic?: string;
    section: string;
    assignedGroup: string;
    assignedStudentIds: string[];
    examDate: string;
    startTime: string;
    endTime: string;
    durationMinutes: number;
    totalMarks: number;
    passingMarks: number;
    negativeMarking: number;
    attemptLimit: number;
    status: LabExamStatus;
    instructions: string;
    shuffleQuestions: boolean;
    shuffleOptions: boolean;
    showResultsImmediately: boolean;
    showAnswerKeysToStudents: boolean;
    questions: LabExamQuestion[];
  }>({
    title: '',
    examCode: '',
    classLevel: 'X',
    subjectId: 'it-402',
    chapterId: '',
    topic: '',
    section: 'ALL',
    assignedGroup: 'All Students',
    assignedStudentIds: [],
    examDate: new Date().toISOString().split('T')[0],
    startTime: '10:00',
    endTime: '11:00',
    durationMinutes: 45,
    totalMarks: 25,
    passingMarks: 10,
    negativeMarking: 0,
    attemptLimit: 1,
    status: 'scheduled',
    instructions: 'Read questions carefully. Answers are saved continuously in real-time. Test submits automatically at 00:00.',
    shuffleQuestions: true,
    shuffleOptions: true,
    showResultsImmediately: false,
    showAnswerKeysToStudents: false,
    questions: []
  });

  // Question Authoring within Test
  const [newQuestionForm, setNewQuestionForm] = useState<{
    type: 'mcq' | 'multiple_select' | 'true_false' | 'fill_blank' | 'short_answer';
    question: string;
    options: [string, string, string, string];
    correctIndex: number;
    selectedMultiIndices: number[];
    correctAnswerText: string;
    marks: number;
    negativeMarks: number;
    explanation: string;
    chapterTitle: string;
    topic: string;
  }>({
    type: 'mcq',
    question: '',
    options: ['', '', '', ''],
    correctIndex: 0,
    selectedMultiIndices: [0],
    correctAnswerText: '',
    marks: 1,
    negativeMarks: 0,
    explanation: '',
    chapterTitle: '',
    topic: ''
  });

  const filteredTests = useMemo(() => {
    return labExams.filter(t => {
      const matchesSearch = 
        t.title.toLowerCase().includes(testSearch.toLowerCase()) || 
        t.examCode.toLowerCase().includes(testSearch.toLowerCase());
      const matchesClass = testClassFilter === 'ALL' || t.classLevel === testClassFilter;
      const matchesSubject = testSubjectFilter === 'ALL' || t.subjectId === testSubjectFilter;
      const matchesStatus = testStatusFilter === 'ALL' || t.status === testStatusFilter;
      return matchesSearch && matchesClass && matchesSubject && matchesStatus;
    });
  }, [labExams, testSearch, testClassFilter, testSubjectFilter, testStatusFilter]);

  const handleAddQuestionToTest = () => {
    if (!newQuestionForm.question.trim()) {
      showToast('Please type a question prompt.', 'error');
      return;
    }

    let correctAnswer: string | number | number[] = newQuestionForm.correctIndex;
    let options: string[] | undefined = newQuestionForm.options;

    if (newQuestionForm.type === 'multiple_select') {
      correctAnswer = newQuestionForm.selectedMultiIndices.length > 0 ? newQuestionForm.selectedMultiIndices : [0];
    } else if (newQuestionForm.type === 'true_false') {
      options = ['True', 'False'];
      correctAnswer = newQuestionForm.correctIndex === 1 ? 1 : 0;
    } else if (newQuestionForm.type === 'fill_blank' || newQuestionForm.type === 'short_answer') {
      options = undefined;
      correctAnswer = newQuestionForm.correctAnswerText.trim();
    }

    const newQ: LabExamQuestion = {
      id: `lq-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: newQuestionForm.type,
      question: newQuestionForm.question.trim(),
      options,
      correctAnswer,
      marks: Number(newQuestionForm.marks) || 1,
      negativeMarks: Number(newQuestionForm.negativeMarks) || undefined,
      explanation: newQuestionForm.explanation.trim(),
      chapterTitle: newQuestionForm.chapterTitle.trim() || undefined,
      topic: newQuestionForm.topic.trim() || undefined
    };

    setTestFormData(prev => ({
      ...prev,
      questions: [...prev.questions, newQ],
      totalMarks: prev.questions.reduce((sum, q) => sum + q.marks, 0) + newQ.marks
    }));

    setNewQuestionForm({
      type: 'mcq',
      question: '',
      options: ['', '', '', ''],
      correctIndex: 0,
      selectedMultiIndices: [0],
      correctAnswerText: '',
      marks: 1,
      negativeMarks: 0,
      explanation: '',
      chapterTitle: '',
      topic: ''
    });
    showToast('Question added to test.');
  };

  const handleRemoveQuestionFromTest = (qId: string) => {
    setTestFormData(prev => {
      const updated = prev.questions.filter(q => q.id !== qId);
      return {
        ...prev,
        questions: updated,
        totalMarks: updated.reduce((sum, q) => sum + q.marks, 0)
      };
    });
  };

  const handleImportQuestionBankItems = (selectedQuestions: Question[]) => {
    const formatted: LabExamQuestion[] = selectedQuestions.map(q => ({
      id: `lq-bank-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type: q.type,
      question: q.question,
      options: q.options,
      correctAnswer: q.type === 'fill_blank' || q.type === 'short_answer' ? (q.correctAnswerText || '') : q.correctOptionIndex,
      marks: q.marks || 1,
      explanation: q.explanation,
      chapterTitle: q.chapterTitle,
      chapterId: q.chapterId,
      topic: q.tags?.[0]
    }));

    setTestFormData(prev => {
      const allQ = [...prev.questions, ...formatted];
      return {
        ...prev,
        questions: allQ,
        totalMarks: allQ.reduce((sum, item) => sum + item.marks, 0)
      };
    });
    setIsQBankPickerOpen(false);
    showToast(`Imported ${formatted.length} questions from Question Bank into test!`);
  };

  const handleSaveTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testFormData.title.trim()) {
      showToast('Please enter a Test Title.', 'error');
      return;
    }
    if (testFormData.questions.length === 0) {
      showToast('Please add at least one question to this test.', 'error');
      return;
    }

    const examPayload: LabExamConfig = {
      id: editingTest ? editingTest.id : `exam-${Date.now()}`,
      examCode: testFormData.examCode.trim() || `TEST-${testFormData.classLevel}-${Date.now().toString().slice(-4)}`,
      title: testFormData.title.trim(),
      instructions: testFormData.instructions.trim(),
      classLevel: testFormData.classLevel,
      subjectId: testFormData.subjectId,
      chapterId: testFormData.chapterId || undefined,
      topic: testFormData.topic || undefined,
      section: testFormData.section || 'ALL',
      assignedGroup: testFormData.assignedGroup || 'All Students',
      assignedStudentIds: testFormData.assignedStudentIds || [],
      examDate: testFormData.examDate,
      startTime: testFormData.startTime,
      endTime: testFormData.endTime || undefined,
      durationMinutes: Number(testFormData.durationMinutes) || 45,
      totalMarks: testFormData.totalMarks,
      passingMarks: Number(testFormData.passingMarks) || Math.round(testFormData.totalMarks * 0.4),
      negativeMarking: Number(testFormData.negativeMarking) || 0,
      attemptLimit: Number(testFormData.attemptLimit) || 1,
      status: testFormData.status,
      shuffleQuestions: testFormData.shuffleQuestions,
      shuffleOptions: testFormData.shuffleOptions,
      showResultsImmediately: testFormData.showResultsImmediately,
      showAnswerKeysToStudents: testFormData.showAnswerKeysToStudents,
      questions: testFormData.questions,
      createdAt: editingTest ? editingTest.createdAt : new Date().toISOString()
    };

    if (editingTest) {
      updateLabExam(editingTest.id, examPayload);
      showToast(`Test "${testFormData.title}" updated successfully!`);
      setEditingTest(null);
    } else {
      createLabExam(examPayload);
      showToast(`Online Test "${testFormData.title}" created & scheduled!`);
      setIsCreateTestModalOpen(false);
    }

    handleSyncToBackend();
  };

  // Lab Live Monitor Handlers
  const handleOpenLabMonitor = async (exam: LabExamConfig) => {
    setSelectedExamForMonitor(exam);
    setIsLabMonitorModalOpen(true);
    try {
      const res = await fetch(`/api/lab-exams/sessions/${exam.id}`);
      const data = await res.json();
      if (data?.success && Array.isArray(data.sessions)) {
        setMonitorSessions(data.sessions);
      } else {
        // Fallback to context sessions
        setMonitorSessions(labExamSessions.filter(s => s.examId === exam.id));
      }
    } catch {
      setMonitorSessions(labExamSessions.filter(s => s.examId === exam.id));
    }
  };

  const handleOpenAuditLogs = async (exam?: LabExamConfig) => {
    setIsAuditLogModalOpen(true);
    try {
      const url = exam ? `/api/lab-exams/audit-log?examId=${exam.id}` : '/api/lab-exams/audit-log';
      const res = await fetch(url);
      const data = await res.json();
      if (data?.success && Array.isArray(data.logs)) {
        setAuditLogsList(data.logs);
      } else {
        setAuditLogsList([]);
      }
    } catch {
      setAuditLogsList([]);
    }
  };

  const handleConfirmReopenSession = async () => {
    if (!reopenSessionTarget) return;
    try {
      const res = await fetch('/api/lab-exams/session/reopen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: reopenSessionTarget.id,
          additionalMinutes: reopenAdditionalMins,
          reason: reopenReason
        })
      });
      const data = await res.json();
      if (data?.success) {
        showToast(`Examination session unlocked for ${reopenSessionTarget.studentName} with +${reopenAdditionalMins} minutes!`);
        reopenLabExamForStudent(reopenSessionTarget.id);
        if (selectedExamForMonitor) {
          handleOpenLabMonitor(selectedExamForMonitor);
        }
      } else {
        showToast(data.error || 'Failed to reopen session', 'error');
      }
    } catch (err: any) {
      reopenLabExamForStudent(reopenSessionTarget.id);
      showToast(`Reopened exam locally for ${reopenSessionTarget.studentName}`);
    } finally {
      setReopenSessionTarget(null);
    }
  };

  const handleDeleteTest = (t: LabExamConfig) => {
    openConfirm(
      `Delete Test: ${t.title}`,
      `Are you sure you want to delete test "${t.title}" (${t.examCode})? Any active student test sessions associated with this exam will be removed.`,
      () => {
        deleteLabExam(t.id);
        showToast(`Test "${t.title}" deleted.`);
        handleSyncToBackend();
      }
    );
  };

  const handleUpdateTestStatus = (testId: string, status: LabExamStatus) => {
    setLabExamStatus(testId, status);
    showToast(`Test status changed to "${status.toUpperCase()}".`);
    handleSyncToBackend();
  };

  // ==========================================
  // MODULE 7: RESULTS & PERFORMANCE ANALYTICS STATE & HANDLERS
  // ==========================================
  const [resultViewMode, setResultViewMode] = useState<'table' | 'analytics'>('table');
  const [resultSearch, setResultSearch] = useState('');
  const [resultClassFilter, setResultClassFilter] = useState<ClassLevel | 'ALL'>('ALL');
  const [resultSectionFilter, setResultSectionFilter] = useState<string>('ALL');
  const [resultSubjectFilter, setResultSubjectFilter] = useState<SubjectId | 'ALL'>('ALL');
  const [resultChapterFilter, setResultChapterFilter] = useState<string>('ALL');
  const [resultTestFilter, setResultTestFilter] = useState<string>('ALL');
  const [resultDateFilter, setResultDateFilter] = useState<string>('');
  const [resultStatusTab, setResultStatusTab] = useState<'all' | 'submitted' | 'pending_eval' | 'in_progress' | 'absent' | 'not_attempted'>('all');
  const [resultCurrentPage, setResultCurrentPage] = useState(1);
  const RESULT_PAGE_SIZE = 12;

  // Selected student for Detailed Performance Report modal
  const [selectedResultForReport, setSelectedResultForReport] = useState<any | null>(null);
  const [selectedAttemptForView, setSelectedAttemptForView] = useState<QuizAttempt | null>(null);
  const [selectedSessionForView, setSelectedSessionForView] = useState<LabExamStudentSession | null>(null);

  // Selected session for Interactive Teacher Evaluation modal
  const [evaluatingSession, setEvaluatingSession] = useState<LabExamStudentSession | null>(null);
  const [evaluationDraftMarks, setEvaluationDraftMarks] = useState<Record<string, number>>({});
  const [evaluationDraftFeedback, setEvaluationDraftFeedback] = useState<Record<string, string>>({});
  const [evaluationTeacherRemarks, setEvaluationTeacherRemarks] = useState<string>('');
  const [evaluationEvaluatorName, setEvaluationEvaluatorName] = useState<string>('Zakir Hussain (PGT Computer Science)');
  const [evaluationReleaseResults, setEvaluationReleaseResults] = useState<boolean>(true);

  // Export menu toggle
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  // Specific test filter for analytics
  const [analyticsSelectedTestId, setAnalyticsSelectedTestId] = useState<string>('ALL');

  // Complete Roster Computation across Tests & Enrolled Students
  const allResultsRoster = useMemo(() => {
    const list: Array<{
      id: string;
      studentId: string;
      studentName: string;
      rollNumber?: string;
      classLevel: ClassLevel;
      section: string;
      testId: string;
      testTitle: string;
      subjectId: SubjectId;
      chapterTitle?: string;
      date: string;
      score: number | null;
      totalMarks: number;
      percentage: number | null;
      passed: boolean | null;
      detailedStatus: 'submitted' | 'pending_eval' | 'in_progress' | 'absent' | 'not_attempted';
      statusLabel: string;
      rawSession?: LabExamStudentSession;
      rawExam?: LabExamConfig;
      rawAttempt?: QuizAttempt;
    }> = [];

    // Filter students: non-admin students
    const validStudents = registeredStudents.filter(s => s.role !== 'admin');

    // 1. Process all Computer Lab Examinations
    labExams.forEach(exam => {
      // Find students eligible for this examination
      const eligibleStudents = validStudents.filter(st => {
        if (st.classLevel !== exam.classLevel) return false;
        if (exam.section && exam.section !== 'ALL' && st.section && st.section !== exam.section) return false;
        if (Array.isArray(exam.assignedStudentIds) && exam.assignedStudentIds.length > 0) {
          if (!exam.assignedStudentIds.includes(st.id) && !exam.assignedStudentIds.includes(st.studentId || '')) {
            return false;
          }
        }
        return true;
      });

      eligibleStudents.forEach(st => {
        const session = labExamSessions.find(s => 
          s.examId === exam.id && 
          (s.studentId === st.id || s.studentId === st.studentId || (st.email && s.studentId === st.email))
        );

        const subObj = customSubjects.find(s => s.id === exam.subjectId);
        const chapObj = customChapters.find(c => c.id === exam.chapterId);

        if (session) {
          if (session.status === 'submitted') {
            const hasSubjective = (exam.questions || []).some(q => 
              ['short_answer', 'long_answer', 'practical_code'].includes(q.type)
            );
            const isPending = hasSubjective && (!session.isEvaluated || !session.manualEvaluations || Object.keys(session.manualEvaluations).length === 0);

            list.push({
              id: session.id,
              studentId: st.id,
              studentName: st.name,
              rollNumber: st.rollNumber || st.studentId || session.rollNumber || 'N/A',
              classLevel: exam.classLevel,
              section: st.section || exam.section || 'A',
              testId: exam.id,
              testTitle: exam.title,
              subjectId: exam.subjectId,
              chapterTitle: chapObj?.title || exam.topic || (subObj ? subObj.name : exam.subjectId),
              date: session.submittedAt ? session.submittedAt.split('T')[0] : (exam.examDate || 'Recent'),
              score: session.finalScore,
              totalMarks: session.totalMarks || exam.totalMarks,
              percentage: session.percentage,
              passed: session.passed,
              detailedStatus: isPending ? 'pending_eval' : 'submitted',
              statusLabel: isPending ? 'Pending Evaluation' : 'Submitted & Evaluated',
              rawSession: session,
              rawExam: exam
            });
          } else if (session.status === 'in_progress' || session.status === 'interrupted') {
            list.push({
              id: session.id,
              studentId: st.id,
              studentName: st.name,
              rollNumber: st.rollNumber || st.studentId || session.rollNumber || 'N/A',
              classLevel: exam.classLevel,
              section: st.section || exam.section || 'A',
              testId: exam.id,
              testTitle: exam.title,
              subjectId: exam.subjectId,
              chapterTitle: chapObj?.title || exam.topic || (subObj ? subObj.name : exam.subjectId),
              date: session.startedAt ? session.startedAt.split('T')[0] : (exam.examDate || 'In Progress'),
              score: null,
              totalMarks: exam.totalMarks,
              percentage: null,
              passed: null,
              detailedStatus: 'in_progress',
              statusLabel: session.status === 'interrupted' ? 'Interrupted / Reconnecting' : 'In Progress',
              rawSession: session,
              rawExam: exam
            });
          } else {
            list.push({
              id: `not-att-${exam.id}-${st.id}`,
              studentId: st.id,
              studentName: st.name,
              rollNumber: st.rollNumber || st.studentId || 'N/A',
              classLevel: exam.classLevel,
              section: st.section || exam.section || 'A',
              testId: exam.id,
              testTitle: exam.title,
              subjectId: exam.subjectId,
              chapterTitle: chapObj?.title || exam.topic || (subObj ? subObj.name : exam.subjectId),
              date: exam.examDate || 'Upcoming',
              score: null,
              totalMarks: exam.totalMarks,
              percentage: null,
              passed: null,
              detailedStatus: 'not_attempted',
              statusLabel: 'Not Attempted',
              rawExam: exam
            });
          }
        } else {
          // No session found for this assigned student
          const isClosed = exam.status === 'closed';
          const isPast = exam.examDate && exam.examDate < new Date().toISOString().split('T')[0];
          const isAbsent = isClosed || isPast;

          list.push({
            id: `absent-${exam.id}-${st.id}`,
            studentId: st.id,
            studentName: st.name,
            rollNumber: st.rollNumber || st.studentId || 'N/A',
            classLevel: exam.classLevel,
            section: st.section || exam.section || 'A',
            testId: exam.id,
            testTitle: exam.title,
            subjectId: exam.subjectId,
            chapterTitle: chapObj?.title || exam.topic || (subObj ? subObj.name : exam.subjectId),
            date: exam.examDate || 'N/A',
            score: null,
            totalMarks: exam.totalMarks,
            percentage: null,
            passed: null,
            detailedStatus: isAbsent ? 'absent' : 'not_attempted',
            statusLabel: isAbsent ? 'Absent' : 'Not Attempted',
            rawExam: exam
          });
        }
      });
    });

    // 2. Process chapter quiz attempts (when not restricted to a specific lab test)
    quizAttempts.forEach(att => {
      const student = validStudents.find(s => s.id === att.studentId || s.name === att.studentName);
      list.push({
        id: att.id,
        studentId: att.studentId || 'student-quiz',
        studentName: att.studentName || student?.name || 'Student',
        rollNumber: student?.rollNumber || student?.studentId || 'N/A',
        classLevel: att.classLevel,
        section: student?.section || 'A',
        testId: `quiz-${att.id}`,
        testTitle: att.quizTitle || `${att.chapterTitle} Chapter Test`,
        subjectId: att.subjectId,
        chapterTitle: att.chapterTitle,
        date: att.date ? att.date.split('T')[0] : 'Recent',
        score: att.score,
        totalMarks: att.totalQuestions,
        percentage: att.percentage,
        passed: Boolean(att.passed ?? (att.percentage >= 40)),
        detailedStatus: 'submitted',
        statusLabel: 'Submitted & Evaluated',
        rawAttempt: att
      });
    });

    return list;
  }, [labExams, labExamSessions, registeredStudents, customSubjects, customChapters, quizAttempts]);

  // Filtered Results based on Admin Controls
  const filteredResults = useMemo(() => {
    return allResultsRoster.filter(r => {
      // 1. Text Search (Student Name, Roll Number, Test Title)
      if (resultSearch.trim()) {
        const query = resultSearch.toLowerCase().trim();
        const matchesName = r.studentName.toLowerCase().includes(query);
        const matchesRoll = r.rollNumber && r.rollNumber.toLowerCase().includes(query);
        const matchesTest = r.testTitle.toLowerCase().includes(query);
        if (!matchesName && !matchesRoll && !matchesTest) return false;
      }

      // 2. Class Filter
      if (resultClassFilter !== 'ALL' && r.classLevel !== resultClassFilter) return false;

      // 3. Section Filter
      if (resultSectionFilter !== 'ALL' && r.section !== resultSectionFilter) return false;

      // 4. Subject Filter
      if (resultSubjectFilter !== 'ALL' && r.subjectId !== resultSubjectFilter) return false;

      // 5. Chapter Filter
      if (resultChapterFilter !== 'ALL' && r.chapterTitle && !r.chapterTitle.includes(resultChapterFilter)) return false;

      // 6. Test Filter
      if (resultTestFilter !== 'ALL' && r.testId !== resultTestFilter) return false;

      // 7. Date Filter
      if (resultDateFilter && r.date !== resultDateFilter) return false;

      // 8. Status Tab Filter
      if (resultStatusTab !== 'all') {
        if (resultStatusTab === 'submitted' && r.detailedStatus !== 'submitted') return false;
        if (resultStatusTab === 'pending_eval' && r.detailedStatus !== 'pending_eval') return false;
        if (resultStatusTab === 'in_progress' && r.detailedStatus !== 'in_progress') return false;
        if (resultStatusTab === 'absent' && r.detailedStatus !== 'absent') return false;
        if (resultStatusTab === 'not_attempted' && r.detailedStatus !== 'not_attempted') return false;
      }

      return true;
    });
  }, [
    allResultsRoster, 
    resultSearch, 
    resultClassFilter, 
    resultSectionFilter, 
    resultSubjectFilter, 
    resultChapterFilter, 
    resultTestFilter, 
    resultDateFilter, 
    resultStatusTab
  ]);

  // Pagination for Results Table
  const pagedResults = useMemo(() => {
    const start = (resultCurrentPage - 1) * RESULT_PAGE_SIZE;
    return filteredResults.slice(start, start + RESULT_PAGE_SIZE);
  }, [filteredResults, resultCurrentPage]);

  const totalResultPages = Math.ceil(filteredResults.length / RESULT_PAGE_SIZE) || 1;

  // Counts by status
  const statusCounts = useMemo(() => {
    const all = allResultsRoster.filter(r => {
      if (resultClassFilter !== 'ALL' && r.classLevel !== resultClassFilter) return false;
      if (resultSectionFilter !== 'ALL' && r.section !== resultSectionFilter) return false;
      if (resultSubjectFilter !== 'ALL' && r.subjectId !== resultSubjectFilter) return false;
      if (resultTestFilter !== 'ALL' && r.testId !== resultTestFilter) return false;
      return true;
    });

    return {
      all: all.length,
      submitted: all.filter(r => r.detailedStatus === 'submitted').length,
      pending_eval: all.filter(r => r.detailedStatus === 'pending_eval').length,
      in_progress: all.filter(r => r.detailedStatus === 'in_progress').length,
      absent: all.filter(r => r.detailedStatus === 'absent').length,
      not_attempted: all.filter(r => r.detailedStatus === 'not_attempted').length
    };
  }, [allResultsRoster, resultClassFilter, resultSectionFilter, resultSubjectFilter, resultTestFilter]);

  // Class & Performance Analytics Computations
  const classAnalytics = useMemo(() => {
    // Scope down to selected test for analytics (or current filtered list)
    const activeList = analyticsSelectedTestId !== 'ALL'
      ? allResultsRoster.filter(r => r.testId === analyticsSelectedTestId)
      : filteredResults;

    const assignedCount = activeList.length;
    const submittedList = activeList.filter(r => r.score !== null && (r.detailedStatus === 'submitted' || r.detailedStatus === 'pending_eval'));
    const evaluatedList = activeList.filter(r => r.score !== null && r.detailedStatus === 'submitted');
    const absentList = activeList.filter(r => r.detailedStatus === 'absent');
    const notAttemptedList = activeList.filter(r => r.detailedStatus === 'not_attempted');
    const inProgressList = activeList.filter(r => r.detailedStatus === 'in_progress');

    const attemptedCount = submittedList.length + inProgressList.length;
    const submittedCount = submittedList.length;
    const absentCount = absentList.length;

    // Passing & Average scores (calculated exclusively over students who submitted/evaluated)
    const passCount = submittedList.filter(r => r.passed).length;
    const classPassPercentage = submittedList.length > 0 ? Math.round((passCount / submittedList.length) * 100) : 0;

    const totalScoreEarned = submittedList.reduce((acc, r) => acc + (r.score || 0), 0);
    const totalPossibleMarks = submittedList.reduce((acc, r) => acc + (r.totalMarks || 0), 0);
    const averageScore = submittedList.length > 0 ? Math.round((totalScoreEarned / submittedList.length) * 10) / 10 : 0;
    const averagePercentage = totalPossibleMarks > 0 ? Math.round((totalScoreEarned / totalPossibleMarks) * 100) : 0;

    const highestRecord = submittedList.length > 0 ? submittedList.reduce((max, r) => ((r.score || 0) > (max.score || 0) ? r : max), submittedList[0]) : null;
    const lowestRecord = submittedList.length > 0 ? submittedList.reduce((min, r) => ((r.score || 0) < (min.score || 0) ? r : min), submittedList[0]) : null;

    // Grade Distribution
    const distinctionCount = submittedList.filter(r => (r.percentage || 0) >= 75).length;
    const firstClassCount = submittedList.filter(r => (r.percentage || 0) >= 60 && (r.percentage || 0) < 75).length;
    const passGradeCount = submittedList.filter(r => (r.percentage || 0) >= 40 && (r.percentage || 0) < 60).length;
    const needsPracticeCount = submittedList.filter(r => (r.percentage || 0) < 40).length;

    // Students requiring additional practice (< passing marks or < 50%)
    const studentsNeedingPractice = submittedList
      .filter(r => !r.passed || (r.percentage || 0) < 50)
      .sort((a, b) => (a.percentage || 0) - (b.percentage || 0));

    // Question-wise performance breakdown if a specific test is selected
    const selectedTestObj = labExams.find(e => e.id === (analyticsSelectedTestId !== 'ALL' ? analyticsSelectedTestId : resultTestFilter));
    const questionStats: Array<{
      qIndex: number;
      questionId: string;
      questionText: string;
      type: string;
      difficulty: string;
      marks: number;
      correctCount: number;
      attemptCount: number;
      accuracyRate: number;
      statusColor: string;
    }> = [];

    if (selectedTestObj && selectedTestObj.questions) {
      const testSessions = labExamSessions.filter(s => s.examId === selectedTestObj.id && s.status === 'submitted');

      selectedTestObj.questions.forEach((q, idx) => {
        let correctCount = 0;
        let attemptCount = 0;

        testSessions.forEach(sess => {
          const studentAns = sess.answers?.[q.id];
          if (studentAns !== undefined && studentAns !== null && studentAns !== '') {
            attemptCount++;
            if (q.type === 'mcq' || q.type === 'true_false') {
              if (String(studentAns).trim() === String(q.correctAnswer).trim()) correctCount++;
            } else if (q.type === 'fill_blank') {
              if (String(studentAns).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase()) correctCount++;
            } else if (sess.manualEvaluations?.[q.id]) {
              if (sess.manualEvaluations[q.id].marks >= q.marks * 0.5) correctCount++;
            }
          }
        });

        const accuracyRate = attemptCount > 0 ? Math.round((correctCount / attemptCount) * 100) : 0;
        const statusColor = accuracyRate >= 70 ? 'text-emerald-700 bg-emerald-50' : accuracyRate >= 45 ? 'text-amber-700 bg-amber-50' : 'text-rose-700 bg-rose-50';

        questionStats.push({
          qIndex: idx + 1,
          questionId: q.id,
          questionText: q.question,
          type: q.type,
          difficulty: q.difficulty || 'medium',
          marks: q.marks,
          correctCount,
          attemptCount,
          accuracyRate,
          statusColor
        });
      });
    }

    // Chapter-wise performance breakdown
    const chapterAverages: Record<string, { totalMarksScored: number; totalMaxMarks: number; count: number }> = {};
    submittedList.forEach(r => {
      const chKey = r.chapterTitle || 'General Syllabus';
      if (!chapterAverages[chKey]) {
        chapterAverages[chKey] = { totalMarksScored: 0, totalMaxMarks: 0, count: 0 };
      }
      chapterAverages[chKey].totalMarksScored += (r.score || 0);
      chapterAverages[chKey].totalMaxMarks += r.totalMarks;
      chapterAverages[chKey].count += 1;
    });

    const chapterStats = Object.entries(chapterAverages).map(([chapter, data]) => ({
      chapter,
      averagePercentage: data.totalMaxMarks > 0 ? Math.round((data.totalMarksScored / data.totalMaxMarks) * 100) : 0,
      attemptsCount: data.count
    }));

    return {
      assignedCount,
      attemptedCount,
      submittedCount,
      absentCount,
      notAttemptedCount: notAttemptedList.length,
      inProgressCount: inProgressList.length,
      classPassPercentage,
      averageScore,
      averagePercentage,
      highestRecord,
      lowestRecord,
      distinctionCount,
      firstClassCount,
      passGradeCount,
      needsPracticeCount,
      studentsNeedingPractice,
      questionStats,
      chapterStats
    };
  }, [allResultsRoster, filteredResults, analyticsSelectedTestId, resultTestFilter, labExams, labExamSessions]);

  // Export 1: Complete Class Results (Excel .xlsx & CSV)
  const handleExportClassResultsToExcel = () => {
    if (filteredResults.length === 0) {
      showToast('No result records to export.', 'error');
      return;
    }

    const exportRows = filteredResults.map(r => ({
      "Student Name": r.studentName,
      "Roll No / Student ID": r.rollNumber || 'N/A',
      "Class": `Class ${r.classLevel}`,
      "Section": r.section,
      "Subject": r.subjectId.toUpperCase(),
      "Test Title": r.testTitle,
      "Exam Date": r.date,
      "Marks Scored": r.score !== null ? r.score : 'N/A',
      "Total Marks": r.totalMarks,
      "Percentage": r.percentage !== null ? `${r.percentage}%` : 'N/A',
      "Pass / Fail Outcome": r.passed === true ? 'PASSED' : r.passed === false ? 'FAILED' : 'NOT ATTEMPTED',
      "Examination Status": r.statusLabel,
      "Evaluator": r.rawSession?.evaluatedBy || 'Zakir Hussain (PGT CS)'
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Class_Results");
    XLSX.writeFile(workbook, `CBSE_Exam_Results_Class_${resultClassFilter}_${new Date().toISOString().split('T')[0]}.xlsx`);
    showToast('Class results Excel report exported successfully!');
    setIsExportMenuOpen(false);
  };

  const handleExportClassResultsToCSV = () => {
    if (filteredResults.length === 0) {
      showToast('No result records to export.', 'error');
      return;
    }

    const headers = [
      "Student Name", 
      "Roll No", 
      "Class", 
      "Section", 
      "Subject", 
      "Test Title", 
      "Date", 
      "Marks Scored", 
      "Total Marks", 
      "Percentage", 
      "Outcome", 
      "Status",
      "Evaluator"
    ];

    const rows = filteredResults.map(r => [
      `"${r.studentName}"`,
      `"${r.rollNumber || 'N/A'}"`,
      `"Class ${r.classLevel}"`,
      `"${r.section}"`,
      `"${r.subjectId.toUpperCase()}"`,
      `"${r.testTitle.replace(/"/g, '""')}"`,
      `"${r.date}"`,
      r.score !== null ? r.score : '"-"',
      r.totalMarks,
      r.percentage !== null ? `"${r.percentage}%"` : '"-"',
      r.passed === true ? '"PASSED"' : r.passed === false ? '"FAILED"' : '"ABSENT"',
      `"${r.statusLabel}"`,
      `"${r.rawSession?.evaluatedBy || 'Zakir Hussain'}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `CBSE_Class_Results_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Class results CSV report exported successfully!');
    setIsExportMenuOpen(false);
  };

  // Export 2: Subject-Wise Performance Summary (CSV)
  const handleExportSubjectWiseSummary = () => {
    const subjectStats: Record<string, { totalScore: number; totalPossible: number; count: number; passCount: number }> = {};
    
    allResultsRoster.forEach(r => {
      if (r.score !== null) {
        if (!subjectStats[r.subjectId]) {
          subjectStats[r.subjectId] = { totalScore: 0, totalPossible: 0, count: 0, passCount: 0 };
        }
        subjectStats[r.subjectId].totalScore += (r.score || 0);
        subjectStats[r.subjectId].totalPossible += r.totalMarks;
        subjectStats[r.subjectId].count += 1;
        if (r.passed) subjectStats[r.subjectId].passCount += 1;
      }
    });

    const headers = ["Subject Code", "Subject Name", "Total Submissions", "Average Marks", "Average Percentage", "Pass Rate"];
    const rows = Object.entries(subjectStats).map(([subId, data]) => {
      const subObj = customSubjects.find(s => s.id === subId);
      const avgPercentage = data.totalPossible > 0 ? Math.round((data.totalScore / data.totalPossible) * 100) : 0;
      const passRate = data.count > 0 ? Math.round((data.passCount / data.count) * 100) : 0;
      return [
        `"${subObj?.code || subId}"`,
        `"${subObj?.name || subId}"`,
        data.count,
        (data.totalScore / data.count).toFixed(1),
        `"${avgPercentage}%"`,
        `"${passRate}%"`
      ];
    });

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `CBSE_Subject_Wise_Summary_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Subject-wise summary CSV exported!');
    setIsExportMenuOpen(false);
  };

  // Export 3: Test-Wise Summary Report (CSV)
  const handleExportTestWiseSummary = () => {
    const headers = ["Exam Code", "Test Title", "Class", "Subject", "Date", "Duration", "Assigned", "Attempted", "Average Score", "Pass %"];
    const rows = labExams.map(exam => {
      const testRoster = allResultsRoster.filter(r => r.testId === exam.id);
      const submitted = testRoster.filter(r => r.score !== null);
      const passed = submitted.filter(r => r.passed).length;
      const avg = submitted.length > 0 ? Math.round(submitted.reduce((acc, r) => acc + (r.score || 0), 0) / submitted.length) : 0;
      const passRate = submitted.length > 0 ? Math.round((passed / submitted.length) * 100) : 0;

      return [
        `"${exam.examCode}"`,
        `"${exam.title.replace(/"/g, '""')}"`,
        `"Class ${exam.classLevel}"`,
        `"${exam.subjectId.toUpperCase()}"`,
        `"${exam.examDate}"`,
        `"${exam.durationMinutes} mins"`,
        testRoster.length,
        submitted.length,
        `${avg} / ${exam.totalMarks}`,
        `"${passRate}%"`
      ];
    });

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `CBSE_Test_Wise_Summary_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Test-wise summary CSV exported!');
    setIsExportMenuOpen(false);
  };

  // Export 4: Chapter-Wise Performance Report (CSV)
  const handleExportChapterWiseSummary = () => {
    const headers = ["Chapter / Curriculum Topic", "Submissions Count", "Average Percentage", "Mastery Classification"];
    const rows = classAnalytics.chapterStats.map(ch => [
      `"${ch.chapter.replace(/"/g, '""')}"`,
      ch.attemptsCount,
      `"${ch.averagePercentage}%"`,
      ch.averagePercentage >= 75 ? '"High Mastery"' : ch.averagePercentage >= 50 ? '"Moderate"' : '"Needs Remedial Focus"'
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `CBSE_Chapter_Wise_Mastery_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Chapter-wise mastery report exported!');
    setIsExportMenuOpen(false);
  };

  // Open Interactive Evaluation Modal
  const handleOpenEvaluationModal = (session: LabExamStudentSession) => {
    setEvaluatingSession(session);
    setEvaluationDraftMarks(session.manualEvaluations ? Object.fromEntries(Object.entries(session.manualEvaluations).map(([k, v]) => [k, v.marks])) : {});
    setEvaluationDraftFeedback(session.manualEvaluations ? Object.fromEntries(Object.entries(session.manualEvaluations).map(([k, v]) => [k, v.feedback || ''])) : {});
    setEvaluationTeacherRemarks(session.teacherFeedback || '');
    setEvaluationEvaluatorName(session.evaluatedBy || currentUser?.name || 'Zakir Hussain (PGT Computer Science)');
    setEvaluationReleaseResults(session.resultsReleased !== undefined ? session.resultsReleased : true);
  };

  // Save Interactive Evaluation & Recalculate Marks
  const handleSaveEvaluation = () => {
    if (!evaluatingSession) return;

    const manualEvaluations: Record<string, { marks: number; feedback?: string }> = {};
    Object.entries(evaluationDraftMarks).forEach(([qId, marks]) => {
      manualEvaluations[qId] = {
        marks: Number(marks) || 0,
        feedback: evaluationDraftFeedback[qId] || ''
      };
    });

    evaluateLabExamSession(evaluatingSession.id, manualEvaluations, {
      evaluatorName: evaluationEvaluatorName,
      teacherFeedback: evaluationTeacherRemarks,
      resultsReleased: evaluationReleaseResults
    });

    showToast(`Evaluation and mark recalculation saved for ${evaluatingSession.studentName}!`);
    setEvaluatingSession(null);
    handleSyncToBackend();
  };

  // OVERVIEW STATS
  const totalClassesCount = customClasses.length;
  const activeClassesCount = customClasses.filter(c => c.isActive !== false && c.isHidden !== true).length;
  const totalSubjectsCount = customSubjects.length;
  const totalChaptersCount = customChapters.length;
  const totalMaterialsCount = studyMaterials.length;
  const publishedMaterialsCount = studyMaterials.filter(m => m.published !== false).length;
  const totalStudentsCount = registeredStudents.filter(s => s.role !== 'admin').length;
  const activeStudentsCount = registeredStudents.filter(s => s.role !== 'admin' && !s.isLocked).length;
  const totalTestsCount = labExams.length;
  const liveTestsCount = labExams.filter(t => t.status === 'live').length;
  const evaluatedRoster = allResultsRoster.filter(r => r.score !== null && r.score !== undefined);
  const totalAttemptsCount = evaluatedRoster.length;
  const averagePercentage = totalAttemptsCount > 0 
    ? Math.round(evaluatedRoster.reduce((sum, r) => sum + (r.percentage || 0), 0) / totalAttemptsCount) 
    : 0;

  // ACCESS GUARD
  if (userRole !== 'admin' || currentUser?.role !== 'admin') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 sm:py-24 text-center">
        <SEO
          title="Access Restricted • Administrator Portal"
          description="Content Management Center access is strictly protected and restricted to authorized educators."
        />
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xl space-y-6">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200 shadow-xs">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-100 text-rose-800">
              Restricted Area
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
              Administrator CMS Authentication Required
            </h1>
            <p className="text-sm text-slate-500 max-w-md mx-auto mt-2 leading-relaxed">
              Please authenticate using your verified administrator credentials to unlock the curriculum builder, PDF uploader, question bank, and assessment logs.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => openAuthModal('admin', 'Administrator sign-in is required to access the CMS.')}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Sign In</span>
            </button>
            {onBackToHome && (
              <button
                onClick={onBackToHome}
                className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Student Home</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <SEO
        title="Admin Control Center • Learn with Zakir"
        description="Comprehensive educational Content Management System for Classes VI–XII CBSE Computer Science & IT."
      />

      {/* FLOATING TOAST NOTIFICATION */}
      {toast && (
        <div 
          className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-xl border flex items-center gap-3 text-xs font-bold animate-in fade-in slide-in-from-bottom-4 duration-200 ${
            toast.type === 'success' 
              ? 'bg-slate-900 text-white border-slate-800 shadow-emerald-500/10' 
              : 'bg-rose-600 text-white border-rose-700 shadow-rose-500/20'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-white" />}
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 text-slate-400 hover:text-white cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* EXECUTIVE HEADER WITH EDUCATOR BADGE & LIVE DATABASE SYNC */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Verified Administrator</span>
            </span>
            <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Database Online & Persisted</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Educational Content & Examination CMS
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
            Welcome, <strong className="text-white">Mr. Zakir Hussain (PGT Computer Science)</strong>. Manage classes, subjects, chapters, notes, students, online tests, and examination scorecards across Classes VI through XII.
          </p>
        </div>

        {/* Global Action Suite */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleSyncToBackend}
            disabled={isSyncing}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all border border-white/10 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            title="Sync in-memory state with backend persistent database"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-blue-400' : 'text-slate-300'}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Database'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowPdfExtractor(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs transition-all shadow-md shadow-purple-500/20 flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AI MCQ Extractor</span>
          </button>

          {onBackToHome && (
            <button
              type="button"
              onClick={onBackToHome}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all border border-slate-700 flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Public Site</span>
            </button>
          )}
        </div>
      </div>

      {/* 7 DEDICATED MODULE TABS BAR */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs overflow-x-auto">
        <div className="flex items-center gap-1.5 min-w-max">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BarChart className="w-4 h-4 text-blue-400" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('classes')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'classes'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>1. Class Management ({customClasses.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('subjects')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'subjects'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Laptop className="w-4 h-4" />
            <span>2. Subject Management ({customSubjects.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('chapters')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'chapters'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>3. Chapter Management ({customChapters.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('resources')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'resources'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>4. Chapter LMS Resources ({learningResources.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('materials')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'materials'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>5. Study Material ({studyMaterials.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('students')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'students'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>5. Student Roster ({registeredStudents.filter(s => s.role !== 'admin').length})</span>
          </button>

          <button
            onClick={() => setActiveTab('tests')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'tests'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>6. Online Tests ({labExams.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('results')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'results'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>7. Results & Reports ({allResultsRoster.length})</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* OVERVIEW DASHBOARD TAB */}
      {/* ============================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div 
              onClick={() => setActiveTab('classes')}
              className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Layers className="w-5 h-5" />
              </div>
              <p className="text-2xl font-black text-slate-900">{activeClassesCount} <span className="text-xs text-slate-400 font-normal">/ {totalClassesCount}</span></p>
              <p className="text-xs font-bold text-slate-500 uppercase mt-1">Active Classes</p>
            </div>

            <div 
              onClick={() => setActiveTab('subjects')}
              className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Laptop className="w-5 h-5" />
              </div>
              <p className="text-2xl font-black text-slate-900">{totalSubjectsCount}</p>
              <p className="text-xs font-bold text-slate-500 uppercase mt-1">Subjects Track</p>
            </div>

            <div 
              onClick={() => setActiveTab('chapters')}
              className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-purple-400 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <BookOpen className="w-5 h-5" />
              </div>
              <p className="text-2xl font-black text-slate-900">{totalChaptersCount}</p>
              <p className="text-xs font-bold text-slate-500 uppercase mt-1">Curriculum Chapters</p>
            </div>

            <div 
              onClick={() => setActiveTab('materials')}
              className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <p className="text-2xl font-black text-slate-900">{publishedMaterialsCount} <span className="text-xs text-slate-400 font-normal">/ {totalMaterialsCount}</span></p>
              <p className="text-xs font-bold text-slate-500 uppercase mt-1">Published Notes</p>
            </div>

            <div 
              onClick={() => setActiveTab('students')}
              className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-amber-400 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <p className="text-2xl font-black text-slate-900">{activeStudentsCount} <span className="text-xs text-slate-400 font-normal">/ {totalStudentsCount}</span></p>
              <p className="text-xs font-bold text-slate-500 uppercase mt-1">Active Students</p>
            </div>

            <div 
              onClick={() => setActiveTab('tests')}
              className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-rose-400 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Clock className="w-5 h-5" />
              </div>
              <p className="text-2xl font-black text-slate-900">{liveTestsCount} <span className="text-xs text-slate-400 font-normal">Live</span></p>
              <p className="text-xs font-bold text-slate-500 uppercase mt-1">{totalTestsCount} Scheduled Tests</p>
            </div>
          </div>

          {/* Quick Hub Navigation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <span>Curriculum Architecture</span>
                </h3>
                <span className="text-xs text-blue-600 font-bold">Modules 1–3</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Add, rename, reorder, activate, and manage Classes VI through XII, vocational subjects (IT 402, IP 065, Typo 817), and their textbook chapters.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  onClick={() => setActiveTab('classes')}
                  className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 font-bold text-xs hover:bg-blue-100 transition-colors cursor-pointer"
                >
                  Manage Classes →
                </button>
                <button
                  onClick={() => setActiveTab('subjects')}
                  className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs hover:bg-indigo-100 transition-colors cursor-pointer"
                >
                  Manage Subjects →
                </button>
                <button
                  onClick={() => setActiveTab('chapters')}
                  className="px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 font-bold text-xs hover:bg-purple-100 transition-colors cursor-pointer"
                >
                  Manage Chapters →
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span>Content & Notes Library</span>
                </h3>
                <span className="text-xs text-emerald-600 font-bold">Module 4</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Upload chapter PDFs, board previous year papers, question-answers, and lab files. Publish or replace documents with 1-click.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  onClick={() => {
                    setActiveTab('materials');
                    setIsAddMaterialModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors cursor-pointer"
                >
                  + Upload Study Material
                </button>
                <button
                  onClick={() => setShowPdfExtractor(true)}
                  className="px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 font-bold text-xs hover:bg-purple-100 transition-colors cursor-pointer"
                >
                  AI Extract MCQs
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <Award className="w-4 h-4 text-rose-600" />
                  <span>Examinations & Reports</span>
                </h3>
                <span className="text-xs text-rose-600 font-bold">Modules 5–7</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Schedule live online lab tests, monitor submissions, evaluate student answer sheets, and download Excel/CSV reports for school records.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  onClick={() => {
                    setActiveTab('tests');
                    setIsCreateTestModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 transition-colors cursor-pointer"
                >
                  + Create Online Test
                </button>
                <button
                  onClick={handleExportClassResultsToExcel}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Export Excel Results
                </button>
              </div>
            </div>
          </div>

          {/* Supabase & Cloud Deployment Health Monitor */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200 shadow-xs">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-slate-900">Supabase & Database Deployment Monitor</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      supabaseTestResult?.connected 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : isSupabaseConfigured() 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {supabaseTestResult?.connected ? 'Live Connected' : isSupabaseConfigured() ? 'Configured' : 'Needs Setup'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Live verification of database tables, RLS policies, storage bucket, and latency for deployment.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleTestSupabase}
                  disabled={supabaseTesting}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  <RefreshCw className={`w-4 h-4 ${supabaseTesting ? 'animate-spin' : ''}`} />
                  <span>{supabaseTesting ? 'Testing Connection...' : 'Test Supabase Connection'}</span>
                </button>
                <button
                  onClick={handleSyncAllToSupabase}
                  disabled={supabaseSyncing}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
                  title="Pushes all currently loaded curriculum, resources, questions, quizzes, exams, and student accounts to Supabase"
                >
                  <UploadCloud className={`w-4 h-4 ${supabaseSyncing ? 'animate-spin' : ''}`} />
                  <span>{supabaseSyncing ? 'Saving to Supabase...' : 'Save All App Data to Supabase'}</span>
                </button>
                <button
                  onClick={() => setShowSqlModal(true)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-slate-500" />
                  <span>View SQL Schema & Setup</span>
                </button>
              </div>
            </div>

            {/* Live Diagnostics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-500">API Endpoint</span>
                  <span className={`font-mono text-[11px] font-bold ${isSupabaseConfigured() ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {getSupabaseConfig().url ? 'Configured' : 'Missing Env Var'}
                  </span>
                </div>
                <p className="font-mono text-xs text-slate-700 truncate" title={getSupabaseConfig().url}>
                  {getSupabaseConfig().url || 'https://your-project.supabase.co'}
                </p>
                <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500">
                  <span className={`w-2 h-2 rounded-full ${getSupabaseConfig().hasAnonKey ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                  <span>Anon Key: {getSupabaseConfig().hasAnonKey ? 'Present (Protected)' : 'Missing'}</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-500">Response Latency</span>
                  <Activity className="w-4 h-4 text-blue-500" />
                </div>
                <p className="text-2xl font-black text-slate-900">
                  {supabaseTestResult ? `${supabaseTestResult.latencyMs} ms` : '—'}
                </p>
                <p className="text-[11px] text-slate-500">
                  {supabaseTestResult ? (supabaseTestResult.latencyMs < 300 ? '⚡ Ultra Fast (<300ms)' : 'Normal Response Time') : 'Click "Test Supabase Connection" to measure'}
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-500">Storage Bucket</span>
                  <span className="font-mono text-[11px] text-slate-400">pdf-materials</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${supabaseTestResult?.storage.pdfMaterialsBucket.ok ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                  <span className="text-xs font-bold text-slate-800">
                    {supabaseTestResult?.storage.pdfMaterialsBucket.ok ? 'Public Bucket Active' : 'Ready / Standby'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Stores uploaded PDF chapters and board materials.
                </p>
              </div>
            </div>

            {/* Table Health Badges if test was run */}
            {supabaseTestResult && (
              <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200/80 space-y-3 animate-in fade-in duration-150">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <p className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Table Accessibility Verification (12 Tables):</span>
                  </p>
                  <span className="text-[11px] text-emerald-700 font-medium">{supabaseTestResult.message}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 text-xs">
                  {Object.entries(supabaseTestResult.tables).map(([tableName, status]) => (
                    <div key={tableName} className={`p-2.5 rounded-xl border flex flex-col gap-1 ${
                      status.ok ? 'bg-white border-emerald-200 text-emerald-900 shadow-xs' : 'bg-rose-50 border-rose-200 text-rose-900'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-[11px] truncate">{tableName}</span>
                        <span className={`w-2 h-2 rounded-full ${status.ok ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {status.ok ? `${status.count ?? 0} records` : (status.error?.substring(0, 20) || 'Check RLS')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODULE 1: CLASS MANAGEMENT */}
      {/* ============================================================== */}
      {activeTab === 'classes' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden space-y-6 p-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900">Class Management</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800 uppercase">
                  Module 1
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Add, edit, rename, reorder, activate, deactivate, or delete classes. Changes automatically apply to student portal.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setEditingClass(null);
                  setClassFormData({ level: '', name: '', subtitle: '', isActive: true });
                  setIsAddClassModalOpen(true);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add New Class</span>
              </button>
            </div>
          </div>

          {/* Controls: Search, Filter, Status */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={classSearch}
                onChange={e => setClassSearch(e.target.value)}
                placeholder="Search classes..."
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Status:</span>
              <div className="flex rounded-xl bg-slate-200/80 p-0.5 text-xs">
                {(['ALL', 'active', 'inactive'] as const).map(st => (
                  <button
                    key={st}
                    onClick={() => setClassFilterStatus(st)}
                    className={`px-3 py-1 rounded-lg font-bold capitalize transition-all cursor-pointer ${
                      classFilterStatus === st ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Classes Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-slate-500 font-extrabold uppercase border-b border-slate-200">
                  <th className="py-3.5 px-4 w-16 text-center">Order</th>
                  <th className="py-3.5 px-4">Level</th>
                  <th className="py-3.5 px-4">Display Name</th>
                  <th className="py-3.5 px-4">Subtitle / Specialization</th>
                  <th className="py-3.5 px-4 text-center">Assigned Subjects</th>
                  <th className="py-3.5 px-4 text-center">Chapters</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredClasses.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      No classes found matching search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredClasses.map((cls, idx) => {
                    const isActive = cls.isActive !== false && cls.isHidden !== true;
                    const assignedSubs = customSubjects.filter(s => s.classes.includes(cls.level as ClassLevel)).length;
                    const chapCount = customChapters.filter(ch => ch.classLevel === cls.level).length;

                    return (
                      <tr key={cls.level} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 text-center font-bold text-slate-400">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              disabled={idx === 0}
                              onClick={() => {
                                reorderClasses(idx, idx - 1);
                                handleSyncToBackend();
                              }}
                              className="p-1 rounded hover:bg-slate-200 text-slate-500 disabled:opacity-30 cursor-pointer"
                              title="Move Class Up"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <span>{idx + 1}</span>
                            <button
                              disabled={idx === filteredClasses.length - 1}
                              onClick={() => {
                                reorderClasses(idx, idx + 1);
                                handleSyncToBackend();
                              }}
                              className="p-1 rounded hover:bg-slate-200 text-slate-500 disabled:opacity-30 cursor-pointer"
                              title="Move Class Down"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 font-black border border-blue-200">
                            Class {cls.level}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {cls.name}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">
                          {cls.subtitle}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">
                            {assignedSubs} Subjects
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">
                            {chapCount} Chapters
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => handleToggleClassActive(cls)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-colors ${
                              isActive
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                            }`}
                            title="Click to toggle activation"
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                            <span>{isActive ? 'Active' : 'Inactive'}</span>
                          </button>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setEditingClass(cls);
                                setClassFormData({
                                  level: cls.level,
                                  name: cls.name,
                                  subtitle: cls.subtitle,
                                  isActive: cls.isActive !== false && cls.isHidden !== true
                                });
                                setIsAddClassModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                              title="Edit / Rename Class"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteClass(cls.level)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Delete Class"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODULE 2: SUBJECT MANAGEMENT */}
      {/* ============================================================== */}
      {activeTab === 'subjects' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden space-y-6 p-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900">Subject Management</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-100 text-indigo-800 uppercase">
                  Module 2
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Add new vocational and academic subjects, edit CBSE codes, and assign subjects to specific classes.
              </p>
            </div>

            <button
              onClick={() => {
                setEditingSubject(null);
                setSubFormData({
                  id: '',
                  code: '',
                  name: '',
                  classes: ['X'],
                  description: '',
                  iconName: 'Laptop',
                  accentColor: 'from-blue-600 to-indigo-600',
                  isActive: true
                });
                setIsAddSubjectModalOpen(true);
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add New Subject</span>
            </button>
          </div>

          {/* Controls: Search, Filter by Class */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={subSearch}
                onChange={e => setSubSearch(e.target.value)}
                placeholder="Search subjects or codes..."
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Filter by Class:</span>
              <select
                value={subClassFilter}
                onChange={e => setSubClassFilter(e.target.value as any)}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-hidden focus:border-indigo-500"
              >
                <option value="ALL">All Classes</option>
                {customClasses.map(c => (
                  <option key={c.level} value={c.level}>Class {c.level}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Subjects Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-slate-500 font-extrabold uppercase border-b border-slate-200">
                  <th className="py-3.5 px-4 w-14 text-center">#</th>
                  <th className="py-3.5 px-4">Subject Code</th>
                  <th className="py-3.5 px-4">Subject Name</th>
                  <th className="py-3.5 px-4">Assigned Classes</th>
                  <th className="py-3.5 px-4">Description</th>
                  <th className="py-3.5 px-4 text-center">Chapters</th>
                  <th className="py-3.5 px-4 text-center">Materials</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSubjects.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      No subjects found matching search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredSubjects.map((sub, idx) => {
                    const chapsInSub = customChapters.filter(ch => ch.subjectId === sub.id).length;
                    const matsInSub = studyMaterials.filter(m => m.subjectId === sub.id).length;

                    return (
                      <tr key={sub.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 text-center font-bold text-slate-400">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              disabled={idx === 0}
                              onClick={() => {
                                reorderSubjects(idx, idx - 1);
                                handleSyncToBackend();
                              }}
                              className="p-1 rounded hover:bg-slate-200 text-slate-500 disabled:opacity-30 cursor-pointer"
                              title="Move Subject Up"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <span>{idx + 1}</span>
                            <button
                              disabled={idx === filteredSubjects.length - 1}
                              onClick={() => {
                                reorderSubjects(idx, idx + 1);
                                handleSyncToBackend();
                              }}
                              className="p-1 rounded hover:bg-slate-200 text-slate-500 disabled:opacity-30 cursor-pointer"
                              title="Move Subject Down"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-800 font-extrabold border border-indigo-200">
                            {sub.code}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {sub.name}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex flex-wrap gap-1">
                            {sub.classes.map(cl => (
                              <span key={cl} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[10px]">
                                Class {cl}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate" title={sub.description}>
                          {sub.description}
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                          {chapsInSub}
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                          {matsInSub}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setEditingSubject(sub);
                                setSubFormData({
                                  id: sub.id,
                                  code: sub.code,
                                  name: sub.name,
                                  classes: sub.classes,
                                  description: sub.description,
                                  iconName: sub.iconName || 'Laptop',
                                  accentColor: sub.accentColor || 'from-blue-600 to-indigo-600',
                                  isActive: sub.isActive !== false && sub.isHidden !== true
                                });
                                setIsAddSubjectModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                              title="Edit Subject"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteSubject(sub)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Delete Subject"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODULE 3: CHAPTER MANAGEMENT */}
      {/* ============================================================== */}
      {activeTab === 'chapters' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden space-y-6 p-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900">Chapter Management</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-800 uppercase">
                  Module 3
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Add textbook chapters, assign chapters to class and subject, and reorder. Protected from accidental deletion if materials exist.
              </p>
            </div>

            <button
              onClick={() => {
                setEditingChapter(null);
                setChapFormData({
                  id: '',
                  classLevel: chapClassFilter !== 'ALL' ? chapClassFilter : 'X',
                  subjectId: chapSubjectFilter !== 'ALL' ? chapSubjectFilter : 'it-402',
                  chapterNumber: customChapters.length + 1,
                  title: '',
                  description: '',
                  topics: '',
                  isActive: true
                });
                setIsAddChapterModalOpen(true);
              }}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add New Chapter</span>
            </button>
          </div>

          {/* Controls: Search, Filter by Class, Filter by Subject */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={chapSearch}
                onChange={e => setChapSearch(e.target.value)}
                placeholder="Search chapters by title..."
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-purple-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-500">Class:</span>
                <select
                  value={chapClassFilter}
                  onChange={e => setChapClassFilter(e.target.value as any)}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                >
                  <option value="ALL">All Classes</option>
                  {customClasses.map(c => (
                    <option key={c.level} value={c.level}>Class {c.level}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-500">Subject:</span>
                <select
                  value={chapSubjectFilter}
                  onChange={e => setChapSubjectFilter(e.target.value as any)}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                >
                  <option value="ALL">All Subjects</option>
                  {customSubjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Chapters Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-slate-500 font-extrabold uppercase border-b border-slate-200">
                  <th className="py-3.5 px-4 w-14 text-center">Order</th>
                  <th className="py-3.5 px-4">Chapter #</th>
                  <th className="py-3.5 px-4">Chapter Title</th>
                  <th className="py-3.5 px-4">Class</th>
                  <th className="py-3.5 px-4">Subject</th>
                  <th className="py-3.5 px-4 text-center">Study Notes</th>
                  <th className="py-3.5 px-4 text-center">MCQ Bank</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredChapters.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      No chapters found. Click &quot;Add New Chapter&quot; above to create chapter definitions.
                    </td>
                  </tr>
                ) : (
                  filteredChapters.map((ch, idx) => {
                    const subObj = customSubjects.find(s => s.id === ch.subjectId);
                    const matCount = studyMaterials.filter(m => m.chapterId === ch.id || m.chapterTitle.toLowerCase() === ch.title.toLowerCase()).length;
                    const qCount = questionBank.filter(q => q.chapterId === ch.id || q.chapterTitle?.toLowerCase() === ch.title.toLowerCase()).length;

                    return (
                      <tr key={ch.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 text-center font-bold text-slate-400">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              disabled={idx === 0}
                              onClick={() => {
                                reorderChapters(idx, idx - 1);
                                handleSyncToBackend();
                              }}
                              className="p-1 rounded hover:bg-slate-200 text-slate-500 disabled:opacity-30 cursor-pointer"
                              title="Move Chapter Up"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <span>{idx + 1}</span>
                            <button
                              disabled={idx === filteredChapters.length - 1}
                              onClick={() => {
                                reorderChapters(idx, idx + 1);
                                handleSyncToBackend();
                              }}
                              className="p-1 rounded hover:bg-slate-200 text-slate-500 disabled:opacity-30 cursor-pointer"
                              title="Move Chapter Down"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-800 font-extrabold border border-purple-200">
                            Ch {ch.chapterNumber}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {ch.title}
                          <p className="text-[11px] text-slate-400 font-normal line-clamp-1">{ch.description}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold">
                            Class {ch.classLevel}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-700">
                          {subObj ? `${subObj.name} (${subObj.code})` : ch.subjectId}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded font-bold ${matCount > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                            {matCount} Notes
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded font-bold ${qCount > 0 ? 'bg-purple-50 text-purple-700' : 'bg-slate-100 text-slate-400'}`}>
                            {qCount} Questions
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setEditingChapter(ch);
                                setChapFormData({
                                  id: ch.id,
                                  classLevel: ch.classLevel,
                                  subjectId: ch.subjectId,
                                  chapterNumber: ch.chapterNumber,
                                  title: ch.title,
                                  description: ch.description,
                                  topics: ch.topics ? ch.topics.join(', ') : '',
                                  isActive: ch.isActive !== false && ch.isHidden !== true
                                });
                                setIsAddChapterModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-slate-600 hover:text-purple-600 hover:bg-purple-50 transition-colors cursor-pointer"
                              title="Edit Chapter"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteChapter(ch)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Delete Chapter"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODULE: CHAPTER LMS RESOURCES MANAGEMENT */}
      {/* ============================================================== */}
      {activeTab === 'resources' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden space-y-6 p-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900">Chapter LMS Learning Resources</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800 uppercase">
                  Class → Subject → Chapter → Resources
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Add, edit, replace, reorder, publish, unpublish, and delete chapter-wise study materials, Q&As, MCQs, practicals, PYQs, and chapter tests.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  setLmsResourceToEdit(null);
                  setIsLmsReplaceMode(false);
                  setIsLmsFormModalOpen(true);
                }}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add Chapter Resource</span>
              </button>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
            {/* Search */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Search</label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={lmsResSearch}
                  onChange={e => setLmsResSearch(e.target.value)}
                  placeholder="Filter resources..."
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-slate-800"
                />
              </div>
            </div>

            {/* Class Filter */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Class</label>
              <select
                value={lmsResClassFilter}
                onChange={e => setLmsResClassFilter(e.target.value as ClassLevel | 'ALL')}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-medium"
              >
                <option value="ALL">All Classes</option>
                {customClasses.map(c => (
                  <option key={c.level} value={c.level}>Class {c.level}</option>
                ))}
              </select>
            </div>

            {/* Subject Filter */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Subject</label>
              <select
                value={lmsResSubjectFilter}
                onChange={e => setLmsResSubjectFilter(e.target.value as SubjectId | 'ALL')}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-medium"
              >
                <option value="ALL">All Subjects</option>
                {customSubjects.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                ))}
              </select>
            </div>

            {/* Chapter Filter */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Chapter</label>
              <select
                value={lmsResChapterFilter}
                onChange={e => setLmsResChapterFilter(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-medium"
              >
                <option value="ALL">All Chapters</option>
                {customChapters.map(c => (
                  <option key={c.id} value={c.id}>Class {c.classLevel} - Ch {c.chapterNumber}: {c.title}</option>
                ))}
              </select>
            </div>

            {/* Resource Type Filter */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Resource Type</label>
              <select
                value={lmsResTypeFilter}
                onChange={e => setLmsResTypeFilter(e.target.value as ChapterResourceType | 'ALL')}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-medium"
              >
                <option value="ALL">All Types (8 Types)</option>
                <option value="notes">Notes & Study Material</option>
                <option value="qa">Question Answers</option>
                <option value="important_questions">Important Questions</option>
                <option value="mcq">MCQs</option>
                <option value="practical_assignment">Practical & Assignments</option>
                <option value="pyq">Previous-Year Papers</option>
                <option value="revision">Revision Material</option>
                <option value="chapter_test">Online Chapter Tests</option>
              </select>
            </div>
          </div>

          {/* Resources Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-3 w-16 text-center">Order</th>
                  <th className="py-3 px-4">Resource & Type</th>
                  <th className="py-3 px-4">Class & Subject</th>
                  <th className="py-3 px-4">Chapter</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLmsResources.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-400">
                      No learning resources found matching current filters.
                    </td>
                  </tr>
                ) : (
                  filteredLmsResources.map((res, idx) => (
                    <tr key={res.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => reorderLearningResources(res.chapterId, idx, idx - 1)}
                            disabled={idx === 0}
                            className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-20 cursor-pointer"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-mono font-bold text-slate-600">{res.order}</span>
                          <button
                            onClick={() => reorderLearningResources(res.chapterId, idx, idx + 1)}
                            disabled={idx === filteredLmsResources.length - 1}
                            className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-20 cursor-pointer"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <span className="font-bold text-slate-900 block">{res.title}</span>
                          <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                            {res.resourceType.replace('_', ' ')}
                          </span>
                          {res.fileName && (
                            <span className="text-[11px] text-slate-400 block font-mono">
                              File: {res.fileName}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-800">Class {res.classLevel}</span>
                        <span className="text-slate-500 block text-[11px]">{res.subjectId}</span>
                      </td>

                      <td className="py-3 px-4 text-slate-700 font-medium">
                        {res.chapterTitle || res.chapterId}
                      </td>

                      <td className="py-3 px-4">
                        <button
                          onClick={() => {
                            togglePublishLearningResource(res.id);
                            showToast(`Status changed to ${res.published ? 'Draft' : 'Published'}`);
                          }}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider cursor-pointer ${
                            res.published 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {res.published ? 'Published' : 'Draft'}
                        </button>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setLmsResourceToEdit(res);
                              setIsLmsReplaceMode(false);
                              setIsLmsFormModalOpen(true);
                            }}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                            title="Edit Resource"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              setLmsResourceToEdit(res);
                              setIsLmsReplaceMode(true);
                              setIsLmsFormModalOpen(true);
                            }}
                            className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg cursor-pointer"
                            title="Replace File"
                          >
                            <Upload className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setLmsResourceToDelete(res)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                            title="Delete Resource"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Form Modal */}
          <LmsResourceFormModal
            isOpen={isLmsFormModalOpen}
            onClose={() => {
              setIsLmsFormModalOpen(false);
              setLmsResourceToEdit(null);
              setIsLmsReplaceMode(false);
            }}
            resourceToEdit={lmsResourceToEdit}
            isReplaceMode={isLmsReplaceMode}
          />

          {/* Delete Dialog */}
          {lmsResourceToDelete && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-slate-200">
                <div className="flex items-center gap-3 text-rose-600">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">Confirm Resource Deletion</h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Are you sure you want to permanently delete <strong>"{lmsResourceToDelete.title}"</strong>?
                </p>
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => setLmsResourceToDelete(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      deleteLearningResource(lmsResourceToDelete.id);
                      showToast(`Resource "${lmsResourceToDelete.title}" deleted.`);
                      setLmsResourceToDelete(null);
                    }}
                    className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                  >
                    Delete Resource
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* MODULE 4: STUDY MATERIAL MANAGEMENT */}
      {/* ============================================================== */}
      {activeTab === 'materials' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden space-y-6 p-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900">Study Material & PDF Management</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 uppercase">
                  Module 4
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Upload, replace, edit, publish, unpublish, and delete chapter notes, previous-year papers, question answers, practical files, and cheat sheets.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowChapterPdfUploader(true)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>Upload PDF File</span>
              </button>

              <button
                onClick={() => {
                  setEditingMaterial(null);
                  setMaterialForm({
                    title: '',
                    classLevel: matClassFilter !== 'ALL' ? matClassFilter : 'X',
                    subjectId: matSubjectFilter !== 'ALL' ? matSubjectFilter : 'it-402',
                    chapterId: '',
                    chapterTitle: '',
                    type: 'notes',
                    description: '',
                    readTimeMinutes: 15,
                    author: 'Zakir Hussain (PGT Computer Science)',
                    content: '',
                    tags: 'CBSE, Notes, 2026',
                    downloadableFileName: '',
                    pdfDataUrl: undefined,
                    published: true
                  });
                  setIsAddMaterialModalOpen(true);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create Material</span>
              </button>
            </div>
          </div>

          {/* Controls: Search, Filters (Class, Subject, Type, Published Status) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200/80 text-xs">
            <div className="relative sm:col-span-2 lg:col-span-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={matSearch}
                onChange={e => {
                  setMatSearch(e.target.value);
                  setMatCurrentPage(1);
                }}
                placeholder="Search notes & titles..."
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            <div>
              <select
                value={matClassFilter}
                onChange={e => {
                  setMatClassFilter(e.target.value as any);
                  setMatCurrentPage(1);
                }}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-bold"
              >
                <option value="ALL">All Classes</option>
                {customClasses.map(c => (
                  <option key={c.level} value={c.level}>Class {c.level}</option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={matSubjectFilter}
                onChange={e => {
                  setMatSubjectFilter(e.target.value as any);
                  setMatCurrentPage(1);
                }}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-bold"
              >
                <option value="ALL">All Subjects</option>
                {customSubjects.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={matTypeFilter}
                onChange={e => {
                  setMatTypeFilter(e.target.value as any);
                  setMatCurrentPage(1);
                }}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-bold"
              >
                <option value="ALL">All Formats</option>
                <option value="notes">Chapter Notes (PDF)</option>
                <option value="previous_year_paper">Previous Year Paper (PYQ)</option>
                <option value="important_questions">Important Questions & Answers</option>
                <option value="practical_file">Practical Lab File</option>
                <option value="cheat_sheet">Quick Cheat Sheet</option>
                <option value="video">Video Lecture</option>
              </select>
            </div>

            <div>
              <select
                value={matPublishFilter}
                onChange={e => {
                  setMatPublishFilter(e.target.value as any);
                  setMatCurrentPage(1);
                }}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-bold"
              >
                <option value="ALL">All Statuses</option>
                <option value="published">Published Online</option>
                <option value="draft">Draft (Unpublished)</option>
              </select>
            </div>
          </div>

          {/* Materials Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-slate-500 font-extrabold uppercase border-b border-slate-200">
                  <th className="py-3.5 px-4">Title & Chapter</th>
                  <th className="py-3.5 px-4">Class & Subject</th>
                  <th className="py-3.5 px-4">Format Type</th>
                  <th className="py-3.5 px-4">File / Size</th>
                  <th className="py-3.5 px-4">Uploaded</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pagedMaterials.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No study materials found matching the selected filters.
                    </td>
                  </tr>
                ) : (
                  pagedMaterials.map(mat => {
                    const isPub = mat.published !== false;
                    const isPYQ = mat.type === 'previous_year_paper';

                    return (
                      <tr key={mat.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 max-w-xs">
                          <p className="font-bold text-slate-900 truncate" title={mat.title}>
                            {mat.title}
                          </p>
                          <p className="text-[11px] text-blue-600 font-semibold truncate">
                            {mat.chapterTitle}
                          </p>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-800">Class {mat.classLevel}</span>
                          <p className="text-[10px] text-slate-400 font-medium">{mat.subjectId}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded font-extrabold text-[10px] uppercase border ${
                            isPYQ 
                              ? 'bg-rose-50 text-rose-700 border-rose-200' 
                              : mat.type === 'notes' 
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}>
                            {mat.type === 'previous_year_paper' ? 'PYQ Paper' : mat.type.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          <span className="font-semibold block truncate max-w-[120px]">{mat.downloadableFileName || 'PDF Document'}</span>
                          <span className="text-[10px] text-slate-400">{mat.fileSize || 'Standard PDF'}</span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                          {mat.uploadedDate || 'Recent'}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => {
                              togglePublishMaterial(mat.id);
                              showToast(`Material "${mat.title}" is now ${isPub ? 'Unpublished (Draft)' : 'Published'}.`);
                              handleSyncToBackend();
                            }}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-colors ${
                              isPub
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                            }`}
                            title="Click to publish/unpublish"
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${isPub ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                            <span>{isPub ? 'Published' : 'Draft'}</span>
                          </button>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Replace File Button */}
                            <button
                              onClick={() => {
                                setReplacingMaterial(mat);
                                replaceFileInputRef.current?.click();
                              }}
                              className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-700 font-bold text-[11px] transition-colors cursor-pointer"
                              title="Upload a new file to replace this document"
                            >
                              Replace
                            </button>

                            {/* Edit Material Details */}
                            <button
                              onClick={() => {
                                setEditingMaterial(mat);
                                setMaterialForm({
                                  title: mat.title,
                                  classLevel: mat.classLevel,
                                  subjectId: mat.subjectId,
                                  chapterId: mat.chapterId,
                                  chapterTitle: mat.chapterTitle,
                                  type: mat.type,
                                  description: mat.description,
                                  readTimeMinutes: mat.readTimeMinutes || 15,
                                  author: mat.author || 'Zakir Hussain (PGT CS)',
                                  content: mat.content || '',
                                  tags: mat.tags ? mat.tags.join(', ') : '',
                                  downloadableFileName: mat.downloadableFileName || '',
                                  pdfDataUrl: mat.pdfDataUrl,
                                  published: mat.published !== false
                                });
                                setIsAddMaterialModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                              title="Edit Material Metadata"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            {/* Delete Material */}
                            <button
                              onClick={() => handleDeleteMaterial(mat)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Delete Material"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalMaterialPages > 1 && (
            <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
              <span>Showing Page {matCurrentPage} of {totalMaterialPages} ({filteredMaterials.length} total)</span>
              <div className="flex items-center gap-1">
                <button
                  disabled={matCurrentPage === 1}
                  onClick={() => setMatCurrentPage(prev => Math.max(1, prev - 1))}
                  className="px-3 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                >
                  Previous
                </button>
                {Array.from({ length: totalMaterialPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => setMatCurrentPage(p)}
                    className={`w-7 h-7 rounded-lg font-bold cursor-pointer ${matCurrentPage === p ? 'bg-emerald-600 text-white' : 'hover:bg-slate-100'}`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  disabled={matCurrentPage === totalMaterialPages}
                  onClick={() => setMatCurrentPage(prev => Math.min(totalMaterialPages, prev + 1))}
                  className="px-3 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Hidden File Input for Replacement */}
          <input
            ref={replaceFileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={e => {
              if (e.target.files && e.target.files[0]) {
                handleFileReplacement(e.target.files[0]);
              }
            }}
          />
        </div>
      )}

      {/* ============================================================== */}
      {/* MODULE 5: STUDENT MANAGEMENT */}
      {/* ============================================================== */}
      {activeTab === 'students' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden space-y-6 p-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900">Student Account Management</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 uppercase">
                  Module 5
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                View student directory, assign class & section, activate or deactivate accounts, securely reset passwords, and bulk import from Excel.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setIsBulkModalOpen(true)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Bulk Import (Excel / CSV)</span>
              </button>

              <button
                onClick={() => {
                  setEditingStudent(null);
                  setStudentFormData({
                    name: '',
                    username: '',
                    rollNumber: '',
                    email: '',
                    studentId: '',
                    classLevel: 'X',
                    section: 'A',
                    schoolName: 'Zakir Learning Hub Partner School',
                    password: ''
                  });
                  setIsAddStudentModalOpen(true);
                }}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Enroll Student</span>
              </button>
            </div>
          </div>

          {/* Controls: Search, Filters (Class, Section, Status) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200/80 text-xs">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={studentSearch}
                onChange={e => {
                  setStudentSearch(e.target.value);
                  setStudentCurrentPage(1);
                }}
                placeholder="Search name, email, roll ID..."
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div>
              <select
                value={studentClassFilter}
                onChange={e => {
                  setStudentClassFilter(e.target.value as any);
                  setStudentCurrentPage(1);
                }}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-bold"
              >
                <option value="ALL">All Classes</option>
                {customClasses.map(c => (
                  <option key={c.level} value={c.level}>Class {c.level}</option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={studentSectionFilter}
                onChange={e => {
                  setStudentSectionFilter(e.target.value);
                  setStudentCurrentPage(1);
                }}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-bold"
              >
                <option value="ALL">All Sections</option>
                <option value="A">Section A</option>
                <option value="B">Section B</option>
                <option value="C">Section C</option>
                <option value="D">Section D</option>
              </select>
            </div>

            <div>
              <select
                value={studentStatusFilter}
                onChange={e => {
                  setStudentStatusFilter(e.target.value as any);
                  setStudentCurrentPage(1);
                }}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-bold"
              >
                <option value="ALL">All Account Statuses</option>
                <option value="active">Active Accounts</option>
                <option value="locked">Deactivated / Locked</option>
              </select>
            </div>
          </div>

          {/* Students Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-slate-500 font-extrabold uppercase border-b border-slate-200">
                  <th className="py-3.5 px-4">Student ID / Roll</th>
                  <th className="py-3.5 px-4">Student Name & Username</th>
                  <th className="py-3.5 px-4">Email Address</th>
                  <th className="py-3.5 px-4">Class & Section</th>
                  <th className="py-3.5 px-4">School</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pagedStudents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No student accounts found matching the criteria.
                    </td>
                  </tr>
                ) : (
                  pagedStudents.map(st => {
                    const isLocked = st.isLocked === true;

                    return (
                      <tr key={st.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-slate-700">
                          <div className="font-bold">{st.studentId || `STD-${st.classLevel}-${st.id.slice(-4)}`}</div>
                          <div className="text-[10px] text-slate-400">Roll: {st.rollNumber || '—'}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{st.name}</div>
                          <div className="text-[10px] font-mono text-blue-600 font-semibold">
                            @{st.username || st.email.split('@')[0]}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                          {st.email}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 font-bold">
                            Class {st.classLevel} - {st.section || 'A'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate" title={st.schoolName}>
                          {st.schoolName || 'Zakir Learning Hub Partner'}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => handleToggleLockStudent(st)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-colors ${
                              !isLocked
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                            }`}
                            title="Toggle account activation"
                          >
                            {!isLocked ? <Unlock className="w-3 h-3 text-emerald-600" /> : <Lock className="w-3 h-3 text-rose-600" />}
                            <span>{!isLocked ? 'Active' : 'Locked'}</span>
                          </button>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Reset Password Button */}
                            <button
                              onClick={() => {
                                setResetPasswordStudent(st);
                                setNewPasswordValue('');
                              }}
                              className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-amber-50 text-slate-600 hover:text-amber-700 font-bold text-[11px] transition-colors cursor-pointer"
                              title="Reset Student Password"
                            >
                              Reset Key
                            </button>

                            {/* Edit Student Details */}
                            <button
                              onClick={() => {
                                setEditingStudent(st);
                                setStudentFormData({
                                  name: st.name,
                                  username: st.username || '',
                                  rollNumber: st.rollNumber || '',
                                  email: st.email,
                                  studentId: st.studentId || '',
                                  classLevel: st.classLevel,
                                  section: st.section || 'A',
                                  schoolName: st.schoolName || '',
                                  password: ''
                                });
                                setIsAddStudentModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-slate-600 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                              title="Edit Class / Section / Name"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            {/* Delete Student */}
                            <button
                              onClick={() => handleDeleteStudent(st)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Delete Student"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalStudentPages > 1 && (
            <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
              <span>Showing Page {studentCurrentPage} of {totalStudentPages} ({filteredStudents.length} students)</span>
              <div className="flex items-center gap-1">
                <button
                  disabled={studentCurrentPage === 1}
                  onClick={() => setStudentCurrentPage(prev => Math.max(1, prev - 1))}
                  className="px-3 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                >
                  Previous
                </button>
                {Array.from({ length: totalStudentPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => setStudentCurrentPage(p)}
                    className={`w-7 h-7 rounded-lg font-bold cursor-pointer ${studentCurrentPage === p ? 'bg-amber-600 text-white' : 'hover:bg-slate-100'}`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  disabled={studentCurrentPage === totalStudentPages}
                  onClick={() => setStudentCurrentPage(prev => Math.min(totalStudentPages, prev + 1))}
                  className="px-3 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* MODULE 6: TEST MANAGEMENT */}
      {/* ============================================================== */}
      {activeTab === 'tests' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden space-y-6 p-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900">Online Examination & Test Management</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 uppercase">
                  Module 6
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Create, edit, schedule, assign, publish, and close online tests and Computer Lab examinations for Classes VI–XII.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleOpenAuditLogs()}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                title="View Server Audit Logs of Exam Starts, Submissions, Interruptions"
              >
                <ShieldCheck className="w-4 h-4 text-slate-500" />
                <span>Audit Logs</span>
              </button>

              <button
                onClick={() => {
                  if (labExams.length > 0) {
                    handleOpenLabMonitor(labExams[0]);
                  } else {
                    showToast('Create a test first to monitor lab sessions.');
                  }
                }}
                className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl border border-blue-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Monitor lab workstations, active students, disconnects in real-time"
              >
                <Monitor className="w-4 h-4 text-blue-600" />
                <span>Live Lab Monitor</span>
              </button>

              <button
                onClick={() => {
                  setEditingTest(null);
                  setTestFormData({
                    title: '',
                    examCode: `TEST-X-${Date.now().toString().slice(-4)}`,
                    classLevel: testClassFilter !== 'ALL' ? testClassFilter : 'X',
                    subjectId: testSubjectFilter !== 'ALL' ? testSubjectFilter : 'it-402',
                    chapterId: '',
                    topic: '',
                    section: 'ALL',
                    assignedGroup: 'All Students',
                    assignedStudentIds: [],
                    examDate: new Date().toISOString().split('T')[0],
                    startTime: '10:00',
                    endTime: '11:00',
                    durationMinutes: 45,
                    totalMarks: 25,
                    passingMarks: 10,
                    negativeMarking: 0,
                    attemptLimit: 1,
                    status: 'scheduled',
                    instructions: 'Read questions carefully. Answers are saved continuously in real-time. Test submits automatically at 00:00.',
                    shuffleQuestions: true,
                    shuffleOptions: true,
                    showResultsImmediately: false,
                    showAnswerKeysToStudents: false,
                    questions: []
                  });
                  setIsCreateTestModalOpen(true);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create New Test</span>
              </button>
            </div>
          </div>

          {/* Controls: Search, Filter (Class, Subject, Status) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200/80 text-xs">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={testSearch}
                onChange={e => setTestSearch(e.target.value)}
                placeholder="Search test title or exam code..."
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-rose-500"
              />
            </div>

            <div>
              <select
                value={testClassFilter}
                onChange={e => setTestClassFilter(e.target.value as any)}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-bold"
              >
                <option value="ALL">All Classes</option>
                {customClasses.map(c => (
                  <option key={c.level} value={c.level}>Class {c.level}</option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={testSubjectFilter}
                onChange={e => setTestSubjectFilter(e.target.value as any)}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-bold"
              >
                <option value="ALL">All Subjects</option>
                {customSubjects.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={testStatusFilter}
                onChange={e => setTestStatusFilter(e.target.value as any)}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-bold"
              >
                <option value="ALL">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="live">Live Now (In Progress)</option>
                <option value="closed">Closed / Finished</option>
              </select>
            </div>
          </div>

          {/* Tests Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-slate-500 font-extrabold uppercase border-b border-slate-200">
                  <th className="py-3.5 px-4">Exam Code</th>
                  <th className="py-3.5 px-4">Test Title</th>
                  <th className="py-3.5 px-4">Class & Subject</th>
                  <th className="py-3.5 px-4">Date & Duration</th>
                  <th className="py-3.5 px-4 text-center">Marks</th>
                  <th className="py-3.5 px-4 text-center">Questions</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTests.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      No online tests found. Click &quot;Create New Test&quot; above to schedule an examination.
                    </td>
                  </tr>
                ) : (
                  filteredTests.map(test => {
                    const subObj = customSubjects.find(s => s.id === test.subjectId);

                    return (
                      <tr key={test.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                          {test.examCode}
                        </td>
                        <td className="py-3.5 px-4 max-w-xs">
                          <p className="font-bold text-slate-900 truncate" title={test.title}>
                            {test.title}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Assigned: Section {test.section || 'ALL'} ({test.assignedGroup || 'All Students'})
                          </p>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-800">Class {test.classLevel}</span>
                          <p className="text-[10px] text-slate-400">{subObj ? subObj.name : test.subjectId}</p>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          <span className="font-semibold block">{test.examDate} @ {test.startTime}</span>
                          <span className="text-[10px] text-slate-400">{test.durationMinutes} Minutes Duration</span>
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                          {test.totalMarks} <span className="text-[10px] text-slate-400 font-normal">(Pass: {test.passingMarks})</span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-bold">
                            {test.questions.length} Questions
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 shadow-2xs">
                            <select
                              value={test.status}
                              onChange={e => handleUpdateTestStatus(test.id, e.target.value as LabExamStatus)}
                              className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase cursor-pointer ${
                                test.status === 'live' 
                                  ? 'bg-rose-600 text-white animate-pulse' 
                                  : test.status === 'scheduled' 
                                    ? 'bg-blue-100 text-blue-800' 
                                    : test.status === 'closed'
                                      ? 'bg-slate-100 text-slate-600'
                                      : test.status === 'cancelled'
                                        ? 'bg-rose-100 text-rose-800 line-through'
                                        : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              <option value="draft">Draft</option>
                              <option value="scheduled">Scheduled</option>
                              <option value="live">Live (Active)</option>
                              <option value="closed">Closed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                const dup = duplicateLabExam(test.id);
                                if (dup) {
                                  showToast(`Test duplicated as "${dup.title}". Saved as draft.`);
                                  handleSyncToBackend();
                                }
                              }}
                              className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                              title="Duplicate Examination (Create exact copy as draft)"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedExamForPreview(test);
                                setIsPreviewTestModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                              title="Preview Test (Student Examination View)"
                            >
                              <BookOpen className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenLabMonitor(test)}
                              className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                              title="Live Lab Invigilator Monitor (Workstations & Sessions)"
                            >
                              <Monitor className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingTest(test);
                                setTestFormData({
                                  title: test.title,
                                  examCode: test.examCode,
                                  classLevel: test.classLevel,
                                  subjectId: test.subjectId,
                                  chapterId: test.chapterId || '',
                                  topic: test.topic || '',
                                  section: test.section || 'ALL',
                                  assignedGroup: test.assignedGroup || 'All Students',
                                  assignedStudentIds: test.assignedStudentIds || [],
                                  examDate: test.examDate,
                                  startTime: test.startTime,
                                  endTime: test.endTime || '',
                                  durationMinutes: test.durationMinutes,
                                  totalMarks: test.totalMarks,
                                  passingMarks: test.passingMarks,
                                  negativeMarking: test.negativeMarking || 0,
                                  attemptLimit: test.attemptLimit || 1,
                                  status: test.status,
                                  instructions: test.instructions,
                                  shuffleQuestions: test.shuffleQuestions,
                                  shuffleOptions: test.shuffleOptions,
                                  showResultsImmediately: test.showResultsImmediately,
                                  showAnswerKeysToStudents: test.showAnswerKeysToStudents,
                                  questions: test.questions
                                });
                                setIsCreateTestModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Edit Test & Questions"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteTest(test)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Delete Test"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODULE 7: RESULTS MANAGEMENT & EXPORT */}
      {/* ============================================================== */}
      {activeTab === 'results' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden space-y-6 p-6 animate-in fade-in duration-200">
          
          {/* HEADER & CONTROLS */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900">Examination Results & Performance Analytics</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-100 text-teal-800 uppercase">
                  Module 7
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Comprehensive evaluation dashboard, question-wise mastery, descriptive manual scoring, and certified CBSE reports.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* View Switcher: Table vs Analytics */}
              <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setResultViewMode('table')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    resultViewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-teal-600" />
                  <span>Student Results Roster</span>
                </button>
                <button
                  type="button"
                  onClick={() => setResultViewMode('analytics')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    resultViewMode === 'analytics' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <BarChart className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Class & Test Analytics</span>
                </button>
              </div>

              {/* Downloadable Reports Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsExportMenuOpen(prev => !prev)}
                  className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Export Reports</span>
                </button>

                {isExportMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-30 text-xs animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3 py-1.5 border-b border-slate-100 font-bold text-slate-400 uppercase text-[10px]">
                      Download Official Records
                    </div>
                    <button
                      type="button"
                      onClick={handleExportClassResultsToExcel}
                      className="w-full text-left px-3.5 py-2 hover:bg-teal-50 text-slate-700 hover:text-teal-900 flex items-center gap-2 cursor-pointer"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                      <span>Class Results Excel (.xlsx)</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleExportClassResultsToCSV}
                      className="w-full text-left px-3.5 py-2 hover:bg-teal-50 text-slate-700 hover:text-teal-900 flex items-center gap-2 cursor-pointer"
                    >
                      <FileText className="w-4 h-4 text-teal-600" />
                      <span>Class Results (CSV)</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleExportSubjectWiseSummary}
                      className="w-full text-left px-3.5 py-2 hover:bg-teal-50 text-slate-700 hover:text-teal-900 flex items-center gap-2 cursor-pointer"
                    >
                      <Laptop className="w-4 h-4 text-indigo-600" />
                      <span>Subject-Wise Summary (CSV)</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleExportTestWiseSummary}
                      className="w-full text-left px-3.5 py-2 hover:bg-teal-50 text-slate-700 hover:text-teal-900 flex items-center gap-2 cursor-pointer"
                    >
                      <Clock className="w-4 h-4 text-rose-600" />
                      <span>Test-Wise Summary (CSV)</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleExportChapterWiseSummary}
                      className="w-full text-left px-3.5 py-2 hover:bg-teal-50 text-slate-700 hover:text-teal-900 flex items-center gap-2 cursor-pointer"
                    >
                      <BookOpen className="w-4 h-4 text-purple-600" />
                      <span>Chapter Mastery (CSV)</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* PERFORMANCE SUMMARY KPI CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
              <p className="text-[11px] font-bold text-slate-500 uppercase">Assigned</p>
              <p className="text-xl font-black text-slate-900 mt-0.5">{classAnalytics.assignedCount}</p>
              <span className="text-[10px] text-slate-400">Total Enrolled</span>
            </div>

            <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200/80">
              <p className="text-[11px] font-bold text-emerald-700 uppercase">Submitted</p>
              <p className="text-xl font-black text-emerald-800 mt-0.5">{classAnalytics.submittedCount}</p>
              <span className="text-[10px] text-emerald-600">Tests Turned In</span>
            </div>

            <div className="bg-amber-50/80 p-3.5 rounded-2xl border border-amber-200/80">
              <p className="text-[11px] font-bold text-amber-700 uppercase">Pending Eval</p>
              <p className="text-xl font-black text-amber-800 mt-0.5 flex items-center gap-1.5">
                <span>{statusCounts.pending_eval}</span>
                {statusCounts.pending_eval > 0 && <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />}
              </p>
              <span className="text-[10px] text-amber-600">Subjective Items</span>
            </div>

            <div className="bg-rose-50/70 p-3.5 rounded-2xl border border-rose-200/80">
              <p className="text-[11px] font-bold text-rose-700 uppercase">Absent / Missed</p>
              <p className="text-xl font-black text-rose-800 mt-0.5">{classAnalytics.absentCount}</p>
              <span className="text-[10px] text-rose-600">Not Completed</span>
            </div>

            <div className="bg-blue-50/70 p-3.5 rounded-2xl border border-blue-200/80">
              <p className="text-[11px] font-bold text-blue-700 uppercase">Pass Rate</p>
              <p className="text-xl font-black text-blue-800 mt-0.5">{classAnalytics.classPassPercentage}%</p>
              <span className="text-[10px] text-blue-600">Passing Cutoff</span>
            </div>

            <div className="bg-purple-50/70 p-3.5 rounded-2xl border border-purple-200/80">
              <p className="text-[11px] font-bold text-purple-700 uppercase">Class Average</p>
              <p className="text-xl font-black text-purple-800 mt-0.5">{classAnalytics.averagePercentage}%</p>
              <span className="text-[10px] text-purple-600">Mean Score: {classAnalytics.averageScore}</span>
            </div>

            <div className="bg-teal-50/70 p-3.5 rounded-2xl border border-teal-200/80">
              <p className="text-[11px] font-bold text-teal-700 uppercase">Highest Score</p>
              <p className="text-xl font-black text-teal-800 mt-0.5">
                {classAnalytics.highestRecord ? `${classAnalytics.highestRecord.score} / ${classAnalytics.highestRecord.totalMarks}` : '-'}
              </p>
              <span className="text-[10px] text-teal-600 truncate block">
                {classAnalytics.highestRecord ? classAnalytics.highestRecord.studentName.split(' ')[0] : 'None'}
              </span>
            </div>
          </div>

          {/* FILTERS TOOLBAR */}
          <div className="space-y-3 bg-slate-50/80 p-4 rounded-2xl border border-slate-200 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5">
              
              {/* Search */}
              <div className="relative lg:col-span-2">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={resultSearch}
                  onChange={e => {
                    setResultSearch(e.target.value);
                    setResultCurrentPage(1);
                  }}
                  placeholder="Search student name, roll number, test..."
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-teal-500 font-medium"
                />
              </div>

              {/* Class Filter */}
              <div>
                <select
                  value={resultClassFilter}
                  onChange={e => {
                    setResultClassFilter(e.target.value as any);
                    setResultCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold"
                >
                  <option value="ALL">All Classes (VI–XII)</option>
                  {customClasses.map(c => (
                    <option key={c.level} value={c.level}>Class {c.level}</option>
                  ))}
                </select>
              </div>

              {/* Section Filter */}
              <div>
                <select
                  value={resultSectionFilter}
                  onChange={e => {
                    setResultSectionFilter(e.target.value);
                    setResultCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold"
                >
                  <option value="ALL">All Sections (A–D)</option>
                  <option value="A">Section A</option>
                  <option value="B">Section B</option>
                  <option value="C">Section C</option>
                  <option value="D">Section D</option>
                </select>
              </div>

              {/* Subject Filter */}
              <div>
                <select
                  value={resultSubjectFilter}
                  onChange={e => {
                    setResultSubjectFilter(e.target.value as any);
                    setResultCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold"
                >
                  <option value="ALL">All Subjects</option>
                  {customSubjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                  ))}
                </select>
              </div>

              {/* Test Selector */}
              <div>
                <select
                  value={resultTestFilter}
                  onChange={e => {
                    setResultTestFilter(e.target.value);
                    setResultCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold truncate"
                >
                  <option value="ALL">All Conducted Tests</option>
                  {labExams.map(ex => (
                    <option key={ex.id} value={ex.id}>{ex.title} (Class {ex.classLevel})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* STATUS TABS BAR (Distinct categorization of submitted, pending, in-progress, absent) */}
            <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-200">
              <span className="text-[11px] font-bold text-slate-400 mr-2 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" />
                Status View:
              </span>

              <button
                type="button"
                onClick={() => {
                  setResultStatusTab('all');
                  setResultCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  resultStatusTab === 'all'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                All Roster ({statusCounts.all})
              </button>

              <button
                type="button"
                onClick={() => {
                  setResultStatusTab('submitted');
                  setResultCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  resultStatusTab === 'submitted'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-200'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Submitted & Evaluated ({statusCounts.submitted})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setResultStatusTab('pending_eval');
                  setResultCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  resultStatusTab === 'pending_eval'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white hover:bg-amber-50 text-amber-800 border border-amber-200'
                }`}
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Pending Teacher Evaluation ({statusCounts.pending_eval})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setResultStatusTab('in_progress');
                  setResultCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  resultStatusTab === 'in_progress'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white hover:bg-blue-50 text-blue-800 border border-blue-200'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>In Progress ({statusCounts.in_progress})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setResultStatusTab('absent');
                  setResultCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  resultStatusTab === 'absent'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-white hover:bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Absent ({statusCounts.absent})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setResultStatusTab('not_attempted');
                  setResultCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  resultStatusTab === 'not_attempted'
                    ? 'bg-slate-700 text-white shadow-xs'
                    : 'bg-white hover:bg-slate-100 text-slate-500 border border-slate-200'
                }`}
              >
                Not Attempted ({statusCounts.not_attempted})
              </button>
            </div>
          </div>

          {/* VIEW MODE 1: DATA TABLE */}
          {resultViewMode === 'table' && (
            <div className="space-y-4">
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 text-slate-500 font-extrabold uppercase border-b border-slate-200">
                      <th className="py-3.5 px-4">Student</th>
                      <th className="py-3.5 px-4">Roll No / ID</th>
                      <th className="py-3.5 px-4">Class & Sec</th>
                      <th className="py-3.5 px-4">Test Title</th>
                      <th className="py-3.5 px-4">Date</th>
                      <th className="py-3.5 px-4 text-center">Score / Total</th>
                      <th className="py-3.5 px-4 text-center">Percentage</th>
                      <th className="py-3.5 px-4 text-center">Status</th>
                      <th className="py-3.5 px-4 text-center">Outcome</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pagedResults.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="py-12 text-center text-slate-400">
                          No student examination records match the current filters.
                        </td>
                      </tr>
                    ) : (
                      pagedResults.map(res => (
                        <tr key={res.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 font-black flex items-center justify-center text-[11px] shrink-0 border border-teal-200">
                                {res.studentName.charAt(0)}
                              </div>
                              <span className="font-bold text-slate-900">{res.studentName}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-600">
                            {res.rollNumber || 'N/A'}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold">
                              Class {res.classLevel}-{res.section}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 max-w-xs">
                            <p className="font-bold text-slate-800 truncate" title={res.testTitle}>
                              {res.testTitle}
                            </p>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {res.subjectId.toUpperCase()} • {res.chapterTitle || 'Curriculum'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                            {res.date}
                          </td>
                          <td className="py-3.5 px-4 text-center font-bold text-slate-900">
                            {res.score !== null ? (
                              <span>{res.score} / {res.totalMarks}</span>
                            ) : res.detailedStatus === 'in_progress' ? (
                              <span className="text-blue-600 font-medium italic">Active</span>
                            ) : (
                              <span className="text-slate-400">- / {res.totalMarks}</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-center font-black">
                            {res.percentage !== null ? (
                              <span className={res.percentage >= 75 ? 'text-emerald-600' : res.percentage >= 40 ? 'text-blue-600' : 'text-rose-600'}>
                                {res.percentage}%
                              </span>
                            ) : (
                              <span className="text-slate-400 font-normal">-</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              res.detailedStatus === 'submitted'
                                ? 'bg-emerald-100 text-emerald-800'
                                : res.detailedStatus === 'pending_eval'
                                  ? 'bg-amber-100 text-amber-800'
                                  : res.detailedStatus === 'in_progress'
                                    ? 'bg-blue-100 text-blue-800'
                                    : res.detailedStatus === 'absent'
                                      ? 'bg-rose-100 text-rose-800'
                                      : 'bg-slate-100 text-slate-600'
                            }`}>
                              {res.statusLabel}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {res.passed !== null ? (
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                res.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                              }`}>
                                {res.passed ? 'PASSED' : 'FAILED'}
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[11px]">-</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Review & Score action */}
                              {res.rawSession ? (
                                <button
                                  type="button"
                                  onClick={() => handleOpenEvaluationModal(res.rawSession!)}
                                  className="px-2.5 py-1 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 font-bold text-[11px] transition-colors cursor-pointer flex items-center gap-1"
                                  title="Evaluate descriptive answers & adjust marks"
                                >
                                  <Edit3 className="w-3 h-3" />
                                  <span>{res.detailedStatus === 'pending_eval' ? 'Grade Answers' : 'Review & Score'}</span>
                                </button>
                              ) : null}

                              {/* Performance Report Action */}
                              <button
                                type="button"
                                onClick={() => setSelectedResultForReport(res)}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-[11px] transition-colors cursor-pointer flex items-center gap-1"
                                title="View individual student performance report card"
                              >
                                <Award className="w-3 h-3 text-amber-500" />
                                <span>Report Card</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalResultPages > 1 && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-2 pt-2">
                  <span>Showing Page {resultCurrentPage} of {totalResultPages} ({filteredResults.length} records)</span>
                  <div className="flex items-center gap-1">
                    <button
                      disabled={resultCurrentPage === 1}
                      onClick={() => setResultCurrentPage(prev => Math.max(1, prev - 1))}
                      className="px-3 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                    >
                      Previous
                    </button>
                    {Array.from({ length: totalResultPages }, (_, i) => i + 1).map(p => (
                      <button
                        key={p}
                        onClick={() => setResultCurrentPage(p)}
                        className={`w-7 h-7 rounded-lg font-bold cursor-pointer ${resultCurrentPage === p ? 'bg-teal-600 text-white' : 'hover:bg-slate-100'}`}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      disabled={resultCurrentPage === totalResultPages}
                      onClick={() => setResultCurrentPage(prev => Math.min(totalResultPages, prev + 1))}
                      className="px-3 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VIEW MODE 2: CLASS & TEST ANALYTICS */}
          {resultViewMode === 'analytics' && (
            <div className="space-y-6">
              
              {/* Analytics Header with Scope Selector */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    <BarChart className="w-4 h-4 text-indigo-600" />
                    <span>Curriculum Mastery & Diagnostic Analysis</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Real-time aggregated score distributions, question difficulties, and intervention recommendations.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-slate-600 whitespace-nowrap">Focus Test:</label>
                  <select
                    value={analyticsSelectedTestId}
                    onChange={e => setAnalyticsSelectedTestId(e.target.value)}
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-bold text-xs"
                  >
                    <option value="ALL">All Conducted Tests (Aggregated)</option>
                    {labExams.map(ex => (
                      <option key={ex.id} value={ex.id}>{ex.title} (Class {ex.classLevel})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Grade & Score Distribution Histogram */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold text-emerald-800">
                    <span>Distinction (75%–100%)</span>
                    <span>{classAnalytics.distinctionCount} Students</span>
                  </div>
                  <div className="w-full bg-emerald-200/50 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-emerald-600 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${classAnalytics.submittedCount > 0 ? (classAnalytics.distinctionCount / classAnalytics.submittedCount) * 100 : 0}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-emerald-700">Mastery demonstrated on core competencies.</p>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold text-blue-800">
                    <span>First Class (60%–74%)</span>
                    <span>{classAnalytics.firstClassCount} Students</span>
                  </div>
                  <div className="w-full bg-blue-200/50 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-blue-600 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${classAnalytics.submittedCount > 0 ? (classAnalytics.firstClassCount / classAnalytics.submittedCount) * 100 : 0}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-blue-700">Proficient understanding with minor gaps.</p>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold text-amber-800">
                    <span>Pass Grade (40%–59%)</span>
                    <span>{classAnalytics.passGradeCount} Students</span>
                  </div>
                  <div className="w-full bg-amber-200/50 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-amber-600 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${classAnalytics.submittedCount > 0 ? (classAnalytics.passGradeCount / classAnalytics.submittedCount) * 100 : 0}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-amber-700">Satisfactory; recommended for chapter revision.</p>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-50 to-red-50 border border-rose-200 space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold text-rose-800">
                    <span>Needs Remedial (&lt; 40%)</span>
                    <span>{classAnalytics.needsPracticeCount} Students</span>
                  </div>
                  <div className="w-full bg-rose-200/50 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-rose-600 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${classAnalytics.submittedCount > 0 ? (classAnalytics.needsPracticeCount / classAnalytics.submittedCount) * 100 : 0}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-rose-700">Target for teacher intervention and practice.</p>
                </div>
              </div>

              {/* CHAPTER-WISE MASTERY PROGRESS BARS */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-extrabold text-slate-900 text-xs flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-purple-600" />
                    <span>Curriculum Chapter-Wise Mastery Average</span>
                  </h4>
                  <span className="text-[11px] text-slate-500">{classAnalytics.chapterStats.length} Chapters Assessed</span>
                </div>

                {classAnalytics.chapterStats.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">No chapter evaluation records available yet.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {classAnalytics.chapterStats.map((ch, idx) => (
                      <div key={idx} className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-800 truncate" title={ch.chapter}>{ch.chapter}</span>
                          <span className="font-black text-slate-900 shrink-0 ml-2">{ch.averagePercentage}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              ch.averagePercentage >= 75 ? 'bg-emerald-500' : ch.averagePercentage >= 50 ? 'bg-blue-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${ch.averagePercentage}%` }}
                          />
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-slate-400">
                          <span>{ch.attemptsCount} attempts</span>
                          <span className={ch.averagePercentage >= 75 ? 'text-emerald-700 font-bold' : ch.averagePercentage >= 50 ? 'text-blue-700 font-medium' : 'text-rose-700 font-bold'}>
                            {ch.averagePercentage >= 75 ? 'Strong Mastery' : ch.averagePercentage >= 50 ? 'Moderate' : 'Needs Reinforcement'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* QUESTION-WISE PERFORMANCE ANALYSIS */}
              {classAnalytics.questionStats.length > 0 && (
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-extrabold text-slate-900 text-xs flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-teal-600" />
                      <span>Question-Wise Performance & Difficulty Matrix</span>
                    </h4>
                    <span className="text-[11px] text-slate-500">{classAnalytics.questionStats.length} Questions</span>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 font-extrabold uppercase border-b border-slate-200">
                          <th className="py-2.5 px-3">Q#</th>
                          <th className="py-2.5 px-3">Question Prompt</th>
                          <th className="py-2.5 px-3">Type</th>
                          <th className="py-2.5 px-3">Difficulty</th>
                          <th className="py-2.5 px-3 text-center">Marks</th>
                          <th className="py-2.5 px-3 text-center">Correct / Attempts</th>
                          <th className="py-2.5 px-3 text-center">Accuracy %</th>
                          <th className="py-2.5 px-3 text-right">Rating</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {classAnalytics.questionStats.map(q => (
                          <tr key={q.questionId} className="hover:bg-slate-50/70">
                            <td className="py-2.5 px-3 font-bold font-mono text-slate-700">Q{q.qIndex}</td>
                            <td className="py-2.5 px-3 font-medium text-slate-900 max-w-md truncate" title={q.questionText}>
                              {q.questionText}
                            </td>
                            <td className="py-2.5 px-3 uppercase text-[10px] font-bold text-slate-500">{q.type.replace('_', ' ')}</td>
                            <td className="py-2.5 px-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                q.difficulty === 'hard' ? 'bg-rose-100 text-rose-800' : q.difficulty === 'medium' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                              }`}>
                                {q.difficulty}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-center font-bold">{q.marks}</td>
                            <td className="py-2.5 px-3 text-center font-mono">{q.correctCount} / {q.attemptCount}</td>
                            <td className="py-2.5 px-3 text-center font-black">
                              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${q.statusColor}`}>
                                {q.accuracyRate}%
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <span className="text-[10px] font-bold text-slate-500">
                                {q.accuracyRate >= 70 ? 'High Mastery' : q.accuracyRate >= 45 ? 'Moderate' : 'Challenging Item'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* STUDENTS REQUIRING ADDITIONAL PRACTICE / INTERVENTION */}
              <div className="bg-rose-50/40 p-5 rounded-2xl border border-rose-200/80 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-xs flex items-center gap-2">
                      <Target className="w-4 h-4 text-rose-600" />
                      <span>Students Requiring Additional Practice & Intervention ({classAnalytics.studentsNeedingPractice.length})</span>
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Learners scoring below passing threshold or requiring remedial focus based on actual scores.
                    </p>
                  </div>

                  {classAnalytics.studentsNeedingPractice.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        const headers = ["Student Name", "Roll No", "Class", "Section", "Test", "Marks", "Percentage", "Intervention Needed"];
                        const rows = classAnalytics.studentsNeedingPractice.map(st => [
                          `"${st.studentName}"`,
                          `"${st.rollNumber}"`,
                          `"Class ${st.classLevel}"`,
                          `"${st.section}"`,
                          `"${st.testTitle.replace(/"/g, '""')}"`,
                          `${st.score} / ${st.totalMarks}`,
                          `"${st.percentage}%"`,
                          `"Remedial Practice in ${st.chapterTitle || 'Core Concepts'}"`
                        ]);
                        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
                        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.setAttribute('download', `CBSE_Intervention_Roster_${new Date().toISOString().split('T')[0]}.csv`);
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        showToast('Intervention roster exported!');
                      }}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export Intervention Roster</span>
                    </button>
                  )}
                </div>

                {classAnalytics.studentsNeedingPractice.length === 0 ? (
                  <div className="py-6 text-center text-xs text-emerald-700 font-bold bg-white rounded-xl border border-emerald-200">
                    🎉 Excellent! All assessed students in this scope have met or exceeded the passing threshold!
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-rose-200 bg-white">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-rose-50 text-rose-900 font-extrabold uppercase border-b border-rose-200">
                          <th className="py-2.5 px-3">Student Name</th>
                          <th className="py-2.5 px-3">Roll No</th>
                          <th className="py-2.5 px-3">Class & Sec</th>
                          <th className="py-2.5 px-3">Exam Title</th>
                          <th className="py-2.5 px-3 text-center">Score</th>
                          <th className="py-2.5 px-3 text-center">Percentage</th>
                          <th className="py-2.5 px-3">Weak Topic / Chapter</th>
                          <th className="py-2.5 px-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-rose-100">
                        {classAnalytics.studentsNeedingPractice.map(st => (
                          <tr key={st.id} className="hover:bg-rose-50/50">
                            <td className="py-2.5 px-3 font-bold text-slate-900">{st.studentName}</td>
                            <td className="py-2.5 px-3 font-mono text-slate-600">{st.rollNumber}</td>
                            <td className="py-2.5 px-3 font-semibold text-slate-700">Class {st.classLevel}-{st.section}</td>
                            <td className="py-2.5 px-3 max-w-xs truncate text-slate-800">{st.testTitle}</td>
                            <td className="py-2.5 px-3 text-center font-bold text-rose-700">{st.score} / {st.totalMarks}</td>
                            <td className="py-2.5 px-3 text-center font-black text-rose-700">{st.percentage}%</td>
                            <td className="py-2.5 px-3 text-slate-600 font-medium">{st.chapterTitle || 'Chapter Fundamentals'}</td>
                            <td className="py-2.5 px-3 text-right">
                              <button
                                type="button"
                                onClick={() => setSelectedResultForReport(st)}
                                className="px-2.5 py-1 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold text-[11px] transition-colors cursor-pointer"
                              >
                                View Diagnostics
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 1: ADD / EDIT CLASS FORM */}
      {/* ============================================================== */}
      {isAddClassModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-600" />
                <span>{editingClass ? `Edit Class ${editingClass.level}` : 'Add New Class'}</span>
              </h3>
              <button onClick={() => setIsAddClassModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveClass} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Class Level (Identifier)</label>
                <input
                  type="text"
                  required
                  value={classFormData.level}
                  onChange={e => setClassFormData({ ...classFormData, level: e.target.value.toUpperCase() })}
                  placeholder="e.g. X, XI, XII"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold bg-slate-50"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Display Name</label>
                <input
                  type="text"
                  required
                  value={classFormData.name}
                  onChange={e => setClassFormData({ ...classFormData, name: e.target.value })}
                  placeholder="e.g. Class X (Secondary Board)"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Subtitle / Specialization</label>
                <input
                  type="text"
                  value={classFormData.subtitle}
                  onChange={e => setClassFormData({ ...classFormData, subtitle: e.target.value })}
                  placeholder="e.g. CBSE Board Focus: IT (Code 402)"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="class-active-chk"
                  checked={classFormData.isActive}
                  onChange={e => setClassFormData({ ...classFormData, isActive: e.target.checked })}
                  className="rounded text-blue-600 cursor-pointer"
                />
                <label htmlFor="class-active-chk" className="font-bold text-slate-700 cursor-pointer">
                  Activate Class immediately on student website
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddClassModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer"
                >
                  {editingClass ? 'Update Class' : 'Save Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: ADD / EDIT SUBJECT FORM */}
      {/* ============================================================== */}
      {isAddSubjectModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Laptop className="w-5 h-5 text-indigo-600" />
                <span>{editingSubject ? `Edit ${editingSubject.name}` : 'Add New Subject'}</span>
              </h3>
              <button onClick={() => setIsAddSubjectModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubject} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">CBSE Subject Code</label>
                  <input
                    type="text"
                    required
                    value={subFormData.code}
                    onChange={e => setSubFormData({ ...subFormData, code: e.target.value })}
                    placeholder="e.g. CBSE 402, CBSE 065"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold bg-slate-50"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Internal Subject ID</label>
                  <input
                    type="text"
                    value={subFormData.id}
                    disabled={!!editingSubject}
                    onChange={e => setSubFormData({ ...subFormData, id: e.target.value })}
                    placeholder="e.g. it-402, ip-065"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono text-[11px] bg-slate-50 disabled:opacity-60"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Subject Full Name</label>
                <input
                  type="text"
                  required
                  value={subFormData.name}
                  onChange={e => setSubFormData({ ...subFormData, name: e.target.value })}
                  placeholder="e.g. Information Technology"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Assign to Classes (Checkboxes)</label>
                <div className="grid grid-cols-4 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  {customClasses.map(cls => {
                    const checked = subFormData.classes.includes(cls.level as ClassLevel);
                    return (
                      <label key={cls.level} className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={e => {
                            if (e.target.checked) {
                              setSubFormData({
                                ...subFormData,
                                classes: [...subFormData.classes, cls.level as ClassLevel]
                              });
                            } else {
                              setSubFormData({
                                ...subFormData,
                                classes: subFormData.classes.filter(c => c !== cls.level)
                              });
                            }
                          }}
                          className="rounded text-indigo-600"
                        />
                        <span className="font-bold text-slate-700">Class {cls.level}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Subject Curriculum Description</label>
                <textarea
                  rows={2}
                  value={subFormData.description}
                  onChange={e => setSubFormData({ ...subFormData, description: e.target.value })}
                  placeholder="Key concepts, board units, practical syllabus overview..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddSubjectModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer"
                >
                  {editingSubject ? 'Update Subject' : 'Save Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: ADD / EDIT CHAPTER FORM */}
      {/* ============================================================== */}
      {isAddChapterModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-600" />
                <span>{editingChapter ? `Edit Chapter: ${editingChapter.title}` : 'Add New Chapter'}</span>
              </h3>
              <button onClick={() => setIsAddChapterModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveChapter} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Target Class Level</label>
                  <select
                    value={chapFormData.classLevel}
                    onChange={e => setChapFormData({ ...chapFormData, classLevel: e.target.value as ClassLevel })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold bg-white"
                  >
                    {customClasses.map(c => (
                      <option key={c.level} value={c.level}>Class {c.level}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Target Subject</label>
                  <select
                    value={chapFormData.subjectId}
                    onChange={e => setChapFormData({ ...chapFormData, subjectId: e.target.value as SubjectId })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold bg-white"
                  >
                    {customSubjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="font-bold text-slate-700 block mb-1">Chapter #</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={chapFormData.chapterNumber}
                    onChange={e => setChapFormData({ ...chapFormData, chapterNumber: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-center"
                  />
                </div>

                <div className="col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Chapter Title</label>
                  <input
                    type="text"
                    required
                    value={chapFormData.title}
                    onChange={e => setChapFormData({ ...chapFormData, title: e.target.value })}
                    placeholder="e.g. Electronic Spreadsheets (Calc)"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Chapter Overview & Notes Summary</label>
                <textarea
                  rows={2}
                  value={chapFormData.description}
                  onChange={e => setChapFormData({ ...chapFormData, description: e.target.value })}
                  placeholder="Formulas, functions, consolidation, scenarios, goal seek..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Sub-Topics (comma separated)</label>
                <input
                  type="text"
                  value={chapFormData.topics}
                  onChange={e => setChapFormData({ ...chapFormData, topics: e.target.value })}
                  placeholder="Consolidate Data, Goal Seek, Solver, Macros"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddChapterModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold cursor-pointer"
                >
                  {editingChapter ? 'Update Chapter' : 'Save Chapter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 4: CREATE / EDIT STUDY MATERIAL FORM */}
      {/* ============================================================== */}
      {isAddMaterialModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <span>{editingMaterial ? `Edit: ${editingMaterial.title}` : 'Publish New Study Material'}</span>
              </h3>
              <button onClick={() => setIsAddMaterialModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMaterial} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Class</label>
                  <select
                    value={materialForm.classLevel}
                    onChange={e => setMaterialForm({ ...materialForm, classLevel: e.target.value as ClassLevel })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold bg-white"
                  >
                    {customClasses.map(c => (
                      <option key={c.level} value={c.level}>Class {c.level}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Subject</label>
                  <select
                    value={materialForm.subjectId}
                    onChange={e => setMaterialForm({ ...materialForm, subjectId: e.target.value as SubjectId })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold bg-white"
                  >
                    {customSubjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Format Type</label>
                  <select
                    value={materialForm.type}
                    onChange={e => setMaterialForm({ ...materialForm, type: e.target.value as MaterialType })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold bg-white"
                  >
                    <option value="notes">Chapter Notes (PDF)</option>
                    <option value="previous_year_paper">Previous Year Paper (PYQ)</option>
                    <option value="important_questions">Important Q&A</option>
                    <option value="practical_file">Practical Lab File</option>
                    <option value="cheat_sheet">Quick Cheat Sheet</option>
                    <option value="video">Video Lecture</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Document Title</label>
                <input
                  type="text"
                  required
                  value={materialForm.title}
                  onChange={e => setMaterialForm({ ...materialForm, title: e.target.value })}
                  placeholder="e.g. CBSE Class X Information Technology Board Question Paper 2024"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Chapter Heading</label>
                  <input
                    type="text"
                    value={materialForm.chapterTitle}
                    onChange={e => setMaterialForm({ ...materialForm, chapterTitle: e.target.value })}
                    placeholder="e.g. Electronic Spreadsheets (Advanced)"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Estimated Reading Time (Mins)</label>
                  <input
                    type="number"
                    min={1}
                    value={materialForm.readTimeMinutes}
                    onChange={e => setMaterialForm({ ...materialForm, readTimeMinutes: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description / Summary</label>
                <textarea
                  rows={2}
                  value={materialForm.description}
                  onChange={e => setMaterialForm({ ...materialForm, description: e.target.value })}
                  placeholder="Official question paper with model answers and step-by-step marking schemes..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Notes Content (Markdown / Text)</label>
                <textarea
                  rows={5}
                  value={materialForm.content}
                  onChange={e => setMaterialForm({ ...materialForm, content: e.target.value })}
                  placeholder="# Chapter Notes Heading&#10;&#10;Key definitions, formulas, and step-by-step solutions..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono text-[11px]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="mat-pub-chk"
                  checked={materialForm.published}
                  onChange={e => setMaterialForm({ ...materialForm, published: e.target.checked })}
                  className="rounded text-emerald-600 cursor-pointer"
                />
                <label htmlFor="mat-pub-chk" className="font-bold text-slate-700 cursor-pointer">
                  Publish immediately on Student Study Material & PYQ page
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddMaterialModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                >
                  {editingMaterial ? 'Update Material' : 'Publish Material'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 5: ADD / EDIT STUDENT ENROLLMENT */}
      {/* ============================================================== */}
      {isAddStudentModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-amber-600" />
                <span>{editingStudent ? `Edit Student: ${editingStudent.name}` : 'Enroll New Student'}</span>
              </h3>
              <button onClick={() => setIsAddStudentModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Student Full Name</label>
                  <input
                    type="text"
                    required
                    value={studentFormData.name}
                    onChange={e => setStudentFormData({ ...studentFormData, name: e.target.value })}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Username (Login ID)</label>
                  <input
                    type="text"
                    value={studentFormData.username}
                    onChange={e => setStudentFormData({ ...studentFormData, username: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                    placeholder="e.g. rahul_x"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Admission / Roll No</label>
                  <input
                    type="text"
                    value={studentFormData.rollNumber}
                    onChange={e => setStudentFormData({ ...studentFormData, rollNumber: e.target.value })}
                    placeholder="e.g. 1024"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Unique Student ID</label>
                  <input
                    type="text"
                    value={studentFormData.studentId}
                    onChange={e => setStudentFormData({ ...studentFormData, studentId: e.target.value })}
                    placeholder="e.g. STD-X-1024"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono text-[11px]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={studentFormData.email}
                  onChange={e => setStudentFormData({ ...studentFormData, email: e.target.value })}
                  placeholder="rahul.sharma@school.edu"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Class Level</label>
                  <select
                    value={studentFormData.classLevel}
                    onChange={e => setStudentFormData({ ...studentFormData, classLevel: e.target.value as ClassLevel })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold bg-white"
                  >
                    {customClasses.map(c => (
                      <option key={c.level} value={c.level}>Class {c.level}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Section</label>
                  <select
                    value={studentFormData.section}
                    onChange={e => setStudentFormData({ ...studentFormData, section: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold bg-white"
                  >
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                    <option value="D">Section D</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Password</label>
                <input
                  type="text"
                  value={studentFormData.password}
                  onChange={e => setStudentFormData({ ...studentFormData, password: e.target.value })}
                  placeholder={editingStudent ? '(Leave blank to keep current password)' : 'Student@123'}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">School / Institution Name</label>
                <input
                  type="text"
                  value={studentFormData.schoolName}
                  onChange={e => setStudentFormData({ ...studentFormData, schoolName: e.target.value })}
                  placeholder="Zakir Learning Hub Partner School"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddStudentModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold cursor-pointer"
                >
                  {editingStudent ? 'Update Student' : 'Enroll Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: RESET PASSWORD FOR STUDENT */}
      {/* ============================================================== */}
      {resetPasswordStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-600" />
                <span>Reset Access: {resetPasswordStudent.name}</span>
              </h3>
              <button onClick={() => setResetPasswordStudent(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResetPasswordSubmit} className="space-y-4 text-xs">
              <p className="text-slate-500 leading-relaxed">
                Enter a new secure password for <strong>{resetPasswordStudent.name}</strong> ({resetPasswordStudent.email}). The student can immediately sign in using this new key.
              </p>

              <div>
                <label className="font-bold text-slate-700 block mb-1">New Password</label>
                <input
                  type="text"
                  required
                  value={newPasswordValue}
                  onChange={e => setNewPasswordValue(e.target.value)}
                  placeholder="e.g. Student@2026"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold bg-slate-50"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setResetPasswordStudent(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold cursor-pointer"
                >
                  Save New Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: BULK EXCEL STUDENT IMPORT */}
      {/* ============================================================== */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <span>Bulk Student Import (Excel / CSV)</span>
              </h3>
              <button onClick={() => setIsBulkModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <p className="text-slate-500 leading-relaxed">
                Upload a spreadsheet (.xlsx or .csv) containing student records. Headers should include: <strong>Student Name, Username, Email, Roll Number, Class, Section</strong>.
              </p>

              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-600 font-semibold">Need a sample template?</span>
                <button
                  type="button"
                  onClick={() => {
                    const csvHeader = "Student Name,Username,Email,Roll Number,Class,Section,Password,School Name\nRahul Sharma,rahul_x,rahul.sharma@school.edu,1024,X,A,Student@123,Delhi Public School\nPriya Patel,priya_xii,priya.patel@school.edu,1208,XII,B,Student@123,Kendriya Vidyalaya\nAman Verma,aman_ix,aman.verma@school.edu,9015,IX,A,Student@123,Modern School";
                    const blob = new Blob([csvHeader], { type: 'text/csv;charset=utf-8' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = 'students_import_template.csv';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                  }}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Download Sample CSV Template</span>
                </button>
              </div>

              <div className="p-4 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 text-center space-y-2">
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleBulkExcelUpload}
                  className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer"
                />
              </div>

              {bulkError && (
                <div className="p-3 bg-rose-50 text-rose-800 rounded-xl font-medium border border-rose-200">
                  {bulkError}
                </div>
              )}

              {parsedBulkStudents.length > 0 && (
                <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 space-y-2">
                  <p className="font-bold">✓ Parsed {parsedBulkStudents.length} student records ready for import!</p>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {parsedBulkStudents.slice(0, 5).map((s, idx) => (
                      <p key={idx} className="text-[11px] text-emerald-900 truncate">
                        • {s.name} ({s.email}) — Class {s.classLevel}
                      </p>
                    ))}
                    {parsedBulkStudents.length > 5 && (
                      <p className="text-[10px] text-emerald-700">...and {parsedBulkStudents.length - 5} more records.</p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsBulkModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={parsedBulkStudents.length === 0}
                  onClick={handleConfirmBulkEnroll}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer disabled:opacity-40"
                >
                  Enroll {parsedBulkStudents.length} Students
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 6: CREATE / EDIT ONLINE TEST & QUESTIONS */}
      {/* ============================================================== */}
      {isCreateTestModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Clock className="w-5 h-5 text-rose-600" />
                <span>{editingTest ? `Edit Test: ${editingTest.title}` : 'Create Online Examination / Lab Test'}</span>
              </h3>
              <button onClick={() => setIsCreateTestModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTest} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Test Title</label>
                  <input
                    type="text"
                    required
                    value={testFormData.title}
                    onChange={e => setTestFormData({ ...testFormData, title: e.target.value })}
                    placeholder="e.g. Class X IT 402 - Term 1 Computer Lab Practical"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Exam Code</label>
                  <input
                    type="text"
                    required
                    value={testFormData.examCode}
                    onChange={e => setTestFormData({ ...testFormData, examCode: e.target.value })}
                    placeholder="e.g. LAB-X-IT-402-2026"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono text-[11px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Class Level</label>
                  <select
                    value={testFormData.classLevel}
                    onChange={e => setTestFormData({ ...testFormData, classLevel: e.target.value as ClassLevel })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold bg-white"
                  >
                    {customClasses.map(c => (
                      <option key={c.level} value={c.level}>Class {c.level}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Subject</label>
                  <select
                    value={testFormData.subjectId}
                    onChange={e => setTestFormData({ ...testFormData, subjectId: e.target.value as SubjectId })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold bg-white"
                  >
                    {customSubjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Chapter (Curriculum)</label>
                  <select
                    value={testFormData.chapterId || ''}
                    onChange={e => setTestFormData({ ...testFormData, chapterId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold bg-white"
                  >
                    <option value="">All / Comprehensive</option>
                    {customChapters
                      .filter(ch => ch.classLevel === testFormData.classLevel && ch.subjectId === testFormData.subjectId)
                      .map(ch => (
                        <option key={ch.id} value={ch.id}>Ch {ch.chapterNumber}: {ch.title.slice(0, 24)}...</option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Topic / Unit</label>
                  <input
                    type="text"
                    value={testFormData.topic || ''}
                    onChange={e => setTestFormData({ ...testFormData, topic: e.target.value })}
                    placeholder="e.g. LibreOffice Styles / SQL DDL"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Assigned Section</label>
                  <select
                    value={testFormData.section}
                    onChange={e => setTestFormData({ ...testFormData, section: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold bg-white"
                  >
                    <option value="ALL">All Sections (A, B, C, D)</option>
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                    <option value="D">Section D</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Assigned Group</label>
                  <select
                    value={testFormData.assignedGroup}
                    onChange={e => setTestFormData({ ...testFormData, assignedGroup: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold bg-white"
                  >
                    <option value="All Students">All Enrolled Students</option>
                    <option value="Lab Batch 1">Lab Batch 1 (Roll 1-30)</option>
                    <option value="Lab Batch 2">Lab Batch 2 (Roll 31-60)</option>
                    <option value="Remedial / Retest">Remedial / Retest Group</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Status</label>
                  <select
                    value={testFormData.status}
                    onChange={e => setTestFormData({ ...testFormData, status: e.target.value as LabExamStatus })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold bg-white"
                  >
                    <option value="draft">Draft</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="live">Live (Active Now in Lab)</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Attempt Limit</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={testFormData.attemptLimit}
                    onChange={e => setTestFormData({ ...testFormData, attemptLimit: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Exam Date</label>
                  <input
                    type="date"
                    value={testFormData.examDate}
                    onChange={e => setTestFormData({ ...testFormData, examDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Start Time</label>
                  <input
                    type="time"
                    value={testFormData.startTime}
                    onChange={e => setTestFormData({ ...testFormData, startTime: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">End Time</label>
                  <input
                    type="time"
                    value={testFormData.endTime}
                    onChange={e => setTestFormData({ ...testFormData, endTime: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Duration (Mins)</label>
                  <input
                    type="number"
                    min={5}
                    value={testFormData.durationMinutes}
                    onChange={e => setTestFormData({ ...testFormData, durationMinutes: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Negative Mark/Wrong</label>
                  <input
                    type="number"
                    min={0}
                    step={0.25}
                    value={testFormData.negativeMarking}
                    onChange={e => setTestFormData({ ...testFormData, negativeMarking: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={testFormData.shuffleQuestions}
                    onChange={e => setTestFormData({ ...testFormData, shuffleQuestions: e.target.checked })}
                    className="rounded text-rose-600"
                  />
                  <span>Shuffle Questions</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={testFormData.shuffleOptions}
                    onChange={e => setTestFormData({ ...testFormData, shuffleOptions: e.target.checked })}
                    className="rounded text-rose-600"
                  />
                  <span>Shuffle Options</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={testFormData.showResultsImmediately}
                    onChange={e => setTestFormData({ ...testFormData, showResultsImmediately: e.target.checked })}
                    className="rounded text-rose-600"
                  />
                  <span>Show Score Immediately</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={testFormData.showAnswerKeysToStudents}
                    onChange={e => setTestFormData({ ...testFormData, showAnswerKeysToStudents: e.target.checked })}
                    className="rounded text-rose-600"
                  />
                  <span>Release Answers</span>
                </label>
              </div>

              {/* QUESTION AUTHORING SECTION */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/60 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
                  <h4 className="font-extrabold text-slate-800 text-xs flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-rose-600" />
                    <span>Questions in this Test ({testFormData.questions.length} Questions • Total Marks: {testFormData.totalMarks})</span>
                  </h4>

                  {/* Question Bank Picker Button */}
                  <button
                    type="button"
                    onClick={() => setIsQBankPickerOpen(true)}
                    className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg text-xs border border-indigo-200 flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Import from Question Bank ({questionBank.length})</span>
                  </button>
                </div>

                {/* Existing Questions List */}
                {testFormData.questions.length > 0 && (
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {testFormData.questions.map((q, qIndex) => (
                      <div key={q.id} className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-800">
                            {qIndex + 1}. {q.question}
                          </p>
                          <span className="text-[10px] text-slate-400 font-medium">
                            Type: {q.type.toUpperCase()} • Marks: {q.marks} {q.negativeMarks ? `• Neg: -${q.negativeMarks}` : ''} • Answer: {Array.isArray(q.correctAnswer) ? q.correctAnswer.join(', ') : String(q.correctAnswer)}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveQuestionFromTest(q.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add New Question Form */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-3">
                  <span className="font-bold text-slate-700 block">Add New Question</span>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <div>
                      <label className="text-[11px] text-slate-500 font-semibold block mb-0.5">Question Type</label>
                      <select
                        value={newQuestionForm.type}
                        onChange={e => setNewQuestionForm({ ...newQuestionForm, type: e.target.value as any })}
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                      >
                        <option value="mcq">MCQ (Single Select)</option>
                        <option value="multiple_select">Multiple-Select (Checkboxes)</option>
                        <option value="true_false">True / False</option>
                        <option value="fill_blank">Fill in the Blanks</option>
                        <option value="short_answer">Descriptive / Theory</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-500 font-semibold block mb-0.5">Marks (+)</label>
                      <input
                        type="number"
                        min={1}
                        value={newQuestionForm.marks}
                        onChange={e => setNewQuestionForm({ ...newQuestionForm, marks: Number(e.target.value) })}
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-center font-bold"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-500 font-semibold block mb-0.5">Negative Marks (-)</label>
                      <input
                        type="number"
                        min={0}
                        step={0.25}
                        value={newQuestionForm.negativeMarks}
                        onChange={e => setNewQuestionForm({ ...newQuestionForm, negativeMarks: Number(e.target.value) })}
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-center font-bold"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-500 font-semibold block mb-0.5">Curriculum Topic</label>
                      <input
                        type="text"
                        value={newQuestionForm.topic}
                        onChange={e => setNewQuestionForm({ ...newQuestionForm, topic: e.target.value })}
                        placeholder="e.g. Mail Merge"
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-500 font-semibold block mb-0.5">Question Text / Prompt</label>
                    <input
                      type="text"
                      value={newQuestionForm.question}
                      onChange={e => setNewQuestionForm({ ...newQuestionForm, question: e.target.value })}
                      placeholder="e.g. In LibreOffice Calc, which tool determines input value for target result?"
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg"
                    />
                  </div>

                  {/* MCQ Options (Single Select) */}
                  {newQuestionForm.type === 'mcq' && (
                    <div className="space-y-1.5">
                      <label className="text-[11px] text-slate-500 font-semibold block">Options (Select radio for correct answer):</label>
                      {[0, 1, 2, 3].map(optIdx => (
                        <div key={optIdx} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="correct-opt-radio"
                            checked={newQuestionForm.correctIndex === optIdx}
                            onChange={() => setNewQuestionForm({ ...newQuestionForm, correctIndex: optIdx })}
                            className="cursor-pointer"
                          />
                          <input
                            type="text"
                            value={newQuestionForm.options[optIdx]}
                            onChange={e => {
                              const opts = [...newQuestionForm.options] as [string, string, string, string];
                              opts[optIdx] = e.target.value;
                              setNewQuestionForm({ ...newQuestionForm, options: opts });
                            }}
                            placeholder={`Option ${optIdx + 1}`}
                            className="flex-1 px-2.5 py-1 border border-slate-200 rounded-lg"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Multiple Select Options (Checkboxes) */}
                  {newQuestionForm.type === 'multiple_select' && (
                    <div className="space-y-1.5">
                      <label className="text-[11px] text-slate-500 font-semibold block">Options (Check all valid correct answers):</label>
                      {[0, 1, 2, 3].map(optIdx => {
                        const isChecked = newQuestionForm.selectedMultiIndices.includes(optIdx);
                        return (
                          <div key={optIdx} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={e => {
                                const current = newQuestionForm.selectedMultiIndices;
                                const updated = e.target.checked
                                  ? [...current, optIdx]
                                  : current.filter(i => i !== optIdx);
                                setNewQuestionForm({ ...newQuestionForm, selectedMultiIndices: updated });
                              }}
                              className="rounded text-rose-600 cursor-pointer"
                            />
                            <input
                              type="text"
                              value={newQuestionForm.options[optIdx]}
                              onChange={e => {
                                const opts = [...newQuestionForm.options] as [string, string, string, string];
                                opts[optIdx] = e.target.value;
                                setNewQuestionForm({ ...newQuestionForm, options: opts });
                              }}
                              placeholder={`Option ${optIdx + 1}`}
                              className="flex-1 px-2.5 py-1 border border-slate-200 rounded-lg"
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* True False */}
                  {newQuestionForm.type === 'true_false' && (
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="tf-radio"
                          checked={newQuestionForm.correctIndex === 0}
                          onChange={() => setNewQuestionForm({ ...newQuestionForm, correctIndex: 0 })}
                        />
                        <span>Correct Answer: True</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="tf-radio"
                          checked={newQuestionForm.correctIndex === 1}
                          onChange={() => setNewQuestionForm({ ...newQuestionForm, correctIndex: 1 })}
                        />
                        <span>Correct Answer: False</span>
                      </label>
                    </div>
                  )}

                  {/* Fill in Blanks / Descriptive answer */}
                  {(newQuestionForm.type === 'fill_blank' || newQuestionForm.type === 'short_answer') && (
                    <div>
                      <label className="text-[11px] text-slate-500 font-semibold block mb-0.5">
                        {newQuestionForm.type === 'fill_blank' ? 'Exact Answer Key' : 'Model Answer / Teacher Evaluation Rubric'}
                      </label>
                      <input
                        type="text"
                        value={newQuestionForm.correctAnswerText}
                        onChange={e => setNewQuestionForm({ ...newQuestionForm, correctAnswerText: e.target.value })}
                        placeholder={newQuestionForm.type === 'fill_blank' ? 'Exact expected answer keyword' : 'Key points required for manual evaluation'}
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg font-bold"
                      />
                    </div>
                  )}

                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={handleAddQuestionToTest}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs cursor-pointer"
                    >
                      + Add This Question
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateTestModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer"
                >
                  {editingTest ? 'Update Test' : 'Publish & Schedule Test'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: VIEW & EVALUATE STUDENT TEST ATTEMPT SHEET */}
      {/* ============================================================== */}
      {(selectedAttemptForView || selectedSessionForView) && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Award className="w-5 h-5 text-teal-600" />
                <span>Student Answer Sheet & Scoring</span>
              </h3>
              <button 
                onClick={() => {
                  setSelectedAttemptForView(null);
                  setSelectedSessionForView(null);
                }} 
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-extrabold text-slate-900 text-sm">
                    {selectedSessionForView?.studentName || selectedAttemptForView?.studentName || 'Student'}
                  </p>
                  <p className="text-slate-500">
                    Roll: {selectedSessionForView?.rollNumber || 'N/A'} • Class: {selectedSessionForView?.classLevel || selectedAttemptForView?.classLevel}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xl font-black text-slate-900">
                    {selectedSessionForView ? `${selectedSessionForView.finalScore} / ${selectedSessionForView.totalMarks}` : `${selectedAttemptForView?.score} / ${selectedAttemptForView?.totalQuestions}`}
                  </p>
                  <span className={`px-2 py-0.5 rounded-full font-black uppercase text-[10px] ${
                    (selectedSessionForView?.passed ?? selectedAttemptForView?.passed) 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {(selectedSessionForView?.passed ?? selectedAttemptForView?.passed) ? 'PASSED' : 'FAILED'}
                  </span>
                </div>
              </div>

              {/* Lab Exam Detailed Question Evaluation */}
              {selectedSessionForView && (
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-800">Answers Evaluation Breakdown:</h4>
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    {Object.entries(selectedSessionForView.answers).map(([qId, ans], idx) => (
                      <div key={qId} className="p-3 rounded-xl border border-slate-200 bg-white space-y-1">
                        <p className="font-bold text-slate-800">Q{idx + 1}. Question Ref [{qId}]</p>
                        <p className="text-slate-600">Student Answer: <strong className="text-slate-900">{String(ans)}</strong></p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quiz Attempt Breakdown */}
              {selectedAttemptForView && selectedAttemptForView.questionDetails && (
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-800">Questions Breakdown ({selectedAttemptForView.questionDetails.length}):</h4>
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    {selectedAttemptForView.questionDetails.map((q, idx) => {
                      const userAnsIdx = selectedAttemptForView.userAnswers[q.id];
                      const isCorrect = userAnsIdx === q.correctOptionIndex;

                      return (
                        <div key={q.id} className={`p-3 rounded-xl border ${isCorrect ? 'border-emerald-200 bg-emerald-50/20' : 'border-rose-200 bg-rose-50/20'} space-y-1`}>
                          <p className="font-bold text-slate-900">{idx + 1}. {q.question}</p>
                          <p className="text-slate-600">
                            Student Selected: <strong>{q.options[userAnsIdx] || 'Unanswered'}</strong> {isCorrect ? '✓' : '✗'}
                          </p>
                          {!isCorrect && (
                            <p className="text-emerald-700 font-semibold">
                              Correct: {q.options[q.correctOptionIndex]}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedAttemptForView(null);
                    setSelectedSessionForView(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold cursor-pointer"
                >
                  Close Review
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: LIVE LAB WORKSTATIONS & INVIGILATOR MONITOR */}
      {/* ============================================================== */}
      {isLabMonitorModalOpen && selectedExamForMonitor && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Monitor className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-slate-900 text-base">
                      Live Laboratory Invigilator Monitor
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 flex items-center gap-1 animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                      Live Feed
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Exam: <strong>{selectedExamForMonitor.title}</strong> ({selectedExamForMonitor.examCode}) • Class {selectedExamForMonitor.classLevel}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenLabMonitor(selectedExamForMonitor)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
                  title="Refresh Sessions"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh</span>
                </button>
                <button
                  onClick={() => setIsLabMonitorModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Live Summary Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Total Workstations</span>
                <span className="text-xl font-black text-slate-900">{monitorSessions.length}</span>
              </div>
              <div className="bg-emerald-50 p-3.5 rounded-2xl border border-emerald-200">
                <span className="text-[11px] text-emerald-700 block">In Progress (Active)</span>
                <span className="text-xl font-black text-emerald-900">
                  {monitorSessions.filter(s => s.status === 'in_progress').length}
                </span>
              </div>
              <div className="bg-blue-50 p-3.5 rounded-2xl border border-blue-200">
                <span className="text-[11px] text-blue-700 block">Submitted & Graded</span>
                <span className="text-xl font-black text-blue-900">
                  {monitorSessions.filter(s => s.status === 'submitted').length}
                </span>
              </div>
              <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-200">
                <span className="text-[11px] text-amber-700 block">Interrupted / Disconnected</span>
                <span className="text-xl font-black text-amber-900">
                  {monitorSessions.filter(s => s.status === 'disconnected').length}
                </span>
              </div>
            </div>

            {/* Workstations Grid / Table */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-xs text-slate-700 uppercase tracking-wider">
                Student Workstation Sessions
              </h4>

              {monitorSessions.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <p className="font-bold text-slate-700 text-sm">No Active Test Sessions Yet</p>
                  <p className="text-xs text-slate-500">
                    When students start this examination at lab PCs, their heartbeat, progress, and workstation IPs will appear here in real time.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-200">
                        <th className="py-2.5 px-3">Workstation IP</th>
                        <th className="py-2.5 px-3">Student Name & Roll</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Answers Saved</th>
                        <th className="py-2.5 px-3">Time Left</th>
                        <th className="py-2.5 px-3 text-right">Intervention</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {monitorSessions.map(session => {
                        const answeredCount = Object.keys(session.answers || {}).length;
                        const isInterrupted = session.status === 'disconnected';
                        const isSubmitted = session.status === 'submitted';

                        return (
                          <tr key={session.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-3 px-3 font-mono font-bold text-slate-800">
                              <span className="flex items-center gap-1.5">
                                <Monitor className="w-3.5 h-3.5 text-slate-400" />
                                {session.workstationIp || 'PC-LAB'}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <span className="font-bold text-slate-900 block">{session.studentName}</span>
                              <span className="text-[10px] text-slate-500">Roll: {session.rollNumber || 'N/A'}</span>
                            </td>
                            <td className="py-3 px-3">
                              {session.status === 'in_progress' && (
                                <span className="px-2 py-0.5 rounded-full font-bold uppercase text-[10px] bg-emerald-100 text-emerald-800 flex items-center gap-1 w-max">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                                  Writing
                                </span>
                              )}
                              {isSubmitted && (
                                <span className="px-2 py-0.5 rounded-full font-bold uppercase text-[10px] bg-blue-100 text-blue-800 w-max block">
                                  Submitted ({session.finalScore ?? session.autoScore} pts)
                                </span>
                              )}
                              {isInterrupted && (
                                <span className="px-2 py-0.5 rounded-full font-bold uppercase text-[10px] bg-rose-100 text-rose-800 w-max block">
                                  Interrupted / Offline
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-3 font-semibold text-slate-700">
                              {answeredCount} / {selectedExamForMonitor.questions.length} Saved
                            </td>
                            <td className="py-3 px-3 font-mono font-bold text-slate-600">
                              {session.durationRemainingSeconds != null 
                                ? `${Math.floor(session.durationRemainingSeconds / 60)}m ${session.durationRemainingSeconds % 60}s` 
                                : 'Active'}
                            </td>
                            <td className="py-3 px-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => {
                                    setSelectedSessionForView(session);
                                    setSelectedAttemptForView(null);
                                  }}
                                  className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] cursor-pointer"
                                  title="Inspect student responses"
                                >
                                  View Sheet
                                </button>
                                {isSubmitted && (
                                  <button
                                    onClick={() => setReopenSessionTarget(session)}
                                    className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer shadow-2xs"
                                    title="Unlock / Grant extra time for interrupted PC"
                                  >
                                    <RotateCcw className="w-3 h-3" />
                                    <span>Re-open / Extra Time</span>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsLabMonitorModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs cursor-pointer"
              >
                Close Monitor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: RE-OPEN INTERRUPTED LAB EXAM / GRANT EXTRA TIME */}
      {/* ============================================================== */}
      {reopenSessionTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-amber-600" />
                <span>Interrupted Exam Override</span>
              </h3>
              <button onClick={() => setReopenSessionTarget(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <p className="text-slate-600 leading-relaxed">
                Allow student <strong>{reopenSessionTarget.studentName}</strong> to re-enter this examination after a workstation crash, power outage, or computer reboot. All previous answers are saved on the server.
              </p>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Additional Compensation Minutes</label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={reopenAdditionalMins}
                  onChange={e => setReopenAdditionalMins(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold bg-slate-50"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Reason (Recorded in Audit Log)</label>
                <input
                  type="text"
                  value={reopenReason}
                  onChange={e => setReopenReason(e.target.value)}
                  placeholder="e.g. Lab PC power surge, restarted browser"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReopenSessionTarget(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await handleConfirmReopenSession();
                    setReopenSessionTarget(null);
                  }}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold cursor-pointer"
                >
                  Authorize Re-open
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: PREVIEW ONLINE TEST BEFORE PUBLISHING */}
      {/* ============================================================== */}
      {isPreviewTestModalOpen && selectedExamForPreview && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    Test Preview: {selectedExamForPreview.title}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Exam Code: <strong>{selectedExamForPreview.examCode}</strong> • Class {selectedExamForPreview.classLevel} • {selectedExamForPreview.durationMinutes} Minutes • Total Marks: {selectedExamForPreview.totalMarks}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsPreviewTestModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1 text-xs">
              <p className="font-bold text-slate-800">Student Instructions on Screen:</p>
              <p className="text-slate-600 italic leading-relaxed">
                {selectedExamForPreview.instructions || 'Read all questions carefully.'}
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-1 text-slate-500">
                <span>Passing Marks: <strong>{selectedExamForPreview.passingMarks}</strong></span>
                <span>•</span>
                <span>Negative Marking: <strong>{selectedExamForPreview.negativeMarking || 'None'}</strong></span>
                <span>•</span>
                <span>Question Randomization: <strong>{selectedExamForPreview.shuffleQuestions ? 'Enabled' : 'Disabled'}</strong></span>
                <span>•</span>
                <span>Option Randomization: <strong>{selectedExamForPreview.shuffleOptions ? 'Enabled' : 'Disabled'}</strong></span>
              </div>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto pr-2 text-xs">
              <h4 className="font-extrabold text-slate-900">
                Question Paper ({selectedExamForPreview.questions.length} Items):
              </h4>
              {selectedExamForPreview.questions.map((q, qIdx) => (
                <div key={q.id} className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">
                      Q{qIdx + 1}. {q.question}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 font-bold text-slate-600 text-[10px]">
                      {q.marks} Mark{q.marks > 1 ? 's' : ''} ({q.type.toUpperCase()})
                    </span>
                  </div>

                  {/* Options */}
                  {q.options && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {q.options.map((opt, optIdx) => {
                        const isCorrect = Array.isArray(q.correctAnswer)
                          ? q.correctAnswer.includes(optIdx)
                          : q.correctAnswer === optIdx;
                        return (
                          <div
                            key={optIdx}
                            className={`p-2 rounded-xl border text-[11px] flex items-center justify-between ${
                              isCorrect
                                ? 'bg-emerald-50 border-emerald-300 font-bold text-emerald-900'
                                : 'bg-slate-50 border-slate-200 text-slate-700'
                            }`}
                          >
                            <span>{String.fromCharCode(65 + optIdx)}. {opt}</span>
                            {isCorrect && <span className="text-[10px] text-emerald-700 font-black">✓ Correct</span>}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Text Key */}
                  {!q.options && (
                    <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px]">
                      Expected Answer: <strong>{String(q.correctAnswer)}</strong>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsPreviewTestModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: AUDIT LOG OF LAB EXAMS & ACTIONS */}
      {/* ============================================================== */}
      {isAuditLogModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    Examination Hall Audit Trail
                  </h3>
                  <p className="text-xs text-slate-500">
                    Tamper-evident log of test starts, auto-saves, submissions, and teacher overrides.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenAuditLogs()}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh</span>
                </button>
                <button
                  onClick={() => setIsAuditLogModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-2 text-xs">
              {auditLogsList.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
                  <p className="font-bold text-slate-700">No Audit Events Logged Yet</p>
                  <p className="text-slate-500 text-[11px] mt-1">Actions performed by students and invigilators will be logged here.</p>
                </div>
              ) : (
                auditLogsList.map((log, idx) => (
                  <div key={log.id || idx} className="p-3 rounded-xl border border-slate-200 bg-white flex items-start justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 uppercase tracking-tight text-[11px]">
                          {log.action.replace('_', ' ')}
                        </span>
                        {log.workstationIp && (
                          <span className="px-1.5 py-0.2 rounded bg-slate-100 font-mono text-[10px] text-slate-600">
                            {log.workstationIp}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-600">{log.details}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsAuditLogModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs cursor-pointer"
              >
                Close Audit Logs
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: IMPORT FROM QUESTION BANK INTO TEST */}
      {/* ============================================================== */}
      {isQBankPickerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    Select Questions from Central Question Bank
                  </h3>
                  <p className="text-xs text-slate-500">
                    Filter by Class {testFormData.classLevel} and Subject {testFormData.subjectId} to reuse validated questions.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsQBankPickerOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-2 text-xs">
              {questionBank
                .filter((q: Question) => q.classLevel === testFormData.classLevel && q.subjectId === testFormData.subjectId)
                .map((bankQ: Question) => (
                  <div key={bankQ.id} className="p-3.5 rounded-2xl border border-slate-200 bg-white flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="font-bold text-slate-800">{bankQ.question}</p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500">
                        <span className="font-bold uppercase">{bankQ.type}</span>
                        <span>•</span>
                        <span>Marks: {bankQ.marks || 1}</span>
                        {bankQ.chapterTitle && (
                          <>
                            <span>•</span>
                            <span className="text-indigo-600 font-medium">{bankQ.chapterTitle}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleImportQuestionBankItems([bankQ])}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shrink-0 cursor-pointer shadow-2xs"
                    >
                      + Add
                    </button>
                  </div>
                ))}

              {questionBank.filter((q: Question) => q.classLevel === testFormData.classLevel && q.subjectId === testFormData.subjectId).length === 0 && (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
                  <p className="font-bold text-slate-700">No Question Bank Items Found for Class {testFormData.classLevel}</p>
                  <p className="text-xs text-slate-500 mt-1">You can author questions directly in this test or add them to Question Bank (Module 5).</p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsQBankPickerOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* REUSABLE GENERIC CONFIRMATION DIALOG */}
      {/* ============================================================== */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                confirmDialog.dangerLevel === 'warning' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
              }`}>
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-base">{confirmDialog.title}</h3>
                <p className="text-xs text-slate-500 mt-1 whitespace-pre-line leading-relaxed">
                  {confirmDialog.message}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDialog.onConfirm}
                className={`px-4 py-2 rounded-xl text-white font-bold text-xs transition-colors cursor-pointer ${
                  confirmDialog.dangerLevel === 'warning' 
                    ? 'bg-amber-600 hover:bg-amber-700' 
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {confirmDialog.confirmLabel || 'Confirm Action'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: STUDENT DETAILED PERFORMANCE REPORT & DIAGNOSTICS */}
      {/* ============================================================== */}
      {selectedResultForReport && (() => {
        const studentHistory = allResultsRoster.filter(
          r => r.studentId === selectedResultForReport.studentId && r.score !== null
        );
        const matchingExam = selectedResultForReport.rawExam || labExams.find(e => e.id === selectedResultForReport.testId || e.id === selectedResultForReport.rawSession?.examId);
        
        let correctCount = 0;
        let incorrectCount = 0;
        let unansweredCount = 0;
        const chapterBreakdown: Record<string, { total: number; scored: number }> = {};

        if (selectedResultForReport.rawSession && matchingExam) {
          matchingExam.questions.forEach((q: any) => {
            const chKey = q.chapterTitle || matchingExam.topic || 'General Topics';
            if (!chapterBreakdown[chKey]) {
              chapterBreakdown[chKey] = { total: 0, scored: 0 };
            }
            chapterBreakdown[chKey].total += q.marks;

            const studentAns = selectedResultForReport.rawSession?.answers[q.id];
            const manualEval = selectedResultForReport.rawSession?.manualEvaluations?.[q.id];

            if (studentAns === undefined || studentAns === '') {
              unansweredCount++;
            } else if (manualEval !== undefined) {
              chapterBreakdown[chKey].scored += manualEval.marks;
              if (manualEval.marks === q.marks) correctCount++;
              else if (manualEval.marks > 0) correctCount++;
              else incorrectCount++;
            } else {
              const isObjCorrect = Array.isArray(q.correctAnswer)
                ? Array.isArray(studentAns) && studentAns.length === q.correctAnswer.length && studentAns.every((val: any) => (q.correctAnswer as any[]).includes(val))
                : String(studentAns).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase();
              if (isObjCorrect) {
                correctCount++;
                chapterBreakdown[chKey].scored += q.marks;
              } else {
                incorrectCount++;
              }
            }
          });
        } else if (selectedResultForReport.rawAttempt) {
          correctCount = selectedResultForReport.rawAttempt.correctAnswersCount;
          incorrectCount = selectedResultForReport.rawAttempt.totalQuestions - correctCount;
          unansweredCount = 0;
          if (selectedResultForReport.chapterTitle) {
            chapterBreakdown[selectedResultForReport.chapterTitle] = {
              total: selectedResultForReport.rawAttempt.totalQuestions,
              scored: selectedResultForReport.rawAttempt.score
            };
          }
        }

        const strengths = Object.entries(chapterBreakdown).filter(
          ([_, v]) => v.total > 0 && (v.scored / v.total) >= 0.70
        );
        const weaknesses = Object.entries(chapterBreakdown).filter(
          ([_, v]) => v.total > 0 && (v.scored / v.total) < 0.50
        );

        const handleDownloadIndividualReport = () => {
          const headers = ["Field", "Student Assessment Data"];
          const rows = [
            ["Student Name", `"${selectedResultForReport.studentName}"`],
            ["Roll Number", `"${selectedResultForReport.rollNumber || 'N/A'}"`],
            ["Class & Section", `"Class ${selectedResultForReport.classLevel} - ${selectedResultForReport.section}"`],
            ["Test Title", `"${selectedResultForReport.testTitle}"`],
            ["Subject", `"${selectedResultForReport.subjectId.toUpperCase()}"`],
            ["Examination Date", `"${selectedResultForReport.date}"`],
            ["Status", `"${selectedResultForReport.statusLabel}"`],
            ["Marks Obtained", selectedResultForReport.score !== null ? `${selectedResultForReport.score}` : "N/A"],
            ["Total Marks", `${selectedResultForReport.totalMarks}`],
            ["Percentage", selectedResultForReport.percentage !== null ? `${selectedResultForReport.percentage}%` : "N/A"],
            ["Outcome", selectedResultForReport.passed !== null ? (selectedResultForReport.passed ? "PASSED" : "FAILED") : "N/A"],
            ["Questions Correct", `${correctCount}`],
            ["Questions Incorrect", `${incorrectCount}`],
            ["Questions Unanswered", `${unansweredCount}`],
            ["Evaluator Remarks", `"${(selectedResultForReport.rawSession?.teacherFeedback || 'Good effort. Continue continuous revision.').replace(/"/g, '""')}"`]
          ];
          const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
          const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `Student_Report_${selectedResultForReport.studentName.replace(/\s+/g, '_')}_${selectedResultForReport.date}.csv`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          showToast(`Report card downloaded for ${selectedResultForReport.studentName}`);
        };

        return (
          <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 my-8 animate-in fade-in zoom-in-95 duration-150">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-black text-base border border-teal-200 shrink-0">
                    {selectedResultForReport.studentName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-slate-900 text-lg">
                        {selectedResultForReport.studentName}
                      </h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        selectedResultForReport.detailedStatus === 'submitted'
                          ? selectedResultForReport.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          : selectedResultForReport.detailedStatus === 'absent'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-700'
                      }`}>
                        {selectedResultForReport.detailedStatus === 'submitted'
                          ? (selectedResultForReport.passed ? 'PASSED' : 'NEEDS IMPROVEMENT')
                          : selectedResultForReport.statusLabel}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Roll No: <strong>{selectedResultForReport.rollNumber || 'N/A'}</strong> • Class {selectedResultForReport.classLevel}-{selectedResultForReport.section} • {selectedResultForReport.testTitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadIndividualReport}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
                    title="Export CSV Report"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export CSV</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
                    title="Print Student Report"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedResultForReport(null)}
                    className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Assessment Status & Scorecard */}
              {selectedResultForReport.score !== null ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                    <span className="text-[11px] font-bold text-slate-500 uppercase block">Score Obtained</span>
                    <span className="text-2xl font-black text-slate-900 mt-0.5 block">
                      {selectedResultForReport.score} <span className="text-sm font-normal text-slate-400">/ {selectedResultForReport.totalMarks}</span>
                    </span>
                  </div>

                  <div className="p-3.5 bg-teal-50 rounded-2xl border border-teal-200">
                    <span className="text-[11px] font-bold text-teal-700 uppercase block">Percentage</span>
                    <span className="text-2xl font-black text-teal-800 mt-0.5 block">
                      {selectedResultForReport.percentage}%
                    </span>
                  </div>

                  <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200">
                    <span className="text-[11px] font-bold text-emerald-700 uppercase block">Accuracy Metrics</span>
                    <span className="text-xs font-bold text-emerald-900 mt-1 block">
                      ✓ {correctCount} Correct • ✗ {incorrectCount} Incorrect
                    </span>
                    {unansweredCount > 0 && (
                      <span className="text-[10px] text-amber-700 font-semibold block">
                        ⚪ {unansweredCount} Unanswered
                      </span>
                    )}
                  </div>

                  <div className="p-3.5 bg-blue-50 rounded-2xl border border-blue-200">
                    <span className="text-[11px] font-bold text-blue-700 uppercase block">Examination Date</span>
                    <span className="text-sm font-black text-blue-900 mt-1 block">
                      {selectedResultForReport.date}
                    </span>
                    <span className="text-[10px] text-blue-600">Conducted Online</span>
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1">
                  <p className="font-extrabold text-slate-800 text-sm">{selectedResultForReport.statusLabel}</p>
                  <p className="text-xs text-slate-500">
                    {selectedResultForReport.detailedStatus === 'absent' 
                      ? 'The student was marked Absent for this scheduled laboratory examination session.'
                      : 'The student has not started or completed this examination.'}
                  </p>
                </div>
              )}

              {/* Chapter-Wise Mastery Diagnostic */}
              {Object.keys(chapterBreakdown).length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-purple-600" />
                    <span>Chapter-Wise Performance & Competency Breakdown</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(chapterBreakdown).map(([chapter, v], idx) => {
                      const pct = v.total > 0 ? Math.round((v.scored / v.total) * 100) : 0;
                      return (
                        <div key={idx} className="p-3 rounded-xl border border-slate-200 bg-white space-y-1.5">
                          <div className="flex justify-between text-xs">
                            <span className="font-bold text-slate-800 truncate" title={chapter}>{chapter}</span>
                            <span className="font-mono font-bold text-slate-900 shrink-0 ml-2">{v.scored} / {v.total} ({pct}%)</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${pct >= 75 ? 'bg-emerald-500' : pct >= 50 ? 'bg-blue-500' : 'bg-rose-500'}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Strengths & Areas Requiring Improvement */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                  <h5 className="font-black text-xs text-emerald-900 flex items-center gap-1.5 uppercase">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Demonstrated Strengths</span>
                  </h5>
                  {strengths.length > 0 ? (
                    <ul className="text-xs text-emerald-800 space-y-1 list-disc list-inside">
                      {strengths.map(([ch], i) => (
                        <li key={i} className="font-medium">{ch}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-emerald-700 italic">Continuous effort across core units recommended.</p>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-2">
                  <h5 className="font-black text-xs text-rose-900 flex items-center gap-1.5 uppercase">
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    <span>Areas Requiring Improvement</span>
                  </h5>
                  {weaknesses.length > 0 ? (
                    <ul className="text-xs text-rose-800 space-y-1 list-disc list-inside">
                      {weaknesses.map(([ch], i) => (
                        <li key={i} className="font-medium">{ch}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-emerald-700 italic">No critical weak spots detected in this assessment.</p>
                  )}
                </div>
              </div>

              {/* Evaluator Remarks & Audit Log if available */}
              {selectedResultForReport.rawSession?.teacherFeedback && (
                <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-teal-900 uppercase">Official Teacher / Evaluator Feedback</span>
                    <span className="text-teal-700 font-medium">Evaluated by: {selectedResultForReport.rawSession.evaluatedBy || 'Zakir Hussain'}</span>
                  </div>
                  <p className="text-teal-950 font-medium leading-relaxed italic">
                    "{selectedResultForReport.rawSession.teacherFeedback}"
                  </p>
                </div>
              )}

              {/* Previous Test Attempts & Score Comparisons */}
              <div className="space-y-2">
                <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                  Previous Assessment History ({studentHistory.length} Recorded Attempts)
                </h4>
                {studentHistory.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No previous test history on record for this student.</p>
                ) : (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 text-xs">
                    {studentHistory.map(hist => (
                      <div key={hist.id} className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-800 block">{hist.testTitle}</span>
                          <span className="text-[10px] text-slate-400">{hist.date} • {hist.subjectId.toUpperCase()}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-black text-slate-900 block">{hist.score} / {hist.totalMarks} ({hist.percentage}%)</span>
                          <span className={`text-[10px] font-bold uppercase ${hist.passed ? 'text-emerald-700' : 'text-rose-700'}`}>
                            {hist.passed ? 'PASSED' : 'REMEDIAL'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedResultForReport(null)}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs cursor-pointer"
                >
                  Close Report
                </button>
              </div>

            </div>
          </div>
        );
      })()}

      {/* ============================================================== */}
      {/* MODAL: INTERACTIVE TEACHER EVALUATION & MARK RECALCULATION */}
      {/* ============================================================== */}
      {evaluatingSession && (() => {
        const evalExam = labExams.find(e => e.id === evaluatingSession.examId);
        const questions = evalExam?.questions || [];

        // Calculate live recalculated score
        const currentCalculatedScore = evaluatingSession.autoScore || 0;
        let manualSum = 0;
        Object.entries(evaluationDraftMarks).forEach(([_, marks]) => {
          manualSum += Number(marks) || 0;
        });
        const liveTotalScore = currentCalculatedScore + manualSum;
        const liveTotalMarks = evaluatingSession.totalMarks || (evalExam?.totalMarks || 100);
        const livePercentage = liveTotalMarks > 0 ? Math.round((liveTotalScore / liveTotalMarks) * 100) : 0;
        const livePassed = liveTotalScore >= (evalExam?.passingMarks || (liveTotalMarks * 0.4));

        return (
          <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 my-8 animate-in fade-in zoom-in-95 duration-150">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center">
                    <Edit3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">
                      Teacher Evaluation & Score Calibration
                    </h3>
                    <p className="text-xs text-slate-500">
                      Student: <strong>{evaluatingSession.studentName}</strong> (Roll: {evaluatingSession.rollNumber || 'N/A'}) • {evalExam?.title || 'Exam'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setEvaluatingSession(null)}
                  className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Live Score Summary Banner */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block">Auto-Evaluated (Objective):</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">{evaluatingSession.autoScore} Marks</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Descriptive Evaluation:</span>
                  <span className="font-mono font-bold text-teal-700 text-sm">+{manualSum} Marks</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Live Recalculated Score:</span>
                  <span className="font-mono font-black text-slate-900 text-base">{liveTotalScore} / {liveTotalMarks}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Percentage & Status:</span>
                  <span className={`px-2 py-0.5 rounded-full font-black text-[11px] uppercase ${livePassed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                    {livePercentage}% • {livePassed ? 'PASSED' : 'NEEDS PRACTICE'}
                  </span>
                </div>
              </div>

              {/* Questions List with Evaluation Inputs */}
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2 text-xs">
                <h4 className="font-extrabold text-slate-900 uppercase tracking-wider">
                  Questions & Student Responses ({questions.length} Items):
                </h4>

                {questions.map((q, idx) => {
                  const studentAns = evaluatingSession.answers[q.id];
                  const isDescriptive = q.type === 'short_answer' || q.type === 'long_answer' || q.type === 'fill_blank';
                  const currentMark = evaluationDraftMarks[q.id] ?? 0;
                  const currentFeedback = evaluationDraftFeedback[q.id] || '';

                  return (
                    <div 
                      key={q.id} 
                      className={`p-4 rounded-2xl border space-y-2.5 transition-all ${
                        isDescriptive ? 'bg-amber-50/20 border-amber-200' : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-slate-800">Q{idx + 1}.</span>
                            <span className="font-bold text-slate-900">{q.question}</span>
                          </div>
                          <span className="text-[10px] text-slate-400">
                            Type: {q.type.toUpperCase()} • Max Marks: {q.marks} {q.chapterTitle ? `• ${q.chapterTitle}` : ''}
                          </span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                          isDescriptive ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {isDescriptive ? 'Manual Grading' : 'Auto Graded'}
                        </span>
                      </div>

                      {/* Student Submitted Answer */}
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Student Submitted Answer:</span>
                        <p className="font-mono text-slate-900 font-medium">
                          {studentAns !== undefined && studentAns !== '' ? String(studentAns) : <span className="text-slate-400 italic">Unanswered</span>}
                        </p>
                      </div>

                      {/* Reference Answer Guide */}
                      <div className="p-2 rounded-xl bg-emerald-50/60 border border-emerald-200 text-emerald-900 text-[11px]">
                        <span className="font-bold">Model Answer / Key: </span>
                        <span>{Array.isArray(q.correctAnswer) ? q.correctAnswer.map((optIdx: number) => q.options?.[optIdx] || optIdx).join(', ') : (q.options && typeof q.correctAnswer === 'number' ? q.options[q.correctAnswer] : String(q.correctAnswer))}</span>
                        {q.explanation && <p className="text-[10px] text-emerald-700 mt-0.5 italic">Note: {q.explanation}</p>}
                      </div>

                      {/* Grading Inputs for Descriptive questions */}
                      {isDescriptive ? (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 border-t border-amber-100">
                          <div>
                            <label className="text-[10px] font-bold text-slate-600 block mb-0.5">
                              Award Marks (Max: {q.marks}):
                            </label>
                            <input
                              type="number"
                              min={0}
                              max={q.marks}
                              step={0.5}
                              value={currentMark}
                              onChange={e => {
                                const val = Math.min(q.marks, Math.max(0, parseFloat(e.target.value) || 0));
                                setEvaluationDraftMarks(prev => ({ ...prev, [q.id]: val }));
                              }}
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-bold text-center"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="text-[10px] font-bold text-slate-600 block mb-0.5">
                              Specific Feedback / Remarks:
                            </label>
                            <input
                              type="text"
                              value={currentFeedback}
                              onChange={e => {
                                setEvaluationDraftFeedback(prev => ({ ...prev, [q.id]: e.target.value }));
                              }}
                              placeholder="e.g. Accurate definition, missed 1 example..."
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-medium"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
                          <span>Evaluated by Answer Key Engine</span>
                          <span className="font-bold text-slate-800">
                            {String(studentAns).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase() 
                              ? `+${q.marks} Marks (Correct)` 
                              : '0 Marks (Incorrect)'}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Evaluation Meta & Teacher Remarks */}
              <div className="space-y-3 pt-2 border-t border-slate-100 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Overall Teacher Feedback for Student Report:
                  </label>
                  <textarea
                    rows={2}
                    value={evaluationTeacherRemarks}
                    onChange={e => setEvaluationTeacherRemarks(e.target.value)}
                    placeholder="Provide constructive feedback, praise strong understanding, and highlight areas for improvement..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Evaluator Name (Recorded in Audit):</label>
                    <input
                      type="text"
                      value={evaluationEvaluatorName}
                      onChange={e => setEvaluationEvaluatorName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium bg-slate-50"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-5">
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                      <input
                        type="checkbox"
                        checked={evaluationReleaseResults}
                        onChange={e => setEvaluationReleaseResults(e.target.checked)}
                        className="rounded text-teal-600 w-4 h-4"
                      />
                      <span>Release Marks & Results to Student Dashboard Immediately</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Previous Evaluation Audit History if any */}
              {evaluatingSession.evaluationHistory && evaluatingSession.evaluationHistory.length > 0 && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-xs">
                  <span className="font-bold text-slate-700 uppercase text-[10px] block">Evaluation Change History:</span>
                  {evaluatingSession.evaluationHistory.map((item, hIdx) => (
                    <div key={hIdx} className="flex justify-between text-slate-600 text-[11px]">
                      <span>{item.evaluator} ({new Date(item.evaluatedAt).toLocaleDateString()})</span>
                      <span>{item.previousScore} pts → {item.newScore} pts {item.changesNote ? `(${item.changesNote})` : ''}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEvaluatingSession(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 cursor-pointer text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEvaluation}
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs cursor-pointer shadow-xs"
                >
                  Save Evaluation & Recalculate Total Marks
                </button>
              </div>

            </div>
          </div>
        );
      })()}

      {/* QUICK LAUNCHER MODALS */}
      {showPdfExtractor && (
        <PdfMcqExtractorModal
          isOpen={showPdfExtractor}
          onClose={() => setShowPdfExtractor(false)}
        />
      )}

      {showChapterPdfUploader && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-base">Direct Chapter PDF Uploader</h3>
              <button onClick={() => setShowChapterPdfUploader(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <ChapterPdfUploader onSuccess={() => {
              setShowChapterPdfUploader(false);
              showToast('Chapter PDF uploaded and added to library!');
            }} />
          </div>
        </div>
      )}

      {/* SUPABASE SQL & RENDER DEPLOYMENT MODAL */}
      {showSqlModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Supabase SQL & Render Deployment Guide</h3>
                  <p className="text-xs text-slate-500">Copy database script and verify Render environment variables</p>
                </div>
              </div>
              <button 
                onClick={() => setShowSqlModal(false)} 
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step-by-Step Deployment Instructions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <p className="font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">1</span>
                  <span>Supabase SQL Setup</span>
                </p>
                <ol className="list-decimal list-inside space-y-1 text-slate-600 pl-1 leading-relaxed">
                  <li>Go to your <strong>Supabase Dashboard</strong>.</li>
                  <li>Click <strong>SQL Editor</strong> on the left sidebar.</li>
                  <li>Click <strong>New Query</strong>, paste the script below, and click <strong>Run</strong>.</li>
                  <li>All tables and the <code className="bg-slate-200 px-1 py-0.5 rounded text-[10px]">pdf-materials</code> storage bucket will be created automatically.</li>
                </ol>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <p className="font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">2</span>
                  <span>Render Environment Variables</span>
                </p>
                <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1 leading-relaxed">
                  <li><code className="bg-slate-200 px-1 py-0.5 rounded text-[10px]">VITE_SUPABASE_URL</code> (Project URL)</li>
                  <li><code className="bg-slate-200 px-1 py-0.5 rounded text-[10px]">VITE_SUPABASE_ANON_KEY</code> (Anon Public Key)</li>
                  <li><code className="bg-slate-200 px-1 py-0.5 rounded text-[10px]">PORT</code>: <span className="font-mono">3000</span></li>
                  <li><code className="bg-slate-200 px-1 py-0.5 rounded text-[10px]">NODE_ENV</code>: <span className="font-mono">production</span></li>
                </ul>
              </div>
            </div>

            {/* SQL Code Block with Copy Button */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Supabase DDL & RLS Policies (Safe Idempotent Script):</span>
                <button
                  onClick={handleCopySql}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-98"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedSql ? 'Copied!' : 'Copy SQL Script'}</span>
                </button>
              </div>

              <pre className="p-4 bg-slate-900 text-slate-100 rounded-2xl text-[11px] font-mono overflow-x-auto max-h-56 leading-relaxed border border-slate-800">
                {fullSupabaseSqlScript}
              </pre>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  setShowSqlModal(false);
                  handleTestSupabase();
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Run Connection Test Now
              </button>
              <button
                onClick={() => setShowSqlModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
