/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CertificateModal } from './components/CertificateModal';
import { SearchModal } from './components/SearchModal';
import { AuthModal } from './components/AuthModal';
import { HomeView } from './components/views/HomeView';
import { StudyMaterialView } from './components/views/StudyMaterialView';
import { QuizView } from './components/views/QuizView';
import { DashboardView } from './components/views/DashboardView';
import { QuestionBankView } from './components/views/QuestionBankView';
import { AdminPanelView } from './components/views/AdminPanelView';
import { AboutView } from './components/views/AboutView';
import { ContactView } from './components/views/ContactView';
import { StudyRoomView } from './components/views/StudyRoomView';
import { ChapterLmsView } from './components/views/ChapterLmsView';
import { LabExamPortalView } from './components/views/LabExamPortalView';
import { StudentLoginView } from './components/views/StudentLoginView';
import { ErrorView } from './components/views/ErrorView';
import { StudyMaterial, QuizConfig, QuizAttempt, ClassLevel, SubjectId } from './types';
import { Lock, LogIn, GraduationCap, LayoutDashboard, ShieldAlert } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { 
    userRole, 
    isAuthenticated,
    openAuthModal,
    studentProfile, 
    activeCertificateAttempt, 
    setActiveCertificateAttempt, 
    quizzes, 
    selectedClassFilter,
    setSelectedClassFilter 
  } = useApp();

  const [currentTab, setCurrentTab] = useState<string>('lms');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [materialToOpenInReader, setMaterialToOpenInReader] = useState<StudyMaterial | null>(null);
  const [quizToStartDirectly, setQuizToStartDirectly] = useState<QuizConfig | null>(null);
  const [studyRoomToOpen, setStudyRoomToOpen] = useState<string | null>(null);

  // Keyboard shortcut Ctrl+K / Cmd+K for search
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleOpenMaterialReader = (mat: StudyMaterial) => {
    setMaterialToOpenInReader(mat);
    setCurrentTab('materials');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartQuiz = (qz: QuizConfig) => {
    setQuizToStartDirectly(qz);
    setCurrentTab('quiz');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartQuizWithChapter = (classLevel: ClassLevel, subjectId: SubjectId, chapterId?: string) => {
    setSelectedClassFilter(classLevel);
    const match = quizzes.find(q => q.classLevel === classLevel && q.subjectId === subjectId);
    if (match) {
      setQuizToStartDirectly(match);
    }
    setCurrentTab('quiz');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartPracticeTopic = (chapterTitle: string) => {
    setCurrentTab('quiz');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={tab => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onSearchClick={() => setIsSearchOpen(true)}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {/* Protected Feature Guard (For specialized private rooms/tests) */}
        {!isAuthenticated && ['mytests', 'studyroom'].includes(currentTab) ? (
          <div className="max-w-3xl mx-auto px-4 py-16 sm:py-24 text-center">
            <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200 shadow-xs">
                <Lock className="w-8 h-8 text-blue-600" />
              </div>

              <div className="space-y-2">
                <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-800">
                  Student Login Required
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Sign In to Access Learning Content
                </h1>
                <p className="text-sm text-slate-600 leading-relaxed max-w-lg mx-auto">
                  To access Class Notes, Online MCQ Tests, Practical Playgrounds, Question Banks, and PYQ Papers, please sign in with your student account or register for free.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-1 max-w-md mx-auto text-left">
                <p className="font-bold text-slate-800 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                  <span>Free Student Access</span>
                </p>
                <p>
                  Create your free profile to track quiz scores, earn topic badges, execute Python & SQL scripts, and access all CBSE board exam preparation materials.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => openAuthModal('login', 'Please sign in or register to access student learning resources.')}
                  className="w-full sm:w-auto px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In / Register Free</span>
                </button>

                <button
                  onClick={() => {
                    setCurrentTab('dashboard');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-full sm:w-auto px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Return to Dashboard</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {currentTab === 'student-login' && (
              <StudentLoginView
                onBackHome={() => {
                  setCurrentTab('home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onLoginSuccess={() => {
                  setCurrentTab('dashboard');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onSwitchToAdmin={() => openAuthModal('admin', 'Sign in with Administrator Credentials')}
              />
            )}

            {currentTab === 'home' && (
              <HomeView
                setCurrentTab={tab => {
                  setCurrentTab(tab);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOpenMaterialReader={handleOpenMaterialReader}
                onStartQuiz={handleStartQuiz}
              />
            )}

            {(currentTab === 'lms' || currentTab === 'materials') && (
              <ChapterLmsView
                initialClass={selectedClassFilter !== 'ALL' ? selectedClassFilter : 'X'}
                onNavigateHome={() => {
                  setCurrentTab('home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}

            {currentTab === 'examhall' && (
              <LabExamPortalView
                onBackToDashboard={() => {
                  setCurrentTab('dashboard');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOpenAdminPanel={() => {
                  setCurrentTab('admin');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}

            {currentTab === 'quiz' && (
              <QuizView
                initialQuizToStart={quizToStartDirectly}
                onClearInitialQuiz={() => setQuizToStartDirectly(null)}
                onViewCertificate={attempt => setActiveCertificateAttempt(attempt)}
                onNavigateToDashboard={() => {
                  setCurrentTab('dashboard');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}

            {currentTab === 'studyroom' && (
              <StudyRoomView
                initialRoomId={studyRoomToOpen}
                onOpenStudyMaterial={() => {
                  setCurrentTab('materials');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}

            {currentTab === 'dashboard' && (
              <DashboardView
                onOpenMaterial={handleOpenMaterialReader}
                onViewCertificate={attempt => setActiveCertificateAttempt(attempt)}
                onStartPracticeTopic={handleStartPracticeTopic}
                onStartQuizClick={() => {
                  setCurrentTab('quiz');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOpenStudyRoom={(roomId) => {
                  setStudyRoomToOpen(roomId || null);
                  setCurrentTab('studyroom');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}

            {currentTab === 'qbank' && <QuestionBankView onStartQuiz={handleStartQuiz} />}

            {currentTab === 'about' && (
              <AboutView
                setCurrentTab={tab => {
                  setCurrentTab(tab);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}

            {currentTab === 'contact' && <ContactView />}

            {currentTab === 'admin' && (
              userRole === 'admin' ? (
                <AdminPanelView
                  onBackToHome={() => {
                    setCurrentTab('home');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              ) : (
                <div className="max-w-2xl mx-auto px-4 py-16 sm:py-24 text-center">
                  <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xl space-y-6">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-200 shadow-xs">
                      <ShieldAlert className="w-8 h-8 text-indigo-600" />
                    </div>
                    <div className="space-y-2">
                      <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800">
                        Educator & Admin Access Restricted
                      </span>
                      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                        Administrator CMS Access Required
                      </h1>
                      <p className="text-sm text-slate-600 leading-relaxed max-w-lg mx-auto">
                        This area is reserved for Educator (Mr. Zakir Hussain) to upload Previous Year Papers, build live test series, manage student progress logs, and publish curriculum notes.
                      </p>
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                      <button
                        onClick={() => openAuthModal('admin', 'Sign in with Administrator Credentials')}
                        className="w-full sm:w-auto px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                      >
                        <Lock className="w-4 h-4" />
                        <span>Sign In as Admin</span>
                      </button>
                      <button
                        onClick={() => {
                          setCurrentTab('home');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="w-full sm:w-auto px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                      >
                        Return to Public Home
                      </button>
                    </div>
                  </div>
                </div>
              )
            )}

            {(['error', '402', '404', '500', 'offline'].includes(currentTab)) && (
              <ErrorView
                initialErrorCode={
                  currentTab === '402' ? '402' :
                  currentTab === '500' ? '500' :
                  currentTab === 'offline' ? 'offline' : '404'
                }
                onNavigateHome={() => {
                  setCurrentTab('home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onRetry={() => {
                  setCurrentTab('home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}
          </>
        )}
      </main>

      {/* Global Footer */}
      <Footer
        setCurrentTab={tab => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Global Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectMaterial={handleOpenMaterialReader}
        onSelectQuizTab={() => {
          setCurrentTab('quiz');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Global Certificate Modal */}
      {activeCertificateAttempt && (
        <CertificateModal
          attempt={activeCertificateAttempt}
          studentName={studentProfile.name}
          onClose={() => setActiveCertificateAttempt(null)}
        />
      )}

      {/* Global Auth Modal for Login / Registration */}
      <AuthModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
