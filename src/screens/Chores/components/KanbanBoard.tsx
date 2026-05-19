'use client';

import { useRef, useState, useCallback } from 'react';
import { KanbanColumn } from './KanbanColumn';
import type { Chore } from '@/src/lib/types';

const COLUMNS: Array<{ status: Chore['status']; label: string }> = [
  { status: 'todo',       label: 'To Do' },
  { status: 'inProgress', label: 'In Progress' },
  { status: 'done',       label: 'Done' },
];

interface KanbanBoardProps {
  chores: Chore[];
  onComplete: (id: string) => void;
  onEdit: (id: string) => void;
}

export function KanbanBoard({ chores, onComplete, onEdit }: KanbanBoardProps) {
  const [activePage, setActivePage] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const page = Math.round(el.scrollLeft / el.offsetWidth);
    setActivePage(page);
  }, []);

  const goToPage = (i: number) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ left: i * el.offsetWidth, behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col min-h-0">
      {/* Horizontal scroll pager */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto scrollbar-none snap-x snap-mandatory"
      >
        {COLUMNS.map(({ status }) => (
          <div key={status} className="shrink-0 w-full snap-start pt-3">
            <KanbanColumn
              status={status}
              chores={chores.filter((c) => c.status === status)}
              onComplete={onComplete}
              onEdit={onEdit}
            />
          </div>
        ))}
      </div>

      {/* Page indicator dots */}
      <div className="flex justify-center gap-2 py-3">
        {COLUMNS.map(({ label }, i) => (
          <button
            key={i}
            onClick={() => goToPage(i)}
            aria-label={label}
            className="rounded-full border-none cursor-pointer p-0 transition-all duration-[300ms] ease-out"
            style={{
              width: activePage === i ? 18 : 6,
              height: 6,
              background: activePage === i ? '#334266' : '#E8DFCB',
            }}
          />
        ))}
      </div>
    </div>
  );
}
