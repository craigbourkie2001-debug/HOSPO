import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X, Calendar, Clock, MapPin, Star, Briefcase, Award, ChefHat, Coffee } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function ApplyModal({ shift, onClose }) {
  const [user, setUser] = useState(null);
  const [coverNote, setCoverNote] = useState('');
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const isChefRole = shift.role_type === 'chef';
  const userSkills = isChefRole ? (user?.chef_skills || []) : (user?.barista_skills || user?.skills || []);
  const matchingSkills = shift.skills_required?.filter(s => userSkills.includes(s)) || [];

  const applyMutation = useMutation({
    mutationFn: async () => {
      // Optimistic: Mark shift as applied locally
      queryClient.setQueryData(['shifts'], (old) => 
        old?.map(s => s.id === shift.id ? { ...s, hasApplied: true } : s) || old
      );

      // Create application
      await base44.entities.ShiftApplication.create({
        shift_id: shift.id,
        shift_date: shift.date,
        venue_name: shift.venue_name || shift.coffee_shop_name,
        venue_id: shift.venue_id || shift.coffee_shop_id,
        venue_type: shift.venue_type || 'coffee_shop',
        role_type: shift.role_type || 'barista',
        applicant_email: user.email,
        applicant_name: user.full_name,
        applicant_phone: user.phone,
        applicant_skills: userSkills,
        applicant_experience_years: user.experience_years,
        applicant_rating: user.rating,
        cover_note: coverNote,
        status: 'pending'
      });

      // Update shift applications count
      await base44.entities.Shift.update(shift.id, {
        applications_count: (shift.applications_count || 0) + 1,
        status: 'applications_open'
      });

      // Send email to employer
      const venue = shift.venue_type === 'restaurant' 
        ? await base44.entities.Restaurant.filter({ id: shift.venue_id || shift.coffee_shop_id })
        : await base44.entities.CoffeeShop.filter({ id: shift.venue_id || shift.coffee_shop_id });
      
      if (venue && venue.length > 0 && venue[0].contact_email) {
        await base44.integrations.Core.SendEmail({
          to: venue[0].contact_email,
          subject: `New Application for ${isChefRole ? 'Chef' : 'Barista'} Shift - ${format(new Date(shift.date), 'MMM d, yyyy')}`,
          body: `
Hello ${venue[0].name},

You have received a new application for your ${isChefRole ? 'chef' : 'barista'} shift on ${format(new Date(shift.date), 'EEEE, MMMM d, yyyy')} from ${shift.start_time} to ${shift.end_time}.

Applicant Details:
- Name: ${user.full_name}
- Email: ${user.email}
- Phone: ${user.phone}
- Experience: ${user.experience_years || 0} years
- Rating: ${user.rating ? user.rating.toFixed(1) + '/5' : 'New worker'}

Skills: ${userSkills.join(', ') || 'Not specified'}

${coverNote ? `Cover Note:\n${coverNote}` : ''}

Please log in to your Hospo employer dashboard to review this application and accept or reject the candidate.

Best regards,
Hospo Team
          `.trim()
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast.success('Application submitted successfully!');
      onClose();
    },
    onError: (error) => {
      toast.error('Failed to submit application');
    }
  });

  if (!user) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="max-w-md w-full rounded-2xl p-8 text-center" style={{ backgroundColor: 'var(--warm-white)' }}>
          <div className="animate-spin rounded-full h-12 w-12 border-2 mx-auto" style={{ borderColor: 'var(--sand)', borderTopColor: 'var(--terracotta)' }} />
        </div>
      </div>
    );
  }

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
            <h2 className="text-3xl font-light" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
              Apply for Shift
            </h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5" style={{ color: 'var(--clay)' }} />
          </button>
        </div>

        {/* Shift Details */}
        <div className="p-5 rounded-xl mb-6" style={{ backgroundColor: 'var(--cream)', border: '1px solid var(--sand)' }}>
          <h3 className="text-xl font-normal mb-3" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
            {shift.venue_name || shift.coffee_shop_name}
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2" style={{ color: 'var(--clay)' }}>
              <Calendar className="w-4 h-4" />
              {shift.date ? format(new Date(shift.date), 'EEE, MMM d, yyyy') : 'Date not set'}
            </div>
            <div className="flex items-center gap-2" style={{ color: 'var(--clay)' }}>
              <Clock className="w-4 h-4" />
              {shift.start_time} - {shift.end_time}
            </div>
            <div className="flex items-center gap-2" style={{ color: 'var(--clay)' }}>
              <MapPin className="w-4 h-4" />
              {shift.location}
            </div>
            <div className="font-normal text-lg" style={{ color: 'var(--terracotta)' }}>
              €{shift.hourly_rate}/hr
            </div>
          </div>
        </div>

        {/* Your Profile Summary */}
        <div className="p-5 rounded-xl mb-6" style={{ backgroundColor: 'var(--sand)' }}>
          <h4 className="text-xs tracking-wider mb-4" style={{ color: 'var(--clay)' }}>YOUR PROFILE (SENT WITH APPLICATION)</h4>
          
          <div className="flex items-start gap-4 mb-4">
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-light text-white" style={{ backgroundColor: 'var(--terracotta)' }}>
              {user.full_name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-normal" style={{ color: 'var(--earth)' }}>{user.full_name}</h3>
              <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--clay)' }}>
                <span className="flex items-center gap-1">
                  <Briefcase className="w-4 h-4" />
                  {user.experience_years || 0} years exp.
                </span>
                {user.rating > 0 && (
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-current" style={{ color: 'var(--terracotta)' }} />
                    {user.rating.toFixed(1)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Skills Match */}
          <div className="mb-3">
            <div className="text-xs tracking-wider mb-2 flex items-center gap-2" style={{ color: 'var(--clay)' }}>
              <Award className="w-3 h-3" />
              YOUR MATCHING SKILLS ({matchingSkills.length}/{shift.skills_required?.length || 0})
            </div>
            <div className="flex flex-wrap gap-1.5">
              {userSkills.length > 0 ? userSkills.map((skill, idx) => (
                <Badge 
                  key={idx}
                  className="text-xs font-normal"
                  style={shift.skills_required?.includes(skill) ? {
                    backgroundColor: 'var(--sage)',
                    color: 'white',
                    border: 'none'
                  } : {
                    backgroundColor: 'transparent',
                    border: '1px solid var(--clay)',
                    color: 'var(--clay)'
                  }}
                >
                  {skill.replace(/_/g, ' ')}
                </Badge>
              )) : (
                <span className="text-sm" style={{ color: 'var(--clay)' }}>No skills added to profile</span>
              )}
            </div>
          </div>
        </div>

        {/* Cover Note */}
        <div className="mb-6">
          <label className="text-xs tracking-wider mb-2 block" style={{ color: 'var(--clay)' }}>
            COVER NOTE (OPTIONAL)
          </label>
          <Textarea
            value={coverNote}
            onChange={(e) => setCoverNote(e.target.value)}
            placeholder="Add a personal message to the employer..."
            className="rounded-xl border"
            style={{ borderColor: 'var(--sand)' }}
            rows={3}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={() => applyMutation.mutate()}
            disabled={applyMutation.isPending}
            className="flex-1 rounded-xl font-normal tracking-wide"
            style={{ backgroundColor: 'var(--terracotta)', color: 'white' }}
          >
            {applyMutation.isPending ? 'Submitting...' : 'Submit Application'}
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