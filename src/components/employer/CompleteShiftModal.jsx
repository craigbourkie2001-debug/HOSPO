import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { X, Star, ChefHat, Coffee, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const BARISTA_SKILLS = [
  "espresso", "latte_art", "filter_coffee", "cold_brew", "customer_service",
  "cash_handling", "stock_management", "aeropress", "pour_over"
];

const CHEF_SKILLS = [
  "mise_en_place", "menu_planning", "food_safety", "pastry", "grill",
  "sauces", "butchery", "plating", "inventory_management", "team_leadership"
];

function StarRatingInput({ value, onChange, label, halfStars = false }) {
  const [hovered, setHovered] = useState(null);
  const display = hovered ?? value;
  const steps = halfStars ? [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5] : [1, 2, 3, 4, 5];

  if (halfStars) {
    return (
      <div>
        <label className="text-xs tracking-wider mb-2 block" style={{ color: 'var(--clay)' }}>{label}</label>
        <div className="flex items-center gap-1 flex-wrap">
          {steps.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => onChange(v)}
              onMouseEnter={() => setHovered(v)}
              onMouseLeave={() => setHovered(null)}
              className="px-2 py-1 rounded-lg text-sm font-normal transition-all"
              style={{
                backgroundColor: v === value ? 'var(--terracotta)' : v === display ? 'var(--sand)' : 'transparent',
                color: v === value ? 'white' : 'var(--earth)',
                border: '1px solid var(--sand)'
              }}
            >
              {v}
            </button>
          ))}
        </div>
        {value > 0 && (
          <div className="flex mt-1 gap-0.5">
            {[1, 2, 3, 4, 5].map(s => (
              <Star key={s} className="w-4 h-4" style={{
                color: 'var(--terracotta)',
                fill: s <= Math.floor(value) ? 'var(--terracotta)' : s - 0.5 === value ? 'none' : 'none',
                opacity: s <= Math.ceil(value) ? 1 : 0.25
              }} />
            ))}
            <span className="text-xs ml-1" style={{ color: 'var(--terracotta)' }}>{value}/5</span>
          </div>
        )}
      </div>
    );
  }

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
              color: (display ?? 0) >= star ? 'var(--terracotta)' : 'var(--sand)',
              fill: (display ?? 0) >= star ? 'var(--terracotta)' : 'none'
            }} />
          </button>
        ))}
      </div>
    </div>
  );
}

export default function CompleteShiftModal({ shift, onClose }) {
  const queryClient = useQueryClient();
  const isChefRole = shift.role_type === 'chef';
  const skillOptions = isChefRole ? CHEF_SKILLS : BARISTA_SKILLS;

  const [rating, setRating] = useState(0);
  const [punctualityRating, setPunctualityRating] = useState(0);
  const [skillRating, setSkillRating] = useState(0);
  const [attitudeRating, setAttitudeRating] = useState(0);
  const [wouldHireAgain, setWouldHireAgain] = useState(true);
  const [comment, setComment] = useState('');
  const [observedSkills, setObservedSkills] = useState([]);

  const toggleSkill = (skill) => {
    setObservedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  // Compare with required skills on the shift
  const requiredSkills = shift.skills_required || [];
  const matchingSkills = observedSkills.filter(s => requiredSkills.includes(s));
  const newSkills = observedSkills.filter(s => !requiredSkills.includes(s));

  const submitMutation = useMutation({
    mutationFn: async () => {
      // Create worker review
      await base44.entities.WorkerReview.create({
        worker_email: shift.assigned_to,
        worker_name: shift.assigned_to_name,
        coffee_shop_id: shift.venue_id,
        coffee_shop_name: shift.venue_name,
        shift_id: shift.id,
        rating,
        punctuality_rating: punctualityRating,
        skill_rating: skillRating,
        attitude_rating: attitudeRating,
        would_hire_again: wouldHireAgain,
        comment,
        strengths: observedSkills
      });

      // Recalculate worker's average rating
      const allReviews = await base44.entities.WorkerReview.filter({ worker_email: shift.assigned_to });
      const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      const workers = await base44.entities.User.filter({ email: shift.assigned_to });
      if (workers?.length > 0) {
        const workerSkills = workers[0].barista_skills || workers[0].chef_skills || [];
        const newConfirmedSkills = [...new Set([...workerSkills, ...observedSkills])];
        const updateData = { rating: parseFloat(avgRating.toFixed(2)) };
        if (isChefRole) updateData.chef_skills = newConfirmedSkills;
        else updateData.barista_skills = newConfirmedSkills;
        await base44.entities.User.update(workers[0].id, updateData);
      }

      // Mark shift as completed + reviewed
      await base44.entities.Shift.update(shift.id, { status: 'completed', reviewed: true });

      // Notify worker to review the venue
      await base44.integrations.Core.SendEmail({
        to: shift.assigned_to,
        subject: `How was your shift at ${shift.venue_name}?`,
        body: `Hi ${shift.assigned_to_name || 'there'},\n\nYour shift at ${shift.venue_name} on ${format(new Date(shift.date), 'MMMM d, yyyy')} has been marked as completed and you've received a ${rating}/5 star rating.\n\nWe'd love to hear your feedback too! Log in to Hospo Ireland and visit My Shifts to leave a review of ${shift.venue_name}.\n\nThank you for using Hospo Ireland!\n\nThe Hospo Team`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employerShifts'] });
      toast.success('Shift completed & review submitted. Worker has been notified!');
      onClose();
    },
    onError: () => {
      toast.error('Failed to submit. Please try again.');
    }
  });

  const canSubmit = rating > 0 && punctualityRating > 0 && skillRating > 0 && attitudeRating > 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center p-4 z-50 overflow-y-auto">
      <div className="max-w-2xl w-full rounded-2xl p-8 my-8" style={{ backgroundColor: 'var(--warm-white)' }}>
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--sage)' }}>
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-light" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
                Complete Shift & Review
              </h2>
              <p className="text-sm" style={{ color: 'var(--clay)' }}>
                for {shift.assigned_to_name || shift.assigned_to}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5" style={{ color: 'var(--clay)' }} />
          </button>
        </div>

        {/* Shift Info */}
        <div className="flex items-center gap-3 p-4 rounded-xl mb-6" style={{ backgroundColor: 'var(--sand)' }}>
          {isChefRole
            ? <ChefHat className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--sage)' }} />
            : <Coffee className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--terracotta)' }} />
          }
          <div>
            <div className="font-normal" style={{ color: 'var(--earth)' }}>{shift.venue_name}</div>
            <div className="text-xs" style={{ color: 'var(--clay)' }}>
              {format(new Date(shift.date), 'EEEE, MMMM d, yyyy')} · {shift.start_time} – {shift.end_time}
            </div>
          </div>
        </div>

        <div className="space-y-7 mb-6">

          {/* Overall rating with half stars */}
          <StarRatingInput
            value={rating}
            onChange={setRating}
            label="OVERALL RATING *"
            halfStars={true}
          />

          {/* Sub-ratings */}
          <div className="grid md:grid-cols-3 gap-5">
            <StarRatingInput value={punctualityRating} onChange={setPunctualityRating} label="PUNCTUALITY *" />
            <StarRatingInput value={skillRating} onChange={setSkillRating} label="SKILL LEVEL *" />
            <StarRatingInput value={attitudeRating} onChange={setAttitudeRating} label="ATTITUDE *" />
          </div>

          {/* Skills observed */}
          <div>
            <label className="text-xs tracking-wider mb-3 block" style={{ color: 'var(--clay)' }}>
              SKILLS OBSERVED DURING SHIFT
            </label>
            <div className="flex flex-wrap gap-2">
              {skillOptions.map(skill => {
                const isRequired = requiredSkills.includes(skill);
                const isSelected = observedSkills.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className="px-3 py-1.5 rounded-full text-sm font-normal transition-all"
                    style={{
                      backgroundColor: isSelected ? 'var(--terracotta)' : isRequired ? 'var(--sand)' : 'transparent',
                      color: isSelected ? 'white' : 'var(--earth)',
                      border: `1px solid ${isRequired ? 'var(--terracotta)' : 'var(--sand)'}`,
                    }}
                  >
                    {skill.replace(/_/g, ' ')}
                    {isRequired && !isSelected && <span className="ml-1 text-xs" style={{ color: 'var(--terracotta)' }}>•</span>}
                  </button>
                );
              })}
            </div>

            {observedSkills.length > 0 && (
              <div className="mt-3 p-3 rounded-xl text-sm space-y-1" style={{ backgroundColor: 'var(--cream)', border: '1px solid var(--sand)' }}>
                {matchingSkills.length > 0 && (
                  <p style={{ color: 'var(--sage)' }}>
                    ✓ Confirmed {matchingSkills.length} skill{matchingSkills.length > 1 ? 's' : ''} from their profile
                  </p>
                )}
                {newSkills.length > 0 && (
                  <p style={{ color: 'var(--terracotta)' }}>
                    + {newSkills.length} new skill{newSkills.length > 1 ? 's' : ''} will be added to their profile
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Would hire again */}
          <div>
            <label className="text-xs tracking-wider mb-3 block" style={{ color: 'var(--clay)' }}>
              WOULD YOU HIRE THIS WORKER AGAIN?
            </label>
            <div className="flex gap-3">
              {[{ val: true, label: 'Yes, absolutely' }, { val: false, label: 'Not likely' }].map(({ val, label }) => (
                <button
                  key={String(val)}
                  type="button"
                  onClick={() => setWouldHireAgain(val)}
                  className="flex-1 py-3 rounded-xl font-normal transition-all"
                  style={wouldHireAgain === val ? {
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
              placeholder="Share your experience with this worker — strengths, areas to improve, etc."
              className="rounded-xl border"
              style={{ borderColor: 'var(--sand)' }}
              rows={4}
            />
          </div>
        </div>

        <div className="p-4 rounded-xl mb-6 text-sm" style={{ backgroundColor: '#8A9B8E15', border: '1px solid #8A9B8E30' }}>
          <p style={{ color: 'var(--earth)' }}>
            <strong>What happens next:</strong> The shift will be marked as completed, the worker's profile will be updated with your review, and they'll receive an email notification inviting them to review your venue.
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={() => submitMutation.mutate()}
            disabled={!canSubmit || submitMutation.isPending}
            className="flex-1 rounded-xl font-normal"
            style={{ backgroundColor: 'var(--terracotta)', color: 'white' }}
          >
            {submitMutation.isPending ? 'Submitting...' : 'Complete Shift & Submit Review'}
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