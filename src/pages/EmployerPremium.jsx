import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Check, Zap, TrendingUp, Star, Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function EmployerPremium() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    base44.auth.me()
      .then(setUser)
      .catch(() => base44.auth.redirectToLogin())
      .finally(() => setLoading(false));
  }, []);

  const isPremium = user?.employer_premium === true;

  const handleUpgrade = async () => {
    if (window.self !== window.top) {
      toast.info('Checkout opens in the published app. Opening now...', { duration: 3000 });
      window.open(window.location.href, '_blank');
      return;
    }

    setProcessing(true);
    try {
      const { data } = await base44.functions.invoke('createPremiumSubscription', {});

      if (data?.sessionUrl) {
        window.location.href = data.sessionUrl;
      } else if (data?.error) {
        toast.error(data.error);
        setProcessing(false);
      } else {
        toast.error('Failed to start subscription. Please try again.');
        setProcessing(false);
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast.error('Failed to start subscription. Please try again.');
      setProcessing(false);
    }
  };

  const features = [
    {
      icon: Star,
      title: "Featured Shift Listings",
      description: "Your shifts appear at the top of search results with a featured badge",
      highlight: true
    },
    {
      icon: Sparkles,
      title: "Featured Job Postings",
      description: "Permanent positions get premium placement and visibility",
      highlight: true
    },
    {
      icon: Zap,
      title: "Priority Support",
      description: "Get faster response times and dedicated support",
    },
    {
      icon: TrendingUp,
      title: "Advanced Analytics",
      description: "Detailed insights into application trends and worker engagement",
    },
    {
      icon: Crown,
      title: "Premium Badge",
      description: "Display a premium badge on your venue profile to attract top talent",
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--cream)' }}>
        <div className="animate-spin rounded-full h-8 w-8 border-2" style={{ borderColor: 'var(--sand)', borderTopColor: 'var(--terracotta)' }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--cream)' }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full" style={{ backgroundColor: 'var(--sand)' }}>
            <Crown className="w-4 h-4" style={{ color: 'var(--terracotta)' }} />
            <span className="text-sm font-normal tracking-wide" style={{ color: 'var(--earth)' }}>
              PREMIUM FOR EMPLOYERS
            </span>
          </div>
          <h1 className="text-5xl font-light mb-4 tracking-tight" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
            Hospo+ Premium
          </h1>
          <p className="text-xl font-light max-w-2xl mx-auto" style={{ color: 'var(--clay)' }}>
            Get featured placement for all your shifts and jobs. Stand out and attract the best hospitality talent in Ireland.
          </p>
        </div>

        {/* Current Status */}
        {isPremium && (
          <Card className="border-2 rounded-2xl mb-8" style={{ borderColor: '#FFD700', backgroundColor: 'var(--warm-white)' }}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FFD70020' }}>
                  <Crown className="w-6 h-6" style={{ color: '#FFD700' }} />
                </div>
                <div>
                  <div className="text-lg font-normal" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
                    You're a Premium Member
                  </div>
                  <div className="text-sm" style={{ color: 'var(--clay)' }}>
                    Enjoy featured placement for all your listings
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Features List */}
          <div className="lg:col-span-2 space-y-4">
            {features.map((feature, idx) => (
              <Card 
                key={idx} 
                className="border rounded-2xl transition-all hover-lift"
                style={{ 
                  borderColor: feature.highlight ? 'var(--terracotta)' : 'var(--sand)', 
                  backgroundColor: feature.highlight ? 'var(--terracotta)10' : 'var(--warm-white)' 
                }}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: feature.highlight ? 'var(--terracotta)' : 'var(--sand)' }}
                    >
                      <feature.icon 
                        className="w-6 h-6" 
                        style={{ color: feature.highlight ? 'white' : 'var(--terracotta)' }} 
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-normal" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
                          {feature.title}
                        </h3>
                        {feature.highlight && (
                          <Badge className="rounded-full" style={{ backgroundColor: 'var(--terracotta)', color: 'white' }}>
                            Popular
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm font-light" style={{ color: 'var(--clay)' }}>
                        {feature.description}
                      </p>
                    </div>
                    <Check className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--sage)' }} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pricing Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <Card className="border-2 rounded-3xl" style={{ borderColor: 'var(--terracotta)', backgroundColor: 'var(--warm-white)' }}>
                <CardHeader className="text-center pb-6" style={{ backgroundColor: 'var(--terracotta)10' }}>
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--terracotta)' }}>
                    <Crown className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-3xl font-light mb-2" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
                    Hospo+ Premium
                  </CardTitle>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-5xl font-light" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
                      €29.99
                    </span>
                    <span className="text-lg" style={{ color: 'var(--clay)' }}>/month</span>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--sage)' }} />
                      <span style={{ color: 'var(--earth)' }}>All shifts featured</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--sage)' }} />
                      <span style={{ color: 'var(--earth)' }}>All jobs featured</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--sage)' }} />
                      <span style={{ color: 'var(--earth)' }}>Premium venue badge</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--sage)' }} />
                      <span style={{ color: 'var(--earth)' }}>Priority support</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--sage)' }} />
                      <span style={{ color: 'var(--earth)' }}>Advanced analytics</span>
                    </div>
                  </div>

                  {isPremium ? (
                    <Button
                      disabled
                      className="w-full rounded-xl py-6 font-normal"
                      style={{ backgroundColor: 'var(--sage)', color: 'white' }}
                    >
                      <Check className="w-5 h-5 mr-2" />
                      Active Subscription
                    </Button>
                  ) : (
                    <Button
                      onClick={handleUpgrade}
                      disabled={processing}
                      className="w-full rounded-xl py-6 font-normal"
                      style={{ backgroundColor: 'var(--terracotta)', color: 'white' }}
                    >
                      {processing ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Upgrade to Premium
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </>
                      )}
                    </Button>
                  )}

                  <p className="text-xs text-center" style={{ color: 'var(--clay)' }}>
                    Cancel anytime. No long-term commitment required.
                  </p>
                </CardContent>
              </Card>

              {!isPremium && (
                <div className="mt-6 p-4 rounded-xl" style={{ backgroundColor: 'var(--sand)' }}>
                  <p className="text-sm text-center" style={{ color: 'var(--clay)' }}>
                    <strong style={{ color: 'var(--earth)' }}>Limited Time:</strong> Get 50% more applications on average with featured listings
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Social Proof */}
        <div className="mt-16 text-center">
          <p className="text-sm tracking-wider mb-6" style={{ color: 'var(--clay)' }}>
            TRUSTED BY IRELAND'S TOP HOSPITALITY VENUES
          </p>
          <div className="flex justify-center items-center gap-12 flex-wrap opacity-60">
            <div className="text-2xl font-light" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
              Coffee Culture
            </div>
            <div className="text-2xl font-light" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
              Bean There
            </div>
            <div className="text-2xl font-light" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
              The Daily Grind
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}