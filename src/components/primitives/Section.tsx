import type { ReactNode } from 'react';

interface SectionProps {
  title: string;
  action?: string;
  onAction?: () => void;
  children: ReactNode;
  className?: string;
}

export function Section({ title, action, onAction, children, className = '' }: SectionProps) {
  return (
    <div className={`mb-[22px] ${className}`}>
      <div className="flex items-baseline justify-between px-5 mb-2.5">
        <h3 className="m-0 text-label font-bold text-muted uppercase tracking-[0.08em]">
          {title}
        </h3>
        {action && (
          <button
            onClick={onAction}
            className="text-[13px] text-primary font-semibold bg-transparent border-none cursor-pointer p-0"
          >
            {action}
          </button>
        )}
      </div>
      <div className="px-5 flex flex-col gap-[10px]">
        {children}
      </div>
    </div>
  );
}
