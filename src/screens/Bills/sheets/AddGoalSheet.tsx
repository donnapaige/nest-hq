'use client';

import { useState } from 'react';
import { BottomSheet } from '@/src/components/primitives/BottomSheet';
import type { SavingsGoal } from '@/src/lib/types';

const GOAL_COLORS = ['#334266', '#4C8A8B', '#DBA03A', '#F28C38', '#7FA3B6', '#C65A3A'];
const GOAL_EMOJIS = ['🏖️', '🛟', '🦷', '🏠', '🚗', '🎓', '💊', '✈️', '🎯', '💰'];

interface AddGoalSheetProps {
  open: boolean;
  onClose: () => void;
  onSave: (goal: SavingsGoal) => void;
}

export function AddGoalSheet({ open, onClose, onSave }: AddGoalSheetProps) {
  const [name, setName]     = useState('');
  const [target, setTarget] = useState('');
  const [icon, setIcon]     = useState('🎯');
  const [color, setColor]   = useState('#334266');
  const [error, setError]   = useState('');

  const handleSave = () => {
    if (!name.trim()) { setError('Name is required'); return; }
    if (!target || isNaN(Number(target))) { setError('Valid target amount is required'); return; }
    setError('');
    onSave({
      id: `goal-${Date.now()}`,
      name: name.trim(),
      icon,
      color,
      saved: 0,
      target: Number(target),
      contributions: [],
      createdAt: new Date().toISOString(),
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
          <span className="text-[15px] font-bold text-ink">New goal</span>
          <button
            onClick={handleSave}
            disabled={!name.trim() || !target}
            className="text-[15px] font-bold text-primary bg-transparent border-none cursor-pointer p-0 disabled:opacity-40"
          >
            Save
          </button>
        </div>

        {error && <p className="text-danger text-xs mb-3 px-1">{error}</p>}

        <input
          className="w-full text-h2 font-bold text-ink bg-transparent border-none outline-none mb-4 placeholder:text-muted/50"
          placeholder="Goal name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />

        {/* Emoji picker */}
        <div className="mb-4">
          <div className="text-label text-muted mb-2">Icon</div>
          <div className="flex gap-2 flex-wrap">
            {GOAL_EMOJIS.map((e) => (
              <button
                key={e}
                onClick={() => setIcon(e)}
                className="w-10 h-10 rounded-[10px] text-[20px] border-2 cursor-pointer transition-all duration-[200ms]"
                style={{
                  borderColor: icon === e ? color : '#E8DFCB',
                  background: icon === e ? color + '18' : 'transparent',
                }}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* Color picker */}
        <div className="mb-4">
          <div className="text-label text-muted mb-2">Color</div>
          <div className="flex gap-2">
            {GOAL_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className="w-8 h-8 rounded-full border-2 cursor-pointer transition-all duration-[200ms]"
                style={{
                  background: c,
                  borderColor: color === c ? '#333333' : 'transparent',
                  transform: color === c ? 'scale(1.15)' : 'scale(1)',
                }}
              />
            ))}
          </div>
        </div>

        <div className="bg-surface border border-hairline rounded-card overflow-hidden">
          <div className={rowCls + ' border-none'}>
            <span className={labelCls}>Target ($)</span>
            <input
              type="number"
              placeholder="0"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className={valCls}
            />
          </div>
        </div>
      </div>
    </BottomSheet>
  );
}
