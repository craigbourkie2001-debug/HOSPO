import React from "react";
import { Briefcase } from "lucide-react";

export default function MobileHeader({ title, icon: Icon, hideOnDesktop = true }) {
  return (
    <div 
      className={`md:${hideOnDesktop ? 'hidden' : 'block'} fixed top-0 left-0 right-0 z-30 px-6 py-4 border-b`}
      style={{ 
        backgroundColor: 'var(--warm-white)', 
        borderColor: 'var(--sand)',
        paddingTop: 'calc(env(safe-area-inset-top) + 1rem)'
      }}
    >
      <div className="flex items-center gap-3">
        {Icon ? (
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center" 
            style={{ backgroundColor: 'var(--terracotta)' }}
          >
            <Icon className="w-4 h-4 text-white" />
          </div>
        ) : (
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center" 
            style={{ backgroundColor: 'var(--terracotta)' }}
          >
            <Briefcase className="w-4 h-4 text-white" />
          </div>
        )}
        <h1 
          className="text-xl font-light tracking-wide" 
          style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}
        >
          {title || 'Hospo'}
        </h1>
      </div>
    </div>
  );
}