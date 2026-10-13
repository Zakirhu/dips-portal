import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  Filter, 
  Search, 
  Bookmark, 
  BookmarkCheck, 
  Clock, 
  FileText, 
  Code, 
  HelpCircle, 
  Download, 
  Check, 
  Copy, 
  Play, 
  X, 
  ArrowRight,
  Printer,
  Sparkles,
  Share2,
  Highlighter,
  StickyNote as StickyNoteIcon,
  Plus,
  Upload,
  RefreshCw,
  FileType,
  ExternalLink,
  FileQuestion,
  Eye,
  EyeOff,
  Layers,
  Tag
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CLASSES_LIST, getSubjectsForClass, getChapters, SUBJECTS_LIST } from '../../data/curriculumData';
import { ClassLevel, SubjectId, StudyMaterial, MaterialType, Question, QuestionDifficulty, QuizConfig } from '../../types';
import { 
  AnnotationToolbar, 
  StickyNotesDrawer, 
  HighlightColor, 
  TextHighlight, 
  StickyNote, 
  COLOR_CLASSES 
} from '../DocumentAnnotations';
import { downloadChapterPDF } from '../../lib/pdfGenerator';
import { SEO } from '../SEO';
import { ChapterPdfUploader } from '../ChapterPdfUploader';
import { PdfMcqExtractorModal } from '../PdfMcqExtractorModal';
import { PYQPdfViewerModal } from '../PYQPdfViewerModal';
import { PYQPaper } from '../../types';

interface StudyMaterialViewProps {
  initialMaterialToOpen?: StudyMaterial | null;
  initialTab?: 'notes' | 'qbank' | 'generator' | 'extractor';
  onClearInitialMaterial?: () => void;
  onStartQuizWithChapter?: (classLevel: ClassLevel, subjectId: SubjectId, chapterId?: string) => void;
  onStartQuiz?: (quiz: QuizConfig) => void;
}

export const StudyMaterialView: React.FC<StudyMaterialViewProps> = ({
  initialMaterialToOpen,
  initialTab = 'notes',
  onClearInitialMaterial,
  onStartQuizWithChapter,
  onStartQuiz
}) => {
  const { 
    studyMaterials, 
    questionBank,
    pyqPapers,
    selectedClassFilter, 
    setSelectedClassFilter, 
    studentProfile, 
    toggleBookmark,
    toggleQuestionBookmark,
    syncAllCurriculumMaterials,
    userRole,
    customChapters
  } = useApp();

  // Sub-tab state: 'notes' | 'qbank' | 'generator' | 'extractor'
  const [activeSubTab, setActiveSubTab] = useState<'notes' | 'qbank' | 'generator' | 'extractor'>(initialTab);

  const [activeClass, setActiveClass] = useState<ClassLevel | 'ALL'>(selectedClassFilter);
  const [activeSubject, setActiveSubject] = useState<SubjectId | 'ALL'>('ALL');
  const [activeChapter, setActiveChapter] = useState<string>('ALL');
  const [activeType, setActiveType] = useState<MaterialType | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedPyqPaper, setSelectedPyqPaper] = useState<PYQPaper | null>(null);

  // Question Bank Specific States
  const [activeDifficulty, setActiveDifficulty] = useState<'all' | QuestionDifficulty>('all');
  const [showOnlyBookmarkedQuestions, setShowOnlyBookmarkedQuestions] = useState(false);
  const [revealedAnswers, setRevealedAnswers] = useState<Record<string, boolean>>({});
  const [showAllAnswers, setShowAllAnswers] = useState(false);
  const [copiedQuestionId, setCopiedQuestionId] = useState<string | null>(null);

  // Question Paper Generator State
  const [paperTitle, setPaperTitle] = useState('CBSE Mid-Term Examination 2026');
  const [paperClass, setPaperClass] = useState<ClassLevel>('X');
  const [paperSubject, setPaperSubject] = useState<SubjectId>('it-402');
  const [paperCount, setPaperCount] = useState<number>(5);
  const [paperTimeMins, setPaperTimeMins] = useState<number>(30);
  const [generatedPaperQuestions, setGeneratedPaperQuestions] = useState<Question[] | null>(null);

  // AI PDF MCQ Extractor State
  const [showPdfExtractor, setShowPdfExtractor] = useState(false);

  // Reader Modal State
  const [activeReaderMaterial, setActiveReaderMaterial] = useState<StudyMaterial | null>(
    initialMaterialToOpen || null
  );
  const [copiedCode, setCopiedCode] = useState(false);
  const [codeRunOutputVisible, setCodeRunOutputVisible] = useState(false);
  const [showShareNotification, setShowShareNotification] = useState(false);

  // Annotation States
  const [highlights, setHighlights] = useState<Record<string, TextHighlight[]>>(() => {
    try {
      const saved = localStorage.getItem('learn_zakir_highlights');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [stickyNotes, setStickyNotes] = useState<Record<string, StickyNote[]>>(() => {
    try {
      const saved = localStorage.getItem('learn_zakir_stickynotes');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [activeHighlightColor, setActiveHighlightColor] = useState<HighlightColor>('yellow');
  const [isHighlightMode, setIsHighlightMode] = useState<boolean>(false);
  const [isNotesDrawerOpen, setIsNotesDrawerOpen] = useState<boolean>(false);

  React.useEffect(() => {
    if (initialTab) {
      setActiveSubTab(initialTab);
    }
  }, [initialTab]);

  React.useEffect(() => {
    try {
      localStorage.setItem('learn_zakir_highlights', JSON.stringify(highlights));
    } catch {}
  }, [highlights]);

  React.useEffect(() => {
    try {
      localStorage.setItem('learn_zakir_stickynotes', JSON.stringify(stickyNotes));
    } catch {}
  }, [stickyNotes]);

  const currentHighlights = useMemo(() => {
    if (!activeReaderMaterial) return [];
    return highlights[activeReaderMaterial.id] || [];
  }, [activeReaderMaterial, highlights]);

  const currentStickyNotes = useMemo(() => {
    if (!activeReaderMaterial) return [];
    return stickyNotes[activeReaderMaterial.id] || [];
  }, [activeReaderMaterial, stickyNotes]);

  const toggleHighlightLine = (paragraphIndex: number, lineText: string) => {
    if (!activeReaderMaterial) return;
    const matId = activeReaderMaterial.id;
    const existing = (highlights[matId] || []).find(h => h.paragraphIndex === paragraphIndex);

    setHighlights(prev => {
      const list = prev[matId] || [];
      if (existing) {
        return {
          ...prev,
          [matId]: list.filter(h => h.paragraphIndex !== paragraphIndex)
        };
      } else {
        const newHighlight: TextHighlight = {
          id: `hl-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          materialId: matId,
          text: lineText,
          color: activeHighlightColor,
          createdAt: new Date().toLocaleDateString(),
          paragraphIndex
        };
        return {
          ...prev,
          [matId]: [...list, newHighlight]
        };
      }
    });
  };

  // Synchronize if prop changes
  React.useEffect(() => {
    if (initialMaterialToOpen) {
      setActiveReaderMaterial(initialMaterialToOpen);
      setActiveSubTab('notes');
    }
  }, [initialMaterialToOpen]);

  // Synchronize class filter with global state
  React.useEffect(() => {
    if (selectedClassFilter !== 'ALL') {
      setActiveClass(selectedClassFilter);
    }
  }, [selectedClassFilter]);

  // Available subjects for currently active class
  const availableSubjects = useMemo(() => {
    if (activeClass === 'ALL') return SUBJECTS_LIST;
    return getSubjectsForClass(activeClass);
  }, [activeClass]);

  // Available chapters based on class and subject
  const availableChapters = useMemo(() => {
    if (activeClass === 'ALL' || activeSubject === 'ALL') return [];
    return getChapters(activeClass, activeSubject, customChapters);
  }, [activeClass, activeSubject, customChapters]);

  // Unified study materials + Previous Year Question Papers (PYQs)
  const combinedMaterials = useMemo(() => {
    const pyqAsMaterials: StudyMaterial[] = (pyqPapers || []).map(p => ({
      id: `pyq-mat-${p.id}`,
      classLevel: p.classLevel,
      subjectId: p.subjectId,
      chapterId: 'pyq-board-exam',
      chapterTitle: `${p.year} Board Exam Paper`,
      title: `CBSE Board Examination Paper (${p.year}) — ${p.code}`,
      type: 'previous_year_paper' as MaterialType,
      description: `${p.examType} for Class ${p.classLevel} ${p.subjectName} (${p.code}). ${p.questionsSummary}. Official question paper with model answers and step-by-step marking schemes.`,
      readTimeMinutes: (p.timeHours || 2) * 60,
      uploadedDate: p.uploadedAt || `${p.year}-03-25`,
      author: 'CBSE Examination Board',
      content: `# CBSE Class ${p.classLevel} ${p.subjectName} (${p.code}) — Board Exam Paper ${p.year}\n\n**Examination:** ${p.examType}\n**Total Marks:** ${p.totalMarks}\n**Time Allowed:** ${p.timeHours} Hours\n\n### General Examination Instructions\n1. Section A: Objective & Multiple Choice Questions (1 Mark each)\n2. Section B: Subjective, Conceptual & Practical Coding Questions\n\n### Official Questions & Model Answers\n\n` + (p.sampleQuestions || []).map(q => `#### ${q.qNumber} [${q.marks} Mark${q.marks > 1 ? 's' : ''}]\n${q.question}\n\n**Official Model Answer:**\n${q.officialAnswer}\n\n*Examiner Step-Marking Scheme: ${q.stepMarkingScheme}*\n`).join('\n---\n'),
      downloadableFileName: p.fileName || `CBSE_Class_${p.classLevel}_${p.code}_${p.year}.pdf`,
      pdfDataUrl: p.pdfDataUrl,
      fileSize: p.fileSize || '1.4 MB',
      tags: ['Previous Year Paper', 'PYQ', p.year, p.code, `Class ${p.classLevel}`],
      sourceUrl: undefined
    }));

    return [...studyMaterials, ...pyqAsMaterials];
  }, [studyMaterials, pyqPapers]);

  // Filtered study materials (Notes, PYQs & PDFs)
  const filteredMaterials = useMemo(() => {
    return combinedMaterials.filter(mat => {
      if (activeClass !== 'ALL' && mat.classLevel !== activeClass) return false;
      if (activeSubject !== 'ALL' && mat.subjectId !== activeSubject) return false;
      if (activeChapter !== 'ALL' && mat.chapterId !== activeChapter && mat.type !== 'previous_year_paper') return false;
      if (activeType !== 'ALL' && mat.type !== activeType) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = mat.title.toLowerCase().includes(q);
        const matchesDesc = mat.description.toLowerCase().includes(q);
        const matchesChapter = mat.chapterTitle.toLowerCase().includes(q);
        const matchesTag = mat.tags.some(t => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDesc && !matchesChapter && !matchesTag) return false;
      }
      return true;
    });
  }, [combinedMaterials, activeClass, activeSubject, activeChapter, activeType, searchQuery]);

  // Filtered Questions (Question Bank)
  const filteredQuestions = useMemo(() => {
    return questionBank.filter(q => {
      if (activeClass !== 'ALL' && q.classLevel !== activeClass) return false;
      if (activeSubject !== 'ALL' && q.subjectId !== activeSubject) return false;
      if (activeChapter !== 'ALL' && q.chapterId !== activeChapter) return false;
      if (activeDifficulty !== 'all' && q.difficulty !== activeDifficulty) return false;
      if (showOnlyBookmarkedQuestions && !(studentProfile.bookmarkedQuestions || []).includes(q.id)) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesQ = q.question.toLowerCase().includes(query);
        const matchesCh = q.chapterTitle.toLowerCase().includes(query);
        const matchesOpt = q.options.some(o => o.toLowerCase().includes(query));
        const matchesExp = q.explanation.toLowerCase().includes(query);
        if (!matchesQ && !matchesCh && !matchesOpt && !matchesExp) return false;
      }
      return true;
    });
  }, [questionBank, activeClass, activeSubject, activeChapter, activeDifficulty, searchQuery, showOnlyBookmarkedQuestions, studentProfile.bookmarkedQuestions]);

  const toggleAnswer = (id: string) => {
    setRevealedAnswers(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyQuestion = (q: Question) => {
    const text = `Q: ${q.question}\nA) ${q.options[0]}\nB) ${q.options[1]}\nC) ${q.options[2]}\nD) ${q.options[3]}\nCorrect Answer: ${String.fromCharCode(65 + q.correctOptionIndex)} - ${q.options[q.correctOptionIndex]}\nExplanation: ${q.explanation}`;
    navigator.clipboard.writeText(text);
    setCopiedQuestionId(q.id);
    setTimeout(() => setCopiedQuestionId(null), 2000);
  };

  const handleGeneratePaper = () => {
    const eligible = questionBank.filter(q => q.classLevel === paperClass && q.subjectId === paperSubject);
    const pool = eligible.length > 0 ? eligible : questionBank.filter(q => q.classLevel === paperClass);
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    setGeneratedPaperQuestions(shuffled.slice(0, Math.min(paperCount, shuffled.length)));
  };

  const getTypeBadge = (type: MaterialType) => {
    switch (type) {
      case 'previous_year_paper':
        return { label: 'Previous Year Paper (PYQ)', color: 'bg-rose-50 text-rose-700 border-rose-200' };
      case 'notes':
        return { label: 'Chapter Notes', color: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'practical_file':
        return { label: 'Practical Lab File', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'important_questions':
        return { label: 'Important Q&A', color: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'cheat_sheet':
        return { label: 'Cheat Sheet', color: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'video':
        return { label: 'Video Lecture', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      default:
        return { label: 'Study Document', color: 'bg-slate-50 text-slate-700 border-slate-200' };
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <SEO
        title={
          activeReaderMaterial 
            ? `${activeReaderMaterial.title} (Class ${activeReaderMaterial.classLevel})`
            : activeSubTab === 'qbank'
              ? 'Question Bank & MCQs'
              : activeClass !== 'ALL' 
                ? `Class ${activeClass} Study Materials & Chapter Notes`
                : 'Study Material & Question Bank'
        }
        description={
          activeReaderMaterial 
            ? activeReaderMaterial.description 
            : 'Access comprehensive chapter notes, PDF notes, question bank MCQs, and custom test paper generation.'
        }
        keywords={['Study Material', 'Question Bank', 'Chapter Notes', 'CBSE MCQs', 'IT 402', 'IP 065', 'Zakir Hussain']}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
            <BookOpen className="w-4 h-4" />
            <span>Integrated CBSE Learning & Assessment Center</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">
            Study Material & Question Bank
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Access chapter notes, PDF textbooks, curated board-pattern MCQs, printable exam paper generator, and AI PDF MCQ extractor.
          </p>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsUploadModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Chapter PDF</span>
          </button>

          <button
            type="button"
            onClick={() => setShowPdfExtractor(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Extract MCQs from PDF</span>
          </button>

          <button
            type="button"
            onClick={() => syncAllCurriculumMaterials()}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all cursor-pointer"
            title="Reload/Sync all Information Technology chapters"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Sync Chapters</span>
          </button>
        </div>
      </div>

      {/* Sub-Nav Tabs Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/80">
        <div className="flex flex-wrap items-center gap-1">
          <button
            onClick={() => setActiveSubTab('notes')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'notes'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span>Chapter Notes & PDFs ({filteredMaterials.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('qbank')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'qbank'
                ? 'bg-white text-purple-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <FileQuestion className="w-4 h-4 text-purple-600" />
            <span>Question Bank & Board MCQs ({filteredQuestions.length})</span>
          </button>

          <button
            onClick={() => {
              handleGeneratePaper();
              setActiveSubTab('generator');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'generator'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Printer className="w-4 h-4 text-emerald-600" />
            <span>Paper Generator</span>
          </button>
        </div>

        <div className="relative w-full sm:w-64 px-1 pb-1 sm:p-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={activeSubTab === 'qbank' ? "Search MCQs & options..." : "Search chapters & notes..."}
            className="w-full pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-blue-500"
          />
        </div>
      </div>

      {/* Shared Filter Pipeline: Class -> Subject -> Chapter */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        {/* 1. Class Selector */}
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
            1. Select Class (VI–XII)
          </label>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => {
                setActiveClass('ALL');
                setSelectedClassFilter('ALL');
                setActiveSubject('ALL');
                setActiveChapter('ALL');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeClass === 'ALL'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              All Classes
            </button>
            {CLASSES_LIST.map(c => (
              <button
                key={c.level}
                onClick={() => {
                  setActiveClass(c.level as ClassLevel);
                  setSelectedClassFilter(c.level as ClassLevel);
                  setActiveSubject('ALL');
                  setActiveChapter('ALL');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeClass === c.level
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Subject Selector */}
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
            2. Select Subject
          </label>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => {
                setActiveSubject('ALL');
                setActiveChapter('ALL');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeSubject === 'ALL'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              All Subjects
            </button>
            {availableSubjects.map(sub => (
              <button
                key={sub.id}
                onClick={() => {
                  setActiveSubject(sub.id);
                  setActiveChapter('ALL');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeSubject === sub.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {sub.name} ({sub.code})
              </button>
            ))}
          </div>
        </div>

        {/* 3. Chapter Selector */}
        {availableChapters.length > 0 && (
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
              3. Select Chapter
            </label>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setActiveChapter('ALL')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer ${
                  activeChapter === 'ALL'
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                All Chapters ({availableChapters.length})
              </button>
              {availableChapters.map(ch => (
                <button
                  key={ch.id}
                  onClick={() => setActiveChapter(ch.id)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer ${
                    activeChapter === ch.id
                      ? 'bg-slate-800 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  Ch {ch.chapterNumber}: {ch.title}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Format or Difficulty Filters depending on sub-tab */}
        {activeSubTab === 'notes' && (
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Format:</span>
            {(['ALL', 'notes', 'previous_year_paper', 'important_questions', 'practical_file', 'cheat_sheet'] as (MaterialType | 'ALL')[]).map(t => (
              <button
                key={t}
                onClick={() => setActiveType(t)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeType === t
                    ? 'bg-slate-900 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 bg-slate-50 border border-slate-200/70'
                }`}
              >
                {t === 'ALL'
                  ? 'All Formats'
                  : t === 'previous_year_paper'
                    ? 'Previous Year Paper'
                    : t === 'notes'
                      ? 'Chapter Notes (PDF)'
                      : t.replace(/_/g, ' ').toUpperCase()}
              </button>
            ))}
          </div>
        )}

        {activeSubTab === 'qbank' && (
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Difficulty:</span>
              {(['all', 'easy', 'medium', 'hard'] as ('all' | QuestionDifficulty)[]).map(d => (
                <button
                  key={d}
                  onClick={() => setActiveDifficulty(d)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer uppercase ${
                    activeDifficulty === d
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowOnlyBookmarkedQuestions(!showOnlyBookmarkedQuestions)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  showOnlyBookmarkedQuestions
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${showOnlyBookmarkedQuestions ? 'fill-white' : ''}`} />
                <span>Bookmarked ({studentProfile.bookmarkedQuestions?.length || 0})</span>
              </button>

              <button
                onClick={() => setShowAllAnswers(!showAllAnswers)}
                className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer"
              >
                {showAllAnswers ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showAllAnswers ? 'Hide Answers' : 'Reveal Answers'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* SUB-TAB CONTENT 1: CHAPTER NOTES & PDF MATERIALS */}
      {activeSubTab === 'notes' && (
        <div>
          {/* Featured: Manual PDF MCQ Extractor Callout */}
          <div className="mb-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-2xl p-5 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm border border-slate-800">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-400/30 flex items-center justify-center font-bold shrink-0">
                <Sparkles className="w-5 h-5 text-purple-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">Manual PDF MCQ Extractor & Quiz Generator</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-200 border border-purple-400/30">
                    Instant Quiz Mode
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5 max-w-xl">
                  Upload any question paper, revision notes, or chapter PDF manually. Extract multiple-choice questions with answer keys and launch an interactive quiz instantly.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowPdfExtractor(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20 cursor-pointer shrink-0"
            >
              <Upload className="w-4 h-4" />
              <span>Upload PDF & Start Quiz</span>
            </button>
          </div>

          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Showing {filteredMaterials.length} Study Package{filteredMaterials.length === 1 ? '' : 's'}
            </span>
            {studentProfile.bookmarks.length > 0 && (
              <span className="text-xs text-blue-600 font-medium">
                ★ {studentProfile.bookmarks.length} Bookmarked Material{studentProfile.bookmarks.length === 1 ? '' : 's'}
              </span>
            )}
          </div>

          {filteredMaterials.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
              <BookOpen className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <h3 className="text-base font-bold text-slate-800">No study materials found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No content matched the current filters. Try changing your class, subject or search keywords.
              </p>
              <button
                onClick={() => {
                  setActiveClass('ALL');
                  setActiveSubject('ALL');
                  setActiveChapter('ALL');
                  setActiveType('ALL');
                  setSearchQuery('');
                }}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMaterials.map(mat => {
                const isBookmarked = studentProfile.bookmarks.includes(mat.id);
                const badge = getTypeBadge(mat.type);

                return (
                  <div
                    key={mat.id}
                    className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between overflow-hidden group"
                  >
                    <div className="p-5">
                      {/* Top Tag Row */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 text-[11px] font-bold bg-blue-100 text-blue-800 rounded">
                            Class {mat.classLevel}
                          </span>
                          <span className={`px-2 py-0.5 text-[10px] font-semibold rounded border ${badge.color}`}>
                            {badge.label}
                          </span>
                        </div>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            toggleBookmark(mat.id);
                          }}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            isBookmarked ? 'text-amber-500 bg-amber-50' : 'text-slate-400 hover:text-slate-600'
                          }`}
                          title={isBookmarked ? 'Remove bookmark' : 'Bookmark this note'}
                        >
                          {isBookmarked ? <BookmarkCheck className="w-4 h-4 fill-amber-500" /> : <Bookmark className="w-4 h-4" />}
                        </button>
                      </div>

                      <h3 
                        onClick={() => setActiveReaderMaterial(mat)}
                        className="font-bold text-slate-900 text-base mb-1.5 group-hover:text-blue-600 cursor-pointer transition-colors"
                      >
                        {mat.title}
                      </h3>
                      <p className="text-xs font-semibold text-blue-600 mb-2">
                        {mat.chapterTitle}
                      </p>
                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 mb-4">
                        {mat.description}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mb-2">
                        {mat.tags.map(t => (
                          <span key={t} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Card Action footer */}
                    <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs gap-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadChapterPDF(mat);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold border border-emerald-200 transition-colors cursor-pointer shadow-2xs"
                          title={`Download ${mat.downloadableFileName || 'PDF Document'}`}
                        >
                          <Download className="w-3.5 h-3.5 text-emerald-600" />
                          <span>PDF</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowPdfExtractor(true);
                          }}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold border border-purple-200 transition-colors cursor-pointer"
                          title="Extract MCQs and create quiz from this document"
                        >
                          <Sparkles className="w-3 h-3 text-purple-600" />
                          <span>Extract Quiz</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const pyqMatch = pyqPapers.find(p => `pyq-mat-${p.id}` === mat.id || p.id === mat.id);
                          if (pyqMatch) {
                            setSelectedPyqPaper(pyqMatch);
                          } else {
                            setActiveReaderMaterial(mat);
                          }
                        }}
                        className="flex items-center gap-1 font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
                      >
                        <span>{mat.type === 'previous_year_paper' ? 'View Paper' : 'Read Notes'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB CONTENT 2: QUESTION BANK & MCQs */}
      {activeSubTab === 'qbank' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Showing {filteredQuestions.length} Questions
            </span>
          </div>

          {filteredQuestions.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
              <FileQuestion className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <h3 className="text-base font-bold text-slate-800">No questions found</h3>
              <p className="text-xs text-slate-500 mt-1">Try resetting your filters or search keywords.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredQuestions.map((q, idx) => {
                const isRevealed = showAllAnswers || !!revealedAnswers[q.id];

                return (
                  <div
                    key={q.id}
                    className="p-6 bg-white rounded-2xl border border-slate-200/90 shadow-xs space-y-4 hover:border-slate-300 transition-all"
                  >
                    {/* Question Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-700 font-bold text-xs flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-800 rounded">
                          Class {q.classLevel}
                        </span>
                        <span className="text-xs font-semibold text-slate-600">
                          {q.chapterTitle}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                          {q.difficulty}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-xs text-slate-500 font-semibold mr-1">
                          {q.marks} Mark{q.marks === 1 ? '' : 's'}
                        </span>
                        {(() => {
                          const isBookmarked = (studentProfile.bookmarkedQuestions || []).includes(q.id);
                          return (
                            <button
                              onClick={() => toggleQuestionBookmark(q.id)}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                isBookmarked
                                  ? 'text-amber-500 bg-amber-50 hover:bg-amber-100'
                                  : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                              }`}
                              title={isBookmarked ? 'Remove bookmark' : 'Bookmark this question for revision'}
                            >
                              {isBookmarked ? (
                                <BookmarkCheck className="w-4 h-4 fill-amber-500 text-amber-600" />
                              ) : (
                                <Bookmark className="w-4 h-4" />
                              )}
                            </button>
                          );
                        })()}
                        <button
                          onClick={() => handleCopyQuestion(q)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Copy question text"
                        >
                          {copiedQuestionId === q.id ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Question Text */}
                    <p className="font-semibold text-slate-900 text-base leading-relaxed">
                      {q.question}
                    </p>

                    {/* 4 Options Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {q.options.map((opt, optIdx) => {
                        const isCorrect = q.correctOptionIndex === optIdx;
                        return (
                          <div
                            key={optIdx}
                            className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 transition-colors ${
                              isRevealed && isCorrect
                                ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-semibold'
                                : 'bg-slate-50 border-slate-200/80 text-slate-700'
                            }`}
                          >
                            <span className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[11px] ${
                              isRevealed && isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                            }`}>
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span className="flex-1">{opt}</span>
                            {isRevealed && isCorrect && (
                              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Answer Reveal Toggle & Explanation */}
                    <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <button
                        onClick={() => toggleAnswer(q.id)}
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer self-start sm:self-auto"
                      >
                        {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        <span>{isRevealed ? 'Hide Answer & Explanation' : 'Show Answer & Concept Explanation'}</span>
                      </button>

                      {onStartQuizWithChapter && (
                        <button
                          onClick={() => onStartQuizWithChapter(q.classLevel, q.subjectId, q.chapterId)}
                          className="px-3 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-semibold text-[11px] rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Play className="w-3 h-3 fill-purple-600 text-purple-600" />
                          <span>Practice Test for this Chapter</span>
                        </button>
                      )}
                    </div>

                    {isRevealed && (
                      <div className="p-3.5 bg-purple-50/70 border border-purple-200/80 rounded-xl text-xs space-y-1 animate-in fade-in duration-200">
                        <p className="font-bold text-purple-950 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                          <span>Correct Answer: Option {String.fromCharCode(65 + q.correctOptionIndex)} ({q.options[q.correctOptionIndex]})</span>
                        </p>
                        <p className="text-purple-900 leading-relaxed pl-5">
                          {q.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB CONTENT 3: QUESTION PAPER GENERATOR */}
      {activeSubTab === 'generator' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div>
              <h2 className="text-xl font-bold text-slate-900">CBSE Printable Exam Paper Generator</h2>
              <p className="text-xs text-slate-500 mt-1">Configure class, subject, and question count to create a formatted test paper ready to print or save as PDF.</p>
            </div>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Test Paper</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Paper Title</label>
              <input
                type="text"
                value={paperTitle}
                onChange={e => setPaperTitle(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Class Level</label>
              <select
                value={paperClass}
                onChange={e => setPaperClass(e.target.value as ClassLevel)}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
              >
                {CLASSES_LIST.map(c => (
                  <option key={c.level} value={c.level}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Subject</label>
              <select
                value={paperSubject}
                onChange={e => setPaperSubject(e.target.value as SubjectId)}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
              >
                {getSubjectsForClass(paperClass).map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Question Count</label>
              <select
                value={paperCount}
                onChange={e => setPaperCount(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
              >
                <option value={5}>5 Questions</option>
                <option value={10}>10 Questions</option>
                <option value={15}>15 Questions</option>
                <option value={20}>20 Questions</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleGeneratePaper}
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Generate / Regenerate Paper</span>
            </button>
          </div>

          {/* Paper View Container */}
          {generatedPaperQuestions && (
            <div className="p-8 bg-white border border-slate-300 rounded-2xl space-y-6 shadow-sm print:border-none print:shadow-none">
              <div className="text-center border-b-2 border-slate-900 pb-4 space-y-1">
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-wide">{paperTitle}</h2>
                <div className="flex justify-between text-xs font-bold text-slate-700 pt-2">
                  <span>CLASS: {paperClass}</span>
                  <span>SUBJECT CODE: {paperSubject.toUpperCase()}</span>
                  <span>TIME ALLOWED: {paperTimeMins} MINS</span>
                  <span>MAX MARKS: {generatedPaperQuestions.reduce((acc, q) => acc + q.marks, 0)}</span>
                </div>
              </div>

              <div className="space-y-6">
                {generatedPaperQuestions.map((q, idx) => (
                  <div key={q.id} className="space-y-2">
                    <div className="flex items-start justify-between">
                      <p className="font-bold text-slate-900 text-sm">
                        Q{idx + 1}. {q.question}
                      </p>
                      <span className="text-xs font-semibold text-slate-500">[{q.marks} Mark]</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pl-4 text-xs text-slate-800">
                      {q.options.map((opt, oIdx) => (
                        <p key={oIdx}>({String.fromCharCode(97 + oIdx)}) {opt}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Interactive Document Reader Modal */}
      {activeReaderMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
          <div className={`relative w-full ${isNotesDrawerOpen ? 'max-w-6xl' : 'max-w-4xl'} bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[92vh] transition-all`}>
            {/* Modal Top Bar */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white shrink-0">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-blue-500 text-white uppercase tracking-wider">
                  Class {activeReaderMaterial.classLevel}
                </span>
                <div>
                  <h2 className="font-bold text-base text-white truncate max-w-md sm:max-w-xl">
                    {activeReaderMaterial.title}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {activeReaderMaterial.chapterTitle}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => downloadChapterPDF(activeReaderMaterial)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Download PDF"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">PDF</span>
                </button>

                <button
                  onClick={() => setActiveReaderMaterial(null)}
                  className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Toolbar row */}
            <div className="px-6 py-2.5 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsHighlightMode(!isHighlightMode)}
                  className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    isHighlightMode ? 'bg-amber-500 text-white' : 'bg-white text-slate-700 border border-slate-200'
                  }`}
                >
                  <Highlighter className="w-3.5 h-3.5" />
                  <span>{isHighlightMode ? 'Highlighting Active' : 'Highlight Tool'}</span>
                </button>

                <button
                  onClick={() => setIsNotesDrawerOpen(!isNotesDrawerOpen)}
                  className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    isNotesDrawerOpen ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700 border border-slate-200'
                  }`}
                >
                  <StickyNoteIcon className="w-3.5 h-3.5" />
                  <span>Sticky Notes ({currentStickyNotes.length})</span>
                </button>

                <button
                  onClick={() => {
                    const mat = activeReaderMaterial;
                    setActiveReaderMaterial(null);
                    if (mat) {
                      setActiveSubTab('qbank');
                      setActiveClass(mat.classLevel);
                      setActiveSubject(mat.subjectId);
                      setActiveChapter(mat.chapterId);
                    }
                  }}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <FileQuestion className="w-3.5 h-3.5" />
                  <span>Practice Chapter MCQs</span>
                </button>
              </div>

              <div className="flex items-center gap-2 text-slate-500 text-xs">
                <span>Reading Time: ~{(activeReaderMaterial as any).estimatedReadTimeMinutes || 10} mins</span>
              </div>
            </div>

            {/* Document Content Body */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
              <div className="prose max-w-none space-y-4">
                <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r-xl text-xs text-blue-900 leading-relaxed">
                  <p className="font-bold text-sm mb-1">Chapter Overview & Core Concepts</p>
                  <p>{activeReaderMaterial.description}</p>
                </div>

                {/* Main Text Content */}
                <div className="text-sm text-slate-800 leading-relaxed space-y-4 font-sans">
                  {activeReaderMaterial.content.split('\n\n').map((paragraph, pIdx) => {
                    const isHighlighted = currentHighlights.some(h => h.paragraphIndex === pIdx);
                    
                    return (
                      <div key={pIdx} className="relative group">
                        <p
                          onClick={() => {
                            if (isHighlightMode) {
                              toggleHighlightLine(pIdx, paragraph);
                            }
                          }}
                          className={`p-2.5 rounded-lg transition-colors ${
                            isHighlighted ? 'bg-amber-100/80 border-l-4 border-amber-500 font-medium' : ''
                          } ${isHighlightMode ? 'cursor-pointer hover:bg-amber-50/60' : ''}`}
                        >
                          {paragraph}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chapter PDF Uploader Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 p-6">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-lg">Upload Chapter PDF & Notes</h3>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <ChapterPdfUploader
              onSuccess={() => setIsUploadModalOpen(false)}
            />
          </div>
        </div>
      )}

      {/* AI PDF MCQ Extractor Modal */}
      {showPdfExtractor && (
        <PdfMcqExtractorModal
          isOpen={showPdfExtractor}
          onClose={() => setShowPdfExtractor(false)}
          defaultClass={activeClass !== 'ALL' ? activeClass : 'X'}
          defaultSubject={activeSubject !== 'ALL' ? activeSubject : 'it-402'}
          onStartQuizWithExtracted={(quiz) => {
            setShowPdfExtractor(false);
            if (onStartQuiz) {
              onStartQuiz(quiz);
            }
          }}
        />
      )}

      {/* PYQ Paper Viewer Modal */}
      {selectedPyqPaper && (
        <PYQPdfViewerModal
          paper={selectedPyqPaper}
          onClose={() => setSelectedPyqPaper(null)}
        />
      )}
    </div>
  );
};
