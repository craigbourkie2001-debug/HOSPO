import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';

export default function Home() {
  React.useEffect(() => {
    // Always redirect to Welcome for consistent public experience
    window.location.href = createPageUrl('Welcome');
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAF8F5' }}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 mx-auto mb-4" style={{ borderColor: '#E8E3DC', borderTopColor: '#C89F8C' }} />
        <p className="text-lg font-light" style={{ fontFamily: 'Crimson Pro, serif', color: '#705D56' }}>Loading Hospo...</p>
      </div>
    </div>
  );
}