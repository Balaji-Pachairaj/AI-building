import React from 'react';

/**
 * WhiteSun Component
 *
 * Renders a brilliant, photorealistic pure-white sun situated in the top-left cosmos:
 * - Intense diamond white core disc (#ffffff)
 * - Multi-layered radiant white solar corona & atmospheric halo
 * - Elegant diffraction rays & coronal streamers slowly rotating in deep space
 * - Ambient white solar bloom illuminating the top-left void
 */
const WhiteSun = () => {
  return (
    <div className="cosmic-white-sun" aria-hidden="true">
      {/* Outer Ambient Solar Bloom (Soft diffuse white light in space) */}
      <div className="sun-ambient-bloom" />

      {/* SVG Solar Disc, Corona, and Coronal Rays */}
      <svg
        className="sun-svg"
        viewBox="0 0 300 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Intense White Core Gradient */}
          <radialGradient id="sunCoreGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="45%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="75%" stopColor="#f8fafc" stopOpacity="0.95" />
            <stop offset="90%" stopColor="#e2e8f0" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#cbd5e1" stopOpacity="0.4" />
          </radialGradient>

          {/* Inner Radiant Corona */}
          <radialGradient id="sunInnerCorona" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="35%" stopColor="#ffffff" stopOpacity="0.8" />
            <stop offset="65%" stopColor="#f1f5f9" stopOpacity="0.38" />
            <stop offset="85%" stopColor="#e2e8f0" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>

          {/* Outer Corona Atmospheric Halo */}
          <radialGradient id="sunOuterCorona" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
            <stop offset="40%" stopColor="#f8fafc" stopOpacity="0.3" />
            <stop offset="70%" stopColor="#f1f5f9" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>

          {/* Corona Blurs */}
          <filter id="sunIntenseBlur" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" />
          </filter>
          <filter id="sunCoronaBlur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="9" />
          </filter>
          <filter id="sunAtmosphereBlur" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="20" />
          </filter>
        </defs>

        {/* 1. Outer Diffuse Solar Atmosphere */}
        <circle cx="150" cy="150" r="125" fill="url(#sunOuterCorona)" filter="url(#sunAtmosphereBlur)" />

        {/* 2. Primary Solar Ray Streamers */}
        <g className="sun-rays-group">
          {/* Cardinal & Diagonal Long Rays */}
          <line x1="150" y1="18" x2="150" y2="282" stroke="rgba(255, 255, 255, 0.45)" strokeWidth="1.6" strokeLinecap="round" />
          <line x1="18" y1="150" x2="282" y2="150" stroke="rgba(255, 255, 255, 0.45)" strokeWidth="1.6" strokeLinecap="round" />
          <line x1="56" y1="56" x2="244" y2="244" stroke="rgba(255, 255, 255, 0.35)" strokeWidth="1.3" strokeLinecap="round" />
          <line x1="56" y1="244" x2="244" y2="56" stroke="rgba(255, 255, 255, 0.35)" strokeWidth="1.3" strokeLinecap="round" />

          {/* Intermediate Ray Streamers */}
          <line x1="95" y1="30" x2="205" y2="270" stroke="rgba(255, 255, 255, 0.22)" strokeWidth="0.9" />
          <line x1="30" y1="95" x2="270" y2="205" stroke="rgba(255, 255, 255, 0.22)" strokeWidth="0.9" />
          <line x1="30" y1="205" x2="270" y2="95" stroke="rgba(255, 255, 255, 0.22)" strokeWidth="0.9" />
          <line x1="95" y1="270" x2="205" y2="30" stroke="rgba(255, 255, 255, 0.22)" strokeWidth="0.9" />
        </g>

        {/* 3. Middle Solar Corona */}
        <circle cx="150" cy="150" r="75" fill="url(#sunInnerCorona)" filter="url(#sunCoronaBlur)" />

        {/* 4. Intense Immediate Solar Flare Rim */}
        <circle cx="150" cy="150" r="50" fill="#ffffff" opacity="0.9" filter="url(#sunIntenseBlur)" />

        {/* 5. Solid White Sun Disc Core */}
        <circle cx="150" cy="150" r="36" fill="url(#sunCoreGrad)" />
        <circle cx="150" cy="150" r="26" fill="#ffffff" />
      </svg>
    </div>
  );
};

export default WhiteSun;
