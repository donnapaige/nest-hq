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
  const [status, setStatus] = useState<'loading' | 'joining' | 'error' | 'done'>('loading');
  const [message, setMessage] = useState('');
  const [code, setCode] = useState('');

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
    const { data, error } = await supabase
      .from('households')
      .select('id, name')
      .eq('invite_code', code)
      .single();

    if (error || !data) {
      setStatus('error');
      setMessage('This invite link is invalid or has expired.');
      return;
    }

    const { error: joinErr } = await supabase.rpc('join_household', {
      p_household_id: data.id,
      p_invite_code:  code,
    });

    if (joinErr) {
      setStatus('error');
      setMessage(joinErr.message || 'Could not join household. Try again.');
      return;
    }

    await refetch();
    setStatus('done');
    setTimeout(() => router.replace('/'), 1500);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FBF8F1] px-6 text-center font-sans">
      {status === 'loading' || status === 'joining' ? (
        <>
          <p style={{ fontSize: 40 }}>🏠</p>
          <p style={{ fontSize: 18, fontWeight: 700, color: '#334266', marginTop: 16 }}>
            {status === 'loading' ? 'Preparing…' : 'Joining household…'}
          </p>
          <p style={{ fontSize: 13, color: '#8A7E6B', marginTop: 8 }}>Just a moment</p>
        </>
      ) : status === 'done' ? (
        <>
          <p style={{ fontSize: 40 }}>🎉</p>
          <p style={{ fontSize: 18, fontWeight: 700, color: '#2D6A4F', marginTop: 16 }}>Welcome home!</p>
          <p style={{ fontSize: 13, color: '#8A7E6B', marginTop: 8 }}>Taking you inside…</p>
        </>
      ) : (
        <>
          <p style={{ fontSize: 40 }}>😕</p>
          <p style={{ fontSize: 18, fontWeight: 700, color: '#C65A3A', marginTop: 16 }}>Couldn't join</p>
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
