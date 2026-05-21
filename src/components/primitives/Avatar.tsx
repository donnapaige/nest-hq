'use client';

import { useHousehold } from '@/src/context/HouseholdContext';

interface AvatarProps {
  member: string;
  size?: number;
  ring?: boolean;
  className?: string;
}

export function Avatar({ member, size = 36, ring = false, className = '' }: AvatarProps) {
  const { getMemberById } = useHousehold();
  const m = getMemberById(member);

  const color     = m?.color     ?? '#9BA3AF';
  const softColor = m?.softColor ?? '#F3F4F6';
  const emoji     = m?.emoji     ?? '👤';
  const name      = m?.name      ?? 'Member';
  const photoUrl  = m?.photoUrl  ?? null;
  const fontSize  = Math.round(size * 0.46);

  const ringStyle = ring ? { boxShadow: `0 0 0 2px #FBF8F1, 0 0 0 4px ${color}` } : {};

  if (photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photoUrl}
        alt={name}
        className={`inline-block shrink-0 rounded-full object-cover ${className}`}
        style={{ width: size, height: size, ...ringStyle }}
      />
    );
  }

  return (
    <div
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-bold ${className}`}
      style={{
        width: size,
        height: size,
        background: softColor,
        color,
        fontSize,
        letterSpacing: -0.3,
        ...ringStyle,
      }}
      aria-label={name}
    >
      {emoji}
    </div>
  );
}
