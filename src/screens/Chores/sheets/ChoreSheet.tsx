'use client';

import { useState } from 'react';
import { BottomSheet } from '@/src/components/primitives/BottomSheet';
import { Avatar } from '@/src/components/primitives/Avatar';
import { useHousehold } from '@/src/context/HouseholdContext';
import type { Chore } from '@/src/lib/types';

const POINT_OPTIONS = [3, 5, 10, 15, 25];
const RECURRENCE_OPTIONS = ['Does not repeat', 'Daily', 'Weekdays', 'Weekly', 'Monthly'];

interface ChoreSheetProps {
  open: boolean;
  onClose: () => void;
  initial?: Chore;
  onSave: (chore: Chore) => void;
  onDelete?: (id: string) => void;
}

export function ChoreSheet({ open, onClose, initial, onSave, onDelete }: ChoreSheetProps) {
  const { members } = useHousehold();

  const [title,      setTitle]      = useState(initial?.title ?? '');
  const [memberId,   setMemberId]   = useState<string>(initial?.memberId ?? members[0]?.id ?? '');
  const [due,        setDue]        = useState(initial?.due ?? new Date().toISOString().split('T')[0]);
  const [points,     setPoints]     = useState(initial?.points ?? 5);
  const [recurrence, setRecurrence] = useState(initial?.recurrence ?? null);
  const [status,     setStatus]     = useState<Chore['status']>(initial?.status ?? 'todo');
  const [error,      setError]      = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleSave = () => {
    if (!title.trim()) { setError('Title is required'); return; }
    setError('');
    onSave({
      id:          initial?.id ?? `chore-${Date.now()}`,
      title:       title.trim(),
      memberId,
      status,
      due,
      points,
      recurrence:  recurrence === 'Does not repeat' ? null : recurrence,
      completedAt: initial?.completedAt,
    });
    onClose();
  };

  const handleDelete = () => {
    if (!initial?.id || !onDelete) return;
    onDelete(initial.id);
    onClose();
  };

  const rowCls   = 'flex items-center h-14 px-4 border-b border-hairline';
  const labelCls = 'text-[13px] text-muted font-medium w-24 shrink-0';
  const valCls   = 'flex-1 text-[15px] text-ink font-medium bg-transparent border-none outline-none';

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

        {/* Assigned to */}
        {members.length > 0 && (
          <div className="mb-4">
            <div className="text-label text-muted mb-2 text-[13px] font-medium" style={{ color: '#8A7E6B' }}>Assigned to</div>
            <div className="flex gap-2 flex-wrap">
              {members.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMemberId(m.id)}
                  className="flex flex-col items-center gap-1"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: memberId === m.id ? 1 : 0.4 }}
                >
                  <Avatar member={m.id} size={40} ring={memberId === m.id} />
                  <span style={{ fontSize: 10, fontWeight: 600, color: '#334266', maxWidth: 48, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

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
          <div className="text-[13px] font-medium mb-2" style={{ color: '#8A7E6B' }}>Points</div>
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
          <div className="mb-4">
            <div className="text-[13px] font-medium mb-2" style={{ color: '#8A7E6B' }}>Status</div>
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

        {/* Delete (edit mode only) */}
        {initial?.id && onDelete && (
          <div className="mt-4">
            {confirmDelete ? (
              <div className="flex gap-2">
                <button
                  onClick={handleDelete}
                  className="flex-1 py-3 rounded-xl text-sm font-bold text-white"
                  style={{ background: '#C65A3A', border: 'none', cursor: 'pointer' }}
                >
                  Yes, delete chore
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="flex-1 py-3 rounded-xl text-sm font-bold"
                  style={{ background: '#F0E5D2', color: '#334266', border: 'none', cursor: 'pointer' }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="w-full py-3 text-sm font-semibold"
                style={{ color: '#C65A3A', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Delete chore
              </button>
            )}
          </div>
        )}
      </div>
    </BottomSheet>
  );
}
