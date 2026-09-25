import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  BookOpen,
  Search,
  Filter,
  Eye,
  Download,
  Calendar,
  Building2,
  FileText,
  User,
  Sparkles,
  Layers,
  Clock,
  CheckCircle2,
  Tag,
  Megaphone,
  HelpCircle,
  Star,
  Bookmark,
  BookmarkCheck,
  Trash2,
  ArrowRight,
} from 'lucide-react';
import type { User as UserType, Subject, Resource, Announcement } from '../types.js';
import { api } from '../lib/api.js';
import { StarRatingBadge, RateResourceModal } from './StarRating.js';
import { BookmarkButton } from './BookmarkButton.js';
import {
  getBookmarkedResourceIds,
  toggleResourceBookmark,
  clearAllUserBookmarks,
} from '../lib/bookmarks.js';

interface StudentPortalProps {
  currentUser: UserType;
  onPreviewResource: (resource: Resource) => void;
  onDownload: (resource: Resource) => void;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({
  currentUser,
  onPreviewResource,
  onDownload,
}) => {
  const [activeTab, setActiveTab] = useState<'study_hub' | 'favorites' | 'announcements' | 'profile'>('study_hub');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);
  const [ratingResource, setRatingResource] = useState<Resource | null>(null);

  // Bookmarks state
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() =>
    getBookmarkedResourceIds(currentUser.id)
  );
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Filters
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedContentType, setSelectedContentType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Favorites-specific filters
  const [favSearchQuery, setFavSearchQuery] = useState('');
  const [favSubjectId, setFavSubjectId] = useState<string>('all');

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
    if (window.confirm('Are you sure you want to clear all your bookmarked favorite resources?')) {
      clearAllUserBookmarks(currentUser.id);
      setBookmarkedIds([]);
      showToast('All favorites cleared');
    }
  };

  const loadStudentData = async () => {
    try {
      setLoading(true);
      const [subsRes, resRes, ancRes] = await Promise.all([
        api.getSubjects(),
        api.getResources(),
        api.getAnnouncements(),
      ]);

      setSubjects(subsRes.subjects);
      // Backend already filters resources for students according to their classId & published status
      setResources(resRes.resources);
      setAnnouncements(ancRes.announcements);
    } catch (err) {
      console.error('Failed to load student data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudentData();
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

  const filteredResources = resources.filter((r) => {
    if (selectedSubjectId !== 'all' && r.subjectId !== selectedSubjectId) return false;
    if (selectedCategory !== 'all' && r.category !== selectedCategory) return false;
    if (selectedContentType !== 'all' && r.contentType !== selectedContentType) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        r.title.toLowerCase().includes(q) ||
        r.chapter.toLowerCase().includes(q) ||
        r.topic.toLowerCase().includes(q) ||
        r.subjectName.toLowerCase().includes(q) ||
        r.uploadedByName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Filtered favorite resources
  const favoriteResources = resources.filter((r) => bookmarkedIds.includes(r.id));
  const filteredFavorites = favoriteResources.filter((r) => {
    if (favSubjectId !== 'all' && r.subjectId !== favSubjectId) return false;
    if (favSearchQuery) {
      const q = favSearchQuery.toLowerCase();
      return (
        r.title.toLowerCase().includes(q) ||
        r.chapter.toLowerCase().includes(q) ||
        r.topic.toLowerCase().includes(q) ||
        r.subjectName.toLowerCase().includes(q) ||
        r.uploadedByName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-4 sm:space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-4 sm:right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-700 text-xs flex items-center gap-2 animate-fade-in">
          <BookmarkCheck className="w-4 h-4 text-amber-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Student Institutional Identity Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 text-white p-4 sm:p-6 rounded-2xl shadow-lg border border-emerald-900/60">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-white p-1 flex items-center justify-center shadow-md border border-emerald-400/30 shrink-0">
              <img
                src="/dips-logo.png"
                alt="DIPS Institutions Logo"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                  Student Portal
                </span>
                <span className="text-xs text-slate-300">DIPS Chain of Institutions</span>
              </div>
              <h2 className="text-2xl font-black text-white mt-0.5">{currentUser.fullName}</h2>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-300 mt-1">
                <span className="font-semibold text-amber-300">
                  {currentUser.className || 'Class VII'} - Section {currentUser.section || 'A'}
                </span>
                <span>•</span>
                <span>Roll No: {currentUser.rollNo || '14'}</span>
                <span>•</span>
                <span>Adm No: {currentUser.admissionNo}</span>
                <span>•</span>
                <span>Campus: {currentUser.branchName}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <span className="text-xs text-slate-400 block">Current Academic Session</span>
              <span className="text-sm font-bold text-amber-300 font-mono">2026-2027</span>
            </div>
          </div>
        </div>

        {/* Sub-bar */}
        <div className="mt-4 pt-4 border-t border-emerald-900/50 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>
              Your portal only displays approved curriculum materials, worksheets, and question papers for your class.
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span>{resources.length} Available Materials</span>
            <span>•</span>
            <span className="text-amber-300 font-semibold">{favoriteResources.length} Bookmarked</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1 text-xs font-bold overflow-x-auto">
        <button
          onClick={() => setActiveTab('study_hub')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'study_hub'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>My Class Curriculum & Study Hub</span>
        </button>

        <button
          onClick={() => setActiveTab('favorites')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'favorites'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Bookmark className={`w-4 h-4 ${activeTab === 'favorites' ? 'fill-white' : 'text-amber-500'}`} />
          <span>My Favorites ({favoriteResources.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('announcements')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'announcements'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>School Notices ({announcements.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Student Card</span>
        </button>
      </div>

      {/* 1. STUDY HUB & CONTENT REPOSITORY */}
      {activeTab === 'study_hub' && (
        <div className="space-y-6">
          {/* Subject Pills Selection */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Select Subject</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedSubjectId('all')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  selectedSubjectId === 'all'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                All Subjects ({resources.length})
              </button>

              {subjects.map((sub) => {
                const isSelected = selectedSubjectId === sub.id;
                const count = resources.filter((r) => r.subjectId === sub.id).length;
                return (
                  <button
                    key={sub.id}
                    onClick={() => setSelectedSubjectId(sub.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs ring-2 ring-emerald-200'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span>{sub.name}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isSelected ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search and Secondary Filters */}
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search chapter, topic, teacher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white cursor-pointer"
              >
                <option value="all">All Learning Categories</option>
                <option value="Study Material">Study Material</option>
                <option value="Assessment">Assessment & Homework</option>
                <option value="Practical">Practicals & Lab</option>
                <option value="Teaching Resources">Reference Material</option>
              </select>
            </div>

            <div>
              <select
                value={selectedContentType}
                onChange={(e) => setSelectedContentType(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white cursor-pointer"
              >
                <option value="all">All Content Formats</option>
                <option value="PDF">PDF Notes</option>
                <option value="Worksheet">Worksheets</option>
                <option value="Assignment">Assignments</option>
                <option value="Question Paper">Question Papers</option>
                <option value="Presentation">Presentations</option>
                <option value="Video">Video Lessons</option>
              </select>
            </div>
          </div>

          {/* Results Grid */}
          {filteredResources.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-500 space-y-2">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-base font-bold text-slate-700">No curriculum resources match your selection.</p>
              <p className="text-xs text-slate-400">
                Try clearing your search query or selecting "All Subjects".
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredResources.map((res) => {
                const isFav = bookmarkedIds.includes(res.id);
                return (
                  <div
                    key={res.id}
                    className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {res.subjectName}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-100 text-slate-600">
                            {res.contentType}
                          </span>
                          <BookmarkButton
                            isBookmarked={isFav}
                            onToggle={() => handleToggleBookmark(res)}
                            size="sm"
                            activeColor="amber"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-base font-bold text-slate-900 leading-snug line-clamp-2">{res.title}</h4>
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
                          onClick={(e) => {
                            e.stopPropagation();
                            setRatingResource(res);
                          }}
                          className="text-[11px] font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1 hover:underline cursor-pointer"
                        >
                          <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                          <span>Rate Content</span>
                        </button>
                      </div>

                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs space-y-1">
                        <div className="text-slate-600">
                          Chapter: <span className="font-semibold text-slate-900">{res.chapter}</span>
                        </div>
                        <div className="text-slate-600 truncate">
                          Topic: <span className="font-semibold text-slate-900">{res.topic}</span>
                        </div>
                      </div>

                      {res.description && (
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{res.description}</p>
                      )}

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                        <span className="truncate">
                          Faculty: <strong>{res.uploadedByName}</strong> ({res.branchName})
                        </span>
                        <span className="shrink-0">{res.downloadsCount || 0} dl</span>
                      </div>
                    </div>

                    {/* Strictly Student Permitted Actions: Preview & Download */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                      <button
                        onClick={() => onPreviewResource(res)}
                        className="flex-1 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Preview</span>
                      </button>

                      <button
                        onClick={() => onDownload(res)}
                        className="flex-1 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 2. MY FAVORITES / BOOKMARKED RESOURCES */}
      {activeTab === 'favorites' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent border border-amber-300/40">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0">
                <BookmarkCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                  My Favorites & Bookmarked Materials
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                    {favoriteResources.length} Saved
                  </span>
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Your bookmarked syllabus notes, exam prep papers, and worksheets for fast 1-click access
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
            <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
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
            </div>
          )}

          {/* Bookmarks Grid / Empty State */}
          {favoriteResources.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4 max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-500 border border-amber-200 flex items-center justify-center mx-auto shadow-inner">
                <Bookmark className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-slate-900">No Bookmarked Materials Yet</h4>
                <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                  Click the bookmark icon (<Bookmark className="w-3.5 h-3.5 inline text-amber-500" />) on any study material, question paper, or presentation to save it here for fast revision!
                </p>
              </div>
              <button
                onClick={() => setActiveTab('study_hub')}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-all inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Browse Class Curriculum</span>
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
                      <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                        {res.subjectName}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-100 text-slate-600">
                          {res.contentType}
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
                        onClick={(e) => {
                          e.stopPropagation();
                          setRatingResource(res);
                        }}
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
                        Faculty: <strong>{res.uploadedByName}</strong> ({res.branchName})
                      </span>
                      <span className="shrink-0">{res.downloadsCount || 0} dl</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                    <button
                      onClick={() => onPreviewResource(res)}
                      className="flex-1 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview</span>
                    </button>

                    <button
                      onClick={() => onDownload(res)}
                      className="flex-1 py-2 text-xs font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. ANNOUNCEMENTS */}
      {activeTab === 'announcements' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Official Notices & Circulars</h3>
            <p className="text-xs text-slate-500">School announcements for students and parents</p>
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
                    {anc.priority} Notice
                  </span>
                  <span className="text-[11px] text-slate-400">{new Date(anc.createdAt).toLocaleDateString()}</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">{anc.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{anc.content}</p>
                <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                  Published by: {anc.authorName} ({anc.authorRole})
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. PROFILE */}
      {activeTab === 'profile' && (
        <div className="max-w-xl bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
            <img
              src="/dips-logo.png"
              alt="DIPS Institutions Crest"
              className="w-12 h-12 object-contain"
              referrerPolicy="no-referrer"
            />
            <div>
              <h3 className="text-base font-bold text-slate-900">Student Identity Card</h3>
              <p className="text-[11px] text-slate-500">Official Institutional Credentials</p>
            </div>
          </div>
          <div className="space-y-2 text-xs text-slate-700">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Full Name:</span>
              <span className="font-bold text-slate-900">{currentUser.fullName}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Admission No:</span>
              <span className="font-mono font-bold text-slate-900">{currentUser.admissionNo}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Class & Section:</span>
              <span className="font-semibold text-slate-900">
                {currentUser.className} - Section {currentUser.section}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Roll Number:</span>
              <span className="font-mono text-slate-900">{currentUser.rollNo}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Campus Branch:</span>
              <span className="font-semibold text-emerald-800">{currentUser.branchName}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Academic Session:</span>
              <span className="font-mono text-slate-900">2026-2027</span>
            </div>
          </div>
        </div>
      )}

      {/* Student Rating Modal */}
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
