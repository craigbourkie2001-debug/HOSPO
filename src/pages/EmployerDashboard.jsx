import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Plus, Users, Clock, TrendingUp, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import ShiftFormModal from "../components/employer/ShiftFormModal";
import EmployerShiftCard from "../components/employer/EmployerShiftCard";

export default function EmployerDashboard() {
  const [user, setUser] = useState(null);
  const [showShiftForm, setShowShiftForm] = useState(false);
  const [coffeeShop, setCoffeeShop] = useState(null);
  const queryClient = useQueryClient();

  React.useEffect(() => {
    base44.auth.me().then(async (userData) => {
      setUser(userData);
      // Fetch employer's coffee shop
      if (userData.coffee_shop_id) {
        const shop = await base44.entities.CoffeeShop.filter({ id: userData.coffee_shop_id });
        if (shop.length > 0) setCoffeeShop(shop[0]);
      }
    }).catch(() => {});
  }, []);

  const { data: shifts, isLoading } = useQuery({
    queryKey: ['employerShifts', coffeeShop?.id],
    queryFn: () => base44.entities.Shift.filter({ coffee_shop_id: coffeeShop.id }, '-created_date'),
    initialData: [],
    enabled: !!coffeeShop?.id
  });

  const deleteShiftMutation = useMutation({
    mutationFn: (shiftId) => base44.entities.Shift.delete(shiftId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employerShifts'] });
    },
  });

  const availableShifts = shifts.filter(s => s.status === 'available');
  const claimedShifts = shifts.filter(s => s.status === 'claimed');
  const completedShifts = shifts.filter(s => s.status === 'completed');

  if (!user || !coffeeShop) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--cream)' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-2" style={{ borderColor: 'var(--sand)', borderTopColor: 'var(--terracotta)' }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-12" style={{ backgroundColor: 'var(--cream)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-5xl font-light mb-3 tracking-tight" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
                Employer Dashboard
              </h1>
              <p className="text-lg font-light" style={{ color: 'var(--clay)' }}>
                {coffeeShop.name}
              </p>
            </div>
            <Button
              onClick={() => setShowShiftForm(true)}
              className="rounded-xl font-normal tracking-wide"
              style={{ backgroundColor: 'var(--terracotta)', color: 'white' }}
            >
              <Plus className="w-5 h-5 mr-2" />
              Post New Shift
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl hover-lift"
            style={{ backgroundColor: 'var(--warm-white)', border: '1px solid var(--sand)' }}
          >
            <Briefcase className="w-8 h-8 mb-3" style={{ color: 'var(--sage)', strokeWidth: 1.5 }} />
            <div className="text-4xl font-light mb-2" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
              {availableShifts.length}
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
            <Clock className="w-8 h-8 mb-3 opacity-90" style={{ strokeWidth: 1.5 }} />
            <div className="text-4xl font-light mb-2" style={{ fontFamily: 'Crimson Pro, serif' }}>
              {claimedShifts.length}
            </div>
            <div className="text-xs tracking-wider opacity-90">CLAIMED SHIFTS</div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-2xl hover-lift"
            style={{ backgroundColor: 'var(--sage)', color: 'white' }}
          >
            <Users className="w-8 h-8 mb-3 opacity-90" style={{ strokeWidth: 1.5 }} />
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
            style={{ backgroundColor: 'var(--warm-white)', border: '1px solid var(--sand)' }}
          >
            <TrendingUp className="w-8 h-8 mb-3" style={{ color: 'var(--olive)', strokeWidth: 1.5 }} />
            <div className="text-4xl font-light mb-2" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
              {shifts.length}
            </div>
            <div className="text-xs tracking-wider" style={{ color: 'var(--clay)' }}>TOTAL SHIFTS</div>
          </motion.div>
        </div>

        {/* Shifts Tabs */}
        <Card className="border rounded-2xl" style={{ borderColor: 'var(--sand)', backgroundColor: 'var(--warm-white)' }}>
          <CardHeader>
            <CardTitle className="font-normal" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
              Your Shifts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="grid md:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-48 rounded-xl animate-pulse" style={{ backgroundColor: 'var(--sand)' }} />
                ))}
              </div>
            ) : shifts.length === 0 ? (
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
                  style={{ backgroundColor: 'var(--terracotta)', color: 'white' }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Post Shift
                </Button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {shifts.map(shift => (
                  <EmployerShiftCard
                    key={shift.id}
                    shift={shift}
                    onDelete={() => deleteShiftMutation.mutate(shift.id)}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {showShiftForm && (
        <ShiftFormModal
          coffeeShop={coffeeShop}
          onClose={() => setShowShiftForm(false)}
        />
      )}
    </div>
  );
}