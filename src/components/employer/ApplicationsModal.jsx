import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { X, Star, Briefcase, Phone, Mail, Check, XCircle, Award, ChefHat, Coffee } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import StartConversationButton from "../messaging/StartConversationButton";

export default function ApplicationsModal({ shift, onClose }) {
  const queryClient = useQueryClient();
  const isChefRole = shift.role_type === 'chef';

  const { data: applications, isLoading } = useQuery({
    queryKey: ['applications', shift.id],
    queryFn: () => base44.entities.ShiftApplication.filter({ shift_id: shift.id }),
    initialData: []
  });

  const updateApplicationMutation = useMutation({
    mutationFn: async ({ applicationId, status, applicantEmail, applicantName }) => {
      // Optimistic: Update UI immediately
      queryClient.setQueryData(['applications', shift.id], (old) =>
        old?.map(a => a.id === applicationId ? { ...a, status } : a) || old
      );

      if (status === 'accepted') {
        queryClient.setQueryData(['employerShifts'], (old) =>
          old?.map(s => s.id === shift.id ? { ...s, status: 'filled', assigned_to: applicantEmail } : s) || old
        );
      }

      await base44.entities.ShiftApplication.update(applicationId, { status });
      
      if (status === 'accepted') {
        // Update shift as filled
        await base44.entities.Shift.update(shift.id, {
          status: 'filled',
          assigned_to: applicantEmail,
          assigned_to_name: applicantName,
          assigned_at: new Date().toISOString()
        });

        // Reject other pending applications
        const otherApps = applications.filter(a => a.id !== applicationId && a.status === 'pending');
        await Promise.all(otherApps.map(app =>
          base44.entities.ShiftApplication.update(app.id, { status: 'rejected' })
        ));

        // Send acceptance email
        await base44.integrations.Core.SendEmail({
          to: applicantEmail,
          subject: `Shift Confirmed – ${shift.venue_name} on ${format(new Date(shift.date), 'MMM d')}`,
          body: `Congratulations ${applicantName}!\n\nYour application for the ${isChefRole ? 'chef' : 'barista'} shift at ${shift.venue_name} has been accepted.\n\nShift Details:\n- Date: ${format(new Date(shift.date), 'EEEE, MMMM d, yyyy')}\n- Time: ${shift.start_time} – ${shift.end_time}\n- Location: ${shift.location}\n- Pay Rate: €${shift.hourly_rate}/hr\n\nPlease arrive 10 minutes early and bring your ID.\n\nBest regards,\n${shift.venue_name} via Hospo`
        });
      } else if (status === 'rejected') {
        // Send rejection email
        await base44.integrations.Core.SendEmail({
          to: applicantEmail,
          subject: `Application Update – ${shift.venue_name}`,
          body: `Hi ${applicantName},\n\nThank you for your interest in the ${isChefRole ? 'chef' : 'barista'} position at ${shift.venue_name}.\n\nUnfortunately, we have decided to move forward with another candidate for the shift on ${format(new Date(shift.date), 'MMMM d, yyyy')}.\n\nWe appreciate your time and encourage you to apply for future shifts.\n\nBest regards,\n${shift.venue_name} via Hospo`
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['employerShifts'] });
      toast.success('Application updated');
    }
  });

  const pendingApplications = applications.filter(a => a.status === 'pending');
  const processedApplications = applications.filter(a => a.status !== 'pending');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto" onClick={onClose}>
      <div className="max-w-3xl w-full rounded-2xl p-8 my-8 max-h-[90vh] overflow-y-auto" style={{ backgroundColor: 'var(--warm-white)' }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {isChefRole ? (
              <ChefHat className="w-8 h-8" style={{ color: 'var(--sage)' }} />
            ) : (
              <Coffee className="w-8 h-8" style={{ color: 'var(--terracotta)' }} />
            )}
            <div>
              <h2 className="text-2xl font-light" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
                Applications
              </h2>
              <p className="text-sm" style={{ color: 'var(--clay)' }}>
                {shift.venue_name} - {format(new Date(shift.date), 'MMM d, yyyy')}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5" style={{ color: 'var(--clay)' }} />
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-2" style={{ borderColor: 'var(--sand)', borderTopColor: 'var(--terracotta)' }} />
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-12" style={{ color: 'var(--clay)' }}>
            No applications yet
          </div>
        ) : (
          <div className="space-y-6">
            {/* Pending Applications */}
            {pendingApplications.length > 0 && (
              <div>
                <h3 className="text-xs tracking-wider mb-4" style={{ color: 'var(--clay)' }}>
                  PENDING APPLICATIONS ({pendingApplications.length})
                </h3>
                <div className="space-y-4">
                  {pendingApplications.map(app => (
                    <Card key={app.id} className="border rounded-xl" style={{ borderColor: 'var(--sand)', backgroundColor: 'var(--cream)' }}>
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-light text-white" style={{ backgroundColor: 'var(--terracotta)' }}>
                              {app.applicant_name?.[0]?.toUpperCase() || 'A'}
                            </div>
                            <div>
                              <h4 className="font-normal text-lg" style={{ color: 'var(--earth)' }}>{app.applicant_name}</h4>
                              <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--clay)' }}>
                                <span className="flex items-center gap-1">
                                  <Briefcase className="w-4 h-4" />
                                  {app.applicant_experience_years || 0} years
                                </span>
                                {app.applicant_rating > 0 && (
                                  <span className="flex items-center gap-1">
                                    <Star className="w-4 h-4 fill-current" style={{ color: 'var(--terracotta)' }} />
                                    {app.applicant_rating.toFixed(1)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <Badge className="font-normal" style={{ backgroundColor: 'var(--sand)', color: 'var(--clay)' }}>
                            Pending
                          </Badge>
                        </div>

                        {/* Contact Info */}
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-4 text-sm mb-3" style={{ color: 'var(--clay)' }}>
                            <span className="flex items-center gap-1">
                              <Mail className="w-4 h-4" />
                              {app.applicant_email}
                            </span>
                            {app.applicant_phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-4 h-4" />
                                {app.applicant_phone}
                              </span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <StartConversationButton 
                              recipientEmail={app.applicant_email}
                              recipientName={app.applicant_name}
                              size="sm"
                              className="flex-1"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.location.href = `mailto:${app.applicant_email}`}
                              className="flex-1"
                              style={{ minHeight: '44px' }}
                            >
                              <Mail className="w-4 h-4 mr-2" />
                              Email
                            </Button>
                            {app.applicant_phone && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.location.href = `tel:${app.applicant_phone}`}
                                className="flex-1"
                                style={{ minHeight: '44px' }}
                              >
                                <Phone className="w-4 h-4 mr-2" />
                                Call
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Skills */}
                        {app.applicant_skills && app.applicant_skills.length > 0 && (
                          <div className="mb-4">
                            <div className="text-xs tracking-wider mb-2 flex items-center gap-1" style={{ color: 'var(--clay)' }}>
                              <Award className="w-3 h-3" />
                              SKILLS
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {app.applicant_skills.map((skill, idx) => (
                                <Badge 
                                  key={idx}
                                  className="text-xs font-normal"
                                  style={shift.skills_required?.includes(skill) ? {
                                    backgroundColor: 'var(--sage)',
                                    color: 'white',
                                    border: 'none'
                                  } : {
                                    backgroundColor: 'transparent',
                                    border: '1px solid var(--sand)',
                                    color: 'var(--clay)'
                                  }}
                                >
                                  {skill.replace(/_/g, ' ')}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {app.cover_note && (
                          <div className="p-3 rounded-lg mb-4" style={{ backgroundColor: 'var(--sand)' }}>
                            <div className="text-xs tracking-wider mb-1" style={{ color: 'var(--clay)' }}>COVER NOTE</div>
                            <p className="text-sm font-light" style={{ color: 'var(--earth)' }}>{app.cover_note}</p>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3">
                          <Button
                            onClick={() => updateApplicationMutation.mutate({
                              applicationId: app.id,
                              status: 'accepted',
                              applicantEmail: app.applicant_email,
                              applicantName: app.applicant_name
                            })}
                            disabled={updateApplicationMutation.isPending}
                            className="flex-1 rounded-xl font-normal"
                            style={{ backgroundColor: 'var(--sage)', color: 'white' }}
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Accept
                          </Button>
                          <Button
                            onClick={() => updateApplicationMutation.mutate({
                              applicationId: app.id,
                              status: 'rejected',
                              applicantEmail: app.applicant_email,
                              applicantName: app.applicant_name
                            })}
                            disabled={updateApplicationMutation.isPending}
                            variant="outline"
                            className="flex-1 rounded-xl font-normal"
                            style={{ borderColor: 'var(--clay)', color: 'var(--clay)' }}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Processed Applications */}
            {processedApplications.length > 0 && (
              <div>
                <h3 className="text-xs tracking-wider mb-4" style={{ color: 'var(--clay)' }}>
                  PROCESSED ({processedApplications.length})
                </h3>
                <div className="space-y-3">
                  {processedApplications.map(app => (
                    <div 
                      key={app.id} 
                      className="flex items-center justify-between p-4 rounded-xl"
                      style={{ backgroundColor: 'var(--sand)' }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-light text-white" style={{ backgroundColor: 'var(--clay)' }}>
                          {app.applicant_name?.[0]?.toUpperCase() || 'A'}
                        </div>
                        <div>
                          <div className="font-normal" style={{ color: 'var(--earth)' }}>{app.applicant_name}</div>
                          <div className="text-xs" style={{ color: 'var(--clay)' }}>{app.applicant_email}</div>
                        </div>
                      </div>
                      <Badge 
                        className="font-normal"
                        style={{ 
                          backgroundColor: app.status === 'accepted' ? 'var(--sage)' : 'var(--clay)', 
                          color: 'white' 
                        }}
                      >
                        {app.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}