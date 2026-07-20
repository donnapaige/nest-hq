'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/src/lib/supabase/client';

export function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot password state
  const [showPassword, setShowPassword] = useState(false);

  const [forgotOpen, setForgotOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/');
      router.refresh();
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    setResetLoading(true);
    const supabase = createClient();
    const base = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    const redirectTo = `${base}/auth/reset`;
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, { redirectTo });
    setResetLoading(false);
    if (error) {
      setResetError(error.message);
    } else {
      setResetSent(true);
    }
  };

  if (forgotOpen) {
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
          {resetSent ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-4">📬</div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#333333', marginBottom: 8 }}>
                Check your email
              </h2>
              <p style={{ fontSize: 14, color: '#8A7E6B', lineHeight: 1.5 }}>
                We sent a password reset link to <strong>{resetEmail}</strong>. Click the link in the email to set a new password.
              </p>
              <button
                onClick={() => { setForgotOpen(false); setResetSent(false); setResetEmail(''); }}
                className="mt-6 w-full rounded-[12px] font-bold text-white"
                style={{ height: 48, fontSize: 15, background: '#334266', border: 'none', cursor: 'pointer' }}
              >
                Back to sign in
              </button>
            </div>
          ) : (
            <>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#333333', marginBottom: 8 }}>
                Reset password
              </h2>
              <p style={{ fontSize: 13, color: '#8A7E6B', marginBottom: 20 }}>
                Enter your email and we'll send you a reset link.
              </p>

              {resetError && (
                <div
                  className="mb-4 px-4 py-3 rounded-[12px] text-[13px] font-medium"
                  style={{ background: '#F2D9CF', color: '#C65A3A' }}
                >
                  {resetError}
                </div>
              )}

              <form onSubmit={handleForgot} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#8A7E6B' }}>Email</label>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    autoFocus
                    className="w-full px-4 rounded-[12px] border outline-none"
                    style={{ height: 44, fontSize: 15, background: '#F6F3EC', border: '1.5px solid #E8DFCB', color: '#333333' }}
                    onFocus={(e) => (e.target.style.borderColor = '#334266')}
                    onBlur={(e) => (e.target.style.borderColor = '#E8DFCB')}
                  />
                </div>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full rounded-[12px] font-bold text-white"
                  style={{ height: 48, fontSize: 15, background: resetLoading ? '#8A7E6B' : '#334266', border: 'none', cursor: resetLoading ? 'not-allowed' : 'pointer', marginTop: 4 }}
                >
                  {resetLoading ? 'Sending…' : 'Send reset link'}
                </button>
                <button
                  type="button"
                  onClick={() => setForgotOpen(false)}
                  style={{ fontSize: 13, color: '#8A7E6B', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                >
                  ← Back to sign in
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-bg flex flex-col items-center justify-center px-5 py-12">
      {/* Logo / wordmark */}
      <div className="mb-10 text-center">
        <div
          className="w-16 h-16 rounded-[22px] flex items-center justify-center mx-auto mb-4"
          style={{ background: '#334266' }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 11l9-7 9 7v9a2 2 0 0 1-2 2h-4v-7h-6v7H5a2 2 0 0 1-2-2z"/>
          </svg>
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#334266', letterSpacing: -0.5 }}>
          Nest HQ
        </h1>
        <p style={{ fontSize: 14, color: '#8A7E6B', marginTop: 4 }}>
          Your family's homebase
        </p>
      </div>

      {/* Card */}
      <div
        className="w-full max-w-sm rounded-[20px] p-6"
        style={{ background: '#FBF8F1', boxShadow: '0 2px 24px rgba(51,66,102,0.10)' }}
      >
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#333333', marginBottom: 20 }}>
          Welcome back
        </h2>

        {error && (
          <div
            className="mb-4 px-4 py-3 rounded-[12px] text-[13px] font-medium"
            style={{ background: '#F2D9CF', color: '#C65A3A' }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label style={{ fontSize: 13, fontWeight: 600, color: '#8A7E6B' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-4 rounded-[12px] border outline-none transition-colors duration-150"
              style={{
                height: 44,
                fontSize: 15,
                background: '#F6F3EC',
                border: '1.5px solid #E8DFCB',
                color: '#333333',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#334266')}
              onBlur={(e) => (e.target.style.borderColor = '#E8DFCB')}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label style={{ fontSize: 13, fontWeight: 600, color: '#8A7E6B' }}>
                Password
              </label>
              <button
                type="button"
                onClick={() => { setForgotOpen(true); setResetEmail(email); }}
                style={{ fontSize: 12, color: '#334266', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 rounded-[12px] border outline-none transition-colors duration-150"
                style={{ height: 44, fontSize: 15, background: '#F6F3EC', border: '1.5px solid #E8DFCB', color: '#333333', paddingRight: 44 }}
                onFocus={(e) => (e.target.style.borderColor = '#334266')}
                onBlur={(e) => (e.target.style.borderColor = '#E8DFCB')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: '#8A7E6B' }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-[12px] font-bold text-white transition-opacity duration-150"
            style={{
              height: 48,
              fontSize: 15,
              background: loading ? '#8A7E6B' : '#334266',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: 4,
            }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>

      {/* Sign up link */}
      <p className="mt-6" style={{ fontSize: 14, color: '#8A7E6B' }}>
        Don't have an account?{' '}
        <Link
          href="/signup"
          style={{ color: '#334266', fontWeight: 700, textDecoration: 'none' }}
        >
          Create one
        </Link>
      </p>
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
