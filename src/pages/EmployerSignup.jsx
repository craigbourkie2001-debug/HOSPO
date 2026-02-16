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
        
        // Set role to employer if not already
        if (user.role !== 'employer') {
          await base44.auth.updateMe({ 
            role: 'employer',
            onboarding_completed: false
          });
        }
        
        // Redirect to dashboard - onboarding will trigger from Layout
        window.location.href = createPageUrl("EmployerDashboard");
      } catch (error) {
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