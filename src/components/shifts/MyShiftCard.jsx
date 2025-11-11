import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Clock, Euro, CheckCircle } from "lucide-react";
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
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg border-2 rounded-2xl" style={{ borderColor: 'var(--latte)', backgroundColor: 'white' }}>
      <div className={`h-2 ${isCompleted ? 'bg-green-500' : ''}`} style={!isCompleted ? { background: 'linear-gradient(90deg, var(--fresh-green), var(--coffee-brown))' } : {}} />
      
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
          {isCompleted && (
            <Badge className="bg-green-100 text-green-800 border-green-200">
              <CheckCircle className="w-3 h-3 mr-1" />
              Completed
            </Badge>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="flex items-center gap-1" style={{ backgroundColor: 'var(--latte)', color: 'var(--espresso)' }}>
            <Calendar className="w-3 h-3" />
            {format(new Date(shift.date), 'EEE, MMM d, yyyy')}
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1" style={{ backgroundColor: 'var(--latte)', color: 'var(--espresso)' }}>
            <Clock className="w-3 h-3" />
            {shift.start_time} - {shift.end_time}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--cream)' }}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm" style={{ color: 'var(--coffee-brown)' }}>Hourly Rate</span>
            <span className="font-semibold" style={{ color: 'var(--espresso)' }}>€{shift.hourly_rate}/hr</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm" style={{ color: 'var(--coffee-brown)' }}>Duration</span>
            <span className="font-semibold" style={{ color: 'var(--espresso)' }}>{hours} hours</span>
          </div>
          <div className="pt-2 border-t flex justify-between items-center" style={{ borderColor: 'var(--latte)' }}>
            <span className="font-semibold" style={{ color: 'var(--coffee-brown)' }}>Total Earnings</span>
            <span className="text-2xl font-bold" style={{ color: 'var(--fresh-green)' }}>€{totalPay}</span>
          </div>
        </div>

        {shift.claimed_at && (
          <div className="mt-3 text-xs text-center" style={{ color: 'var(--coffee-brown)' }}>
            Claimed on {format(new Date(shift.claimed_at), 'MMM d, yyyy')}
          </div>
        )}
      </CardContent>
    </Card>
  );
}