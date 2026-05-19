'use client';

export type BillsTab = 'bills' | 'savings';

interface TabSwitcherProps {
  active: BillsTab;
  onChange: (tab: BillsTab) => void;
}

const TABS: Array<{ id: BillsTab; label: string }> = [
  { id: 'bills',   label: 'Bills' },
  { id: 'savings', label: 'Savings' },
];

export function TabSwitcher({ active, onChange }: TabSwitcherProps) {
  return (
    <div className="flex bg-surface border border-hairline rounded-chip mx-5 mb-4 overflow-hidden p-1 gap-1">
      {TABS.map(({ id, label }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={`flex-1 py-2 text-[13px] font-bold rounded-[6px] border-none cursor-pointer transition-all duration-[200ms] ease ${
            active === id ? 'bg-primary text-white' : 'bg-transparent text-muted'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
