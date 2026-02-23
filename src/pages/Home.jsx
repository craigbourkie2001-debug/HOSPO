import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';

export default function Home() {
  const navigate = useNavigate();

  React.useEffect(() => {
    const checkAuth = async () => {
      const isAuthenticated = await base44.auth.isAuthenticated();
      
      if (isAuthenticated) {
        // User is logged in, redirect to BrowseShifts
        navigate(createPageUrl('BrowseShifts'));
      } else {
        // User is not logged in, redirect to Welcome
        navigate(createPageUrl('Welcome'));
      }
    };

    checkAuth();
  }, [navigate]);

  return <div />;
}