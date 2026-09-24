import React from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';

interface BookmarkButtonProps {
  isBookmarked: boolean;
  onToggle: (e: React.MouseEvent) => void;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  activeColor?: 'amber' | 'indigo' | 'emerald';
  className?: string;
  tooltip?: string;
}

export const BookmarkButton: React.FC<BookmarkButtonProps> = ({
  isBookmarked,
  onToggle,
  size = 'sm',
  showLabel = false,
  activeColor = 'amber',
  className = '',
  tooltip,
}) => {
  const iconSizeClass =
    size === 'xs'
      ? 'w-3.5 h-3.5'
      : size === 'sm'
      ? 'w-4 h-4'
      : size === 'md'
      ? 'w-4.5 h-4.5'
      : 'w-5 h-5';

  const defaultTooltip = isBookmarked
    ? 'Remove from My Favorites'
    : 'Bookmark to My Favorites';

  const activeColorClasses = {
    amber: 'text-amber-500 bg-amber-50 border-amber-300 hover:bg-amber-100 hover:border-amber-400',
    indigo: 'text-indigo-600 bg-indigo-50 border-indigo-300 hover:bg-indigo-100 hover:border-indigo-400',
    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-300 hover:bg-emerald-100 hover:border-emerald-400',
  }[activeColor];

  const activeIconFillClasses = {
    amber: 'fill-amber-400 text-amber-600',
    indigo: 'fill-indigo-500 text-indigo-600',
    emerald: 'fill-emerald-500 text-emerald-600',
  }[activeColor];

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onToggle(e);
      }}
      title={tooltip || defaultTooltip}
      aria-label={tooltip || defaultTooltip}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg border transition-all cursor-pointer select-none active:scale-95 ${
        isBookmarked
          ? `${activeColorClasses} shadow-xs font-semibold`
          : 'text-slate-400 hover:text-slate-700 bg-white/80 hover:bg-slate-100 border-slate-200'
      } ${
        size === 'xs'
          ? 'p-1 text-[10px]'
          : size === 'sm'
          ? 'p-1.5 text-xs'
          : size === 'md'
          ? 'px-2.5 py-1.5 text-xs'
          : 'px-3 py-2 text-sm'
      } ${className}`}
    >
      {isBookmarked ? (
        <BookmarkCheck className={`${iconSizeClass} ${activeIconFillClasses} transition-transform transform scale-105`} />
      ) : (
        <Bookmark className={`${iconSizeClass} transition-colors`} />
      )}
      {showLabel && (
        <span className="truncate">
          {isBookmarked ? 'Bookmarked' : 'Bookmark'}
        </span>
      )}
    </button>
  );
};
