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
  CheckCircle2
} from 'lucide-react';
import { ClassLevel, QuizAttempt, StudentProfile } from '../types';

interface LeaderboardStudent {
  id: string;
  name: string;
  avatarSeed: string;
  classLevel: ClassLevel;
  schoolName: string;
  cumulativeScore: number;
  quizzesTaken: number;
  accuracy: number;
  badge: string;
  streakDays: number;
  isCurrentUser?: boolean;
}

interface GlobalLeaderboardProps {
  currentUserProfile: StudentProfile;
  currentUserAttempts: QuizAttempt[];
  onStartQuizClick?: () => void;
}

// Pre-seeded peer students - populated from real student attempts
const PEER_STUDENTS: LeaderboardStudent[] = [];

export const GlobalLeaderboard: React.FC<GlobalLeaderboardProps> = ({
  currentUserProfile,
  currentUserAttempts,
  onStartQuizClick
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'my-class' | 'middle' | 'secondary'>('all');

  // Compute current user's cumulative score from their quiz attempts
  const userCumulativeScore = useMemo(() => {
    if (currentUserAttempts.length === 0) return 0;
    return currentUserAttempts.reduce((acc, a) => {
      // 100 points per correct answer + percentage bonus points
      const basePoints = a.score * 100;
      const accuracyBonus = Math.round(a.percentage * 5);
      return acc + basePoints + accuracyBonus;
    }, 0);
  }, [currentUserAttempts]);

  const userAccuracy = useMemo(() => {
    if (currentUserAttempts.length === 0) return 0;
    return Math.round(
      currentUserAttempts.reduce((acc, a) => acc + a.percentage, 0) / currentUserAttempts.length
    );
  }, [currentUserAttempts]);

  // Combine currentUser with peers
  const combinedList = useMemo(() => {
    const all: LeaderboardStudent[] = [...PEER_STUDENTS];

    if (currentUserAttempts.length > 0) {
      const userEntry: LeaderboardStudent = {
        id: 'current-user',
        name: currentUserProfile.name,
        avatarSeed: currentUserProfile.avatarSeed,
        classLevel: currentUserProfile.classLevel,
        schoolName: 'Your School (Active)',
        cumulativeScore: userCumulativeScore,
        quizzesTaken: currentUserAttempts.length,
        accuracy: userAccuracy,
        badge: userAccuracy >= 90 ? 'Centum Scholar' : 'Rising Aspirant',
        streakDays: Math.min(currentUserAttempts.length, 12),
        isCurrentUser: true
      };
      all.push(userEntry);
    }

    // Filter according to selection
    let filtered = all;
    if (selectedFilter === 'my-class') {
      filtered = all.filter(s => s.classLevel === currentUserProfile.classLevel);
    } else if (selectedFilter === 'middle') {
      filtered = all.filter(s => ['VI', 'VII', 'VIII'].includes(s.classLevel));
    } else if (selectedFilter === 'secondary') {
      filtered = all.filter(s => ['IX', 'X', 'XI', 'XII'].includes(s.classLevel));
    }

    // Sort descending by cumulativeScore
    return filtered.sort((a, b) => b.cumulativeScore - a.cumulativeScore);
  }, [currentUserProfile, currentUserAttempts, userCumulativeScore, userAccuracy, selectedFilter]);

  // Get Top 10
  const top10 = useMemo(() => combinedList.slice(0, 10), [combinedList]);

  // Current user's rank in the active filtered list
  const currentUserRank = useMemo(() => {
    const idx = combinedList.findIndex(s => s.isCurrentUser);
    return idx !== -1 ? idx + 1 : 11;
  }, [combinedList]);

  const isUserInTop10 = currentUserRank <= 10;
  const top3 = top10.slice(0, 3);

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-8">
      {/* Header and Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Trophy className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg sm:text-xl">
              Global CBSE Student Leaderboard
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
              Live Top 10
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Rankings calculated from cumulative quiz scores, test accuracy, and problem-solving consistency.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Classes (VI–XII)
          </button>
          <button
            onClick={() => setSelectedFilter('my-class')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedFilter === 'my-class'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            My Class ({currentUserProfile.classLevel})
          </button>
          <button
            onClick={() => setSelectedFilter('middle')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedFilter === 'middle'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Middle (VI–VIII)
          </button>
          <button
            onClick={() => setSelectedFilter('secondary')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedFilter === 'secondary'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Secondary (IX–XII)
          </button>
        </div>
      </div>

      {/* Podium Cards for Top 3 or Empty State */}
      {top10.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-8 space-y-3">
          <Trophy className="w-10 h-10 text-slate-300 mx-auto" />
          <h4 className="font-bold text-slate-700 text-sm">No Leaderboard Standings Yet</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Take an online quiz to earn points, unlock achievement badges, and appear on the global leaderboard!
          </p>
          {onStartQuizClick && (
            <button
              onClick={onStartQuizClick}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Zap className="w-3.5 h-3.5 fill-white" />
              <span>Start an Online Quiz</span>
            </button>
          )}
        </div>
      ) : (
        <>
          {top3.length >= 3 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 items-end">
          {/* Rank 2 (Silver) */}
          <div className="order-2 md:order-1 bg-gradient-to-b from-slate-50 to-slate-100/80 rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col items-center text-center relative hover:scale-102 transition-transform">
            <div className="w-7 h-7 rounded-full bg-slate-300 text-slate-800 font-black text-xs flex items-center justify-center absolute -top-3 shadow-sm border-2 border-white">
              2
            </div>
            <div className="w-14 h-14 rounded-2xl bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-lg mb-3 shadow-inner">
              {top3[1].name.charAt(0)}
            </div>
            <div className="flex items-center gap-1 mb-0.5">
              <span className="font-bold text-slate-900 text-sm">{top3[1].name}</span>
              {top3[1].isCurrentUser && (
                <span className="px-1.5 py-0.2 text-[9px] font-extrabold bg-blue-600 text-white rounded">
                  YOU
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Class {top3[1].classLevel} • {top3[1].schoolName}</p>
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-white rounded-full border border-slate-200 text-xs font-bold text-slate-800 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-slate-400" />
              <span>{top3[1].cumulativeScore.toLocaleString()} pts</span>
            </div>
            <span className="text-[10px] text-emerald-700 font-semibold mt-2">
              {top3[1].accuracy}% Accuracy • {top3[1].quizzesTaken} Tests
            </span>
          </div>

          {/* Rank 1 (Gold - Center & Elevated) */}
          <div className="order-1 md:order-2 bg-gradient-to-b from-amber-50/90 via-amber-100/50 to-white rounded-3xl p-6 border-2 border-amber-300 shadow-md flex flex-col items-center text-center relative -translate-y-2 hover:scale-102 transition-transform">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-950 font-black text-sm flex items-center justify-center absolute -top-4 shadow-md border-2 border-white">
              <Crown className="w-5 h-5 fill-amber-300 text-amber-900" />
            </div>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 text-white flex items-center justify-center font-extrabold text-2xl mb-3 shadow-md border-2 border-amber-200">
              {top3[0].name.charAt(0)}
            </div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="font-extrabold text-slate-900 text-base">{top3[0].name}</span>
              {top3[0].isCurrentUser && (
                <span className="px-1.5 py-0.5 text-[9px] font-extrabold bg-blue-600 text-white rounded">
                  YOU
                </span>
              )}
            </div>
            <p className="text-xs text-amber-900 font-medium">Class {top3[0].classLevel} • {top3[0].schoolName}</p>
            <div className="mt-3 inline-flex items-center gap-1.5 px-4 py-1.5 bg-amber-400/20 border border-amber-300 rounded-full text-xs font-black text-amber-950 shadow-xs">
              <Trophy className="w-4 h-4 text-amber-600 fill-amber-400" />
              <span>{top3[0].cumulativeScore.toLocaleString()} Points</span>
            </div>
            <div className="flex items-center gap-2 mt-2 text-[11px] font-bold text-amber-800">
              <span>{top3[0].accuracy}% Accuracy</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                {top3[0].streakDays} Day Streak
              </span>
            </div>
          </div>

          {/* Rank 3 (Bronze) */}
          <div className="order-3 bg-gradient-to-b from-amber-50/40 to-orange-50/40 rounded-2xl p-5 border border-amber-200 shadow-xs flex flex-col items-center text-center relative hover:scale-102 transition-transform">
            <div className="w-7 h-7 rounded-full bg-amber-700 text-white font-black text-xs flex items-center justify-center absolute -top-3 shadow-sm border-2 border-white">
              3
            </div>
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-lg mb-3 shadow-inner">
              {top3[2].name.charAt(0)}
            </div>
            <div className="flex items-center gap-1 mb-0.5">
              <span className="font-bold text-slate-900 text-sm">{top3[2].name}</span>
              {top3[2].isCurrentUser && (
                <span className="px-1.5 py-0.2 text-[9px] font-extrabold bg-blue-600 text-white rounded">
                  YOU
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Class {top3[2].classLevel} • {top3[2].schoolName}</p>
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-white rounded-full border border-amber-200 text-xs font-bold text-amber-900 shadow-2xs">
              <Medal className="w-3.5 h-3.5 text-amber-600" />
              <span>{top3[2].cumulativeScore.toLocaleString()} pts</span>
            </div>
            <span className="text-[10px] text-emerald-700 font-semibold mt-2">
              {top3[2].accuracy}% Accuracy • {top3[2].quizzesTaken} Tests
            </span>
          </div>
        </div>
      )}

      {/* Full Top 10 Table */}
      <div className="border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5 text-center w-14">Rank</th>
                <th className="px-4 py-3.5">Student</th>
                <th className="px-4 py-3.5">Class</th>
                <th className="px-4 py-3.5">Tests Completed</th>
                <th className="px-4 py-3.5">Accuracy</th>
                <th className="px-4 py-3.5">Badge Title</th>
                <th className="px-5 py-3.5 text-right">Cumulative Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {top10.map((student, idx) => {
                const rank = idx + 1;
                const isCurrentUser = !!student.isCurrentUser;

                let rankBadge = (
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center mx-auto">
                    {rank}
                  </span>
                );
                if (rank === 1) {
                  rankBadge = (
                    <span className="w-6 h-6 rounded-full bg-amber-400 text-amber-950 font-black flex items-center justify-center mx-auto shadow-xs">
                      1
                    </span>
                  );
                } else if (rank === 2) {
                  rankBadge = (
                    <span className="w-6 h-6 rounded-full bg-slate-300 text-slate-800 font-bold flex items-center justify-center mx-auto">
                      2
                    </span>
                  );
                } else if (rank === 3) {
                  rankBadge = (
                    <span className="w-6 h-6 rounded-full bg-amber-700 text-white font-bold flex items-center justify-center mx-auto">
                      3
                    </span>
                  );
                }

                return (
                  <tr
                    key={student.id}
                    className={`transition-colors ${
                      isCurrentUser
                        ? 'bg-blue-50/70 border-l-4 border-l-blue-600 font-medium'
                        : 'hover:bg-slate-50/80'
                    }`}
                  >
                    <td className="px-5 py-3.5 text-center">{rankBadge}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                          isCurrentUser
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-200 text-slate-700'
                        }`}>
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900">{student.name}</span>
                            {isCurrentUser && (
                              <span className="px-1.5 py-0.2 text-[9px] font-black bg-blue-600 text-white rounded">
                                YOU
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 block">{student.schoolName}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                        Class {student.classLevel}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 font-medium">
                      {student.quizzesTaken} Tests
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">{student.accuracy}%</span>
                        <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden hidden sm:block">
                          <div
                            className={`h-full rounded-full ${
                              student.accuracy >= 90 ? 'bg-emerald-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${student.accuracy}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        {student.badge}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right font-black text-sm text-slate-900">
                      {student.cumulativeScore.toLocaleString()}{' '}
                      <span className="text-[10px] text-slate-400 font-normal">pts</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Current User Standings Card if not in Top 10 or to encourage climbing */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-base shrink-0 shadow-xs">
            #{currentUserRank}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm">
                Your Current Rank: #{currentUserRank} in {selectedFilter === 'my-class' ? `Class ${currentUserProfile.classLevel}` : 'Global Standings'}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                {userCumulativeScore.toLocaleString()} Points
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              {isUserInTop10
                ? "🔥 Fantastic work! You are currently among the Top 10 scholars on the portal."
                : `Complete ${10 - currentUserRank > 0 ? 10 - currentUserRank : 1} more quiz in Exam Mode to climb into the Top 10 Leaderboard!`}
            </p>
          </div>
        </div>

          {onStartQuizClick && (
            <button
              onClick={onStartQuizClick}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all shrink-0 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 fill-white" />
              <span>Take a Quiz & Earn Points</span>
            </button>
          )}
        </div>
      </>
    )}
  </div>
);
};
