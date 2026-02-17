import React from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Briefcase, Coffee, ChefHat, Clock, MapPin, Users, ArrowRight } from "lucide-react";
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
    <div className="min-h-screen" style={{ backgroundColor: 'var(--cream)' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@300;400;500;600&family=Inter:wght@300;400;500;600&display=swap');
        
        :root {
          --cream: #FAF8F5;
          --sand: #E8E3DC;
          --terracotta: #C89F8C;
          --clay: #A67C6D;
          --earth: #705D56;
          --sage: #8A9B8E;
          --olive: #6B7565;
          --warm-white: #FFFCF7;
        }

        @media (prefers-color-scheme: dark) {
          :root {
            --cream: #1a1a1a;
            --sand: #2a2a2a;
            --terracotta: #C89F8C;
            --clay: #d4b5a8;
            --earth: #e8d5cc;
            --sage: #a8bfb0;
            --olive: #8a9b8e;
            --warm-white: #0f0f0f;
          }
        }
      `}</style>
      
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-6 py-12 md:py-20">
        <div className="text-center mb-16">
          <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ backgroundColor: 'var(--terracotta)' }}>
            <Briefcase className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-6xl md:text-7xl font-light mb-6 tracking-tight" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
            Welcome to Hospo
          </h1>
          <p className="text-xl font-light mb-8 max-w-2xl mx-auto" style={{ color: 'var(--clay)' }}>
            Ireland's premium platform connecting hospitality workers with top venues across the country
          </p>
          <Button
            onClick={handleSignIn}
            className="rounded-full px-8 py-6 text-lg font-normal tracking-wide hover-lift"
            style={{ backgroundColor: 'var(--terracotta)', color: 'white' }}
          >
            Sign In to Get Started
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="p-8 rounded-2xl text-center" style={{ backgroundColor: 'var(--warm-white)', border: '1px solid var(--sand)' }}>
            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: 'var(--terracotta)' }}>
              <Coffee className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-light mb-3" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
              For Workers
            </h3>
            <p className="font-light" style={{ color: 'var(--clay)' }}>
              Find flexible shifts at Ireland's best coffee shops and restaurants. Work when you want, where you want.
            </p>
          </div>

          <div className="p-8 rounded-2xl text-center" style={{ backgroundColor: 'var(--warm-white)', border: '1px solid var(--sand)' }}>
            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: 'var(--sage)' }}>
              <ChefHat className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-light mb-3" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
              For Employers
            </h3>
            <p className="font-light" style={{ color: 'var(--clay)' }}>
              Access a pool of skilled baristas and chefs ready to work. Fill shifts quickly with qualified professionals.
            </p>
          </div>

          <div className="p-8 rounded-2xl text-center" style={{ backgroundColor: 'var(--warm-white)', border: '1px solid var(--sand)' }}>
            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: 'var(--clay)' }}>
              <Clock className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-light mb-3" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
              Instant Matching
            </h3>
            <p className="font-light" style={{ color: 'var(--clay)' }}>
              AI-powered matching connects the right worker with the right shift. Fast, efficient, reliable.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          <div className="p-6 rounded-2xl text-center" style={{ backgroundColor: 'var(--terracotta)', color: 'white' }}>
            <div className="text-4xl font-light mb-2" style={{ fontFamily: 'Crimson Pro, serif' }}>500+</div>
            <div className="text-sm tracking-wider opacity-90">ACTIVE WORKERS</div>
          </div>
          <div className="p-6 rounded-2xl text-center" style={{ backgroundColor: 'var(--sage)', color: 'white' }}>
            <div className="text-4xl font-light mb-2" style={{ fontFamily: 'Crimson Pro, serif' }}>200+</div>
            <div className="text-sm tracking-wider opacity-90">VENUES</div>
          </div>
          <div className="p-6 rounded-2xl text-center" style={{ backgroundColor: 'var(--clay)', color: 'white' }}>
            <div className="text-4xl font-light mb-2" style={{ fontFamily: 'Crimson Pro, serif' }}>€15-30</div>
            <div className="text-sm tracking-wider opacity-90">HOURLY RATE</div>
          </div>
          <div className="p-6 rounded-2xl text-center" style={{ backgroundColor: 'var(--earth)', color: 'white' }}>
            <div className="text-4xl font-light mb-2" style={{ fontFamily: 'Crimson Pro, serif' }}>24/7</div>
            <div className="text-sm tracking-wider opacity-90">SUPPORT</div>
          </div>
        </div>

        {/* How It Works */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-light mb-12" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
            How It Works
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: Users, title: "1. Sign Up", text: "Create your profile in minutes" },
              { icon: MapPin, title: "2. Browse", text: "Find shifts that match your skills" },
              { icon: Briefcase, title: "3. Apply", text: "Submit applications with one click" },
              { icon: Coffee, title: "4. Work", text: "Show up and earn" }
            ].map((step, idx) => (
              <div key={idx}>
                <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: 'var(--sand)' }}>
                  <step.icon className="w-6 h-6" style={{ color: 'var(--earth)' }} />
                </div>
                <h4 className="text-lg font-normal mb-2" style={{ color: 'var(--earth)' }}>{step.title}</h4>
                <p className="text-sm font-light" style={{ color: 'var(--clay)' }}>{step.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center p-12 rounded-2xl" style={{ backgroundColor: 'var(--terracotta)', color: 'white' }}>
          <h2 className="text-4xl font-light mb-4" style={{ fontFamily: 'Crimson Pro, serif' }}>
            Ready to Get Started?
          </h2>
          <p className="text-lg mb-6 opacity-90">
            Join Ireland's leading hospitality platform today
          </p>
          <Button
            onClick={handleSignIn}
            className="rounded-full px-8 py-6 text-lg font-normal tracking-wide hover-lift"
            style={{ backgroundColor: 'white', color: 'var(--terracotta)' }}
          >
            Sign In Now
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}