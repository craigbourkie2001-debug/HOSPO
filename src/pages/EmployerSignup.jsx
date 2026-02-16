import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Loader2 } from "lucide-react";

export default function EmployerSignup() {
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const setupEmployer = async () => {
      try {
        const user = await base44.auth.me();
        
        // Check if already has venue setup
        if (user.coffee_shop_id || user.restaurant_id) {
          window.location.href = createPageUrl("EmployerDashboard");
          return;
        }
        
        // Mark onboarding as incomplete (role change only if not owner)
        if (user.role === 'admin') {
          // Admin users can't change their role, just set onboarding flag
          await base44.auth.updateMe({ onboarding_completed: false });
        } else if (user.role !== 'employer') {
          await base44.auth.updateMe({ 
            role: 'employer',
            onboarding_completed: false
          });
        } else {
          // Already employer, just ensure onboarding flag is set
          await base44.auth.updateMe({ onboarding_completed: false });
        }
        
        // Redirect to dashboard - onboarding will trigger from Layout
        window.location.href = createPageUrl("EmployerDashboard");
      } catch (error) {
        console.error('Setup error:', error);
        // Not logged in, redirect to login and come back here
        base44.auth.redirectToLogin(createPageUrl("EmployerSignup"));
      }
    };

    setupEmployer();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--cream)' }}>
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: 'var(--terracotta)' }} />
        <p className="text-lg font-light" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
          Setting up your employer account...
        </p>
      </div>
    </div>
  );
}