import { ClassLevel, SubjectInfo, Chapter, SubjectId } from '../types';

export const CLASSES_LIST: { level: ClassLevel; name: string; subtitle: string }[] = [
  { level: 'VI', name: 'Class VI', subtitle: 'IT Fundamentals & Digital Literacy' },
  { level: 'VII', name: 'Class VII', subtitle: 'Spreadsheets, Coding & Web Basics' },
  { level: 'VIII', name: 'Class VIII', subtitle: 'Database Concepts & Logic Building' },
  { level: 'IX', name: 'Class IX', subtitle: 'CBSE IT (Code 402) - Part A & Part B' },
  { level: 'X', name: 'Class X', subtitle: 'CBSE Board Focus: IT (Code 402)' },
  { level: 'XI', name: 'Class XI', subtitle: 'IT (802), IP (065) & Typography (817)' },
  { level: 'XII', name: 'Class XII', subtitle: 'Board Exam: IT (802), IP (065) & Typography (817)' },
];

export const SUBJECTS_LIST: SubjectInfo[] = [
  {
    id: 'it-402',
    code: 'CBSE 402',
    name: 'Information Technology',
    classes: ['VI', 'VII', 'VIII', 'IX', 'X'],
    description: 'Digital Documentation, Electronic Spreadsheets, Database Management System (DBMS), and Web Applications & Security.',
    iconName: 'Laptop',
    accentColor: 'from-blue-600 to-indigo-600',
  },
  {
    id: 'it-802',
    code: 'CBSE 802',
    name: 'Information Technology (Sr. Secondary)',
    classes: ['XI', 'XII'],
    description: 'Computer Organization, Advanced Networking, Operating Systems, Java Programming & Web Applications.',
    iconName: 'Server',
    accentColor: 'from-purple-600 to-pink-600',
  },
  {
    id: 'ip-065',
    code: 'CBSE 065',
    name: 'Informatics Practices',
    classes: ['XI', 'XII'],
    description: 'Data Handling using Python Pandas, Data Visualization using Pyplot, Database Query using SQL, and Societal Impacts of IT.',
    iconName: 'Database',
    accentColor: 'from-emerald-600 to-teal-600',
  },
  {
    id: 'typo-817',
    code: 'CBSE 817',
    name: 'Typography & Computer Applications',
    classes: ['XI', 'XII'],
    description: 'Keyboarding skills, touch typing methods, business correspondence, spreadsheet manipulation, and presentation mechanics.',
    iconName: 'Keyboard',
    accentColor: 'from-amber-600 to-orange-600',
  },
  {
    id: 'ca-165',
    code: 'CBSE 165',
    name: 'Computer Applications',
    classes: ['IX', 'X'],
    description: 'Basics of Information Technology, Cyber Ethics, HTML5 & CSS Web Design, and Scratch programming.',
    iconName: 'Code',
    accentColor: 'from-cyan-600 to-blue-600',
  },
  {
    id: 'cs-middle',
    code: 'Foundational CS',
    name: 'Computer Science & Digital Literacy',
    classes: ['VI', 'VII', 'VIII'],
    description: 'Computer Fundamentals, MS Office/LibreOffice, Scratch Block Coding, Internet Safety, and Computational Thinking.',
    iconName: 'Binary',
    accentColor: 'from-rose-600 to-red-600',
  }
];

export const CHAPTERS_DATA: Chapter[] = [];

export const getSubjectsForClass = (classLevel: ClassLevel, customSubjects?: SubjectInfo[]): SubjectInfo[] => {
  const pool = customSubjects && customSubjects.length > 0 ? customSubjects : SUBJECTS_LIST;
  return pool.filter(sub => sub.classes.includes(classLevel) && !sub.isHidden);
};

export const getChapters = (classLevel: ClassLevel, subjectId: SubjectId, customChapters: Chapter[] = []): Chapter[] => {
  const combined = [...CHAPTERS_DATA, ...customChapters];
  const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
  return unique
    .filter(ch => ch.classLevel === classLevel && ch.subjectId === subjectId && !ch.isHidden)
    .sort((a, b) => (a.order ?? a.chapterNumber) - (b.order ?? b.chapterNumber));
};
