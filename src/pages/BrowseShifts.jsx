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

  // Sort: featured first, then by date
  const sortedShifts = [...filteredShifts].sort((a, b) => {
    if (a.is_premium_featured && !b.is_premium_featured) return -1;
    if (!a.is_premium_featured && b.is_premium_featured) return 1;
    return new Date(a.date) - new Date(b.date);
  });
  const displayedShifts = isMobile ? sortedShifts.slice(0, mobileDisplayCount) : sortedShifts;
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
      <div className="min-h-screen p-4 md:p-12" style={{ backgroundColor: 'var(--cream)' }}>
        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 pt-2">
          <h1 className="text-[28px] md:text-[34px] font-bold tracking-tight mb-1" style={{ color: 'var(--earth)' }}>
            Available Shifts
          </h1>
          <p className="text-[15px]" style={{ color: 'var(--clay)' }}>
            Find your next opportunity in Irish hospitality
          </p>
        </div>

        {/* Role Tabs */}
        <Tabs value={roleFilter} onValueChange={setRoleFilter} className="mb-6">
          <TabsList className="flex w-full p-1 rounded-2xl h-auto gap-1" style={{ backgroundColor: '#E5E5EA' }}>
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
                className="rounded-xl py-2 px-2 text-[12px] font-medium tracking-wide data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all flex-1 min-w-0"
                style={{ color: '#3A3A3C' }}
              >
                <span className="truncate">{tab.label}</span>
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
              placeholder="Search by venue or location…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 rounded-2xl text-[15px] border-0"
              style={{ 
                backgroundColor: 'white',
                color: '#1C1C1E',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              }}
            />
          </div>
        </div>

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

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          {[
            { value: filteredShifts.length, label: 'Shifts' },
            { value: `€${Math.round(shifts.reduce((sum, s) => sum + (s.hourly_rate || 0), 0) / (shifts.length || 1))}`, label: 'Avg/hr' },
            { value: availableLocations.length, label: 'Locations' },
            { value: [...new Set(shifts.map(s => s.venue_id || s.coffee_shop_id))].length, label: 'Venues' },
          ].map(({ value, label }) => (
            <div key={label} className="bg-white rounded-2xl p-3 text-center" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              <div className="text-[20px] font-bold tracking-tight" style={{ color: '#1C1C1E' }}>{value}</div>
              <div className="text-[11px] font-medium mt-0.5" style={{ color: '#8E8E93' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Shifts Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-96 rounded-2xl animate-pulse" style={{ backgroundColor: 'var(--sand)' }} />
            ))}
          </div>
        ) : filteredShifts.length === 0 ? (
          <div className="text-center py-20 rounded-2xl bg-white" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#F2F2F7' }}>
              <Search className="w-8 h-8" style={{ color: '#8E8E93' }} />
            </div>
            <h3 className="text-[17px] font-semibold mb-1" style={{ color: '#1C1C1E' }}>No shifts found</h3>
            <p className="text-[14px]" style={{ color: '#8E8E93' }}>Try adjusting your filters or check back later</p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                <button
                  onClick={() => setMobileDisplayCount(prev => prev + 12)}
                  className="px-6 py-3 rounded-xl text-[15px] font-semibold"
                  style={{ backgroundColor: 'white', color: '#C89F8C', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
                >
                  Show more ({filteredShifts.length - mobileDisplayCount} remaining)
                </button>
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