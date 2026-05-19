'use client';

import { getMember } from '@/src/lib/members';
import type { CalendarEvent, MemberId } from '@/src/lib/types';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface MonthGridProps {
  year: number;
  month: number; // 0-based
  events: CalendarEvent[];
  activeFilters: MemberId[];
  today?: string;
}

export function MonthGrid({ year, month, events, activeFilters, today }: MonthGridProps) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="px-5">
      {/* Weekday header */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-[11px] font-bold text-muted uppercase py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-px">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isToday = iso === today;
          const dayEvents = events.filter((e) => e.start.startsWith(iso));
          const filtered = activeFilters.length === 0
            ? dayEvents
            : dayEvents.filter((e) => e.memberIds.some((id) => activeFilters.includes(id as MemberId)));

          return (
            <div
              key={i}
              className="flex flex-col items-center py-1 min-h-[48px] rounded-[8px]"
              style={{ background: isToday ? '#DBA03A3D' : 'transparent' }}
            >
              <span
                className="text-[13px] font-semibold mb-0.5"
                style={{ color: isToday ? '#1F2A45' : '#333333' }}
              >
                {day}
              </span>
              <div className="flex gap-px flex-wrap justify-center">
                {filtered.slice(0, 3).map((ev) => {
                  const m = getMember(ev.memberIds[0] as MemberId);
                  return (
                    <div
                      key={ev.id}
                      className="w-1 h-1 rounded-full"
                      style={{ background: m.color }}
                    />
                  );
                })}
                {filtered.length > 3 && (
                  <span className="text-[9px] text-muted font-bold">+{filtered.length - 3}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
