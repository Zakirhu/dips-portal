import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  RotateCcw, 
  ChevronRight, 
  ChevronLeft, 
  Award,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { LearningResource } from '../../types';

interface LmsMcqRunnerModalProps {
  resource: LearningResource | null;
  onClose: () => void;
}

export const LmsMcqRunnerModal: React.FC<LmsMcqRunnerModalProps> = ({ resource, onClose }) => {
  if (!resource || !resource.mcqItems || resource.mcqItems.length === 0) return null;

  const questions = resource.mcqItems;
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showExplanation, setShowExplanation] = useState<Record<number, boolean>>({});
  const [isFinished, setIsFinished] = useState<boolean>(false);

  const currentQ = questions[currentIndex];
  const totalQuestions = questions.length;

  const handleSelectOption = (optionIndex: number) => {
    if (selectedAnswers[currentIndex] !== undefined) return; // already answered
    setSelectedAnswers(prev => ({ ...prev, [currentIndex]: optionIndex }));
    setShowExplanation(prev => ({ ...prev, [currentIndex]: true }));
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsFinished(true);
    }
  };

  const handleRestart = () => {
    setSelectedAnswers({});
    setShowExplanation({});
    setCurrentIndex(0);
    setIsFinished(false);
  };

  // Calculate score
  const correctCount = Object.entries(selectedAnswers).reduce((count, [idx, ans]) => {
    const q = questions[Number(idx)];
    return q && q.correctOptionIndex === ans ? count + 1 : count;
  }, 0);

  const percentage = Math.round((correctCount / totalQuestions) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white leading-tight">
                {resource.title}
              </h2>
              <p className="text-xs text-slate-400">
                Class {resource.classLevel} • {resource.chapterTitle || 'Chapter MCQs'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        {!isFinished ? (
          <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                <span>Question {currentIndex + 1} of {totalQuestions}</span>
                <span className="text-emerald-700">
                  {Object.keys(selectedAnswers).length} Answered
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-700 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
                />
              </div>
            </div>

            {/* Question Text */}
            <div className="p-4 sm:p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Question {currentIndex + 1}</span>
              </div>
              <p className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                {currentQ.question}
              </p>
            </div>

            {/* Options List */}
            <div className="space-y-3">
              {currentQ.options.map((opt, optIdx) => {
                const isSelected = selectedAnswers[currentIndex] === optIdx;
                const isAnswered = selectedAnswers[currentIndex] !== undefined;
                const isCorrect = optIdx === currentQ.correctOptionIndex;

                let buttonClass = 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 bg-white text-slate-800';
                if (isAnswered) {
                  if (isCorrect) {
                    buttonClass = 'border-emerald-500 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/30';
                  } else if (isSelected) {
                    buttonClass = 'border-rose-500 bg-rose-50 text-rose-950 ring-2 ring-rose-500/30';
                  } else {
                    buttonClass = 'border-slate-200 bg-white opacity-50 text-slate-400';
                  }
                }

                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectOption(optIdx)}
                    disabled={isAnswered}
                    className={`w-full p-3.5 sm:p-4 rounded-xl border-2 text-left font-medium transition-all flex items-center justify-between gap-3 cursor-pointer ${buttonClass}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                        isAnswered && isCorrect
                          ? 'bg-emerald-500 text-white'
                          : isAnswered && isSelected
                          ? 'bg-rose-500 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span className="text-sm sm:text-base leading-snug">{opt}</span>
                    </div>

                    {isAnswered && isCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    )}
                    {isAnswered && isSelected && !isCorrect && (
                      <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation Card */}
            {selectedAnswers[currentIndex] !== undefined && currentQ.explanation && (
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1.5 animate-in fade-in">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                  <HelpCircle className="w-4 h-4" />
                  <span>Explanation:</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {currentQ.explanation}
                </p>
              </div>
            )}
          </div>
        ) : (
          /* Finished Score Card */
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 text-center space-y-6">
            <div className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center shadow-lg ${
              percentage >= 60 ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
            }`}>
              <Award className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-900">
                Practice Completed!
              </h3>
              <p className="text-sm text-slate-500">
                Great effort on {resource.title}
              </p>
            </div>

            {/* Score Stats */}
            <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-xs text-slate-500 block">Total</span>
                <span className="text-xl font-black text-slate-800">{totalQuestions}</span>
              </div>
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200">
                <span className="text-xs text-emerald-600 block">Correct</span>
                <span className="text-xl font-black text-emerald-700">{correctCount}</span>
              </div>
              <div className="p-3 bg-blue-50 rounded-2xl border border-blue-200">
                <span className="text-xs text-blue-600 block">Score</span>
                <span className="text-xl font-black text-blue-700">{percentage}%</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-4">
              <button
                onClick={handleRestart}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Practice Again</span>
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors cursor-pointer"
              >
                Close & Return
              </button>
            </div>
          </div>
        )}

        {/* Modal Bottom Controls */}
        {!isFinished && (
          <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex items-center justify-between">
            <button
              onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-white text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <button
              onClick={handleNext}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>{currentIndex < totalQuestions - 1 ? 'Next Question' : 'View Results'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
