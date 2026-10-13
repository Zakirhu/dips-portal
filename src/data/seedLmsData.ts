import { Chapter, LearningResource } from '../types';

export const DEFAULT_SEED_CHAPTERS: Chapter[] = [
  // Class X - Information Technology (402)
  {
    id: 'ch-x-it-01',
    classLevel: 'X',
    subjectId: 'it-402',
    chapterNumber: 1,
    title: 'Digital Documentation (Advanced)',
    description: 'Styles, inserting images, grouping objects, creating templates, and Table of Contents (ToC) in LibreOffice Writer.',
    order: 1,
    isActive: true,
    isHidden: false,
    topics: ['Styles & Formatting', 'Working with Images', 'Creating Templates', 'Table of Contents', 'Mail Merge']
  },
  {
    id: 'ch-x-it-02',
    classLevel: 'X',
    subjectId: 'it-402',
    chapterNumber: 2,
    title: 'Electronic Spreadsheet (Advanced)',
    description: 'Consolidating data, sub-totals, what-if analysis (Scenarios, Goal Seek, Solver), linking spreadsheets, and macros.',
    order: 2,
    isActive: true,
    isHidden: false,
    topics: ['Data Consolidation', 'Subtotals Tool', 'What-If Scenarios & Goal Seek', 'Linking Sheets', 'Recording & Running Macros']
  },
  {
    id: 'ch-x-it-03',
    classLevel: 'X',
    subjectId: 'it-402',
    chapterNumber: 3,
    title: 'Database Management System (DBMS)',
    description: 'Relational data models, primary and foreign keys, table design, SQL commands, queries, forms, and reports.',
    order: 3,
    isActive: true,
    isHidden: false,
    topics: ['DBMS Concepts', 'Primary & Foreign Keys', 'SQL Queries (SELECT, INSERT, UPDATE, DELETE)', 'Creating Forms & Reports']
  },
  {
    id: 'ch-x-it-04',
    classLevel: 'X',
    subjectId: 'it-402',
    chapterNumber: 4,
    title: 'Web Applications and Security',
    description: 'Computer accessibility options, network fundamentals, instant messaging, online transactions, blogs, and cyber security best practices.',
    order: 4,
    isActive: true,
    isHidden: false,
    topics: ['Accessibility Settings', 'Networking & Topologies', 'Online Security & Passwords', 'Workplace Safety & Ergonomics']
  },

  // Class XII - Informatics Practices (065)
  {
    id: 'ch-xii-ip-01',
    classLevel: 'XII',
    subjectId: 'ip-065',
    chapterNumber: 1,
    title: 'Data Handling using Pandas - I',
    description: 'Python Series and DataFrames: creation, indexing, slicing, filtering, head, tail, and attribute operations.',
    order: 1,
    isActive: true,
    isHidden: false,
    topics: ['Series Data Structures', 'DataFrame Creation', 'Attributes (.shape, .dtypes, .values)', 'Indexing & Slicing (.loc, .iloc)']
  },
  {
    id: 'ch-xii-ip-02',
    classLevel: 'XII',
    subjectId: 'ip-065',
    chapterNumber: 2,
    title: 'Data Visualization using Pyplot',
    description: 'Line plots, bar charts, histograms, custom styling, labels, legends, titles, and grid formatting with matplotlib.pyplot.',
    order: 2,
    isActive: true,
    isHidden: false,
    topics: ['Matplotlib Architecture', 'Line & Bar Charts', 'Histograms', 'Customizing Legends & Labels']
  },
  {
    id: 'ch-xii-ip-03',
    classLevel: 'XII',
    subjectId: 'ip-065',
    chapterNumber: 3,
    title: 'Database Query using SQL (Advanced)',
    description: 'Aggregate functions (COUNT, SUM, AVG, MIN, MAX), GROUP BY, HAVING, ORDER BY, and Cartesian product/table joins.',
    order: 3,
    isActive: true,
    isHidden: false,
    topics: ['Aggregate Functions', 'GROUP BY Clause', 'HAVING vs WHERE', 'Equi-Joins & Natural Joins']
  },
  {
    id: 'ch-xii-ip-04',
    classLevel: 'XII',
    subjectId: 'ip-065',
    chapterNumber: 4,
    title: 'Societal Impacts of IT',
    description: 'Digital footprint, netiquette, data protection laws, intellectual property rights (IPR), plagiarism, licensing, cybercrimes, and e-waste management.',
    order: 4,
    isActive: true,
    isHidden: false,
    topics: ['Digital Footprint & Privacy', 'Cyber Laws & IT Act 2000', 'IPR, Copyrights & Open Source', 'E-Waste Hazards & Disposal']
  },

  // Class IX - Information Technology (402)
  {
    id: 'ch-ix-it-01',
    classLevel: 'IX',
    subjectId: 'it-402',
    chapterNumber: 1,
    title: 'Introduction to IT-ITeS Industry',
    description: 'BPO services, BPM industry structure, applications of IT in business, education, healthcare, banking, and engineering.',
    order: 1,
    isActive: true,
    isHidden: false,
    topics: ['IT & ITeS Concepts', 'BPO Industry & Call Centers', 'IT Applications in Education & Medicine']
  },
  {
    id: 'ch-ix-it-02',
    classLevel: 'IX',
    subjectId: 'it-402',
    chapterNumber: 2,
    title: 'Data Entry & Keyboarding Skills',
    description: 'Touch typing mechanics, guide keys, rapid typing tutor software, typing ergonomics, and accuracy calculations.',
    order: 2,
    isActive: true,
    isHidden: false,
    topics: ['Keyboard Layout & Guide Keys', 'Touch Typing Rules', 'Rapid Typing Software', 'Ergonomic Posture']
  },

  // Class VIII - Computer Science (Middle)
  {
    id: 'ch-viii-cs-01',
    classLevel: 'VIII',
    subjectId: 'cs-middle',
    chapterNumber: 1,
    title: 'Computer Networks & Internet Security',
    description: 'LAN, MAN, WAN, network topologies (Star, Bus, Ring), communication protocols, firewalls, and online safety.',
    order: 1,
    isActive: true,
    isHidden: false,
    topics: ['Types of Networks', 'Topologies', 'Network Devices (Hub, Switch, Router)', 'Safe Browsing Habits']
  },
  {
    id: 'ch-viii-cs-02',
    classLevel: 'VIII',
    subjectId: 'cs-middle',
    chapterNumber: 2,
    title: 'Database Concepts with LibreOffice Base',
    description: 'Relational tables, primary key, fields, records, data types, and simple queries.',
    order: 2,
    isActive: true,
    isHidden: false,
    topics: ['What is a Database', 'Fields, Records & Tables', 'Primary Key Concept', 'Creating Simple Forms']
  }
];

export const DEFAULT_SEED_RESOURCES: LearningResource[] = [
  // Class X - IT 402 - Chapter 1: Digital Documentation (Advanced)
  {
    id: 'res-x-it-01-notes',
    title: 'Comprehensive Master Notes: Digital Documentation (Advanced)',
    description: 'Complete CBSE board study notes covering Styles and Formatting, Image Handling, Custom Templates, Table of Contents, and Mail Merge.',
    resourceType: 'notes',
    classLevel: 'X',
    subjectId: 'it-402',
    chapterId: 'ch-x-it-01',
    chapterTitle: 'Digital Documentation (Advanced)',
    published: true,
    uploadedDate: '2026-03-15',
    order: 1,
    author: 'Zakir Hussain',
    fileName: 'Class_X_IT402_Ch1_Digital_Documentation_Notes.pdf',
    fileSize: '1.8 MB',
    pageCount: 14,
    tags: ['CBSE 2026', 'LibreOffice Writer', 'Styles', 'ToC', 'Board Focus'],
    content: `# Chapter 1: Digital Documentation (Advanced)
**Subject:** Information Technology (Subject Code: 402) • Class X
**Educator:** Zakir Hussain

---

### Unit 1: Apply Styles in the Document
1. **What is a Style?**
A style is a set of formats that you can apply to selected pages, text, frames, and other elements in your document to quickly change their appearance. Instead of manually bolding, changing font size, and setting margins repeatedly, a style applies all attributes in one click.

2. **Categories of Styles in LibreOffice Writer:**
- **Page Styles:** Control page margins, headers, footers, page orientation, borders, and backgrounds.
- **Paragraph Styles:** Control line spacing, text alignment, tab stops, and borders of whole paragraphs.
- **Character Styles:** Affect chosen text within a paragraph, such as font family, bold, italics, or text color without altering paragraph settings.
- **Frame Styles:** Format graphic and text frames, text wrap behavior, and margins.
- **List Styles:** Define numbering formats, bullet icons, and indent levels.

3. **Fill Format Mode:**
Used to apply a style to many different areas quickly without having to go back to the Styles and Formatting window every time. Click the *Fill Format* icon (paint bucket) and click where you want the style applied. Press Esc to exit.

---

### Unit 2: Insert and Use Images
- **Inserting Images:** Use *Insert > Image* from file, or drag and drop, or paste from clipboard.
- **Modifying Images:** Use Picture Toolbar to adjust Transparency, Color channels, Graphic Filters (Smooth, Sharpen, Invert), and Cropping.
- **Text Wrapping:**
  - *Wrap Off:* Text is above and below the image.
  - *Page Wrap:* Text flows around all four sides.
  - *Optimal Page Wrap:* Text flows only where there is adequate margin.
  - *Wrap Through:* Image floats over or under text.
- **Anchoring:** Tells Writer what the graphic is anchored to (To Page, To Paragraph, To Character, As Character).

---

### Unit 3: Create and Use Template
A **template** is a blueprint or model used to create new documents with pre-configured layouts, logo headers, font hierarchy, and margin presets.
- Default template can be customized via *File > Templates > Manage Templates*.
- Saves repetitive formatting time in school letters, practical report covers, and examination question paper templates.

---

### Unit 4: Create and Customize Table of Contents (ToC)
Writer automatically generates a Table of Contents based on heading styles (Heading 1, Heading 2, Heading 3).
- To insert: *Insert > Table of Contents and Index > Table of Contents, Index or Bibliography*.
- Protect against manual changes: Checked by default to prevent accidental deletion of automatic page references.`
  },

  {
    id: 'res-x-it-01-qa',
    title: 'Question Answers: 2-Mark & 3-Mark CBSE Board Expected',
    description: 'Detailed official solutions with CBSE marking scheme points for Chapter 1 questions.',
    resourceType: 'qa',
    classLevel: 'X',
    subjectId: 'it-402',
    chapterId: 'ch-x-it-01',
    chapterTitle: 'Digital Documentation (Advanced)',
    published: true,
    uploadedDate: '2026-03-18',
    order: 2,
    author: 'Zakir Hussain',
    tags: ['Solutions', 'Short Answers', 'Long Answers', 'CBSE Marking Scheme'],
    qaItems: [
      {
        id: 'qa-01',
        question: 'Differentiate between Paragraph Styles and Character Styles in LibreOffice Writer with examples.',
        answer: 'Paragraph styles affect an entire paragraph including line spacing, text alignment, indents, and tab stops (e.g. Heading 1, Body Text). Character styles affect only selected words or characters within a paragraph without changing the whole paragraph layout (e.g. Emphasis, Strong Emphasis, Subscript).',
        marks: 2
      },
      {
        id: 'qa-02',
        question: 'Explain the purpose of Fill Format mode in the Styles & Formatting deck. How do you exit it?',
        answer: 'Fill Format mode is used to apply a selected style rapidly to multiple sections of text across a document without having to select the style each time. To exit Fill Format mode, press the Escape (Esc) key or click the Fill Format icon again.',
        marks: 2
      },
      {
        id: 'qa-03',
        question: 'What is a Template in Writer? List two distinct advantages of creating custom templates.',
        answer: 'A template is a pre-designed document framework containing styles, layout settings, tables, and company/school branding. Advantages: 1) Ensures consistency across all official documents. 2) Saves significant time by eliminating the need to reformat recurring documents from scratch.',
        marks: 3
      },
      {
        id: 'qa-04',
        question: 'Explain four different text wrapping options available when positioning an image in a document.',
        answer: '1) Wrap Off: Places the graphic on a separate line; text appears above and below only. 2) Page Wrap: Flows text around all available sides of the picture. 3) Optimal Page Wrap: Flows text around the picture only on the wider side if margin is sufficient. 4) Wrap Through: The picture superimposes over the text or sits in the background behind the text.',
        marks: 3
      }
    ]
  },

  {
    id: 'res-x-it-01-imp-q',
    title: 'Important Board Questions & High-Yield Blueprint Analysis',
    description: 'High-frequency CBSE board questions analyzed from 2020–2025 question papers for Digital Documentation.',
    resourceType: 'important_questions',
    classLevel: 'X',
    subjectId: 'it-402',
    chapterId: 'ch-x-it-01',
    chapterTitle: 'Digital Documentation (Advanced)',
    published: true,
    uploadedDate: '2026-03-20',
    order: 3,
    author: 'Zakir Hussain',
    tags: ['Board Guaranteed', 'Expected 2026', 'High Yield'],
    qaItems: [
      {
        id: 'imp-01',
        question: 'A teacher wants to generate a Table of Contents for a 50-page annual school report. State the essential prerequisite in the document before generating the ToC.',
        answer: 'Prerequisite: All chapter titles and sub-headings must be formatted using consistent heading styles (such as Heading 1 for main chapters, Heading 2 for sections, Heading 3 for subsections) from the Styles palette. Writer relies on these heading levels to construct the ToC automatically.',
        marks: 2
      },
      {
        id: 'imp-02',
        question: 'State the difference between Linking an image vs Embedding an image in a Writer document.',
        answer: 'Embedding copies the image file directly into the document, making the document file larger but portable. Linking merely stores the file path to the external image on disk, keeping the document size small, but moving the document without the picture breaks the link.',
        marks: 3
      },
      {
        id: 'imp-03',
        question: 'Describe the steps to protect a Table of Contents from accidental manual edits by other users.',
        answer: 'Right-click the Table of Contents, choose Edit Index/Table, and under the Type tab, ensure the checkbox "Protected against manual changes" is selected. Click OK.',
        marks: 2
      }
    ]
  },

  {
    id: 'res-x-it-01-mcqs',
    title: 'Chapter 1 MCQ Practice Bank with Explanations',
    description: 'Interactive multiple choice questions with immediate feedback, rationale, and CBSE difficulty grading.',
    resourceType: 'mcq',
    classLevel: 'X',
    subjectId: 'it-402',
    chapterId: 'ch-x-it-01',
    chapterTitle: 'Digital Documentation (Advanced)',
    published: true,
    uploadedDate: '2026-03-22',
    order: 4,
    author: 'Zakir Hussain',
    tags: ['MCQs', 'Objective Questions', 'Instant Practice'],
    mcqItems: [
      {
        id: 'mcq-01',
        question: 'Which of the following styles in LibreOffice Writer is used to format font color, bold, or highlight on selected words inside a paragraph?',
        options: ['Page Style', 'Character Style', 'Frame Style', 'List Style'],
        correctOptionIndex: 1,
        explanation: 'Character styles apply only to the chosen string of characters without affecting paragraph-level alignment or line spacing.',
        marks: 1
      },
      {
        id: 'mcq-02',
        question: 'What is the default shortcut key to open the Styles and Formatting deck in LibreOffice Writer?',
        options: ['F1', 'F5', 'F11', 'Ctrl + F12'],
        correctOptionIndex: 2,
        explanation: 'F11 toggles the Styles sidebar deck in LibreOffice Writer.',
        marks: 1
      },
      {
        id: 'mcq-03',
        question: 'Which tab under the Table of Contents dialog allows you to change the number of heading levels evaluated?',
        options: ['Type Tab', 'Entries Tab', 'Styles Tab', 'Columns Tab'],
        correctOptionIndex: 0,
        explanation: 'The Type tab specifies the title, type of index, and the "Evaluate up to level" parameter (default 10).',
        marks: 1
      },
      {
        id: 'mcq-04',
        question: 'To group multiple drawing objects together into a single unit, which menu path is used?',
        options: ['Format > Group > Group', 'Tools > Objects > Combine', 'Insert > Grouping', 'Edit > Link Objects'],
        correctOptionIndex: 0,
        explanation: 'Select multiple objects using Shift + Click, then select Format > Group > Group (or right click > Group).',
        marks: 1
      }
    ]
  },

  {
    id: 'res-x-it-01-practical',
    title: 'Practical File Experiment 1: Styles, Images & Table of Contents',
    description: 'Hands-on laboratory assignment containing exact step-by-step procedures, screenshot requirements, and viva voce questions.',
    resourceType: 'practical_assignment',
    classLevel: 'X',
    subjectId: 'it-402',
    chapterId: 'ch-x-it-01',
    chapterTitle: 'Digital Documentation (Advanced)',
    published: true,
    uploadedDate: '2026-03-24',
    order: 5,
    author: 'Zakir Hussain',
    fileName: 'Class_X_Practical_Exp_01_Digital_Doc.pdf',
    fileSize: '2.4 MB',
    pageCount: 6,
    tags: ['Lab File', 'Practical Exam', 'Viva Voce', 'LibreOffice Writer'],
    content: `# Practical Experiment 1: Digital Documentation (Advanced)

### Aim:
To design a 4-page Technical Project Report using LibreOffice Writer incorporating:
1. Custom Heading and Paragraph Styles
2. Cropped and Anchored Diagram with Optimal Page Wrap
3. Automated 3-level Table of Contents with Hyperlinks
4. Custom Letterhead Template (.ott)

### Software Required:
- Operating System: Windows 10/11 or Ubuntu Linux
- Office Suite: LibreOffice 7.x / 8.x Writer

### Step-by-Step Procedure:
1. Open LibreOffice Writer. Press **F11** to view the Styles deck.
2. Create a custom paragraph style named **Project_Body**: Font Arial 11pt, 1.15 line spacing, Justified, 0.20cm spacing below.
3. Apply **Heading 1** to "1. Introduction" and "2. System Architecture".
4. Insert architectural diagram from *Insert > Image*. Set *Wrap > Optimal Page Wrap*.
5. Set Anchor to **To Paragraph**. Group the diagram with its caption box.
6. Position the cursor on Page 2 and choose *Insert > Table of Contents and Index > Table of Contents*.
7. In the *Entries* tab, click between **E#** and **E** and click **Hyperlink** to make ToC entries clickable.
8. Save as template via *File > Templates > Save As Template*.

### Viva Voce Sample Questions:
- **Q1:** What file extension is used for LibreOffice Writer templates?
  *Ans:* .ott (OpenDocument Text Template).
- **Q2:** Why should a graphic be anchored 'To Character' instead of 'To Page'?
  *Ans:* When anchored to a character, the graphic moves naturally along with the surrounding text during revisions.`
  },

  {
    id: 'res-x-it-01-pyq',
    title: 'CBSE Board Previous Year Solved Questions (2022–2025)',
    description: 'Archived board examination questions specifically from Chapter 1 with answer keys and examiner notes.',
    resourceType: 'pyq',
    classLevel: 'X',
    subjectId: 'it-402',
    chapterId: 'ch-x-it-01',
    chapterTitle: 'Digital Documentation (Advanced)',
    published: true,
    uploadedDate: '2026-03-25',
    order: 6,
    author: 'Zakir Hussain',
    fileName: 'CBSE_ClassX_IT402_Ch1_Solved_PYQ_Papers.pdf',
    fileSize: '3.1 MB',
    pageCount: 8,
    tags: ['CBSE 2024', 'CBSE 2023', 'Solved PYQ', 'Board Papers'],
    qaItems: [
      {
        id: 'pyq-x-01',
        question: '[CBSE 2024 Board Exam] Tanmay has written a 100-page book in LibreOffice Writer. He wants to modify the font of all section headings across the book from Times New Roman to Montserrat. Which feature of Writer will allow him to achieve this in a single action?',
        answer: 'Tanmay should modify the Paragraph Style applied to the section headings (e.g. Heading 1 or Heading 2). By right-clicking the style in the Styles deck and choosing Modify, changing the Font to Montserrat will automatically update all instances across the entire 100-page document.',
        marks: 2
      },
      {
        id: 'pyq-x-02',
        question: '[CBSE 2023 Board Exam] Define the term "Cropping" of an image. Name the two crop options available in LibreOffice Writer.',
        answer: 'Cropping is the process of removing unwanted outer areas of an image without changing its resolution. The two options are: 1) Keep scale (crops while preserving image dimensions) and 2) Keep image size (crops while scaling the remaining portion to fill original size).',
        marks: 2
      }
    ]
  },

  {
    id: 'res-x-it-01-revision',
    title: 'One-Shot Rapid Revision Cheat Sheet: Digital Documentation',
    description: 'Summary mindmap, shortcut keys, key terminology definitions, and last-minute exam recall points.',
    resourceType: 'revision',
    classLevel: 'X',
    subjectId: 'it-402',
    chapterId: 'ch-x-it-01',
    chapterTitle: 'Digital Documentation (Advanced)',
    published: true,
    uploadedDate: '2026-03-26',
    order: 7,
    author: 'Zakir Hussain',
    fileName: 'Class_X_Ch1_Rapid_Revision_Summary.pdf',
    fileSize: '1.1 MB',
    pageCount: 4,
    tags: ['One Shot', 'Revision Mindmap', 'Formula Sheet', 'Shortcuts'],
    content: `# One-Shot Revision Sheet: Digital Documentation (Advanced)

### Quick Shortcut Keys:
- **F11:** Open Styles & Formatting Deck
- **Shift + F11:** Create New Style from Selection
- **Ctrl + Shift + F11:** Update Style from Selection
- **Ctrl + F12:** Insert Table
- **Ctrl + Alt + T:** Insert Table of Contents

### Quick Definitions in 1 Line:
- **Style:** Reusable named set of formatting attributes.
- **Template:** Blueprint document used to create consistent new documents (.ott).
- **Fill Format Mode:** Paint bucket tool to quickly stamp a style across multiple selections.
- **Anchor:** Reference point that determines the positioning relationship between an image and text.
- **ToC:** Auto-generated listing of document headings with corresponding page numbers.`
  },

  {
    id: 'res-x-it-01-test',
    title: 'Online Chapter Test: Digital Documentation Mastery (20 Marks)',
    description: 'Timed interactive chapter test with automatic evaluation, timer countdown, and detailed performance breakdown.',
    resourceType: 'chapter_test',
    classLevel: 'X',
    subjectId: 'it-402',
    chapterId: 'ch-x-it-01',
    chapterTitle: 'Digital Documentation (Advanced)',
    published: true,
    uploadedDate: '2026-03-28',
    order: 8,
    author: 'Zakir Hussain',
    testDurationMinutes: 20,
    totalMarks: 10,
    passingMarks: 4,
    testInstructions: 'Read each question carefully. Select the best option. The test will automatically evaluate upon completion or when the 20-minute countdown ends.',
    tags: ['Online Test', 'Timed Quiz', 'Auto Graded'],
    mcqItems: [
      {
        id: 'tst-01',
        question: 'Which of the following is NOT a category of styles available in LibreOffice Writer?',
        options: ['Page Styles', 'Paragraph Styles', 'Sound Styles', 'Frame Styles'],
        correctOptionIndex: 2,
        explanation: 'LibreOffice Writer provides Page, Paragraph, Character, Frame, and List styles. Sound styles do not exist.',
        marks: 1
      },
      {
        id: 'tst-02',
        question: 'To apply a style to multiple scattered paragraphs quickly without clicking the style menu every time, which feature is used?',
        options: ['Format Painter in Word only', 'Fill Format Mode', 'Template Wizard', 'AutoCorrect Deck'],
        correctOptionIndex: 1,
        explanation: 'Fill Format Mode (represented by a paint bucket) enables rapid application of a style.',
        marks: 1
      },
      {
        id: 'tst-03',
        question: 'What is the default file extension for a LibreOffice Writer template file?',
        options: ['.odt', '.ott', '.odp', '.ots'],
        correctOptionIndex: 1,
        explanation: '.ott represents OpenDocument Text Template. (.odt is normal text document, .ots is spreadsheet template).',
        marks: 1
      },
      {
        id: 'tst-04',
        question: 'Which text wrapping mode allows an image to sit behind or on top of text without pushing lines away?',
        options: ['Page Wrap', 'Optimal Wrap', 'Wrap Through', 'Wrap Off'],
        correctOptionIndex: 2,
        explanation: 'Wrap Through allows text and graphics to overlap.',
        marks: 1
      },
      {
        id: 'tst-05',
        question: 'When creating an automated Table of Contents, which heading styles does Writer look for by default?',
        options: ['Title and Subtitle only', 'Heading 1 to Heading 10', 'Any bold text', 'Header styles only'],
        correctOptionIndex: 1,
        explanation: 'Writer evaluates default outline levels from Heading 1 up to Heading 10.',
        marks: 1
      }
    ]
  },

  // Class XII - IP 065 - Chapter 1: Data Handling using Pandas - I
  {
    id: 'res-xii-ip-01-notes',
    title: 'Complete Notes: Python Pandas Series & DataFrames',
    description: 'Detailed NCERT & CBSE board syllabus notes for Series, DataFrame manipulation, slicing, and mathematical operations.',
    resourceType: 'notes',
    classLevel: 'XII',
    subjectId: 'ip-065',
    chapterId: 'ch-xii-ip-01',
    chapterTitle: 'Data Handling using Pandas - I',
    published: true,
    uploadedDate: '2026-03-20',
    order: 1,
    author: 'Zakir Hussain',
    fileName: 'Class_XII_IP065_Ch1_Pandas_Notes.pdf',
    fileSize: '2.6 MB',
    pageCount: 18,
    tags: ['Python', 'Pandas', 'Series', 'DataFrames', 'CBSE Class XII'],
    content: `# Chapter 1: Data Handling using Pandas - I
**Subject:** Informatics Practices (Code: 065) • Class XII
**Educator:** Zakir Hussain

---

### 1. Introduction to Python Pandas
**Pandas** is an open-source Python library used for high-performance data manipulation, exploratory data analysis, and relational data processing. Built on top of **NumPy**, Pandas provides two primary data structures:
1. **Series:** 1-Dimensional labeled array capable of holding any data type.
2. **DataFrame:** 2-Dimensional labeled data structure with columns of potentially different types (tabular structure).

---

### 2. Python Pandas Series
- **Creation:** \`pd.Series(data, index)\`
- **Data sources:** Python List, NumPy ndarray, Python Dictionary, or Scalar value.
- **Key Attributes:**
  - \`s.index\`: returns the sequence of indices.
  - \`s.values\`: returns the underlying ndarray.
  - \`s.dtype\`: data type of series values.
  - \`s.shape\`: tuple of series dimensions (n,).
  - \`s.size\`: total count of elements.
  - \`s.empty\`: boolean check whether series is empty.
  - \`s.hasnans\`: True if any NaN values exist.

---

### 3. Python Pandas DataFrame
- **Creation:** \`pd.DataFrame(data, index, columns)\`
- **Indexing & Slicing:**
  - \`.loc[row_label, col_label]\`: Label-based indexing.
  - \`.iloc[row_idx, col_idx]\`: Integer index-based positioning.
- **Operations:**
  - Adding a column: \`df['NewCol'] = value\`
  - Deleting a column: \`del df['Col']\` or \`df.drop('Col', axis=1)\`
  - Renaming columns: \`df.rename(columns={'old':'new'}, inplace=True)\``
  },

  {
    id: 'res-xii-ip-01-qa',
    title: 'Question Answers: Pandas Series vs DataFrame',
    description: 'CBSE board standard questions with exact code snippets and explanatory answers.',
    resourceType: 'qa',
    classLevel: 'XII',
    subjectId: 'ip-065',
    chapterId: 'ch-xii-ip-01',
    chapterTitle: 'Data Handling using Pandas - I',
    published: true,
    uploadedDate: '2026-03-21',
    order: 2,
    author: 'Zakir Hussain',
    tags: ['CBSE 12 IP', 'Solutions', 'Python Questions'],
    qaItems: [
      {
        id: 'ip-qa-01',
        question: 'Differentiate between a Pandas Series and a Pandas DataFrame based on dimensions and data mutability.',
        answer: '1) Dimensions: A Series is 1-Dimensional, whereas a DataFrame is 2-Dimensional. 2) Value Mutability: Both Series and DataFrame are value-mutable (data can be updated). 3) Size Mutability: A Series is size-immutable (length cannot change once created), whereas a DataFrame is size-mutable (columns/rows can be added or dropped).',
        marks: 2
      },
      {
        id: 'ip-qa-02',
        question: 'What is the difference between df.loc[] and df.iloc[] methods?',
        answer: 'df.loc[] uses explicit row and column labels/names to select elements, including both start and stop labels in slicing. df.iloc[] uses integer 0-based index positions, excluding the stop index in slicing just like standard Python ranges.',
        marks: 3
      }
    ]
  },

  {
    id: 'res-xii-ip-01-mcqs',
    title: 'Chapter 1 MCQ Practice: Pandas Series & DataFrames',
    description: 'High-frequency objective questions testing code output prediction and attribute knowledge.',
    resourceType: 'mcq',
    classLevel: 'XII',
    subjectId: 'ip-065',
    chapterId: 'ch-xii-ip-01',
    chapterTitle: 'Data Handling using Pandas - I',
    published: true,
    uploadedDate: '2026-03-22',
    order: 3,
    author: 'Zakir Hussain',
    tags: ['MCQs', 'Pandas Code', 'Output Questions'],
    mcqItems: [
      {
        id: 'ip-mcq-01',
        question: 'Which of the following is true regarding a Pandas Series?',
        options: ['It is 2-Dimensional', 'It is Size-Mutable', 'It is Value-Mutable but Size-Immutable', 'It cannot hold floating point numbers'],
        correctOptionIndex: 2,
        explanation: 'A Series is value-mutable (its values can change), but its size cannot be changed after creation.',
        marks: 1
      },
      {
        id: 'ip-mcq-02',
        question: 'What does the attribute df.shape return for a DataFrame with 10 rows and 4 columns?',
        options: ['14', '(10, 4)', '(4, 10)', '[10, 4]'],
        correctOptionIndex: 1,
        explanation: 'df.shape returns a tuple representing (number_of_rows, number_of_columns).',
        marks: 1
      }
    ]
  },

  {
    id: 'res-xii-ip-01-test',
    title: 'Online Chapter Test: Pandas Foundations (15 Marks)',
    description: 'Interactive timed assessment covering Series creation, indexing with loc/iloc, and DataFrame slicing.',
    resourceType: 'chapter_test',
    classLevel: 'XII',
    subjectId: 'ip-065',
    chapterId: 'ch-xii-ip-01',
    chapterTitle: 'Data Handling using Pandas - I',
    published: true,
    uploadedDate: '2026-03-24',
    order: 4,
    author: 'Zakir Hussain',
    testDurationMinutes: 15,
    totalMarks: 5,
    passingMarks: 2,
    testInstructions: 'Predict the code outputs accurately. Test autosaves your answers.',
    tags: ['Test', 'Class 12', 'Pandas'],
    mcqItems: [
      {
        id: 'tst-ip-01',
        question: 'Given import pandas as pd; s = pd.Series([10, 20, 30], index=[\'a\', \'b\', \'c\']). What is the output of s[\'b\']?',
        options: ['10', '20', '30', 'Error'],
        correctOptionIndex: 1,
        explanation: 'Index \'b\' points to value 20 in the Series.',
        marks: 1
      },
      {
        id: 'tst-ip-02',
        question: 'Which Pandas method is used to display the first 5 rows of a DataFrame?',
        options: ['df.first(5)', 'df.top(5)', 'df.head()', 'df.preview(5)'],
        correctOptionIndex: 2,
        explanation: 'df.head() displays the first n rows (default 5).',
        marks: 1
      }
    ]
  }
];
