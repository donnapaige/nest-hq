'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/src/lib/supabase/client';

export function SignupScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [householdName, setHouseholdName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          household_name: householdName || `${fullName.split(' ')[0]}'s Household`,
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      // If email confirmation is disabled, redirect immediately
      setTimeout(() => {
        router.push('/');
        router.refresh();
      }, 1500);
    }
  };

  if (success) {
    return (
      <div className="min-h-full bg-bg flex flex-col items-center justify-center px-5 py-12">
        <div className="text-center">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: '#DCE0EB' }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#334266" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12l4.5 4.5L19 7"/>
            </svg>
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#334266', marginBottom: 8 }}>
            Account created!
          </h2>
          <p style={{ fontSize: 14, color: '#8A7E6B' }}>
            Taking you to your dashboard…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-bg flex flex-col items-center justify-center px-5 py-12">
      {/* Logo */}
      <div className="mb-8 text-center">
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
          Set up your family's homebase
        </p>
      </div>

      {/* Card */}
      <div
        className="w-full max-w-sm rounded-[20px] p-6"
        style={{ background: '#FBF8F1', boxShadow: '0 2px 24px rgba(51,66,102,0.10)' }}
      >
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#333333', marginBottom: 20 }}>
          Create your account
        </h2>

        {error && (
          <div
            className="mb-4 px-4 py-3 rounded-[12px] text-[13px] font-medium"
            style={{ background: '#F2D9CF', color: '#C65A3A' }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="flex flex-col gap-4">
          <Field label="Your full name" type="text" value={fullName} onChange={setFullName} placeholder="e.g. Donna Paige" required />
          <Field label="Household name" type="text" value={householdName} onChange={setHouseholdName} placeholder="e.g. The Paige Family" />
          <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" required />
          <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="At least 6 characters" required />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-[12px] font-bold text-white"
            style={{
              height: 48,
              fontSize: 15,
              background: loading ? '#8A7E6B' : '#334266',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: 4,
            }}
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>
      </div>

      {/* Login link */}
      <p className="mt-6" style={{ fontSize: 14, color: '#8A7E6B' }}>
        Already have an account?{' '}
        <Link href="/login" style={{ color: '#334266', fontWeight: 700, textDecoration: 'none' }}>
          Sign in
        </Link>
      </p>
    </div>
  );
}

function Field({
  label, type, value, onChange, placeholder, required,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label style={{ fontSize: 13, fontWeight: 600, color: '#8A7E6B' }}>
        {label}{!required && <span style={{ fontWeight: 400, color: '#B8AD9E' }}> (optional)</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 rounded-[12px] border outline-none"
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
  );
}
