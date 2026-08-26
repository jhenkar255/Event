import React from 'react';

export const DiyaIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Diya Flame */}
    <path
      d="M32 4C32 4 40 18 40 26C40 30.4183 36.4183 34 32 34C27.5817 34 24 30.4183 24 26C24 18 32 4 32 4Z"
      fill="url(#flameGrad)"
      className="animate-diya-flicker"
    />
    <path
      d="M32 12C32 12 36 20 36 25C36 27.2091 34.2091 29 32 29C29.7909 29 28 27.2091 28 25C28 20 32 12 32 12Z"
      fill="#FFF7A1"
    />
    {/* Diya Clay Base */}
    <path
      d="M12 32C12 32 16 54 32 54C48 54 52 32 52 32C52 32 46 44 32 44C18 44 12 32 12 32Z"
      fill="url(#diyaClayGrad)"
    />
    <ellipse cx="32" cy="33" rx="20" ry="6" fill="#C9A227" stroke="#7A1F2B" strokeWidth="1.5" />
    <defs>
      <linearGradient id="flameGrad" x1="32" y1="4" x2="32" y2="34" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FFE600" />
        <stop offset="0.6" stopColor="#F4A340" />
        <stop offset="1" stopColor="#E63946" />
      </linearGradient>
      <linearGradient id="diyaClayGrad" x1="12" y1="32" x2="52" y2="54" gradientUnits="userSpaceOnUse">
        <stop stopColor="#C9A227" />
        <stop offset="0.5" stopColor="#8E1D2E" />
        <stop offset="1" stopColor="#5C141F" />
      </linearGradient>
    </defs>
  </svg>
);

export const MandalaCorner: React.FC<{ className?: string }> = ({ className = 'w-16 h-16' }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M0 0 C50 0, 100 50, 100 100 L100 0 Z" fill="url(#goldCornerGrad)" opacity="0.15" />
    <path d="M0 0 C30 0, 70 30, 70 70" stroke="#C9A227" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
    <circle cx="20" cy="20" r="10" stroke="#F4A340" strokeWidth="1" opacity="0.4" />
    <circle cx="50" cy="15" r="4" fill="#C9A227" opacity="0.5" />
    <circle cx="15" cy="50" r="4" fill="#C9A227" opacity="0.5" />
    <defs>
      <linearGradient id="goldCornerGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
        <stop stopColor="#C9A227" />
        <stop offset="1" stopColor="#F4A340" />
      </linearGradient>
    </defs>
  </svg>
);

export const MarigoldGarland: React.FC<{ className?: string }> = ({ className = 'w-full h-4' }) => (
  <div className={`flex items-center justify-center space-x-2 overflow-hidden opacity-80 ${className}`}>
    {Array.from({ length: 16 }).map((_, i) => (
      <div
        key={i}
        className={`w-3 h-3 rounded-full shadow-sm ${
          i % 2 === 0 ? 'bg-utsav-saffron' : 'bg-utsav-gold'
        } border border-amber-600/30`}
      />
    ))}
  </div>
);

export const KalashIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Coconut */}
    <ellipse cx="32" cy="18" rx="8" ry="10" fill="#6B4226" />
    {/* Mango Leaves */}
    <path d="M22 22 C18 14, 26 10, 32 16 C38 10, 46 14, 42 22" fill="#2D6A4F" />
    {/* Brass Pot */}
    <path
      d="M20 26 H44 L48 38 C48 50, 16 50, 16 38 L20 26 Z"
      fill="url(#kalashPotGrad)"
      stroke="#7A1F2B"
      strokeWidth="1.5"
    />
    <defs>
      <linearGradient id="kalashPotGrad" x1="16" y1="26" x2="48" y2="50" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FFD700" />
        <stop offset="0.5" stopColor="#C9A227" />
        <stop offset="1" stopColor="#B8860B" />
      </linearGradient>
    </defs>
  </svg>
);
