'use client';

import { Avatar } from './Avatar';
import { useHousehold } from '@/src/context/HouseholdContext';

interface ForMemberPickerProps {
  value: string | null;
  onChange: (id: string | null) => void;
  /** Hide a specific member from the picker (e.g. the already-assigned member) */
  excludeId?: string;
}

export function ForMemberPicker({ value, onChange, excludeId }: ForMemberPickerProps) {
  const { members } = useHousehold();
  const visible = excludeId ? members.filter((m) => m.id !== excludeId) : members;
  if (visible.length === 0) return null;

  return (
    <div className="mb-4">
      <div className="text-[13px] font-medium mb-2" style={{ color: '#8A7E6B' }}>
        For <span style={{ fontWeight: 400, fontSize: 11 }}>(optional)</span>
      </div>
      <div className="flex gap-2 flex-wrap">
        {visible.map((m) => (
          <button
            key={m.id}
            onClick={() => onChange(value === m.id ? null : m.id)}
            className="flex flex-col items-center gap-1"
            style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: value === m.id ? 1 : 0.35 }}
          >
            <Avatar member={m.id} size={40} ring={value === m.id} />
            <span style={{ fontSize: 10, fontWeight: 600, color: '#334266', maxWidth: 48, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {m.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
