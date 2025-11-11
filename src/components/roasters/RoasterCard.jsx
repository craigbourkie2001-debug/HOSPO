import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, MessageSquare } from "lucide-react";

export default function RoasterCard({ roaster, onClick }) {
  return (
    <Card 
      className="overflow-hidden transition-all duration-300 hover:shadow-xl cursor-pointer group border-2 rounded-2xl" 
      style={{ borderColor: 'var(--latte)', backgroundColor: 'white' }}
      onClick={onClick}
    >
      <div className="h-40 bg-gradient-to-br overflow-hidden relative" style={{ background: 'linear-gradient(135deg, #8B4513, var(--coffee-brown))' }}>
        {roaster.logo_url ? (
          <img src={roaster.logo_url} alt={roaster.name} className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-6xl font-bold text-white/20">
              {roaster.name?.[0]?.toUpperCase()}
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      </div>

      <CardHeader className="pb-3">
        <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--espresso)' }}>
          {roaster.name}
        </h3>
        
        <div className="flex items-center gap-2 text-sm mb-3" style={{ color: 'var(--coffee-brown)' }}>
          <MapPin className="w-4 h-4" />
          {roaster.location}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Star className="w-5 h-5 fill-current" style={{ color: 'var(--fresh-green)' }} />
            <span className="font-bold" style={{ color: 'var(--espresso)' }}>
              {roaster.average_rating > 0 ? roaster.average_rating.toFixed(1) : 'New'}
            </span>
          </div>
          <div className="flex items-center gap-1 text-sm" style={{ color: 'var(--coffee-brown)' }}>
            <MessageSquare className="w-4 h-4" />
            {roaster.total_reviews || 0} reviews
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {roaster.description && (
          <p className="text-sm mb-3 line-clamp-2" style={{ color: 'var(--coffee-brown)' }}>
            {roaster.description}
          </p>
        )}

        {roaster.roast_style && roaster.roast_style.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {roaster.roast_style.map((style, idx) => (
              <Badge 
                key={idx}
                variant="secondary"
                className="text-xs"
                style={{ backgroundColor: 'var(--latte)', color: 'var(--coffee-brown)' }}
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