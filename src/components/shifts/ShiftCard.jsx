import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Clock, Euro, Award, Sparkles } from "lucide-react";
import { format } from "date-fns";

export default function ShiftCard({ shift, onClaim, isLoading }) {
  const skillColors = {
    espresso: 'bg-gradient-to-r from-amber-400 to-orange-500 text-white',
    latte_art: 'bg-gradient-to-r from-pink-400 to-rose-500 text-white',
    filter: 'bg-gradient-to-r from-blue-400 to-cyan-500 text-white',
    customer_service: 'bg-gradient-to-r from-green-400 to-emerald-500 text-white',
    opening: 'bg-gradient-to-r from-purple-400 to-indigo-500 text-white',
    closing: 'bg-gradient-to-r from-indigo-400 to-blue-500 text-white',
    cash_handling: 'bg-gradient-to-r from-emerald-400 to-teal-500 text-white'
  };

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 group border-0 rounded-3xl bg-white">
      <div className="h-3 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500" />
      
      <CardHeader className="pb-3 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                <Store className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                {shift.coffee_shop_name}
              </h3>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4 text-purple-500" />
              {shift.location}
            </div>
          </div>
          <div className="text-right">
            <div className="px-4 py-2 rounded-2xl bg-gradient-to-r from-green-400 to-emerald-500 shadow-lg">
              <div className="text-2xl font-bold text-white">
                €{shift.hourly_rate}
              </div>
              <div className="text-xs text-white/90">per hour</div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge className="flex items-center gap-1 bg-white/80 text-gray-700 border-0 shadow-sm">
            <Calendar className="w-3 h-3 text-purple-500" />
            {format(new Date(shift.date), 'EEE, MMM d')}
          </Badge>
          <Badge className="flex items-center gap-1 bg-white/80 text-gray-700 border-0 shadow-sm">
            <Clock className="w-3 h-3 text-pink-500" />
            {shift.start_time} - {shift.end_time}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {shift.description && (
          <p className="text-sm mb-4 line-clamp-2 text-gray-600">
            {shift.description}
          </p>
        )}

        {shift.skills_required && shift.skills_required.length > 0 && (
          <div className="mb-4">
            <div className="text-xs font-semibold mb-2 flex items-center gap-1 text-gray-700">
              <Sparkles className="w-3 h-3 text-purple-500" />
              Skills Required
            </div>
            <div className="flex flex-wrap gap-1.5">
              {shift.skills_required.map((skill, idx) => (
                <Badge 
                  key={idx} 
                  className={`text-xs border-0 shadow-md ${skillColors[skill] || 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'}`}
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
          className="w-full rounded-2xl font-bold text-lg py-6 transition-all duration-300 hover:shadow-2xl hover:scale-105 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 text-white border-0"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Claiming...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Claim This Shift
            </span>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

// Missing import
import { Store } from "lucide-react";