import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X, MapPin, Star, Briefcase, Award, ChefHat, Coffee, FileText, DollarSign } from "lucide-react";
import { toast } from "sonner";

export default function ApplyJobModal({ job, onClose }) {
  const [user, setUser] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const isChefRole = job.role_type === 'chef';
  const userSkills = isChefRole ? (user?.chef_skills || []) : (user?.barista_skills || user?.skills || []);
  const matchingSkills = job.skills_required?.filter(s => userSkills.includes(s)) || [];

  const applyMutation = useMutation({
    mutationFn: async () => {
      // Create job application
      await base44.entities.JobApplication.create({
        job_id: job.id,
        job_title: job.job_title,
        venue_name: job.venue_name,
        venue_id: job.venue_id,
        venue_type: job.venue_type,
        role_type: job.role_type,
        applicant_email: user.email,
        applicant_name: user.full_name,
        applicant_phone: user.phone,
        applicant_profile_picture: user.profile_picture_url,
        applicant_barista_skills: user.barista_skills || [],
        applicant_chef_skills: user.chef_skills || [],
        applicant_experience_years: user.experience_years,
        applicant_rating: user.rating,
        applicant_work_experience: user.work_experience || [],
        applicant_resume_url: user.resume_url,
        applicant_location: user.location,
        applicant_desired_rate_min: user.desired_hourly_rate_min,
        applicant_desired_rate_max: user.desired_hourly_rate_max,
        cover_letter: coverLetter,
        status: 'pending'
      });

      // Update job applications count
      await base44.entities.Job.update(job.id, {
        applications_count: (job.applications_count || 0) + 1
      });

      // Send email to employer
      const venue = job.venue_type === 'restaurant' 
        ? await base44.entities.Restaurant.filter({ id: job.venue_id })
        : await base44.entities.CoffeeShop.filter({ id: job.venue_id });
      
      if (venue && venue.length > 0 && venue[0].contact_email) {
        const salaryInfo = job.employment_type === 'full_time' 
          ? `€${job.salary_min} - €${job.salary_max}/year`
          : `€${job.hourly_rate}/hour`;

        await base44.integrations.Core.SendEmail({
          to: venue[0].contact_email,
          subject: `New Application: ${job.job_title} - ${user.full_name}`,
          body: `
Hello ${venue[0].name},

You have received a new application for your ${job.employment_type.replace('_', '-')} ${job.job_title} position.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
APPLICANT PROFILE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Name: ${user.full_name}
Email: ${user.email}
Phone: ${user.phone || 'Not provided'}
Location: ${user.location || 'Not specified'}

Experience: ${user.experience_years || 0} years in hospitality
Rating: ${user.rating > 0 ? user.rating.toFixed(1) + '/5 stars' : 'New to platform'}
Shifts Completed: ${user.shifts_completed || 0}

${user.professional_summary ? `
Professional Summary:
${user.professional_summary}
` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SKILLS & QUALIFICATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Skills: ${userSkills.join(', ') || 'Not specified'}
Matching Required Skills: ${matchingSkills.length}/${job.skills_required?.length || 0}

${user.certifications && user.certifications.length > 0 ? `
Certifications:
${user.certifications.map(c => `• ${c.name} - ${c.issuer}`).join('\n')}
` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WORK EXPERIENCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${user.work_experience && user.work_experience.length > 0 ? 
  user.work_experience.map(exp => `
• ${exp.job_title} at ${exp.company}
  ${exp.location || ''} | ${exp.start_date} - ${exp.current ? 'Present' : exp.end_date}
  ${exp.description || ''}
`).join('\n') : 'No work experience listed'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SALARY EXPECTATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${user.desired_hourly_rate_min && user.desired_hourly_rate_max ? 
  `Desired Rate: €${user.desired_hourly_rate_min} - €${user.desired_hourly_rate_max}/hour` :
  'Not specified'}

Job Offers: ${salaryInfo}

${coverLetter ? `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COVER LETTER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${coverLetter}
` : ''}

${user.resume_url ? `
Resume/CV: ${user.resume_url}
` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Please log in to your Hospo employer dashboard to review this application and manage your hiring process.

Best regards,
Hospo Team
          `.trim()
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['jobApplications'] });
      toast.success('Application submitted successfully!');
      onClose();
    },
    onError: (err) => {
      toast.error(err?.message || 'Failed to submit application. Please try again.');
    }
  });

  if (!user) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[100]">
        <div className="max-w-md w-full rounded-2xl p-8 text-center" style={{ backgroundColor: 'var(--warm-white)' }}>
          <div className="animate-spin rounded-full h-12 w-12 border-2 mx-auto" style={{ borderColor: 'var(--sand)', borderTopColor: 'var(--terracotta)' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[100] overflow-y-auto">
      <div className="max-w-2xl w-full rounded-2xl p-8 my-8" style={{ backgroundColor: 'var(--warm-white)' }}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {isChefRole ? (
              <ChefHat className="w-8 h-8" style={{ color: 'var(--sage)' }} />
            ) : (
              <Coffee className="w-8 h-8" style={{ color: 'var(--terracotta)' }} />
            )}
            <h2 className="text-3xl font-light" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
              Apply for Job
            </h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5" style={{ color: 'var(--clay)' }} />
          </button>
        </div>

        {/* Job Details */}
        <div className="p-5 rounded-xl mb-6" style={{ backgroundColor: 'var(--cream)', border: '1px solid var(--sand)' }}>
          <h3 className="text-xl font-normal mb-3" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
            {job.job_title}
          </h3>
          <p className="text-lg mb-3" style={{ color: 'var(--clay)' }}>{job.venue_name}</p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2" style={{ color: 'var(--clay)' }}>
              <MapPin className="w-4 h-4" />
              {job.location}
            </div>
            <div className="font-normal" style={{ color: 'var(--terracotta)' }}>
              {job.employment_type === 'full_time' 
                ? `€${job.salary_min}-${job.salary_max}/year` 
                : `€${job.hourly_rate}/hr`}
            </div>
          </div>
        </div>

        {/* Your Profile Summary */}
        <div className="p-5 rounded-xl mb-6" style={{ backgroundColor: 'var(--sand)' }}>
          <h4 className="text-xs tracking-wider mb-4" style={{ color: 'var(--clay)' }}>YOUR PROFILE (SENT WITH APPLICATION)</h4>
          
          <div className="flex items-start gap-4 mb-4">
            {user.profile_picture_url ? (
              <img src={user.profile_picture_url} alt={user.full_name} className="w-14 h-14 rounded-full object-cover" />
            ) : (
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-light text-white" style={{ backgroundColor: 'var(--terracotta)' }}>
                {user.full_name?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
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
              YOUR MATCHING SKILLS ({matchingSkills.length}/{job.skills_required?.length || 0})
            </div>
            <div className="flex flex-wrap gap-1.5">
              {userSkills.length > 0 ? userSkills.map((skill, idx) => (
                <Badge 
                  key={idx}
                  className="text-xs font-normal"
                  style={job.skills_required?.includes(skill) ? {
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

          {user.resume_url && (
            <div className="flex items-center gap-2 text-sm mt-3" style={{ color: 'var(--clay)' }}>
              <FileText className="w-4 h-4" />
              <a href={user.resume_url} target="_blank" rel="noopener noreferrer" className="underline">
                Resume attached
              </a>
            </div>
          )}

          {(user.desired_hourly_rate_min || user.desired_hourly_rate_max) && (
            <div className="flex items-center gap-2 text-sm mt-2" style={{ color: 'var(--clay)' }}>
              <DollarSign className="w-4 h-4" />
              Desired rate: €{user.desired_hourly_rate_min || 0} - €{user.desired_hourly_rate_max || 0}/hr
            </div>
          )}
        </div>

        {/* Cover Letter */}
        <div className="mb-6">
          <label className="text-xs tracking-wider mb-2 block" style={{ color: 'var(--clay)' }}>
            COVER LETTER (OPTIONAL)
          </label>
          <Textarea
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            placeholder="Tell the employer why you're the perfect fit for this position..."
            className="rounded-xl border"
            style={{ borderColor: 'var(--sand)' }}
            rows={4}
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