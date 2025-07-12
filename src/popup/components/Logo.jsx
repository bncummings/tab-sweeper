import React from 'react';

const Logo = ({ width = 120, height = 40, color = '#333' }) => {
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 120 40" 
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block' }}
    >
      {/* Tab group icon representation */}
      <g fill={color} opacity="0.8">
        {/* First tab group */}
        <rect x="8" y="8" width="20" height="12" rx="2" stroke={color} strokeWidth="1.5" fill="none" />
        <rect x="10" y="10" width="6" height="8" rx="1" fill={color} opacity="0.6" />
        <rect x="18" y="10" width="6" height="8" rx="1" fill={color} opacity="0.6" />
        
        {/* Second tab group */}
        <rect x="35" y="8" width="25" height="12" rx="2" stroke={color} strokeWidth="1.5" fill="none" />
        <rect x="37" y="10" width="6" height="8" rx="1" fill={color} opacity="0.6" />
        <rect x="45" y="10" width="6" height="8" rx="1" fill={color} opacity="0.6" />
        <rect x="53" y="10" width="5" height="8" rx="1" fill={color} opacity="0.6" />
        
        {/* Third tab group */}
        <rect x="67" y="8" width="15" height="12" rx="2" stroke={color} strokeWidth="1.5" fill="none" />
        <rect x="69" y="10" width="5" height="8" rx="1" fill={color} opacity="0.6" />
        <rect x="76" y="10" width="4" height="8" rx="1" fill={color} opacity="0.6" />
        
        {/* Connecting lines to show grouping */}
        <line x1="18" y1="25" x2="18" y2="28" stroke={color} strokeWidth="1.5" opacity="0.5" />
        <line x1="47" y1="25" x2="47" y2="28" stroke={color} strokeWidth="1.5" opacity="0.5" />
        <line x1="74" y1="25" x2="74" y2="28" stroke={color} strokeWidth="1.5" opacity="0.5" />
        
        {/* Bottom grouping indicator */}
        <path d="M 15 30 Q 47 35 75 30" stroke={color} strokeWidth="1.5" fill="none" opacity="0.4" />
        
        {/* Logo text */}
        <text x="90" y="16" fontSize="10" fontFamily="monospace" fill={color} opacity="0.7">TAB</text>
        <text x="90" y="28" fontSize="10" fontFamily="monospace" fill={color} opacity="0.7">GRP</text>
      </g>
    </svg>
  );
};

export default Logo;
