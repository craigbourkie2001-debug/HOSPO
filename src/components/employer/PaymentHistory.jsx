import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Calendar, User, Clock, AlertCircle, CheckCircle2 } from "lucide-react";

export default function PaymentHistory({ user }) {
  const { data: payments, isLoading } = useQuery({
    queryKey: ['employerPayments', user?.email],
    queryFn: () => user ? base44.entities.Payment.filter({ employer_email: user.email }, '-created_date') : [],
    enabled: !!user,
    initialData: [],
  });

  const totalPaid = payments.reduce((sum, p) => sum + (p.status === 'completed' ? p.employer_total : 0), 0);
  const pendingPayments = payments.filter(p => p.status === 'pending');
  const completedPayments = payments.filter(p => p.status === 'completed');

  const statusConfig = {
    pending: { color: 'var(--sand)', textColor: 'var(--earth)', icon: Clock },
    processing: { color: 'var(--clay)', textColor: 'white', icon: Clock },
    completed: { color: 'var(--sage)', textColor: 'white', icon: CheckCircle2 },
    failed: { color: '#dc2626', textColor: 'white', icon: AlertCircle },
    disputed: { color: '#ea580c', textColor: 'white', icon: AlertCircle },
  };

  if (isLoading) {
    return <div className="animate-pulse h-96 rounded-2xl" style={{ backgroundColor: 'var(--sand)' }} />;
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-5">
        <Card className="border rounded-2xl" style={{ borderColor: 'var(--sand)', backgroundColor: 'var(--warm-white)' }}>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-5 h-5" style={{ color: 'var(--terracotta)' }} />
              <span className="text-sm" style={{ color: 'var(--clay)' }}>Total Paid</span>
            </div>
            <div className="text-3xl font-light" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
              €{totalPaid.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card className="border rounded-2xl" style={{ borderColor: 'var(--sand)', backgroundColor: 'var(--warm-white)' }}>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5" style={{ color: 'var(--clay)' }} />
              <span className="text-sm" style={{ color: 'var(--clay)' }}>Pending</span>
            </div>
            <div className="text-3xl font-light" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
              {pendingPayments.length}
            </div>
          </CardContent>
        </Card>

        <Card className="border rounded-2xl" style={{ borderColor: 'var(--sand)', backgroundColor: 'var(--warm-white)' }}>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle2 className="w-5 h-5" style={{ color: 'var(--sage)' }} />
              <span className="text-sm" style={{ color: 'var(--clay)' }}>Completed</span>
            </div>
            <div className="text-3xl font-light" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
              {completedPayments.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment List */}
      <div className="space-y-4">
        {payments.length === 0 ? (
          <Card className="border rounded-2xl p-12 text-center" style={{ borderColor: 'var(--sand)', backgroundColor: 'var(--warm-white)' }}>
            <DollarSign className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--clay)' }} />
            <h3 className="text-xl font-light mb-2" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
              No payments yet
            </h3>
            <p className="text-sm" style={{ color: 'var(--clay)' }}>
              Payments for completed shifts will appear here
            </p>
          </Card>
        ) : (
          payments.map(payment => {
            const config = statusConfig[payment.status] || statusConfig.pending;
            const StatusIcon = config.icon;

            return (
              <Card key={payment.id} className="border rounded-2xl" style={{ borderColor: 'var(--sand)', backgroundColor: 'var(--warm-white)' }}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--sand)' }}>
                        <DollarSign className="w-6 h-6" style={{ color: 'var(--terracotta)' }} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-normal text-lg mb-1" style={{ color: 'var(--earth)' }}>
                          {payment.venue_name}
                        </h4>
                        <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--clay)' }}>
                          <User className="w-4 h-4" />
                          {payment.worker_name}
                        </div>
                      </div>
                    </div>
                    <Badge className="font-normal flex items-center gap-1" style={{ backgroundColor: config.color, color: config.textColor }}>
                      <StatusIcon className="w-3 h-3" />
                      {payment.status}
                    </Badge>
                  </div>

                  <div className="grid md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="flex items-center gap-1 mb-1" style={{ color: 'var(--clay)' }}>
                        <Calendar className="w-4 h-4" />
                        Date
                      </div>
                      <div className="font-normal" style={{ color: 'var(--earth)' }}>
                        {new Date(payment.shift_date).toLocaleDateString('en-IE', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-1 mb-1" style={{ color: 'var(--clay)' }}>
                        <Clock className="w-4 h-4" />
                        Hours
                      </div>
                      <div className="font-normal" style={{ color: 'var(--earth)' }}>
                        {payment.hours_worked}h @ €{payment.hourly_rate}/h
                      </div>
                    </div>

                    <div>
                      <div className="mb-1" style={{ color: 'var(--clay)' }}>
                        Platform Fee
                      </div>
                      <div className="font-normal" style={{ color: 'var(--earth)' }}>
                        €{payment.platform_fee_employer?.toFixed(2)}
                      </div>
                    </div>

                    <div>
                      <div className="mb-1" style={{ color: 'var(--clay)' }}>
                        Total
                      </div>
                      <div className="font-normal text-lg" style={{ color: 'var(--earth)' }}>
                        €{payment.employer_total?.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {payment.paid_at && (
                    <div className="mt-4 pt-4 border-t text-xs" style={{ borderColor: 'var(--sand)', color: 'var(--clay)' }}>
                      Paid on {new Date(payment.paid_at).toLocaleDateString('en-IE', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}