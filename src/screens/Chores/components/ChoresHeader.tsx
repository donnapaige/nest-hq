'use client';

import { IconButton } from '@/src/components/primitives/IconButton';
import { Icon } from '@/src/components/primitives/Icon';
import type { KanbanView } from '../ChoresScreen';

interface ChoresHeaderProps {
  done: number;
  total: number;
  view: KanbanView;
  onViewChange: (v: KanbanView) => void;
  onAdd: () => void;
}

export function ChoresHeader({ done, total, view, onViewChange, onAdd }: ChoresHeaderProps) {
  return (
    <div className="px-5 pt-safe-top pb-3">
      <div className="text-[13px] text-muted font-medium mb-1">
        This week · {done} of {total} done
      </div>
      <div className="flex items-center justify-between">
        <h1 className="m-0 text-h1 font-bold text-ink" style={{ letterSpacing: -0.5 }}>
          Chore Board
        </h1>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex bg-surface border border-hairline rounded-chip overflow-hidden">
            {(['board', 'byPerson'] as KanbanView[]).map((v) => (
              <button
                key={v}
                onClick={() => onViewChange(v)}
                className={`px-2.5 py-1.5 text-[11px] font-semibold capitalize transition-colors duration-[200ms] border-none cursor-pointer whitespace-nowrap ${
                  view === v ? 'bg-primary text-white' : 'bg-transparent text-muted'
                }`}
              >
                {v === 'board' ? 'Board' : 'By person'}
              </button>
            ))}
          </div>
          <IconButton label="Add chore" onClick={onAdd}>
            <Icon name="plus" size={20} color="#333333" />
          </IconButton>
        </div>
      </div>
    </div>
  );
}
