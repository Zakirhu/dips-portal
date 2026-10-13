import React, { useState } from 'react';
import { 
  GraduationCap, 
  Lock, 
  User, 
  Mail, 
  KeyRound, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  HelpCircle,
  Hash,
  School,
  BookOpen
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Logo } from '../Logo';
import { SEO } from '../SEO';

interface StudentLoginViewProps {
  onSuccessRedirect?: (tab: string) => void;
  onNavigateHome?: () => void;
  onBackHome?: () => void;
  onLoginSuccess?: () => void;
  onSwitchToAdmin?: () => void;
}

export const StudentLoginView: React.FC<StudentLoginViewProps> = ({
  onSuccessRedirect,
  onNavigateHome,
  onBackHome,
  onLoginSuccess,
  onSwitchToAdmin
}) => {
  const { 
    login, 
    setStudentPassword, 
    sendSupabaseResetEmail, 
    registeredStudents, 
    openAuthModal,
    isAuthenticated,
    studentProfile
  } = useApp();

  // Login form state
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Status & notifications
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Tab: 'login' | 'forgot'
  const [activeMode, setActiveMode] = useState<'login' | 'forgot'>('login');

  // Password reset fields
  const [resetIdentifier, setResetIdentifier] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isSendingResetEmail, setIsSendingResetEmail] = useState(false);

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!identifier.trim()) {
      setErrorMessage('Please enter your Student Username, Registered Email, or Roll Number.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Try local context authentication
      const res = login({
        emailOrId: identifier.trim(),
        password: password.trim()
      });

      if (res.success) {
        setSuccessMessage('Login successful! Redirecting to your Student Dashboard...');
        setTimeout(() => {
          if (onLoginSuccess) {
            onLoginSuccess();
          } else if (onSuccessRedirect) {
            onSuccessRedirect('dashboard');
          }
        }, 400);
      } else {
        setErrorMessage(res.message || 'Invalid credentials. Please verify your username, email, or roll number.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during authentication. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!resetIdentifier.trim()) {
      setErrorMessage('Please enter your Student Username, Email, or Roll Number.');
      return;
    }

    if (!newPassword || newPassword.length < 3) {
      setErrorMessage('New password must be at least 3 characters long.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setErrorMessage('Passwords do not match. Please verify.');
      return;
    }

    setIsLoading(true);
    const res = setStudentPassword(resetIdentifier.trim(), newPassword.trim());
    setIsLoading(false);

    if (res.success) {
      setSuccessMessage(`${res.message} You can now sign in with your new password!`);
      setIdentifier(resetIdentifier.trim());
      setPassword(newPassword.trim());
      setTimeout(() => {
        setActiveMode('login');
      }, 1500);
    } else {
      setErrorMessage(res.message);
    }
  };

  const handleSendResetEmail = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (!resetIdentifier.trim()) {
      setErrorMessage('Please enter your registered email address.');
      return;
    }

    setIsSendingResetEmail(true);
    const res = await sendSupabaseResetEmail(resetIdentifier.trim());
    setIsSendingResetEmail(false);

    if (res.success) {
      setSuccessMessage(res.message);
    } else {
      setErrorMessage(res.message);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-slate-50 relative overflow-hidden">
      <SEO 
        title="Student Portal Login | Learn with Zakir"
        description="Secure student login for CBSE Classes VI–XII Computer Science, IT 402, IP 065, and Typography 817. Access notes, PYQs, and online exams."
      />

      {/* Background Decorative Rings */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full space-y-6 relative z-10">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div 
            onClick={onNavigateHome}
            className="inline-flex items-center gap-3 cursor-pointer group"
          >
            <Logo className="w-12 h-12 group-hover:scale-105 transition-transform drop-shadow-sm" />
            <div className="text-left">
              <h1 className="text-xl font-black tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                Learn with Zakir
              </h1>
              <p className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">
                Student Examination & Academic Hub
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-500 max-w-sm mx-auto pt-1">
            Sign in to access your assigned class syllabus, chapter notes, practical codes, and online examination hall.
          </p>
        </div>

        {/* Card Box */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/90 space-y-6">
          
          {/* Tabs: Sign In | Reset Password */}
          <div className="flex border-b border-slate-200 pb-1">
            <button
              type="button"
              onClick={() => {
                setActiveMode('login');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className={`flex-1 py-2 text-xs font-bold text-center border-b-2 transition-all cursor-pointer ${
                activeMode === 'login'
                  ? 'border-blue-600 text-blue-700 bg-blue-50/50 rounded-t-xl'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Student Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveMode('forgot');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className={`flex-1 py-2 text-xs font-bold text-center border-b-2 transition-all cursor-pointer ${
                activeMode === 'forgot'
                  ? 'border-blue-600 text-blue-700 bg-blue-50/50 rounded-t-xl'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Reset / First-Time Password
            </button>
          </div>

          {/* Feedback Alerts */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <div className="leading-relaxed font-medium">{errorMessage}</div>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
              <div className="leading-relaxed font-medium">{successMessage}</div>
            </div>
          )}

          {/* MODE 1: LOGIN FORM */}
          {activeMode === 'login' && (
            <form onSubmit={handleStudentLogin} className="space-y-4">
              
              {/* Field: Username / Email / Roll Number */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Username, Email, or Roll Number
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. username, student@school.edu, or Roll Number"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden font-medium"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  You can use your assigned username, registered email, or roll/admission number.
                </p>
              </div>

              {/* Field: Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveMode('forgot');
                      setResetIdentifier(identifier);
                    }}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your student password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Help */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600 font-medium">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                  />
                  <span>Remember this workstation</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-black shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                {isLoading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <GraduationCap className="w-4 h-4" />
                    <span>Sign In to Student Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* MODE 2: FORGOT / FIRST TIME PASSWORD SETUP */}
          {activeMode === 'forgot' && (
            <form onSubmit={handleResetSubmit} className="space-y-4">
              <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-2xl text-[11px] text-blue-900 leading-relaxed">
                <div className="font-bold flex items-center gap-1.5 mb-0.5">
                  <KeyRound className="w-3.5 h-3.5 text-blue-600" />
                  <span>Student Self-Service Password Setup</span>
                </div>
                Enter your Username, Registered Email, or Roll ID below to configure your login password or receive an official reset link.
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Student Username, Email, or Roll ID
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={resetIdentifier}
                    onChange={(e) => setResetIdentifier(e.target.value)}
                    placeholder="e.g. username, student@school.edu, or Roll Number"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 3 characters"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Re-type password"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-1 space-y-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Update Student Password Now</span>
                </button>

                <button
                  type="button"
                  disabled={isSendingResetEmail}
                  onClick={handleSendResetEmail}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5 text-blue-600" />
                  <span>{isSendingResetEmail ? 'Sending Email...' : 'Send Secure Supabase Email Link'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Security & Role Separation Notice */}
          <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-2xl text-[11px] text-amber-900 leading-relaxed flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0 text-amber-700 mt-0.5" />
            <div>
              <span className="font-bold">Role Access Isolation: </span>
              Students can only view study materials and test results assigned to their class. Administrative functions, student enrollment, and examination authoring are restricted to authorized educators.
            </div>
          </div>

          {/* Admin CMS Link */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                if (onSwitchToAdmin) onSwitchToAdmin();
                else openAuthModal('admin', 'Administrator sign-in for CMS and student management.');
              }}
              className="text-xs font-semibold text-slate-500 hover:text-purple-700 transition-colors cursor-pointer"
            >
              Are you an Educator / Teacher? <span className="underline font-bold text-purple-700">Admin Portal Sign In</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
