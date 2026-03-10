import React from "react";
import { base44 } from "@/api/base44Client";
import { ChevronRight, Briefcase, Store } from "lucide-react";
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
      }
    }).catch(() => {});
  }, []);

  const handleSignIn = async (type) => {
    const user = await base44.auth.me().catch(() => null);
    if (user) {
      if (user.onboarding_completed) {
        const isEmployer = user.account_type === 'employer' || user.role === 'employer';
        window.location.href = createPageUrl(isEmployer ? 'EmployerDashboard' : 'BrowseShifts');
      } else {
        await base44.auth.updateMe({ account_type: type });
        window.location.href = createPageUrl(type === 'employer' ? 'EmployerDashboard' : 'BrowseShifts');
      }
    } else {
      const returnUrl = window.location.origin + createPageUrl('Welcome') + `?intent=${type}`;
      base44.auth.redirectToLogin(returnUrl);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F2F2F7' }}>
      
      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">

        {/* Logo */}
        <div className="mb-8">
          <HospoLogo size="lg" showText={false} />
        </div>

        {/* Title */}
        <div className="text-center mb-12">
          <h1
            className="text-[34px] font-bold tracking-tight mb-2"
            style={{ color: '#1C1C1E', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}
          >
            Hospo Ireland
          </h1>
          <p className="text-[17px] leading-relaxed" style={{ color: '#8E8E93' }}>
            Hospitality staffing, done right.
          </p>
        </div>

        {/* Choice cards */}
        <div className="w-full max-w-sm space-y-3">

          <button
            onClick={() => handleSignIn('worker')}
            className="w-full bg-white rounded-2xl p-5 text-left transition-all active:scale-[0.98] active:opacity-90"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)' }}
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#F2F2F7' }}>
                <Briefcase className="w-5 h-5" style={{ color: '#C89F8C', strokeWidth: 1.5 }} />
              </div>
              <div className="flex-1 text-left">
                <div className="text-[16px] font-semibold mb-0.5" style={{ color: '#1C1C1E' }}>
                  Looking for work
                </div>
                <div className="text-[13px]" style={{ color: '#8E8E93' }}>
                  Browse shifts across Ireland
                </div>
              </div>
              <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: '#C7C7CC' }} />
            </div>
          </button>

          <button
            onClick={() => handleSignIn('employer')}
            className="w-full rounded-2xl p-5 text-left transition-all active:scale-[0.98] active:opacity-90"
            style={{
              backgroundColor: '#C89F8C',
              boxShadow: '0 2px 10px rgba(200,159,140,0.35)'
            }}
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                <Store className="w-5 h-5 text-white" strokeWidth={1.5} />
              </div>
              <div className="flex-1 text-left">
                <div className="text-[16px] font-semibold mb-0.5 text-white">
                  Hiring staff
                </div>
                <div className="text-[13px] text-white" style={{ opacity: 0.75 }}>
                  Post shifts, find verified talent
                </div>
              </div>
              <ChevronRight className="w-4 h-4 flex-shrink-0 text-white" style={{ opacity: 0.6 }} />
            </div>
          </button>

        </div>
      </div>

      {/* Footer */}
      <div className="px-6 pb-10 text-center">
        <p className="text-[12px]" style={{ color: '#C7C7CC' }}>
          By continuing you agree to our{' '}
          <a href={createPageUrl('TermsAndConditions')} className="underline" style={{ color: '#AEAEB2' }}>
            Terms & Conditions
          </a>
          {' '}· GDPR compliant
        </p>
      </div>
    </div>
  );
}