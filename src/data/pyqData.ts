import { PYQPaper } from '../types';

export const INITIAL_PYQ_PAPERS: PYQPaper[] = [
  {
    id: 'pyq-2024-x-it',
    year: '2024',
    examType: 'CBSE Main Board Examination',
    classLevel: 'X',
    subjectId: 'it-402',
    subjectName: 'Information Technology',
    code: 'Code 402',
    totalMarks: 50,
    timeHours: 2,
    questionsSummary: '21 Questions (Section A: 24 objective marks, Section B: 26 descriptive marks)',
    fileName: 'CBSE_Class_10_IT_402_Board_Paper_2024.pdf',
    fileSize: '1.4 MB',
    uploadedAt: '2024-03-25',
    markingSchemeFileName: 'CBSE_Class_10_IT_402_Marking_Scheme_2024.pdf',
    sampleQuestions: [
      {
        qNumber: 'Q1',
        question: 'Which of the following is NOT a valid style category available in LibreOffice Writer?',
        marks: 1,
        officialAnswer: 'Option (D): Motion Style. (Valid styles are Paragraph, Character, Page, Frame, and List styles).',
        stepMarkingScheme: '1 Mark for choosing the correct option or naming "Motion Style".'
      },
      {
        qNumber: 'Q2',
        question: 'Explain the difference between Goal Seek and Solver in LibreOffice Calc.',
        marks: 2,
        officialAnswer: 'Goal Seek is used to find an input value for a formula having a single unknown variable to achieve a specific target result.\nSolver is an advanced optimization tool that handles equations with multiple unknown variables and complex constraints.',
        stepMarkingScheme: '1 Mark for Goal Seek definition + 1 Mark for Solver distinction.'
      },
      {
        qNumber: 'Q3',
        question: 'Write SQL statements to:\n(a) Create a table "Item" with ItemID (Primary Key, integer), ItemName (text), Price (decimal).\n(b) Display all items whose price is between ₹200 and ₹800.',
        marks: 4,
        officialAnswer: '(a) CREATE TABLE Item (ItemID INT PRIMARY KEY, ItemName VARCHAR(50), Price DECIMAL(8,2));\n(b) SELECT * FROM Item WHERE Price BETWEEN 200 AND 800; (OR WHERE Price >= 200 AND Price <= 800;)',
        stepMarkingScheme: '2 Marks for CREATE TABLE syntax with PRIMARY KEY + 2 Marks for SELECT WHERE BETWEEN.'
      }
    ]
  },
  {
    id: 'pyq-2023-x-it',
    year: '2023',
    examType: 'CBSE Main Board Examination',
    classLevel: 'X',
    subjectId: 'it-402',
    subjectName: 'Information Technology',
    code: 'Code 402',
    totalMarks: 50,
    timeHours: 2,
    questionsSummary: 'Official Term II Board Paper with focus on RDBMS Base and Web Security',
    fileName: 'CBSE_Class_10_IT_402_Board_Paper_2023.pdf',
    fileSize: '1.2 MB',
    uploadedAt: '2023-03-20',
    markingSchemeFileName: 'CBSE_Class_10_IT_402_Marking_Scheme_2023.pdf',
    sampleQuestions: [
      {
        qNumber: 'Q1',
        question: 'State the function of Primary Key and Foreign Key in establishing relationships between tables.',
        marks: 2,
        officialAnswer: 'Primary Key uniquely identifies each record in the primary table and cannot be null.\nForeign Key is a field in a related table that refers to the Primary Key of the primary table to ensure referential integrity.',
        stepMarkingScheme: '1 Mark for Primary Key purpose + 1 Mark for Foreign Key referential integrity role.'
      },
      {
        qNumber: 'Q2',
        question: 'What is a Macro in LibreOffice Calc? Mention one advantage of using macros.',
        marks: 2,
        officialAnswer: 'A Macro is a saved sequence of keystrokes or commands that can be recorded and executed repeatedly.\nAdvantage: Automates repetitive tasks, reduces manual data entry errors, and saves time.',
        stepMarkingScheme: '1 Mark for Macro definition + 1 Mark for stating a valid advantage.'
      }
    ]
  },
  {
    id: 'pyq-2024-xii-ip',
    year: '2024',
    examType: 'CBSE Senior School Certificate Examination',
    classLevel: 'XII',
    subjectId: 'ip-065',
    subjectName: 'Informatics Practices',
    code: 'Code 065',
    totalMarks: 70,
    timeHours: 3,
    questionsSummary: '35 Questions covering Python Pandas Series, DataFrames, MySQL Functions & Joins, and Networks',
    fileName: 'CBSE_Class_12_IP_065_Board_Paper_2024.pdf',
    fileSize: '1.8 MB',
    uploadedAt: '2024-03-28',
    markingSchemeFileName: 'CBSE_Class_12_IP_065_Marking_Scheme_2024.pdf',
    sampleQuestions: [
      {
        qNumber: 'Q1',
        question: 'Given a DataFrame `df`, write the command to display the last 3 rows.',
        marks: 1,
        officialAnswer: 'df.tail(3)',
        stepMarkingScheme: '1 Mark for df.tail(3).'
      },
      {
        qNumber: 'Q2',
        question: 'Differentiate between the following MySQL functions with examples:\n(a) NOW() and CURDATE()\n(b) INSTR() and SUBSTR()',
        marks: 4,
        officialAnswer: '(a) NOW() returns both current date and current time (YYYY-MM-DD HH:MM:SS), whereas CURDATE() returns only current date (YYYY-MM-DD).\n(b) INSTR(str, substr) returns the integer position of the first occurrence of a substring, whereas SUBSTR(str, pos, len) extracts a portion of a string.',
        stepMarkingScheme: '2 Marks for part (a) distinction + 2 Marks for part (b) distinction.'
      }
    ]
  },
  {
    id: 'pyq-2024-xii-typo',
    year: '2024',
    examType: 'CBSE Vocational Board Examination',
    classLevel: 'XII',
    subjectId: 'typo-817',
    subjectName: 'Typography & Computer Applications',
    code: 'Code 817',
    totalMarks: 60,
    timeHours: 2,
    questionsSummary: 'Touch Keyboarding mechanics, Official Correspondence styles, and Tabular processing rules',
    fileName: 'CBSE_Class_12_Typography_817_Board_Paper_2024.pdf',
    fileSize: '1.1 MB',
    uploadedAt: '2024-04-02',
    markingSchemeFileName: 'CBSE_Class_12_Typography_817_Marking_Scheme_2024.pdf',
    sampleQuestions: [
      {
        qNumber: 'Q1',
        question: 'Define Gross Words Per Minute (GWPM) and Net Words Per Minute (NWPM).',
        marks: 2,
        officialAnswer: 'GWPM is the total number of standard 5-character words typed in a given time divided by elapsed minutes without penalizing mistakes.\nNWPM takes accuracy into account by subtracting error penalties from gross speed.',
        stepMarkingScheme: '1 Mark for GWPM formula + 1 Mark for NWPM formula.'
      },
      {
        qNumber: 'Q2',
        question: 'What are the main characteristics of a Fully Blocked Style letter?',
        marks: 2,
        officialAnswer: 'In Fully Blocked style:\n1. All parts of the letter (Date, Reference, Inside Address, Salutation, Body, Complimentary Close) begin flush with the left margin.\n2. No paragraph indentation is used; paragraphs are separated by a double line space.',
        stepMarkingScheme: '1 Mark for left margin alignment + 1 Mark for open punctuation/paragraph spacing rule.'
      }
    ]
  }
];
