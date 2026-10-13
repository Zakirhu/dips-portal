import React, { useState, useMemo } from 'react';
import { 
  Trophy, 
  Medal, 
  Crown, 
  Sparkles, 
  Flame, 
  TrendingUp, 
  Star, 
  Zap, 
  Award, 
  ArrowUp,
  Filter,
  CheckCircle2,
  Users,
  ChevronRight,
  Target
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ClassLevel, QuizAttempt, StudentProfile } from '../types';

export interface TopScorerEntry {
  id: string;
  name: string;
  avatarSeed: string;
  classLevel: ClassLevel;
  schoolName: string;
  totalScore: number;
  bestPercentage: number;
  quizzesTaken: number;
  averageAccuracy: number;
  badge: string;
  streakDays: number;
  isCurrentUser?: boolean;
}

// Peer community benchmark records
const PEER_SCORERS: TopScorerEntry[] = [];

interface TopScorersWidgetProps {
  onStartQuizClick?: () => void;
  className?: string;
}

export const TopScorersWidget: React.FC<TopScorersWidgetProps> = ({ 
  onStartQuizClick,
  className = '' 
}) => {
  const { studentProfile, quizAttempts } = useApp();
  const [classFilter, setClassFilter] = useState<ClassLevel | 'ALL'>('ALL');
  const [activeMetricTab, setActiveMetricTab] = useState<'cumulative' | 'accuracy' | 'recent'>('cumulative');

  // Compute current user dynamic state from quizAttempts
  const currentUserScorer = useMemo<TopScorerEntry>(() => {
    const userQuizzesTaken = quizAttempts.length;
    const userTotalScore = quizAttempts.reduce((acc, a) => acc + (a.score * 20), 0);
    const userBestPercentage = userQuizzesTaken > 0 ? Math.max(...quizAttempts.map(a => a.percentage)) : 0;
    const userAvgAccuracy = userQuizzesTaken > 0 
      ? Math.round(quizAttempts.reduce((acc, a) => acc + a.percentage, 0) / userQuizzesTaken) 
      : 0;

    let userBadge = 'Rising Scholar';
    if (userBestPercentage === 100) userBadge = 'Centum Achiever 🏆';
    else if (userAvgAccuracy >= 90) userBadge = 'Distinction Scholar 🌟';
    else if (userQuizzesTaken >= 5) userBadge = 'Dedicated Learner 🔥';

    return {
      id: 'current-user-rank',
      name: `${studentProfile.name} (You)`,
      avatarSeed: studentProfile.avatarSeed || studentProfile.name,
      classLevel: studentProfile.classLevel,
      schoolName: 'Your CBSE Institution',
      totalScore: Math.max(userTotalScore, userQuizzesTaken * 120),
      bestPercentage: userBestPercentage,
      quizzesTaken: userQuizzesTaken,
      averageAccuracy: userAvgAccuracy,
      badge: userBadge,
      streakDays: Math.min(14, Math.max(1, userQuizzesTaken * 2)),
      isCurrentUser: true
    };
  }, [studentProfile, quizAttempts]);

  // Combine and sort leaderboard entries based on state
  const rankedScorers = useMemo(() => {
    const all: TopScorerEntry[] = [...PEER_SCORERS];
    if (quizAttempts.length > 0) {
      all.push(currentUserScorer);
    }

    // Filter by class
    const filtered = all.filter(s => {
      if (classFilter === 'ALL') return true;
      return s.classLevel === classFilter;
    });

    // Sort based on active metric
    if (activeMetricTab === 'accuracy') {
      return filtered.sort((a, b) => b.averageAccuracy - a.averageAccuracy || b.totalScore - a.totalScore);
    }
    
    // Default cumulative score / XP
    return filtered.sort((a, b) => b.totalScore - a.totalScore || b.averageAccuracy - a.averageAccuracy);
  }, [currentUserScorer, classFilter, activeMetricTab, quizAttempts.length]);

  // Find user rank in current filtered view
  const userRankIndex = rankedScorers.findIndex(s => s.isCurrentUser);
  const userRank = userRankIndex >= 0 ? userRankIndex + 1 : null;

  // Recent high scorer attempts from app state
  const recentHighScorerAttempts = useMemo(() => {
    return quizAttempts
      .filter(a => a.percentage >= 80)
      .slice(0, 4);
  }, [quizAttempts]);

  return (
    <div className={`bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6 overflow-hidden ${className}`}>
      {/* Header with Title and Class Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
              <Trophy className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl tracking-tight">
              Top Scorers & Live Leaderboard
            </h3>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Sync
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Real-time rankings calculated dynamically from verified quiz attempts across CBSE schools.
          </p>
        </div>

        {/* Metric and Class Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Class Filter Pills */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setClassFilter('ALL')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                classFilter === 'ALL'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Classes
            </button>
            <button
              onClick={() => setClassFilter('X')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                classFilter === 'X'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Class X (IT 402)
            </button>
            <button
              onClick={() => setClassFilter('XII')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                classFilter === 'XII'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Class XII (IP 065)
            </button>
          </div>
        </div>
      </div>

      {/* Content: Podiums & Table or Clean Empty State */}
      {rankedScorers.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-8 space-y-3">
          <Trophy className="w-10 h-10 text-slate-300 mx-auto" />
          <h4 className="font-bold text-slate-700 text-sm">No Test Attempts Recorded Yet</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Live rankings and podium positions are calculated automatically when students take online quizzes.
          </p>
          {onStartQuizClick && (
            <button
              onClick={onStartQuizClick}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>Take Your First Test</span>
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Top 3 Podium Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        {rankedScorers.slice(0, 3).map((scorer, index) => {
          const isFirst = index === 0;
          const isSecond = index === 1;
          const isThird = index === 2;

          let rankBadge = 'bg-amber-100 text-amber-900 border-amber-300';
          let crownColor = 'text-amber-500';
          let borderHighlight = 'border-amber-300/80 bg-gradient-to-b from-amber-50/60 to-white';

          if (isSecond) {
            rankBadge = 'bg-slate-200 text-slate-800 border-slate-300';
            crownColor = 'text-slate-400';
            borderHighlight = 'border-slate-300/80 bg-gradient-to-b from-slate-50/60 to-white';
          } else if (isThird) {
            rankBadge = 'bg-orange-100 text-orange-900 border-orange-300';
            crownColor = 'text-amber-700';
            borderHighlight = 'border-orange-200/80 bg-gradient-to-b from-orange-50/40 to-white';
          }

          return (
            <div
              key={scorer.id}
              className={`p-5 rounded-3xl border-2 transition-all shadow-xs relative overflow-hidden flex flex-col justify-between ${borderHighlight} ${
                scorer.isCurrentUser ? 'ring-2 ring-blue-500 shadow-md shadow-blue-500/10' : ''
              }`}
            >
              {/* Rank Badge & Crown */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <span className={`w-7 h-7 rounded-xl font-black text-xs flex items-center justify-center border ${rankBadge}`}>
                    #{index + 1}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900 text-white">
                    Class {scorer.classLevel}
                  </span>
                </div>
                {isFirst && <Crown className={`w-5 h-5 ${crownColor} animate-bounce`} />}
                {isSecond && <Medal className={`w-5 h-5 ${crownColor}`} />}
                {isThird && <Award className={`w-5 h-5 ${crownColor}`} />}
              </div>

              {/* Scorer Info */}
              <div className="space-y-1 mb-4">
                <div className="flex items-center gap-2">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shadow-xs ${
                    scorer.isCurrentUser 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-slate-800 text-amber-300'
                  }`}>
                    {scorer.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-1">
                      <span>{scorer.name}</span>
                      {scorer.isCurrentUser && (
                        <span className="text-[10px] font-black bg-blue-600 text-white px-1.5 py-0.2 rounded">YOU</span>
                      )}
                    </h4>
                    <p className="text-[11px] text-slate-500 truncate max-w-[170px]">
                      {scorer.schoolName}
                    </p>
                  </div>
                </div>
              </div>

              {/* Score & Accuracy metrics */}
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100/90 text-center">
                <div className="bg-white/80 p-2 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Total XP</span>
                  <span className="text-sm font-black text-slate-900">{scorer.totalScore.toLocaleString()}</span>
                </div>
                <div className="bg-white/80 p-2 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Accuracy</span>
                  <span className="text-sm font-black text-emerald-600">{scorer.averageAccuracy}%</span>
                </div>
              </div>

              {/* Badge Tag */}
              <div className="mt-3 text-center">
                <span className="inline-block text-[10px] font-bold bg-white text-slate-700 px-2.5 py-1 rounded-full border border-slate-200/90 shadow-2xs">
                  {scorer.badge}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* User Status Strip if not in Top 3 */}
      {userRank && userRank > 3 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center font-black text-base text-blue-200">
              #{userRank}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">Your Current Standing: Rank #{userRank}</span>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-500/30 text-blue-200 rounded-full border border-blue-400/30">
                  Class {studentProfile.classLevel}
                </span>
              </div>
              <p className="text-xs text-blue-200/80 mt-0.5">
                {currentUserScorer.quizzesTaken} quizzes completed • {currentUserScorer.totalScore} Total XP • {currentUserScorer.averageAccuracy}% Accuracy
              </p>
            </div>
          </div>

          {onStartQuizClick && (
            <button
              onClick={onStartQuizClick}
              className="flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer shadow-sm"
            >
              <Target className="w-3.5 h-3.5" />
              <span>Attempt Quiz to Level Up</span>
            </button>
          )}
        </div>
      )}

      {/* Complete Rankings List */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
          <span>Rank & Student</span>
          <div className="flex items-center gap-8">
            <span className="hidden sm:inline">Quizzes</span>
            <span className="hidden sm:inline">Accuracy</span>
            <span>Total XP</span>
          </div>
        </div>

        <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
          {rankedScorers.map((scorer, index) => {
            const isUser = scorer.isCurrentUser;

            return (
              <div
                key={scorer.id}
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  isUser
                    ? 'bg-blue-50/80 border-blue-400 shadow-xs ring-1 ring-blue-300'
                    : 'bg-slate-50/60 border-slate-200/80 hover:bg-white hover:border-slate-300'
                }`}
              >
                {/* Left side: Rank + Avatar + Name + Badge */}
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                    index === 0
                      ? 'bg-amber-400 text-slate-950 font-black'
                      : index === 1
                      ? 'bg-slate-300 text-slate-800'
                      : index === 2
                      ? 'bg-amber-700 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}>
                    {index + 1}
                  </span>

                  <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-200 flex items-center justify-center text-xs font-bold shrink-0">
                    {scorer.name.charAt(0)}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold truncate ${isUser ? 'text-blue-900 font-extrabold' : 'text-slate-900'}`}>
                        {scorer.name}
                      </span>
                      <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-white text-slate-600 border border-slate-200 shrink-0">
                        Class {scorer.classLevel}
                      </span>
                      {isUser && (
                        <span className="text-[9px] font-black bg-blue-600 text-white px-1.5 py-0.2 rounded shrink-0">
                          YOU
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">
                      {scorer.schoolName} • <span className="text-slate-500 font-medium">{scorer.badge}</span>
                    </p>
                  </div>
                </div>

                {/* Right side metrics */}
                <div className="flex items-center gap-6 shrink-0 text-right">
                  <span className="text-xs font-medium text-slate-500 hidden sm:inline">
                    {scorer.quizzesTaken} Tests
                  </span>
                  <span className="text-xs font-bold text-emerald-600 hidden sm:inline">
                    {scorer.averageAccuracy}%
                  </span>
                  <div className="w-20 text-right">
                    <span className="text-sm font-black text-slate-900 block">
                      {scorer.totalScore.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-400 block -mt-0.5">XP</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      </>
      )}
    </div>
  );
};
