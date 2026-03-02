import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Crown, Zap, Star, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function Premium() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'true') {
      toast.success('Welcome to Hospo+ Premium! Your subscription is now active.');
    }
  }, []);

  const handleUpgrade = async () => {
    if (window.self !== window.top) {
      toast.info('Checkout opens in the published app. Opening now...', { duration: 3000 });
      // Try to open in parent or new tab
      const targetUrl = window.location.href;
      window.open(targetUrl, '_blank');
      return;
    }
    setIsLoading(true);
    try {
      const { data } = await base44.functions.invoke('createWorkerSubscription', {});
      if (data?.sessionUrl) {
        window.location.href = data.sessionUrl;
      } else if (data?.error) {
        toast.error(data.error);
      } else {
        toast.error('Failed to start checkout. Please try again.');
      }
    } catch (error) {
      toast.error('Failed to start checkout. Please try again.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--cream)' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-2" style={{ borderColor: 'var(--sand)', borderTopColor: 'var(--terracotta)' }} />
      </div>
    );
  }

  const isPremium = user.is_premium && user.premium_expires_at && new Date(user.premium_expires_at) > new Date();

  return (
    <div className="min-h-screen p-6 md:p-12" style={{ backgroundColor: 'var(--cream)' }}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
            style={{ backgroundColor: 'var(--sand)' }}
          >
            <Crown className="w-5 h-5" style={{ color: 'var(--terracotta)' }} />
            <span className="font-medium" style={{ color: 'var(--earth)' }}>Premium Membership</span>
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-light mb-4 tracking-tight" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
            Hospo+
          </h1>
          <p className="text-xl font-light" style={{ color: 'var(--clay)' }}>
            Get matched first. Stand out from the crowd.
          </p>
        </div>

        {/* Current Status */}
        {isPremium && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 rounded-2xl text-center"
            style={{ backgroundColor: 'var(--terracotta)', color: 'white' }}
          >
            <Crown className="w-12 h-12 mx-auto mb-3" />
            <h3 className="text-2xl font-light mb-2" style={{ fontFamily: 'Crimson Pro, serif' }}>
              You're a Hospo+ Member
            </h3>
            <p className="opacity-90">
              Expires {new Date(user.premium_expires_at).toLocaleDateString()}
            </p>
          </motion.div>
        )}

        {/* Pricing Card */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="border-2 rounded-2xl" style={{ borderColor: 'var(--sand)', backgroundColor: 'var(--warm-white)' }}>
            <CardHeader>
              <CardTitle className="text-2xl font-light" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
                Free Plan
              </CardTitle>
              <div className="text-4xl font-light mt-4" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
                €0<span className="text-lg" style={{ color: 'var(--clay)' }}>/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 mt-0.5" style={{ color: 'var(--sage)' }} />
                <span style={{ color: 'var(--clay)' }}>Browse all available shifts</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 mt-0.5" style={{ color: 'var(--sage)' }} />
                <span style={{ color: 'var(--clay)' }}>Apply for shifts</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 mt-0.5" style={{ color: 'var(--sage)' }} />
                <span style={{ color: 'var(--clay)' }}>Basic profile</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 rounded-2xl relative overflow-hidden" style={{ borderColor: 'var(--terracotta)', backgroundColor: 'var(--warm-white)' }}>
            <div className="absolute top-0 right-0 px-4 py-1 text-xs font-bold text-white" style={{ backgroundColor: 'var(--terracotta)' }}>
              RECOMMENDED
            </div>
            <CardHeader>
              <CardTitle className="text-2xl font-light flex items-center gap-2" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
                <Crown className="w-6 h-6" style={{ color: 'var(--terracotta)' }} />
                Hospo+
              </CardTitle>
              <div className="text-4xl font-light mt-4" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
                €9.99<span className="text-lg" style={{ color: 'var(--clay)' }}>/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 mt-0.5" style={{ color: 'var(--terracotta)' }} />
                <span style={{ color: 'var(--earth)' }}><strong>Priority matching</strong> - Get shown to employers first</span>
              </div>
              <div className="flex items-start gap-3">
                <Star className="w-5 h-5 mt-0.5" style={{ color: 'var(--terracotta)' }} />
                <span style={{ color: 'var(--earth)' }}><strong>Featured profile</strong> - Stand out in search results</span>
              </div>
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 mt-0.5" style={{ color: 'var(--terracotta)' }} />
                <span style={{ color: 'var(--earth)' }}><strong>Advanced analytics</strong> - Track your performance</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 mt-0.5" style={{ color: 'var(--sage)' }} />
                <span style={{ color: 'var(--clay)' }}>Everything in Free plan</span>
              </div>
              <Button
                onClick={handleUpgrade}
                disabled={isLoading || isPremium}
                className="w-full mt-6 rounded-xl font-normal"
                style={{ backgroundColor: 'var(--terracotta)', color: 'white', minHeight: '44px' }}
              >
                {isPremium ? 'Already Premium' : isLoading ? 'Processing...' : 'Upgrade to Hospo+'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* How It Works */}
        <Card className="border rounded-2xl" style={{ borderColor: 'var(--sand)', backgroundColor: 'var(--warm-white)' }}>
          <CardHeader>
            <CardTitle className="text-2xl font-light" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
              How Priority Matching Works
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4" style={{ color: 'var(--clay)' }}>
            <p>
              When employers browse candidates or receive AI recommendations, Hospo+ members appear at the top of the list. 
              This dramatically increases your visibility and chances of getting hired.
            </p>
            <p>
              Your profile also gets a premium badge, showing employers you're serious about your hospitality career.
            </p>
            <p className="font-medium" style={{ color: 'var(--earth)' }}>
              Cancel anytime. No commitments.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}