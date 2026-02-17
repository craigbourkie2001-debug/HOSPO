import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function StripeConnectBanner({ user }) {
  const [loading, setLoading] = useState(false);

  const handleConnectStripe = async () => {
    setLoading(true);
    try {
      const { data } = await base44.functions.invoke('createStripeConnectAccount');
      
      if (data.url) {
        window.open(data.url, '_blank');
        toast.success('Complete setup in the new tab');
      }
    } catch (error) {
      toast.error('Failed to connect Stripe account');
    } finally {
      setLoading(false);
    }
  };

  // Don't show if already connected
  if (user?.stripe_connect_onboarded) {
    return (
      <Card className="border rounded-2xl mb-6" style={{ borderColor: 'var(--sage)', backgroundColor: 'var(--sage)' }}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3 text-white">
            <CheckCircle2 className="w-5 h-5" />
            <div className="flex-1">
              <p className="font-normal">Payment Setup Complete</p>
              <p className="text-sm opacity-90">You can now receive shift payments</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show setup prompt if not connected
  return (
    <Card className="border rounded-2xl mb-6" style={{ borderColor: 'var(--terracotta)', backgroundColor: 'var(--warm-white)' }}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--terracotta)' }}>
            <DollarSign className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-normal mb-2" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
              Setup Payment Account
            </h3>
            <p className="text-sm mb-4" style={{ color: 'var(--clay)' }}>
              Connect your bank account to receive payments for completed shifts. Setup takes just 2 minutes.
            </p>
            <Button
              onClick={handleConnectStripe}
              disabled={loading}
              className="rounded-xl font-normal"
              style={{ backgroundColor: 'var(--terracotta)', color: 'white' }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <DollarSign className="w-4 h-4 mr-2" />
                  Connect Bank Account
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}