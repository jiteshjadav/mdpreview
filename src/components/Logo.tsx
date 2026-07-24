import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export function Logo({ className = "h-8 w-auto", showText = true }: LogoProps) {
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {/* Brand icon – compact height */}
      <img
        src="/brand-icon.png"
        alt="mdpreview icon"
        className="shrink-0 object-contain"
        style={{ height: '20px', width: 'auto' }}
      />

      {/* Brand text */}
      {showText && (
        <span
          className="font-extrabold text-base sm:text-lg tracking-tight select-none flex items-center"
          style={{ color: 'var(--doc-header-text, currentColor)' }}
        >
          mdpreview
          <span className="text-sky-600 dark:text-sky-400 font-bold ml-0.5">.io</span>
        </span>
      )}
    </div>
  );
}
