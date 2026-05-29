'use client';

import { useState, useEffect } from 'react';
import { BottomSheet } from '@/src/components/primitives/BottomSheet';
import { Avatar } from '@/src/components/primitives/Avatar';
import { RecurrenceModal } from './RecurrenceModal';
import { useHousehold } from '@/src/context/HouseholdContext';
import { ForMemberPicker } from '@/src/components/primitives/ForMemberPicker';
import type { CalendarEvent, RRule } from '@/src/lib/types';

interface EventSheetProps {
  open: boolean;
  onClose: () => void;
  initial?: Partial<CalendarEvent>;
  onSave: (ev: CalendarEvent) => void;
  onDelete?: (id: string) => void;
}

export function EventSheet({ open, onClose, initial, onSave, onDelete }: EventSheetProps) {
  const { members } = useHousehold();

  const [title,          setTitle]          = useState(initial?.title ?? '');
  const [selectedIds,    setSelectedIds]    = useState<string[]>(initial?.memberIds ?? []);
  const [forMemberId,    setForMemberId]    = useState<string | null>(initial?.forMemberId ?? null);
  const [date,           setDate]           = useState(initial?.start?.split('T')[0] ?? new Date().toISOString().split('T')[0]);
  const [startTime,      setStartTime]      = useState(initial?.start?.split('T')[1]?.slice(0, 5) ?? '09:00');
  const [endTime,        setEndTime]        = useState(initial?.end?.split('T')[1]?.slice(0, 5) ?? '10:00');
  const [recurrence,     setRecurrence]     = useState<RRule | null>(initial?.recurrence ?? null);
  const [recurrenceOpen, setRecurrenceOpen] = useState(false);
  const [location,       setLocation]       = useState(initial?.location ?? '');
  const [notes,          setNotes]          = useState(initial?.notes ?? '');
  const [error,          setError]          = useState('');
  const [confirmDelete,  setConfirmDelete]  = useState(false);

  // Reset form when initial changes (switching between new/edit or different events)
  useEffect(() => {
    setTitle(initial?.title ?? '');
    setSelectedIds(initial?.memberIds ?? []);
    setForMemberId(initial?.forMemberId ?? null);
    setDate(initial?.start?.split('T')[0] ?? new Date().toISOString().split('T')[0]);
    setStartTime(initial?.start?.split('T')[1]?.slice(0, 5) ?? '09:00');
    setEndTime(initial?.end?.split('T')[1]?.slice(0, 5) ?? '10:00');
    setRecurrence(initial?.recurrence ?? null);
    setLocation(initial?.location ?? '');
    setNotes(initial?.notes ?? '');
    setError('');
    setConfirmDelete(false);
  }, [initial]);

  const toggleMember = (id: string) =>
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const handleSave = () => {
    if (!title.trim()) { setError('Title is required'); return; }
    setError('');
    onSave({
      id:          initial?.id ?? `ev-${Date.now()}`,
      title:       title.trim(),
      start:       `${date}T${startTime}`,
      end:         `${date}T${endTime}`,
      memberIds:   selectedIds,
      forMemberId: forMemberId || null,
      location:    location || undefined,
      notes:       notes || undefined,
      recurrence,
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
    <>
      <BottomSheet open={open} onClose={onClose} snapPercent={95}>
        <div className="pt-2 pb-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={onClose} className="text-[15px] text-ink font-medium bg-transparent border-none cursor-pointer p-0">Cancel</button>
            <span className="text-[15px] font-bold text-ink">{initial?.id ? 'Edit event' : 'New event'}</span>
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
            placeholder="Event title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />

          {/* Member picker */}
          {members.length > 0 && (
            <div className="mb-4">
              <div className="text-[13px] font-medium mb-2" style={{ color: '#8A7E6B' }}>Assigned to</div>
              <div className="flex gap-2 flex-wrap">
                {members.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => toggleMember(m.id)}
                    className="flex flex-col items-center gap-1"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: selectedIds.includes(m.id) ? 1 : 0.4 }}
                  >
                    <Avatar member={m.id} size={40} ring={selectedIds.includes(m.id)} />
                    <span style={{ fontSize: 10, fontWeight: 600, color: '#334266', maxWidth: 48, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* For (optional) */}
          <ForMemberPicker value={forMemberId} onChange={setForMemberId} />

          {/* Form fields */}
          <div className="bg-surface-alt border border-hairline rounded-card overflow-hidden mb-4">
            <div className={rowCls}>
              <span className={labelCls}>Date</span>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={valCls} />
            </div>
            <div className={rowCls}>
              <span className={labelCls}>Start</span>
              <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className={valCls} />
            </div>
            <div className={rowCls}>
              <span className={labelCls}>End</span>
              <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className={valCls} />
            </div>
            <div className={rowCls}>
              <span className={labelCls}>Location</span>
              <input placeholder="Add location" value={location} onChange={(e) => setLocation(e.target.value)} className={valCls} />
            </div>
            <button
              onClick={() => setRecurrenceOpen(true)}
              className={`${rowCls} w-full text-left border-none cursor-pointer bg-transparent`}
            >
              <span className={labelCls}>Repeat</span>
              <span className={`${valCls} text-ink`}>
                {recurrence ? recurrence.freq.charAt(0) + recurrence.freq.slice(1).toLowerCase() : 'Does not repeat'}
              </span>
            </button>
            <div className="px-4 pt-2 pb-3 border-none">
              <span className={labelCls + ' block mb-1'}>Notes</span>
              <textarea
                placeholder="Add notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full text-[15px] text-ink bg-transparent border-none outline-none resize-none"
              />
            </div>
          </div>

          {/* Delete (edit mode only) */}
          {initial?.id && onDelete && (
            <div className="mt-2">
              {confirmDelete ? (
                <div className="flex gap-2">
                  <button
                    onClick={handleDelete}
                    className="flex-1 py-3 rounded-xl text-sm font-bold text-white"
                    style={{ background: '#C65A3A', border: 'none', cursor: 'pointer' }}
                  >
                    Yes, delete event
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
                  Delete event
                </button>
              )}
            </div>
          )}
        </div>
      </BottomSheet>

      <RecurrenceModal
        open={recurrenceOpen}
        value={recurrence}
        onClose={() => setRecurrenceOpen(false)}
        onSave={setRecurrence}
      />
    </>
  );
}
