import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import type {
  User,
  Subject,
  AcademicClass,
  Resource,
  Announcement,
} from '../types.js';
import { api } from '../lib/api.js';

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
    'navigator' | 'library' | 'my_uploads' | 'announcements' | 'profile'
  >('navigator');

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<AcademicClass[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [teacherStats, setTeacherStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Subject Navigator Hierarchical drilldown state: Subject -> Class -> Chapter
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>('all');

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordError, setPasswordError] = useState('');

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
              className="px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-xs transition-all flex items-center gap-2"
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
              <strong>Cross-Branch Network:</strong> Resources in your subject are shared seamlessly between Begowal,
              Jalandhar, Gilzian, Nurmahal, and Tanda branches.
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>{accessibleResources.length} Total Subject Resources</span>
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
              className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. SUBJECT CURRICULUM EXPLORER (The exact workflow requested by user:
          "Teacher should see:
           - Subject (for example: Computer)
           - Clicking on Computer should show classes (Class 6, Class 7, Class 8...)
           - Clicking on Class 7 should show chapters / topics") */}
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
                    className={`p-4 rounded-xl text-left border transition-all flex items-start justify-between ${
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
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 ${
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
                    className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-1.5"
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
                    className="mt-2 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                  >
                    Upload Now
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {drilldownResources.map((res) => {
                    const isMyUpload = res.uploadedByUserId === currentUser.id;
                    const isDifferentBranch = res.branchName !== currentUser.branchName;
                    return (
                      <div
                        key={res.id}
                        className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-100 text-slate-700">
                              {res.contentType}
                            </span>
                            <div className="flex items-center gap-1">
                              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-blue-50 text-blue-700 border border-blue-200">
                                v{res.currentVersion}
                              </span>
                              {isDifferentBranch && (
                                <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-amber-50 text-amber-800 border border-amber-200">
                                  {res.branchName}
                                </span>
                              )}
                            </div>
                          </div>

                          <h5 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">{res.title}</h5>

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
                            className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" /> Preview
                          </button>

                          <button
                            onClick={() => onOpenVersions(res)}
                            className="px-2 py-1.5 text-xs font-medium text-amber-700 hover:text-amber-900 rounded-lg hover:bg-amber-50 transition-colors flex items-center gap-1"
                            title="View revisions & changelog"
                          >
                            <History className="w-3.5 h-3.5" /> Revisions ({res.versions?.length || 1})
                          </button>

                          <button
                            onClick={() => onOpenCollaborate(res)}
                            className="px-2.5 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 rounded-lg transition-colors"
                            title="Collaborate and upload Version N+1"
                          >
                            + Update
                          </button>

                          <button
                            onClick={() => onDownload(res)}
                            className="p-1.5 text-slate-600 hover:text-indigo-600 rounded-lg hover:bg-slate-100"
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

      {/* 2. ALL SHARED SUBJECT CONTENT (Searchable table of all accessible subject resources) */}
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
              className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-1.5 shrink-0"
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
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
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
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
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
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
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
                    <th className="p-3.5">Resource Details</th>
                    <th className="p-3.5">Class & Subject</th>
                    <th className="p-3.5">Author Branch</th>
                    <th className="p-3.5">Version</th>
                    <th className="p-3.5">Last Contributor</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {drilldownResources.map((res) => (
                    <tr key={res.id} className="hover:bg-slate-50/60 transition-colors">
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
                        <button
                          onClick={() => onOpenVersions(res)}
                          className="px-2 py-0.5 text-[10px] font-bold rounded bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
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
                            className="p-1.5 text-slate-500 hover:text-indigo-600 rounded hover:bg-slate-100"
                            title="Preview Content"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onOpenCollaborate(res)}
                            className="px-2 py-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded hover:bg-indigo-100"
                            title="Collaborate / Upload Improved Version"
                          >
                            + Version
                          </button>
                          <button
                            onClick={() => onDownload(res)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 rounded hover:bg-slate-100"
                            title="Download File"
                          >
                            <Download className="w-3.5 h-3.5" />
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

      {/* 3. MY UPLOADS & CONTRIBUTIONS */}
      {activeTab === 'my_uploads' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">My Educational Contributions</h3>
            <p className="text-xs text-slate-500">
              Content and version updates published under your account ({currentUser.fullName})
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myUploads.map((res) => (
              <div key={res.id} className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-indigo-50 text-indigo-700">
                    {res.subjectName} • {res.className}
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-blue-50 text-blue-700 border border-blue-200">
                    v{res.currentVersion}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900">{res.title}</h4>
                <p className="text-xs text-slate-500">
                  Chapter: {res.chapter} • Topic: {res.topic}
                </p>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>{res.downloadsCount || 0} Downloads</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onPreviewResource(res)}
                      className="text-indigo-600 font-semibold hover:underline"
                    >
                      Preview
                    </button>
                    <button
                      onClick={() => onOpenVersions(res)}
                      className="text-amber-700 font-semibold hover:underline"
                    >
                      Versions ({res.versions?.length || 1})
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. ANNOUNCEMENTS */}
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

      {/* 5. PROFILE & CHANGE PASSWORD */}
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
                className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Update Password
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
