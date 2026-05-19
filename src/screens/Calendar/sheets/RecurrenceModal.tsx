'use client';

import { useState } from 'react';
import { BottomSheet } from '@/src/components/primitives/BottomSheet';
import type { RRule } from '@/src/lib/types';

interface RecurrenceModalProps {
  open: boolean;
  value?: RRule | null;
  onClose: () => void;
  onSave: (rule: RRule | null) => void;
}

const OPTIONS = [
  { label: 'Never',    value: null },
  { label: 'Daily',    value: { freq: 'DAILY',   interval: 1 } as RRule },
  { label: 'Weekly',   value: { freq: 'WEEKLY',  interval: 1 } as RRule },
  { label: 'Monthly',  value: { freq: 'MONTHLY', interval: 1 } as RRule },
  { label: 'Yearly',   value: { freq: 'YEARLY',  interval: 1 } as RRule },
];

export function RecurrenceModal({ open, value, onClose, onSave }: RecurrenceModalProps) {
  const [selected, setSelected] = useState<RRule | null>(value ?? null);

  return (
    <BottomSheet open={open} onClose={onClose} snapPercent={50}>
      <div className="pt-2 pb-6">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onClose} className="text-[15px] text-ink font-medium bg-transparent border-none cursor-pointer p-0">Cancel</button>
          <span className="text-[15px] font-bold text-ink">Repeat</span>
          <button
            onClick={() => { onSave(selected); onClose(); }}
            className="text-[15px] font-bold text-primary bg-transparent border-none cursor-pointer p-0"
          >
            Done
          </button>
        </div>
        <div className="flex flex-col gap-1">
          {OPTIONS.map((opt) => {
            const isActive = JSON.stringify(selected) === JSON.stringify(opt.value);
            return (
              <button
                key={opt.label}
                onClick={() => setSelected(opt.value)}
                className={`h-touch px-4 rounded-card text-left text-[15px] font-medium border-none cursor-pointer transition-colors duration-[200ms] ${
                  isActive ? 'bg-primary text-white' : 'bg-surface border border-hairline text-ink'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>
    </BottomSheet>
  );
}
