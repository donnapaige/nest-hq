import type { Chore } from '@/src/lib/types';

const EMPTY_META: Record<Chore['status'], { icon: string; heading: string; body: string }> = {
  todo: {
    icon: '🎉',
    heading: 'Nothing to do!',
    body: 'All chores are handled. Tap + to add a new one.',
  },
  inProgress: {
    icon: '👍',
    heading: 'Nothing started yet',
    body: 'Drag a chore here when you start it.',
  },
  done: {
    icon: '🌱',
    heading: 'First done is the hardest',
    body: 'Complete a chore to see it land here.',
  },
};

interface ChoreColumnEmptyProps {
  status: Chore['status'];
}

export function ChoreColumnEmpty({ status }: ChoreColumnEmptyProps) {
  const { icon, heading, body } = EMPTY_META[status];
  return (
    <div className="flex flex-col items-center justify-center text-center py-10 px-4">
      <span className="text-[32px] mb-3">{icon}</span>
      <p className="text-[14px] font-bold text-ink mb-1">{heading}</p>
      <p className="text-[12px] text-muted font-medium leading-snug">{body}</p>
    </div>
  );
}
