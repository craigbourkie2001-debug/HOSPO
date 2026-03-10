import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, User, Clock, Calendar, CreditCard, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function PayShiftModal({ shift, onClose }) {
  const [processing, setProcessing] = useState(false);

  // Check if payment already exists
  const { data: existingPayments = [], isLoading } = useQuery({
    queryKey: ['shift-payment', shift.id],
    queryFn: () => base44.entities.Payment.filter({ shift_id: shift.id })
  });

  // Calculate payment details — 10% fee on both sides
  const calculatePayment = () => {
    const startTime = new Date(`${shift.date}T${shift.start_time}`);
    const endTime = new Date(`${shift.date}T${shift.end_time}`);
    const hoursWorked = (endTime - startTime) / (1000 * 60 * 60);
    
    const grossAmount = hoursWorked * shift.hourly_rate;
    const platformFeeEmployer = grossAmount * 0.10;
    const platformFeeWorker = grossAmount * 0.10;
    const workerPayout = grossAmount - platformFeeWorker;
    const employerTotal = grossAmount + platformFeeEmployer;

    return { hoursWorked, grossAmount, platformFeeEmployer, platformFeeWorker, workerPayout, employerTotal };
  };

  const payment = calculatePayment();
  const existingPayment = existingPayments[0];

  const handlePayment = async () => {
    // Check if running in iframe (preview)
    if (window.self !== window.top) {
      toast.error('Payments only work in the published app. Please publish your app to test payments.');
      return;
    }

    setProcessing(true);
    try {
      const { data } = await base44.functions.invoke('createShiftPayment', {
        shift_id: shift.id
      });

      if (data.sessionUrl) {
        window.location.href = data.sessionUrl;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Failed to initiate payment. Please try again.');
      setProcessing(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl" style={{ backgroundColor: 'var(--warm-white)' }}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-light" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
            Pay Worker for Shift
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2" style={{ borderColor: 'var(--sand)', borderTopColor: 'var(--terracotta)' }} />
          </div>
        ) : existingPayment && existingPayment.status === 'completed' ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-xl" style={{ backgroundColor: '#8A9B8E20' }}>
              <CreditCard className="w-6 h-6" style={{ color: '#8A9B8E' }} />
              <div>
                <div className="font-normal" style={{ color: 'var(--earth)' }}>Payment Completed</div>
                <div className="text-sm" style={{ color: 'var(--clay)' }}>
                  Paid on {new Date(existingPayment.paid_at).toLocaleDateString()}
                </div>
              </div>
            </div>

            <Card className="border rounded-2xl" style={{ borderColor: 'var(--sand)', backgroundColor: 'var(--warm-white)' }}>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--clay)' }}>Worker Payout</span>
                    <span className="font-normal" style={{ color: 'var(--earth)' }}>€{existingPayment.worker_payout.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--clay)' }}>Total Paid</span>
                    <span className="text-lg font-normal" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
                      €{existingPayment.employer_total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button onClick={onClose} variant="outline" className="w-full rounded-xl font-normal">
              Close
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Worker Info */}
            <Card className="border rounded-2xl" style={{ borderColor: 'var(--sand)', backgroundColor: 'var(--warm-white)' }}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--sand)' }}>
                    <User className="w-6 h-6" style={{ color: 'var(--terracotta)' }} />
                  </div>
                  <div>
                    <div className="font-normal text-lg" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
                      {shift.assigned_to_name}
                    </div>
                    <div className="text-sm" style={{ color: 'var(--clay)' }}>{shift.assigned_to}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2" style={{ color: 'var(--clay)' }}>
                    <Calendar className="w-4 h-4" />
                    {new Date(shift.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2" style={{ color: 'var(--clay)' }}>
                    <Clock className="w-4 h-4" />
                    {shift.start_time} - {shift.end_time}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Breakdown */}
            <Card className="border rounded-2xl" style={{ borderColor: 'var(--sand)', backgroundColor: 'var(--warm-white)' }}>
              <CardContent className="p-6">
                <h3 className="font-normal mb-4" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
                  Payment Breakdown
                </h3>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span style={{ color: 'var(--clay)' }}>Hours Worked</span>
                    <span className="font-normal" style={{ color: 'var(--earth)' }}>{payment.hoursWorked}h</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: 'var(--clay)' }}>Hourly Rate</span>
                    <span className="font-normal" style={{ color: 'var(--earth)' }}>€{shift.hourly_rate}/h</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: 'var(--clay)' }}>Worker Gross Earnings</span>
                    <span className="font-normal" style={{ color: 'var(--earth)' }}>€{payment.grossAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: 'var(--clay)' }}>Employer Platform Fee (10%)</span>
                    <span className="font-normal" style={{ color: 'var(--earth)' }}>+€{payment.platformFeeEmployer.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: 'var(--clay)' }}>Worker Service Fee (10%)</span>
                    <span className="font-normal" style={{ color: 'var(--earth)' }}>−€{payment.platformFeeWorker.toFixed(2)}</span>
                  </div>
                </div>

                <div className="pt-4 border-t" style={{ borderColor: 'var(--sand)' }}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-normal" style={{ color: 'var(--earth)' }}>Worker Receives</span>
                    <span className="text-lg font-normal" style={{ fontFamily: 'Crimson Pro, serif', color: '#8A9B8E' }}>
                      €{payment.workerPayout.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-xs mb-0" style={{ color: 'var(--clay)' }}>
                    Transferred to worker's IBAN within 3–5 business days
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--sand)' }}>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-normal" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
                      You Pay
                    </span>
                    <span className="text-2xl font-light" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--terracotta)' }}>
                      €{payment.employerTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Info Alert */}
            <div className="flex items-start gap-3 p-4 rounded-xl" style={{ backgroundColor: 'var(--sand)' }}>
              <AlertCircle className="w-5 h-5 mt-0.5" style={{ color: 'var(--terracotta)' }} />
              <div className="text-sm" style={{ color: 'var(--clay)' }}>
                You'll be redirected to Stripe's secure payment page. Payment confirmation emails will be sent to both you and the worker.
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={onClose}
                variant="outline"
                className="flex-1 rounded-xl font-normal"
                style={{ borderColor: 'var(--sand)' }}
                disabled={processing}
              >
                Cancel
              </Button>
              <Button
                onClick={handlePayment}
                disabled={processing}
                className="flex-1 rounded-xl font-normal"
                style={{ backgroundColor: 'var(--terracotta)', color: 'white' }}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                {processing ? 'Processing...' : 'Proceed to Payment'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}