import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Euro, Calendar, Coffee, ChefHat, Utensils, Wine, User } from "lucide-react";

const roleIcons = {
  barista: Coffee,
  chef: ChefHat,
  server: Utensils,
  bartender: Wine,
  manager: User
};

export default function JobCard({ job }) {
  const RoleIcon = roleIcons[job.role_type] || User;
  
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:-translate-y-1 border rounded-2xl hover-lift" style={{ borderColor: 'var(--sand)', backgroundColor: 'var(--warm-white)' }}>
      <div className="h-2" style={{ backgroundColor: job.employment_type === 'full_time' ? 'var(--terracotta)' : 'var(--sage)' }} />
      
      <CardHeader>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--sand)' }}>
              <RoleIcon className="w-6 h-6" style={{ color: 'var(--earth)' }} />
            </div>
            <div>
              <h3 className="text-xl font-normal mb-1" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
                {job.job_title}
              </h3>
              <p className="text-sm font-light" style={{ color: 'var(--clay)' }}>{job.venue_name}</p>
            </div>
          </div>
          <Badge 
            className="text-xs font-normal"
            style={{ 
              backgroundColor: job.employment_type === 'full_time' ? 'var(--terracotta)' : 'var(--sage)',
              color: 'white',
              border: 'none'
            }}
          >
            {job.employment_type === 'full_time' ? 'Full-Time' : 'Part-Time'}
          </Badge>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="flex items-center gap-1 font-normal border-0" style={{ backgroundColor: 'var(--sand)', color: 'var(--earth)' }}>
            <MapPin className="w-3 h-3" />
            {job.location}
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1 font-normal border-0" style={{ backgroundColor: 'var(--sand)', color: 'var(--earth)' }}>
            <Clock className="w-3 h-3" />
            {job.hours_per_week}h/week
          </Badge>
          {job.employment_type === 'full_time' && job.salary_min && (
            <Badge variant="secondary" className="flex items-center gap-1 font-normal border-0" style={{ backgroundColor: 'var(--terracotta)', color: 'white' }}>
              <Euro className="w-3 h-3" />
              €{(job.salary_min / 1000).toFixed(0)}k-{(job.salary_max / 1000).toFixed(0)}k
            </Badge>
          )}
          {job.employment_type === 'part_time' && job.hourly_rate && (
            <Badge variant="secondary" className="flex items-center gap-1 font-normal border-0" style={{ backgroundColor: 'var(--sage)', color: 'white' }}>
              <Euro className="w-3 h-3" />
              €{job.hourly_rate}/hr
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {job.description && (
          <p className="text-sm font-light mb-4 line-clamp-3" style={{ color: 'var(--earth)' }}>
            {job.description}
          </p>
        )}

        {job.requirements && job.requirements.length > 0 && (
          <div className="mb-4">
            <h4 className="text-xs tracking-wider mb-2 font-normal" style={{ color: 'var(--clay)' }}>REQUIREMENTS</h4>
            <ul className="text-sm font-light space-y-1" style={{ color: 'var(--earth)' }}>
              {job.requirements.slice(0, 3).map((req, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span style={{ color: 'var(--terracotta)' }}>•</span>
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {job.benefits && job.benefits.length > 0 && (
          <div className="mb-4">
            <h4 className="text-xs tracking-wider mb-2 font-normal" style={{ color: 'var(--clay)' }}>BENEFITS</h4>
            <div className="flex flex-wrap gap-2">
              {job.benefits.slice(0, 4).map((benefit, idx) => (
                <Badge key={idx} className="border-0 text-xs font-normal" style={{ backgroundColor: 'var(--sand)', color: 'var(--earth)' }}>
                  {benefit}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {job.start_date && (
          <div className="flex items-center gap-2 text-xs font-light mb-4" style={{ color: 'var(--clay)' }}>
            <Calendar className="w-3 h-3" />
            Start date: {new Date(job.start_date).toLocaleDateString('en-IE', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        )}

        <Button
          className="w-full rounded-xl font-normal tracking-wide"
          style={{ backgroundColor: 'var(--terracotta)', color: 'white' }}
        >
          Apply Now
        </Button>
      </CardContent>
    </Card>
  );
}