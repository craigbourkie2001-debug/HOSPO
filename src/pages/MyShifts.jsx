import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle, Clock, FileText, Coffee, ChefHat } from "lucide-react";
import { motion } from "framer-motion";
import MyShiftCard from "../components/shifts/MyShiftCard";
import MobileHeader from "../components/mobile/MobileHeader";
import PullToRefresh from "../components/mobile/PullToRefresh";

export default function MyShifts() {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['myShifts'] });
    await queryClient.invalidateQueries({ queryKey: ['myApplications'] });
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

  const upcomingShifts = shifts.filter(s => s.status === 'filled');
  const completedShifts = shifts.filter(s => s.status === 'completed');
  const pendingApplications = applications.filter(a => a.status === 'pending');

  const totalHours = shifts.reduce((sum, s) => {
    if (!s.start_time || !s.end_time) return sum;
    const [sh, sm] = s.start_time.split(':').map(Number);
    const [eh, em] = s.end_time.split(':').map(Number);
    const mins = (eh * 60 + em) - (sh * 60 + sm);
    return sum + (mins > 0 ? mins / 60 : 0);
  }, 0);

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <MobileHeader title="My Shifts" icon={Clock} />
      <div className="min-h-screen pt-24 md:pt-12 pb-4" style={{ backgroundColor: 'var(--cream)', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif' }}>
        <div className="max-w-6xl mx-auto px-4 md:px-12">

        {/* Large Title */}
        <div className="mb-6">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight" style={{ color: 'var(--earth)', letterSpacing: '-0.02em' }}>
            My Shifts
          </h1>
        </div>

        {/* Stats row — lightweight, no heavy borders */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Pending', value: pendingApplications.length, icon: FileText, color: 'var(--terracotta)' },
            { label: 'Confirmed', value: upcomingShifts.length, icon: Calendar, color: 'var(--sage)' },
            { label: 'Done', value: completedShifts.length, icon: CheckCircle, color: 'var(--earth)' },
            { label: 'Hours', value: totalHours.toFixed(0) + 'h', icon: Clock, color: 'var(--clay)' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="p-3 rounded-2xl text-center" style={{ backgroundColor: 'var(--warm-white)' }}>
              <div className="text-2xl font-semibold mb-0.5" style={{ color, letterSpacing: '-0.02em' }}>{value}</div>
              <div className="text-xs" style={{ color: 'var(--clay)' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Tabs — iOS segmented control style */}
        <Tabs defaultValue="applications" className="w-full">
          <TabsList className="w-full grid grid-cols-3 mb-5 p-1 rounded-xl h-auto" style={{ backgroundColor: 'var(--sand)' }}>
            <TabsTrigger value="applications" className="rounded-lg py-2.5 text-sm font-medium transition-all data-[state=active]:shadow-sm data-[state=active]:bg-white" style={{ color: 'var(--earth)' }}>
              Applications {applications.length > 0 && <span className="ml-1 text-xs opacity-60">{applications.length}</span>}
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="rounded-lg py-2.5 text-sm font-medium transition-all data-[state=active]:shadow-sm data-[state=active]:bg-white" style={{ color: 'var(--earth)' }}>
              Confirmed {upcomingShifts.length > 0 && <span className="ml-1 text-xs opacity-60">{upcomingShifts.length}</span>}
            </TabsTrigger>
            <TabsTrigger value="completed" className="rounded-lg py-2.5 text-sm font-medium transition-all data-[state=active]:shadow-sm data-[state=active]:bg-white" style={{ color: 'var(--earth)' }}>
              Completed {completedShifts.length > 0 && <span className="ml-1 text-xs opacity-60">{completedShifts.length}</span>}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="applications">
            {applications.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: 'var(--sand)' }}>
                  <FileText className="w-6 h-6" style={{ color: 'var(--clay)' }} />
                </div>
                <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--earth)' }}>No applications yet</h3>
                <p className="text-sm" style={{ color: 'var(--clay)' }}>Browse shifts to apply</p>
              </div>
            ) : (
              <div className="space-y-3">
                {applications.map(app => (
                  <div key={app.id} className="flex items-center justify-between p-4 rounded-2xl" style={{ backgroundColor: 'var(--warm-white)' }}>
                    <div className="flex items-center gap-3">
                      {app.role_type === 'chef'
                        ? <ChefHat className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--sage)' }} />
                        : <Coffee className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--terracotta)' }} />
                      }
                      <div>
                        <p className="font-medium text-sm" style={{ color: 'var(--earth)' }}>{app.venue_name}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--clay)' }}>
                          {new Date(app.shift_date).toLocaleDateString('en-IE', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <Badge className="font-medium text-xs capitalize border-0" style={{
                      backgroundColor: app.status === 'accepted' ? '#dcfce7' : app.status === 'rejected' ? '#fee2e2' : 'var(--sand)',
                      color: app.status === 'accepted' ? '#166534' : app.status === 'rejected' ? '#991b1b' : 'var(--earth)'
                    }}>
                      {app.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="upcoming">
            {upcomingShifts.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: 'var(--sand)' }}>
                  <Calendar className="w-6 h-6" style={{ color: 'var(--clay)' }} />
                </div>
                <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--earth)' }}>No confirmed shifts</h3>
                <p className="text-sm" style={{ color: 'var(--clay)' }}>Browse shifts to get started</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {upcomingShifts.map(shift => <MyShiftCard key={shift.id} shift={shift} />)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed">
            {completedShifts.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: 'var(--sand)' }}>
                  <CheckCircle className="w-6 h-6" style={{ color: 'var(--clay)' }} />
                </div>
                <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--earth)' }}>No completed shifts</h3>
                <p className="text-sm" style={{ color: 'var(--clay)' }}>Completed shifts appear here</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {completedShifts.map(shift => <MyShiftCard key={shift.id} shift={shift} />)}
              </div>
            )}
          </TabsContent>
        </Tabs>
        </div>
      </div>
    </PullToRefresh>
  );
}