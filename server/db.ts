import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import type {
  User,
  UserRole,
  Branch,
  AcademicClass,
  Subject,
  AcademicSession,
  Resource,
  ResourceRating,
  ResourceComment,
  Announcement,
  AppNotification,
  ActivityLog,
  SystemSettings,
} from '../src/types.js';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'dips_db.json');

export interface DatabaseSchema {
  branches: Branch[];
  classes: AcademicClass[];
  subjects: Subject[];
  academicSessions: AcademicSession[];
  users: (User & { passwordHash: string })[];
  resources: Resource[];
  announcements: Announcement[];
  notifications: AppNotification[];
  activityLogs: ActivityLog[];
  settings: SystemSettings;
}

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

const defaultBranches: Branch[] = [
  {
    id: 'branch-dipsimt',
    name: 'DIPS Institute of Management & Technology (DIPSIMT) (Jalandhar)',
    code: 'DIPSIMT',
    city: 'Jalandhar',
    address: 'DIPSIMT Campus, Jalandhar, Punjab',
    phone: '+91 181 2780001',
    principalName: 'Director DIPSIMT',
    establishedYear: 2005,
    totalStudents: 0,
    totalTeachers: 0,
  },
  {
    id: 'branch-poly-tanda',
    name: 'DIPS Polytechic College (Tanda)',
    code: 'DPC-TAN',
    city: 'Tanda, Hoshiarpur',
    address: 'DIPS Polytechnic College Campus, Urmar Tanda, Punjab',
    phone: '+91 1886 223402',
    principalName: 'Principal DPC',
    establishedYear: 2007,
    totalStudents: 0,
    totalTeachers: 0,
  },
  {
    id: 'branch-gilzian',
    name: 'DIPS School, Gilzian (Hoshiarpur)',
    code: 'GIL',
    city: 'Gilzian, Hoshiarpur',
    address: 'Tanda-Gilzian Highway, Gilzian, Hoshiarpur, Punjab',
    phone: '+91 1886 271220',
    principalName: 'Mr. Harvinder Singh',
    establishedYear: 2008,
    totalStudents: 0,
    totalTeachers: 0,
  },
  {
    id: 'branch-urban-estate',
    name: 'DIPS School, Urban Estate Phase-1',
    code: 'UE-1',
    city: 'Jalandhar',
    address: 'Phase-1, Urban Estate, Jalandhar, Punjab',
    phone: '+91 181 2284900',
    principalName: 'Dr. Gurveen Kaur',
    establishedYear: 2001,
    totalStudents: 0,
    totalTeachers: 0,
  },
  {
    id: 'branch-suranussi',
    name: 'DIPS School, Suranussi',
    code: 'SUR',
    city: 'Suranussi, Jalandhar',
    address: 'GT Road, Suranussi, Jalandhar, Punjab',
    phone: '+91 181 2671200',
    principalName: 'Mrs. Bela Kapoor',
    establishedYear: 2002,
    totalStudents: 0,
    totalTeachers: 0,
  },
  {
    id: 'branch-karol-bagh',
    name: 'DIPS School, Karol Bagh',
    code: 'KB',
    city: 'Karol Bagh, Jalandhar',
    address: 'Karol Bagh, Jalandhar, Punjab',
    phone: '+91 181 2401500',
    principalName: 'Mrs. Rajeshwari',
    establishedYear: 2003,
    totalStudents: 0,
    totalTeachers: 0,
  },
  {
    id: 'branch-blooming-dales',
    name: 'DIPS Blooming Dales Public School',
    code: 'BDPS',
    city: 'Begowal, Kapurthala',
    address: 'Blooming Dales Campus, Begowal, Punjab',
    phone: '+91 1822 245200',
    principalName: 'Mrs. Gurmeet Kaur',
    establishedYear: 2000,
    totalStudents: 0,
    totalTeachers: 0,
  },
  {
    id: 'branch-bhogpur',
    name: 'DIPS School, Bhogpur',
    code: 'BHG',
    city: 'Bhogpur, Jalandhar',
    address: 'Main GT Road, Bhogpur, Punjab',
    phone: '+91 181 272300',
    principalName: 'Mrs. Raminder Kaur',
    establishedYear: 2005,
    totalStudents: 0,
    totalTeachers: 0,
  },
  {
    id: 'branch-mehatpur',
    name: 'DIPS School, Mehatpur',
    code: 'MHT-JAL',
    city: 'Mehatpur, Jalandhar',
    address: 'Nakodar-Mehatpur Road, Mehatpur, Punjab',
    phone: '+91 1821 240300',
    principalName: 'Mrs. Ritu Pathak',
    establishedYear: 2012,
    totalStudents: 0,
    totalTeachers: 0,
  },
  {
    id: 'branch-nurmahal',
    name: 'DIPS School, Nurmahal',
    code: 'NUR',
    city: 'Nurmahal, Jalandhar',
    address: 'Kot Badal Khan Road, Nurmahal, Punjab',
    phone: '+91 1826 244510',
    principalName: 'Mrs. Ritu Pathak',
    establishedYear: 2011,
    totalStudents: 0,
    totalTeachers: 0,
  },
  {
    id: 'branch-uggi',
    name: 'DIPS School, Uggi',
    code: 'UGG',
    city: 'Uggi, Jalandhar',
    address: 'Nakodar-Kapurthala Road, Uggi, Punjab',
    phone: '+91 1821 255100',
    principalName: 'Mrs. Ravinder Kaur',
    establishedYear: 2013,
    totalStudents: 0,
    totalTeachers: 0,
  },
  {
    id: 'branch-batala',
    name: 'DIPS School, Batala (Gurdaspur)',
    code: 'BAT',
    city: 'Batala, Gurdaspur',
    address: 'Aliwal Road, Batala, Gurdaspur, Punjab',
    phone: '+91 1871 245600',
    principalName: 'Mrs. Maninder Kaur',
    establishedYear: 2010,
    totalStudents: 0,
    totalTeachers: 0,
  },
  {
    id: 'branch-begowal',
    name: 'DIPS School, Begowal (Kapurthala)',
    code: 'BEG',
    city: 'Begowal, Kapurthala',
    address: 'Near Main GT Road, Begowal, Punjab',
    phone: '+91 1822 245100',
    principalName: 'Mrs. Jaswinder Kaur',
    establishedYear: 2004,
    totalStudents: 0,
    totalTeachers: 0,
  },
  {
    id: 'branch-dhilwan',
    name: 'DIPS School, Dhilwan (Kapurthala)',
    code: 'DHL',
    city: 'Dhilwan, Kapurthala',
    address: 'GT Road, Dhilwan, Kapurthala, Punjab',
    phone: '+91 1822 274100',
    principalName: 'Mrs. Shanti Sharma',
    establishedYear: 2010,
    totalStudents: 0,
    totalTeachers: 0,
  },
  {
    id: 'branch-hariana',
    name: 'DIPS School, Hariana (Hoshiarpur)',
    code: 'HAR',
    city: 'Hariana, Hoshiarpur',
    address: 'Hariana-Hoshiarpur Road, Hariana, Punjab',
    phone: '+91 1886 250300',
    principalName: 'Mrs. Monica Sachdeva',
    establishedYear: 2011,
    totalStudents: 0,
    totalTeachers: 0,
  },
  {
    id: 'branch-kapurthala',
    name: 'DIPS School, Kapurthala',
    code: 'KAP',
    city: 'Kapurthala',
    address: 'Sultanpur Road, Kapurthala, Punjab',
    phone: '+91 1822 233400',
    principalName: 'Mrs. Radha Rani',
    establishedYear: 2008,
    totalStudents: 0,
    totalTeachers: 0,
  },
  {
    id: 'branch-mehta-chowk',
    name: 'DIPS School, Mehta Chowk (Amritsar)',
    code: 'MHT-ASR',
    city: 'Mehta Chowk, Amritsar',
    address: 'Mehta Chowk Highway, Amritsar, Punjab',
    phone: '+91 183 277200',
    principalName: 'Mrs. Pankaj Sharma',
    establishedYear: 2006,
    totalStudents: 0,
    totalTeachers: 0,
  },
  {
    id: 'branch-rayya',
    name: 'DIPS School, Rayya (Amritsar)',
    code: 'RAY',
    city: 'Rayya, Amritsar',
    address: 'GT Road, Rayya, Amritsar, Punjab',
    phone: '+91 183 248900',
    principalName: 'Mrs. Jagwinder Kaur',
    establishedYear: 2008,
    totalStudents: 0,
    totalTeachers: 0,
  },
  {
    id: 'branch-tanda',
    name: 'DIPS School, Tanda (Hoshiarpur)',
    code: 'TAN',
    city: 'Tanda, Hoshiarpur',
    address: 'Near Bus Stand, Urmar Tanda, Punjab',
    phone: '+91 1886 223400',
    principalName: 'Mrs. Seema Sharma',
    establishedYear: 2014,
    totalStudents: 0,
    totalTeachers: 0,
  },
];

const defaultClasses: AcademicClass[] = [
  { id: 'class-6', name: 'Class VI', code: 'VI', order: 6, sections: ['A', 'B', 'C'] },
  { id: 'class-7', name: 'Class VII', code: 'VII', order: 7, sections: ['A', 'B', 'C'] },
  { id: 'class-8', name: 'Class VIII', code: 'VIII', order: 8, sections: ['A', 'B', 'C'] },
  { id: 'class-9', name: 'Class IX', code: 'IX', order: 9, sections: ['A', 'B', 'C', 'D'] },
  { id: 'class-10', name: 'Class X', code: 'X', order: 10, sections: ['A', 'B', 'C', 'D'] },
  { id: 'class-11', name: 'Class XI', code: 'XI', order: 11, sections: ['Medical', 'Non-Medical', 'Commerce', 'Humanities'] },
  { id: 'class-12', name: 'Class XII', code: 'XII', order: 12, sections: ['Medical', 'Non-Medical', 'Commerce', 'Humanities'] },
];

const defaultSubjects: Subject[] = [
  {
    id: 'sub-cs',
    name: 'Computer Science & IT',
    code: 'CS',
    department: 'Information Technology',
    applicableClasses: ['class-6', 'class-7', 'class-8', 'class-9', 'class-10', 'class-11', 'class-12'],
    description: 'Python, Programming Fundamentals, Data Structures, Web Technology, and CBSE IT curriculum.',
  },
  {
    id: 'sub-math',
    name: 'Mathematics',
    code: 'MATH',
    department: 'Mathematics',
    applicableClasses: ['class-6', 'class-7', 'class-8', 'class-9', 'class-10', 'class-11', 'class-12'],
    description: 'Algebra, Geometry, Calculus, Arithmetic, and Trigonometry.',
  },
  {
    id: 'sub-sci',
    name: 'Science',
    code: 'SCI',
    department: 'Sciences',
    applicableClasses: ['class-6', 'class-7', 'class-8', 'class-9', 'class-10'],
    description: 'General Science covering Physics, Chemistry, and Life Sciences.',
  },
  {
    id: 'sub-eng',
    name: 'English',
    code: 'ENG',
    department: 'Languages',
    applicableClasses: ['class-6', 'class-7', 'class-8', 'class-9', 'class-10', 'class-11', 'class-12'],
    description: 'English Literature, Grammar, Reading Comprehension, and Creative Writing.',
  },
  {
    id: 'sub-sst',
    name: 'Social Science',
    code: 'SST',
    department: 'Social Studies',
    applicableClasses: ['class-6', 'class-7', 'class-8', 'class-9', 'class-10'],
    description: 'History, Civics, Geography, Economics, and Disaster Management.',
  },
  {
    id: 'sub-phy',
    name: 'Physics',
    code: 'PHY',
    department: 'Sciences',
    applicableClasses: ['class-11', 'class-12'],
    description: 'Mechanics, Optics, Thermodynamics, Electromagnetism, Modern Physics.',
  },
  {
    id: 'sub-chem',
    name: 'Chemistry',
    code: 'CHEM',
    department: 'Sciences',
    applicableClasses: ['class-11', 'class-12'],
    description: 'Physical, Organic, and Inorganic Chemistry CBSE Curriculum.',
  },
];

const defaultSessions: AcademicSession[] = [
  { id: 'sess-2026-27', name: '2026-27', startDate: '2026-04-01', endDate: '2027-03-31', isCurrent: true },
  { id: 'sess-2025-26', name: '2025-26', startDate: '2025-04-01', endDate: '2026-03-31', isCurrent: false },
];

const defaultUsers: (User & { passwordHash: string })[] = [
  // Super Admin: DIPS Begowal Central Directorate
  {
    id: 'user-admin',
    username: 'dipsbegowal@gmail.com',
    email: 'dipsbegowal@gmail.com',
    fullName: 'DIPS Begowal Administration',
    role: 'admin',
    branchId: 'branch-begowal',
    branchName: 'DIPS Begowal',
    isActive: true,
    createdAt: '2026-09-19T00:00:00.000Z',
    phone: '+91 1822 245100',
    passwordHash: hashPassword('dips@1630502'),
  },
];

const defaultResources: Resource[] = [
  {
    id: 'res-cs-01',
    title: 'Python Basics & Variables - Chapter Notes with Interactive Exercises',
    description: 'Comprehensive guide covering variable assignment, data types (integers, strings, floats, booleans), basic syntax, and input/output functions with practice questions for Class VII.',
    subjectId: 'sub-cs',
    subjectName: 'Computer Science & IT',
    classId: 'class-7',
    className: 'Class VII',
    branchId: 'branch-begowal',
    branchName: 'DIPS Begowal',
    chapter: 'Chapter 2: Getting Started with Python',
    topic: 'Variables, Data Types, and Input Operations',
    category: 'Study Material',
    contentType: 'PDF',
    academicSession: '2026-27',
    status: 'published',
    currentVersion: 2,
    versions: [
      {
        versionNumber: 1,
        versionTitle: 'Initial Chapter Outline',
        changelog: 'First draft created for DIPS Begowal session.',
        fileUrl: '/uploads/sample_python_basics.pdf',
        fileName: 'python_basics_class7.pdf',
        fileSize: 245000,
        fileType: 'application/pdf',
        uploadedByUserId: 'user-admin',
        uploadedByUserName: 'DIPS Begowal Administration',
        uploadedByUserBranch: 'DIPS Begowal',
        uploadedAt: '2026-09-20T10:00:00.000Z',
      },
      {
        versionNumber: 2,
        versionTitle: 'Enhanced Code Examples & CBSE Exercises',
        changelog: 'Added 10 code walkthrough exercises and practice quiz.',
        fileUrl: '/uploads/sample_python_basics_v2.pdf',
        fileName: 'python_basics_class7_v2.pdf',
        fileSize: 310000,
        fileType: 'application/pdf',
        uploadedByUserId: 'user-admin',
        uploadedByUserName: 'DIPS Begowal Administration',
        uploadedByUserBranch: 'DIPS Begowal',
        uploadedAt: '2026-09-21T14:30:00.000Z',
      },
    ],
    fileName: 'python_basics_class7_v2.pdf',
    fileUrl: '/uploads/sample_python_basics_v2.pdf',
    fileSize: 310000,
    uploadedByUserId: 'user-admin',
    uploadedByName: 'DIPS Begowal Administration',
    uploadedByBranch: 'DIPS Begowal',
    lastUpdatedByUserId: 'user-admin',
    lastUpdatedByName: 'DIPS Begowal Administration',
    lastUpdatedByBranch: 'DIPS Begowal',
    createdAt: '2026-09-20T10:00:00.000Z',
    updatedAt: '2026-09-21T14:30:00.000Z',
    downloadsCount: 42,
    viewsCount: 156,
  },
  {
    id: 'res-cs-02',
    title: 'Conditional Statements & Loops Practice Worksheet',
    description: 'Worksheet containing 15 real-world logic problems, flowchart conversions, and if-elif-else syntax checks for students.',
    subjectId: 'sub-cs',
    subjectName: 'Computer Science & IT',
    classId: 'class-7',
    className: 'Class VII',
    branchId: 'branch-jalandhar',
    branchName: 'DIPS Urban Estate Jalandhar',
    chapter: 'Chapter 3: Control Structures',
    topic: 'If-Else Conditionals and While Loops',
    category: 'Assessment',
    contentType: 'Worksheet',
    academicSession: '2026-27',
    status: 'published',
    currentVersion: 1,
    versions: [
      {
        versionNumber: 1,
        versionTitle: 'Initial Release',
        changelog: 'Formative assessment worksheet for Term 1.',
        fileUrl: '/uploads/conditionals_worksheet.pdf',
        fileName: 'conditionals_worksheet_class7.pdf',
        fileSize: 180000,
        fileType: 'application/pdf',
        uploadedByUserId: 'user-admin',
        uploadedByUserName: 'DIPS Begowal Administration',
        uploadedByUserBranch: 'DIPS Urban Estate Jalandhar',
        uploadedAt: '2026-09-22T08:15:00.000Z',
      },
    ],
    fileName: 'conditionals_worksheet_class7.pdf',
    fileUrl: '/uploads/conditionals_worksheet.pdf',
    fileSize: 180000,
    uploadedByUserId: 'user-admin',
    uploadedByName: 'DIPS Begowal Administration',
    uploadedByBranch: 'DIPS Urban Estate Jalandhar',
    lastUpdatedByUserId: 'user-admin',
    lastUpdatedByName: 'DIPS Begowal Administration',
    lastUpdatedByBranch: 'DIPS Urban Estate Jalandhar',
    createdAt: '2026-09-22T08:15:00.000Z',
    updatedAt: '2026-09-22T08:15:00.000Z',
    downloadsCount: 28,
    viewsCount: 89,
  },
  {
    id: 'res-math-01',
    title: 'Integers & Fractions Step-by-Step Mastery Guide',
    description: 'NCERT textbook companion covering addition, subtraction, multiplication, and division of negative numbers with number lines.',
    subjectId: 'sub-math',
    subjectName: 'Mathematics',
    classId: 'class-7',
    className: 'Class VII',
    branchId: 'branch-begowal',
    branchName: 'DIPS Begowal',
    chapter: 'Chapter 1: Integers',
    topic: 'Properties of Addition and Multiplication of Integers',
    category: 'Study Material',
    contentType: 'Notes',
    academicSession: '2026-27',
    status: 'published',
    currentVersion: 1,
    versions: [
      {
        versionNumber: 1,
        versionTitle: 'Complete Chapter Notes',
        fileUrl: '/uploads/math_integers_class7.pdf',
        fileName: 'math_integers_class7.pdf',
        fileSize: 420000,
        fileType: 'application/pdf',
        uploadedByUserId: 'user-admin',
        uploadedByUserName: 'DIPS Begowal Administration',
        uploadedByUserBranch: 'DIPS Begowal',
        uploadedAt: '2026-09-18T11:00:00.000Z',
      },
    ],
    fileName: 'math_integers_class7.pdf',
    fileUrl: '/uploads/math_integers_class7.pdf',
    fileSize: 420000,
    uploadedByUserId: 'user-admin',
    uploadedByName: 'DIPS Begowal Administration',
    uploadedByBranch: 'DIPS Begowal',
    lastUpdatedByUserId: 'user-admin',
    lastUpdatedByName: 'DIPS Begowal Administration',
    lastUpdatedByBranch: 'DIPS Begowal',
    createdAt: '2026-09-18T11:00:00.000Z',
    updatedAt: '2026-09-18T11:00:00.000Z',
    downloadsCount: 65,
    viewsCount: 210,
  },
  {
    id: 'res-sci-01',
    title: 'Nutrition in Plants - Laboratory Experiment & Microscopic Diagram Manual',
    description: 'Photosynthesis test procedure with iodine reagent, stomata observation under compound microscope, and autotrophic vs heterotrophic comparison diagrams.',
    subjectId: 'sub-sci',
    subjectName: 'Science',
    classId: 'class-7',
    className: 'Class VII',
    branchId: 'branch-gilzian',
    branchName: 'DIPS Gilzian',
    chapter: 'Chapter 1: Nutrition in Plants',
    topic: 'Modes of Nutrition & Stomata Investigation',
    category: 'Practical',
    contentType: 'Practical File',
    academicSession: '2026-27',
    status: 'published',
    currentVersion: 1,
    versions: [
      {
        versionNumber: 1,
        versionTitle: 'Lab Manual Handout',
        fileUrl: '/uploads/science_nutrition_plants_lab.pdf',
        fileName: 'science_nutrition_plants_lab.pdf',
        fileSize: 512000,
        fileType: 'application/pdf',
        uploadedByUserId: 'user-admin',
        uploadedByUserName: 'DIPS Begowal Administration',
        uploadedByUserBranch: 'DIPS Gilzian',
        uploadedAt: '2026-09-19T09:30:00.000Z',
      },
    ],
    fileName: 'science_nutrition_plants_lab.pdf',
    fileUrl: '/uploads/science_nutrition_plants_lab.pdf',
    fileSize: 512000,
    uploadedByUserId: 'user-admin',
    uploadedByName: 'DIPS Begowal Administration',
    uploadedByBranch: 'DIPS Gilzian',
    lastUpdatedByUserId: 'user-admin',
    lastUpdatedByName: 'DIPS Begowal Administration',
    lastUpdatedByBranch: 'DIPS Gilzian',
    createdAt: '2026-09-19T09:30:00.000Z',
    updatedAt: '2026-09-19T09:30:00.000Z',
    downloadsCount: 51,
    viewsCount: 178,
  },
  {
    id: 'res-eng-01',
    title: 'Three Questions by Leo Tolstoy - Analysis & Grammar Worksheet',
    description: 'Detailed literary synopsis, character study, vocabulary glossary, and passive voice transformation exercises for Class VII English.',
    subjectId: 'sub-eng',
    subjectName: 'English',
    classId: 'class-7',
    className: 'Class VII',
    branchId: 'branch-tanda',
    branchName: 'DIPS Tanda',
    chapter: 'Honeycomb - Chapter 1',
    topic: 'Three Questions & Verb Tenses',
    category: 'Study Material',
    contentType: 'PDF',
    academicSession: '2026-27',
    status: 'published',
    currentVersion: 1,
    versions: [
      {
        versionNumber: 1,
        versionTitle: 'First Edition',
        fileUrl: '/uploads/english_three_questions.pdf',
        fileName: 'english_three_questions.pdf',
        fileSize: 195000,
        fileType: 'application/pdf',
        uploadedByUserId: 'user-admin',
        uploadedByUserName: 'DIPS Begowal Administration',
        uploadedByUserBranch: 'DIPS Tanda',
        uploadedAt: '2026-09-17T15:20:00.000Z',
      },
    ],
    fileName: 'english_three_questions.pdf',
    fileUrl: '/uploads/english_three_questions.pdf',
    fileSize: 195000,
    uploadedByUserId: 'user-admin',
    uploadedByName: 'DIPS Begowal Administration',
    uploadedByBranch: 'DIPS Tanda',
    lastUpdatedByUserId: 'user-admin',
    lastUpdatedByName: 'DIPS Begowal Administration',
    lastUpdatedByBranch: 'DIPS Tanda',
    createdAt: '2026-09-17T15:20:00.000Z',
    updatedAt: '2026-09-17T15:20:00.000Z',
    downloadsCount: 39,
    viewsCount: 134,
  },
  {
    id: 'res-cs-03',
    title: 'Class 8 HTML5 & CSS3 Web Designing Starter Project',
    description: 'Hands-on project files, semantic tags reference, and stylesheets for building school club websites.',
    subjectId: 'sub-cs',
    subjectName: 'Computer Science & IT',
    classId: 'class-8',
    className: 'Class VIII',
    branchId: 'branch-begowal',
    branchName: 'DIPS Begowal',
    chapter: 'Chapter 4: Web Authoring with HTML5',
    topic: 'Semantic Structure & Inline Styling',
    category: 'Practical',
    contentType: 'Project',
    academicSession: '2026-27',
    status: 'published',
    currentVersion: 1,
    versions: [
      {
        versionNumber: 1,
        versionTitle: 'Web Project Kit',
        fileUrl: '/uploads/html5_project_class8.pdf',
        fileName: 'html5_project_class8.pdf',
        fileSize: 340000,
        fileType: 'application/pdf',
        uploadedByUserId: 'user-admin',
        uploadedByUserName: 'DIPS Begowal Administration',
        uploadedByUserBranch: 'DIPS Begowal',
        uploadedAt: '2026-09-21T11:00:00.000Z',
      },
    ],
    fileName: 'html5_project_class8.pdf',
    fileUrl: '/uploads/html5_project_class8.pdf',
    fileSize: 340000,
    uploadedByUserId: 'user-admin',
    uploadedByName: 'DIPS Begowal Administration',
    uploadedByBranch: 'DIPS Begowal',
    lastUpdatedByUserId: 'user-admin',
    lastUpdatedByName: 'DIPS Begowal Administration',
    lastUpdatedByBranch: 'DIPS Begowal',
    createdAt: '2026-09-21T11:00:00.000Z',
    updatedAt: '2026-09-21T11:00:00.000Z',
    downloadsCount: 31,
    viewsCount: 112,
  },
];

const defaultAnnouncements: Announcement[] = [
  {
    id: 'anc-01',
    title: 'DIPS Mid-Term Academic Assessments (2026-27) Schedule & Question Blueprint Released',
    content: 'All faculty members and students across all 21 DIPS institutions and campuses are requested to download the finalized Mid-Term examination schedule and chapter-wise weightage blueprint. Teachers must ensure all revision materials and practice worksheets are uploaded by Friday.',
    priority: 'urgent',
    targetRole: 'all',
    authorName: 'Academic Directorate',
    authorRole: 'Central Administration',
    createdAt: '2026-09-23T08:00:00.000Z',
  },
  {
    id: 'anc-02',
    title: 'Staff Notice: Cross-Branch Lesson Planning & Resource Collaboration Window Open',
    content: 'Faculty teaching Classes VI to XII can now collaborate on study materials, question banks, and multimedia presentations across branches. Check the "Collaborate" badge on existing resources to submit updated revisions.',
    priority: 'high',
    targetRole: 'teacher',
    authorName: 'Curriculum Planning Committee',
    authorRole: 'Central Coordinator',
    createdAt: '2026-09-22T10:30:00.000Z',
  },
  {
    id: 'anc-03',
    title: 'Inter-Branch DIPS Annual Science & Robotics Fair 2026 - Registration Open',
    content: 'Student project submissions for the Inter-Branch STEM innovation challenge are now being accepted. Science & Computer teachers are requested to guide students using the downloadable project kits in the repository.',
    priority: 'normal',
    targetRole: 'all',
    authorName: 'DIPS Science Society',
    authorRole: 'Academic Department',
    createdAt: '2026-09-21T09:15:00.000Z',
  },
  {
    id: 'anc-04',
    title: 'Central Digital Repository Upgrade: NCERT Exemplars & Audio-Visual Modules Active',
    content: 'The DIPS portal cloud storage has been expanded across all 21 campuses. High-resolution PDFs, laboratory manual guides, and solved sample papers are now accessible directly from any campus or mobile device.',
    priority: 'low',
    targetRole: 'all',
    authorName: 'IT Directorate',
    authorRole: 'System Admin',
    createdAt: '2026-09-20T14:00:00.000Z',
  },
];

const defaultActivityLogs: ActivityLog[] = [];

const defaultSettings: SystemSettings = {
  directPublishing: true, // Teachers can directly publish or toggle to require review
  maxUploadSizeMB: 50,
  allowedExtensions: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'zip', 'mp4', 'mp3'],
  activeSession: '2026-27',
  organizationName: 'DIPS Institutions',
  portalSubtitle: 'Centralized Learning & Resource Portal',
};

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDataDir();
    this.data = this.loadData();
  }

  private ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
  }

  private loadData(): DatabaseSchema {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);

        // Ensure parsed.branches precisely matches defaultBranches (19 official branches)
        const defaultMap = new Map(defaultBranches.map(b => [b.id, b]));
        const keptBranches: Branch[] = [];
        if (parsed.branches) {
          for (const b of parsed.branches) {
            if (defaultMap.has(b.id)) {
              keptBranches.push({ ...b, ...defaultMap.get(b.id) });
              defaultMap.delete(b.id);
            }
          }
        }
        for (const [_, defB] of defaultMap) {
          keptBranches.push(defB);
        }
        parsed.branches = keptBranches;

        if (!parsed.resources || parsed.resources.length === 0) {
          parsed.resources = defaultResources;
        }
        if (!parsed.announcements || parsed.announcements.length === 0) {
          parsed.announcements = defaultAnnouncements;
        }
        this.saveData(parsed);
        return parsed;
      } catch (err) {
        console.error('Failed to read database file, initializing with defaults:', err);
      }
    }
    const initial: DatabaseSchema = {
      branches: defaultBranches,
      classes: defaultClasses,
      subjects: defaultSubjects,
      academicSessions: defaultSessions,
      users: defaultUsers,
      resources: defaultResources,
      announcements: defaultAnnouncements,
      notifications: [],
      activityLogs: defaultActivityLogs,
      settings: defaultSettings,
    };
    this.saveData(initial);
    return initial;
  }

  private saveData(dataToSave?: DatabaseSchema) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave || this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to persist database:', err);
    }
  }

  public getRawData(): DatabaseSchema {
    return this.data;
  }

  public persist() {
    this.saveData();
  }

  // --- Auth & Users ---
  public findUserById(id: string): (User & { passwordHash: string }) | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  public findUserByLogin(identifier: string): (User & { passwordHash: string }) | undefined {
    const clean = identifier.trim().toLowerCase();
    return this.data.users.find((u) => {
      if (u.username.toLowerCase() === clean) return true;
      if (u.email.toLowerCase() === clean) return true;
      if (u.employeeId && u.employeeId.toLowerCase() === clean) return true;
      if (u.admissionNo && u.admissionNo.toLowerCase() === clean) return true;
      return false;
    });
  }

  public addUser(user: User & { passwordHash: string }) {
    // Avoid duplicates by ID or username
    const existingIdx = this.data.users.findIndex((u) => u.id === user.id || u.username === user.username);
    if (existingIdx !== -1) {
      this.data.users[existingIdx] = user;
    } else {
      this.data.users.push(user);
    }
    this.persist();
  }

  public mergeRemoteUsers(remoteUsers: any[]) {
    let changed = false;
    for (const r of remoteUsers) {
      const idx = this.data.users.findIndex((u) => u.id === r.id || u.username === r.username || (r.email && u.email.toLowerCase() === r.email.toLowerCase()));
      const mappedUser: User & { passwordHash: string } = {
        id: r.id,
        username: r.username,
        email: r.email,
        fullName: r.full_name || r.fullName,
        role: r.role,
        branchId: r.branch_id || r.branchId,
        branchName: r.branch_name || r.branchName,
        phone: r.phone,
        employeeId: r.employee_id || r.employeeId,
        admissionNo: r.admission_no || r.admissionNo,
        designation: r.designation,
        classId: r.class_id || r.classId,
        className: r.class_name || r.className,
        section: r.section,
        assignedSubjectIds: r.assigned_subject_ids || r.assignedSubjectIds || [],
        assignedClassIds: r.assigned_class_ids || r.assignedClassIds || [],
        isActive: r.is_active !== undefined ? r.is_active : true,
        createdAt: r.created_at || new Date().toISOString(),
        passwordHash: r.password_hash || r.passwordHash || '',
      };
      if (idx !== -1) {
        this.data.users[idx] = { ...this.data.users[idx], ...mappedUser };
      } else {
        this.data.users.push(mappedUser);
      }
      changed = true;
    }
    if (changed) {
      this.persist();
    }
  }

  public updateUser(id: string, updates: Partial<User & { passwordHash?: string }>) {
    const idx = this.data.users.findIndex((u) => u.id === id);
    if (idx !== -1) {
      this.data.users[idx] = { ...this.data.users[idx], ...updates };
      this.persist();
      return this.data.users[idx];
    }
    return null;
  }

  public deleteUser(id: string) {
    this.data.users = this.data.users.filter((u) => u.id !== id);
    this.persist();
  }

  // --- Branches ---
  public getBranches(): Branch[] {
    return this.data.branches;
  }

  public addBranch(branch: Branch) {
    this.data.branches.push(branch);
    this.persist();
  }

  public updateBranch(id: string, updates: Partial<Branch>) {
    const idx = this.data.branches.findIndex((b) => b.id === id);
    if (idx !== -1) {
      this.data.branches[idx] = { ...this.data.branches[idx], ...updates };
      this.persist();
      return this.data.branches[idx];
    }
    return null;
  }

  public deleteBranch(id: string) {
    this.data.branches = this.data.branches.filter((b) => b.id !== id);
    this.persist();
  }

  // --- Classes & Subjects ---
  public getClasses(): AcademicClass[] {
    return this.data.classes;
  }

  public addClass(cls: AcademicClass) {
    this.data.classes.push(cls);
    this.persist();
  }

  public updateClass(id: string, updates: Partial<AcademicClass>) {
    const idx = this.data.classes.findIndex((c) => c.id === id);
    if (idx !== -1) {
      this.data.classes[idx] = { ...this.data.classes[idx], ...updates };
      this.persist();
      return this.data.classes[idx];
    }
    return null;
  }

  public deleteClass(id: string) {
    this.data.classes = this.data.classes.filter((c) => c.id !== id);
    this.persist();
  }

  public getSubjects(): Subject[] {
    return this.data.subjects;
  }

  public addSubject(sub: Subject) {
    this.data.subjects.push(sub);
    this.persist();
  }

  public updateSubject(id: string, updates: Partial<Subject>) {
    const idx = this.data.subjects.findIndex((s) => s.id === id);
    if (idx !== -1) {
      this.data.subjects[idx] = { ...this.data.subjects[idx], ...updates };
      this.persist();
      return this.data.subjects[idx];
    }
    return null;
  }

  public deleteSubject(id: string) {
    this.data.subjects = this.data.subjects.filter((s) => s.id !== id);
    this.persist();
  }

  // --- Academic Sessions ---
  public getSessions(): AcademicSession[] {
    return this.data.academicSessions;
  }

  // --- Resources ---
  public getResources(): Resource[] {
    return this.data.resources;
  }

  public findResourceById(id: string): Resource | undefined {
    return this.data.resources.find((r) => r.id === id);
  }

  public addResource(resource: Resource) {
    const existingIdx = this.data.resources.findIndex((r) => r.id === resource.id);
    if (existingIdx !== -1) {
      this.data.resources[existingIdx] = resource;
    } else {
      this.data.resources.unshift(resource);
    }
    this.persist();
  }

  public mergeRemoteResources(remoteResources: any[]) {
    let changed = false;
    for (const r of remoteResources) {
      const idx = this.data.resources.findIndex((res) => res.id === r.id);
      const mapped: Resource = {
        id: r.id,
        title: r.title,
        description: r.description || '',
        subjectId: r.subject_id || r.subjectId,
        subjectName: r.subject_name || r.subjectName || 'General',
        classId: r.class_id || r.classId,
        className: r.class_name || r.className || 'All Classes',
        branchId: r.branch_id || r.branchId,
        branchName: r.branch_name || r.branchName || 'DIPS Branch',
        chapter: r.chapter || 'Chapter',
        topic: r.topic || 'General Topic',
        category: (r.category || 'syllabus') as any,
        contentType: (r.resource_type || r.contentType || 'document') as any,
        academicSession: r.academic_session || '2025-2026',
        fileUrl: r.file_url || r.fileUrl || '',
        fileName: r.file_name || r.fileName || 'document.pdf',
        fileSize: r.file_size_bytes || r.fileSize || 0,
        currentVersion: r.current_version || 1,
        versions: r.versions || [
          {
            versionNumber: 1,
            versionTitle: 'Initial Release',
            fileUrl: r.file_url || r.fileUrl || '',
            fileName: r.file_name || r.fileName || 'document.pdf',
            fileSize: r.file_size_bytes || r.fileSize || 0,
            fileType: 'application/pdf',
            uploadedByUserId: r.uploaded_by_id || 'system',
            uploadedByUserName: r.uploaded_by_name || 'Faculty',
            uploadedByUserBranch: r.branch_name || 'DIPS Branch',
            uploadedAt: r.created_at || new Date().toISOString(),
          }
        ],
        uploadedByUserId: r.uploaded_by_id || r.uploadedByUserId || 'system',
        uploadedByName: r.uploaded_by_name || r.uploadedByName || 'Faculty',
        uploadedByBranch: r.branch_name || r.branchName || 'DIPS Branch',
        lastUpdatedByUserId: r.uploaded_by_id || r.uploadedByUserId || 'system',
        lastUpdatedByName: r.uploaded_by_name || r.uploadedByName || 'Faculty',
        lastUpdatedByBranch: r.branch_name || r.branchName || 'DIPS Branch',
        status: (r.status || 'published') as any,
        downloadsCount: r.download_count || r.downloadsCount || 0,
        viewsCount: r.views_count || r.viewsCount || 0,
        createdAt: r.created_at || new Date().toISOString(),
        updatedAt: r.updated_at || r.created_at || new Date().toISOString(),
      };
      if (idx !== -1) {
        this.data.resources[idx] = { ...this.data.resources[idx], ...mapped };
      } else {
        this.data.resources.push(mapped);
      }
      changed = true;
    }
    if (changed) {
      this.persist();
    }
  }

  public updateResource(id: string, updates: Partial<Resource>) {
    const idx = this.data.resources.findIndex((r) => r.id === id);
    if (idx !== -1) {
      this.data.resources[idx] = { ...this.data.resources[idx], ...updates };
      this.persist();
      return this.data.resources[idx];
    }
    return null;
  }

  public deleteResource(id: string) {
    this.data.resources = this.data.resources.filter((r) => r.id !== id);
    this.persist();
  }

  public rateResource(
    resourceId: string,
    ratingData: {
      userId: string;
      userName: string;
      userRole: any;
      userBranch?: string;
      rating: number;
      feedback?: string;
    }
  ): { resource: Resource; rating: ResourceRating } | null {
    const resource = this.data.resources.find((r) => r.id === resourceId);
    if (!resource) return null;

    if (!resource.ratings) {
      resource.ratings = [];
    }

    const existingIndex = resource.ratings.findIndex((r) => r.userId === ratingData.userId);
    const now = new Date().toISOString();

    let ratingObj: ResourceRating;
    if (existingIndex !== -1) {
      // Update existing rating
      ratingObj = {
        ...resource.ratings[existingIndex],
        rating: ratingData.rating,
        feedback: ratingData.feedback !== undefined ? ratingData.feedback : resource.ratings[existingIndex].feedback,
        userName: ratingData.userName,
        userRole: ratingData.userRole,
        userBranch: ratingData.userBranch,
        updatedAt: now,
      };
      resource.ratings[existingIndex] = ratingObj;
    } else {
      // Create new rating
      ratingObj = {
        id: 'rating-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
        resourceId,
        userId: ratingData.userId,
        userName: ratingData.userName,
        userRole: ratingData.userRole,
        userBranch: ratingData.userBranch,
        rating: ratingData.rating,
        feedback: ratingData.feedback || '',
        createdAt: now,
      };
      resource.ratings.push(ratingObj);
    }

    // Recalculate average and total count
    const totalScore = resource.ratings.reduce((sum, r) => sum + r.rating, 0);
    resource.ratingsCount = resource.ratings.length;
    resource.averageRating = Number((totalScore / resource.ratings.length).toFixed(1));

    this.persist();
    return { resource, rating: ratingObj };
  }

  public addComment(
    resourceId: string,
    commentData: {
      userId: string;
      userName: string;
      userRole: UserRole;
      userBranch?: string;
      content: string;
    }
  ): { resource: Resource; comment: ResourceComment } | null {
    const resource = this.findResourceById(resourceId);
    if (!resource) return null;

    if (!resource.comments) {
      resource.comments = [];
    }

    const commentObj: ResourceComment = {
      id: 'com-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      resourceId,
      userId: commentData.userId,
      userName: commentData.userName,
      userRole: commentData.userRole,
      userBranch: commentData.userBranch,
      content: commentData.content,
      createdAt: new Date().toISOString(),
    };

    resource.comments.unshift(commentObj);
    this.persist();
    return { resource, comment: commentObj };
  }

  // --- Announcements ---
  public getAnnouncements(): Announcement[] {
    return this.data.announcements;
  }

  public addAnnouncement(announcement: Announcement) {
    this.data.announcements.unshift(announcement);
    this.persist();
  }

  public deleteAnnouncement(id: string) {
    this.data.announcements = this.data.announcements.filter((a) => a.id !== id);
    this.persist();
  }

  // --- Notifications ---
  public getNotifications(userId: string): AppNotification[] {
    return this.data.notifications.filter((n) => n.userId === userId);
  }

  public addNotification(notification: AppNotification) {
    this.data.notifications.unshift(notification);
    this.persist();
  }

  public markNotificationRead(id: string) {
    const n = this.data.notifications.find((item) => item.id === id);
    if (n) {
      n.isRead = true;
      this.persist();
    }
  }

  public markAllNotificationsRead(userId: string) {
    this.data.notifications.forEach((n) => {
      if (n.userId === userId) n.isRead = true;
    });
    this.persist();
  }

  // --- Activity Logs ---
  public getActivityLogs(): ActivityLog[] {
    return this.data.activityLogs;
  }

  public logActivity(log: Omit<ActivityLog, 'id' | 'timestamp'>) {
    const entry: ActivityLog = {
      ...log,
      id: 'act-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      timestamp: new Date().toISOString(),
    };
    this.data.activityLogs.unshift(entry);
    // Keep max 500 logs
    if (this.data.activityLogs.length > 500) {
      this.data.activityLogs = this.data.activityLogs.slice(0, 500);
    }
    this.persist();
    return entry;
  }

  // --- Settings ---
  public getSettings(): SystemSettings {
    return this.data.settings;
  }

  public updateSettings(updates: Partial<SystemSettings>) {
    this.data.settings = { ...this.data.settings, ...updates };
    this.persist();
    return this.data.settings;
  }
}

export const db = new Database();
