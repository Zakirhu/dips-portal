import React, { useState, useEffect } from 'react';
import type { User, Resource, Subject, AcademicClass } from './types.js';
import { api, getStoredUser, clearStoredAuth, setStoredAuth } from './lib/api.js';
import { LoginPage } from './components/LoginPage.js';
import { Navbar } from './components/Navbar.js';
import { AdminPortal } from './components/AdminPortal.js';
import { TeacherPortal } from './components/TeacherPortal.js';
import { StudentPortal } from './components/StudentPortal.js';
import { ResourcePreviewModal } from './components/ResourcePreviewModal.js';
import { VersionHistoryModal } from './components/VersionHistoryModal.js';
import { NewVersionModal } from './components/NewVersionModal.js';
import { UploadResourceModal } from './components/UploadResourceModal.js';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [activeNavTab, setActiveNavTab] = useState('home');

  // Modals state
  const [previewResource, setPreviewResource] = useState<Resource | null>(null);
  const [versionModalResource, setVersionModalResource] = useState<Resource | null>(null);
  const [collaborateResource, setCollaborateResource] = useState<Resource | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadInitialSubjectId, setUploadInitialSubjectId] = useState<string | undefined>();
  const [uploadInitialClassId, setUploadInitialClassId] = useState<string | undefined>();

  // Academic metadata for upload modals
  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
  const [allClasses, setAllClasses] = useState<AcademicClass[]>([]);

  // Check initial user authentication
  useEffect(() => {
    const initAuth = async () => {
      const stored = getStoredUser();
      if (stored) {
        try {
          const res = await api.getCurrentUser();
          setCurrentUser(res.user);
        } catch {
          // Token expired or invalid
          clearStoredAuth();
          setCurrentUser(null);
        }
      }
      setLoadingUser(false);
    };

    initAuth();
  }, []);

  // Fetch subjects and classes when user logs in
  useEffect(() => {
    if (currentUser) {
      Promise.all([api.getSubjects(), api.getClasses()])
        .then(([subsRes, clsRes]) => {
          setAllSubjects(subsRes.subjects);
          setAllClasses(clsRes.classes);
        })
        .catch(() => {});
    }
  }, [currentUser?.id]);

  const handleLogout = () => {
    clearStoredAuth();
    setCurrentUser(null);
  };

  const handleQuickSwitchUser = (newUser: User) => {
    setCurrentUser(newUser);
  };

  const handleDownload = async (resource: Resource) => {
    try {
      await api.trackDownload(resource.id);
      // Trigger browser download or new tab navigation
      const downloadLink = document.createElement('a');
      downloadLink.href = resource.fileUrl;
      downloadLink.download = resource.fileName;
      downloadLink.target = '_blank';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch {
      window.open(resource.fileUrl, '_blank');
    }
  };

  const handleRestoreVersion = async (resource: Resource, versionNumber: number) => {
    try {
      const res = await api.restoreResourceVersion(resource.id, versionNumber);
      setVersionModalResource(res.resource);
      if (previewResource && previewResource.id === resource.id) {
        setPreviewResource(res.resource);
      }
      alert(`Version ${versionNumber} has been successfully restored as the active version.`);
    } catch (err: any) {
      alert(err.message || 'Failed to restore version');
    }
  };

  const handleAddVersionSubmit = async (resourceId: string, formData: FormData) => {
    const res = await api.addResourceVersion(resourceId, formData);
    if (previewResource && previewResource.id === resourceId) {
      setPreviewResource(res.resource);
    }
    if (versionModalResource && versionModalResource.id === resourceId) {
      setVersionModalResource(res.resource);
    }
    alert(`Version ${res.resource.currentVersion} published successfully!`);
  };

  const handleCreateResourceSubmit = async (formData: FormData) => {
    await api.createResource(formData);
    alert('Educational resource published successfully to DIPS Central Portal!');
  };

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-mono">Initializing DIPS Centralized Portal...</p>
        </div>
      </div>
    );
  }

  // Not logged in -> Render login page
  if (!currentUser) {
    return <LoginPage onLoginSuccess={setCurrentUser} />;
  }

  // Logged in -> Render Portal with role-specific views
  const isTeacher = currentUser.role === 'teacher' || currentUser.role === 'coordinator';
  const isAdmin = currentUser.role === 'admin';
  const isStudent = currentUser.role === 'student';

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col">
      {/* Universal Header */}
      <Navbar
        currentUser={currentUser}
        onLogout={handleLogout}
        onQuickSwitchUser={handleQuickSwitchUser}
        activeTab={activeNavTab}
        setActiveTab={setActiveNavTab}
      />

      {/* Main Role-Specific View */}
      <main className="flex-1">
        {isAdmin && (
          <AdminPortal
            currentUser={currentUser}
            onPreviewResource={setPreviewResource}
            onViewVersions={setVersionModalResource}
          />
        )}

        {isTeacher && (
          <TeacherPortal
            currentUser={currentUser}
            onOpenUpload={(subId, clsId) => {
              setUploadInitialSubjectId(subId);
              setUploadInitialClassId(clsId);
              setShowUploadModal(true);
            }}
            onPreviewResource={setPreviewResource}
            onOpenVersions={setVersionModalResource}
            onOpenCollaborate={setCollaborateResource}
            onDownload={handleDownload}
          />
        )}

        {isStudent && (
          <StudentPortal
            currentUser={currentUser}
            onPreviewResource={setPreviewResource}
            onDownload={handleDownload}
          />
        )}
      </main>

      {/* Global Modals */}
      {previewResource && (
        <ResourcePreviewModal
          resource={previewResource}
          onClose={() => setPreviewResource(null)}
          onDownload={handleDownload}
          onOpenVersions={(res) => {
            setVersionModalResource(res);
          }}
          canCollaborate={
            isAdmin ||
            (isTeacher && currentUser.assignedSubjectIds?.includes(previewResource.subjectId))
          }
          onCollaborate={(res) => {
            setCollaborateResource(res);
          }}
        />
      )}

      {versionModalResource && (
        <VersionHistoryModal
          resource={versionModalResource}
          onClose={() => setVersionModalResource(null)}
          onRestoreVersion={handleRestoreVersion}
          canRestore={isAdmin}
        />
      )}

      {collaborateResource && (
        <NewVersionModal
          resource={collaborateResource}
          onClose={() => setCollaborateResource(null)}
          onSubmit={handleAddVersionSubmit}
        />
      )}

      {showUploadModal && (
        <UploadResourceModal
          currentUser={currentUser}
          subjects={allSubjects}
          classes={allClasses}
          initialSubjectId={uploadInitialSubjectId}
          initialClassId={uploadInitialClassId}
          onClose={() => setShowUploadModal(false)}
          onSubmit={handleCreateResourceSubmit}
        />
      )}
    </div>
  );
}
