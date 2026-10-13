import React, { useState, useEffect } from 'react';
import { 
  X, 
  Upload, 
  Plus, 
  Trash2, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Sparkles,
  Layers,
  BookOpen
} from 'lucide-react';
import { 
  LearningResource, 
  ChapterResourceType, 
  ClassLevel, 
  SubjectId, 
  QAItem, 
  MCQOptionItem 
} from '../../types';
import { useApp } from '../../context/AppContext';
import { getSubjectsForClass, getChapters } from '../../data/curriculumData';

interface LmsResourceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  resourceToEdit?: LearningResource | null;
  defaultClass?: ClassLevel;
  defaultSubject?: SubjectId;
  defaultChapterId?: string;
  isReplaceMode?: boolean;
}

export const LmsResourceFormModal: React.FC<LmsResourceFormModalProps> = ({
  isOpen,
  onClose,
  resourceToEdit,
  defaultClass = 'X',
  defaultSubject = 'it-402',
  defaultChapterId = '',
  isReplaceMode = false
}) => {
  const { 
    customClasses, 
    customSubjects, 
    customChapters, 
    addLearningResource, 
    updateLearningResource,
    replaceResourceFile 
  } = useApp();

  const [classLevel, setClassLevel] = useState<ClassLevel>(resourceToEdit?.classLevel || defaultClass);
  const [subjectId, setSubjectId] = useState<SubjectId>(resourceToEdit?.subjectId || defaultSubject);
  const [chapterId, setChapterId] = useState<string>(resourceToEdit?.chapterId || defaultChapterId);
  const [title, setTitle] = useState<string>(resourceToEdit?.title || '');
  const [description, setDescription] = useState<string>(resourceToEdit?.description || '');
  const [resourceType, setResourceType] = useState<ChapterResourceType>(resourceToEdit?.resourceType || 'notes');
  const [published, setPublished] = useState<boolean>(resourceToEdit?.published ?? true);
  const [content, setContent] = useState<string>(resourceToEdit?.content || '');
  const [author, setAuthor] = useState<string>(resourceToEdit?.author || 'Zakir Hussain');
  
  // File upload state
  const [fileName, setFileName] = useState<string>(resourceToEdit?.fileName || '');
  const [fileSize, setFileSize] = useState<string>(resourceToEdit?.fileSize || '');
  const [fileUrl, setFileUrl] = useState<string>(resourceToEdit?.fileUrl || '');
  const [pageCount, setPageCount] = useState<number>(resourceToEdit?.pageCount || 10);
  const [isReadingFile, setIsReadingFile] = useState<boolean>(false);

  // Structured QA items
  const [qaItems, setQaItems] = useState<QAItem[]>(resourceToEdit?.qaItems || [
    { id: 'qa-1', question: '', answer: '', marks: 2 }
  ]);

  // Structured MCQ items
  const [mcqItems, setMcqItems] = useState<MCQOptionItem[]>(resourceToEdit?.mcqItems || [
    { id: 'mcq-1', question: '', options: ['', '', '', ''], correctOptionIndex: 0, explanation: '', marks: 1 }
  ]);

  // Test settings
  const [testDurationMinutes, setTestDurationMinutes] = useState<number>(resourceToEdit?.testDurationMinutes || 20);
  const [totalMarks, setTotalMarks] = useState<number>(resourceToEdit?.totalMarks || 10);
  const [passingMarks, setPassingMarks] = useState<number>(resourceToEdit?.passingMarks || 4);

  const [activeTab, setActiveTab] = useState<'details' | 'content' | 'items'>('details');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Update available subjects and chapters dynamically
  const availableSubjects = getSubjectsForClass(classLevel, customSubjects);
  const availableChapters = getChapters(classLevel, subjectId, customChapters);

  // Sync state when props change
  useEffect(() => {
    if (resourceToEdit) {
      setClassLevel(resourceToEdit.classLevel);
      setSubjectId(resourceToEdit.subjectId);
      setChapterId(resourceToEdit.chapterId);
      setTitle(resourceToEdit.title);
      setDescription(resourceToEdit.description);
      setResourceType(resourceToEdit.resourceType);
      setPublished(resourceToEdit.published);
      setContent(resourceToEdit.content || '');
      setAuthor(resourceToEdit.author || 'Zakir Hussain');
      setFileName(resourceToEdit.fileName || '');
      setFileSize(resourceToEdit.fileSize || '');
      setFileUrl(resourceToEdit.fileUrl || '');
      setPageCount(resourceToEdit.pageCount || 10);
      setQaItems(resourceToEdit.qaItems || []);
      setMcqItems(resourceToEdit.mcqItems || []);
      setTestDurationMinutes(resourceToEdit.testDurationMinutes || 20);
      setTotalMarks(resourceToEdit.totalMarks || 10);
      setPassingMarks(resourceToEdit.passingMarks || 4);
    } else {
      setClassLevel(defaultClass);
      setSubjectId(defaultSubject);
      setChapterId(defaultChapterId);
      setTitle('');
      setDescription('');
      setResourceType('notes');
      setPublished(true);
      setContent('');
      setFileName('');
      setFileSize('');
      setFileUrl('');
      setQaItems([{ id: 'qa-1', question: '', answer: '', marks: 2 }]);
      setMcqItems([{ id: 'mcq-1', question: '', options: ['', '', '', ''], correctOptionIndex: 0, explanation: '', marks: 1 }]);
    }
  }, [resourceToEdit, defaultClass, defaultSubject, defaultChapterId, isOpen]);

  // When class changes, adjust subject & chapter
  useEffect(() => {
    const subs = getSubjectsForClass(classLevel, customSubjects);
    if (subs.length > 0 && !subs.some(s => s.id === subjectId)) {
      setSubjectId(subs[0].id);
    }
  }, [classLevel]);

  // When subject changes, adjust chapter
  useEffect(() => {
    const chaps = getChapters(classLevel, subjectId, customChapters);
    if (chaps.length > 0 && !chaps.some(c => c.id === chapterId)) {
      setChapterId(chaps[0].id);
    }
  }, [classLevel, subjectId]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsReadingFile(true);
    setFileName(file.name);
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
    setFileSize(`${sizeInMb} MB`);

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setFileUrl(dataUrl);
      setIsReadingFile(false);
      // Guess page count based on size
      setPageCount(Math.max(2, Math.round(file.size / (100 * 1024))));
    };
    reader.onerror = () => {
      setIsReadingFile(false);
      setErrorMessage('Failed to read uploaded file.');
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!title.trim()) {
      setErrorMessage('Resource Title is required.');
      return;
    }
    if (!chapterId) {
      setErrorMessage('Please select a valid chapter.');
      return;
    }

    const matchedChapter = availableChapters.find(c => c.id === chapterId);
    const chapterTitle = matchedChapter?.title || 'Chapter';

    if (isReplaceMode && resourceToEdit) {
      replaceResourceFile(resourceToEdit.id, {
        fileName: fileName || `${title.replace(/\s+/g, '_')}.pdf`,
        fileSize: fileSize || '1.5 MB',
        fileUrl: fileUrl,
        pageCount: pageCount
      });
      onClose();
      return;
    }

    const resourcePayload: Omit<LearningResource, 'id' | 'uploadedDate' | 'order'> = {
      title: title.trim(),
      description: description.trim(),
      resourceType,
      classLevel,
      subjectId,
      chapterId,
      chapterTitle,
      published,
      author,
      content,
      fileName: fileName || (fileUrl ? `${title.replace(/\s+/g, '_')}.pdf` : undefined),
      fileSize: fileSize || (fileUrl ? '1.5 MB' : undefined),
      fileUrl,
      pageCount,
      qaItems: ['qa', 'important_questions', 'pyq'].includes(resourceType) ? qaItems.filter(q => q.question.trim()) : undefined,
      mcqItems: ['mcq', 'chapter_test'].includes(resourceType) ? mcqItems.filter(m => m.question.trim()) : undefined,
      testDurationMinutes: resourceType === 'chapter_test' ? Number(testDurationMinutes) : undefined,
      totalMarks: resourceType === 'chapter_test' ? Number(totalMarks) : undefined,
      passingMarks: resourceType === 'chapter_test' ? Number(passingMarks) : undefined
    };

    if (resourceToEdit) {
      updateLearningResource(resourceToEdit.id, resourcePayload);
    } else {
      addLearningResource(resourcePayload);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-500/40 text-blue-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {isReplaceMode ? 'Replace Resource File / Content' : resourceToEdit ? 'Edit Learning Resource' : 'Add New Learning Resource'}
              </h2>
              <p className="text-xs text-slate-400">
                Dynamic hierarchy: Class → Subject → Chapter → Resource
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

        {/* Tab navigation */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 flex items-center gap-4 text-xs font-bold text-slate-600">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'details' ? 'border-blue-600 text-blue-600 font-extrabold' : 'border-transparent hover:text-slate-900'
            }`}
          >
            1. Placement & Hierarchy
          </button>
          <button
            onClick={() => setActiveTab('content')}
            className={`py-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'content' ? 'border-blue-600 text-blue-600 font-extrabold' : 'border-transparent hover:text-slate-900'
            }`}
          >
            2. File & Notes
          </button>
          {['qa', 'important_questions', 'pyq', 'mcq', 'chapter_test'].includes(resourceType) && (
            <button
              onClick={() => setActiveTab('items')}
              className={`py-3 border-b-2 transition-all cursor-pointer ${
                activeTab === 'items' ? 'border-blue-600 text-blue-600 font-extrabold' : 'border-transparent hover:text-slate-900'
              }`}
            >
              3. Interactive Items ({resourceType.toUpperCase()})
            </button>
          )}
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {activeTab === 'details' && (
            <div className="space-y-4">
              {/* Hierarchy Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Class */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Class Level *</label>
                  <select
                    value={classLevel}
                    onChange={e => setClassLevel(e.target.value as ClassLevel)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 font-medium focus:ring-2 focus:ring-blue-500"
                  >
                    {customClasses.map(c => (
                      <option key={c.level} value={c.level}>Class {c.level}</option>
                    ))}
                  </select>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Subject *</label>
                  <select
                    value={subjectId}
                    onChange={e => setSubjectId(e.target.value as SubjectId)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 font-medium focus:ring-2 focus:ring-blue-500"
                  >
                    {availableSubjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                    ))}
                  </select>
                </div>

                {/* Chapter */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Chapter *</label>
                  <select
                    value={chapterId}
                    onChange={e => setChapterId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 font-medium focus:ring-2 focus:ring-blue-500"
                  >
                    {availableChapters.length === 0 ? (
                      <option value="">No chapters created yet</option>
                    ) : (
                      availableChapters.map(c => (
                        <option key={c.id} value={c.id}>Ch {c.chapterNumber}: {c.title}</option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              {/* Resource Type */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Resource Type *</label>
                <select
                  value={resourceType}
                  onChange={e => setResourceType(e.target.value as ChapterResourceType)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="notes">Notes and study material</option>
                  <option value="qa">Question answers</option>
                  <option value="important_questions">Important questions</option>
                  <option value="mcq">MCQs</option>
                  <option value="practical_assignment">Practical files and assignments</option>
                  <option value="pyq">Previous-year questions and papers</option>
                  <option value="revision">Revision material</option>
                  <option value="chapter_test">Online chapter tests</option>
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Resource Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Master Notes: Digital Documentation (Advanced)"
                  className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description / Brief</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Describe what students will learn from this resource..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Author & Publication status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Author / Teacher</label>
                  <input
                    type="text"
                    value={author}
                    onChange={e => setAuthor(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center gap-3 pt-5">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={published}
                      onChange={e => setPublished(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                  <span className="text-xs font-bold text-slate-700">
                    {published ? 'Published (Visible to Students)' : 'Draft (Admin Only)'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'content' && (
            <div className="space-y-4">
              {/* File Upload Zone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Attach / Upload PDF or Document</label>
                <div className="p-6 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors text-center space-y-2">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                  <div className="text-xs text-slate-600">
                    <label className="font-bold text-blue-600 hover:text-blue-700 cursor-pointer">
                      Click to choose PDF or file
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.txt"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                    <span> or drag & drop</span>
                  </div>
                  <p className="text-[11px] text-slate-400">PDF, Word, or Markdown files supported</p>
                </div>

                {fileName && (
                  <div className="mt-2 p-3 bg-blue-50 rounded-xl border border-blue-200 flex items-center justify-between text-xs text-blue-900">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span className="font-bold">{fileName}</span>
                      {fileSize && <span className="text-slate-500">({fileSize})</span>}
                    </div>
                    <button
                      onClick={() => { setFileName(''); setFileUrl(''); setFileSize(''); }}
                      className="text-rose-600 hover:text-rose-800 text-[11px] font-bold"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Text / Markdown Content */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Notes & Text Content (Markdown supported)
                </label>
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  rows={10}
                  placeholder="# Chapter Notes&#10;&#10;### Key Concepts...&#10;&#10;- Point 1&#10;- Point 2"
                  className="w-full px-3 py-2 font-mono text-xs bg-white border border-slate-300 rounded-xl text-slate-800 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {activeTab === 'items' && (
            <div className="space-y-6">
              {/* If Q&A, Important Questions, or PYQ */}
              {['qa', 'important_questions', 'pyq'].includes(resourceType) && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                      Question & Answer Pairs ({qaItems.length})
                    </h3>
                    <button
                      onClick={() => setQaItems([...qaItems, { id: `qa-${Date.now()}`, question: '', answer: '', marks: 2 }])}
                      className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Question</span>
                    </button>
                  </div>

                  {qaItems.map((item, idx) => (
                    <div key={item.id || idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs font-bold text-slate-700">Q{idx + 1}</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="1"
                            max="10"
                            value={item.marks || 2}
                            onChange={e => {
                              const updated = [...qaItems];
                              updated[idx].marks = Number(e.target.value);
                              setQaItems(updated);
                            }}
                            className="w-16 px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-center"
                            placeholder="Marks"
                          />
                          <span className="text-[11px] text-slate-500">Marks</span>
                          <button
                            onClick={() => setQaItems(qaItems.filter((_, i) => i !== idx))}
                            className="p-1 text-rose-500 hover:text-rose-700 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <input
                        type="text"
                        value={item.question}
                        onChange={e => {
                          const updated = [...qaItems];
                          updated[idx].question = e.target.value;
                          setQaItems(updated);
                        }}
                        placeholder="Enter question text..."
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900"
                      />

                      <textarea
                        value={item.answer}
                        onChange={e => {
                          const updated = [...qaItems];
                          updated[idx].answer = e.target.value;
                          setQaItems(updated);
                        }}
                        rows={3}
                        placeholder="Enter model answer with marking points..."
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* If MCQ or Online Chapter Test */}
              {['mcq', 'chapter_test'].includes(resourceType) && (
                <div className="space-y-4">
                  {resourceType === 'chapter_test' && (
                    <div className="p-4 bg-violet-50 rounded-2xl border border-violet-200 grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-violet-800 mb-1">Duration (Mins)</label>
                        <input
                          type="number"
                          value={testDurationMinutes}
                          onChange={e => setTestDurationMinutes(Number(e.target.value))}
                          className="w-full px-2 py-1.5 bg-white border border-violet-300 rounded-lg text-xs font-bold text-center"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-violet-800 mb-1">Total Marks</label>
                        <input
                          type="number"
                          value={totalMarks}
                          onChange={e => setTotalMarks(Number(e.target.value))}
                          className="w-full px-2 py-1.5 bg-white border border-violet-300 rounded-lg text-xs font-bold text-center"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-violet-800 mb-1">Passing Marks</label>
                        <input
                          type="number"
                          value={passingMarks}
                          onChange={e => setPassingMarks(Number(e.target.value))}
                          className="w-full px-2 py-1.5 bg-white border border-violet-300 rounded-lg text-xs font-bold text-center"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                      MCQ Questions ({mcqItems.length})
                    </h3>
                    <button
                      onClick={() => setMcqItems([
                        ...mcqItems, 
                        { id: `mcq-${Date.now()}`, question: '', options: ['', '', '', ''], correctOptionIndex: 0, explanation: '', marks: 1 }
                      ])}
                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add MCQ</span>
                    </button>
                  </div>

                  {mcqItems.map((item, idx) => (
                    <div key={item.id || idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700">Question {idx + 1}</span>
                        <button
                          onClick={() => setMcqItems(mcqItems.filter((_, i) => i !== idx))}
                          className="p-1 text-rose-500 hover:text-rose-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <input
                        type="text"
                        value={item.question}
                        onChange={e => {
                          const updated = [...mcqItems];
                          updated[idx].question = e.target.value;
                          setMcqItems(updated);
                        }}
                        placeholder="Enter question text..."
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900"
                      />

                      {/* 4 Options */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {item.options.map((opt, optIdx) => (
                          <div key={optIdx} className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200">
                            <input
                              type="radio"
                              name={`correct-${idx}`}
                              checked={item.correctOptionIndex === optIdx}
                              onChange={() => {
                                const updated = [...mcqItems];
                                updated[idx].correctOptionIndex = optIdx;
                                setMcqItems(updated);
                              }}
                              className="text-emerald-600 focus:ring-emerald-500"
                            />
                            <span className="text-xs font-bold text-slate-500 w-4">
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <input
                              type="text"
                              value={opt}
                              onChange={e => {
                                const updated = [...mcqItems];
                                updated[idx].options[optIdx] = e.target.value;
                                setMcqItems(updated);
                              }}
                              placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                              className="w-full text-xs text-slate-800 bg-transparent focus:outline-none"
                            />
                          </div>
                        ))}
                      </div>

                      <input
                        type="text"
                        value={item.explanation || ''}
                        onChange={e => {
                          const updated = [...mcqItems];
                          updated[idx].explanation = e.target.value;
                          setMcqItems(updated);
                        }}
                        placeholder="Explanation / Rationale (Optional)"
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] text-slate-600"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={isReadingFile}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors cursor-pointer disabled:opacity-50"
          >
            {isReadingFile ? 'Processing...' : resourceToEdit ? 'Save Changes' : 'Create Resource'}
          </button>
        </div>
      </div>
    </div>
  );
};
