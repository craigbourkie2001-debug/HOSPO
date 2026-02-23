import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';

export default function Home() {
  React.useEffect(() => {
    // Check authentication status immediately on mount
    base44.auth.isAuthenticated().then((isAuth) => {
      if (isAuth) {
        // User is logged in, check onboarding status
        base44.auth.me().then((user) => {
          if (user.onboarding_completed) {
            const isEmployer = user.account_type === 'employer' || user.role === 'employer';
            window.location.href = createPageUrl(isEmployer ? 'EmployerDashboard' : 'BrowseShifts');
          } else {
            window.location.href = createPageUrl('Welcome');
          }
        }).catch(() => {
          window.location.href = createPageUrl('Welcome');
        });
      } else {
        // Not authenticated, go to Welcome
        window.location.href = createPageUrl('Welcome');
      }
    });
  }, []);

  // Show loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAF8F5' }}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 mx-auto mb-4" style={{ borderColor: '#E8E3DC', borderTopColor: '#C89F8C' }} />
        <p className="text-lg font-light" style={{ fontFamily: 'Crimson Pro, serif', color: '#705D56' }}>Loading Hospo...</p>
      </div>
    </div>
  );
}