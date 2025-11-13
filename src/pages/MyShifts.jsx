import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Calendar, CheckCircle, Clock } from "lucide-react";
import { motion } from "framer-motion";
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
    <div className="min-h-screen p-6 md:p-12" style={{ backgroundColor: 'var(--cream)' }}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <h1 className="text-5xl md:text-6xl font-light mb-3 tracking-tight" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
            My Shifts
          </h1>
          <p className="text-lg font-light tracking-wide" style={{ color: 'var(--clay)' }}>
            Manage your claimed and completed shifts
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl hover-lift"
            style={{ backgroundColor: 'var(--warm-white)', border: '1px solid var(--sand)' }}
          >
            <Calendar className="w-8 h-8 mb-3" style={{ color: 'var(--sage)', strokeWidth: 1.5 }} />
            <div className="text-4xl font-light mb-2" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
              {upcomingShifts.length}
            </div>
            <div className="text-xs tracking-wider" style={{ color: 'var(--clay)' }}>UPCOMING SHIFTS</div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
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
            transition={{ delay: 0.2 }}
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

        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="w-full grid grid-cols-2 mb-8 p-2 rounded-2xl h-auto" style={{ backgroundColor: 'var(--warm-white)', border: '1px solid var(--sand)' }}>
            <TabsTrigger 
              value="upcoming" 
              className="rounded-xl py-3 font-normal tracking-wide data-[state=active]:text-white transition-all"
              style={{ color: 'var(--clay)' }}
            >
              Upcoming ({upcomingShifts.length})
            </TabsTrigger>
            <TabsTrigger 
              value="completed"
              className="rounded-xl py-3 font-normal tracking-wide data-[state=active]:text-white transition-all"
              style={{ color: 'var(--clay)' }}
            >
              Completed ({completedShifts.length})
            </TabsTrigger>
          </TabsList>

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