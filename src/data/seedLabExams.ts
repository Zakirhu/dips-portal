import { LabExamConfig, LabExamStudentSession } from '../types';

export const INITIAL_LAB_EXAMS: LabExamConfig[] = [
  {
    id: 'lab-exam-it-402-midterm',
    examCode: 'LAB-X-IT-402-2026',
    title: 'Class X Information Technology (Code 402) • Computer Lab Mid-Term Examination',
    instructions: '1. This examination is conducted in the school Computer Lab under teacher invigilation.\n2. Answers are automatically saved continuously. Do not panic in case of power interruption.\n3. Attempt all questions: Section A (MCQs & True/False), Section B (Fill in Blanks), Section C (Short Answer / Practical Theory).\n4. Test will automatically submit when the countdown timer reaches 00:00.',
    classLevel: 'X',
    subjectId: 'it-402',
    section: 'ALL',
    assignedGroup: 'Computer Lab All Batches',
    assignedStudentIds: [],
    examDate: '2026-10-15',
    startTime: '09:30',
    durationMinutes: 45,
    totalMarks: 25,
    passingMarks: 10,
    status: 'live',
    shuffleQuestions: false,
    shuffleOptions: true,
    showResultsImmediately: false,
    showAnswerKeysToStudents: false,
    academicSession: '2025–2026',
    createdAt: '2026-10-01T08:00:00.000Z',
    questions: [
      {
        id: 'lab-q1',
        type: 'mcq',
        question: 'Which of the following style categories in LibreOffice Writer is used to format headings, titles, and body paragraphs?',
        options: ['Paragraph Style', 'Character Style', 'Page Style', 'Frame Style'],
        correctAnswer: 0,
        marks: 1,
        explanation: 'Paragraph styles determine the font, alignment, spacing, and borders for an entire paragraph.',
        chapterTitle: 'Digital Documentation (Advanced)',
        topic: 'Styles in Writer'
      },
      {
        id: 'lab-q2',
        type: 'mcq',
        question: 'What is the keyboard shortcut in LibreOffice Calc to open the Manage Templates window?',
        options: ['Ctrl + Shift + N', 'Ctrl + Alt + T', 'F11 directly', 'Shift + F5'],
        correctAnswer: 0,
        marks: 1,
        explanation: 'Ctrl + Shift + N directly launches the Templates manager in LibreOffice applications.',
        chapterTitle: 'Electronic Spreadsheet (Advanced)',
        topic: 'Templates & Formatting'
      },
      {
        id: 'lab-q3',
        type: 'true_false',
        question: 'In a Relational Database Management System (RDBMS), a Primary Key column can accept NULL values.',
        options: ['True', 'False'],
        correctAnswer: 1, // False
        marks: 1,
        explanation: 'A Primary Key must have unique non-null values for every record (Entity Integrity).',
        chapterTitle: 'Database Management System (RDBMS)',
        topic: 'Primary Key Constraints'
      },
      {
        id: 'lab-q4',
        type: 'true_false',
        question: 'Goal Seek in LibreOffice Calc works only on formulas that contain a single variable input.',
        options: ['True', 'False'],
        correctAnswer: 0, // True
        marks: 1,
        explanation: 'Goal Seek handles equations with a single unknown variable. For multiple variables, Solver must be used.',
        chapterTitle: 'Electronic Spreadsheet (Advanced)',
        topic: 'Goal Seek vs Solver'
      },
      {
        id: 'lab-q5',
        type: 'fill_blank',
        question: 'The SQL Data Definition Language (DDL) command used to permanently delete an entire table and its schema is _______.',
        correctAnswer: 'DROP TABLE',
        marks: 2,
        explanation: 'DROP TABLE removes the complete table definition and all rows from the relational database.',
        chapterTitle: 'Database Management System (RDBMS)',
        topic: 'SQL DDL Commands'
      },
      {
        id: 'lab-q6',
        type: 'fill_blank',
        question: 'In LibreOffice Calc, the feature used to consolidate data from multiple worksheets into a single summary sheet using mathematical functions is known as _______.',
        correctAnswer: 'Consolidate',
        marks: 2,
        explanation: 'Data Consolidation merges data ranges from different sheets into a single master range.',
        chapterTitle: 'Electronic Spreadsheet (Advanced)',
        topic: 'Data Consolidation'
      },
      {
        id: 'lab-q7',
        type: 'mcq',
        question: 'Under Indian Cyber Laws (Information Technology Act 2000), which section prescribes punishment for hacking into a computer system?',
        options: ['Section 66', 'Section 43', 'Section 12', 'Section 80'],
        correctAnswer: 0,
        marks: 1,
        explanation: 'Section 66 of the IT Act 2000 deals with computer-related offenses and hacking penalties.',
        chapterTitle: 'Web Applications & Security',
        topic: 'IT Act 2000 & Cyber Ethics'
      },
      {
        id: 'lab-q8',
        type: 'short_answer',
        question: 'State the difference between DDL (Data Definition Language) and DML (Data Manipulation Language) commands in SQL. Give two examples of each.',
        correctAnswer: 'DDL commands define or alter the database structure/schema (Examples: CREATE, ALTER, DROP). DML commands manage and manipulate the tuples/data within tables (Examples: SELECT, INSERT, UPDATE, DELETE).',
        marks: 4,
        explanation: 'Award 2 marks for conceptual difference + 1 mark each for correct DDL and DML command examples.',
        chapterTitle: 'Database Management System (RDBMS)',
        topic: 'DDL vs DML Commands'
      },
      {
        id: 'lab-q9',
        type: 'short_answer',
        question: 'Explain how Mail Merge works in LibreOffice Writer. Mention the two essential documents required to complete a mail merge operation.',
        correctAnswer: 'Mail Merge generates multiple customized letters or documents by combining a main document (letter text) with a data source (recipient addresses/records). Two documents required: (1) Main Document (containing the template text), (2) Data Source / Address List (containing variable recipient information).',
        marks: 4,
        explanation: 'Award 2 marks for Mail Merge explanation + 2 marks for identifying Main Document and Data Source.',
        chapterTitle: 'Digital Documentation (Advanced)',
        topic: 'Mail Merge Operation'
      },
      {
        id: 'lab-q10',
        type: 'short_answer',
        question: 'What is a Macro in spreadsheets? Describe one specific scenario where recording a macro saves time for a computer lab student.',
        correctAnswer: 'A Macro is a saved sequence of keystrokes and commands that can be recorded and executed repeatedly to automate repetitive tasks. Scenario: Automating the formatting of monthly student attendance or grade tables with predetermined headers, bold fonts, and borders in a single click.',
        marks: 4,
        explanation: 'Award 2 marks for macro definition + 2 marks for describing a realistic lab automation scenario.',
        chapterTitle: 'Electronic Spreadsheet (Advanced)',
        topic: 'Macros in Calc'
      }
    ]
  },
  {
    id: 'lab-exam-ip-065-term1',
    examCode: 'LAB-XII-IP-065-2026',
    title: 'Class XII Informatics Practices (Code 065) • Python & MySQL Computer Lab Practical Assessment',
    instructions: '1. Computer Lab timed assessment for Senior Secondary IP students.\n2. Execute concepts cleanly. Objective questions are auto-graded.\n3. Descriptive Python codes and SQL queries will be evaluated by the teacher.\n4. Real-time workstation sync active.',
    classLevel: 'XII',
    subjectId: 'ip-065',
    section: 'ALL',
    assignedGroup: 'Class XII IP Batch',
    assignedStudentIds: [],
    examDate: '2026-10-18',
    startTime: '10:00',
    durationMinutes: 60,
    totalMarks: 35,
    passingMarks: 14,
    status: 'scheduled',
    shuffleQuestions: false,
    shuffleOptions: true,
    showResultsImmediately: false,
    showAnswerKeysToStudents: false,
    academicSession: '2025–2026',
    createdAt: '2026-10-02T08:00:00.000Z',
    questions: [
      {
        id: 'lab-ip-q1',
        type: 'mcq',
        question: 'In Python Pandas, what is the output of `df.shape` for a DataFrame with 5 rows and 3 columns?',
        options: ['(5, 3)', '(3, 5)', '15', '[5, 3]'],
        correctAnswer: 0,
        marks: 1,
        explanation: 'df.shape returns a tuple representing dimensionality in the format (rows, columns).',
        chapterTitle: 'Data Handling using Pandas - I',
        topic: 'DataFrame Attributes'
      },
      {
        id: 'lab-ip-q2',
        type: 'true_false',
        question: 'The `.loc[]` indexing method in Pandas is purely integer position-based and excludes the stop index.',
        options: ['True', 'False'],
        correctAnswer: 1, // False
        marks: 1,
        explanation: '.loc[] is label-based and includes the stop index. .iloc[] is integer-based and excludes the stop index.',
        chapterTitle: 'Data Handling using Pandas - I',
        topic: 'Pandas loc vs iloc'
      },
      {
        id: 'lab-ip-q3',
        type: 'fill_blank',
        question: 'In MySQL, the clause used to filter groups AFTER aggregate calculations have been computed is _______.',
        correctAnswer: 'HAVING',
        marks: 2,
        explanation: 'HAVING filters grouped records after GROUP BY, whereas WHERE filters individual rows before grouping.',
        chapterTitle: 'Database Query using SQL',
        topic: 'GROUP BY and HAVING'
      },
      {
        id: 'lab-ip-q4',
        type: 'short_answer',
        question: 'Write Python code to create a DataFrame from a dictionary containing student names and marks in IP, and display the first 2 rows.',
        correctAnswer: "import pandas as pd\ndata = {'Name': ['Aarav', 'Diya', 'Rohan'], 'Marks': [95, 98, 92]}\ndf = pd.DataFrame(data)\nprint(df.head(2))",
        marks: 4,
        explanation: 'Award 2 marks for dictionary & DataFrame syntax + 2 marks for using df.head(2).',
        chapterTitle: 'Data Handling using Pandas - I',
        topic: 'DataFrame Creation & Head'
      }
    ]
  }
];

export const INITIAL_LAB_SESSIONS: LabExamStudentSession[] = [
  {
    id: 'session-demo-1',
    examId: 'lab-exam-it-402-midterm',
    studentId: 'STD-X-101',
    studentName: 'Aarav Sharma',
    rollNumber: 'X-01',
    classLevel: 'X',
    workstationIp: 'LAB-PC-03',
    status: 'submitted',
    startedAt: '2026-10-08T09:30:15.000Z',
    lastActiveAt: '2026-10-08T10:12:00.000Z',
    submittedAt: '2026-10-08T10:12:00.000Z',
    answers: {
      'lab-q1': 0,
      'lab-q2': 0,
      'lab-q3': 1,
      'lab-q4': 0,
      'lab-q5': 'DROP TABLE',
      'lab-q6': 'Consolidate',
      'lab-q7': 0,
      'lab-q8': 'DDL commands define schema like CREATE, DROP. DML commands manipulate data like SELECT, INSERT.',
      'lab-q9': 'Mail merge merges main document template with address list data source.',
      'lab-q10': 'Macros are saved sequence of steps. Scenario: formatting student marksheets repeatedly.'
    },
    manualEvaluations: {
      'lab-q8': { marks: 4, feedback: 'Correct DDL and DML distinctions with examples.' },
      'lab-q9': { marks: 4, feedback: 'Accurately identified main document and data source.' },
      'lab-q10': { marks: 3.5, feedback: 'Good explanation and scenario.' }
    },
    autoScore: 9,
    manualScore: 11.5,
    finalScore: 20.5,
    totalMarks: 25,
    percentage: 82,
    passed: true,
    isEvaluated: true
  },
  {
    id: 'session-demo-2',
    examId: 'lab-exam-it-402-midterm',
    studentId: 'STD-X-102',
    studentName: 'Diya Patel',
    rollNumber: 'X-02',
    classLevel: 'X',
    workstationIp: 'LAB-PC-07',
    status: 'in_progress',
    startedAt: '2026-10-08T09:32:00.000Z',
    lastActiveAt: '2026-10-08T09:55:00.000Z',
    answers: {
      'lab-q1': 0,
      'lab-q2': 0,
      'lab-q3': 1,
      'lab-q4': 0,
      'lab-q5': 'DROP TABLE'
    },
    autoScore: 5,
    finalScore: 5,
    totalMarks: 25,
    percentage: 20,
    passed: false,
    isEvaluated: false
  }
];
