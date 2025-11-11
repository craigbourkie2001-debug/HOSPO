import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Clock, Users, Euro, Award } from "lucide-react";
import { format } from "date-fns";

export default function EventCard({ event }) {
  const eventTypeGradients = {
    workshop: 'from-blue-500 to-cyan-600',
    cupping: 'from-purple-500 to-pink-600',
    competition: 'from-orange-500 to-red-600',
    meetup: 'from-green-500 to-emerald-600',
    tasting: 'from-amber-500 to-orange-600',
    masterclass: 'from-indigo-500 to-purple-600'
  };

  const spotsRemaining = (event.capacity || 0) - (event.registered_count || 0);
  const isAlmostFull = spotsRemaining <= 5 && spotsRemaining > 0;

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-2xl border-0 rounded-3xl bg-white">
      <div className="md:flex">
        {/* Image/Gradient Section */}
        <div className={`md:w-1/3 h-64 md:h-auto bg-gradient-to-br ${eventTypeGradients[event.event_type] || 'from-gray-400 to-gray-600'} relative flex items-center justify-center`}>
          {event.image_url ? (
            <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
          ) : (
            <Award className="w-24 h-24 text-white/30" />
          )}
          <div className="absolute top-4 left-4">
            <Badge className={`bg-white/20 backdrop-blur-md border border-white/30 text-white font-semibold px-4 py-2 text-sm shadow-xl`}>
              {event.event_type.replace(/_/g, ' ').toUpperCase()}
            </Badge>
          </div>
          {event.price === 0 && (
            <div className="absolute top-4 right-4">
              <Badge className="bg-green-500 text-white font-bold px-4 py-2 shadow-xl">
                FREE
              </Badge>
            </div>
          )}
        </div>

        {/* Content Section */}
        <CardContent className="md:w-2/3 p-6 md:p-8">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                {event.title}
              </h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {event.description}
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-400 to-cyan-500 flex items-center justify-center shadow-md">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-xs text-gray-500">Date</div>
                <div className="font-semibold text-gray-900">
                  {format(new Date(event.date), 'EEE, MMM d, yyyy')}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-purple-400 to-pink-500 flex items-center justify-center shadow-md">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-xs text-gray-500">Time</div>
                <div className="font-semibold text-gray-900">
                  {event.start_time} - {event.end_time}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-orange-400 to-red-500 flex items-center justify-center shadow-md">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-xs text-gray-500">Location</div>
                <div className="font-semibold text-gray-900 line-clamp-1">
                  {event.location}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center shadow-md">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-xs text-gray-500">Capacity</div>
                <div className="font-semibold text-gray-900">
                  {event.registered_count || 0} / {event.capacity || '∞'}
                  {isAlmostFull && (
                    <span className="ml-2 text-xs text-orange-600 font-bold">
                      Almost Full!
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              {event.price > 0 && (
                <div className="flex items-center gap-2">
                  <Euro className="w-5 h-5 text-green-600" />
                  <span className="text-3xl font-bold text-gray-900">
                    €{event.price.toFixed(2)}
                  </span>
                </div>
              )}
              {event.skill_level && (
                <Badge variant="secondary" className="mt-2 bg-purple-100 text-purple-700">
                  {event.skill_level} level
                </Badge>
              )}
            </div>
            <Button 
              className={`rounded-2xl px-8 py-6 font-bold text-lg bg-gradient-to-r ${eventTypeGradients[event.event_type]} text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}
              disabled={spotsRemaining === 0}
            >
              {spotsRemaining === 0 ? 'Sold Out' : 'Register Now'}
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}