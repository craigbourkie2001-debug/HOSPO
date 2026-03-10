import React from "react";
import { Star, ThumbsUp } from "lucide-react";

function RatingBar({ label, value }) {
  const pct = ((value || 0) / 5) * 100;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs tracking-wider w-24 flex-shrink-0" style={{ color: 'var(--clay)' }}>{label}</span>
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--sand)' }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: 'var(--terracotta)' }} />
      </div>
      <span className="text-xs font-normal w-6 text-right" style={{ color: 'var(--earth)' }}>{value ? value.toFixed(1) : '—'}</span>
    </div>
  );
}

export default function WorkerRatingBreakdown({ reviews }) {
  if (!reviews || reviews.length === 0) return null;

  const avg = (key) => {
    const vals = reviews.filter(r => r[key] > 0);
    if (!vals.length) return 0;
    return vals.reduce((s, r) => s + r[key], 0) / vals.length;
  };

  const overall = avg('rating');
  const punctuality = avg('punctuality_rating');
  const skill = avg('skill_rating');
  const attitude = avg('attitude_rating');
  const wouldHireCount = reviews.filter(r => r.would_hire_again).length;
  const wouldHirePct = Math.round((wouldHireCount / reviews.length) * 100);

  return (
    <div className="p-5 rounded-2xl border mb-6" style={{ backgroundColor: 'var(--cream)', borderColor: 'var(--sand)' }}>
      <div className="flex items-start gap-6 mb-5">
        {/* Big score */}
        <div className="text-center">
          <div className="text-5xl font-light mb-1" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--terracotta)' }}>
            {overall.toFixed(1)}
          </div>
          <div className="flex justify-center gap-0.5 mb-1">
            {[1,2,3,4,5].map(i => (
              <Star key={i} className="w-3.5 h-3.5" style={{ color: 'var(--terracotta)', fill: i <= Math.round(overall) ? 'var(--terracotta)' : 'none' }} />
            ))}
          </div>
          <div className="text-xs" style={{ color: 'var(--clay)' }}>{reviews.length} review{reviews.length !== 1 ? 's' : ''}</div>
        </div>

        {/* Breakdown bars */}
        <div className="flex-1 space-y-3">
          <RatingBar label="PUNCTUALITY" value={punctuality} />
          <RatingBar label="SKILL" value={skill} />
          <RatingBar label="ATTITUDE" value={attitude} />
        </div>
      </div>

      {/* Would hire again */}
      <div className="flex items-center gap-2 pt-4 border-t" style={{ borderColor: 'var(--sand)' }}>
        <ThumbsUp className="w-4 h-4" style={{ color: 'var(--sage)' }} />
        <span className="text-sm font-normal" style={{ color: 'var(--earth)' }}>
          {wouldHirePct}% of employers would hire again
        </span>
      </div>
    </div>
  );
}