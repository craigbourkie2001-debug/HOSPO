import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Star, Briefcase, MapPin, Award, Clock, Coffee, ChefHat, Shield, Euro } from "lucide-react";
import WorkerRatingBreakdown from "../reviews/WorkerRatingBreakdown";

export default function WorkerProfileModal({ workerEmail, onClose }) {
  const { data: workers = [] } = useQuery({
    queryKey: ['worker-profile', workerEmail],
    queryFn: () => base44.entities.User.filter({ email: workerEmail }),
    enabled: !!workerEmail
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['worker-reviews', workerEmail],
    queryFn: () => base44.entities.WorkerReview.filter({ worker_email: workerEmail }),
    enabled: !!workerEmail
  });

  const worker = workers[0];

  if (!worker) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="max-w-3xl w-full rounded-2xl my-8" style={{ backgroundColor: 'var(--warm-white)' }}>
        {/* Header */}
        <div className="p-8 border-b" style={{ borderColor: 'var(--sand)' }}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {worker.profile_picture_url ? (
                <img 
                  src={worker.profile_picture_url} 
                  alt={worker.full_name}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl text-white" style={{ backgroundColor: 'var(--terracotta)', fontFamily: 'Crimson Pro, serif' }}>
                  {worker.full_name?.[0]?.toUpperCase() || 'W'}
                </div>
              )}
              <div>
                <h2 className="text-3xl font-light mb-1" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
                  {worker.full_name}
                </h2>
                <div className="flex items-center gap-3 text-sm" style={{ color: 'var(--clay)' }}>
                  {worker.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {worker.location}
                    </span>
                  )}
                  {worker.rating > 0 && (
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-current" style={{ color: 'var(--terracotta)' }} />
                      {worker.rating.toFixed(1)}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-lg"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-xl" style={{ backgroundColor: 'var(--cream)' }}>
              <Briefcase className="w-6 h-6 mx-auto mb-2" style={{ color: 'var(--sage)' }} />
              <div className="text-2xl font-light" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
                {worker.shifts_completed || 0}
              </div>
              <div className="text-xs" style={{ color: 'var(--clay)' }}>Shifts</div>
            </div>
            <div className="text-center p-4 rounded-xl" style={{ backgroundColor: 'var(--cream)' }}>
              <Award className="w-6 h-6 mx-auto mb-2" style={{ color: 'var(--terracotta)' }} />
              <div className="text-2xl font-light" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
                {worker.experience_years || 0}y
              </div>
              <div className="text-xs" style={{ color: 'var(--clay)' }}>Experience</div>
            </div>
            <div className="text-center p-4 rounded-xl" style={{ backgroundColor: 'var(--cream)' }}>
              <Clock className="w-6 h-6 mx-auto mb-2" style={{ color: 'var(--olive)' }} />
              <div className="text-2xl font-light" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
                {worker.total_reviews || 0}
              </div>
              <div className="text-xs" style={{ color: 'var(--clay)' }}>Reviews</div>
            </div>
            <div className="text-center p-4 rounded-xl" style={{ backgroundColor: 'var(--cream)' }}>
              <Euro className="w-6 h-6 mx-auto mb-2" style={{ color: 'var(--clay)' }} />
              <div className="text-2xl font-light" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
                €{worker.desired_hourly_rate_min || 0}
              </div>
              <div className="text-xs" style={{ color: 'var(--clay)' }}>Min Rate</div>
            </div>
          </div>

          {/* Worker Type & Visa */}
          <div className="flex gap-2 items-center">
            {(worker.worker_type === 'barista' || worker.worker_type === 'both') && (
              <Badge className="border-0" style={{ backgroundColor: 'var(--terracotta)', color: 'white' }}>
                <Coffee className="w-3 h-3 mr-1" />
                Barista
              </Badge>
            )}
            {(worker.worker_type === 'chef' || worker.worker_type === 'both') && (
              <Badge className="border-0" style={{ backgroundColor: 'var(--sage)', color: 'white' }}>
                <ChefHat className="w-3 h-3 mr-1" />
                Chef
              </Badge>
            )}
            {worker.visa_status && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Shield className="w-3 h-3" />
                {worker.visa_status.replace(/_/g, ' ').toUpperCase()}
              </Badge>
            )}
          </div>

          {/* Professional Summary */}
          {worker.professional_summary && (
            <Card className="border" style={{ borderColor: 'var(--sand)', backgroundColor: 'var(--cream)' }}>
              <CardContent className="p-4">
                <p className="font-light" style={{ color: 'var(--earth)' }}>
                  {worker.professional_summary}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Bio */}
          {worker.bio && (
            <div>
              <h3 className="text-lg font-normal mb-2" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
                About
              </h3>
              <p className="font-light" style={{ color: 'var(--clay)' }}>
                {worker.bio}
              </p>
            </div>
          )}

          {/* Skills */}
          {((worker.barista_skills && worker.barista_skills.length > 0) || (worker.chef_skills && worker.chef_skills.length > 0)) && (
            <div>
              <h3 className="text-lg font-normal mb-3" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
                Skills
              </h3>
              <div className="space-y-2">
                {worker.barista_skills && worker.barista_skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {worker.barista_skills.map((skill, idx) => (
                      <Badge key={idx} className="border-0" style={{ backgroundColor: 'var(--terracotta)', color: 'white' }}>
                        {skill.replace(/_/g, ' ')}
                      </Badge>
                    ))}
                  </div>
                )}
                {worker.chef_skills && worker.chef_skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {worker.chef_skills.map((skill, idx) => (
                      <Badge key={idx} className="border-0" style={{ backgroundColor: 'var(--sage)', color: 'white' }}>
                        {skill.replace(/_/g, ' ')}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Availability */}
          {worker.availability && worker.availability.length > 0 && (
            <div>
              <h3 className="text-lg font-normal mb-3" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
                Availability
              </h3>
              <div className="flex flex-wrap gap-2">
                {worker.availability.map((day, idx) => (
                  <Badge key={idx} variant="outline">
                    {day.charAt(0).toUpperCase() + day.slice(1)}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Work Experience */}
          {worker.work_experience && worker.work_experience.length > 0 && (
            <div>
              <h3 className="text-lg font-normal mb-3" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
                Work Experience
              </h3>
              <div className="space-y-3">
                {worker.work_experience.map((exp, idx) => (
                  <div key={idx} className="p-4 rounded-xl border-l-4" style={{ backgroundColor: 'var(--cream)', borderColor: 'var(--terracotta)' }}>
                    <h4 className="font-normal" style={{ color: 'var(--earth)' }}>{exp.job_title}</h4>
                    <p className="text-sm" style={{ color: 'var(--clay)' }}>{exp.company}</p>
                    {exp.start_date && (
                      <p className="text-xs mt-1" style={{ color: 'var(--clay)' }}>
                        {exp.start_date} - {exp.current ? 'Present' : exp.end_date}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          {reviews.length > 0 && (
            <div>
              <h3 className="text-lg font-normal mb-3" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
                Reviews ({reviews.length})
              </h3>
              <div className="space-y-3">
                {reviews.map((review, idx) => (
                  <div key={idx} className="p-4 rounded-xl" style={{ backgroundColor: 'var(--cream)' }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-normal" style={{ color: 'var(--earth)' }}>{review.coffee_shop_name}</span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className="w-4 h-4" 
                            style={{ 
                              color: i < review.rating ? 'var(--terracotta)' : 'var(--sand)',
                              fill: i < review.rating ? 'var(--terracotta)' : 'none'
                            }} 
                          />
                        ))}
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-sm font-light" style={{ color: 'var(--clay)' }}>{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t" style={{ borderColor: 'var(--sand)' }}>
          <Button
            onClick={onClose}
            className="w-full rounded-xl font-normal"
            style={{ backgroundColor: 'var(--earth)', color: 'white' }}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}