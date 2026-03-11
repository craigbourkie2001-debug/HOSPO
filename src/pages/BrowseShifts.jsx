import React, { useState, useEffect } from "react";
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
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);
  const [userLocation, setUserLocation] = useState(null);
  const [proximityKm, setProximityKm] = useState(10);

  const queryClient = useQueryClient();

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  React.useEffect(() => {
    base44.auth.me().then(userData => {
      setUser(userData);
      // Auto-set user location from stored geocoded profile coords
      if (userData.location_lat && userData.location_lng) {
        setUserLocation({ lat: userData.location_lat, lng: userData.location_lng });
      }
    }).catch(() => {});
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
      <div className="min-h-screen" style={{ backgroundColor: 'var(--cream)', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif' }}>
        <div className="max-w-7xl mx-auto px-4 md:px-12 pt-6 md:pt-12 pb-4">

        {/* Large Title Header */}
        <div className="mb-6">
          <h1 className="text-4xl md:text-5xl font-semibold mb-1 tracking-tight" style={{ color: 'var(--earth)', letterSpacing: '-0.02em' }}>
            Available Shifts
          </h1>
          <p className="text-base" style={{ color: 'var(--clay)' }}>
            {filteredShifts.length} {filteredShifts.length === 1 ? 'shift' : 'shifts'} in Ireland
          </p>
        </div>

        {/* Search Bar — iOS style */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--clay)' }} />
            <Input
              placeholder="Search venues or locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-11 rounded-xl text-base border-0 shadow-none"
              style={{ backgroundColor: 'var(--sand)', color: 'var(--earth)' }}
            />
          </div>
        </div>

        {/* Role Filter — iOS segmented style */}
        <Tabs value={roleFilter} onValueChange={setRoleFilter} className="mb-4">
          <TabsList className="flex w-full p-1 rounded-xl h-auto gap-0.5 overflow-x-auto" style={{ backgroundColor: 'var(--sand)' }}>
            {[
              { value: 'all', label: 'All', count: shifts.length },
              { value: 'barista', label: 'Barista', count: roleCounts.barista },
              { value: 'bartender', label: 'Bar', count: roleCounts.bartender },
              { value: 'mixologist', label: 'Mix', count: roleCounts.mixologist },
              { value: 'chef', label: 'Chef', count: roleCounts.chef },
              { value: 'waiter', label: 'Waiter', count: roleCounts.waiter },
            ].map(tab => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="rounded-lg py-2 px-3 text-xs font-medium flex-1 min-w-0 data-[state=active]:shadow-sm transition-all data-[state=active]:bg-white"
                style={{ color: 'var(--earth)' }}
              >
                <span className="truncate">{tab.label}</span>
                {tab.count > 0 && <span className="ml-1 text-xs opacity-50">{tab.count}</span>}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* AI Recommendations */}
        <RecommendedShifts user={user} onApply={setSelectedShift} />

        {/* Proximity Filter */}
        <ProximityFilter
          userLocation={userLocation}
          onLocationSet={setUserLocation}
          onLocationClear={() => setUserLocation(null)}
          proximityKm={proximityKm}
          onProximityChange={setProximityKm}
        />

        {/* Filters */}
        <ShiftFilters
          filters={filters}
          setFilters={setFilters}
          availableLocations={availableLocations}
          shifts={shifts}
          roleFilter={roleFilter}
        />

        {/* Shifts Grid */}
        <div className="mt-2">
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-52 rounded-2xl animate-pulse" style={{ backgroundColor: 'var(--sand)' }} />
            ))}
          </div>
        ) : filteredShifts.length === 0 ? (
          <div className="text-center py-20 rounded-2xl" style={{ backgroundColor: 'var(--warm-white)' }}>
            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: 'var(--sand)' }}>
              <Search className="w-7 h-7" style={{ color: 'var(--clay)' }} />
            </div>
            <h3 className="text-xl font-semibold mb-1" style={{ color: 'var(--earth)' }}>No shifts found</h3>
            <p className="text-sm" style={{ color: 'var(--clay)' }}>Try adjusting your filters</p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedShifts.map((shift) => (
                <ShiftCard
                  key={shift.id}
                  shift={shift}
                  onApply={() => setSelectedShift(shift)}
                  distance={getShiftDistance(shift, userLocation)}
                />
              ))}
            </div>

            {hasMore && (
              <div className="mt-6 flex justify-center">
                <Button
                  onClick={() => setMobileDisplayCount(prev => prev + 12)}
                  className="rounded-xl font-medium px-8 h-11"
                  style={{ backgroundColor: 'var(--terracotta)', color: 'white' }}
                >
                  Load More ({filteredShifts.length - mobileDisplayCount} remaining)
                </Button>
              </div>
            )}
          </>
        )}
        </div>

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