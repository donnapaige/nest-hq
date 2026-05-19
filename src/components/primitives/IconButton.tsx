'use client';

import type { ReactNode } from 'react';

interface IconButtonProps {
  children: ReactNode;
  badge?: boolean;
  onClick?: () => void;
  label?: string;
  className?: string;
}

export function IconButton({ children, badge, onClick, label, className = '' }: IconButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`relative w-10 h-10 rounded-chip bg-surface border border-hairline flex items-center justify-center text-ink cursor-pointer active:scale-95 transition-transform duration-[120ms] ${className}`}
    >
      {children}
      {badge && (
        <span
          className="absolute top-[7px] right-[7px] w-2 h-2 rounded-full bg-warn border-2 border-surface"
          aria-hidden="true"
        />
      )}
    </button>
  );
}
