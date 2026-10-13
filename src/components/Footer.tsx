import React, { useState } from 'react';
import { Mail, GraduationCap, ShieldCheck, BookOpen, CheckCircle2, ChevronRight, FileText, UserCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ClassLevel } from '../types';
import { LegalModal } from './LegalModal';
import { Logo } from './Logo';

interface FooterProps {
  setCurrentTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentTab }) => {
  const { setSelectedClassFilter, userRole, openAuthModal } = useApp();
  const [legalModalType, setLegalModalType] = useState<'privacy' | 'terms' | 'disclaimer' | null>(null);

  const classesList: { level: ClassLevel; label: string }[] = [
    { level: 'VI', label: 'Class VI' },
    { level: 'VII', label: 'Class VII' },
    { level: 'VIII', label: 'Class VIII' },
    { level: 'IX', label: 'Class IX' },
    { level: 'X', label: 'Class X' },
    { level: 'XI', label: 'Class XI' },
    { level: 'XII', label: 'Class XII' },
  ];

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          
          {/* Brand & Educator Information (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <Logo className="w-11 h-11 shrink-0 drop-shadow-md" />
              <div>
                <span className="text-xl font-bold text-white tracking-tight">Zakir Learning Hub</span>
                <p className="text-xs text-blue-400 font-medium">CBSE Computer Science & IT Academic Portal</p>
              </div>
            </div>

            <p className="text-sm text-slate-400 leading-relaxed">
              Curated educational platform offering structured chapter notes, comprehensive question banks, and self-assessment tools for CBSE students across Classes VI through XII.
            </p>

            {/* Educator Profile Card */}
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800/80 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                <UserCheck className="w-4 h-4 text-emerald-400" />
                <span>Zakir Hussain</span>
                <span className="text-slate-500">•</span>
                <span className="text-blue-400 font-normal">PGT Computer Science</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <a 
                  href="mailto:zakhu1099@gmail.com" 
                  className="hover:text-blue-400 transition-colors"
                >
                  zakhu1099@gmail.com
                </a>
              </div>
            </div>
          </div>

          {/* Curriculum by Class (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Curriculum by Class
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {classesList.map(({ level, label }) => (
                <button
                  key={level}
                  onClick={() => {
                    setSelectedClassFilter(level);
                    setCurrentTab('materials');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-3 py-2 rounded-lg bg-slate-900/70 hover:bg-blue-900/30 border border-slate-800/90 hover:border-blue-700/50 text-slate-300 hover:text-blue-300 transition-all text-left flex items-center justify-between group cursor-pointer"
                >
                  <span>{label}</span>
                  <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-blue-400 transition-transform group-hover:translate-x-0.5" />
                </button>
              ))}
            </div>
          </div>

          {/* Featured Subjects (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Subjects
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button
                  onClick={() => {
                    setSelectedClassFilter('X');
                    setCurrentTab('materials');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  IT (Code 402) • X
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setSelectedClassFilter('IX');
                    setCurrentTab('materials');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  IT (Code 402) • IX
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setSelectedClassFilter('XII');
                    setCurrentTab('materials');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  Informatics Practices (065)
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setSelectedClassFilter('XII');
                    setCurrentTab('materials');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  Typography (Code 817)
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setSelectedClassFilter('IX');
                    setCurrentTab('materials');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  Computer Applications (165)
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setSelectedClassFilter('VI');
                    setCurrentTab('materials');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  Middle School Coding (VI–VIII)
                </button>
              </li>
            </ul>
          </div>

          {/* Learning Hub & Administration (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Academic Resources
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button
                  onClick={() => {
                    setCurrentTab('lms');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-blue-400 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                  <span>Chapter Notes & PDFs</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCurrentTab('lms');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-blue-400 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Question Bank & MCQs</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCurrentTab('lms');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-blue-400 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-rose-400" />
                  <span>Previous Year Papers (PYQs)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCurrentTab('quiz');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-blue-400 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Interactive Mock Tests</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCurrentTab('dashboard');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-blue-400 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Student Scorecard & Badges</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCurrentTab('about');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-blue-400 transition-colors cursor-pointer"
                >
                  About Educator
                </button>
              </li>
            </ul>

            {/* Admin CMS Badge Button */}
            <div className="pt-2">
              <button
                onClick={() => {
                  if (userRole === 'admin') {
                    setCurrentTab('admin');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  } else {
                    openAuthModal('admin', 'Administrator sign-in is required to access the Content Management System (CMS).');
                  }
                }}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 text-amber-400 text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Educator CMS Portal</span>
              </button>
            </div>
          </div>

        </div>

        {/* Academic Assurance Strip */}
        <div className="mt-10 pt-6 border-t border-slate-900 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-slate-400">
            <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
            <span>Aligned with CBSE Curriculum</span>
          </div>
          <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-slate-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Free Academic Access for Students</span>
          </div>
          <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-slate-400">
            <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0" />
            <span>Verified PGT Subject-Matter Notes</span>
          </div>
        </div>

        {/* Bottom Legal & Copyright Bar */}
        <div className="mt-8 pt-6 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Zakir Learning Hub. All rights reserved.</p>
          
          <div className="flex flex-wrap items-center justify-center gap-6">
            <button
              onClick={() => setLegalModalType('privacy')}
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => setLegalModalType('terms')}
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              Terms of Use
            </button>
            <button
              onClick={() => setLegalModalType('disclaimer')}
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              Academic Disclaimer
            </button>
            <button
              onClick={() => {
                setCurrentTab('402');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-amber-400 transition-colors cursor-pointer text-amber-500/80 font-bold"
            >
              402 Error / Quota
            </button>
            <button
              onClick={() => {
                setCurrentTab('offline');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              Site Not Reachable
            </button>
            <a
              href="mailto:zakhu1099@gmail.com"
              className="hover:text-slate-300 transition-colors"
            >
              Support
            </a>
          </div>
        </div>
      </div>

      {/* Legal Modal */}
      {legalModalType && (
        <LegalModal
          isOpen={!!legalModalType}
          onClose={() => setLegalModalType(null)}
          type={legalModalType}
        />
      )}
    </footer>
  );
};
