import React, { useState, useMemo } from 'react';
import { 
  Award, 
  Trophy, 
  Flame, 
  Star, 
  Zap, 
  BookmarkCheck, 
  Clock, 
  CheckCircle, 
  Lock, 
  Sparkles, 
  ShieldCheck, 
  ChevronRight,
  Info,
  X
} from 'lucide-react';
import { QuizAttempt, StudentProfile } from '../types';

export interface BadgeDefinition {
  id: string;
  title: string;
  description: string;
  category: 'Milestone' | 'Performance' | 'Habit' | 'Mastery';
  icon: string;
  xpReward: number;
  requirement: string;
  isUnlocked: boolean;
  unlockedDate?: string;
  progressPercent: number;
  progressText: string;
}

interface AchievementBadgesProps {
  studentProfile: StudentProfile;
  quizAttempts: QuizAttempt[];
  onTakeQuizClick?: () => void;
}

export const AchievementBadges: React.FC<AchievementBadgesProps> = ({
  studentProfile,
  quizAttempts,
  onTakeQuizClick
}) => {
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [selectedBadge, setSelectedBadge] = useState<BadgeDefinition | null>(null);

  // Compute metrics for badge checks
  const totalAttempts = quizAttempts.length;
  const hasPerfectScore = quizAttempts.some(a => a.percentage === 100);
  const bestScore = totalAttempts > 0 ? Math.max(...quizAttempts.map(a => a.percentage)) : 0;
  
  // Distinct quiz dates for daily learner
  const distinctDates = useMemo(() => {
    const dates = new Set<string>();
    quizAttempts.forEach(a => {
      dates.add(new Date(a.date).toISOString().split('T')[0]);
    });
    return dates.size;
  }, [quizAttempts]);

  // Exam mode with >= 85%
  const hasBoardReadyExam = quizAttempts.some(a => a.percentage >= 85 && a.mode === 'exam');
  const bestExamScore = quizAttempts
    .filter(a => a.mode === 'exam')
    .reduce((max, a) => Math.max(max, a.percentage), 0);

  // Total questions solved
  const totalQuestionsSolved = quizAttempts.reduce(
    (acc, a) => acc + (a.userAnswers ? Object.keys(a.userAnswers).length : a.totalQuestions), 
    0
  );

  // Total bookmarks (notes + questions)
  const totalBookmarks = (studentProfile.bookmarks?.length || 0) + (studentProfile.bookmarkedQuestions?.length || 0);

  // Speed test under 5 minutes (300s) with >= 80%
  const hasSpeedDemon = quizAttempts.some(a => a.timeSpentSeconds <= 300 && a.percentage >= 80);

  // Master badge definitions
  const badgeCatalog: BadgeDefinition[] = useMemo(() => {
    return [
      {
        id: 'badge-first-quiz',
        title: 'First Quiz Attempt',
        description: 'Completed your very first test on Learn with Zakir.',
        category: 'Milestone',
        icon: 'Award',
        xpReward: 100,
        requirement: 'Attempt at least 1 quiz or test in any mode',
        isUnlocked: totalAttempts >= 1,
        unlockedDate: totalAttempts >= 1 ? quizAttempts[0]?.date.split('T')[0] : undefined,
        progressPercent: totalAttempts >= 1 ? 100 : 0,
        progressText: `${Math.min(totalAttempts, 1)} / 1 Test`
      },
      {
        id: 'badge-perfect-score',
        title: 'Perfect Score (Centum 100%)',
        description: 'Achieved an immaculate 100% score on any practice lab or exam.',
        category: 'Performance',
        icon: 'Trophy',
        xpReward: 300,
        requirement: 'Score 100% on any quiz assessment',
        isUnlocked: hasPerfectScore,
        unlockedDate: quizAttempts.find(a => a.percentage === 100)?.date.split('T')[0],
        progressPercent: hasPerfectScore ? 100 : Math.min(Math.round(bestScore), 99),
        progressText: hasPerfectScore ? '100% Flawless' : `Best: ${Math.round(bestScore)}%`
      },
      {
        id: 'badge-daily-learner',
        title: 'Daily Learner',
        description: 'Demonstrated consistent study habits across 3 or more distinct days.',
        category: 'Habit',
        icon: 'Flame',
        xpReward: 200,
        requirement: 'Attempt assessments across 3 separate days',
        isUnlocked: distinctDates >= 3,
        unlockedDate: distinctDates >= 3 ? quizAttempts[0]?.date.split('T')[0] : undefined,
        progressPercent: Math.min(Math.round((distinctDates / 3) * 100), 100),
        progressText: `${Math.min(distinctDates, 3)} / 3 Active Days`
      },
      {
        id: 'badge-board-ready',
        title: 'Board Ready Benchmark',
        description: 'Scored 85% or higher in a timed CBSE Board Mock Exam.',
        category: 'Performance',
        icon: 'Star',
        xpReward: 250,
        requirement: 'Score >= 85% in Exam Mode under timed conditions',
        isUnlocked: hasBoardReadyExam,
        unlockedDate: quizAttempts.find(a => a.mode === 'exam' && a.percentage >= 85)?.date.split('T')[0],
        progressPercent: hasBoardReadyExam ? 100 : Math.min(Math.round((bestExamScore / 85) * 100), 100),
        progressText: hasBoardReadyExam ? 'Achieved 85%+' : `Top: ${Math.round(bestExamScore)}% / 85%`
      },
      {
        id: 'badge-revision-master',
        title: 'Revision Vault Curator',
        description: 'Saved 3 or more important notes or tricky MCQs for quick revision.',
        category: 'Habit',
        icon: 'BookmarkCheck',
        xpReward: 150,
        requirement: 'Bookmark 3+ study materials or tricky questions',
        isUnlocked: totalBookmarks >= 3,
        unlockedDate: totalBookmarks >= 3 ? new Date().toISOString().split('T')[0] : undefined,
        progressPercent: Math.min(Math.round((totalBookmarks / 3) * 100), 100),
        progressText: `${Math.min(totalBookmarks, 3)} / 3 Saved Items`
      },
      {
        id: 'badge-disciplined-scholar',
        title: 'Disciplined Scholar',
        description: 'Completed 5 full practice tests and comprehensive assessments.',
        category: 'Milestone',
        icon: 'CheckCircle',
        xpReward: 250,
        requirement: 'Complete 5 comprehensive quiz attempts',
        isUnlocked: totalAttempts >= 5,
        unlockedDate: totalAttempts >= 5 ? quizAttempts[0]?.date.split('T')[0] : undefined,
        progressPercent: Math.min(Math.round((totalAttempts / 5) * 100), 100),
        progressText: `${Math.min(totalAttempts, 5)} / 5 Quizzes`
      },
      {
        id: 'badge-century-club',
        title: 'Century Club (20+ MCQs)',
        description: 'Solved over 20 interactive questions in IT, IP, or Typography.',
        category: 'Mastery',
        icon: 'Zap',
        xpReward: 200,
        requirement: 'Solve 20 or more interactive questions',
        isUnlocked: totalQuestionsSolved >= 20,
        unlockedDate: totalQuestionsSolved >= 20 ? new Date().toISOString().split('T')[0] : undefined,
        progressPercent: Math.min(Math.round((totalQuestionsSolved / 20) * 100), 100),
        progressText: `${Math.min(totalQuestionsSolved, 20)} / 20 MCQs`
      },
      {
        id: 'badge-speed-demon',
        title: 'Speed Demon',
        description: 'Completed a quiz in under 5 minutes with 80%+ accuracy.',
        category: 'Performance',
        icon: 'Clock',
        xpReward: 200,
        requirement: 'Finish a test in under 300 seconds scoring 80%+',
        isUnlocked: hasSpeedDemon,
        unlockedDate: hasSpeedDemon ? quizAttempts.find(a => a.timeSpentSeconds <= 300 && a.percentage >= 80)?.date.split('T')[0] : undefined,
        progressPercent: hasSpeedDemon ? 100 : 0,
        progressText: hasSpeedDemon ? 'Achieved < 5 min' : 'In Progress'
      }
    ];
  }, [totalAttempts, hasPerfectScore, bestScore, distinctDates, hasBoardReadyExam, bestExamScore, totalBookmarks, totalQuestionsSolved, hasSpeedDemon, quizAttempts]);

  const unlockedCount = badgeCatalog.filter(b => b.isUnlocked).length;
  const totalBadgesCount = badgeCatalog.length;
  const overallProgressPercent = Math.round((unlockedCount / totalBadgesCount) * 100);
  const totalXPEarned = badgeCatalog
    .filter(b => b.isUnlocked)
    .reduce((sum, b) => sum + b.xpReward, 0);

  // Filter badges
  const filteredBadges = badgeCatalog.filter(b => {
    if (filter === 'unlocked') return b.isUnlocked;
    if (filter === 'locked') return !b.isUnlocked;
    return true;
  });

  const renderBadgeIcon = (iconName: string, isUnlocked: boolean) => {
    const props = { className: `w-6 h-6 ${isUnlocked ? 'text-amber-500 fill-amber-400' : 'text-slate-400'}` };
    switch (iconName) {
      case 'Award': return <Award {...props} />;
      case 'Trophy': return <Trophy {...props} />;
      case 'Flame': return <Flame {...props} />;
      case 'Star': return <Star {...props} />;
      case 'Zap': return <Zap {...props} />;
      case 'BookmarkCheck': return <BookmarkCheck {...props} />;
      case 'Clock': return <Clock {...props} />;
      case 'CheckCircle': return <CheckCircle {...props} />;
      default: return <Sparkles {...props} />;
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
      {/* Header & Milestone Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Trophy className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">
              Achievement Badges & Milestones
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
              {unlockedCount}/{totalBadgesCount} Unlocked
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Earn official badges and XP rewards as you hit key learning milestones, master concepts, and maintain consistency.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({totalBadgesCount})
          </button>
          <button
            onClick={() => setFilter('unlocked')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === 'unlocked'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Unlocked ({unlockedCount})
          </button>
          <button
            onClick={() => setFilter('locked')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === 'locked'
                ? 'bg-white text-amber-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            In Progress ({totalBadgesCount - unlockedCount})
          </button>
        </div>
      </div>

      {/* Progress & Level Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-blue-500/10 border border-amber-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
              <span>Scholar Level: Tier {unlockedCount >= 6 ? '3 (Gold Master)' : unlockedCount >= 3 ? '2 (Silver)' : '1 (Bronze)'}</span>
            </span>
            <span className="font-black text-amber-700">{totalXPEarned} XP Earned</span>
          </div>

          <div className="w-full bg-slate-200/80 h-2.5 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-amber-500 to-indigo-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${overallProgressPercent}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>{unlockedCount} of {totalBadgesCount} badges earned</span>
            <span>{overallProgressPercent}% Complete</span>
          </div>
        </div>

        {onTakeQuizClick && (
          <button
            onClick={onTakeQuizClick}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>Unlock Next Badge</span>
          </button>
        )}
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredBadges.map(badge => {
          const isUnlocked = badge.isUnlocked;

          return (
            <div
              key={badge.id}
              onClick={() => setSelectedBadge(badge)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between relative group ${
                isUnlocked
                  ? 'bg-gradient-to-b from-white to-amber-50/30 border-amber-200/80 hover:border-amber-400 shadow-2xs hover:shadow-xs'
                  : 'bg-slate-50/70 border-slate-200 hover:border-slate-300 opacity-90'
              }`}
            >
              {/* Top Tag & Status */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {badge.category}
                  </span>
                  {isUnlocked ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      <ShieldCheck className="w-3 h-3" />
                      Unlocked
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded-full">
                      <Lock className="w-3 h-3" />
                      Locked
                    </span>
                  )}
                </div>

                {/* Icon & Title */}
                <div className="flex items-start gap-3 mb-2">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-xs transition-transform group-hover:scale-105 ${
                    isUnlocked
                      ? 'bg-amber-100 text-amber-700 border border-amber-200'
                      : 'bg-slate-200 text-slate-400'
                  }`}>
                    {renderBadgeIcon(badge.icon, isUnlocked)}
                  </div>
                  <div>
                    <h4 className={`font-bold text-xs leading-tight ${isUnlocked ? 'text-slate-900' : 'text-slate-600'}`}>
                      {badge.title}
                    </h4>
                    <span className="text-[10px] font-semibold text-amber-600 block mt-0.5">
                      +{badge.xpReward} XP
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2 mt-1">
                  {badge.description}
                </p>
              </div>

              {/* Progress & Bottom Info */}
              <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
                <div className="flex justify-between text-[10px] font-semibold">
                  <span className="text-slate-500">{badge.progressText}</span>
                  <span className={isUnlocked ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                    {isUnlocked ? 'Completed' : `${badge.progressPercent}%`}
                  </span>
                </div>

                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      isUnlocked ? 'bg-amber-500' : 'bg-blue-400'
                    }`}
                    style={{ width: `${badge.progressPercent}%` }}
                  ></div>
                </div>

                {isUnlocked && badge.unlockedDate && (
                  <span className="text-[9px] text-slate-400 block pt-0.5">
                    Unlocked on: {badge.unlockedDate}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Badge Detail Modal */}
      {selectedBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4 relative">
            <button
              onClick={() => setSelectedBadge(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col items-center text-center space-y-2 pt-2">
              <div className={`w-16 h-16 rounded-3xl flex items-center justify-center shadow-md ${
                selectedBadge.isUnlocked
                  ? 'bg-amber-100 text-amber-700 border-2 border-amber-300'
                  : 'bg-slate-100 text-slate-400 border border-slate-200'
              }`}>
                {renderBadgeIcon(selectedBadge.icon, selectedBadge.isUnlocked)}
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  {selectedBadge.category} Badge
                </span>
                <h3 className="font-extrabold text-slate-900 text-base mt-0.5">
                  {selectedBadge.title}
                </h3>
                <span className="text-xs font-bold text-amber-600 block">
                  Reward: +{selectedBadge.xpReward} XP Points
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed px-2">
                {selectedBadge.description}
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
              <div className="flex justify-between font-medium">
                <span className="text-slate-500">Milestone Criteria:</span>
                <span className="text-slate-900 font-bold text-right">{selectedBadge.requirement}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span className="text-slate-500">Current Status:</span>
                <span className={`font-bold ${selectedBadge.isUnlocked ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {selectedBadge.isUnlocked ? 'Unlocked & Earned' : 'Locked / In Progress'}
                </span>
              </div>
              <div className="flex justify-between font-medium">
                <span className="text-slate-500">Progress:</span>
                <span className="font-bold text-slate-900">{selectedBadge.progressText}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setSelectedBadge(null)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                Close
              </button>
              {!selectedBadge.isUnlocked && onTakeQuizClick && (
                <button
                  onClick={() => {
                    setSelectedBadge(null);
                    onTakeQuizClick();
                  }}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20"
                >
                  Take Quiz Now
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
