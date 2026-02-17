import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Briefcase, TrendingUp, Users, CheckCircle, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";

export default function EmployerLogin() {
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    base44.auth.me()
      .then(user => {
        // User is logged in - check if they have a venue setup
        if (user.coffee_shop_id || user.restaurant_id) {
          // Already has venue, go to dashboard
          window.location.href = createPageUrl("EmployerDashboard");
        } else {
          // Logged in but no venue - go to signup/onboarding
          window.location.href = createPageUrl("EmployerSignup");
        }
      })
      .catch(() => {
        // Not logged in, show login page
        setChecking(false);
      });
  }, []);

  const handleSignIn = () => {
    base44.auth.redirectToLogin(createPageUrl("EmployerDashboard"));
  };

  const handleCreateAccount = () => {
    window.location.href = createPageUrl("EmployerSignup");
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--cream)' }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--terracotta)' }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: 'var(--cream)' }}>
      <div className="max-w-6xl w-full grid md:grid-cols-2 gap-12 items-center">
        {/* Left side - Branding */}
        <div className="space-y-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'var(--terracotta)' }}>
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-light tracking-tight" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
                  Hospo
                </h1>
                <p className="text-sm tracking-wider" style={{ color: 'var(--clay)' }}>
                  FOR EMPLOYERS
                </p>
              </div>
            </div>
            <p className="text-2xl font-light leading-relaxed" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
              Find the perfect talent for your hospitality business
            </p>
          </div>

          <div className="space-y-4">
            {[
              { icon: Users, text: "Access Ireland's top hospitality professionals" },
              { icon: Briefcase, text: "Post shifts and permanent positions" },
              { icon: TrendingUp, text: "Advanced analytics and reporting" },
              { icon: CheckCircle, text: "Streamlined hiring process" }
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--sand)' }}>
                  <feature.icon className="w-5 h-5" style={{ color: 'var(--terracotta)' }} />
                </div>
                <span className="font-normal" style={{ color: 'var(--earth)' }}>
                  {feature.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right side - Sign In Card */}
        <Card className="border-2 rounded-3xl" style={{ borderColor: 'var(--sand)', backgroundColor: 'var(--warm-white)' }}>
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-3xl font-light mb-2" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
              Employer Portal
            </CardTitle>
            <p className="text-sm" style={{ color: 'var(--clay)' }}>
              Sign in to manage your shifts, jobs, and applications
            </p>
          </CardHeader>
          <CardContent className="space-y-6 px-8 pb-8">
            <div className="space-y-4">
              <Button
                onClick={handleSignIn}
                className="w-full rounded-xl py-6 font-normal text-base"
                style={{ backgroundColor: 'var(--terracotta)', color: 'white' }}
              >
                <Building2 className="w-5 h-5 mr-2" />
                Sign In as Employer
              </Button>

              <div className="text-center">
                <p className="text-sm mb-3" style={{ color: 'var(--clay)' }}>
                  New to Hospo?
                </p>
                <Button
                  onClick={handleCreateAccount}
                  variant="outline"
                  className="rounded-xl font-normal"
                  style={{ borderColor: 'var(--sand)' }}
                >
                  Create Employer Account
                </Button>
              </div>
            </div>

            <div className="pt-6 border-t text-center text-xs space-y-2" style={{ borderColor: 'var(--sand)', color: 'var(--clay)' }}>
              <p>
                After signing in, you'll complete a quick onboarding to set up your venue profile.
              </p>
              <p>
                Already have a worker account? You can access employer features from your dashboard.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}