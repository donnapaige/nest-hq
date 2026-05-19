'use client';

import { useState } from 'react';
import { BottomSheet } from '@/src/components/primitives/BottomSheet';
import { Avatar } from '@/src/components/primitives/Avatar';
import { MEMBER_IDS } from '@/src/lib/members';
import type { Chore, MemberId } from '@/src/lib/types';

const POINT_OPTIONS = [3, 5, 10, 15, 25];
const RECURRENCE_OPTIONS = ['Does not repeat', 'Daily', 'Weekdays', 'Weekly', 'Monthly'];

interface ChoreSheetProps {
  open: boolean;
  onClose: () => void;
  initial?: Chore;
  onSave: (chore: Chore) => void;
}

export function ChoreSheet({ open, onClose, initial, onSave }: ChoreSheetProps) {
  const [title, setTitle]       = useState(initial?.title ?? '');
  const [memberId, setMemberId] = useState<MemberId>(initial?.memberId ?? 'maya');
  const [due, setDue]           = useState(initial?.due ?? '2026-05-14');
  const [points, setPoints]     = useState(initial?.points ?? 5);
  const [recurrence, setRecurrence] = useState(initial?.recurrence ?? null);
  const [status, setStatus]     = useState<Chore['status']>(initial?.status ?? 'todo');
  const [error, setError]       = useState('');

  const handleSave = () => {
    if (!title.trim()) { setError('Title is required'); return; }
    setError('');
    onSave({
      id: initial?.id ?? `chore-${Date.now()}`,
      title: title.trim(),
      memberId,
      status,
      due,
      points,
      recurrence: recurrence === 'Does not repeat' ? null : recurrence,
      completedAt: initial?.completedAt,
    });
    onClose();
  };

  const rowCls = 'flex items-center h-14 px-4 border-b border-hairline';
  const labelCls = 'text-[13px] text-muted font-medium w-24 shrink-0';
  const valCls = 'flex-1 text-[15px] text-ink font-medium bg-transparent border-none outline-none';

  return (
    <BottomSheet open={open} onClose={onClose} snapPercent={90}>
      <div className="pt-2 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={onClose} className="text-[15px] text-ink font-medium bg-transparent border-none cursor-pointer p-0">
            Cancel
          </button>
          <span className="text-[15px] font-bold text-ink">
            {initial?.id ? 'Edit chore' : 'New chore'}
          </span>
          <button
            onClick={handleSave}
            disabled={!title.trim()}
            className="text-[15px] font-bold text-primary bg-transparent border-none cursor-pointer p-0 disabled:opacity-40"
          >
            Save
          </button>
        </div>

        {error && <p className="text-danger text-xs mb-3 px-1">{error}</p>}

        {/* Title */}
        <input
          className="w-full text-h2 font-bold text-ink bg-transparent border-none outline-none mb-4 placeholder:text-muted/50"
          placeholder="Chore title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
        />

        {/* Member picker */}
        <div className="mb-4">
          <div className="text-label text-muted mb-2">Assigned to</div>
          <div className="flex gap-2">
            {MEMBER_IDS.map((id) => (
              <button
                key={id}
                onClick={() => setMemberId(id)}
                className={`rounded-full border-2 transition-all duration-[200ms] p-0 cursor-pointer ${
                  memberId === id ? 'border-transparent' : 'border-transparent opacity-40'
                }`}
              >
                <Avatar member={id} size={36} ring={memberId === id} />
              </button>
            ))}
          </div>
        </div>

        {/* Form fields */}
        <div className="bg-surface border border-hairline rounded-card overflow-hidden mb-4">
          <div className={rowCls}>
            <span className={labelCls}>Due date</span>
            <input
              type="date"
              value={due}
              onChange={(e) => setDue(e.target.value)}
              className={valCls}
            />
          </div>
          <div className={rowCls + ' border-none'}>
            <span className={labelCls}>Repeat</span>
            <select
              value={recurrence ?? 'Does not repeat'}
              onChange={(e) => setRecurrence(e.target.value === 'Does not repeat' ? null : e.target.value)}
              className={valCls + ' cursor-pointer'}
            >
              {RECURRENCE_OPTIONS.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Points picker */}
        <div className="mb-4">
          <div className="text-label text-muted mb-2">Points</div>
          <div className="flex gap-2">
            {POINT_OPTIONS.map((p) => (
              <button
                key={p}
                onClick={() => setPoints(p)}
                className="rounded-pill text-[13px] font-bold border transition-all duration-[200ms] cursor-pointer"
                style={{
                  padding: '6px 12px',
                  background: points === p ? '#334266' : 'transparent',
                  color: points === p ? '#fff' : '#334266',
                  borderColor: points === p ? '#334266' : '#E8DFCB',
                }}
              >
                {p}★
              </button>
            ))}
          </div>
        </div>

        {/* Status picker (edit mode only) */}
        {initial?.id && (
          <div>
            <div className="text-label text-muted mb-2">Status</div>
            <div className="flex gap-2">
              {(['todo', 'inProgress', 'done'] as Chore['status'][]).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className="rounded-pill text-[12px] font-semibold border transition-all duration-[200ms] cursor-pointer capitalize"
                  style={{
                    padding: '6px 14px',
                    background: status === s ? '#334266' : 'transparent',
                    color: status === s ? '#fff' : '#334266',
                    borderColor: status === s ? '#334266' : '#E8DFCB',
                  }}
                >
                  {s === 'inProgress' ? 'In Progress' : s === 'todo' ? 'To Do' : 'Done'}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </BottomSheet>
  );
}
