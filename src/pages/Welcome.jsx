import React from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { ArrowRight, Coffee, ChefHat, Clock, Store } from "lucide-react";
import { createPageUrl } from "@/utils";
import HospoLogo from "../components/HospoLogo";

export default function Welcome() {
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const intent = urlParams.get('intent');

    base44.auth.me().then(async user => {
      if (user) {
        if (!user.onboarding_completed && intent) {
          await base44.auth.updateMe({ account_type: intent });
          window.location.href = createPageUrl(intent === 'employer' ? 'EmployerDashboard' : 'BrowseShifts');
        } else if (user.onboarding_completed) {
          const isEmployer = user.account_type === 'employer' || user.role === 'employer';
          window.location.href = createPageUrl(isEmployer ? 'EmployerDashboard' : 'BrowseShifts');
        }
        // If incomplete and no intent, STAY on Welcome page to let them choose
      }
    }).catch(() => {
      // Not authenticated, stay on welcome page
    });
  }, []);

  const handleSignIn = async (type) => {
    const user = await base44.auth.me().catch(() => null);
    
    if (user) {
      // User is already logged in
      if (user.onboarding_completed) {
        // Already onboarded, redirect to dashboard
        const isEmployer = user.account_type === 'employer' || user.role === 'employer';
        window.location.href = createPageUrl(isEmployer ? 'EmployerDashboard' : 'BrowseShifts');
      } else {
        // Logged in but not onboarded - update intent and go to onboarding
        await base44.auth.updateMe({ account_type: type });
        window.location.href = createPageUrl(type === 'employer' ? 'EmployerDashboard' : 'BrowseShifts');
      }
    } else {
      // Not logged in - redirect to login
      const returnUrl = window.location.origin + createPageUrl('Welcome') + `?intent=${type}`;
      base44.auth.redirectToLogin(returnUrl);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12" style={{ 
      backgroundColor: '#FAF8F5',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div className="max-w-2xl w-full text-center">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <HospoLogo size="lg" />
        </div>

        {/* Main Heading */}
        <h1 className="text-5xl md:text-6xl font-light mb-4 tracking-tight" 
            style={{ fontFamily: 'Crimson Pro, serif', color: '#705D56' }}>
          Welcome
        </h1>
        
        <p className="text-lg md:text-xl font-light mb-12" style={{ color: '#A67C6D' }}>
          Ireland's hospitality staffing platform
        </p>

        {/* Sign In Options */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="p-8 rounded-2xl flex flex-col items-center justify-center text-center hover-lift cursor-pointer transition-all" 
               style={{ backgroundColor: '#FFFCF7', border: '1px solid #E8E3DC' }}
               onClick={() => handleSignIn('worker')}>
            <Coffee className="w-12 h-12 mb-4" style={{ color: '#C89F8C' }} strokeWidth={1.5} />
            <h3 className="text-2xl font-light mb-2" style={{ fontFamily: 'Crimson Pro, serif', color: '#705D56' }}>I'm looking for shifts</h3>
            <p className="text-sm font-light mb-6" style={{ color: '#A67C6D' }}>Find flexible hospitality work</p>
            <Button
              className="rounded-xl px-8 py-6 w-full text-base font-normal tracking-wide transition-all duration-300"
              style={{ backgroundColor: '#C89F8C', color: 'white', border: 'none', pointerEvents: 'none' }}
            >
              Sign In as Worker
              <ArrowRight className="w-5 h-5 ml-2" strokeWidth={1.5} />
            </Button>
          </div>
          
          <div className="p-8 rounded-2xl flex flex-col items-center justify-center text-center hover-lift cursor-pointer transition-all" 
               style={{ backgroundColor: '#FFFCF7', border: '1px solid #E8E3DC' }}
               onClick={() => handleSignIn('employer')}>
            <Store className="w-12 h-12 mb-4" style={{ color: '#C89F8C' }} strokeWidth={1.5} />
            <h3 className="text-2xl font-light mb-2" style={{ fontFamily: 'Crimson Pro, serif', color: '#705D56' }}>I want to hire staff</h3>
            <p className="text-sm font-light mb-6" style={{ color: '#A67C6D' }}>Post shifts and find talent</p>
            <Button
              className="rounded-xl px-8 py-6 w-full text-base font-normal tracking-wide transition-all duration-300"
              style={{ backgroundColor: '#705D56', color: 'white', border: 'none', pointerEvents: 'none' }}
            >
              Sign In as Employer
              <ArrowRight className="w-5 h-5 ml-2" strokeWidth={1.5} />
            </Button>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-12 pt-8 border-t flex items-center justify-center gap-2" style={{ borderColor: '#E8E3DC' }}>
          <p className="text-sm font-light" style={{ color: '#A67C6D' }}>
            Connect with top venues across Ireland
          </p>
        </div>
      </div>
    </div>
  );
}