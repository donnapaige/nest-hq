'use client';

import { IconButton } from '@/src/components/primitives/IconButton';
import { Icon } from '@/src/components/primitives/Icon';
import type { CalendarView } from '../hooks/useCalendar';

interface CalendarHeaderProps {
  eyebrow: string;
  title: string;
  view: CalendarView;
  onViewChange: (v: CalendarView) => void;
  onPrev?: () => void;
  onNext?: () => void;
  onSearch?: () => void;
}

export function CalendarHeader({ eyebrow, title, view, onViewChange, onPrev, onNext, onSearch }: CalendarHeaderProps) {
  return (
    <div className="px-5 pt-safe-top pb-2">
      <div className="flex items-center justify-between mb-1">
        {/* Title + prev/next arrows */}
        <div className="flex items-center gap-2 min-w-0">
          {onPrev && (
            <button onClick={onPrev} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 2px', color: '#8A7E6B', flexShrink: 0 }} aria-label="Previous">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
          )}
          <div className="min-w-0">
            <div className="text-[13px] text-muted font-medium">{eyebrow}</div>
            <h1 className="m-0 text-h1 font-bold text-ink truncate" style={{ letterSpacing: -0.5 }}>{title}</h1>
          </div>
          {onNext && (
            <button onClick={onNext} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 2px', color: '#8A7E6B', flexShrink: 0 }} aria-label="Next">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* View toggle */}
          <div className="flex bg-surface border border-hairline rounded-chip overflow-hidden">
            {(['week', 'month', 'agenda'] as CalendarView[]).map((v) => (
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
          <IconButton label="Search" onClick={onSearch}><Icon name="search" size={18} color="#333333" /></IconButton>
          <IconButton label="Filter"><Icon name="filter" size={18} color="#333333" /></IconButton>
        </div>
      </div>
    </div>
  );
}
