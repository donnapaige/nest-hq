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

type Mode = 'create' | 'join';

export default function SetupPage() {
  const router = useRouter();
  const { refetch } = useHousehold();

  const [mode, setMode] = useState<Mode>('create');

  /* Create mode */
  const [householdName, setHouseholdName] = useState('');
  const [yourName,      setYourName]      = useState('');
  const [preset,        setPreset]        = useState(0);

  /* Join mode */
  const [inviteCode, setInviteCode] = useState('');

  /* Shared */
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

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

  const handleJoin = async () => {
    const code = inviteCode.trim();
    if (code.length < 6) {
      setError('Enter a valid invite code.');
      return;
    }
    setLoading(true);
    setError('');
    const supabase = createClient();
    const { error: rpcError } = await supabase.rpc('join_household', { p_invite_code: code });
    if (rpcError) {
      setError('Code not found or expired. Check with your household owner.');
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
          <h1 className="text-2xl font-bold text-[#1E1E2E]">Welcome to Nest HQ</h1>
          <p className="text-[#6B7280] mt-2 text-sm">
            Create a new household or join one with an invite code.
          </p>
        </div>

        {/* Mode toggle */}
        <div className="flex bg-[#F0E5D2] rounded-[14px] p-1 mb-5">
          {(['create', 'join'] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(''); }}
              className="flex-1 py-2.5 rounded-[11px] text-[14px] font-semibold capitalize transition-all duration-200"
              style={{
                background: mode === m ? '#334266' : 'transparent',
                color:      mode === m ? '#fff' : '#8A7E6B',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {m === 'create' ? '🏠 Create' : '🔑 Join'}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-5">
          {mode === 'create' ? (
            <>
              <div>
                <label className="text-sm font-medium text-[#1E1E2E] block mb-2">Household name</label>
                <input
                  type="text"
                  value={householdName}
                  onChange={(e) => setHouseholdName(e.target.value)}
                  placeholder="e.g. The Johnson Family"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[#1E1E2E] text-sm outline-none focus:border-[#4C8A8B] transition-colors"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-[#1E1E2E] block mb-2">Your name</label>
                <input
                  type="text"
                  value={yourName}
                  onChange={(e) => setYourName(e.target.value)}
                  placeholder="e.g. Sarah"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[#1E1E2E] text-sm outline-none focus:border-[#4C8A8B] transition-colors"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-[#1E1E2E] block mb-3">Pick your color</label>
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
                style={{ background: '#4C8A8B', opacity: loading ? 0.6 : 1, border: 'none', cursor: loading ? 'wait' : 'pointer' }}
              >
                {loading ? 'Creating your home…' : 'Create my household'}
              </button>
            </>
          ) : (
            <>
              <div className="text-center py-2">
                <p className="text-[#1E1E2E] font-semibold text-[15px]">Enter your invite code</p>
                <p className="text-[#8A7E6B] text-[13px] mt-1">Ask your household owner to share their code from Family Settings.</p>
              </div>
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
                placeholder="00000000"
                maxLength={8}
                className="w-full px-4 py-4 rounded-xl border border-gray-200 text-[#1E1E2E] text-center text-[24px] font-bold outline-none focus:border-[#4C8A8B] transition-colors tracking-[8px]"
                style={{ fontFamily: 'monospace' }}
              />
              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
              <button
                onClick={handleJoin}
                disabled={loading}
                className="w-full py-3.5 rounded-xl font-semibold text-white text-sm transition-opacity"
                style={{ background: '#334266', opacity: loading ? 0.6 : 1, border: 'none', cursor: loading ? 'wait' : 'pointer' }}
              >
                {loading ? 'Joining…' : 'Join Household'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
