import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Shield,
  BookOpen,
  UserCheck,
  Lock,
  User,
  ArrowRight,
  AlertCircle,
  Building,
  School,
  CheckCircle2,
  UserPlus,
  ArrowLeft,
  Mail,
  Phone,
  Briefcase,
  Layers,
  Sparkles,
} from 'lucide-react';
import type { UserRole, User as UserType, Branch, AcademicClass, Subject } from '../types.js';
import { api, setStoredAuth } from '../lib/api.js';

interface LoginPageProps {
  onLoginSuccess: (user: UserType) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [username, setUsername] = useState('dipsbegowal@gmail.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Metadata for teacher registration
  const [branches, setBranches] = useState<Branch[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<AcademicClass[]>([]);

  // Teacher Registration Form State
  const [regForm, setRegForm] = useState({
    fullName: '',
    email: '',
    employeeId: '',
    password: '',
    confirmPassword: '',
    branchId: '',
    designation: 'TGT Teacher',
    phone: '',
    assignedSubjectIds: [] as string[],
    assignedClassIds: [] as string[],
  });

  useEffect(() => {
    api
      .getBranches()
      .then((res) => {
        setBranches(res.branches);
        if (res.branches.length > 0) {
          setRegForm((prev) => ({
            ...prev,
            branchId: prev.branchId || res.branches[0].id,
          }));
        }
      })
      .catch(() => {});

    api
      .getSubjects()
      .then((res) => setSubjects(res.subjects))
      .catch(() => {});

    api
      .getClasses()
      .then((res) => setClasses(res.classes))
      .catch(() => {});
  }, []);

  // Set default placeholder/value when role changes
  useEffect(() => {
    setError('');
    setSuccessMsg('');
    if (selectedRole === 'admin') {
      setUsername('dipsbegowal@gmail.com');
      setPassword('');
    } else {
      setUsername('');
      setPassword('');
    }
  }, [selectedRole]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter your credentials.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccessMsg('');
      const res = await api.login({
        username,
        password,
        expectedRole: selectedRole,
      });
      setStoredAuth(res.token, res.user);
      onLoginSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleTeacherRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regForm.fullName.trim() || !regForm.email.trim() || !regForm.password.trim()) {
      setError('Please fill in your full name, email, and password.');
      return;
    }

    if (regForm.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (regForm.password !== regForm.confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccessMsg('');

      const res = await api.registerTeacher({
        fullName: regForm.fullName.trim(),
        email: regForm.email.trim(),
        employeeId: regForm.employeeId.trim() || undefined,
        password: regForm.password,
        branchId: regForm.branchId || branches[0]?.id,
        designation: regForm.designation.trim() || 'TGT Teacher',
        phone: regForm.phone.trim() || undefined,
        assignedSubjectIds: regForm.assignedSubjectIds,
        assignedClassIds: regForm.assignedClassIds,
      });

      setSuccessMsg(
        `Account created successfully for ${res.user.fullName} (${res.user.employeeId})! You can now log in or enter immediately.`
      );

      // Pre-fill the login form with newly created account credentials
      setUsername(res.user.employeeId || res.user.email);
      setPassword(regForm.password);

      // Automatically store auth and log them in, or let them click
      setStoredAuth(res.token, res.user);
      setTimeout(() => {
        onLoginSuccess(res.user);
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your information.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-between text-slate-100 relative overflow-hidden">
      {/* Background Subtle Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.25),rgba(255,255,255,0))] pointer-events-none" />

      {/* Top Banner / Branding */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 pt-8 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-white p-1.5 flex items-center justify-center shadow-lg border border-indigo-400/30 shrink-0">
            <img
              src="/dips-logo.png"
              alt="DIPS Institutions Logo"
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
              DIPS INSTITUTIONS
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                Central Portal
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Centralized Learning & Content Sharing Network for All Branches
            </p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <Building className="w-4 h-4 text-indigo-400" /> 5 DIPS Branches Connected
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <School className="w-4 h-4 text-amber-400" /> Academic Year 2026-27
          </span>
        </div>
      </div>

      {/* Center Card */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div
          className={`w-full ${
            isRegisterMode ? 'max-w-xl' : 'max-w-md'
          } bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transition-all duration-300`}
        >
          {/* Card Header */}
          <div className="p-6 pb-4 text-center border-b border-slate-100 bg-slate-50/50 flex flex-col items-center">
            <div className="w-16 h-16 mb-2.5 bg-white p-1 rounded-2xl shadow-md border border-slate-200/80 flex items-center justify-center">
              <img
                src="/dips-logo.png"
                alt="DIPS Institutions Crest"
                className="w-full h-full object-contain hover:scale-105 transition-transform"
                referrerPolicy="no-referrer"
              />
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              {isRegisterMode ? 'Faculty Self-Registration' : 'Centralized Portal Login'}
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-md">
              {isRegisterMode
                ? 'Create your institutional faculty account, select your campus branch, and choose your teaching subjects & classes.'
                : 'Select your institutional role to access your dedicated workspace'}
            </p>

            {/* Role Selection Tabs (Only shown in Login Mode) */}
            {!isRegisterMode && (
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-200/70 rounded-xl mt-4 w-full">
                <button
                  type="button"
                  onClick={() => setSelectedRole('teacher')}
                  className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    selectedRole === 'teacher'
                      ? 'bg-white text-indigo-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Teacher</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole('student')}
                  className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    selectedRole === 'student'
                      ? 'bg-white text-emerald-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Student</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole('admin')}
                  className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    selectedRole === 'admin'
                      ? 'bg-white text-amber-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5 text-amber-600" />
                  <span>Admin</span>
                </button>
              </div>
            )}

            {/* Teacher Mode Sub-Toggle (Sign In vs Register Account) */}
            {selectedRole === 'teacher' && (
              <div className="flex items-center gap-2 mt-3 p-1 bg-indigo-50/80 rounded-lg border border-indigo-100 text-xs w-full max-w-xs">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegisterMode(false);
                    setError('');
                  }}
                  className={`flex-1 py-1 px-2 font-bold rounded-md transition-all ${
                    !isRegisterMode
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-indigo-800 hover:text-indigo-950'
                  }`}
                >
                  Teacher Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsRegisterMode(true);
                    setError('');
                  }}
                  className={`flex-1 py-1 px-2 font-bold rounded-md transition-all flex items-center justify-center gap-1 ${
                    isRegisterMode
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-indigo-800 hover:text-indigo-950'
                  }`}
                >
                  <UserPlus className="w-3 h-3" />
                  <span>Create Account</span>
                </button>
              </div>
            )}
          </div>

          {/* Success Banner */}
          {successMsg && (
            <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Account Ready!</strong>
                <span>{successMsg}</span>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* A. TEACHER REGISTRATION FORM */}
          {isRegisterMode ? (
            <form onSubmit={handleTeacherRegistration} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={regForm.fullName}
                      onChange={(e) => setRegForm({ ...regForm, fullName: e.target.value })}
                      placeholder="e.g. Mrs. Jaspreet Kaur"
                      className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 text-xs"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="email"
                      value={regForm.email}
                      onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                      placeholder="e.g. jaspreet.k@dips.edu.in"
                      className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 text-xs"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Campus Branch <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Building className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                    <select
                      value={regForm.branchId}
                      onChange={(e) => setRegForm({ ...regForm, branchId: e.target.value })}
                      className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 text-xs"
                      required
                    >
                      {branches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name} ({b.city})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Employee ID <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={regForm.employeeId}
                    onChange={(e) => setRegForm({ ...regForm, employeeId: e.target.value })}
                    placeholder="Leave blank to auto-assign"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Academic Designation
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={regForm.designation}
                      onChange={(e) => setRegForm({ ...regForm, designation: e.target.value })}
                      placeholder="e.g. PGT Science / TGT Math"
                      className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Contact Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="tel"
                      value={regForm.phone}
                      onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Set Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="password"
                      value={regForm.password}
                      onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                      placeholder="Min 6 characters"
                      className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 text-xs"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Confirm Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="password"
                      value={regForm.confirmPassword}
                      onChange={(e) => setRegForm({ ...regForm, confirmPassword: e.target.value })}
                      placeholder="Re-enter password"
                      className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 text-xs"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Subject Selection */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700">
                    Teaching Subjects (Select one or more)
                  </label>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {regForm.assignedSubjectIds.length} Selected
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded-lg max-h-28 overflow-y-auto">
                  {subjects.map((sub) => {
                    const isChecked = regForm.assignedSubjectIds.includes(sub.id);
                    return (
                      <button
                        type="button"
                        key={sub.id}
                        onClick={() => {
                          const cur = regForm.assignedSubjectIds;
                          setRegForm({
                            ...regForm,
                            assignedSubjectIds: isChecked
                              ? cur.filter((id) => id !== sub.id)
                              : [...cur, sub.id],
                          });
                        }}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-all flex items-center gap-1 ${
                          isChecked
                            ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
                        }`}
                      >
                        <span>{sub.name}</span>
                        {isChecked && <CheckCircle2 className="w-3 h-3" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Class Selection */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700">
                    Teaching Classes (Select all that apply)
                  </label>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {regForm.assignedClassIds.length} Selected
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded-lg">
                  {classes.map((cls) => {
                    const isChecked = regForm.assignedClassIds.includes(cls.id);
                    return (
                      <button
                        type="button"
                        key={cls.id}
                        onClick={() => {
                          const cur = regForm.assignedClassIds;
                          setRegForm({
                            ...regForm,
                            assignedClassIds: isChecked
                              ? cur.filter((id) => id !== cls.id)
                              : [...cur, cls.id],
                          });
                        }}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-all flex items-center gap-1 ${
                          isChecked
                            ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
                        }`}
                      >
                        <span>{cls.code || cls.name}</span>
                        {isChecked && <CheckCircle2 className="w-3 h-3" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{loading ? 'Registering Account...' : 'Create Faculty Account & Enter Portal'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsRegisterMode(false)}
                  className="w-full py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Already registered? Back to Teacher Sign In</span>
                </button>
              </div>
            </form>
          ) : (
            /* B. STANDARD SIGN IN FORM */
            <form onSubmit={handleLogin} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {selectedRole === 'teacher'
                    ? 'Teacher Employee ID / Email'
                    : selectedRole === 'student'
                    ? 'Student ID / Admission Number'
                    : 'Administrator Username / Email'}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={
                      selectedRole === 'teacher'
                        ? 'e.g. Employee ID or registered email'
                        : selectedRole === 'student'
                        ? 'e.g. Admission / Roll No.'
                        : 'dipsbegowal@gmail.com'
                    }
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">Password</label>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {selectedRole === 'admin' ? 'Authorized Admin Access' : 'Institutional Credentials'}
                  </span>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2.5 text-xs font-bold text-white rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 ${
                  selectedRole === 'teacher'
                    ? 'bg-indigo-600 hover:bg-indigo-700'
                    : selectedRole === 'student'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-amber-600 hover:bg-amber-700'
                } disabled:opacity-50`}
              >
                <span>{loading ? 'Authenticating...' : `Enter ${selectedRole.toUpperCase()} Portal`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Teacher Self-Registration Callout inside login form */}
              {selectedRole === 'teacher' && (
                <div className="pt-2 text-center border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegisterMode(true);
                      setError('');
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>New DIPS Faculty Member? Create your account here</span>
                  </button>
                </div>
              )}
            </form>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-4 text-center text-xs text-slate-500">
        <p>© 2026 DIPS Chain of Institutions • Central Academic Directorate & Resource Management System</p>
      </div>
    </div>
  );
};
