import React from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { ArrowRight, Coffee, Store, Star, Shield, Clock, Users } from "lucide-react";
import { createPageUrl } from "@/utils";
import HospoLogo from "../components/HospoLogo";

export default function Welcome() 
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
        <div className="min-h-screen px-6 py-12" style={{ backgroundColor: '#FAF8F5', fontFamily: 'Inter, sans-serif' }}>
                <div className="max-w-3xl mx-auto text-center">
                  {/* Logo */}
                        <div className="mb-8 flex justify-center">
                                  <HospoLogo size="lg" />
                        </div>div>
                
                  {/* Main Heading */}
                        <h1 className="text-5xl md:text-6xl font-light mb-4 tracking-tight" style={{ fontFamily: 'Crimson Pro, serif', color: '#705D56' }}>
                                  Ireland's Hospitality<br />Staffing Platform
                        </h1>h1>
                        <p className="text-lg md:text-xl font-light mb-4" style={{ color: '#A67C6D' }}>
                                  Connecting baristas, chefs, bartenders &amp; waiters<br className="hidden md:block" />
                                  with coffee shops and restaurants — instantly.
                        </p>p>
                
                  {/* Feature pills */}
                        <div className="flex flex-wrap justify-center gap-3 mb-12">
                          {[
          { icon: Clock, label: 'Flexible shifts' },
          { icon: Shield, label: 'Verified workers' },
          { icon: Star, label: 'Rated &amp; reviewed' },
          { icon: Users, label: '100+ venues' },
                    ].map(({ icon: Icon, label }) => (
                                  <div key={label} className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-normal" style={{ backgroundColor: '#FFFCF7', border: '1px solid #E8E3DC', color: '#705D56' }}>
                                                <Icon className="w-4 h-4" style={{ color: '#C89F8C' }} strokeWidth={1.5} />
                                    {label}
                                  </div>div>
                                ))}
                        </div>div>
                
                  {/* Sign In Options */}
                        <div className="grid md:grid-cols-2 gap-6 mb-10">
                                  <div
                                                className="p-8 rounded-2xl flex flex-col items-center text-center hover-lift cursor-pointer transition-all"
                                                style={{ backgroundColor: '#FFFCF7', border: '1px solid #E8E3DC' }}
                                                onClick={() => handleSignIn('worker')}
                                              >
                                              <Coffee className="w-12 h-12 mb-4" style={{ color: '#C89F8C' }} strokeWidth={1.5} />
                                              <h3 className="text-2xl font-light mb-2" style={{ fontFamily: 'Crimson Pro, serif', color: '#705D56' }}>I'm looking for shifts</h3>h3>
                                              <p className="text-sm font-light mb-2" style={{ color: '#A67C6D' }}>Find flexible hospitality work across Ireland</p>p>
                                              <ul className="text-xs mb-6 space-y-1" style={{ color: '#A67C6D' }}>
                                                            <li>✓ Browse shifts by role, location &amp; pay</li>li>
                                                            <li>✓ Build a verified hospitality profile</li>li>
                                                            <li>✓ Get rated and grow your reputation</li>li>
                                              </ul>ul>
                                              <Button
                                                              className="rounded-xl px-8 py-6 w-full text-base font-normal tracking-wide transition-all duration-300"
                                                              style={{ backgroundColor: '#C89F8C', color: 'white', border: 'none' }}
                                                            >
                                                            Sign In as Worker <ArrowRight className="w-5 h-5 ml-2" strokeWidth={1.5} />
                                              </Button>Button>
                                  </div>div>
                        
                                  <div
                                                className="p-8 rounded-2xl flex flex-col items-center text-center hover-lift cursor-pointer transition-all"
                                                style={{ backgroundColor: '#FFFCF7', border: '1px solid #E8E3DC' }}
                                                onClick={() => handleSignIn('employer')}
                                              >
                                              <Store className="w-12 h-12 mb-4" style={{ color: '#C89F8C' }} strokeWidth={1.5} />
                                              <h3 className="text-2xl font-light mb-2" style={{ fontFamily: 'Crimson Pro, serif', color: '#705D56' }}>I want to hire staff</h3>h3>
                                              <p className="text-sm font-light mb-2" style={{ color: '#A67C6D' }}>Post shifts and find verified talent fast</p>p>
                                              <ul className="text-xs mb-6 space-y-1" style={{ color: '#A67C6D' }}>
                                                            <li>✓ Post shifts in under 2 minutes</li>li>
                                                            <li>✓ AI-matched candidates for every role</li>li>
                                                            <li>✓ Review workers after each shift</li>li>
                                              </ul>ul>
                                              <Button
                                                              className="rounded-xl px-8 py-6 w-full text-base font-normal tracking-wide transition-all duration-300"
                                                              style={{ backgroundColor: '#705D56', color: 'white', border: 'none' }}
                                                            >
                                                            Sign In as Employer <ArrowRight className="w-5 h-5 ml-2" strokeWidth={1.5} />
                                              </Button>Button>
                                  </div>div>
                        </div>div>
                
                  {/* Footer */}
                        <p className="text-xs font-light" style={{ color: '#C89F8C' }}>
                                  By signing in you agree to our{' '}
                                  <a href={createPageUrl('TermsAndConditions')} className="underline" style={{ color: '#A67C6D' }}>Terms &amp; Conditions</a>a>.
                          {' '}Hospo Ireland — GDPR compliant.
                        </p>p>
                </div>div>
        </div>div>
      );
}</div>
