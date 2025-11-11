import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, User, CheckCircle } from "lucide-react";
import { format } from "date-fns";

export default function ReviewCard({ review }) {
  return (
    <Card className="border-2 rounded-2xl" style={{ borderColor: 'var(--latte)', backgroundColor: 'white' }}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold" style={{ backgroundColor: 'var(--coffee-brown)' }}>
              {review.reviewer_name?.[0]?.toUpperCase() || 'A'}
            </div>
            <div>
              <div className="font-semibold flex items-center gap-2" style={{ color: 'var(--espresso)' }}>
                {review.reviewer_name || 'Anonymous'}
                {review.verified_worker && (
                  <Badge className="text-xs bg-green-100 text-green-800 border-green-200">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified Worker
                  </Badge>
                )}
              </div>
              <div className="text-xs" style={{ color: 'var(--coffee-brown)' }}>
                {format(new Date(review.created_date), 'MMM d, yyyy')}
                {review.work_duration && ` • Worked here: ${review.work_duration.replace(/_/g, ' ')}`}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-current" style={{ color: 'var(--fresh-green)' }} />
            <span className="font-bold" style={{ color: 'var(--espresso)' }}>{review.rating}</span>
          </div>
        </div>

        {review.title && (
          <h4 className="font-semibold mb-2" style={{ color: 'var(--espresso)' }}>
            {review.title}
          </h4>
        )}

        <p className="text-sm mb-3" style={{ color: 'var(--coffee-brown)' }}>
          {review.content}
        </p>

        {(review.pros?.length > 0 || review.cons?.length > 0) && (
          <div className="grid md:grid-cols-2 gap-3 mt-4 pt-4 border-t" style={{ borderColor: 'var(--latte)' }}>
            {review.pros?.length > 0 && (
              <div>
                <div className="text-xs font-semibold mb-2" style={{ color: 'var(--fresh-green)' }}>
                  👍 Pros
                </div>
                <ul className="text-sm space-y-1" style={{ color: 'var(--coffee-brown)' }}>
                  {review.pros.map((pro, idx) => (
                    <li key={idx}>• {pro}</li>
                  ))}
                </ul>
              </div>
            )}
            {review.cons?.length > 0 && (
              <div>
                <div className="text-xs font-semibold mb-2" style={{ color: '#D97706' }}>
                  👎 Cons
                </div>
                <ul className="text-sm space-y-1" style={{ color: 'var(--coffee-brown)' }}>
                  {review.cons.map((con, idx) => (
                    <li key={idx}>• {con}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}