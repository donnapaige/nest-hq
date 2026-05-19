import { ChoreCard } from './ChoreCard';
import { ChoreColumnEmpty } from './ChoreColumnEmpty';
import type { Chore } from '@/src/lib/types';

const COLUMN_META: Record<Chore['status'], { label: string; stripBg: string }> = {
  todo:       { label: 'TO DO',       stripBg: '#F0E5D2' },
  inProgress: { label: 'IN PROGRESS', stripBg: '#DBA03A38' },
  done:       { label: 'DONE',        stripBg: '#9DB28F38' },
};

interface KanbanColumnProps {
  status: Chore['status'];
  chores: Chore[];
  onComplete: (id: string) => void;
  onEdit: (id: string) => void;
}

export function KanbanColumn({ status, chores, onComplete, onEdit }: KanbanColumnProps) {
  const { label, stripBg } = COLUMN_META[status];

  return (
    <div className="flex flex-col gap-3 px-5 pb-4">
      {/* Column header strip */}
      <div
        className="flex items-center gap-2 rounded-[10px] px-3 py-2"
        style={{ background: stripBg }}
      >
        <span className="text-[11px] font-bold text-muted tracking-[0.8px] uppercase flex-1">
          {label}
        </span>
        <span
          className="text-[11px] font-bold rounded-pill"
          style={{ color: '#334266', background: '#33426614', padding: '2px 8px' }}
        >
          {chores.length}
        </span>
      </div>

      {/* Cards or empty state */}
      {chores.length === 0 ? (
        <ChoreColumnEmpty status={status} />
      ) : (
        <div className="flex flex-col gap-2">
          {chores.map((c) => (
            <ChoreCard
              key={c.id}
              chore={c}
              onComplete={onComplete}
              onEdit={onEdit}
            />
          ))}
        </div>
      )}
    </div>
  );
}
