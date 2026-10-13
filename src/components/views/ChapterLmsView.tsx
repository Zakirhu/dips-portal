import React, { useState, useMemo } from 'react';
import { 
  Layers, 
  BookOpen, 
  FileText, 
  HelpCircle, 
  Award, 
  Code, 
  RotateCcw, 
  CheckCircle2, 
  Download, 
  Eye, 
  Search, 
  Filter, 
  Plus, 
  ArrowUp, 
  ArrowDown, 
  Edit3, 
  Trash2, 
  Upload, 
  Clock, 
  Calendar, 
  User, 
  Sparkles, 
  ChevronRight, 
  ChevronDown, 
  ShieldCheck, 
  AlertTriangle,
  Play,
  FileCheck,
  Check,
  X,
  Lock,
  Unlock,
  GraduationCap
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { 
  ClassLevel, 
  SubjectId, 
  Chapter, 
  LearningResource, 
  ChapterResourceType 
} from '../../types';
import { getSubjectsForClass, getChapters } from '../../data/curriculumData';
import { LmsPdfViewerModal } from '../lms/LmsPdfViewerModal';
import { LmsMcqRunnerModal } from '../lms/LmsMcqRunnerModal';
import { LmsChapterTestModal } from '../lms/LmsChapterTestModal';
import { LmsQaViewerModal } from '../lms/LmsQaViewerModal';
import { LmsResourceFormModal } from '../lms/LmsResourceFormModal';
import { KineticHeading } from '../motion/KineticText';
import { FadeIn } from '../motion/MotionFade';

interface ChapterLmsViewProps {
  initialClass?: ClassLevel;
  initialSubject?: SubjectId;
  initialChapterId?: string;
  onNavigateHome?: () => void;
}

export const ChapterLmsView: React.FC<ChapterLmsViewProps> = ({
  initialClass = 'X',
  initialSubject = 'it-402',
  initialChapterId,
  onNavigateHome
}) => {
  const {
    customClasses,
    customSubjects,
    customChapters,
    learningResources,
    reorderLearningResources,
    togglePublishLearningResource,
    deleteLearningResource,
    userRole,
    isAuthenticated
  } = useApp();

  const isAdmin = userRole === 'admin';

  // State: Navigation Hierarchy (Class → Subject → Chapter)
  const [selectedClass, setSelectedClass] = useState<ClassLevel>(initialClass);
  const [selectedSubject, setSelectedSubject] = useState<SubjectId>(initialSubject);
  const [selectedChapterId, setSelectedChapterId] = useState<string>(initialChapterId || '');

  // Search & Type Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTypeFilter, setActiveTypeFilter] = useState<ChapterResourceType | 'ALL'>('ALL');

  // Modals state
  const [pdfResourceToView, setPdfResourceToView] = useState<LearningResource | null>(null);
  const [mcqResourceToRun, setMcqResourceToRun] = useState<LearningResource | null>(null);
  const [testResourceToRun, setTestResourceToRun] = useState<LearningResource | null>(null);
  const [qaResourceToView, setQaResourceToView] = useState<LearningResource | null>(null);

  // Admin Resource Form Modal state
  const [isResourceFormOpen, setIsResourceFormOpen] = useState<boolean>(false);
  const [resourceToEdit, setResourceToEdit] = useState<LearningResource | null>(null);
  const [isReplaceMode, setIsReplaceMode] = useState<boolean>(false);

  // Delete confirmation
  const [resourceToDelete, setResourceToDelete] = useState<LearningResource | null>(null);

  // 1. Get subjects available for selected class
  const availableSubjects = useMemo(() => {
    return getSubjectsForClass(selectedClass, customSubjects);
  }, [selectedClass, customSubjects]);

  // Ensure selectedSubject is valid for current class
  React.useEffect(() => {
    if (availableSubjects.length > 0 && !availableSubjects.some(s => s.id === selectedSubject)) {
      setSelectedSubject(availableSubjects[0].id);
    }
  }, [availableSubjects, selectedSubject]);

  // 2. Get chapters available for selected class & subject
  const availableChapters = useMemo(() => {
    return getChapters(selectedClass, selectedSubject, customChapters);
  }, [selectedClass, selectedSubject, customChapters]);

  // Ensure selectedChapterId is valid
  React.useEffect(() => {
    if (availableChapters.length > 0) {
      if (!selectedChapterId || !availableChapters.some(c => c.id === selectedChapterId)) {
        setSelectedChapterId(availableChapters[0].id);
      }
    } else {
      setSelectedChapterId('');
    }
  }, [availableChapters, selectedChapterId]);

  const currentChapter = availableChapters.find(c => c.id === selectedChapterId);
  const currentSubject = availableSubjects.find(s => s.id === selectedSubject);

  // 3. Filter resources for current chapter
  const chapterResources = useMemo(() => {
    if (!selectedChapterId) return [];
    return learningResources
      .filter(res => {
        if (res.chapterId !== selectedChapterId) return false;
        // Non-admin only sees published resources
        if (!isAdmin && !res.published) return false;
        // Type filter
        if (activeTypeFilter !== 'ALL' && res.resourceType !== activeTypeFilter) return false;
        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = res.title.toLowerCase().includes(q);
          const matchesDesc = res.description.toLowerCase().includes(q);
          const matchesContent = res.content?.toLowerCase().includes(q) ?? false;
          const matchesTags = res.tags?.some(t => t.toLowerCase().includes(q)) ?? false;
          if (!matchesTitle && !matchesDesc && !matchesContent && !matchesTags) return false;
        }
        return true;
      })
      .sort((a, b) => a.order - b.order);
  }, [selectedChapterId, learningResources, isAdmin, activeTypeFilter, searchQuery]);

  // Counts by type for badge display in current chapter
  const countsByType = useMemo(() => {
    const counts: Record<string, number> = { ALL: 0 };
    learningResources
      .filter(r => r.chapterId === selectedChapterId && (isAdmin || r.published))
      .forEach(r => {
        counts.ALL = (counts.ALL || 0) + 1;
        counts[r.resourceType] = (counts[r.resourceType] || 0) + 1;
      });
    return counts;
  }, [selectedChapterId, learningResources, isAdmin]);

  // Handler for opening a resource based on its type
  const handleOpenResource = (res: LearningResource) => {
    if (res.resourceType === 'chapter_test' && res.mcqItems && res.mcqItems.length > 0) {
      setTestResourceToRun(res);
    } else if (res.resourceType === 'mcq' && res.mcqItems && res.mcqItems.length > 0) {
      setMcqResourceToRun(res);
    } else if (['qa', 'important_questions'].includes(res.resourceType) && res.qaItems && res.qaItems.length > 0) {
      setQaResourceToView(res);
    } else {
      // Notes, PYQs, Practical files, Revision, or with PDF attached
      setPdfResourceToView(res);
    }
  };

  const handleDownload = (res: LearningResource) => {
    if (res.fileUrl && res.fileUrl.startsWith('data:')) {
      const link = document.createElement('a');
      link.href = res.fileUrl;
      link.download = res.fileName || `${res.title.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    const contentToSave = res.content || `# ${res.title}\n\n${res.description}\n\nClass: ${res.classLevel}\nChapter: ${res.chapterTitle || ''}\nEducator: Zakir Hussain\n\n${res.content || ''}`;
    const blob = new Blob([contentToSave], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = res.fileName || `${res.title.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Type styling definitions
  const getTypeBadge = (type: ChapterResourceType) => {
    switch (type) {
      case 'notes':
        return { label: 'Notes & Study Material', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: FileText };
      case 'qa':
        return { label: 'Question Answers', color: 'bg-indigo-100 text-indigo-800 border-indigo-200', icon: HelpCircle };
      case 'important_questions':
        return { label: 'Important Questions', color: 'bg-amber-100 text-amber-800 border-amber-200', icon: Sparkles };
      case 'mcq':
        return { label: 'MCQs', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: Award };
      case 'practical_assignment':
        return { label: 'Practical Files & Assignments', color: 'bg-teal-100 text-teal-800 border-teal-200', icon: Code };
      case 'pyq':
        return { label: 'Previous-Year Questions & Papers', color: 'bg-rose-100 text-rose-800 border-rose-200', icon: BookOpen };
      case 'revision':
        return { label: 'Revision Material', color: 'bg-cyan-100 text-cyan-800 border-cyan-200', icon: RotateCcw };
      case 'chapter_test':
        return { label: 'Online Chapter Tests', color: 'bg-violet-100 text-violet-800 border-violet-200', icon: Clock };
      default:
        return { label: 'Learning Resource', color: 'bg-slate-100 text-slate-800 border-slate-200', icon: FileText };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20">
      {/* Top Banner / LMS Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white pt-8 pb-12 px-4 sm:px-6 lg:px-8 border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header Title & Admin Actions */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5 text-xs font-semibold text-teal-300">
                <span className="uppercase tracking-wider font-bold">Chapter LMS</span>
                <span aria-hidden="true" className="text-slate-500">·</span>
                <span className="text-slate-400">CBSE Curriculum Hub (Classes VI–XII)</span>
              </div>
              <KineticHeading
                as="h1"
                text="Chapter-Wise Learning Resources"
                className="text-2xl sm:text-3xl font-black text-white tracking-tight font-heading"
              />
              <FadeIn delay={0.1}>
                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1">
                  Structured hierarchy: <strong>Class → Subject → Chapter → Learning Resources</strong>. Browse notes, solved Q&As, MCQs, practicals, PYQs, and interactive online tests.
                </p>
              </FadeIn>
            </div>

            {/* Admin Add Resource CTA */}
            {isAdmin && (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    setResourceToEdit(null);
                    setIsReplaceMode(false);
                    setIsResourceFormOpen(true);
                  }}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add Chapter Resource</span>
                </button>
              </div>
            )}
          </div>

          {/* Level 1: CLASS SELECTOR TABS */}
          <div className="space-y-2 pt-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>Step 1: Select Class</span>
            </label>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
              {customClasses.map(cls => {
                const isSelected = selectedClass === cls.level;
                return (
                  <button
                    key={cls.level}
                    onClick={() => {
                      setSelectedClass(cls.level as ClassLevel);
                      setSearchQuery('');
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
                      isSelected
                        ? 'bg-teal-500 text-slate-950 font-black shadow-md shadow-teal-500/25 ring-2 ring-teal-400/40'
                        : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
                    }`}
                  >
                    <span>Class {cls.level}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Level 2: SUBJECT SELECTOR PILLS */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>Step 2: Select Subject for Class {selectedClass}</span>
            </label>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
              {availableSubjects.length === 0 ? (
                <div className="text-xs text-slate-400 italic py-1">
                  No subjects assigned to Class {selectedClass}. Admin can assign subjects in Dashboard.
                </div>
              ) : (
                availableSubjects.map(sub => {
                  const isSelected = selectedSubject === sub.id;
                  const chapCount = getChapters(selectedClass, sub.id, customChapters).length;
                  return (
                    <button
                      key={sub.id}
                      onClick={() => {
                        setSelectedSubject(sub.id);
                        setSearchQuery('');
                      }}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2.5 cursor-pointer ${
                        isSelected
                          ? 'bg-white text-slate-900 shadow-lg'
                          : 'bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700/60'
                      }`}
                    >
                      <span>{sub.name}</span>
                      <span className={`text-[10px] font-mono tabular-nums px-2 py-0.5 rounded-full ${
                        isSelected ? 'bg-slate-100 text-slate-600' : 'bg-slate-700 text-slate-300'
                      }`}>
                        {sub.code} • {chapCount} {chapCount === 1 ? 'Ch' : 'Chs'}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main LMS Body Workspace */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Level 3 & Level 4: CHAPTERS DIRECTORY & LEARNING RESOURCES */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT SIDEBAR: CHAPTERS LIST (Level 3) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                    {availableChapters.length}
                  </div>
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Step 3: Chapters Directory
                    </h2>
                    <p className="text-[11px] text-slate-500">
                      Class {selectedClass} • {currentSubject?.name || 'Subject'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Chapters List Navigation */}
              {availableChapters.length === 0 ? (
                <div className="p-6 text-center text-slate-500 space-y-2">
                  <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-semibold">No chapters added yet for this subject.</p>
                  {isAdmin && (
                    <p className="text-[11px] text-indigo-600 font-bold">
                      Use Admin Dashboard → Chapter Management to add chapters.
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {availableChapters.map(chap => {
                    const isSelected = selectedChapterId === chap.id;
                    const resCount = learningResources.filter(r => r.chapterId === chap.id && (isAdmin || r.published)).length;
                    return (
                      <button
                        key={chap.id}
                        onClick={() => {
                          setSelectedChapterId(chap.id);
                          setSearchQuery('');
                          setActiveTypeFilter('ALL');
                        }}
                        className={`w-full text-left p-3.5 rounded-xl transition-all border flex items-start justify-between gap-3 cursor-pointer ${
                          isSelected
                            ? 'bg-teal-50/80 border-teal-500 text-teal-950 shadow-xs ring-1 ring-teal-500/20'
                            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`text-[11px] font-extrabold px-1.5 py-0.5 rounded-md font-mono tabular-nums ${
                              isSelected ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-600'
                            }`}>
                              Ch {chap.chapterNumber}
                            </span>
                            <span className="text-xs font-bold truncate text-slate-900">
                              {chap.title}
                            </span>
                          </div>
                          {chap.description && (
                            <p className="text-[11px] text-slate-500 line-clamp-1">
                              {chap.description}
                            </p>
                          )}
                        </div>

                        <div className="shrink-0 flex items-center gap-1 mt-0.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-mono tabular-nums ${
                            isSelected ? 'bg-teal-100 text-teal-900' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {resCount} {resCount === 1 ? 'Resource' : 'Resources'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT AREA: LEARNING RESOURCES WORKSPACE (Level 4) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Chapter Header & Breadcrumbs */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              {/* Breadcrumb Path */}
              <div className="flex items-center gap-1.5 text-xs text-slate-500 flex-wrap">
                <span className="font-semibold text-slate-700">Class {selectedClass}</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-semibold text-slate-700">{currentSubject?.name}</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-bold text-blue-600">
                  {currentChapter ? `Chapter ${currentChapter.chapterNumber}: ${currentChapter.title}` : 'Select Chapter'}
                </span>
              </div>

              {/* Current Chapter Overview */}
              {currentChapter ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100 pt-3">
                  <div>
                    <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                      {currentChapter.title}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {currentChapter.description || 'Chapter learning materials and resources.'}
                    </p>
                  </div>

                  {/* Quick Chapter Selector Dropdown */}
                  <div className="shrink-0">
                    <select
                      value={selectedChapterId}
                      onChange={e => setSelectedChapterId(e.target.value)}
                      className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {availableChapters.map(c => (
                        <option key={c.id} value={c.id}>Ch {c.chapterNumber}: {c.title}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : null}

              {/* Search & Resource Type Filters */}
              <div className="space-y-3 pt-2">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search notes, questions, MCQs, or assignments in this chapter..."
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="p-1 text-slate-400 hover:text-slate-600 absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* 8 Resource Type Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin text-xs">
                  <button
                    onClick={() => setActiveTypeFilter('ALL')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all shrink-0 cursor-pointer ${
                      activeTypeFilter === 'ALL'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    All ({countsByType.ALL || 0})
                  </button>

                  <button
                    onClick={() => setActiveTypeFilter('notes')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all shrink-0 cursor-pointer ${
                      activeTypeFilter === 'notes'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Notes ({countsByType.notes || 0})
                  </button>

                  <button
                    onClick={() => setActiveTypeFilter('qa')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all shrink-0 cursor-pointer ${
                      activeTypeFilter === 'qa'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Q&A ({countsByType.qa || 0})
                  </button>

                  <button
                    onClick={() => setActiveTypeFilter('important_questions')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all shrink-0 cursor-pointer ${
                      activeTypeFilter === 'important_questions'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Imp Questions ({countsByType.important_questions || 0})
                  </button>

                  <button
                    onClick={() => setActiveTypeFilter('mcq')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all shrink-0 cursor-pointer ${
                      activeTypeFilter === 'mcq'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    MCQs ({countsByType.mcq || 0})
                  </button>

                  <button
                    onClick={() => setActiveTypeFilter('practical_assignment')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all shrink-0 cursor-pointer ${
                      activeTypeFilter === 'practical_assignment'
                        ? 'bg-teal-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Practicals ({countsByType.practical_assignment || 0})
                  </button>

                  <button
                    onClick={() => setActiveTypeFilter('pyq')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all shrink-0 cursor-pointer ${
                      activeTypeFilter === 'pyq'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    PYQs ({countsByType.pyq || 0})
                  </button>

                  <button
                    onClick={() => setActiveTypeFilter('revision')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all shrink-0 cursor-pointer ${
                      activeTypeFilter === 'revision'
                        ? 'bg-cyan-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Revision ({countsByType.revision || 0})
                  </button>

                  <button
                    onClick={() => setActiveTypeFilter('chapter_test')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all shrink-0 cursor-pointer ${
                      activeTypeFilter === 'chapter_test'
                        ? 'bg-violet-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Online Tests ({countsByType.chapter_test || 0})
                  </button>
                </div>
              </div>
            </div>

            {/* RESOURCE CARDS LIST */}
            <div className="space-y-4">
              {chapterResources.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4 shadow-xs">
                  <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mx-auto">
                    <FileText className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-900 text-base">
                      No learning resources found
                    </h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      {searchQuery
                        ? `No resources in this chapter matched "${searchQuery}".`
                        : 'No resources have been published for this category yet.'}
                    </p>
                  </div>
                  {isAdmin && (
                    <button
                      onClick={() => {
                        setResourceToEdit(null);
                        setIsReplaceMode(false);
                        setIsResourceFormOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Resource to this Chapter</span>
                    </button>
                  )}
                </div>
              ) : (
                chapterResources.map((res, index) => {
                  const typeBadge = getTypeBadge(res.resourceType);
                  const Icon = typeBadge.icon;
                  const isFirst = index === 0;
                  const isLast = index === chapterResources.length - 1;

                  return (
                    <div
                      key={res.id}
                      className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 p-5 shadow-xs transition-all space-y-4"
                    >
                      {/* Top Row: Type Badge + Publication Status + Admin Order Controls */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${typeBadge.color}`}>
                            <Icon className="w-3.5 h-3.5" />
                            <span>{typeBadge.label}</span>
                          </span>

                          {!res.published && (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              Draft (Admin Only)
                            </span>
                          )}
                        </div>

                        {/* Admin Controls */}
                        {isAdmin && (
                          <div className="flex items-center gap-1.5">
                            {/* Reorder Up */}
                            <button
                              onClick={() => reorderLearningResources(res.chapterId, index, index - 1)}
                              disabled={isFirst}
                              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Move Up"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>

                            {/* Reorder Down */}
                            <button
                              onClick={() => reorderLearningResources(res.chapterId, index, index + 1)}
                              disabled={isLast}
                              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Move Down"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>

                            {/* Toggle Publish */}
                            <button
                              onClick={() => togglePublishLearningResource(res.id)}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                res.published 
                                  ? 'text-emerald-600 hover:bg-emerald-50' 
                                  : 'text-amber-600 hover:bg-amber-50'
                              }`}
                              title={res.published ? 'Unpublish Resource' : 'Publish Resource'}
                            >
                              {res.published ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                            </button>

                            {/* Edit */}
                            <button
                              onClick={() => {
                                setResourceToEdit(res);
                                setIsReplaceMode(false);
                                setIsResourceFormOpen(true);
                              }}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                              title="Edit Resource"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            {/* Replace File */}
                            <button
                              onClick={() => {
                                setResourceToEdit(res);
                                setIsReplaceMode(true);
                                setIsResourceFormOpen(true);
                              }}
                              className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg cursor-pointer"
                              title="Replace Uploaded File"
                            >
                              <Upload className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => setResourceToDelete(res)}
                              className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                              title="Delete Resource"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Title & Description */}
                      <div className="space-y-1.5">
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                          {res.title}
                        </h3>
                        {res.description && (
                          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                            {res.description}
                          </p>
                        )}
                      </div>

                      {/* File & Metadata Info Chips */}
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 pt-1">
                        <span className="flex items-center gap-1 font-medium">
                          <User className="w-3 h-3 text-slate-400" />
                          <span>{res.author || 'Zakir Hussain'}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>Uploaded: {res.uploadedDate}</span>
                        </span>

                        {res.fileName && (
                          <>
                            <span>•</span>
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 font-mono text-slate-700 font-bold">
                              {res.fileName}
                            </span>
                          </>
                        )}

                        {res.fileSize && (
                          <span className="text-slate-400">({res.fileSize})</span>
                        )}

                        {res.qaItems && res.qaItems.length > 0 && (
                          <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold">
                            {res.qaItems.length} Q&A Pairs
                          </span>
                        )}

                        {res.mcqItems && res.mcqItems.length > 0 && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold">
                            {res.mcqItems.length} MCQs
                          </span>
                        )}

                        {res.testDurationMinutes && (
                          <span className="px-2 py-0.5 rounded-md bg-violet-50 text-violet-700 font-bold">
                            {res.testDurationMinutes} Mins Duration
                          </span>
                        )}
                      </div>

                      {/* Action Buttons: View, Run Test, Download */}
                      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                        {/* Primary Action Button */}
                        <button
                          onClick={() => handleOpenResource(res)}
                          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                        >
                          {res.resourceType === 'chapter_test' ? (
                            <>
                              <Play className="w-3.5 h-3.5" />
                              <span>Start Chapter Test</span>
                            </>
                          ) : res.resourceType === 'mcq' ? (
                            <>
                              <Play className="w-3.5 h-3.5" />
                              <span>Practice MCQs</span>
                            </>
                          ) : ['qa', 'important_questions'].includes(res.resourceType) ? (
                            <>
                              <Eye className="w-3.5 h-3.5" />
                              <span>View Questions & Answers</span>
                            </>
                          ) : (
                            <>
                              <Eye className="w-3.5 h-3.5" />
                              <span>Read & PDF Preview</span>
                            </>
                          )}
                        </button>

                        {/* Download Button */}
                        <button
                          onClick={() => handleDownload(res)}
                          className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                          title="Download Resource"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MODALS */}
      {/* 1. PDF Preview Modal */}
      <LmsPdfViewerModal
        resource={pdfResourceToView}
        onClose={() => setPdfResourceToView(null)}
      />

      {/* 2. MCQ Runner Modal */}
      <LmsMcqRunnerModal
        resource={mcqResourceToRun}
        onClose={() => setMcqResourceToRun(null)}
      />

      {/* 3. Online Chapter Test Modal */}
      <LmsChapterTestModal
        resource={testResourceToRun}
        onClose={() => setTestResourceToRun(null)}
      />

      {/* 4. Question Answers Viewer Modal */}
      <LmsQaViewerModal
        resource={qaResourceToView}
        onClose={() => setQaResourceToView(null)}
      />

      {/* 5. Resource Form Modal (Admin Add / Edit / Replace) */}
      <LmsResourceFormModal
        isOpen={isResourceFormOpen}
        onClose={() => {
          setIsResourceFormOpen(false);
          setResourceToEdit(null);
          setIsReplaceMode(false);
        }}
        resourceToEdit={resourceToEdit}
        defaultClass={selectedClass}
        defaultSubject={selectedSubject}
        defaultChapterId={selectedChapterId}
        isReplaceMode={isReplaceMode}
      />

      {/* 6. Delete Resource Confirmation Dialog */}
      {resourceToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Confirm Delete Resource</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete <strong>"{resourceToDelete.title}"</strong>? 
              Students will no longer be able to access this resource.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setResourceToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteLearningResource(resourceToDelete.id);
                  setResourceToDelete(null);
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
  );
};
