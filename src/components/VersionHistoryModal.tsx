import React from 'react';
import { X, History, CheckCircle, RotateCcw, Download, User, Building2, Calendar, FileText } from 'lucide-react';
import type { Resource, ResourceVersion } from '../types.js';

interface VersionHistoryModalProps {
  resource: Resource | null;
  onClose: () => void;
  onRestoreVersion?: (resource: Resource, versionNumber: number) => void;
  canRestore?: boolean;
}

export const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({
  resource,
  onClose,
  onRestoreVersion,
  canRestore,
}) => {
  if (!resource) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="relative w-full max-w-3xl max-h-[85vh] flex flex-col bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Version History & Collaboration Log</h3>
              <p className="text-xs text-slate-500 truncate max-w-md">{resource.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of Versions */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="p-3 bg-blue-50/60 border border-blue-200/60 rounded-lg text-xs text-blue-900 flex items-center justify-between">
            <span>
              Subject: <strong>{resource.subjectName}</strong> ({resource.className}) • {resource.versions?.length || 1} Total Revisions
            </span>
            <span className="font-mono text-blue-700 font-semibold">Active: Version {resource.currentVersion}</span>
          </div>

          <div className="relative pl-6 border-l-2 border-indigo-200 space-y-6 my-4 ml-3">
            {resource.versions?.map((version, index) => {
              const isActive = version.versionNumber === resource.currentVersion;
              return (
                <div key={version.versionNumber} className="relative group">
                  {/* Timeline bullet */}
                  <div
                    className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center ${
                      isActive ? 'border-indigo-600 ring-4 ring-indigo-100' : 'border-slate-300'
                    }`}
                  >
                    {isActive && <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full" />}
                  </div>

                  <div
                    className={`p-4 rounded-xl border transition-all ${
                      isActive
                        ? 'bg-indigo-50/40 border-indigo-200 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 text-xs font-bold rounded-md ${
                              isActive ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            Version {version.versionNumber}
                          </span>
                          {isActive && (
                            <span className="flex items-center gap-1 text-[11px] font-semibold text-indigo-700">
                              <CheckCircle className="w-3 h-3 text-indigo-600" /> Currently Active
                            </span>
                          )}
                          <span className="text-sm font-semibold text-slate-800">
                            {version.versionTitle || `Revision ${version.versionNumber}`}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2.5 rounded-md border border-slate-100 font-sans">
                          {version.changelog || 'No detailed changelog recorded.'}
                        </p>
                      </div>

                      {/* Version Action Buttons */}
                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={version.fileUrl}
                          download={version.fileName}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1"
                        >
                          <Download className="w-3.5 h-3.5" /> File
                        </a>

                        {canRestore && !isActive && onRestoreVersion && (
                          <button
                            onClick={() => onRestoreVersion(resource, version.versionNumber)}
                            className="px-2.5 py-1.5 text-xs font-medium text-amber-800 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors flex items-center gap-1"
                            title="Restore this version as active"
                          >
                            <RotateCcw className="w-3.5 h-3.5 text-amber-600" /> Restore
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Contributor and timestamp details */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1 text-slate-700 font-medium">
                        <User className="w-3 h-3 text-slate-400" />
                        {version.uploadedByUserName}
                      </span>
                      <span className="flex items-center gap-1 text-slate-600">
                        <Building2 className="w-3 h-3 text-slate-400" />
                        {version.uploadedByUserBranch}
                      </span>
                      <span className="flex items-center gap-1 text-slate-500">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {new Date(version.uploadedAt).toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1 text-slate-500 font-mono">
                        <FileText className="w-3 h-3 text-slate-400" />
                        {version.fileName} ({(version.fileSize / (1024 * 1024)).toFixed(2)} MB)
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/70 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Close History
          </button>
        </div>
      </div>
    </div>
  );
};
