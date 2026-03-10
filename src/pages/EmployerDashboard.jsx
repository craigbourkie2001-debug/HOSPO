import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Briefcase, Plus, Users, Clock, TrendingUp, Calendar, Coffee, ChefHat, Store, BarChart3, LayoutDashboard } from "lucide-react";
import { motion } from "framer-motion";
import ShiftFormModal from "../components/employer/ShiftFormModal";
import EmployerShiftCard from "../components/employer/EmployerShiftCard";
import ApplicationsModal from "../components/employer/ApplicationsModal";
import RecommendedCandidates from "../components/matching/RecommendedCandidates";
import LeaveReviewModal from "../components/employer/LeaveReviewModal";
import AnalyticsDashboard from "../components/employer/AnalyticsDashboard";
import JobManagement from "../components/employer/JobManagement";
import WorkerProfileModal from "../components/employer/WorkerProfileModal";
import MobileHeader from "../components/mobile/MobileHeader";

export default function EmployerDashboard() {
  const [user, setUser] = useState(null);
  const [showShiftForm, setShowShiftForm] = useState(false);
  const [venues, setVenues] = useState([]);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [selectedVenueType, setSelectedVenueType] = useState('coffee_shop');
  const [viewingApplicationsFor, setViewingApplicationsFor] = useState(null);
  const [reviewShift, setReviewShift] = useState(null);
  const [viewingWorkerProfile, setViewingWorkerProfile] = useState(null);
  const queryClient = useQueryClient();

  React.useEffect(() => {
    base44.auth.me().then(async (userData) => {
      setUser(userData);
      const allVenues = [];

      // Fetch associated venues
      if (userData.coffee_shop_id) {
        const shops = await base44.entities.CoffeeShop.filter({ id: userData.coffee_shop_id });
        allVenues.push(...shops.map((s) => ({ ...s, venue_type: 'coffee_shop' })));
      }
      if (userData.restaurant_id) {
        const restaurants = await base44.entities.Restaurant.filter({ id: userData.restaurant_id });
        allVenues.push(...restaurants.map((r) => ({ ...r, venue_type: 'restaurant' })));
      }

      setVenues(allVenues);
      if (allVenues.length > 0) {
        setSelectedVenue(allVenues[0]);
        setSelectedVenueType(allVenues[0].venue_type);
      }
    }).catch(() => base44.auth.redirectToLogin());
  }, []);

  const { data: shifts, isLoading } = useQuery({
    queryKey: ['employerShifts', selectedVenue?.id],
    queryFn: () => base44.entities.Shift.filter({ venue_id: selectedVenue.id }, '-created_date'),
    initialData: [],
    enabled: !!selectedVenue?.id
  });

  const { data: allApplications = [] } = useQuery({
    queryKey: ['all-applications', selectedVenue?.id],
    queryFn: () => base44.entities.ShiftApplication.filter({ venue_id: selectedVenue.id }),
    enabled: !!selectedVenue?.id
  });

  const { data: jobs = [] } = useQuery({
    queryKey: ['employer-jobs', selectedVenue?.id],
    queryFn: () => base44.entities.Job.filter({ venue_id: selectedVenue.id }),
    enabled: !!selectedVenue?.id
  });

  const { data: jobApplications = [] } = useQuery({
    queryKey: ['job-applications', selectedVenue?.id],
    queryFn: () => base44.entities.JobApplication.filter({ venue_id: selectedVenue.id }),
    enabled: !!selectedVenue?.id
  });

  const deleteShiftMutation = useMutation({
    mutationFn: (shiftId) => base44.entities.Shift.delete(shiftId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employerShifts'] });
    }
  });

  const availableShifts = shifts.filter((s) => s.status === 'available' || s.status === 'applications_open');
  const filledShifts = shifts.filter((s) => s.status === 'filled');
  const completedShifts = shifts.filter((s) => s.status === 'completed');
  const totalApplications = shifts.reduce((sum, s) => sum + (s.applications_count || 0), 0);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--cream)' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-2" style={{ borderColor: 'var(--sand)', borderTopColor: 'var(--terracotta)' }} />
      </div>);

  }

  // If onboarding not completed, show loading state (onboarding modal will appear from Layout)
  if (!user.onboarding_completed || (!user.coffee_shop_id && !user.restaurant_id)) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--cream)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 mx-auto mb-4" style={{ borderColor: 'var(--sand)', borderTopColor: 'var(--terracotta)' }} />
          <p className="text-lg font-light" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
            Setting up your employer account...
          </p>
        </div>
      </div>);

  }

  if (venues.length === 0) {
    return (
      <div className="min-h-screen p-6 md:p-12" style={{ backgroundColor: 'var(--cream)' }}>
        <div className="max-w-2xl mx-auto text-center py-20">
          <Store className="w-20 h-20 mx-auto mb-6" style={{ color: 'var(--clay)', strokeWidth: 1.5 }} />
          <h1 className="text-4xl font-light mb-4" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
            No Venues Found
          </h1>
          <p className="font-light mb-8" style={{ color: 'var(--clay)' }}>
            You need to be associated with a coffee shop or restaurant to use the employer dashboard.
          </p>
        </div>
      </div>);

  }

  return (
    <>
      <MobileHeader title="Employer Dashboard" icon={LayoutDashboard} />
      <div className="min-h-screen p-4 md:p-12 md:pt-12 pt-24" style={{ backgroundColor: 'var(--cream)' }}>
        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl md:text-5xl font-light mb-2 md:mb-3 tracking-tight" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
                Employer Dashboard
              </h1>
              {venues.length > 1 ?
                <Select
                  value={selectedVenue?.id}
                  onValueChange={(id) => {
                    const venue = venues.find((v) => v.id === id);
                    setSelectedVenue(venue);
                    setSelectedVenueType(venue.venue_type);
                  }}>

                  <SelectTrigger className="w-64 rounded-xl border" style={{ borderColor: 'var(--sand)' }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {venues.map((v) =>
                    <SelectItem key={v.id} value={v.id}>
                        <div className="flex items-center gap-2">
                          {v.venue_type === 'restaurant' ? <ChefHat className="w-4 h-4" /> : <Coffee className="w-4 h-4" />}
                          {v.name}
                        </div>
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select> :

                <div className="flex items-center gap-2 text-lg font-light" style={{ color: 'var(--clay)' }}>
                  {selectedVenueType === 'restaurant' ? <ChefHat className="w-5 h-5" /> : <Coffee className="w-5 h-5" />}
                  {selectedVenue?.name}
                </div>
                }
            </div>
            <Button
                onClick={() => setShowShiftForm(true)}
                className="rounded-xl font-normal tracking-wide"
                style={{ backgroundColor: 'var(--terracotta)', color: 'white' }}>

              <Plus className="w-5 h-5 mr-2" />
              Post New Shift
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5 mb-6 md:mb-12">
          <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 md:p-6 rounded-2xl hover-lift"
              style={{ backgroundColor: 'var(--warm-white)', border: '1px solid var(--sand)' }}>

            <Briefcase className="w-6 h-6 md:w-8 md:h-8 mb-2 md:mb-3" style={{ color: 'var(--sage)', strokeWidth: 1.5 }} />
            <div className="text-3xl md:text-4xl font-light mb-1 md:mb-2" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
              {availableShifts.length}
            </div>
            <div className="text-xs tracking-wider" style={{ color: 'var(--clay)' }}>OPEN SHIFTS</div>
          </motion.div>
          
          <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-4 md:p-6 rounded-2xl hover-lift"
              style={{ backgroundColor: 'var(--terracotta)', color: 'white' }}>

            <Users className="w-6 h-6 md:w-8 md:h-8 mb-2 md:mb-3 opacity-90" style={{ strokeWidth: 1.5 }} />
            <div className="text-3xl md:text-4xl font-light mb-1 md:mb-2" style={{ fontFamily: 'Crimson Pro, serif' }}>
              {totalApplications}
            </div>
            <div className="text-xs tracking-wider opacity-90">APPLICATIONS</div>
          </motion.div>
          
          <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-4 md:p-6 rounded-2xl hover-lift"
              style={{ backgroundColor: 'var(--sage)', color: 'white' }}>

            <Clock className="w-6 h-6 md:w-8 md:h-8 mb-2 md:mb-3 opacity-90" style={{ strokeWidth: 1.5 }} />
            <div className="text-3xl md:text-4xl font-light mb-1 md:mb-2" style={{ fontFamily: 'Crimson Pro, serif' }}>
              {filledShifts.length}
            </div>
            <div className="text-xs tracking-wider opacity-90">FILLED SHIFTS</div>
          </motion.div>
          
          <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-4 md:p-6 rounded-2xl hover-lift"
              style={{ backgroundColor: 'var(--warm-white)', border: '1px solid var(--sand)' }}>

            <TrendingUp className="w-6 h-6 md:w-8 md:h-8 mb-2 md:mb-3" style={{ color: 'var(--olive)', strokeWidth: 1.5 }} />
            <div className="text-3xl md:text-4xl font-light mb-1 md:mb-2" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
              {completedShifts.length}
            </div>
            <div className="text-xs tracking-wider" style={{ color: 'var(--clay)' }}>COMPLETED</div>
          </motion.div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="shifts" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 rounded-xl" style={{ backgroundColor: 'var(--sand)' }}>
            <TabsTrigger value="shifts" className="rounded-lg font-normal">
              Shift Management
            </TabsTrigger>
            <TabsTrigger value="jobs" className="px-3 py-1 text-sm font-normal rounded-md inline-flex items-center justify-center whitespace-nowrap ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow">
              Job Postings
            </TabsTrigger>
            <TabsTrigger value="analytics" className="rounded-lg font-normal">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="shifts" className="space-y-8">
            {/* AI Recommended Candidates for Open Shifts */}
            {availableShifts.length > 0 &&
              <RecommendedCandidates shift={availableShifts[0]} />
              }

            {/* Shifts */}
            <Card className="border rounded-2xl" style={{ borderColor: 'var(--sand)', backgroundColor: 'var(--warm-white)' }}>
              <CardHeader>
                <CardTitle className="font-normal" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
                  Your Shifts
                </CardTitle>
              </CardHeader>
              <CardContent>
            {isLoading ?
                  <div className="grid md:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) =>
                    <div key={i} className="h-48 rounded-xl animate-pulse" style={{ backgroundColor: 'var(--sand)' }} />
                    )}
              </div> :
                  shifts.length === 0 ?
                  <div className="text-center py-12 rounded-xl" style={{ backgroundColor: 'var(--cream)' }}>
                <Calendar className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--clay)', strokeWidth: 1.5 }} />
                <h3 className="text-xl font-normal mb-2" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
                  No shifts posted yet
                </h3>
                <p className="font-light mb-4" style={{ color: 'var(--clay)' }}>
                  Start by posting your first shift
                </p>
                <Button
                      onClick={() => setShowShiftForm(true)}
                      className="rounded-xl font-normal"
                      style={{ backgroundColor: 'var(--terracotta)', color: 'white' }}>

                  <Plus className="w-4 h-4 mr-2" />
                  Post Shift
                </Button>
              </div> :

                  <div className="grid md:grid-cols-2 gap-4">
                {shifts.map((shift) =>
                    <EmployerShiftCard
                      key={shift.id}
                      shift={shift}
                      onDelete={() => deleteShiftMutation.mutate(shift.id)}
                      onViewApplications={() => setViewingApplicationsFor(shift)}
                      onLeaveReview={setReviewShift} />

                    )}
              </div>
                  }
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="jobs">
            <JobManagement
                venueId={selectedVenue?.id}
                venueType={selectedVenueType} />

          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsDashboard
                shifts={shifts}
                applications={allApplications}
                jobs={jobs}
                jobApplications={jobApplications} />

          </TabsContent>
        </Tabs>
      </div>

      {showShiftForm && selectedVenue &&
        <ShiftFormModal
          venue={selectedVenue}
          venueType={selectedVenueType}
          onClose={() => setShowShiftForm(false)} />

        }

      {viewingApplicationsFor &&
        <ApplicationsModal
          shift={viewingApplicationsFor}
          onClose={() => setViewingApplicationsFor(null)} />

        }

      {reviewShift &&
        <LeaveReviewModal
          shift={reviewShift}
          onClose={() => setReviewShift(null)} />

        }

      {viewingWorkerProfile &&
        <WorkerProfileModal
          workerEmail={viewingWorkerProfile}
          onClose={() => setViewingWorkerProfile(null)} />

        }
      </div>
    </>);

}