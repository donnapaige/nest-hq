import { Avatar } from '@/src/components/primitives/Avatar';
import { getMember } from '@/src/lib/members';
import type { MemberId } from '@/src/lib/types';

interface LeaderboardEntry { memberId: MemberId; pts: number }

interface LeaderboardStripProps {
  entries: LeaderboardEntry[];
}

export function LeaderboardStrip({ entries }: LeaderboardStripProps) {
  return (
    <div className="mx-5 bg-surface border border-hairline rounded-[18px] flex items-center justify-between" style={{ padding: '14px 12px' }}>
      {entries.map(({ memberId, pts }) => {
        const m = getMember(memberId);
        return (
          <div key={memberId} className="flex flex-col items-center gap-1 flex-1">
            <Avatar member={memberId} size={36} />
            <span className="text-[11px] font-semibold text-muted">{m.name.split(' ')[0]}</span>
            <span
              className="text-[11px] font-bold rounded-pill"
              style={{
                color: m.color,
                background: m.color + '18',
                padding: '2px 8px',
              }}
            >
              {pts}★
            </span>
          </div>
        );
      })}
    </div>
  );
}
