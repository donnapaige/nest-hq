'use client';

import { useState } from 'react';
import { BottomSheet } from '@/src/components/primitives/BottomSheet';
import type { Bill } from '@/src/lib/types';

interface AddBillSheetProps {
  open: boolean;
  onClose: () => void;
  onSave: (bill: Bill) => void;
}

const RECURRENCE = ['monthly', 'weekly', 'yearly', 'none'] as const;

export function AddBillSheet({ open, onClose, onSave }: AddBillSheetProps) {
  const [name, setName]             = useState('');
  const [vendor, setVendor]         = useState('');
  const [amount, setAmount]         = useState('');
  const [dueDate, setDueDate]       = useState('2026-05-15');
  const [recurrence, setRecurrence] = useState<string>('monthly');
  const [autoPay, setAutoPay]       = useState(false);
  const [error, setError]           = useState('');

  const handleSave = () => {
    if (!name.trim()) { setError('Name is required'); return; }
    if (!amount || isNaN(Number(amount))) { setError('Valid amount is required'); return; }
    setError('');
    onSave({
      id: `bill-${Date.now()}`,
      name: name.trim(),
      vendor: vendor.trim(),
      amount: Number(amount),
      dueDate,
      paid: false,
      autoPay,
      recurrence: recurrence === 'none' ? null : (recurrence as Bill['recurrence']),
    });
    onClose();
  };

  const rowCls   = 'flex items-center h-14 px-4 border-b border-hairline';
  const labelCls = 'text-[13px] text-muted font-medium w-28 shrink-0';
  const valCls   = 'flex-1 text-[15px] text-ink font-medium bg-transparent border-none outline-none';

  return (
    <BottomSheet open={open} onClose={onClose} snapPercent={85}>
      <div className="pt-2 pb-8">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onClose} className="text-[15px] text-ink font-medium bg-transparent border-none cursor-pointer p-0">Cancel</button>
          <span className="text-[15px] font-bold text-ink">New bill</span>
          <button
            onClick={handleSave}
            disabled={!name.trim() || !amount}
            className="text-[15px] font-bold text-primary bg-transparent border-none cursor-pointer p-0 disabled:opacity-40"
          >
            Save
          </button>
        </div>

        {error && <p className="text-danger text-xs mb-3 px-1">{error}</p>}

        <input
          className="w-full text-h2 font-bold text-ink bg-transparent border-none outline-none mb-4 placeholder:text-muted/50"
          placeholder="Bill name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />

        <div className="bg-surface border border-hairline rounded-card overflow-hidden">
          <div className={rowCls}>
            <span className={labelCls}>Vendor</span>
            <input placeholder="e.g. Spectrum" value={vendor} onChange={(e) => setVendor(e.target.value)} className={valCls} />
          </div>
          <div className={rowCls}>
            <span className={labelCls}>Amount ($)</span>
            <input type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} className={valCls} />
          </div>
          <div className={rowCls}>
            <span className={labelCls}>Due date</span>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={valCls} />
          </div>
          <div className={rowCls}>
            <span className={labelCls}>Repeats</span>
            <select value={recurrence} onChange={(e) => setRecurrence(e.target.value)} className={valCls + ' cursor-pointer'}>
              {RECURRENCE.map((r) => (
                <option key={r} value={r}>{r === 'none' ? 'Does not repeat' : r.charAt(0).toUpperCase() + r.slice(1)}</option>
              ))}
            </select>
          </div>
          <div className={rowCls + ' border-none'}>
            <span className={labelCls}>Auto-pay</span>
            <button
              onClick={() => setAutoPay((p) => !p)}
              className="relative cursor-pointer border-none p-0"
              style={{
                width: 44, height: 24, borderRadius: 12,
                background: autoPay ? '#334266' : '#E8DFCB',
                transition: 'background 0.15s',
              }}
              aria-label="Toggle auto-pay"
            >
              <div
                className="absolute top-0.5 rounded-full bg-white"
                style={{
                  left: autoPay ? 22 : 2, width: 20, height: 20,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
                  transition: 'left 0.15s',
                }}
              />
            </button>
          </div>
        </div>
      </div>
    </BottomSheet>
  );
}
