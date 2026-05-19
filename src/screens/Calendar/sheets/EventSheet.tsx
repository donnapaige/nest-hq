'use client';

import { useState } from 'react';
import { BottomSheet } from '@/src/components/primitives/BottomSheet';
import { Avatar } from '@/src/components/primitives/Avatar';
import { RecurrenceModal } from './RecurrenceModal';
import { MEMBER_IDS } from '@/src/lib/members';
import type { CalendarEvent, MemberId, RRule } from '@/src/lib/types';

interface EventSheetProps {
  open: boolean;
  onClose: () => void;
  initial?: Partial<CalendarEvent>;
  onSave: (ev: CalendarEvent) => void;
}

export function EventSheet({ open, onClose, initial, onSave }: EventSheetProps) {
  const [title, setTitle]         = useState(initial?.title ?? '');
  const [members, setMembers]     = useState<MemberId[]>(initial?.memberIds ?? ['maya']);
  const [date, setDate]           = useState(initial?.start?.split('T')[0] ?? '2026-05-14');
  const [startTime, setStartTime] = useState(initial?.start?.split('T')[1]?.slice(0, 5) ?? '09:00');
  const [endTime, setEndTime]     = useState(initial?.end?.split('T')[1]?.slice(0, 5) ?? '10:00');
  const [recurrence, setRecurrence] = useState<RRule | null>(initial?.recurrence ?? null);
  const [recurrenceOpen, setRecurrenceOpen] = useState(false);
  const [location, setLocation]   = useState(initial?.location ?? '');
  const [notes, setNotes]         = useState(initial?.notes ?? '');
  const [error, setError]         = useState('');

  const toggleMember = (id: MemberId) =>
    setMembers((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const handleSave = () => {
    if (!title.trim()) { setError('Title is required'); return; }
    if (members.length === 0) { setError('Select at least one member'); return; }
    setError('');
    onSave({
      id: initial?.id ?? `ev-${Date.now()}`,
      title: title.trim(),
      start: `${date}T${startTime}`,
      end:   `${date}T${endTime}`,
      memberIds: members,
      location: location || undefined,
      notes: notes || undefined,
      recurrence,
    });
    onClose();
  };

  const rowCls = 'flex items-center h-14 px-4 border-b border-hairline';
  const labelCls = 'text-[13px] text-muted font-medium w-24 shrink-0';
  const valCls = 'flex-1 text-[15px] text-ink font-medium bg-transparent border-none outline-none';

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
          <div className="mb-4">
            <div className="text-label text-muted mb-2">Who</div>
            <div className="flex gap-2">
              {MEMBER_IDS.map((id) => (
                <button
                  key={id}
                  onClick={() => toggleMember(id)}
                  className={`rounded-full border-2 transition-all duration-[200ms] p-0 cursor-pointer ${
                    members.includes(id) ? 'border-transparent' : 'border-transparent opacity-40'
                  }`}
                >
                  <Avatar member={id} size={36} ring={members.includes(id)} />
                </button>
              ))}
            </div>
          </div>

          {/* Form fields */}
          <div className="bg-surface-alt border border-hairline rounded-card overflow-hidden">
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
              <span className={`${valCls} text-ink`}>{recurrence ? recurrence.freq.charAt(0) + recurrence.freq.slice(1).toLowerCase() : 'Does not repeat'}</span>
            </button>
            <div className="px-4 pt-2 pb-3">
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
