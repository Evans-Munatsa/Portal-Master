'use client';

import React from 'react';

interface LaunchPathLogoProps {
  variant?: 'icon' | 'full' | 'black';
  className?: string; // class applied to the outer container
  iconClassName?: string; // class applied to the SVG icon itself
  textColor?: string; // text color overriding default
}

export default function LaunchPathLogo({
  variant = 'full',
  className = '',
  iconClassName = 'w-8 h-8',
  textColor,
}: LaunchPathLogoProps) {
  // SVG of the minimalist downward-left arrow inside a square
  const renderIcon = (isBlackSquare = false) => {
    // Brand colors: Electric Purple (#7145FF) is the default logo background
    // Unless isBlackSquare is true (variant === 'black'), where we use deep black (#120A2B or black)
    const bgFill = isBlackSquare ? 'fill-[#120A2B]' : 'fill-[#7145FF]';
    
    return (
      <svg
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        className={`${iconClassName} select-none`}
        aria-hidden="true"
      >
        {/* Rounded square container */}
        <rect width="100" height="100" rx="20" className={bgFill} />
        
        {/* Downward-left minimalist arrow shape in white */}
        <path
          d="M 28 28
             L 28 60
             Q 28 72 40 72
             L 72 72
             L 72 52
             L 48 52
             L 72 28
             L 56 28
             L 40 44
             L 40 28
             Z"
          fill="#FFFFFF"
        />
      </svg>
    );
  };

  if (variant === 'icon') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        {renderIcon(false)}
      </div>
    );
  }

  if (variant === 'black') {
    return (
      <div className={`inline-flex items-center gap-3 ${className}`}>
        {renderIcon(true)}
        <div className="flex flex-col select-none">
          <span className={`font-mono font-extrabold text-xl tracking-tight text-[#120A2B] leading-none font-sans`}>
            LaunchPath
          </span>
          <span className="text-[9px] font-mono font-bold tracking-[0.25em] text-[#120A2B]/70 uppercase mt-1 leading-none">
            RECRUITMENT
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {renderIcon(false)}
      <div className="flex flex-col select-none">
        <span className={`font-extrabold text-xl tracking-tight leading-none font-sans ${textColor || 'text-slate-900 dark:text-white'}`}>
          LaunchPath
        </span>
        <span className={`text-[9px] font-mono font-bold tracking-[0.25em] uppercase mt-1 leading-none ${textColor ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'}`}>
          RECRUITMENT
        </span>
      </div>
    </div>
  );
}
