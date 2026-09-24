import React, { useState } from 'react';
import { X, Upload, AlertCircle, FilePlus, Link2, Trash2, Layers, CheckCircle2 } from 'lucide-react';
import type { User, Subject, AcademicClass, ContentCategory, ContentType } from '../types.js';

interface UploadResourceModalProps {
  currentUser: User;
  subjects: Subject[];
  classes: AcademicClass[];
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
  initialSubjectId?: string;
  initialClassId?: string;
}

const CATEGORIES: ContentCategory[] = [
  'Study Material',
  'Assessment',
  'Practical',
  'Teaching Resources',
];

const CONTENT_TYPES: ContentType[] = [
  'Notes',
  'PDF',
  'Worksheet',
  'Assignment',
  'Question Paper',
  'Sample Paper',
  'Presentation',
  'Practical File',
  'Project',
  'Lesson Plan',
  'Video',
  'Audio',
  'Link',
  'YouTube Link',
  'Google Drive Link',
  'DOCX',
  'PPTX',
  'XLSX',
  'Images',
  'ZIP',
];

export const UploadResourceModal: React.FC<UploadResourceModalProps> = ({
  currentUser,
  subjects,
  classes,
  onClose,
  onSubmit,
  initialSubjectId,
  initialClassId,
}) => {
  // Allowed subjects: if teacher, only assigned subjects; if admin, all subjects
  const allowedSubjects =
    currentUser.role === 'admin'
      ? subjects
      : subjects.filter((s) => currentUser.assignedSubjectIds?.includes(s.id));

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subjectId, setSubjectId] = useState(
    initialSubjectId || (allowedSubjects.length > 0 ? allowedSubjects[0].id : '')
  );
  const [classId, setClassId] = useState(
    initialClassId || (classes.length > 0 ? classes[0].id : '')
  );
  const [chapter, setChapter] = useState('');
  const [topic, setTopic] = useState('');
  const [category, setCategory] = useState<ContentCategory>('Study Material');
  const [contentType, setContentType] = useState<ContentType>('PDF');
  const [academicSession, setAcademicSession] = useState('2026-27');
  const [externalLink, setExternalLink] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFilesAdded = (incomingFiles: FileList | File[]) => {
    const arr = Array.from(incomingFiles);
    setFiles((prev) => [...prev, ...arr]);
    if (!title && arr.length > 0) {
      const subObj = subjects.find((s) => s.id === subjectId);
      const clsObj = classes.find((c) => c.id === classId);
      const baseName = arr[0].name.replace(/\.[^/.]+$/, '');
      setTitle(`${subObj?.name || 'Subject'} - ${clsObj?.name || 'Class'} - ${baseName}`);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesAdded(e.dataTransfer.files);
    }
  };

  const removeFileAtIndex = (index: number) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0 && !externalLink && !title.trim()) {
      setError('Please select or drag-and-drop at least one file for batch upload.');
      return;
    }
    if (!subjectId || !classId || !chapter.trim()) {
      setError('Please fill in all required fields (Subject, Target Class, and Chapter).');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const subObj = subjects.find((s) => s.id === subjectId);
      const clsObj = classes.find((c) => c.id === classId);

      if (files.length > 0) {
        // Batch upload each file with auto-tagging
        for (let i = 0; i < files.length; i++) {
          const f = files[i];
          const baseName = f.name.replace(/\.[^/.]+$/, '');
          const fileTitle = files.length === 1 && title.trim() ? title : `${subObj?.name || 'Subject'} - ${clsObj?.name || 'Class'} - ${baseName}`;

          const formData = new FormData();
          formData.append('title', fileTitle);
          formData.append('description', description || `Batch uploaded curriculum file for ${subObj?.name} (${clsObj?.name})`);
          formData.append('subjectId', subjectId);
          formData.append('classId', classId);
          formData.append('chapter', chapter);
          formData.append('topic', topic || 'General');
          formData.append('category', category);

          // Auto-tag / infer content type from extension
          let inferredType: ContentType = contentType;
          const ext = f.name.split('.').pop()?.toLowerCase();
          if (ext === 'pdf') inferredType = 'PDF';
          else if (['doc', 'docx'].includes(ext || '')) inferredType = 'DOCX';
          else if (['ppt', 'pptx'].includes(ext || '')) inferredType = 'PPTX';
          else if (['xls', 'xlsx'].includes(ext || '')) inferredType = 'XLSX';
          else if (['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext || '')) inferredType = 'Images';
          else if (['mp4', 'mkv', 'avi'].includes(ext || '')) inferredType = 'Video';
          else if (['mp3', 'wav'].includes(ext || '')) inferredType = 'Audio';
          else if (ext === 'zip') inferredType = 'ZIP';

          formData.append('contentType', inferredType);
          formData.append('academicSession', academicSession);
          formData.append('branchId', currentUser.branchId);
          formData.append('file', f);

          await onSubmit(formData);
        }
      } else {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('subjectId', subjectId);
        formData.append('classId', classId);
        formData.append('chapter', chapter);
        formData.append('topic', topic || 'General');
        formData.append('category', category);
        formData.append('contentType', contentType);
        formData.append('academicSession', academicSession);
        formData.append('branchId', currentUser.branchId);
        if (externalLink) formData.append('externalLink', externalLink);

        await onSubmit(formData);
      }

      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to upload educational resources');
    } finally {
      setLoading(false);
    }
  };

  const selectedSub = subjects.find((s) => s.id === subjectId);
  const selectedCls = classes.find((c) => c.id === classId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
              <FilePlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Drag & Drop Batch Upload</h3>
              <p className="text-xs text-slate-400">
                Multi-file batch upload with auto-tagging • DIPS Central
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Auto-Tagging Metadata Preview Banner */}
          <div className="p-3.5 bg-indigo-50/60 rounded-xl border border-indigo-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-indigo-900 block">Auto-Tagging Enabled</span>
                <span className="text-[11px] text-indigo-700">
                  Files dropped will automatically inherit: <strong>{selectedSub?.name || 'Subject'}</strong> ({selectedCls?.name || 'Class'})
                </span>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-white text-indigo-800 rounded-lg font-bold border border-indigo-200 text-[11px]">
              {files.length} Files Selected
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Subject <span className="text-rose-500">*</span>
              </label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                required
              >
                {allowedSubjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name} ({sub.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Target Class <span className="text-rose-500">*</span>
              </label>
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                required
              >
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Chapter / Unit <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
                placeholder="e.g. Chapter 3 - Python Loops"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Topic</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. For & While statement practice"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ContentCategory)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Default Content Type</label>
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value as ContentType)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                {CONTENT_TYPES.map((ct) => (
                  <option key={ct} value={ct}>
                    {ct}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Academic Session</label>
              <input
                type="text"
                value={academicSession}
                onChange={(e) => setAcademicSession(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Resource Title (Custom override if single file)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Auto-generated if left blank for batch uploads..."
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Drag & Drop Zone */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Drag & Drop Multiple Files Here (Batch Upload)
            </label>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                dragOver ? 'border-indigo-600 bg-indigo-50/50 scale-[1.01]' : 'border-slate-300 bg-slate-50/70 hover:border-indigo-400'
              }`}
            >
              <input
                type="file"
                id="batch-file-input"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) handleFilesAdded(e.target.files);
                }}
              />
              <label htmlFor="batch-file-input" className="cursor-pointer flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mb-2 shadow-inner">
                  <Upload className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-indigo-700 hover:underline">
                  Click to select multiple files or drag & drop here
                </span>
                <span className="text-[11px] text-slate-400 mt-1">
                  Supports PDF, Word, PowerPoint, Excel, Images, Video, ZIP (Select as many as you want)
                </span>
              </label>
            </div>
          </div>

          {/* Selected Files List with Auto-Tagging Preview */}
          {files.length > 0 && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">Files Queued for Batch Upload ({files.length})</span>
                <button
                  type="button"
                  onClick={() => setFiles([])}
                  className="text-[11px] font-semibold text-rose-600 hover:underline cursor-pointer"
                >
                  Clear All
                </button>
              </div>
              <div className="max-h-44 overflow-y-auto space-y-1.5 p-2 bg-slate-50 rounded-xl border border-slate-200">
                {files.map((f, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200 shadow-xs">
                    <div className="flex items-center gap-2.5 truncate">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div className="truncate">
                        <span className="font-semibold text-slate-900 block truncate">{f.name}</span>
                        <span className="text-[10px] text-slate-400">
                          Auto-Tagged: [{selectedSub?.name}] • [{selectedCls?.name}] • {(f.size / (1024 * 1024)).toFixed(2)} MB
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFileAtIndex(idx)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                      title="Remove file"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Description / Notes</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional notes or instructions for these batch uploaded materials..."
              rows={2}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <span className="text-slate-400">
              Uploader: <strong>{currentUser.fullName}</strong>
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || files.length === 0}
                className="px-6 py-2.5 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                {loading ? 'Batch Uploading...' : `Upload ${files.length} Files`}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
