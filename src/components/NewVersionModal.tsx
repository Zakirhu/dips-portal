import React, { useState } from 'react';
import { X, Upload, FileText, AlertCircle } from 'lucide-react';
import type { Resource } from '../types.js';

interface NewVersionModalProps {
  resource: Resource | null;
  onClose: () => void;
  onSubmit: (resourceId: string, formData: FormData) => Promise<void>;
}

export const NewVersionModal: React.FC<NewVersionModalProps> = ({ resource, onClose, onSubmit }) => {
  const [versionTitle, setVersionTitle] = useState('');
  const [changelog, setChangelog] = useState('');
  const [externalLink, setExternalLink] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!resource) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!versionTitle.trim()) {
      setError('Please provide a title for this version update.');
      return;
    }
    if (!changelog.trim()) {
      setError('Please provide a brief changelog describing the improvements made.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const formData = new FormData();
      formData.append('versionTitle', versionTitle);
      formData.append('changelog', changelog);
      if (file) {
        formData.append('file', file);
      }
      if (externalLink) {
        formData.append('externalLink', externalLink);
      }

      await onSubmit(resource.id, formData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit updated version');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="relative w-full max-w-xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/70">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-xs font-bold rounded-md bg-indigo-100 text-indigo-800">
                Version {resource.currentVersion + 1}
              </span>
              <span className="text-xs text-slate-500 font-medium">Cross-Branch Faculty Collaboration</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-1">Upload Improved Version</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-lg text-xs text-indigo-900">
            <strong>Target Resource:</strong> {resource.title} ({resource.subjectName} • {resource.className})
            <p className="text-indigo-700 text-[11px] mt-1">
              Your updates will create Version {resource.currentVersion + 1} while safely preserving all previous revisions for audit and restoration.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Version Title / Focus <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={versionTitle}
              onChange={(e) => setVersionTitle(e.target.value)}
              placeholder="e.g. Added CBSE Question Bank & Flowchart Diagrams"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Changelog / Notes on Changes <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={changelog}
              onChange={(e) => setChangelog(e.target.value)}
              placeholder="Describe what you improved, corrected, or added to assist other DIPS teachers and students..."
              rows={3}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Upload Updated File</label>
            <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center hover:border-indigo-400 transition-colors bg-slate-50/50">
              <input
                type="file"
                id="file-input-version"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <label htmlFor="file-input-version" className="cursor-pointer flex flex-col items-center">
                <Upload className="w-6 h-6 text-slate-400 mb-1" />
                <span className="text-xs font-medium text-indigo-600 hover:text-indigo-700">
                  {file ? file.name : 'Click or drag updated PDF / DOCX / PPT / File'}
                </span>
                <span className="text-[11px] text-slate-400 mt-0.5">
                  {file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : 'Leaves current file if unchanged'}
                </span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Or External Cloud Link (Optional)</label>
            <input
              type="url"
              value={externalLink}
              onChange={(e) => setExternalLink(e.target.value)}
              placeholder="https://drive.google.com/... or https://youtube.com/..."
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
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
              <FileText className="w-4 h-4" />
              {loading ? 'Publishing Version...' : `Publish Version ${resource.currentVersion + 1}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
