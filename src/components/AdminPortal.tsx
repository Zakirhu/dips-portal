import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Building2,
  Users,
  GraduationCap,
  BookOpen,
  Layers,
  FileCheck,
  History,
  Megaphone,
  Settings,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit,
  Eye,
  Download,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  HardDrive,
  Activity,
  Calendar,
  Lock,
  UserCheck,
  UserX,
  CheckSquare,
  X,
  Database,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';
import type {
  User,
  Branch,
  AcademicClass,
  Subject,
  Resource,
  Announcement,
  ActivityLog,
  AdminStats,
  SystemSettings,
} from '../types.js';
import { api } from '../lib/api.js';

interface AdminPortalProps {
  currentUser: User;
  onPreviewResource: (resource: Resource) => void;
  onViewVersions: (resource: Resource) => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  currentUser,
  onPreviewResource,
  onViewVersions,
}) => {
  const [activeTab, setActiveTab] = useState<
    | 'dashboard'
    | 'branches'
    | 'teachers'
    | 'students'
    | 'classes_subjects'
    | 'content'
    | 'approvals'
    | 'announcements'
    | 'activity_logs'
    | 'settings'
  >('dashboard');

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [classes, setClasses] = useState<AcademicClass[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState('');

  // Modals & form state
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [branchForm, setBranchForm] = useState({
    name: '',
    code: '',
    city: '',
    address: '',
    phone: '',
    principalName: '',
    establishedYear: 2010,
  });

  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<User | null>(null);
  const [teacherForm, setTeacherForm] = useState({
    fullName: '',
    employeeId: '',
    email: '',
    phone: '',
    branchId: '',
    designation: 'TGT Teacher',
    assignedSubjectIds: [] as string[],
    assignedClassIds: [] as string[],
    initialPassword: '',
  });

  const [showStudentModal, setShowStudentModal] = useState(false);
  const [studentForm, setStudentForm] = useState({
    fullName: '',
    admissionNo: '',
    email: '',
    phone: '',
    branchId: '',
    classId: '',
    section: 'A',
    rollNo: '01',
    initialPassword: '',
  });

  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    content: '',
    priority: 'normal' as 'low' | 'normal' | 'high' | 'urgent',
    targetBranchId: '',
    targetRole: 'all' as any,
  });

  // Class & Subject Management state
  const [showClassModal, setShowClassModal] = useState(false);
  const [editingClass, setEditingClass] = useState<AcademicClass | null>(null);
  const [classForm, setClassForm] = useState({
    name: '',
    code: '',
    order: 1,
    sections: 'A, B',
  });

  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [subjectForm, setSubjectForm] = useState({
    name: '',
    code: '',
    department: 'General',
    applicableClasses: [] as string[],
    description: '',
  });

  // Direct Teacher Subject & Class Assignment state
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assigningTeacher, setAssigningTeacher] = useState<User | null>(null);
  const [assignForm, setAssignForm] = useState({
    assignedSubjectIds: [] as string[],
    assignedClassIds: [] as string[],
  });

  // Filters for content & logs
  const [contentFilter, setContentFilter] = useState({
    search: '',
    subjectId: 'all',
    classId: 'all',
    branchId: 'all',
    status: 'all',
  });

  const [logFilter, setLogFilter] = useState({
    search: '',
    action: 'all',
    branchName: 'all',
  });

  // Supabase Backend Integration state
  const [supabaseStatus, setSupabaseStatus] = useState<{
    connected: boolean;
    status: number | string;
    projectId: string;
    url: string;
    latencyMs: number;
    message: string;
    tablesDetected: string[];
    maskedKey: string;
    sqlSchema: string;
  } | null>(null);
  const [testingSupabase, setTestingSupabase] = useState(false);
  const [syncingSupabase, setSyncingSupabase] = useState(false);
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [
        statsRes,
        branchesRes,
        teachersRes,
        studentsRes,
        classesRes,
        subjectsRes,
        resourcesRes,
        announcementsRes,
        logsRes,
        settingsRes,
        supabaseRes,
      ] = await Promise.all([
        api.getAdminStats(),
        api.getBranches(),
        api.getTeachers(),
        api.getStudents(),
        api.getClasses(),
        api.getSubjects(),
        api.getResources(),
        api.getAnnouncements(),
        api.getActivityLogs(),
        api.getSettings(),
        api.getSupabaseStatus().catch(() => null),
      ]);

      setStats(statsRes.stats);
      setBranches(branchesRes.branches);
      setTeachers(teachersRes.teachers);
      setStudents(studentsRes.students);
      setClasses(classesRes.classes);
      setSubjects(subjectsRes.subjects);
      setResources(resourcesRes.resources);
      setAnnouncements(announcementsRes.announcements);
      setActivityLogs(logsRes.logs);
      setSettings(settingsRes.settings);
      if (supabaseRes) {
        setSupabaseStatus(supabaseRes);
      }
    } catch (err: any) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTestSupabase = async () => {
    setTestingSupabase(true);
    try {
      const res = await api.getSupabaseStatus();
      setSupabaseStatus(res);
      if (res.connected) {
        showToast(`Supabase online! Latency: ${res.latencyMs}ms (${res.tablesDetected.length} tables verified)`);
      } else {
        showToast(`Supabase status: ${res.message}`);
      }
    } catch (e: any) {
      showToast(`Supabase test failed: ${e.message}`);
    } finally {
      setTestingSupabase(false);
    }
  };

  const handleSyncSupabase = async () => {
    setSyncingSupabase(true);
    try {
      const res = await api.syncSupabase();
      showToast(res.message);
      handleTestSupabase();
    } catch (e: any) {
      alert(`Supabase sync error: ${e.message}`);
    } finally {
      setSyncingSupabase(false);
    }
  };

  const handleCopySql = () => {
    if (!supabaseStatus?.sqlSchema) return;
    navigator.clipboard.writeText(supabaseStatus.sqlSchema);
    setCopiedSql(true);
    showToast('Supabase SQL schema copied to clipboard!');
    setTimeout(() => setCopiedSql(false), 3000);
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const showToast = (msg: string) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(''), 4000);
  };

  // Branch CRUD
  const handleSaveBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBranch) {
        await api.updateBranch(editingBranch.id, branchForm);
        showToast(`Branch ${branchForm.name} updated.`);
      } else {
        await api.createBranch(branchForm);
        showToast(`Branch ${branchForm.name} added.`);
      }
      setShowBranchModal(false);
      setEditingBranch(null);
      loadAllData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteBranch = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete branch "${name}"?`)) return;
    try {
      await api.deleteBranch(id);
      showToast(`Branch "${name}" deleted.`);
      loadAllData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Teacher CRUD
  const handleSaveTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTeacher) {
        await api.updateTeacher(editingTeacher.id, teacherForm);
        showToast(`Teacher ${teacherForm.fullName} updated.`);
      } else {
        await api.createTeacher(teacherForm);
        showToast(`Teacher ${teacherForm.fullName} registered.`);
      }
      setShowTeacherModal(false);
      setEditingTeacher(null);
      loadAllData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteTeacher = async (id: string, name: string) => {
    if (!confirm(`Delete teacher account for "${name}"?`)) return;
    try {
      await api.deleteTeacher(id);
      showToast(`Teacher "${name}" removed.`);
      loadAllData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Student CRUD
  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createStudent(studentForm);
      showToast(`Student ${studentForm.fullName} enrolled.`);
      setShowStudentModal(false);
      loadAllData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleToggleUserStatus = async (id: string, name: string) => {
    try {
      const res = await api.toggleUserStatus(id);
      showToast(`Account for ${name} is now ${res.isActive ? 'Active' : 'Deactivated'}.`);
      loadAllData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleResetPassword = async (id: string, name: string) => {
    try {
      const res = await api.resetUserPassword(id);
      showToast(res.message);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Class Management
  const handleSaveClass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parsedSections = classForm.sections
        .split(',')
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean);

      const payload = {
        name: classForm.name.trim(),
        code: classForm.code.trim().toUpperCase(),
        order: Number(classForm.order) || 1,
        sections: parsedSections.length > 0 ? parsedSections : ['A', 'B'],
      };

      if (editingClass) {
        await api.updateClass(editingClass.id, payload);
        showToast(`Class "${payload.name}" updated successfully.`);
      } else {
        await api.createClass(payload);
        showToast(`Class "${payload.name}" created successfully.`);
      }
      setShowClassModal(false);
      setEditingClass(null);
      loadAllData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteClass = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete class "${name}"?`)) return;
    try {
      await api.deleteClass(id);
      showToast(`Class "${name}" deleted.`);
      loadAllData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Subject Management
  const handleSaveSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: subjectForm.name.trim(),
        code: subjectForm.code.trim().toUpperCase(),
        department: subjectForm.department.trim() || 'General',
        applicableClasses: subjectForm.applicableClasses,
        description: subjectForm.description.trim(),
      };

      if (editingSubject) {
        await api.updateSubject(editingSubject.id, payload);
        showToast(`Subject "${payload.name}" updated successfully.`);
      } else {
        await api.createSubject(payload);
        showToast(`Subject "${payload.name}" created successfully.`);
      }
      setShowSubjectModal(false);
      setEditingSubject(null);
      loadAllData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteSubject = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete subject "${name}"?`)) return;
    try {
      await api.deleteSubject(id);
      showToast(`Subject "${name}" deleted.`);
      loadAllData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Quick Direct Assignment for Teacher
  const handleOpenAssignModal = (teacher: User) => {
    setAssigningTeacher(teacher);
    setAssignForm({
      assignedSubjectIds: teacher.assignedSubjectIds ? [...teacher.assignedSubjectIds] : [],
      assignedClassIds: teacher.assignedClassIds ? [...teacher.assignedClassIds] : [],
    });
    setShowAssignModal(true);
  };

  const handleSaveAssignments = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningTeacher) return;
    try {
      await api.updateTeacher(assigningTeacher.id, {
        assignedSubjectIds: assignForm.assignedSubjectIds,
        assignedClassIds: assignForm.assignedClassIds,
      });
      showToast(
        `Updated subjects & classes for ${assigningTeacher.fullName} (${assignForm.assignedSubjectIds.length} subjects, ${assignForm.assignedClassIds.length} classes).`
      );
      setShowAssignModal(false);
      setAssigningTeacher(null);
      loadAllData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Resource Actions
  const handleApproveReject = async (id: string, status: 'published' | 'rejected') => {
    const remarks = prompt(
      status === 'published' ? 'Optional approval remarks:' : 'Reason for rejection:'
    );
    try {
      await api.updateResourceStatus(id, status, remarks || undefined);
      showToast(`Resource ${status === 'published' ? 'Approved' : 'Rejected'}.`);
      loadAllData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteResource = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to permanently remove "${title}"?`)) return;
    try {
      await api.deleteResource(id);
      showToast(`Resource deleted.`);
      loadAllData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Announcement Actions
  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createAnnouncement(announcementForm);
      showToast('Announcement broadcasted to portal.');
      setShowAnnouncementModal(false);
      loadAllData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Settings Actions
  const handleToggleDirectPublishing = async (direct: boolean) => {
    try {
      await api.updateSettings({ directPublishing: direct });
      setSettings((prev) => (prev ? { ...prev, directPublishing: direct } : null));
      showToast(`Content publishing mode set to: ${direct ? 'Direct Publishing' : 'Approval Required'}.`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Toast Notification */}
      {notificationMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-700 text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* Admin Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-white p-1 flex items-center justify-center shadow-xs border border-slate-200 shrink-0">
            <img
              src="/dips-logo.png"
              alt="DIPS Institutions Logo"
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 text-xs font-bold rounded-md bg-amber-100 text-amber-900 border border-amber-300">
                Super Admin Control
              </span>
              <span className="text-xs text-slate-500">Central Directorate Portal</span>
              <span className="text-slate-300">•</span>
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-2 py-0.5 text-xs font-semibold rounded-md border flex items-center gap-1.5 transition-all ${
                  supabaseStatus?.connected
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                }`}
                title="Click to view Supabase backend configuration in Settings"
              >
                <Database className="w-3 h-3 text-emerald-600" />
                <span>Supabase: {supabaseStatus?.connected ? 'Connected' : 'Configured'}</span>
              </button>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
              DIPS Institutional Management & Content Governance
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={loadAllData}
            disabled={loading}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => {
              setBranchForm({
                name: '',
                code: '',
                city: '',
                address: '',
                phone: '',
                principalName: '',
                establishedYear: 2026,
              });
              setEditingBranch(null);
              setShowBranchModal(true);
            }}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Add Branch
          </button>
          <button
            onClick={() => {
              setTeacherForm({
                fullName: '',
                employeeId: '',
                email: '',
                phone: '',
                branchId: branches[0]?.id || '',
                designation: 'PGT Teacher',
                assignedSubjectIds: [subjects[0]?.id || ''],
                assignedClassIds: [classes[0]?.id || ''],
                initialPassword: 'teacher123',
              });
              setEditingTeacher(null);
              setShowTeacherModal(true);
            }}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Add Teacher
          </button>
          <button
            onClick={() => {
              setStudentForm({
                fullName: '',
                admissionNo: `DIPS-2026-${Math.floor(100 + Math.random() * 900)}`,
                email: '',
                phone: '',
                branchId: branches[0]?.id || '',
                classId: classes[0]?.id || '',
                section: 'A',
                rollNo: '01',
                initialPassword: 'student123',
              });
              setShowStudentModal(true);
            }}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Enroll Student
          </button>
        </div>
      </div>

      {/* Admin Navigation Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold border-b border-slate-200">
        {[
          { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
          { id: 'branches', label: `Branches (${branches.length})`, icon: Building2 },
          { id: 'teachers', label: `Faculty (${teachers.length})`, icon: Users },
          { id: 'students', label: `Students (${students.length})`, icon: GraduationCap },
          { id: 'classes_subjects', label: 'Classes & Subjects', icon: Layers },
          { id: 'content', label: `Content Repository (${resources.length})`, icon: BookOpen },
          {
            id: 'approvals',
            label: `Approval Queue (${resources.filter((r) => r.status === 'pending_approval').length})`,
            icon: FileCheck,
          },
          { id: 'announcements', label: 'Announcements', icon: Megaphone },
          { id: 'activity_logs', label: 'Activity Logs', icon: History },
          { id: 'settings', label: 'Portal Settings', icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-2 whitespace-nowrap ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. DASHBOARD OVERVIEW */}
      {activeTab === 'dashboard' && stats && (
        <div className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="text-xs font-medium text-slate-500 block">Total DIPS Branches</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-black text-slate-900">{stats.totalBranches}</span>
                <Building2 className="w-5 h-5 text-indigo-500" />
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">Begowal, Jalandhar, etc.</span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="text-xs font-medium text-slate-500 block">Faculty & Teachers</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-black text-slate-900">{stats.totalTeachers}</span>
                <Users className="w-5 h-5 text-indigo-500" />
              </div>
              <span className="text-[11px] text-emerald-600 mt-1 block">Cross-branch sharing active</span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="text-xs font-medium text-slate-500 block">Enrolled Students</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-black text-slate-900">{stats.totalStudents}</span>
                <GraduationCap className="w-5 h-5 text-emerald-500" />
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">Class VI to XII</span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="text-xs font-medium text-slate-500 block">Shared Resources</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-black text-slate-900">{stats.totalResources}</span>
                <BookOpen className="w-5 h-5 text-amber-500" />
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">Multi-version verified</span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="text-xs font-medium text-slate-500 block">Storage Usage</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-black text-slate-900">
                  {(stats.storageUsageBytes / (1024 * 1024)).toFixed(1)} MB
                </span>
                <HardDrive className="w-5 h-5 text-blue-500" />
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">Cloud file repository</span>
            </div>
          </div>

          {/* Pending Approval Banner if any */}
          {stats.pendingApprovals > 0 && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-amber-900">
                    {stats.pendingApprovals} Content Submissions Awaiting Approval
                  </h4>
                  <p className="text-xs text-amber-700">
                    Review incoming educational notes and assignments before publishing to students.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('approvals')}
                className="px-3 py-1.5 text-xs font-bold text-amber-900 bg-amber-200/70 hover:bg-amber-200 rounded-lg transition-colors"
              >
                Review Queue →
              </button>
            </div>
          )}

          {/* Dual columns: Recently Uploaded & Recently Updated */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recently Uploaded */}
            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-600" /> Recently Uploaded Content
                </h3>
                <button
                  onClick={() => setActiveTab('content')}
                  className="text-xs font-medium text-indigo-600 hover:underline"
                >
                  View all
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {stats.recentlyUploaded.map((r) => (
                  <div key={r.id} className="py-3 flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 leading-snug">{r.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {r.subjectName} • {r.className} • By {r.uploadedByName} ({r.branchName})
                      </p>
                    </div>
                    <button
                      onClick={() => onPreviewResource(r)}
                      className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-md border border-slate-200 shrink-0"
                    >
                      Preview
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Recently Updated with Version History */}
            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <History className="w-4 h-4 text-amber-600" /> Collaborative Subject Updates (Version Logs)
                </h3>
                <button
                  onClick={() => setActiveTab('content')}
                  className="text-xs font-medium text-amber-700 hover:underline"
                >
                  View all
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {stats.recentlyUpdated.map((r) => (
                  <div key={r.id} className="py-3 flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.2 text-[10px] font-bold rounded bg-blue-100 text-blue-800">
                          v{r.currentVersion}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 leading-snug">{r.title}</h4>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Last improved by {r.lastUpdatedByName} ({r.lastUpdatedByBranch})
                      </p>
                    </div>
                    <button
                      onClick={() => onViewVersions(r)}
                      className="px-2.5 py-1 text-xs font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-md border border-amber-200 shrink-0 flex items-center gap-1"
                    >
                      <History className="w-3 h-3" /> History
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. BRANCHES MANAGEMENT */}
      {activeTab === 'branches' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">DIPS Institutional Branches</h3>
              <p className="text-xs text-slate-500">Centralized directory of campuses connected to the portal</p>
            </div>
            <button
              onClick={() => {
                setBranchForm({
                  name: '',
                  code: '',
                  city: '',
                  address: '',
                  phone: '',
                  principalName: '',
                  establishedYear: 2026,
                });
                setEditingBranch(null);
                setShowBranchModal(true);
              }}
              className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Add Campus
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {branches.map((b) => (
              <div key={b.id} className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                      Code: {b.code}
                    </span>
                    <h4 className="text-base font-bold text-slate-900 mt-1">{b.name}</h4>
                    <p className="text-xs text-slate-500">{b.city}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingBranch(b);
                        setBranchForm({
                          name: b.name,
                          code: b.code,
                          city: b.city,
                          address: b.address,
                          phone: b.phone,
                          principalName: b.principalName,
                          establishedYear: b.establishedYear,
                        });
                        setShowBranchModal(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100"
                      title="Edit Branch"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteBranch(b.id, b.name)}
                      className="p-1.5 text-rose-400 hover:text-rose-600 rounded-md hover:bg-rose-50"
                      title="Delete Branch"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs space-y-1">
                  <div className="flex justify-between text-slate-600">
                    <span>Principal:</span>
                    <span className="font-semibold text-slate-900">{b.principalName || 'Appointed Head'}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Helpline:</span>
                    <span className="font-mono text-slate-700">{b.phone}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Est. Year:</span>
                    <span>{b.establishedYear}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-600">
                  <span>
                    Faculty: <strong>{b.totalTeachers || 0}</strong>
                  </span>
                  <span>
                    Students: <strong>{b.totalStudents || 0}</strong>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. FACULTY & TEACHERS */}
      {activeTab === 'teachers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Faculty & Subject Teachers</h3>
              <p className="text-xs text-slate-500">
                Manage accounts, assigned subjects, and cross-branch sharing permissions
              </p>
            </div>
            <button
              onClick={() => {
                setTeacherForm({
                  fullName: '',
                  employeeId: '',
                  email: '',
                  phone: '',
                  branchId: branches[0]?.id || '',
                  designation: 'TGT Teacher',
                  assignedSubjectIds: [subjects[0]?.id || ''],
                  assignedClassIds: [classes[0]?.id || ''],
                  initialPassword: 'teacher123',
                });
                setEditingTeacher(null);
                setShowTeacherModal(true);
              }}
              className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Register Teacher
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Employee ID & Name</th>
                    <th className="p-3.5">Campus Branch</th>
                    <th className="p-3.5">Designation</th>
                    <th className="p-3.5">Assigned Subjects</th>
                    <th className="p-3.5">Assigned Classes</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {teachers.map((t) => {
                    const assignedSubs = subjects.filter((s) => t.assignedSubjectIds?.includes(s.id));
                    const assignedCls = classes.filter((c) => t.assignedClassIds?.includes(c.id));
                    return (
                      <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-3.5">
                          <div className="font-bold text-slate-900">{t.fullName}</div>
                          <div className="text-slate-400 font-mono text-[11px]">{t.employeeId}</div>
                        </td>
                        <td className="p-3.5 text-slate-700 font-medium">{t.branchName}</td>
                        <td className="p-3.5 text-slate-600">{t.designation || 'Faculty'}</td>
                        <td className="p-3.5">
                          {assignedSubs.length === 0 ? (
                            <button
                              onClick={() => handleOpenAssignModal(t)}
                              className="text-[10px] text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded px-1.5 py-0.5 inline-flex items-center gap-1 font-semibold"
                            >
                              <Plus className="w-2.5 h-2.5" /> Assign Subject
                            </button>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {assignedSubs.map((s) => (
                                <span
                                  key={s.id}
                                  className="px-2 py-0.5 text-[10px] font-semibold rounded bg-indigo-50 text-indigo-700 border border-indigo-200"
                                >
                                  {s.name}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="p-3.5">
                          {assignedCls.length === 0 ? (
                            <button
                              onClick={() => handleOpenAssignModal(t)}
                              className="text-[10px] text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded px-1.5 py-0.5 inline-flex items-center gap-1 font-semibold"
                            >
                              <Plus className="w-2.5 h-2.5" /> Assign Class
                            </button>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {assignedCls.map((c) => (
                                <span
                                  key={c.id}
                                  className="px-1.5 py-0.2 text-[10px] font-medium rounded bg-slate-100 text-slate-700"
                                >
                                  {c.code}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                              t.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {t.isActive ? 'Active' : 'Suspended'}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenAssignModal(t)}
                              className="px-2 py-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md border border-indigo-200 flex items-center gap-1 transition-all"
                              title="Assign or modify subjects and classes for this teacher"
                            >
                              <BookOpen className="w-3 h-3 text-indigo-600" />
                              <span>Assign Subjects & Classes</span>
                            </button>
                            <button
                              onClick={() => handleToggleUserStatus(t.id, t.fullName)}
                              className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100"
                              title={t.isActive ? 'Deactivate account' : 'Activate account'}
                            >
                              {t.isActive ? <UserX className="w-3.5 h-3.5 text-amber-600" /> : <UserCheck className="w-3.5 h-3.5 text-emerald-600" />}
                            </button>
                            <button
                              onClick={() => handleResetPassword(t.id, t.fullName)}
                              className="p-1 text-slate-400 hover:text-indigo-600 rounded hover:bg-slate-100"
                              title="Reset Password to teacher123"
                            >
                              <Lock className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingTeacher(t);
                                setTeacherForm({
                                  fullName: t.fullName,
                                  employeeId: t.employeeId || '',
                                  email: t.email,
                                  phone: t.phone || '',
                                  branchId: t.branchId,
                                  designation: t.designation || 'TGT Teacher',
                                  assignedSubjectIds: t.assignedSubjectIds || [],
                                  assignedClassIds: t.assignedClassIds || [],
                                  initialPassword: '',
                                });
                                setShowTeacherModal(true);
                              }}
                              className="p-1 text-slate-400 hover:text-indigo-600 rounded hover:bg-slate-100"
                              title="Edit Details & Assignments"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteTeacher(t.id, t.fullName)}
                              className="p-1 text-rose-400 hover:text-rose-600 rounded hover:bg-rose-50"
                              title="Delete Teacher"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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

      {/* 4. STUDENTS REGISTRY */}
      {activeTab === 'students' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Enrolled Students Registry</h3>
              <p className="text-xs text-slate-500">Class and branch-based access governance</p>
            </div>
            <button
              onClick={() => {
                setStudentForm({
                  fullName: '',
                  admissionNo: `DIPS-2026-${Math.floor(100 + Math.random() * 900)}`,
                  email: '',
                  phone: '',
                  branchId: branches[0]?.id || '',
                  classId: classes[0]?.id || '',
                  section: 'A',
                  rollNo: '01',
                  initialPassword: 'student123',
                });
                setShowStudentModal(true);
              }}
              className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Enroll Student
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Admission No & Student Name</th>
                    <th className="p-3.5">Branch Campus</th>
                    <th className="p-3.5">Class & Section</th>
                    <th className="p-3.5">Roll No</th>
                    <th className="p-3.5">Academic Session</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((st) => (
                    <tr key={st.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{st.fullName}</div>
                        <div className="text-slate-400 font-mono text-[11px]">{st.admissionNo}</div>
                      </td>
                      <td className="p-3.5 text-slate-700 font-medium">{st.branchName}</td>
                      <td className="p-3.5 text-slate-800 font-semibold">
                        {st.className} - Sec {st.section}
                      </td>
                      <td className="p-3.5 font-mono text-slate-600">{st.rollNo}</td>
                      <td className="p-3.5 text-slate-600">{st.academicSessionId || '2026-27'}</td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                            st.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {st.isActive ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleResetPassword(st.id, st.fullName)}
                            className="p-1 text-slate-400 hover:text-indigo-600 rounded hover:bg-slate-100"
                            title="Reset password to student123"
                          >
                            <Lock className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleToggleUserStatus(st.id, st.fullName)}
                            className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100"
                          >
                            {st.isActive ? <UserX className="w-3.5 h-3.5 text-amber-600" /> : <UserCheck className="w-3.5 h-3.5 text-emerald-600" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. CLASSES & SUBJECTS */}
      {activeTab === 'classes_subjects' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div>
              <h3 className="text-base font-bold text-slate-900">Academic Hierarchy: Classes & Subjects</h3>
              <p className="text-xs text-slate-500">
                Define institutional curriculum, add classes and subjects, and control teacher allocations across DIPS campuses
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setEditingClass(null);
                  setClassForm({
                    name: '',
                    code: '',
                    order: classes.length + 1,
                    sections: 'A, B',
                  });
                  setShowClassModal(true);
                }}
                className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-1.5 shadow-xs transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Add Academic Class
              </button>
              <button
                onClick={() => {
                  setEditingSubject(null);
                  setSubjectForm({
                    name: '',
                    code: '',
                    department: 'General',
                    applicableClasses: [],
                    description: '',
                  });
                  setShowSubjectModal(true);
                }}
                className="px-3 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg flex items-center gap-1.5 shadow-xs transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Add Academic Subject
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Classes Table */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-600" /> Standard Academic Classes
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {classes.length} Classes
                  </span>
                </h3>
                <button
                  onClick={() => {
                    setEditingClass(null);
                    setClassForm({
                      name: '',
                      code: '',
                      order: classes.length + 1,
                      sections: 'A, B',
                    });
                    setShowClassModal(true);
                  }}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add Class
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {classes.map((cls) => {
                  const classTeachers = teachers.filter((t) => t.assignedClassIds?.includes(cls.id));
                  return (
                    <div key={cls.id} className="py-3 flex items-center justify-between group">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{cls.name}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                            Code: {cls.code}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] text-slate-400">Sections:</span>
                          {cls.sections.map((sec) => (
                            <span
                              key={sec}
                              className="px-1.5 py-0.2 text-[10px] font-semibold bg-slate-100 text-slate-700 rounded"
                            >
                              Sec {sec}
                            </span>
                          ))}
                          <span className="text-slate-300">•</span>
                          <span className="text-[10px] text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded font-medium border border-indigo-100">
                            {classTeachers.length} {classTeachers.length === 1 ? 'Teacher' : 'Teachers'} Assigned
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingClass(cls);
                            setClassForm({
                              name: cls.name,
                              code: cls.code,
                              order: cls.order,
                              sections: cls.sections.join(', '),
                            });
                            setShowClassModal(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-md hover:bg-slate-100 transition-colors"
                          title="Edit Class"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClass(cls.id, cls.name)}
                          className="p-1.5 text-rose-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors"
                          title="Delete Class"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Subjects Table */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-amber-600" /> Academic Subjects & Departments
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                    {subjects.length} Subjects
                  </span>
                </h3>
                <button
                  onClick={() => {
                    setEditingSubject(null);
                    setSubjectForm({
                      name: '',
                      code: '',
                      department: 'General',
                      applicableClasses: [],
                      description: '',
                    });
                    setShowSubjectModal(true);
                  }}
                  className="text-xs font-semibold text-amber-600 hover:text-amber-800 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add Subject
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {subjects.map((sub) => {
                  const subjectTeachers = teachers.filter((t) => t.assignedSubjectIds?.includes(sub.id));
                  return (
                    <div key={sub.id} className="py-3 flex items-start justify-between group">
                      <div className="space-y-1 pr-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-slate-900">{sub.name}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                            {sub.code}
                          </span>
                          <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-amber-50 text-amber-800 border border-amber-200">
                            {sub.department}
                          </span>
                        </div>
                        {sub.description && (
                          <p className="text-[11px] text-slate-500 line-clamp-1">{sub.description}</p>
                        )}
                        <div className="flex items-center gap-1.5 pt-0.5">
                          <span className="text-[10px] text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded font-medium border border-amber-100">
                            {subjectTeachers.length} {subjectTeachers.length === 1 ? 'Teacher' : 'Teachers'} Assigned
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => {
                            setEditingSubject(sub);
                            setSubjectForm({
                              name: sub.name,
                              code: sub.code,
                              department: sub.department,
                              applicableClasses: sub.applicableClasses || [],
                              description: sub.description || '',
                            });
                            setShowSubjectModal(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-amber-600 rounded-md hover:bg-slate-100 transition-colors"
                          title="Edit Subject"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSubject(sub.id, sub.name)}
                          className="p-1.5 text-rose-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors"
                          title="Delete Subject"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. CONTENT REPOSITORY & 7. APPROVAL QUEUE */}
      {(activeTab === 'content' || activeTab === 'approvals') && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {activeTab === 'approvals'
                  ? 'Educational Content Pending Review'
                  : 'Centralized Educational Content Repository'}
              </h3>
              <p className="text-xs text-slate-500">
                Audit, preview, approve, reject, or manage curriculum resources across all branches
              </p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="p-3.5 bg-white rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Search Keywords</label>
              <input
                type="text"
                placeholder="Topic, chapter, title..."
                value={contentFilter.search}
                onChange={(e) => setContentFilter({ ...contentFilter, search: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Subject</label>
              <select
                value={contentFilter.subjectId}
                onChange={(e) => setContentFilter({ ...contentFilter, subjectId: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
              >
                <option value="all">All Subjects</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Class</label>
              <select
                value={contentFilter.classId}
                onChange={(e) => setContentFilter({ ...contentFilter, classId: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
              >
                <option value="all">All Classes</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Branch</label>
              <select
                value={contentFilter.branchId}
                onChange={(e) => setContentFilter({ ...contentFilter, branchId: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
              >
                <option value="all">All Branches</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Status</label>
              <select
                value={activeTab === 'approvals' ? 'pending_approval' : contentFilter.status}
                disabled={activeTab === 'approvals'}
                onChange={(e) => setContentFilter({ ...contentFilter, status: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
              >
                <option value="all">All Statuses</option>
                <option value="published">Published</option>
                <option value="pending_approval">Pending Approval</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Resource & Chapter</th>
                    <th className="p-3.5">Subject & Class</th>
                    <th className="p-3.5">Branch Campus</th>
                    <th className="p-3.5">Uploaded By</th>
                    <th className="p-3.5">Version</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {resources
                    .filter((r) => {
                      if (activeTab === 'approvals' && r.status !== 'pending_approval') return false;
                      if (contentFilter.status !== 'all' && r.status !== contentFilter.status) return false;
                      if (contentFilter.subjectId !== 'all' && r.subjectId !== contentFilter.subjectId) return false;
                      if (contentFilter.classId !== 'all' && r.classId !== contentFilter.classId) return false;
                      if (contentFilter.branchId !== 'all' && r.branchId !== contentFilter.branchId) return false;
                      if (contentFilter.search) {
                        const q = contentFilter.search.toLowerCase();
                        return (
                          r.title.toLowerCase().includes(q) ||
                          r.chapter.toLowerCase().includes(q) ||
                          r.topic.toLowerCase().includes(q)
                        );
                      }
                      return true;
                    })
                    .map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-3.5 max-w-xs">
                          <div className="font-bold text-slate-900 leading-snug">{r.title}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Ch: {r.chapter} • Top: {r.topic}
                          </div>
                        </td>
                        <td className="p-3.5">
                          <span className="font-semibold text-slate-800 block">{r.subjectName}</span>
                          <span className="text-[11px] text-indigo-600">{r.className}</span>
                        </td>
                        <td className="p-3.5 text-slate-600">{r.branchName}</td>
                        <td className="p-3.5">
                          <div className="font-medium text-slate-800">{r.uploadedByName}</div>
                          <div className="text-[11px] text-slate-400">{new Date(r.createdAt).toLocaleDateString()}</div>
                        </td>
                        <td className="p-3.5">
                          <button
                            onClick={() => onViewVersions(r)}
                            className="px-2 py-0.5 text-[10px] font-bold rounded bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors"
                          >
                            v{r.currentVersion} ({r.versions?.length || 1})
                          </button>
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                              r.status === 'published'
                                ? 'bg-emerald-100 text-emerald-800'
                                : r.status === 'pending_approval'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {r.status === 'published'
                              ? 'Published'
                              : r.status === 'pending_approval'
                              ? 'Pending Review'
                              : 'Rejected'}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => onPreviewResource(r)}
                              className="p-1.5 text-slate-500 hover:text-indigo-600 rounded hover:bg-slate-100"
                              title="Preview Content"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {r.status === 'pending_approval' && (
                              <>
                                <button
                                  onClick={() => handleApproveReject(r.id, 'published')}
                                  className="p-1.5 text-emerald-600 hover:text-emerald-700 rounded hover:bg-emerald-50"
                                  title="Approve Content"
                                >
                                  <CheckCircle className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleApproveReject(r.id, 'rejected')}
                                  className="p-1.5 text-rose-600 hover:text-rose-700 rounded hover:bg-rose-50"
                                  title="Reject Content"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}

                            <button
                              onClick={() => handleDeleteResource(r.id, r.title)}
                              className="p-1.5 text-rose-400 hover:text-rose-600 rounded hover:bg-rose-50"
                              title="Delete Resource"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 8. ANNOUNCEMENTS */}
      {activeTab === 'announcements' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Institutional Announcements</h3>
              <p className="text-xs text-slate-500">
                Broadcast directives, exam guidelines, and syllabus updates to teachers and students
              </p>
            </div>
            <button
              onClick={() => setShowAnnouncementModal(true)}
              className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> New Announcement
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {announcements.map((anc) => (
              <div key={anc.id} className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                      anc.priority === 'urgent'
                        ? 'bg-rose-100 text-rose-800'
                        : anc.priority === 'high'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {anc.priority} Priority
                  </span>
                  <span className="text-[11px] text-slate-400">{new Date(anc.createdAt).toLocaleDateString()}</span>
                </div>

                <h4 className="text-sm font-bold text-slate-900">{anc.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{anc.content}</p>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Author: {anc.authorName} ({anc.authorRole})</span>
                  <button
                    onClick={async () => {
                      if (!confirm('Delete announcement?')) return;
                      await api.deleteAnnouncement(anc.id);
                      showToast('Announcement removed');
                      loadAllData();
                    }}
                    className="text-rose-500 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 9. ACTIVITY LOGS */}
      {activeTab === 'activity_logs' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">System Activity & Audit Trail</h3>
            <p className="text-xs text-slate-500">
              Live log of all uploads, collaborative updates, downloads, approvals, and deletions
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Timestamp</th>
                    <th className="p-3.5">User</th>
                    <th className="p-3.5">Action</th>
                    <th className="p-3.5">Campus Branch</th>
                    <th className="p-3.5">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activityLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-3.5 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="p-3.5">
                        <span className="font-bold text-slate-900 block">{log.userName}</span>
                        <span className="text-[10px] text-slate-400 uppercase">{log.userRole}</span>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-md font-mono ${
                            log.action === 'UPLOAD'
                              ? 'bg-indigo-100 text-indigo-800'
                              : log.action === 'UPDATE'
                              ? 'bg-blue-100 text-blue-800'
                              : log.action === 'DOWNLOAD'
                              ? 'bg-emerald-100 text-emerald-800'
                              : log.action === 'APPROVE'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-700 font-medium">{log.branchName}</td>
                      <td className="p-3.5 text-slate-600">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 10. SETTINGS */}
      {activeTab === 'settings' && settings && (
        <div className="max-w-2xl bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Portal Governance & Workflow Settings</h3>
            <p className="text-xs text-slate-500">Configure content publishing controls for all DIPS branches</p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Content Publishing Workflow</h4>
                <p className="text-xs text-slate-500">
                  {settings.directPublishing
                    ? 'Direct Publishing: Teacher uploads are instantly available to students and colleagues.'
                    : 'Approval Required: Teacher uploads require Admin/Coordinator approval before becoming visible.'}
                </p>
              </div>
              <button
                onClick={() => handleToggleDirectPublishing(!settings.directPublishing)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  settings.directPublishing
                    ? 'bg-indigo-600 text-white'
                    : 'bg-amber-600 text-white'
                }`}
              >
                {settings.directPublishing ? 'Mode: Direct Publishing' : 'Mode: Approval Required'}
              </button>
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-600">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="font-medium">Active Academic Session:</span>
              <span className="font-bold text-slate-900">{settings.activeSession}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="font-medium">Max Upload Size:</span>
              <span className="font-bold text-slate-900">{settings.maxUploadSizeMB} MB</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="font-medium">Connected DIPS Branches:</span>
              <span className="font-bold text-slate-900">{branches.length} Branches</span>
            </div>
          </div>

          {/* Supabase Cloud Backend Card */}
          <div className="p-5 rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50/40 via-white to-emerald-50/20 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-600 text-white rounded-lg shadow-xs">
                    <Database className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">Supabase Cloud Database & Storage</h4>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                      supabaseStatus?.connected
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-amber-100 text-amber-800 border-amber-300'
                    }`}
                  >
                    {supabaseStatus?.connected ? 'Live Connected' : 'Checking Connection'}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Directly linked to Supabase Project: <span className="font-mono font-semibold text-slate-700">rqqjqflxbtfcrbywwtpc</span>
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleTestSupabase}
                  disabled={testingSupabase}
                  className="px-2.5 py-1 text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-1 transition-all shadow-2xs"
                >
                  <RefreshCw className={`w-3 h-3 ${testingSupabase ? 'animate-spin text-emerald-600' : ''}`} />
                  {testingSupabase ? 'Pinging...' : 'Test Connection'}
                </button>
                <button
                  type="button"
                  onClick={handleSyncSupabase}
                  disabled={syncingSupabase}
                  className="px-3 py-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-1.5 transition-all shadow-2xs"
                >
                  <Database className={`w-3 h-3 ${syncingSupabase ? 'animate-bounce' : ''}`} />
                  {syncingSupabase ? 'Syncing...' : 'Sync Portal Data'}
                </button>
              </div>
            </div>

            {/* Connection Specs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3 rounded-lg bg-white border border-slate-200 text-xs">
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Project Endpoint</span>
                <span className="font-mono text-slate-800 text-[11px] truncate block" title="https://rqqjqflxbtfcrbywwtpc.supabase.co">
                  rqqjqflxbtfcrbywwtpc.supabase.co
                </span>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Publishable API Key</span>
                <span className="font-mono text-slate-800 text-[11px] truncate block">
                  {supabaseStatus?.maskedKey || 'sb_publishable_Rpydb...TtH4'}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Network Ping / Latency</span>
                <span className="font-bold text-emerald-700 text-[11px]">
                  {supabaseStatus?.latencyMs ? `${supabaseStatus.latencyMs} ms` : 'Active'}
                </span>
              </div>
            </div>

            {supabaseStatus?.tablesDetected && supabaseStatus.tablesDetected.length > 0 && (
              <div className="p-2.5 rounded-lg bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>
                  Supabase PostgreSQL tables active: {supabaseStatus.tablesDetected.join(', ')}
                </span>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-emerald-100">
              <button
                type="button"
                onClick={() => setShowSqlModal(true)}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 hover:underline"
              >
                <span>View & Copy Supabase SQL DDL Schema (Tables & Policies)</span>
              </button>

              <a
                href="https://supabase.com/dashboard/project/rqqjqflxbtfcrbywwtpc"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 underline underline-offset-2"
              >
                <span>Open Supabase Dashboard</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add/Edit Branch */}
      {showBranchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              {editingBranch ? 'Edit DIPS Branch' : 'Add New DIPS Campus'}
            </h3>
            <form onSubmit={handleSaveBranch} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Branch Name</label>
                <input
                  type="text"
                  placeholder="e.g. DIPS Nurmahal"
                  value={branchForm.name}
                  onChange={(e) => setBranchForm({ ...branchForm, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Code</label>
                  <input
                    type="text"
                    placeholder="NUR"
                    value={branchForm.code}
                    onChange={(e) => setBranchForm({ ...branchForm, code: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    placeholder="Nurmahal"
                    value={branchForm.city}
                    onChange={(e) => setBranchForm({ ...branchForm, city: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Principal Name</label>
                <input
                  type="text"
                  value={branchForm.principalName}
                  onChange={(e) => setBranchForm({ ...branchForm, principalName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={branchForm.phone}
                  onChange={(e) => setBranchForm({ ...branchForm, phone: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowBranchModal(false)}
                  className="px-3 py-1.5 border rounded-lg"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 bg-indigo-600 text-white font-bold rounded-lg">
                  Save Branch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add/Edit Teacher */}
      {showTeacherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              {editingTeacher ? 'Edit Teacher Profile' : 'Register New Faculty Member'}
            </h3>
            <form onSubmit={handleSaveTeacher} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={teacherForm.fullName}
                    onChange={(e) => setTeacherForm({ ...teacherForm, fullName: e.target.value })}
                    placeholder="Mrs. Amandeep Kaur"
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Employee ID</label>
                  <input
                    type="text"
                    value={teacherForm.employeeId}
                    onChange={(e) => setTeacherForm({ ...teacherForm, employeeId: e.target.value })}
                    placeholder="EMP-BEG-101"
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Campus Branch</label>
                  <select
                    value={teacherForm.branchId}
                    onChange={(e) => setTeacherForm({ ...teacherForm, branchId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg bg-white"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Designation</label>
                  <input
                    type="text"
                    value={teacherForm.designation}
                    onChange={(e) => setTeacherForm({ ...teacherForm, designation: e.target.value })}
                    placeholder="PGT Computer Science"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Assigned Subjects (Teachers can share & collaborate in these subjects)
                </label>
                <div className="grid grid-cols-2 gap-1.5 p-2 bg-slate-50 border rounded-lg max-h-28 overflow-y-auto">
                  {subjects.map((s) => (
                    <label key={s.id} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={teacherForm.assignedSubjectIds.includes(s.id)}
                        onChange={(e) => {
                          const cur = teacherForm.assignedSubjectIds;
                          setTeacherForm({
                            ...teacherForm,
                            assignedSubjectIds: e.target.checked
                              ? [...cur, s.id]
                              : cur.filter((id) => id !== s.id),
                          });
                        }}
                      />
                      <span className="truncate">{s.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assigned Classes</label>
                <div className="flex flex-wrap gap-2 p-2 bg-slate-50 border rounded-lg">
                  {classes.map((c) => (
                    <label key={c.id} className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={teacherForm.assignedClassIds.includes(c.id)}
                        onChange={(e) => {
                          const cur = teacherForm.assignedClassIds;
                          setTeacherForm({
                            ...teacherForm,
                            assignedClassIds: e.target.checked
                              ? [...cur, c.id]
                              : cur.filter((id) => id !== c.id),
                          });
                        }}
                      />
                      <span>{c.code}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowTeacherModal(false)}
                  className="px-3 py-1.5 border rounded-lg"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 bg-indigo-600 text-white font-bold rounded-lg">
                  Save Teacher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Enroll Student */}
      {showStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Enroll New Student</h3>
            <form onSubmit={handleSaveStudent} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Student Full Name</label>
                <input
                  type="text"
                  value={studentForm.fullName}
                  onChange={(e) => setStudentForm({ ...studentForm, fullName: e.target.value })}
                  placeholder="Gurpreet Singh"
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Admission Number</label>
                  <input
                    type="text"
                    value={studentForm.admissionNo}
                    onChange={(e) => setStudentForm({ ...studentForm, admissionNo: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Campus Branch</label>
                  <select
                    value={studentForm.branchId}
                    onChange={(e) => setStudentForm({ ...studentForm, branchId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg bg-white"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Class</label>
                  <select
                    value={studentForm.classId}
                    onChange={(e) => setStudentForm({ ...studentForm, classId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg bg-white"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Section</label>
                  <input
                    type="text"
                    value={studentForm.section}
                    onChange={(e) => setStudentForm({ ...studentForm, section: e.target.value })}
                    placeholder="A"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Roll No</label>
                  <input
                    type="text"
                    value={studentForm.rollNo}
                    onChange={(e) => setStudentForm({ ...studentForm, rollNo: e.target.value })}
                    placeholder="14"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowStudentModal(false)}
                  className="px-3 py-1.5 border rounded-lg"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 bg-emerald-600 text-white font-bold rounded-lg">
                  Enroll Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New Announcement */}
      {showAnnouncementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Broadcast Portal Announcement</h3>
            <form onSubmit={handleCreateAnnouncement} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  value={announcementForm.title}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                  placeholder="e.g. CBSE Practical Examination Guidelines"
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Announcement Body</label>
                <textarea
                  rows={3}
                  value={announcementForm.content}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
                  placeholder="Details for teachers/students..."
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={announcementForm.priority}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, priority: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-lg bg-white"
                  >
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Audience</label>
                  <select
                    value={announcementForm.targetRole}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, targetRole: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-lg bg-white"
                  >
                    <option value="all">All (Teachers & Students)</option>
                    <option value="teacher">Teachers Only</option>
                    <option value="student">Students Only</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAnnouncementModal(false)}
                  className="px-3 py-1.5 border rounded-lg"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 bg-indigo-600 text-white font-bold rounded-lg">
                  Broadcast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add/Edit Academic Class */}
      {showClassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingClass ? 'Edit Academic Class' : 'Add New Academic Class'}
                </h3>
                <p className="text-xs text-slate-500">Define curriculum standard and class sections</p>
              </div>
              <button
                onClick={() => {
                  setShowClassModal(false);
                  setEditingClass(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveClass} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Class Display Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Class IX, Class XII, Nursery"
                  value={classForm.name}
                  onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Class Code *</label>
                  <input
                    type="text"
                    placeholder="e.g. IX, 9, XII, NUR"
                    value={classForm.code}
                    onChange={(e) => setClassForm({ ...classForm, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border rounded-lg uppercase"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Sort Order *</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={classForm.order}
                    onChange={(e) => setClassForm({ ...classForm, order: Number(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Sections (comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g. A, B, C"
                  value={classForm.sections}
                  onChange={(e) => setClassForm({ ...classForm, sections: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
                <p className="text-[11px] text-slate-400 mt-1">Separate section names with commas (e.g. A, B, C, Medical, Non-Med)</p>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowClassModal(false);
                    setEditingClass(null);
                  }}
                  className="px-3 py-1.5 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-xs">
                  {editingClass ? 'Update Class' : 'Create Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add/Edit Academic Subject */}
      {showSubjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingSubject ? 'Edit Academic Subject' : 'Add New Academic Subject'}
                </h3>
                <p className="text-xs text-slate-500">Register subject and designate departments</p>
              </div>
              <button
                onClick={() => {
                  setShowSubjectModal(false);
                  setEditingSubject(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubject} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Subject Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Mathematics, Social Science, Physics"
                    value={subjectForm.name}
                    onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Subject Code *</label>
                  <input
                    type="text"
                    placeholder="e.g. MATH, SST, PHY"
                    value={subjectForm.code}
                    onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border rounded-lg uppercase"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Academic Department</label>
                <select
                  value={subjectForm.department}
                  onChange={(e) => setSubjectForm({ ...subjectForm, department: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-white"
                >
                  <option value="General">General</option>
                  <option value="Science & Mathematics">Science & Mathematics</option>
                  <option value="Languages & Literature">Languages & Literature</option>
                  <option value="Social Studies & Humanities">Social Studies & Humanities</option>
                  <option value="Computer Science & AI">Computer Science & AI</option>
                  <option value="Commerce & Economics">Commerce & Economics</option>
                  <option value="Arts & Physical Education">Arts & Physical Education</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Subject syllabus guidelines, CBSE alignment, etc."
                  value={subjectForm.description}
                  onChange={(e) => setSubjectForm({ ...subjectForm, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Applicable Classes (Optional)</label>
                <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto p-2 border rounded-lg bg-slate-50">
                  {classes.map((c) => {
                    const checked = subjectForm.applicableClasses.includes(c.id);
                    return (
                      <label
                        key={c.id}
                        className={`flex items-center gap-2 p-1.5 rounded cursor-pointer border text-[11px] ${
                          checked
                            ? 'bg-amber-50 border-amber-300 text-amber-900 font-semibold'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            const next = checked
                              ? subjectForm.applicableClasses.filter((id) => id !== c.id)
                              : [...subjectForm.applicableClasses, c.id];
                            setSubjectForm({ ...subjectForm, applicableClasses: next });
                          }}
                          className="rounded text-amber-600 focus:ring-amber-500"
                        />
                        <span className="truncate">{c.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowSubjectModal(false);
                    setEditingSubject(null);
                  }}
                  className="px-3 py-1.5 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shadow-xs">
                  {editingSubject ? 'Update Subject' : 'Create Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Direct Subject & Class Assignment for a Teacher */}
      {showAssignModal && assigningTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="relative w-full max-w-xl bg-white rounded-xl shadow-2xl border border-slate-200 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-base font-bold text-slate-900">Assign Subjects & Classes</h3>
                </div>
                <div className="mt-1 flex items-center gap-2 text-xs text-slate-600">
                  <span className="font-semibold text-slate-900">{assigningTeacher.fullName}</span>
                  <span>•</span>
                  <span>{assigningTeacher.branchName}</span>
                  {assigningTeacher.employeeId && (
                    <>
                      <span>•</span>
                      <span className="font-mono text-slate-400">ID: {assigningTeacher.employeeId}</span>
                    </>
                  )}
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setAssigningTeacher(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAssignments} className="space-y-5 text-xs">
              {/* Subjects Allocation */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <label className="font-bold text-slate-800">Assigned Subjects</label>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {assignForm.assignedSubjectIds.length} Selected
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setAssignForm({ ...assignForm, assignedSubjectIds: subjects.map((s) => s.id) })}
                      className="text-indigo-600 hover:underline font-medium"
                    >
                      Select All
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() => setAssignForm({ ...assignForm, assignedSubjectIds: [] })}
                      className="text-slate-500 hover:underline"
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto p-2.5 border rounded-lg bg-slate-50">
                  {subjects.map((s) => {
                    const isSelected = assignForm.assignedSubjectIds.includes(s.id);
                    return (
                      <label
                        key={s.id}
                        className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer border transition-all text-xs ${
                          isSelected
                            ? 'bg-indigo-50/80 border-indigo-300 text-indigo-950 font-semibold shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {
                            const next = isSelected
                              ? assignForm.assignedSubjectIds.filter((id) => id !== s.id)
                              : [...assignForm.assignedSubjectIds, s.id];
                            setAssignForm({ ...assignForm, assignedSubjectIds: next });
                          }}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="truncate">{s.name}</div>
                          <div className="text-[10px] text-slate-400 font-normal truncate">
                            {s.code} • {s.department}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Classes Allocation */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <label className="font-bold text-slate-800">Assigned Classes</label>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {assignForm.assignedClassIds.length} Selected
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setAssignForm({ ...assignForm, assignedClassIds: classes.map((c) => c.id) })}
                      className="text-indigo-600 hover:underline font-medium"
                    >
                      Select All
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() => setAssignForm({ ...assignForm, assignedClassIds: [] })}
                      className="text-slate-500 hover:underline"
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-44 overflow-y-auto p-2.5 border rounded-lg bg-slate-50">
                  {classes.map((c) => {
                    const isSelected = assignForm.assignedClassIds.includes(c.id);
                    return (
                      <label
                        key={c.id}
                        className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer border transition-all text-xs ${
                          isSelected
                            ? 'bg-indigo-50/80 border-indigo-300 text-indigo-950 font-semibold shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {
                            const next = isSelected
                              ? assignForm.assignedClassIds.filter((id) => id !== c.id)
                              : [...assignForm.assignedClassIds, c.id];
                            setAssignForm({ ...assignForm, assignedClassIds: next });
                          }}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <div className="min-w-0">
                          <div className="truncate">{c.name}</div>
                          <div className="text-[10px] text-slate-400 font-normal">Code: {c.code}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <span className="text-[11px] text-slate-500">
                  Allocations immediately update teacher content authoring and viewing permissions.
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAssignModal(false);
                      setAssigningTeacher(null);
                    }}
                    className="px-3 py-1.5 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-xs flex items-center gap-1.5"
                  >
                    <CheckSquare className="w-3.5 h-3.5" /> Save Allocations
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Supabase SQL DDL Schema */}
      {showSqlModal && supabaseStatus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-600 text-white rounded-lg">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Supabase SQL Schema & DDL</h3>
                  <p className="text-[11px] text-slate-500">
                    Project: <span className="font-mono font-semibold">rqqjqflxbtfcrbywwtpc</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSqlModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 flex-1 bg-slate-900 text-slate-100 font-mono text-xs">
              <pre className="whitespace-pre-wrap leading-relaxed">{supabaseStatus.sqlSchema}</pre>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Run this in Supabase Dashboard → SQL Editor to create tables with Row Level Security.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-xs"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedSql ? 'Copied!' : 'Copy SQL'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowSqlModal(false)}
                  className="px-3 py-1.5 border border-slate-200 text-slate-700 text-xs rounded-lg hover:bg-slate-100"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
