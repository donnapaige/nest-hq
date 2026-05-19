import type { ReactNode } from 'react';

interface PillProps {
  children: ReactNode;
  color?: string;
  bg?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export function Pill({ children, color, bg, size = 'sm', className = '' }: PillProps) {
  const fontSize = size === 'sm' ? 11 : 12;
  const padding  = size === 'sm' ? '4px 8px' : '6px 10px';

  const bgColor  = bg ?? (color ? `${color}18` : undefined);

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-pill font-semibold uppercase leading-none ${className}`}
      style={{ fontSize, padding, background: bgColor, color }}
    >
      {children}
    </span>
  );
}
