import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Shield,
  BookOpen,
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
  KeyRound,
  ShieldCheck,
  Search,
  MapPin,
  X,
  Eye,
  EyeOff,
  Sparkle,
  Globe2,
  Award,
  FileText,
  BookCheck,
  Compass,
  HelpCircle,
  Library,
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
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [requires2FA, setRequires2FA] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);

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
    setRequires2FA(false);
    setTwoFactorCode('');
  }, [selectedRole]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter your institutional credentials.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccessMsg('');
      const res: any = await api.login({
        username,
        password,
        expectedRole: selectedRole,
        twoFactorCode: requires2FA ? twoFactorCode : undefined,
      });

      if (res.requires2FA) {
        setRequires2FA(true);
        setSuccessMsg('2FA Active: Please enter the 6-digit code from your Authenticator app.');
        return;
      }

      if (res.token && res.user) {
        setStoredAuth(res.token, res.user);
        onLoginSuccess(res.user);
      }
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
        `Faculty account created successfully for ${res.user.fullName} (${res.user.employeeId})! You are now logged in.`
      );

      setUsername(res.user.employeeId || res.user.email);
      setPassword(regForm.password);

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

  const fallbackList = [
    { id: 'branch-dipsimt', name: 'DIPS Institute of Management & Technology (DIPSIMT)', code: 'DIPSIMT', city: 'Jalandhar', type: 'college', category: 'Higher Education' },
    { id: 'branch-poly-tanda', name: 'DIPS Polytechnic College (Tanda)', code: 'DPC-TAN', city: 'Tanda, Hoshiarpur', type: 'college', category: 'Technical Diploma' },
    { id: 'branch-gilzian', name: 'DIPS School, Gilzian (Hoshiarpur)', code: 'GIL', city: 'Gilzian, Hoshiarpur', type: 'school', category: 'CBSE Affiliated' },
    { id: 'branch-urban-estate', name: 'DIPS School, Urban Estate Phase-1', code: 'UE-1', city: 'Jalandhar', type: 'school', category: 'CBSE Senior Secondary' },
    { id: 'branch-suranussi', name: 'DIPS School, Suranussi', code: 'SUR', city: 'Suranussi, Jalandhar', type: 'school', category: 'CBSE Senior Secondary' },
    { id: 'branch-karol-bagh', name: 'DIPS School, Karol Bagh', code: 'KB', city: 'Karol Bagh, Jalandhar', type: 'school', category: 'CBSE Affiliated' },
    { id: 'branch-blooming-dales', name: 'DIPS Blooming Dales Public School', code: 'BDPS', city: 'Begowal, Kapurthala', type: 'school', category: 'CBSE Affiliated' },
    { id: 'branch-bhogpur', name: 'DIPS School, Bhogpur', code: 'BHG', city: 'Bhogpur, Jalandhar', type: 'school', category: 'CBSE Affiliated' },
    { id: 'branch-mehatpur', name: 'DIPS School, Mehatpur', code: 'MHT-JAL', city: 'Mehatpur, Jalandhar', type: 'school', category: 'CBSE Affiliated' },
    { id: 'branch-nurmahal', name: 'DIPS School, Nurmahal', code: 'NUR', city: 'Nurmahal, Jalandhar', type: 'school', category: 'CBSE Affiliated' },
    { id: 'branch-uggi', name: 'DIPS School, Uggi', code: 'UGG', city: 'Uggi, Jalandhar', type: 'school', category: 'CBSE Affiliated' },
    { id: 'branch-batala', name: 'DIPS School, Batala (Gurdaspur)', code: 'BAT', city: 'Batala, Gurdaspur', type: 'school', category: 'CBSE Senior Secondary' },
    { id: 'branch-begowal', name: 'DIPS School, Begowal (Kapurthala)', code: 'BEG', city: 'Begowal, Kapurthala', type: 'school', category: 'CBSE Senior Secondary' },
    { id: 'branch-dhilwan', name: 'DIPS School, Dhilwan (Kapurthala)', code: 'DHL', city: 'Dhilwan, Kapurthala', type: 'school', category: 'CBSE Affiliated' },
    { id: 'branch-hariana', name: 'DIPS School, Hariana (Hoshiarpur)', code: 'HAR', city: 'Hariana, Hoshiarpur', type: 'school', category: 'CBSE Affiliated' },
    { id: 'branch-kapurthala', name: 'DIPS School, Kapurthala', code: 'KAP', city: 'Kapurthala', type: 'school', category: 'CBSE Senior Secondary' },
    { id: 'branch-mehta-chowk', name: 'DIPS School, Mehta Chowk (Amritsar)', code: 'MHT-ASR', city: 'Mehta Chowk, Amritsar', type: 'school', category: 'CBSE Affiliated' },
    { id: 'branch-rayya', name: 'DIPS School, Rayya (Amritsar)', code: 'RAY', city: 'Rayya, Amritsar', type: 'school', category: 'CBSE Senior Secondary' },
    { id: 'branch-tanda', name: 'DIPS School, Tanda (Hoshiarpur)', code: 'TAN', city: 'Tanda, Hoshiarpur', type: 'school', category: 'CBSE Senior Secondary' },
  ];

  const activeBranches = (branches.length > 0 ? branches : fallbackList).map((b) => {
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
      category: isCollege ? 'Higher Education' : 'CBSE Affiliated',
    };
  });

  const filteredBranches = activeBranches.filter((b) => {
    if (branchFilter === 'colleges' && !b.isCollege) return false;
    if (branchFilter === 'jalandhar' && b.region !== 'jalandhar') return false;
    if (branchFilter === 'hoshiarpur' && b.region !== 'hoshiarpur') return false;
    if (branchFilter === 'kapurthala' && b.region !== 'kapurthala') return false;
    if (branchFilter === 'amritsar_gurdaspur' && b.region !== 'amritsar_gurdaspur') return false;

    if (branchSearch.trim()) {
      const q = branchSearch.toLowerCase();
      return (
        b.name.toLowerCase().includes(q) ||
        (b.city || '').toLowerCase().includes(q) ||
        (b.code || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#07172C] text-slate-100 flex flex-col justify-between selection:bg-[#F5B82E] selection:text-[#0A1A33] font-sans antialiased relative overflow-x-hidden">
      {/* Subtle Academic Watermarked Grid & Stately Deep Navy Backdrop */}
      <div className="absolute inset-0 bg-[radial-gradient(#1E3A66_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A1F3A]/90 via-[#07172C] to-[#040C18] pointer-events-none" />

      {/* =========================================================
          INSTITUTIONAL BRANDING NAVBAR
          ========================================================= */}
      <header className="anim-navbar relative z-20 w-full border-b border-[#1A365D] bg-[#071933]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo & Chain of Institutions */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-white p-1 flex items-center justify-center shadow-md border-2 border-[#F5B82E]/60 shrink-0 transform transition-transform hover:scale-105">
              <img
                src="/dips-logo.png"
                alt="DIPS Institutions Logo"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex items-center gap-3 min-w-0">
              <div>
                <span className="text-xl sm:text-2xl font-black tracking-wider text-white">DIPS</span>
              </div>
              <div className="h-7 w-[1px] bg-slate-700 hidden sm:block" />
              <div className="hidden sm:block min-w-0 text-left">
                <p className="text-xs font-bold text-slate-200 tracking-wide">Chain of Institutions</p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-6 sm:gap-8 text-xs font-medium text-slate-300">
            <nav className="hidden md:flex items-center gap-7">
              <a
                href="#"
                className="inline-flex items-center gap-1.5 text-white font-bold relative after:absolute after:-bottom-1.5 after:left-0 after:right-0 after:h-[2px] after:bg-[#F5B82E] after:rounded-full"
              >
                <School className="w-3.5 h-3.5 text-[#F5B82E]" />
                <span>Home</span>
              </a>
              <a href="#academic-pillars" className="text-slate-300 hover:text-white transition-colors">Academic Framework</a>
              <a href="#campus-explorer" className="text-slate-300 hover:text-white transition-colors">19 Campuses</a>
              <button
                type="button"
                onClick={() => setShowForgotPasswordModal(true)}
                className="text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                Helpdesk
              </button>
            </nav>

            {/* School Portal Outline Pill Button */}
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('login-card');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#F5B82E]/70 hover:border-[#F5B82E] bg-[#0A2244]/80 hover:bg-[#0D2D59] text-xs font-bold text-[#F5B82E] hover:text-white tracking-wide uppercase transition-all shadow-xs cursor-pointer"
            >
              <GraduationCap className="w-4 h-4 text-[#F5B82E]" />
              <span className="tracking-wider text-[11px]">Academic Portal</span>
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================
          MAIN HERO & PORTAL LOGIN CONTAINER
          ========================================================= */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col lg:flex-row items-center justify-between gap-12">
        {/* LEFT COLUMN: INSTITUTIONAL SHOWCASE & VALUE PROPOSITION */}
        <div className="w-full lg:flex-1 space-y-6 text-left max-w-2xl min-w-0">
          <div className="space-y-4">
            {/* Eyebrow: Academic Gold Laurel */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#11284A] border border-[#F5B82E]/30 text-[#F5B82E] text-xs font-bold tracking-widest uppercase">
              <Award className="w-3.5 h-3.5 text-[#F5B82E]" />
              <span>DIPS CENTRALIZED EDUCATIONAL ECOSYSTEM</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-snug sm:leading-tight break-words">
              <span className="inline-block text-[#F8FAFF]">One Network.</span>{' '}
              <span className="inline-block text-[#3B82F6]">One Standard.</span>{' '}
              <span className="gold-shimmer-sweep inline-block font-black text-[#F5B82E]">One DIPS.</span>
            </h1>

            {/* Subheading and paragraph */}
            <div className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-100 tracking-wide">
                Unifying 19 Campuses Under One Standard of Academic Excellence
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
                Connecting 35,000+ students, 1,800+ faculty members, and academic administrators across DIPS Schools, Polytechnic Colleges, and Management Institutes with standardized syllabi, lesson plans, digital question banks, and continuous performance tracking.
              </p>
            </div>
          </div>

          {/* EDUCATIONAL METRICS STRIP */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
            <div className="p-3 rounded-xl bg-[#0A2244]/80 border border-[#1A3C6B] text-left">
              <div className="flex items-center gap-1.5 text-[#F5B82E] mb-0.5">
                <Building className="w-4 h-4" />
                <span className="text-base font-black text-white">19</span>
              </div>
              <p className="text-[11px] font-semibold text-slate-200">Campuses</p>
              <p className="text-[9px] text-slate-400">Schools & Colleges</p>
            </div>

            <div className="p-3 rounded-xl bg-[#0A2244]/80 border border-[#1A3C6B] text-left">
              <div className="flex items-center gap-1.5 text-[#38BDF8] mb-0.5">
                <GraduationCap className="w-4 h-4" />
                <span className="text-base font-black text-white">35K+</span>
              </div>
              <p className="text-[11px] font-semibold text-slate-200">Students</p>
              <p className="text-[9px] text-slate-400">Enrolled Learners</p>
            </div>

            <div className="p-3 rounded-xl bg-[#0A2244]/80 border border-[#1A3C6B] text-left">
              <div className="flex items-center gap-1.5 text-[#34D399] mb-0.5">
                <BookOpen className="w-4 h-4" />
                <span className="text-base font-black text-white">1,800+</span>
              </div>
              <p className="text-[11px] font-semibold text-slate-200">Faculty</p>
              <p className="text-[9px] text-slate-400">Certified Teachers</p>
            </div>

            <div className="p-3 rounded-xl bg-[#0A2244]/80 border border-[#1A3C6B] text-left">
              <div className="flex items-center gap-1.5 text-[#F5B82E] mb-0.5">
                <Award className="w-4 h-4" />
                <span className="text-base font-black text-white">100%</span>
              </div>
              <p className="text-[11px] font-semibold text-slate-200">Excellence</p>
              <p className="text-[9px] text-slate-400">Board Standards</p>
            </div>
          </div>

          {/* 3 CORE EDUCATIONAL PILLARS */}
          <div id="academic-pillars" className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="p-3.5 rounded-xl bg-[#0A1D36] border border-[#1A365D] space-y-1">
              <div className="w-7 h-7 rounded-lg bg-[#3B82F6]/20 border border-[#3B82F6]/40 flex items-center justify-center text-[#60A5FA] mb-1.5">
                <BookCheck className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-white">Unified Curriculum</h3>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Standardized lesson planners, syllabus trackers, and subject allocations across every grade.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0A1D36] border border-[#1A365D] space-y-1">
              <div className="w-7 h-7 rounded-lg bg-[#F5B82E]/20 border border-[#F5B82E]/40 flex items-center justify-center text-[#F5B82E] mb-1.5">
                <FileText className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-white">Central Question Bank</h3>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Shared exam repositories, midterm papers, and digital question banks vetted by senior deans.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0A1D36] border border-[#1A365D] space-y-1">
              <div className="w-7 h-7 rounded-lg bg-[#10B981]/20 border border-[#10B981]/40 flex items-center justify-center text-[#34D399] mb-1.5">
                <Award className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-white">Academic Audits</h3>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Real-time CCE continuous evaluation, gradebook audits, and branch comparative analytics.
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              onClick={() => {
                const el = document.getElementById('campus-explorer');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-6 py-2.5 rounded-full bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#1D4ED8]/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Compass className="w-4 h-4" />
              <span>Explore 19 Campuses</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => {
                setSelectedRole('teacher');
                setIsRegisterMode(false);
                const el = document.getElementById('login-card');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-6 py-2.5 rounded-full bg-[#0B254A] hover:bg-[#0E3161] text-[#F5B82E] hover:text-white font-bold text-xs sm:text-sm border border-[#F5B82E]/40 transition-all flex items-center gap-2 cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>Faculty Sign In</span>
            </button>
          </div>

          {/* 19 Connected Campuses Section */}
          <div id="campus-explorer" className="rounded-2xl bg-[#091E3B]/90 border border-[#1A3D6B] p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1A3D6B] pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-[#F5B82E]" />
                  <h4 className="text-sm font-bold text-white tracking-wide">
                    19 Connected Institutions in Punjab
                  </h4>
                </div>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Unified academic standards across CBSE schools, polytechnic colleges & management institutes
                </p>
              </div>

              {/* Quick Filter tabs */}
              <div className="flex flex-wrap gap-1 text-[11px]">
                {(['all', 'colleges', 'jalandhar', 'hoshiarpur', 'kapurthala', 'amritsar_gurdaspur'] as const).map((key) => {
                  const labels: Record<string, string> = {
                    all: 'All (19)',
                    colleges: 'Colleges',
                    jalandhar: 'Jalandhar',
                    hoshiarpur: 'Hoshiarpur',
                    kapurthala: 'Kapurthala',
                    amritsar_gurdaspur: 'Amritsar & Gurdaspur',
                  };
                  return (
                    <button
                      key={key}
                      onClick={() => setBranchFilter(key)}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                        branchFilter === key
                          ? 'bg-[#F5B82E] text-[#0A1A33]'
                          : 'bg-[#0B254A] text-slate-300 hover:text-white'
                      }`}
                    >
                      {labels[key]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Search filter input */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={branchSearch}
                onChange={(e) => setBranchSearch(e.target.value)}
                placeholder="Search campus by name, city, or branch code (e.g., Urban Estate, Tanda, DIPSIMT)..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-[#06172E] border border-[#1C4275] rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-[#F5B82E]"
              />
            </div>

            {/* Campus grid list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-700">
              {filteredBranches.map((b) => (
                <div
                  key={b.id}
                  className="p-2.5 rounded-xl bg-[#071933] border border-[#1A3D6B] hover:border-[#F5B82E]/50 transition-colors flex items-center justify-between text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-semibold text-slate-100 truncate">{b.name}</p>
                    <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-2.5 h-2.5 text-[#F5B82E]" />
                      <span>{b.city}</span>
                      <span>·</span>
                      <span className="font-mono text-slate-300 font-semibold">{b.code}</span>
                    </p>
                  </div>
                  <span className={`shrink-0 px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                    b.isCollege
                      ? 'bg-[#1E3A8A]/50 text-[#93C5FD] border-[#3B82F6]/40'
                      : 'bg-[#064E3B]/50 text-[#6EE7B7] border-[#10B981]/40'
                  }`}>
                    {b.isCollege ? 'Collegiate / Polytech' : 'CBSE School'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: INTERACTIVE SIGN IN & REGISTRATION PORTAL CARD */}
        <div className="w-full max-w-md lg:max-w-lg shrink-0">
          <div id="login-card" className="relative bg-[#091D38] text-white rounded-2xl shadow-2xl border-2 border-[#1E4378] overflow-hidden">
            {/* Top Accent Gradient Bar in Royal Navy & DIPS Gold */}
            <div className="h-1.5 w-full bg-gradient-to-r from-[#1D4ED8] via-[#F5B82E] to-[#1D4ED8]" />

            {/* Card Top Institutional Header */}
            <div className="p-6 pb-5 border-b border-[#1A3D6B] bg-[#071830] flex flex-col items-center text-center relative overflow-hidden">
              {/* Security Badge in Top-Right */}
              <div className="absolute top-4 right-4 hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0A2244] border border-[#1E4378] text-[10px] font-semibold text-slate-300">
                <Shield className="w-3 h-3 text-[#10B981]" />
                <span>Secure Access</span>
              </div>

              {/* Institutional Crest Framing with Gold Trim */}
              <div className="relative mb-3">
                <div className="relative w-16 h-16 bg-white p-1.5 rounded-2xl shadow-xl border-2 border-[#F5B82E] flex items-center justify-center">
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
                    {isRegisterMode ? 'Faculty Self-Registration' : 'DIPS Central Academic Portal'}
                  </h3>
                </div>
                <p className="text-xs text-slate-300 max-w-sm font-medium">
                  {isRegisterMode
                    ? 'Register your official institutional faculty profile, select campus branch & assign teaching subjects'
                    : 'Unified Access for Faculty, Students & Academic Administration'}
                </p>
              </div>

              {/* Segmented Institutional Role Navigation Switcher */}
              {!isRegisterMode && (
                <div className="w-full mt-4 space-y-2">
                  <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#051428] rounded-xl border border-[#1A3D6B]">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedRole('teacher');
                        setError('');
                      }}
                      className={`py-2.5 px-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px] ${
                        selectedRole === 'teacher'
                          ? 'bg-[#1D4ED8] text-white shadow-md shadow-[#1D4ED8]/40 border border-[#3B82F6]'
                          : 'text-slate-300 hover:text-white hover:bg-[#0A2244]'
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
                      className={`py-2.5 px-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px] ${
                        selectedRole === 'student'
                          ? 'bg-[#1D4ED8] text-white shadow-md shadow-[#1D4ED8]/40 border border-[#3B82F6]'
                          : 'text-slate-300 hover:text-white hover:bg-[#0A2244]'
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
                      className={`py-2.5 px-2 text-xs font-extrabold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px] ${
                        selectedRole === 'admin'
                          ? 'bg-[#F5B82E] text-[#0A1A33] shadow-md shadow-[#F5B82E]/40 border border-[#F59E0B]'
                          : 'text-slate-300 hover:text-white hover:bg-[#0A2244]'
                      }`}
                    >
                      <Shield className="w-3.5 h-3.5" />
                      <span>Administration</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Teacher Sub-Mode Toggle */}
              {selectedRole === 'teacher' && !isRegisterMode && (
                <div className="flex items-center justify-between w-full mt-3 pt-2.5 border-t border-[#1A3D6B] text-xs">
                  <span className="text-slate-300 text-[11px]">New educator joining DIPS?</span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegisterMode(true);
                      setError('');
                    }}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#F5B82E] hover:underline cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>+ Register Faculty Profile</span>
                  </button>
                </div>
              )}
            </div>

            {/* Error & Success Alerts */}
            {error && (
              <div className="mx-6 mt-4 p-3 bg-rose-950/70 border border-rose-700 rounded-xl text-xs text-rose-200 flex items-center gap-2.5 shadow-sm">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="mx-6 mt-4 p-3 bg-emerald-950/70 border border-emerald-700 rounded-xl text-xs text-emerald-200 flex items-center gap-2.5 shadow-sm">
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
                    <label className="block font-bold text-slate-200 mb-1">
                      Full Legal Name <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                      <input
                        type="text"
                        value={regForm.fullName}
                        onChange={(e) => setRegForm({ ...regForm, fullName: e.target.value })}
                        placeholder="e.g. Jaspreet Kaur"
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#06152B] border border-[#1A3D6B] text-white placeholder-slate-400 focus:outline-none focus:border-[#F5B82E] text-xs transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-200 mb-1">
                      Official Institutional Email <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                      <input
                        type="email"
                        value={regForm.email}
                        onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                        placeholder="e.g. jaspreet.k@dips.edu.in"
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#06152B] border border-[#1A3D6B] text-white placeholder-slate-400 focus:outline-none focus:border-[#F5B82E] text-xs transition-colors"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-bold text-slate-200 mb-1">
                      DIPS Campus Branch <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                      <select
                        value={regForm.branchId}
                        onChange={(e) => setRegForm({ ...regForm, branchId: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#06152B] border border-[#1A3D6B] text-white focus:outline-none focus:border-[#F5B82E] text-xs transition-colors"
                        required
                      >
                        {branches.map((b) => (
                          <option key={b.id} value={b.id} className="bg-[#091D38] text-white">
                            {b.name} ({b.city})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-200 mb-1">
                      Faculty Employee ID <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                      <input
                        type="text"
                        value={regForm.employeeId}
                        onChange={(e) => setRegForm({ ...regForm, employeeId: e.target.value })}
                        placeholder="e.g. DIPST-042 (Auto if empty)"
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#06152B] border border-[#1A3D6B] text-white placeholder-slate-400 focus:outline-none focus:border-[#F5B82E] text-xs transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-bold text-slate-200 mb-1">
                      Account Password <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={regForm.password}
                        onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                        placeholder="•••••••• (Min 6 chars)"
                        className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#06152B] border border-[#1A3D6B] text-white placeholder-slate-400 focus:outline-none focus:border-[#F5B82E] text-xs transition-colors"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-200"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-200 mb-1">
                      Confirm Password <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={regForm.confirmPassword}
                        onChange={(e) => setRegForm({ ...regForm, confirmPassword: e.target.value })}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#06152B] border border-[#1A3D6B] text-white placeholder-slate-400 focus:outline-none focus:border-[#F5B82E] text-xs transition-colors"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-200"
                      >
                        {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Subject Selection */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-200">
                      Teaching Subjects ({regForm.assignedSubjectIds.length} Selected)
                    </label>
                  </div>
                  <div className="flex flex-wrap gap-1.5 p-2.5 bg-[#06152B] border border-[#1A3D6B] rounded-xl max-h-36 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
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
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all flex items-center gap-1 cursor-pointer ${
                            isChecked
                              ? 'bg-[#1D4ED8] text-white border-[#3B82F6]'
                              : 'bg-[#081B36] text-slate-300 border-[#1A3D6B] hover:border-slate-500'
                          }`}
                        >
                          <span>{sub.name}</span>
                          {isChecked && <CheckCircle2 className="w-3 h-3 text-[#F5B82E]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Class Allocation */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-200">
                      Teaching Classes ({regForm.assignedClassIds.length} Selected)
                    </label>
                  </div>
                  <div className="flex flex-wrap gap-1.5 p-2.5 bg-[#06152B] border border-[#1A3D6B] rounded-xl max-h-36 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
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
                              ? 'bg-[#1D4ED8] text-white border-[#3B82F6]'
                              : 'bg-[#081B36] text-slate-300 border-[#1A3D6B] hover:border-slate-500'
                          }`}
                        >
                          <span>{cls.name}</span>
                          {isChecked && <CheckCircle2 className="w-3 h-3 text-[#F5B82E]" />}
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
                    className="w-full py-3 text-xs font-bold text-white bg-[#1D4ED8] hover:bg-[#1E40AF] rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4 text-[#F5B82E]" />
                    <span>{loading ? 'Creating Faculty Account...' : 'Complete Registration & Enter Portal'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsRegisterMode(false)}
                    className="w-full py-2.5 text-xs font-semibold text-slate-300 hover:text-white rounded-xl border border-[#1A3D6B] bg-[#071830] hover:bg-[#0A2244] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Return to Portal Sign In</span>
                  </button>
                </div>
              </form>
            ) : (
              /* =========================================================
                  FORM B: STANDARD LOGIN
                  ========================================================= */
              <form onSubmit={handleLogin} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1.5">
                    {selectedRole === 'admin'
                      ? 'Administrator Username / Institutional Email'
                      : selectedRole === 'teacher'
                      ? 'Faculty Employee ID / Institutional Email'
                      : 'Student Admission Number / Student ID'}
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder={
                        selectedRole === 'admin'
                          ? 'admin'
                          : selectedRole === 'teacher'
                          ? 'Enter Employee ID or Email'
                          : 'Enter Student ID'
                      }
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-[#06152B] border border-[#1A3D6B] rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-[#F5B82E] transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-200">Secure Password</label>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 text-xs bg-[#06152B] border border-[#1A3D6B] rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-[#F5B82E] transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-200 cursor-pointer"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember this device & Forgot Password? */}
                <div className="flex items-center justify-between text-xs pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-3.5 h-3.5 rounded bg-[#06152B] border-[#1A3D6B] text-[#1D4ED8] focus:ring-[#1D4ED8]"
                    />
                    <span>Remember this device</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPasswordModal(true)}
                    className="text-xs text-[#F5B82E] hover:underline transition-colors cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>

                {/* 2FA Input Challenge */}
                {requires2FA && (
                  <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-2">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-bold text-amber-300">
                        Two-Factor Authentication Required
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Enter the 6-digit verification code from your Google Authenticator or Microsoft Authenticator app.
                    </p>
                    <div className="space-y-1">
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={6}
                        value={twoFactorCode}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, '');
                          setTwoFactorCode(val);
                        }}
                        placeholder="000000"
                        autoFocus
                        className="w-full py-3 px-3 text-center tracking-[0.35em] text-2xl font-mono font-black bg-slate-950 border border-amber-500/60 rounded-xl text-amber-300 placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
                        required
                      />
                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                        <span>Code refreshes every 30s</span>
                        <button
                          type="button"
                          onClick={() => {
                            setRequires2FA(false);
                            setTwoFactorCode('');
                            setError('');
                          }}
                          className="text-[#93C5FD] hover:underline cursor-pointer"
                        >
                          Cancel / Back
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Login Action Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3.5 text-sm font-extrabold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    selectedRole === 'admin'
                      ? 'bg-[#F5B82E] hover:bg-[#E5A823] text-[#0A1A33] shadow-[#F5B82E]/30'
                      : 'bg-[#1D4ED8] hover:bg-[#1E40AF] text-white shadow-[#1D4ED8]/30'
                  } disabled:opacity-50`}
                >
                  <span>
                    {loading
                      ? 'Authenticating Credentials...'
                      : selectedRole === 'admin'
                      ? 'Access Administration Portal'
                      : selectedRole === 'teacher'
                      ? 'Access Faculty Portal'
                      : 'Access Student Portal'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Security Assurance Tag */}
                <div className="pt-2 flex flex-col items-center justify-center text-center text-xs text-slate-300">
                  <div className="flex items-center gap-1.5 font-medium">
                    <Shield className="w-4 h-4 text-[#F5B82E] shrink-0" />
                    <span>Protected by DIPS Single Sign-On (SSO)</span>
                  </div>
                  <span className="text-[11px] text-slate-400">& Academic Data Governance</span>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* =========================================================
          FORGOT PASSWORD MODAL
          ========================================================= */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-[#091E3B] rounded-2xl border-2 border-[#1E4378] shadow-2xl max-w-md w-full p-6 space-y-4 text-white">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F5B82E]/20 border border-[#F5B82E]/40 flex items-center justify-center text-[#F5B82E] shrink-0">
                  <KeyRound className="w-5 h-5 text-[#F5B82E]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Institutional Credentials Support</h3>
                  <p className="text-xs text-slate-300">DIPS Central Academic Security Policy</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotPasswordModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Institutional credentials are managed centrally by the Academic Directorate to safeguard student records and examinations:
            </p>

            <div className="space-y-2 text-xs bg-[#06152B] p-3.5 rounded-xl border border-[#1A3D6B] text-slate-200">
              <div className="flex items-start gap-2">
                <span className="font-bold text-[#F5B82E]">1.</span>
                <span>Students & Parents: Contact your campus Principal Office or Class Teacher.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-[#F5B82E]">2.</span>
                <span>Faculty Members: Reach out to your Campus IT Incharge or Academic Dean.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-[#F5B82E]">3.</span>
                <span>
                  Central Directorate Support:{' '}
                  <a href="mailto:dipscms@gmail.com" className="font-bold text-[#93C5FD] underline">
                    dipscms@gmail.com
                  </a>{' '}
                  (Helpline: <a href="tel:9541167365" className="font-bold text-[#F5B82E] hover:underline">9541167365</a>).
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowForgotPasswordModal(false)}
              className="w-full py-2.5 text-xs font-bold text-white bg-[#1D4ED8] hover:bg-[#1E40AF] rounded-xl transition-colors cursor-pointer"
            >
              Understood
            </button>
          </div>
        </div>
      )}

      {/* =========================================================
          ACADEMIC FOOTER WITH INSTITUTION CREDITS & ACCREDITATION
          ========================================================= */}
      <footer className="relative z-20 border-t border-[#1A3D6B] bg-[#051326] py-8 px-4 sm:px-6 lg:px-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-[#1A3D6B]/60 pb-6">
            {/* Logo & Subtext */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shrink-0 border-2 border-[#F5B82E]">
                <img
                  src="/dips-logo.png"
                  alt="DIPS Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-base font-extrabold text-white tracking-wider">DIPS</span>
                <div className="h-5 w-[1px] bg-slate-700" />
                <div className="text-[11px] leading-tight">
                  <span className="text-slate-200 block font-bold">Chain of Institutions</span>
                </div>
              </div>
            </div>

            {/* Academic Navigation Links */}
            <div className="flex items-center gap-6 text-xs text-slate-300">
              <a href="#academic-pillars" className="hover:text-white transition-colors">Academic Framework</a>
              <span className="text-slate-700">|</span>
              <a href="#campus-explorer" className="hover:text-white transition-colors">19 Campuses</a>
              <span className="text-slate-700">|</span>
              <button
                type="button"
                onClick={() => setShowForgotPasswordModal(true)}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Examination Helpdesk
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
            <p>© 2026 DIPS Chain of Institutions</p>
            <p className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#10B981]" />
              <span>Standardized Curriculum Engine & Multi-Campus Digital Portal</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
