import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle, Clock, FileText, Coffee, ChefHat } from "lucide-react";
import { motion } from "framer-motion";
import MyShiftCard from "../components/shifts/MyShiftCard";

export default function MyShifts() {
  const [user, setUser] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullStart, setPullStart] = useState(0);
  const [pullDistance, setPullDistance] = useState(0);
  const queryClient = useQueryClient();

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

  const handlePullEnd = async () => {
    if (pullDistance > 60) {
      setIsRefreshing(true);
      await queryClient.invalidateQueries({ queryKey: ['myShifts'] });
      await queryClient.invalidateQueries({ queryKey: ['myApplications'] });
      setTimeout(() => setIsRefreshing(false), 500);
    }
    setPullStart(0);
    setPullDistance(0);
  };

  const { data: shifts, isLoading } = useQuery({
    queryKey: ['myShifts', user?.email],
    queryFn: () => user ? base44.entities.Shift.filter({ assigned_to: user.email }, '-date') : [],
    enabled: !!user,
    initialData: [],
  });

  const { data: applications } = useQuery({
    queryKey: ['myApplications', user?.email],
    queryFn: () => user ? base44.entities.ShiftApplication.filter({ applicant_email: user.email }, '-created_date') : [],
    enabled: !!user,
    initialData: [],
  });

  const upcomingShifts = shifts.filter(s => s.status === 'filled' && new Date(s.date) >= new Date());
  const completedShifts = shifts.filter(s => s.status === 'completed');
  const pendingApplications = applications.filter(a => a.status === 'pending');

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
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <h1 className="text-5xl md:text-6xl font-light mb-3 tracking-tight" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
            My Shifts
          </h1>
          <p className="text-lg font-light tracking-wide" style={{ color: 'var(--clay)' }}>
            Manage your claimed and completed shifts
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl hover-lift"
            style={{ backgroundColor: 'var(--warm-white)', border: '1px solid var(--sand)' }}
          >
            <FileText className="w-8 h-8 mb-3" style={{ color: 'var(--terracotta)', strokeWidth: 1.5 }} />
            <div className="text-4xl font-light mb-2" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
              {pendingApplications.length}
            </div>
            <div className="text-xs tracking-wider" style={{ color: 'var(--clay)' }}>PENDING APPS</div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-2xl hover-lift"
            style={{ backgroundColor: 'var(--sage)', color: 'white' }}
          >
            <Calendar className="w-8 h-8 mb-3" style={{ strokeWidth: 1.5 }} />
            <div className="text-4xl font-light mb-2" style={{ fontFamily: 'Crimson Pro, serif' }}>
              {upcomingShifts.length}
            </div>
            <div className="text-xs tracking-wider opacity-90">CONFIRMED</div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-2xl hover-lift"
            style={{ backgroundColor: 'var(--terracotta)', color: 'white' }}
          >
            <CheckCircle className="w-8 h-8 mb-3" style={{ strokeWidth: 1.5 }} />
            <div className="text-4xl font-light mb-2" style={{ fontFamily: 'Crimson Pro, serif' }}>
              {completedShifts.length}
            </div>
            <div className="text-xs tracking-wider opacity-90">COMPLETED</div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 rounded-2xl hover-lift"
            style={{ backgroundColor: 'var(--clay)', color: 'white' }}
          >
            <Clock className="w-8 h-8 mb-3" style={{ strokeWidth: 1.5 }} />
            <div className="text-4xl font-light mb-2" style={{ fontFamily: 'Crimson Pro, serif' }}>
              {shifts.reduce((sum, s) => {
                const start = s.start_time?.split(':')[0] || 0;
                const end = s.end_time?.split(':')[0] || 0;
                return sum + (end - start);
              }, 0)}
            </div>
            <div className="text-xs tracking-wider opacity-90">TOTAL HOURS</div>
          </motion.div>
        </div>

        <Tabs defaultValue="applications" className="w-full">
          <TabsList className="w-full grid grid-cols-3 mb-8 p-2 rounded-2xl h-auto" style={{ backgroundColor: 'var(--warm-white)', border: '1px solid var(--sand)' }}>
            <TabsTrigger 
              value="applications" 
              className="rounded-xl py-3 font-normal tracking-wide data-[state=active]:text-white transition-all"
              style={{ color: 'var(--clay)' }}
            >
              Applications ({applications.length})
            </TabsTrigger>
            <TabsTrigger 
              value="upcoming" 
              className="rounded-xl py-3 font-normal tracking-wide data-[state=active]:text-white transition-all"
              style={{ color: 'var(--clay)' }}
            >
              Confirmed ({upcomingShifts.length})
            </TabsTrigger>
            <TabsTrigger 
              value="completed"
              className="rounded-xl py-3 font-normal tracking-wide data-[state=active]:text-white transition-all"
              style={{ color: 'var(--clay)' }}
            >
              Completed ({completedShifts.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="applications">
            {applications.length === 0 ? (
              <div className="text-center py-20 rounded-2xl" style={{ backgroundColor: 'var(--warm-white)', border: '1px solid var(--sand)' }}>
                <FileText className="w-20 h-20 mx-auto mb-6" style={{ color: 'var(--clay)', strokeWidth: 1.5 }} />
                <h3 className="text-2xl font-light mb-2" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
                  No applications yet
                </h3>
                <p className="font-light" style={{ color: 'var(--clay)' }}>
                  Browse available shifts and apply
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {applications.map(app => (
                  <div 
                    key={app.id} 
                    className="p-5 rounded-xl border"
                    style={{ borderColor: 'var(--sand)', backgroundColor: 'var(--warm-white)' }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {app.role_type === 'chef' ? (
                          <ChefHat className="w-5 h-5" style={{ color: 'var(--sage)' }} />
                        ) : (
                          <Coffee className="w-5 h-5" style={{ color: 'var(--terracotta)' }} />
                        )}
                        <h4 className="font-normal text-lg" style={{ color: 'var(--earth)' }}>{app.venue_name}</h4>
                      </div>
                      <Badge 
                        className="font-normal"
                        style={{ 
                          backgroundColor: app.status === 'accepted' ? 'var(--sage)' : app.status === 'rejected' ? 'var(--clay)' : 'var(--sand)',
                          color: app.status === 'pending' ? 'var(--earth)' : 'white'
                        }}
                      >
                        {app.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--clay)' }}>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(app.shift_date).toLocaleDateString('en-IE', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="upcoming">
            {upcomingShifts.length === 0 ? (
              <div className="text-center py-20 rounded-2xl" style={{ backgroundColor: 'var(--warm-white)', border: '1px solid var(--sand)' }}>
                <Calendar className="w-20 h-20 mx-auto mb-6" style={{ color: 'var(--clay)', strokeWidth: 1.5 }} />
                <h3 className="text-2xl font-light mb-2" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
                  No upcoming shifts
                </h3>
                <p className="font-light" style={{ color: 'var(--clay)' }}>
                  Browse available shifts to get started
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {upcomingShifts.map(shift => (
                  <MyShiftCard key={shift.id} shift={shift} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed">
            {completedShifts.length === 0 ? (
              <div className="text-center py-20 rounded-2xl" style={{ backgroundColor: 'var(--warm-white)', border: '1px solid var(--sand)' }}>
                <CheckCircle className="w-20 h-20 mx-auto mb-6" style={{ color: 'var(--clay)', strokeWidth: 1.5 }} />
                <h3 className="text-2xl font-light mb-2" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
                  No completed shifts yet
                </h3>
                <p className="font-light" style={{ color: 'var(--clay)' }}>
                  Your completed shifts will appear here
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {completedShifts.map(shift => (
                  <MyShiftCard key={shift.id} shift={shift} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}