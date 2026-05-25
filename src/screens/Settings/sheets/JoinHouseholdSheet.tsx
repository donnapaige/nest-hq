'use client';

import { useState } from 'react';
import { BottomSheet } from '@/src/components/primitives/BottomSheet';
import { createClient } from '@/src/lib/supabase/client';

interface JoinHouseholdSheetProps {
  open: boolean;
  onClose: () => void;
  onJoined: () => Promise<void>;
}

export function JoinHouseholdSheet({ open, onClose, onJoined }: JoinHouseholdSheetProps) {
  const [code,    setCode]    = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState(false);

  const handleJoin = async () => {
    const trimmed = code.trim();
    if (trimmed.length < 6) {
      setError('Enter a valid invite code (6–8 digits).');
      return;
    }
    setLoading(true);
    setError('');
    const supabase = createClient();
    const { error: rpcError } = await supabase.rpc('join_household', { p_invite_code: trimmed });
    if (rpcError) {
      setError('Code not found or expired. Check with the household owner.');
      setLoading(false);
      return;
    }
    setSuccess(true);
    await onJoined();
    setTimeout(() => {
      setCode('');
      setSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <BottomSheet open={open} onClose={onClose} snapPercent={55}>
      <div className="pt-3 pb-6">
        <p style={{ fontSize: 18, fontWeight: 800, color: '#1E1E2E', marginBottom: 4 }}>Join a Household</p>
        <p style={{ fontSize: 13, color: '#8A7E6B', marginBottom: 24 }}>
          Ask the household owner to share their invite code from Family Settings.
        </p>

        <input
          type="text"
          inputMode="numeric"
          value={code}
          onChange={(e) => { setCode(e.target.value.replace(/\D/g, '').slice(0, 8)); setError(''); }}
          placeholder="00000000"
          maxLength={8}
          className="w-full px-4 py-4 rounded-[14px] text-center text-[26px] font-bold outline-none"
          style={{
            fontFamily: 'monospace',
            letterSpacing: '8px',
            background: '#fff',
            border: '1.5px solid #E8DFCB',
            color: '#1E1E2E',
            marginBottom: 12,
          }}
        />

        {error && (
          <p style={{ fontSize: 13, color: '#C65A3A', marginBottom: 12, textAlign: 'center' }}>{error}</p>
        )}

        {success && (
          <p style={{ fontSize: 14, fontWeight: 700, color: '#2D6A4F', marginBottom: 12, textAlign: 'center' }}>
            ✅ Joined! Switching households…
          </p>
        )}

        <button
          onClick={handleJoin}
          disabled={loading || success}
          className="w-full py-3.5 rounded-[12px] font-bold text-white text-[15px]"
          style={{
            background: success ? '#2D6A4F' : '#334266',
            border: 'none',
            cursor: loading || success ? 'wait' : 'pointer',
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? 'Joining…' : success ? 'Joined!' : 'Join Household'}
        </button>
      </div>
    </BottomSheet>
  );
}
