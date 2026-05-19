import { Avatar } from '@/src/components/primitives/Avatar';
import { getMember } from '@/src/lib/members';
import type { PresencePeer } from '../hooks/usePresence';

interface PresenceBarProps {
  isLive: boolean;
  activePeers: PresencePeer[];
  lastEditor?: PresencePeer;
  secondsAgo: number;
}

export function PresenceBar({ isLive, activePeers, lastEditor, secondsAgo }: PresenceBarProps) {
  const label = lastEditor && secondsAgo < 30
    ? `Live · ${getMember(lastEditor.memberId as any).name.split(' ')[0]} edited ${secondsAgo}s ago`
    : `Live · ${activePeers.length} online`;

  return (
    <div
      className="mx-5 mb-3 bg-surface border border-hairline rounded-[14px] flex items-center gap-[10px]"
      style={{ padding: '10px 14px' }}
    >
      {/* Pulse dot */}
      <div
        className="w-2 h-2 rounded-full shrink-0"
        style={{
          background: '#DBA03A',
          boxShadow: isLive ? '0 0 0 4px #DBA03A33' : 'none',
          animation: isLive ? 'ring-pulse 2s ease-in-out infinite' : 'none',
        }}
      />

      <div className="flex-1 text-[12px] font-medium text-body">
        <span className="font-bold text-ink">Live</span>
        {' · '}
        {label.replace('Live · ', '')}
      </div>

      {/* Active peer avatars (max 3) */}
      <div className="flex">
        {activePeers.slice(0, 3).map((p, i) => (
          <div key={p.memberId} style={{ marginLeft: i > 0 ? -8 : 0 }}>
            <Avatar member={p.memberId as any} size={22} ring />
          </div>
        ))}
      </div>
    </div>
  );
}
