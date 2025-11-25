import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Clock, Award, Coffee, ChefHat, Users } from "lucide-react";
import { format } from "date-fns";

export default function ShiftCard({ shift, onApply, isLoading }) {
  const isChefRole = shift.role_type === 'chef';
  
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:-translate-y-1 border rounded-2xl hover-lift" style={{ borderColor: 'var(--sand)', backgroundColor: 'var(--warm-white)' }}>
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {isChefRole ? (
                <ChefHat className="w-5 h-5" style={{ color: 'var(--terracotta)' }} />
              ) : (
                <Coffee className="w-5 h-5" style={{ color: 'var(--terracotta)' }} />
              )}
              <Badge 
                className="text-xs font-normal" 
                style={{ 
                  backgroundColor: isChefRole ? 'var(--sage)' : 'var(--terracotta)', 
                  color: 'white',
                  border: 'none'
                }}
              >
                {isChefRole ? 'Chef' : 'Barista'}
              </Badge>
            </div>
            <h3 className="text-xl font-normal mb-2" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
              {shift.venue_name || shift.coffee_shop_name}
            </h3>
            <div className="flex items-center gap-2 text-sm font-light" style={{ color: 'var(--clay)' }}>
              <MapPin className="w-4 h-4" style={{ strokeWidth: 1.5 }} />
              {shift.location}
            </div>
          </div>
          <div className="text-right">
            <div className="px-4 py-2 rounded-xl" style={{ backgroundColor: 'var(--terracotta)' }}>
              <div className="text-2xl font-light text-white" style={{ fontFamily: 'Crimson Pro, serif' }}>
                €{shift.hourly_rate}
              </div>
              <div className="text-xs text-white/80 tracking-wide">per hour</div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="flex items-center gap-1.5 font-normal" style={{ backgroundColor: 'var(--sand)', color: 'var(--earth)', border: 'none' }}>
            <Calendar className="w-3 h-3" style={{ strokeWidth: 1.5 }} />
            {format(new Date(shift.date), 'EEE, MMM d')}
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1.5 font-normal" style={{ backgroundColor: 'var(--sand)', color: 'var(--earth)', border: 'none' }}>
            <Clock className="w-3 h-3" style={{ strokeWidth: 1.5 }} />
            {shift.start_time} - {shift.end_time}
          </Badge>
          {shift.applications_count > 0 && (
            <Badge variant="secondary" className="flex items-center gap-1.5 font-normal" style={{ backgroundColor: 'var(--sage)', color: 'white', border: 'none' }}>
              <Users className="w-3 h-3" style={{ strokeWidth: 1.5 }} />
              {shift.applications_count} applicant{shift.applications_count !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {shift.description && (
          <p className="text-sm mb-4 line-clamp-2 font-light" style={{ color: 'var(--clay)' }}>
            {shift.description}
          </p>
        )}

        {shift.skills_required && shift.skills_required.length > 0 && (
          <div className="mb-4">
            <div className="text-xs tracking-wider mb-2 flex items-center gap-1.5" style={{ color: 'var(--clay)' }}>
              <Award className="w-3 h-3" style={{ strokeWidth: 1.5 }} />
              SKILLS REQUIRED
            </div>
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
          style={{ 
            backgroundColor: 'var(--earth)',
            color: 'white'
          }}
        >
          {isLoading ? 'Applying...' : 'Apply for Shift'}
        </Button>
      </CardContent>
    </Card>
  );
}