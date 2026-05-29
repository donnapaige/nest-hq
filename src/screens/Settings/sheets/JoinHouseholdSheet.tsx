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
  const [step,    setStep]    = useState<'code' | 'name'>('code');
  const [code,    setCode]    = useState('');
  const [memberId,setMemberId]= useState('');
  const [nameVal, setNameVal] = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleJoin = async () => {
    const trimmed = code.trim();
    if (trimmed.length < 6) {
      setError('Enter a valid invite code (6–8 digits).');
      return;
    }
    setLoading(true);
    setError('');
    const supabase = createClient();

    const { error: rpcError } = await supabase.rpc('join_household_by_code', {
      p_invite_code: trimmed,
    });

    if (rpcError) {
      setError(rpcError.message || 'Code not found or expired. Check with the household owner.');
      setLoading(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    const { data: me } = await supabase
      .from('household_members')
      .select('id')
      .eq('user_id', user?.id ?? '')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    setLoading(false);
    if (me) {
      setMemberId(me.id);
      setStep('name');
    } else {
      await onJoined();
      setCode('');
      onClose();
    }
  };

  const handleSaveName = async () => {
    if (!nameVal.trim() || !memberId) return;
    setLoading(true);
    const supabase = createClient();
    await supabase.from('household_members').update({ name: nameVal.trim() }).eq('id', memberId);
    await onJoined();
    setLoading(false);
    setCode('');
    setNameVal('');
    setMemberId('');
    setStep('code');
    onClose();
  };

  return (
    <BottomSheet open={open} onClose={onClose} snapPercent={55}>
      <div className="pt-3 pb-6">
        {step === 'code' ? (
          <>
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

            <button
              onClick={handleJoin}
              disabled={loading}
              className="w-full py-3.5 rounded-[12px] font-bold text-white text-[15px]"
              style={{ background: '#334266', border: 'none', cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.6 : 1 }}
            >
              {loading ? 'Joining…' : 'Join Household'}
            </button>
          </>
        ) : (
          <>
            <p style={{ fontSize: 18, fontWeight: 800, color: '#1E1E2E', marginBottom: 4 }}>👋 You&apos;re in!</p>
            <p style={{ fontSize: 13, color: '#8A7E6B', marginBottom: 20 }}>What should we call you?</p>

            <input
              type="text"
              value={nameVal}
              onChange={(e) => setNameVal(e.target.value)}
              placeholder="Your name"
              autoFocus
              className="w-full px-4 py-4 rounded-[14px] text-center text-[18px] font-bold outline-none"
              style={{ background: '#fff', border: '1.5px solid #E8DFCB', color: '#1E1E2E', marginBottom: 12 }}
            />

            <button
              onClick={handleSaveName}
              disabled={loading || !nameVal.trim()}
              className="w-full py-3.5 rounded-[12px] font-bold text-white text-[15px]"
              style={{ background: '#334266', border: 'none', cursor: loading ? 'wait' : 'pointer', opacity: loading || !nameVal.trim() ? 0.6 : 1 }}
            >
              {loading ? 'Saving…' : 'Continue'}
            </button>
          </>
        )}
      </div>
    </BottomSheet>
  );
}
