'use client';

import { useState } from 'react';
import { Icon } from '@/src/components/primitives/Icon';
import { ShoppingRow } from './ShoppingRow';
import type { ShoppingItem } from '@/src/lib/types';

interface CompletedDrawerProps {
  items: ShoppingItem[];
  onUncheck: (id: string) => void;
}

export function CompletedDrawer({ items, onUncheck }: CompletedDrawerProps) {
  const [open, setOpen] = useState(false);

  if (items.length === 0) return null;

  return (
    <div className="mb-3.5">
      {/* Sticky toggle header */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="sticky top-0 z-[5] bg-bg w-full flex items-center justify-between border-b border-hairline cursor-pointer border-none font-[inherit] text-[inherit] text-left"
        style={{ padding: '8px 20px' }}
      >
        <div className="flex items-center gap-2">
          <div className="w-[18px] h-[18px] rounded-full bg-primary flex items-center justify-center shrink-0">
            <Icon name="check" size={11} color="#fff" stroke={3.2} />
          </div>
          <h3 className="m-0 text-[13px] font-bold text-ink uppercase tracking-[0.8px]">
            Completed
          </h3>
          <span
            className="text-[11px] font-bold rounded-pill"
            style={{ color: '#334266', background: '#33426614', padding: '2px 8px' }}
          >
            {items.length}
          </span>
        </div>
        <div
          className="text-muted transition-transform duration-[180ms] ease"
          style={{ transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }}
        >
          <Icon name="chevron" size={14} color="#8A7E6B" />
        </div>
      </button>

      {open && (
        <div className="px-5 mt-2">
          <div className="bg-surface border border-hairline rounded-card overflow-hidden">
            {items.map((it, i) => (
              <ShoppingRow
                key={it.id}
                item={it}
                pending={false}
                completed
                onToggle={() => onUncheck(it.id)}
                isLast={i === items.length - 1}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
