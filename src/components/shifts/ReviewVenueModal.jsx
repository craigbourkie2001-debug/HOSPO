import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { X, Store, Star } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

function StarRating({ value, onChange, label }) {
  const [hovered, setHovered] = useState(null);
  const display = hovered ?? value;
  return (
    <div>
      <label className="text-xs tracking-wider mb-2 block" style={{ color: 'var(--clay)' }}>{label}</label>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(null)}
            className="transition-all hover:scale-110"
          >
            <Star className="w-8 h-8" style={{
              color: display >= star ? 'var(--terracotta)' : 'var(--sand)',
              fill: display >= star ? 'var(--terracotta)' : 'none'
            }} />
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ReviewVenueModal({ shift, onClose }) {
  const queryClient = useQueryClient();
  const [overallRating, setOverallRating] = useState(0);
  const [managementRating, setManagementRating] = useState(0);
  const [environmentRating, setEnvironmentRating] = useState(0);
  const [payRating, setPayRating] = useState(0);
  const [wouldWorkAgain, setWouldWorkAgain] = useState(true);
  const [comment, setComment] = useState('');

  const submitMutation = useMutation({
    mutationFn: async () => {
      const user = await base44.auth.me();
      await base44.entities.VenueReview.create({
        review_type: shift.venue_type || 'coffee_shop',
        venue_id: shift.venue_id,
        venue_name: shift.venue_name,
        shift_id: shift.id,
        worker_email: user.email,
        worker_name: user.full_name,
        overall_rating: overallRating,
        management_rating: managementRating,
        environment_rating: environmentRating,
        pay_rating: payRating,
        would_work_again: wouldWorkAgain,
        comment
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myShifts'] });
      toast.success('Thank you for your review!');
      onClose();
    },
    onError: () => {
      toast.error('Failed to submit review. Please try again.');
    }
  });

  const canSubmit = overallRating > 0 && managementRating > 0 && environmentRating > 0 && payRating > 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center p-4 z-50 overflow-y-auto">
      <div className="max-w-2xl w-full rounded-2xl p-8 my-8" style={{ backgroundColor: 'var(--warm-white)' }}>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--terracotta)' }}>
              <Store className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-light" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
                Review Your Employer
              </h2>
              <p className="text-sm" style={{ color: 'var(--clay)' }}>
                {shift.venue_name}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5" style={{ color: 'var(--clay)' }} />
          </button>
        </div>

        {/* Shift Info */}
        <div className="p-4 rounded-xl mb-6" style={{ backgroundColor: 'var(--sand)' }}>
          <div className="font-normal mb-1" style={{ color: 'var(--earth)' }}>{shift.venue_name}</div>
          <div className="text-xs" style={{ color: 'var(--clay)' }}>
            {format(new Date(shift.date), 'EEEE, MMMM d, yyyy')} · {shift.start_time} – {shift.end_time}
          </div>
        </div>

        <div className="space-y-6 mb-6">
          <StarRating value={overallRating} onChange={setOverallRating} label="OVERALL RATING *" />
          <div className="grid md:grid-cols-3 gap-5">
            <StarRating value={managementRating} onChange={setManagementRating} label="MANAGEMENT *" />
            <StarRating value={environmentRating} onChange={setEnvironmentRating} label="ENVIRONMENT *" />
            <StarRating value={payRating} onChange={setPayRating} label="PAY FAIRNESS *" />
          </div>

          {/* Would work again */}
          <div>
            <label className="text-xs tracking-wider mb-3 block" style={{ color: 'var(--clay)' }}>
              WOULD YOU WORK HERE AGAIN?
            </label>
            <div className="flex gap-3">
              {[{ val: true, label: 'Yes, definitely' }, { val: false, label: 'Probably not' }].map(({ val, label }) => (
                <button
                  key={String(val)}
                  type="button"
                  onClick={() => setWouldWorkAgain(val)}
                  className="flex-1 py-3 rounded-xl font-normal transition-all"
                  style={wouldWorkAgain === val ? {
                    backgroundColor: val ? 'var(--sage)' : 'var(--clay)', color: 'white'
                  } : {
                    backgroundColor: 'transparent', border: '1px solid var(--sand)', color: 'var(--clay)'
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="text-xs tracking-wider mb-2 block" style={{ color: 'var(--clay)' }}>
              COMMENTS (OPTIONAL)
            </label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What was it like working here? Share honest feedback for other workers..."
              className="rounded-xl border"
              style={{ borderColor: 'var(--sand)' }}
              rows={4}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={() => submitMutation.mutate()}
            disabled={!canSubmit || submitMutation.isPending}
            className="flex-1 rounded-xl font-normal"
            style={{ backgroundColor: 'var(--terracotta)', color: 'white' }}
          >
            {submitMutation.isPending ? 'Submitting...' : 'Submit Review'}
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-xl font-normal"
            style={{ borderColor: 'var(--sand)', color: 'var(--clay)' }}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}