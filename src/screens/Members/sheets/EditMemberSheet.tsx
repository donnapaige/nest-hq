'use client';

import { useState, useEffect } from 'react';
import { BottomSheet } from '@/src/components/primitives/BottomSheet';
import { Avatar } from '@/src/components/primitives/Avatar';
import type { HouseholdMember } from '@/src/context/HouseholdContext';

const ACCESS_OPTIONS = [
  { value: 'adult',     label: 'Member' },
  { value: 'caregiver', label: 'Caregiver' },
  { value: 'child',     label: 'Child' },
];

interface EditMemberSheetProps {
  open: boolean;
  onClose: () => void;
  member: HouseholdMember | null;
  onSave: (id: string, updates: { name: string; access_level: string }) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
  onOpenPerms?: (id: string) => void;
}

export function EditMemberSheet({ open, onClose, member, onSave, onRemove, onOpenPerms }: EditMemberSheetProps) {
  const [name,        setName]        = useState('');
  const [accessLevel, setAccessLevel] = useState('adult');
  const [saving,      setSaving]      = useState(false);
  const [confirming,  setConfirming]  = useState(false);
  const [removing,    setRemoving]    = useState(false);

  useEffect(() => {
    if (member) {
      setName(member.name ?? '');
      setAccessLevel(member.access_level ?? 'adult');
      setConfirming(false);
    }
  }, [member]);

  const handleSave = async () => {
    if (!member || !name.trim()) return;
    setSaving(true);
    await onSave(member.id, { name: name.trim(), access_level: accessLevel });
    setSaving(false);
  };

  const handleRemove = async () => {
    if (!member) return;
    setRemoving(true);
    await onRemove(member.id);
    setRemoving(false);
    setConfirming(false);
  };

  if (!member) return null;

  return (
    <BottomSheet open={open} onClose={onClose} snapPercent={75}>
      {/* Header */}
      <div className="flex items-center gap-3 pt-3 pb-5" style={{ borderBottom: '1px solid #E8DFCB' }}>
        <Avatar member={member.id} size={48} />
        <div className="flex-1 min-w-0">
          <p style={{ fontSize: 17, fontWeight: 700, color: '#1E1E2E', lineHeight: 1.2 }}>{member.name}</p>
          <p style={{ fontSize: 12, color: '#8A7E6B', marginTop: 2 }}>Edit member</p>
        </div>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8A7E6B', fontSize: 22, lineHeight: 1, padding: '0 2px' }}
        >
          ×
        </button>
      </div>

      {/* Fields */}
      <div className="py-5 flex flex-col gap-4">
        {/* Display name */}
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#1E1E2E', display: 'block', marginBottom: 6 }}>
            Display name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            className="w-full px-4 py-3 rounded-[12px] text-[15px] outline-none"
            style={{ background: '#fff', border: '1.5px solid #E8DFCB', color: '#1E1E2E' }}
          />
        </div>

        {/* Access level */}
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#1E1E2E', display: 'block', marginBottom: 6 }}>
            Role
          </label>
          <select
            value={accessLevel}
            onChange={(e) => setAccessLevel(e.target.value)}
            className="w-full px-4 py-3 rounded-[12px] text-[15px] cursor-pointer outline-none"
            style={{ background: '#fff', border: '1.5px solid #E8DFCB', color: '#1E1E2E', appearance: 'auto' }}
          >
            {ACCESS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Permissions shortcut */}
        {onOpenPerms && (
          <button
            onClick={() => { onClose(); setTimeout(() => onOpenPerms(member.id), 200); }}
            className="w-full py-3 rounded-[12px] flex items-center justify-between px-4"
            style={{ background: '#F0E5D2', border: 'none', cursor: 'pointer' }}
          >
            <span style={{ fontSize: 14, fontWeight: 600, color: '#334266' }}>Manage Permissions</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8A7E6B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 6l6 6-6 6"/>
            </svg>
          </button>
        )}

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={saving || !name.trim()}
          className="w-full py-3.5 rounded-[12px] font-bold text-white text-[15px]"
          style={{ background: '#334266', border: 'none', cursor: saving ? 'wait' : 'pointer', opacity: saving || !name.trim() ? 0.6 : 1 }}
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>

        {/* Remove from Household */}
        <div className="pt-2 pb-4">
          {!confirming ? (
            <button
              onClick={() => setConfirming(true)}
              className="w-full py-3 rounded-[12px] font-semibold text-[14px]"
              style={{ background: 'transparent', border: '1.5px solid #C65A3A', color: '#C65A3A', cursor: 'pointer' }}
            >
              Remove from Household
            </button>
          ) : (
            <div className="rounded-[12px] px-4 py-3" style={{ background: '#FFF0EC', border: '1.5px solid #C65A3A' }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#C65A3A', marginBottom: 10, textAlign: 'center' }}>
                Remove {member.name} from the household?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleRemove}
                  disabled={removing}
                  className="flex-1 py-2.5 rounded-[10px] font-bold text-[13px] text-white"
                  style={{ background: '#C65A3A', border: 'none', cursor: removing ? 'wait' : 'pointer', opacity: removing ? 0.6 : 1 }}
                >
                  {removing ? 'Removing…' : 'Yes, Remove'}
                </button>
                <button
                  onClick={() => setConfirming(false)}
                  className="flex-1 py-2.5 rounded-[10px] font-semibold text-[13px]"
                  style={{ background: '#fff', border: '1.5px solid #E8DFCB', color: '#334266', cursor: 'pointer' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </BottomSheet>
  );
}
