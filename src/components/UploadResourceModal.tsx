import React, { useState } from 'react';
import { X, Upload, AlertCircle, FilePlus, Link2, BookOpen } from 'lucide-react';
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
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subjectId || !classId || !chapter.trim()) {
      setError('Please fill in all required fields (Title, Subject, Class, and Chapter).');
      return;
    }

    try {
      setLoading(true);
      setError('');
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

      if (file) {
        formData.append('file', file);
      }
      if (externalLink) {
        formData.append('externalLink', externalLink);
      }

      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to upload educational resource');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700">
              <FilePlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Upload Educational Resource</h3>
              <p className="text-xs text-slate-500">
                Centralized Curriculum Repository • DIPS Chain of Schools
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Resource Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Class VII – Looping Statements in Python Notes & Practice"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Subject <span className="text-rose-500">*</span>
              </label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Class <span className="text-rose-500">*</span>
              </label>
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Chapter / Unit <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
                placeholder="e.g. Looping Statements"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Topic</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. FOR Loop & Range Function"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ContentCategory)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Content Type</label>
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value as ContentType)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                {CONTENT_TYPES.map((ct) => (
                  <option key={ct} value={ct}>
                    {ct}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Academic Session</label>
              <input
                type="text"
                value={academicSession}
                onChange={(e) => setAcademicSession(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description / Syllabus Notes</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline the learning objectives, key formulas, or specific CBSE exercises covered in this resource..."
              rows={2}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">File Attachment (PDF, DOC, PPT, ZIP, Video)</label>
            <div className="border-2 border-dashed border-slate-200 rounded-lg p-5 text-center hover:border-indigo-400 transition-colors bg-slate-50/50">
              <input
                type="file"
                id="file-input-upload"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <label htmlFor="file-input-upload" className="cursor-pointer flex flex-col items-center">
                <Upload className="w-7 h-7 text-indigo-500 mb-1.5" />
                <span className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
                  {file ? file.name : 'Choose file or drag & drop here'}
                </span>
                <span className="text-[11px] text-slate-400 mt-1">
                  {file
                    ? `${(file.size / (1024 * 1024)).toFixed(2)} MB • ${file.type || 'file'}`
                    : 'PDF, DOCX, PPTX, XLSX, MP4, MP3, Images up to 50MB'}
                </span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Or External Link (Optional)</label>
            <div className="relative">
              <Link2 className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="url"
                value={externalLink}
                onChange={(e) => setExternalLink(e.target.value)}
                placeholder="https://drive.google.com/... or https://youtube.com/..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <span className="text-xs text-slate-400">
              Author: {currentUser.fullName} ({currentUser.branchName || 'DIPS'})
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                <Upload className="w-4 h-4" />
                {loading ? 'Uploading...' : 'Publish to DIPS Central'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
