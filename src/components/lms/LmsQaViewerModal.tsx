import React, { useState } from 'react';
import { 
  X, 
  HelpCircle, 
  Eye, 
  EyeOff, 
  Search, 
  BookOpen, 
  Copy, 
  Check, 
  Printer, 
  Download,
  Award
} from 'lucide-react';
import { LearningResource } from '../../types';

interface LmsQaViewerModalProps {
  resource: LearningResource | null;
  onClose: () => void;
}

export const LmsQaViewerModal: React.FC<LmsQaViewerModalProps> = ({ resource, onClose }) => {
  if (!resource || !resource.qaItems || resource.qaItems.length === 0) return null;

  const [searchQuery, setSearchQuery] = useState('');
  const [revealedAnswers, setRevealedAnswers] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggleAnswer = (id: string) => {
    setRevealedAnswers(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const revealAll = () => {
    const all: Record<string, boolean> = {};
    resource.qaItems?.forEach(q => {
      all[q.id] = true;
    });
    setRevealedAnswers(all);
  };

  const hideAll = () => {
    setRevealedAnswers({});
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredItems = resource.qaItems.filter(item => 
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-400 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white truncate max-w-sm sm:max-w-md">
                {resource.title}
              </h2>
              <p className="text-xs text-slate-400 truncate">
                Class {resource.classLevel} • {resource.chapterTitle || 'Chapter Q&A'} • {resource.qaItems.length} Questions
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

        {/* Toolbar */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search inside Q&A */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search in questions or answers..."
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={revealAll}
              className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Reveal All
            </button>
            <button
              onClick={hideAll}
              className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Hide All
            </button>
            <button
              onClick={() => window.print()}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              title="Print Q&A"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Q&A Cards List */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-4">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <p className="text-sm">No questions matched "{searchQuery}"</p>
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isRevealed = revealedAnswers[item.id] ?? false;
              return (
                <div 
                  key={item.id || idx}
                  className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden transition-all hover:border-slate-300"
                >
                  {/* Question Header */}
                  <div className="p-4 sm:p-5 bg-slate-50/80 border-b border-slate-100 flex items-start justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                          Question {idx + 1}
                        </span>
                        {item.marks && (
                          <span className="text-[11px] font-bold px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                            {item.marks} {item.marks === 1 ? 'Mark' : 'Marks'}
                          </span>
                        )}
                      </div>
                      <p className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                        {item.question}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => copyToClipboard(`${item.question}\n\nAnswer: ${item.answer}`, item.id)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                        title="Copy Q&A"
                      >
                        {copiedId === item.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => toggleAnswer(item.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                          isRevealed 
                            ? 'bg-slate-200 hover:bg-slate-300 text-slate-800' 
                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                        }`}
                      >
                        {isRevealed ? (
                          <>
                            <EyeOff className="w-3.5 h-3.5" />
                            <span>Hide</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-3.5 h-3.5" />
                            <span>Reveal Answer</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Answer Content */}
                  {isRevealed && (
                    <div className="p-4 sm:p-5 bg-white text-sm text-slate-700 leading-relaxed border-t border-slate-100 animate-in fade-in">
                      <div className="flex items-start gap-2">
                        <span className="font-bold text-emerald-700 shrink-0 mt-0.5">Answer:</span>
                        <div className="space-y-2 whitespace-pre-line">
                          {item.answer}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex items-center justify-between text-xs text-slate-600">
          <span>Showing {filteredItems.length} questions</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
