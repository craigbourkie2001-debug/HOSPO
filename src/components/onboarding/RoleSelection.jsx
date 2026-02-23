import React from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Coffee, Store, ArrowRight } from "lucide-react";
import { createPageUrl } from "@/utils";

export default function RoleSelection({ user, onComplete }) {
  const [loading, setLoading] = React.useState(false);

  const handleSelectRole = async (role) => {
    setLoading(true);
    try {
      await base44.auth.updateMe({ account_type: role });
      onComplete();
    } catch (error) {
      console.error('Failed to set role:', error);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="max-w-2xl w-full rounded-2xl p-8" style={{ backgroundColor: 'var(--warm-white)' }}>
        <h2 className="text-4xl font-light mb-3 text-center" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
          Welcome to Hospo
        </h2>
        <p className="text-center mb-12 text-lg" style={{ color: 'var(--clay)' }}>
          Are you looking for shifts or hiring staff?
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Worker Option */}
          <div 
            className="p-8 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-all hover-lift"
            style={{ backgroundColor: '#FFFCF7', border: '1px solid var(--sand)' }}
            onClick={() => handleSelectRole('worker')}
          >
            <Coffee className="w-12 h-12 mb-4" style={{ color: 'var(--terracotta)' }} strokeWidth={1.5} />
            <h3 className="text-2xl font-light mb-2" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
              I'm Looking for Shifts
            </h3>
            <p className="text-sm font-light mb-6" style={{ color: 'var(--clay)' }}>
              Find flexible hospitality work in Ireland
            </p>
            <Button
              disabled={loading}
              className="rounded-xl px-8 py-6 w-full text-base font-normal tracking-wide"
              style={{ backgroundColor: 'var(--terracotta)', color: 'white', border: 'none' }}
            >
              {loading ? 'Setting up...' : 'Continue as Worker'}
              <ArrowRight className="w-5 h-5 ml-2" strokeWidth={1.5} />
            </Button>
          </div>

          {/* Employer Option */}
          <div 
            className="p-8 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-all hover-lift"
            style={{ backgroundColor: '#FFFCF7', border: '1px solid var(--sand)' }}
            onClick={() => handleSelectRole('employer')}
          >
            <Store className="w-12 h-12 mb-4" style={{ color: 'var(--sage)' }} strokeWidth={1.5} />
            <h3 className="text-2xl font-light mb-2" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
              I Want to Hire Staff
            </h3>
            <p className="text-sm font-light mb-6" style={{ color: 'var(--clay)' }}>
              Post shifts and find top hospitality talent
            </p>
            <Button
              disabled={loading}
              className="rounded-xl px-8 py-6 w-full text-base font-normal tracking-wide"
              style={{ backgroundColor: 'var(--sage)', color: 'white', border: 'none' }}
            >
              {loading ? 'Setting up...' : 'Continue as Employer'}
              <ArrowRight className="w-5 h-5 ml-2" strokeWidth={1.5} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}