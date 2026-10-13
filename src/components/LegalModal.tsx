import React from 'react';
import { X, Shield, FileText, CheckCircle2 } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'privacy' | 'terms' | 'disclaimer';
}

export const LegalModal: React.FC<LegalModalProps> = ({ isOpen, onClose, type }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-base">
              {type === 'privacy' && 'Privacy Policy'}
              {type === 'terms' && 'Terms & Conditions'}
              {type === 'disclaimer' && 'Educational Disclaimer'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto text-xs sm:text-sm text-slate-600 leading-relaxed space-y-4">
          {type === 'privacy' && (
            <>
              <p><strong>1. Information Collection:</strong> Zakir Learning Hub collects minimal student data required strictly for tracking test performance, quiz history, and issuing certificates. We do not sell or share personal student data with third parties.</p>
              <p><strong>2. Local & Cloud Storage:</strong> Assessment records, bookmarked chapters, and practice attempts are stored securely in local browser storage and protected cloud databases.</p>
              <p><strong>3. Communications:</strong> Contact information provided in doubt forms is used solely to respond to academic and technical inquiries.</p>
              <p><strong>4. Contact:</strong> For any privacy inquiries, reach out to Zakir Hussain at <a href="mailto:zakhu1099@gmail.com" className="text-blue-600 underline">zakhu1099@gmail.com</a>.</p>
            </>
          )}

          {type === 'terms' && (
            <>
              <p><strong>1. Permitted Use:</strong> All study materials, notes, Python scripts, SQL solutions, and MCQ banks on Zakir Learning Hub are free for school students and educators for personal, non-commercial learning and revision.</p>
              <p><strong>2. Intellectual Property:</strong> Notes and practical solutions curated by Zakir Hussain remain educational open resources. Re-hosting or selling these materials without attribution is prohibited.</p>
              <p><strong>3. Assessment Integrity:</strong> Quiz timers and randomized question orders are intended to provide realistic exam simulation. Certificates issued reflect completed practice tests.</p>
            </>
          )}

          {type === 'disclaimer' && (
            <>
              <p><strong>1. Academic Alignment:</strong> Curriculum topics, chapter codes, and syllabus mappings (e.g. IT 402, IT 802, IP 065, Typo 817) are aligned with CBSE and general school board syllabi.</p>
              <p><strong>2. Practical Code Execution:</strong> Python scripts and MySQL statements are tested on standard Python 3.x and MySQL 8.x environments. Variations may exist depending on local school lab installations.</p>
              <p><strong>3. Official Updates:</strong> Students are advised to also consult official board circulars and textbooks for annual board examination dates and modifications.</p>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
