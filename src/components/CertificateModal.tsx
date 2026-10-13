import React from 'react';
import { Award, CheckCircle, Download, Printer, X, Sparkles, ShieldCheck } from 'lucide-react';
import { QuizAttempt } from '../types';
import { Logo } from './Logo';

interface CertificateModalProps {
  attempt: QuizAttempt;
  studentName: string;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({ attempt, studentName, onClose }) => {
  const formattedDate = new Date(attempt.date).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-8">
        {/* Top Header / Actions */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white print:hidden">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span className="font-semibold text-sm">Official Certificate of Achievement</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Canvas Frame */}
        <div className="p-8 sm:p-12 bg-gradient-to-br from-amber-50/40 via-white to-blue-50/30">
          <div className="relative border-8 border-double border-amber-600/60 p-8 sm:p-10 rounded-xl bg-white shadow-inner text-center">
            {/* Corner Decorative Ornaments */}
            <div className="absolute top-2 left-2 text-amber-700 text-xl font-serif">❖</div>
            <div className="absolute top-2 right-2 text-amber-700 text-xl font-serif">❖</div>
            <div className="absolute bottom-2 left-2 text-amber-700 text-xl font-serif">❖</div>
            <div className="absolute bottom-2 right-2 text-amber-700 text-xl font-serif">❖</div>

            {/* Official Logo Emblem */}
            <div className="flex justify-center mb-3">
              <div className="relative">
                <Logo className="w-24 h-24 sm:w-28 sm:h-28 drop-shadow-md hover:scale-105 transition-transform" />
              </div>
            </div>

            <p className="text-xs uppercase tracking-widest font-bold text-amber-800 mb-1">
              Zakir Learning Hub • CBSE CS & IT Education Portal
            </p>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-wide mb-2">
              Certificate of Academic Excellence
            </h1>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-6">
              Class VI – XII Information Technology & Informatics Practices
            </p>

            <p className="text-sm text-slate-600 italic mb-2">This is proudly presented to</p>
            <div className="inline-block border-b-2 border-slate-900 pb-1 px-8 mb-6">
              <span className="text-2xl sm:text-3xl font-extrabold text-blue-900 tracking-tight">
                {studentName || 'Student'}
              </span>
            </div>

            <p className="text-sm text-slate-700 max-w-lg mx-auto leading-relaxed mb-6">
              for successfully mastering and completing the assessment in <br />
              <strong className="text-slate-900 font-semibold">{attempt.quizTitle}</strong> (Class {attempt.classLevel})
              demonstrating proficiency with a score of:
            </p>

            {/* Score Pill */}
            <div className="inline-flex items-center gap-3 bg-amber-50 border border-amber-300 px-6 py-2 rounded-full mb-8 shadow-xs">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span className="text-lg font-bold text-amber-900">
                Score: {attempt.score} / {attempt.totalMarks} ({attempt.percentage.toFixed(1)}%)
              </span>
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            </div>

            {/* Signatures and Date */}
            <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-200 mt-4 text-left items-end">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider">Date Awarded</p>
                <p className="text-sm font-semibold text-slate-800">{formattedDate}</p>
                <p className="text-[11px] text-slate-400 font-mono mt-1">ID: CERT-{attempt.id.slice(-8).toUpperCase()}</p>
                <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-md text-[10px] text-emerald-800 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Officially Verified</span>
                </div>
              </div>
              <div className="text-right">
                <div className="inline-block text-center">
                  <div className="font-serif italic font-extrabold text-blue-900 text-xl sm:text-2xl border-b-2 border-slate-600 px-4 pb-1">
                    Mr. Zakir Hussain
                  </div>
                  <p className="text-xs font-bold text-slate-900 mt-1">Mr. Zakir Hussain</p>
                  <p className="text-[11px] text-slate-600 font-medium">PGT Computer Science & IT Specialist</p>
                  <p className="text-[10px] text-blue-600 font-semibold">Founder, Zakir Learning Hub</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal footer note */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 print:hidden">
          <span>This certificate is issued under Zakir Learning Hub student verification protocol.</span>
          <button
            onClick={onClose}
            className="text-slate-700 hover:text-slate-900 font-semibold cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
