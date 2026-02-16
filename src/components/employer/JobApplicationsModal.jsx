import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { User, Mail, Phone, MapPin, Star, CheckCircle, XCircle, Clock, Briefcase, FileText, Calendar } from "lucide-react";
import { toast } from "sonner";

export default function JobApplicationsModal({ job, onClose }) {
  const [selectedApp, setSelectedApp] = useState(null);
  const queryClient = useQueryClient();

  const { data: applications = [] } = useQuery({
    queryKey: ['job-applications-detail', job.id],
    queryFn: () => base44.entities.JobApplication.filter({ job_id: job.id })
  });

  const updateAppMutation = useMutation({
    mutationFn: ({ appId, status, notes }) => 
      base44.entities.JobApplication.update(appId, { status, employer_notes: notes }),
    onSuccess: async (_, variables) => {
      const app = applications.find(a => a.id === variables.appId);
      
      if (variables.status === 'accepted') {
        await base44.integrations.Core.SendEmail({
          to: app.applicant_email,
          subject: `Congratulations! Job Offer for ${job.job_title}`,
          body: `Dear ${app.applicant_name},\n\nGreat news! We'd like to offer you the position of ${job.job_title} at ${job.venue_name}.\n\nWe were impressed by your application and believe you'd be a great fit for our team.\n\nWe'll be in touch shortly with next steps.\n\nBest regards,\n${job.venue_name}`
        });
        toast.success('Application accepted and candidate notified');
      } else if (variables.status === 'rejected') {
        await base44.integrations.Core.SendEmail({
          to: app.applicant_email,
          subject: `Update on your application for ${job.job_title}`,
          body: `Dear ${app.applicant_name},\n\nThank you for your interest in the ${job.job_title} position at ${job.venue_name}.\n\nAfter careful consideration, we've decided to move forward with other candidates whose experience more closely matches our current needs.\n\nWe appreciate the time you took to apply and wish you the best in your job search.\n\nBest regards,\n${job.venue_name}`
        });
        toast.success('Application declined and candidate notified');
      }

      queryClient.invalidateQueries(['job-applications-detail']);
      queryClient.invalidateQueries(['job-applications']);
      setSelectedApp(null);
    }
  });

  const pendingApps = applications.filter(a => a.status === 'pending' || a.status === 'reviewing');
  const acceptedApps = applications.filter(a => a.status === 'accepted' || a.status === 'interview_scheduled');
  const rejectedApps = applications.filter(a => a.status === 'rejected');

  const ApplicationCard = ({ app }) => (
    <Card className="border rounded-2xl hover-lift cursor-pointer" 
      style={{ borderColor: 'var(--sand)', backgroundColor: 'var(--warm-white)' }}
      onClick={() => setSelectedApp(app)}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {app.applicant_profile_picture ? (
            <img src={app.applicant_profile_picture} alt="" className="w-14 h-14 rounded-full object-cover" />
          ) : (
            <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--sand)' }}>
              <User className="w-7 h-7" style={{ color: 'var(--terracotta)' }} />
            </div>
          )}
          
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="text-lg font-normal" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
                  {app.applicant_name}
                </h3>
                <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--clay)' }}>
                  <Mail className="w-3 h-3" />
                  {app.applicant_email}
                </div>
              </div>
              {app.applicant_rating > 0 && (
                <div className="flex items-center gap-1 px-2 py-1 rounded-lg" style={{ backgroundColor: 'var(--sand)' }}>
                  <Star className="w-4 h-4 fill-current" style={{ color: '#FFC107' }} />
                  <span className="text-sm font-normal" style={{ color: 'var(--earth)' }}>{app.applicant_rating}</span>
                </div>
              )}
            </div>

            {app.applicant_experience_years > 0 && (
              <div className="flex items-center gap-1 text-sm mb-2" style={{ color: 'var(--clay)' }}>
                <Briefcase className="w-3 h-3" />
                {app.applicant_experience_years} years experience
              </div>
            )}

            {app.applicant_location && (
              <div className="flex items-center gap-1 text-sm mb-3" style={{ color: 'var(--clay)' }}>
                <MapPin className="w-3 h-3" />
                {app.applicant_location}
              </div>
            )}

            {(app.applicant_barista_skills?.length > 0 || app.applicant_chef_skills?.length > 0) && (
              <div className="flex flex-wrap gap-2 mb-3">
                {(app.applicant_barista_skills || app.applicant_chef_skills || []).slice(0, 3).map((skill, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs font-normal" style={{ borderColor: 'var(--sand)' }}>
                    {skill}
                  </Badge>
                ))}
              </div>
            )}

            <div className="text-sm" style={{ color: 'var(--clay)' }}>
              Applied {new Date(app.created_date).toLocaleDateString()}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto" style={{ backgroundColor: 'var(--warm-white)' }}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-light" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
            Applications for {job.job_title}
          </DialogTitle>
          <p className="text-sm" style={{ color: 'var(--clay)' }}>
            {applications.length} total applications
          </p>
        </DialogHeader>

        {selectedApp ? (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => setSelectedApp(null)}
                variant="outline"
                className="rounded-xl"
              >
                ← Back to All
              </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <Card className="border rounded-2xl" style={{ borderColor: 'var(--sand)', backgroundColor: 'var(--warm-white)' }}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-6">
                      {selectedApp.applicant_profile_picture ? (
                        <img src={selectedApp.applicant_profile_picture} alt="" className="w-16 h-16 rounded-full object-cover" />
                      ) : (
                        <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--sand)' }}>
                          <User className="w-8 h-8" style={{ color: 'var(--terracotta)' }} />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="text-2xl font-light mb-2" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
                          {selectedApp.applicant_name}
                        </h3>
                        <div className="space-y-1 text-sm" style={{ color: 'var(--clay)' }}>
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            {selectedApp.applicant_email}
                          </div>
                          {selectedApp.applicant_phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4" />
                              {selectedApp.applicant_phone}
                            </div>
                          )}
                          {selectedApp.applicant_location && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              {selectedApp.applicant_location}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {selectedApp.cover_letter && (
                      <div className="mb-6">
                        <Label className="text-sm font-normal mb-2 block" style={{ color: 'var(--earth)' }}>Cover Letter</Label>
                        <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--cream)' }}>
                          <p className="text-sm leading-relaxed" style={{ color: 'var(--clay)' }}>
                            {selectedApp.cover_letter}
                          </p>
                        </div>
                      </div>
                    )}

                    {selectedApp.applicant_work_experience?.length > 0 && (
                      <div className="mb-6">
                        <Label className="text-sm font-normal mb-3 block" style={{ color: 'var(--earth)' }}>Work Experience</Label>
                        <div className="space-y-3">
                          {selectedApp.applicant_work_experience.map((exp, idx) => (
                            <div key={idx} className="p-4 rounded-xl" style={{ backgroundColor: 'var(--cream)' }}>
                              <div className="font-normal mb-1" style={{ color: 'var(--earth)' }}>{exp.position}</div>
                              <div className="text-sm mb-2" style={{ color: 'var(--clay)' }}>{exp.venue_name}</div>
                              <div className="text-xs" style={{ color: 'var(--clay)' }}>
                                {exp.start_date} - {exp.end_date || 'Present'}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedApp.applicant_resume_url && (
                      <Button
                        onClick={() => window.open(selectedApp.applicant_resume_url, '_blank')}
                        variant="outline"
                        className="rounded-xl w-full"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        View Resume/CV
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <Card className="border rounded-2xl" style={{ borderColor: 'var(--sand)', backgroundColor: 'var(--warm-white)' }}>
                  <CardContent className="p-6">
                    <Label className="text-sm font-normal mb-3 block" style={{ color: 'var(--earth)' }}>Skills</Label>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {(selectedApp.applicant_barista_skills || selectedApp.applicant_chef_skills || []).map((skill, idx) => (
                        <Badge key={idx} variant="outline" className="font-normal" style={{ borderColor: 'var(--sand)' }}>
                          {skill}
                        </Badge>
                      ))}
                    </div>

                    {selectedApp.applicant_experience_years > 0 && (
                      <div className="mb-4">
                        <Label className="text-sm font-normal mb-1 block" style={{ color: 'var(--earth)' }}>Experience</Label>
                        <div className="text-sm" style={{ color: 'var(--clay)' }}>
                          {selectedApp.applicant_experience_years} years
                        </div>
                      </div>
                    )}

                    {selectedApp.applicant_rating > 0 && (
                      <div className="mb-4">
                        <Label className="text-sm font-normal mb-1 block" style={{ color: 'var(--earth)' }}>Rating</Label>
                        <div className="flex items-center gap-2">
                          <Star className="w-5 h-5 fill-current" style={{ color: '#FFC107' }} />
                          <span className="text-lg font-normal" style={{ color: 'var(--earth)' }}>
                            {selectedApp.applicant_rating}
                          </span>
                        </div>
                      </div>
                    )}

                    {(selectedApp.applicant_desired_rate_min || selectedApp.applicant_desired_rate_max) && (
                      <div>
                        <Label className="text-sm font-normal mb-1 block" style={{ color: 'var(--earth)' }}>Desired Rate</Label>
                        <div className="text-sm" style={{ color: 'var(--clay)' }}>
                          €{selectedApp.applicant_desired_rate_min}-{selectedApp.applicant_desired_rate_max}/hour
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {selectedApp.status === 'pending' && (
                  <div className="space-y-3">
                    <Button
                      onClick={() => updateAppMutation.mutate({ appId: selectedApp.id, status: 'accepted' })}
                      disabled={updateAppMutation.isPending}
                      className="w-full rounded-xl font-normal"
                      style={{ backgroundColor: 'var(--sage)', color: 'white' }}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Accept Application
                    </Button>
                    <Button
                      onClick={() => updateAppMutation.mutate({ appId: selectedApp.id, status: 'rejected' })}
                      disabled={updateAppMutation.isPending}
                      variant="outline"
                      className="w-full rounded-xl font-normal text-red-600"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Decline Application
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <Tabs defaultValue="pending" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 rounded-xl" style={{ backgroundColor: 'var(--sand)' }}>
              <TabsTrigger value="pending" className="rounded-lg">
                Pending ({pendingApps.length})
              </TabsTrigger>
              <TabsTrigger value="accepted" className="rounded-lg">
                Accepted ({acceptedApps.length})
              </TabsTrigger>
              <TabsTrigger value="rejected" className="rounded-lg">
                Declined ({rejectedApps.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4">
              {pendingApps.length === 0 ? (
                <Card className="border rounded-2xl" style={{ borderColor: 'var(--sand)', backgroundColor: 'var(--warm-white)' }}>
                  <CardContent className="p-12 text-center">
                    <Clock className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--clay)' }} />
                    <p style={{ color: 'var(--clay)' }}>No pending applications</p>
                  </CardContent>
                </Card>
              ) : (
                pendingApps.map(app => <ApplicationCard key={app.id} app={app} />)
              )}
            </TabsContent>

            <TabsContent value="accepted" className="space-y-4">
              {acceptedApps.length === 0 ? (
                <Card className="border rounded-2xl" style={{ borderColor: 'var(--sand)', backgroundColor: 'var(--warm-white)' }}>
                  <CardContent className="p-12 text-center">
                    <CheckCircle className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--clay)' }} />
                    <p style={{ color: 'var(--clay)' }}>No accepted applications</p>
                  </CardContent>
                </Card>
              ) : (
                acceptedApps.map(app => <ApplicationCard key={app.id} app={app} />)
              )}
            </TabsContent>

            <TabsContent value="rejected" className="space-y-4">
              {rejectedApps.length === 0 ? (
                <Card className="border rounded-2xl" style={{ borderColor: 'var(--sand)', backgroundColor: 'var(--warm-white)' }}>
                  <CardContent className="p-12 text-center">
                    <XCircle className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--clay)' }} />
                    <p style={{ color: 'var(--clay)' }}>No declined applications</p>
                  </CardContent>
                </Card>
              ) : (
                rejectedApps.map(app => <ApplicationCard key={app.id} app={app} />)
              )}
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}