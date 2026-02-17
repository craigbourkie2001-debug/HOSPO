import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Gift, Check, Clock, Copy, Share2, Euro } from "lucide-react";
import { toast } from "sonner";
import MobileHeader from "../components/mobile/MobileHeader";

export default function Referrals() {
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: referrals = [], isLoading } = useQuery({
    queryKey: ['referrals', user?.email],
    queryFn: () => base44.entities.Referral.filter({ referrer_email: user?.email }),
    enabled: !!user?.email,
    initialData: []
  });

  const copyReferralCode = () => {
    if (user?.referral_code) {
      navigator.clipboard.writeText(user.referral_code);
      toast.success('Referral code copied!');
    }
  };

  const shareReferralCode = async () => {
    const shareText = `Join Hospo and use my referral code ${user?.referral_code} to get started in Ireland's best hospitality marketplace!`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Hospo',
          text: shareText,
          url: window.location.origin
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          copyReferralCode();
        }
      }
    } else {
      copyReferralCode();
    }
  };

  const statusConfig = {
    pending: { label: 'Signed Up', color: 'var(--clay)', icon: Clock },
    onboarded: { label: 'Onboarded', color: 'var(--olive)', icon: Check },
    first_shift_completed: { label: 'First Shift Done', color: 'var(--sage)', icon: Check },
    reward_paid: { label: 'Reward Paid', color: 'var(--terracotta)', icon: Gift }
  };

  const completedReferrals = referrals.filter(r => r.status === 'reward_paid').length;
  const pendingReferrals = referrals.filter(r => r.status !== 'reward_paid').length;
  const totalEarned = referrals.reduce((sum, r) => r.status === 'reward_paid' ? sum + (r.reward_amount || 0) : sum, 0);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--cream)' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-2" style={{ borderColor: 'var(--sand)', borderTopColor: 'var(--terracotta)' }} />
      </div>
    );
  }

  return (
    <>
      <MobileHeader title="Referrals" icon={Users} />
      <div className="min-h-screen p-6 md:p-12 md:pt-12 pt-24" style={{ backgroundColor: 'var(--cream)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-light mb-2" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
              Referral Program
            </h1>
            <p className="text-lg" style={{ color: 'var(--clay)' }}>
              Earn €50 for every friend you refer who completes their first shift
            </p>
          </div>

          {/* Referral Code Card */}
          <Card className="mb-8 border rounded-2xl overflow-hidden" style={{ borderColor: 'var(--sand)', backgroundColor: 'var(--warm-white)' }}>
            <div className="p-8" style={{ background: 'linear-gradient(135deg, var(--terracotta) 0%, var(--clay) 100%)' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                  <Gift className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-light text-white" style={{ fontFamily: 'Crimson Pro, serif' }}>
                  Your Referral Code
                </h2>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 px-6 py-4 rounded-xl text-center" style={{ backgroundColor: 'rgba(255,255,255,0.95)' }}>
                  <span className="text-3xl font-normal tracking-wider" style={{ color: 'var(--earth)', fontFamily: 'monospace' }}>
                    {user.referral_code || 'Loading...'}
                  </span>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={copyReferralCode}
                  className="flex-1 rounded-xl font-normal bg-white hover:bg-white/90"
                  style={{ color: 'var(--terracotta)' }}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Code
                </Button>
                <Button
                  onClick={shareReferralCode}
                  className="flex-1 rounded-xl font-normal"
                  style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </Card>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-5 mb-8">
            <Card className="border rounded-2xl" style={{ borderColor: 'var(--sand)', backgroundColor: 'var(--warm-white)' }}>
              <CardContent className="p-6 text-center">
                <Users className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--sage)', strokeWidth: 1.5 }} />
                <div className="text-3xl font-light mb-1" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
                  {referrals.length}
                </div>
                <div className="text-xs tracking-wider font-light" style={{ color: 'var(--clay)' }}>TOTAL REFERRALS</div>
              </CardContent>
            </Card>

            <Card className="border rounded-2xl" style={{ borderColor: 'var(--sand)', backgroundColor: 'var(--warm-white)' }}>
              <CardContent className="p-6 text-center">
                <Check className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--terracotta)', strokeWidth: 1.5 }} />
                <div className="text-3xl font-light mb-1" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
                  {completedReferrals}
                </div>
                <div className="text-xs tracking-wider font-light" style={{ color: 'var(--clay)' }}>COMPLETED</div>
              </CardContent>
            </Card>

            <Card className="border rounded-2xl" style={{ borderColor: 'var(--sand)', backgroundColor: 'var(--warm-white)' }}>
              <CardContent className="p-6 text-center">
                <Euro className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--olive)', strokeWidth: 1.5 }} />
                <div className="text-3xl font-light mb-1" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
                  €{totalEarned}
                </div>
                <div className="text-xs tracking-wider font-light" style={{ color: 'var(--clay)' }}>TOTAL EARNED</div>
              </CardContent>
            </Card>
          </div>

          {/* How It Works */}
          <Card className="mb-8 border rounded-2xl" style={{ borderColor: 'var(--sand)', backgroundColor: 'var(--warm-white)' }}>
            <CardHeader>
              <CardTitle className="font-normal" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
                How It Works
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white font-normal" style={{ backgroundColor: 'var(--terracotta)' }}>
                  1
                </div>
                <div>
                  <h4 className="font-normal text-lg mb-1" style={{ color: 'var(--earth)' }}>Share Your Code</h4>
                  <p className="text-sm" style={{ color: 'var(--clay)' }}>
                    Give your unique referral code to friends who want to join Hospo as workers
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white font-normal" style={{ backgroundColor: 'var(--sage)' }}>
                  2
                </div>
                <div>
                  <h4 className="font-normal text-lg mb-1" style={{ color: 'var(--earth)' }}>They Sign Up</h4>
                  <p className="text-sm" style={{ color: 'var(--clay)' }}>
                    Your friend creates an account and enters your referral code during onboarding
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white font-normal" style={{ backgroundColor: 'var(--olive)' }}>
                  3
                </div>
                <div>
                  <h4 className="font-normal text-lg mb-1" style={{ color: 'var(--earth)' }}>First Shift Completed</h4>
                  <p className="text-sm" style={{ color: 'var(--clay)' }}>
                    Once they complete their first shift, you both earn €50 credit!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Referral History */}
          <Card className="border rounded-2xl" style={{ borderColor: 'var(--sand)', backgroundColor: 'var(--warm-white)' }}>
            <CardHeader>
              <CardTitle className="font-normal" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
                Your Referrals ({referrals.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 mx-auto" style={{ borderColor: 'var(--sand)', borderTopColor: 'var(--terracotta)' }} />
                </div>
              ) : referrals.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--sand)' }} />
                  <p className="text-lg font-light mb-2" style={{ color: 'var(--earth)' }}>No referrals yet</p>
                  <p className="text-sm" style={{ color: 'var(--clay)' }}>
                    Share your code to start earning rewards!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {referrals.map((referral, idx) => {
                    const config = statusConfig[referral.status] || statusConfig.pending;
                    const StatusIcon = config.icon;
                    
                    return (
                      <div key={idx} className="p-4 rounded-xl flex items-center justify-between" style={{ backgroundColor: 'var(--cream)' }}>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-light" style={{ backgroundColor: 'var(--terracotta)' }}>
                            {referral.referred_name?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <h4 className="font-normal" style={{ color: 'var(--earth)' }}>
                              {referral.referred_name || referral.referred_email}
                            </h4>
                            <p className="text-xs" style={{ color: 'var(--clay)' }}>
                              Joined {new Date(referral.created_date).toLocaleDateString('en-IE', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {referral.status === 'reward_paid' && (
                            <span className="text-sm font-normal mr-2" style={{ color: 'var(--sage)' }}>
                              +€{referral.reward_amount || 50}
                            </span>
                          )}
                          <Badge 
                            className="flex items-center gap-1 border-0"
                            style={{ backgroundColor: config.color, color: 'white' }}
                          >
                            <StatusIcon className="w-3 h-3" />
                            {config.label}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}