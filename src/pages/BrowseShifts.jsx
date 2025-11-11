import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Calendar, Clock, Euro, Sparkles, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import ShiftCard from "../components/shifts/ShiftCard";
import ShiftFilters from "../components/shifts/ShiftFilters";

export default function BrowseShifts() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({ location: "all", date: "all", skills: [] });
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: shifts, isLoading } = useQuery({
    queryKey: ['shifts'],
    queryFn: () => base44.entities.Shift.filter({ status: 'available' }, '-created_date'),
    initialData: [],
  });

  const claimShiftMutation = useMutation({
    mutationFn: async (shift) => {
      await base44.entities.Shift.update(shift.id, {
        status: 'claimed',
        claimed_by: user.email,
        claimed_at: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
      queryClient.invalidateQueries({ queryKey: ['myShifts'] });
    },
  });

  const filteredShifts = shifts.filter(shift => {
    const matchesSearch = shift.coffee_shop_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         shift.location?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = filters.location === "all" || shift.location === filters.location;
    const matchesDate = filters.date === "all" || shift.date === filters.date;
    const matchesSkills = filters.skills.length === 0 || 
                         filters.skills.some(skill => shift.skills_required?.includes(skill));
    
    return matchesSearch && matchesLocation && matchesDate && matchesSkills;
  });

  const availableLocations = [...new Set(shifts.map(s => s.location).filter(Boolean))];

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center shadow-2xl">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
                Available Shifts
              </h1>
              <p className="text-lg text-gray-600 mt-1">
                Find your next specialty coffee shift in Ireland ☕
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 w-6 h-6 text-purple-400" />
            <Input
              placeholder="Search by coffee shop or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-14 h-16 rounded-3xl border-0 text-lg shadow-xl bg-white focus:shadow-2xl transition-all duration-300"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="px-4 py-2 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-semibold">
                {filteredShifts.length} shifts
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <ShiftFilters 
          filters={filters}
          setFilters={setFilters}
          availableLocations={availableLocations}
          shifts={shifts}
        />

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-3xl shadow-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white"
          >
            <div className="text-4xl font-bold mb-2">
              {filteredShifts.length}
            </div>
            <div className="text-sm text-purple-100">Available Shifts</div>
            <Sparkles className="w-8 h-8 absolute top-4 right-4 opacity-20" />
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-3xl shadow-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white"
          >
            <div className="text-4xl font-bold mb-2">
              €{Math.round(shifts.reduce((sum, s) => sum + (s.hourly_rate || 0), 0) / (shifts.length || 1))}
            </div>
            <div className="text-sm text-green-100">Avg. Hourly Rate</div>
            <TrendingUp className="w-8 h-8 absolute top-4 right-4 opacity-20" />
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-3xl shadow-xl bg-gradient-to-br from-orange-500 to-red-600 text-white"
          >
            <div className="text-4xl font-bold mb-2">
              {availableLocations.length}
            </div>
            <div className="text-sm text-orange-100">Locations</div>
            <MapPin className="w-8 h-8 absolute top-4 right-4 opacity-20" />
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 rounded-3xl shadow-xl bg-gradient-to-br from-blue-500 to-cyan-600 text-white"
          >
            <div className="text-4xl font-bold mb-2">
              {[...new Set(shifts.map(s => s.coffee_shop_id))].length}
            </div>
            <div className="text-sm text-blue-100">Coffee Shops</div>
            <Clock className="w-8 h-8 absolute top-4 right-4 opacity-20" />
          </motion.div>
        </div>

        {/* Shifts Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-96 rounded-3xl animate-pulse bg-gradient-to-br from-purple-200 to-pink-200" />
            ))}
          </div>
        ) : filteredShifts.length === 0 ? (
          <div className="text-center py-20 rounded-3xl bg-white shadow-xl">
            <div className="w-24 h-24 rounded-full mx-auto mb-4 bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <Search className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-3xl font-bold mb-2 text-gray-900">
              No shifts found
            </h3>
            <p className="text-gray-600">
              Try adjusting your filters or check back later
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="wait">
              {filteredShifts.map((shift, index) => (
                <motion.div
                  key={shift.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ShiftCard 
                    shift={shift} 
                    onClaim={() => claimShiftMutation.mutate(shift)}
                    isLoading={claimShiftMutation.isPending}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}