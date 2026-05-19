interface StreakNudgeProps {
  days: number;
}

export function StreakNudge({ days }: StreakNudgeProps) {
  return (
    <div
      className="mx-5 flex items-center gap-3 rounded-card"
      style={{
        background: '#DBA03A22',
        border: '1px solid #DBA03A55',
        padding: 14,
      }}
    >
      <div className="text-[22px]" aria-hidden="true">🌱</div>
      <div className="flex-1">
        <div className="text-[13px] font-bold mb-0.5" style={{ color: '#1F2A45' }}>
          Family streak: {days} days
        </div>
        <div className="text-[12px] text-ink">
          Everyone checked off at least one chore.
        </div>
      </div>
    </div>
  );
}
