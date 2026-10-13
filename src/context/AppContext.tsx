import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  ClassLevel,
  SubjectId,
  SubjectInfo,
  Chapter,
  StudyMaterial,
  Question,
  QuizConfig,
  QuizAttempt,
  StudentProfile,
  DoubtQuery,
  AppNotification,
  UserAccount,
  PYQPaper,
  AcademicSession,
  ClassInfo,
  LabExamConfig,
  LabExamStudentSession,
  LabExamStatus,
  LearningResource
} from '../types';
import { DEFAULT_SEED_CHAPTERS, DEFAULT_SEED_RESOURCES } from '../data/seedLmsData';
import { SEED_STUDY_MATERIALS } from '../data/seedStudyMaterials';
import { SEED_QUESTIONS } from '../data/seedQuestions';
import { SEED_QUIZZES } from '../data/seedQuizzes';
import { INITIAL_PYQ_PAPERS } from '../data/pyqData';
import { INITIAL_LAB_EXAMS, INITIAL_LAB_SESSIONS } from '../data/seedLabExams';
import { CLASSES_LIST, SUBJECTS_LIST, CHAPTERS_DATA } from '../data/curriculumData';
import { 
  syncProfileToSupabase, 
  deleteProfileFromSupabase,
  fetchProfilesFromSupabase,
  saveQuizAttemptToSupabase, 
  fetchQuizAttemptsFromSupabase,
  submitDoubtToSupabase,
  updateDoubtReplyInSupabase,
  fetchDoubtsFromSupabase,
  logUserLoginToSupabase,
  bulkSyncStudentsToSupabase,
  sendPasswordResetEmail,
  updateSupabasePassword,
  savePdfChapterToSupabase,
  fetchPdfChaptersFromSupabase,
  saveLearningResourceToSupabase,
  deleteLearningResourceFromSupabase,
  fetchLearningResourcesFromSupabase,
  saveStudyMaterialToSupabase,
  deleteStudyMaterialFromSupabase,
  fetchStudyMaterialsFromSupabase,
  saveQuizToSupabase,
  deleteQuizFromSupabase,
  fetchQuizzesFromSupabase,
  saveQuestionToSupabase,
  deleteQuestionFromSupabase,
  fetchQuestionsFromSupabase,
  saveLabExamToSupabase,
  deleteLabExamFromSupabase,
  fetchLabExamsFromSupabase,
  saveLabExamSessionToSupabase,
  fetchLabExamSessionsFromSupabase,
  saveSiteStoreItem,
  fetchSiteStoreItem,
  syncAllAppDataToSupabase
} from '../lib/supabase';

export interface AuthSuccessCallback {
  (): void;
}

interface AppContextType {
  // Authentication & Unified Role System
  currentUser: UserAccount | null;
  isAuthenticated: boolean;
  userRole: 'student' | 'admin';
  setUserRole: (role: 'student' | 'admin') => void;
  registeredStudents: UserAccount[];
  addStudentManually: (data: { name: string; email: string; username?: string; studentId?: string; rollNumber?: string; classLevel: ClassLevel; section?: string; schoolName?: string; targetExamYear?: string; password?: string; isActive?: boolean }) => { success: boolean; message: string };
  addStudentsBulk: (students: Array<{ name: string; email: string; username?: string; studentId?: string; rollNumber?: string; classLevel: ClassLevel; section?: string; schoolName?: string; targetExamYear?: string; password?: string; isActive?: boolean }>) => { count: number; message: string };
  updateStudent: (id: string, updates: Partial<UserAccount>) => void;
  deleteStudent: (studentIdOrEmail: string) => void;
  toggleStudentLock: (id: string) => void;
  setStudentPassword: (emailOrId: string, newPassword: string) => { success: boolean; message: string };
  sendSupabaseResetEmail: (email: string) => Promise<{ success: boolean; message: string }>;
  
  // Auth Modal Controls
  isAuthModalOpen: boolean;
  authModalTab: 'login' | 'register' | 'admin';
  authNoticeMessage: string;
  openAuthModal: (tab?: 'login' | 'register' | 'admin', notice?: string, onSuccess?: AuthSuccessCallback) => void;
  closeAuthModal: () => void;
  login: (credentials: { emailOrId: string; password?: string; role?: 'student' | 'admin' }) => { success: boolean; message?: string };
  register: (data: { name: string; email: string; studentId: string; classLevel: ClassLevel; password?: string }) => { success: boolean; message?: string };
  logout: () => void;

  // Student Profile & Progress
  studentProfile: StudentProfile;
  updateStudentProfile: (profile: Partial<StudentProfile>) => void;
  selectedClassFilter: ClassLevel | 'ALL';
  setSelectedClassFilter: (cl: ClassLevel | 'ALL') => void;
  selectedSubjectFilter: SubjectId | 'ALL';
  setSelectedSubjectFilter: (sub: SubjectId | 'ALL') => void;

  // Academic Sessions Management
  academicSessions: AcademicSession[];
  addAcademicSession: (session: AcademicSession) => void;
  updateAcademicSession: (id: string, updates: Partial<AcademicSession>) => void;
  deleteAcademicSession: (id: string) => void;
  setCurrentAcademicSession: (id: string) => void;
  
  // Custom Curriculum Hierarchy Management
  customClasses: Array<{ level: string; name: string; subtitle: string; order?: number; isHidden?: boolean; isActive?: boolean }>;
  addCustomClass: (cls: { level: string; name: string; subtitle: string; order?: number; isHidden?: boolean; isActive?: boolean }) => void;
  updateCustomClass: (level: string, updates: Partial<{ level: string; name: string; subtitle: string; order?: number; isHidden?: boolean; isActive?: boolean }>) => void;
  deleteCustomClass: (level: string) => void;
  reorderClasses: (fromIndex: number, toIndex: number) => void;
  
  customSubjects: SubjectInfo[];
  addCustomSubject: (sub: SubjectInfo) => void;
  updateCustomSubject: (id: string, updates: Partial<SubjectInfo>) => void;
  deleteCustomSubject: (id: string) => void;
  reorderSubjects: (fromIndex: number, toIndex: number) => void;
  
  customChapters: Chapter[];
  addCustomChapter: (ch: Chapter) => void;
  updateCustomChapter: (id: string, updates: Partial<Chapter>) => void;
  deleteCustomChapter: (id: string) => void;
  reorderChapters: (fromIndex: number, toIndex: number) => void;
  
  // Dynamic Chapter-Wise Learning Resources (LMS)
  learningResources: LearningResource[];
  addLearningResource: (resource: Omit<LearningResource, 'id' | 'uploadedDate' | 'order'> & Partial<{ id: string; uploadedDate: string; order: number }>) => LearningResource;
  updateLearningResource: (id: string, updates: Partial<LearningResource>) => void;
  replaceResourceFile: (id: string, fileData: { fileName: string; fileSize?: string; fileUrl: string; pageCount?: number }) => void;
  reorderLearningResources: (chapterId: string, fromIndex: number, toIndex: number) => void;
  togglePublishLearningResource: (id: string) => void;
  deleteLearningResource: (id: string) => void;
  getResourcesForChapter: (chapterId: string, includeUnpublished?: boolean) => LearningResource[];
  
  // Study Materials (Legacy & Cross-compatible)
  studyMaterials: StudyMaterial[];
  addStudyMaterial: (material: Omit<StudyMaterial, 'id' | 'uploadedDate'>) => void;
  updateStudyMaterial: (id: string, updates: Partial<StudyMaterial>) => void;
  replaceStudyMaterial: (id: string, newFileData: Partial<StudyMaterial>) => void;
  deleteStudyMaterial: (id: string) => void;
  togglePublishMaterial: (id: string) => void;
  
  // Questions
  questionBank: Question[];
  addQuestion: (question: Omit<Question, 'id'>) => void;
  updateQuestion: (id: string, updates: Partial<Question>) => void;
  deleteQuestion: (id: string) => void;
  togglePublishQuestion: (id: string) => void;
  
  // Quizzes
  quizzes: QuizConfig[];
  createQuiz: (quiz: Omit<QuizConfig, 'id'>) => void;
  deleteQuiz: (id: string) => void;
  togglePublishQuiz: (id: string) => void;

  // Computer Lab Online Examination System
  labExams: LabExamConfig[];
  createLabExam: (exam: LabExamConfig) => void;
  updateLabExam: (id: string, updates: Partial<LabExamConfig>) => void;
  deleteLabExam: (id: string) => void;
  duplicateLabExam: (id: string) => LabExamConfig | null;
  setLabExamStatus: (id: string, status: LabExamStatus) => void;
  labExamSessions: LabExamStudentSession[];
  recordLabExamAnswer: (examId: string, studentId: string, questionId: string, answer: string | number, workstationIp?: string) => void;
  submitLabExam: (examId: string, studentId: string) => void;
  evaluateLabExamSession: (
    sessionId: string, 
    manualEvaluations: Record<string, { marks: number; feedback?: string }>,
    options?: { evaluatorName?: string; teacherFeedback?: string; resultsReleased?: boolean }
  ) => void;
  reopenLabExamForStudent: (sessionId: string) => void;
  releaseExamResults: (examId: string, showResultsImmediately: boolean, showAnswerKeysToStudents?: boolean) => void;
  
  // Attempts & Bookmarks
  quizAttempts: QuizAttempt[];
  recordQuizAttempt: (attempt: Omit<QuizAttempt, 'id' | 'date'>) => QuizAttempt;
  toggleBookmark: (materialId: string) => void;
  toggleQuestionBookmark: (questionId: string) => void;
  
  // Test Review & Certificate
  activeCertificateAttempt: QuizAttempt | null;
  setActiveCertificateAttempt: (attempt: QuizAttempt | null) => void;
  activeTestForReview: QuizAttempt | null;
  setActiveTestForReview: (attempt: QuizAttempt | null) => void;

  // Doubts & Q&A
  doubts: DoubtQuery[];
  submitDoubt: (doubt: Omit<DoubtQuery, 'id' | 'timestamp' | 'status'>) => void;
  replyToDoubt: (id: string, reply: string) => void;

  // Previous Years Papers (PYQs)
  pyqPapers: PYQPaper[];
  addPYQPaper: (paper: Omit<PYQPaper, 'id' | 'uploadedAt'>) => void;
  updatePYQPaper: (id: string, updates: Partial<PYQPaper>) => void;
  deletePYQPaper: (id: string) => void;
  
  // Notifications
  notifications: AppNotification[];
  markNotificationRead: (id: string) => void;
  addNotification: (notif: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>) => void;
  
  syncAllCurriculumMaterials: () => void;
  syncStoreToBackend: (data?: any) => Promise<void>;
  resetAllData: () => void;
}

// Single authorized Administrator account
const ADMIN_ACCOUNT: UserAccount = {
  id: 'usr-admin-1',
  name: 'Mr. Zakir Hussain',
  email: 'zakhu1099@gmail.com',
  username: 'admin',
  studentId: 'ADMIN-01',
  rollNumber: '001',
  classLevel: 'XII',
  section: 'Admin',
  role: 'admin',
  avatarSeed: 'Zakir',
  createdAt: '2026-01-01',
  isActive: true
};

// Registered accounts array initialized with Admin (empty student roster for production)
const DEFAULT_STUDENTS: UserAccount[] = [
  ADMIN_ACCOUNT
];

const DEFAULT_PROFILE: StudentProfile = {
  id: '',
  name: 'Student',
  studentId: '',
  classLevel: 'X',
  email: '',
  avatarSeed: 'Student',
  targetExamYear: '2026',
  enrolledSubjects: ['it-402'],
  bookmarks: [],
  bookmarkedQuestions: [],
  chaptersCompletedCount: 0,
  questionsSolvedCount: 0,
  badges: []
};

const DEFAULT_ATTEMPTS: QuizAttempt[] = [];

const DEFAULT_NOTIFICATIONS: AppNotification[] = [];

const DEFAULT_DOUBTS: DoubtQuery[] = [];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Unified User & Auth State
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem('zakir_current_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [registeredStudents, setRegisteredStudents] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem('zakir_registered_students');
    if (saved) {
      try {
        const parsed: UserAccount[] = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Filter out legacy demo seed student IDs so they don't persist
          const demoIds = new Set(['usr-std-101', 'usr-std-102', 'usr-std-103', 'usr-student-1', 'usr-student-2', 'usr-student-3']);
          const cleaned = parsed.filter(s => !demoIds.has(s.id));
          const hasAdmin = cleaned.some(s => s.role === 'admin' || s.id === ADMIN_ACCOUNT.id);
          const finalRoster = hasAdmin ? cleaned : [ADMIN_ACCOUNT, ...cleaned];
          return finalRoster;
        }
      } catch {}
    }
    return DEFAULT_STUDENTS;
  });

  const [userRole, setUserRole] = useState<'student' | 'admin'>(() => {
    return currentUser?.role || 'student';
  });

  // Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register' | 'admin'>('login');
  const [authNoticeMessage, setAuthNoticeMessage] = useState<string>('');
  const [authSuccessCallback, setAuthSuccessCallback] = useState<{ cb?: AuthSuccessCallback } | null>(null);

  // Student Profile
  const [studentProfile, setStudentProfile] = useState<StudentProfile>(() => {
    const saved = localStorage.getItem('zakir_student_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_PROFILE;
      }
    }
    return DEFAULT_PROFILE;
  });

  // Filtering
  const [selectedClassFilter, setSelectedClassFilter] = useState<ClassLevel | 'ALL'>('ALL');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<SubjectId | 'ALL'>('ALL');

  // Custom Content Lists
  const [customClasses, setCustomClasses] = useState<Array<{ level: string; name: string; subtitle: string }>>(() => {
    const saved = localStorage.getItem('zakir_custom_classes');
    return saved ? JSON.parse(saved) : CLASSES_LIST;
  });

  const [customSubjects, setCustomSubjects] = useState<SubjectInfo[]>(() => {
    const saved = localStorage.getItem('zakir_custom_subjects');
    return saved ? JSON.parse(saved) : SUBJECTS_LIST;
  });

  const [customChapters, setCustomChapters] = useState<Chapter[]>(() => {
    const saved = localStorage.getItem('zakir_custom_chapters');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return DEFAULT_SEED_CHAPTERS;
  });

  const [learningResources, setLearningResources] = useState<LearningResource[]>(() => {
    const saved = localStorage.getItem('zakir_learning_resources');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return DEFAULT_SEED_RESOURCES;
  });

  // Ensure default chapters and learning resources are available if storage was cleared
  useEffect(() => {
    if (customChapters.length === 0) {
      setCustomChapters(DEFAULT_SEED_CHAPTERS);
    }
    if (learningResources.length === 0) {
      setLearningResources(DEFAULT_SEED_RESOURCES);
    }
  }, []);

  const [studyMaterials, setStudyMaterials] = useState<StudyMaterial[]>(() => {
    const saved = localStorage.getItem('zakir_study_materials');
    return saved ? JSON.parse(saved) : [];
  });

  const [questionBank, setQuestionBank] = useState<Question[]>(() => {
    const saved = localStorage.getItem('zakir_questions');
    return saved ? JSON.parse(saved) : [];
  });

  const [quizzes, setQuizzes] = useState<QuizConfig[]>(() => {
    const saved = localStorage.getItem('zakir_quizzes');
    return saved ? JSON.parse(saved) : [];
  });

  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>(() => {
    const saved = localStorage.getItem('zakir_quiz_attempts');
    return saved ? JSON.parse(saved) : [];
  });

  const [doubts, setDoubts] = useState<DoubtQuery[]>(() => {
    const saved = localStorage.getItem('zakir_doubts');
    return saved ? JSON.parse(saved) : [];
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('zakir_notifications');
    return saved ? JSON.parse(saved) : [];
  });

  const [pyqPapers, setPyqPapers] = useState<PYQPaper[]>(() => {
    const saved = localStorage.getItem('zakir_pyq_papers');
    return saved ? JSON.parse(saved) : INITIAL_PYQ_PAPERS;
  });

  const [academicSessions, setAcademicSessions] = useState<AcademicSession[]>(() => {
    const saved = localStorage.getItem('zakir_academic_sessions');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { id: 'sess-2025-26', name: '2025–2026', startDate: '2025-04-01', endDate: '2026-03-31', isCurrent: true },
      { id: 'sess-2024-25', name: '2024–2025', startDate: '2024-04-01', endDate: '2025-03-31', isCurrent: false }
    ];
  });

  const [labExams, setLabExams] = useState<LabExamConfig[]>(() => {
    const saved = localStorage.getItem('zakir_lab_exams');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_LAB_EXAMS;
  });

  const [labExamSessions, setLabExamSessions] = useState<LabExamStudentSession[]>(() => {
    const saved = localStorage.getItem('zakir_lab_sessions');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_LAB_SESSIONS;
  });

  const [activeCertificateAttempt, setActiveCertificateAttempt] = useState<QuizAttempt | null>(null);
  const [activeTestForReview, setActiveTestForReview] = useState<QuizAttempt | null>(null);

  // Safe localStorage persistence helper to prevent QuotaExceededError white screens
  const safeLocalStorageSet = (key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (err) {
      console.warn(`LocalStorage quota exceeded for ${key}:`, err);
      if ((key === 'zakir_study_materials' || key === 'zakir_learning_resources') && Array.isArray(data)) {
        try {
          // Fallback: store lightweight items without heavy base64 url strings in localStorage
          const lightweight = data.map((m: any) => ({ 
            ...m, 
            pdfDataUrl: m.pdfDataUrl && m.pdfDataUrl.length > 50000 ? undefined : m.pdfDataUrl,
            fileUrl: m.fileUrl && m.fileUrl.length > 50000 ? undefined : m.fileUrl
          }));
          localStorage.setItem(key, JSON.stringify(lightweight));
        } catch (e2) {
          console.warn('Lightweight storage fallback failed:', e2);
          try {
            const ultraLight = data.map((m: any) => ({ ...m, pdfDataUrl: undefined, fileUrl: undefined }));
            localStorage.setItem(key, JSON.stringify(ultraLight));
          } catch {}
        }
      }
    }
  };

  // Sync state to LocalStorage
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('zakir_current_user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('zakir_current_user');
      }
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [currentUser]);

  useEffect(() => {
    safeLocalStorageSet('zakir_registered_students', registeredStudents);
  }, [registeredStudents]);

  useEffect(() => {
    safeLocalStorageSet('zakir_student_profile', studentProfile);
  }, [studentProfile]);

  useEffect(() => {
    safeLocalStorageSet('zakir_custom_classes', customClasses);
  }, [customClasses]);

  useEffect(() => {
    safeLocalStorageSet('zakir_custom_subjects', customSubjects);
  }, [customSubjects]);

  useEffect(() => {
    safeLocalStorageSet('zakir_custom_chapters', customChapters);
  }, [customChapters]);

  useEffect(() => {
    safeLocalStorageSet('zakir_learning_resources', learningResources);
  }, [learningResources]);

  useEffect(() => {
    safeLocalStorageSet('zakir_study_materials', studyMaterials);
  }, [studyMaterials]);

  useEffect(() => {
    safeLocalStorageSet('zakir_questions', questionBank);
  }, [questionBank]);

  useEffect(() => {
    safeLocalStorageSet('zakir_quizzes', quizzes);
  }, [quizzes]);

  useEffect(() => {
    safeLocalStorageSet('zakir_quiz_attempts', quizAttempts);
  }, [quizAttempts]);

  useEffect(() => {
    safeLocalStorageSet('zakir_doubts', doubts);
  }, [doubts]);

  useEffect(() => {
    safeLocalStorageSet('zakir_notifications', notifications);
  }, [notifications]);

  useEffect(() => {
    safeLocalStorageSet('zakir_pyq_papers', pyqPapers);
  }, [pyqPapers]);

  useEffect(() => {
    safeLocalStorageSet('zakir_academic_sessions', academicSessions);
  }, [academicSessions]);

  useEffect(() => {
    safeLocalStorageSet('zakir_lab_exams', labExams);
  }, [labExams]);

  useEffect(() => {
    safeLocalStorageSet('zakir_lab_sessions', labExamSessions);
  }, [labExamSessions]);

  // Initial fetch from Supabase database tables and backend store (/api/admin/store)
  useEffect(() => {
    // 1. Fetch from local backend store if available
    fetch('/api/admin/store')
      .then(res => res.json())
      .then(json => {
        if (json?.success && json?.data) {
          const d = json.data;
          if (Array.isArray(d.classes) && d.classes.length > 0) setCustomClasses(d.classes);
          if (Array.isArray(d.subjects) && d.subjects.length > 0) setCustomSubjects(d.subjects);
          if (Array.isArray(d.chapters) && d.chapters.length > 0) setCustomChapters(d.chapters);
          if (Array.isArray(d.studyMaterials) && d.studyMaterials.length > 0) setStudyMaterials(d.studyMaterials);
          if (Array.isArray(d.students) && d.students.length > 0) setRegisteredStudents(d.students);
          if (Array.isArray(d.tests) && d.tests.length > 0) setLabExams(d.tests);
          if (Array.isArray(d.attempts) && d.attempts.length > 0) setQuizAttempts(d.attempts);
          if (Array.isArray(d.labSessions) && d.labSessions.length > 0) setLabExamSessions(d.labSessions);
        }
      })
      .catch(() => {});

    // 2. Comprehensive fetch from Supabase Database
    const loadSupabaseData = async () => {
      try {
        // A. Learning Resources
        const [supResources, supChapters] = await Promise.all([
          fetchLearningResourcesFromSupabase(),
          fetchPdfChaptersFromSupabase()
        ]);

        const combinedResources: LearningResource[] = [];
        if (Array.isArray(supResources) && supResources.length > 0) {
          combinedResources.push(...supResources);
        }

        if (Array.isArray(supChapters) && supChapters.length > 0) {
          const mappedChapters: LearningResource[] = supChapters.map((sc: any) => ({
            id: sc.id || `res-sup-${Math.random()}`,
            title: sc.file_name ? sc.file_name.replace(/\.pdf$/i, '').replace(/[-_]/g, ' ') : sc.chapter_title,
            description: `Official chapter material: ${sc.chapter_title}`,
            resourceType: 'notes',
            classLevel: sc.class_level as ClassLevel,
            subjectId: sc.subject_id as SubjectId,
            chapterId: `ch-${sc.class_level}-${sc.subject_id}`,
            chapterTitle: sc.chapter_title,
            published: true,
            author: 'Zakir Hussain',
            content: `# ${sc.file_name}\n\nOfficial PDF material for ${sc.chapter_title} (Class ${sc.class_level}).`,
            fileName: sc.file_name,
            fileSize: '2.4 MB',
            fileUrl: sc.pdf_data_url || '',
            pageCount: 12,
            uploadedDate: sc.created_at ? sc.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
            order: 99
          }));

          const existingIds = new Set(combinedResources.map(r => r.id));
          for (const mc of mappedChapters) {
            if (!existingIds.has(mc.id)) {
              combinedResources.push(mc);
            }
          }
        }

        if (combinedResources.length > 0) {
          setLearningResources(prev => {
            const existingIds = new Set(prev.map(p => p.id));
            const uniqueNew = combinedResources.filter(r => !existingIds.has(r.id));
            return [...uniqueNew, ...prev];
          });
        }

        // B. Study Materials
        const supMaterials = await fetchStudyMaterialsFromSupabase();
        if (Array.isArray(supMaterials) && supMaterials.length > 0) {
          setStudyMaterials(prev => {
            const existingIds = new Set(prev.map(p => p.id));
            const uniqueNew = supMaterials.filter(m => !existingIds.has(m.id));
            return [...uniqueNew, ...prev];
          });
        }

        // C. Quizzes
        const supQuizzes = await fetchQuizzesFromSupabase();
        if (Array.isArray(supQuizzes) && supQuizzes.length > 0) {
          setQuizzes(prev => {
            const existingIds = new Set(prev.map(p => p.id));
            const uniqueNew = supQuizzes.filter(q => !existingIds.has(q.id));
            return [...uniqueNew, ...prev];
          });
        }

        // D. Question Bank
        const supQuestions = await fetchQuestionsFromSupabase();
        if (Array.isArray(supQuestions) && supQuestions.length > 0) {
          setQuestionBank(prev => {
            const existingIds = new Set(prev.map(p => p.id));
            const uniqueNew = supQuestions.filter(q => !existingIds.has(q.id));
            return [...uniqueNew, ...prev];
          });
        }

        // E. Quiz Attempts
        const supAttempts = await fetchQuizAttemptsFromSupabase();
        if (Array.isArray(supAttempts) && supAttempts.length > 0) {
          setQuizAttempts(prev => {
            const existingIds = new Set(prev.map(p => p.id));
            const uniqueNew = supAttempts.filter(a => !existingIds.has(a.id));
            return [...uniqueNew, ...prev];
          });
        }

        // F. Doubts
        const supDoubts = await fetchDoubtsFromSupabase();
        if (Array.isArray(supDoubts) && supDoubts.length > 0) {
          setDoubts(prev => {
            const existingIds = new Set(prev.map(p => p.id));
            const uniqueNew = supDoubts.filter(d => !existingIds.has(d.id));
            return [...uniqueNew, ...prev];
          });
        }

        // G. Profiles (Registered Students)
        const supProfiles = await fetchProfilesFromSupabase();
        if (Array.isArray(supProfiles) && supProfiles.length > 0) {
          const loadedStudents: UserAccount[] = supProfiles.map((p: any) => ({
            id: p.id || `usr-${p.email}`,
            name: p.name || 'Student',
            email: p.email,
            username: p.username || p.email.split('@')[0],
            studentId: p.student_id || `STD-${p.class_level || 'X'}-1001`,
            rollNumber: p.roll_number || '1001',
            classLevel: (p.class_level || 'X') as ClassLevel,
            role: (p.role || 'student') as 'student' | 'admin',
            avatarSeed: p.avatar_seed || p.name,
            schoolName: p.school_name || 'Zakir Learning Hub Partner School',
            targetExamYear: p.target_exam_year || '2026',
            password: 'Student@123',
            isActive: true,
            createdAt: p.updated_at
          }));

          setRegisteredStudents(prev => {
            const existingEmails = new Set(prev.map(s => s.email.toLowerCase()));
            const uniqueNew = loadedStudents.filter(s => !existingEmails.has(s.email.toLowerCase()));
            return [...prev, ...uniqueNew];
          });
        }

        // H. Lab Exams & Sessions
        const [supExams, supSessions] = await Promise.all([
          fetchLabExamsFromSupabase(),
          fetchLabExamSessionsFromSupabase()
        ]);
        if (Array.isArray(supExams) && supExams.length > 0) {
          setLabExams(prev => {
            const existingIds = new Set(prev.map(e => e.id));
            const uniqueNew = supExams.filter(e => !existingIds.has(e.id));
            return [...uniqueNew, ...prev];
          });
        }
        if (Array.isArray(supSessions) && supSessions.length > 0) {
          setLabExamSessions(prev => {
            const existingIds = new Set(prev.map(s => s.id));
            const uniqueNew = supSessions.filter(s => !existingIds.has(s.id));
            return [...uniqueNew, ...prev];
          });
        }

        // I. Curriculum and site metadata from site_store
        const siteCurriculum = await fetchSiteStoreItem('curriculum');
        if (siteCurriculum) {
          if (Array.isArray(siteCurriculum.classes) && siteCurriculum.classes.length > 0) {
            setCustomClasses(siteCurriculum.classes);
          }
          if (Array.isArray(siteCurriculum.subjects) && siteCurriculum.subjects.length > 0) {
            setCustomSubjects(siteCurriculum.subjects);
          }
          if (Array.isArray(siteCurriculum.chapters) && siteCurriculum.chapters.length > 0) {
            setCustomChapters(siteCurriculum.chapters);
          }
          if (Array.isArray(siteCurriculum.academicSessions) && siteCurriculum.academicSessions.length > 0) {
            setAcademicSessions(siteCurriculum.academicSessions);
          }
          if (Array.isArray(siteCurriculum.pyqPapers) && siteCurriculum.pyqPapers.length > 0) {
            setPyqPapers(siteCurriculum.pyqPapers);
          }
        }
      } catch (loadErr) {
        console.warn('Supabase initial fetch notice:', loadErr);
      }
    };

    loadSupabaseData();
  }, []);

  // Real-time Quiz & Test Synchronization Listener (WebSocket + BroadcastChannel + Storage Event)
  useEffect(() => {
    // 1. Cross-tab BroadcastChannel
    let broadcastChannel: BroadcastChannel | null = null;
    try {
      broadcastChannel = new BroadcastChannel('zakir_live_tests_sync');
      broadcastChannel.onmessage = (event) => {
        if (event.data && event.data.type === 'QUIZ_CREATED' && event.data.quiz) {
          const incomingQuiz: QuizConfig = event.data.quiz;
          setQuizzes(prev => {
            if (prev.some(q => q.id === incomingQuiz.id)) return prev;
            return [incomingQuiz, ...prev];
          });
        }
      };
    } catch {
      // BroadcastChannel not available in legacy environments
    }

    // 2. Storage event listener for cross-tab local storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'zakir_quizzes' && e.newValue) {
        try {
          const updatedQuizzes: QuizConfig[] = JSON.parse(e.newValue);
          setQuizzes(updatedQuizzes);
        } catch {
          // ignore parse errors
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // 3. Live WebSocket listener for real-time test creation across any device or browser session
    let ws: WebSocket | null = null;
    let reconnectTimeout: any = null;

    const connectWebSocket = () => {
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/api/study-rooms-ws`;
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          ws?.send(JSON.stringify({ type: 'join_room', roomId: 'global-test-sync', userName: 'RealTimeSync' }));
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'quiz_event' && data.quiz) {
              const incomingQuiz: QuizConfig = data.quiz;
              setQuizzes(prev => {
                if (prev.some(q => q.id === incomingQuiz.id)) return prev;

                // Fire notification
                addNotification({
                  title: `⚡ Live Test Created: Class ${incomingQuiz.classLevel}`,
                  message: `Educator published "${incomingQuiz.title}" (${incomingQuiz.questionsCount} questions, ${incomingQuiz.timeLimitMinutes} mins). Click to attempt live!`,
                  category: 'quiz',
                  classLevel: incomingQuiz.classLevel,
                  linkTab: 'quiz'
                });

                return [incomingQuiz, ...prev];
              });
            }
          } catch {
            // ignore non-JSON socket messages
          }
        };

        ws.onclose = () => {
          reconnectTimeout = setTimeout(connectWebSocket, 5000);
        };
      } catch {
        // ws error
      }
    };

    connectWebSocket();

    return () => {
      if (broadcastChannel) broadcastChannel.close();
      window.removeEventListener('storage', handleStorageChange);
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (ws) ws.close();
    };
  }, []);

  // Auth Operations
  const openAuthModal = (tab: 'login' | 'register' | 'admin' = 'login', notice: string = '', onSuccess?: AuthSuccessCallback) => {
    setAuthModalTab(tab);
    setAuthNoticeMessage(notice);
    setAuthSuccessCallback(onSuccess ? { cb: onSuccess } : null);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthNoticeMessage('');
    setAuthSuccessCallback(null);
  };

  const login = (credentials: { emailOrId: string; password?: string; role?: 'student' | 'admin' }) => {
    const q = credentials.emailOrId.trim().toLowerCase();
    
    // Check if Administrator login
    if (
      credentials.role === 'admin' ||
      q === 'admin' || 
      q === 'zakir' || 
      q === 'zakhu1099@gmail.com' || 
      q === 'tanhazakir66@gmail.com' || 
      q === 'admin-01'
    ) {
      if (!credentials.password || credentials.password.trim() !== 'zakir@1630502') {
        return { success: false, message: 'Incorrect administrator password. Please try again.' };
      }
      setCurrentUser(ADMIN_ACCOUNT);
      setUserRole('admin');
      logUserLoginToSupabase(ADMIN_ACCOUNT);
      closeAuthModal();
      if (authSuccessCallback?.cb) {
        authSuccessCallback.cb();
      }
      return { success: true };
    }

    // Check registered students by Username, Email, Roll Number, or Student ID
    const matched = registeredStudents.find(
      s => (s.username && s.username.toLowerCase() === q) ||
           s.email.toLowerCase() === q ||
           s.studentId.toLowerCase() === q ||
           (s.rollNumber && s.rollNumber.toLowerCase() === q)
    );

    if (matched) {
      // Security Check: Deactivated / Locked Account
      if (matched.isLocked === true || matched.isActive === false) {
        return { 
          success: false, 
          message: 'This student account has been deactivated or locked by the administrator. Please contact your school lab teacher.' 
        };
      }

      // Check password
      if (matched.password && credentials.password) {
        if (matched.password.trim() !== credentials.password.trim()) {
          return { success: false, message: 'Incorrect password. Click "Forgot / Set Password" to reset or contact your administrator.' };
        }
      } else if (!matched.password && credentials.password && credentials.password.trim().length >= 3) {
        // Auto-assign password on first login if student hasn't set one yet
        matched.password = credentials.password.trim();
      } else if (matched.password && !credentials.password) {
        return { success: false, message: 'Please enter your password to sign in.' };
      }

      setCurrentUser(matched);
      setUserRole('student');
      logUserLoginToSupabase(matched);
      setStudentProfile(prev => ({
        ...prev,
        id: matched.id,
        name: matched.name,
        username: matched.username,
        email: matched.email,
        studentId: matched.studentId,
        rollNumber: matched.rollNumber,
        classLevel: matched.classLevel,
        section: matched.section || 'A',
        schoolName: matched.schoolName || prev.schoolName,
        enrolledSubjects: matched.enrolledSubjects || (
          matched.classLevel === 'X' ? ['it-402', 'ca-165'] :
          matched.classLevel === 'IX' ? ['it-402', 'ca-165'] :
          matched.classLevel === 'XI' || matched.classLevel === 'XII' ? ['ip-065', 'typo-817'] :
          ['cs-middle', 'ai-middle']
        )
      }));
      closeAuthModal();
      if (authSuccessCallback?.cb) {
        authSuccessCallback.cb();
      }
      return { success: true };
    }

    // If no match found:
    return {
      success: false,
      message: 'Student account not found with this username, registered email, or roll number. Please verify your credentials or contact the school administrator.'
    };
  };

  const register = (data: { name: string; email: string; studentId: string; classLevel: ClassLevel; password?: string }) => {
    const newStudent: UserAccount = {
      id: `usr-${Date.now()}`,
      name: data.name.trim(),
      email: data.email.trim(),
      studentId: data.studentId.trim() || `STD-${data.classLevel}${Math.floor(100 + Math.random() * 900)}`,
      classLevel: data.classLevel,
      role: 'student',
      avatarSeed: data.name,
      createdAt: new Date().toISOString()
    };

    setRegisteredStudents(prev => [...prev.filter(s => s.email !== newStudent.email), newStudent]);
    setCurrentUser(newStudent);
    setUserRole('student');
    logUserLoginToSupabase(newStudent);

    setStudentProfile({
      id: newStudent.id,
      name: newStudent.name,
      email: newStudent.email,
      studentId: newStudent.studentId,
      classLevel: newStudent.classLevel,
      avatarSeed: newStudent.name,
      targetExamYear: '2026',
      enrolledSubjects: ['it-402'],
      bookmarks: [],
      bookmarkedQuestions: [],
      chaptersCompletedCount: 0,
      questionsSolvedCount: 0,
      badges: []
    });

    addNotification({
      title: `Welcome to Zakir Learning Hub, ${newStudent.name}! 🎉`,
      message: `Your student account has been created. Start exploring chapter notes and taking quizzes!`,
      category: 'general',
      classLevel: newStudent.classLevel,
      linkTab: 'dashboard'
    });

    closeAuthModal();
    if (authSuccessCallback?.cb) {
      authSuccessCallback.cb();
    }
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
    setUserRole('student');
  };

  // Student Directory Operations
  const addStudentManually = (data: { name: string; email: string; username?: string; studentId?: string; rollNumber?: string; classLevel: ClassLevel; section?: string; schoolName?: string; targetExamYear?: string; password?: string; isActive?: boolean }) => {
    const cleanEmail = data.email.trim().toLowerCase();
    const cleanName = data.name.trim();
    if (!cleanEmail || !cleanName) {
      return { success: false, message: 'Student Name and Email are required.' };
    }

    const cleanUsername = (data.username?.trim().toLowerCase()) || cleanEmail.split('@')[0].replace(/[^a-z0-9_]/g, '');
    const cleanRollNumber = data.rollNumber?.trim() || String(Math.floor(1000 + Math.random() * 9000));
    const cleanStudentId = data.studentId?.trim() || `STD-${data.classLevel}-${cleanRollNumber}`;

    const newStudent: UserAccount = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: cleanName,
      email: cleanEmail,
      username: cleanUsername,
      studentId: cleanStudentId,
      rollNumber: cleanRollNumber,
      classLevel: data.classLevel,
      section: data.section || 'A',
      role: 'student',
      avatarSeed: cleanName,
      schoolName: data.schoolName || 'Zakir Learning Hub Partner School',
      targetExamYear: data.targetExamYear || '2026',
      password: data.password?.trim() || 'Student@123',
      isActive: data.isActive !== false,
      isLocked: data.isActive === false,
      enrolledSubjects: data.classLevel === 'X' ? ['it-402', 'ca-165'] :
                        data.classLevel === 'IX' ? ['it-402', 'ca-165'] :
                        data.classLevel === 'XI' || data.classLevel === 'XII' ? ['ip-065', 'typo-817'] :
                        ['cs-middle', 'ai-middle'],
      createdAt: new Date().toISOString()
    };

    setRegisteredStudents(prev => {
      const filtered = prev.filter(s => s.email.toLowerCase() !== cleanEmail && (s.username ? s.username.toLowerCase() !== cleanUsername : true));
      return [...filtered, newStudent];
    });

    logUserLoginToSupabase(newStudent);
    if (data.schoolName || data.targetExamYear) {
      syncProfileToSupabase({
        id: newStudent.id,
        name: newStudent.name,
        username: newStudent.username,
        email: newStudent.email,
        studentId: newStudent.studentId,
        rollNumber: newStudent.rollNumber,
        classLevel: newStudent.classLevel,
        section: newStudent.section,
        schoolName: data.schoolName,
        targetExamYear: data.targetExamYear || '2026',
        avatarSeed: newStudent.avatarSeed || newStudent.name,
        enrolledSubjects: newStudent.enrolledSubjects || ['it-402'],
        bookmarks: [],
        bookmarkedQuestions: [],
        chaptersCompletedCount: 0,
        questionsSolvedCount: 0,
        badges: []
      });
    }

    return { success: true, message: `Student "${cleanName}" enrolled successfully with Username: "${cleanUsername}"!` };
  };

  const addStudentsBulk = (students: Array<{ name: string; email: string; username?: string; studentId?: string; rollNumber?: string; classLevel: ClassLevel; section?: string; schoolName?: string; targetExamYear?: string; password?: string; isActive?: boolean }>) => {
    const validStudents: UserAccount[] = [];

    students.forEach((s, idx) => {
      const cleanEmail = s.email?.trim().toLowerCase();
      const cleanName = s.name?.trim();
      if (cleanEmail && cleanName) {
        const cls: ClassLevel = (s.classLevel && ['VI','VII','VIII','IX','X','XI','XII'].includes(String(s.classLevel).toUpperCase())) 
          ? String(s.classLevel).toUpperCase() as ClassLevel 
          : 'X';

        const cleanRoll = s.rollNumber?.trim() || String(1000 + idx);
        const cleanId = s.studentId?.trim() || `STD-${cls}-${cleanRoll}`;
        const cleanUser = s.username?.trim().toLowerCase() || cleanEmail.split('@')[0].replace(/[^a-z0-9_]/g, '');

        validStudents.push({
          id: `usr-bulk-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
          name: cleanName,
          email: cleanEmail,
          username: cleanUser,
          studentId: cleanId,
          rollNumber: cleanRoll,
          classLevel: cls,
          section: s.section || 'A',
          role: 'student',
          avatarSeed: cleanName,
          schoolName: s.schoolName || 'Zakir Learning Hub Partner School',
          targetExamYear: s.targetExamYear || '2026',
          password: s.password?.trim() || 'Student@123',
          isActive: s.isActive !== false,
          isLocked: s.isActive === false,
          enrolledSubjects: cls === 'X' ? ['it-402', 'ca-165'] :
                            cls === 'IX' ? ['it-402', 'ca-165'] :
                            cls === 'XI' || cls === 'XII' ? ['ip-065', 'typo-817'] :
                            ['cs-middle', 'ai-middle'],
          createdAt: new Date().toISOString()
        });
      }
    });

    if (validStudents.length === 0) {
      return { count: 0, message: 'No valid student records found in the uploaded file.' };
    }

    setRegisteredStudents(prev => {
      const existingEmails = new Set(prev.map(s => s.email.toLowerCase()));
      const newEntries = validStudents.filter(s => !existingEmails.has(s.email.toLowerCase()));
      return [...prev, ...newEntries];
    });

    bulkSyncStudentsToSupabase(validStudents.map(s => ({
      id: s.id,
      name: s.name,
      username: s.username,
      email: s.email,
      studentId: s.studentId,
      rollNumber: s.rollNumber,
      classLevel: s.classLevel,
      section: s.section,
      schoolName: s.schoolName || 'Zakir Learning Hub Partner School',
      targetExamYear: '2026'
    })));

    return { count: validStudents.length, message: `Successfully extracted and imported ${validStudents.length} students with individual credentials!` };
  };

  const setStudentPassword = (emailOrId: string, newPassword: string) => {
    const q = emailOrId.trim().toLowerCase();
    const cleanPass = newPassword.trim();

    if (!cleanPass || cleanPass.length < 3) {
      return { success: false, message: 'Password must be at least 3 characters long.' };
    }

    const matched = registeredStudents.find(
      s => (s.username && s.username.toLowerCase() === q) ||
           s.email.toLowerCase() === q || 
           s.studentId.toLowerCase() === q ||
           (s.rollNumber && s.rollNumber.toLowerCase() === q)
    );

    if (!matched) {
      return { 
        success: false, 
        message: 'Student account not found for this Username, Email, or Roll ID. Please contact your administrator.' 
      };
    }

    setRegisteredStudents(prev => prev.map(s => {
      if (
        (s.username && s.username.toLowerCase() === q) ||
        s.email.toLowerCase() === q || 
        s.studentId.toLowerCase() === q ||
        (s.rollNumber && s.rollNumber.toLowerCase() === q)
      ) {
        return { ...s, password: cleanPass };
      }
      return s;
    }));

    return {
      success: true,
      message: `Password created/updated successfully for ${matched.name}! You can now sign in with your password.`
    };
  };

  const sendSupabaseResetEmail = async (email: string) => {
    return await sendPasswordResetEmail(email);
  };

  const deleteStudent = (studentIdOrEmail: string) => {
    setRegisteredStudents(prev => prev.filter(s => 
      s.email.toLowerCase() !== studentIdOrEmail.toLowerCase() && 
      s.studentId?.toLowerCase() !== studentIdOrEmail.toLowerCase() &&
      s.id !== studentIdOrEmail
    ));
    deleteProfileFromSupabase(studentIdOrEmail);
  };

  const updateStudent = (id: string, updates: Partial<UserAccount>) => {
    setRegisteredStudents(prev => prev.map(s => {
      if (s.id === id || s.email === id || s.studentId === id) {
        const updated = { ...s, ...updates };
        syncProfileToSupabase({
          id: updated.id,
          name: updated.name,
          username: updated.username,
          email: updated.email,
          studentId: updated.studentId,
          rollNumber: updated.rollNumber,
          classLevel: updated.classLevel,
          section: updated.section,
          schoolName: updated.schoolName,
          targetExamYear: updated.targetExamYear || '2026',
          avatarSeed: updated.avatarSeed || updated.name,
          enrolledSubjects: updated.enrolledSubjects || ['it-402'],
          bookmarks: [],
          bookmarkedQuestions: [],
          badges: []
        });
        return updated;
      }
      return s;
    }));
  };

  const toggleStudentLock = (id: string) => {
    setRegisteredStudents(prev => prev.map(s => {
      if (s.id === id || s.email === id || s.studentId === id) {
        const updated = { ...s, isLocked: !(s as any).isLocked };
        syncProfileToSupabase({
          id: updated.id,
          name: updated.name,
          username: updated.username,
          email: updated.email,
          studentId: updated.studentId,
          rollNumber: updated.rollNumber,
          classLevel: updated.classLevel,
          section: updated.section,
          schoolName: updated.schoolName,
          targetExamYear: updated.targetExamYear || '2026',
          avatarSeed: updated.avatarSeed || updated.name,
          enrolledSubjects: updated.enrolledSubjects || ['it-402'],
          bookmarks: [],
          bookmarkedQuestions: [],
          badges: []
        });
        return updated;
      }
      return s;
    }));
  };

  // Academic Sessions Management
  const addAcademicSession = (session: AcademicSession) => {
    setAcademicSessions(prev => [session, ...prev.filter(s => s.id !== session.id)]);
  };

  const updateAcademicSession = (id: string, updates: Partial<AcademicSession>) => {
    setAcademicSessions(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const deleteAcademicSession = (id: string) => {
    setAcademicSessions(prev => prev.filter(s => s.id !== id));
  };

  const setCurrentAcademicSession = (id: string) => {
    setAcademicSessions(prev => prev.map(s => ({ ...s, isCurrent: s.id === id })));
  };

  // Profile
  const updateStudentProfile = (updated: Partial<StudentProfile>) => {
    setStudentProfile(prev => {
      const next = { ...prev, ...updated };
      syncProfileToSupabase(next);
      return next;
    });
    if (currentUser) {
      setCurrentUser(prev => prev ? {
        ...prev,
        name: updated.name || prev.name,
        classLevel: updated.classLevel || prev.classLevel,
        email: updated.email || prev.email
      } : null);
    }
  };

  // Custom Classes
  const addCustomClass = (cls: { level: string; name: string; subtitle: string; order?: number; isHidden?: boolean }) => {
    setCustomClasses(prev => [...prev.filter(c => c.level !== cls.level), cls]);
  };

  const updateCustomClass = (level: string, updates: Partial<{ level: string; name: string; subtitle: string; order?: number; isHidden?: boolean }>) => {
    setCustomClasses(prev => prev.map(c => c.level === level ? { ...c, ...updates } : c));
  };

  const deleteCustomClass = (level: string) => {
    setCustomClasses(prev => prev.filter(c => c.level !== level));
  };

  const reorderClasses = (fromIndex: number, toIndex: number) => {
    setCustomClasses(prev => {
      const copy = [...prev];
      const [moved] = copy.splice(fromIndex, 1);
      copy.splice(toIndex, 0, moved);
      return copy;
    });
  };

  // Custom Subjects
  const addCustomSubject = (sub: SubjectInfo) => {
    setCustomSubjects(prev => [...prev.filter(s => s.id !== sub.id), sub]);
  };

  const updateCustomSubject = (id: string, updates: Partial<SubjectInfo>) => {
    setCustomSubjects(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const deleteCustomSubject = (id: string) => {
    setCustomSubjects(prev => prev.filter(s => s.id !== id));
  };

  const reorderSubjects = (fromIndex: number, toIndex: number) => {
    setCustomSubjects(prev => {
      const copy = [...prev];
      const [moved] = copy.splice(fromIndex, 1);
      copy.splice(toIndex, 0, moved);
      return copy;
    });
  };

  // Custom Chapters
  const addCustomChapter = (ch: Chapter) => {
    setCustomChapters(prev => [...prev.filter(c => c.id !== ch.id), ch]);
  };

  const updateCustomChapter = (id: string, updates: Partial<Chapter>) => {
    setCustomChapters(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteCustomChapter = (id: string) => {
    setCustomChapters(prev => prev.filter(c => c.id !== id));
  };

  const reorderChapters = (fromIndex: number, toIndex: number) => {
    setCustomChapters(prev => {
      const copy = [...prev];
      const [moved] = copy.splice(fromIndex, 1);
      copy.splice(toIndex, 0, moved);
      return copy;
    });
  };

  // Dynamic Chapter-Wise Learning Resources (LMS)
  const addLearningResource = (resourceData: Omit<LearningResource, 'id' | 'uploadedDate' | 'order'> & Partial<{ id: string; uploadedDate: string; order: number }>): LearningResource => {
    const chapterResCount = learningResources.filter(r => r.chapterId === resourceData.chapterId).length;
    const newResource: LearningResource = {
      ...resourceData,
      id: resourceData.id || `res-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      uploadedDate: resourceData.uploadedDate || new Date().toISOString().split('T')[0],
      order: resourceData.order ?? (chapterResCount + 1),
      published: resourceData.published ?? true
    };
    setLearningResources(prev => [...prev, newResource]);

    // Save to Supabase (handles storage upload for PDFs & table upsert)
    saveLearningResourceToSupabase(newResource);

    addNotification({
      title: `New Resource Added: ${newResource.title}`,
      message: `Available under ${newResource.chapterTitle || 'Chapter'} for Class ${newResource.classLevel}.`,
      category: 'chapter',
      classLevel: newResource.classLevel,
      linkTab: 'materials'
    });

    return newResource;
  };

  const updateLearningResource = (id: string, updates: Partial<LearningResource>) => {
    setLearningResources(prev => prev.map(res => {
      if (res.id === id) {
        const updated = { ...res, ...updates };
        saveLearningResourceToSupabase(updated);
        return updated;
      }
      return res;
    }));
  };

  const replaceResourceFile = (id: string, fileData: { fileName: string; fileSize?: string; fileUrl: string; pageCount?: number }) => {
    setLearningResources(prev => prev.map(res => {
      if (res.id === id) {
        const updated = {
          ...res,
          fileName: fileData.fileName,
          fileSize: fileData.fileSize || res.fileSize,
          fileUrl: fileData.fileUrl,
          pageCount: fileData.pageCount || res.pageCount
        };
        saveLearningResourceToSupabase(updated);
        return updated;
      }
      return res;
    }));
  };

  const reorderLearningResources = (chapterId: string, fromIndex: number, toIndex: number) => {
    setLearningResources(prev => {
      const chapterResources = prev.filter(r => r.chapterId === chapterId).sort((a, b) => a.order - b.order);
      if (fromIndex < 0 || fromIndex >= chapterResources.length || toIndex < 0 || toIndex >= chapterResources.length) {
        return prev;
      }
      const itemToMove = chapterResources[fromIndex];
      const reordered = [...chapterResources];
      reordered.splice(fromIndex, 1);
      reordered.splice(toIndex, 0, itemToMove);
      const reorderedWithUpdatedOrder = reordered.map((item, idx) => ({ ...item, order: idx + 1 }));
      const otherResources = prev.filter(r => r.chapterId !== chapterId);
      const allUpdated = [...otherResources, ...reorderedWithUpdatedOrder];
      reorderedWithUpdatedOrder.forEach(r => saveLearningResourceToSupabase(r));
      return allUpdated;
    });
  };

  const togglePublishLearningResource = (id: string) => {
    setLearningResources(prev => prev.map(res => {
      if (res.id === id) {
        const updated = { ...res, published: !res.published };
        saveLearningResourceToSupabase(updated);
        return updated;
      }
      return res;
    }));
  };

  const deleteLearningResource = (id: string) => {
    setLearningResources(prev => prev.filter(res => res.id !== id));
    deleteLearningResourceFromSupabase(id);
  };

  const getResourcesForChapter = (chapterId: string, includeUnpublished: boolean = false): LearningResource[] => {
    return learningResources
      .filter(res => res.chapterId === chapterId && (includeUnpublished || res.published))
      .sort((a, b) => a.order - b.order);
  };

  // Study Materials
  const addStudyMaterial = (mat: Omit<StudyMaterial, 'id' | 'uploadedDate'>) => {
    const newMat: StudyMaterial = {
      ...mat,
      id: `mat-${Date.now()}`,
      uploadedDate: new Date().toISOString().split('T')[0],
      published: true
    };
    setStudyMaterials(prev => [newMat, ...prev]);

    saveStudyMaterialToSupabase(newMat);
    if (newMat.pdfDataUrl) {
      savePdfChapterToSupabase({
        id: newMat.id,
        fileName: newMat.downloadableFileName || `${newMat.title}.pdf`,
        classLevel: newMat.classLevel,
        subjectId: newMat.subjectId,
        chapterTitle: newMat.chapterTitle,
        questionCount: 0,
        extractedQuestions: [],
        pdfDataUrl: newMat.pdfDataUrl
      });
    }

    addNotification({
      title: `New Material Added for Class ${mat.classLevel}`,
      message: `${mat.title} (${mat.chapterTitle}) is now available.`,
      category: 'chapter',
      classLevel: mat.classLevel,
      linkTab: 'materials'
    });
  };

  const deleteStudyMaterial = (id: string) => {
    setStudyMaterials(prev => prev.filter(m => m.id !== id));
    deleteStudyMaterialFromSupabase(id);
  };

  const updateStudyMaterial = (id: string, updates: Partial<StudyMaterial>) => {
    setStudyMaterials(prev => prev.map(m => {
      if (m.id === id) {
        const updated = { ...m, ...updates };
        saveStudyMaterialToSupabase(updated);
        return updated;
      }
      return m;
    }));
  };

  const replaceStudyMaterial = (id: string, newFileData: Partial<StudyMaterial>) => {
    setStudyMaterials(prev => prev.map(m => {
      if (m.id === id) {
        const updated = {
          ...m,
          ...newFileData,
          uploadedDate: new Date().toISOString().split('T')[0]
        };
        saveStudyMaterialToSupabase(updated);
        return updated;
      }
      return m;
    }));
  };

  const togglePublishMaterial = (id: string) => {
    setStudyMaterials(prev => prev.map(m => {
      if (m.id === id) {
        const updated = { ...m, published: !m.published };
        saveStudyMaterialToSupabase(updated);
        return updated;
      }
      return m;
    }));
  };

  // Questions
  const addQuestion = (q: Omit<Question, 'id'>) => {
    const newQ: Question = {
      ...q,
      id: `q-custom-${Date.now()}`,
      published: true
    };
    setQuestionBank(prev => [newQ, ...prev]);
    saveQuestionToSupabase(newQ);
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestionBank(prev => prev.map(q => {
      if (q.id === id) {
        const updated = { ...q, ...updates };
        saveQuestionToSupabase(updated);
        return updated;
      }
      return q;
    }));
  };

  const deleteQuestion = (id: string) => {
    setQuestionBank(prev => prev.filter(q => q.id !== id));
    deleteQuestionFromSupabase(id);
  };

  const togglePublishQuestion = (id: string) => {
    setQuestionBank(prev => prev.map(q => {
      if (q.id === id) {
        const updated = { ...q, published: !q.published };
        saveQuestionToSupabase(updated);
        return updated;
      }
      return q;
    }));
  };

  // Quizzes
  const createQuiz = (quiz: Omit<QuizConfig, 'id'>) => {
    const newQuiz: QuizConfig = {
      ...quiz,
      id: `quiz-custom-${Date.now()}`,
      published: true
    };
    setQuizzes(prev => [newQuiz, ...prev]);
    saveQuizToSupabase(newQuiz);

    addNotification({
      title: `⚡ Live Assessment Published: Class ${quiz.classLevel}`,
      message: `${quiz.title} (${quiz.questionsCount} questions, ${quiz.timeLimitMinutes} mins).`,
      category: 'quiz',
      classLevel: quiz.classLevel,
      linkTab: 'quiz'
    });

    // 1. Broadcast via HTTP endpoint to all connected WebSocket clients
    try {
      fetch('/api/quizzes/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quiz: newQuiz, action: 'created' })
      }).catch(() => {});
    } catch {
      // ignore
    }

    // 2. Broadcast via BroadcastChannel
    try {
      const channel = new BroadcastChannel('zakir_live_tests_sync');
      channel.postMessage({ type: 'QUIZ_CREATED', quiz: newQuiz });
      channel.close();
    } catch {
      // ignore
    }
  };

  const deleteQuiz = (id: string) => {
    setQuizzes(prev => prev.filter(q => q.id !== id));
    deleteQuizFromSupabase(id);
  };

  const togglePublishQuiz = (id: string) => {
    setQuizzes(prev => prev.map(q => {
      if (q.id === id) {
        const updated = { ...q, published: !q.published };
        saveQuizToSupabase(updated);
        return updated;
      }
      return q;
    }));
  };

  // Attempts & Bookmarks
  const recordQuizAttempt = (attempt: Omit<QuizAttempt, 'id' | 'date'>): QuizAttempt => {
    const newAttempt: QuizAttempt = {
      ...attempt,
      id: `att-${Date.now()}`,
      date: new Date().toISOString()
    };
    
    setQuizAttempts(prev => [newAttempt, ...prev]);
    saveQuizAttemptToSupabase(newAttempt);

    setStudentProfile(prev => ({
      ...prev,
      questionsSolvedCount: (prev.questionsSolvedCount || 0) + attempt.totalQuestions,
      lastActiveTopic: {
        subjectName: attempt.subjectId === 'it-402' ? 'Information Technology' : 'Informatics Practices',
        chapterTitle: attempt.chapterTitle,
        classLevel: attempt.classLevel
      }
    }));

    return newAttempt;
  };

  const toggleBookmark = (materialId: string) => {
    setStudentProfile(prev => {
      const exists = prev.bookmarks.includes(materialId);
      const nextBookmarks = exists 
        ? prev.bookmarks.filter(id => id !== materialId)
        : [...prev.bookmarks, materialId];
      const updated = { ...prev, bookmarks: nextBookmarks };
      syncProfileToSupabase(updated);
      return updated;
    });
  };

  const toggleQuestionBookmark = (questionId: string) => {
    setStudentProfile(prev => {
      const exists = prev.bookmarkedQuestions?.includes(questionId);
      return {
        ...prev,
        bookmarkedQuestions: exists
          ? prev.bookmarkedQuestions.filter(id => id !== questionId)
          : [...(prev.bookmarkedQuestions || []), questionId]
      };
    });
  };

  // Doubts
  const submitDoubt = (doubt: Omit<DoubtQuery, 'id' | 'timestamp' | 'status'>) => {
    const newDoubt: DoubtQuery = {
      ...doubt,
      id: `doubt-${Date.now()}`,
      timestamp: new Date().toISOString(),
      status: 'pending'
    };
    setDoubts(prev => [newDoubt, ...prev]);
    submitDoubtToSupabase(newDoubt);
  };

  const replyToDoubt = (id: string, reply: string) => {
    setDoubts(prev => prev.map(d => (d.id === id ? { ...d, reply, status: 'replied' } : d)));
    updateDoubtReplyInSupabase(id, reply);
  };

  // Notifications
  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const addNotification = (notif: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>) => {
    const newNotif: AppNotification = {
      ...notif,
      id: `notif-${Date.now()}`,
      timestamp: new Date().toISOString(),
      isRead: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const addPYQPaper = (paper: Omit<PYQPaper, 'id' | 'uploadedAt'>) => {
    const newPaper: PYQPaper = {
      ...paper,
      id: `pyq-${paper.year}-${paper.classLevel.toLowerCase()}-${paper.subjectId}-${Date.now()}`,
      uploadedAt: new Date().toISOString()
    };
    setPyqPapers(prev => [newPaper, ...prev]);

    addNotification({
      title: `Board Paper Added: Class ${paper.classLevel} (${paper.year})`,
      message: `${paper.subjectName} (${paper.code}) previous year paper uploaded.`,
      category: 'general',
      classLevel: paper.classLevel,
      linkTab: 'pyq'
    });
  };

  const deletePYQPaper = (id: string) => {
    setPyqPapers(prev => prev.filter(p => p.id !== id));
  };

  const updatePYQPaper = (id: string, updates: Partial<PYQPaper>) => {
    setPyqPapers(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  // Computer Lab Online Examination Handlers
  const createLabExam = (exam: LabExamConfig) => {
    setLabExams(prev => [exam, ...prev.filter(e => e.id !== exam.id)]);
    saveLabExamToSupabase(exam);
  };

  const updateLabExam = (id: string, updates: Partial<LabExamConfig>) => {
    setLabExams(prev => prev.map(e => {
      if (e.id === id) {
        const updated = { ...e, ...updates };
        saveLabExamToSupabase(updated);
        return updated;
      }
      return e;
    }));
  };

  const deleteLabExam = (id: string) => {
    setLabExams(prev => prev.filter(e => e.id !== id));
    deleteLabExamFromSupabase(id);
  };

  const duplicateLabExam = (id: string): LabExamConfig | null => {
    const original = labExams.find(e => e.id === id);
    if (!original) return null;
    const newId = `exam-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const duplicated: LabExamConfig = {
      ...original,
      id: newId,
      title: `${original.title} (Copy)`,
      examCode: `${original.examCode}-COPY`,
      status: 'draft',
      createdAt: new Date().toISOString()
    };
    setLabExams(prev => [duplicated, ...prev]);
    return duplicated;
  };

  const setLabExamStatus = (id: string, status: LabExamStatus) => {
    setLabExams(prev => prev.map(e => e.id === id ? { ...e, status } : e));
  };

  const recordLabExamAnswer = (examId: string, studentId: string, questionId: string, answer: string | number, workstationIp?: string) => {
    setLabExamSessions(prev => {
      const existing = prev.find(s => s.examId === examId && s.studentId === studentId);
      const now = new Date().toISOString();
      if (existing) {
        return prev.map(s => {
          if (s.examId === examId && s.studentId === studentId) {
            return {
              ...s,
              status: s.status === 'not_started' ? 'in_progress' : s.status,
              workstationIp: workstationIp || s.workstationIp,
              lastActiveAt: now,
              answers: { ...s.answers, [questionId]: answer }
            };
          }
          return s;
        });
      } else {
        const student = registeredStudents.find(st => st.id === studentId || st.studentId === studentId);
        const exam = labExams.find(e => e.id === examId);
        const newSession: LabExamStudentSession = {
          id: `sess-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          examId,
          studentId,
          studentName: student?.name || 'Student',
          rollNumber: student?.studentId,
          classLevel: exam?.classLevel || 'X',
          workstationIp: workstationIp || 'LAB-PC',
          status: 'in_progress',
          startedAt: now,
          lastActiveAt: now,
          answers: { [questionId]: answer },
          autoScore: 0,
          finalScore: 0,
          totalMarks: exam?.totalMarks || 25,
          percentage: 0,
          passed: false,
          isEvaluated: false
        };
        return [...prev, newSession];
      }
    });
  };

  const submitLabExam = (examId: string, studentId: string) => {
    const exam = labExams.find(e => e.id === examId);
    if (!exam) return;
    const now = new Date().toISOString();

    setLabExamSessions(prev => prev.map(s => {
      if (s.examId === examId && s.studentId === studentId) {
        let autoScore = 0;
        exam.questions.forEach(q => {
          const studentAns = s.answers[q.id];
          if (studentAns !== undefined && studentAns !== null && studentAns !== '') {
            if (q.type === 'mcq' || q.type === 'true_false') {
              if (Number(studentAns) === Number(q.correctAnswer)) {
                autoScore += q.marks;
              }
            } else if (q.type === 'fill_blank') {
              if (String(studentAns).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase()) {
                autoScore += q.marks;
              }
            }
          }
        });

        const totalMarks = exam.totalMarks;
        const percentage = Math.round((autoScore / totalMarks) * 100);
        const passed = autoScore >= exam.passingMarks;

        const updatedSession = {
          ...s,
          status: 'submitted' as const,
          submittedAt: now,
          autoScore,
          finalScore: autoScore,
          percentage,
          passed,
          isEvaluated: !exam.questions.some(q => q.type === 'short_answer' || q.type === 'long_answer' || q.type === 'practical_code')
        };
        saveLabExamSessionToSupabase(updatedSession);
        return updatedSession;
      }
      return s;
    }));
  };

  const evaluateLabExamSession = (
    sessionId: string, 
    manualEvaluations: Record<string, { marks: number; feedback?: string }>,
    options?: { evaluatorName?: string; teacherFeedback?: string; resultsReleased?: boolean }
  ) => {
    const evaluator = options?.evaluatorName || 'Zakir Hussain (PGT Computer Science)';
    const now = new Date().toISOString();

    setLabExamSessions(prev => prev.map(s => {
      if (s.id === sessionId) {
        let manualScore = 0;
        Object.values(manualEvaluations).forEach(ev => {
          manualScore += (ev.marks || 0);
        });
        const finalScore = s.autoScore + manualScore;
        const percentage = Math.round((finalScore / s.totalMarks) * 100);
        const exam = labExams.find(e => e.id === s.examId);
        const passed = exam ? finalScore >= exam.passingMarks : percentage >= 40;

        const historyItem = {
          evaluator,
          evaluatedAt: now,
          previousScore: s.finalScore,
          newScore: finalScore,
          changesNote: `Evaluated ${Object.keys(manualEvaluations).length} subjective questions (+${manualScore} marks). Total: ${finalScore}/${s.totalMarks}.`
        };

        const updatedSession = {
          ...s,
          manualEvaluations,
          manualScore,
          finalScore,
          percentage,
          passed,
          isEvaluated: true,
          evaluatedBy: evaluator,
          evaluatedAt: now,
          teacherFeedback: options?.teacherFeedback !== undefined ? options.teacherFeedback : s.teacherFeedback,
          resultsReleased: options?.resultsReleased !== undefined ? options.resultsReleased : s.resultsReleased,
          evaluationHistory: [...(s.evaluationHistory || []), historyItem]
        };
        saveLabExamSessionToSupabase(updatedSession);
        return updatedSession;
      }
      return s;
    }));

    // Post to backend to persist to admin_store.json
    try {
      fetch('/api/lab-exams/session/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          manualEvaluations,
          evaluatorName: evaluator,
          teacherFeedback: options?.teacherFeedback,
          resultsReleased: options?.resultsReleased
        })
      }).catch(err => console.warn('Backend eval sync warning:', err));
    } catch {
      // offline fallback
    }
  };

  const releaseExamResults = (examId: string, showResultsImmediately: boolean, showAnswerKeysToStudents?: boolean) => {
    setLabExams(prev => prev.map(e => {
      if (e.id === examId) {
        return {
          ...e,
          showResultsImmediately,
          showAnswerKeysToStudents: showAnswerKeysToStudents !== undefined ? showAnswerKeysToStudents : e.showAnswerKeysToStudents
        };
      }
      return e;
    }));

    // Also mark sessions of this exam with resultsReleased
    setLabExamSessions(prev => prev.map(s => {
      if (s.examId === examId) {
        return { ...s, resultsReleased: showResultsImmediately };
      }
      return s;
    }));

    try {
      fetch('/api/lab-exams/exam/release-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examId,
          showResultsImmediately,
          showAnswerKeysToStudents
        })
      }).catch(() => {});
    } catch {
      // offline fallback
    }
  };

  const reopenLabExamForStudent = (sessionId: string) => {
    setLabExamSessions(prev => prev.map(s => s.id === sessionId ? { ...s, status: 'in_progress', submittedAt: undefined } : s));
  };

  const syncAllCurriculumMaterials = () => {
    localStorage.setItem('zakir_study_materials', JSON.stringify(SEED_STUDY_MATERIALS));
    localStorage.setItem('zakir_custom_chapters', JSON.stringify(CHAPTERS_DATA));
    setStudyMaterials(SEED_STUDY_MATERIALS);
    setCustomChapters(CHAPTERS_DATA);
    addNotification({
      title: 'Curriculum Material Synchronized',
      message: 'All Information Technology chapters and PDFs have been updated.',
      category: 'chapter',
      linkTab: 'materials'
    });
  };

  const syncStoreToBackend = async (data?: any) => {
    try {
      await fetch('/api/admin/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data || {
          classes: customClasses,
          subjects: customSubjects,
          chapters: customChapters,
          studyMaterials,
          questionBank,
          tests: labExams,
          students: registeredStudents,
          attempts: quizAttempts,
          labSessions: labExamSessions
        })
      });
    } catch {
      // offline / local fallback
    }

    try {
      await syncAllAppDataToSupabase({
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
    } catch {
      // offline / local fallback
    }
  };

  const resetAllData = () => {
    localStorage.clear();
    const PROD_KEY = 'zakir_prod_clean_slate_2026_final_v2';
    localStorage.setItem(PROD_KEY, 'true');
    localStorage.setItem('zakir_registered_students', JSON.stringify([ADMIN_ACCOUNT]));
    localStorage.setItem('zakir_student_profile', JSON.stringify(DEFAULT_PROFILE));
    localStorage.setItem('zakir_study_materials', JSON.stringify([]));
    localStorage.setItem('zakir_questions', JSON.stringify([]));
    localStorage.setItem('zakir_quizzes', JSON.stringify([]));
    localStorage.setItem('zakir_quiz_attempts', JSON.stringify([]));
    localStorage.setItem('zakir_doubts', JSON.stringify([]));
    localStorage.setItem('zakir_notifications', JSON.stringify([]));
    localStorage.setItem('zakir_custom_classes', JSON.stringify(CLASSES_LIST));
    localStorage.setItem('zakir_custom_subjects', JSON.stringify(SUBJECTS_LIST));
    localStorage.setItem('zakir_custom_chapters', JSON.stringify(CHAPTERS_DATA));

    setCurrentUser(null);
    setRegisteredStudents([ADMIN_ACCOUNT]);
    setStudentProfile(DEFAULT_PROFILE);
    setStudyMaterials([]);
    setQuestionBank([]);
    setQuizzes([]);
    setQuizAttempts([]);
    setDoubts([]);
    setNotifications([]);
    setCustomClasses(CLASSES_LIST);
    setCustomSubjects(SUBJECTS_LIST);
    setCustomChapters(CHAPTERS_DATA);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        userRole,
        setUserRole,
        registeredStudents,
        addStudentManually,
        addStudentsBulk,
        updateStudent,
        deleteStudent,
        toggleStudentLock,
        setStudentPassword,
        sendSupabaseResetEmail,
        isAuthModalOpen,
        authModalTab,
        authNoticeMessage,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        logout,
        studentProfile,
        updateStudentProfile,
        selectedClassFilter,
        setSelectedClassFilter,
        selectedSubjectFilter,
        setSelectedSubjectFilter,
        academicSessions,
        addAcademicSession,
        updateAcademicSession,
        deleteAcademicSession,
        setCurrentAcademicSession,
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
        addLearningResource,
        updateLearningResource,
        replaceResourceFile,
        reorderLearningResources,
        togglePublishLearningResource,
        deleteLearningResource,
        getResourcesForChapter,
        studyMaterials,
        addStudyMaterial,
        updateStudyMaterial,
        replaceStudyMaterial,
        deleteStudyMaterial,
        togglePublishMaterial,
        questionBank,
        addQuestion,
        updateQuestion,
        deleteQuestion,
        togglePublishQuestion,
        quizzes,
        createQuiz,
        deleteQuiz,
        togglePublishQuiz,
        labExams,
        createLabExam,
        updateLabExam,
        deleteLabExam,
        duplicateLabExam,
        setLabExamStatus,
        labExamSessions,
        recordLabExamAnswer,
        submitLabExam,
        evaluateLabExamSession,
        reopenLabExamForStudent,
        releaseExamResults,
        quizAttempts,
        recordQuizAttempt,
        toggleBookmark,
        toggleQuestionBookmark,
        activeCertificateAttempt,
        setActiveCertificateAttempt,
        activeTestForReview,
        setActiveTestForReview,
        doubts,
        submitDoubt,
        replyToDoubt,
        pyqPapers,
        addPYQPaper,
        updatePYQPaper,
        deletePYQPaper,
        notifications,
        markNotificationRead,
        addNotification,
        syncAllCurriculumMaterials,
        syncStoreToBackend,
        resetAllData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
