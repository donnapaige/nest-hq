'use client';

import { Avatar } from '@/src/components/primitives/Avatar';
import { Icon } from '@/src/components/primitives/Icon';
import type { ShoppingItem } from '@/src/lib/types';

interface ShoppingRowProps {
  item: ShoppingItem;
  pending: boolean;
  completed?: boolean;
  onToggle: () => void;
  isLast?: boolean;
}

export function ShoppingRow({ item, pending, completed, onToggle, isLast }: ShoppingRowProps) {
  const checked = pending || completed;

  return (
    <div
      onClick={onToggle}
      className={`flex items-center gap-3 cursor-pointer select-none overflow-hidden ${
        pending ? 'animate-collapse' : ''
      }`}
      style={{
        padding: '12px 14px',
        borderBottom: isLast ? 'none' : '1px solid #E8DFCB',
      }}
    >
      {/* Checkbox with animation */}
      <div
        className="relative shrink-0 flex items-center justify-center rounded-full"
        style={{
          width: 22,
          height: 22,
          background: checked ? '#334266' : '#F6F3EC',
          border: `2px solid ${checked ? '#334266' : '#E8DFCB'}`,
          transition: 'background 0.18s, border-color 0.18s',
          animation: pending ? 'pop-bg 0.3s ease-out' : 'none',
        }}
      >
        {checked && (
          <div style={{ animation: pending ? 'pop-check 0.32s ease-out' : 'none' }}>
            <Icon name="check" size={13} color="#fff" stroke={3.2} />
          </div>
        )}
        {/* Expanding ring */}
        {pending && (
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              inset: -2,
              border: '2px solid #DBA03A',
              animation: 'ring-out 0.5s ease-out forwards',
            }}
          />
        )}
      </div>

      {/* Item text */}
      <div className="flex-1 min-w-0">
        <div
          className="text-[15px] font-semibold text-ink transition-opacity duration-[200ms]"
          style={{
            textDecoration: checked ? 'line-through' : 'none',
            opacity: completed ? 0.6 : 1,
          }}
        >
          {item.name}
        </div>
        {item.qty && (
          <div className="text-[12px] text-muted mt-0.5">{item.qty}</div>
        )}
      </div>

      {/* Added by avatar */}
      <div title={`Added by ${item.addedBy}`}>
        <Avatar member={item.addedBy} size={24} />
      </div>
    </div>
  );
}
