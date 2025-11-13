import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Clock, CheckCircle } from "lucide-react";
import { format } from "date-fns";

export default function MyShiftCard({ shift }) {
  const isCompleted = shift.status === 'completed';
  const hours = (() => {
    const start = parseInt(shift.start_time?.split(':')[0] || 0);
    const end = parseInt(shift.end_time?.split(':')[0] || 0);
    return end - start;
  })();
  const totalPay = hours * shift.hourly_rate;

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:-translate-y-1 border rounded-2xl hover-lift" style={{ borderColor: 'var(--sand)', backgroundColor: 'var(--warm-white)' }}>
      {isCompleted && (
        <div className="h-1" style={{ backgroundColor: 'var(--sage)' }} />
      )}
      
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-xl font-normal mb-1" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
              {shift.coffee_shop_name}
            </h3>
            <div className="flex items-center gap-2 text-sm font-light" style={{ color: 'var(--clay)' }}>
              <MapPin className="w-4 h-4" style={{ strokeWidth: 1.5 }} />
              {shift.location}
            </div>
          </div>
          {isCompleted && (
            <Badge className="border-0 font-normal" style={{ backgroundColor: 'var(--sage)', color: 'white' }}>
              <CheckCircle className="w-3 h-3 mr-1" />
              Completed
            </Badge>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="flex items-center gap-1 font-normal border-0" style={{ backgroundColor: 'var(--sand)', color: 'var(--earth)' }}>
            <Calendar className="w-3 h-3" style={{ strokeWidth: 1.5 }} />
            {format(new Date(shift.date), 'EEE, MMM d, yyyy')}
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1 font-normal border-0" style={{ backgroundColor: 'var(--sand)', color: 'var(--earth)' }}>
            <Clock className="w-3 h-3" style={{ strokeWidth: 1.5 }} />
            {shift.start_time} - {shift.end_time}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="p-5 rounded-xl" style={{ backgroundColor: 'var(--sand)' }}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-light" style={{ color: 'var(--clay)' }}>Hourly Rate</span>
            <span className="font-normal" style={{ color: 'var(--earth)' }}>€{shift.hourly_rate}/hr</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-light" style={{ color: 'var(--clay)' }}>Duration</span>
            <span className="font-normal" style={{ color: 'var(--earth)' }}>{hours} hours</span>
          </div>
          <div className="pt-3 border-t flex justify-between items-center" style={{ borderColor: 'var(--cream)' }}>
            <span className="font-normal" style={{ color: 'var(--clay)' }}>Total Earnings</span>
            <span className="text-2xl font-light" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--terracotta)' }}>€{totalPay}</span>
          </div>
        </div>

        {shift.claimed_at && (
          <div className="mt-3 text-xs text-center font-light" style={{ color: 'var(--clay)' }}>
            Claimed on {format(new Date(shift.claimed_at), 'MMM d, yyyy')}
          </div>
        )}
      </CardContent>
    </Card>
  );
}