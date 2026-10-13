import React, { useState, useMemo } from 'react';
import { Search, X, BookOpen, HelpCircle, FileText, ArrowRight, Laptop, Database, Keyboard, Zap, Code } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StudyMaterial, Question, QuizConfig } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMaterial: (material: StudyMaterial) => void;
  onSelectQuizTab: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectMaterial,
  onSelectQuizTab
}) => {
  const { studyMaterials, questionBank, quizzes, customSubjects } = useApp();
  const [query, setQuery] = useState('');

  const filteredMaterials = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return studyMaterials.filter(
      m =>
        m.title.toLowerCase().includes(q) ||
        m.chapterTitle.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.tags.some(t => t.toLowerCase().includes(q)) ||
        (m.codeSnippet && m.codeSnippet.code.toLowerCase().includes(q))
    ).slice(0, 5);
  }, [studyMaterials, query]);

  const filteredQuestions = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return questionBank.filter(
      item =>
        item.question.toLowerCase().includes(q) ||
        item.chapterTitle.toLowerCase().includes(q) ||
        item.explanation.toLowerCase().includes(q) ||
        item.options.some(opt => opt.toLowerCase().includes(q))
    ).slice(0, 5);
  }, [questionBank, query]);

  const filteredQuizzes = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return quizzes.filter(
      qz => qz.title.toLowerCase().includes(q) || (qz.description && qz.description.toLowerCase().includes(q)) || (qz.chapterTitle && qz.chapterTitle.toLowerCase().includes(q))
    ).slice(0, 3);
  }, [quizzes, query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Search Input Bar */}
        <div className="relative flex items-center px-5 py-4 border-b border-slate-200">
          <Search className="w-5 h-5 text-blue-600 mr-3 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search notes, chapters, SQL queries, MCQs (e.g. SQL JOIN, Pandas, Styles)..."
            className="w-full bg-transparent text-slate-900 placeholder-slate-400 text-sm sm:text-base focus:outline-hidden"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-md cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="ml-2 px-2.5 py-1 text-xs text-slate-500 hover:bg-slate-100 rounded-lg font-medium cursor-pointer"
          >
            Esc
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-[65vh] overflow-y-auto p-4 sm:p-6 space-y-5">
          {!query.trim() ? (
            <div className="text-center py-8 text-slate-400 text-xs sm:text-sm space-y-3">
              <Search className="w-8 h-8 mx-auto text-slate-300" />
              <p>Type keywords to search across Class VI–XII study materials, MCQs, and test papers.</p>
              <div className="flex flex-wrap justify-center gap-2 pt-2">
                {['SQL JOIN', 'Pandas DataFrame', 'Goal Seek', 'Writer Styles', 'Typography Proof Signs', 'Cyber Safety'].map(chip => (
                  <button
                    key={chip}
                    onClick={() => setQuery(chip)}
                    className="px-3 py-1 text-xs bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 rounded-xl transition-colors cursor-pointer"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Study Materials */}
              {filteredMaterials.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Study Notes & Practical Files ({filteredMaterials.length})
                  </span>
                  <div className="space-y-2">
                    {filteredMaterials.map(mat => (
                      <div
                        key={mat.id}
                        onClick={() => {
                          onSelectMaterial(mat);
                          onClose();
                        }}
                        className="p-3 bg-slate-50 hover:bg-blue-50/70 border border-slate-200/80 hover:border-blue-300 rounded-2xl cursor-pointer transition-all flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                            {mat.type === 'practical_file' ? <Code className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-bold px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded">
                                Class {mat.classLevel}
                              </span>
                              <h4 className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-blue-600 transition-colors">
                                {mat.title}
                              </h4>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">{mat.chapterTitle} • {mat.readTimeMinutes} min read</p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quizzes */}
              {filteredQuizzes.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Quizzes & Tests ({filteredQuizzes.length})
                  </span>
                  <div className="space-y-2">
                    {filteredQuizzes.map(qz => (
                      <div
                        key={qz.id}
                        onClick={() => {
                          onSelectQuizTab();
                          onClose();
                        }}
                        className="p-3 bg-slate-50 hover:bg-emerald-50/70 border border-slate-200/80 hover:border-emerald-300 rounded-2xl cursor-pointer transition-all flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                            <Zap className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-bold px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded">
                                Class {qz.classLevel}
                              </span>
                              <h4 className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-emerald-700 transition-colors">
                                {qz.title}
                              </h4>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">{qz.questions.length} Questions • {qz.timeLimitMinutes} Mins</p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Questions */}
              {filteredQuestions.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    MCQ Question Bank Matches ({filteredQuestions.length})
                  </span>
                  <div className="space-y-2">
                    {filteredQuestions.map(q => (
                      <div key={q.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-blue-700">Class {q.classLevel} • {q.chapterTitle}</span>
                          <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-mono">{q.marks} Mark</span>
                        </div>
                        <p className="text-xs font-semibold text-slate-800">{q.question}</p>
                        <p className="text-[11px] text-slate-500">Correct: <span className="font-semibold text-emerald-700">{q.options[q.correctOptionIndex]}</span></p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty state when query produces 0 hits */}
              {filteredMaterials.length === 0 && filteredQuizzes.length === 0 && filteredQuestions.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-xs sm:text-sm">
                  <p>No results found for "{query}".</p>
                  <p className="text-xs text-slate-400 mt-1">Try searching for keywords like "Python", "SQL", "Calc", or "Writer".</p>
                </div>
              )}
            </>
          )}
        </div>

        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <span>Global unified search across curriculum</span>
          <span>Press ESC to exit</span>
        </div>
      </div>
    </div>
  );
};
