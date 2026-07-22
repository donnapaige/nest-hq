'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/src/lib/supabase/client';

export function ResetPasswordScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Check for error params in query string or hash
    const urlError = searchParams.get('error_code') || searchParams.get('error');
    const hashError = typeof window !== 'undefined' && window.location.hash.includes('error=');
    if (urlError || hashError) {
      setError('Reset link is invalid or has expired. Please request a new one.');
      return;
    }

    const supabase = createClient();

    // ?code= in URL: exchange it for a session (no verifier needed with implicit flow)
    const code = searchParams.get('code');
    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (error) setError('Reset link is invalid or has expired. Please request a new one.');
        else setReady(true);
      });
      return;
    }

    // No code — check for an existing recovery session (e.g. redirected from AuthContext)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setReady(true);
    });

    // Also listen for implicit-flow PASSWORD_RECOVERY event (hash-based tokens)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') setReady(true);
    });

    const timeout = setTimeout(() => {
      setError('Reset link is invalid or has expired. Please request a new one.');
    }, 8000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [searchParams]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setError('');
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setDone(true);
      setTimeout(() => router.push('/login'), 2500);
    }
  };

  const inputStyle = {
    height: 44,
    fontSize: 15,
    background: '#F6F3EC',
    border: '1.5px solid #E8DFCB',
    color: '#333333',
  };

  return (
    <div className="min-h-full bg-bg flex flex-col items-center justify-center px-5 py-12">
      <div className="mb-10 text-center">
        <div
          className="w-16 h-16 rounded-[22px] flex items-center justify-center mx-auto mb-4"
          style={{ background: '#334266' }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 11l9-7 9 7v9a2 2 0 0 1-2 2h-4v-7h-6v7H5a2 2 0 0 1-2-2z"/>
          </svg>
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#334266', letterSpacing: -0.5 }}>Nest HQ</h1>
        <p style={{ fontSize: 14, color: '#8A7E6B', marginTop: 4 }}>Your family's homebase</p>
      </div>

      <div
        className="w-full max-w-sm rounded-[20px] p-6"
        style={{ background: '#FBF8F1', boxShadow: '0 2px 24px rgba(51,66,102,0.10)' }}
      >
        {done ? (
          <div className="text-center py-4">
            <div className="text-4xl mb-4">✅</div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#333333', marginBottom: 8 }}>Password updated!</h2>
            <p style={{ fontSize: 14, color: '#8A7E6B' }}>Redirecting you to sign in…</p>
          </div>
        ) : error && !ready ? (
          <div className="text-center py-4">
            <div className="text-4xl mb-4">⚠️</div>
            <p style={{ fontSize: 14, color: '#C65A3A', marginBottom: 20 }}>{error}</p>
            <button
              onClick={() => router.push('/login?forgot=1')}
              className="w-full rounded-[12px] font-bold text-white"
              style={{ height: 48, fontSize: 15, background: '#334266', border: 'none', cursor: 'pointer', marginBottom: 10 }}
            >
              Request a new link
            </button>
            <button
              onClick={() => router.push('/login')}
              style={{ fontSize: 13, color: '#8A7E6B', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Back to sign in
            </button>
          </div>
        ) : !ready ? (
          <div className="text-center py-8">
            <div style={{ fontSize: 13, color: '#8A7E6B' }}>Verifying reset link…</div>
          </div>
        ) : (
          <>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#333333', marginBottom: 8 }}>Set new password</h2>
            <p style={{ fontSize: 13, color: '#8A7E6B', marginBottom: 20 }}>Choose a new password for your account.</p>

            {error && (
              <div
                className="mb-4 px-4 py-3 rounded-[12px] text-[13px] font-medium"
                style={{ background: '#F2D9CF', color: '#C65A3A' }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleReset} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label style={{ fontSize: 13, fontWeight: 600, color: '#8A7E6B' }}>New password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    required
                    autoFocus
                    className="w-full px-4 rounded-[12px] border outline-none"
                    style={{ ...inputStyle, paddingRight: 44 }}
                    onFocus={(e) => (e.target.style.borderColor = '#334266')}
                    onBlur={(e) => (e.target.style.borderColor = '#E8DFCB')}
                  />
                  <button type="button" onClick={() => setShowPassword(v => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: '#8A7E6B' }} aria-label={showPassword ? 'Hide' : 'Show'}>
                    <EyeIcon open={showPassword} />
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label style={{ fontSize: 13, fontWeight: 600, color: '#8A7E6B' }}>Confirm password</label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Same password again"
                    required
                    className="w-full px-4 rounded-[12px] border outline-none"
                    style={{ ...inputStyle, paddingRight: 44 }}
                    onFocus={(e) => (e.target.style.borderColor = '#334266')}
                    onBlur={(e) => (e.target.style.borderColor = '#E8DFCB')}
                  />
                  <button type="button" onClick={() => setShowConfirm(v => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: '#8A7E6B' }} aria-label={showConfirm ? 'Hide' : 'Show'}>
                    <EyeIcon open={showConfirm} />
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-[12px] font-bold text-white"
                style={{
                  height: 48, fontSize: 15,
                  background: loading ? '#8A7E6B' : '#334266',
                  border: 'none', cursor: loading ? 'not-allowed' : 'pointer', marginTop: 4,
                }}
              >
                {loading ? 'Updating…' : 'Update password'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}
