import { getMember } from '@/src/lib/members';
import type { CalendarEvent, MemberId } from '@/src/lib/types';

const START_HOUR = 8;
const HOUR_HEIGHT = 34;

interface EventBlockProps {
  event: CalendarEvent;
  dimmed?: boolean;
  onClick?: () => void;
}

export function EventBlock({ event, dimmed = false, onClick }: EventBlockProps) {
  const primary = getMember(event.memberIds[0] as MemberId);
  const startH = new Date(event.start).getHours() + new Date(event.start).getMinutes() / 60;
  const endH   = new Date(event.end).getHours()   + new Date(event.end).getMinutes()   / 60;

  const top  = (startH - START_HOUR) * HOUR_HEIGHT;
  const h    = Math.max((endH - startH) * HOUR_HEIGHT - 2, 20);

  return (
    <div
      onClick={onClick}
      className="absolute left-0.5 right-0.5 rounded-[6px] overflow-hidden cursor-pointer"
      style={{
        top,
        height: h,
        background: primary.color,
        opacity: dimmed ? 0.25 : 1,
        transition: 'opacity 200ms ease',
        padding: '3px 4px',
      }}
    >
      <div className="text-white font-semibold leading-[1.15] overflow-hidden" style={{ fontSize: 8.5 }}>
        {event.title}
      </div>
    </div>
  );
}
