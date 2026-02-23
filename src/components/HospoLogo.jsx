import React from "react";

export default function HospoLogo({ size = "md", showText = true }) {
  const sizes = {
    sm: { width: 24, height: 24, textSize: "text-xs" },
    md: { width: 40, height: 40, textSize: "text-base" },
    lg: { width: 56, height: 56, textSize: "text-2xl" },
    xl: { width: 64, height: 64, textSize: "text-3xl" }
  };

  const config = sizes[size];

  return (
    <div className="flex items-center gap-2">
      {/* Logo SVG */}
      <svg
        width={config.width}
        height={config.height}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer circle */}
        <circle cx="20" cy="20" r="19" fill="var(--terracotta)" opacity="0.1" />
        
        {/* Coffee cup shape (for hospitality) */}
        <path
          d="M12 10H28C29.1046 10 30 10.8954 30 12V22C30 26.4183 26.4183 30 22 30H18C13.5817 30 10 26.4183 10 22V12C10 10.8954 10.8954 10 12 10Z"
          fill="var(--terracotta)"
          opacity="0.2"
        />
        
        {/* Cup handle */}
        <path
          d="M30 14C31.6569 14 33 15.3431 33 17C33 18.6569 31.6569 20 30 20"
          stroke="var(--terracotta)"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        
        {/* Briefcase shape (for work/jobs) */}
        <rect x="13" y="12" width="14" height="12" rx="1" fill="var(--terracotta)" opacity="0.3" />
        <line x1="15" y1="12" x2="15" y2="24" stroke="var(--terracotta)" strokeWidth="1.5" opacity="0.5" />
        <line x1="20" y1="12" x2="20" y2="24" stroke="var(--terracotta)" strokeWidth="1.5" opacity="0.5" />
        <line x1="25" y1="12" x2="25" y2="24" stroke="var(--terracotta)" strokeWidth="1.5" opacity="0.5" />
        
        {/* Central accent circle */}
        <circle cx="20" cy="20" r="4" fill="var(--terracotta)" />
      </svg>

      {/* Text */}
      {showText && (
        <div className="flex flex-col">
          <span className={`font-light tracking-wide ${config.textSize}`} style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
            Hospo
          </span>
          <span className="text-xs tracking-widest font-light" style={{ color: 'var(--clay)', lineHeight: '1' }}>
            IRELAND
          </span>
        </div>
      )}
    </div>
  );
}