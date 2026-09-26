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
  Award,
  Globe2,
  FileText,
  Users,
  Check,
  ChevronRight,
  Download,
  Share2,
  Flame,
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  Search,
  MapPin,
  X,
  Eye,
  EyeOff,
  KeyRound,
  Sparkle,
} from 'lucide-react';
import type { UserRole, User as UserType, Branch, AcademicClass, Subject } from '../types.js';
import { api, setStoredAuth } from '../lib/api.js';

interface LoginPageProps {
  onLoginSuccess: (user: UserType) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Branch showcase interactive state
  const [branchSearch, setBranchSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState<'all' | 'colleges' | 'jalandhar' | 'hoshiarpur' | 'kapurthala' | 'amritsar_gurdaspur'>('all');

  // Metadata for teacher registration & display
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

  // Reset inputs when role changes
  useEffect(() => {
    setError('');
    setSuccessMsg('');
    setUsername('');
    setPassword('');
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

      // Automatically store auth and log them in
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white font-sans antialiased relative overflow-x-hidden">
      {/* Dynamic Background Glowing Meshes */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[600px] h-[600px] bg-amber-500/15 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[20%] w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* =========================================================
          TOP INSTITUTIONAL BRANDING HEADER
          ========================================================= */}
      <header className="relative z-20 w-full border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-white p-1.5 flex items-center justify-center shadow-xl shadow-indigo-950/60 border border-white/30 shrink-0 transform transition-transform hover:scale-105">
              <img
                src="/dips-logo.png"
                alt="DIPS Institutions Logo"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-2xl font-black tracking-tight text-white truncate flex items-center gap-2">
                  DIPS INSTITUTIONS
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] uppercase font-black tracking-widest px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-xs">
                  <Sparkles className="w-2.5 h-2.5" /> Central Portal
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 font-medium tracking-wide truncate">
                Centralized Academic Directorate & Resource Network
              </p>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-6 text-xs text-slate-300">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
              <Building className="w-4 h-4 text-indigo-400" />
              <span className="font-semibold">{branches.length || 19} Connected Campuses & Institutions</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
              <School className="w-4 h-4 text-amber-400" />
              <span className="font-semibold">Session 2026-27</span>
            </div>
          </div>
        </div>
      </header>

      {/* =========================================================
          MAIN HERO & PORTAL LOGIN CONTAINER
          ========================================================= */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col lg:flex-row items-center justify-between gap-12">
        {/* LEFT COLUMN: INSTITUTIONAL SHOWCASE & VALUE PROPOSITION */}
        <div className="w-full lg:flex-1 space-y-8 text-left max-w-2xl min-w-0">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/25 text-indigo-300 text-[11px] sm:text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>✨ Unified Academic Excellence</span>
            </div>

            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-snug sm:leading-tight break-words">
              <span className="text-[#F8FAFF]">One Network.</span>{' '}
              <span className="text-[#4F6BFF]">One Standard.</span>{' '}
              <span className="text-[#F5B82E]">One DIPS.</span>
            </h2>

            <div className="space-y-2">
              <h3 className="text-base sm:text-lg font-bold text-[#F8FAFF] tracking-wide">
                Empowering Every Campus with One Unified Academic Platform
              </h3>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
                Connect teachers, students, and academic leaders across DIPS Institutions through one centralized ecosystem for curriculum, lesson plans, learning resources, assessments, and collaboration.
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => {
                const el = document.getElementById('campus-explorer');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Building className="w-4 h-4" />
              <span>Explore the Network</span>
            </button>
            <button
              onClick={() => {
                setSelectedRole('teacher');
                setIsRegisterMode(false);
                const el = document.getElementById('login-card');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-5 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 text-slate-200 hover:text-white font-bold text-xs sm:text-sm border border-slate-700 transition-all flex items-center gap-2 cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <span>Faculty Login</span>
            </button>
          </div>

          {/* Connected Campuses Badges - Professional Institutional Showcase */}
          {(() => {
            const fallbackList = [
              { id: 'branch-dipsimt', name: 'DIPS Institute of Management & Technology (DIPSIMT)', code: 'DIPSIMT', city: 'Jalandhar', type: 'college' },
              { id: 'branch-poly-tanda', name: 'DIPS Polytechic College (Tanda)', code: 'DPC-TAN', city: 'Tanda, Hoshiarpur', type: 'college' },
              { id: 'branch-gilzian', name: 'DIPS School, Gilzian (Hoshiarpur)', code: 'GIL', city: 'Gilzian, Hoshiarpur', type: 'school' },
              { id: 'branch-urban-estate', name: 'DIPS School, Urban Estate Phase-1', code: 'UE-1', city: 'Jalandhar', type: 'school' },
              { id: 'branch-suranussi', name: 'DIPS School, Suranussi', code: 'SUR', city: 'Suranussi, Jalandhar', type: 'school' },
              { id: 'branch-karol-bagh', name: 'DIPS School, Karol Bagh', code: 'KB', city: 'Karol Bagh, Jalandhar', type: 'school' },
              { id: 'branch-blooming-dales', name: 'DIPS Blooming Dales Public School', code: 'BDPS', city: 'Begowal, Kapurthala', type: 'school' },
              { id: 'branch-bhogpur', name: 'DIPS School, Bhogpur', code: 'BHG', city: 'Bhogpur, Jalandhar', type: 'school' },
              { id: 'branch-mehatpur', name: 'DIPS School, Mehatpur', code: 'MHT-JAL', city: 'Mehatpur, Jalandhar', type: 'school' },
              { id: 'branch-nurmahal', name: 'DIPS School, Nurmahal', code: 'NUR', city: 'Nurmahal, Jalandhar', type: 'school' },
              { id: 'branch-uggi', name: 'DIPS School, Uggi', code: 'UGG', city: 'Uggi, Jalandhar', type: 'school' },
              { id: 'branch-batala', name: 'DIPS School, Batala (Gurdaspur)', code: 'BAT', city: 'Batala, Gurdaspur', type: 'school' },
              { id: 'branch-begowal', name: 'DIPS School, Begowal (Kapurthala)', code: 'BEG', city: 'Begowal, Kapurthala', type: 'school' },
              { id: 'branch-dhilwan', name: 'DIPS School, Dhilwan (Kapurthala)', code: 'DHL', city: 'Dhilwan, Kapurthala', type: 'school' },
              { id: 'branch-hariana', name: 'DIPS School, Hariana (Hoshiarpur)', code: 'HAR', city: 'Hariana, Hoshiarpur', type: 'school' },
              { id: 'branch-kapurthala', name: 'DIPS School, Kapurthala', code: 'KAP', city: 'Kapurthala', type: 'school' },
              { id: 'branch-mehta-chowk', name: 'DIPS School, Mehta Chowk (Amritsar)', code: 'MHT-ASR', city: 'Mehta Chowk, Amritsar', type: 'school' },
              { id: 'branch-rayya', name: 'DIPS School, Rayya (Amritsar)', code: 'RAY', city: 'Rayya, Amritsar', type: 'school' },
              { id: 'branch-tanda', name: 'DIPS School, Tanda (Hoshiarpur)', code: 'TAN', city: 'Tanda, Hoshiarpur', type: 'school' },
            ];

            const activeBranches = (branches.length > 0 ? branches : fallbackList)
              .map((b) => {
                const isCollege =
                  b.name.toLowerCase().includes('college') ||
                  b.name.toLowerCase().includes('institute') ||
                  b.name.toLowerCase().includes('polytech');
                let region = 'other';
                const lowerCity = (b.city || '').toLowerCase();
                const lowerName = b.name.toLowerCase();
                if (
                  lowerCity.includes('jalandhar') ||
                  lowerName.includes('jalandhar') ||
                  lowerName.includes('urban estate') ||
                  lowerName.includes('suranussi') ||
                  lowerName.includes('karol bagh') ||
                  lowerName.includes('bhogpur') ||
                  lowerName.includes('mehatpur') ||
                  lowerName.includes('nurmahal') ||
                  lowerName.includes('uggi')
                ) {
                  region = 'jalandhar';
                } else if (
                  lowerCity.includes('hoshiarpur') ||
                  lowerCity.includes('tanda') ||
                  lowerCity.includes('hariana') ||
                  lowerCity.includes('gilzian') ||
                  lowerName.includes('hoshiarpur') ||
                  lowerName.includes('tanda') ||
                  lowerName.includes('hariana') ||
                  lowerName.includes('gilzian')
                ) {
                  region = 'hoshiarpur';
                } else if (
                  lowerCity.includes('kapurthala') ||
                  lowerCity.includes('begowal') ||
                  lowerCity.includes('dhilwan') ||
                  lowerName.includes('kapurthala') ||
                  lowerName.includes('begowal') ||
                  lowerName.includes('dhilwan') ||
                  lowerName.includes('blooming dales')
                ) {
                  region = 'kapurthala';
                } else if (
                  lowerCity.includes('amritsar') ||
                  lowerCity.includes('gurdaspur') ||
                  lowerCity.includes('batala') ||
                  lowerCity.includes('mehta') ||
                  lowerCity.includes('rayya') ||
                  lowerName.includes('amritsar') ||
                  lowerName.includes('gurdaspur') ||
                  lowerName.includes('batala') ||
                  lowerName.includes('mehta') ||
                  lowerName.includes('rayya')
                ) {
                  region = 'amritsar_gurdaspur';
                }

                return {
                  ...b,
                  isCollege,
                  region,
                };
              });

            const filteredBranches = activeBranches.filter(b => {
              // Region Filter
              if (branchFilter === 'colleges' && !b.isCollege) return false;
              if (branchFilter === 'jalandhar' && b.region !== 'jalandhar') return false;
              if (branchFilter === 'hoshiarpur' && b.region !== 'hoshiarpur') return false;
              if (branchFilter === 'kapurthala' && b.region !== 'kapurthala') return false;
              if (branchFilter === 'amritsar_gurdaspur' && b.region !== 'amritsar_gurdaspur') return false;

              // Search Filter
              if (branchSearch.trim()) {
                const query = branchSearch.toLowerCase();
                return b.name.toLowerCase().includes(query) || (b.city || '').toLowerCase().includes(query) || (b.code || '').toLowerCase().includes(query);
              }
              return true;
            });

            return (
              <div id="campus-explorer" className="rounded-2xl bg-slate-900/80 border border-slate-800/90 backdrop-blur-md p-4 space-y-3.5 shadow-xl shadow-slate-950/40">
                {/* Header & Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0">
                      <Building className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white tracking-wide">
                          DIPS Institutional Network
                        </span>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          {activeBranches.length} Campuses
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Colleges, Polytechnics & CBSE Senior Secondary Schools
                      </p>
                    </div>
                  </div>

                  {/* Search Input */}
                  <div className="relative min-w-[170px] sm:w-48">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      value={branchSearch}
                      onChange={(e) => setBranchSearch(e.target.value)}
                      placeholder="Search campus or city..."
                      className="w-full pl-8 pr-7 py-1.5 rounded-lg bg-slate-950/70 border border-slate-700/80 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                    />
                    {branchSearch && (
                      <button
                        onClick={() => setBranchSearch('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                        title="Clear search"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-800 text-[11px]">
                  {[
                    { key: 'all', label: `All (${activeBranches.length})` },
                    { key: 'colleges', label: `Colleges & Institutes (${activeBranches.filter(b => b.isCollege).length})` },
                    { key: 'jalandhar', label: `Jalandhar (${activeBranches.filter(b => b.region === 'jalandhar').length})` },
                    { key: 'hoshiarpur', label: `Hoshiarpur (${activeBranches.filter(b => b.region === 'hoshiarpur').length})` },
                    { key: 'kapurthala', label: `Kapurthala (${activeBranches.filter(b => b.region === 'kapurthala').length})` },
                    { key: 'amritsar_gurdaspur', label: `Amritsar & Gurdaspur (${activeBranches.filter(b => b.region === 'amritsar_gurdaspur').length})` },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setBranchFilter(tab.key as any)}
                      className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer ${
                        branchFilter === tab.key
                          ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                          : 'bg-slate-800/70 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Branch Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-700">
                  {filteredBranches.length > 0 ? (
                    filteredBranches.map((c) => {
                      const displayName = c.name.replace(/^DIPS School,\s*/, '').replace(/^DIPS\s*/, '');
                      return (
                        <div
                          key={c.id}
                          className={`group p-2.5 rounded-xl border transition-all duration-200 flex items-start gap-2.5 ${
                            c.isCollege
                              ? 'bg-gradient-to-r from-amber-500/10 to-indigo-500/10 border-amber-500/30 hover:border-amber-400/60 shadow-xs'
                              : 'bg-slate-950/60 border-slate-800/90 hover:border-indigo-500/40 hover:bg-slate-900/90'
                          }`}
                        >
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                              c.isCollege
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : 'bg-slate-800 text-slate-300 border border-slate-700 group-hover:text-indigo-400 group-hover:border-indigo-500/30'
                            }`}
                          >
                            {c.isCollege ? <GraduationCap className="w-3.5 h-3.5" /> : <School className="w-3.5 h-3.5" />}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 justify-between">
                              <h4 className="text-xs font-semibold text-white truncate group-hover:text-indigo-300 transition-colors">
                                {c.name.includes('DIPS') ? c.name : `DIPS ${c.name}`}
                              </h4>
                              {c.isCollege ? (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 shrink-0">
                                  Higher Ed
                                </span>
                              ) : c.code ? (
                                <span className="text-[9px] font-mono font-medium px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 shrink-0">
                                  {c.code}
                                </span>
                              ) : null}
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5 truncate">
                              <MapPin className="w-2.5 h-2.5 text-slate-500 shrink-0" />
                              <span className="truncate">{c.city || 'Punjab'}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="col-span-2 py-6 text-center text-xs text-slate-400">
                      No campuses match &ldquo;{branchSearch}&rdquo;. Try another keyword.
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Value Feature Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10 backdrop-blur-xs flex items-start gap-3.5 hover:bg-slate-900/90 transition-all">
              <div className="w-9 h-9 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Full Version History</h4>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-normal">
                  Track every revision, changelog, and rollback previous lesson plan updates.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10 backdrop-blur-xs flex items-start gap-3.5 hover:bg-slate-900/90 transition-all">
              <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center shrink-0">
                <Share2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Inter-Branch Collaboration</h4>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-normal">
                  Teachers co-author assessments and share quality teaching modules across campuses.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10 backdrop-blur-xs flex items-start gap-3.5 hover:bg-slate-900/90 transition-all">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <Download className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Direct Student Access</h4>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-normal">
                  Search chapter-wise notes, download sample papers, and preview multimedia in 1-click.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10 backdrop-blur-xs flex items-start gap-3.5 hover:bg-slate-900/90 transition-all">
              <div className="w-9 h-9 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Admin Oversight</h4>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-normal">
                  Role-based access, automated audit logs, and branch-wise compliance reporting.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: INTERACTIVE SIGN IN & REGISTRATION PORTAL CARD */}
        <div className="w-full max-w-md lg:max-w-lg shrink-0">
          <div id="login-card" className="relative bg-slate-900/95 backdrop-blur-xl text-white rounded-3xl shadow-2xl shadow-slate-950/90 border border-slate-700/80 overflow-hidden">
            {/* Top Accent Gradient Bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-amber-400 to-indigo-500" />

            {/* Card Top Institutional Header */}
            <div className="p-6 pb-5 border-b border-slate-800/90 bg-slate-950/60 flex flex-col items-center text-center relative">
              {/* Security Badge in Top-Right */}
              <div className="absolute top-4 right-4 hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800/90 border border-slate-700 text-[10px] font-medium text-slate-300">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>SSL Encrypted</span>
              </div>

              {/* Institutional Crest Framing */}
              <div className="relative mb-3 group">
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-indigo-500 via-amber-400 to-indigo-500 opacity-30 blur-xs group-hover:opacity-60 transition duration-300" />
                <div className="relative w-14 h-14 bg-white p-1.5 rounded-2xl shadow-lg border border-slate-200 flex items-center justify-center">
                  <img
                    src="/dips-logo.png"
                    alt="DIPS Crest"
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-center gap-1.5">
                  <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                    {isRegisterMode ? 'Faculty Self-Registration' : 'DIPS Central Portal Access'}
                  </h3>
                </div>
                <p className="text-xs text-slate-400 max-w-sm font-medium">
                  {isRegisterMode
                    ? 'Register your official institutional profile, select campus branch & assign subjects'
                    : 'Centralized Academic & Curriculum Network for DIPS Institutions'}
                </p>
              </div>

              {/* Segmented Institutional Role Navigation Switcher (Only in Login mode) */}
              {!isRegisterMode && (
                <div className="w-full mt-4 space-y-2">
                  <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950/80 rounded-2xl border border-slate-800">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedRole('teacher');
                        setError('');
                      }}
                      className={`py-2.5 px-2 text-xs font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px] ${
                        selectedRole === 'teacher'
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/40 ring-1 ring-indigo-400'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Faculty</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedRole('student');
                        setError('');
                      }}
                      className={`py-2.5 px-2 text-xs font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px] ${
                        selectedRole === 'student'
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/40 ring-1 ring-emerald-400'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      <GraduationCap className="w-3.5 h-3.5" />
                      <span>Student</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedRole('admin');
                        setError('');
                      }}
                      className={`py-2.5 px-2 text-xs font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px] ${
                        selectedRole === 'admin'
                          ? 'bg-amber-600 text-white shadow-md shadow-amber-600/40 ring-1 ring-amber-400'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      <Shield className="w-3.5 h-3.5" />
                      <span>Admin</span>
                    </button>
                  </div>

                  {/* Contextual Role Hint Subtitle */}
                  <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 pt-0.5">
                    {selectedRole === 'teacher' && (
                      <span className="text-indigo-300 flex items-center gap-1">
                        <Sparkle className="w-2.5 h-2.5 text-indigo-400" />
                        Faculty Workspace: Lesson plans, question banks & revision notes
                      </span>
                    )}
                    {selectedRole === 'student' && (
                      <span className="text-emerald-300 flex items-center gap-1">
                        <Sparkle className="w-2.5 h-2.5 text-emerald-400" />
                        Student Portal: Notes download, curriculum & syllabus material
                      </span>
                    )}
                    {selectedRole === 'admin' && (
                      <span className="text-amber-300 flex items-center gap-1">
                        <Sparkle className="w-2.5 h-2.5 text-amber-400" />
                        Directorate Console: Campus branches, user audits & configurations
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Teacher Sub-Mode Toggle */}
              {selectedRole === 'teacher' && !isRegisterMode && (
                <div className="flex items-center justify-between w-full mt-3 pt-2.5 border-t border-slate-800/80 text-xs">
                  <span className="text-slate-400 text-[11px]">Looking to register?</span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegisterMode(true);
                      setError('');
                    }}
                    className="inline-flex items-center gap-1 text-xs font-bold text-indigo-400 hover:text-indigo-300 hover:underline cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>+ New Faculty Registration</span>
                  </button>
                </div>
              )}
            </div>

            {/* Error & Success Alerts */}
            {error && (
              <div className="mx-6 mt-4 p-3 bg-rose-950/60 border border-rose-800/80 rounded-xl text-xs text-rose-200 flex items-center gap-2.5 shadow-sm">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="mx-6 mt-4 p-3 bg-emerald-950/60 border border-emerald-800/80 rounded-xl text-xs text-emerald-200 flex items-center gap-2.5 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-medium">{successMsg}</span>
              </div>
            )}

            {/* =========================================================
                FORM A: FACULTY SELF-REGISTRATION
                ========================================================= */}
            {isRegisterMode ? (
              <form onSubmit={handleTeacherRegistration} className="p-6 space-y-4 text-xs max-h-[65vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Full Legal Name <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                      <input
                        type="text"
                        value={regForm.fullName}
                        onChange={(e) => setRegForm({ ...regForm, fullName: e.target.value })}
                        placeholder="e.g. Jaspreet Kaur"
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-xs transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Official Email Address <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                      <input
                        type="email"
                        value={regForm.email}
                        onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                        placeholder="e.g. jaspreet.k@dips.edu.in"
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-xs transition-colors"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Campus Branch <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                      <select
                        value={regForm.branchId}
                        onChange={(e) => setRegForm({ ...regForm, branchId: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-xs transition-colors"
                        required
                      >
                        {branches.map((b) => (
                          <option key={b.id} value={b.id} className="bg-slate-900 text-white">
                            {b.name} ({b.city})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Employee ID <span className="text-slate-500 font-normal">(Optional)</span>
                    </label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                      <input
                        type="text"
                        value={regForm.employeeId}
                        onChange={(e) => setRegForm({ ...regForm, employeeId: e.target.value })}
                        placeholder="Auto-generated if empty"
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-xs transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Designation
                    </label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                      <input
                        type="text"
                        value={regForm.designation}
                        onChange={(e) => setRegForm({ ...regForm, designation: e.target.value })}
                        placeholder="e.g. PGT Science / TGT Math"
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-xs transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Contact Phone
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                      <input
                        type="tel"
                        value={regForm.phone}
                        onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-xs transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Set Password <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={regForm.password}
                        onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                        placeholder="Min. 6 characters"
                        className="w-full pl-9 pr-9 py-2 rounded-xl bg-slate-950/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-xs transition-colors"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-white cursor-pointer"
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Confirm Password <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={regForm.confirmPassword}
                        onChange={(e) => setRegForm({ ...regForm, confirmPassword: e.target.value })}
                        placeholder="Re-enter password"
                        className="w-full pl-9 pr-9 py-2 rounded-xl bg-slate-950/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-xs transition-colors"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-white cursor-pointer"
                        title={showConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Subject Allocation */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-slate-300">
                      Teaching Subjects (Select all that apply)
                    </label>
                    <span className="text-[11px] text-indigo-400 font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                      {regForm.assignedSubjectIds.length} Selected
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 p-2.5 bg-slate-950/60 border border-slate-800 rounded-xl max-h-52 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
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
                          className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition-all flex items-center gap-1 cursor-pointer ${
                            isChecked
                              ? 'bg-indigo-600 text-white border-indigo-500 shadow-xs'
                              : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500 hover:bg-slate-850'
                          }`}
                        >
                          <span>{sub.name}</span>
                          {isChecked && <CheckCircle2 className="w-3 h-3 text-white" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Class Allocation */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-slate-300">
                      Teaching Classes (Select all that apply)
                    </label>
                    <span className="text-[11px] text-indigo-400 font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                      {regForm.assignedClassIds.length} Selected
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 p-2.5 bg-slate-950/60 border border-slate-800 rounded-xl max-h-52 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
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
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all flex items-center gap-1 cursor-pointer ${
                            isChecked
                              ? 'bg-indigo-600 text-white border-indigo-500 shadow-xs'
                              : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500 hover:bg-slate-850'
                          }`}
                        >
                          <span>{cls.name}</span>
                          {isChecked && <CheckCircle2 className="w-3 h-3 text-white" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="pt-2 space-y-2.5">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>{loading ? 'Creating Faculty Account...' : 'Register Faculty Account & Sign In'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsRegisterMode(false)}
                    className="w-full py-2.5 text-xs font-medium text-slate-300 hover:text-white rounded-xl border border-slate-700 bg-slate-950/50 hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Return to Portal Login</span>
                  </button>
                </div>
              </form>
            ) : (
              /* =========================================================
                  FORM B: STANDARD LOGIN
                  ========================================================= */
              <form onSubmit={handleLogin} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    {selectedRole === 'teacher'
                      ? 'Faculty Employee ID or Email Address'
                      : selectedRole === 'student'
                      ? 'Student Admission Number / ID'
                      : 'Administrator Username / Security Email'}
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder={
                        selectedRole === 'teacher'
                          ? 'Enter Employee ID (e.g. DIPST-001) or Email'
                          : selectedRole === 'student'
                          ? 'Enter Student ID (e.g. DIPS-STU-001)'
                          : 'admin'
                      }
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-950/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-300">Security Password</label>
                    <span className="text-[10px] text-slate-400">
                      {selectedRole === 'admin' ? 'Authorized Central Access' : 'Institutional Credentials'}
                    </span>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-950/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-slate-400 hover:text-white cursor-pointer"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* One-Click Quick Credentials Helper */}
                <div className="pt-1 pb-1">
                  <div className="text-[11px] font-semibold text-slate-400 mb-1.5 flex items-center justify-between">
                    <span>Quick Test Login ({selectedRole === 'teacher' ? 'Faculty' : selectedRole === 'admin' ? 'Admin' : 'Student'}):</span>
                    <span className="text-[10px] text-indigo-400">Click to fill</span>
                  </div>
                  {selectedRole === 'teacher' && (
                    <div className="space-y-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setUsername('teacher.begowal@dips.edu');
                          setPassword('Teacher@123');
                          setError('');
                        }}
                        className="w-full text-left p-2 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-indigo-500/60 transition-all text-xs flex items-center justify-between cursor-pointer"
                      >
                        <div>
                          <div className="font-semibold text-white">Harpreet Kaur (Begowal)</div>
                          <div className="text-[10px] text-slate-400 font-mono">teacher.begowal@dips.edu • TCH-BEG-01</div>
                        </div>
                        <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-800/40">Teacher@123</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setUsername('teacher.jalandhar@dips.edu');
                          setPassword('Teacher@123');
                          setError('');
                        }}
                        className="w-full text-left p-2 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-indigo-500/60 transition-all text-xs flex items-center justify-between cursor-pointer"
                      >
                        <div>
                          <div className="font-semibold text-white">Gurpreet Singh (Jalandhar)</div>
                          <div className="text-[10px] text-slate-400 font-mono">teacher.jalandhar@dips.edu • TCH-JAL-02</div>
                        </div>
                        <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-800/40">Teacher@123</span>
                      </button>
                    </div>
                  )}
                  {selectedRole === 'admin' && (
                    <button
                      type="button"
                      onClick={() => {
                        setUsername('dipsbegowal@gmail.com');
                        setPassword('dips@1630502');
                        setError('');
                      }}
                      className="w-full text-left p-2 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-500/60 transition-all text-xs flex items-center justify-between cursor-pointer"
                    >
                      <div>
                        <div className="font-semibold text-white">DIPS Central Directorate</div>
                        <div className="text-[10px] text-slate-400 font-mono">dipsbegowal@gmail.com</div>
                      </div>
                      <span className="text-[10px] font-mono text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/40">dips@1630502</span>
                    </button>
                  )}
                  {selectedRole === 'student' && (
                    <button
                      type="button"
                      onClick={() => {
                        setUsername('student');
                        setPassword('student123');
                        setError('');
                      }}
                      className="w-full text-left p-2 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500/60 transition-all text-xs flex items-center justify-between cursor-pointer"
                    >
                      <div>
                        <div className="font-semibold text-white">Demo Student Account</div>
                        <div className="text-[10px] text-slate-400 font-mono">student</div>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40">student123</span>
                    </button>
                  )}
                </div>

                {/* Login Action Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 text-xs font-bold text-white rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    selectedRole === 'teacher'
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 shadow-indigo-600/30'
                      : selectedRole === 'student'
                      ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 shadow-emerald-600/30'
                      : 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 shadow-amber-600/30'
                  } disabled:opacity-50`}
                >
                  <span>{loading ? 'Authenticating Credentials...' : `Enter ${selectedRole === 'teacher' ? 'Faculty' : selectedRole === 'student' ? 'Student' : 'Admin'} Portal`}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Security Assurance Tag */}
                <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 text-center">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Protected by DIPS Single Sign-On (SSO) & Academic Data Governance</span>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* =========================================================
          FOOTER WITH INSTITUTION CREDITS & ACCREDITATION
          ========================================================= */}
      <footer className="relative z-20 border-t border-white/10 bg-slate-950 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Central DIPS Educational Cloud Server • All Systems Operational</span>
          </div>
          <p>© 2026 DIPS Chain of Institutions • Academic Directorate & Resource Management System</p>
        </div>
      </footer>
    </div>
  );
};
