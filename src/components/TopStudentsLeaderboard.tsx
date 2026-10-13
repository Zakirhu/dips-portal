import React, { useState, useMemo } from 'react';
import { 
  Trophy, 
  Crown, 
  Medal, 
  Sparkles, 
  Flame, 
  Target, 
  BookOpen, 
  Zap, 
  Award, 
  TrendingUp, 
  CheckCircle2, 
  ChevronRight, 
  Search, 
  X, 
  GraduationCap, 
  ShieldCheck, 
  Star,
  Users,
  ArrowUpRight,
  BarChart3
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ClassLevel, QuizAttempt, StudentProfile } from '../types';

export interface LeaderboardStudent {
  id: string;
  name: string;
  classLevel: ClassLevel;
  subject: string;
  schoolName: string;
  accuracy: number; // Percentage (0 - 100)
  topicsCompleted: number; // Number of chapters/topics completed
  totalXp: number; // Experience points earned
  quizCount: number; // Number of quizzes taken
  streakDays: number; // Consecutive daily study streak
  badge: string; // Top title badge
  avatarBg: string; // Avatar gradient style
  isCurrentUser?: boolean;
}

// Active leaderboard students — dynamically populated from real student attempts
const PEER_LEADERBOARD_STUDENTS: LeaderboardStudent[] = [];

interface TopStudentsLeaderboardProps {
  onStartQuizClick?: () => void;
  className?: string;
}

export const TopStudentsLeaderboard: React.FC<TopStudentsLeaderboardProps> = ({
  onStartQuizClick,
  className = ''
}) => {
  const { studentProfile, quizAttempts, studyMaterials } = useApp();

  // Active Sorting Metric & Class Filter States
  const [metricTab, setMetricTab] = useState<'accuracy' | 'topics' | 'xp'>('accuracy');
  const [classFilter, setClassFilter] = useState<ClassLevel | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedInspectStudent, setSelectedInspectStudent] = useState<LeaderboardStudent | null>(null);

  // Calculate current logged-in student metrics dynamically
  const currentUserEntry = useMemo<LeaderboardStudent>(() => {
    const userAttemptsCount = quizAttempts.length;

    // Highest / average accuracy
    const avgAccuracy = userAttemptsCount > 0
      ? Math.round((quizAttempts.reduce((acc, a) => acc + a.percentage, 0) / userAttemptsCount) * 10) / 10
      : 0;

    // Completed topics count (from profile or unique chapters in quiz attempts)
    const profileTopicsCount = studentProfile.chaptersCompletedCount || 0;
    const attemptedUniqueChapters = new Set(quizAttempts.map(a => a.chapterTitle)).size;
    const userTopicsCompleted = Math.max(profileTopicsCount, attemptedUniqueChapters, userAttemptsCount > 0 ? Math.min(25, userAttemptsCount + 3) : 0);

    // Total XP points
    const solvedBonus = (studentProfile.questionsSolvedCount || 0) * 15;
    const quizScorePoints = quizAttempts.reduce((acc, a) => acc + (a.score * 80), 0);
    const userTotalXp = Math.max(solvedBonus + quizScorePoints, userAttemptsCount * 180);

    // Badge calculation based on performance
    let userBadge = 'Active Learner 🚀';
    if (avgAccuracy >= 95) userBadge = 'Centum Scholar 🏆';
    else if (avgAccuracy >= 88) userBadge = 'Board Honor Student 🌟';
    else if (userTopicsCompleted >= 15) userBadge = 'Topic Specialist 📚';
    else if (userAttemptsCount >= 5) userBadge = 'Quiz Explorer 🔥';

    const subjectStr = studentProfile.classLevel === 'X' || studentProfile.classLevel === 'IX'
      ? 'IT (Code 402)'
      : studentProfile.classLevel === 'XII' || studentProfile.classLevel === 'XI'
      ? 'IP (Code 065)'
      : 'Computer Science';

    return {
      id: 'current-user-student',
      name: `${studentProfile.name} (You)`,
      classLevel: studentProfile.classLevel,
      subject: subjectStr,
      schoolName: studentProfile.schoolName || 'Your CBSE Institution',
      accuracy: avgAccuracy,
      topicsCompleted: userTopicsCompleted,
      totalXp: userTotalXp,
      quizCount: userAttemptsCount,
      streakDays: Math.min(21, Math.max(1, userAttemptsCount * 2)),
      badge: userBadge,
      avatarBg: 'from-blue-600 to-indigo-700',
      isCurrentUser: true
    };
  }, [studentProfile, quizAttempts]);

  // Merge current user into list & sort based on active metric tab
  const sortedStudents = useMemo(() => {
    const list: LeaderboardStudent[] = [...PEER_LEADERBOARD_STUDENTS];

    // Include current user if they have taken quizzes or read topics
    if (currentUserEntry.quizCount > 0 || currentUserEntry.topicsCompleted > 0 || currentUserEntry.accuracy > 0) {
      list.push(currentUserEntry);
    }

    // Filter by class
    let filtered = list.filter(student => {
      if (classFilter === 'ALL') return true;
      return student.classLevel === classFilter;
    });

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(s => 
        s.name.toLowerCase().includes(q) || 
        s.schoolName.toLowerCase().includes(q) ||
        s.subject.toLowerCase().includes(q)
      );
    }

    // Sort based on active metric tab
    return filtered.sort((a, b) => {
      if (metricTab === 'accuracy') {
        if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
        return b.topicsCompleted - a.topicsCompleted;
      } else if (metricTab === 'topics') {
        if (b.topicsCompleted !== a.topicsCompleted) return b.topicsCompleted - a.topicsCompleted;
        return b.accuracy - a.accuracy;
      } else {
        if (b.totalXp !== a.totalXp) return b.totalXp - a.totalXp;
        return b.accuracy - a.accuracy;
      }
    });
  }, [currentUserEntry, metricTab, classFilter, searchQuery]);

  // Find user rank position in current sorted list
  const userRankIndex = sortedStudents.findIndex(s => s.isCurrentUser);
  const userRank = userRankIndex !== -1 ? userRankIndex + 1 : null;

  // Podium Top 3 and List (Ranks 4+)
  const top3Podium = sortedStudents.slice(0, 3);
  const restLeaderboard = sortedStudents.slice(3, 10);

  return (
    <div className={`bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-8 relative overflow-hidden ${className}`}>
      
      {/* Background Subtle Gradient Accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-amber-500/5 via-indigo-500/5 to-transparent rounded-full blur-3xl pointer-events-none"></div>

      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-100 pb-6 relative z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-900 flex items-center justify-center shadow-md shadow-amber-500/20 font-black">
              <Trophy className="w-5 h-5 text-slate-900 fill-slate-900" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Top Students Leaderboard
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-200 flex items-center gap-1">
                  <Flame className="w-3 h-3 text-amber-600 fill-amber-500" />
                  <span>Live CBSE Ranks</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Gamified rankings showcasing top performers with the highest quiz accuracy & most completed topics.
              </p>
            </div>
          </div>
        </div>

        {/* METRIC TAB TOGGLERS */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/80 self-start lg:self-auto">
          <button
            onClick={() => setMetricTab('accuracy')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              metricTab === 'accuracy'
                ? 'bg-white text-blue-700 shadow-sm border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Target className="w-4 h-4 text-blue-600" />
            <span>Highest Accuracy (%)</span>
          </button>

          <button
            onClick={() => setMetricTab('topics')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              metricTab === 'topics'
                ? 'bg-white text-emerald-700 shadow-sm border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <span>Most Completed Topics</span>
          </button>

          <button
            onClick={() => setMetricTab('xp')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              metricTab === 'xp'
                ? 'bg-white text-amber-700 shadow-sm border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-500 fill-amber-400" />
            <span>Total XP & Streak</span>
          </button>
        </div>
      </div>

      {/* SEARCH & CLASS FILTER STRIP */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
        
        {/* Class Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          <span className="text-xs font-bold text-slate-400 mr-1 hidden sm:inline">Class:</span>
          {(['ALL', 'X', 'XII', 'IX', 'XI', 'VIII'] as (ClassLevel | 'ALL')[]).map(cls => (
            <button
              key={cls}
              onClick={() => setClassFilter(cls)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all shrink-0 cursor-pointer ${
                classFilter === cls
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100/90 text-slate-600 hover:bg-slate-200/80'
              }`}
            >
              {cls === 'ALL' ? 'All Classes' : `Class ${cls}`}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search student or school..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* USER CURRENT STANDING SPOTLIGHT CARD */}
      {userRank && (
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-md border border-blue-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-400 text-white font-black text-lg flex items-center justify-center shadow-md border border-white/20 shrink-0">
              #{userRank}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-sm text-white">Your Current Leaderboard Rank</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/30 text-blue-200 border border-blue-400/30">
                  {metricTab === 'accuracy' ? 'Accuracy Mode' : metricTab === 'topics' ? 'Topics Mode' : 'XP Mode'}
                </span>
              </div>
              <p className="text-xs text-blue-200 mt-0.5">
                <strong className="text-white">{currentUserEntry.accuracy}% Accuracy</strong> • <strong className="text-white">{currentUserEntry.topicsCompleted} Topics Completed</strong> • <strong className="text-white">{currentUserEntry.totalXp} XP</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            {userRank > 1 ? (
              <div className="text-left sm:text-right text-xs">
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Rank #{userRank} of {sortedStudents.length}</span>
                </span>
                <span className="text-[11px] text-slate-300 block">
                  {userRank <= 3 
                    ? '🎉 You are in the Top 3 Podium!' 
                    : `Solve 1 test with 90%+ to reach #${userRank - 1}`}
                </span>
              </div>
            ) : (
              <span className="px-3 py-1 bg-amber-400 text-slate-900 font-black text-xs rounded-xl shadow-md flex items-center gap-1.5">
                <Crown className="w-4 h-4 fill-slate-900" />
                <span>#1 Top Leaderboard Rank!</span>
              </span>
            )}

            {onStartQuizClick && (
              <button
                onClick={onStartQuizClick}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white font-extrabold text-xs rounded-xl shadow-md transition-all shrink-0 cursor-pointer flex items-center gap-1"
              >
                <span>Improve Rank</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* LEADERBOARD CONTENT: EMPTY STATE vs PODIUM & DETAILED LIST */}
      {sortedStudents.length === 0 ? (
        <div className="py-14 px-6 text-center bg-slate-50/70 rounded-3xl border-2 border-dashed border-slate-200/90 relative z-10 flex flex-col items-center justify-center space-y-4 my-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500/10 to-yellow-500/10 border border-amber-300/40 text-amber-600 flex items-center justify-center shadow-xs">
            <Trophy className="w-8 h-8 text-amber-500" />
          </div>
          <div className="space-y-1.5 max-w-md">
            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              {searchQuery ? 'No Students Found' : 'Leaderboard is Empty'}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {searchQuery
                ? `No student matching "${searchQuery}". Clear your search query or select another class filter.`
                : 'No student test scores recorded yet. The leaderboard is clean and awaiting its first high scorers! Take a chapter test to claim the #1 spot.'}
            </p>
          </div>
          {onStartQuizClick && (
            <button
              onClick={onStartQuizClick}
              className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs shadow-md shadow-teal-600/20 transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
              <span>Take a Quiz to Claim #1</span>
            </button>
          )}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-400 font-medium">
            <span className="flex items-center gap-1"><Sparkles className="w-3 h-3 text-amber-500" /> Live CBSE Rankings</span>
            <span>•</span>
            <span className="flex items-center gap-1"><Target className="w-3 h-3 text-blue-500" /> Accuracy Tracking</span>
            <span>•</span>
            <span className="flex items-center gap-1"><BookOpen className="w-3 h-3 text-emerald-500" /> Chapters Completed</span>
          </div>
        </div>
      ) : (
        <>
          {/* TOP 3 PODIUM DISPLAY */}
          {top3Podium.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 items-end relative z-10">
          
          {/* RANK 2 - SILVER */}
          {top3Podium[1] && (
            <div 
              onClick={() => setSelectedInspectStudent(top3Podium[1])}
              className={`order-2 md:order-1 bg-gradient-to-b from-slate-50 via-white to-slate-100 rounded-3xl p-6 border transition-all cursor-pointer hover:-translate-y-1 hover:shadow-lg relative flex flex-col items-center text-center ${
                top3Podium[1].isCurrentUser ? 'border-blue-500 ring-2 ring-blue-400/40' : 'border-slate-300 shadow-sm'
              }`}
            >
              {/* Silver Rank Badge */}
              <div className="w-8 h-8 rounded-full bg-slate-300 text-slate-800 font-black text-xs flex items-center justify-center absolute -top-4 shadow-md border-2 border-white">
                2
              </div>

              {/* Avatar Icon */}
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-tr ${top3Podium[1].avatarBg} text-white font-black text-2xl flex items-center justify-center mb-3 shadow-md border-2 border-slate-200 mt-2`}>
                {top3Podium[1].name.charAt(0)}
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-center gap-1.5">
                  <span className="font-extrabold text-slate-900 text-base">{top3Podium[1].name}</span>
                  {top3Podium[1].isCurrentUser && (
                    <span className="px-1.5 py-0.2 text-[9px] font-black bg-blue-600 text-white rounded">YOU</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 font-medium line-clamp-1">{top3Podium[1].schoolName}</p>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-800 mt-1">
                  {top3Podium[1].badge}
                </span>
              </div>

              {/* Key Stat Focus */}
              <div className="mt-4 w-full p-3 bg-white rounded-2xl border border-slate-200 grid grid-cols-2 gap-2 text-center shadow-2xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Accuracy</span>
                  <span className="font-black text-blue-600 text-sm">{top3Podium[1].accuracy}%</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Topics</span>
                  <span className="font-black text-emerald-600 text-sm">{top3Podium[1].topicsCompleted} Chapters</span>
                </div>
              </div>
            </div>
          )}

          {/* RANK 1 - GOLD CROWN CHAMPION */}
          {top3Podium[0] && (
            <div 
              onClick={() => setSelectedInspectStudent(top3Podium[0])}
              className={`order-1 md:order-2 bg-gradient-to-b from-amber-500/10 via-amber-50/50 to-amber-100/30 rounded-3xl p-6 sm:p-7 border-2 transition-all cursor-pointer hover:-translate-y-1 hover:shadow-xl relative flex flex-col items-center text-center glow-indigo ${
                top3Podium[0].isCurrentUser ? 'border-amber-500 ring-4 ring-amber-400/30' : 'border-amber-400 shadow-md'
              }`}
            >
              {/* Crown Emblem */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 font-black text-sm flex items-center justify-center absolute -top-5 shadow-lg border-2 border-white animate-bounce duration-1000">
                <Crown className="w-5 h-5 text-slate-900 fill-amber-950" />
              </div>

              {/* Avatar Icon */}
              <div className={`w-20 h-20 rounded-3xl bg-gradient-to-tr ${top3Podium[0].avatarBg} text-white font-black text-3xl flex items-center justify-center mb-3 shadow-lg border-4 border-amber-300 mt-3`}>
                {top3Podium[0].name.charAt(0)}
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-center gap-1.5">
                  <span className="font-black text-slate-900 text-lg">{top3Podium[0].name}</span>
                  {top3Podium[0].isCurrentUser && (
                    <span className="px-1.5 py-0.2 text-[9px] font-black bg-blue-600 text-white rounded">YOU</span>
                  )}
                </div>
                <p className="text-xs text-slate-600 font-medium line-clamp-1">{top3Podium[0].schoolName}</p>
                <span className="inline-block px-3 py-0.5 rounded-full text-xs font-black bg-amber-400 text-slate-900 shadow-xs mt-1">
                  {top3Podium[0].badge}
                </span>
              </div>

              {/* Key Stat Focus */}
              <div className="mt-5 w-full p-3.5 bg-white rounded-2xl border border-amber-200/90 grid grid-cols-3 gap-1 text-center shadow-xs">
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Accuracy</span>
                  <span className="font-black text-blue-600 text-sm">{top3Podium[0].accuracy}%</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Topics</span>
                  <span className="font-black text-emerald-600 text-sm">{top3Podium[0].topicsCompleted}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Total XP</span>
                  <span className="font-black text-amber-600 text-sm">{top3Podium[0].totalXp}</span>
                </div>
              </div>
            </div>
          )}

          {/* RANK 3 - BRONZE */}
          {top3Podium[2] && (
            <div 
              onClick={() => setSelectedInspectStudent(top3Podium[2])}
              className={`order-3 bg-gradient-to-b from-amber-900/5 via-white to-amber-900/10 rounded-3xl p-6 border transition-all cursor-pointer hover:-translate-y-1 hover:shadow-lg relative flex flex-col items-center text-center ${
                top3Podium[2].isCurrentUser ? 'border-blue-500 ring-2 ring-blue-400/40' : 'border-amber-700/30 shadow-sm'
              }`}
            >
              {/* Bronze Rank Badge */}
              <div className="w-8 h-8 rounded-full bg-amber-700 text-white font-black text-xs flex items-center justify-center absolute -top-4 shadow-md border-2 border-white">
                3
              </div>

              {/* Avatar Icon */}
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-tr ${top3Podium[2].avatarBg} text-white font-black text-2xl flex items-center justify-center mb-3 shadow-md border-2 border-amber-200 mt-2`}>
                {top3Podium[2].name.charAt(0)}
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-center gap-1.5">
                  <span className="font-extrabold text-slate-900 text-base">{top3Podium[2].name}</span>
                  {top3Podium[2].isCurrentUser && (
                    <span className="px-1.5 py-0.2 text-[9px] font-black bg-blue-600 text-white rounded">YOU</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 font-medium line-clamp-1">{top3Podium[2].schoolName}</p>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 mt-1">
                  {top3Podium[2].badge}
                </span>
              </div>

              {/* Key Stat Focus */}
              <div className="mt-4 w-full p-3 bg-white rounded-2xl border border-slate-200 grid grid-cols-2 gap-2 text-center shadow-2xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Accuracy</span>
                  <span className="font-black text-blue-600 text-sm">{top3Podium[2].accuracy}%</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Topics</span>
                  <span className="font-black text-emerald-600 text-sm">{top3Podium[2].topicsCompleted} Chapters</span>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* RANKS #4 TO #10 DETAILED LEADERBOARD LIST */}
      <div className="space-y-3 relative z-10">
        <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider px-3 pb-1 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <span className="w-8 text-center">Rank</span>
            <span>Student & School</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="hidden sm:inline">Topics</span>
            <span className="hidden sm:inline">Accuracy</span>
            <span>Total XP</span>
          </div>
        </div>

        {restLeaderboard.length === 0 ? (
          <div className="text-center py-6 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200 text-slate-500 text-xs">
            {sortedStudents.length <= 3 
              ? 'Ranks #4 and below are open. Take a chapter quiz to earn your spot on the leaderboard!' 
              : 'No additional students found for the active filter.'}
          </div>
        ) : (
          restLeaderboard.map((student, idx) => {
            const actualRank = idx + 4;
            return (
              <div
                key={student.id}
                onClick={() => setSelectedInspectStudent(student)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                  student.isCurrentUser
                    ? 'bg-blue-50/90 border-blue-400 shadow-sm'
                    : 'bg-white hover:bg-slate-50 border-slate-200/90'
                }`}
              >
                {/* Left Rank + Student Info */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                    student.isCurrentUser ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                  }`}>
                    #{actualRank}
                  </div>

                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${student.avatarBg} text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-2xs`}>
                    {student.name.charAt(0)}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 text-xs sm:text-sm truncate">{student.name}</span>
                      {student.isCurrentUser && (
                        <span className="px-1.5 py-0.2 text-[9px] font-black bg-blue-600 text-white rounded shrink-0">YOU</span>
                      )}
                      <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 shrink-0 hidden md:inline">
                        Class {student.classLevel}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">{student.schoolName}</p>
                  </div>
                </div>

                {/* Right Metrics */}
                <div className="flex items-center gap-4 sm:gap-6 shrink-0 text-right">
                  
                  {/* Completed Topics */}
                  <div className="hidden sm:block">
                    <span className="font-extrabold text-emerald-600 text-xs sm:text-sm block">
                      {student.topicsCompleted} Topics
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium block">Completed</span>
                  </div>

                  {/* Accuracy Bar */}
                  <div className="hidden sm:block text-right min-w-20">
                    <span className="font-extrabold text-blue-600 text-xs sm:text-sm block">
                      {student.accuracy}%
                    </span>
                    <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-0.5 ml-auto">
                      <div 
                        className="h-full bg-blue-600 rounded-full" 
                        style={{ width: `${Math.min(100, student.accuracy)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* XP Points */}
                  <div className="text-right">
                    <span className="font-black text-amber-600 text-xs sm:text-sm flex items-center gap-1 justify-end">
                      <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                      <span>{student.totalXp} XP</span>
                    </span>
                    <span className="text-[10px] text-slate-400 block">{student.badge}</span>
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-400 hidden sm:block" />
                </div>
              </div>
            );
          })
        )}
      </div>
        </>
      )}

      {/* STUDENT PROFILE INSPECT MODAL */}
      {selectedInspectStudent && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header Banner */}
            <div className={`p-6 bg-gradient-to-tr ${selectedInspectStudent.avatarBg} text-white relative`}>
              <button
                onClick={() => setSelectedInspectStudent(null)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center absolute right-4 top-4 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 font-black text-3xl flex items-center justify-center shadow-lg">
                  {selectedInspectStudent.name.charAt(0)}
                </div>
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-white/20 text-white border border-white/30">
                    Class {selectedInspectStudent.classLevel} • {selectedInspectStudent.subject}
                  </span>
                  <h3 className="text-xl font-black text-white mt-1">{selectedInspectStudent.name}</h3>
                  <p className="text-xs text-slate-100">{selectedInspectStudent.schoolName}</p>
                </div>
              </div>
            </div>

            {/* Modal Body Stats */}
            <div className="p-6 space-y-6">
              
              {/* Badge Tag */}
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-center">
                <span className="text-[10px] font-bold text-amber-800 uppercase tracking-widest block">Active Distinction Title</span>
                <span className="text-sm font-extrabold text-amber-950 mt-0.5 block">{selectedInspectStudent.badge}</span>
              </div>

              {/* Grid Metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                  <Target className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                  <span className="text-2xl font-black text-slate-900 block">{selectedInspectStudent.accuracy}%</span>
                  <span className="text-xs text-slate-500 font-medium">Quiz Accuracy</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                  <BookOpen className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                  <span className="text-2xl font-black text-slate-900 block">{selectedInspectStudent.topicsCompleted}</span>
                  <span className="text-xs text-slate-500 font-medium">Chapters Completed</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                  <Zap className="w-5 h-5 text-amber-500 fill-amber-400 mx-auto mb-1" />
                  <span className="text-2xl font-black text-slate-900 block">{selectedInspectStudent.totalXp}</span>
                  <span className="text-xs text-slate-500 font-medium">Total Study XP</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                  <Flame className="w-5 h-5 text-rose-500 fill-rose-500 mx-auto mb-1" />
                  <span className="text-2xl font-black text-slate-900 block">{selectedInspectStudent.streakDays} Days</span>
                  <span className="text-xs text-slate-500 font-medium">Study Streak</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedInspectStudent(null)}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-2xl transition-all cursor-pointer shadow-md"
              >
                Close Profile
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
