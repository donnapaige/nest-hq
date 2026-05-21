'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/context/AuthContext';
import { useHousehold } from '@/src/context/HouseholdContext';
import { TabBar } from '@/src/components/primitives/TabBar';
import { Icon } from '@/src/components/primitives/Icon';
import { Avatar } from '@/src/components/primitives/Avatar';
import { CURRENCIES } from '@/src/lib/currency';

export function SettingsScreen() {
  const { signOut } = useAuth();
  const { householdName, inviteCode, currency, members, currentMember, updateCurrency, refetch } =
    useHousehold();
  const router = useRouter();

  const [copied, setCopied] = useState(false);
  const [showCurrency, setShowCurrency] = useState(false);

  const handleSignOut = async () => { await signOut(); router.push('/login'); };

  const inviteLink =
    typeof window !== 'undefined'
      ? `${window.location.origin}/join/${inviteCode}`
      : `/join/${inviteCode}`;

  const copyInvite = () => {
    navigator.clipboard.writeText(inviteLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleCurrencySelect = useCallback(
    async (code: string) => {
      await updateCurrency(code);
      setShowCurrency(false);
    },
    [updateCurrency]
  );

  return (
    <div className="bg-bg h-full font-sans text-ink relative overflow-hidden flex flex-col">
      <div className="h-full overflow-y-auto" style={{ paddingBottom: 110 }}>

        {/* Header */}
        <div className="px-5 pt-14 pb-5 flex items-center gap-3" style={{ borderBottom: '1px solid #E8DFCB' }}>
          <button onClick={() => router.back()} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: '#F0E5D2', border: 'none', cursor: 'pointer' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#334266" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#334266' }}>Settings</h1>
        </div>

        {/* ── Household ─────────────────────────────────────────── */}
        <Section label="Household">
          <InfoRow label="Name" value={householdName} />
          <Divider />
          <button
            onClick={() => setShowCurrency(true)}
            className="w-full px-5 py-4 flex items-center justify-between"
            style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-[10px] flex items-center justify-center flex-shrink-0" style={{ background: '#F0E5D2' }}>
                <span style={{ fontSize: 16 }}>💱</span>
              </div>
              <div className="text-left">
                <p style={{ fontSize: 15, fontWeight: 600, color: '#333333' }}>Currency</p>
                <p style={{ fontSize: 12, color: '#8A7E6B' }}>
                  {CURRENCIES.find((c) => c.code === currency)?.name ?? currency}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span style={{ fontSize: 15, fontWeight: 700, color: '#4C8A8B' }}>{currency}</span>
              <Icon name="chevron" size={16} color="#8A7E6B" />
            </div>
          </button>
          <Divider />
          <div className="px-5 py-4">
            <p style={{ fontSize: 15, fontWeight: 600, color: '#333333', marginBottom: 6 }}>Invite link</p>
            <div className="flex gap-2">
              <div className="flex-1 rounded-xl px-3 py-2.5 text-xs font-mono truncate" style={{ background: '#F0E5D2', color: '#334266' }}>
                {inviteLink}
              </div>
              <button
                onClick={copyInvite}
                className="px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-1.5"
                style={{ background: copied ? '#2D6A4F' : '#334266', color: '#fff', border: 'none', cursor: 'pointer', transition: 'background 200ms', whiteSpace: 'nowrap' }}
              >
                <Icon name="copy" size={14} color="#fff" />
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p style={{ fontSize: 11, color: '#8A7E6B', marginTop: 6 }}>
              Share this link to invite family members. They sign up and join automatically.
            </p>
          </div>
        </Section>

        {/* ── Members ───────────────────────────────────────────── */}
        <Section label="Members">
          {members.map((m, i) => (
            <div key={m.id}>
              {i > 0 && <Divider />}
              <button
                onClick={() => router.push(`/members/${m.id}`)}
                className="w-full px-5 py-3.5 flex items-center gap-3"
                style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
              >
                <Avatar member={m.id} size={38} />
                <div className="flex-1 text-left">
                  <p style={{ fontSize: 15, fontWeight: 600, color: '#333333' }}>
                    {m.name} {m.id === currentMember?.id ? '(You)' : ''}
                  </p>
                  <p style={{ fontSize: 12, color: '#8A7E6B' }}>
                    {m.role} · {m.access_level ?? m.role}
                  </p>
                </div>
                <Icon name="chevron" size={16} color="#8A7E6B" />
              </button>
            </div>
          ))}
          <Divider />
          <button
            onClick={() => router.push('/members')}
            className="w-full px-5 py-4 flex items-center gap-3"
            style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
          >
            <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: '#DCE0EB' }}>
              <Icon name="plus" size={18} color="#334266" />
            </div>
            <span style={{ fontSize: 15, fontWeight: 600, color: '#334266' }}>Manage members</span>
          </button>
        </Section>

        {/* ── Activity feed link ────────────────────────────────── */}
        <Section label="Family">
          <NavRow label="Family Feed" subtitle="Activity log for all household actions" icon="activity" onPress={() => router.push('/feed')} />
        </Section>

        {/* ── Notifications ─────────────────────────────────────── */}
        <Section label="Notifications">
          <ToggleRow label="Bill due alerts"     subtitle="3 days before a bill is due" defaultOn />
          <Divider />
          <ToggleRow label="Chore reminders"     subtitle="Nudge when a chore is overdue" defaultOn />
          <Divider />
          <ToggleRow label="Daily briefing"      subtitle="7am summary of today's schedule" defaultOn />
          <Divider />
          <ToggleRow label="Shopping updates"    subtitle="When a family member adds items" />
        </Section>

        {/* ── Privacy & About ───────────────────────────────────── */}
        <Section label="Account">
          <LinkRow label="Privacy policy" />
          <Divider />
          <LinkRow label="Terms of service" />
          <Divider />
          <LinkRow label="Delete my account" danger />
        </Section>

        <div className="px-5 pt-2 pb-4">
          <p style={{ fontSize: 11, color: '#8A7E6B', textAlign: 'center' }}>Nest HQ · v1.0.0 (beta)</p>
        </div>

        {/* Sign out */}
        <div className="px-5 pb-2">
          <button onClick={handleSignOut} className="w-full rounded-[14px] font-bold" style={{ height: 50, fontSize: 15, background: '#F2D9CF', color: '#C65A3A', border: 'none', cursor: 'pointer' }}>
            Sign out
          </button>
        </div>
      </div>

      {/* Currency picker sheet */}
      {showCurrency && (
        <div className="absolute inset-0 z-50" style={{ background: 'rgba(0,0,0,0.45)' }} onClick={() => setShowCurrency(false)}>
          <div
            className="absolute bottom-0 left-0 right-0 rounded-t-[24px] overflow-hidden"
            style={{ background: '#FBF8F1', maxHeight: '70vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 pt-5 pb-3 flex items-center justify-between" style={{ borderBottom: '1px solid #E8DFCB' }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1E1E2E' }}>Select currency</h2>
              <button onClick={() => setShowCurrency(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8A7E6B', fontSize: 15, fontWeight: 600 }}>Done</button>
            </div>
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(70vh - 70px)' }}>
              {CURRENCIES.map((c) => (
                <button
                  key={c.code}
                  onClick={() => handleCurrencySelect(c.code)}
                  className="w-full px-5 py-4 flex items-center justify-between"
                  style={{ background: 'transparent', border: 'none', borderBottom: '1px solid #E8DFCB', cursor: 'pointer' }}
                >
                  <div className="text-left">
                    <p style={{ fontSize: 15, fontWeight: 600, color: '#1E1E2E' }}>{c.name}</p>
                    <p style={{ fontSize: 12, color: '#8A7E6B' }}>{c.code}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span style={{ fontSize: 20, color: '#334266', fontWeight: 700 }}>{c.symbol}</span>
                    {currency === c.code && (
                      <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: '#4C8A8B' }}>
                        <Icon name="check" size={12} color="#fff" stroke={2.5} />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <TabBar active="family" />
    </div>
  );
}

/* ── Sub-components ────────────────────────────────────────────────────── */

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="px-5 mt-6 mb-2">
      <p style={{ fontSize: 11, fontWeight: 700, color: '#8A7E6B', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10 }}>{label}</p>
      <div className="rounded-[16px] overflow-hidden" style={{ background: '#FBF8F1', border: '1px solid #E8DFCB' }}>
        {children}
      </div>
    </div>
  );
}

function Divider() {
  return <div style={{ height: 1, background: '#E8DFCB', marginLeft: 20 }} />;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-5 py-4 flex items-center justify-between">
      <span style={{ fontSize: 15, fontWeight: 600, color: '#333333' }}>{label}</span>
      <span style={{ fontSize: 14, color: '#8A7E6B' }}>{value}</span>
    </div>
  );
}

function NavRow({ label, subtitle, icon, onPress }: { label: string; subtitle?: string; icon: Parameters<typeof Icon>[0]['name']; onPress: () => void }) {
  return (
    <button onClick={onPress} className="w-full px-5 py-4 flex items-center gap-3" style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
      <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#DCE0EB' }}>
        <Icon name={icon} size={16} color="#334266" />
      </div>
      <div className="flex-1 text-left">
        <p style={{ fontSize: 15, fontWeight: 600, color: '#333333' }}>{label}</p>
        {subtitle && <p style={{ fontSize: 12, color: '#8A7E6B', marginTop: 1 }}>{subtitle}</p>}
      </div>
      <Icon name="chevron" size={16} color="#8A7E6B" />
    </button>
  );
}

function ToggleRow({ label, subtitle, defaultOn = false }: { label: string; subtitle: string; defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="px-5 py-4 flex items-center justify-between gap-4">
      <div className="flex-1 min-w-0">
        <p style={{ fontSize: 15, fontWeight: 600, color: '#333333', marginBottom: 2 }}>{label}</p>
        <p style={{ fontSize: 12, color: '#8A7E6B' }}>{subtitle}</p>
      </div>
      <button
        onClick={() => setOn((v) => !v)}
        className="relative flex-shrink-0"
        style={{ width: 44, height: 26, background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
      >
        <div className="absolute inset-0 rounded-full" style={{ background: on ? '#334266' : '#E8DFCB', transition: 'background 200ms' }} />
        <div className="absolute top-[3px] rounded-full bg-white" style={{ width: 20, height: 20, left: on ? 21 : 3, transition: 'left 200ms', boxShadow: '0 1px 4px rgba(0,0,0,0.18)' }} />
      </button>
    </div>
  );
}

function LinkRow({ label, danger }: { label: string; danger?: boolean }) {
  return (
    <div className="px-5 py-4 flex items-center justify-between cursor-pointer">
      <span style={{ fontSize: 15, fontWeight: 600, color: danger ? '#C65A3A' : '#333333' }}>{label}</span>
      <Icon name="chevron" size={16} color={danger ? '#C65A3A' : '#8A7E6B'} />
    </div>
  );
}
