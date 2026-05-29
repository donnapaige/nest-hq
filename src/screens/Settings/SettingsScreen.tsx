'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/context/AuthContext';
import { useHousehold } from '@/src/context/HouseholdContext';
import { TabBar } from '@/src/components/primitives/TabBar';
import { Avatar } from '@/src/components/primitives/Avatar';
import { BottomSheet } from '@/src/components/primitives/BottomSheet';
import { JoinHouseholdSheet } from './sheets/JoinHouseholdSheet';

export function SettingsScreen() {
  const { signOut, user } = useAuth();
  const { householdName, householdId, members, currentMember, householdsList, switchHousehold, refetch } = useHousehold();
  const router = useRouter();

  const [joinSheetOpen,  setJoinSheetOpen]  = useState(false);
  const [notifsOpen,     setNotifsOpen]     = useState(false);

  const handleSignOut = async () => { await signOut(); router.push('/login'); };

  const isOwner  = currentMember && members[0]?.id === currentMember.id;
  const roleLabel = currentMember?.role || 'Member';
  const ownerBadge = isOwner ? 'Owner' : 'Member';

  return (
    <div className="bg-bg h-full font-sans text-ink flex flex-col relative overflow-hidden">
      <div className="h-full overflow-y-auto" style={{ paddingBottom: 110 }}>

        {/* Header */}
        <div className="px-5 pt-14 pb-5">
          <h1 style={{ fontSize: 26, fontWeight: 900, color: '#1E1E2E' }}>Settings</h1>
          <p style={{ fontSize: 13, color: '#8A7E6B', marginTop: 2 }}>Profile & Preferences</p>
        </div>

        {/* Profile card */}
        {currentMember && (
          <div className="px-5 mb-6">
            <div className="rounded-[18px] px-4 py-4 flex items-center gap-3" style={{ background: '#FBF8F1', border: '1px solid #E8DFCB' }}>
              <Avatar member={currentMember.id} size={52} />
              <div className="flex-1 min-w-0">
                <p style={{ fontSize: 17, fontWeight: 700, color: '#1E1E2E' }}>{currentMember.name}</p>
                <p style={{ fontSize: 13, color: '#8A7E6B', marginTop: 1 }}>
                  {roleLabel} · {ownerBadge}
                </p>
                {user?.email && (
                  <p style={{ fontSize: 12, color: '#9BA3AF', marginTop: 1 }}>{user.email}</p>
                )}
              </div>
              <button
                onClick={() => router.push('/profile')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6 }}
                aria-label="Edit profile"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8A7E6B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* HOUSEHOLD switcher — visible only when user belongs to 2+ households */}
        {householdsList.length > 1 && (
          <div className="px-5 mb-6">
            <p style={{ fontSize: 11, fontWeight: 700, color: '#8A7E6B', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10 }}>Household</p>
            <div className="rounded-[18px] overflow-hidden" style={{ background: '#FBF8F1', border: '1px solid #E8DFCB' }}>
              {householdsList.map((h, i) => (
                <div key={h.id}>
                  {i > 0 && <div style={{ height: 1, background: '#E8DFCB', marginLeft: 60 }} />}
                  <button
                    onClick={() => switchHousehold(h.id)}
                    className="w-full px-4 py-3.5 flex items-center gap-3 text-left"
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                  >
                    <div className="w-10 h-10 rounded-[12px] flex items-center justify-center flex-shrink-0 text-[20px]" style={{ background: '#F0E5D2' }}>
                      🏡
                    </div>
                    <div className="flex-1 min-w-0">
                      <p style={{ fontSize: 15, fontWeight: 600, color: '#1E1E2E' }}>{h.name}</p>
                      {h.id === householdId && (
                        <p style={{ fontSize: 12, color: '#2D6A4F', marginTop: 1, fontWeight: 600 }}>Active</p>
                      )}
                    </div>
                    {h.id === householdId ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2D6A4F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C8BFB0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 6l6 6-6 6"/>
                      </svg>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MANAGE section */}
        <div className="px-5 mb-6">
          <p style={{ fontSize: 11, fontWeight: 700, color: '#8A7E6B', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10 }}>Manage</p>
          <div className="rounded-[18px] overflow-hidden" style={{ background: '#FBF8F1', border: '1px solid #E8DFCB' }}>

            <ManageRow
              icon="👨‍👩‍👧‍👦"
              label="Family & Members"
              subtitle={`${householdName} · ${members.length} member${members.length !== 1 ? 's' : ''}`}
              onPress={() => router.push('/members')}
            />

            <div style={{ height: 1, background: '#E8DFCB', marginLeft: 60 }} />

            <ManageRow
              icon="⚙️"
              label="Dashboard Modules"
              subtitle="Show, hide, and reorder widgets"
              onPress={() => router.push('/?widgets=open')}
            />

            <div style={{ height: 1, background: '#E8DFCB', marginLeft: 60 }} />

            <ManageRow
              icon="🔔"
              label="Notification Preferences"
              subtitle="Choose what you get notified about"
              onPress={() => setNotifsOpen(true)}
            />

            <div style={{ height: 1, background: '#E8DFCB', marginLeft: 60 }} />

            <ManageRow
              icon="🔑"
              label="Join Another Household"
              subtitle="Enter an invite code to join"
              onPress={() => setJoinSheetOpen(true)}
            />
          </div>
        </div>

        {/* Sign out */}
        <div className="px-5">
          <button
            onClick={handleSignOut}
            className="w-full rounded-[14px] flex items-center justify-center gap-2 font-semibold"
            style={{ height: 52, fontSize: 15, background: 'transparent', color: '#334266', border: '1.5px solid #E8DFCB', cursor: 'pointer' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#334266" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
            Sign Out
          </button>
        </div>

        <div className="px-5 pt-6 pb-4 text-center">
          <p style={{ fontSize: 11, color: '#C8BFB0' }}>Nest HQ · v1.0.0 (beta)</p>
        </div>
      </div>

      <TabBar active="family" />

      <JoinHouseholdSheet
        open={joinSheetOpen}
        onClose={() => setJoinSheetOpen(false)}
        onJoined={refetch}
      />

      <BottomSheet open={notifsOpen} onClose={() => setNotifsOpen(false)} snapPercent={55}>
        <div className="pt-3 pb-6">
          <p style={{ fontSize: 18, fontWeight: 800, color: '#1E1E2E', marginBottom: 4 }}>Notification Preferences</p>
          <p style={{ fontSize: 13, color: '#8A7E6B', marginBottom: 20 }}>Push notifications — coming soon</p>
          {[
            { label: 'Bills due soon',      sub: 'Remind me 3 days before a bill is due' },
            { label: 'New member joined',   sub: 'When someone joins the household' },
            { label: 'Family activity',     sub: 'Daily summary of household activity' },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between py-3.5" style={{ borderBottom: '1px solid #F0EAE0' }}>
              <div>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#1E1E2E' }}>{item.label}</p>
                <p style={{ fontSize: 12, color: '#8A7E6B', marginTop: 2 }}>{item.sub}</p>
              </div>
              <div style={{ width: 44, height: 24, borderRadius: 12, background: '#E8DFCB', opacity: 0.5, flexShrink: 0 }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', margin: '2px', boxShadow: '0 1px 2px rgba(0,0,0,0.15)' }} />
              </div>
            </div>
          ))}
          <button
            onClick={() => setNotifsOpen(false)}
            className="w-full mt-5 py-3.5 rounded-[12px] font-bold text-white text-[15px]"
            style={{ background: '#334266', border: 'none', cursor: 'pointer' }}
          >Done</button>
        </div>
      </BottomSheet>
    </div>
  );
}

function ManageRow({ icon, label, subtitle, onPress }: { icon: string; label: string; subtitle: string; onPress: () => void }) {
  return (
    <button
      onClick={onPress}
      className="w-full px-4 py-4 flex items-center gap-3 text-left"
      style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
    >
      <div className="w-10 h-10 rounded-[12px] flex items-center justify-center flex-shrink-0 text-[20px]" style={{ background: '#F0E5D2' }}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p style={{ fontSize: 15, fontWeight: 600, color: '#1E1E2E' }}>{label}</p>
        <p style={{ fontSize: 12, color: '#8A7E6B', marginTop: 1 }}>{subtitle}</p>
      </div>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C8BFB0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 6l6 6-6 6"/>
      </svg>
    </button>
  );
}
