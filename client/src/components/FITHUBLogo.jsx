import React from 'react';

const FITHUBLogo = ({ size = 60, theme = 'dark' }) => {
  const isDark = theme === 'dark';
  const mainColor = isDark ? '#6366f1' : '#4f46e5';
  const accentColor = isDark ? '#22c55e' : '#ec4899';
  const textColor = isDark ? '#ffffff' : '#0f172a';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="fithubGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: mainColor }} />
          <stop offset="100%" style={{ stopColor: accentColor }} />
        </linearGradient>
      </defs>

      {/* Dumbbell / H shape forming a gym feel */}
      <g filter="url(#shadow)">
        {/* Hexagon/shield background */}
        <path
          d="M100 15 L175 62.5 V137.5 L100 185 L25 137.5 V62.5 Z"
          fill="url(#fithubGrad)"
          opacity="0.15"
          stroke="url(#fithubGrad)"
          strokeWidth="4"
        />

        {/* Dumbbell forming an H */}
        <rect x="55" y="60" width="10" height="80" rx="3" fill="url(#fithubGrad)" />
        <rect x="135" y="60" width="10" height="80" rx="3" fill="url(#fithubGrad)" />

        {/* Crossbar of H */}
        <rect x="60" y="92" width="80" height="16" rx="4" fill="url(#fithubGrad)" />

        {/* Weight plates - left */}
        <rect x="38" y="52" width="14" height="40" rx="4" fill="url(#fithubGrad)" opacity="0.8" />
        <rect x="38" y="108" width="14" height="40" rx="4" fill="url(#fithubGrad)" opacity="0.8" />

        {/* Weight plates - right */}
        <rect x="148" y="52" width="14" height="40" rx="4" fill="url(#fithubGrad)" opacity="0.8" />
        <rect x="148" y="108" width="14" height="40" rx="4" fill="url(#fithubGrad)" opacity="0.8" />

        {/* Circular bar ends */}
        <circle cx="45" cy="52" r="6" fill="url(#fithubGrad)" opacity="0.6" />
        <circle cx="45" cy="148" r="6" fill="url(#fithubGrad)" opacity="0.6" />
        <circle cx="155" cy="52" r="6" fill="url(#fithubGrad)" opacity="0.6" />
        <circle cx="155" cy="148" r="6" fill="url(#fithubGrad)" opacity="0.6" />

        {/* Lightning bolt - youth Gen-Z energy */}
        <path
          d="M112 55 L88 95 H104 L92 145 L122 90 H104 L112 55 Z"
          fill="#facc15"
          opacity="0.9"
        />
      </g>
    </svg>
  );
};

export default FITHUBLogo;
