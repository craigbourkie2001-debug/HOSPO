import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, DollarSign, Clock, User, AlertCircle, Loader2, CreditCard } from "lucide-react";
import { toast } from "sonner";

export default function PaymentModal({ shift, worker, onClose }) {
  const [loading, setLoading] = useState(false);

  // Calculate payment details
  const startTime = new Date(`2000-01-01T${shift.start_time}`);
  const endTime = new Date(`2000-01-01T${shift.end_time}`);
  const hours = (endTime - startTime) / (1000 * 60 * 60);
  
  const hourlyRate = shift.hourly_rate;
  const grossAmount = hours * hourlyRate;
  const platformFee = grossAmount * 0.10;
  const workerPayout = grossAmount - platformFee;
  const employerTotal = grossAmount;

  const handlePayment = async () => {
    setLoading(true);
    try {
      const { data } = await base44.functions.invoke('fundShiftPayment', {
        shift_id: shift.id
      });

      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to process payment');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="max-w-lg w-full rounded-2xl" style={{ backgroundColor: 'var(--warm-white)' }}>
        {/* Header */}
        <div className="p-6 border-b" style={{ borderColor: 'var(--sand)' }}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--terracotta)' }}>
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-light" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
                  Fund Shift Payment
                </h2>
                <p className="text-sm" style={{ color: 'var(--clay)' }}>
                  {shift.venue_name}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Worker Info */}
          <Card className="p-4 border" style={{ borderColor: 'var(--sand)', backgroundColor: 'var(--cream)' }}>
            <div className="flex items-center gap-3">
              <User className="w-5 h-5" style={{ color: 'var(--terracotta)' }} />
              <div>
                <p className="font-normal" style={{ color: 'var(--earth)' }}>{worker?.full_name || shift.assigned_to_name}</p>
                <p className="text-sm" style={{ color: 'var(--clay)' }}>{shift.assigned_to}</p>
              </div>
            </div>
          </Card>

          {/* Shift Details */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm" style={{ color: 'var(--clay)' }}>
                <Clock className="w-4 h-4" />
                Date & Time
              </span>
              <span className="font-normal" style={{ color: 'var(--earth)' }}>
                {shift.date} ({shift.start_time} - {shift.end_time})
              </span>
            </div>
          </div>

          {/* Payment Breakdown */}
          <div className="rounded-xl p-5 space-y-3" style={{ backgroundColor: 'var(--sand)' }}>
            <h3 className="font-normal mb-3" style={{ color: 'var(--earth)' }}>Payment Breakdown</h3>
            
            <div className="flex justify-between text-sm">
              <span style={{ color: 'var(--clay)' }}>Hours Worked</span>
              <span className="font-normal" style={{ color: 'var(--earth)' }}>{hours}h</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span style={{ color: 'var(--clay)' }}>Hourly Rate</span>
              <span className="font-normal" style={{ color: 'var(--earth)' }}>€{hourlyRate.toFixed(2)}/h</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span style={{ color: 'var(--clay)' }}>Gross Amount</span>
              <span className="font-normal" style={{ color: 'var(--earth)' }}>€{grossAmount.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span style={{ color: 'var(--clay)' }}>Platform Fee (10%)</span>
              <span className="font-normal" style={{ color: 'var(--earth)' }}>€{platformFee.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span style={{ color: 'var(--clay)' }}>Worker Receives</span>
              <span className="font-normal" style={{ color: 'var(--sage)' }}>€{workerPayout.toFixed(2)}</span>
            </div>
            
            <div className="pt-3 mt-3 border-t flex justify-between" style={{ borderColor: 'var(--cream)' }}>
              <span className="font-normal text-lg" style={{ color: 'var(--earth)' }}>Total You Pay</span>
              <span className="font-normal text-2xl" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
                €{employerTotal.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Notice */}
          {!worker?.stripe_connect_onboarded && (
            <div className="flex items-start gap-3 p-4 rounded-xl" style={{ backgroundColor: 'var(--terracotta)', color: 'white' }}>
              <AlertCircle className="w-5 h-5 mt-0.5" />
              <div className="text-sm">
                <p className="font-normal mb-1">Payment Setup Required</p>
                <p className="opacity-90">The worker needs to complete their payment setup before you can fund this shift.</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 rounded-xl font-normal"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePayment}
              disabled={loading || !worker?.stripe_connect_onboarded}
              className="flex-1 rounded-xl font-normal"
              style={{ backgroundColor: 'var(--terracotta)', color: 'white' }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Fund Payment
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}