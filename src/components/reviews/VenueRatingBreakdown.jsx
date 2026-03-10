import React from "react";
import { Star, ThumbsUp } from "lucide-react";

function RatingBar({ label, value }) {
  const pct = ((value || 0) / 5) * 100;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs tracking-wider w-28 flex-shrink-0" style={{ color: 'var(--clay)' }}>{label}</span>
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--sand)' }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: 'var(--terracotta)' }} />
      </div>
      <span className="text-xs font-normal w-6 text-right" style={{ color: 'var(--earth)' }}>{value ? value.toFixed(1) : '—'}</span>
    </div>
  );
}

export default function VenueRatingBreakdown({ reviews }) {
  if (!reviews || reviews.length === 0) return null;

  const avg = (key) => {
    const vals = reviews.filter(r => r[key] > 0);
    if (!vals.length) return 0;
    return vals.reduce((s, r) => s + r[key], 0) / vals.length;
  };

  const overall = avg('overall_rating');
  const management = avg('management_rating');
  const environment = avg('environment_rating');
  const pay = avg('pay_rating');
  const wouldWorkCount = reviews.filter(r => r.would_work_again).length;
  const wouldWorkPct = Math.round((wouldWorkCount / reviews.length) * 100);

  return (
    <div className="p-5 rounded-2xl border mb-6" style={{ backgroundColor: 'var(--warm-white)', borderColor: 'var(--sand)' }}>
      <div className="flex items-start gap-6 mb-5">
        <div className="text-center">
          <div className="text-5xl font-light mb-1" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--terracotta)' }}>
            {overall.toFixed(1)}
          </div>
          <div className="flex justify-center gap-0.5 mb-1">
            {[1,2,3,4,5].map(i => (
              <Star key={i} className="w-3.5 h-3.5" style={{ color: 'var(--terracotta)', fill: i <= Math.round(overall) ? 'var(--terracotta)' : 'none' }} />
            ))}
          </div>
          <div className="text-xs" style={{ color: 'var(--clay)' }}>{reviews.length} worker review{reviews.length !== 1 ? 's' : ''}</div>
        </div>

        <div className="flex-1 space-y-3">
          <RatingBar label="MANAGEMENT" value={management} />
          <RatingBar label="ENVIRONMENT" value={environment} />
          <RatingBar label="PAY FAIRNESS" value={pay} />
        </div>
      </div>

      <div className="flex items-center gap-2 pt-4 border-t" style={{ borderColor: 'var(--sand)' }}>
        <ThumbsUp className="w-4 h-4" style={{ color: 'var(--sage)' }} />
        <span className="text-sm font-normal" style={{ color: 'var(--earth)' }}>
          {wouldWorkPct}% of workers would work here again
        </span>
      </div>
    </div>
  );
}