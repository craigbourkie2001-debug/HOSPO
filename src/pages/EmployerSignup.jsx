import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import EmployerOnboarding from "../components/onboarding/EmployerOnboarding";
import { Loader2 } from "lucide-react";

export default function EmployerSignup() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
        setChecking(false);
      } catch (error) {
        // Not logged in, redirect to login and come back here
        base44.auth.redirectToLogin(createPageUrl("EmployerSignup"));
      }
    };

    checkAuth();
  }, []);

  const handleComplete = async () => {
    // Refresh user data and redirect to dashboard
    window.location.href = createPageUrl("EmployerDashboard");
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--cream)' }}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: 'var(--terracotta)' }} />
          <p className="text-lg font-light" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--cream)' }}>
      {user && <EmployerOnboarding user={user} onComplete={handleComplete} />}
    </div>
  );
}