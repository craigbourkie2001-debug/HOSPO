import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, MessageSquare, Award } from "lucide-react";

export default function RoasterCard({ roaster, onClick }) {
  return (
    <Card 
      className="overflow-hidden transition-all duration-300 hover:-translate-y-1 cursor-pointer border rounded-2xl hover-lift" 
      style={{ borderColor: 'var(--sand)', backgroundColor: 'var(--warm-white)' }}
      onClick={onClick}
    >
      <div className="h-48 overflow-hidden relative" style={{ backgroundColor: 'var(--clay)' }}>
        {roaster.logo_url ? (
          <img src={roaster.logo_url} alt={roaster.name} className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Award className="w-16 h-16 text-white/40" style={{ strokeWidth: 1 }} />
          </div>
        )}
        {roaster.average_rating > 0 && (
          <div className="absolute top-4 right-4">
            <div className="px-4 py-2 rounded-xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 fill-current" style={{ color: 'var(--terracotta)' }} />
                <span className="font-light" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
                  {roaster.average_rating.toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <CardHeader className="pb-3">
        <h3 className="text-xl font-normal mb-2" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
          {roaster.name}
        </h3>
        
        <div className="flex items-center gap-2 text-sm font-light mb-3" style={{ color: 'var(--clay)' }}>
          <MapPin className="w-4 h-4" style={{ strokeWidth: 1.5 }} />
          {roaster.location}
        </div>

        <div className="flex items-center gap-3">
          <Badge className="border-0 font-normal" style={{ backgroundColor: 'var(--sand)', color: 'var(--earth)' }}>
            <MessageSquare className="w-3 h-3 mr-1" style={{ strokeWidth: 1.5 }} />
            {roaster.total_reviews || 0} reviews
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        {roaster.description && (
          <p className="text-sm mb-3 line-clamp-2 font-light" style={{ color: 'var(--clay)' }}>
            {roaster.description}
          </p>
        )}

        {roaster.roast_style && roaster.roast_style.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {roaster.roast_style.map((style, idx) => (
              <Badge 
                key={idx}
                variant="outline"
                className="text-xs font-normal"
                style={{ borderColor: 'var(--sand)', color: 'var(--clay)' }}
              >
                {style} roast
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}