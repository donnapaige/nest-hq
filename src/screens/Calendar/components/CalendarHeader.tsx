'use client';

import { IconButton } from '@/src/components/primitives/IconButton';
import { Icon } from '@/src/components/primitives/Icon';
import type { CalendarView } from '../hooks/useCalendar';

interface CalendarHeaderProps {
  eyebrow: string;
  title: string;
  view: CalendarView;
  onViewChange: (v: CalendarView) => void;
}

export function CalendarHeader({ eyebrow, title, view, onViewChange }: CalendarHeaderProps) {
  return (
    <div className="px-5 pt-safe-top pb-2">
      <div className="flex items-center justify-between mb-1">
        <div>
          <div className="text-[13px] text-muted font-medium">{eyebrow}</div>
          <h1 className="m-0 text-h1 font-bold text-ink" style={{ letterSpacing: -0.5 }}>{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex bg-surface border border-hairline rounded-chip overflow-hidden">
            {(['week', 'month'] as CalendarView[]).map((v) => (
              <button
                key={v}
                onClick={() => onViewChange(v)}
                className={`px-3 py-1.5 text-[12px] font-semibold capitalize transition-colors duration-[200ms] border-none cursor-pointer ${
                  view === v ? 'bg-primary text-white' : 'bg-transparent text-muted'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
          <IconButton label="Search"><Icon name="search" size={18} color="#333333" /></IconButton>
          <IconButton label="Filter"><Icon name="filter" size={18} color="#333333" /></IconButton>
        </div>
      </div>
    </div>
  );
}
