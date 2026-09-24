import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  FileText,
  ExternalLink,
  History,
  Calendar,
  User,
  Building2,
  Tag,
  ShieldAlert,
  Star,
  MessageSquare,
  Bookmark,
} from 'lucide-react';
import type { Resource, User as UserType } from '../types.js';
import { StarRatingDisplay, StarRatingBadge, RateResourceModal } from './StarRating.js';
import { BookmarkButton } from './BookmarkButton.js';
import { getBookmarkedResourceIds, toggleResourceBookmark } from '../lib/bookmarks.js';
import { api } from '../lib/api.js';

interface ResourcePreviewModalProps {
  resource: Resource | null;
  currentUser?: UserType | null;
  onClose: () => void;
  onDownload: (resource: Resource) => void;
  onOpenVersions?: (resource: Resource) => void;
  canCollaborate?: boolean;
  onCollaborate?: (resource: Resource) => void;
  onResourceUpdated?: (resource: Resource) => void;
}

export const ResourcePreviewModal: React.FC<ResourcePreviewModalProps> = ({
  resource,
  currentUser,
  onClose,
  onDownload,
  onOpenVersions,
  canCollaborate,
  onCollaborate,
  onResourceUpdated,
}) => {
  const [showRateModal, setShowRateModal] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);

  useEffect(() => {
    if (currentUser && resource) {
      const ids = getBookmarkedResourceIds(currentUser.id);
      setIsBookmarked(ids.includes(resource.id));
    }
  }, [currentUser?.id, resource?.id]);

  if (!resource) return null;

  const handleToggleBookmark = () => {
    if (!currentUser) return;
    const { isBookmarked: newStatus } = toggleResourceBookmark(currentUser.id, resource.id);
    setIsBookmarked(newStatus);
  };

  const [commentInput, setCommentInput] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || !currentUser || isSubmittingComment) return;
    setIsSubmittingComment(true);
    try {
      const res = await api.addComment(resource.id, commentInput.trim());
      setCommentInput('');
      if (onResourceUpdated) {
        onResourceUpdated(res.resource);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to post comment');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const isExternalLink = resource.contentType.includes('Link') || resource.fileUrl.startsWith('http');
  const isVideo = resource.contentType === 'Video' || resource.fileName.endsWith('.mp4');
  const isImage =
    resource.contentType === 'Images' ||
    /\.(png|jpe?g|gif|webp|svg|bmp)(\?.*)?$/i.test(resource.fileUrl) ||
    /\.(png|jpe?g|gif|webp|svg|bmp)$/i.test(resource.fileName);

  const isPdf =
    resource.contentType === 'PDF' ||
    resource.contentType === 'Notes' ||
    resource.contentType === 'Worksheet' ||
    resource.contentType === 'Assignment' ||
    resource.contentType === 'Question Paper' ||
    resource.contentType === 'Sample Paper' ||
    resource.contentType === 'Lesson Plan' ||
    /\.pdf(\?.*)?$/i.test(resource.fileUrl) ||
    /\.pdf$/i.test(resource.fileName);

  const isOfficeDoc =
    resource.contentType === 'DOCX' ||
    resource.contentType === 'PPTX' ||
    resource.contentType === 'XLSX' ||
    resource.contentType === 'Presentation' ||
    (resource.contentType as string) === 'Document' ||
    (resource.contentType as string) === 'Spreadsheet' ||
    /\.(doc|docx|ppt|pptx|xls|xlsx)(\?.*)?$/i.test(resource.fileUrl) ||
    /\.(doc|docx|ppt|pptx|xls|xlsx)$/i.test(resource.fileName);

  const userRating = currentUser && resource.ratings?.find((r) => r.userId === currentUser.id);

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
              <StarRatingBadge
                rating={resource.averageRating}
                count={resource.ratingsCount}
                showZero={true}
              />
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

          <div className="flex items-center gap-1.5">
            {currentUser && (
              <BookmarkButton
                isBookmarked={isBookmarked}
                onToggle={handleToggleBookmark}
                size="md"
                showLabel={true}
                activeColor="amber"
              />
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
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
              ) : isImage ? (
                <div className="w-full max-w-2xl space-y-3">
                  <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 flex items-center justify-center overflow-hidden max-h-[380px]">
                    <img
                      src={resource.fileUrl}
                      alt={resource.title}
                      className="max-h-[360px] w-auto max-w-full object-contain rounded-lg shadow-lg"
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span>{resource.fileName}</span>
                    <a
                      href={resource.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-400 hover:text-indigo-300 font-semibold inline-flex items-center gap-1 hover:underline"
                    >
                      Open Full Size <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ) : isPdf ? (
                <div className="w-full space-y-3">
                  <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-lg">
                    <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
                      <span className="font-semibold flex items-center gap-2 truncate text-white">
                        <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                        {resource.fileName} — PDF First Page & Document Preview
                      </span>
                      <a
                        href={resource.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-400 hover:text-indigo-300 font-semibold inline-flex items-center gap-1 shrink-0 hover:underline"
                      >
                        Open Fullscreen <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                    <iframe
                      src={`${resource.fileUrl}#view=FitH`}
                      title={resource.title}
                      className="w-full h-[450px] bg-white border-0"
                    />
                  </div>
                </div>
              ) : isOfficeDoc ? (
                <div className="w-full space-y-3">
                  <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-lg">
                    <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
                      <span className="font-semibold flex items-center gap-2 truncate text-white">
                        <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                        {resource.fileName} — Word / PPT / Slide Preview
                      </span>
                      <a
                        href={resource.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-400 hover:text-indigo-300 font-semibold inline-flex items-center gap-1 shrink-0 hover:underline"
                      >
                        Open Fullscreen <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                    <iframe
                      src={`https://docs.google.com/gview?url=${encodeURIComponent(resource.fileUrl)}&embedded=true`}
                      title={resource.title}
                      className="w-full h-[450px] bg-white border-0"
                    />
                  </div>
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

          {/* Ratings & Feedback Section */}
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden space-y-3">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Community Quality Ratings & Feedback
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Evaluated by students and faculty across DIPS campuses
                  </p>
                </div>
              </div>

              {currentUser && (
                <button
                  onClick={() => setShowRateModal(true)}
                  className="px-3 py-1.5 text-xs font-bold rounded-lg bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100 flex items-center gap-1.5 transition-colors"
                >
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-600" />
                  <span>{userRating ? `Your Rating: ${userRating.rating}★ (Edit)` : 'Rate this Resource'}</span>
                </button>
              )}
            </div>

            <div className="p-4 space-y-4">
              {/* Summary Scorecard */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 rounded-lg bg-amber-50/40 border border-amber-100">
                <div className="flex items-center gap-3">
                  <div className="text-3xl font-extrabold text-slate-900">
                    {resource.averageRating ? resource.averageRating.toFixed(1) : '0.0'}
                  </div>
                  <div>
                    <StarRatingDisplay
                      rating={resource.averageRating || 0}
                      size="sm"
                    />
                    <span className="text-[11px] text-slate-500 font-medium">
                      Based on {resource.ratingsCount || resource.ratings?.length || 0} verified rating(s)
                    </span>
                  </div>
                </div>

                {userRating && (
                  <div className="text-xs bg-white px-3 py-2 rounded-lg border border-amber-200 text-amber-900 flex items-center gap-2">
                    <span className="font-semibold">Your Review:</span>
                    <StarRatingDisplay rating={userRating.rating} size="xs" />
                    {userRating.feedback && (
                      <span className="text-slate-600 italic truncate max-w-xs">
                        "{userRating.feedback}"
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Individual Reviews List */}
              {resource.ratings && resource.ratings.length > 0 ? (
                <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Student & Teacher Feedback ({resource.ratings.length})
                  </span>
                  {resource.ratings.map((r) => (
                    <div
                      key={r.id}
                      className="p-3 rounded-lg bg-slate-50/70 border border-slate-100 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800">{r.userName}</span>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                              r.userRole === 'student'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            }`}
                          >
                            {r.userRole === 'student' ? 'Student' : 'Faculty'}
                          </span>
                          {r.userBranch && (
                            <span className="text-[10px] text-slate-400">• {r.userBranch}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <StarRatingDisplay rating={r.rating} size="xs" />
                          <span className="text-[10px] text-slate-400">
                            {new Date(r.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      {r.feedback && (
                        <p className="text-slate-700 leading-relaxed pl-1 pt-0.5">
                          "{r.feedback}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-slate-400 text-xs">
                  <p>No written feedback yet. Be the first to rate this educational material!</p>
                </div>
              )}
            </div>
          </div>

          {/* Real-Time Discussion & Comments Section */}
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden space-y-3">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4 text-indigo-600" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Real-Time Discussion & Q&A ({resource.comments?.length || 0})
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Ask questions or discuss this learning material with teachers and classmates
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 space-y-4">
              {/* Comment Input Box */}
              {currentUser ? (
                <form onSubmit={handlePostComment} className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      placeholder="Ask a question or share your thoughts with the class..."
                      className="flex-1 px-3.5 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
                    />
                    <button
                      type="submit"
                      disabled={!commentInput.trim() || isSubmittingComment}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors shrink-0 flex items-center gap-1.5"
                    >
                      {isSubmittingComment ? 'Posting...' : 'Post Comment'}
                    </button>
                  </div>
                </form>
              ) : (
                <p className="text-xs text-slate-400 italic">Please log in to participate in the discussion.</p>
              )}

              {/* Comments List */}
              {resource.comments && resource.comments.length > 0 ? (
                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  {resource.comments.map((c) => (
                    <div
                      key={c.id}
                      className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800">{c.userName}</span>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                              c.userRole === 'student'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            }`}
                          >
                            {c.userRole === 'student' ? 'Student' : 'Faculty'}
                          </span>
                          {c.userBranch && (
                            <span className="text-[10px] text-slate-400">• {c.userBranch}</span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {new Date(c.createdAt).toLocaleDateString()} {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-slate-700 leading-relaxed pl-1">
                        {c.content}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-slate-400 text-xs bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
                  <MessageSquare className="w-8 h-8 mx-auto text-slate-300 mb-1" />
                  <p className="font-medium text-slate-600">No discussion comments yet</p>
                  <p className="text-[11px] text-slate-400">Be the first student or teacher to start the conversation!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-4 border-t border-slate-100 bg-slate-50/70">
          <div className="text-xs text-slate-500">
            <span>{resource.viewsCount || 0} views</span> • <span>{resource.downloadsCount || 0} downloads</span>
          </div>

          <div className="flex items-center gap-2">
            {currentUser && (
              <button
                onClick={() => setShowRateModal(true)}
                className="px-3 py-2 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors flex items-center gap-1.5"
              >
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-600" />
                <span>Rate & Review</span>
              </button>
            )}

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

        {/* Rating Submission Modal */}
        {currentUser && (
          <RateResourceModal
            resource={resource}
            currentUser={currentUser}
            isOpen={showRateModal}
            onClose={() => setShowRateModal(false)}
            onRatingSubmitted={(updated) => {
              if (onResourceUpdated) {
                onResourceUpdated(updated);
              }
            }}
          />
        )}
      </div>
    </div>
  );
};
