import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { User, Star, Briefcase, Search, MapPin, Mail } from "lucide-react";
import WorkerProfileModal from "./WorkerProfileModal";

export default function WorkerDirectory({ user }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWorker, setSelectedWorker] = useState(null);

  // Get all shifts assigned to workers
  const { data: shifts, isLoading } = useQuery({
    queryKey: ['employerWorkers', user?.email],
    queryFn: async () => {
      if (!user) return [];
      const venueId = user.coffee_shop_id || user.restaurant_id;
      if (!venueId) return [];
      
      const allShifts = await base44.entities.Shift.filter({ venue_id: venueId }, '-created_date');
      return allShifts.filter(s => s.assigned_to);
    },
    enabled: !!user,
    initialData: [],
  });

  // Get unique workers
  const uniqueWorkers = React.useMemo(() => {
    const workerMap = new Map();
    shifts.forEach(shift => {
      if (!workerMap.has(shift.assigned_to)) {
        workerMap.set(shift.assigned_to, {
          email: shift.assigned_to,
          name: shift.assigned_to_name,
          shiftsCompleted: 0,
        });
      }
      if (shift.status === 'completed') {
        workerMap.get(shift.assigned_to).shiftsCompleted += 1;
      }
    });
    return Array.from(workerMap.values());
  }, [shifts]);

  // Get worker reviews
  const { data: reviews } = useQuery({
    queryKey: ['workerReviews'],
    queryFn: () => base44.entities.WorkerReview.list(),
    initialData: [],
  });

  // Enhance workers with review data
  const enhancedWorkers = uniqueWorkers.map(worker => {
    const workerReviews = reviews.filter(r => r.worker_email === worker.email);
    const avgRating = workerReviews.length > 0
      ? workerReviews.reduce((sum, r) => sum + r.rating, 0) / workerReviews.length
      : 0;
    
    return {
      ...worker,
      rating: avgRating,
      totalReviews: workerReviews.length,
    };
  });

  const filteredWorkers = enhancedWorkers.filter(worker =>
    worker.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    worker.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return <div className="animate-pulse h-96 rounded-2xl" style={{ backgroundColor: 'var(--sand)' }} />;
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: 'var(--clay)' }} />
        <Input
          placeholder="Search workers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-14 h-14 rounded-2xl border"
          style={{ 
            borderColor: 'var(--sand)',
            backgroundColor: 'var(--warm-white)'
          }}
        />
      </div>

      {/* Workers Grid */}
      {filteredWorkers.length === 0 ? (
        <Card className="border rounded-2xl p-12 text-center" style={{ borderColor: 'var(--sand)', backgroundColor: 'var(--warm-white)' }}>
          <User className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--clay)' }} />
          <h3 className="text-xl font-light mb-2" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
            No workers yet
          </h3>
          <p className="text-sm" style={{ color: 'var(--clay)' }}>
            Workers you hire will appear here
          </p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkers.map(worker => (
            <Card 
              key={worker.email}
              className="border rounded-2xl hover-lift cursor-pointer transition-all"
              style={{ borderColor: 'var(--sand)', backgroundColor: 'var(--warm-white)' }}
              onClick={() => setSelectedWorker(worker)}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-light" style={{ backgroundColor: 'var(--terracotta)' }}>
                    {worker.name?.[0]?.toUpperCase() || 'W'}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-normal text-lg mb-1" style={{ color: 'var(--earth)' }}>
                      {worker.name || 'Worker'}
                    </h4>
                    <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--clay)' }}>
                      <Mail className="w-4 h-4" />
                      {worker.email}
                    </div>
                  </div>
                </div>

                {worker.rating > 0 && (
                  <div className="flex items-center gap-2 mb-3">
                    <Star className="w-4 h-4 fill-current" style={{ color: 'var(--terracotta)' }} />
                    <span className="font-normal" style={{ color: 'var(--earth)' }}>
                      {worker.rating.toFixed(1)}
                    </span>
                    <span className="text-sm" style={{ color: 'var(--clay)' }}>
                      ({worker.totalReviews} reviews)
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--clay)' }}>
                  <Briefcase className="w-4 h-4" />
                  {worker.shiftsCompleted} shifts completed
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedWorker && (
        <WorkerProfileModal
          workerEmail={selectedWorker.email}
          onClose={() => setSelectedWorker(null)}
        />
      )}
    </div>
  );
}