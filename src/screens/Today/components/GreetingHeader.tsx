'use client';

import { IconButton } from '@/src/components/primitives/IconButton';
import { Icon } from '@/src/components/primitives/Icon';

interface GreetingHeaderProps {
  date: string;
  greeting: string;
  householdName: string;
  hasBadge: boolean;
  onBell?: () => void;
}

export function GreetingHeader({ date, greeting, householdName, hasBadge, onBell }: GreetingHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-3 px-5 pt-safe-top pb-[18px]">
      <div className="min-w-0">
        <div className="text-[13px] text-muted font-medium mb-1.5">{date}</div>
        <h1
          className="m-0 font-bold text-ink"
          style={{ fontSize: 22, letterSpacing: -0.4, lineHeight: 1.2 }}
        >
          {greeting}
        </h1>
        <div className="text-[13px] text-muted font-medium mt-1">{householdName}</div>
      </div>
      <div className="flex gap-2 shrink-0 mt-1">
        <IconButton badge={hasBadge} onClick={onBell} label="Notifications">
          <Icon name="bell" size={20} color="#333333" />
        </IconButton>
      </div>
    </div>
  );
}
