import React from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Briefcase, ArrowRight, Coffee, ChefHat, Clock } from "lucide-react";
import { createPageUrl } from "@/utils";

export default function Welcome() {
  React.useEffect(() => {
    base44.auth.isAuthenticated().then(isAuth => {
      if (isAuth) {
        window.location.href = createPageUrl('BrowseShifts');
      }
    });
  }, []);

  const handleSignIn = () => {
    base44.auth.redirectToLogin(createPageUrl('BrowseShifts'));
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12" style={{ 
      backgroundColor: '#FAF8F5',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div className="max-w-2xl w-full text-center">
        {/* Logo */}
        <div className="w-24 h-24 rounded-full mx-auto mb-8 flex items-center justify-center" 
             style={{ backgroundColor: '#C89F8C' }}>
          <Briefcase className="w-12 h-12 text-white" strokeWidth={1.5} />
        </div>

        {/* Main Heading */}
        <h1 className="text-5xl md:text-6xl font-light mb-4 tracking-tight" 
            style={{ fontFamily: 'Crimson Pro, serif', color: '#705D56' }}>
          Welcome to Hospo
        </h1>
        
        <p className="text-lg md:text-xl font-light mb-12" style={{ color: '#A67C6D' }}>
          Ireland's hospitality staffing platform
        </p>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="p-6 rounded-2xl" style={{ backgroundColor: '#FFFCF7', border: '1px solid #E8E3DC' }}>
            <Coffee className="w-8 h-8 mx-auto mb-3" style={{ color: '#C89F8C' }} strokeWidth={1.5} />
            <p className="text-sm font-light" style={{ color: '#705D56' }}>Find shifts</p>
          </div>
          <div className="p-6 rounded-2xl" style={{ backgroundColor: '#FFFCF7', border: '1px solid #E8E3DC' }}>
            <ChefHat className="w-8 h-8 mx-auto mb-3" style={{ color: '#C89F8C' }} strokeWidth={1.5} />
            <p className="text-sm font-light" style={{ color: '#705D56' }}>Work flexibly</p>
          </div>
          <div className="p-6 rounded-2xl" style={{ backgroundColor: '#FFFCF7', border: '1px solid #E8E3DC' }}>
            <Clock className="w-8 h-8 mx-auto mb-3" style={{ color: '#C89F8C' }} strokeWidth={1.5} />
            <p className="text-sm font-light" style={{ color: '#705D56' }}>Get paid instantly</p>
          </div>
        </div>

        {/* Sign In Button */}
        <Button
          onClick={handleSignIn}
          size="lg"
          className="rounded-xl px-8 py-6 text-base font-normal tracking-wide transition-all duration-300"
          style={{ 
            backgroundColor: '#C89F8C', 
            color: 'white',
            border: 'none'
          }}
        >
          Sign In to Get Started
          <ArrowRight className="w-5 h-5 ml-2" strokeWidth={1.5} />
        </Button>

        {/* Footer Info */}
        <div className="mt-12 pt-8 border-t" style={{ borderColor: '#E8E3DC' }}>
          <p className="text-sm font-light" style={{ color: '#A67C6D' }}>
            Connect with top venues across Ireland
          </p>
        </div>
      </div>
    </div>
  );
}