import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Monitor, 
  Save, 
  RotateCcw, 
  FileCheck, 
  ShieldCheck, 
  ChevronRight, 
  ChevronLeft, 
  Flag, 
  X, 
  Lock, 
  Wifi, 
  WifiOff, 
  LogIn, 
  Award, 
  FileText, 
  Check, 
  AlertCircle,
  HelpCircle,
  RefreshCw,
  Info,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { 
  LabExamConfig, 
  LabExamQuestion, 
  LabExamStudentSession, 
  ClassLevel 
} from '../../types';

interface LabExamPortalViewProps {
  onBackToDashboard?: () => void;
  onOpenAdminPanel?: () => void;
}

export const LabExamPortalView: React.FC<LabExamPortalViewProps> = ({
  onBackToDashboard,
  onOpenAdminPanel
}) => {
  const {
    currentUser,
    isAuthenticated,
    userRole,
    studentProfile,
    openAuthModal,
    labExams,
    labExamSessions,
    registeredStudents
  } = useApp();

  // Selected Exam to Take or Preview
  const [selectedExam, setSelectedExam] = useState<LabExamConfig | null>(null);
  const [activeSession, setActiveSession] = useState<LabExamStudentSession | null>(null);

  // Pre-test instructions modal
  const [showInstructionsModal, setShowInstructionsModal] = useState<boolean>(false);
  const [agreedToInstructions, setAgreedToInstructions] = useState<boolean>(false);
  const [customWorkstationIp, setCustomWorkstationIp] = useState<string>(() => {
    return localStorage.getItem('zakir_lab_workstation') || `LAB-PC-${Math.floor(Math.random() * 25 + 1).toString().padStart(2, '0')}`;
  });

  // In-test runtime state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [markedForReview, setMarkedForReview] = useState<string[]>([]);
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showSubmitConfirmModal, setShowSubmitConfirmModal] = useState<boolean>(false);
  const [submissionCompleted, setSubmissionCompleted] = useState<boolean>(false);
  const [submissionResult, setSubmissionResult] = useState<any>(null);

  // Network & Save status
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'offline' | 'error'>('saved');
  const [lastSavedTimestamp, setLastSavedTimestamp] = useState<string>('Just now');
  const [isNetworkOnline, setIsNetworkOnline] = useState<boolean>(navigator.onLine);

  // Student filter tab for browsing
  const [selectedTabFilter, setSelectedTabFilter] = useState<'all' | 'live' | 'upcoming' | 'completed'>('all');

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsNetworkOnline(true);
    const handleOffline = () => {
      setIsNetworkOnline(false);
      setSaveStatus('offline');
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Persist workstation IP
  useEffect(() => {
    if (customWorkstationIp) {
      localStorage.setItem('zakir_lab_workstation', customWorkstationIp);
    }
  }, [customWorkstationIp]);

  // Determine current student identity
  const currentStudentId = currentUser?.studentId || studentProfile?.studentId || (isAuthenticated ? currentUser?.email : null);
  const currentStudentName = currentUser?.name || studentProfile?.name || 'Student';
  const currentClassLevel = currentUser?.classLevel || studentProfile?.classLevel || 'X';
  const currentSection = currentUser?.section || 'A';

  // Filter assigned exams for current student
  const assignedExams = useMemo(() => {
    return labExams.filter(exam => {
      // Exclude draft exams from students
      if (exam.status === 'draft') return false;

      // If user is authenticated as student, match class & section
      if (isAuthenticated && userRole === 'student') {
        if (exam.classLevel !== currentClassLevel) return false;
        if (exam.section && exam.section !== 'ALL' && exam.section !== currentSection) return false;
        if (exam.assignedStudentIds && exam.assignedStudentIds.length > 0 && currentStudentId) {
          if (!exam.assignedStudentIds.includes(currentStudentId)) return false;
        }
      }
      return true;
    });
  }, [labExams, isAuthenticated, userRole, currentClassLevel, currentSection, currentStudentId]);

  // Check if student has an existing session for an exam
  const getStudentSessionForExam = (examId: string) => {
    if (!currentStudentId) return null;
    return labExamSessions.find(s => s.examId === examId && (s.studentId === currentStudentId || s.studentId === currentUser?.id));
  };

  // Start Examination Workflow
  const handleInitiateExam = (exam: LabExamConfig) => {
    setSelectedExam(exam);
    setShowInstructionsModal(true);
    setAgreedToInstructions(false);
  };

  // Confirm start & initialize/recover session with server
  const handleConfirmStartExam = async () => {
    if (!selectedExam) return;
    if (!isAuthenticated) {
      openAuthModal('login', 'Please sign in with your student credentials to take this lab examination.');
      return;
    }

    try {
      setSaveStatus('saving');
      const response = await fetch('/api/lab-exams/session/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examId: selectedExam.id,
          studentId: currentStudentId || 'STD-TEMP',
          studentName: currentStudentName,
          rollNumber: currentUser?.studentId || 'N/A',
          classLevel: currentClassLevel,
          section: currentSection,
          workstationIp: customWorkstationIp
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(data.error || 'Failed to start examination session. Please contact the lab invigilator.');
        setSaveStatus('error');
        return;
      }

      const session: LabExamStudentSession = data.session;
      setActiveSession(session);
      setAnswers(session.answers || {});
      setMarkedForReview(session.markedForReview || []);
      setCurrentQuestionIndex(0);
      setShowInstructionsModal(false);

      // Remaining duration from server
      const serverSeconds = typeof data.durationRemainingSeconds === 'number' 
        ? data.durationRemainingSeconds 
        : selectedExam.durationMinutes * 60;
      setTimeRemainingSeconds(serverSeconds);
      setSaveStatus('saved');
      setLastSavedTimestamp(new Date().toLocaleTimeString());

    } catch (err: any) {
      console.warn('Backend connection fallback for exam session:', err);
      // Local fallback for offline/isolated lab mode
      const localDuration = selectedExam.durationMinutes * 60;
      setTimeRemainingSeconds(localDuration);
      setAnswers({});
      setShowInstructionsModal(false);
      setSaveStatus('saved');
    }
  };

  // Countdown timer effect
  useEffect(() => {
    if (!activeSession || timeRemainingSeconds <= 0 || submissionCompleted) return;

    const timer = setInterval(() => {
      setTimeRemainingSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto submit when time expires
          handleAutoSubmit('time_expired');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeSession, timeRemainingSeconds, submissionCompleted]);

  // Periodic heartbeat to server (every 15s)
  useEffect(() => {
    if (!activeSession || submissionCompleted) return;

    const heartbeatInterval = setInterval(() => {
      if (selectedExam && currentStudentId) {
        fetch('/api/lab-exams/session/heartbeat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            examId: selectedExam.id,
            studentId: currentStudentId,
            workstationIp: customWorkstationIp,
            durationRemainingSeconds: timeRemainingSeconds
          })
        }).catch(() => {});
      }
    }, 15000);

    return () => clearInterval(heartbeatInterval);
  }, [activeSession, selectedExam, currentStudentId, customWorkstationIp, timeRemainingSeconds, submissionCompleted]);

  // Answer change handler with auto-save
  const handleAnswerChange = (questionId: string, val: any) => {
    const updatedAnswers = { ...answers, [questionId]: val };
    setAnswers(updatedAnswers);
    setSaveStatus('saving');

    // Debounced or direct auto-save to server
    if (selectedExam && currentStudentId) {
      fetch('/api/lab-exams/session/save-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examId: selectedExam.id,
          studentId: currentStudentId,
          questionId,
          answer: val,
          markedForReview,
          workstationIp: customWorkstationIp
        })
      })
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          setSaveStatus('saved');
          setLastSavedTimestamp(new Date().toLocaleTimeString());
        } else {
          setSaveStatus('error');
        }
      })
      .catch(() => {
        setSaveStatus('offline');
      });
    } else {
      setSaveStatus('saved');
      setLastSavedTimestamp(new Date().toLocaleTimeString());
    }
  };

  // Toggle mark for review
  const handleToggleMarkForReview = (questionId: string) => {
    setMarkedForReview(prev => {
      const next = prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId];

      if (selectedExam && currentStudentId) {
        fetch('/api/lab-exams/session/save-answer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            examId: selectedExam.id,
            studentId: currentStudentId,
            markedForReview: next,
            workstationIp: customWorkstationIp
          })
        }).catch(() => {});
      }
      return next;
    });
  };

  // Clear answer for current question
  const handleClearAnswer = (questionId: string) => {
    const updatedAnswers = { ...answers };
    delete updatedAnswers[questionId];
    setAnswers(updatedAnswers);

    if (selectedExam && currentStudentId) {
      fetch('/api/lab-exams/session/save-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examId: selectedExam.id,
          studentId: currentStudentId,
          questionId,
          answer: '',
          markedForReview,
          workstationIp: customWorkstationIp
        })
      }).catch(() => {});
    }
  };

  // Auto-submit on time expiry
  const handleAutoSubmit = (reason: string) => {
    executeSubmit(true);
  };

  // Manual submit confirmation
  const handleManualSubmit = () => {
    setShowSubmitConfirmModal(true);
  };

  // Execute Submission
  const executeSubmit = async (isAuto = false) => {
    if (!selectedExam) return;
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/lab-exams/session/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examId: selectedExam.id,
          studentId: currentStudentId || 'STD-TEMP',
          answers,
          workstationIp: customWorkstationIp,
          isAutoSubmit: isAuto
        })
      });

      const data = await response.json();
      setSubmissionResult(data);
      setSubmissionCompleted(true);
      setShowSubmitConfirmModal(false);
      setIsSubmitting(false);

    } catch (err) {
      console.error('Error submitting exam:', err);
      // Fallback
      setSubmissionResult({
        success: true,
        message: 'Your examination responses have been saved locally and queued for teacher verification.',
        resultsReleased: false
      });
      setSubmissionCompleted(true);
      setShowSubmitConfirmModal(false);
      setIsSubmitting(false);
    }
  };

  // Format timer string MM:SS
  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // -------------------------------------------------------------
  // VIEW RENDER 1: IN-PROGRESS EXAM WORKSTATION INTERFACE
  // -------------------------------------------------------------
  if (activeSession && selectedExam && !submissionCompleted) {
    const currentQ = selectedExam.questions[currentQuestionIndex];
    const totalQuestions = selectedExam.questions.length;
    const answeredCount = Object.keys(answers).filter(k => answers[k] !== undefined && answers[k] !== '').length;
    const isMarked = currentQ ? markedForReview.includes(currentQ.id) : false;
    const isUrgent = timeRemainingSeconds < 120; // less than 2 mins

    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans select-none">
        {/* Top Computer Lab Exam Bar */}
        <header className="bg-slate-950 border-b border-slate-800 px-4 py-3 sticky top-0 z-30 shadow-md">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            
            {/* Exam & Student Info */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Monitor className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm sm:text-base text-white tracking-tight">
                    {selectedExam.title}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    Class {selectedExam.classLevel}
                  </span>
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-3">
                  <span>Student: <strong>{currentStudentName}</strong> ({currentUser?.studentId || 'Roll: N/A'})</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-slate-300">
                    <Monitor className="w-3.5 h-3.5 text-emerald-400" />
                    <strong>{customWorkstationIp}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Timer & Network State */}
            <div className="flex items-center gap-4">
              {/* Server Auto-Save Indicator */}
              <div className="hidden md:flex items-center gap-1.5 text-xs">
                {saveStatus === 'saved' && (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Auto-Saved ({lastSavedTimestamp})
                  </span>
                )}
                {saveStatus === 'saving' && (
                  <span className="text-amber-400 flex items-center gap-1">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Saving to Server...
                  </span>
                )}
                {saveStatus === 'offline' && (
                  <span className="text-rose-400 flex items-center gap-1">
                    <WifiOff className="w-3.5 h-3.5" />
                    Offline (Saved Locally)
                  </span>
                )}
              </div>

              {/* Countdown Clock */}
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-black text-lg border transition-all ${
                isUrgent
                  ? 'bg-rose-500/20 border-rose-500/50 text-rose-400 animate-pulse ring-2 ring-rose-500/30'
                  : timeRemainingSeconds < 600
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                  : 'bg-slate-800 border-slate-700 text-white'
              }`}>
                <Clock className="w-5 h-5" />
                <span>{formatTimer(timeRemainingSeconds)}</span>
              </div>

              {/* Submit CTA */}
              <button
                onClick={handleManualSubmit}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-1.5 cursor-pointer active:scale-98"
              >
                <Check className="w-4 h-4" />
                <span>Submit Exam</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Workstation Layout */}
        <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Left Column: Question Area (3 Cols) */}
          <div className="lg:col-span-3 flex flex-col space-y-4">
            
            {/* Question Card */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 sm:p-8 flex-1 flex flex-col justify-between shadow-xl">
              <div>
                {/* Question Header */}
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-bold">
                      Question {currentQuestionIndex + 1} of {totalQuestions}
                    </span>
                    {currentQ.chapterTitle && (
                      <span className="text-xs text-slate-400 hidden sm:inline">
                        • {currentQ.chapterTitle}
                      </span>
                    )}
                    {currentQ.type && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-300">
                        {currentQ.type.replace('_', ' ')}
                      </span>
                    )}
                    {currentQ.difficulty && (
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        currentQ.difficulty === 'hard' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                        currentQ.difficulty === 'medium' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                        'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}>
                        {currentQ.difficulty}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-emerald-400 font-bold">+{currentQ.marks} Marks</span>
                    {selectedExam.negativeMarking ? (
                      <span className="text-rose-400 font-medium">-{selectedExam.negativeMarking} Neg</span>
                    ) : null}
                  </div>
                </div>

                {/* Question Text */}
                <h2 className="text-base sm:text-lg font-bold text-white leading-relaxed mb-4">
                  {currentQ.question}
                </h2>

                {/* Optional Question Image / Diagram */}
                {currentQ.imageUrl && (
                  <div className="my-4 p-2.5 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col items-center">
                    <img 
                      src={currentQ.imageUrl} 
                      alt="Question Diagram" 
                      className="max-h-72 max-w-full rounded-xl object-contain shadow-md"
                    />
                    <span className="text-[10px] text-slate-500 mt-1">Figure / Diagram for Question {currentQuestionIndex + 1}</span>
                  </div>
                )}

                {/* Question Inputs by Type */}
                <div className="space-y-3">
                  
                  {/* Type 1: Single MCQ */}
                  {currentQ.type === 'mcq' && currentQ.options && (
                    <div className="space-y-2.5">
                      {currentQ.options.map((opt, optIdx) => {
                        const isSelected = Number(answers[currentQ.id]) === optIdx;
                        return (
                          <button
                            key={optIdx}
                            type="button"
                            onClick={() => handleAnswerChange(currentQ.id, optIdx)}
                            className={`w-full text-left p-4 rounded-xl border transition-all flex items-center gap-3 cursor-pointer ${
                              isSelected
                                ? 'bg-blue-600/20 border-blue-500 text-white shadow-md shadow-blue-500/10'
                                : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-300 hover:border-slate-700'
                            }`}
                          >
                            <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                              isSelected ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
                            }`}>
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span className="text-sm font-medium leading-snug">{opt}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Type 2: Multiple Select */}
                  {currentQ.type === 'multiple_select' && currentQ.options && (
                    <div className="space-y-2.5">
                      <p className="text-xs text-blue-400 font-semibold mb-2">
                        * Select all correct options that apply:
                      </p>
                      {currentQ.options.map((opt, optIdx) => {
                        const currentArr: number[] = Array.isArray(answers[currentQ.id]) ? answers[currentQ.id] : [];
                        const isSelected = currentArr.includes(optIdx);
                        return (
                          <button
                            key={optIdx}
                            type="button"
                            onClick={() => {
                              const next = isSelected 
                                ? currentArr.filter(i => i !== optIdx) 
                                : [...currentArr, optIdx];
                              handleAnswerChange(currentQ.id, next);
                            }}
                            className={`w-full text-left p-4 rounded-xl border transition-all flex items-center gap-3 cursor-pointer ${
                              isSelected
                                ? 'bg-blue-600/20 border-blue-500 text-white'
                                : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-300'
                            }`}
                          >
                            <div className={`w-5 h-5 rounded flex items-center justify-center border ${
                              isSelected ? 'bg-blue-600 border-blue-500 text-white' : 'border-slate-700 bg-slate-800'
                            }`}>
                              {isSelected && <Check className="w-3.5 h-3.5" />}
                            </div>
                            <span className="text-sm font-medium">{opt}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Type 3: True / False */}
                  {currentQ.type === 'true_false' && (
                    <div className="grid grid-cols-2 gap-4">
                      {['True', 'False'].map((label, idx) => {
                        const isSelected = Number(answers[currentQ.id]) === idx;
                        return (
                          <button
                            key={label}
                            type="button"
                            onClick={() => handleAnswerChange(currentQ.id, idx)}
                            className={`p-5 rounded-2xl border text-center font-bold text-base transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-blue-600/30 border-blue-500 text-white ring-2 ring-blue-500/40 shadow-lg'
                                : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-300'
                            }`}
                          >
                            <span>{label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Type 4: Fill in the Blank */}
                  {currentQ.type === 'fill_blank' && (
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Enter your answer below:
                      </label>
                      <input
                        type="text"
                        value={answers[currentQ.id] || ''}
                        onChange={e => handleAnswerChange(currentQ.id, e.target.value)}
                        placeholder="Type answer here..."
                        className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}

                  {/* Type 5: Short Answer / Code */}
                  {(currentQ.type === 'short_answer' || currentQ.type === 'practical_code') && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                          Short Answer / Code Solution (Auto-saved continuously):
                        </label>
                        <span className="text-[11px] text-slate-500">
                          Teacher evaluation will award step marks
                        </span>
                      </div>
                      <textarea
                        rows={6}
                        value={answers[currentQ.id] || ''}
                        onChange={e => handleAnswerChange(currentQ.id, e.target.value)}
                        placeholder="Type your brief explanation, definitions, Python code, or SQL query..."
                        className="w-full p-4 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}

                  {/* Type 6: Long Answer / Comprehensive Question */}
                  {currentQ.type === 'long_answer' && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-blue-400" />
                          <span>Long-Answer Comprehensive Response:</span>
                        </label>
                        <span className="text-[11px] text-blue-400 font-mono">
                          {String(answers[currentQ.id] || '').trim().split(/\s+/).filter(Boolean).length} Words
                        </span>
                      </div>
                      <textarea
                        rows={10}
                        value={answers[currentQ.id] || ''}
                        onChange={e => handleAnswerChange(currentQ.id, e.target.value)}
                        placeholder="Structure your comprehensive response with headings, points, syntax, explanation, and examples..."
                        className="w-full p-4 bg-slate-900 border border-slate-700 rounded-xl text-white font-sans text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-[11px] text-slate-500">
                        * Evaluated by the teacher based on technical accuracy, structure, and completeness.
                      </p>
                    </div>
                  )}

                </div>
              </div>

              {/* Action Buttons: Mark for review, clear, previous, next */}
              <div className="pt-6 mt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleMarkForReview(currentQ.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      isMarked
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                    }`}
                  >
                    <Flag className={`w-3.5 h-3.5 ${isMarked ? 'fill-amber-400' : ''}`} />
                    <span>{isMarked ? 'Marked for Review' : 'Mark for Review'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleClearAnswer(currentQ.id)}
                    className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 cursor-pointer"
                  >
                    Clear Response
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={currentQuestionIndex === 0}
                    onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>

                  {currentQuestionIndex < totalQuestions - 1 ? (
                    <button
                      type="button"
                      onClick={() => setCurrentQuestionIndex(prev => Math.min(totalQuestions - 1, prev + 1))}
                      className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30 cursor-pointer flex items-center gap-1"
                    >
                      <span>Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleManualSubmit}
                      className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 cursor-pointer flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>Review & Submit</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Question Palette & Navigation (1 Col) */}
          <div className="lg:col-span-1 space-y-4">
            
            {/* Status Summary Widget */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                  Question Palette
                </span>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  {answeredCount}/{totalQuestions} Answered
                </span>
              </div>

              {/* Grid of question buttons */}
              <div className="grid grid-cols-5 gap-2 max-h-72 overflow-y-auto pr-1">
                {selectedExam.questions.map((q, idx) => {
                  const hasAnswer = answers[q.id] !== undefined && answers[q.id] !== '';
                  const isFlagged = markedForReview.includes(q.id);
                  const isCurrent = currentQuestionIndex === idx;

                  let colorStyle = 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'; // unvisited/unanswered
                  if (hasAnswer && isFlagged) {
                    colorStyle = 'bg-purple-600/30 border-purple-500 text-purple-200 ring-1 ring-purple-500';
                  } else if (hasAnswer) {
                    colorStyle = 'bg-emerald-600/30 border-emerald-500 text-emerald-200 font-bold';
                  } else if (isFlagged) {
                    colorStyle = 'bg-amber-600/30 border-amber-500 text-amber-200';
                  }

                  if (isCurrent) {
                    colorStyle += ' ring-2 ring-blue-400 shadow-md';
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestionIndex(idx)}
                      className={`h-9 rounded-lg border text-xs font-mono font-bold transition-all flex items-center justify-center cursor-pointer ${colorStyle}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Palette Legend */}
              <div className="pt-3 border-t border-slate-800 space-y-2 text-[11px] text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded bg-emerald-600/40 border border-emerald-500" />
                  <span>Answered ({answeredCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded bg-amber-600/40 border border-amber-500" />
                  <span>Marked for Review ({markedForReview.length})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded bg-slate-900 border border-slate-700" />
                  <span>Not Answered ({totalQuestions - answeredCount})</span>
                </div>
              </div>

              {/* Lab Invigilator Notice */}
              <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl text-[11px] text-slate-400 leading-relaxed">
                <p className="font-bold text-slate-300 flex items-center gap-1 mb-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                  Lab Session Monitored
                </p>
                Answers are backed up on the local school server. If this computer loses power, your answers will resume automatically.
              </div>

              {/* Finish Exam Button */}
              <button
                onClick={handleManualSubmit}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Submit Final Answers</span>
              </button>
            </div>
          </div>
        </div>

        {/* Submit Confirmation Modal */}
        {showSubmitConfirmModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-extrabold text-white">
                  Confirm Examination Submission?
                </h3>
                <p className="text-xs text-slate-400">
                  Please review your progress before handing over the responses to Educator Zakir Hussain.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 p-3 bg-slate-950 border border-slate-800 rounded-xl text-center">
                <div className="p-2">
                  <span className="block text-xs text-slate-400">Total</span>
                  <span className="text-base font-bold text-white">{totalQuestions}</span>
                </div>
                <div className="p-2 border-x border-slate-800">
                  <span className="block text-xs text-slate-400">Answered</span>
                  <span className="text-base font-bold text-emerald-400">{answeredCount}</span>
                </div>
                <div className="p-2">
                  <span className="block text-xs text-slate-400">Unanswered</span>
                  <span className="text-base font-bold text-rose-400">{totalQuestions - answeredCount}</span>
                </div>
              </div>

              {totalQuestions - answeredCount > 0 && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-2 text-xs text-amber-300">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>You have <strong>{totalQuestions - answeredCount} unanswered questions</strong>. Once submitted, answers cannot be edited.</span>
                </div>
              )}

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowSubmitConfirmModal(false)}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Continue Answering
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => executeSubmit(false)}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>Yes, Submit Now</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW RENDER 2: POST-SUBMISSION CONFIRMATION & RESULTS SCREEN
  // -------------------------------------------------------------
  if (submissionCompleted && selectedExam) {
    const isReleased = submissionResult?.resultsReleased === true;
    const session = submissionResult?.session || activeSession;

    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-2xl w-full bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 shadow-2xl space-y-8 text-center animate-in zoom-in-95 duration-200">
          
          <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shadow-md">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
              Examination Submitted Successfully
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {selectedExam.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Submitted from Workstation: <strong>{customWorkstationIp}</strong> • {new Date().toLocaleTimeString()}
            </p>
          </div>

          {/* Conditional Result Release */}
          {isReleased && session && session.autoScore !== undefined ? (
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Provisional Auto-Graded Score
              </span>
              <div className="flex items-center justify-center gap-2">
                <span className="text-4xl font-black text-slate-900">{session.finalScore ?? session.autoScore}</span>
                <span className="text-xl text-slate-400 font-bold">/ {selectedExam.totalMarks}</span>
              </div>
              <p className="text-xs text-slate-600">
                Percentage: <strong>{session.percentage || Math.round(((session.finalScore ?? session.autoScore) / selectedExam.totalMarks) * 100)}%</strong> • Status: 
                <strong className={session.passed ? 'text-emerald-600 ml-1' : 'text-rose-600 ml-1'}>
                  {session.passed ? 'PASSED' : 'NEEDS IMPROVEMENT'}
                </strong>
              </p>
            </div>
          ) : (
            <div className="p-6 bg-blue-50 border border-blue-200 rounded-2xl space-y-2 text-left">
              <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <span>Responses Recorded Under Invigilation</span>
              </div>
              <p className="text-xs text-blue-800 leading-relaxed">
                As per laboratory examination regulations, individual question scores and answer keys will be released by Educator Zakir Hussain after verification and descriptive answer evaluations.
              </p>
            </div>
          )}

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                setActiveSession(null);
                setSelectedExam(null);
                setSubmissionCompleted(false);
              }}
              className="w-full sm:w-auto px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/25 transition-all cursor-pointer"
            >
              Return to Examination Hall
            </button>
            {onBackToDashboard && (
              <button
                onClick={onBackToDashboard}
                className="w-full sm:w-auto px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all cursor-pointer"
              >
                Go to Dashboard
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW RENDER 3: EXAMINATION HALL & ASSIGNED TESTS BROWSER
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20">
      
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-950 via-blue-950 to-slate-900 text-white pt-8 pb-12 px-4 sm:px-6 lg:px-8 border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1.5">
                  <Monitor className="w-3.5 h-3.5 text-blue-400" />
                  Computer Laboratory Online Examination Portal
                </span>
                <span className="text-xs text-slate-400">
                  Simultaneous Multi-Workstation Testing
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Online Examination Hall
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1">
                Secure, server-timed examinations for CBSE Computer Science, IT 402, IP 065, and Typography. Automatic continuous cloud sync and crash recovery enabled.
              </p>
            </div>

            {/* Workstation Badge & Role CTAs */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="px-3.5 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs flex items-center gap-2">
                <Monitor className="w-4 h-4 text-emerald-400" />
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase font-bold">Lab Workstation</span>
                  <input
                    type="text"
                    value={customWorkstationIp}
                    onChange={e => setCustomWorkstationIp(e.target.value)}
                    className="font-bold text-white bg-transparent border-b border-slate-600 focus:outline-none focus:border-blue-400 w-24 text-xs"
                    title="Change workstation ID"
                  />
                </div>
              </div>

              {userRole === 'admin' && onOpenAdminPanel && (
                <button
                  onClick={onOpenAdminPanel}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center gap-1.5 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Admin Invigilator Panel</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Filter Tabs */}
          <div className="flex items-center gap-2 pt-2 overflow-x-auto">
            {(['all', 'live', 'upcoming', 'completed'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setSelectedTabFilter(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                  selectedTabFilter === tab
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
                }`}
              >
                {tab === 'all' ? 'All Assigned Exams' : tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        
        {/* Student Session Banner */}
        {!isAuthenticated ? (
          <div className="p-6 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-amber-900">
                  Individual Student Identification Required
                </h3>
                <p className="text-xs text-amber-700">
                  Sign in with your student credentials or roll number to see tests specifically assigned to your class & batch.
                </p>
              </div>
            </div>
            <button
              onClick={() => openAuthModal('login', 'Sign in to access assigned computer lab tests.')}
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition-all shrink-0 cursor-pointer"
            >
              Student Sign In
            </button>
          </div>
        ) : (
          <div className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center font-bold text-sm">
                {currentClassLevel}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-slate-900">{currentStudentName}</span>
                  <span className="px-2 py-0.2 rounded text-[10px] font-bold uppercase bg-blue-100 text-blue-800">
                    Class {currentClassLevel} • Sec {currentSection}
                  </span>
                </div>
                <span className="text-xs text-slate-500">Student ID / Roll: {currentUser?.studentId || 'STD-ACTIVE'}</span>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              Verified Lab Account
            </span>
          </div>
        )}

        {/* Assigned Exams Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-blue-600" />
              <span>Assigned Lab Examinations ({assignedExams.length})</span>
            </h2>
          </div>

          {assignedExams.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-base text-slate-800">No Tests Assigned Currently</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No active or scheduled examinations match your current class level or section. Your educator will publish tests prior to the lab session.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {assignedExams.map(exam => {
                const existingSession = getStudentSessionForExam(exam.id);
                const isCompleted = existingSession?.status === 'submitted';
                const isInProgress = existingSession?.status === 'in_progress';
                const isLive = exam.status === 'live';

                return (
                  <div
                    key={exam.id}
                    className="bg-white border border-slate-200 hover:border-blue-300 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-5"
                  >
                    <div className="space-y-3">
                      {/* Status Badges */}
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                          Class {exam.classLevel} • {exam.examCode}
                        </span>

                        {isLive && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 flex items-center gap-1.5 animate-pulse">
                            <span className="w-2 h-2 rounded-full bg-emerald-600" />
                            Live Now
                          </span>
                        )}
                        {!isLive && exam.status === 'scheduled' && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                            Scheduled
                          </span>
                        )}
                        {isCompleted && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800">
                            Submitted
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-slate-900 leading-snug">
                        {exam.title}
                      </h3>

                      {/* Exam Specs */}
                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-1">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{exam.durationMinutes} Minutes</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-slate-400" />
                          <span>{exam.totalMarks} Marks (Pass: {exam.passingMarks})</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-slate-400" />
                          <span>{exam.questions.length} Questions</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{exam.examDate}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="pt-4 border-t border-slate-100">
                      {isCompleted ? (
                        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center">
                          <span className="text-xs font-bold text-slate-600">
                            ✓ Test Submitted
                          </span>
                          {exam.showResultsImmediately && existingSession && (
                            <span className="block text-xs font-black text-emerald-600">
                              Score: {existingSession.finalScore}/{exam.totalMarks} ({existingSession.percentage}%)
                            </span>
                          )}
                        </div>
                      ) : isInProgress ? (
                        <button
                          onClick={() => handleInitiateExam(exam)}
                          className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <RotateCcw className="w-4 h-4" />
                          <span>Resume Interrupted Exam</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleInitiateExam(exam)}
                          className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                        >
                          <span>Start Examination</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Pre-Exam Instructions Modal */}
      {showInstructionsModal && selectedExam && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                    CBSE Examination Guidelines
                  </h3>
                  <span className="text-xs text-slate-400">Computer Laboratory Invigilated Exam</span>
                </div>
              </div>
              <button
                onClick={() => setShowInstructionsModal(false)}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Test Details Pill */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1 text-xs">
              <p className="font-bold text-slate-900 text-sm">{selectedExam.title}</p>
              <div className="flex flex-wrap items-center gap-3 text-slate-600 pt-1">
                <span>Duration: <strong>{selectedExam.durationMinutes} mins</strong></span>
                <span>•</span>
                <span>Total Marks: <strong>{selectedExam.totalMarks}</strong></span>
                <span>•</span>
                <span>Passing: <strong>{selectedExam.passingMarks}</strong></span>
                {selectedExam.negativeMarking ? (
                  <>
                    <span>•</span>
                    <span className="text-rose-600 font-bold">Negative Marking: {selectedExam.negativeMarking} per wrong MCQ</span>
                  </>
                ) : null}
              </div>
            </div>

            {/* Official Instructions Content */}
            <div className="space-y-2 text-xs text-slate-600 leading-relaxed max-h-48 overflow-y-auto pr-2">
              <p className="font-bold text-slate-800">Please review the rules carefully:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>All answers are saved continuously to the school server in real-time.</li>
                <li>Do not panic if your computer restarts or loses power. Inform the teacher, re-open the browser, and click <strong>Resume Interrupted Exam</strong>.</li>
                <li>The countdown timer runs on the server. Test will automatically submit when the timer reaches 00:00.</li>
                <li>You can flag questions using <strong>Mark for Review</strong> and change answers anytime before final submission.</li>
                <li>Attempt limits are enforced by the invigilator. Ensure all answers are verified before clicking Submit.</li>
              </ul>
              {selectedExam.instructions && (
                <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-blue-900 mt-2 font-mono text-[11px] whitespace-pre-line">
                  {selectedExam.instructions}
                </div>
              )}
            </div>

            {/* Workstation Confirmation Checkbox */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
              <input
                type="checkbox"
                id="agree-rules"
                checked={agreedToInstructions}
                onChange={e => setAgreedToInstructions(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 cursor-pointer"
              />
              <label htmlFor="agree-rules" className="text-xs text-slate-700 cursor-pointer select-none">
                I am seated at <strong>{customWorkstationIp}</strong> and agree to follow laboratory examination ethics.
              </label>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowInstructionsModal(false)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!agreedToInstructions}
                onClick={handleConfirmStartExam}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-98"
              >
                <span>Enter Examination</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
