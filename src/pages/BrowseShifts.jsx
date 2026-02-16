import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Coffee, ChefHat } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ShiftCard from "../components/shifts/ShiftCard";
import ShiftFilters from "../components/shifts/ShiftFilters";
import ApplyModal from "../components/shifts/ApplyModal";
import RecommendedShifts from "../components/matching/RecommendedShifts";

export default function BrowseShifts() {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [filters, setFilters] = useState({ location: "all", date: "all", skills: [] });
  const [selectedShift, setSelectedShift] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullStart, setPullStart] = useState(0);
  const [pullDistance, setPullDistance] = useState(0);

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const handlePullStart = (e) => {
    if (window.scrollY === 0) {
      setPullStart(e.touches[0].clientY);
    }
  };

  const handlePullMove = (e) => {
    if (pullStart > 0) {
      const distance = e.touches[0].clientY - pullStart;
      if (distance > 0) {
        setPullDistance(Math.min(distance, 80));
      }
    }
  };

  const queryClient = useQueryClient();

  const handlePullEnd = async () => {
    if (pullDistance > 60) {
      setIsRefreshing(true);
      await queryClient.invalidateQueries({ queryKey: ['shifts'] });
      await queryClient.invalidateQueries({ queryKey: ['availableShiftsForMatching'] });
      setTimeout(() => setIsRefreshing(false), 500);
    }
    setPullStart(0);
    setPullDistance(0);
  };

  const { data: shifts, isLoading } = useQuery({
    queryKey: ['shifts'],
    queryFn: async () => {
      const available = await base44.entities.Shift.filter({ status: 'available' }, '-created_date');
      const applicationsOpen = await base44.entities.Shift.filter({ status: 'applications_open' }, '-created_date');
      return [...available, ...applicationsOpen];
    },
    initialData: [],
  });

  const filteredShifts = shifts.filter(shift => {
    const venueName = shift.venue_name || shift.coffee_shop_name || '';
    const matchesSearch = venueName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         shift.location?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = filters.location === "all" || shift.location === filters.location;
    const matchesDate = filters.date === "all" || shift.date === filters.date;
    const matchesSkills = filters.skills.length === 0 || 
                         filters.skills.some(skill => shift.skills_required?.includes(skill));
    const matchesRole = roleFilter === "all" || shift.role_type === roleFilter;
    
    return matchesSearch && matchesLocation && matchesDate && matchesSkills && matchesRole;
  });

  const availableLocations = [...new Set(shifts.map(s => s.location).filter(Boolean))];
  const baristaCount = shifts.filter(s => s.role_type !== 'chef').length;
  const chefCount = shifts.filter(s => s.role_type === 'chef').length;

  return (
    <div 
      className="min-h-screen p-6 md:p-12" 
      style={{ backgroundColor: 'var(--cream)' }}
      onTouchStart={handlePullStart}
      onTouchMove={handlePullMove}
      onTouchEnd={handlePullEnd}
    >
      {/* Pull to Refresh Indicator */}
      {pullDistance > 0 && (
        <div 
          className="fixed top-0 left-0 right-0 flex items-center justify-center transition-all z-50"
          style={{ 
            height: pullDistance,
            opacity: pullDistance / 60,
            backgroundColor: 'var(--warm-white)'
          }}
        >
          <div 
            className={`${isRefreshing ? 'animate-spin' : ''}`}
            style={{ 
              width: 24, 
              height: 24, 
              border: '2px solid var(--sand)', 
              borderTopColor: 'var(--terracotta)',
              borderRadius: '50%'
            }}
          />
        </div>
      )}
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl md:text-6xl font-light mb-3 tracking-tight" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
            Available Shifts
          </h1>
          <p className="text-lg font-light tracking-wide" style={{ color: 'var(--clay)' }}>
            Find your next opportunity in Irish hospitality
          </p>
        </div>

        {/* Role Tabs */}
        <Tabs value={roleFilter} onValueChange={setRoleFilter} className="mb-6">
          <TabsList className="grid grid-cols-3 w-full md:w-auto md:inline-grid p-1.5 rounded-2xl h-auto" style={{ backgroundColor: 'var(--sand)' }}>
            <TabsTrigger 
              value="all" 
              className="rounded-xl py-3 px-6 font-normal tracking-wide data-[state=active]:bg-white transition-all"
              style={{ color: 'var(--earth)' }}
            >
              All Shifts ({shifts.length})
            </TabsTrigger>
            <TabsTrigger 
              value="barista" 
              className="rounded-xl py-3 px-6 font-normal tracking-wide data-[state=active]:bg-white transition-all flex items-center gap-2"
              style={{ color: 'var(--earth)' }}
            >
              <Coffee className="w-4 h-4" />
              Barista ({baristaCount})
            </TabsTrigger>
            <TabsTrigger 
              value="chef" 
              className="rounded-xl py-3 px-6 font-normal tracking-wide data-[state=active]:bg-white transition-all flex items-center gap-2"
              style={{ color: 'var(--earth)' }}
            >
              <ChefHat className="w-4 h-4" />
              Chef ({chefCount})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* AI Recommendations */}
        <RecommendedShifts user={user} onApply={setSelectedShift} />

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: 'var(--clay)', strokeWidth: 1.5 }} />
            <Input
              placeholder="Search by venue or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-14 h-14 rounded-2xl border text-base"
              style={{ 
                borderColor: 'var(--sand)',
                backgroundColor: 'var(--warm-white)',
                color: 'var(--earth)'
              }}
            />
          </div>
        </div>

        {/* Filters */}
        <ShiftFilters 
          filters={filters}
          setFilters={setFilters}
          availableLocations={availableLocations}
          shifts={shifts}
          roleFilter={roleFilter}
        />

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl hover-lift"
            style={{ backgroundColor: 'var(--warm-white)', border: '1px solid var(--sand)' }}
          >
            <div className="text-4xl font-light mb-2" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
              {filteredShifts.length}
            </div>
            <div className="text-xs tracking-wider" style={{ color: 'var(--clay)' }}>AVAILABLE SHIFTS</div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-2xl hover-lift"
            style={{ backgroundColor: 'var(--terracotta)', color: 'white' }}
          >
            <div className="text-4xl font-light mb-2" style={{ fontFamily: 'Crimson Pro, serif' }}>
              €{Math.round(shifts.reduce((sum, s) => sum + (s.hourly_rate || 0), 0) / (shifts.length || 1))}
            </div>
            <div className="text-xs tracking-wider opacity-90">AVG. HOURLY RATE</div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-2xl hover-lift"
            style={{ backgroundColor: 'var(--warm-white)', border: '1px solid var(--sand)' }}
          >
            <div className="text-4xl font-light mb-2" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
              {availableLocations.length}
            </div>
            <div className="text-xs tracking-wider" style={{ color: 'var(--clay)' }}>LOCATIONS</div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 rounded-2xl hover-lift"
            style={{ backgroundColor: 'var(--sage)', color: 'white' }}
          >
            <div className="text-4xl font-light mb-2" style={{ fontFamily: 'Crimson Pro, serif' }}>
              {[...new Set(shifts.map(s => s.coffee_shop_id))].length}
            </div>
            <div className="text-xs tracking-wider opacity-90">COFFEE SHOPS</div>
          </motion.div>
        </div>

        {/* Shifts Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-96 rounded-2xl animate-pulse" style={{ backgroundColor: 'var(--sand)' }} />
            ))}
          </div>
        ) : filteredShifts.length === 0 ? (
          <div className="text-center py-24 rounded-2xl" style={{ backgroundColor: 'var(--warm-white)', border: '1px solid var(--sand)' }}>
            <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ backgroundColor: 'var(--sand)' }}>
              <Search className="w-10 h-10" style={{ color: 'var(--clay)', strokeWidth: 1.5 }} />
            </div>
            <h3 className="text-2xl font-light mb-2" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
              No shifts found
            </h3>
            <p className="font-light" style={{ color: 'var(--clay)' }}>
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
                    onApply={() => setSelectedShift(shift)}
                  />
                </motion.div>
                ))}
                </AnimatePresence>
                </div>
                )}

                {selectedShift && (
                <ApplyModal 
                shift={selectedShift} 
                onClose={() => setSelectedShift(null)} 
                />
                )}
                </div>
                </div>
                );
}