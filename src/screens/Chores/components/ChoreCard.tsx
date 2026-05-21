'use client';

import { useRef, useState } from 'react';
import { Avatar } from '@/src/components/primitives/Avatar';
import { Icon } from '@/src/components/primitives/Icon';
import { useHousehold } from '@/src/context/HouseholdContext';
import { useConfetti } from '@/src/components/ConfettiOverlay';
import type { Chore } from '@/src/lib/types';

interface ChoreCardProps {
  chore: Chore;
  onComplete: (id: string) => void;
  onEdit?: (id: string) => void;
}

export function ChoreCard({ chore, onComplete, onEdit }: ChoreCardProps) {
  const { getMemberById } = useHousehold();
  const m    = getMemberById(chore.memberId);
  const forM = chore.forMemberId ? getMemberById(chore.forMemberId) : undefined;
  const fire = useConfetti();
  const isDone = chore.status === 'done';

  const color     = m?.color     ?? '#9BA3AF';
  const softColor = m?.softColor ?? '#F3F4F6';

  /* Swipe state */
  const [translateX, setTranslateX] = useState(0);
  const [committed, setCommitted] = useState(false);
  const startX = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isDone) return;
    startX.current = e.clientX;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDone || !e.buttons) return;
    const delta = e.clientX - startX.current;
    setTranslateX(Math.max(0, delta));
  };

  const handlePointerUp = () => {
    if (isDone) return;
    if (translateX >= 96) {
      setCommitted(true);
      const rect = cardRef.current?.getBoundingClientRect();
      fire({ x: rect ? rect.left + rect.width / 2 : undefined, y: rect?.top });
      setTimeout(() => onComplete(chore.id), 280);
    } else {
      setTranslateX(0);
    }
  };

  const handleCheckbox = () => {
    if (isDone) return;
    const rect = cardRef.current?.getBoundingClientRect();
    fire({ x: rect ? rect.left + rect.width / 2 : undefined, y: rect?.top });
    onComplete(chore.id);
  };

  return (
    <div className="relative overflow-hidden rounded-card">
      {/* Reveal background */}
      <div className="absolute inset-0 bg-success flex items-center pl-4">
        <Icon name="check" size={20} color="#fff" stroke={2.5} />
      </div>

      {/* Card */}
      <div
        ref={cardRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className={`relative flex items-center gap-3 bg-surface border border-hairline rounded-card touch-pan-y select-none ${
          isDone ? 'opacity-60' : ''
        } ${committed ? 'transition-transform duration-[280ms] ease-out' : ''}`}
        style={{
          padding: '12px 14px',
          transform: committed ? 'translateX(120%)' : `translateX(${translateX}px)`,
          transition: committed
            ? 'transform 280ms ease-out'
            : translateX === 0
            ? 'transform 200ms ease'
            : 'none',
        }}
        onClick={() => translateX < 4 && onEdit?.(chore.id)}
      >
        {/* Member accent bar */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1 rounded-l-card"
          style={{ background: color, opacity: 0.6 }}
        />

        {/* Checkbox */}
        <button
          onClick={(e) => { e.stopPropagation(); handleCheckbox(); }}
          className="relative w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 cursor-pointer transition-all duration-[200ms]"
          style={{
            background: isDone ? color : '#F6F3EC',
            borderColor: isDone ? color : '#E8DFCB',
          }}
          aria-label={isDone ? 'Completed' : 'Mark complete'}
        >
          {isDone && <Icon name="check" size={16} color="#fff" stroke={2.6} />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div
            className="text-[14px] font-semibold text-ink"
            style={{ textDecoration: isDone ? 'line-through' : 'none' }}
          >
            {chore.title}
          </div>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-[11px] text-muted font-medium">{chore.due}</span>
            {chore.recurrence && (
              <>
                <span className="w-0.5 h-0.5 rounded-full bg-muted" />
                <span className="text-[11px] text-muted font-medium">{chore.recurrence}</span>
              </>
            )}
            {forM && (
              <>
                <span className="w-0.5 h-0.5 rounded-full bg-muted" />
                <span className="text-[11px] font-medium" style={{ color: forM.color }}>
                  For: {forM.name}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Points pill */}
        <span
          className="text-[11px] font-bold rounded-pill shrink-0"
          style={{
            color: color,
            background: softColor,
            padding: '3px 8px',
          }}
        >
          +{chore.points}
        </span>
      </div>
    </div>
  );
}
