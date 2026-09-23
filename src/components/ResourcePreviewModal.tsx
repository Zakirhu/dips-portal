import React from 'react';
import { X, Download, FileText, ExternalLink, History, Calendar, User, Building2, Tag, ShieldAlert } from 'lucide-react';
import type { Resource } from '../types.js';

interface ResourcePreviewModalProps {
  resource: Resource | null;
  onClose: () => void;
  onDownload: (resource: Resource) => void;
  onOpenVersions?: (resource: Resource) => void;
  canCollaborate?: boolean;
  onCollaborate?: (resource: Resource) => void;
}

export const ResourcePreviewModal: React.FC<ResourcePreviewModalProps> = ({
  resource,
  onClose,
  onDownload,
  onOpenVersions,
  canCollaborate,
  onCollaborate,
}) => {
  if (!resource) return null;

  const isExternalLink = resource.contentType.includes('Link') || resource.fileUrl.startsWith('http');
  const isVideo = resource.contentType === 'Video' || resource.fileName.endsWith('.mp4');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-start gap-3.5 pr-6">
            <div className="w-12 h-12 rounded-xl bg-white p-1 flex items-center justify-center shadow-xs border border-slate-200 shrink-0 mt-0.5">
              <img
                src="/dips-logo.png"
                alt="DIPS Institutions Logo"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {resource.subjectName}
                </span>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                {resource.className}
              </span>
              <span className="px-2.5 py-0.5 text-xs font-medium rounded-md bg-slate-100 text-slate-700">
                {resource.category}
              </span>
              <span className="px-2.5 py-0.5 text-xs font-medium rounded-md bg-blue-50 text-blue-700">
                v{resource.currentVersion}
              </span>
              {resource.status === 'pending_approval' && (
                <span className="px-2.5 py-0.5 text-xs font-medium rounded-md bg-yellow-100 text-yellow-800 flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3" /> Pending Review
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-slate-900 leading-snug">{resource.title}</h2>
            <p className="text-sm text-slate-500">
              Chapter: <span className="font-medium text-slate-700">{resource.chapter}</span> • Topic:{' '}
              <span className="font-medium text-slate-700">{resource.topic}</span>
            </p>
          </div>
        </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content / Document Previewer */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-lg bg-slate-50 border border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 block mb-1">Uploaded By</span>
              <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>{resource.uploadedByName}</span>
              </div>
              <span className="text-slate-500 text-[11px]">{resource.uploadedByBranch}</span>
            </div>

            <div>
              <span className="text-slate-400 block mb-1">Last Updated By</span>
              <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>{resource.lastUpdatedByName}</span>
              </div>
              <span className="text-slate-500 text-[11px]">{resource.lastUpdatedByBranch}</span>
            </div>

            <div>
              <span className="text-slate-400 block mb-1">Academic Session</span>
              <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{resource.academicSession}</span>
              </div>
              <span className="text-slate-500 text-[11px]">
                {new Date(resource.updatedAt).toLocaleDateString()}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block mb-1">File Details</span>
              <div className="flex items-center gap-1.5 font-semibold text-slate-800 truncate">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate">{resource.contentType}</span>
              </div>
              <span className="text-slate-500 text-[11px]">
                {resource.fileSize ? `${(resource.fileSize / (1024 * 1024)).toFixed(2)} MB` : 'Online Document'}
              </span>
            </div>
          </div>

          {/* Description */}
          {resource.description && (
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Description & Learning Objectives</h4>
              <p className="text-sm text-slate-700 leading-relaxed bg-white p-4 rounded-lg border border-slate-100">
                {resource.description}
              </p>
            </div>
          )}

          {/* Document Preview Box */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Resource Content Preview</h4>
            <div className="rounded-lg border border-slate-200 bg-slate-900 text-slate-100 p-6 min-h-[220px] flex flex-col items-center justify-center text-center">
              {isVideo ? (
                <div className="w-full max-w-lg aspect-video bg-black rounded-lg flex items-center justify-center">
                  <p className="text-sm text-slate-400">Embedded Video Player Ready</p>
                </div>
              ) : isExternalLink ? (
                <div className="space-y-3">
                  <ExternalLink className="w-12 h-12 mx-auto text-indigo-400" />
                  <p className="text-base font-medium">External Cloud / Web Resource</p>
                  <p className="text-xs text-slate-400 max-w-md break-all">{resource.fileUrl}</p>
                  <a
                    href={resource.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Open Resource In New Tab <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              ) : (
                <div className="space-y-4 max-w-xl text-left w-full bg-slate-800/80 p-5 rounded-lg border border-slate-700">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-700">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-indigo-400" />
                      <span className="font-semibold text-sm text-slate-200">{resource.fileName}</span>
                    </div>
                    <span className="text-xs text-emerald-400 font-mono bg-emerald-950/60 px-2 py-0.5 rounded">
                      Verified DIPS Material
                    </span>
                  </div>
                  <div className="text-xs text-slate-300 font-mono space-y-1.5 leading-relaxed">
                    <p className="text-indigo-300 font-semibold">// DIPS Centralized Curriculum - {resource.subjectName}</p>
                    <p>// Branch: {resource.branchName} | Class: {resource.className}</p>
                    <p>// Chapter: {resource.chapter} | Topic: {resource.topic}</p>
                    <p className="text-slate-400 pt-2">
                      [Document Preview Engine]: This resource includes complete teacher-curated curriculum notes, syllabus coverage,
                      conceptual diagrams, exercise solutions, and CBSE board guidelines.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Latest Version Changelog */}
          {resource.versions && resource.versions.length > 0 && (
            <div className="bg-amber-50/50 border border-amber-200/70 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-semibold text-amber-900">
                    Active Version {resource.currentVersion}: {resource.versions[0]?.versionTitle || 'Latest Release'}
                  </span>
                </div>
                {onOpenVersions && (
                  <button
                    onClick={() => onOpenVersions(resource)}
                    className="text-xs font-semibold text-amber-700 hover:text-amber-900 underline flex items-center gap-1"
                  >
                    View All {resource.versions.length} Versions
                  </button>
                )}
              </div>
              <p className="text-xs text-amber-800 mt-1">
                {resource.versions[0]?.changelog || 'Current approved syllabus material.'}
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-4 border-t border-slate-100 bg-slate-50/70">
          <div className="text-xs text-slate-500">
            <span>{resource.viewsCount || 0} views</span> • <span>{resource.downloadsCount || 0} downloads</span>
          </div>

          <div className="flex items-center gap-2">
            {onOpenVersions && (
              <button
                onClick={() => onOpenVersions(resource)}
                className="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1.5"
              >
                <History className="w-3.5 h-3.5" /> Version History ({resource.versions?.length || 1})
              </button>
            )}

            {canCollaborate && onCollaborate && (
              <button
                onClick={() => onCollaborate(resource)}
                className="px-3.5 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors"
              >
                + Upload Improved Version
              </button>
            )}

            <button
              onClick={() => onDownload(resource)}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> Download File
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
