import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  HelpCircle, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Award, 
  RotateCcw, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  Flag, 
  Eye, 
  Printer, 
  Play, 
  SlidersHorizontal,
  Flame,
  Check,
  Bookmark,
  BookmarkCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { CLASSES_LIST, getSubjectsForClass, getChapters, SUBJECTS_LIST } from '../../data/curriculumData';
import { 
  ClassLevel, 
  SubjectId, 
  QuizMode, 
  Question, 
  QuizConfig, 
  QuizAttempt, 
  QuestionDifficulty 
} from '../../types';
import { QuizCountdownTimer } from '../QuizCountdownTimer';
import { SEO } from '../SEO';

interface QuizViewProps {
  initialQuizToStart?: QuizConfig | null;
  onClearInitialQuiz?: () => void;
  onViewCertificate: (attempt: QuizAttempt) => void;
  onNavigateToDashboard?: () => void;
}

export const QuizView: React.FC<QuizViewProps> = ({
  initialQuizToStart,
  onClearInitialQuiz,
  onViewCertificate,
  onNavigateToDashboard
}) => {
  const { 
    isAuthenticated,
    openAuthModal,
    quizzes, 
    questionBank, 
    recordQuizAttempt, 
    studentProfile, 
    selectedClassFilter,
    toggleQuestionBookmark 
  } = useApp();

  // Test setup states
  const [selectedClass, setSelectedClass] = useState<ClassLevel>(
    selectedClassFilter !== 'ALL' ? selectedClassFilter : 'X'
  );
  const [selectedSubject, setSelectedSubject] = useState<SubjectId>('it-402');
  const [selectedChapter, setSelectedChapter] = useState<string>('ALL');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | QuestionDifficulty>('all');
  const [quizMode, setQuizMode] = useState<QuizMode>('practice');
  const [questionCount, setQuestionCount] = useState<number>(5);

  // Active Test Engine States
  const [isTestActive, setIsTestActive] = useState<boolean>(false);
  const [activeQuizTitle, setActiveQuizTitle] = useState<string>('');
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<string, boolean>>({});
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number>(600);
  const [totalTimeSeconds, setTotalTimeSeconds] = useState<number>(600);

  // Practice mode reveal state: questionId -> boolean
  const [practiceRevealed, setPracticeRevealed] = useState<Record<string, boolean>>({});

  // Result & Review States
  const [latestAttempt, setLatestAttempt] = useState<QuizAttempt | null>(null);
  const [isReviewMode, setIsReviewMode] = useState<boolean>(false);
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);
  const [isAutoSubmittedOnTimeout, setIsAutoSubmittedOnTimeout] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Synchronize available subjects when class changes
  const availableSubjects = useMemo(() => {
    return getSubjectsForClass(selectedClass);
  }, [selectedClass]);

  useEffect(() => {
    if (availableSubjects.length > 0 && !availableSubjects.some(s => s.id === selectedSubject)) {
      setSelectedSubject(availableSubjects[0].id);
      setSelectedChapter('ALL');
    }
  }, [availableSubjects, selectedSubject]);

  const availableChapters = useMemo(() => {
    return getChapters(selectedClass, selectedSubject);
  }, [selectedClass, selectedSubject]);

  // If passed an initial quiz from outside
  useEffect(() => {
    if (initialQuizToStart) {
      startPrebuiltQuiz(initialQuizToStart);
      if (onClearInitialQuiz) onClearInitialQuiz();
    }
  }, [initialQuizToStart]);

  // Trigger celebratory confetti on high score
  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // Ignore if unavailable
    }
  };

  const executeStartPrebuiltQuiz = (quiz: QuizConfig) => {
    setActiveQuizTitle(quiz.title);
    setActiveQuestions(quiz.questions);
    setQuizMode(quiz.mode);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setFlaggedQuestions({});
    setPracticeRevealed({});
    const seconds = quiz.timeLimitMinutes * 60;
    setTimeRemainingSeconds(seconds);
    setTotalTimeSeconds(seconds);
    setLatestAttempt(null);
    setIsReviewMode(false);
    setIsAutoSubmittedOnTimeout(false);
    setIsTestActive(true);
  };

  const startPrebuiltQuiz = (quiz: QuizConfig) => {
    if (!isAuthenticated) {
      openAuthModal(
        'login',
        'Login Required: Please sign in or create an account to start timed examination sessions and save results to your scorecard.',
        () => executeStartPrebuiltQuiz(quiz)
      );
      return;
    }
    executeStartPrebuiltQuiz(quiz);
  };

  const executeStartCustomQuiz = () => {
    // Filter questions from bank
    let pool = questionBank.filter(q => q.classLevel === selectedClass && q.subjectId === selectedSubject);
    if (selectedChapter !== 'ALL') {
      pool = pool.filter(q => q.chapterId === selectedChapter);
    }
    if (selectedDifficulty !== 'all') {
      pool = pool.filter(q => q.difficulty === selectedDifficulty);
    }

    if (pool.length === 0) {
      pool = questionBank.filter(q => q.classLevel === selectedClass);
    }

    if (pool.length === 0) {
      alert(`No questions currently available for Class ${selectedClass} with these filters. Please select Class X or XII or choose a featured test.`);
      return;
    }

    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(questionCount, shuffled.length));

    const title = `Class ${selectedClass} ${selectedSubject.toUpperCase()} ${
      selectedChapter !== 'ALL' ? 'Chapter' : 'Comprehensive'
    } Test`;

    setActiveQuizTitle(title);
    setActiveQuestions(selected);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setFlaggedQuestions({});
    setPracticeRevealed({});
    const duration = Math.max(5, selected.length * 2) * 60;
    setTimeRemainingSeconds(duration);
    setTotalTimeSeconds(duration);
    setLatestAttempt(null);
    setIsReviewMode(false);
    setIsAutoSubmittedOnTimeout(false);
    setIsTestActive(true);
  };

  const startCustomQuiz = () => {
    if (!isAuthenticated) {
      openAuthModal(
        'login',
        'Login Required: Please sign in or create an account to start timed examination sessions and save results to your scorecard.',
        () => executeStartCustomQuiz()
      );
      return;
    }
    executeStartCustomQuiz();
  };

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    setUserAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
    if (quizMode === 'practice') {
      setPracticeRevealed(prev => ({ ...prev, [questionId]: true }));
    }
  };

  const handleToggleFlag = (questionId: string) => {
    setFlaggedQuestions(prev => ({ ...prev, [questionId]: !prev[questionId] }));
  };

  const handleFinishTest = (isTimeout: boolean = false) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setShowSubmitModal(false);
    setIsAutoSubmittedOnTimeout(isTimeout);

    // Calculate score
    let score = 0;
    let correctCount = 0;
    const totalMarks = activeQuestions.reduce((acc, q) => acc + q.marks, 0);

    activeQuestions.forEach(q => {
      const selected = userAnswers[q.id];
      if (selected !== undefined && selected === q.correctOptionIndex) {
        score += q.marks;
        correctCount += 1;
      }
    });

    const percentage = totalMarks > 0 ? (score / totalMarks) * 100 : 0;
    const timeSpent = totalTimeSeconds - timeRemainingSeconds;

    const attempt = recordQuizAttempt({
      quizId: `custom-test-${Date.now()}`,
      quizTitle: activeQuizTitle,
      classLevel: activeQuestions[0]?.classLevel || selectedClass,
      subjectId: activeQuestions[0]?.subjectId || selectedSubject,
      chapterTitle: activeQuestions[0]?.chapterTitle || 'Multiple Chapters',
      mode: quizMode,
      score,
      totalMarks,
      percentage,
      timeSpentSeconds: Math.max(15, timeSpent),
      totalQuestions: activeQuestions.length,
      correctAnswersCount: correctCount,
      userAnswers,
      questionDetails: activeQuestions
    });

    setLatestAttempt(attempt);
    setIsTestActive(false);

    if (percentage >= 70) {
      triggerConfetti();
    }
  };

  const currentQ = activeQuestions[currentQuestionIndex];
  const isAnswered = currentQ ? userAnswers[currentQ.id] !== undefined : false;
  const isFlagged = currentQ ? !!flaggedQuestions[currentQ.id] : false;

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // -------------------------------------------------------------
  // RENDER 1: RESULT & SCORECARD SCREEN
  // -------------------------------------------------------------
  if (!isTestActive && latestAttempt && !isReviewMode) {
    const passed = latestAttempt.percentage >= 60;
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-8 animate-in fade-in duration-200">
        <SEO
          title={`Scorecard: ${latestAttempt.quizTitle} (${latestAttempt.percentage}%)`}
          description={`Evaluation results for ${latestAttempt.quizTitle}. Scored ${latestAttempt.score}/${latestAttempt.totalMarks} marks.`}
        />
        {/* Scorecard Hero */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden text-center p-8 sm:p-12 relative">
          {/* Auto-Submit Notice if expired */}
          {isAutoSubmittedOnTimeout && (
            <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 flex items-center justify-center gap-2.5 text-xs font-bold animate-in fade-in">
              <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
              <span>Exam Time Expired: Your test was automatically locked and submitted for evaluation under CBSE timed rules.</span>
            </div>
          )}

          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Assessment Evaluation Complete</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-1">
            Test Result
          </h2>
          <p className="text-sm font-semibold text-blue-600 mb-6">
            {latestAttempt.quizTitle}
          </p>

          {/* Big Score Display */}
          <div className="flex flex-col items-center justify-center mb-6">
            <div className={`w-36 h-36 rounded-full flex flex-col items-center justify-center border-8 shadow-inner ${
              passed ? 'border-emerald-500 bg-emerald-50 text-emerald-900' : 'border-amber-500 bg-amber-50 text-amber-900'
            }`}>
              <span className="text-3xl font-black">{latestAttempt.score} / {latestAttempt.totalMarks}</span>
              <span className="text-base font-extrabold text-emerald-700 mt-0.5">
                {latestAttempt.percentage.toFixed(0)}%
              </span>
            </div>
          </div>

          {/* Statistics Table */}
          <div className="max-w-md mx-auto mb-8 bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="bg-slate-100/80 px-4 py-2.5 border-b border-slate-200 flex justify-between items-center text-xs font-bold text-slate-700 uppercase tracking-wider">
              <span>Statistics</span>
              <span>Result</span>
            </div>
            <div className="divide-y divide-slate-100 text-xs text-left">
              <div className="px-4 py-2.5 flex justify-between items-center">
                <span className="font-semibold text-slate-700 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  Correct
                </span>
                <span className="font-bold text-emerald-700">{latestAttempt.correctAnswersCount}</span>
              </div>
              <div className="px-4 py-2.5 flex justify-between items-center">
                <span className="font-semibold text-slate-700 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  Incorrect
                </span>
                <span className="font-bold text-rose-700">
                  {Object.keys(latestAttempt.userAnswers).length - latestAttempt.correctAnswersCount}
                </span>
              </div>
              <div className="px-4 py-2.5 flex justify-between items-center">
                <span className="font-semibold text-slate-700 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
                  Unattempted
                </span>
                <span className="font-bold text-slate-600">
                  {Math.max(0, latestAttempt.totalQuestions - Object.keys(latestAttempt.userAnswers).length)}
                </span>
              </div>
              <div className="px-4 py-2.5 flex justify-between items-center bg-blue-50/40">
                <span className="font-semibold text-slate-700 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  Time Taken
                </span>
                <span className="font-bold text-blue-700">
                  {Math.floor(latestAttempt.timeSpentSeconds / 60)}:{(latestAttempt.timeSpentSeconds % 60).toString().padStart(2, '0')}
                </span>
              </div>
            </div>
          </div>

          {/* Action CTAs: Review Answers, Try Another Test, Back to Dashboard */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setIsReviewMode(true)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              <span>Review Answers</span>
            </button>

            <button
              onClick={() => {
                setLatestAttempt(null);
                setIsReviewMode(false);
              }}
              className="flex items-center gap-2 px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Try Another Test</span>
            </button>

            {onNavigateToDashboard && (
              <button
                onClick={onNavigateToDashboard}
                className="flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
              >
                <span>Back to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {passed && (
              <button
                onClick={() => onViewCertificate(latestAttempt)}
                className="flex items-center gap-1.5 px-4 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-md shadow-amber-500/20 transition-all cursor-pointer"
              >
                <Award className="w-4 h-4" />
                <span>Certificate</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER 2: DETAILED REVIEW SCREEN
  // -------------------------------------------------------------
  if (latestAttempt && isReviewMode) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Question-by-Question Solution Review
            </h2>
            <p className="text-xs text-slate-500">
              {latestAttempt.quizTitle} • Score: {latestAttempt.score}/{latestAttempt.totalMarks}
            </p>
          </div>
          <button
            onClick={() => setIsReviewMode(false)}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 text-white text-xs font-semibold rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Scorecard</span>
          </button>
        </div>

        <div className="space-y-4">
          {latestAttempt.questionDetails.map((q, idx) => {
            const userAnswer = latestAttempt.userAnswers[q.id];
            const isCorrect = userAnswer === q.correctOptionIndex;
            const isSkipped = userAnswer === undefined;

            return (
              <div
                key={q.id}
                className={`p-6 rounded-2xl bg-white border ${
                  isCorrect
                    ? 'border-emerald-200'
                    : isSkipped
                    ? 'border-amber-200'
                    : 'border-rose-200'
                } shadow-xs space-y-4`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {q.chapterTitle}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-medium">{q.marks} Mark</span>
                    {(() => {
                      const isBookmarked = (studentProfile.bookmarkedQuestions || []).includes(q.id);
                      return (
                        <button
                          onClick={() => toggleQuestionBookmark(q.id)}
                          className={`p-1 rounded-md transition-colors ${
                            isBookmarked
                              ? 'text-amber-500 bg-amber-50'
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
                    {isCorrect ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle className="w-3.5 h-3.5" /> Correct (+{q.marks})
                      </span>
                    ) : isSkipped ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                        <AlertCircle className="w-3.5 h-3.5" /> Unattempted
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                        <XCircle className="w-3.5 h-3.5" /> Incorrect
                      </span>
                    )}
                  </div>
                </div>

                <p className="font-semibold text-slate-900 text-base leading-relaxed">
                  {q.question}
                </p>

                {/* 4 Options breakdown */}
                <div className="space-y-2">
                  {q.options.map((opt, optIdx) => {
                    const isPickedByUser = userAnswer === optIdx;
                    const isRightAnswer = q.correctOptionIndex === optIdx;

                    let optClass = 'bg-slate-50 border-slate-200 text-slate-700';
                    if (isRightAnswer) {
                      optClass = 'bg-emerald-50 border-emerald-400 text-emerald-900 font-semibold';
                    } else if (isPickedByUser && !isRightAnswer) {
                      optClass = 'bg-rose-50 border-rose-400 text-rose-900 line-through';
                    }

                    return (
                      <div
                        key={optIdx}
                        className={`p-3 rounded-xl border text-xs flex items-center justify-between ${optClass}`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="font-bold">
                            {String.fromCharCode(65 + optIdx)}.
                          </span>
                          <span>{opt}</span>
                        </div>
                        <div>
                          {isRightAnswer && (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded">
                              ✓ Correct Answer
                            </span>
                          )}
                          {isPickedByUser && !isRightAnswer && (
                            <span className="text-[10px] font-bold text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded ml-1">
                              ✕ Your Choice
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pedagogical Explanation */}
                <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-950 space-y-1">
                  <div className="flex items-center gap-1 font-bold text-blue-800">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>Zakir Sir's Concept Explanation:</span>
                  </div>
                  <p className="leading-relaxed pl-4">{q.explanation}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER 3: ACTIVE TEST ENGINE SCREEN
  // -------------------------------------------------------------
  if (isTestActive && currentQ) {
    const isPracticeRevealed = !!practiceRevealed[currentQ.id];
    const isLastQuestion = currentQuestionIndex === activeQuestions.length - 1;

    return (
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <SEO
          title={`Active Test: ${activeQuizTitle || 'Board Practice Test'}`}
          description="Interactive timed examination session on Zakir Learning Hub."
        />
        {/* Test Header Bar */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-2xl shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                quizMode === 'exam' ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'
              }`}>
                {quizMode === 'exam' ? 'Timed Exam Mode' : 'Practice & Learn Mode'}
              </span>
              <span className="text-xs text-slate-300 font-medium">
                {currentQ.chapterTitle}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold truncate max-w-md">
              {activeQuizTitle}
            </h2>
          </div>

          <div className="flex items-center gap-4 self-end sm:self-auto">
            {/* Real-time Countdown Timer (with auto-submit enforcement on 00:00) */}
            {quizMode === 'exam' && (
              <QuizCountdownTimer
                totalSeconds={totalTimeSeconds}
                initialRemainingSeconds={timeRemainingSeconds}
                isActive={isTestActive}
                isExamMode={true}
                onTimeExpired={() => handleFinishTest(true)}
                onTick={(remaining) => setTimeRemainingSeconds(remaining)}
              />
            )}

            <button
              onClick={() => setShowSubmitModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition-colors shrink-0"
            >
              Submit Test
            </button>
          </div>
        </div>

        {/* Question Progress and Grid Palette */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Question Card (3 columns) */}
          <div className="lg:col-span-3 space-y-5">
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              {/* Question metadata */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                  Question {currentQuestionIndex + 1} of {activeQuestions.length}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-slate-400">
                    Marks: {currentQ.marks}
                  </span>
                  <button
                    onClick={() => handleToggleFlag(currentQ.id)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                      isFlagged
                        ? 'bg-amber-100 text-amber-800 font-semibold'
                        : 'text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    <Flag className={`w-3.5 h-3.5 ${isFlagged ? 'fill-amber-500' : ''}`} />
                    <span>{isFlagged ? 'Flagged for Review' : 'Mark Review'}</span>
                  </button>
                </div>
              </div>

              {/* Question Prompt */}
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-relaxed">
                  {currentQ.question}
                </h3>
              </div>

              {/* 4 Interactive Options */}
              <div className="space-y-3">
                {currentQ.options.map((opt, optIndex) => {
                  const isSelected = userAnswers[currentQ.id] === optIndex;
                  const isCorrect = currentQ.correctOptionIndex === optIndex;

                  let optionBorder = 'border-slate-200 hover:border-blue-400 hover:bg-blue-50/30';
                  let optionBadge = 'bg-slate-100 text-slate-700';

                  if (quizMode === 'practice' && isPracticeRevealed) {
                    if (isCorrect) {
                      optionBorder = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold shadow-xs';
                      optionBadge = 'bg-emerald-600 text-white';
                    } else if (isSelected && !isCorrect) {
                      optionBorder = 'border-rose-500 bg-rose-50 text-rose-950';
                      optionBadge = 'bg-rose-600 text-white';
                    }
                  } else if (isSelected) {
                    optionBorder = 'border-blue-600 bg-blue-50/70 text-blue-900 font-semibold shadow-xs';
                    optionBadge = 'bg-blue-600 text-white';
                  }

                  return (
                    <div
                      key={optIndex}
                      onClick={() => handleSelectOption(currentQ.id, optIndex)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${optionBorder}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 transition-colors ${optionBadge}`}>
                          {String.fromCharCode(65 + optIndex)}
                        </span>
                        <span className="text-sm font-medium leading-snug">{opt}</span>
                      </div>

                      {quizMode === 'practice' && isPracticeRevealed && isCorrect && (
                        <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                      )}
                      {quizMode === 'practice' && isPracticeRevealed && isSelected && !isCorrect && (
                        <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Immediate Feedback in Practice Mode */}
              {quizMode === 'practice' && isPracticeRevealed && (
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-950 space-y-2 animate-in fade-in duration-200">
                  <div className="flex items-center gap-1.5 font-bold text-blue-800">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span>Zakir Sir's Concept Clarification:</span>
                  </div>
                  <p className="leading-relaxed">{currentQ.explanation}</p>
                </div>
              )}

              {/* Navigation Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  disabled={currentQuestionIndex === 0}
                  onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                {isLastQuestion ? (
                  <button
                    onClick={() => setShowSubmitModal(true)}
                    className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all"
                  >
                    <span>Submit Exam</span>
                    <Check className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                    className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all"
                  >
                    <span>Next Question</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Question Navigator Palette (1 column) */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Question Palette
              </h4>

              {/* Grid of numbers */}
              <div className="grid grid-cols-5 gap-2">
                {activeQuestions.map((q, idx) => {
                  const answered = userAnswers[q.id] !== undefined;
                  const flagged = !!flaggedQuestions[q.id];
                  const isCurrent = idx === currentQuestionIndex;

                  let cellColor = 'bg-slate-100 text-slate-700 hover:bg-slate-200';
                  if (answered) cellColor = 'bg-emerald-600 text-white font-bold';
                  if (flagged) cellColor = 'bg-amber-500 text-white font-bold';
                  if (isCurrent) cellColor += ' ring-2 ring-blue-600 ring-offset-2';

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestionIndex(idx)}
                      className={`h-9 rounded-lg text-xs font-medium transition-all ${cellColor}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="pt-4 border-t border-slate-100 space-y-2 text-[11px] text-slate-500">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-emerald-600"></span>
                  <span>Answered ({Object.keys(userAnswers).length})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-amber-500"></span>
                  <span>Flagged for Review ({Object.values(flaggedQuestions).filter(Boolean).length})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-slate-200"></span>
                  <span>Remaining ({activeQuestions.length - Object.keys(userAnswers).length})</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Confirmation Modal */}
        {showSubmitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">Confirm Test Submission</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                You have answered <strong className="text-slate-900">{Object.keys(userAnswers).length}</strong> out of{' '}
                <strong className="text-slate-900">{activeQuestions.length}</strong> questions.
                {quizMode === 'exam' && (
                  <span> You still have {formatTimer(timeRemainingSeconds)} remaining.</span>
                )}
              </p>
              <p className="text-xs text-slate-500">
                Once submitted, your final score and performance report will be generated immediately.
              </p>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Resume Test
                </button>
                <button
                  onClick={() => handleFinishTest(false)}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20"
                >
                  Confirm & Submit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER 4: QUIZ CATALOG & TEST GENERATOR SETUP
  // -------------------------------------------------------------
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <SEO
        title={
          selectedClass !== 'ALL'
            ? `Class ${selectedClass} Online Quizzes & Mock Tests`
            : 'Online Quizzes & Board Mock Tests'
        }
        description="Practice timed chapter-wise online tests with instant scorecards, CBSE concept explanations, and verified certificates."
        keywords={['Online Quiz', 'CBSE Mock Test', 'MCQ Practice', 'IT 402 Quiz', 'IP 065 Test', 'Zakir Hussain']}
      />
      {/* Title */}
      <div className="border-b border-slate-200 pb-6">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">
          <HelpCircle className="w-4 h-4" />
          <span>Interactive Assessment Engine</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-900">
          Online Quiz & MCQ Test Center
        </h1>
        <p className="text-sm text-slate-500 mt-1 max-w-2xl">
          Test your preparation with authentic CBSE board format questions. Get instant scores, detailed pedagogical feedback, and earn shareable achievement certificates.
        </p>
      </div>

      {/* Featured Ready-to-Take Quizzes */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-500" />
            <span>Featured Mock Tests & Quizzes</span>
          </h2>
          <span className="text-xs text-slate-400 font-medium">Curated by Zakir Sir</span>
        </div>

        {quizzes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8 shadow-xs">
            <HelpCircle className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <h3 className="text-base font-bold text-slate-800">No Tests Published Yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Curated tests created and published by Mr. Zakir Hussain will appear here. You can also build interactive practice tests using the Custom Builder below!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {quizzes.map(qz => (
              <div
                key={qz.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2 py-0.5 text-xs font-bold bg-blue-100 text-blue-800 rounded">
                      Class {qz.classLevel}
                    </span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded ${
                      qz.mode === 'exam' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {qz.mode === 'exam' ? 'Exam Mode (Timed)' : 'Practice Mode'}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base mb-2">
                    {qz.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-4">
                    {qz.description}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {qz.timeLimitMinutes} mins
                    </span>
                    <span className="flex items-center gap-1">
                      <HelpCircle className="w-3.5 h-3.5" />
                      {qz.questions.length} MCQs
                    </span>
                    <span className="flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" />
                      {qz.totalMarks} Marks
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => startPrebuiltQuiz(qz)}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Start Test Now</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Custom Quiz & Practice Builder (As specified by user) */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-10 shadow-xl space-y-6">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-emerald-400" />
          <h2 className="text-2xl font-bold tracking-tight">
            Build a Custom Chapter Quiz
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
          Customize your practice session by choosing Class, Subject, specific Chapter, difficulty level, and test mode.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {/* 1. Class */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              1. Select Class
            </label>
            <select
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value as ClassLevel)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-hidden focus:border-emerald-400"
            >
              {CLASSES_LIST.map(c => (
                <option key={c.level} value={c.level}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Subject */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              2. Select Subject
            </label>
            <select
              value={selectedSubject}
              onChange={e => setSelectedSubject(e.target.value as SubjectId)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-hidden focus:border-emerald-400"
            >
              {availableSubjects.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>

          {/* 3. Chapter */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              3. Select Chapter
            </label>
            <select
              value={selectedChapter}
              onChange={e => setSelectedChapter(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-hidden focus:border-emerald-400"
            >
              <option value="ALL">All Available Chapters</option>
              {availableChapters.map(ch => (
                <option key={ch.id} value={ch.id}>
                  Ch {ch.chapterNumber}: {ch.title}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Difficulty */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              4. Difficulty
            </label>
            <select
              value={selectedDifficulty}
              onChange={e => setSelectedDifficulty(e.target.value as any)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-hidden focus:border-emerald-400"
            >
              <option value="all">Mixed (Easy / Med / Hard)</option>
              <option value="easy">Easy (Foundational)</option>
              <option value="medium">Medium (Standard Board)</option>
              <option value="hard">Hard (Advanced Application)</option>
            </select>
          </div>
        </div>

        {/* Mode Selector and Action */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-bold uppercase">Test Mode:</span>
            <div className="inline-flex rounded-xl bg-slate-800 p-1 border border-slate-700">
              <button
                onClick={() => setQuizMode('practice')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  quizMode === 'practice'
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Practice Mode (Instant Answers)
              </button>
              <button
                onClick={() => setQuizMode('exam')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  quizMode === 'exam'
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Exam Mode (Timer + Final Result)
              </button>
            </div>
          </div>

          <button
            onClick={startCustomQuiz}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all hover:scale-102"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>Generate & Launch Test</span>
          </button>
        </div>
      </div>
    </div>
  );
};
