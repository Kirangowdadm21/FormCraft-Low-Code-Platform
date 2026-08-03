import React from 'react';

/**
 * Product Logo Mark for FormCraft.
 * Grounded in product vocabulary: a ruled ledger document emblem with drafting grid lines.
 */
export default function LogoMark({ size = 24, className = '', color = 'var(--ledger)' }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
    >
      {/* Outer Ruled Sheet Frame */}
      <path 
        d="M4 4C4 2.89543 4.89543 2 6 2H14L20 8V20C20 21.1046 19.1046 22 18 22H6C4.89543 22 4 21.1046 4 20V4Z" 
        stroke={color} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      {/* Corner Fold Accent */}
      <path 
        d="M14 2V8H20" 
        stroke={color} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      {/* Horizontal Ruled Form Lines */}
      <line x1="8" y1="12" x2="16" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <line x1="8" y1="16" x2="13" y2="16" stroke={color} strokeWidth="2" strokeLinecap="round" />
      {/* Check / Seal Node */}
      <circle cx="8" cy="8" r="1.25" fill={color} />
    </svg>
  );
}
