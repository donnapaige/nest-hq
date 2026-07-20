'use client';

import { useState } from 'react';
import { BottomSheet } from '@/src/components/primitives/BottomSheet';
import { useHousehold } from '@/src/context/HouseholdContext';

const PRESETS = [
  { color: '#4C8A8B', soft: '#DDEAEB', emoji: '🌿' },
  { color: '#334266', soft: '#DCE0EB', emoji: '🛠️' },
  { color: '#C65A3A', soft: '#F2D9CF', emoji: '🌺' },
  { color: '#DBA03A', soft: '#F4E4C7', emoji: '⭐' },
  { color: '#2D6A4F', soft: '#D8F0E4', emoji: '🌱' },
  { color: '#9B5DE5', soft: '#EDE0FA', emoji: '✨' },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CreateHouseholdSheet({ open, onClose }: Props) {
  const { createHousehold, currentMember } = useHousehold();
  const [name, setName]       = useState('');
  const [preset, setPreset]   = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleCreate = async () => {
    if (!name.trim()) { setError('Enter a household name.'); return; }
    setLoading(true);
    setError('');
    try {
      const p = PRESETS[preset];
      await createHousehold(
        name.trim(),
        currentMember?.name ?? 'Me',
        p.emoji,
        p.color,
        p.soft,
      );
      setName('');
      setPreset(0);
      onClose();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <BottomSheet open={open} onClose={onClose} snapPercent={60}>
      <div className="pt-3 pb-6">
        <p style={{ fontSize: 18, fontWeight: 800, color: '#1E1E2E', marginBottom: 4 }}>Create New Household</p>
        <p style={{ fontSize: 13, color: '#8A7E6B', marginBottom: 20 }}>
          Start a fresh household. You can invite family members after.
        </p>

        <div className="flex flex-col gap-1.5" style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#8A7E6B' }}>Household name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setError(''); }}
            placeholder="e.g. The Johnson Family"
            autoFocus
            className="w-full px-4 rounded-[12px] border outline-none"
            style={{ height: 44, fontSize: 15, background: '#F6F3EC', border: '1.5px solid #E8DFCB', color: '#1E1E2E' }}
            onFocus={(e) => (e.target.style.borderColor = '#334266')}
            onBlur={(e) => (e.target.style.borderColor = '#E8DFCB')}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#8A7E6B', display: 'block', marginBottom: 10 }}>Pick a color</label>
          <div className="flex gap-3">
            {PRESETS.map((p, i) => (
              <button
                key={i}
                onClick={() => setPreset(i)}
                style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: p.soft,
                  border: i === preset ? `3px solid ${p.color}` : '3px solid transparent',
                  transform: i === preset ? 'scale(1.18)' : 'scale(1)',
                  fontSize: 18, cursor: 'pointer',
                  transition: 'transform 0.15s',
                }}
              >
                {p.emoji}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p style={{ fontSize: 13, color: '#C65A3A', marginBottom: 12 }}>{error}</p>
        )}

        <button
          onClick={handleCreate}
          disabled={loading}
          className="w-full rounded-[12px] font-bold text-white text-[15px]"
          style={{ height: 48, background: '#334266', border: 'none', cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.6 : 1 }}
        >
          {loading ? 'Creating…' : 'Create Household'}
        </button>
      </div>
    </BottomSheet>
  );
}
