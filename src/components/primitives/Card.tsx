import type { ReactNode, CSSProperties } from 'react';

interface CardProps {
  children: ReactNode;
  pad?: number;
  style?: CSSProperties;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, pad = 16, style, className = '', onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-surface border border-hairline rounded-card shadow-card ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={{ padding: pad, ...style }}
    >
      {children}
    </div>
  );
}
