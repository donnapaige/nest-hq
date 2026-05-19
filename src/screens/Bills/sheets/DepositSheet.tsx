'use client';

import { useState } from 'react';
import { BottomSheet } from '@/src/components/primitives/BottomSheet';
import type { SavingsGoal, SavingsTx } from '@/src/lib/types';

interface DepositSheetProps {
  open: boolean;
  onClose: () => void;
  goal: SavingsGoal | undefined;
  onDeposit: (goalId: string, tx: SavingsTx) => void;
}

export function DepositSheet({ open, onClose, goal, onDeposit }: DepositSheetProps) {
  const [amount, setAmount] = useState('');
  const [note, setNote]     = useState('');
  const [error, setError]   = useState('');

  const handleSave = () => {
    if (!goal) return;
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError('Enter a valid amount');
      return;
    }
    setError('');
    onDeposit(goal.id, {
      id: `tx-${Date.now()}`,
      amount: Number(amount),
      note: note || undefined,
      date: new Date().toISOString(),
    });
    setAmount('');
    setNote('');
    onClose();
  };

  return (
    <BottomSheet open={open} onClose={onClose} snapPercent={55}>
      <div className="pt-2 pb-8">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onClose} className="text-[15px] text-ink font-medium bg-transparent border-none cursor-pointer p-0">Cancel</button>
          <span className="text-[15px] font-bold text-ink">Add deposit</span>
          <button
            onClick={handleSave}
            disabled={!amount}
            className="text-[15px] font-bold text-primary bg-transparent border-none cursor-pointer p-0 disabled:opacity-40"
          >
            Save
          </button>
        </div>

        {goal && (
          <div className="flex items-center gap-3 mb-4 p-3 rounded-card bg-surface border border-hairline">
            <span className="text-[24px]">{goal.icon}</span>
            <div>
              <div className="text-[14px] font-semibold text-ink">{goal.name}</div>
              <div className="text-[12px] text-muted">
                ${goal.saved.toLocaleString()} of ${goal.target.toLocaleString()}
              </div>
            </div>
          </div>
        )}

        {error && <p className="text-danger text-xs mb-3 px-1">{error}</p>}

        <div className="bg-surface border border-hairline rounded-card overflow-hidden">
          <div className="flex items-center h-14 px-4 border-b border-hairline">
            <span className="text-[13px] text-muted font-medium w-28 shrink-0">Amount ($)</span>
            <input
              type="number"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 text-[15px] text-ink font-medium bg-transparent border-none outline-none"
              autoFocus
            />
          </div>
          <div className="flex items-center h-14 px-4 border-none">
            <span className="text-[13px] text-muted font-medium w-28 shrink-0">Note</span>
            <input
              placeholder="Optional"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="flex-1 text-[15px] text-ink font-medium bg-transparent border-none outline-none"
            />
          </div>
        </div>
      </div>
    </BottomSheet>
  );
}
