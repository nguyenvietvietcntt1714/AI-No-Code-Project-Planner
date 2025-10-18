
import React from 'react';

const Loader: React.FC = () => {
  return (
    <svg 
      className="w-16 h-16" 
      viewBox="0 0 100 100" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#67e8f9" />
        </linearGradient>
      </defs>
      <circle 
        cx="50" 
        cy="50" 
        r="45" 
        fill="none" 
        stroke="url(#gradient)" 
        strokeWidth="5" 
        strokeLinecap="round"
        strokeDasharray="282.7"
        strokeDashoffset="212"
      >
        <animateTransform 
          attributeName="transform"
          type="rotate"
          from="0 50 50"
          to="360 50 50"
          dur="1.5s"
          repeatCount="indefinite"
        />
        <animate 
          attributeName="stroke-dashoffset"
          values="212; 70.6; 212"
          dur="1.5s"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  );
};

export default Loader;
