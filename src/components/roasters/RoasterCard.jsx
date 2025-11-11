import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, MessageSquare, Award } from "lucide-react";

export default function RoasterCard({ roaster, onClick }) {
  return (
    <Card 
      className="overflow-hidden transition-all duration-300 hover:shadow-2xl cursor-pointer group border-0 rounded-3xl hover:-translate-y-2" 
      onClick={onClick}
    >
      <div className="h-48 bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 overflow-hidden relative">
        {roaster.logo_url ? (
          <img src={roaster.logo_url} alt={roaster.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Award className="w-24 h-24 text-white/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute top-4 right-4">
          <div className="px-4 py-2 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 shadow-xl">
            <div className="flex items-center gap-1.5">
              <Star className="w-5 h-5 fill-current text-yellow-300" />
              <span className="font-bold text-white text-lg">
                {roaster.average_rating > 0 ? roaster.average_rating.toFixed(1) : 'New'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <CardHeader className="pb-3 bg-gradient-to-br from-amber-50 to-orange-50">
        <h3 className="text-2xl font-bold mb-2 text-gray-900">
          {roaster.name}
        </h3>
        
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
          <MapPin className="w-4 h-4 text-amber-500" />
          {roaster.location}
        </div>

        <div className="flex items-center gap-3">
          <Badge className="bg-white border-0 shadow-md text-gray-700">
            <MessageSquare className="w-3 h-3 mr-1 text-amber-500" />
            {roaster.total_reviews || 0} reviews
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        {roaster.description && (
          <p className="text-sm mb-3 line-clamp-2 text-gray-600">
            {roaster.description}
          </p>
        )}

        {roaster.roast_style && roaster.roast_style.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {roaster.roast_style.map((style, idx) => {
              const styleGradients = {
                light: 'from-yellow-400 to-amber-500',
                medium: 'from-orange-400 to-amber-600',
                dark: 'from-amber-600 to-orange-700',
                omni: 'from-purple-400 to-pink-500'
              };
              return (
                <Badge 
                  key={idx}
                  className={`text-xs bg-gradient-to-r ${styleGradients[style] || 'from-gray-400 to-gray-500'} text-white border-0 shadow-md`}
                >
                  {style} roast
                </Badge>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}