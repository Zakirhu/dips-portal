export type ClassLevel = 'VI' | 'VII' | 'VIII' | 'IX' | 'X' | 'XI' | 'XII' | string;

export type SubjectId = 
  | 'it-402' // Information Technology (Class IX-X)
  | 'it-802' // Information Technology (Class XI-XII)
  | 'ip-065' // Informatics Practices (Class XI-XII)
  | 'typo-817' // Typography & Computer Applications (Class XI-XII)
  | 'ca-165' // Computer Applications (Class IX-X)
  | 'cs-middle' // Computer Science & Digital Literacy (Class VI-VIII)
  | 'ai-middle' // Foundations of AI (Class VI-VIII)
  | string;

export interface AcademicSession {
  id: string;
  name: string; // e.g. "2025–2026"
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export interface ClassInfo {
  level: string;
  name: string;
  subtitle: string;
  order?: number;
  isHidden?: boolean;
  isActive?: boolean;
}

export interface SubjectInfo {
  id: SubjectId;
  code: string;
  name: string;
  classes: ClassLevel[];
  description: string;
  iconName: string;
  accentColor: string;
  order?: number;
  isHidden?: boolean;
  isActive?: boolean;
}

export interface Chapter {
  id: string;
  classLevel: ClassLevel;
  subjectId: SubjectId;
  chapterNumber: number;
  title: string;
  description: string;
  topics?: string[];
  order?: number;
  isHidden?: boolean;
  isActive?: boolean;
}

export type MaterialType = 'notes' | 'previous_year_paper' | 'important_questions' | 'practical_file' | 'cheat_sheet' | 'video';

export type ChapterResourceType = 
  | 'notes'                 // Notes and study material
  | 'qa'                    // Question answers
  | 'important_questions'   // Important questions
  | 'mcq'                   // MCQs
  | 'practical_assignment'  // Practical files and assignments
  | 'pyq'                   // Previous-year questions and papers
  | 'revision'              // Revision material
  | 'chapter_test';         // Online chapter tests

export interface QAItem {
  id: string;
  question: string;
  answer: string;
  marks?: number;
}

export interface MCQOptionItem {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation?: string;
  marks?: number;
}

export interface LearningResource {
  id: string;
  title: string;
  description: string;
  resourceType: ChapterResourceType;
  classLevel: ClassLevel;
  subjectId: SubjectId;
  chapterId: string;
  chapterTitle?: string;
  published: boolean;
  uploadedDate: string;
  order: number;
  
  // Uploaded file details
  fileName?: string;
  fileSize?: string;
  fileUrl?: string; // Data URL or URL (e.g. PDF)
  pageCount?: number;
  
  // Text or Markdown content
  content?: string;
  
  // Structured Q&A pairs
  qaItems?: QAItem[];
  
  // Structured MCQs
  mcqItems?: MCQOptionItem[];
  
  // Online Chapter Test parameters
  testDurationMinutes?: number;
  totalMarks?: number;
  passingMarks?: number;
  testInstructions?: string;

  author?: string;
  tags?: string[];
}

export interface StudyMaterial {
  id: string;
  classLevel: ClassLevel;
  subjectId: SubjectId;
  chapterId: string;
  chapterTitle: string;
  title: string;
  type: MaterialType;
  description: string;
  readTimeMinutes: number;
  uploadedDate: string;
  author: string;
  content: string; // Markdown or rich text content
  downloadableFileName?: string;
  codeSnippet?: {
    language: string;
    code: string;
    output?: string;
  };
  keyQuestions?: Array<{
    question: string;
    marks: number;
    answer: string;
  }>;
  videoUrl?: string;
  tags: string[];
  published?: boolean;
  pdfDataUrl?: string; // Base64 or Blob data URL of uploaded PDF
  fileSize?: string; // e.g. "1.2 MB"
  pageCount?: number;
  sourceUrl?: string;
  curriculumPart?: string; // e.g. "Part B: Subject Specific Skills"
}

export type QuestionDifficulty = 'easy' | 'medium' | 'hard';
export type QuestionType = 'mcq' | 'multiple_select' | 'true_false' | 'fill_blank' | 'short_answer' | 'long_answer' | 'practical_code';

export interface Question {
  id: string;
  classLevel: ClassLevel;
  subjectId: SubjectId;
  chapterId: string;
  chapterTitle: string;
  question: string;
  type: QuestionType;
  difficulty: QuestionDifficulty;
  marks: number;
  options: string[]; // options for MCQ or True/False
  correctOptionIndex: number; // 0, 1, 2, 3
  correctAnswerText?: string; // for fill_blank, short_answer, or long_answer
  explanation: string;
  imageUrl?: string; // Optional question diagram or image
  codeSnippet?: string;
  tags?: string[];
  published?: boolean;
}

export type QuizMode = 'practice' | 'exam';

export interface QuizConfig {
  id: string;
  title: string;
  classLevel: ClassLevel;
  subjectId: SubjectId;
  chapterId?: string; // Optional if comprehensive
  chapterTitle?: string;
  mode: QuizMode;
  timeLimitMinutes: number;
  totalMarks: number;
  questionsCount: number;
  difficulty: 'all' | QuestionDifficulty;
  questions: Question[];
  description?: string;
  published?: boolean;
}

export interface QuizAttempt {
  id: string;
  studentId?: string;
  quizId: string;
  quizTitle: string;
  classLevel: ClassLevel;
  subjectId: SubjectId;
  chapterTitle: string;
  mode: QuizMode;
  date: string;
  score: number;
  totalMarks: number;
  percentage: number;
  timeSpentSeconds: number;
  totalQuestions: number;
  correctAnswersCount: number;
  userAnswers: Record<string, number>; // questionId -> selectedOptionIndex
  questionDetails: Question[];
  studentName?: string;
  passed?: boolean;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  username?: string; // student unique login username (e.g. rahul_x)
  studentId: string; // unique student ID (e.g. "STD-X-1024")
  rollNumber?: string; // admission or class roll number (e.g. "1024" or "ADM-2026-44")
  classLevel: ClassLevel;
  role: 'student' | 'admin';
  avatarSeed?: string;
  createdAt?: string;
  password?: string;
  isLocked?: boolean; // Access control: locked/deactivated
  isActive?: boolean;
  section?: string; // e.g. "A", "B", "C", "D"
  schoolName?: string;
  targetExamYear?: string;
  enrolledSubjects?: SubjectId[];
}

export interface StudentProfile {
  id?: string;
  name: string;
  username?: string;
  studentId: string;
  rollNumber?: string;
  classLevel: ClassLevel;
  section?: string;
  email: string;
  avatarSeed: string;
  targetExamYear: string;
  enrolledSubjects: SubjectId[];
  bookmarks: string[]; // Material IDs
  bookmarkedQuestions: string[]; // Question IDs
  chaptersCompletedCount?: number;
  questionsSolvedCount?: number;
  lastActiveTopic?: {
    subjectName: string;
    chapterTitle: string;
    classLevel: ClassLevel;
    materialId?: string;
  };
  schoolName?: string;
  badges: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
    unlockedAt?: string;
  }>;
}

export interface DoubtQuery {
  id: string;
  studentName: string;
  studentClass: ClassLevel;
  subject: string;
  topic: string;
  query: string;
  timestamp: string;
  status: 'replied' | 'pending';
  reply?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  category: 'chapter' | 'quiz' | 'practical' | 'general';
  classLevel?: ClassLevel;
  timestamp: string;
  isRead: boolean;
  linkTab?: string;
}

export interface PYQQuestionItem {
  qNumber: string;
  question: string;
  marks: number;
  officialAnswer: string;
  stepMarkingScheme: string;
}

export interface PYQPaper {
  id: string;
  year: string;
  examType: string;
  classLevel: ClassLevel;
  subjectId: SubjectId;
  subjectName: string;
  code: string;
  totalMarks: number;
  timeHours: number;
  questionsSummary: string;
  sampleQuestions: PYQQuestionItem[];
  pdfDataUrl?: string; // Uploaded PDF base64 or blob URL
  fileName?: string;
  fileSize?: string;
  uploadedAt?: string;
  markingSchemePdfUrl?: string;
  markingSchemeFileName?: string;
}

export type LabExamStatus = 'draft' | 'scheduled' | 'live' | 'paused' | 'completed' | 'closed' | 'cancelled';

export interface LabExamQuestion {
  id: string;
  type: QuestionType; // 'mcq' | 'multiple_select' | 'true_false' | 'fill_blank' | 'short_answer' | 'long_answer' | 'practical_code'
  question: string;
  options?: string[]; // for MCQ, Multiple-Select, or True/False
  correctAnswer: string | number | number[]; // index (number), multi indices (number[]), or text string
  marks: number;
  negativeMarks?: number;
  explanation?: string;
  imageUrl?: string; // Optional question image/diagram
  difficulty?: QuestionDifficulty;
  chapterTitle?: string;
  chapterId?: string;
  topic?: string;
}

export interface LabExamConfig {
  id: string;
  examCode: string; // e.g. "LAB-X-IT-2026"
  title: string;
  instructions: string;
  classLevel: ClassLevel;
  subjectId: SubjectId;
  chapterId?: string;
  topic?: string;
  section?: string; // "ALL" or specific section like "A", "B"
  assignedGroup?: string; // e.g. "Lab Batch 1", "All Students"
  assignedStudentIds?: string[]; // if empty, applies to all students in that class/section
  examDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime?: string; // HH:mm
  durationMinutes: number;
  totalMarks: number;
  passingMarks: number;
  negativeMarking?: number;
  attemptLimit?: number;
  status: LabExamStatus;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  showResultsImmediately: boolean; // whether students see score immediately upon submit
  showAnswerKeysToStudents: boolean; // whether answer keys released to students
  questions: LabExamQuestion[];
  createdAt: string;
  academicSession?: string;
}

export interface LabExamEvaluationHistoryItem {
  evaluator: string;
  evaluatedAt: string;
  previousScore: number;
  newScore: number;
  changesNote?: string;
}

export interface LabExamStudentSession {
  id: string;
  examId: string;
  studentId: string;
  studentName: string;
  rollNumber?: string;
  classLevel: ClassLevel;
  section?: string;
  workstationIp?: string; // e.g. "LAB-PC-04"
  status: 'not_started' | 'in_progress' | 'submitted' | 'interrupted' | 'disconnected';
  startedAt?: string;
  lastActiveAt?: string;
  submittedAt?: string;
  durationRemainingSeconds?: number;
  answers: Record<string, any>;
  markedForReview?: string[];
  manualEvaluations?: Record<string, { marks: number; feedback?: string }>;
  teacherFeedback?: string;
  evaluatedBy?: string;
  evaluatedAt?: string;
  evaluationHistory?: LabExamEvaluationHistoryItem[];
  resultsReleased?: boolean;
  autoScore: number;
  manualScore?: number;
  finalScore: number;
  totalMarks: number;
  percentage: number;
  passed: boolean;
  isEvaluated: boolean;
  attemptNumber?: number;
}

export interface LabExamAuditLog {
  id: string;
  examId: string;
  examTitle?: string;
  studentId?: string;
  studentName?: string;
  action: 'exam_created' | 'exam_started' | 'answer_saved' | 'exam_submitted' | 'time_expired_auto_submit' | 'exam_interrupted' | 'exam_reopened' | 'evaluated' | 'status_changed';
  details: string;
  workstationIp?: string;
  timestamp: string;
}

