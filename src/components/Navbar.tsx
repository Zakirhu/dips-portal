import React, { useState, useEffect, useRef } from 'react';
import {
  GraduationCap,
  Bell,
  LogOut,
  User as UserIcon,
  Shield,
  BookOpen,
  Building,
  RefreshCw,
  CheckCheck,
  ChevronDown,
  Bookmark,
  Search,
  X,
  FileText,
  Download,
  Eye,
  Layers,
  Sparkles,
  Tag,
  ArrowRight,
  Filter,
} from 'lucide-react';
import type { User, AppNotification, Resource } from '../types.js';
import { api } from '../lib/api.js';
import { getBookmarkedResourceIds } from '../lib/bookmarks.js';

interface NavbarProps {
  currentUser: User;
  onLogout: () => void;
  onQuickSwitchUser?: (user: User) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onPreviewResource?: (resource: Resource) => void;
  onDownload?: (resource: Resource) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onLogout,
  onQuickSwitchUser,
  activeTab,
  setActiveTab,
  onPreviewResource,
  onDownload,
}) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<AppNotification | null>(null);
  const [bookmarkCount, setBookmarkCount] = useState<number>(() =>
    getBookmarkedResourceIds(currentUser.id).length
  );

  // Global Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Resource[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const fetchNotifs = async () => {
    try {
      const res = await api.getNotifications();
      setNotifications(res.notifications);
      setUnreadCount(res.unreadCount);
    } catch (err) {
      // ignore
    }
  };

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 15000);
    return () => clearInterval(interval);
  }, [currentUser.id]);

  useEffect(() => {
    setBookmarkCount(getBookmarkedResourceIds(currentUser.id).length);
    const handleBookmarksUpdated = (e: any) => {
      if (!e.detail || e.detail.userId === currentUser.id) {
        setBookmarkCount(getBookmarkedResourceIds(currentUser.id).length);
      }
    };
    window.addEventListener('dips_bookmarks_updated', handleBookmarksUpdated);
    return () => {
      window.removeEventListener('dips_bookmarks_updated', handleBookmarksUpdated);
    };
  }, [currentUser.id]);

  // Global Keyboard Shortcut: Cmd/Ctrl+K or '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === 'k' && (e.metaKey || e.ctrlKey)) ||
        (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA')
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsSearchFocused(true);
      } else if (e.key === 'Escape') {
        setIsSearchFocused(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle Outside Clicks to close Search dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search API query with debouncing
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const params: Record<string, string> = {
          search: searchQuery.trim(),
        };
        if (selectedCategoryFilter !== 'all') {
          params.category = selectedCategoryFilter;
        }

        const res = await api.getResources(params);
        setSearchResults(res.resources || []);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategoryFilter]);

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // ignore
    }
  };

  const handleSelectResource = (resource: Resource) => {
    setIsSearchFocused(false);
    if (onPreviewResource) {
      onPreviewResource(resource);
    }
  };

  const roleColors: Record<string, { bg: string; text: string; border: string }> = {
    admin: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
    teacher: { bg: 'bg-indigo-50', text: 'text-indigo-800', border: 'border-indigo-200' },
    coordinator: { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200' },
    student: { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' },
  };

  const roleBadge = roleColors[currentUser.role] || roleColors.student;
  const showDropdown = isSearchFocused && searchQuery.trim().length > 0;

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Logo & Brand */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <img
            src="/dips-logo.png"
            alt="DIPS Institutions Logo"
            className="w-9 h-9 sm:w-11 sm:h-11 object-contain drop-shadow-xs"
            referrerPolicy="no-referrer"
          />
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900 leading-tight">
                DIPS Institutions
              </h1>
              <span className="hidden xl:inline-block px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                Session 2026-27
              </span>
            </div>
            <p className="hidden md:block text-[11px] text-slate-500 font-medium tracking-wide truncate">
              Centralized Learning & Content Sharing Portal
            </p>
          </div>
        </div>

        {/* Center: Global Search Bar */}
        <div ref={searchContainerRef} className="flex-1 max-w-md lg:max-w-lg relative mx-1 sm:mx-2 min-w-0">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              placeholder="Search resources, subjects, classes..."
              className="w-full pl-9 pr-10 sm:pr-20 py-2 text-xs bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl text-slate-900 placeholder-slate-400 transition-all shadow-2xs outline-none"
            />
            
            <div className="absolute right-2.5 flex items-center gap-1.5">
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    searchInputRef.current?.focus();
                  }}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 bg-slate-200/60 border border-slate-300 rounded font-mono">
                  <span>⌘</span>
                  <span>K</span>
                </kbd>
              )}
            </div>
          </div>

          {/* Search Results Dropdown Popover */}
          {showDropdown && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200/90 py-2.5 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 max-h-[80vh] flex flex-col">
              {/* Category Filter Chips inside dropdown */}
              <div className="px-3 pb-2.5 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto text-[11px] scrollbar-none">
                <span className="text-slate-400 font-medium shrink-0 flex items-center gap-1 text-[10px] uppercase tracking-wider pr-1">
                  <Filter className="w-3 h-3" />
                  Filter:
                </span>
                {[
                  { id: 'all', label: 'All' },
                  { id: 'Study Material', label: 'Study Material' },
                  { id: 'Assessment', label: 'Assessments' },
                  { id: 'Practical', label: 'Practicals' },
                  { id: 'Teaching Resources', label: 'Teaching Resources' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategoryFilter(cat.id)}
                    className={`px-2.5 py-1 rounded-lg font-medium shrink-0 transition-colors cursor-pointer ${
                      selectedCategoryFilter === cat.id
                        ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Status Header */}
              <div className="px-3.5 py-1.5 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="font-semibold text-slate-700">
                  {isSearching ? (
                    'Searching resources across all DIPS institutions...'
                  ) : (
                    `Found ${searchResults.length} resource${searchResults.length === 1 ? '' : 's'} matching "${searchQuery}"`
                  )}
                </span>
                <span className="text-[10px] text-slate-400">Press Esc to close</span>
              </div>

              {/* Results List */}
              <div className="overflow-y-auto max-h-96 divide-y divide-slate-100 p-1">
                {isSearching ? (
                  <div className="py-8 text-center space-y-2">
                    <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-xs text-slate-400">Searching title, subject, and class...</p>
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="py-8 px-4 text-center space-y-2">
                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                      <Search className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-slate-700">No resources found for "{searchQuery}"</p>
                    <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                      Try searching with subject terms (e.g. Mathematics, Science), class names (e.g. Class 10, Class 12), or topic keywords.
                    </p>
                  </div>
                ) : (
                  searchResults.map((res) => (
                    <div
                      key={res.id}
                      onClick={() => handleSelectResource(res)}
                      className="p-2.5 hover:bg-indigo-50/60 rounded-xl transition-colors cursor-pointer group flex items-start justify-between gap-3"
                    >
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                          <FileText className="w-4 h-4" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                              {res.title}
                            </span>
                            <span className="px-1.5 py-0.2 rounded bg-indigo-50 border border-indigo-200 text-[10px] font-bold text-indigo-700">
                              {res.subjectName}
                            </span>
                            <span className="px-1.5 py-0.2 rounded bg-emerald-50 border border-emerald-200 text-[10px] font-bold text-emerald-700">
                              {res.className}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 flex-wrap">
                            {res.chapter && (
                              <span className="font-medium text-slate-600 truncate max-w-[140px]">
                                {res.chapter}
                              </span>
                            )}
                            <span className="text-slate-300">•</span>
                            <span className="text-[10px] text-slate-500 truncate">
                              {res.branchName || 'DIPS Central'}
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="text-[10px] text-indigo-600 font-medium">
                              v{res.currentVersion}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Quick Action Button */}
                      <div className="flex items-center gap-1 shrink-0 self-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectResource(res);
                          }}
                          className="p-1.5 rounded-lg bg-white border border-slate-200 text-indigo-600 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all text-[11px] font-bold flex items-center gap-1 shadow-2xs cursor-pointer"
                          title="Preview Resource"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Preview</span>
                        </button>

                        {onDownload && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDownload(res);
                            }}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors text-[11px] cursor-pointer"
                            title="Download File"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Section: Branch badge, Notifications, User info, Actions */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Active Branch Display */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700">
            <Building className="w-3.5 h-3.5 text-indigo-600" />
            <span className="truncate max-w-[140px]">{currentUser.branchName || 'DIPS Central'}</span>
          </div>

          {/* Role Badge */}
          <span
            className={`px-2 sm:px-2.5 py-1 text-[11px] sm:text-xs font-bold rounded-lg border uppercase tracking-wider ${roleBadge.bg} ${roleBadge.text} ${roleBadge.border}`}
          >
            {currentUser.role}
          </span>

          {/* Favorites Bookmark Shortcut Button for Teachers and Students */}
          {(currentUser.role === 'teacher' || currentUser.role === 'student' || currentUser.role === 'coordinator') && (
            <button
              onClick={() => {
                setShowNotifs(false);
                setShowUserMenu(false);
                window.dispatchEvent(new CustomEvent('dips_navigate_tab', { detail: { tab: 'favorites' } }));
              }}
              className="relative p-2 rounded-lg text-slate-600 hover:text-amber-600 hover:bg-amber-50/70 transition-colors cursor-pointer"
              title="My Favorites & Bookmarked Content"
            >
              <Bookmark className="w-4 h-4 sm:w-5 sm:h-5" />
              {bookmarkCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-amber-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                  {bookmarkCount > 9 ? '9+' : bookmarkCount}
                </span>
              )}
            </button>
          )}

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifs(!showNotifs);
                setShowUserMenu(false);
              }}
              className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifs && (
              <div className="fixed sm:absolute inset-x-3 sm:inset-x-auto right-auto sm:right-0 top-16 sm:top-auto sm:mt-2 w-auto sm:w-96 max-w-[calc(100vw-24px)] bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">Notifications ({unreadCount} unread)</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCheck className="w-3 h-3" /> Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                  {notifications.length === 0 ? (
                    <p className="p-4 text-center text-xs text-slate-400">No notifications yet.</p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={async () => {
                          if (!n.isRead) {
                            await api.markNotificationRead(n.id);
                            setNotifications((prev) =>
                              prev.map((item) => (item.id === n.id ? { ...item, isRead: true } : item))
                            );
                            setUnreadCount((c) => Math.max(0, c - 1));
                          }
                          setSelectedNotification(n);
                          setShowNotifs(false);
                        }}
                        className={`p-3 text-xs hover:bg-slate-50 cursor-pointer transition-colors ${
                          !n.isRead ? 'bg-indigo-50/40 font-medium' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-slate-900">{n.title}</span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-slate-600 mt-0.5 text-[11px] leading-relaxed">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Full Screen Notification Modal */}
          {selectedNotification && (
            <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                      <Bell className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-white">Full-Screen Notification Details</h3>
                      <p className="text-xs text-slate-400">DIPS Centralized Curriculum & Announcement Alert</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedNotification(null)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="p-6 sm:p-8 space-y-6 overflow-y-auto">
                  <div className="space-y-2 border-b border-slate-100 pb-6">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-200 font-bold uppercase tracking-wider text-[11px]">
                        {selectedNotification.type || 'System Alert'}
                      </span>
                      <span>
                        {new Date(selectedNotification.createdAt).toLocaleDateString()}{' '}
                        {new Date(selectedNotification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug pt-2">
                      {selectedNotification.title}
                    </h2>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Message Content</h4>
                    <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal whitespace-pre-line">
                      {selectedNotification.message}
                    </p>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                    <button
                      onClick={() => setSelectedNotification(null)}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors cursor-pointer"
                    >
                      Close Fullscreen View
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* User Profile Menu */}
          <div className="relative">
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifs(false);
              }}
              className="flex items-center gap-1.5 sm:gap-2 p-1 sm:p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-left cursor-pointer"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center border border-indigo-200">
                {currentUser.fullName.charAt(0)}
              </div>
              <div className="hidden lg:block">
                <span className="text-xs font-bold text-slate-900 block leading-tight truncate max-w-[120px]">
                  {currentUser.fullName}
                </span>
                <span className="text-[10px] text-slate-500 block truncate max-w-[120px]">
                  {currentUser.employeeId || currentUser.admissionNo || currentUser.email}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900">{currentUser.fullName}</p>
                  <p className="text-[11px] text-slate-500">{currentUser.email}</p>
                  <p className="text-[11px] text-indigo-600 font-medium mt-1">
                    {currentUser.designation || (currentUser.role === 'student' ? `${currentUser.className} - Sec ${currentUser.section}` : 'Administrator')}
                  </p>
                </div>

                <div className="py-1">
                  {(currentUser.role === 'teacher' || currentUser.role === 'student' || currentUser.role === 'coordinator') && (
                    <button
                      onClick={() => {
                        window.dispatchEvent(new CustomEvent('dips_navigate_tab', { detail: { tab: 'favorites' } }));
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Bookmark className="w-3.5 h-3.5 text-amber-500" />
                        <span>My Favorites</span>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
                        {bookmarkCount}
                      </span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setActiveTab('profile');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-slate-400" /> My Profile
                  </button>
                </div>

                <div className="border-t border-slate-100 pt-1">
                  <button
                    onClick={onLogout}
                    className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
