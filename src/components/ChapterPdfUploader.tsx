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
  FolderCheck,
  FileType
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ClassLevel, SubjectId, MaterialType, StudyMaterial } from '../types';
import { CLASSES_LIST, getSubjectsForClass, getChapters } from '../data/curriculumData';
import { downloadChapterPDF } from '../lib/pdfGenerator';
import { savePdfChapterToSupabase } from '../lib/supabase';

interface ChapterPdfUploaderProps {
  onSuccess?: (material: StudyMaterial) => void;
  defaultClass?: ClassLevel;
  defaultSubject?: SubjectId;
  defaultChapterId?: string;
  isCompact?: boolean;
}

export const ChapterPdfUploader: React.FC<ChapterPdfUploaderProps> = ({
  onSuccess,
  defaultClass = 'X',
  defaultSubject = 'it-402',
  defaultChapterId = '',
  isCompact = false
}) => {
  const { 
    addStudyMaterial, 
    customClasses, 
    customSubjects, 
    customChapters,
    syncAllCurriculumMaterials,
    studyMaterials
  } = useApp();

  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pdfDataUrl, setPdfDataUrl] = useState<string>('');
  const [fileSizeStr, setFileSizeStr] = useState<string>('');
  
  // Metadata state
  const [classLevel, setClassLevel] = useState<ClassLevel>(defaultClass);
  const [subjectId, setSubjectId] = useState<SubjectId>(defaultSubject);
  const [chapterId, setChapterId] = useState<string>(defaultChapterId);
  const [chapterTitle, setChapterTitle] = useState<string>('');
  const [materialTitle, setMaterialTitle] = useState<string>('');
  const [materialType, setMaterialType] = useState<MaterialType>('notes');
  const [description, setDescription] = useState<string>('');
  const [tags, setTags] = useState<string>('IT 402, Chapter PDF, Study Material');
  
  const [isUploading, setIsUploading] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Available subjects for selected class
  const availableSubjects = customSubjects.filter(sub => sub.classes.includes(classLevel));
  // Available chapters for selected class & subject
  const availableChapters = customChapters.filter(ch => ch.classLevel === classLevel && ch.subjectId === subjectId);

  // Set default chapter if available
  React.useEffect(() => {
    if (availableChapters.length > 0 && (!chapterId || !availableChapters.some(c => c.id === chapterId))) {
      setChapterId(availableChapters[0].id);
      setChapterTitle(availableChapters[0].title);
    }
  }, [classLevel, subjectId, availableChapters]);

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
      setErrorToast('Please select a valid PDF document (.pdf file).');
      return;
    }

    setErrorToast(null);
    setSelectedFile(file);
    
    // Format size
    const kb = file.size / 1024;
    const sizeFormatted = kb > 1024 ? `${(kb / 1024).toFixed(2)} MB` : `${Math.round(kb)} KB`;
    setFileSizeStr(sizeFormatted);

    // Auto-detect information from filename
    const cleanName = file.name.replace(/\.pdf$/i, '').replace(/[-_]/g, ' ');
    setMaterialTitle(cleanName);
    setDescription(`Official chapter PDF study material: ${cleanName}.`);

    // Intelligent Class detection
    const nameLower = file.name.toLowerCase();
    if (nameLower.includes('class 10') || nameLower.includes('class10') || nameLower.includes('class-10') || nameLower.includes('class_10') || nameLower.includes('class-x')) {
      setClassLevel('X');
    } else if (nameLower.includes('class 9') || nameLower.includes('class9') || nameLower.includes('class-9') || nameLower.includes('class-ix')) {
      setClassLevel('IX');
    } else if (nameLower.includes('class 12') || nameLower.includes('class12') || nameLower.includes('class-xii')) {
      setClassLevel('XII');
    } else if (nameLower.includes('class 11') || nameLower.includes('class11') || nameLower.includes('class-xi')) {
      setClassLevel('XI');
    } else if (nameLower.includes('class 6') || nameLower.includes('class6')) {
      setClassLevel('VI');
    } else if (nameLower.includes('class 7') || nameLower.includes('class7')) {
      setClassLevel('VII');
    } else if (nameLower.includes('class 8') || nameLower.includes('class8')) {
      setClassLevel('VIII');
    }

    // Intelligent Subject detection
    if (nameLower.includes('802') || nameLower.includes('it-802') || nameLower.includes('it802')) {
      setSubjectId('it-802');
    } else if (nameLower.includes('065') || nameLower.includes('ip-065') || nameLower.includes('informatics')) {
      setSubjectId('ip-065');
    } else if (nameLower.includes('817') || nameLower.includes('typography')) {
      setSubjectId('typo-817');
    } else {
      setSubjectId('it-402');
    }

    // Intelligent Category detection
    if (nameLower.includes('pyq') || nameLower.includes('previous year') || nameLower.includes('question paper') || nameLower.includes('board paper') || nameLower.includes('sample paper')) {
      setMaterialType('previous_year_paper');
    }

    // Convert file to Base64 Data URL for persistent in-browser storage and immediate download
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setPdfDataUrl(event.target.result as string);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      parseAndSelectFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorToast('Please drag and drop or choose a PDF file to upload.');
      return;
    }

    if (!materialTitle.trim()) {
      setErrorToast('Please provide a title for the chapter study material.');
      return;
    }

    setIsUploading(true);

    try {
      const selectedCh = availableChapters.find(c => c.id === chapterId);
      const chTitleToUse = selectedCh ? selectedCh.title : chapterTitle || 'Chapter Study Material';

      // Generate rich markdown summary for reader view alongside attached PDF
      const defaultContent = `# ${materialTitle}
*Curriculum: Class ${classLevel} • ${subjectId.toUpperCase()} • ${chTitleToUse}*
*Uploaded via Zakir Learning Hub Portal*

---

## Chapter Overview
This official chapter document has been uploaded as a PDF file directly to your Zakir Learning Hub portal.

- **File Name:** \`${selectedFile.name}\`
- **File Size:** ${fileSizeStr}
- **Class Level:** Class ${classLevel}
- **Subject:** ${subjectId.toUpperCase()}
- **Chapter / Unit:** ${chTitleToUse}

### Quick Actions:
Click the **"Download Chapter PDF"** or **"View PDF Document"** button above to inspect or print the complete document.`;

      const newMaterial: Omit<StudyMaterial, 'id' | 'uploadedDate'> = {
        classLevel,
        subjectId,
        chapterId: chapterId || `ch-${Date.now()}`,
        chapterTitle: chTitleToUse,
        title: materialTitle,
        type: materialType,
        description: description || `Official Chapter PDF: ${materialTitle}`,
        readTimeMinutes: Math.max(5, Math.min(30, Math.round(selectedFile.size / 60000))),
        author: 'Mr. Zakir Hussain',
        content: defaultContent,
        downloadableFileName: selectedFile.name,
        pdfDataUrl: pdfDataUrl || undefined,
        fileSize: fileSizeStr,
        curriculumPart: chTitleToUse.toLowerCase().includes('skills') ? 'Part A: Employability Skills' : 'Part B: Subject Specific Skills',
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        published: true
      };

      addStudyMaterial(newMaterial);
      
      // Save chapter PDF to Supabase live
      savePdfChapterToSupabase({
        id: `pdf-ch-${Date.now()}`,
        fileName: selectedFile.name,
        classLevel,
        subjectId,
        chapterTitle: chTitleToUse,
        questionCount: 0,
        extractedQuestions: [],
        pdfDataUrl: pdfDataUrl || undefined
      });

      setSuccessToast(`Successfully uploaded "${selectedFile.name}" to Class ${classLevel} (${chTitleToUse})!`);
      setSelectedFile(null);
      setPdfDataUrl('');
      setMaterialTitle('');
      setDescription('');
      
      if (onSuccess) {
        onSuccess(newMaterial as StudyMaterial);
      }
    } catch (err: any) {
      setErrorToast(err?.message || 'Failed to upload PDF. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-200/60">
            <Sparkles className="w-3.5 h-3.5" />
            Information Technology • Chapter PDF Uploader
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Upload className="w-6 h-6 text-blue-600" />
            Drag & Drop Chapter PDF Upload
          </h2>

        </div>

        {/* Sync Button */}
        <button
          type="button"
          onClick={() => {
            syncAllCurriculumMaterials();
            setSuccessToast('All official IT chapters (PDFs & Notes) synchronized successfully!');
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm active:scale-95 shrink-0"
          title="Import or restore all pre-loaded chapters"
        >
          <RefreshCw className="w-4 h-4 text-blue-400" />
          Sync All IT Chapters
        </button>
      </div>

      {/* Notifications */}
      {successToast && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-emerald-800 text-sm animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successToast}</span>
          </div>
          <button 
            type="button"
            onClick={() => setSuccessToast(null)} 
            className="text-emerald-600 hover:text-emerald-800 text-xs font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {errorToast && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between text-rose-800 text-sm animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{errorToast}</span>
          </div>
          <button 
            type="button"
            onClick={() => setErrorToast(null)} 
            className="text-rose-600 hover:text-rose-800 text-xs font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Drag & Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all cursor-pointer select-none ${
          dragActive 
            ? 'border-blue-600 bg-blue-50/80 scale-[1.01]' 
            : selectedFile 
              ? 'border-emerald-500 bg-emerald-50/30' 
              : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50/60'
        }`}
      >
        <input 
          ref={fileInputRef}
          type="file" 
          accept="application/pdf"
          onChange={handleFileChange}
          className="hidden"
        />

        {selectedFile ? (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner">
              <FileType className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
                PDF Document Ready
              </span>
              <h3 className="text-lg font-bold text-slate-900 break-all">
                {selectedFile.name}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Size: {fileSizeStr} • Click or drag another file to replace
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-inner">
              <Upload className="w-8 h-8 animate-bounce" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">
                Drag and drop your Chapter PDF file here
              </h3>
              <p className="text-sm text-slate-500">
                or <span className="text-blue-600 font-semibold underline">browse from your computer</span>
              </p>
              <p className="text-xs text-slate-400">
                Supports official PDF notes, sample question files, and unit summaries
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Upload Details Form */}
      {selectedFile && (
        <form onSubmit={handleUploadSubmit} className="space-y-6 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Target Class */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Select Class *
              </label>
              <select
                value={classLevel}
                onChange={(e) => setClassLevel(e.target.value as ClassLevel)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                {customClasses.map(cls => (
                  <option key={cls.level} value={cls.level}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Target Subject */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Subject Code *
              </label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value as SubjectId)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                {availableSubjects.map(sub => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name} ({sub.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Target Chapter */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Chapter / Unit *
              </label>
              <select
                value={chapterId}
                onChange={(e) => {
                  setChapterId(e.target.value);
                  const found = availableChapters.find(c => c.id === e.target.value);
                  if (found) setChapterTitle(found.title);
                }}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                {availableChapters.map(ch => (
                  <option key={ch.id} value={ch.id}>
                    Unit {ch.chapterNumber}: {ch.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Document / Chapter Title *
              </label>
              <input
                type="text"
                value={materialTitle}
                onChange={(e) => setMaterialTitle(e.target.value)}
                placeholder="e.g. Digital Documentation (Advanced) Complete Notes"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                required
              />
            </div>

            {/* Material Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Resource Category
              </label>
              <select
                value={materialType}
                onChange={(e) => setMaterialType(e.target.value as MaterialType)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="notes">Complete Chapter Notes (PDF)</option>
                <option value="previous_year_paper">Previous Year Question Paper (PYQ / Board Exam)</option>
                <option value="important_questions">Important CBSE Board Questions & Answers</option>
                <option value="practical_file">Practical Lab Manual & Solutions</option>
                <option value="cheat_sheet">Quick Revision Cheat Sheet</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Description & Topics Covered
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Summary of topics, formulas, or CBSE board question coverage..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
            />
          </div>

          {/* Submit Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setSelectedFile(null);
                setPdfDataUrl('');
              }}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-all"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isUploading}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Uploading PDF...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Upload & Publish Chapter PDF
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Currently Available Chapter PDFs Preview */}
      <div className="border-t border-slate-100 pt-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderCheck className="w-5 h-5 text-blue-600" />
            <h4 className="text-sm font-bold text-slate-900">
              Published Chapter PDF Materials ({studyMaterials.length})
            </h4>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            Curated Chapter Study Material
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
          {studyMaterials.map((mat) => (
            <div
              key={mat.id}
              className="p-3.5 rounded-2xl border border-slate-200/90 bg-slate-50/50 hover:bg-slate-50 transition-all flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 font-bold text-xs">
                  {mat.classLevel}
                </div>
                <div className="min-w-0">
                  <h5 className="text-xs font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                    {mat.title}
                  </h5>
                  <p className="text-[11px] text-slate-500 truncate">
                    {mat.chapterTitle} • {mat.downloadableFileName || 'Chapter.pdf'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => downloadChapterPDF(mat)}
                  className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-300 transition-all text-xs font-semibold flex items-center gap-1"
                  title="Download Chapter PDF"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-[11px]">PDF</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
