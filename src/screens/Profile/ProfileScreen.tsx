'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/src/context/AuthContext';
import { useHousehold } from '@/src/context/HouseholdContext';
import { TabBar } from '@/src/components/primitives/TabBar';
import { Icon } from '@/src/components/primitives/Icon';

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { householdName } = useHousehold();
  const router = useRouter();

  const fullName: string = user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? 'You';
  const email: string = user?.email ?? '';
  const initials = getInitials(fullName);

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <div className="bg-bg h-full font-sans text-ink relative overflow-hidden flex flex-col">
      <div className="h-full overflow-y-auto" style={{ paddingBottom: 110 }}>

        {/* Header */}
        <div
          className="px-5 pt-14 pb-6 flex items-center justify-between"
          style={{ borderBottom: '1px solid #E8DFCB' }}
        >
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#334266' }}>Profile</h1>
          <Link href="/settings">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: '#F0E5D2' }}
            >
              <Icon name="settings" size={18} color="#334266" />
            </div>
          </Link>
        </div>

        {/* Avatar + name */}
        <div className="flex flex-col items-center px-5 py-8">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center mb-4"
            style={{ background: '#334266' }}
          >
            <span style={{ fontSize: 32, fontWeight: 800, color: 'white' }}>{initials}</span>
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#333333', marginBottom: 4 }}>
            {fullName}
          </h2>
          <p style={{ fontSize: 14, color: '#8A7E6B' }}>{email}</p>
        </div>

        {/* Household card */}
        <div className="px-5 mb-6">
          <Link href="/settings" style={{ textDecoration: 'none' }}>
            <div
              className="rounded-[16px] p-5 flex items-center gap-4"
              style={{ background: '#FBF8F1', border: '1px solid #E8DFCB', boxShadow: '0 2px 8px rgba(51,66,102,0.06)', cursor: 'pointer' }}
            >
              <div
                className="w-12 h-12 rounded-[14px] flex items-center justify-center flex-shrink-0"
                style={{ background: '#DCE0EB' }}
              >
                <Icon name="home" size={22} color="#334266" />
              </div>
              <div className="flex-1 min-w-0">
                <p style={{ fontSize: 11, fontWeight: 600, color: '#8A7E6B', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 2 }}>
                  Household
                </p>
                <p style={{ fontSize: 17, fontWeight: 700, color: '#333333' }}>{householdName}</p>
              </div>
              <Icon name="chevron" size={16} color="#8A7E6B" />
            </div>
          </Link>
        </div>

        {/* Info rows */}
        <div className="px-5 mb-6">
          <p style={{ fontSize: 11, fontWeight: 700, color: '#8A7E6B', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10 }}>
            Account
          </p>
          <div
            className="rounded-[16px] overflow-hidden"
            style={{ background: '#FBF8F1', border: '1px solid #E8DFCB' }}
          >
            <InfoRow label="Full name" value={fullName} />
            <InfoRow label="Email" value={email} divider />
            <InfoRow label="Member since" value={user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—'} divider />
          </div>
        </div>

        {/* Quick links */}
        <div className="px-5 mb-6">
          <p style={{ fontSize: 11, fontWeight: 700, color: '#8A7E6B', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10 }}>
            More
          </p>
          <div
            className="rounded-[16px] overflow-hidden"
            style={{ background: '#FBF8F1', border: '1px solid #E8DFCB' }}
          >
            <Link href="/settings" style={{ textDecoration: 'none' }}>
              <ActionRow icon="settings" label="Settings" />
            </Link>
            <ActionRow icon="bell" label="Notifications" divider />
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

function InfoRow({ label, value, divider }: { label: string; value: string; divider?: boolean }) {
  return (
    <div
      className="px-5 py-4"
      style={{ borderTop: divider ? '1px solid #E8DFCB' : 'none' }}
    >
      <p style={{ fontSize: 12, color: '#8A7E6B', marginBottom: 2 }}>{label}</p>
      <p style={{ fontSize: 15, fontWeight: 600, color: '#333333' }}>{value}</p>
    </div>
  );
}

function ActionRow({ icon, label, divider }: { icon: Parameters<typeof Icon>[0]['name']; label: string; divider?: boolean }) {
  return (
    <div
      className="px-5 py-4 flex items-center justify-between cursor-pointer"
      style={{ borderTop: divider ? '1px solid #E8DFCB' : 'none' }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-[10px] flex items-center justify-center"
          style={{ background: '#F0E5D2' }}
        >
          <Icon name={icon} size={16} color="#334266" />
        </div>
        <span style={{ fontSize: 15, fontWeight: 600, color: '#333333' }}>{label}</span>
      </div>
      <Icon name="chevron" size={16} color="#8A7E6B" />
    </div>
  );
}
