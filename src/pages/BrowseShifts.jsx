import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ShiftCard from "../components/shifts/ShiftCard";
import ShiftFilters from "../components/shifts/ShiftFilters";
import ApplyModal from "../components/shifts/ApplyModal";
import RecommendedShifts from "../components/matching/RecommendedShifts";
import PullToRefresh from "../components/mobile/PullToRefresh";
import HospoLogo from "../components/HospoLogo";
import ProximityFilter from "../components/shifts/ProximityFilter";
import { getShiftDistance } from "../components/shifts/geoUtils";

export default function BrowseShifts() {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [filters, setFilters] = useState({ 
    location: "all", 
    date: "all", 
    skills: [], 
    payRate: { min: 0, max: 999 },
    shiftTime: "all",
    chefLevel: "all"
  });
  const [selectedShift, setSelectedShift] = useState(null);
  const [mobileDisplayCount, setMobileDisplayCount] = useState(12);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [userLocation, setUserLocation] = useState(null);
  const [proximityKm, setProximityKm] = useState(10);

  const queryClient = useQueryClient();

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['shifts'] });
    await queryClient.invalidateQueries({ queryKey: ['availableShiftsForMatching'] });
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
    const matchesPayRate = shift.hourly_rate >= filters.payRate.min && shift.hourly_rate <= filters.payRate.max;
    
    // Shift time filter (morning, afternoon, evening)
    const matchesShiftTime = filters.shiftTime === "all" || (() => {
      const startHour = parseInt(shift.start_time?.split(':')[0] || '0');
      if (filters.shiftTime === "morning") return startHour >= 5 && startHour < 12;
      if (filters.shiftTime === "afternoon") return startHour >= 12 && startHour < 17;
      if (filters.shiftTime === "evening") return startHour >= 17;
      return true;
    })();
    
    // Chef level filter
    const matchesChefLevel = filters.chefLevel === "all" || 
                            shift.chef_level === filters.chefLevel ||
                            shift.role_type !== 'chef';
    
    // Proximity filter
    const shiftDistance = getShiftDistance(shift, userLocation);
    const matchesProximity = !userLocation || (shiftDistance !== null && shiftDistance <= proximityKm);

    return matchesSearch && matchesLocation && matchesDate && matchesSkills && matchesRole && 
           matchesPayRate && matchesShiftTime && matchesChefLevel && matchesProximity;
  });

  const displayedShifts = isMobile ? filteredShifts.slice(0, mobileDisplayCount) : filteredShifts;
  const hasMore = isMobile && filteredShifts.length > mobileDisplayCount;

  const availableLocations = [...new Set(shifts.map(s => s.location).filter(Boolean))];
  const roleCounts = {
    barista: shifts.filter(s => s.role_type === 'barista').length,
    bartender: shifts.filter(s => s.role_type === 'bartender').length,
    mixologist: shifts.filter(s => s.role_type === 'mixologist').length,
    chef: shifts.filter(s => s.role_type === 'chef').length,
    waiter: shifts.filter(s => s.role_type === 'waiter').length,
  };

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="min-h-screen p-6 md:p-12" style={{ backgroundColor: 'var(--cream)' }}>
        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10 flex items-start justify-between">
          <div>
            <div className="mb-4">
              <HospoLogo size="md" />
            </div>
            <h1 className="text-5xl md:text-6xl font-light mb-3 tracking-tight" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
              Available Shifts
            </h1>
            <p className="text-lg font-light tracking-wide" style={{ color: 'var(--clay)' }}>
              Find your next opportunity in Irish hospitality
            </p>
          </div>
        </div>

        {/* Role Tabs */}
        <Tabs value={roleFilter} onValueChange={setRoleFilter} className="mb-6">
          <TabsList className="flex flex-wrap w-full p-1.5 rounded-2xl h-auto gap-1" style={{ backgroundColor: 'var(--sand)' }}>
            {[
              { value: 'all', label: `All (${shifts.length})` },
              { value: 'barista', label: `Barista (${roleCounts.barista})` },
              { value: 'bartender', label: `Bartender (${roleCounts.bartender})` },
              { value: 'mixologist', label: `Mixologist (${roleCounts.mixologist})` },
              { value: 'chef', label: `Chef (${roleCounts.chef})` },
              { value: 'waiter', label: `Waiter (${roleCounts.waiter})` },
            ].map(tab => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="rounded-xl py-2.5 px-4 font-normal text-sm tracking-wide data-[state=active]:bg-white transition-all"
                style={{ color: 'var(--earth)' }}
              >
                {tab.label}
              </TabsTrigger>
            ))}
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
          <div 
            className="p-6 rounded-2xl"
            style={{ backgroundColor: 'var(--warm-white)', border: '1px solid var(--sand)' }}
          >
            <div className="text-4xl font-light mb-2" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
              {filteredShifts.length}
            </div>
            <div className="text-xs tracking-wider" style={{ color: 'var(--clay)' }}>AVAILABLE SHIFTS</div>
          </div>
          
          <div 
            className="p-6 rounded-2xl"
            style={{ backgroundColor: 'var(--terracotta)', color: 'white' }}
          >
            <div className="text-4xl font-light mb-2" style={{ fontFamily: 'Crimson Pro, serif' }}>
              €{Math.round(shifts.reduce((sum, s) => sum + (s.hourly_rate || 0), 0) / (shifts.length || 1))}
            </div>
            <div className="text-xs tracking-wider opacity-90">AVG. HOURLY RATE</div>
          </div>
          
          <div 
            className="p-6 rounded-2xl"
            style={{ backgroundColor: 'var(--warm-white)', border: '1px solid var(--sand)' }}
          >
            <div className="text-4xl font-light mb-2" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
              {availableLocations.length}
            </div>
            <div className="text-xs tracking-wider" style={{ color: 'var(--clay)' }}>LOCATIONS</div>
          </div>
          
          <div 
            className="p-6 rounded-2xl"
            style={{ backgroundColor: 'var(--sage)', color: 'white' }}
          >
            <div className="text-4xl font-light mb-2" style={{ fontFamily: 'Crimson Pro, serif' }}>
              {[...new Set(shifts.map(s => s.coffee_shop_id))].length}
            </div>
            <div className="text-xs tracking-wider opacity-90">COFFEE SHOPS</div>
          </div>
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
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedShifts.map((shift) => (
                <ShiftCard 
                  key={shift.id}
                  shift={shift} 
                  onApply={() => setSelectedShift(shift)}
                />
              ))}
            </div>
            
            {hasMore && (
              <div className="mt-8 flex justify-center">
                <Button
                  onClick={() => setMobileDisplayCount(prev => prev + 12)}
                  className="rounded-xl font-normal tracking-wide px-8"
                  style={{ backgroundColor: 'var(--terracotta)', color: 'white' }}
                >
                  Load More ({filteredShifts.length - mobileDisplayCount} remaining)
                </Button>
              </div>
            )}
          </>
        )}

        {selectedShift && (
          <ApplyModal 
            shift={selectedShift} 
            onClose={() => setSelectedShift(null)} 
          />
        )}
        </div>
      </div>
    </PullToRefresh>
  );
}