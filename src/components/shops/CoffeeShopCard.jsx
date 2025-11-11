import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, MessageSquare } from "lucide-react";

export default function CoffeeShopCard({ shop, onClick }) {
  return (
    <Card 
      className="overflow-hidden transition-all duration-300 hover:shadow-xl cursor-pointer group border-2 rounded-2xl" 
      style={{ borderColor: 'var(--latte)', backgroundColor: 'white' }}
      onClick={onClick}
    >
      <div className="h-40 bg-gradient-to-br overflow-hidden relative" style={{ background: 'linear-gradient(135deg, var(--cream), var(--latte))' }}>
        {shop.logo_url ? (
          <img src={shop.logo_url} alt={shop.name} className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-6xl font-bold opacity-20" style={{ color: 'var(--coffee-brown)' }}>
              {shop.name?.[0]?.toUpperCase()}
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      </div>

      <CardHeader className="pb-3">
        <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--espresso)' }}>
          {shop.name}
        </h3>
        
        <div className="flex items-center gap-2 text-sm mb-3" style={{ color: 'var(--coffee-brown)' }}>
          <MapPin className="w-4 h-4" />
          {shop.location}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Star className="w-5 h-5 fill-current" style={{ color: 'var(--fresh-green)' }} />
            <span className="font-bold" style={{ color: 'var(--espresso)' }}>
              {shop.average_rating > 0 ? shop.average_rating.toFixed(1) : 'New'}
            </span>
          </div>
          <div className="flex items-center gap-1 text-sm" style={{ color: 'var(--coffee-brown)' }}>
            <MessageSquare className="w-4 h-4" />
            {shop.total_reviews || 0} reviews
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {shop.description && (
          <p className="text-sm mb-3 line-clamp-2" style={{ color: 'var(--coffee-brown)' }}>
            {shop.description}
          </p>
        )}

        {shop.specialty_focus && shop.specialty_focus.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {shop.specialty_focus.slice(0, 3).map((specialty, idx) => (
              <Badge 
                key={idx}
                variant="secondary"
                className="text-xs"
                style={{ backgroundColor: 'var(--latte)', color: 'var(--coffee-brown)' }}
              >
                {specialty.replace(/_/g, ' ')}
              </Badge>
            ))}
            {shop.specialty_focus.length > 3 && (
              <Badge variant="secondary" className="text-xs" style={{ backgroundColor: 'var(--latte)', color: 'var(--coffee-brown)' }}>
                +{shop.specialty_focus.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}