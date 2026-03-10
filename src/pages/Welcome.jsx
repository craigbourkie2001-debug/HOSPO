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
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--cream)', fontFamily: 'Crimson Pro, Georgia, serif' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@300;400;500;600;700&display=swap');`}</style>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">

        {/* Logo */}
        <div className="mb-10">
          <HospoLogo size="xl" showText={true} />
        </div>

        {/* Tagline */}
        <div className="text-center mb-14">
          <p className="text-xl font-light tracking-wide" style={{ color: 'var(--clay)' }}>
            Hospitality staffing, done right.
          </p>
        </div>

        {/* Choice cards */}
        <div className="w-full max-w-sm space-y-4">

          <button
            onClick={() => handleSignIn('worker')}
            className="w-full rounded-2xl p-6 text-left transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98]"
            style={{ backgroundColor: 'var(--warm-white)', border: '1px solid var(--sand)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--sand)' }}>
                <Briefcase className="w-5 h-5" style={{ color: 'var(--terracotta)', strokeWidth: 1.5 }} />
              </div>
              <div className="flex-1 text-left">
                <div className="text-lg font-normal mb-0.5" style={{ color: 'var(--earth)' }}>
                  Looking for work
                </div>
                <div className="text-sm font-light" style={{ color: 'var(--clay)' }}>
                  Browse shifts across Ireland
                </div>
              </div>
              <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--clay)' }} />
            </div>
          </button>

          <button
            onClick={() => handleSignIn('employer')}
            className="w-full rounded-2xl p-6 text-left transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98]"
            style={{ backgroundColor: 'var(--earth)', border: '1px solid var(--earth)', boxShadow: '0 2px 12px rgba(28,28,30,0.15)' }}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                <Store className="w-5 h-5 text-white" strokeWidth={1.5} />
              </div>
              <div className="flex-1 text-left">
                <div className="text-lg font-normal mb-0.5 text-white">
                  Hiring staff
                </div>
                <div className="text-sm font-light text-white" style={{ opacity: 0.6 }}>
                  Post shifts, find verified talent
                </div>
              </div>
              <ChevronRight className="w-4 h-4 flex-shrink-0 text-white" style={{ opacity: 0.4 }} />
            </div>
          </button>

        </div>
      </div>

      {/* Footer */}
      <div className="px-6 pb-10 text-center">
        <p className="text-xs font-light" style={{ color: 'var(--clay)' }}>
          By continuing you agree to our{' '}
          <a href={createPageUrl('TermsAndConditions')} className="underline" style={{ color: 'var(--terracotta)' }}>
            Terms & Conditions
          </a>
          {' '}· GDPR compliant
        </p>
      </div>
    </div>
  );
}