import React, { useState, useEffect, useRef } from 'react';
import {
  Megaphone,
  AlertTriangle,
  Info,
  Bell,
  ChevronRight,
  ChevronLeft,
  X,
  Plus,
  Calendar,
  Building,
  UserCheck,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Search,
  Filter,
  Eye,
  Trash2,
  RefreshCw,
  Clock,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { Announcement, User, Branch } from '../types.js';
import { api } from '../lib/api.js';

interface GlobalAnnouncementBannerProps {
  currentUser: User;
  onRefreshStats?: () => void;
}

export const GlobalAnnouncementBanner: React.FC<GlobalAnnouncementBannerProps> = ({
  currentUser,
  onRefreshStats,
}) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [dismissedIds, setDismissedIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('dips_dismissed_announcements');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Modals state
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [showAllModal, setShowAllModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);

  // Create form state
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newPriority, setNewPriority] = useState<'low' | 'normal' | 'high' | 'urgent'>('normal');
  const [newTargetRole, setNewTargetRole] = useState<'all' | 'teacher' | 'student'>('all');
  const [newTargetBranchId, setNewTargetBranchId] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  // All Announcements modal filters
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchAnnouncements = async () => {
    try {
      const res = await api.getAnnouncements();
      setAnnouncements(res.announcements || []);
    } catch (err) {
      console.error('Failed to load announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
    api.getBranches().then((res) => setBranches(res.branches)).catch(() => {});

    // Poll periodically for new updates
    const interval = setInterval(fetchAnnouncements, 30000);
    return () => clearInterval(interval);
  }, [currentUser.id]);

  // Filter visible announcements (excluding dismissed for the main carousel, unless viewing all)
  const visibleAnnouncements = announcements.filter((a) => !dismissedIds.includes(a.id));

  // Auto-rotation timer
  useEffect(() => {
    if (isPaused || visibleAnnouncements.length <= 1 || isCollapsed) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % visibleAnnouncements.length);
    }, 7000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [visibleAnnouncements.length, isPaused, isCollapsed]);

  // Adjust current index if array shrunk
  useEffect(() => {
    if (currentIndex >= visibleAnnouncements.length && visibleAnnouncements.length > 0) {
      setCurrentIndex(0);
    }
  }, [visibleAnnouncements.length, currentIndex]);

  const handleNext = () => {
    if (visibleAnnouncements.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % visibleAnnouncements.length);
  };

  const handlePrev = () => {
    if (visibleAnnouncements.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + visibleAnnouncements.length) % visibleAnnouncements.length);
  };

  const handleDismissCurrent = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = [...dismissedIds, id];
    setDismissedIds(updated);
    try {
      localStorage.setItem('dips_dismissed_announcements', JSON.stringify(updated));
    } catch {}
  };

  const handleRestoreAllDismissed = () => {
    setDismissedIds([]);
    try {
      localStorage.removeItem('dips_dismissed_announcements');
    } catch {}
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      setCreateError('Please enter both title and content.');
      return;
    }

    try {
      setCreating(true);
      setCreateError('');
      await api.createAnnouncement({
        title: newTitle.trim(),
        content: newContent.trim(),
        priority: newPriority,
        targetRole: newTargetRole,
        targetBranchId: newTargetBranchId || undefined,
      });

      // Reset form
      setNewTitle('');
      setNewContent('');
      setNewPriority('normal');
      setNewTargetRole('all');
      setNewTargetBranchId('');
      setShowCreateModal(false);
      setIsCollapsed(false);

      // Refresh list
      await fetchAnnouncements();
      if (onRefreshStats) onRefreshStats();
    } catch (err: any) {
      setCreateError(err.message || 'Failed to publish announcement.');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm('Are you sure you want to delete this school-wide announcement?')) return;
    try {
      await api.deleteAnnouncement(id);
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
      if (selectedAnnouncement?.id === id) {
        setSelectedAnnouncement(null);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete announcement');
    }
  };

  if (loading && announcements.length === 0) {
    return null;
  }

  // If all announcements are dismissed or none exist, show collapsed slim trigger or admin action
  if (visibleAnnouncements.length === 0) {
    return (
      <div className="bg-slate-900 border-b border-slate-800 text-slate-300 py-1.5 px-4 text-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-slate-200">DIPS Central Academic Broadcast:</span>
            <span className="text-slate-400">All institutional notices are up to date.</span>
          </div>

          <div className="flex items-center gap-3">
            {dismissedIds.length > 0 && (
              <button
                onClick={handleRestoreAllDismissed}
                className="text-indigo-400 hover:text-indigo-300 hover:underline font-medium text-[11px]"
              >
                Reset {dismissedIds.length} dismissed notices
              </button>
            )}
            {announcements.length > 0 && (
              <button
                onClick={() => setShowAllModal(true)}
                className="text-slate-300 hover:text-white font-medium text-[11px] flex items-center gap-1"
              >
                <Eye className="w-3 h-3 text-indigo-400" />
                <span>Notice Archive ({announcements.length})</span>
              </button>
            )}
            {currentUser.role === 'admin' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-2.5 py-0.5 rounded text-[11px] flex items-center gap-1 shadow-xs transition-all"
              >
                <Plus className="w-3 h-3" />
                <span>Broadcast Notice</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Active announcement in carousel
  const current = visibleAnnouncements[currentIndex] || visibleAnnouncements[0];

  // Priority-based style configurations
  const priorityStyles = {
    urgent: {
      wrapper: 'bg-gradient-to-r from-rose-950 via-rose-900 to-red-950 border-rose-700/60 text-rose-100',
      badge: 'bg-rose-500 text-white border-rose-400 shadow-rose-900/50',
      accent: 'text-rose-300',
      btn: 'bg-rose-600 hover:bg-rose-500 text-white',
      tagText: 'URGENT NOTICE',
      icon: AlertTriangle,
      iconColor: 'text-rose-400',
    },
    high: {
      wrapper: 'bg-gradient-to-r from-amber-950 via-amber-900 to-yellow-950 border-amber-700/60 text-amber-100',
      badge: 'bg-amber-500 text-slate-950 font-black border-amber-400 shadow-amber-900/50',
      accent: 'text-amber-300',
      btn: 'bg-amber-600 hover:bg-amber-500 text-white',
      tagText: 'PRIORITY UPDATE',
      icon: Megaphone,
      iconColor: 'text-amber-400',
    },
    normal: {
      wrapper: 'bg-gradient-to-r from-indigo-950 via-slate-900 to-blue-950 border-indigo-700/50 text-indigo-100',
      badge: 'bg-indigo-600 text-white border-indigo-400 shadow-indigo-900/50',
      accent: 'text-indigo-300',
      btn: 'bg-indigo-600 hover:bg-indigo-500 text-white',
      tagText: 'SCHOOL-WIDE BULLETIN',
      icon: Info,
      iconColor: 'text-indigo-400',
    },
    low: {
      wrapper: 'bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border-emerald-700/50 text-emerald-100',
      badge: 'bg-emerald-600 text-white border-emerald-400 shadow-emerald-900/50',
      accent: 'text-emerald-300',
      btn: 'bg-emerald-600 hover:bg-emerald-500 text-white',
      tagText: 'CAMPUS NOTICE',
      icon: Bell,
      iconColor: 'text-emerald-400',
    },
  };

  const config = priorityStyles[current.priority] || priorityStyles.normal;
  const PriorityIcon = config.icon;

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Recent';
    }
  };

  return (
    <>
      {/* Collapsed Bar Mode */}
      {isCollapsed ? (
        <div className="bg-slate-900 border-b border-indigo-900/40 text-slate-200 py-1.5 px-4 text-xs transition-all">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 truncate">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-600 text-white flex items-center gap-1">
                <Megaphone className="w-2.5 h-2.5" />
                <span>Notice ({visibleAnnouncements.length})</span>
              </span>
              <span className="font-semibold text-white truncate">{current.title}</span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setSelectedAnnouncement(current)}
                className="text-indigo-400 hover:text-indigo-300 font-semibold text-[11px] underline"
              >
                Read
              </button>
              <span className="text-slate-600">•</span>
              <button
                onClick={() => setIsCollapsed(false)}
                className="text-slate-400 hover:text-white flex items-center gap-0.5 text-[11px] font-medium"
                title="Expand banner"
              >
                <span>Expand</span>
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Full Professional Broadcast Banner */
        <div
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className={`relative border-b shadow-md transition-colors duration-500 ${config.wrapper}`}
        >
          {/* Subtle Ambient Grid Background Accent */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-40" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              {/* Left Section: Live Beacon, Priority Badge, Content */}
              <div className="flex items-start gap-3 flex-1 min-w-0">
                {/* Visual Icon Beacon */}
                <div className="hidden sm:flex shrink-0 w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 items-center justify-center shadow-inner mt-0.5">
                  <PriorityIcon className={`w-5 h-5 ${config.iconColor} animate-pulse`} />
                </div>

                <div className="flex-1 min-w-0">
                  {/* Metadata Row: Badge + Target Audience + Date */}
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded-md border shadow-xs ${config.badge}`}
                    >
                      <PriorityIcon className="w-2.5 h-2.5" />
                      <span>{config.tagText}</span>
                    </span>

                    {/* Target Scope Badge */}
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-white/10 text-white border border-white/10">
                      <Building className="w-2.5 h-2.5 text-indigo-300" />
                      <span>
                        {current.targetBranchId
                          ? branches.find((b) => b.id === current.targetBranchId)?.name || 'Branch Notice'
                          : 'All 5 DIPS Branches'}
                      </span>
                    </span>

                    {/* Role Scope */}
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-white/10 text-white border border-white/10">
                      <UserCheck className="w-2.5 h-2.5 text-amber-300" />
                      <span>
                        {current.targetRole === 'all'
                          ? 'Staff & Students'
                          : current.targetRole === 'teacher'
                          ? 'Faculty & Staff'
                          : 'Students Only'}
                      </span>
                    </span>

                    <span className="text-[10px] text-slate-300/80 font-medium flex items-center gap-1 ml-auto sm:ml-0">
                      <Clock className="w-2.5 h-2.5 opacity-70" />
                      <span>{formatDate(current.createdAt)}</span>
                    </span>
                  </div>

                  {/* Title & Preview Content */}
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-bold text-white tracking-tight leading-snug truncate">
                      {current.title}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-200/90 line-clamp-1 mt-0.5 font-normal">
                    {current.content}
                  </p>
                </div>
              </div>

              {/* Right Section: Controls & Actions */}
              <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                {/* Read Full Notice Button */}
                <button
                  onClick={() => setSelectedAnnouncement(current)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer ${config.btn}`}
                >
                  <span>View Details</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                {/* View All Notices Drawer Trigger */}
                <button
                  onClick={() => setShowAllModal(true)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-colors flex items-center gap-1 cursor-pointer"
                  title="View all school-wide notices"
                >
                  <Eye className="w-3.5 h-3.5 text-indigo-300" />
                  <span className="hidden lg:inline">Notice Board</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-bold">
                    {announcements.length}
                  </span>
                </button>

                {/* Carousel Pagination Controls */}
                {visibleAnnouncements.length > 1 && (
                  <div className="flex items-center bg-black/30 rounded-lg p-0.5 border border-white/10">
                    <button
                      onClick={handlePrev}
                      className="p-1 hover:bg-white/15 rounded text-white transition-colors cursor-pointer"
                      title="Previous announcement"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[10px] font-mono px-1.5 text-slate-300">
                      {currentIndex + 1}/{visibleAnnouncements.length}
                    </span>
                    <button
                      onClick={handleNext}
                      className="p-1 hover:bg-white/15 rounded text-white transition-colors cursor-pointer"
                      title="Next announcement"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Admin Quick Create Button */}
                {currentUser.role === 'admin' && (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="p-1.5 bg-indigo-500 hover:bg-indigo-400 text-white rounded-lg shadow-xs transition-colors cursor-pointer"
                    title="Publish new school-wide announcement"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Collapse / Dismiss Controls */}
                <button
                  onClick={() => setIsCollapsed(true)}
                  className="p-1.5 hover:bg-white/15 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="Minimize banner"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={(e) => handleDismissCurrent(current.id, e)}
                  className="p-1.5 hover:bg-rose-500/30 rounded-lg text-slate-300 hover:text-rose-200 transition-colors cursor-pointer"
                  title="Dismiss this notice"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 1: FULL ANNOUNCEMENT DETAILS POPUP
          ========================================================= */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden text-slate-900 animate-in zoom-in-95">
            {/* Header with Priority Ribbon */}
            <div
              className={`p-6 pb-4 border-b ${
                selectedAnnouncement.priority === 'urgent'
                  ? 'bg-rose-50 border-rose-100'
                  : selectedAnnouncement.priority === 'high'
                  ? 'bg-amber-50 border-amber-100'
                  : 'bg-indigo-50 border-indigo-100'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span
                  className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                    selectedAnnouncement.priority === 'urgent'
                      ? 'bg-rose-600 text-white border-rose-700'
                      : selectedAnnouncement.priority === 'high'
                      ? 'bg-amber-500 text-slate-950 border-amber-600'
                      : 'bg-indigo-600 text-white border-indigo-700'
                  }`}
                >
                  {selectedAnnouncement.priority.toUpperCase()} PRIORITY
                </span>

                <button
                  onClick={() => setSelectedAnnouncement(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5 text-slate-500 hover:text-slate-900 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <h2 className="text-lg font-extrabold text-slate-900 leading-snug">
                {selectedAnnouncement.title}
              </h2>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2">
                <span className="flex items-center gap-1 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {formatDate(selectedAnnouncement.createdAt)}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 font-medium">
                  <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                  {selectedAnnouncement.authorName} ({selectedAnnouncement.authorRole})
                </span>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-xs text-slate-600 grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Target Campus:</span>
                  <span className="font-semibold text-slate-800">
                    {selectedAnnouncement.targetBranchId
                      ? branches.find((b) => b.id === selectedAnnouncement.targetBranchId)?.name ||
                        selectedAnnouncement.targetBranchId
                      : 'All 5 DIPS Campuses'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Intended Audience:</span>
                  <span className="font-semibold text-slate-800 capitalize">
                    {selectedAnnouncement.targetRole === 'all'
                      ? 'All Staff & Students'
                      : `${selectedAnnouncement.targetRole}s only`}
                  </span>
                </div>
              </div>

              <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                {selectedAnnouncement.content}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              {currentUser.role === 'admin' ? (
                <button
                  type="button"
                  onClick={() => handleDeleteAnnouncement(selectedAnnouncement.id)}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-rose-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Notice</span>
                </button>
              ) : (
                <div className="text-[11px] text-slate-400">
                  DIPS Central Academic Broadcast Network
                </div>
              )}

              <button
                type="button"
                onClick={() => setSelectedAnnouncement(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Close Notice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 2: NOTICE BOARD / ARCHIVE (ALL ANNOUNCEMENTS)
          ========================================================= */}
      {showAllModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden text-slate-900 animate-in zoom-in-95">
            {/* Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">DIPS Central Notice Board</h2>
                  <p className="text-xs text-slate-500">
                    Official school-wide updates, circulars, and directives for all branches
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {currentUser.role === 'admin' && (
                  <button
                    onClick={() => {
                      setShowAllModal(false);
                      setShowCreateModal(true);
                    }}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Post Update</span>
                  </button>
                )}
                <button
                  onClick={() => setShowAllModal(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Filters Bar */}
            <div className="p-4 border-b border-slate-100 bg-white flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search updates by keyword, topic, or author..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="text-xs border border-slate-200 rounded-lg px-2.5 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Priorities</option>
                  <option value="urgent">Urgent Only</option>
                  <option value="high">High Priority</option>
                  <option value="normal">Normal Bulletin</option>
                  <option value="low">Campus Notice</option>
                </select>

                {dismissedIds.length > 0 && (
                  <button
                    onClick={handleRestoreAllDismissed}
                    className="text-xs font-semibold text-indigo-600 hover:underline px-2 py-1"
                  >
                    Reset Dismissed
                  </button>
                )}
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {(() => {
                const filtered = announcements.filter((a) => {
                  if (priorityFilter !== 'all' && a.priority !== priorityFilter) return false;
                  if (
                    searchQuery.trim() &&
                    !a.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
                    !a.content.toLowerCase().includes(searchQuery.toLowerCase()) &&
                    !a.authorName.toLowerCase().includes(searchQuery.toLowerCase())
                  ) {
                    return false;
                  }
                  return true;
                });

                if (filtered.length === 0) {
                  return (
                    <div className="text-center py-12 text-slate-400">
                      <Info className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      <p className="text-sm font-semibold">No announcements matched your search</p>
                      <p className="text-xs text-slate-400 mt-1">Try resetting the filter criteria.</p>
                    </div>
                  );
                }

                return filtered.map((item) => {
                  const itemConfig = priorityStyles[item.priority] || priorityStyles.normal;
                  const isDismissed = dismissedIds.includes(item.id);

                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-xl border transition-all hover:shadow-md bg-white ${
                        item.priority === 'urgent'
                          ? 'border-rose-200 hover:border-rose-400'
                          : item.priority === 'high'
                          ? 'border-amber-200 hover:border-amber-400'
                          : 'border-slate-200 hover:border-indigo-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            <span
                              className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                                item.priority === 'urgent'
                                  ? 'bg-rose-100 text-rose-800'
                                  : item.priority === 'high'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-indigo-100 text-indigo-800'
                              }`}
                            >
                              {item.priority}
                            </span>
                            <span className="text-[11px] font-semibold text-slate-500">
                              {item.targetBranchId
                                ? branches.find((b) => b.id === item.targetBranchId)?.name || 'Specific Branch'
                                : 'All 5 Branches'}
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="text-[11px] text-slate-400">{formatDate(item.createdAt)}</span>
                            {isDismissed && (
                              <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                                Dismissed from top banner
                              </span>
                            )}
                          </div>

                          <h4 className="text-sm font-bold text-slate-900 leading-snug">{item.title}</h4>
                          <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">{item.content}</p>

                          <div className="flex items-center gap-3 mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                            <span>Author: <strong>{item.authorName}</strong> ({item.authorRole})</span>
                            <span>•</span>
                            <span>Audience: <strong>{item.targetRole === 'all' ? 'Staff & Students' : item.targetRole}</strong></span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <button
                            onClick={() => {
                              setSelectedAnnouncement(item);
                            }}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                          >
                            <span>Read</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>

                          {currentUser.role === 'admin' && (
                            <button
                              onClick={() => handleDeleteAnnouncement(item.id)}
                              className="text-slate-400 hover:text-rose-600 p-1"
                              title="Delete announcement"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 text-right">
              <button
                onClick={() => setShowAllModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Close Notice Board
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 3: BROADCAST / CREATE ANNOUNCEMENT (ADMIN)
          ========================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden text-slate-900 animate-in zoom-in-95">
            <div className="p-6 pb-4 border-b border-slate-200 bg-indigo-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                  <Megaphone className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Broadcast School Announcement</h2>
                  <p className="text-xs text-slate-500">Post an institution-wide bulletin or urgent notice</p>
                </div>
              </div>

              <button
                onClick={() => setShowCreateModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-200 text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              {createError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{createError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Announcement Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mid-Term Examination Syllabus & Blueprint Released"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Priority Level</label>
                  <select
                    value={newPriority}
                    onChange={(e: any) => setNewPriority(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="urgent">🔴 Urgent / Critical</option>
                    <option value="high">🟠 High Priority</option>
                    <option value="normal">🔵 School-Wide Bulletin</option>
                    <option value="low">🟢 Campus Update</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Role</label>
                  <select
                    value={newTargetRole}
                    onChange={(e: any) => setNewTargetRole(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">Everyone (Staff & Students)</option>
                    <option value="teacher">Faculty & Staff Only</option>
                    <option value="student">Students Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Campus Branch</label>
                <select
                  value={newTargetBranchId}
                  onChange={(e) => setNewTargetBranchId(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Branches (Begowal, Mehta Chowk, Nurmahal, Tanda, Rayya)</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.city})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Detailed Notice Content <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Provide full instructions, important deadlines, circular guidelines, or contact person details..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{creating ? 'Broadcasting...' : 'Publish to Portal Banner'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
