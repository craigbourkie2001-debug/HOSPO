import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Clock, Users, Award } from "lucide-react";
import { format } from "date-fns";

export default function EventCard({ event }) {
  const spotsRemaining = (event.capacity || 0) - (event.registered_count || 0);
  const isAlmostFull = spotsRemaining <= 5 && spotsRemaining > 0;

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:-translate-y-1 border rounded-2xl hover-lift" style={{ borderColor: 'var(--sand)', backgroundColor: 'var(--warm-white)' }}>
      <div className="md:flex">
        <div className="md:w-1/3 h-64 md:h-auto relative flex items-center justify-center" style={{ backgroundColor: 'var(--sand)' }}>
          {event.image_url ? (
            <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
          ) : (
            <Award className="w-20 h-20" style={{ color: 'var(--clay)', strokeWidth: 1 }} />
          )}
          <div className="absolute top-4 left-4">
            <Badge className="border-0 font-normal tracking-wide px-4 py-2" style={{ backgroundColor: 'var(--terracotta)', color: 'white' }}>
              {event.event_type.replace(/_/g, ' ').toUpperCase()}
            </Badge>
          </div>
          {event.price === 0 && (
            <div className="absolute top-4 right-4">
              <Badge className="border-0 font-normal px-4 py-2" style={{ backgroundColor: 'var(--sage)', color: 'white' }}>
                FREE
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="md:w-2/3 p-6 md:p-8">
          <div className="mb-6">
            <h3 className="text-2xl md:text-3xl font-normal mb-2" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
              {event.title}
            </h3>
            <p className="font-light text-sm line-clamp-2" style={{ color: 'var(--clay)' }}>
              {event.description}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--sand)' }}>
                <Calendar className="w-5 h-5" style={{ color: 'var(--earth)', strokeWidth: 1.5 }} />
              </div>
              <div>
                <div className="text-xs font-light tracking-wide" style={{ color: 'var(--clay)' }}>DATE</div>
                <div className="font-normal" style={{ color: 'var(--earth)' }}>
                  {format(new Date(event.date), 'EEE, MMM d, yyyy')}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--sand)' }}>
                <Clock className="w-5 h-5" style={{ color: 'var(--earth)', strokeWidth: 1.5 }} />
              </div>
              <div>
                <div className="text-xs font-light tracking-wide" style={{ color: 'var(--clay)' }}>TIME</div>
                <div className="font-normal" style={{ color: 'var(--earth)' }}>
                  {event.start_time} - {event.end_time}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--sand)' }}>
                <MapPin className="w-5 h-5" style={{ color: 'var(--earth)', strokeWidth: 1.5 }} />
              </div>
              <div>
                <div className="text-xs font-light tracking-wide" style={{ color: 'var(--clay)' }}>LOCATION</div>
                <div className="font-normal line-clamp-1" style={{ color: 'var(--earth)' }}>
                  {event.location}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--sand)' }}>
                <Users className="w-5 h-5" style={{ color: 'var(--earth)', strokeWidth: 1.5 }} />
              </div>
              <div>
                <div className="text-xs font-light tracking-wide" style={{ color: 'var(--clay)' }}>CAPACITY</div>
                <div className="font-normal" style={{ color: 'var(--earth)' }}>
                  {event.registered_count || 0} / {event.capacity || '∞'}
                  {isAlmostFull && (
                    <span className="ml-2 text-xs font-normal" style={{ color: 'var(--terracotta)' }}>
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
                <div className="text-3xl font-light" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
                  €{event.price.toFixed(2)}
                </div>
              )}
              {event.skill_level && (
                <Badge variant="secondary" className="mt-2 border-0 font-normal" style={{ backgroundColor: 'var(--sand)', color: 'var(--earth)' }}>
                  {event.skill_level} level
                </Badge>
              )}
            </div>
            <Button 
              className="rounded-xl px-8 py-6 font-normal tracking-wide transition-all hover-lift"
              style={{ backgroundColor: 'var(--terracotta)', color: 'white' }}
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