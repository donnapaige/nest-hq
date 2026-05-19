import { getMember } from '@/src/lib/members';
import { Card } from '@/src/components/primitives/Card';
import { Avatar } from '@/src/components/primitives/Avatar';
import type { CalendarEvent, MemberId } from '@/src/lib/types';

interface TimeOfDayListProps {
  events: CalendarEvent[];
  onEventClick?: (ev: CalendarEvent) => void;
}

const GROUPS = [
  { label: 'Morning',   start: 0,  end: 12 },
  { label: 'Afternoon', start: 12, end: 17 },
  { label: 'Evening',   start: 17, end: 24 },
];

function fmt(iso: string) {
  const d = new Date(iso);
  let h = d.getHours(), ampm = h >= 12 ? 'PM' : 'AM';
  if (h > 12) h -= 12; if (h === 0) h = 12;
  return `${h}:${String(d.getMinutes()).padStart(2, '0')} ${ampm}`;
}

export function TimeOfDayList({ events, onEventClick }: TimeOfDayListProps) {
  return (
    <div className="px-5 pb-4 flex flex-col gap-3">
      {GROUPS.map((grp) => {
        const grpEvents = events.filter((e) => {
          const h = new Date(e.start).getHours();
          return h >= grp.start && h < grp.end;
        });
        if (grpEvents.length === 0) return null;

        return (
          <div key={grp.label}>
            <div className="text-label text-muted uppercase mb-2">{grp.label}</div>
            <div className="flex flex-col gap-[10px]">
              {grpEvents.map((ev) => {
                const m = getMember(ev.memberIds[0] as MemberId);
                return (
                  <Card key={ev.id} pad={0} style={{ display: 'flex', overflow: 'hidden' }} onClick={() => onEventClick?.(ev)}>
                    <div style={{ width: 4, background: m.color }} />
                    <div className="flex items-center gap-3 flex-1 px-3 py-3">
                      <div className="text-[12px] font-bold text-ink w-14 shrink-0">{fmt(ev.start)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[14px] font-semibold text-ink">{ev.title}</div>
                        {ev.location && <div className="text-xs text-muted mt-0.5">{ev.location}</div>}
                      </div>
                      <Avatar member={ev.memberIds[0] as MemberId} size={28} />
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
