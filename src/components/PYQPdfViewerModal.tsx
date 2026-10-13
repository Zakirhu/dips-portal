import React from 'react';
import { 
  X, 
  Download, 
  Printer, 
  FileText, 
  Award, 
  Calendar, 
  ExternalLink 
} from 'lucide-react';
import { PYQPaper } from '../types';

interface PYQPdfViewerModalProps {
  paper: PYQPaper | null;
  onClose: () => void;
}

export const PYQPdfViewerModal: React.FC<PYQPdfViewerModalProps> = ({
  paper,
  onClose
}) => {
  if (!paper) return null;

  const handleDownload = () => {
    if (paper.pdfDataUrl) {
      const link = document.createElement('a');
      link.href = paper.pdfDataUrl;
      link.download = paper.fileName || `CBSE_Class_${paper.classLevel}_${paper.code}_${paper.year}.pdf`;
      link.click();
    } else {
      window.print();
    }
  };

  const handleDownloadKey = () => {
    if (paper.markingSchemePdfUrl) {
      const link = document.createElement('a');
      link.href = paper.markingSchemePdfUrl;
      link.download = paper.markingSchemeFileName || `CBSE_Marking_Scheme_${paper.classLevel}_${paper.code}_${paper.year}.pdf`;
      link.click();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/80 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-5xl h-[94vh] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Top Bar */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center justify-center font-bold shrink-0">
              <FileText className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white truncate max-w-xs sm:max-w-md">
                  {paper.year} • Class {paper.classLevel} {paper.subjectName}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500 text-white">
                  {paper.code}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate max-w-md">
                {paper.fileName || `${paper.examType} • ${paper.totalMarks} Marks • ${paper.timeHours} Hours`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {paper.markingSchemePdfUrl && (
              <button
                onClick={handleDownloadKey}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                title="Download Official Marking Scheme PDF"
              >
                <Award className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Marking Scheme PDF</span>
              </button>
            )}

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              title="Download or Print PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>

            <button
              onClick={() => window.print()}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Print"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PDF Viewer Body */}
        <div className="flex-1 bg-slate-100 flex flex-col overflow-hidden relative">
          {paper.pdfDataUrl ? (
            <iframe
              src={paper.pdfDataUrl}
              className="w-full h-full border-none"
              title={paper.fileName || 'Previous Year Board Paper'}
            />
          ) : (
            <div className="flex-1 p-6 sm:p-10 overflow-y-auto space-y-6 bg-white">
              <div className="max-w-3xl mx-auto border border-slate-300 p-8 rounded-2xl shadow-xs space-y-6">
                <div className="text-center border-b border-slate-200 pb-4 space-y-1">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Central Board of Secondary Education
                  </span>
                  <h2 className="text-xl font-black text-slate-900">
                    {paper.examType} ({paper.year})
                  </h2>
                  <p className="text-sm font-bold text-blue-700">
                    Class {paper.classLevel} — {paper.subjectName} ({paper.code})
                  </p>
                  <div className="flex justify-between text-xs text-slate-600 font-mono font-bold pt-2">
                    <span>Maximum Marks: {paper.totalMarks}</span>
                    <span>Time Allowed: {paper.timeHours} Hours</span>
                  </div>
                </div>

                <div className="text-xs text-slate-700 space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <strong className="block text-slate-900">General Instructions:</strong>
                  <p>1. Please read all instructions carefully before attempting the paper.</p>
                  <p>2. This question paper consists of Section A (Objective/MCQ) and Section B (Subjective & Practical questions).</p>
                  <p>3. Section A carries questions of 1 mark each. Section B contains 2-mark and 4-mark questions.</p>
                  <p>4. All programming codes, SQL queries, and spreadsheet functions must follow standard CBSE syllabus specifications.</p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Official Questions & Marking Rubric:
                  </h3>
                  {paper.sampleQuestions.map((q, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex items-start justify-between">
                        <p className="text-sm font-bold text-slate-900">
                          <span className="text-blue-600 mr-2">{q.qNumber}.</span>
                          {q.question}
                        </p>
                        <span className="text-xs font-mono font-bold text-slate-500">[{q.marks} Mark{q.marks > 1 ? 's' : ''}]</span>
                      </div>
                      <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-950">
                        <strong className="block text-emerald-900">Model Answer:</strong>
                        <p className="whitespace-pre-line mt-0.5">{q.officialAnswer}</p>
                      </div>
                      <div className="p-2 bg-purple-50 rounded-lg border border-purple-200 text-[11px] text-purple-950">
                        <strong>Examiner Step-Marking Scheme: </strong>
                        <span>{q.stepMarkingScheme}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
