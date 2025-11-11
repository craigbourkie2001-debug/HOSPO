import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Clock, Euro, Award } from "lucide-react";
import { format } from "date-fns";

export default function ShiftCard({ shift, onClaim, isLoading }) {
  const skillColors = {
    espresso: 'bg-amber-100 text-amber-800',
    latte_art: 'bg-pink-100 text-pink-800',
    filter: 'bg-blue-100 text-blue-800',
    customer_service: 'bg-green-100 text-green-800',
    opening: 'bg-purple-100 text-purple-800',
    closing: 'bg-indigo-100 text-indigo-800',
    cash_handling: 'bg-emerald-100 text-emerald-800'
  };

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl group border-2 rounded-2xl" style={{ borderColor: 'var(--latte)', backgroundColor: 'white' }}>
      <div className="h-2 transition-all duration-300 group-hover:h-3" style={{ background: 'linear-gradient(90deg, var(--fresh-green), var(--coffee-brown))' }} />
      
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-xl font-bold mb-1" style={{ color: 'var(--espresso)' }}>
              {shift.coffee_shop_name}
            </h3>
            <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--coffee-brown)' }}>
              <MapPin className="w-4 h-4" />
              {shift.location}
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold" style={{ color: 'var(--fresh-green)' }}>
              €{shift.hourly_rate}
            </div>
            <div className="text-xs" style={{ color: 'var(--coffee-brown)' }}>per hour</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="flex items-center gap-1" style={{ backgroundColor: 'var(--latte)', color: 'var(--espresso)' }}>
            <Calendar className="w-3 h-3" />
            {format(new Date(shift.date), 'EEE, MMM d')}
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1" style={{ backgroundColor: 'var(--latte)', color: 'var(--espresso)' }}>
            <Clock className="w-3 h-3" />
            {shift.start_time} - {shift.end_time}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        {shift.description && (
          <p className="text-sm mb-4 line-clamp-2" style={{ color: 'var(--coffee-brown)' }}>
            {shift.description}
          </p>
        )}

        {shift.skills_required && shift.skills_required.length > 0 && (
          <div className="mb-4">
            <div className="text-xs font-semibold mb-2 flex items-center gap-1" style={{ color: 'var(--coffee-brown)' }}>
              <Award className="w-3 h-3" />
              Skills Required
            </div>
            <div className="flex flex-wrap gap-1.5">
              {shift.skills_required.map((skill, idx) => (
                <Badge 
                  key={idx} 
                  variant="outline"
                  className={`text-xs ${skillColors[skill] || 'bg-gray-100 text-gray-800'}`}
                >
                  {skill.replace(/_/g, ' ')}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <Button
          onClick={onClaim}
          disabled={isLoading}
          className="w-full rounded-xl font-semibold transition-all duration-300 hover:shadow-lg"
          style={{ 
            background: 'linear-gradient(135deg, var(--fresh-green), #7FA32E)',
            color: 'white'
          }}
        >
          {isLoading ? 'Claiming...' : 'Claim This Shift'}
        </Button>
      </CardContent>
    </Card>
  );
}