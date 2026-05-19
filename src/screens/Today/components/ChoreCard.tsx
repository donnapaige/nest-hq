'use client';

import { Avatar } from '@/src/components/primitives/Avatar';
import { getMember } from '@/src/lib/members';
import type { ChoreLite } from '@/src/lib/types';

interface ChoreCardProps {
  chore: ChoreLite;
  onComplete?: (id: string) => void;
}

export function ChoreCard({ chore, onComplete }: ChoreCardProps) {
  const m = getMember(chore.memberId);

  return (
    <div
      className="shrink-0 bg-surface border border-hairline rounded-card"
      style={{ width: 168, padding: 14 }}
    >
      <div className="flex items-center justify-between mb-3">
        <Avatar member={chore.memberId} size={32} />
        <button
          onClick={() => onComplete?.(chore.id)}
          aria-label={`Complete ${chore.title}`}
          className="w-6 h-6 rounded-full border-2 border-hairline bg-bg flex items-center justify-center cursor-pointer"
          style={{ minWidth: 24 }}
        />
      </div>
      <div className="text-[14px] font-semibold text-ink leading-[1.25]">{chore.title}</div>
      <div className="text-[11px] text-muted mt-1">{chore.subtitle}</div>
    </div>
  );
}
