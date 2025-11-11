import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Search, Calendar, MapPin, Users, Sparkles, Clock, Euro } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import EventCard from "../components/events/EventCard";

export default function Events() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: events, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: () => base44.entities.Event.list('date'),
    initialData: [],
  });

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const isFuture = new Date(event.date) >= new Date();
    return matchesSearch && isFuture;
  });

  const upcomingEvents = filteredEvents.filter(e => new Date(e.date) >= new Date());
  const freeEvents = upcomingEvents.filter(e => e.price === 0);

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center shadow-2xl">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Coffee Events
              </h1>
              <p className="text-lg text-gray-600 mt-1">
                Workshops, tastings, and community meetups 🎉
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 w-6 h-6 text-purple-400" />
            <Input
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-14 h-16 rounded-3xl border-0 text-lg shadow-xl bg-white focus:shadow-2xl transition-all duration-300"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-3xl shadow-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white relative overflow-hidden"
          >
            <div className="text-4xl font-bold mb-2">{upcomingEvents.length}</div>
            <div className="text-sm text-indigo-100">Upcoming Events</div>
            <Calendar className="w-12 h-12 absolute -right-2 -bottom-2 opacity-20" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-3xl shadow-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white relative overflow-hidden"
          >
            <div className="text-4xl font-bold mb-2">{freeEvents.length}</div>
            <div className="text-sm text-green-100">Free Events</div>
            <Sparkles className="w-12 h-12 absolute -right-2 -bottom-2 opacity-20" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-3xl shadow-xl bg-gradient-to-br from-pink-500 to-rose-600 text-white col-span-2 md:col-span-1 relative overflow-hidden"
          >
            <div className="text-4xl font-bold mb-2">
              {events.reduce((sum, e) => sum + (e.capacity || 0), 0)}
            </div>
            <div className="text-sm text-pink-100">Total Capacity</div>
            <Users className="w-12 h-12 absolute -right-2 -bottom-2 opacity-20" />
          </motion.div>
        </div>

        {/* Events List */}
        {isLoading ? (
          <div className="space-y-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-48 rounded-3xl animate-pulse bg-gradient-to-br from-purple-200 to-pink-200" />
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-20 rounded-3xl bg-white shadow-xl">
            <Calendar className="w-24 h-24 mx-auto mb-4 text-purple-300" />
            <h3 className="text-3xl font-bold mb-2 text-gray-900">
              No upcoming events
            </h3>
            <p className="text-gray-600">Check back soon for new workshops and meetups</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <EventCard event={event} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}