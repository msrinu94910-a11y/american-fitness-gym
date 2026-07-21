import React from 'react';

export default function BrandLogo({ size = 44, showText = true }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 110"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        {/* Head Circle */}
        <circle cx="50" cy="24" r="8.5" fill="#0D9488" />

        {/* Top Arc Halo */}
        <path
          d="M 31 28 C 36 12, 64 12, 69 28 C 61 17, 39 17, 31 28 Z"
          fill="#0284C7"
        />

        {/* Left Teal Swoosh */}
        <path
          d="M 50 32 C 34 45, 28 65, 41 88 C 45 72, 47 52, 50 32 Z"
          fill="#0D9488"
        />

        {/* Right Ocean Blue Swoosh Crossing */}
        <path
          d="M 50 32 C 66 45, 72 65, 59 88 C 55 72, 53 52, 50 32 Z"
          fill="#0284C7"
        />

        {/* Outer Swirling Ribbons */}
        <path
          d="M 33 30 C 23 48, 26 75, 43 92 C 45 76, 38 58, 33 30 Z"
          fill="#0284C7"
        />
        <path
          d="M 67 30 C 77 48, 74 75, 57 92 C 55 76, 62 58, 67 30 Z"
          fill="#0D9488"
        />
      </svg>

      {showText && (
        <div style={{ textAlign: 'left' }}>
          <span
            className="brand-text"
            style={{
              fontWeight: 900,
              fontSize: size > 40 ? '1.35rem' : '1.1rem',
              letterSpacing: '0.04em',
              color: '#0284C7',
              display: 'block',
              lineHeight: 1
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
              fontWeight: 700,
              display: 'block',
              marginTop: '3px'
            }}
          >
            FITNESS PROJECT
          </span>
        </div>
      )}
    </div>
  );
}
