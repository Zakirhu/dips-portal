import React, { useState } from 'react';
import { Star, MessageSquare, Send, CheckCircle, AlertCircle, X, User } from 'lucide-react';
import type { Resource, ResourceRating, User as UserType } from '../types.js';
import { api } from '../lib/api.js';

interface StarRatingProps {
  rating: number; // 0 to 5
  maxStars?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onRate?: (rating: number) => void;
  hoverRating?: number;
  onHover?: (rating: number) => void;
  onLeave?: () => void;
}

export const StarRatingDisplay: React.FC<StarRatingProps> = ({
  rating,
  maxStars = 5,
  size = 'sm',
  interactive = false,
  onRate,
  hoverRating = 0,
  onHover,
  onLeave,
}) => {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-6 h-6',
  };

  const effectiveRating = hoverRating || rating || 0;

  return (
    <div className="flex items-center gap-0.5" onMouseLeave={onLeave}>
      {Array.from({ length: maxStars }, (_, i) => {
        const starNumber = i + 1;
        const isFilled = starNumber <= effectiveRating;
        const isHalf = !isFilled && starNumber - 0.5 <= effectiveRating;

        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onRate?.(starNumber)}
            onMouseEnter={() => interactive && onHover?.(starNumber)}
            className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform p-0.5' : 'cursor-default'} focus:outline-none`}
            title={interactive ? `Rate ${starNumber} of ${maxStars} stars` : `${rating || 0} stars`}
          >
            <Star
              className={`${sizeClasses[size]} ${
                isFilled
                  ? 'fill-amber-400 text-amber-400'
                  : isHalf
                  ? 'fill-amber-200 text-amber-400'
                  : 'text-slate-300'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
};

interface StarRatingBadgeProps {
  rating?: number;
  count?: number;
  size?: 'xs' | 'sm';
  showZero?: boolean;
}

export const StarRatingBadge: React.FC<StarRatingBadgeProps> = ({
  rating = 0,
  count = 0,
  size = 'sm',
  showZero = false,
}) => {
  if (count === 0 && !showZero) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
        <Star className="w-3 h-3 text-slate-300" />
        <span>No ratings</span>
      </span>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-semibold">
      <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
      <span>{rating ? rating.toFixed(1) : '0.0'}</span>
      <span className="text-amber-700/70 font-normal">({count})</span>
    </div>
  );
};

interface RateResourceModalProps {
  resource: Resource;
  currentUser: UserType;
  isOpen: boolean;
  onClose: () => void;
  onRatingSubmitted: (updatedResource: Resource) => void;
}

export const RateResourceModal: React.FC<RateResourceModalProps> = ({
  resource,
  currentUser,
  isOpen,
  onClose,
  onRatingSubmitted,
}) => {
  // Find current user's existing rating if any
  const existingRating = resource.ratings?.find((r) => r.userId === currentUser.id);

  const [selectedRating, setSelectedRating] = useState<number>(existingRating?.rating || 5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>(existingRating?.feedback || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Sync if resource changes
  React.useEffect(() => {
    if (existingRating) {
      setSelectedRating(existingRating.rating);
      setFeedback(existingRating.feedback || '');
    } else {
      setSelectedRating(5);
      setFeedback('');
    }
    setError('');
    setSuccess(false);
  }, [resource.id, existingRating?.rating]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRating || selectedRating < 1 || selectedRating > 5) {
      setError('Please choose a star rating from 1 to 5.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      const res = await api.rateResource(resource.id, {
        rating: selectedRating,
        feedback: feedback.trim(),
      });

      setSuccess(true);
      setTimeout(() => {
        onRatingSubmitted(res.resource);
        onClose();
      }, 700);
    } catch (err: any) {
      setError(err.message || 'Failed to submit rating. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const ratingDescriptions: Record<number, string> = {
    1: 'Needs Improvement - Major errors or unclear content',
    2: 'Fair - Lacks detailed explanations or examples',
    3: 'Good - Standard curriculum content, fits class needs',
    4: 'Very Good - Clear, well-structured, and helpful',
    5: 'Excellent - Outstanding study material & pedagogy!',
  };

  const activeDescription =
    ratingDescriptions[hoverRating || selectedRating] || 'Select your rating';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
              Rate Educational Content
            </h3>
            <p className="text-xs text-slate-500 truncate max-w-sm mt-0.5">
              {resource.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Feedback submitted! Thank you for supporting curriculum quality.</span>
            </div>
          )}

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Interactive Star Selector */}
          <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 text-center space-y-2">
            <label className="block text-xs font-bold text-slate-800">
              Your Content Quality Rating
            </label>
            <div className="flex justify-center">
              <StarRatingDisplay
                rating={selectedRating}
                hoverRating={hoverRating}
                size="lg"
                interactive={true}
                onRate={(r) => setSelectedRating(r)}
                onHover={(r) => setHoverRating(r)}
                onLeave={() => setHoverRating(0)}
              />
            </div>
            <p className="text-xs font-semibold text-amber-900 min-h-[18px]">
              {activeDescription}
            </p>
          </div>

          {/* Qualitative Written Feedback */}
          <div className="space-y-1.5">
            <label className="block font-semibold text-slate-700">
              Feedback / Review Comments (Optional)
            </label>
            <textarea
              rows={3}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Share what worked well (e.g. clear explanations, helpful practice problems) or areas that could be improved..."
              className="w-full p-3 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none bg-white"
            />
            <p className="text-[11px] text-slate-400">
              Reviews help faculty refine teaching materials across all DIPS campuses.
            </p>
          </div>

          {/* User badge preview */}
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>
                Reviewing as: <strong>{currentUser.fullName}</strong> (
                {currentUser.role === 'student' ? 'Student' : 'Faculty'})
              </span>
            </div>
            {existingRating && (
              <span className="text-amber-700 font-medium">Updating existing review</span>
            )}
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Submitting...' : existingRating ? 'Update Rating' : 'Submit Rating'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
