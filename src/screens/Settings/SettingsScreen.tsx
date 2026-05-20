'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/context/AuthContext';
import { TabBar } from '@/src/components/primitives/TabBar';
import { Icon } from '@/src/components/primitives/Icon';

export function SettingsScreen() {
  const { signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <div className="bg-bg h-full font-sans text-ink relative overflow-hidden flex flex-col">
      <div className="h-full overflow-y-auto" style={{ paddingBottom: 110 }}>

        {/* Header */}
        <div
          className="px-5 pt-14 pb-5 flex items-center gap-3"
          style={{ borderBottom: '1px solid #E8DFCB' }}
        >
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: '#F0E5D2', border: 'none', cursor: 'pointer' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#334266" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#334266' }}>Settings</h1>
        </div>

        {/* Notifications section */}
        <div className="px-5 mt-6 mb-6">
          <p style={{ fontSize: 11, fontWeight: 700, color: '#8A7E6B', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10 }}>
            Notifications
          </p>
          <div
            className="rounded-[16px] overflow-hidden"
            style={{ background: '#FBF8F1', border: '1px solid #E8DFCB' }}
          >
            <ToggleRow label="Daily family briefing" subtitle="7am summary of today's schedule" defaultOn />
            <ToggleRow label="Chore reminders" subtitle="Nudge when a chore is overdue" defaultOn divider />
            <ToggleRow label="Bill due alerts" subtitle="3 days before a bill is due" defaultOn divider />
            <ToggleRow label="Shopping list updates" subtitle="When a family member adds items" divider />
          </div>
        </div>

        {/* Privacy section */}
        <div className="px-5 mb-6">
          <p style={{ fontSize: 11, fontWeight: 700, color: '#8A7E6B', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10 }}>
            Privacy
          </p>
          <div
            className="rounded-[16px] overflow-hidden"
            style={{ background: '#FBF8F1', border: '1px solid #E8DFCB' }}
          >
            <LinkRow label="Privacy policy" />
            <LinkRow label="Terms of service" divider />
            <LinkRow label="Delete my account" danger divider />
          </div>
        </div>

        {/* About section */}
        <div className="px-5 mb-6">
          <p style={{ fontSize: 11, fontWeight: 700, color: '#8A7E6B', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10 }}>
            About
          </p>
          <div
            className="rounded-[16px] overflow-hidden"
            style={{ background: '#FBF8F1', border: '1px solid #E8DFCB' }}
          >
            <div className="px-5 py-4 flex items-center justify-between" style={{ borderTop: 'none' }}>
              <span style={{ fontSize: 15, fontWeight: 600, color: '#333333' }}>Version</span>
              <span style={{ fontSize: 14, color: '#8A7E6B' }}>1.0.0 (beta)</span>
            </div>
          </div>
        </div>

        {/* Sign out */}
        <div className="px-5">
          <button
            onClick={handleSignOut}
            className="w-full rounded-[14px] font-bold"
            style={{
              height: 50,
              fontSize: 15,
              background: '#F2D9CF',
              color: '#C65A3A',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Sign out
          </button>
        </div>
      </div>

      <TabBar active="profile" />
    </div>
  );
}

function ToggleRow({
  label, subtitle, defaultOn = false, divider,
}: {
  label: string;
  subtitle: string;
  defaultOn?: boolean;
  divider?: boolean;
}) {
  return (
    <div
      className="px-5 py-4 flex items-center justify-between gap-4"
      style={{ borderTop: divider ? '1px solid #E8DFCB' : 'none' }}
    >
      <div className="flex-1 min-w-0">
        <p style={{ fontSize: 15, fontWeight: 600, color: '#333333', marginBottom: 2 }}>{label}</p>
        <p style={{ fontSize: 12, color: '#8A7E6B' }}>{subtitle}</p>
      </div>
      <div
        className="relative flex-shrink-0"
        style={{ width: 44, height: 26 }}
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{ background: defaultOn ? '#334266' : '#E8DFCB', transition: 'background 200ms' }}
        />
        <div
          className="absolute top-[3px] rounded-full bg-white"
          style={{
            width: 20,
            height: 20,
            left: defaultOn ? 21 : 3,
            transition: 'left 200ms',
            boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
          }}
        />
      </div>
    </div>
  );
}

function LinkRow({ label, divider, danger }: { label: string; divider?: boolean; danger?: boolean }) {
  return (
    <div
      className="px-5 py-4 flex items-center justify-between cursor-pointer"
      style={{ borderTop: divider ? '1px solid #E8DFCB' : 'none' }}
    >
      <span style={{ fontSize: 15, fontWeight: 600, color: danger ? '#C65A3A' : '#333333' }}>{label}</span>
      <Icon name="chevron" size={16} color={danger ? '#C65A3A' : '#8A7E6B'} />
    </div>
  );
}
