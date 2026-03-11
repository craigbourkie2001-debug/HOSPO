import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Shield, Star, Clock, CheckCircle2, TrendingUp } from "lucide-react";

function ScoreRing({ score, size = 80 }) {
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const color = score >= 80 ? 'var(--sage)' : score >= 60 ? 'var(--terracotta)' : 'var(--clay)';

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--sand)" strokeWidth={6} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={color} strokeWidth={6}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div className="absolute text-center">
        <div className="text-xl font-semibold" style={{ color, letterSpacing: '-0.02em' }}>{score}</div>
      </div>
    </div>
  );
}

function MetricBar({ label, value, max, color, icon: Icon, suffix = '' }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <Icon className="w-3.5 h-3.5" style={{ color: 'var(--clay)' }} />
          <span className="text-xs" style={{ color: 'var(--clay)' }}>{label}</span>
        </div>
        <span className="text-xs font-medium" style={{ color: 'var(--earth)' }}>
          {value}{suffix}
        </span>
      </div>
      <div className="h-1.5 rounded-full" style={{ backgroundColor: 'var(--sand)' }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export default function ReliabilityScore({ user }) {
  const { data: completedShifts = [] } = useQuery({
    queryKey: ['completedShifts', user?.email],
    queryFn: () => base44.entities.Shift.filter({ assigned_to: user?.email, status: 'completed' }),
    enabled: !!user?.email
  });

  const { data: workerReviews = [] } = useQuery({
    queryKey: ['workerReviews', user?.email],
    queryFn: () => base44.entities.WorkerReview.filter({ worker_email: user?.email }),
    enabled: !!user?.email
  });

  // 1. Check-in accuracy: % of completed shifts where checkin_time was recorded
  const totalCompleted = completedShifts.length;
  const checkedInShifts = completedShifts.filter(s => s.checkin_time).length;
  const checkinAccuracy = totalCompleted > 0 ? Math.round((checkedInShifts / totalCompleted) * 100) : 0;

  // 2. Average rating from venue reviews
  const avgRating = workerReviews.length > 0
    ? workerReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / workerReviews.length
    : 0;
  const ratingScore = Math.round((avgRating / 5) * 100);

  // 3. Total hours worked
  const totalHours = completedShifts.reduce((sum, s) => {
    if (s.actual_hours_worked) return sum + s.actual_hours_worked;
    if (s.start_time && s.end_time) {
      const [sh, sm] = s.start_time.split(':').map(Number);
      const [eh, em] = s.end_time.split(':').map(Number);
      return sum + Math.max(0, (eh * 60 + em - sh * 60 - sm) / 60);
    }
    return sum;
  }, 0);
  // Cap hours score at 200h for max score
  const hoursScore = Math.min(Math.round((totalHours / 200) * 100), 100);

  // Reliability Score: weighted average
  // Check-in accuracy 40%, rating 40%, hours 20%
  const hasAnyData = totalCompleted > 0 || workerReviews.length > 0;
  let reliabilityScore = 0;
  if (hasAnyData) {
    if (workerReviews.length > 0 && totalCompleted > 0) {
      reliabilityScore = Math.round(checkinAccuracy * 0.4 + ratingScore * 0.4 + hoursScore * 0.2);
    } else if (totalCompleted > 0) {
      reliabilityScore = Math.round(checkinAccuracy * 0.6 + hoursScore * 0.4);
    } else {
      reliabilityScore = ratingScore;
    }
  }

  const badge = reliabilityScore >= 85 ? { label: 'Top Performer', color: 'var(--sage)' }
    : reliabilityScore >= 70 ? { label: 'Reliable', color: 'var(--terracotta)' }
    : reliabilityScore >= 50 ? { label: 'Building Up', color: 'var(--clay)' }
    : null;

  return (
    <div className="rounded-2xl p-5 mb-5 shadow-sm" style={{ backgroundColor: 'var(--warm-white)' }}>
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-4 h-4" style={{ color: 'var(--terracotta)' }} />
        <h3 className="text-sm font-semibold tracking-wide" style={{ color: 'var(--earth)' }}>RELIABILITY SCORE</h3>
      </div>

      {!hasAnyData ? (
        <div className="text-center py-4">
          <TrendingUp className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--sand)' }} />
          <p className="text-sm" style={{ color: 'var(--clay)' }}>Complete your first shift to build your score</p>
        </div>
      ) : (
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center gap-1 flex-shrink-0">
            <ScoreRing score={reliabilityScore} size={84} />
            {badge && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: badge.color, color: 'white' }}>
                {badge.label}
              </span>
            )}
          </div>

          <div className="flex-1 space-y-3 min-w-0">
            {totalCompleted > 0 && (
              <MetricBar
                label="Check-in Accuracy"
                value={checkinAccuracy}
                max={100}
                color="var(--terracotta)"
                icon={CheckCircle2}
                suffix="%"
              />
            )}
            {workerReviews.length > 0 && (
              <MetricBar
                label={`Avg. Rating (${workerReviews.length} review${workerReviews.length !== 1 ? 's' : ''})`}
                value={avgRating.toFixed(1)}
                max={5}
                color="var(--sage)"
                icon={Star}
                suffix="/5"
              />
            )}
            <MetricBar
              label="Total Hours Worked"
              value={Math.round(totalHours)}
              max={200}
              color="var(--olive)"
              icon={Clock}
              suffix="h"
            />
          </div>
        </div>
      )}
    </div>
  );
}