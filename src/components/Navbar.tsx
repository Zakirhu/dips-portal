import React, { useState } from 'react';
import { 
  GraduationCap, 
  BookOpen, 
  HelpCircle, 
  User, 
  ShieldCheck, 
  Menu, 
  X, 
  FileQuestion, 
  Sparkles, 
  Search,
  Layers,
  ChevronDown,
  Bell,
  Check,
  LogIn,
  LogOut,
  Award,
  Flame,
  LayoutDashboard,
  ExternalLink,
  Monitor
} from 'lucide-react';
import { Logo } from './Logo';
import { useApp } from '../context/AppContext';
import { CLASSES_LIST } from '../data/curriculumData';
import { ClassLevel } from '../types';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onSearchClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab, onSearchClick }) => {
  const { 
    currentUser,
    isAuthenticated,
    userRole, 
    setUserRole, 
    logout,
    openAuthModal,
    studentProfile, 
    selectedClassFilter, 
    setSelectedClassFilter,
    notifications,
    markNotificationRead
  } = useApp();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [classesDropdownOpen, setClassesDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Dynamic Navigation Links based on Role & Auth
  const getNavLinks = () => {
    if (userRole === 'admin') {
      return [
        { id: 'admin', label: 'Admin Dashboard', icon: ShieldCheck },
        { id: 'lms', label: 'Chapter LMS', icon: BookOpen },
        { id: 'examhall', label: 'Lab Exam Hall', icon: Monitor },
        { id: 'home', label: 'Public Website' }
      ];
    }

    if (isAuthenticated) {
      return [
        { id: 'lms', label: 'Chapter LMS', icon: BookOpen },
        { id: 'examhall', label: 'Online Lab Exam', icon: Monitor },
        { id: 'classes', label: 'Classes', isDropdown: true },
        { id: 'dashboard', label: 'My Progress', icon: LayoutDashboard }
      ];
    }

    return [
      { id: 'lms', label: 'Chapter LMS', icon: BookOpen },
      { id: 'examhall', label: 'Online Lab Exam', icon: Monitor },
      { id: 'student-login', label: 'Student Portal', icon: GraduationCap },
      { id: 'classes', label: 'Classes', isDropdown: true },
      { id: 'home', label: 'Home' },
      { id: 'about', label: 'About Hub' }
    ];
  };

  const navLinks = getNavLinks();

  const handleNavClick = (id: string) => {
    if (id === 'classes') {
      if (currentTab === 'home') {
        const el = document.getElementById('classes-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      } else {
        setCurrentTab('home');
        setTimeout(() => {
          const el = document.getElementById('classes-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } else if (id === 'mytests') {
      setCurrentTab('dashboard');
      setTimeout(() => {
        const el = document.getElementById('student-tests-history');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      setCurrentTab(id);
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-17 gap-3 sm:gap-6">
          
          {/* 1. Professional Brand Identity */}
          <div 
            onClick={() => setCurrentTab(isAuthenticated ? 'dashboard' : 'home')}
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            <div className="relative">
              <Logo className="w-10 h-10 group-hover:scale-105 transition-transform drop-shadow-xs" />
            </div>
            <div className="leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="text-[17px] font-black tracking-tight text-slate-900 group-hover:text-teal-700 transition-colors font-heading">
                  Learn with Zakir
                </span>
                <span className="hidden xl:inline-block px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider bg-teal-50 text-teal-800 border border-teal-200/80 rounded">
                  CBSE
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Computer Science • IT • IP • Typography
              </span>
            </div>
          </div>

          {/* 2. Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map(link => {
              const isActive = currentTab === link.id;

              if (link.id === 'classes') {
                return (
                  <div key={link.id} className="relative">
                    <button
                      type="button"
                      onClick={() => setClassesDropdownOpen(!classesDropdownOpen)}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-semibold transition-all cursor-pointer ${
                        selectedClassFilter !== 'ALL'
                          ? 'bg-teal-50 text-teal-800 font-bold border border-teal-200/80'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                      }`}
                    >
                      <span>{selectedClassFilter !== 'ALL' ? `Class ${selectedClassFilter}` : link.label}</span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${classesDropdownOpen ? 'rotate-180 text-teal-600' : 'text-slate-400'}`} />
                    </button>

                    {/* Classes Dropdown Menu */}
                    {classesDropdownOpen && (
                      <div 
                        onMouseLeave={() => setClassesDropdownOpen(false)}
                        className="absolute left-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50 animate-in fade-in zoom-in-95 duration-150"
                      >
                        <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Select Class Level</span>
                          <button 
                            type="button"
                            onClick={() => {
                              setSelectedClassFilter('ALL');
                              setClassesDropdownOpen(false);
                            }}
                            className="text-[11px] text-teal-600 hover:underline font-semibold cursor-pointer"
                          >
                            All Classes (Reset)
                          </button>
                        </div>

                        <div className="p-2 space-y-1 max-h-80 overflow-y-auto">
                          {CLASSES_LIST.map(cls => (
                            <button
                              key={cls.level}
                              type="button"
                              onClick={() => {
                                setSelectedClassFilter(cls.level as ClassLevel);
                                setClassesDropdownOpen(false);
                                setCurrentTab('lms');
                              }}
                              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs text-left transition-colors cursor-pointer ${
                                selectedClassFilter === cls.level
                                  ? 'bg-teal-700 text-white font-bold shadow-xs'
                                  : 'hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <div>
                                <span className="font-bold text-sm">{cls.name}</span>
                                <p className={`text-[10px] ${selectedClassFilter === cls.level ? 'text-teal-100' : 'text-slate-400'}`}>
                                  {cls.subtitle}
                                </p>
                              </div>
                              {selectedClassFilter === cls.level && <Check className="w-4 h-4 text-white" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <button
                  key={link.id}
                  type="button"
                  onClick={() => handleNavClick(link.id)}
                  className={`px-3.5 py-2 rounded-xl text-[13px] font-semibold transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-slate-900 text-white shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* 3. Action Zone */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            
            {/* Search Trigger */}
            <button
              type="button"
              onClick={onSearchClick}
              className="flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-600 text-xs font-medium border border-slate-200/80 transition-all cursor-pointer group"
              title="Search materials, PYQs & MCQs (Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-600 transition-colors" />
              <span className="hidden md:inline text-slate-600">Search Hub...</span>
              <kbd className="hidden lg:inline-block px-1.5 py-0.2 text-[10px] font-mono text-slate-500 bg-white border border-slate-200 rounded shadow-xs">
                ⌘K
              </kbd>
            </button>

            {/* Notification Center */}
            {isAuthenticated && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                  className="p-2 sm:p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors relative cursor-pointer"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white animate-pulse" />
                  )}
                </button>

                {notifDropdownOpen && (
                  <div 
                    onMouseLeave={() => setNotifDropdownOpen(false)}
                    className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-2"
                  >
                    <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded-full">
                          {unreadCount} new
                        </span>
                      )}
                    </div>

                    <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 px-2">
                      {notifications.length === 0 ? (
                        <div className="py-6 px-4 text-center text-slate-400 space-y-1">
                          <p className="text-xs font-medium text-slate-600">No notifications yet</p>
                          <p className="text-[11px] text-slate-400">You are all caught up with portal updates.</p>
                        </div>
                      ) : (
                        notifications.map(n => (
                          <div
                            key={n.id}
                            onClick={() => {
                              markNotificationRead(n.id);
                              if (n.linkTab) setCurrentTab(n.linkTab);
                              setNotifDropdownOpen(false);
                            }}
                            className={`p-2.5 rounded-xl cursor-pointer transition-colors ${
                              !n.isRead ? 'bg-blue-50/70 hover:bg-blue-50' : 'hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-900">{n.title}</span>
                              {!n.isRead && <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
                            </div>
                            <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Profile / Authentication Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200/90 rounded-full transition-all cursor-pointer shadow-xs"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                    {currentUser?.name.charAt(0) || 'S'}
                  </div>
                  <div className="text-left hidden sm:block">
                    <span className="text-xs font-bold text-slate-900 block leading-tight">
                      {currentUser?.name.split(' ')[0]}
                    </span>
                    <span className="text-[10px] font-semibold text-blue-600 block leading-tight">
                      {currentUser?.role === 'admin' ? 'Teacher / Admin' : `Class ${currentUser?.classLevel || studentProfile.classLevel}`}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {profileDropdownOpen && (
                  <div 
                    onMouseLeave={() => setProfileDropdownOpen(false)}
                    className="absolute right-0 mt-2 w-68 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                  >
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900">{currentUser?.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{currentUser?.email}</p>
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200/60 rounded text-[10px] font-bold">
                          ID: {currentUser?.studentId || 'X1024'}
                        </span>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-semibold">
                          Class {currentUser?.classLevel || studentProfile.classLevel}
                        </span>
                      </div>
                    </div>

                    <div className="p-1.5 space-y-0.5">
                      {currentUser?.role === 'admin' ? (
                        <button
                          type="button"
                          onClick={() => {
                            setCurrentTab('admin');
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
                        >
                          <ShieldCheck className="w-4 h-4 text-purple-600" />
                          <span>Admin Control Center</span>
                        </button>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setCurrentTab('dashboard');
                              setProfileDropdownOpen(false);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
                          >
                            <LayoutDashboard className="w-4 h-4 text-blue-600" />
                            <span>Student Dashboard</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              handleNavClick('mytests');
                              setProfileDropdownOpen(false);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
                          >
                            <Award className="w-4 h-4 text-amber-600" />
                            <span>My Tests & Certificates</span>
                          </button>
                        </>
                      )}

                      {currentUser?.role === 'admin' && (
                        <button
                          type="button"
                          onClick={() => {
                            if (userRole === 'student') {
                              setUserRole('admin');
                              setCurrentTab('admin');
                            } else {
                              setUserRole('student');
                              setCurrentTab('dashboard');
                            }
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-purple-700 hover:bg-purple-50 cursor-pointer"
                        >
                          <ShieldCheck className="w-4 h-4 text-purple-600" />
                          <span>Switch to {userRole === 'admin' ? 'Student View' : 'Teacher View'}</span>
                        </button>
                      )}

                      <div className="pt-1 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => {
                            logout();
                            setProfileDropdownOpen(false);
                            setCurrentTab('home');
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentTab('student-login')}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition-all cursor-pointer"
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Student Login</span>
                </button>
                <button
                  type="button"
                  onClick={() => openAuthModal('login')}
                  className="px-3 py-1.5 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 text-xs font-semibold transition-all cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => openAuthModal('register')}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs hover:shadow-sm transition-all cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Register Free</span>
                </button>
              </div>
            )}

            {/* Mobile Menu Trigger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Panel */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-2 duration-150 shadow-lg">
          <div className="grid grid-cols-2 gap-2">
            {navLinks.map(link => (
              <button
                key={link.id}
                type="button"
                onClick={() => handleNavClick(link.id)}
                className={`p-3 rounded-xl text-xs font-semibold text-left transition-all ${
                  currentTab === link.id
                    ? 'bg-slate-900 text-white font-bold'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Mobile Class Quick Selector */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Select Class Filter
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setSelectedClassFilter('ALL');
                  setMobileMenuOpen(false);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                  selectedClassFilter === 'ALL' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 border border-slate-200'
                }`}
              >
                All
              </button>
              {CLASSES_LIST.map(c => (
                <button
                  key={c.level}
                  type="button"
                  onClick={() => {
                    setSelectedClassFilter(c.level as ClassLevel);
                    setCurrentTab('lms');
                    setMobileMenuOpen(false);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                    selectedClassFilter === c.level ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 border border-slate-200'
                  }`}
                >
                  Class {c.level}
                </button>
              ))}
            </div>
          </div>

          {!isAuthenticated && (
            <div className="pt-2 border-t border-slate-100 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setCurrentTab('student-login');
                }}
                className="flex-1 py-2.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold text-center"
              >
                Student Portal / Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  openAuthModal('register');
                }}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold text-center"
              >
                Register Free
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
