import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Calendar, CheckCircle, Clock } from "lucide-react";
import MyShiftCard from "../components/shifts/MyShiftCard";

export default function MyShifts() {
  const [user, setUser] = useState(null);

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: shifts, isLoading } = useQuery({
    queryKey: ['myShifts', user?.email],
    queryFn: () => user ? base44.entities.Shift.filter({ claimed_by: user.email }, '-date') : [],
    enabled: !!user,
    initialData: [],
  });

  const upcomingShifts = shifts.filter(s => s.status === 'claimed' && new Date(s.date) >= new Date());
  const completedShifts = shifts.filter(s => s.status === 'completed');

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ backgroundColor: 'var(--warm-white)' }}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--espresso)' }}>
            My Shifts
          </h1>
          <p className="text-lg" style={{ color: 'var(--coffee-brown)' }}>
            Manage your claimed and completed shifts
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="p-6 rounded-2xl shadow-sm" style={{ backgroundColor: 'white' }}>
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-8 h-8" style={{ color: 'var(--fresh-green)' }} />
              <div className="text-3xl font-bold" style={{ color: 'var(--espresso)' }}>
                {upcomingShifts.length}
              </div>
            </div>
            <div className="text-sm" style={{ color: 'var(--coffee-brown)' }}>Upcoming Shifts</div>
          </div>

          <div className="p-6 rounded-2xl shadow-sm" style={{ backgroundColor: 'white' }}>
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-8 h-8" style={{ color: 'var(--coffee-brown)' }} />
              <div className="text-3xl font-bold" style={{ color: 'var(--espresso)' }}>
                {completedShifts.length}
              </div>
            </div>
            <div className="text-sm" style={{ color: 'var(--coffee-brown)' }}>Completed Shifts</div>
          </div>

          <div className="p-6 rounded-2xl shadow-sm" style={{ backgroundColor: 'white' }}>
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-8 h-8" style={{ color: 'var(--fresh-green)' }} />
              <div className="text-3xl font-bold" style={{ color: 'var(--espresso)' }}>
                {shifts.reduce((sum, s) => {
                  const start = s.start_time?.split(':')[0] || 0;
                  const end = s.end_time?.split(':')[0] || 0;
                  return sum + (end - start);
                }, 0)}
              </div>
            </div>
            <div className="text-sm" style={{ color: 'var(--coffee-brown)' }}>Total Hours</div>
          </div>
        </div>

        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="w-full grid grid-cols-2 mb-8 p-1 rounded-2xl" style={{ backgroundColor: 'var(--latte)' }}>
            <TabsTrigger 
              value="upcoming" 
              className="rounded-xl data-[state=active]:shadow-sm transition-all duration-300"
              style={{ 
                backgroundColor: 'transparent',
                color: 'var(--coffee-brown)'
              }}
            >
              Upcoming ({upcomingShifts.length})
            </TabsTrigger>
            <TabsTrigger 
              value="completed"
              className="rounded-xl data-[state=active]:shadow-sm transition-all duration-300"
              style={{ 
                backgroundColor: 'transparent',
                color: 'var(--coffee-brown)'
              }}
            >
              Completed ({completedShifts.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            {upcomingShifts.length === 0 ? (
              <div className="text-center py-20 rounded-2xl" style={{ backgroundColor: 'white' }}>
                <Calendar className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--latte)' }} />
                <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--espresso)' }}>
                  No upcoming shifts
                </h3>
                <p style={{ color: 'var(--coffee-brown)' }}>
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
              <div className="text-center py-20 rounded-2xl" style={{ backgroundColor: 'white' }}>
                <CheckCircle className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--latte)' }} />
                <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--espresso)' }}>
                  No completed shifts yet
                </h3>
                <p style={{ color: 'var(--coffee-brown)' }}>
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