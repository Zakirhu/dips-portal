import React, { useState } from 'react';
import { 
  X, 
  GraduationCap, 
  Lock, 
  Mail, 
  User, 
  Hash, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2,
  KeyRound
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ClassLevel } from '../types';
import { CLASSES_LIST } from '../data/curriculumData';
import { Logo } from './Logo';

export const AuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    closeAuthModal, 
    authModalTab, 
    openAuthModal, 
    authNoticeMessage, 
    login, 
    register,
    setStudentPassword,
    sendSupabaseResetEmail
  } = useApp();

  // Login Form
  const [loginEmailOrId, setLoginEmailOrId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Admin Login Form
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  // Register Form
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regStudentId, setRegStudentId] = useState('');
  const [regClass, setRegClass] = useState<ClassLevel>('X');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  // Password Setup / Reset Form
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [resetSuccessMsg, setResetSuccessMsg] = useState('');

  // Status & Error
  const [errorMessage, setErrorMessage] = useState('');
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [isSendingResetLink, setIsSendingResetLink] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!loginEmailOrId.trim()) {
      setErrorMessage('Please enter your registered Email address or Student ID.');
      return;
    }

    const res = login({
      emailOrId: loginEmailOrId,
      password: loginPassword
    });

    if (!res.success) {
      setErrorMessage(res.message || 'Login failed. Please check your credentials.');
    }
  };

  const handleAdminLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!adminEmail.trim()) {
      setErrorMessage('Please enter your administrator email address.');
      return;
    }

    const res = login({
      emailOrId: adminEmail.trim(),
      password: adminPassword,
      role: 'admin'
    });

    if (!res.success) {
      setErrorMessage('Admin login failed. Please verify credentials.');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!regName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!regEmail.trim() || !regEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (regPassword && regPassword !== regConfirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    const res = register({
      name: regName,
      email: regEmail,
      studentId: regStudentId.trim() || `STD-${regClass}${Math.floor(1000 + Math.random() * 9000)}`,
      classLevel: regClass,
      password: regPassword
    });

    if (!res.success) {
      setErrorMessage(res.message || 'Registration failed.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header Graphic */}
        <div className="bg-gradient-to-tr from-blue-700 via-indigo-700 to-purple-800 p-6 text-white relative">
          <button
            onClick={closeAuthModal}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <Logo className="w-12 h-12 shrink-0 drop-shadow-md" />
            <div>
              <h3 className="font-extrabold text-lg text-white">Zakir Learning Hub</h3>
              <p className="text-[11px] text-blue-200">Classes VI–XII • Computer Science & IT</p>
            </div>
          </div>

          {authNoticeMessage && (
            <div className="mt-3 p-2.5 rounded-xl bg-amber-500/20 border border-amber-300/40 text-amber-100 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-300" />
              <span>{authNoticeMessage}</span>
            </div>
          )}
        </div>

        {/* Tab Switcher: Student Login | Register | Admin */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2">
          <button
            onClick={() => {
              setErrorMessage('');
              setIsForgotPassword(false);
              openAuthModal('login');
            }}
            className={`flex-1 py-2.5 text-xs font-bold text-center border-b-2 transition-all cursor-pointer ${
              authModalTab === 'login' && !isForgotPassword
                ? 'border-blue-600 text-blue-600 bg-white rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Student Login
          </button>
          <button
            onClick={() => {
              setErrorMessage('');
              setIsForgotPassword(false);
              openAuthModal('register');
            }}
            className={`flex-1 py-2.5 text-xs font-bold text-center border-b-2 transition-all cursor-pointer ${
              authModalTab === 'register'
                ? 'border-blue-600 text-blue-600 bg-white rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Create Account
          </button>
          <button
            onClick={() => {
              setErrorMessage('');
              setIsForgotPassword(false);
              openAuthModal('admin');
            }}
            className={`flex-1 py-2.5 text-xs font-bold text-center border-b-2 transition-all cursor-pointer ${
              authModalTab === 'admin'
                ? 'border-purple-600 text-purple-700 bg-white rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-purple-700'
            }`}
          >
            Admin Sign In
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 space-y-6">

          {/* 1. FORGOT PASSWORD / EMAIL RESET LINK VIA SUPABASE AUTH / DIRECT CREATION */}
          {isForgotPassword ? (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Forgot / Set Student Password 🔑</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Send a secure password reset link to your registered email via Supabase Auth, or set your password directly below.
                </p>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {resetSuccessMsg ? (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 space-y-3 text-xs">
                  <div className="flex items-center gap-2 font-bold text-emerald-900">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>Success!</span>
                  </div>
                  <p className="leading-relaxed">{resetSuccessMsg}</p>
                  <button
                    onClick={() => {
                      setIsForgotPassword(false);
                      setResetSuccessMsg('');
                      setErrorMessage('');
                    }}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow transition-all cursor-pointer"
                  >
                    Back to Student Sign In
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Registered Email or Student ID
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        required
                        value={loginEmailOrId}
                        onChange={(e) => setLoginEmailOrId(e.target.value)}
                        placeholder="e.g. username@school.edu or STD-X-1024"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Option 1: Send Secure Email Reset Link via Supabase Auth */}
                  <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                        <Mail className="w-4 h-4 text-blue-600" />
                        <span>Supabase Auth Email Reset Link</span>
                      </span>
                      <span className="text-[10px] font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Secure Link</span>
                    </div>
                    <p className="text-[11px] text-blue-800/80">
                      Dispatches an official password reset link directly to the student&apos;s email address via Supabase Auth.
                    </p>
                    <button
                      type="button"
                      disabled={isSendingResetLink}
                      onClick={async () => {
                        setErrorMessage('');
                        if (!loginEmailOrId.trim()) {
                          setErrorMessage('Please enter your registered Email address or Student ID.');
                          return;
                        }
                        setIsSendingResetLink(true);
                        const res = await sendSupabaseResetEmail(loginEmailOrId);
                        setIsSendingResetLink(false);
                        if (res.success) {
                          setResetSuccessMsg(res.message);
                        } else {
                          setErrorMessage(res.message);
                        }
                      }}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>{isSendingResetLink ? 'Sending Reset Link...' : 'Send Secure Email Reset Link'}</span>
                    </button>
                  </div>

                  <div className="relative flex items-center justify-center my-2">
                    <div className="border-t border-slate-200 w-full"></div>
                    <span className="bg-white px-2 text-[10px] text-slate-400 font-bold uppercase shrink-0">or set password directly</span>
                    <div className="border-t border-slate-200 w-full"></div>
                  </div>

                  {/* Option 2: Direct Password Creation */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setErrorMessage('');
                      if (!loginEmailOrId.trim()) {
                        setErrorMessage('Please enter your registered Email or Student ID.');
                        return;
                      }
                      if (!newPasswordInput.trim() || newPasswordInput.trim().length < 3) {
                        setErrorMessage('Please enter a new password (at least 3 characters).');
                        return;
                      }

                      const res = setStudentPassword(loginEmailOrId, newPasswordInput);
                      if (res.success) {
                        setResetSuccessMsg(res.message);
                        setLoginPassword(newPasswordInput);
                      } else {
                        setErrorMessage(res.message);
                      }
                    }}
                    className="space-y-3"
                  >
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        New Password (Instant Setup)
                      </label>
                      <div className="relative">
                        <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                        <input
                          type="password"
                          value={newPasswordInput}
                          onChange={(e) => setNewPasswordInput(e.target.value)}
                          placeholder="Enter new password"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="submit"
                        className="flex-1 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <KeyRound className="w-4 h-4 text-emerald-400" />
                        <span>Save Password Directly</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsForgotPassword(false);
                          setErrorMessage('');
                        }}
                        className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          ) : authModalTab === 'admin' ? (
            /* 2. ADMIN AUTHENTICATION */
            <div className="space-y-5">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-purple-600 uppercase tracking-wider mb-1">
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  <span>Educator / Administrator Access</span>
                </div>
                <h2 className="text-2xl font-black text-slate-900">
                  Admin Sign In
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Authorized access for Zakir Hussain to manage curriculum, publish tests, and review student progress.
                </p>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleAdminLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Admin Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      required
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="Enter administrator email address"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-purple-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="Enter administrator password"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-purple-600 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Enter Administrator Control Center</span>
                </button>
              </form>
            </div>
          ) : authModalTab === 'login' ? (
            /* 3. STUDENT LOGIN */
            <div className="space-y-5">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Student Portal</span>
                </div>
                <h2 className="text-2xl font-black text-slate-900">
                  Welcome Back 👋
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Sign in to continue your learning journey.
                </p>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Username, Email, or Roll No
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      value={loginEmailOrId}
                      onChange={(e) => setLoginEmailOrId(e.target.value)}
                      placeholder="e.g. username, email@school.edu, or Roll No"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsForgotPassword(true)}
                      className="text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                    >
                      First-Time Login / Set Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    <span>Remember me</span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Login</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Quick Switch to Register */}
              <div className="text-center pt-2 border-t border-slate-100">
                <p className="text-xs text-slate-500">
                  New student?{' '}
                  <button
                    onClick={() => {
                      setErrorMessage('');
                      openAuthModal('register');
                    }}
                    className="font-bold text-blue-600 hover:underline cursor-pointer"
                  >
                    Create Account
                  </button>
                </p>
              </div>
            </div>
          ) : (
            /* 4. STUDENT REGISTRATION */
            <div className="space-y-5">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Student Registration</span>
                </div>
                <h2 className="text-2xl font-black text-slate-900">
                  Create Account 🚀
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Join Zakir Learning Hub to access full tests and save your results.
                </p>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="e.g. Your Full Name"
                      className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="e.g. yourname@gmail.com"
                      className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Student ID / Roll
                    </label>
                    <div className="relative">
                      <Hash className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={regStudentId}
                        onChange={(e) => setRegStudentId(e.target.value)}
                        placeholder="e.g. Roll No."
                        className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Class Level *
                    </label>
                    <select
                      value={regClass}
                      onChange={(e) => setRegClass(e.target.value as ClassLevel)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white"
                    >
                      {CLASSES_LIST.map(c => (
                        <option key={c.level} value={c.level}>
                          Class {c.level}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="password"
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Confirm *
                    </label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="password"
                        required
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <span>Complete Registration & Go to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="text-center pt-2 border-t border-slate-100">
                <p className="text-xs text-slate-500">
                  Already registered?{' '}
                  <button
                    onClick={() => {
                      setErrorMessage('');
                      openAuthModal('login');
                    }}
                    className="font-bold text-blue-600 hover:underline cursor-pointer"
                  >
                    Sign In
                  </button>
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
