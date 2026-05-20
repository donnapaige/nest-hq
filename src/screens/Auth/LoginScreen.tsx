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
                style={{ fontSize: 12, color: '#334266', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                Forgot password?
              </button>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
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
