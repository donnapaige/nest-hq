'use client';

import { getMember } from '@/src/lib/members';
import type { MemberId } from '@/src/lib/types';

interface AvatarProps {
  member: MemberId;
  size?: number;
  ring?: boolean;
  className?: string;
}

export function Avatar({ member, size = 36, ring = false, className = '' }: AvatarProps) {
  const m = getMember(member);
  const fontSize = Math.round(size * 0.46);

  return (
    <div
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-bold ${className}`}
      style={{
        width: size,
        height: size,
        background: m.soft,
        color: m.color,
        fontSize,
        letterSpacing: -0.3,
        boxShadow: ring
          ? `0 0 0 2px #FBF8F1, 0 0 0 4px ${m.color}`
          : 'none',
      }}
      aria-label={m.name}
    >
      {m.emoji}
    </div>
  );
}
