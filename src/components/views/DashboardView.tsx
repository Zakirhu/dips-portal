import React, { useState, useMemo } from 'react';
import { 
  User, 
  Award, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  BookOpen, 
  Calendar, 
  Edit3, 
  Sparkles, 
  FileText, 
  ArrowRight, 
  ShieldCheck, 
  Check, 
  BarChart2, 
  Filter, 
  Bookmark, 
  BookmarkCheck, 
  Eye, 
  EyeOff, 
  HelpCircle,
  Users,
  GraduationCap,
  Play,
  RotateCcw,
  ListChecks,
  CheckCircle2,
  Printer,
  Download,
  Search,
  Code,
  FileCheck,
  Hash,
  School,
  Lock,
  Unlock,
  Layers,
  ChevronRight,
  Monitor
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CLASSES_LIST, getSubjectsForClass, getChapters } from '../../data/curriculumData';
import { ClassLevel, QuizAttempt, StudyMaterial, SubjectId, LearningResource, PYQPaper, LabExamConfig } from '../../types';
import { GlobalLeaderboard } from '../GlobalLeaderboard';
import { TopStudentsLeaderboard } from '../TopStudentsLeaderboard';
import { ProgressReportModal } from '../ProgressReportModal';
import { LmsPdfViewerModal } from '../lms/LmsPdfViewerModal';
import { LmsQaViewerModal } from '../lms/LmsQaViewerModal';
import { SEO } from '../SEO';

interface DashboardViewProps {
  onOpenMaterial: (material: StudyMaterial) => void;
  onViewCertificate: (attempt: QuizAttempt) => void;
  onStartPracticeTopic: (chapterTitle: string) => void;
  onStartQuizClick?: () => void;
  onOpenStudyRoom?: (roomId?: string) => void;
  onNavigateTab?: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenMaterial,
  onViewCertificate,
  onStartPracticeTopic,
  onStartQuizClick,
  onOpenStudyRoom,
  onNavigateTab
}) => {
  const { 
    currentUser,
    studentProfile, 
    updateStudentProfile, 
    quizAttempts, 
    studyMaterials,
    questionBank,
    quizzes,
    learningResources,
    pyqPapers,
    labExams,
    labExamSessions,
    customSubjects,
    customChapters,
    toggleBookmark,
    toggleQuestionBookmark,
    setActiveTestForReview
  } = useApp();

  // Active Main Sub-Tab in Student Dashboard
  const [activeDashboardTab, setActiveDashboardTab] = useState<
    'overview' | 'materials' | 'tests' | 'pyq' | 'practicals' | 'vault'
  >('overview');

  // Edit Profile State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isReportCardOpen, setIsReportCardOpen] = useState(false);
  const [tempName, setTempName] = useState(studentProfile.name);
  const [tempClass, setTempClass] = useState<ClassLevel>(studentProfile.classLevel);
  const [tempSection, setTempSection] = useState(studentProfile.section || currentUser?.section || 'A');
  const [tempRollNumber, setTempRollNumber] = useState(studentProfile.rollNumber || currentUser?.rollNumber || '1024');
  const [tempStudentId, setTempStudentId] = useState(studentProfile.studentId || currentUser?.studentId || 'STD-X-1024');
  const [tempEmail, setTempEmail] = useState(studentProfile.email);
  const [tempSchool, setTempSchool] = useState(studentProfile.schoolName || currentUser?.schoolName || 'CBSE Partner School');

  // Material & LMS Filtering State
  const [selectedSubjectId, setSelectedSubjectId] = useState<SubjectId>('it-402');
  const [selectedChapterId, setSelectedChapterId] = useState<string>('ALL');
  const [resourceSearchQuery, setResourceSearchQuery] = useState('');
  const [selectedResourceTypeFilter, setSelectedResourceTypeFilter] = useState<string>('ALL');

  // Modals for PDF preview and Q&A
  const [activePdfResource, setActivePdfResource] = useState<LearningResource | null>(null);
  const [activeQaResource, setActiveQaResource] = useState<LearningResource | null>(null);

  // My Tests Search and Selected Attempt for Review
  const [testSearchQuery, setTestSearchQuery] = useState('');
  const [selectedAttemptForModal, setSelectedAttemptForModal] = useState<QuizAttempt | null>(null);
  const [selectedLabSessionForReview, setSelectedLabSessionForReview] = useState<any | null>(null);

  // Vault Tab
  const [vaultSubTab, setVaultSubTab] = useState<'materials' | 'questions'>('materials');
  const [revealedSavedQuestions, setRevealedSavedQuestions] = useState<Record<string, boolean>>({});

  // 1. Performance Calculations
  const studentAttempts = useMemo(() => {
    return quizAttempts.filter(a => 
      !a.studentName || a.studentName === studentProfile.name || a.studentName === currentUser?.name
    );
  }, [quizAttempts, studentProfile.name, currentUser?.name]);

  const totalAttempts = studentAttempts.length;
  const averageScore = totalAttempts > 0 
    ? studentAttempts.reduce((acc, a) => acc + a.percentage, 0) / totalAttempts 
    : 0;
  const totalQuestionsSolved = studentProfile.questionsSolvedCount || 0;
  const chaptersCompleted = studentProfile.chaptersCompletedCount || 0;

  // 2. Assigned Subjects for the student's class
  const assignedSubjects = useMemo(() => {
    return getSubjectsForClass(studentProfile.classLevel, customSubjects);
  }, [studentProfile.classLevel, customSubjects]);

  // Ensure selectedSubjectId is valid
  React.useEffect(() => {
    if (assignedSubjects.length > 0 && !assignedSubjects.some(s => s.id === selectedSubjectId)) {
      setSelectedSubjectId(assignedSubjects[0].id);
    }
  }, [assignedSubjects, selectedSubjectId]);

  // Chapters for selected subject
  const availableChapters = useMemo(() => {
    return getChapters(studentProfile.classLevel, selectedSubjectId, customChapters);
  }, [studentProfile.classLevel, selectedSubjectId, customChapters]);

  // 3. Recently Added Study Materials (intended for this student's class)
  const recentClassMaterials = useMemo(() => {
    return learningResources
      .filter(r => r.published && (r.classLevel === studentProfile.classLevel || r.classLevel === 'ALL'))
      .sort((a, b) => new Date(b.uploadedDate).getTime() - new Date(a.uploadedDate).getTime())
      .slice(0, 6);
  }, [learningResources, studentProfile.classLevel]);

  // 4. Chapter Resources (Hierarchy: Class → Subject → Chapter → Resource)
  const filteredLearningResources = useMemo(() => {
    return learningResources.filter(r => {
      if (!r.published) return false;
      if (r.classLevel !== studentProfile.classLevel && r.classLevel !== 'ALL') return false;
      if (selectedSubjectId && r.subjectId !== selectedSubjectId) return false;
      if (selectedChapterId !== 'ALL' && r.chapterId !== selectedChapterId) return false;
      if (selectedResourceTypeFilter !== 'ALL' && r.resourceType !== selectedResourceTypeFilter) return false;
      if (resourceSearchQuery.trim()) {
        const q = resourceSearchQuery.toLowerCase();
        const matchesTitle = r.title.toLowerCase().includes(q);
        const matchesDesc = r.description.toLowerCase().includes(q);
        const matchesChap = r.chapterTitle?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesChap) return false;
      }
      return true;
    });
  }, [learningResources, studentProfile.classLevel, selectedSubjectId, selectedChapterId, selectedResourceTypeFilter, resourceSearchQuery]);

  // 5. Assigned & Available Lab Online Exams
  const assignedLabExams = useMemo(() => {
    return labExams.filter(exam => {
      if (exam.status === 'draft') return false;
      if (exam.classLevel !== studentProfile.classLevel && exam.classLevel !== 'ALL') return false;
      const studentSec = studentProfile.section || currentUser?.section || 'A';
      if (exam.section && exam.section !== 'ALL' && exam.section !== studentSec) return false;
      
      const sId = studentProfile.studentId || currentUser?.studentId;
      if (Array.isArray(exam.assignedStudentIds) && exam.assignedStudentIds.length > 0 && sId) {
        if (!exam.assignedStudentIds.includes(sId)) return false;
      }
      return true;
    });
  }, [labExams, studentProfile.classLevel, studentProfile.section, currentUser?.section, studentProfile.studentId, currentUser?.studentId]);

  // In-progress active lab sessions for this student
  const activeStudentSessions = useMemo(() => {
    const sId = studentProfile.studentId || currentUser?.studentId;
    return labExamSessions.filter(s => 
      s.status === 'in_progress' && (s.studentId === sId || s.studentName === studentProfile.name)
    );
  }, [labExamSessions, studentProfile.studentId, currentUser?.studentId, studentProfile.name]);

  // Completed lab sessions for this student
  const completedStudentSessions = useMemo(() => {
    const sId = studentProfile.studentId || currentUser?.studentId;
    return labExamSessions.filter(s => 
      s.status === 'submitted' && (s.studentId === sId || s.studentName === studentProfile.name)
    );
  }, [labExamSessions, studentProfile.studentId, currentUser?.studentId, studentProfile.name]);

  // 6. PYQ Papers for this class
  const classPyqPapers = useMemo(() => {
    return pyqPapers.filter(p => p.classLevel === studentProfile.classLevel || p.classLevel === 'ALL');
  }, [pyqPapers, studentProfile.classLevel]);

  // 7. Practical Files and Assignments for this class
  const classPracticals = useMemo(() => {
    return learningResources.filter(r => 
      r.published && 
      (r.resourceType === 'practical_assignment' || r.tags?.includes('practical')) &&
      (r.classLevel === studentProfile.classLevel || r.classLevel === 'ALL')
    );
  }, [learningResources, studentProfile.classLevel]);

  // Bookmarked materials & questions list
  const bookmarkedMaterials = studyMaterials.filter(m => studentProfile.bookmarks.includes(m.id));
  const bookmarkedQuestionsList = questionBank.filter(q => studentProfile.bookmarkedQuestions?.includes(q.id));

  const handleSaveProfile = () => {
    updateStudentProfile({
      name: tempName,
      classLevel: tempClass,
      section: tempSection,
      rollNumber: tempRollNumber,
      studentId: tempStudentId,
      email: tempEmail,
      schoolName: tempSchool
    });
    setIsEditingProfile(false);
  };

  const handleLaunchLabExam = (exam: LabExamConfig) => {
    if (onNavigateTab) {
      onNavigateTab('examhall');
    }
  };

  const handleDownloadResource = (res: LearningResource) => {
    if (res.fileUrl && res.fileUrl.startsWith('data:')) {
      const link = document.createElement('a');
      link.href = res.fileUrl;
      link.download = res.fileName || `${res.title.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    const content = res.content || `# ${res.title}\n\n${res.description}\n\nClass: ${res.classLevel}\nChapter: ${res.chapterTitle || ''}\nEducator: Zakir Hussain`;
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = res.fileName || `${res.title.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <SEO
        title={`Student Dashboard | ${studentProfile.name} (Class ${studentProfile.classLevel})`}
        description={`Personalized student dashboard, assigned subjects, chapter notes, previous-year papers, and examination records for ${studentProfile.name}.`}
      />

      {/* ============================================================== */}
      {/* 1. STUDENT IDENTITY BANNER & VERIFIED DIGITAL ID CARD */}
      {/* ============================================================== */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 relative z-10">
          {/* Avatar Icon */}
          <div className="w-18 h-18 sm:w-22 sm:h-22 rounded-2xl bg-white/15 backdrop-blur-md border border-white/30 text-white font-black text-3xl sm:text-4xl flex items-center justify-center shadow-lg shrink-0">
            {studentProfile.name.charAt(0)}
          </div>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                {studentProfile.name}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-blue-500/30 text-blue-100 border border-blue-400/40">
                Class {studentProfile.classLevel} • Section {studentProfile.section || currentUser?.section || 'A'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/30 text-emerald-100 border border-emerald-400/40">
                Active Student
              </span>
            </div>

            {/* Student ID & Roll Number Credentials */}
            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-blue-100 font-medium pt-0.5">
              <span className="flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-blue-300" />
                <span>Roll No: <strong>{studentProfile.rollNumber || currentUser?.rollNumber || '1024'}</strong></span>
              </span>
              <span className="flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-blue-300" />
                <span>Student ID: <strong className="font-mono">{studentProfile.studentId || currentUser?.studentId || 'STD-X-1024'}</strong></span>
              </span>
              {studentProfile.username && (
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-300" />
                  <span>Username: <strong className="font-mono">{studentProfile.username}</strong></span>
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <School className="w-3.5 h-3.5 text-blue-300" />
                <span>{studentProfile.schoolName || currentUser?.schoolName || 'CBSE Partner School'}</span>
              </span>
            </div>

            {/* Enrolled Subjects Pill List */}
            <div className="flex flex-wrap items-center gap-1.5 pt-2">
              <span className="text-[11px] font-bold text-blue-200 uppercase tracking-wider mr-1">
                Assigned Subjects:
              </span>
              {assignedSubjects.map(sub => (
                <span
                  key={sub.id}
                  className="px-2 py-0.5 rounded-lg text-[10px] font-extrabold bg-white/10 text-white border border-white/20"
                >
                  {sub.name} ({sub.code})
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 relative z-10 shrink-0">
          <button
            onClick={() => setIsReportCardOpen(true)}
            className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-900 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5 cursor-pointer active:scale-98"
          >
            <Printer className="w-4 h-4" />
            <span>Progress Report (PDF / Print)</span>
          </button>

          <button
            onClick={() => setIsEditingProfile(!isEditingProfile)}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Edit3 className="w-4 h-4" />
            <span>{isEditingProfile ? 'Cancel' : 'Edit Profile'}</span>
          </button>
        </div>
      </div>

      {/* EDIT PROFILE MODAL / PANEL */}
      {isEditingProfile && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-lg space-y-4 animate-in fade-in duration-200">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-blue-600" />
            <span>Edit Student Profile & Enrollment Details</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-600 block mb-1">Full Name</label>
              <input
                type="text"
                value={tempName}
                onChange={e => setTempName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-600 block mb-1">Class Level</label>
              <select
                value={tempClass}
                onChange={e => setTempClass(e.target.value as ClassLevel)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                {CLASSES_LIST.map(c => (
                  <option key={c.level} value={c.level}>Class {c.level}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-600 block mb-1">Section</label>
              <select
                value={tempSection}
                onChange={e => setTempSection(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                <option value="A">Section A</option>
                <option value="B">Section B</option>
                <option value="C">Section C</option>
                <option value="D">Section D</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-600 block mb-1">Admission / Roll No</label>
              <input
                type="text"
                value={tempRollNumber}
                onChange={e => setTempRollNumber(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-600 block mb-1">Unique Student ID</label>
              <input
                type="text"
                value={tempStudentId}
                onChange={e => setTempStudentId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-600 block mb-1">Email Address</label>
              <input
                type="email"
                value={tempEmail}
                onChange={e => setTempEmail(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="font-semibold text-slate-600 block mb-1">School / Institution</label>
              <input
                type="text"
                value={tempSchool}
                onChange={e => setTempSchool(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              onClick={() => setIsEditingProfile(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveProfile}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
            >
              Save Profile Changes
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. DASHBOARD NAVIGATION TABS (6 KEY STUDENT MODULES) */}
      {/* ============================================================== */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveDashboardTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
            activeDashboardTab === 'overview'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>My Academic Hub</span>
        </button>

        <button
          onClick={() => setActiveDashboardTab('materials')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
            activeDashboardTab === 'materials'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Study Materials & Notes ({filteredLearningResources.length})</span>
        </button>

        <button
          onClick={() => setActiveDashboardTab('tests')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
            activeDashboardTab === 'tests'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
          }`}
        >
          <Monitor className="w-4 h-4 text-emerald-500" />
          <span>My Tests ({assignedLabExams.length + totalAttempts})</span>
          {activeStudentSessions.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          )}
        </button>

        <button
          onClick={() => setActiveDashboardTab('pyq')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
            activeDashboardTab === 'pyq'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
          }`}
        >
          <FileCheck className="w-4 h-4 text-amber-500" />
          <span>Previous-Year Papers ({classPyqPapers.length})</span>
        </button>

        <button
          onClick={() => setActiveDashboardTab('practicals')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
            activeDashboardTab === 'practicals'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
          }`}
        >
          <Code className="w-4 h-4 text-purple-500" />
          <span>Practical Files ({classPracticals.length})</span>
        </button>

        <button
          onClick={() => setActiveDashboardTab('vault')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
            activeDashboardTab === 'vault'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
          }`}
        >
          <Bookmark className="w-4 h-4 text-amber-500" />
          <span>Saved Revision Vault ({bookmarkedMaterials.length + bookmarkedQuestionsList.length})</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* SUB-TAB 1: OVERVIEW & ACADEMIC HUB */}
      {/* ============================================================== */}
      {activeDashboardTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in duration-150">
          
          {/* Active Lab Exam Alert (if any session in progress) */}
          {activeStudentSessions.length > 0 && (
            <div className="p-4 rounded-3xl bg-amber-50 border-2 border-amber-300 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold animate-pulse">
                  <Monitor className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-sm text-amber-950">
                    Active Examination Session In-Progress!
                  </h4>
                  <p className="text-xs text-amber-800">
                    Workstation {activeStudentSessions[0].workstationIp} • Time left: {Math.floor((activeStudentSessions[0].durationRemainingSeconds || 0) / 60)} minutes.
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab && onNavigateTab('examhall')}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-black rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-98"
              >
                <span>Resume Examination Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Quick Academic Track Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 bg-white rounded-3xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Chapters Completed</span>
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <span className="text-3xl font-black text-slate-900">{chaptersCompleted}</span>
                <span className="text-sm font-bold text-slate-400"> / 20</span>
              </div>
            </div>

            <div className="p-5 bg-white rounded-3xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">MCQs Solved</span>
                <CheckCircle className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-3xl font-black text-slate-900">{totalQuestionsSolved}</span>
              <p className="text-[11px] text-slate-500 mt-1">Interactive Board MCQs</p>
            </div>

            <div className="p-5 bg-white rounded-3xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Tests Attempted</span>
                <FileText className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-3xl font-black text-slate-900">{totalAttempts + completedStudentSessions.length}</span>
              <p className="text-[11px] text-slate-500 mt-1">Assessments & lab exams</p>
            </div>

            <div className="p-5 bg-white rounded-3xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Average Accuracy</span>
                <TrendingUp className="w-5 h-5 text-amber-500" />
              </div>
              <span className="text-3xl font-black text-emerald-600">
                {averageScore.toFixed(0)}%
              </span>
              <p className="text-[11px] text-slate-500 mt-1">Overall scorecard average</p>
            </div>
          </div>

          {/* Assigned Subjects Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                Subjects Assigned to Your Curriculum (Class {studentProfile.classLevel})
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                {assignedSubjects.length} Registered Subjects
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assignedSubjects.map(sub => {
                const subChapters = getChapters(studentProfile.classLevel, sub.id, customChapters);
                return (
                  <div
                    key={sub.id}
                    onClick={() => {
                      setSelectedSubjectId(sub.id);
                      setActiveDashboardTab('materials');
                    }}
                    className="p-5 bg-white rounded-3xl border border-slate-200/90 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-50 text-blue-700">
                          Code {sub.code}
                        </span>
                        <h4 className="font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors text-base">
                          {sub.name}
                        </h4>
                      </div>
                      <span className="text-2xl">💻</span>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {sub.description}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs font-bold text-slate-600 group-hover:text-blue-600">
                      <span>{subChapters.length} Curriculum Chapters</span>
                      <span className="flex items-center gap-1">
                        Browse Notes <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recently Added Study Materials Row */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>Recently Added Study Materials (Class {studentProfile.classLevel})</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Latest chapter notes, question banks, and PDFs published by Zakir Sir.
                </p>
              </div>

              <button
                onClick={() => setActiveDashboardTab('materials')}
                className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View All ({filteredLearningResources.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {recentClassMaterials.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                No recent study materials found for this class.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {recentClassMaterials.map(mat => (
                  <div
                    key={mat.id}
                    className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:bg-blue-50/40 hover:border-blue-300 transition-all space-y-2 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">
                        <span className="bg-blue-100 text-blue-800 px-2 py-0.2 rounded font-extrabold">
                          {mat.resourceType.toUpperCase()}
                        </span>
                        <span>{new Date(mat.uploadedDate).toLocaleDateString()}</span>
                      </div>
                      <h5 className="font-extrabold text-slate-900 text-xs line-clamp-1">
                        {mat.title}
                      </h5>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                        {mat.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                      {mat.resourceType === 'qa' ? (
                        <button
                          onClick={() => setActiveQaResource(mat)}
                          className="font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                        >
                          <HelpCircle className="w-3.5 h-3.5" />
                          <span>View Q&A</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => setActivePdfResource(mat)}
                          className="font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Preview PDF</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleDownloadResource(mat)}
                        className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
                        title="Download Resource"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Gamified Top Performers Widget */}
          <TopStudentsLeaderboard onStartQuizClick={onStartQuizClick} />
        </div>
      )}

      {/* ============================================================== */}
      {/* SUB-TAB 2: STUDY MATERIALS & CHAPTER NOTES (CLASS → SUBJECT → CHAPTER) */}
      {/* ============================================================== */}
      {activeDashboardTab === 'materials' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6 animate-in fade-in duration-150">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl">
                Chapter-Wise Curriculum Learning Resources
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Organized hierarchy: <strong>Class {studentProfile.classLevel} → Selected Subject → Chapter → Published Resources</strong>. Preview PDFs online, inspect verified Q&A, and download permitted files.
            </p>
          </div>

          {/* Subject & Chapter Filter Ribbon */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
            {/* Subject Selector */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">Subject</label>
              <select
                value={selectedSubjectId}
                onChange={(e) => {
                  setSelectedSubjectId(e.target.value as SubjectId);
                  setSelectedChapterId('ALL');
                }}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold"
              >
                {assignedSubjects.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                ))}
              </select>
            </div>

            {/* Chapter Selector */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">Chapter</label>
              <select
                value={selectedChapterId}
                onChange={(e) => setSelectedChapterId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold"
              >
                <option value="ALL">All Chapters</option>
                {availableChapters.map(ch => (
                  <option key={ch.id} value={ch.id}>
                    Ch {ch.chapterNumber}: {ch.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Resource Type Filter */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">Resource Category</label>
              <select
                value={selectedResourceTypeFilter}
                onChange={(e) => setSelectedResourceTypeFilter(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold"
              >
                <option value="ALL">All Categories</option>
                <option value="notes">Chapter Notes & Reading</option>
                <option value="qa">Question & Answers (Q&A)</option>
                <option value="important_questions">Important Board Questions</option>
                <option value="mcq">Multiple Choice Questions (MCQ)</option>
                <option value="practical_assignment">Practical Assignments</option>
                <option value="pyq">Previous-Year Papers</option>
              </select>
            </div>

            {/* Keyword Search */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">Search Keywords</label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={resourceSearchQuery}
                  onChange={(e) => setResourceSearchQuery(e.target.value)}
                  placeholder="Filter topic, keyword..."
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Resources Grid */}
          {filteredLearningResources.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <BookOpen className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <h4 className="text-sm font-bold text-slate-700">No resources found for this chapter/filter</h4>
              <p className="text-xs text-slate-500 mt-1">
                Try selecting &quot;All Chapters&quot; or clearing your search query.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredLearningResources.map(res => (
                <div
                  key={res.id}
                  className="p-5 rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all bg-white flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                        {res.resourceType.replace('_', ' ')}
                      </span>
                      <span className="text-slate-400">
                        {new Date(res.uploadedDate).toLocaleDateString()}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-slate-900 text-sm leading-snug">
                      {res.title}
                    </h4>

                    {res.chapterTitle && (
                      <p className="text-[11px] font-bold text-blue-600 truncate">
                        📖 {res.chapterTitle}
                      </p>
                    )}

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {res.description}
                    </p>

                    {res.fileName && (
                      <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600 flex items-center justify-between">
                        <span className="font-mono truncate mr-2">📄 {res.fileName}</span>
                        <span className="font-bold shrink-0">{res.fileSize || 'PDF'}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                    {res.resourceType === 'qa' && res.qaItems && res.qaItems.length > 0 ? (
                      <button
                        onClick={() => setActiveQaResource(res)}
                        className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>Inspect Q&A ({res.qaItems.length})</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => setActivePdfResource(res)}
                        className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Preview PDF Online</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleDownloadResource(res)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold flex items-center gap-1.5 cursor-pointer"
                      title="Download Resource"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* SUB-TAB 3: MY TESTS & EXAMINATION INTEGRATION */}
      {/* ============================================================== */}
      {activeDashboardTab === 'tests' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          
          {/* Active Lab Sessions Alert */}
          {activeStudentSessions.length > 0 && (
            <div className="p-5 rounded-3xl bg-amber-500/10 border-2 border-amber-400 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-black text-amber-900 text-base">
                  <Monitor className="w-5 h-5 text-amber-700 animate-pulse" />
                  <span>Exam Session In-Progress: Workstation {activeStudentSessions[0].workstationIp}</span>
                </div>
                <p className="text-xs text-amber-800">
                  You have an active examination session. Your answers are auto-saved. Click resume to return to your exam.
                </p>
              </div>
              <button
                onClick={() => onNavigateTab && onNavigateTab('examhall')}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-black shadow-md transition-all cursor-pointer"
              >
                Resume Examination
              </button>
            </div>
          )}

          {/* 1. AVAILABLE & UPCOMING TESTS FOR THIS STUDENT */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                  <Monitor className="w-5 h-5 text-blue-600" />
                  <span>Available & Assigned Computer Lab Exams</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Scheduled tests assigned to Class {studentProfile.classLevel} (Section {studentProfile.section || 'A'}).
                </p>
              </div>
            </div>

            {assignedLabExams.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                No active online exams assigned to your class at this time.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {assignedLabExams.map(exam => (
                  <div
                    key={exam.id}
                    className="p-5 rounded-2xl border border-slate-200 hover:border-blue-400 bg-white hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] font-extrabold uppercase">
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {exam.status.toUpperCase()}
                        </span>
                        <span className="font-mono text-slate-400">{exam.examCode}</span>
                      </div>

                      <h4 className="font-extrabold text-slate-900 text-sm">
                        {exam.title}
                      </h4>

                      <p className="text-xs text-slate-500 line-clamp-2">
                        {exam.instructions || 'Comprehensive CBSE Lab Assessment'}
                      </p>

                      <div className="grid grid-cols-3 gap-1 pt-2 text-[11px] text-slate-600 font-semibold bg-slate-50 p-2 rounded-xl text-center">
                        <div>
                          <span className="block text-slate-400 text-[10px] uppercase font-bold">Time</span>
                          <span>{exam.durationMinutes}m</span>
                        </div>
                        <div>
                          <span className="block text-slate-400 text-[10px] uppercase font-bold">Marks</span>
                          <span>{exam.totalMarks}</span>
                        </div>
                        <div>
                          <span className="block text-slate-400 text-[10px] uppercase font-bold">Questions</span>
                          <span>{exam.questions?.length || 0}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleLaunchLabExam(exam)}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Start / Open in Exam Hall</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 2. COMPLETED TESTS & PERFORMANCE HISTORY */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  <span>Completed Tests & Official Scorecards</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Performance history across timed quizzes and computer lab examinations.
                </p>
              </div>

              <input
                type="text"
                placeholder="Search completed tests..."
                value={testSearchQuery}
                onChange={e => setTestSearchQuery(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            {studentAttempts.length === 0 && completedStudentSessions.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <h4 className="text-sm font-bold text-slate-700">No completed tests yet</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Attempt an assigned test or chapter quiz above to view verified scorecards and certificates.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 text-xs">
                {/* Lab Exam Sessions */}
                {completedStudentSessions.map(sess => {
                  const matchingExam = labExams.find(e => e.id === sess.examId);
                  const isReleased = Boolean(matchingExam?.showResultsImmediately || sess.resultsReleased);
                  const isPassed = sess.percentage >= (matchingExam?.passingMarks ? Math.round((matchingExam.passingMarks / matchingExam.totalMarks) * 100) : 40);

                  return (
                    <div
                      key={sess.id}
                      className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 px-2 rounded-xl transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 ${
                          isReleased
                            ? isPassed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {isReleased ? `${sess.percentage}%` : '⏱️'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-900 text-sm">
                              {matchingExam?.title || 'Computer Lab Examination'}
                            </span>
                            <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-blue-50 text-blue-700">
                              Lab Exam
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Workstation {sess.workstationIp} • Submitted on {new Date(sess.submittedAt || sess.startedAt || Date.now()).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 justify-between sm:justify-end">
                        <div className="text-right">
                          <span className="font-black text-slate-900 text-sm">
                            {isReleased ? `${sess.finalScore} / ${sess.totalMarks}` : 'Submitted'}
                          </span>
                          <p className="text-[10px] text-slate-400 uppercase font-semibold">
                            {isReleased ? 'Marks' : 'Under Review'}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setSelectedLabSessionForReview(sess)}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-bold transition-colors cursor-pointer"
                          >
                            Inspect Submission
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Chapter Quiz Attempts */}
                {studentAttempts.map(att => {
                  const isPassed = att.percentage >= 60;
                  return (
                    <div
                      key={att.id}
                      className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 px-2 rounded-xl transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 ${
                          isPassed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {att.percentage.toFixed(0)}%
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-900 text-sm">
                              {att.quizTitle}
                            </span>
                            <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-purple-50 text-purple-700">
                              Chapter Test
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {att.chapterTitle} • Completed on {new Date(att.date).toLocaleDateString()} • {Math.floor(att.timeSpentSeconds / 60)}m {att.timeSpentSeconds % 60}s
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 justify-between sm:justify-end">
                        <div className="text-right">
                          <span className="font-black text-slate-900 text-sm">
                            {att.score} / {att.totalMarks}
                          </span>
                          <p className="text-[10px] text-slate-400 uppercase font-semibold">Marks</p>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedAttemptForModal(att);
                              setActiveTestForReview(att);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-bold transition-colors cursor-pointer"
                          >
                            Review Answers
                          </button>

                          {isPassed && (
                            <button
                              onClick={() => onViewCertificate(att)}
                              className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold flex items-center gap-1 transition-colors cursor-pointer"
                              title="Download verified certificate"
                            >
                              <Award className="w-3.5 h-3.5 text-amber-600" />
                              <span>Certificate</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SUB-TAB 4: PREVIOUS-YEAR QUESTION PAPERS (PYQS) */}
      {/* ============================================================== */}
      {activeDashboardTab === 'pyq' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6 animate-in fade-in duration-150">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <FileCheck className="w-4 h-4" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl">
                CBSE Board Previous-Year Question Papers (Class {studentProfile.classLevel})
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Official board papers, compartment exams, sample question papers (SQP), and official step marking schemes.
            </p>
          </div>

          {classPyqPapers.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs text-slate-400">
              No previous year papers uploaded for Class {studentProfile.classLevel} yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {classPyqPapers.map(paper => (
                <div
                  key={paper.id}
                  className="p-5 rounded-2xl border border-slate-200 hover:border-amber-300 hover:shadow-md transition-all bg-white flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-extrabold">
                        {paper.examType} {paper.year}
                      </span>
                      <span className="text-slate-500 font-mono">Code {paper.code}</span>
                    </div>

                    <h4 className="font-extrabold text-slate-900 text-base">
                      {paper.subjectName}
                    </h4>

                    <p className="text-xs text-slate-500 line-clamp-2">
                      {paper.questionsSummary}
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-slate-600 bg-slate-50 p-2.5 rounded-xl">
                      <div>Total Marks: <strong>{paper.totalMarks} Marks</strong></div>
                      <div>Time Limit: <strong>{paper.timeHours} Hours</strong></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs font-bold">
                    <button
                      onClick={() => {
                        const resObj: LearningResource = {
                          id: paper.id,
                          title: `${paper.subjectName} (${paper.year} ${paper.examType})`,
                          description: paper.questionsSummary,
                          resourceType: 'pyq',
                          classLevel: paper.classLevel,
                          subjectId: paper.subjectId,
                          chapterId: 'pyq-chapter',
                          published: true,
                          uploadedDate: paper.uploadedAt || new Date().toISOString(),
                          order: 1,
                          fileName: paper.fileName || `CBSE_${paper.subjectName}_${paper.year}.pdf`,
                          fileUrl: paper.pdfDataUrl
                        };
                        setActivePdfResource(resObj);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview Question Paper</span>
                    </button>

                    <span className="text-[11px] text-slate-400">
                      {paper.sampleQuestions?.length || 0} Sample Qs
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* SUB-TAB 5: PRACTICAL FILES & LAB ASSIGNMENTS */}
      {/* ============================================================== */}
      {activeDashboardTab === 'practicals' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6 animate-in fade-in duration-150">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <Code className="w-4 h-4" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl">
                Practical Files, Lab Exercises & Viva Questions (Class {studentProfile.classLevel})
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Curated hands-on assignments for LibreOffice Writer & Calc (Class X) and Python Pandas DataFrames & MySQL Joins (Class XII).
            </p>
          </div>

          {classPracticals.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs text-slate-400">
              No practical files found specifically for this class. Explore Chapter Notes or Study Rooms.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {classPracticals.map(prac => (
                <div
                  key={prac.id}
                  className="p-5 rounded-2xl border border-purple-200 bg-purple-50/20 hover:bg-purple-50/40 hover:border-purple-300 transition-all space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-purple-100 text-purple-800 uppercase">
                      Practical Assignment
                    </span>
                    <h4 className="font-extrabold text-slate-900 text-sm">
                      {prac.title}
                    </h4>
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {prac.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-purple-100 text-xs">
                    <button
                      onClick={() => setActivePdfResource(prac)}
                      className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Assignment</span>
                    </button>

                    <button
                      onClick={() => handleDownloadResource(prac)}
                      className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-purple-100 text-purple-800 border border-purple-200 font-semibold cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* SUB-TAB 6: SAVED REVISION VAULT & BOOKMARKS */}
      {/* ============================================================== */}
      {activeDashboardTab === 'vault' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Bookmark className="w-4 h-4 fill-amber-500 text-amber-600" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-lg">
                  Saved Bookmarks & Personal Revision Vault
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Quick access to your saved chapter notes and tricky board questions.
              </p>
            </div>

            <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs">
              <button
                onClick={() => setVaultSubTab('materials')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                  vaultSubTab === 'materials'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Notes ({bookmarkedMaterials.length})</span>
              </button>
              <button
                onClick={() => setVaultSubTab('questions')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                  vaultSubTab === 'questions'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Tricky MCQs ({bookmarkedQuestionsList.length})</span>
              </button>
            </div>
          </div>

          {vaultSubTab === 'materials' ? (
            <div>
              {bookmarkedMaterials.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs text-slate-400">
                  No notes saved yet. Click the bookmark icon while reading study materials to save them here.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {bookmarkedMaterials.map(mat => (
                    <div
                      key={mat.id}
                      className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2 flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-extrabold text-blue-700">{mat.chapterTitle}</span>
                        <button
                          onClick={() => toggleBookmark(mat.id)}
                          className="text-amber-500 hover:text-rose-600"
                        >
                          <BookmarkCheck className="w-4 h-4 fill-amber-500" />
                        </button>
                      </div>
                      <h4 className="font-extrabold text-slate-900 text-sm">{mat.title}</h4>
                      <p className="text-xs text-slate-500 line-clamp-2">{mat.description}</p>
                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={() => onOpenMaterial(mat)}
                          className="font-bold text-blue-600 hover:underline text-xs flex items-center gap-1"
                        >
                          Open in Reader <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {bookmarkedQuestionsList.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs text-slate-400">
                  No questions saved yet. Bookmark questions from the Question Bank for rapid revision.
                </div>
              ) : (
                bookmarkedQuestionsList.map((q, idx) => {
                  const isRevealed = !!revealedSavedQuestions[q.id];
                  return (
                    <div key={q.id} className="p-4 rounded-2xl border border-amber-200 bg-amber-50/20 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-700">#{idx + 1} • {q.chapterTitle}</span>
                        <button
                          onClick={() => toggleQuestionBookmark(q.id)}
                          className="text-amber-600 hover:text-rose-600"
                        >
                          <BookmarkCheck className="w-4 h-4 fill-amber-500" />
                        </button>
                      </div>
                      <p className="font-bold text-slate-900">{q.question}</p>
                      
                      <div className="flex items-center justify-between pt-2">
                        <button
                          onClick={() => setRevealedSavedQuestions(prev => ({ ...prev, [q.id]: !prev[q.id] }))}
                          className="font-bold text-blue-600 hover:underline flex items-center gap-1"
                        >
                          {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          <span>{isRevealed ? 'Hide Answer' : 'Show Verified Solution'}</span>
                        </button>
                      </div>

                      {isRevealed && (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-950 mt-2 space-y-1">
                          <span className="font-bold">Correct Option: </span>
                          <span>{String.fromCharCode(65 + q.correctOptionIndex)} ({q.options[q.correctOptionIndex]})</span>
                          <p className="text-slate-600">{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* GLOBAL TEST REVIEW MODALS */}
      {/* ============================================================== */}
      {selectedAttemptForModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-blue-300 uppercase tracking-widest">Scorecard & Breakdown</span>
                <h3 className="text-lg font-bold text-white">{selectedAttemptForModal.quizTitle}</h3>
                <p className="text-xs text-slate-400">
                  Scored {selectedAttemptForModal.score}/{selectedAttemptForModal.totalMarks} ({selectedAttemptForModal.percentage}%) • {new Date(selectedAttemptForModal.date).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedAttemptForModal(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 divide-y divide-slate-100 flex-1">
              {selectedAttemptForModal.questionDetails?.map((q, idx) => {
                const userPick = selectedAttemptForModal.userAnswers[q.id];
                const isCorrect = userPick === q.correctOptionIndex;
                const isUnattempted = userPick === undefined;

                return (
                  <div key={q.id} className="pt-4 first:pt-0 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-700">Question #{idx + 1}</span>
                      {isCorrect ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">✓ Correct (+{q.marks} Mark)</span>
                      ) : isUnattempted ? (
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-bold">Unattempted (0 Marks)</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold">✕ Incorrect (0 Marks)</span>
                      )}
                    </div>
                    <p className="font-bold text-slate-900">{q.question}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                      {q.options.map((opt, oIdx) => {
                        const isRightAnswer = oIdx === q.correctOptionIndex;
                        const isUserChoice = oIdx === userPick;

                        let optClass = 'bg-slate-50 border-slate-200 text-slate-600';
                        if (isRightAnswer) optClass = 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold';
                        else if (isUserChoice) optClass = 'bg-rose-50 border-rose-400 text-rose-950 font-bold';

                        return (
                          <div key={oIdx} className={`p-2 rounded-xl border text-[11px] flex items-center justify-between gap-2 ${optClass}`}>
                            <span>{String.fromCharCode(65 + oIdx)}. {opt}</span>
                            {isRightAnswer && <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">Correct</span>}
                            {isUserChoice && !isRightAnswer && <span className="text-[9px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.2 rounded">Your Pick</span>}
                          </div>
                        );
                      })}
                    </div>

                    <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-100 text-[11px] text-blue-950">
                      <span className="font-bold text-blue-900">Zakir Sir&apos;s Solution: </span>
                      <span>{q.explanation}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              {selectedAttemptForModal.percentage >= 60 && (
                <button
                  onClick={() => {
                    const att = selectedAttemptForModal;
                    setSelectedAttemptForModal(null);
                    onViewCertificate(att);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  <Award className="w-4 h-4" />
                  <span>View Verified Certificate</span>
                </button>
              )}
              <button
                onClick={() => setSelectedAttemptForModal(null)}
                className="ml-auto px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold cursor-pointer"
              >
                Close Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lab Exam Session Inspection Modal */}
      {/* Lab Exam Detailed Student Scorecard & Submission Review Modal */}
      {selectedLabSessionForReview && (() => {
        const sess = selectedLabSessionForReview;
        const matchingExam = labExams.find(e => e.id === sess.examId);
        const isReleased = Boolean(matchingExam?.showResultsImmediately || sess.resultsReleased);
        const showAnswerKeys = isReleased && (matchingExam?.showAnswerKeysToStudents !== false);

        // Compute accuracy and chapter breakdown
        let correctCount = 0;
        let incorrectCount = 0;
        let unansweredCount = 0;
        const chapterBreakdown: Record<string, { total: number; scored: number }> = {};

        if (matchingExam) {
          matchingExam.questions.forEach((q: any) => {
            const chKey = q.chapterTitle || matchingExam.topic || 'General Topics';
            if (!chapterBreakdown[chKey]) {
              chapterBreakdown[chKey] = { total: 0, scored: 0 };
            }
            chapterBreakdown[chKey].total += q.marks;

            const studentAns = sess.answers?.[q.id];
            const manualEval = sess.manualEvaluations?.[q.id];

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
        }

        const strengths = Object.entries(chapterBreakdown).filter(([_, v]) => v.total > 0 && (v.scored / v.total) >= 0.70);
        const weaknesses = Object.entries(chapterBreakdown).filter(([_, v]) => v.total > 0 && (v.scored / v.total) < 0.50);

        return (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl p-6 sm:p-8 space-y-5 my-8 animate-in fade-in zoom-in-95 duration-150">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-black">
                    <Monitor className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">
                      {matchingExam?.title || 'Examination Performance Report'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Workstation: <strong>{sess.workstationIp || 'LAB-PC'}</strong> • Submitted: {new Date(sess.submittedAt || sess.startedAt || Date.now()).toLocaleString()}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedLabSessionForReview(null)} 
                  className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {!isReleased ? (
                /* Unreleased Notice */
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <Clock className="w-10 h-10 text-amber-500 mx-auto" />
                  <h4 className="font-bold text-slate-800 text-sm">Results Pending Release</h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Your answers were safely submitted and verified on the server. The teacher is currently evaluating submissions. Official marks, performance feedback, and answer keys will appear here once released.
                  </p>
                </div>
              ) : (
                /* Full Released Results */
                <div className="space-y-4 text-xs">
                  
                  {/* Score Banner */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-500/10 to-emerald-500/10 border border-teal-200/80 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <span className="text-[11px] font-bold text-teal-800 uppercase block">Certified Exam Score</span>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className="text-2xl font-black text-slate-900">{sess.finalScore}</span>
                        <span className="text-sm font-bold text-slate-500">/ {sess.totalMarks} Marks</span>
                        <span className="text-lg font-black text-teal-700 ml-1">({sess.percentage}%)</span>
                      </div>
                    </div>

                    <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                      sess.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {sess.passed ? 'PASSED ✓' : 'NEEDS PRACTICE'}
                    </span>
                  </div>

                  {/* Accuracy Stats */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                      <span className="text-[10px] font-bold text-emerald-700 uppercase block">Correct</span>
                      <span className="text-lg font-black text-emerald-900">{correctCount}</span>
                    </div>
                    <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
                      <span className="text-[10px] font-bold text-rose-700 uppercase block">Incorrect</span>
                      <span className="text-lg font-black text-rose-900">{incorrectCount}</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Unanswered</span>
                      <span className="text-lg font-black text-slate-700">{unansweredCount}</span>
                    </div>
                  </div>

                  {/* Teacher Feedback if available */}
                  {sess.teacherFeedback && (
                    <div className="p-4 bg-teal-50 rounded-2xl border border-teal-200 space-y-1">
                      <span className="font-extrabold text-teal-900 uppercase text-[10px] block">
                        Teacher Feedback {sess.evaluatedBy ? `• ${sess.evaluatedBy}` : ''}:
                      </span>
                      <p className="text-teal-950 font-medium italic leading-relaxed">
                        "{sess.teacherFeedback}"
                      </p>
                    </div>
                  )}

                  {/* Chapter-Wise Mastery Diagnostic */}
                  {Object.keys(chapterBreakdown).length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-purple-600" />
                        <span>Chapter Performance Breakdown</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {Object.entries(chapterBreakdown).map(([ch, v], idx) => {
                          const pct = v.total > 0 ? Math.round((v.scored / v.total) * 100) : 0;
                          return (
                            <div key={idx} className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-slate-800 truncate" title={ch}>{ch}</span>
                                <span className="font-mono font-bold text-slate-900 shrink-0 ml-2">{v.scored}/{v.total} ({pct}%)</span>
                              </div>
                              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
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

                  {/* Strengths & Weaknesses */}
                  {(strengths.length > 0 || weaknesses.length > 0) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {strengths.length > 0 && (
                        <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-1">
                          <span className="font-bold text-emerald-900 uppercase text-[10px] block">Strengths</span>
                          <p className="text-emerald-800 text-[11px]">{strengths.map(([s]) => s).join(', ')}</p>
                        </div>
                      )}
                      {weaknesses.length > 0 && (
                        <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-200 space-y-1">
                          <span className="font-bold text-rose-900 uppercase text-[10px] block">Needs Practice</span>
                          <p className="text-rose-800 text-[11px]">{weaknesses.map(([s]) => s).join(', ')}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Question-by-Question Review (If answer keys allowed) */}
                  {showAnswerKeys && matchingExam && (
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                        Question-by-Question Solution & Explanations:
                      </h4>
                      <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                        {matchingExam.questions.map((q: any, idx: number) => {
                          const ans = sess.answers?.[q.id];
                          const manualEval = sess.manualEvaluations?.[q.id];
                          const isObj = q.type === 'mcq' || q.type === 'true_false' || q.type === 'multi_select';
                          const isCorrect = isObj && (
                            Array.isArray(q.correctAnswer)
                              ? Array.isArray(ans) && ans.length === q.correctAnswer.length && ans.every((val: any) => (q.correctAnswer as any[]).includes(val))
                              : String(ans).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase()
                          );

                          return (
                            <div key={q.id} className="p-3 rounded-xl border border-slate-200 bg-white space-y-1.5">
                              <div className="flex items-start justify-between gap-2">
                                <span className="font-bold text-slate-900">Q{idx + 1}. {q.question}</span>
                                <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-slate-100 text-slate-700 shrink-0">
                                  {q.marks} Mark{q.marks > 1 ? 's' : ''}
                                </span>
                              </div>

                              <div className="text-[11px] space-y-0.5">
                                <p className="text-slate-600">
                                  Your Answer: <strong className="text-slate-900">{ans !== undefined && ans !== '' ? String(ans) : 'Unanswered'}</strong>
                                </p>
                                <p className="text-emerald-800 font-medium">
                                  Correct Key: <strong>{Array.isArray(q.correctAnswer) ? q.correctAnswer.map((i: number) => q.options?.[i] || i).join(', ') : (q.options && typeof q.correctAnswer === 'number' ? q.options[q.correctAnswer] : String(q.correctAnswer))}</strong>
                                </p>
                                {manualEval && (
                                  <p className="text-teal-700 font-semibold">
                                    Teacher Mark: {manualEval.marks}/{q.marks} {manualEval.feedback ? `(${manualEval.feedback})` : ''}
                                  </p>
                                )}
                                {q.explanation && (
                                  <p className="text-slate-500 italic text-[10px]">
                                    Explanation: {q.explanation}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                {isReleased ? (
                  <button
                    onClick={() => window.print()}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Scorecard</span>
                  </button>
                ) : <span />}

                <button
                  onClick={() => setSelectedLabSessionForReview(null)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl cursor-pointer"
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        );
      })()}

      {/* Online PDF Viewer Modal */}
      <LmsPdfViewerModal
        resource={activePdfResource}
        onClose={() => setActivePdfResource(null)}
      />

      {/* Online Q&A Viewer Modal */}
      <LmsQaViewerModal
        resource={activeQaResource}
        onClose={() => setActiveQaResource(null)}
      />

      {/* Official CBSE Progress Report Card Modal */}
      <ProgressReportModal
        isOpen={isReportCardOpen}
        onClose={() => setIsReportCardOpen(false)}
        studentProfile={studentProfile}
        quizAttempts={studentAttempts}
        totalQuestionsSolved={totalQuestionsSolved}
        chaptersCompleted={chaptersCompleted}
      />

    </div>
  );
};
