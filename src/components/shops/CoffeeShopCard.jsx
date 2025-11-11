import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, MessageSquare, Coffee } from "lucide-react";

export default function CoffeeShopCard({ shop, onClick }) {
  return (
    <Card 
      className="overflow-hidden transition-all duration-300 hover:shadow-2xl cursor-pointer group border-0 rounded-3xl hover:-translate-y-2" 
      onClick={onClick}
    >
      <div className="h-48 bg-gradient-to-br from-orange-400 via-red-400 to-pink-500 overflow-hidden relative">
        {shop.logo_url ? (
          <img src={shop.logo_url} alt={shop.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Coffee className="w-24 h-24 text-white/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute top-4 right-4">
          <div className="px-4 py-2 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 shadow-xl">
            <div className="flex items-center gap-1.5">
              <Star className="w-5 h-5 fill-current text-yellow-300" />
              <span className="font-bold text-white text-lg">
                {shop.average_rating > 0 ? shop.average_rating.toFixed(1) : 'New'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <CardHeader className="pb-3 bg-gradient-to-br from-orange-50 to-pink-50">
        <h3 className="text-2xl font-bold mb-2 text-gray-900">
          {shop.name}
        </h3>
        
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
          <MapPin className="w-4 h-4 text-orange-500" />
          {shop.location}
        </div>

        <div className="flex items-center gap-3">
          <Badge className="bg-white border-0 shadow-md text-gray-700">
            <MessageSquare className="w-3 h-3 mr-1 text-orange-500" />
            {shop.total_reviews || 0} reviews
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        {shop.description && (
          <p className="text-sm mb-3 line-clamp-2 text-gray-600">
            {shop.description}
          </p>
        )}

        {shop.specialty_focus && shop.specialty_focus.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {shop.specialty_focus.slice(0, 3).map((specialty, idx) => {
              const gradients = [
                'from-pink-400 to-rose-500',
                'from-orange-400 to-red-500',
                'from-amber-400 to-orange-500',
              ];
              return (
                <Badge 
                  key={idx}
                  className={`text-xs bg-gradient-to-r ${gradients[idx % gradients.length]} text-white border-0 shadow-md`}
                >
                  {specialty.replace(/_/g, ' ')}
                </Badge>
              );
            })}
            {shop.specialty_focus.length > 3 && (
              <Badge className="text-xs bg-gradient-to-r from-purple-400 to-pink-500 text-white border-0 shadow-md">
                +{shop.specialty_focus.length - 3} more
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}