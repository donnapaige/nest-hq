'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/src/lib/supabase/client';
import { useAuth } from '@/src/context/AuthContext';
import { useHousehold } from '@/src/context/HouseholdContext';

interface Props {
  params: Promise<{ code: string }>;
}

export default function JoinPage({ params }: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const { refetch } = useHousehold();
  const [status, setStatus] = useState<'loading' | 'joining' | 'error' | 'naming' | 'done'>('loading');
  const [message, setMessage] = useState('');
  const [code, setCode] = useState('');
  const [memberId, setMemberId] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [nameSaving, setNameSaving] = useState(false);

  useEffect(() => {
    params.then((p) => setCode(p.code));
  }, [params]);

  useEffect(() => {
    if (!code || !user) return;
    join();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, user]);

  async function join() {
    setStatus('joining');
    const supabase = createClient();

    const { error: joinErr } = await supabase.rpc('join_household_by_code', {
      p_invite_code: code,
    });

    if (joinErr) {
      setStatus('error');
      setMessage(joinErr.message || 'This invite link is invalid or has expired.');
      return;
    }

    const { data: me } = await supabase
      .from('household_members')
      .select('id')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (me) {
      setMemberId(me.id);
      setStatus('naming');
    } else {
      await refetch();
      setStatus('done');
      setTimeout(() => router.replace('/'), 1500);
    }
  }

  async function saveName() {
    if (!nameInput.trim() || !memberId) return;
    setNameSaving(true);
    const supabase = createClient();
    await supabase.from('household_members').update({ name: nameInput.trim() }).eq('id', memberId);
    await refetch();
    setNameSaving(false);
    setStatus('done');
    setTimeout(() => router.replace('/'), 1000);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FBF8F1] px-6 text-center font-sans">
      {(status === 'loading' || status === 'joining') && (
        <>
          <p style={{ fontSize: 40 }}>🏠</p>
          <p style={{ fontSize: 18, fontWeight: 700, color: '#334266', marginTop: 16 }}>
            {status === 'loading' ? 'Preparing…' : 'Joining household…'}
          </p>
          <p style={{ fontSize: 13, color: '#8A7E6B', marginTop: 8 }}>Just a moment</p>
        </>
      )}

      {status === 'naming' && (
        <>
          <p style={{ fontSize: 40 }}>👋</p>
          <p style={{ fontSize: 18, fontWeight: 700, color: '#334266', marginTop: 16 }}>You&apos;re in!</p>
          <p style={{ fontSize: 13, color: '#8A7E6B', marginTop: 6, marginBottom: 24 }}>What should we call you?</p>
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') saveName(); }}
            placeholder="Your name"
            autoFocus
            style={{
              width: '100%', maxWidth: 320, padding: '14px 16px', borderRadius: 14,
              border: '1.5px solid #E8DFCB', fontSize: 16, fontWeight: 600,
              color: '#1E1E2E', background: '#fff', outline: 'none', textAlign: 'center',
              marginBottom: 12,
            }}
          />
          <button
            onClick={saveName}
            disabled={nameSaving || !nameInput.trim()}
            style={{
              width: '100%', maxWidth: 320, padding: '14px 0', borderRadius: 14,
              background: '#334266', color: '#fff', border: 'none', fontSize: 15,
              fontWeight: 700, cursor: nameSaving ? 'wait' : 'pointer',
              opacity: !nameInput.trim() ? 0.5 : 1,
            }}
          >
            {nameSaving ? 'Saving…' : 'Continue'}
          </button>
        </>
      )}

      {status === 'done' && (
        <>
          <p style={{ fontSize: 40 }}>🎉</p>
          <p style={{ fontSize: 18, fontWeight: 700, color: '#2D6A4F', marginTop: 16 }}>Welcome home!</p>
          <p style={{ fontSize: 13, color: '#8A7E6B', marginTop: 8 }}>Taking you inside…</p>
        </>
      )}

      {status === 'error' && (
        <>
          <p style={{ fontSize: 40 }}>😕</p>
          <p style={{ fontSize: 18, fontWeight: 700, color: '#C65A3A', marginTop: 16 }}>Couldn&apos;t join</p>
          <p style={{ fontSize: 13, color: '#8A7E6B', marginTop: 8, maxWidth: 280 }}>{message}</p>
          <button
            onClick={() => router.replace('/')}
            style={{ marginTop: 24, background: '#334266', color: '#fff', border: 'none', borderRadius: 12, padding: '12px 28px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
          >
            Go home
          </button>
        </>
      )}
    </div>
  );
}
