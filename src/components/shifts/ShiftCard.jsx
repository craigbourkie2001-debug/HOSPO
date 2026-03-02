import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";
import { format } from "date-fns";
import { formatDistance } from "./geoUtils";

const roleLabels = {
  barista: 'Barista',
  chef: 'Chef',
  bartender: 'Bartender',
  mixologist: 'Mixologist',
  waiter: 'Waiter / Server',
};

const roleColors = {
  barista: 'var(--terracotta)',
  chef: 'var(--sage)',
  bartender: 'var(--olive)',
  mixologist: 'var(--clay)',
  waiter: 'var(--earth)',
};

export default function ShiftCard({ shift, onApply, isLoading, featured = false, distance = null }) {
  const roleColor = roleColors[shift.role_type] || 'var(--terracotta)';
  const roleLabel = shift.role_type === 'chef' && shift.chef_level
    ? shift.chef_level.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    : roleLabels[shift.role_type] || shift.role_type;

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:-translate-y-1 border rounded-2xl hover-lift" style={{ 
      borderColor: featured ? 'var(--terracotta)' : 'var(--sand)', 
      backgroundColor: 'var(--warm-white)',
      borderWidth: featured ? '2px' : '1px'
    }}>
      {/* Coloured top bar */}
      <div className="h-1.5 w-full" style={{ backgroundColor: roleColor }} />

      <CardContent className="p-5">
        {/* Top row: role badge + rate */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-normal tracking-widest uppercase px-3 py-1 rounded-full" style={{ backgroundColor: roleColor + '20', color: roleColor }}>
            {roleLabel}
          </span>
          {featured && (
            <span className="text-xs font-normal tracking-widest uppercase px-3 py-1 rounded-full" style={{ backgroundColor: 'var(--terracotta)', color: 'white' }}>
              Featured
            </span>
          )}
          <div className="text-right">
            <span className="text-2xl font-light" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
              €{shift.hourly_rate}
            </span>
            <span className="text-xs ml-1 font-light" style={{ color: 'var(--clay)' }}>/hr</span>
          </div>
        </div>

        {/* Venue name */}
        <h3 className="text-xl font-normal mb-1 leading-tight" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
          {shift.venue_name || shift.coffee_shop_name}
        </h3>

        {/* Location */}
        <p className="text-sm font-light mb-4" style={{ color: 'var(--clay)' }}>
          {shift.location}
        </p>

        {/* Date & time row */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1 p-3 rounded-xl text-center" style={{ backgroundColor: 'var(--cream)' }}>
            <div className="text-xs tracking-wider mb-0.5" style={{ color: 'var(--clay)' }}>DATE</div>
            <div className="font-normal text-sm" style={{ color: 'var(--earth)' }}>
              {format(new Date(shift.date), 'EEE, d MMM')}
            </div>
          </div>
          <div className="flex-1 p-3 rounded-xl text-center" style={{ backgroundColor: 'var(--cream)' }}>
            <div className="text-xs tracking-wider mb-0.5" style={{ color: 'var(--clay)' }}>TIME</div>
            <div className="font-normal text-sm" style={{ color: 'var(--earth)' }}>
              {shift.start_time} – {shift.end_time}
            </div>
          </div>
          {shift.applications_count > 0 && (
            <div className="flex-1 p-3 rounded-xl text-center" style={{ backgroundColor: 'var(--cream)' }}>
              <div className="text-xs tracking-wider mb-0.5" style={{ color: 'var(--clay)' }}>APPLIED</div>
              <div className="font-normal text-sm" style={{ color: 'var(--earth)' }}>{shift.applications_count}</div>
            </div>
          )}
        </div>

        {/* Description */}
        {shift.description && (
          <p className="text-sm mb-4 line-clamp-2 font-light" style={{ color: 'var(--clay)' }}>
            {shift.description}
          </p>
        )}

        {/* Skills */}
        {shift.skills_required && shift.skills_required.length > 0 && (
          <div className="mb-4">
            <div className="text-xs tracking-wider mb-2" style={{ color: 'var(--clay)' }}>SKILLS REQUIRED</div>
            <div className="flex flex-wrap gap-1.5">
              {shift.skills_required.map((skill, idx) => (
                <Badge 
                  key={idx}
                  variant="outline"
                  className="text-xs font-normal"
                  style={{ borderColor: 'var(--sand)', color: 'var(--clay)' }}
                >
                  {skill.replace(/_/g, ' ')}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <Button
          onClick={onApply}
          disabled={isLoading}
          className="w-full rounded-xl font-normal tracking-wide transition-all duration-300 hover-lift"
          style={{ backgroundColor: 'var(--earth)', color: 'white' }}
        >
          {isLoading ? 'Applying...' : 'Apply for Shift'}
        </Button>
      </CardContent>
    </Card>
  );
}