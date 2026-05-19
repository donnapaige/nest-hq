const TODAY = new Date('2026-05-19');

function daysUntilDue(dueDate: string): number {
  const due = new Date(dueDate);
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((due.getTime() - TODAY.getTime()) / msPerDay);
}

type ChipColor = 'danger' | 'warn' | 'accent' | 'muted';

function getChip(days: number): { label: string; color: ChipColor } {
  if (days < 0)  return { label: 'Overdue',            color: 'danger' };
  if (days === 0) return { label: 'Due today',          color: 'danger' };
  if (days === 1) return { label: 'Due tomorrow',       color: 'warn'   };
  if (days <= 3)  return { label: `Due in ${days} days`, color: 'warn'  };
  if (days <= 7)  return { label: `Due in ${days} days`, color: 'accent' };
  return                  { label: `Due in ${days} days`, color: 'muted' };
}

const COLOR_MAP: Record<ChipColor, { text: string; bg: string }> = {
  danger: { text: '#C65A3A', bg: '#C65A3A18' },
  warn:   { text: '#F28C38', bg: '#F28C3818' },
  accent: { text: '#DBA03A', bg: '#DBA03A18' },
  muted:  { text: '#8A7E6B', bg: '#8A7E6B14' },
};

interface DueCountdownChipProps {
  dueDate: string;
  paid?: boolean;
}

export function DueCountdownChip({ dueDate, paid }: DueCountdownChipProps) {
  if (paid) return null;
  const days = daysUntilDue(dueDate);
  const { label, color } = getChip(days);
  const { text, bg } = COLOR_MAP[color];

  return (
    <span
      className="text-[11px] font-bold rounded-pill"
      style={{ color: text, background: bg, padding: '2px 8px' }}
    >
      {label}
    </span>
  );
}

export { daysUntilDue, getChip };
