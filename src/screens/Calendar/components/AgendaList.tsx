'use client';

import { getMember } from '@/src/lib/members';
import { Card } from '@/src/components/primitives/Card';
import { Avatar } from '@/src/components/primitives/Avatar';
import type { CalendarEvent, MemberId } from '@/src/lib/types';

interface AgendaListProps {
  events: CalendarEvent[];
  onEventClick: (ev: CalendarEvent) => void;
}

function fmtTime(iso: string) {
  const d = new Date(iso);
  let h = d.getHours();
  const ampm = h >= 12 ? 'PM' : 'AM';
  if (h > 12) h -= 12;
  if (h === 0) h = 12;
  return `${h}:${String(d.getMinutes()).padStart(2, '0')} ${ampm}`;
}

function fmtDateHeading(isoDate: string) {
  const d = new Date(isoDate + 'T12:00:00');
  return d.toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric' });
}

const TODAY = new Date().toISOString().split('T')[0];

export function AgendaList({ events, onEventClick }: AgendaListProps) {
  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-8 py-16 text-center">
        <span style={{ fontSize: 40 }}>📅</span>
        <p style={{ fontSize: 17, fontWeight: 700, color: '#1E1E2E', marginTop: 16 }}>Nothing on the agenda</p>
        <p style={{ fontSize: 14, color: '#8A7E6B', marginTop: 6 }}>Tap + to add your first event</p>
      </div>
    );
  }

  // Sort events chronologically
  const sorted = [...events].sort((a, b) => a.start.localeCompare(b.start));

  // Group by ISO date (YYYY-MM-DD)
  const byDate = new Map<string, CalendarEvent[]>();
  for (const ev of sorted) {
    const date = ev.start.split('T')[0] ?? ev.start.substring(0, 10);
    if (!byDate.has(date)) byDate.set(date, []);
    byDate.get(date)!.push(ev);
  }

  return (
    <div className="px-5 pb-6 flex flex-col gap-5">
      {Array.from(byDate.entries()).map(([date, dayEvents]) => {
        const isToday = date === TODAY;
        return (
          <div key={date}>
            {/* Date heading */}
            <div
              className="px-3 py-1.5 rounded-[10px] mb-2 inline-flex items-center gap-2"
              style={{ background: isToday ? '#DBA03A3D' : '#F0E5D2' }}
            >
              <span style={{ fontSize: 11, fontWeight: 800, color: isToday ? '#A0621A' : '#6B5B3E', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                {isToday ? 'Today · ' : ''}{fmtDateHeading(date)}
              </span>
            </div>

            {/* Event rows */}
            <div className="flex flex-col gap-[10px]">
              {dayEvents.map((ev) => {
                const m = getMember(ev.memberIds[0] as MemberId);
                return (
                  <Card key={ev.id} pad={0} style={{ display: 'flex', overflow: 'hidden' }} onClick={() => onEventClick(ev)}>
                    <div style={{ width: 4, background: m.color, flexShrink: 0 }} />
                    <div className="flex items-center gap-3 flex-1 px-3 py-3">
                      <div className="text-[12px] font-bold text-ink w-14 shrink-0">
                        {ev.allDay ? 'All day' : fmtTime(ev.start)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[14px] font-semibold text-ink truncate">{ev.title}</div>
                        {ev.location && (
                          <div className="text-xs text-muted mt-0.5 truncate">{ev.location}</div>
                        )}
                      </div>
                      {ev.memberIds[0] && (
                        <Avatar member={ev.memberIds[0] as MemberId} size={28} />
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
