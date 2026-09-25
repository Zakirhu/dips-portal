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
  MessageSquare,
  Compass,
  ChevronDown,
  ChevronUp,
  Menu,
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
  onUpdateUser?: (user: User) => void;
  onOpenUpload: (initialSubjectId?: string, initialClassId?: string) => void;
  onPreviewResource: (resource: Resource) => void;
  onOpenVersions: (resource: Resource) => void;
  onOpenCollaborate: (resource: Resource) => void;
  onDownload: (resource: Resource) => void;
}

export const TeacherPortal: React.FC<TeacherPortalProps> = ({
  currentUser,
  onUpdateUser,
  onOpenUpload,
  onPreviewResource,
  onOpenVersions,
  onOpenCollaborate,
  onDownload,
}) => {
  const [activeTab, setActiveTab] = useState<
    'navigator' | 'library' | 'favorites' | 'my_uploads' | 'announcements' | 'chat' | 'profile'
  >('navigator');

  interface ChatMessage {
    id: string;
    channelId: string;
    senderId: string;
    senderName: string;
    senderBranchName?: string;
    senderRole?: string;
    content: string;
    timestamp: string;
    attachedResourceId?: string;
    attachedResourceTitle?: string;
  }

  const CHAT_STORAGE_KEY = 'dips_teacher_chat_messages_v1';
  const defaultChatMessages: ChatMessage[] = [
    {
      id: 'msg-1',
      channelId: 'general',
      senderId: 'admin-dir',
      senderName: 'Academic Directorate',
      senderBranchName: 'Central Directorate',
      senderRole: 'Coordinator',
      content: 'Welcome educators to the DIPS Cross-Branch Teacher Discussion Network! Feel free to discuss lesson plans, syllabi, and teaching strategies across all 21 campuses.',
      timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
    },
    {
      id: 'msg-2',
      channelId: 'syllabus',
      senderId: 't-1',
      senderName: 'Mrs. Simranjit Kaur',
      senderBranchName: 'DIPS School, Jalandhar (Urban Estate)',
      senderRole: 'teacher',
      content: 'Colleagues, has everyone uploaded their Class X Mathematics Chapter 4 practice worksheets for cross-branch review?',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'msg-3',
      channelId: 'assessments',
      senderId: 't-2',
      senderName: 'Mr. Rajesh Kumar',
      senderBranchName: 'DIPS School, Amritsar',
      senderRole: 'teacher',
      content: 'Yes! Just uploaded the midterm sample paper with detailed answer keys in the shared library. You can attach and review it directly here.',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
    },
  ];

  const [chatChannel, setChatChannel] = useState<'general' | 'syllabus' | 'assessments' | 'labs'>('general');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(CHAT_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {}
    return defaultChatMessages;
  });
  const [chatInput, setChatInput] = useState('');
  const [selectedAttachmentId, setSelectedAttachmentId] = useState<string>('');

  useEffect(() => {
    try {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(chatMessages));
    } catch (e) {}
  }, [chatMessages]);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === CHAT_STORAGE_KEY && e.newValue) {
        try {
          setChatMessages(JSON.parse(e.newValue));
        } catch (err) {}
      }
    };
    const handleCustomChat = (e: any) => {
      if (e.detail) {
        try {
          const saved = localStorage.getItem(CHAT_STORAGE_KEY);
          if (saved) setChatMessages(JSON.parse(saved));
        } catch (err) {}
      }
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('dips_chat_updated', handleCustomChat);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('dips_chat_updated', handleCustomChat);
    };
  }, []);

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    let attachedTitle = undefined;
    if (selectedAttachmentId) {
      const resFound = resources.find((r) => r.id === selectedAttachmentId);
      if (resFound) attachedTitle = resFound.title;
    }

    const newMessage: ChatMessage = {
      id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      channelId: chatChannel,
      senderId: currentUser.id,
      senderName: currentUser.fullName,
      senderBranchName: currentUser.branchName || 'DIPS Branch',
      senderRole: currentUser.role,
      content: chatInput.trim(),
      timestamp: new Date().toISOString(),
      attachedResourceId: selectedAttachmentId || undefined,
      attachedResourceTitle: attachedTitle,
    };

    const updated = [...chatMessages, newMessage];
    setChatMessages(updated);
    try {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('dips_chat_updated', { detail: { messages: updated } }));
    } catch (err) {}

    setChatInput('');
    setSelectedAttachmentId('');
  };

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<AcademicClass[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [teacherStats, setTeacherStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Profile edit state
  const [profileFullName, setProfileFullName] = useState(currentUser.fullName);
  const [profilePhone, setProfilePhone] = useState(currentUser.phone || '');
  const [profileDesignation, setProfileDesignation] = useState(currentUser.designation || '');
  const [assignedSubjectIds, setAssignedSubjectIds] = useState<string[]>(currentUser.assignedSubjectIds || []);
  const [assignedClassIds, setAssignedClassIds] = useState<string[]>(currentUser.assignedClassIds || []);
  const [profileMsg, setProfileMsg] = useState('');
  const [profileError, setProfileError] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Quick subject/class creation state
  const [newSubjectInput, setNewSubjectInput] = useState('');
  const [newClassInput, setNewClassInput] = useState('');

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

  // Mobile-specific interactive states & Stage filter for all 16 classes
  const [classStageFilter, setClassStageFilter] = useState<
    'all' | 'pre_primary' | 'primary' | 'middle' | 'secondary' | 'senior_secondary'
  >('all');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [showMobileMoreMenu, setShowMobileMoreMenu] = useState(false);

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

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setProfileMsg('');
    setProfileError('');
    try {
      const res = await api.updateProfile({
        fullName: profileFullName,
        phone: profilePhone,
        designation: profileDesignation,
        assignedSubjectIds,
        assignedClassIds,
      });
      if (onUpdateUser) {
        onUpdateUser(res.user);
      }
      setProfileMsg('Profile, assigned subjects, and classes updated successfully!');
    } catch (err: any) {
      setProfileError(err.message || 'Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleCreateAndAssignSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectInput.trim()) return;
    try {
      const res = await api.createSubject({
        name: newSubjectInput.trim(),
        code: newSubjectInput.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 5),
        department: 'General',
        applicableClasses: [],
      });
      setSubjects((prev) => [...prev, res.subject]);
      setAssignedSubjectIds((prev) => [...prev, res.subject.id]);
      setNewSubjectInput('');
      showToast(`Created and assigned subject "${res.subject.name}"`);
    } catch (err: any) {
      alert(err.message || 'Failed to create subject');
    }
  };

  const handleCreateAndAssignClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassInput.trim()) return;
    try {
      const res = await api.createClass({
        name: newClassInput.trim(),
        code: newClassInput.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 5),
        order: classes.length + 1,
        sections: ['A', 'B'],
      });
      setClasses((prev) => [...prev, res.class]);
      setAssignedClassIds((prev) => [...prev, res.class.id]);
      setNewClassInput('');
      showToast(`Created and assigned class "${res.class.name}"`);
    } catch (err: any) {
      alert(err.message || 'Failed to create class');
    }
  };

  const handleDeleteResource = async (res: Resource) => {
    if (window.confirm(`Are you sure you want to delete "${res.title}"? This will permanently remove the resource if uploaded by mistake.`)) {
      try {
        await api.deleteResource(res.id);
        setResources((prev) => prev.filter((r) => r.id !== res.id));
        showToast(`Successfully deleted "${res.title}"`);
      } catch (err: any) {
        alert(err.message || 'Failed to delete resource');
      }
    }
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

    const handleResourceUploaded = () => {
      loadData();
      setActiveTab('my_uploads');
      showToast('New resource synced & available in My Contributions!');
    };

    window.addEventListener('dips_bookmarks_updated', handleBookmarksUpdated);
    window.addEventListener('dips_navigate_tab', handleNavigateTab);
    window.addEventListener('dips_resource_uploaded', handleResourceUploaded);
    return () => {
      window.removeEventListener('dips_bookmarks_updated', handleBookmarksUpdated);
      window.removeEventListener('dips_navigate_tab', handleNavigateTab);
      window.removeEventListener('dips_resource_uploaded', handleResourceUploaded);
    };
  }, [currentUser.id]);

  const assignedSubjects = subjects.filter((s) =>
    currentUser.assignedSubjectIds?.includes(s.id)
  );

  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);
  const selectedClass = classes.find((c) => c.id === selectedClassId);

  // Group and filter classes by educational stage for mobile thumb ease
  const filteredClassesByStage = useMemo(() => {
    if (classStageFilter === 'all') return classes;
    return classes.filter((cls) => {
      const n = (cls.name + ' ' + cls.code).toLowerCase();
      if (classStageFilter === 'pre_primary') {
        return n.includes('nur') || n.includes('lkg') || n.includes('ukg');
      }
      if (classStageFilter === 'primary') {
        return (
          n.includes('class i ') ||
          n.includes('class ii') ||
          n.includes('class iii') ||
          n.includes('class iv') ||
          n.includes('class v') ||
          (n.startsWith('i') && !n.startsWith('ix'))
        );
      }
      if (classStageFilter === 'middle') {
        return n.includes('class vi') || n.includes('class vii') || n.includes('class viii');
      }
      if (classStageFilter === 'secondary') {
        return (n.includes('class ix') || n.includes('class x')) && !n.includes('xi') && !n.includes('xii');
      }
      if (classStageFilter === 'senior_secondary') {
        return (
          n.includes('class xi') ||
          n.includes('class xii') ||
          n.includes('science') ||
          n.includes('commerce') ||
          n.includes('humanities') ||
          n.includes('vocational')
        );
      }
      return true;
    });
  }, [classes, classStageFilter]);

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

  const myUploads = useMemo(() => {
    const userId = currentUser.id;
    const userName = currentUser.fullName?.toLowerCase().trim();
    const empId = currentUser.employeeId?.toLowerCase().trim();

    return resources.filter((r) => {
      if (r.uploadedByUserId && r.uploadedByUserId === userId) return true;
      if (r.lastUpdatedByUserId && r.lastUpdatedByUserId === userId) return true;
      if (userName && r.uploadedByName && r.uploadedByName.toLowerCase().trim() === userName) return true;
      if (empId && r.uploadedByEmployeeId && r.uploadedByEmployeeId.toLowerCase().trim() === empId) return true;
      return false;
    });
  }, [resources, currentUser]);

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
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 pb-28 md:py-8 space-y-4 sm:space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-700 text-xs flex items-center gap-2 animate-fade-in">
          <BookmarkCheck className="w-4 h-4 text-amber-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Teacher Welcome & Cross-Branch Collaboration Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 sm:p-6 rounded-2xl shadow-lg border border-indigo-950/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-white p-1 flex items-center justify-center shadow-md border border-indigo-400/30 shrink-0">
              <img
                src="/dips-logo.png"
                alt="DIPS Institutions Logo"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 text-[10px] sm:text-xs font-bold rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Faculty Workspace
                </span>
                <span className="text-[11px] sm:text-xs text-slate-300">
                  {currentUser.branchName} • {currentUser.designation || 'Faculty Member'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-1">
                Welcome, {currentUser.fullName}
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-300 mt-1 max-w-2xl line-clamp-2 sm:line-clamp-none">
                Assigned Subjects:{' '}
                <strong className="text-amber-300">
                  {assignedSubjects.map((s) => s.name).join(', ') || 'General Faculty'}
                </strong>
                . You have full access to view, download, and collaboratively update curriculum resources across all
                connected DIPS branches.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0 w-full sm:w-auto">
            <button
              onClick={() => {
                loadData();
                showToast('Refreshed curriculum resources');
              }}
              disabled={loading}
              className="p-2.5 sm:px-3 text-xs font-semibold text-slate-200 bg-white/10 hover:bg-white/20 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-white/15 min-h-[42px]"
              title="Refresh resources from central server"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-300' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              onClick={() => onOpenUpload(selectedSubjectId, selectedClassId)}
              className="flex-1 sm:flex-initial px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[42px] active:scale-[0.98]"
            >
              <Upload className="w-4 h-4" />
              <span>Upload New Resource</span>
            </button>
          </div>
        </div>

        {/* Quick Collaboration Highlights Banner */}
        <div className="mt-3.5 pt-3.5 sm:mt-4 sm:pt-4 border-t border-indigo-900/60 flex flex-wrap items-center justify-between gap-2.5 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-[11px] sm:text-xs">
              <strong>Cross-Branch Network:</strong> Resources in your subject are shared seamlessly across all DIPS institutions.
            </span>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 text-[10px] sm:text-[11px] text-slate-400">
            <span>{accessibleResources.length} Subject Resources</span>
            <span>•</span>
            <span className="text-amber-300 font-semibold">{favoriteResources.length} Bookmarked</span>
            <span>•</span>
            <span>{myUploads.length} Contributed</span>
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
          { id: 'chat', label: 'Cross-Branch Teacher Chat', icon: MessageSquare },
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
          {/* Quick Highlight of Teacher's Own Recent Contributions */}
          {myUploads.length > 0 && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50/80 via-white to-indigo-50/50 border border-indigo-100 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Your Recent Uploads & Contributions ({myUploads.length})
                  </h4>
                </div>
                <button
                  onClick={() => setActiveTab('my_uploads')}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                >
                  <span>View All in My Contributions</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {myUploads.slice(0, 3).map((res) => {
                  const isImage =
                    res.contentType === 'Images' ||
                    /\.(png|jpe?g|gif|webp|svg|bmp)(\?.*)?$/i.test(res.fileUrl) ||
                    /\.(png|jpe?g|gif|webp|svg|bmp)$/i.test(res.fileName);

                  return (
                    <div
                      key={res.id}
                      className="p-3 bg-white rounded-xl border border-indigo-100/80 shadow-2xs hover:border-indigo-300 transition-all flex items-start gap-3"
                    >
                      {isImage ? (
                        <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                          <img
                            src={res.fileUrl}
                            alt={res.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 font-bold text-xs">
                          {res.contentType.slice(0, 3).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] font-bold text-indigo-700 truncate">
                            {res.subjectName} • {res.className}
                          </span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                            v{res.currentVersion}
                          </span>
                        </div>
                        <h5 className="text-xs font-bold text-slate-900 truncate leading-snug">
                          {res.title}
                        </h5>
                        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                          <span>{res.category}</span>
                          <button
                            onClick={() => onPreviewResource(res)}
                            className="text-indigo-600 hover:text-indigo-800 font-bold hover:underline cursor-pointer"
                          >
                            Preview →
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 1: Select Subject */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">1</span>
                <span>Select Teaching Subject</span>
              </h3>
              {assignedSubjects.length > 1 && (
                <span className="text-[11px] text-slate-400 font-medium">
                  {assignedSubjects.length} Assigned
                </span>
              )}
            </div>

            {/* Quick Mobile Dropdown if teacher wants fast 1-tap select on phones */}
            <div className="block sm:hidden">
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                aria-label="Select Assigned Teaching Subject"
                className="w-full px-3.5 py-2.5 text-xs font-bold bg-white border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 shadow-2xs text-indigo-950 cursor-pointer"
              >
                {assignedSubjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name} ({sub.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Subject Cards Grid (Finger-friendly on mobile, expanded on desktop) */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
              {assignedSubjects.map((sub) => {
                const isSelected = selectedSubjectId === sub.id;
                const count = resources.filter((r) => r.subjectId === sub.id).length;
                return (
                  <button
                    key={sub.id}
                    onClick={() => setSelectedSubjectId(sub.id)}
                    className={`p-3 sm:p-4 rounded-xl text-left border transition-all flex flex-col justify-between cursor-pointer min-h-[72px] sm:min-h-[88px] active:scale-[0.98] ${
                      isSelected
                        ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-300 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1 w-full">
                      <span className="text-[10px] sm:text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-100/80 text-indigo-700">
                        {sub.code}
                      </span>
                      <BookOpen
                        className={`w-4 h-4 shrink-0 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`}
                      />
                    </div>
                    <div className="mt-1.5">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1">{sub.name}</h4>
                      <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5">{count} Shared Materials</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Select Class */}
          {selectedSubject && (
            <div className="space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-bold">2</span>
                  <span>Select Class for {selectedSubject.name}</span>
                </h3>
                <span className="text-[11px] text-slate-400">
                  Showing {filteredClassesByStage.length} of {classes.length} classes
                </span>
              </div>

              {/* Mobile Stage Filter Tabs (Horizontal Scrollable Rail for easy thumb filtering) */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
                {[
                  { key: 'all', label: `All Classes (${classes.length})` },
                  { key: 'pre_primary', label: 'Pre-Primary' },
                  { key: 'primary', label: 'Primary (I-V)' },
                  { key: 'middle', label: 'Middle (VI-VIII)' },
                  { key: 'secondary', label: 'Secondary (IX-X)' },
                  { key: 'senior_secondary', label: 'Senior Sec (XI-XII)' },
                ].map((stg) => (
                  <button
                    key={stg.key}
                    type="button"
                    onClick={() => setClassStageFilter(stg.key as any)}
                    className={`px-3 py-1.5 rounded-lg font-bold shrink-0 transition-all cursor-pointer min-h-[34px] flex items-center justify-center ${
                      classStageFilter === stg.key
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {stg.label}
                  </button>
                ))}
              </div>

              {/* Class Buttons Grid */}
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {filteredClassesByStage.map((cls) => {
                  const isSelected = selectedClassId === cls.id;
                  const count = resources.filter(
                    (r) => r.subjectId === selectedSubjectId && r.classId === cls.id
                  ).length;
                  return (
                    <button
                      key={cls.id}
                      onClick={() => setSelectedClassId(cls.id)}
                      className={`px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 cursor-pointer min-h-[42px] active:scale-[0.98] ${
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
                        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap sm:flex-nowrap items-center justify-between gap-1.5">
                          <button
                            onClick={() => onPreviewResource(res)}
                            className="flex-1 sm:flex-initial px-3 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer min-h-[40px] active:scale-[0.98]"
                          >
                            <Eye className="w-4 h-4" /> <span>Preview</span>
                          </button>

                          <button
                            onClick={() => onDownload(res)}
                            className="flex-1 sm:flex-initial px-3 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer min-h-[40px] active:scale-[0.98]"
                            title="Download file"
                          >
                            <Download className="w-4 h-4" /> <span>Download</span>
                          </button>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => onOpenVersions(res)}
                              className="p-2 text-xs font-medium text-amber-700 hover:text-amber-900 rounded-xl hover:bg-amber-50 transition-colors flex items-center gap-1 cursor-pointer min-h-[40px] min-w-[40px] justify-center"
                              title="View revisions & changelog"
                            >
                              <History className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => onOpenCollaborate(res)}
                              className="px-2.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer min-h-[40px] flex items-center gap-1"
                              title="Collaborate and upload Version N+1"
                            >
                              + Version
                            </button>
                          </div>
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

          {/* Mobile Filter Toggle Button */}
          <div className="md:hidden">
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              className="w-full flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 font-bold text-xs text-slate-800 shadow-2xs cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
                <span>Search & Filter Materials</span>
                {(searchQuery || selectedClassId || selectedCategory !== 'all') && (
                  <span className="w-2 h-2 rounded-full bg-indigo-600" />
                )}
              </div>
              {mobileFiltersOpen ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>
          </div>

          {/* Filters Bar (Always visible on desktop, toggleable on mobile) */}
          <div
            className={`${
              mobileFiltersOpen ? 'block' : 'hidden'
            } md:block p-3.5 bg-white rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs`}
          >
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Search Term</label>
              <input
                type="text"
                placeholder="Topic, chapter, title, teacher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Subject</label>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white cursor-pointer"
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
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white cursor-pointer"
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
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white cursor-pointer"
              >
                <option value="all">All Categories</option>
                <option value="Study Material">Study Material</option>
                <option value="Assessment">Assessment</option>
                <option value="Practical">Practical</option>
                <option value="Teaching Resources">Teaching Resources</option>
              </select>
            </div>

            {(searchQuery || selectedClassId || selectedCategory !== 'all') && (
              <div className="sm:col-span-2 md:col-span-4 flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedClassId('');
                    setSelectedCategory('all');
                  }}
                  className="text-xs font-semibold text-indigo-600 hover:underline cursor-pointer"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>

          {/* MOBILE VIEW: Mobile Card Feed (Finger-Friendly, No Horizontal Scrolling) */}
          <div className="md:hidden space-y-3">
            {drilldownResources.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500">
                <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">No resources found matching filters.</p>
                <p className="text-[11px] text-slate-400 mt-1">Try resetting search filters or changing subject/class.</p>
              </div>
            ) : (
              drilldownResources.map((res) => {
                const isFav = bookmarkedIds.includes(res.id);
                return (
                  <div
                    key={res.id}
                    className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {res.subjectName}
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-50 text-amber-800 border border-amber-200">
                          {res.className}
                        </span>
                        <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-blue-50 text-blue-700">
                          v{res.currentVersion}
                        </span>
                      </div>
                      <BookmarkButton
                        isBookmarked={isFav}
                        onToggle={() => handleToggleBookmark(res)}
                        size="sm"
                        activeColor="amber"
                      />
                    </div>

                    <div onClick={() => onPreviewResource(res)} className="cursor-pointer">
                      <h4 className="text-sm font-bold text-slate-900 leading-snug hover:text-indigo-600 transition-colors">
                        {res.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Chapter: <strong className="text-slate-700">{res.chapter}</strong>
                        {res.topic && <span> • {res.topic}</span>}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                      <span className="truncate max-w-[180px]">
                        {res.branchName} • By {res.uploadedByName}
                      </span>
                      <div className="flex items-center gap-1">
                        <StarRatingBadge rating={res.averageRating} count={res.ratingsCount} showZero={false} />
                      </div>
                    </div>

                    {/* Touch Action Buttons for Mobile */}
                    <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                      <button
                        onClick={() => onPreviewResource(res)}
                        className="flex-1 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer min-h-[40px] active:scale-[0.98]"
                      >
                        <Eye className="w-4 h-4" /> <span>Preview</span>
                      </button>
                      <button
                        onClick={() => onDownload(res)}
                        className="flex-1 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer min-h-[40px] active:scale-[0.98]"
                      >
                        <Download className="w-4 h-4" /> <span>Download</span>
                      </button>
                      <button
                        onClick={() => onOpenCollaborate(res)}
                        className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer min-h-[40px] flex items-center justify-center"
                        title="Collaborate / Upload New Version"
                      >
                        + Version
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* DESKTOP VIEW: Data Table (Hidden on Mobile) */}
          <div className="hidden md:block bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
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
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-indigo-600/10 via-indigo-500/5 to-transparent border border-indigo-200/60">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20 shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  My Educational Contributions ({myUploads.length})
                </h3>
                <p className="text-xs text-slate-600">
                  Materials, assignments, question papers, and images uploaded under your account ({currentUser.fullName})
                </p>
              </div>
            </div>

            <button
              onClick={() => onOpenUpload(selectedSubjectId, selectedClassId)}
              className="px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Upload New Material</span>
            </button>
          </div>

          {myUploads.length === 0 ? (
            <div className="p-10 text-center bg-white rounded-2xl border border-dashed border-slate-300 space-y-4">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
                <Upload className="w-7 h-7" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h4 className="text-base font-bold text-slate-900">No Content Uploaded Yet</h4>
                <p className="text-xs text-slate-500">
                  You haven't uploaded any study materials, diagrams, images, or worksheets yet. Click the button below to publish your first resource to the DIPS network.
                </p>
              </div>
              <button
                onClick={() => onOpenUpload(selectedSubjectId, selectedClassId)}
                className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all inline-flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Upload First Resource</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {myUploads.map((res) => {
                const isFav = bookmarkedIds.includes(res.id);
                const isImage =
                  res.contentType === 'Images' ||
                  /\.(png|jpe?g|gif|webp|svg|bmp)(\?.*)?$/i.test(res.fileUrl) ||
                  /\.(png|jpe?g|gif|webp|svg|bmp)$/i.test(res.fileName);

                return (
                  <div
                    key={res.id}
                    className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      {/* Image Thumbnail Header if Image */}
                      {isImage && (
                        <div
                          onClick={() => onPreviewResource(res)}
                          className="w-full h-36 bg-slate-100 rounded-xl border border-slate-200 overflow-hidden cursor-pointer relative group"
                        >
                          <img
                            src={res.fileUrl}
                            alt={res.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                          <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                            <Eye className="w-4 h-4" /> Click to Preview
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {res.subjectName}
                          </span>
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-100 text-slate-700">
                            {res.className}
                          </span>
                          <span className="px-2 py-0.5 text-[10px] font-medium rounded bg-amber-50 text-amber-800 border border-amber-200">
                            {res.contentType}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-blue-50 text-blue-700 border border-blue-200">
                            v{res.currentVersion}
                          </span>
                          <BookmarkButton
                            isBookmarked={isFav}
                            onToggle={() => handleToggleBookmark(res)}
                            size="sm"
                            activeColor="amber"
                          />
                        </div>
                      </div>

                      <h4 className="text-base font-bold text-slate-900 leading-snug line-clamp-2">
                        {res.title}
                      </h4>

                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs space-y-1">
                        <div className="text-slate-700">
                          Chapter: <span className="font-semibold text-slate-900">{res.chapter}</span>
                        </div>
                        <div className="text-slate-700 truncate">
                          Topic: <span className="font-semibold text-slate-900">{res.topic}</span>
                        </div>
                      </div>

                      {res.description && (
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {res.description}
                        </p>
                      )}

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                        <span>Uploaded: {new Date(res.createdAt).toLocaleDateString()}</span>
                        <span>{res.downloadsCount || 0} Downloads</span>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-1.5">
                      <button
                        onClick={() => onPreviewResource(res)}
                        className="px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" /> Preview
                      </button>

                      <button
                        onClick={() => onOpenVersions(res)}
                        className="px-2.5 py-1.5 text-xs font-medium text-amber-700 hover:text-amber-900 hover:bg-amber-50 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <History className="w-3.5 h-3.5" /> Revisions ({res.versions?.length || 1})
                      </button>

                      <button
                        onClick={() => onDownload(res)}
                        className="p-1.5 text-slate-600 hover:text-indigo-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                        title="Download file"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteResource(res)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete resource (if uploaded by mistake)"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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

      {/* 5.5 CROSS-BRANCH TEACHER DISCUSSION CHAT */}
      {activeTab === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar: Channels & Branch Info */}
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Discussion Channels</h3>
                <p className="text-[11px] text-slate-500">Real-time collaboration across all 21 DIPS campuses</p>
              </div>

              <div className="space-y-1">
                {[
                  { id: 'general', name: '🌐 General Collaboration', desc: 'General faculty discussions' },
                  { id: 'syllabus', name: '📚 Syllabus & Lesson Plans', desc: 'Curriculum & pacing guides' },
                  { id: 'assessments', name: '📝 Question Banks & Exams', desc: 'Mid-terms & sample papers' },
                  { id: 'labs', name: '🔬 Science & STEM Labs', desc: 'Practical manuals & kits' },
                ].map((ch) => (
                  <button
                    key={ch.id}
                    onClick={() => setChatChannel(ch.id as any)}
                    className={`w-full text-left p-3 rounded-xl transition-all cursor-pointer ${
                      chatChannel === ch.id
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold">{ch.name}</div>
                    <div className={`text-[10px] ${chatChannel === ch.id ? 'text-indigo-100' : 'text-slate-400'}`}>
                      {ch.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 text-xs text-indigo-900 space-y-2">
              <div className="font-bold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Cross-Branch Sync Active</span>
              </div>
              <p className="text-[11px] text-indigo-700 leading-relaxed">
                Messages update instantly across all active DIPS branch teacher portals. You can attach any shared resource directly to your message for peer review.
              </p>
            </div>
          </div>

          {/* Right Main Chat Panel */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[650px]">
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                  {chatChannel === 'general' ? '🌐' : chatChannel === 'syllabus' ? '📚' : chatChannel === 'assessments' ? '📝' : '🔬'}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 capitalize">
                    {chatChannel === 'general' && 'General Collaboration Channel'}
                    {chatChannel === 'syllabus' && 'Syllabus & Lesson Plans Discussion'}
                    {chatChannel === 'assessments' && 'Question Banks & Assessments Hub'}
                    {chatChannel === 'labs' && 'Science & STEM Labs Forum'}
                  </h4>
                  <p className="text-[11px] text-slate-500">Connected with educators across 21 DIPS campuses</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full font-medium border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live Feed</span>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/30">
              {chatMessages
                .filter((m) => m.channelId === chatChannel)
                .map((msg) => {
                  const isSelf = msg.senderId === currentUser.id;
                  return (
                    <div key={msg.id} className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'} space-y-1`}>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 px-1">
                        <span className="font-bold text-slate-800">{msg.senderName}</span>
                        {msg.senderBranchName && (
                          <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px]">
                            {msg.senderBranchName}
                          </span>
                        )}
                        <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>

                      <div
                        className={`max-w-xl p-4 rounded-2xl text-xs leading-relaxed shadow-xs ${
                          isSelf
                            ? 'bg-indigo-600 text-white rounded-tr-xs'
                            : 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs'
                        }`}
                      >
                        <p>{msg.content}</p>

                        {msg.attachedResourceTitle && (
                          <div className={`mt-2.5 p-2.5 rounded-xl border flex items-center gap-2 text-[11px] ${
                            isSelf ? 'bg-indigo-700/60 border-indigo-500 text-white' : 'bg-slate-50 border-slate-200 text-slate-700'
                          }`}>
                            <BookOpen className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                            <div className="truncate font-semibold">Attached Resource: {msg.attachedResourceTitle}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Chat Input Bar */}
            <form onSubmit={handleSendChatMessage} className="p-4 border-t border-slate-200 bg-white rounded-b-2xl space-y-3">
              {selectedAttachmentId && (
                <div className="flex items-center justify-between bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-xl text-xs text-indigo-900">
                  <div className="flex items-center gap-2 truncate">
                    <BookOpen className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Attached: <strong>{resources.find(r => r.id === selectedAttachmentId)?.title}</strong></span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedAttachmentId('')}
                    className="text-indigo-600 hover:text-indigo-800 text-[11px] font-bold cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2">
                <select
                  value={selectedAttachmentId}
                  onChange={(e) => setSelectedAttachmentId(e.target.value)}
                  className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-700 max-w-[220px] truncate"
                >
                  <option value="">📎 Attach Subject Resource...</option>
                  {accessibleResources.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.subjectName} - {r.title}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Type a message to teachers across all 21 branches..."
                  className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

                <button
                  type="submit"
                  disabled={!chatInput.trim()}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <span>Send</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. PROFILE & ASSIGNED SUBJECTS / CLASSES MANAGEMENT */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-600/10 via-indigo-500/5 to-transparent border border-indigo-200/60 flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900">Faculty Profile & Curriculum Assignments</h3>
              <p className="text-xs text-slate-600">
                Update your personal details, edit assigned subjects, assign academic classes, or add brand new subjects and classes to DIPS Central.
              </p>
            </div>
            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-200">
              {currentUser.employeeId} • {currentUser.branchName}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Edit Profile & Assignments Form (2 columns) */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
              <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <span>Edit Profile & Curriculum Scope</span>
              </h4>

              {profileMsg && (
                <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-lg border border-emerald-200 font-medium">
                  {profileMsg}
                </div>
              )}
              {profileError && (
                <div className="p-3 bg-rose-50 text-rose-800 text-xs rounded-lg border border-rose-200 font-medium">
                  {profileError}
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={profileFullName}
                      onChange={(e) => setProfileFullName(e.target.value)}
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Designation / Role Title</label>
                  <input
                    type="text"
                    value={profileDesignation}
                    onChange={(e) => setProfileDesignation(e.target.value)}
                    placeholder="Senior PGT Mathematics Teacher"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                {/* Assigned Subjects Selection & Add Subject */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-800">Edit Assigned Subjects</label>
                    <span className="text-[11px] text-slate-400">Select subjects you teach</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
                    {subjects.map((sub) => {
                      const isAssigned = assignedSubjectIds.includes(sub.id);
                      return (
                        <label
                          key={sub.id}
                          className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                            isAssigned ? 'bg-indigo-50 border border-indigo-200 text-indigo-900 font-semibold' : 'bg-white border border-slate-100 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isAssigned}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setAssignedSubjectIds([...assignedSubjectIds, sub.id]);
                              } else {
                                setAssignedSubjectIds(assignedSubjectIds.filter((id) => id !== sub.id));
                              }
                            }}
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="truncate">{sub.name}</span>
                        </label>
                      );
                    })}
                  </div>

                  {/* Add New Subject */}
                  <div className="flex gap-2 pt-2">
                    <input
                      type="text"
                      placeholder="Add brand new subject (e.g. Artificial Intelligence)..."
                      value={newSubjectInput}
                      onChange={(e) => setNewSubjectInput(e.target.value)}
                      className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleCreateAndAssignSubject}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg text-xs shrink-0 cursor-pointer"
                    >
                      + Add Subject
                    </button>
                  </div>
                </div>

                {/* Assigned Classes Selection & Add Class */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-800">Edit Assigned Classes</label>
                    <span className="text-[11px] text-slate-400">Select classes you teach</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-36 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
                    {classes.map((cls) => {
                      const isAssigned = assignedClassIds.includes(cls.id);
                      return (
                        <label
                          key={cls.id}
                          className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                            isAssigned ? 'bg-emerald-50 border border-emerald-200 text-emerald-900 font-semibold' : 'bg-white border border-slate-100 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isAssigned}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setAssignedClassIds([...assignedClassIds, cls.id]);
                              } else {
                                setAssignedClassIds(assignedClassIds.filter((id) => id !== cls.id));
                              }
                            }}
                            className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                          />
                          <span className="truncate">{cls.name}</span>
                        </label>
                      );
                    })}
                  </div>

                  {/* Add New Class */}
                  <div className="flex gap-2 pt-2">
                    <input
                      type="text"
                      placeholder="Add brand new class (e.g. Class 12-B)..."
                      value={newClassInput}
                      onChange={(e) => setNewClassInput(e.target.value)}
                      className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleCreateAndAssignClass}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg text-xs shrink-0 cursor-pointer"
                    >
                      + Add Class
                    </button>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={isUpdatingProfile}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {isUpdatingProfile ? 'Saving Changes...' : 'Save Profile & Assignments'}
                  </button>
                </div>
              </form>
            </div>

            {/* Change Password Card (1 column) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 self-start">
              <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">Change Account Password</h4>
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
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Update Password
                </button>
              </form>
            </div>
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

      {/* =========================================================
          MOBILE BOTTOM NAVIGATION DOCK (VISIBLE ON PHONES ONLY)
          Provides quick, 1-tap thumb navigation for teachers
          ========================================================= */}
      <div className="md:hidden fixed bottom-0 inset-x-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 text-white z-40 px-2 py-1.5 shadow-2xl safe-area-pb">
        <div className="flex items-center justify-around relative max-w-lg mx-auto">
          {/* 1. Explorer */}
          <button
            onClick={() => {
              setActiveTab('navigator');
              setShowMobileMoreMenu(false);
            }}
            className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-colors cursor-pointer min-w-[54px] min-h-[46px] ${
              activeTab === 'navigator' ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Curriculum</span>
          </button>

          {/* 2. Library */}
          <button
            onClick={() => {
              setActiveTab('library');
              setShowMobileMoreMenu(false);
            }}
            className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-colors cursor-pointer min-w-[54px] min-h-[46px] ${
              activeTab === 'library' ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FolderGit2 className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Library</span>
          </button>

          {/* 3. Elevated Upload FAB in the Center */}
          <button
            onClick={() => {
              setShowMobileMoreMenu(false);
              onOpenUpload(selectedSubjectId, selectedClassId);
            }}
            className="flex flex-col items-center justify-center -mt-5 bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white rounded-full w-12 h-12 shadow-lg shadow-indigo-600/50 ring-4 ring-slate-900 active:scale-95 transition-transform cursor-pointer"
            title="Upload New Educational Resource"
          >
            <Upload className="w-5 h-5" />
            <span className="sr-only">Upload</span>
          </button>

          {/* 4. Saved / Favorites */}
          <button
            onClick={() => {
              setActiveTab('favorites');
              setShowMobileMoreMenu(false);
            }}
            className={`relative flex flex-col items-center justify-center p-1.5 rounded-xl transition-colors cursor-pointer min-w-[54px] min-h-[46px] ${
              activeTab === 'favorites' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bookmark className={`w-5 h-5 ${activeTab === 'favorites' ? 'fill-amber-400' : ''}`} />
            <span className="text-[10px] mt-0.5">Saved</span>
            {favoriteResources.length > 0 && (
              <span className="absolute top-1 right-2 w-4 h-4 bg-amber-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-1 ring-slate-900">
                {favoriteResources.length > 9 ? '9+' : favoriteResources.length}
              </span>
            )}
          </button>

          {/* 5. Chat */}
          <button
            onClick={() => {
              setActiveTab('chat');
              setShowMobileMoreMenu(false);
            }}
            className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-colors cursor-pointer min-w-[54px] min-h-[46px] ${
              activeTab === 'chat' ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Chat</span>
          </button>

          {/* 6. More (Uploads, Announcements, Profile) */}
          <button
            onClick={() => setShowMobileMoreMenu(!showMobileMoreMenu)}
            className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-colors cursor-pointer min-w-[54px] min-h-[46px] ${
              activeTab === 'my_uploads' || activeTab === 'announcements' || activeTab === 'profile'
                ? 'text-indigo-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Menu className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">More</span>
          </button>
        </div>

        {/* Mobile "More" Drawer Popover */}
        {showMobileMoreMenu && (
          <div className="absolute bottom-full left-3 right-3 mb-2 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-2.5 shadow-2xl space-y-1 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-800 text-[11px] text-slate-400 font-bold uppercase tracking-wider">
              <span>Faculty Options</span>
              <button onClick={() => setShowMobileMoreMenu(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <button
              onClick={() => {
                setActiveTab('my_uploads');
                setShowMobileMoreMenu(false);
              }}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 text-left text-xs font-semibold text-slate-200 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>My Contributions ({myUploads.length})</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('announcements');
                setShowMobileMoreMenu(false);
              }}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 text-left text-xs font-semibold text-slate-200 cursor-pointer"
            >
              <Users className="w-4 h-4 text-indigo-400" />
              <span>School Announcements ({announcements.length})</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('profile');
                setShowMobileMoreMenu(false);
              }}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 text-left text-xs font-semibold text-slate-200 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>Faculty Profile & Subject Assignment</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
