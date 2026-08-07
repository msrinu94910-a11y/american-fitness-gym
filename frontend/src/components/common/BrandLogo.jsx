import React from 'react';

export default function BrandLogo({ size = 44, showText = true }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-start', gap: '0.85rem', cursor: 'pointer' }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0, filter: 'drop-shadow(0 4px 12px rgba(2,132,199,0.25))' }}
      >
        <defs>
          <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0284C7" />
            <stop offset="50%" stopColor="#0891B2" />
            <stop offset="100%" stopColor="#0D9488" />
          </linearGradient>
          <linearGradient id="goldSpark" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#FBBF24" />
          </linearGradient>
          <linearGradient id="silverGloss" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#E2E8F0" stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id="innerPlateGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0F172A" />
            <stop offset="100%" stopColor="#1E293B" />
          </linearGradient>
        </defs>

        {/* 1. Outer Metallic Octagon Shield Base */}
        <polygon
          points="60,6 108,26 108,94 60,114 12,94 12,26"
          fill="url(#shieldGrad)"
          rx="6"
        />
        
        {/* Inner Dark Core Shield */}
        <polygon
          points="60,14 100,31 100,89 60,106 20,89 20,31"
          fill="url(#innerPlateGrad)"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="2"
        />

        {/* 2. Bold Geometric 'A' Peak / Eagle Wing Strength Mark */}
        <path
          d="M 60 26 L 86 78 L 72 78 L 60 52 L 48 78 L 34 78 Z"
          fill="url(#shieldGrad)"
        />

        {/* 3. Gold Champion Flame & Barbell Core */}
        <path
          d="M 60 38 L 74 68 L 46 68 Z"
          fill="url(#silverGloss)"
          opacity="0.85"
        />
        
        {/* Heavy Iron Barbell Weight Plates */}
        <rect x="26" y="55" width="8" height="24" rx="2" fill="url(#goldSpark)" />
        <rect x="86" y="55" width="8" height="24" rx="2" fill="url(#goldSpark)" />
        <rect x="18" y="60" width="6" height="14" rx="1.5" fill="#38BDF8" />
        <rect x="96" y="60" width="6" height="14" rx="1.5" fill="#38BDF8" />
        <rect x="24" y="65" width="72" height="4" rx="2" fill="#FFFFFF" />

        {/* Top Gold Victory Star */}
        <path
          d="M 60 18 L 62.5 24 L 69 24.5 L 64 29 L 65.5 35 L 60 31.5 L 54.5 35 L 56 29 L 51 24.5 L 57.5 24 Z"
          fill="url(#goldSpark)"
        />
      </svg>

      {showText && (
        <div style={{ textAlign: 'left' }}>
          <span
            className="brand-text"
            style={{
              fontWeight: 900,
              fontSize: size > 40 ? '1.35rem' : '1.1rem',
              letterSpacing: '0.05em',
              color: '#0284C7',
              display: 'block',
              lineHeight: 1,
              fontFamily: 'var(--font-heading)'
            }}
          >
            AMERICAN
          </span>
          <span
            style={{
              fontSize: size > 40 ? '0.65rem' : '0.55rem',
              color: '#0D9488',
              letterSpacing: '0.24em',
              textTransform: 'uppercase',
              fontWeight: 800,
              display: 'block',
              marginTop: '4px'
            }}
          >
            FITNESS GYM
          </span>
        </div>
      )}
    </div>
  );
}
