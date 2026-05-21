import { useState } from 'react';
import { ProgressBar } from './ProgressBar';
import { useHousehold } from '@/src/context/HouseholdContext';
import type { SavingsGoal } from '@/src/lib/types';

interface GoalCardProps {
  goal: SavingsGoal;
  onDeposit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function GoalCard({ goal, onDeposit, onDelete }: GoalCardProps) {
  const { formatMoney } = useHousehold();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const pct = Math.min(Math.round((goal.saved / goal.target) * 100), 100);

  return (
    <div
      className="w-full bg-surface border border-hairline rounded-card text-left"
      style={{ padding: 14 }}
    >
      <div className="flex items-start gap-3 mb-3">
        {/* Icon tile */}
        <div
          className="flex items-center justify-center rounded-[12px] text-[20px] shrink-0"
          style={{ width: 40, height: 40, background: goal.color + '18' }}
        >
          {goal.icon}
        </div>

        {/* Name + amounts */}
        <button
          onClick={() => onDeposit?.(goal.id)}
          className="flex-1 min-w-0 text-left bg-transparent border-none cursor-pointer p-0"
        >
          <div className="text-[15px] font-semibold text-ink">{goal.name}</div>
          <div className="text-[12px] text-muted mt-0.5">
            <span className="font-bold" style={{ color: goal.color }}>
              {formatMoney(goal.saved)}
            </span>
            {' '}of {formatMoney(goal.target)}
          </div>
        </button>

        {/* Percent + delete */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[13px] font-bold" style={{ color: goal.color }}>{pct}%</span>
          {onDelete && !confirmDelete && (
            <button
              onClick={() => setConfirmDelete(true)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C8BFB0', fontSize: 16, lineHeight: 1, padding: '0 2px' }}
            >
              🗑
            </button>
          )}
        </div>
      </div>

      <ProgressBar percent={pct} color={goal.color} />

      {/* Confirm delete */}
      {confirmDelete && (
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => { onDelete?.(goal.id); setConfirmDelete(false); }}
            className="flex-1 py-2 rounded-xl text-xs font-bold text-white"
            style={{ background: '#C65A3A', border: 'none', cursor: 'pointer' }}
          >
            Delete goal
          </button>
          <button
            onClick={() => setConfirmDelete(false)}
            className="flex-1 py-2 rounded-xl text-xs font-bold"
            style={{ background: '#F0E5D2', color: '#334266', border: 'none', cursor: 'pointer' }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
