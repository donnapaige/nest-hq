import type { ReactNode } from 'react';

interface TopBarProps {
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
  leading?: ReactNode;
}

export function TopBar({ title, subtitle, trailing, leading }: TopBarProps) {
  return (
    <div className="flex items-end justify-between gap-3 px-5 pt-safe-top pb-2">
      <div className="min-w-0">
        {subtitle && (
          <div className="text-[13px] text-muted font-medium mb-0.5">{subtitle}</div>
        )}
        <h1 className="m-0 text-h1 font-bold text-ink" style={{ letterSpacing: -0.5, lineHeight: 1.1 }}>
          {title}
        </h1>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {leading}
        {trailing}
      </div>
    </div>
  );
}
