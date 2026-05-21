'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/src/lib/supabase/client';
import { useHousehold } from '@/src/context/HouseholdContext';

const PRESETS = [
  { color: '#4C8A8B', soft: '#DDEAEB', emoji: '🌿' },
  { color: '#334266', soft: '#DCE0EB', emoji: '🛠️' },
  { color: '#C65A3A', soft: '#F2D9CF', emoji: '🌺' },
  { color: '#DBA03A', soft: '#F4E4C7', emoji: '⭐' },
  { color: '#2D6A4F', soft: '#D8F0E4', emoji: '🌱' },
  { color: '#9B5DE5', soft: '#EDE0FA', emoji: '✨' },
];

export default function SetupPage() {
  const router = useRouter();
  const { refetch } = useHousehold();

  const [householdName, setHouseholdName] = useState('');
  const [yourName, setYourName] = useState('');
  const [preset, setPreset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!householdName.trim() || !yourName.trim()) {
      setError('Please fill in both fields.');
      return;
    }

    setLoading(true);
    setError('');

    const supabase = createClient();
    const p = PRESETS[preset];

    const { error: rpcError } = await supabase.rpc('create_household', {
      p_name:         householdName.trim(),
      p_member_name:  yourName.trim(),
      p_member_emoji: p.emoji,
      p_member_color: p.color,
      p_member_soft:  p.soft,
    });

    if (rpcError) {
      setError('Something went wrong. Please try again.');
      setLoading(false);
      return;
    }

    await refetch();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-[#FBF8F1] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🏡</div>
          <h1 className="text-2xl font-bold text-[#1E1E2E]">Set up your home</h1>
          <p className="text-[#6B7280] mt-2 text-sm">
            Create your household to get started. You can invite family members after.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-5">
          <div>
            <label className="text-sm font-medium text-[#1E1E2E] block mb-2">
              Household name
            </label>
            <input
              type="text"
              value={householdName}
              onChange={(e) => setHouseholdName(e.target.value)}
              placeholder="e.g. The Johnson Family"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[#1E1E2E] text-sm outline-none focus:border-[#4C8A8B] transition-colors"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-[#1E1E2E] block mb-2">
              Your name
            </label>
            <input
              type="text"
              value={yourName}
              onChange={(e) => setYourName(e.target.value)}
              placeholder="e.g. Sarah"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[#1E1E2E] text-sm outline-none focus:border-[#4C8A8B] transition-colors"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-[#1E1E2E] block mb-3">
              Pick your color
            </label>
            <div className="flex gap-3">
              {PRESETS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => setPreset(i)}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all"
                  style={{
                    background: p.soft,
                    border: i === preset ? `3px solid ${p.color}` : '3px solid transparent',
                    transform: i === preset ? 'scale(1.18)' : 'scale(1)',
                  }}
                >
                  {p.emoji}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            onClick={handleCreate}
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-semibold text-white text-sm transition-opacity"
            style={{ background: '#4C8A8B', opacity: loading ? 0.6 : 1 }}
          >
            {loading ? 'Creating your home…' : 'Create my household'}
          </button>
        </div>
      </div>
    </div>
  );
}
