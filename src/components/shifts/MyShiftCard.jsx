import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Clock, CheckCircle, Coffee, ChefHat, Star } from "lucide-react";
import { format } from "date-fns";
import ShiftChatButton from "../messaging/ShiftChatButton";
import ReviewVenueModal from "../shifts/ReviewVenueModal";
import ClockInButton from "../shifts/ClockInButton";

export default function MyShiftCard({ shift }) {
  const [showReviewModal, setShowReviewModal] = useState(false);

  const { data: existingReviews = [] } = useQuery({
    queryKey: ['venueReview', shift.id],
    queryFn: () => base44.entities.VenueReview.filter({ shift_id: shift.id }),
    enabled: shift.status === 'completed'
  });
  const hasReviewed = existingReviews.length > 0;
  const isCompleted = shift.status === 'completed';
  const isChefRole = shift.role_type === 'chef';
  const hours = (() => {
    if (!shift.start_time || !shift.end_time) return 0;
    const [startH, startM] = shift.start_time.split(':').map(Number);
    const [endH, endM] = shift.end_time.split(':').map(Number);
    const totalMins = (endH * 60 + endM) - (startH * 60 + startM);
    return totalMins > 0 ? Math.round((totalMins / 60) * 10) / 10 : 0;
  })();
  const totalPay = Math.round(hours * (shift.hourly_rate || 0) * 100) / 100;

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:-translate-y-1 border rounded-2xl hover-lift" style={{ borderColor: 'var(--sand)', backgroundColor: 'var(--warm-white)' }}>
      {isCompleted && (
        <div className="h-1" style={{ backgroundColor: 'var(--sage)' }} />
      )}
      
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {isChefRole ? (
                <ChefHat className="w-5 h-5" style={{ color: 'var(--sage)' }} />
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
            <h3 className="text-xl font-normal mb-1" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
              {shift.venue_name || shift.coffee_shop_name}
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

        {shift.assigned_at && (
          <div className="mt-3 text-xs text-center font-light" style={{ color: 'var(--clay)' }}>
            Confirmed on {format(new Date(shift.assigned_at), 'MMM d, yyyy')}
          </div>
        )}

        {shift.status === 'filled' && shift.assigned_to && (
          <div className="mt-3 pt-3 border-t space-y-3" style={{ borderColor: 'var(--cream)' }}>
            <ClockInButton shift={shift} />
            <ShiftChatButton 
              shift={shift} 
              size="sm" 
              variant="outline"
              className="w-full"
            />
          </div>
        )}

        {shift.status === 'completed' && (
          <div className="mt-3 pt-3 border-t" style={{ borderColor: 'var(--cream)' }}>
            {hasReviewed ? (
              <div className="flex items-center gap-2 p-3 rounded-lg text-sm" style={{ backgroundColor: '#8A9B8E15', color: 'var(--sage)' }}>
                <CheckCircle className="w-4 h-4" />
                Review submitted
              </div>
            ) : (
              <Button
                onClick={() => setShowReviewModal(true)}
                variant="outline"
                className="w-full rounded-xl font-normal flex items-center gap-2"
                style={{ borderColor: 'var(--terracotta)', color: 'var(--terracotta)' }}
              >
                <Star className="w-4 h-4" />
                Review {shift.venue_name}
              </Button>
            )}
          </div>
        )}
      </CardContent>

      {showReviewModal && (
        <ReviewVenueModal shift={shift} onClose={() => setShowReviewModal(false)} />
      )}
    </Card>
  );
}