import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  Upload,
  Layers,
  FolderGit2,
  FileText,
  Search,
  Filter,
  Eye,
  Download,
  History,
  Building2,
  Calendar,
  Sparkles,
  Users,
  Plus,
  RefreshCw,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  X,
  RotateCcw,
  SlidersHorizontal,
  GraduationCap,
  Star,
  Bookmark,
  BookmarkCheck,
  Trash2,
} from 'lucide-react';
import type {
  User,
  Subject,
  AcademicClass,
  Resource,
  Announcement,
} from '../types.js';
import { api } from '../lib/api.js';
import { StarRatingBadge, RateResourceModal } from './StarRating.js';
import { BookmarkButton } from './BookmarkButton.js';
import {
  getBookmarkedResourceIds,
  toggleResourceBookmark,
  clearAllUserBookmarks,
} from '../lib/bookmarks.js';

interface TeacherPortalProps {
  currentUser: User;
  onOpenUpload: (initialSubjectId?: string, initialClassId?: string) => void;
  onPreviewResource: (resource: Resource) => void;
  onOpenVersions: (resource: Resource) => void;
  onOpenCollaborate: (resource: Resource) => void;
  onDownload: (resource: Resource) => void;
}

export const TeacherPortal: React.FC<TeacherPortalProps> = ({
  currentUser,
  onOpenUpload,
  onPreviewResource,
  onOpenVersions,
  onOpenCollaborate,
  onDownload,
}) => {
  const [activeTab, setActiveTab] = useState<
    'navigator' | 'library' | 'favorites' | 'my_uploads' | 'announcements' | 'profile'
  >('navigator');

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<AcademicClass[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [teacherStats, setTeacherStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Bookmarks state
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() =>
    getBookmarkedResourceIds(currentUser.id)
  );
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Subject Navigator Hierarchical drilldown state: Subject -> Class -> Chapter
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>('all');
  const [ratingResource, setRatingResource] = useState<Resource | null>(null);

  // Favorites-specific filters
  const [favSearchQuery, setFavSearchQuery] = useState('');
  const [favSubjectId, setFavSubjectId] = useState<string>('all');
  const [favClassId, setFavClassId] = useState<string>('all');

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((cur) => (cur === msg ? null : cur));
    }, 2500);
  };

  const handleToggleBookmark = (res: Resource) => {
    const { isBookmarked } = toggleResourceBookmark(currentUser.id, res.id);
    setBookmarkedIds(getBookmarkedResourceIds(currentUser.id));
    if (isBookmarked) {
      showToast(`Added "${res.title}" to My Favorites`);
    } else {
      showToast(`Removed from My Favorites`);
    }
  };

  const handleClearAllFavorites = () => {
    if (window.confirm('Are you sure you want to clear all your saved favorite materials?')) {
      clearAllUserBookmarks(currentUser.id);
      setBookmarkedIds([]);
      showToast('All favorites cleared');
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [subsRes, clsRes, resRes, ancRes, statsRes] = await Promise.all([
        api.getSubjects(),
        api.getClasses(),
        api.getResources(),
        api.getAnnouncements(),
        api.getTeacherStats(),
      ]);

      setSubjects(subsRes.subjects);
      setClasses(clsRes.classes);
      setResources(resRes.resources);
      setAnnouncements(ancRes.announcements);
      setTeacherStats(statsRes);

      // Default select first assigned subject
      const assigned = subsRes.subjects.filter((s) =>
        currentUser.assignedSubjectIds?.includes(s.id)
      );
      if (assigned.length > 0 && !selectedSubjectId) {
        setSelectedSubjectId(assigned[0].id);
      }
      if (clsRes.classes.length > 0 && !selectedClassId) {
        setSelectedClassId(clsRes.classes[0].id);
      }
    } catch (err) {
      console.error('Failed to load teacher data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    setBookmarkedIds(getBookmarkedResourceIds(currentUser.id));

    const handleBookmarksUpdated = (e: any) => {
      if (!e.detail || e.detail.userId === currentUser.id) {
        setBookmarkedIds(getBookmarkedResourceIds(currentUser.id));
      }
    };

    const handleNavigateTab = (e: any) => {
      if (e.detail?.tab) {
        setActiveTab(e.detail.tab);
      }
    };

    window.addEventListener('dips_bookmarks_updated', handleBookmarksUpdated);
    window.addEventListener('dips_navigate_tab', handleNavigateTab);
    return () => {
      window.removeEventListener('dips_bookmarks_updated', handleBookmarksUpdated);
      window.removeEventListener('dips_navigate_tab', handleNavigateTab);
    };
  }, [currentUser.id]);

  const assignedSubjects = subjects.filter((s) =>
    currentUser.assignedSubjectIds?.includes(s.id)
  );

  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);
  const selectedClass = classes.find((c) => c.id === selectedClassId);

  // Filter resources for current teacher's subjects across all branches
  const accessibleResources = resources.filter((r) =>
    currentUser.assignedSubjectIds?.includes(r.subjectId)
  );

  // Drilldown filtered resources
  const drilldownResources = accessibleResources.filter((r) => {
    if (selectedSubjectId && r.subjectId !== selectedSubjectId) return false;
    if (selectedClassId && r.classId !== selectedClassId) return false;
    if (selectedCategory !== 'all' && r.category !== selectedCategory) return false;
    if (selectedBranchFilter !== 'all' && r.branchId !== selectedBranchFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        r.title.toLowerCase().includes(q) ||
        r.chapter.toLowerCase().includes(q) ||
        r.topic.toLowerCase().includes(q) ||
        r.uploadedByName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const myUploads = resources.filter(
    (r) => r.uploadedByUserId === currentUser.id || r.lastUpdatedByUserId === currentUser.id
  );

  // Teacher Favorite / Bookmarked resources (from all resources or accessible)
  const favoriteResources = resources.filter((r) => bookmarkedIds.includes(r.id));
  const filteredFavorites = favoriteResources.filter((r) => {
    if (favSubjectId !== 'all' && r.subjectId !== favSubjectId) return false;
    if (favClassId !== 'all' && r.classId !== favClassId) return false;
    if (favSearchQuery) {
      const q = favSearchQuery.toLowerCase();
      return (
        r.title.toLowerCase().includes(q) ||
        r.chapter.toLowerCase().includes(q) ||
        r.topic.toLowerCase().includes(q) ||
        r.uploadedByName.toLowerCase().includes(q) ||
        r.subjectName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setPasswordError('');
      setPasswordMsg('');
      const res = await api.changePassword({ currentPassword, newPassword });
      setPasswordMsg(res.message);
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to change password');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-700 text-xs flex items-center gap-2 animate-fade-in">
          <BookmarkCheck className="w-4 h-4 text-amber-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Teacher Welcome & Cross-Branch Collaboration Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl shadow-lg border border-indigo-950/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white p-1 flex items-center justify-center shadow-md border border-indigo-400/30 shrink-0">
              <img
                src="/dips-logo.png"
                alt="DIPS Institutions Logo"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 text-xs font-bold rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Faculty Workspace
                </span>
                <span className="text-xs text-slate-300">
                  {currentUser.branchName} • {currentUser.designation || 'Faculty Member'}
                </span>
              </div>
              <h2 className="text-2xl font-black tracking-tight text-white mt-1">
                Welcome, {currentUser.fullName}
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                Assigned Subjects:{' '}
                <strong className="text-amber-300">
                  {assignedSubjects.map((s) => s.name).join(', ') || 'General Faculty'}
                </strong>
                . You have full access to view, download, and collaboratively update curriculum resources across all
                connected DIPS branches.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onOpenUpload(selectedSubjectId, selectedClassId)}
              className="px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Upload New Resource</span>
            </button>
          </div>
        </div>

        {/* Quick Collaboration Highlights Banner */}
        <div className="mt-4 pt-4 border-t border-indigo-900/60 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Cross-Branch Network:</strong> Resources in your subject are shared seamlessly across all DIPS institutions, colleges, and schools.
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>{accessibleResources.length} Total Subject Resources</span>
            <span>•</span>
            <span className="text-amber-300 font-semibold">{favoriteResources.length} Bookmarked</span>
            <span>•</span>
            <span>{myUploads.length} Contributed by You</span>
          </div>
        </div>
      </div>

      {/* Teacher Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold border-b border-slate-200">
        {[
          { id: 'navigator', label: 'Subject Curriculum Explorer', icon: BookOpen },
          {
            id: 'library',
            label: `All Shared Subject Content (${accessibleResources.length})`,
            icon: FolderGit2,
          },
          {
            id: 'favorites',
            label: `My Favorites (${favoriteResources.length})`,
            icon: Bookmark,
            badgeColor: 'text-amber-500',
          },
          { id: 'my_uploads', label: `My Contributions (${myUploads.length})`, icon: FileText },
          { id: 'announcements', label: 'School Announcements', icon: Users },
          { id: 'profile', label: 'Profile & Security', icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                isActive
                  ? tab.id === 'favorites'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon
                className={`w-4 h-4 ${
                  isActive
                    ? 'text-white'
                    : tab.id === 'favorites'
                    ? 'text-amber-500'
                    : ''
                }`}
              />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. SUBJECT CURRICULUM EXPLORER */}
      {activeTab === 'navigator' && (
        <div className="space-y-6">
          {/* Step 1: Select Subject */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Step 1: Select Assigned Subject
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {assignedSubjects.map((sub) => {
                const isSelected = selectedSubjectId === sub.id;
                const count = resources.filter((r) => r.subjectId === sub.id).length;
                return (
                  <button
                    key={sub.id}
                    onClick={() => setSelectedSubjectId(sub.id)}
                    className={`p-4 rounded-xl text-left border transition-all flex items-start justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50 border-indigo-400 ring-2 ring-indigo-200 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-mono text-indigo-600 font-bold">{sub.code}</span>
                      <h4 className="text-sm font-bold text-slate-900 mt-0.5">{sub.name}</h4>
                      <p className="text-[11px] text-slate-500 mt-1">{count} Shared Resources across DIPS</p>
                    </div>
                    <BookOpen
                      className={`w-5 h-5 shrink-0 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Select Class */}
          {selectedSubject && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Step 2: Select Class for {selectedSubject.name}
              </h3>
              <div className="flex flex-wrap gap-2">
                {classes.map((cls) => {
                  const isSelected = selectedClassId === cls.id;
                  const count = resources.filter(
                    (r) => r.subjectId === selectedSubjectId && r.classId === cls.id
                  ).length;
                  return (
                    <button
                      key={cls.id}
                      onClick={() => setSelectedClassId(cls.id)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500 text-white border-amber-600 shadow-xs ring-2 ring-amber-200'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>{cls.name}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                          isSelected ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Chapter / Topic Resources */}
          {selectedSubject && selectedClass && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Curriculum Content: {selectedSubject.name} • {selectedClass.name}
                  </h4>
                  <p className="text-xs text-slate-500">
                    Showing {drilldownResources.length} verified chapters, worksheets, and study notes
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search chapter or topic..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 w-48"
                    />
                  </div>

                  <button
                    onClick={() => onOpenUpload(selectedSubjectId, selectedClassId)}
                    className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Upload to {selectedClass.code}
                  </button>
                </div>
              </div>

              {/* Resource Cards Grid */}
              {drilldownResources.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-500 space-y-2">
                  <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-sm font-semibold text-slate-700">No resources found for this combination.</p>
                  <p className="text-xs text-slate-400">
                    Be the first faculty member to upload syllabus notes for {selectedSubject.name} ({selectedClass.name}).
                  </p>
                  <button
                    onClick={() => onOpenUpload(selectedSubjectId, selectedClassId)}
                    className="mt-2 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg cursor-pointer"
                  >
                    Upload Now
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {drilldownResources.map((res) => {
                    const isMyUpload = res.uploadedByUserId === currentUser.id;
                    const isDifferentBranch = res.branchName !== currentUser.branchName;
                    const isFav = bookmarkedIds.includes(res.id);
                    return (
                      <div
                        key={res.id}
                        className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between group"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-100 text-slate-700">
                              {res.contentType}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-blue-50 text-blue-700 border border-blue-200">
                                v{res.currentVersion}
                              </span>
                              {isDifferentBranch && (
                                <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-amber-50 text-amber-800 border border-amber-200">
                                  {res.branchName}
                                </span>
                              )}
                              <BookmarkButton
                                isBookmarked={isFav}
                                onToggle={() => handleToggleBookmark(res)}
                                size="sm"
                                activeColor="amber"
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-1">
                            <h5 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">{res.title}</h5>
                          </div>

                          {/* Star Rating Badge */}
                          <div className="flex items-center justify-between">
                            <StarRatingBadge
                              rating={res.averageRating}
                              count={res.ratingsCount}
                              showZero={false}
                            />
                            <button
                              type="button"
                              onClick={() => setRatingResource(res)}
                              className="text-[11px] font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1 hover:underline cursor-pointer"
                            >
                              <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                              <span>Rate</span>
                            </button>
                          </div>

                          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs space-y-1">
                            <div className="text-slate-600">
                              Chapter: <span className="font-semibold text-slate-900">{res.chapter}</span>
                            </div>
                            <div className="text-slate-600 truncate">
                              Topic: <span className="font-semibold text-slate-900">{res.topic}</span>
                            </div>
                          </div>

                          <div className="text-[11px] text-slate-500 pt-1 flex items-center justify-between">
                            <span className="truncate">By: {res.uploadedByName}</span>
                            <span className="shrink-0">{new Date(res.updatedAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {/* Card Actions */}
                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-1">
                          <button
                            onClick={() => onPreviewResource(res)}
                            className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" /> Preview
                          </button>

                          <button
                            onClick={() => onOpenVersions(res)}
                            className="px-2 py-1.5 text-xs font-medium text-amber-700 hover:text-amber-900 rounded-lg hover:bg-amber-50 transition-colors flex items-center gap-1 cursor-pointer"
                            title="View revisions & changelog"
                          >
                            <History className="w-3.5 h-3.5" /> Revisions ({res.versions?.length || 1})
                          </button>

                          <button
                            onClick={() => onOpenCollaborate(res)}
                            className="px-2.5 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
                            title="Collaborate and upload Version N+1"
                          >
                            + Update
                          </button>

                          <button
                            onClick={() => onDownload(res)}
                            className="p-1.5 text-slate-600 hover:text-indigo-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                            title="Download file"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 2. ALL SHARED SUBJECT CONTENT */}
      {activeTab === 'library' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Cross-Branch Shared Library ({assignedSubjects.map((s) => s.name).join(', ')})
              </h3>
              <p className="text-xs text-slate-500">
                Full repository of teaching materials uploaded by subject colleagues across all DIPS schools
              </p>
            </div>
            <button
              onClick={() => onOpenUpload()}
              className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Upload Resource
            </button>
          </div>

          {/* Filters Bar */}
          <div className="p-3.5 bg-white rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Search Term</label>
              <input
                type="text"
                placeholder="Topic, chapter, title, teacher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Subject</label>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white cursor-pointer"
              >
                {assignedSubjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Class</label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white cursor-pointer"
              >
                <option value="">All Classes</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white cursor-pointer"
              >
                <option value="all">All Categories</option>
                <option value="Study Material">Study Material</option>
                <option value="Assessment">Assessment</option>
                <option value="Practical">Practical</option>
                <option value="Teaching Resources">Teaching Resources</option>
              </select>
            </div>
          </div>

          {/* List Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5 w-10"></th>
                    <th className="p-3.5">Resource Details</th>
                    <th className="p-3.5">Class & Subject</th>
                    <th className="p-3.5">Author Branch</th>
                    <th className="p-3.5">Rating</th>
                    <th className="p-3.5">Version</th>
                    <th className="p-3.5">Last Contributor</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {drilldownResources.map((res) => {
                    const isFav = bookmarkedIds.includes(res.id);
                    return (
                      <tr key={res.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-3.5 text-center">
                          <BookmarkButton
                            isBookmarked={isFav}
                            onToggle={() => handleToggleBookmark(res)}
                            size="xs"
                            activeColor="amber"
                          />
                        </td>
                        <td className="p-3.5 max-w-sm">
                          <div className="font-bold text-slate-900 leading-snug">{res.title}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Chapter: {res.chapter} • Topic: {res.topic}
                          </div>
                        </td>
                        <td className="p-3.5">
                          <span className="font-semibold text-slate-800 block">{res.className}</span>
                          <span className="text-[11px] text-indigo-600">{res.subjectName}</span>
                        </td>
                        <td className="p-3.5">
                          <span className="font-medium text-slate-800 block">{res.branchName}</span>
                          <span className="text-[10px] text-slate-400">By {res.uploadedByName}</span>
                        </td>
                        <td className="p-3.5">
                          <div className="flex items-center gap-1.5">
                            <StarRatingBadge
                              rating={res.averageRating}
                              count={res.ratingsCount}
                              showZero={false}
                            />
                            <button
                              type="button"
                              onClick={() => setRatingResource(res)}
                              className="text-[10px] text-amber-700 hover:text-amber-800 font-semibold hover:underline cursor-pointer"
                            >
                              Rate
                            </button>
                          </div>
                        </td>
                        <td className="p-3.5">
                          <button
                            onClick={() => onOpenVersions(res)}
                            className="px-2 py-0.5 text-[10px] font-bold rounded bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 cursor-pointer"
                          >
                            v{res.currentVersion} ({res.versions?.length || 1})
                          </button>
                        </td>
                        <td className="p-3.5">
                          <span className="text-slate-800 font-medium block">{res.lastUpdatedByName}</span>
                          <span className="text-[11px] text-slate-400">{res.lastUpdatedByBranch}</span>
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => onPreviewResource(res)}
                              className="p-1.5 text-slate-500 hover:text-indigo-600 rounded hover:bg-slate-100 cursor-pointer"
                              title="Preview Content"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onOpenCollaborate(res)}
                              className="px-2 py-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded hover:bg-indigo-100 cursor-pointer"
                              title="Collaborate / Upload Improved Version"
                            >
                              + Version
                            </button>
                            <button
                              onClick={() => onDownload(res)}
                              className="p-1.5 text-slate-500 hover:text-indigo-600 rounded hover:bg-slate-100 cursor-pointer"
                              title="Download File"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. MY FAVORITES / BOOKMARKED CURRICULUM */}
      {activeTab === 'favorites' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent border border-amber-300/40">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0">
                <BookmarkCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                  My Bookmarked Teaching Resources
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                    {favoriteResources.length} Saved
                  </span>
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Frequently accessed lesson plans, question banks, worksheets, and presentations across DIPS branches
                </p>
              </div>
            </div>

            {favoriteResources.length > 0 && (
              <button
                onClick={handleClearAllFavorites}
                className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-white border border-rose-200 hover:bg-rose-50 rounded-xl transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All Favorites</span>
              </button>
            )}
          </div>

          {/* Favorites Filter & Search Bar */}
          {favoriteResources.length > 0 && (
            <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search in bookmarked favorites..."
                  value={favSearchQuery}
                  onChange={(e) => setFavSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <select
                  value={favSubjectId}
                  onChange={(e) => setFavSubjectId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white cursor-pointer"
                >
                  <option value="all">All Bookmarked Subjects</option>
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={favClassId}
                  onChange={(e) => setFavClassId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white cursor-pointer"
                >
                  <option value="all">All Bookmarked Classes</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Favorites Resource Grid / Empty State */}
          {favoriteResources.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4 max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-500 border border-amber-200 flex items-center justify-center mx-auto shadow-inner">
                <Bookmark className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-slate-900">No Bookmarked Materials Yet</h4>
                <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                  Click the bookmark icon (<Bookmark className="w-3.5 h-3.5 inline text-amber-500" />) on any lesson plan, notes, or assignment to save it here for instant access during classroom sessions.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('navigator')}
                className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Explore Subject Curriculum</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : filteredFavorites.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-500">
              <p className="text-sm font-semibold text-slate-700">No favorites match your search filters.</p>
              <button
                onClick={() => {
                  setFavSearchQuery('');
                  setFavSubjectId('all');
                  setFavClassId('all');
                }}
                className="mt-2 text-xs font-bold text-amber-600 hover:underline cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredFavorites.map((res) => (
                <div
                  key={res.id}
                  className="p-5 rounded-2xl bg-white border border-amber-200 shadow-xs hover:border-amber-400 hover:shadow-md transition-all flex flex-col justify-between relative group"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                          {res.subjectName}
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-100 text-slate-700">
                          {res.className}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-blue-50 text-blue-700 border border-blue-200">
                          v{res.currentVersion}
                        </span>
                        <BookmarkButton
                          isBookmarked={true}
                          onToggle={() => handleToggleBookmark(res)}
                          size="sm"
                          activeColor="amber"
                          tooltip="Remove from favorites"
                        />
                      </div>
                    </div>

                    <h4 className="text-base font-bold text-slate-900 leading-snug line-clamp-2">{res.title}</h4>

                    <div className="flex items-center justify-between">
                      <StarRatingBadge
                        rating={res.averageRating}
                        count={res.ratingsCount}
                        showZero={false}
                      />
                      <button
                        type="button"
                        onClick={() => setRatingResource(res)}
                        className="text-[11px] font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                        <span>Rate</span>
                      </button>
                    </div>

                    <div className="p-3 rounded-lg bg-amber-50/40 border border-amber-100 text-xs space-y-1">
                      <div className="text-slate-700">
                        Chapter: <span className="font-semibold text-slate-900">{res.chapter}</span>
                      </div>
                      <div className="text-slate-700 truncate">
                        Topic: <span className="font-semibold text-slate-900">{res.topic}</span>
                      </div>
                    </div>

                    {res.description && (
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{res.description}</p>
                    )}

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="truncate">
                        Author: <strong>{res.uploadedByName}</strong> ({res.branchName})
                      </span>
                      <span className="shrink-0">{res.downloadsCount || 0} dl</span>
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-1">
                    <button
                      onClick={() => onPreviewResource(res)}
                      className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" /> Preview
                    </button>

                    <button
                      onClick={() => onOpenVersions(res)}
                      className="px-2 py-1.5 text-xs font-medium text-amber-700 hover:text-amber-900 rounded-lg hover:bg-amber-50 transition-colors flex items-center gap-1 cursor-pointer"
                      title="View revisions & changelog"
                    >
                      <History className="w-3.5 h-3.5" /> Revisions ({res.versions?.length || 1})
                    </button>

                    <button
                      onClick={() => onOpenCollaborate(res)}
                      className="px-2.5 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
                      title="Collaborate and upload Version N+1"
                    >
                      + Update
                    </button>

                    <button
                      onClick={() => onDownload(res)}
                      className="p-1.5 text-slate-600 hover:text-amber-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                      title="Download file"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. MY UPLOADS & CONTRIBUTIONS */}
      {activeTab === 'my_uploads' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">My Educational Contributions</h3>
            <p className="text-xs text-slate-500">
              Content and version updates published under your account ({currentUser.fullName})
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myUploads.map((res) => {
              const isFav = bookmarkedIds.includes(res.id);
              return (
                <div key={res.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-indigo-50 text-indigo-700">
                      {res.subjectName} • {res.className}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-blue-50 text-blue-700 border border-blue-200">
                        v{res.currentVersion}
                      </span>
                      <BookmarkButton
                        isBookmarked={isFav}
                        onToggle={() => handleToggleBookmark(res)}
                        size="xs"
                        activeColor="amber"
                      />
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900">{res.title}</h4>
                  <div className="flex items-center justify-between">
                    <StarRatingBadge
                      rating={res.averageRating}
                      count={res.ratingsCount}
                      showZero={false}
                    />
                  </div>
                  <p className="text-xs text-slate-500">
                    Chapter: {res.chapter} • Topic: {res.topic}
                  </p>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>{res.downloadsCount || 0} Downloads</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onPreviewResource(res)}
                        className="text-indigo-600 font-semibold hover:underline cursor-pointer"
                      >
                        Preview
                      </button>
                      <button
                        onClick={() => onOpenVersions(res)}
                        className="text-amber-700 font-semibold hover:underline cursor-pointer"
                      >
                        Versions ({res.versions?.length || 1})
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. ANNOUNCEMENTS */}
      {activeTab === 'announcements' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">DIPS Central Announcements</h3>
            <p className="text-xs text-slate-500">Official circulars, exam dates, and academic notifications</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {announcements.map((anc) => (
              <div key={anc.id} className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${
                      anc.priority === 'urgent'
                        ? 'bg-rose-100 text-rose-800'
                        : anc.priority === 'high'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {anc.priority}
                  </span>
                  <span className="text-[11px] text-slate-400">{new Date(anc.createdAt).toLocaleDateString()}</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">{anc.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{anc.content}</p>
                <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                  Issued by: {anc.authorName} ({anc.authorRole})
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. PROFILE & CHANGE PASSWORD */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Teacher Profile Information</h3>
            <div className="space-y-2 text-xs text-slate-700">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Full Name:</span>
                <span className="font-bold text-slate-900">{currentUser.fullName}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Employee ID:</span>
                <span className="font-mono font-bold text-slate-900">{currentUser.employeeId}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Campus Branch:</span>
                <span className="font-semibold text-slate-900">{currentUser.branchName}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Designation:</span>
                <span>{currentUser.designation || 'Faculty Member'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Assigned Subjects:</span>
                <span className="font-semibold text-indigo-700">
                  {assignedSubjects.map((s) => s.name).join(', ')}
                </span>
              </div>
            </div>
          </div>

          {/* Change Password Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Change Account Password</h3>
            {passwordMsg && (
              <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-lg border border-emerald-200">
                {passwordMsg}
              </div>
            )}
            {passwordError && (
              <div className="p-3 bg-rose-50 text-rose-800 text-xs rounded-lg border border-rose-200">
                {passwordError}
              </div>
            )}
            <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  required
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer"
              >
                Update Password
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Teacher Rating Modal */}
      {ratingResource && (
        <RateResourceModal
          resource={ratingResource}
          currentUser={currentUser}
          isOpen={!!ratingResource}
          onClose={() => setRatingResource(null)}
          onRatingSubmitted={(updated) => {
            setResources((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
            setRatingResource(null);
          }}
        />
      )}
    </div>
  );
};
