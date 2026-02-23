import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';

export default function Home() {
  const navigate = useNavigate();

  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await base44.auth.me();
        
        if (user && user.onboarding_completed) {
          // User is logged in and onboarded, redirect to appropriate dashboard
          const isEmployer = user.account_type === 'employer' || user.role === 'employer';
          navigate(createPageUrl(isEmployer ? 'EmployerDashboard' : 'BrowseShifts'));
        } else {
          // User is not logged in OR not onboarded, redirect to Welcome
          navigate(createPageUrl('Welcome'));
        }
      } catch (error) {
        // Not authenticated
        navigate(createPageUrl('Welcome'));
      }
    };

    checkAuth();
  }, [navigate]);

  return <div />;
}