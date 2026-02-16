import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Plus, Eye, Trash2, Users, Clock, MapPin, DollarSign, Calendar } from "lucide-react";
import { toast } from "sonner";
import JobFormModal from "./JobFormModal";
import JobApplicationsModal from "./JobApplicationsModal";

export default function JobManagement({ venueId, venueType }) {
  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const queryClient = useQueryClient();

  const { data: jobs = [] } = useQuery({
    queryKey: ['employer-jobs', venueId],
    queryFn: () => base44.entities.Job.filter({ venue_id: venueId }),
    enabled: !!venueId
  });

  const { data: allApplications = [] } = useQuery({
    queryKey: ['job-applications', venueId],
    queryFn: () => base44.entities.JobApplication.filter({ venue_id: venueId }),
    enabled: !!venueId
  });

  const deleteJobMutation = useMutation({
    mutationFn: (jobId) => base44.entities.Job.delete(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries(['employer-jobs']);
      toast.success('Job deleted');
    }
  });

  const openJobs = jobs.filter(j => j.status === 'open');
  const filledJobs = jobs.filter(j => j.status === 'filled');
  const closedJobs = jobs.filter(j => j.status === 'closed');

  const getApplicationsForJob = (jobId) => {
    return allApplications.filter(a => a.job_id === jobId);
  };

  const handleEdit = (job) => {
    setEditingJob(job);
    setShowJobForm(true);
  };

  const handleDelete = (jobId) => {
    if (confirm('Are you sure you want to delete this job posting?')) {
      deleteJobMutation.mutate(jobId);
    }
  };

  const JobCard = ({ job }) => {
    const applications = getApplicationsForJob(job.id);
    const pendingApps = applications.filter(a => a.status === 'pending').length;

    return (
      <Card className="border rounded-2xl hover-lift" style={{ borderColor: 'var(--sand)', backgroundColor: 'var(--warm-white)' }}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="font-normal" style={{ backgroundColor: 'var(--terracotta)', color: 'white' }}>
                  {job.employment_type === 'full_time' ? 'Full Time' : 'Part Time'}
                </Badge>
                {job.status === 'open' && (
                  <Badge variant="outline" className="font-normal" style={{ borderColor: 'var(--sage)', color: 'var(--sage)' }}>
                    Open
                  </Badge>
                )}
                {job.status === 'filled' && (
                  <Badge variant="outline" className="font-normal" style={{ borderColor: 'var(--clay)', color: 'var(--clay)' }}>
                    Filled
                  </Badge>
                )}
              </div>
              <CardTitle className="text-xl font-normal mb-2" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
                {job.job_title}
              </CardTitle>
              <div className="flex flex-wrap gap-3 text-sm" style={{ color: 'var(--clay)' }}>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {job.location}
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  {job.employment_type === 'full_time' 
                    ? `€${job.salary_min?.toLocaleString()}-${job.salary_max?.toLocaleString()}/year`
                    : `€${job.hourly_rate}/hour`
                  }
                </div>
                {job.start_date && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(job.start_date).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm line-clamp-2" style={{ color: 'var(--clay)' }}>
            {job.description}
          </p>

          {job.skills_required && job.skills_required.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {job.skills_required.slice(0, 3).map((skill, idx) => (
                <Badge key={idx} variant="outline" className="font-normal text-xs" style={{ borderColor: 'var(--sand)' }}>
                  {skill}
                </Badge>
              ))}
              {job.skills_required.length > 3 && (
                <Badge variant="outline" className="font-normal text-xs" style={{ borderColor: 'var(--sand)' }}>
                  +{job.skills_required.length - 3} more
                </Badge>
              )}
            </div>
          )}

          <div className="flex items-center gap-2 pt-3 border-t" style={{ borderColor: 'var(--sand)' }}>
            <div className="flex items-center gap-1 px-3 py-2 rounded-lg flex-1" style={{ backgroundColor: 'var(--cream)' }}>
              <Users className="w-4 h-4" style={{ color: 'var(--terracotta)' }} />
              <span className="text-sm font-normal" style={{ color: 'var(--earth)' }}>
                {applications.length} applications
              </span>
              {pendingApps > 0 && (
                <Badge className="ml-auto" style={{ backgroundColor: 'var(--terracotta)', color: 'white' }}>
                  {pendingApps} new
                </Badge>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => setSelectedJob(job)}
              variant="outline"
              className="flex-1 rounded-xl font-normal"
              style={{ borderColor: 'var(--sand)' }}
            >
              <Eye className="w-4 h-4 mr-2" />
              View Applications
            </Button>
            <Button
              onClick={() => handleEdit(job)}
              variant="outline"
              className="rounded-xl font-normal"
              style={{ borderColor: 'var(--sand)' }}
            >
              Edit
            </Button>
            <Button
              onClick={() => handleDelete(job.id)}
              variant="outline"
              className="rounded-xl font-normal text-red-600"
              style={{ borderColor: 'var(--sand)' }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-light tracking-tight mb-2" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
            Job Postings
          </h2>
          <p className="font-light" style={{ color: 'var(--clay)' }}>
            Manage your permanent and part-time positions
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingJob(null);
            setShowJobForm(true);
          }}
          className="rounded-xl font-normal"
          style={{ backgroundColor: 'var(--terracotta)', color: 'white' }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Post New Job
        </Button>
      </div>

      {/* Job Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border rounded-2xl" style={{ borderColor: 'var(--sand)', backgroundColor: 'var(--warm-white)' }}>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#8A9B8E20' }}>
                <Briefcase className="w-5 h-5" style={{ color: '#8A9B8E' }} />
              </div>
              <div className="text-xs font-normal tracking-wider" style={{ color: 'var(--clay)' }}>OPEN POSITIONS</div>
            </div>
            <div className="text-4xl font-light" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
              {openJobs.length}
            </div>
          </CardContent>
        </Card>

        <Card className="border rounded-2xl" style={{ borderColor: 'var(--sand)', backgroundColor: 'var(--warm-white)' }}>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#C89F8C20' }}>
                <Users className="w-5 h-5" style={{ color: '#C89F8C' }} />
              </div>
              <div className="text-xs font-normal tracking-wider" style={{ color: 'var(--clay)' }}>TOTAL APPLICANTS</div>
            </div>
            <div className="text-4xl font-light" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
              {allApplications.length}
            </div>
          </CardContent>
        </Card>

        <Card className="border rounded-2xl" style={{ borderColor: 'var(--sand)', backgroundColor: 'var(--warm-white)' }}>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#705D5620' }}>
                <Clock className="w-5 h-5" style={{ color: '#705D56' }} />
              </div>
              <div className="text-xs font-normal tracking-wider" style={{ color: 'var(--clay)' }}>PENDING REVIEW</div>
            </div>
            <div className="text-4xl font-light" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
              {allApplications.filter(a => a.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Job Listings */}
      {jobs.length === 0 ? (
        <Card className="border rounded-2xl" style={{ borderColor: 'var(--sand)', backgroundColor: 'var(--warm-white)' }}>
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: 'var(--sand)' }}>
              <Briefcase className="w-8 h-8" style={{ color: 'var(--terracotta)' }} />
            </div>
            <h3 className="text-xl font-light mb-2" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
              No Jobs Posted Yet
            </h3>
            <p className="mb-4" style={{ color: 'var(--clay)' }}>
              Post your first permanent or part-time position to find great talent
            </p>
            <Button
              onClick={() => setShowJobForm(true)}
              className="rounded-xl font-normal"
              style={{ backgroundColor: 'var(--terracotta)', color: 'white' }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Post Your First Job
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {openJobs.length > 0 && (
            <div>
              <h3 className="text-xl font-normal mb-4" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
                Open Positions
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {openJobs.map(job => <JobCard key={job.id} job={job} />)}
              </div>
            </div>
          )}

          {filledJobs.length > 0 && (
            <div>
              <h3 className="text-xl font-normal mb-4" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
                Filled Positions
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filledJobs.map(job => <JobCard key={job.id} job={job} />)}
              </div>
            </div>
          )}

          {closedJobs.length > 0 && (
            <div>
              <h3 className="text-xl font-normal mb-4" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
                Closed Positions
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {closedJobs.map(job => <JobCard key={job.id} job={job} />)}
              </div>
            </div>
          )}
        </div>
      )}

      {showJobForm && (
        <JobFormModal
          job={editingJob}
          venueId={venueId}
          venueType={venueType}
          onClose={() => {
            setShowJobForm(false);
            setEditingJob(null);
          }}
        />
      )}

      {selectedJob && (
        <JobApplicationsModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
        />
      )}
    </div>
  );
}