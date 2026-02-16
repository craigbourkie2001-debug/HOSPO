import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { X, Star, ChefHat, Coffee } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function LeaveReviewModal({ shift, onClose }) {
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [punctualityRating, setPunctualityRating] = useState(0);
  const [skillRating, setSkillRating] = useState(0);
  const [attitudeRating, setAttitudeRating] = useState(0);
  const [wouldHireAgain, setWouldHireAgain] = useState(true);
  const [comment, setComment] = useState('');

  const isChefRole = shift.role_type === 'chef';

  const submitReviewMutation = useMutation({
    mutationFn: async () => {
      // Create review
      await base44.entities.WorkerReview.create({
        worker_email: shift.assigned_to,
        worker_name: shift.assigned_to_name,
        coffee_shop_id: shift.venue_id,
        coffee_shop_name: shift.venue_name,
        shift_id: shift.id,
        rating: rating,
        punctuality_rating: punctualityRating,
        skill_rating: skillRating,
        attitude_rating: attitudeRating,
        would_hire_again: wouldHireAgain,
        comment: comment
      });

      // Get all reviews for this worker to calculate new average
      const allReviews = await base44.entities.WorkerReview.filter({ worker_email: shift.assigned_to });
      const avgRating = allReviews.length > 0 
        ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length 
        : 0;

      // Update worker's average rating (update the User entity)
      const workers = await base44.entities.User.filter({ email: shift.assigned_to });
      if (workers && workers.length > 0) {
        await base44.entities.User.update(workers[0].id, {
          rating: parseFloat(avgRating.toFixed(2))
        });
      }

      // Update shift to mark as reviewed
      await base44.entities.Shift.update(shift.id, {
        status: 'completed',
        reviewed: true
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employerShifts'] });
      queryClient.invalidateQueries({ queryKey: ['workerReviews'] });
      toast.success('Review submitted successfully!');
      onClose();
    },
    onError: () => {
      toast.error('Failed to submit review');
    }
  });

  const StarRating = ({ value, onChange, label }) => (
    <div>
      <label className="text-xs tracking-wider mb-2 block" style={{ color: 'var(--clay)' }}>
        {label}
      </label>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="transition-all hover:scale-110"
          >
            <Star
              className="w-8 h-8"
              style={{
                color: star <= value ? 'var(--terracotta)' : 'var(--sand)',
                fill: star <= value ? 'var(--terracotta)' : 'none'
              }}
            />
          </button>
        ))}
      </div>
    </div>
  );

  const canSubmit = rating > 0 && punctualityRating > 0 && skillRating > 0 && attitudeRating > 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="max-w-2xl w-full rounded-2xl p-8 my-8" style={{ backgroundColor: 'var(--warm-white)' }}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {isChefRole ? (
              <ChefHat className="w-8 h-8" style={{ color: 'var(--sage)' }} />
            ) : (
              <Coffee className="w-8 h-8" style={{ color: 'var(--terracotta)' }} />
            )}
            <div>
              <h2 className="text-3xl font-light" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
                Leave a Review
              </h2>
              <p className="text-sm" style={{ color: 'var(--clay)' }}>
                for {shift.assigned_to_name}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5" style={{ color: 'var(--clay)' }} />
          </button>
        </div>

        {/* Shift Info */}
        <div className="p-4 rounded-xl mb-6" style={{ backgroundColor: 'var(--sand)' }}>
          <div className="text-sm font-normal mb-1" style={{ color: 'var(--earth)' }}>
            {shift.venue_name}
          </div>
          <div className="text-xs" style={{ color: 'var(--clay)' }}>
            {format(new Date(shift.date), 'EEEE, MMMM d, yyyy')} • {shift.start_time} - {shift.end_time}
          </div>
        </div>

        <div className="space-y-6 mb-6">
          {/* Overall Rating */}
          <StarRating 
            value={rating} 
            onChange={setRating} 
            label="OVERALL RATING *"
          />

          {/* Specific Ratings */}
          <div className="grid md:grid-cols-3 gap-4">
            <StarRating 
              value={punctualityRating} 
              onChange={setPunctualityRating} 
              label="PUNCTUALITY *"
            />
            <StarRating 
              value={skillRating} 
              onChange={setSkillRating} 
              label="SKILL LEVEL *"
            />
            <StarRating 
              value={attitudeRating} 
              onChange={setAttitudeRating} 
              label="ATTITUDE *"
            />
          </div>

          {/* Would Hire Again */}
          <div>
            <label className="text-xs tracking-wider mb-3 block" style={{ color: 'var(--clay)' }}>
              WOULD YOU HIRE THIS WORKER AGAIN?
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setWouldHireAgain(true)}
                className="flex-1 py-3 rounded-xl font-normal transition-all"
                style={wouldHireAgain ? {
                  backgroundColor: 'var(--sage)',
                  color: 'white'
                } : {
                  backgroundColor: 'transparent',
                  border: '1px solid var(--sand)',
                  color: 'var(--clay)'
                }}
              >
                Yes, absolutely
              </button>
              <button
                type="button"
                onClick={() => setWouldHireAgain(false)}
                className="flex-1 py-3 rounded-xl font-normal transition-all"
                style={!wouldHireAgain ? {
                  backgroundColor: 'var(--clay)',
                  color: 'white'
                } : {
                  backgroundColor: 'transparent',
                  border: '1px solid var(--sand)',
                  color: 'var(--clay)'
                }}
              >
                No, not likely
              </button>
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
              placeholder="Share your experience working with this person. What did they do well? Any areas for improvement?"
              className="rounded-xl border"
              style={{ borderColor: 'var(--sand)' }}
              rows={4}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={() => submitReviewMutation.mutate()}
            disabled={!canSubmit || submitReviewMutation.isPending}
            className="flex-1 rounded-xl font-normal"
            style={{ backgroundColor: 'var(--terracotta)', color: 'white' }}
          >
            {submitReviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
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