import { ProgressBar } from './ProgressBar';
import type { SavingsGoal } from '@/src/lib/types';

interface GoalCardProps {
  goal: SavingsGoal;
  onDeposit?: (id: string) => void;
}

export function GoalCard({ goal, onDeposit }: GoalCardProps) {
  const pct = Math.min(Math.round((goal.saved / goal.target) * 100), 100);

  return (
    <button
      onClick={() => onDeposit?.(goal.id)}
      className="w-full bg-surface border border-hairline rounded-card text-left cursor-pointer"
      style={{ padding: 14 }}
    >
      <div className="flex items-start gap-3 mb-3">
        {/* Icon tile */}
        <div
          className="flex items-center justify-center rounded-[12px] text-[20px] shrink-0"
          style={{
            width: 40,
            height: 40,
            background: goal.color + '18',
          }}
        >
          {goal.icon}
        </div>

        {/* Name + amounts */}
        <div className="flex-1 min-w-0">
          <div className="text-[15px] font-semibold text-ink">{goal.name}</div>
          <div className="text-[12px] text-muted mt-0.5">
            <span className="font-bold" style={{ color: goal.color }}>
              ${goal.saved.toLocaleString()}
            </span>
            {' '}of ${goal.target.toLocaleString()}
          </div>
        </div>

        {/* Percent */}
        <div className="text-[13px] font-bold shrink-0" style={{ color: goal.color }}>
          {pct}%
        </div>
      </div>

      <ProgressBar percent={pct} color={goal.color} />
    </button>
  );
}
