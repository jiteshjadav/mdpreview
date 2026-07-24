import React from 'react';

interface GreenShieldIconProps {
  className?: string;
  size?: number;
}

/**
 * Premium 3D Metallic Green Security Shield Icon
 * Perfectly proportioned 1:1 heraldic shield with silver metallic frame and bold white checkmark.
 */
export function GreenShieldIcon({ className = '', size = 26 }: GreenShieldIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={`shrink-0 select-none inline-block align-middle ${className}`}
      fill="none"
      role="img"
      aria-label="Security Shield"
    >
      <defs>
        {/* Silver Metallic Rim Gradient */}
        <linearGradient id="gshield-silver-rim" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="25%" stopColor="#E2E8F0" />
          <stop offset="60%" stopColor="#94A3B8" />
          <stop offset="100%" stopColor="#64748B" />
        </linearGradient>

        {/* Glossy Green Inner Body Gradient */}
        <linearGradient id="gshield-green-body" x1="0" y1="10" x2="0" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4ADE80" />
          <stop offset="40%" stopColor="#22C55E" />
          <stop offset="100%" stopColor="#15803D" />
        </linearGradient>

        {/* Gloss Reflection Overlay */}
        <linearGradient id="gshield-gloss" x1="50" y1="10" x2="50" y2="55" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.0" />
        </linearGradient>

        {/* Drop Shadow */}
        <filter id="gshield-shadow" x="-20%" y="-10%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2.5" stdDeviation="2.5" floodColor="#042f1a" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* ── Outer Silver Shield Shell ── */}
      <path
        d="M 50 5 C 70 5, 84 12, 90 18 C 90 52, 78 78, 50 94 C 22 78, 10 52, 10 18 C 16 12, 30 5, 50 5 Z"
        fill="url(#gshield-silver-rim)"
        filter="url(#gshield-shadow)"
      />

      {/* ── Inner Dark Rim Edge Accent ── */}
      <path
        d="M 50 9 C 68 9, 81 15, 86 21 C 86 50, 75 74, 50 89 C 25 74, 14 50, 14 21 C 19 15, 32 9, 50 9 Z"
        fill="#0D331A"
      />

      {/* ── Green Main Body ── */}
      <path
        d="M 50 11 C 67 11, 79 17, 84 22 C 84 49, 73 72, 50 87 C 27 72, 16 49, 16 22 C 21 17, 33 11, 50 11 Z"
        fill="url(#gshield-green-body)"
      />

      {/* ── Gloss Reflection Overlay (Left Half) ── */}
      <path
        d="M 50 11 C 33 11, 21 17, 16 22 C 16 49, 27 72, 50 87 Z"
        fill="url(#gshield-gloss)"
      />

      {/* ── Corner Rivets on Silver Rim ── */}
      <circle cx="50" cy="9.5" r="1.4" fill="#475569" />
      <circle cx="18" cy="18" r="1.4" fill="#475569" />
      <circle cx="82" cy="18" r="1.4" fill="#475569" />
      <circle cx="50" cy="90.5" r="1.4" fill="#475569" />

      {/* ── Bold White Checkmark ── */}
      <path
        d="M 31 48 L 44 61 L 69 34"
        stroke="#FFFFFF"
        strokeWidth="9.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
