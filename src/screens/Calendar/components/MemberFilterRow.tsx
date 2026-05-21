'use client';

import { Avatar } from '@/src/components/primitives/Avatar';
import { useHousehold } from '@/src/context/HouseholdContext';
import type { MemberId } from '@/src/lib/types';

interface MemberFilterRowProps {
  active: MemberId[];
  onToggle: (id: MemberId) => void;
  onClearAll: () => void;
  totalCount: number;
}

export function MemberFilterRow({ active, onToggle, onClearAll, totalCount }: MemberFilterRowProps) {
  const { members } = useHousehold();
  const allActive = active.length === 0;

  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-none px-5 py-3">
      {/* All chip */}
      <button
        onClick={onClearAll}
        className={`flex items-center gap-1.5 rounded-pill shrink-0 border-none cursor-pointer transition-colors duration-[200ms] ${
          allActive ? 'bg-primary text-white' : 'bg-surface border border-hairline text-ink'
        }`}
        style={{ padding: '6px 12px 6px 8px' }}
      >
        <span
          className="w-[18px] h-[18px] rounded-full flex items-center justify-center text-[11px] font-extrabold"
          style={{
            background: allActive ? '#fff' : '#334266',
            color: allActive ? '#334266' : '#fff',
          }}
        >
          {totalCount}
        </span>
        <span className="text-[12px] font-bold">All</span>
      </button>

      {/* Member chips — populated from real household members */}
      {members.map((m) => {
        const isOn = active.includes(m.id);
        return (
          <button
            key={m.id}
            onClick={() => onToggle(m.id)}
            className={`flex items-center gap-1.5 rounded-pill shrink-0 border cursor-pointer transition-colors duration-[200ms] ${
              isOn ? 'border-transparent' : 'bg-surface border-hairline'
            }`}
            style={{
              padding: '6px 12px 6px 6px',
              background: isOn ? m.softColor : undefined,
            }}
          >
            <Avatar member={m.id} size={22} />
            <span className="text-[12px] font-semibold text-ink">{m.name}</span>
          </button>
        );
      })}
    </div>
  );
}
