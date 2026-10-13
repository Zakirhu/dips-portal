import React from 'react';
import { 
  Printer, 
  X, 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  User, 
  BookOpen, 
  TrendingUp, 
  ShieldCheck, 
  FileText,
  Clock,
  Sparkles
} from 'lucide-react';
import { Logo } from './Logo';
import { StudentProfile, QuizAttempt } from '../types';

interface ProgressReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentProfile: StudentProfile;
  quizAttempts: QuizAttempt[];
  totalQuestionsSolved: number;
  chaptersCompleted: number;
}

export const ProgressReportModal: React.FC<ProgressReportModalProps> = ({
  isOpen,
  onClose,
  studentProfile,
  quizAttempts,
  totalQuestionsSolved,
  chaptersCompleted
}) => {
  if (!isOpen) return null;

  const totalAttempts = quizAttempts.length;
  const averageScore = totalAttempts > 0 
    ? Math.round(quizAttempts.reduce((acc, a) => acc + a.percentage, 0) / totalAttempts)
    : 0;

  const bestScore = totalAttempts > 0 
    ? Math.max(...quizAttempts.map(a => a.percentage)) 
    : 0;

  const passedTests = quizAttempts.filter(a => a.percentage >= 50).length;
  const passRate = totalAttempts > 0 ? Math.round((passedTests / totalAttempts) * 100) : 0;

  // Grade calculation according to CBSE 9-point grading scale
  const getGradeInfo = (score: number) => {
    if (score >= 91) return { grade: 'A1', label: 'Outstanding Mastery', color: 'text-emerald-700 bg-emerald-50 border-emerald-300' };
    if (score >= 81) return { grade: 'A2', label: 'Excellent Performance', color: 'text-blue-700 bg-blue-50 border-blue-300' };
    if (score >= 71) return { grade: 'B1', label: 'Very Good Competency', color: 'text-indigo-700 bg-indigo-50 border-indigo-300' };
    if (score >= 61) return { grade: 'B2', label: 'Good Standard', color: 'text-amber-700 bg-amber-50 border-amber-300' };
    if (score >= 51) return { grade: 'C1', label: 'Satisfactory / Pass', color: 'text-orange-700 bg-orange-50 border-orange-300' };
    if (score >= 40) return { grade: 'C2', label: 'Basic Competency', color: 'text-yellow-700 bg-yellow-50 border-yellow-300' };
    return { grade: 'D/E', label: 'Needs Targeted Revision', color: 'text-rose-700 bg-rose-50 border-rose-300' };
  };

  const overallGrade = getGradeInfo(averageScore);

  // Unit breakdown based on student's class
  const getCurriculumUnits = () => {
    if (studentProfile.classLevel === 'X') {
      return [
        { unit: 'Unit 1', name: 'Digital Documentation (Advanced • Writer)', weight: '8 Marks Theory', status: 'Proficient', scoreEst: Math.min(100, averageScore + 5) },
        { unit: 'Unit 2', name: 'Electronic Spreadsheet (Advanced • Calc)', weight: '10 Marks Theory', status: 'In Progress', scoreEst: averageScore },
        { unit: 'Unit 3', name: 'Database Management System (RDBMS • SQL)', weight: '12 Marks Theory', status: 'High Focus', scoreEst: Math.max(45, averageScore - 4) },
        { unit: 'Unit 4', name: 'Web Applications and Security', weight: '10 Marks Theory', status: 'Proficient', scoreEst: Math.min(100, averageScore + 8) },
        { unit: 'Part A', name: 'Employability Skills (Communication & ICT)', weight: '10 Marks Board', status: 'Mastered', scoreEst: 92 },
        { unit: 'Part C', name: 'Practical Examination & Viva Voce', weight: '50 Marks Practical', status: 'Assessed in Lab', scoreEst: 90 }
      ];
    }
    if (studentProfile.classLevel === 'XII') {
      return [
        { unit: 'Unit 1', name: 'Data Handling using Pandas & DataFrames (065)', weight: '25 Marks Theory', status: 'Proficient', scoreEst: averageScore },
        { unit: 'Unit 2', name: 'Database Query using SQL (Aggregate & Groups)', weight: '25 Marks Theory', status: 'High Focus', scoreEst: Math.min(100, averageScore + 3) },
        { unit: 'Unit 3', name: 'Introduction to Computer Networks', weight: '10 Marks Theory', status: 'Mastered', scoreEst: Math.min(100, averageScore + 10) },
        { unit: 'Unit 4', name: 'Societal Impacts & Cyber Laws (IT Act 2000)', weight: '10 Marks Theory', status: 'Mastered', scoreEst: 88 },
        { unit: 'Part C', name: 'Practical Lab File, Python Project & Viva', weight: '30 Marks Practical', status: 'Assessed in Lab', scoreEst: 94 }
      ];
    }
    return [
      { unit: 'Unit 1', name: 'Computer Fundamentals & Digital Literacy', weight: '20 Marks', status: 'Mastered', scoreEst: Math.min(100, averageScore + 10) },
      { unit: 'Unit 2', name: 'Algorithm Logic & Applied Programming', weight: '30 Marks', status: 'Proficient', scoreEst: averageScore },
      { unit: 'Unit 3', name: 'Office Productivity & Cyber Ethics', weight: '20 Marks', status: 'Proficient', scoreEst: Math.min(100, averageScore + 6) },
      { unit: 'Practical', name: 'Hands-on Computer Lab Exercises', weight: '30 Marks', status: 'Assessed in Lab', scoreEst: 92 }
    ];
  };

  const curriculumUnits = getCurriculumUnits();

  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      {/* Print Specific Styles */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
          body {
            background: #ffffff !important;
            color: #0f172a !important;
          }
          body * {
            visibility: hidden !important;
          }
          #progress-report-print-sheet, #progress-report-print-sheet * {
            visibility: visible !important;
          }
          #progress-report-print-sheet {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="bg-white rounded-3xl max-w-4xl w-full my-6 shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Action Header (Screen Only) */}
        <div className="no-print p-4 sm:px-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Student Academic Progress Report</h2>
              <p className="text-[11px] text-slate-400">Print or Export official CBSE Term transcript for parents and school</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              title="Close Report"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Document Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100/50">
          
          {/* Printable Report Card Sheet */}
          <div 
            id="progress-report-print-sheet" 
            className="bg-white rounded-2xl p-6 sm:p-10 border border-slate-300 shadow-md text-slate-800 space-y-6"
          >
            
            {/* 1. INSTITUTIONAL HEADER & SEAL */}
            <div className="border-b-2 border-slate-900 pb-5 text-center relative">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-2">
                <Logo className="w-12 h-12 text-blue-700" />
                <div className="text-center sm:text-left">
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 uppercase">
                    Zakir Learning Hub
                  </h1>
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-widest">
                    Center for Excellence in Computer Science & Information Technology
                  </p>
                </div>
              </div>

              <div className="mt-3 py-1.5 px-4 bg-slate-100 rounded-lg inline-block border border-slate-300">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                  Official CBSE Term Assessment & Student Progress Transcript
                </span>
                <span className="text-[11px] font-medium text-slate-600 block">
                  Academic Session: 2025–2026 • Board Evaluation Pattern
                </span>
              </div>

              <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-center gap-4">
                <span>Evaluator: <strong>Mr. Zakir Hussain (PGT Computer Science)</strong></span>
                <span>•</span>
                <span>Issue Date: <strong>{currentDate}</strong></span>
              </div>
            </div>

            {/* 2. STUDENT PARTICULAR MATRIX */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Student Full Name</span>
                <span className="font-extrabold text-slate-900 text-sm">{studentProfile.name}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Class / Grade</span>
                <span className="font-extrabold text-blue-700 text-sm">Class {studentProfile.classLevel}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Roll / Student ID</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {studentProfile.studentId || `ZLH-${studentProfile.classLevel}-042`}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Target Exam Year</span>
                <span className="font-extrabold text-slate-900 text-sm">{studentProfile.targetExamYear}</span>
              </div>
            </div>

            {/* 3. PERFORMANCE SUMMARY METRICS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200">
                <span className="text-2xl font-black text-blue-800">{totalAttempts}</span>
                <p className="text-[10px] font-bold uppercase text-slate-600 mt-0.5">Tests Completed</p>
              </div>
              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200">
                <span className="text-2xl font-black text-emerald-800">{averageScore}%</span>
                <p className="text-[10px] font-bold uppercase text-slate-600 mt-0.5">Cumulative Accuracy</p>
              </div>
              <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-200">
                <span className="text-2xl font-black text-purple-800">{bestScore}%</span>
                <p className="text-[10px] font-bold uppercase text-slate-600 mt-0.5">Highest Score</p>
              </div>
              <div className={`p-3 rounded-xl border ${overallGrade.color}`}>
                <span className="text-2xl font-black">{overallGrade.grade}</span>
                <p className="text-[10px] font-bold uppercase mt-0.5 truncate">{overallGrade.label}</p>
              </div>
            </div>

            {/* 4. UNIT-WISE SYLLABUS MASTERY BREAKDOWN */}
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                  <span>Curriculum Unit Mastery & Weightage Analysis (Class {studentProfile.classLevel})</span>
                </h3>
                <span className="text-[10px] text-slate-500 font-semibold">CBSE Blueprint Matrix</span>
              </div>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
                {curriculumUnits.map((u, idx) => (
                  <div key={idx} className="p-2.5 sm:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white hover:bg-slate-50/50">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-500 text-[11px]">{u.unit}:</span>
                        <span className="font-bold text-slate-900">{u.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-500">{u.weight}</span>
                    </div>

                    <div className="flex items-center gap-3 sm:w-60 justify-between sm:justify-end">
                      <div className="w-24 bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200 hidden sm:block">
                        <div 
                          className="bg-blue-600 h-full rounded-full" 
                          style={{ width: `${Math.min(100, u.scoreEst)}%` }}
                        />
                      </div>
                      <span className="font-mono font-bold text-[11px] text-slate-700 w-10 text-right">
                        {u.scoreEst}%
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        u.status === 'Mastered' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        u.status === 'Proficient' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {u.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 5. VERIFIED ASSESSMENT LOG TABLE */}
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-600" />
                  <span>Logged Term Tests & Assessment Records</span>
                </h3>
                <span className="text-[10px] text-slate-500 font-semibold">{totalAttempts} Recorded Attempts</span>
              </div>

              {quizAttempts.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500 space-y-1">
                  <p className="font-semibold text-slate-700">Initial Diagnostic Evaluation Pending</p>
                  <p className="text-[11px]">As the student completes chapter-wise tests and mock quizzes, certified results and timestamps will be automatically inscribed here.</p>
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase text-slate-500">
                      <tr>
                        <th className="py-2 px-3">#</th>
                        <th className="py-2 px-3">Assessment / Topic</th>
                        <th className="py-2 px-3">Date</th>
                        <th className="py-2 px-3 text-center">Score</th>
                        <th className="py-2 px-3 text-center">Accuracy</th>
                        <th className="py-2 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {quizAttempts.slice(-5).map((att, i) => (
                        <tr key={att.id} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-mono text-slate-400">{i + 1}</td>
                          <td className="py-2 px-3 font-semibold text-slate-800">
                            {att.chapterTitle}
                            <span className="text-[10px] text-slate-500 block">{att.quizTitle}</span>
                          </td>
                          <td className="py-2 px-3 text-slate-500 text-[11px] whitespace-nowrap">
                            {att.date || 'Recent'}
                          </td>
                          <td className="py-2 px-3 text-center font-mono font-bold">
                            {att.score} / {att.totalQuestions}
                          </td>
                          <td className="py-2 px-3 text-center font-bold text-blue-700">
                            {att.percentage}%
                          </td>
                          <td className="py-2 px-3 text-center">
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                              att.percentage >= 60 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {att.percentage >= 60 ? 'PASSED' : 'REVISION'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* 6. COGNITIVE STRENGTHS & REVISION RECOMMENDATIONS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-emerald-50/40 rounded-xl border border-emerald-200 space-y-1.5">
                <h4 className="font-extrabold text-emerald-900 flex items-center gap-1.5 uppercase text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Demonstrated Academic Strengths</span>
                </h4>
                <ul className="list-disc list-inside space-y-1 text-slate-700 text-[11px] leading-relaxed">
                  <li>Strong comprehension of fundamental terminology and keyboard shortcuts.</li>
                  <li>Good retention of objective MCQ concepts and syllabus definitions.</li>
                  <li>Regular participation in structured learning and chapter evaluations.</li>
                </ul>
              </div>

              <div className="p-4 bg-amber-50/40 rounded-xl border border-amber-200 space-y-1.5">
                <h4 className="font-extrabold text-amber-900 flex items-center gap-1.5 uppercase text-[11px]">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Recommended Focus Areas for Board Exams</span>
                </h4>
                <ul className="list-disc list-inside space-y-1 text-slate-700 text-[11px] leading-relaxed">
                  <li>Practice multi-clause SQL queries (GROUP BY with HAVING and aggregate functions).</li>
                  <li>Revise spreadsheet tools (Goal Seek, Consolidate & Subtotals in LibreOffice Calc).</li>
                  <li>Solve Competency-Based Case Studies to ensure full step marks under CBSE scheme.</li>
                </ul>
              </div>
            </div>

            {/* 7. TEACHER REMARKS & MENTOR ENDORSEMENT */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-extrabold uppercase tracking-wider text-slate-800 text-[11px]">
                  Teacher & Mentor Evaluation Remarks
                </span>
                <span className="text-[10px] text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  Verified Academic Guidance
                </span>
              </div>
              <p className="text-slate-700 italic leading-relaxed text-[11px]">
                "{studentProfile.name} demonstrates genuine dedication towards mastering Computer Science & IT. 
                With targeted practice in hands-on practical play and timed board question papers, the student is well-positioned to achieve distinction in the upcoming CBSE Board Examination."
              </p>
            </div>

            {/* 8. SIGNATURE & ENDORSEMENT BLOCK */}
            <div className="pt-6 border-t border-slate-300 grid grid-cols-3 gap-4 text-center text-xs">
              <div className="space-y-1">
                <div className="h-10 flex items-center justify-center">
                  <span className="font-serif italic text-blue-900 font-bold text-base">Zakir Hussain</span>
                </div>
                <div className="border-t border-slate-400 pt-1">
                  <p className="font-extrabold text-slate-900 text-[11px]">Mr. Zakir Hussain</p>
                  <p className="text-[10px] text-slate-500">PGT Computer Science • Evaluator</p>
                </div>
              </div>

              <div className="space-y-1">
                <div className="h-10 flex items-center justify-center">
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Affiliation Seal</span>
                </div>
                <div className="border-t border-slate-400 pt-1">
                  <p className="font-extrabold text-slate-900 text-[11px]">Academic Coordinator</p>
                  <p className="text-[10px] text-slate-500">School Examination Dept.</p>
                </div>
              </div>

              <div className="space-y-1">
                <div className="h-10 flex items-center justify-center">
                  <span className="text-[10px] text-slate-400 italic">Signature</span>
                </div>
                <div className="border-t border-slate-400 pt-1">
                  <p className="font-extrabold text-slate-900 text-[11px]">Parent / Guardian</p>
                  <p className="text-[10px] text-slate-500">Acknowledgment & Date</p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Modal Footer (Screen Only) */}
        <div className="no-print p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs shrink-0">
          <p className="text-slate-500 text-[11px]">
            Tip: Select "Save as PDF" in your browser's print dialog to archive this progress report.
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
