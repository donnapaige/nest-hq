'use client';

import { useRef, useState } from 'react';
import { EventBlock } from './EventBlock';
import type { CalendarEvent, MemberId } from '@/src/lib/types';

const START_HOUR = 8;
const END_HOUR   = 20;
const HOUR_HEIGHT = 34;
const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);

interface WeekGridProps {
  days: { date: string; n: number }[];
  events: CalendarEvent[];
  activeFilters: MemberId[];
  onEventClick?: (ev: CalendarEvent) => void;
  onSlotClick?: (date: string, hour: number) => void;
}

function hourLabel(h: number) {
  if (h === 12) return '12p';
  if (h > 12) return `${h - 12}p`;
  return `${h}a`;
}

export function WeekGrid({ days, events, activeFilters, onEventClick, onSlotClick }: WeekGridProps) {
  const isDimmed = (ev: CalendarEvent) =>
    activeFilters.length > 0 && !ev.memberIds.some((id) => activeFilters.includes(id as MemberId));

  return (
    <div className="flex-1 overflow-y-auto" style={{ maxHeight: 540 }}>
      <div className="flex pr-2">
        {/* Hours rail */}
        <div className="w-9 shrink-0">
          {HOURS.map((h) => (
            <div
              key={h}
              className="text-muted font-semibold text-left pl-2 pt-0.5"
              style={{ height: HOUR_HEIGHT, fontSize: 9 }}
            >
              {hourLabel(h)}
            </div>
          ))}
        </div>

        {/* Day columns */}
        <div className="flex-1 relative flex border-t border-hairline">
          {/* Horizontal hour lines */}
          {HOURS.map((_, i) => (
            <div
              key={i}
              className="absolute left-0 right-0 border-b border-hairline pointer-events-none"
              style={{ top: i * HOUR_HEIGHT, height: HOUR_HEIGHT }}
            />
          ))}

          {days.map((day, di) => {
            const dayEvents = events.filter((e) => e.start.startsWith(day.date));
            return (
              <div
                key={day.date}
                className="flex-1 relative"
                style={{
                  minHeight: HOURS.length * HOUR_HEIGHT,
                  borderLeft: di > 0 ? '1px dashed #E8DFCB' : 'none',
                }}
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const y = e.clientY - rect.top;
                  const hour = Math.floor(y / HOUR_HEIGHT) + START_HOUR;
                  onSlotClick?.(day.date, hour);
                }}
              >
                {dayEvents.map((ev) => (
                  <EventBlock
                    key={ev.id}
                    event={ev}
                    dimmed={isDimmed(ev)}
                    onClick={() => onEventClick?.(ev)}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
