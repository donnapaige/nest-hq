import { Card } from '@/src/components/primitives/Card';
import { Avatar } from '@/src/components/primitives/Avatar';
import { getMember } from '@/src/lib/members';
import type { EventLite } from '@/src/lib/types';

interface EventRowProps {
  event: EventLite;
  onClick?: () => void;
}

export function EventRow({ event, onClick }: EventRowProps) {
  const m = getMember(event.memberId);
  const [timePart, amPm] = event.time.split(' ');

  return (
    <Card pad={0} style={{ display: 'flex', alignItems: 'stretch', overflow: 'hidden' }} onClick={onClick}>
      {/* Member accent bar */}
      <div style={{ width: 4, background: m.color, flexShrink: 0 }} />
      {/* Content */}
      <div className="flex-1 flex items-center gap-3" style={{ padding: '12px 14px' }}>
        <div className="text-left" style={{ width: 60 }}>
          <div className="text-[13px] font-bold text-ink" style={{ letterSpacing: -0.2 }}>
            {timePart}
          </div>
          <div className="text-[10px] font-bold text-muted uppercase" style={{ letterSpacing: 0.6 }}>
            {amPm}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[15px] font-semibold text-ink">{event.title}</div>
          <div className="text-xs text-muted mt-0.5">{event.subtitle}</div>
        </div>
        <Avatar member={event.memberId} size={32} />
      </div>
    </Card>
  );
}
