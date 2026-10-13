import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Eye, 
  Download, 
  Sparkles, 
  BookOpen, 
  Layers, 
  ArrowRight,
  RefreshCw,
  Award,
  FileType,
  X,
  Plus
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ClassLevel, SubjectId, PYQPaper, PYQQuestionItem } from '../types';
import { CLASSES_LIST } from '../data/curriculumData';
import { savePdfChapterToSupabase } from '../lib/supabase';

interface PYQPdfUploaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultClass?: ClassLevel;
  defaultSubject?: SubjectId;
}

export const PYQPdfUploaderModal: React.FC<PYQPdfUploaderModalProps> = ({
  isOpen,
  onClose,
  defaultClass = 'X',
  defaultSubject = 'it-402'
}) => {
  const { addPYQPaper, customSubjects } = useApp();

  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pdfDataUrl, setPdfDataUrl] = useState<string>('');
  const [fileSizeStr, setFileSizeStr] = useState<string>('');

  // Marking scheme file (optional)
  const [markingSchemeFile, setMarkingSchemeFile] = useState<File | null>(null);
  const [markingSchemeDataUrl, setMarkingSchemeDataUrl] = useState<string>('');
  const [markingSchemeSizeStr, setMarkingSchemeSizeStr] = useState<string>('');

  // Form Fields
  const [year, setYear] = useState<string>('2025');
  const [examType, setExamType] = useState<string>('CBSE Board Examination');
  const [classLevel, setClassLevel] = useState<ClassLevel>(defaultClass);
  const [subjectId, setSubjectId] = useState<SubjectId>(defaultSubject);
  const [totalMarks, setTotalMarks] = useState<number>(50);
  const [timeHours, setTimeHours] = useState<number>(2);
  const [questionsSummary, setQuestionsSummary] = useState<string>(
    'Official Board Paper with Section A (Objective/MCQ) and Section B (Subjective & Practical)'
  );

  // Sample or extracted key questions
  const [sampleQuestions, setSampleQuestions] = useState<PYQQuestionItem[]>([
    {
      qNumber: 'Q1',
      question: 'Identify the valid style or key concept from this question paper.',
      marks: 1,
      officialAnswer: 'According to official CBSE marking guidelines.',
      stepMarkingScheme: '1 Mark for correct choice / concept explanation.'
    }
  ]);

  const [isUploading, setIsUploading] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const markingSchemeInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Available subjects for selected class
  const availableSubjects = customSubjects.filter(sub => sub.classes.includes(classLevel));
  const currentSubjectObj = customSubjects.find(s => s.id === subjectId) || availableSubjects[0];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const parseAndSelectFile = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setErrorToast('Please select a valid PDF file (.pdf).');
      return;
    }

    setErrorToast(null);
    setSelectedFile(file);

    // Format size
    const mb = file.size / (1024 * 1024);
    const sizeFormatted = mb < 1 ? `${Math.round(file.size / 1024)} KB` : `${mb.toFixed(1)} MB`;
    setFileSizeStr(sizeFormatted);

    // Read as Base64 Data URL for in-browser PDF viewing
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPdfDataUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const parseMarkingSchemeFile = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setErrorToast('Please select a valid PDF file for the marking scheme.');
      return;
    }

    setMarkingSchemeFile(file);
    const mb = file.size / (1024 * 1024);
    setMarkingSchemeSizeStr(mb < 1 ? `${Math.round(file.size / 1024)} KB` : `${mb.toFixed(1)} MB`);

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setMarkingSchemeDataUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      parseAndSelectFile(e.dataTransfer.files[0]);
    }
  };

  const handleAddSampleQuestion = () => {
    setSampleQuestions(prev => [
      ...prev,
      {
        qNumber: `Q${prev.length + 1}`,
        question: '',
        marks: 2,
        officialAnswer: '',
        stepMarkingScheme: ''
      }
    ]);
  };

  const handleUpdateSampleQuestion = (index: number, field: keyof PYQQuestionItem, value: any) => {
    setSampleQuestions(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleRemoveSampleQuestion = (index: number) => {
    setSampleQuestions(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorToast(null);

    if (!selectedFile && !pdfDataUrl) {
      setErrorToast('Please upload a Previous Year Paper PDF document.');
      return;
    }

    if (!year.trim()) {
      setErrorToast('Please specify the examination year (e.g., 2024, 2023).');
      return;
    }

    setIsUploading(true);

    try {
      const subjectName = currentSubjectObj ? currentSubjectObj.name : 'Information Technology';
      const code = currentSubjectObj ? currentSubjectObj.code : `Code ${subjectId}`;

      addPYQPaper({
        year: year.trim(),
        examType: examType.trim() || 'CBSE Main Board Examination',
        classLevel,
        subjectId,
        subjectName,
        code,
        totalMarks: Number(totalMarks) || 50,
        timeHours: Number(timeHours) || 2,
        questionsSummary: questionsSummary.trim() || 'Official CBSE Board Question Paper',
        sampleQuestions: sampleQuestions.filter(q => q.question.trim().length > 0),
        pdfDataUrl: pdfDataUrl || undefined,
        fileName: selectedFile?.name || `CBSE_Class_${classLevel}_${code}_${year}.pdf`,
        fileSize: fileSizeStr || '1.2 MB',
        markingSchemePdfUrl: markingSchemeDataUrl || undefined,
        markingSchemeFileName: markingSchemeFile?.name || undefined
      });

      // Sync Previous Year Paper PDF metadata to Supabase
      savePdfChapterToSupabase({
        id: `pyq-${year}-${classLevel}-${subjectId}-${Date.now()}`,
        fileName: selectedFile?.name || `CBSE_Class_${classLevel}_${code}_${year}.pdf`,
        classLevel,
        subjectId,
        chapterTitle: `${year} CBSE Board Paper (${examType})`,
        questionCount: sampleQuestions.length,
        extractedQuestions: sampleQuestions,
        pdfDataUrl: pdfDataUrl || undefined
      });

      setSuccessToast(`✓ Previous Year Paper for Class ${classLevel} (${year}) published!`);
      setTimeout(() => {
        setIsUploading(false);
        onClose();
      }, 1000);
    } catch (err: any) {
      setErrorToast(err?.message || 'Failed to publish previous year paper.');
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/80 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center justify-center font-bold">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Upload Previous Year Board Paper (PDF)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/30 text-blue-200 font-mono border border-blue-400/30 uppercase">
                  PYQ Archive
                </span>
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Attach authentic CBSE board papers with official marking keys for Class VI–XII students
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 text-slate-800">
          {errorToast && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorToast}</span>
            </div>
          )}

          {successToast && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-bold">{successToast}</span>
            </div>
          )}

          {/* 1. Drag & Drop PDF Dropzone */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
              1. Main Question Paper Document (PDF) <span className="text-rose-500">*</span>
            </label>

            {!selectedFile ? (
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
                  dragActive 
                    ? 'border-blue-600 bg-blue-50/50 scale-[1.01]' 
                    : 'border-slate-300 hover:border-blue-400 bg-slate-50/60 hover:bg-slate-50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf,.pdf"
                  className="hidden"
                  onChange={e => {
                    if (e.target.files && e.target.files[0]) {
                      parseAndSelectFile(e.target.files[0]);
                    }
                  }}
                />

                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 mx-auto flex items-center justify-center mb-3 shadow-xs">
                  <FileType className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">
                  Click or drag and drop Previous Year Question Paper PDF
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Supports CBSE Board question papers, Compartment papers, and Pre-Board exam sets (.pdf)
                </p>
                <div className="mt-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 shadow-2xs">
                    <Upload className="w-3.5 h-3.5 text-blue-600" />
                    <span>Select PDF File</span>
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-slate-900 truncate max-w-xs sm:max-w-md">
                      {selectedFile.name}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {fileSizeStr} • Ready to attach
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    setPdfDataUrl('');
                    setFileSizeStr('');
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Remove File"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* 2. Paper Particulars Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Class Level <span className="text-rose-500">*</span>
              </label>
              <select
                value={classLevel}
                onChange={e => {
                  const val = e.target.value as ClassLevel;
                  setClassLevel(val);
                  const subs = customSubjects.filter(s => s.classes.includes(val));
                  if (subs.length > 0) setSubjectId(subs[0].id);
                }}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:border-blue-500 outline-none"
              >
                {CLASSES_LIST.map(c => (
                  <option key={c.level} value={c.level}>Class {c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Subject <span className="text-rose-500">*</span>
              </label>
              <select
                value={subjectId}
                onChange={e => setSubjectId(e.target.value as SubjectId)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:border-blue-500 outline-none"
              >
                {availableSubjects.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Exam Year <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={year}
                onChange={e => setYear(e.target.value)}
                placeholder="2025 or 2024"
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:border-blue-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Exam Type / Series
              </label>
              <input
                type="text"
                value={examType}
                onChange={e => setExamType(e.target.value)}
                placeholder="CBSE Main Board Examination / Compartment"
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Total Marks
              </label>
              <input
                type="number"
                value={totalMarks}
                onChange={e => setTotalMarks(Number(e.target.value))}
                min={10}
                max={100}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Duration (Hours)
              </label>
              <input
                type="number"
                value={timeHours}
                onChange={e => setTimeHours(Number(e.target.value))}
                min={1}
                max={4}
                step={0.5}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Question Paper Overview / Structure
            </label>
            <input
              type="text"
              value={questionsSummary}
              onChange={e => setQuestionsSummary(e.target.value)}
              placeholder="e.g. 21 Questions (Section A: 24 objective marks, Section B: 26 descriptive marks)"
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:border-blue-500 outline-none"
            />
          </div>

          {/* 3. Optional Official Marking Scheme PDF Attachment */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-purple-600" />
                  <span>Attach Official Marking Scheme / Solution Key PDF (Optional)</span>
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Students can download or toggle examiner step-marking rubrics directly from this paper.
                </p>
              </div>

              {!markingSchemeFile ? (
                <button
                  type="button"
                  onClick={() => markingSchemeInputRef.current?.click()}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Attach Key PDF
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMarkingSchemeFile(null);
                    setMarkingSchemeDataUrl('');
                    setMarkingSchemeSizeStr('');
                  }}
                  className="text-xs text-rose-600 font-bold hover:underline cursor-pointer"
                >
                  Remove Key
                </button>
              )}

              <input
                ref={markingSchemeInputRef}
                type="file"
                accept="application/pdf,.pdf"
                className="hidden"
                onChange={e => {
                  if (e.target.files && e.target.files[0]) {
                    parseMarkingSchemeFile(e.target.files[0]);
                  }
                }}
              />
            </div>

            {markingSchemeFile && (
              <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-xs flex items-center justify-between">
                <span className="font-bold text-purple-950 truncate max-w-sm">
                  {markingSchemeFile.name} ({markingSchemeSizeStr})
                </span>
                <span className="text-[10px] bg-purple-200 text-purple-800 px-2 py-0.5 rounded font-mono font-bold">
                  Marking Key Attached
                </span>
              </div>
            )}
          </div>

          {/* 4. Highlighted Sample Questions & Step Marking Breakdown */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Featured Board Questions & Step-Marking Scheme
                </h4>
                <p className="text-[11px] text-slate-500">
                  Highlight key questions from this paper that students can view on screen with official answers and step points.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddSampleQuestion}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Question</span>
              </button>
            </div>

            <div className="space-y-3">
              {sampleQuestions.map((q, qIdx) => (
                <div key={qIdx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 relative">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={q.qNumber}
                        onChange={e => handleUpdateSampleQuestion(qIdx, 'qNumber', e.target.value)}
                        placeholder="Q1"
                        className="w-16 p-1.5 rounded-lg border border-slate-200 text-xs font-mono font-bold text-blue-600 bg-white"
                      />
                      <span className="text-xs text-slate-500 font-medium">Question #{qIdx + 1}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-xs">
                        <span className="text-slate-500">Marks:</span>
                        <input
                          type="number"
                          value={q.marks}
                          onChange={e => handleUpdateSampleQuestion(qIdx, 'marks', Number(e.target.value))}
                          min={1}
                          max={10}
                          className="w-14 p-1 rounded-lg border border-slate-200 text-xs font-bold bg-white text-center"
                        />
                      </div>
                      {sampleQuestions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSampleQuestion(qIdx)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <textarea
                      value={q.question}
                      onChange={e => handleUpdateSampleQuestion(qIdx, 'question', e.target.value)}
                      placeholder="Enter question text from board paper..."
                      rows={2}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-[10px] font-bold text-emerald-800 uppercase block mb-1">
                        Official Model Answer
                      </label>
                      <textarea
                        value={q.officialAnswer}
                        onChange={e => handleUpdateSampleQuestion(qIdx, 'officialAnswer', e.target.value)}
                        placeholder="Official model answer / output..."
                        rows={2}
                        className="w-full p-2 rounded-xl border border-emerald-200 bg-emerald-50/50 text-xs outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-purple-800 uppercase block mb-1">
                        Examiner Step-Marking Rubric
                      </label>
                      <textarea
                        value={q.stepMarkingScheme}
                        onChange={e => handleUpdateSampleQuestion(qIdx, 'stepMarkingScheme', e.target.value)}
                        placeholder="e.g. 1 Mark for syntax + 1 Mark for logic..."
                        rows={2}
                        className="w-full p-2 rounded-xl border border-purple-200 bg-purple-50/50 text-xs outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              {isUploading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Publishing Board Paper...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Publish Previous Year Paper</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
