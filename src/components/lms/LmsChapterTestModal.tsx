import React, { useState, useEffect } from 'react';
import { 
  X, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Award, 
  ChevronLeft, 
  ChevronRight, 
  Send, 
  RotateCcw,
  Sparkles,
  HelpCircle,
  FileCheck
} from 'lucide-react';
import { LearningResource } from '../../types';

interface LmsChapterTestModalProps {
  resource: LearningResource | null;
  onClose: () => void;
}

export const LmsChapterTestModal: React.FC<LmsChapterTestModalProps> = ({ resource, onClose }) => {
  if (!resource || !resource.mcqItems || resource.mcqItems.length === 0) return null;

  const questions = resource.mcqItems;
  const durationMinutes = resource.testDurationMinutes || 15;
  const passingMarks = resource.passingMarks || Math.ceil(questions.length * 0.4);
  const totalMarks = resource.totalMarks || questions.length;

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(durationMinutes * 60);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState<boolean>(false);

  // Countdown timer
  useEffect(() => {
    if (isSubmitted) return;
    if (timeLeftSeconds <= 0) {
      handleSubmitTest();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeftSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeftSeconds, isSubmitted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectAnswer = (optionIdx: number) => {
    if (isSubmitted) return;
    setSelectedAnswers(prev => ({ ...prev, [currentIndex]: optionIdx }));
  };

  const handleSubmitTest = () => {
    setShowConfirmSubmit(false);
    setIsSubmitted(true);
  };

  // Score calculation
  const correctCount = Object.entries(selectedAnswers).reduce((count, [idx, ans]) => {
    const q = questions[Number(idx)];
    return q && q.correctOptionIndex === ans ? count + 1 : count;
  }, 0);

  const finalScore = correctCount; // 1 mark per question
  const percentage = Math.round((finalScore / questions.length) * 100);
  const isPassed = finalScore >= passingMarks;

  const answeredCount = Object.keys(selectedAnswers).length;
  const currentQ = questions[currentIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[94vh]">
        {/* Header Bar */}
        <div className="bg-slate-900 text-white px-5 py-3.5 sm:px-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-600/30 border border-violet-500/40 text-violet-400 flex items-center justify-center">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white truncate max-w-xs sm:max-w-md">
                {resource.title}
              </h2>
              <p className="text-xs text-slate-400 truncate">
                Class {resource.classLevel} • {resource.chapterTitle || 'Chapter Test'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Countdown Timer */}
            {!isSubmitted && (
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-xs font-bold ${
                timeLeftSeconds < 120 
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse' 
                  : 'bg-slate-800 text-slate-200 border border-slate-700'
              }`}>
                <Clock className="w-3.5 h-3.5" />
                <span>{formatTime(timeLeftSeconds)}</span>
              </div>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Test Workspace */}
        {!isSubmitted ? (
          <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
            {/* Question Quick Palette */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3 overflow-x-auto">
              <span className="text-xs font-bold text-slate-500 shrink-0">Palette:</span>
              <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                {questions.map((_, qIdx) => {
                  const isCurrent = currentIndex === qIdx;
                  const hasAnswered = selectedAnswers[qIdx] !== undefined;
                  return (
                    <button
                      key={qIdx}
                      onClick={() => setCurrentIndex(qIdx)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold shrink-0 transition-all cursor-pointer ${
                        isCurrent
                          ? 'ring-2 ring-violet-600 bg-violet-600 text-white'
                          : hasAnswered
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {qIdx + 1}
                    </button>
                  );
                })}
              </div>
              <span className="text-xs text-slate-500 font-medium shrink-0">
                {answeredCount}/{questions.length} answered
              </span>
            </div>

            {/* Question Block */}
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-violet-700">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Question {currentIndex + 1} of {questions.length}</span>
                </span>
                <span className="bg-violet-50 text-violet-700 px-2 py-0.5 rounded-full font-semibold">
                  1 Mark
                </span>
              </div>

              <p className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                {currentQ.question}
              </p>

              {/* Options */}
              <div className="space-y-3 pt-2">
                {currentQ.options.map((opt, optIdx) => {
                  const isSelected = selectedAnswers[currentIndex] === optIdx;
                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelectAnswer(optIdx)}
                      className={`w-full p-4 rounded-xl border-2 text-left font-medium transition-all flex items-center gap-3 cursor-pointer ${
                        isSelected
                          ? 'border-violet-600 bg-violet-50/70 text-violet-950 ring-2 ring-violet-500/20'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 bg-white text-slate-800'
                      }`}
                    >
                      <span className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span className="text-sm sm:text-base leading-snug">{opt}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Confirmation Dialog Box */}
            {showConfirmSubmit && (
              <div className="p-5 bg-amber-50 rounded-2xl border border-amber-200 space-y-3 animate-in fade-in">
                <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Are you sure you want to finish and submit the test?</span>
                </div>
                <p className="text-xs text-amber-700 leading-relaxed">
                  You have answered <strong>{answeredCount}</strong> out of <strong>{questions.length}</strong> questions. 
                  Unanswered questions will receive 0 marks.
                </p>
                <div className="flex items-center gap-3 pt-1">
                  <button
                    onClick={handleSubmitTest}
                    className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                  >
                    Yes, Finalize & Submit
                  </button>
                  <button
                    onClick={() => setShowConfirmSubmit(false)}
                    className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 cursor-pointer"
                  >
                    Continue Test
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Finished Test Scorecard & Review */
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8">
            <div className="text-center space-y-3">
              <div className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center shadow-lg ${
                isPassed ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
              }`}>
                <Award className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-slate-900">
                {isPassed ? 'Congratulations! Test Passed' : 'Test Completed - Keep Practicing!'}
              </h3>
              <p className="text-sm text-slate-500">
                Performance Evaluation for {resource.title}
              </p>
            </div>

            {/* Score Summary Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                <span className="text-xs text-slate-500 block">Marks Obtained</span>
                <span className="text-xl font-black text-slate-900">{finalScore} / {questions.length}</span>
              </div>
              <div className="p-4 bg-violet-50 rounded-2xl border border-violet-200 text-center">
                <span className="text-xs text-violet-600 block">Percentage</span>
                <span className="text-xl font-black text-violet-700">{percentage}%</span>
              </div>
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-center">
                <span className="text-xs text-emerald-600 block">Passing Mark</span>
                <span className="text-xl font-black text-emerald-700">{passingMarks}</span>
              </div>
              <div className={`p-4 rounded-2xl border text-center ${
                isPassed ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'
              }`}>
                <span className="text-xs text-slate-500 block">Outcome</span>
                <span className={`text-xl font-black ${isPassed ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {isPassed ? 'PASSED' : 'NEEDS WORK'}
                </span>
              </div>
            </div>

            {/* Detailed Question by Question Review */}
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-violet-600" />
                <span>Question-by-Question Review & Correct Answers</span>
              </h4>

              <div className="space-y-3">
                {questions.map((q, idx) => {
                  const studentAns = selectedAnswers[idx];
                  const isCorrect = studentAns === q.correctOptionIndex;
                  return (
                    <div key={idx} className={`p-4 rounded-xl border text-sm space-y-2 ${
                      isCorrect ? 'bg-emerald-50/50 border-emerald-200' : 'bg-rose-50/50 border-rose-200'
                    }`}>
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-bold text-slate-900">
                          {idx + 1}. {q.question}
                        </p>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${
                          isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {isCorrect ? 'Correct (+1)' : 'Incorrect (0)'}
                        </span>
                      </div>

                      <div className="text-xs space-y-1 text-slate-700">
                        <p>
                          <span className="font-semibold text-slate-500">Your Answer: </span>
                          {studentAns !== undefined ? (
                            <span className={isCorrect ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                              {q.options[studentAns]}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">Unanswered</span>
                          )}
                        </p>
                        {!isCorrect && (
                          <p>
                            <span className="font-semibold text-emerald-700">Correct Answer: </span>
                            <span className="font-bold text-emerald-800">{q.options[q.correctOptionIndex]}</span>
                          </p>
                        )}
                        {q.explanation && (
                          <p className="text-slate-500 text-[11px] pt-1">
                            Rationale: {q.explanation}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors cursor-pointer"
              >
                Close & Return to Chapter
              </button>
            </div>
          </div>
        )}

        {/* Modal Bottom Controls */}
        {!isSubmitted && (
          <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex items-center justify-between">
            <button
              onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-white text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <div className="flex items-center gap-2">
              {currentIndex < questions.length - 1 ? (
                <button
                  onClick={() => setCurrentIndex(prev => prev + 1)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Next Question</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => setShowConfirmSubmit(true)}
                  className="px-5 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Test</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
