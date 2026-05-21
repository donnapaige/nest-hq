'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useHousehold } from '@/src/context/HouseholdContext';
import { useAuth } from '@/src/context/AuthContext';
import { createClient } from '@/src/lib/supabase/client';
import { TabBar } from '@/src/components/primitives/TabBar';
import { Avatar } from '@/src/components/primitives/Avatar';
import { Icon } from '@/src/components/primitives/Icon';

interface FeedEntry {
  id: string;
  description: string;
  entityType: string;
  action: string;
  createdAt: string;
}

const ENTITY_EMOJI: Record<string, string> = {
  bill: '💸', chore: '✅', event: '📅', shopping_item: '🛒',
  goal: '🎯', member: '👤', fuel_log: '⛽',
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

export function FamilyScreen() {
  const { members, householdName, inviteCode } = useHousehold();
  const { user, signOut } = useAuth();
  const router = useRouter();

  const [feed, setFeed] = useState<FeedEntry[]>([]);
  const [feedLoading, setFeedLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const { householdId } = useHousehold();

  const loadFeed = useCallback(async () => {
    if (!householdId) { setFeed([]); setFeedLoading(false); return; }
    const supabase = createClient();
    const { data } = await supabase
      .from('activity_log')
      .select('id, description, entity_type, action, created_at')
      .eq('household_id', householdId)
      .order('created_at', { ascending: false })
      .limit(5);
    setFeed((data || []).map((r) => ({
      id: r.id, description: r.description, entityType: r.entity_type,
      action: r.action, createdAt: r.created_at,
    })));
    setFeedLoading(false);
  }, [householdId]);

  useEffect(() => { loadFeed(); }, [loadFeed]);

  const kids    = members.filter((m) => m.access_level === 'child');
  const adults  = members.filter((m) => m.access_level !== 'child');
  const currentUser = members.find((m) => m.userId === user?.id);

  const inviteLink = typeof window !== 'undefined'
    ? `${window.location.origin}/join/${inviteCode}`
    : `/join/${inviteCode}`;

  const copyInvite = () => {
    navigator.clipboard.writeText(inviteLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <div className="bg-bg h-full font-sans text-ink flex flex-col relative overflow-hidden">
      <div className="h-full overflow-y-auto" style={{ paddingBottom: 110 }}>

        {/* Header */}
        <div className="px-5 pt-14 pb-4 flex items-center justify-between" style={{ borderBottom: '1px solid #E8DFCB' }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: '#1E1E2E' }}>Family</h1>
            <p style={{ fontSize: 13, color: '#8A7E6B', marginTop: 1 }}>{householdName}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/settings">
              <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: '#F0E5D2' }}>
                <Icon name="settings" size={17} color="#334266" />
              </div>
            </Link>
            <button
              onClick={() => router.push('/members')}
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: '#334266', border: 'none', cursor: 'pointer' }}
            >
              <Icon name="plus" size={17} color="#fff" />
            </button>
          </div>
        </div>

        {/* My profile card */}
        {currentUser && (
          <div className="px-5 mt-5">
            <button
              onClick={() => router.push('/profile')}
              className="w-full rounded-[16px] px-4 py-4 flex items-center gap-3"
              style={{ background: '#334266', border: 'none', cursor: 'pointer' }}
            >
              <Avatar member={currentUser.id} size={44} />
              <div className="flex-1 text-left">
                <p style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{currentUser.name} <span style={{ fontSize: 12, opacity: 0.7 }}>(You)</span></p>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)' }}>{currentUser.role || 'Member'} · {user?.email}</p>
              </div>
              <Icon name="chevron" size={16} color="rgba(255,255,255,0.5)" />
            </button>
          </div>
        )}

        {/* All Members */}
        <div className="px-5 mt-5">
          <div className="flex items-center justify-between mb-3">
            <p style={{ fontSize: 11, fontWeight: 700, color: '#8A7E6B', letterSpacing: 0.8, textTransform: 'uppercase' }}>Members</p>
            <button onClick={() => router.push('/members')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#334266', fontWeight: 700 }}>Manage</button>
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-none pb-1">
            {members.map((m) => (
              <button
                key={m.id}
                onClick={() => router.push(`/members/${m.id}`)}
                className="flex flex-col items-center gap-1.5 flex-shrink-0"
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <Avatar member={m.id} size={52} />
                <p style={{ fontSize: 11, fontWeight: 600, color: '#334266', maxWidth: 56, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</p>
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                  style={{
                    background: m.access_level === 'child' ? '#F4E4C7' : m.access_level === 'caregiver' ? '#FCDCBE' : '#DCE0EB',
                    color:      m.access_level === 'child' ? '#8B5E17' : m.access_level === 'caregiver' ? '#8B4513' : '#334266',
                  }}
                >
                  {m.access_level === 'child' ? 'Kid' : m.access_level === 'caregiver' ? 'Caregiver' : 'Adult'}
                </span>
              </button>
            ))}
            <button
              onClick={() => router.push('/members')}
              className="flex flex-col items-center gap-1.5 flex-shrink-0"
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <div className="w-[52px] h-[52px] rounded-full flex items-center justify-center" style={{ background: '#F0E5D2', border: '2px dashed #E8DFCB' }}>
                <Icon name="plus" size={20} color="#8A7E6B" />
              </div>
              <p style={{ fontSize: 11, fontWeight: 600, color: '#8A7E6B' }}>Add</p>
            </button>
          </div>
        </div>

        {/* Kids section */}
        {kids.length > 0 && (
          <div className="px-5 mt-6">
            <div className="flex items-center justify-between mb-3">
              <p style={{ fontSize: 11, fontWeight: 700, color: '#8A7E6B', letterSpacing: 0.8, textTransform: 'uppercase' }}>
                Kids · {kids.length}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {kids.map((kid) => (
                <button
                  key={kid.id}
                  onClick={() => router.push(`/members/${kid.id}`)}
                  className="rounded-[16px] p-4 flex flex-col items-center gap-2"
                  style={{ background: '#FBF8F1', border: '1px solid #E8DFCB', cursor: 'pointer' }}
                >
                  <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: kid.softColor || '#F4E4C7' }}>
                    <span style={{ fontSize: 26 }}>{kid.emoji || '👧'}</span>
                  </div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#1E1E2E' }}>{kid.name}</p>
                  {kid.role && <p style={{ fontSize: 12, color: '#8A7E6B' }}>{kid.role}</p>}
                  <span style={{ fontSize: 10, color: '#8A7E6B', background: '#F4E4C7', padding: '2px 8px', borderRadius: 20, fontWeight: 700 }}>View profile →</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Invite link */}
        <div className="px-5 mt-6">
          <div className="rounded-[16px] p-4" style={{ background: '#FBF8F1', border: '1px solid #E8DFCB' }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#334266', marginBottom: 8 }}>🔗 Invite a family member</p>
            <div className="flex gap-2">
              <div className="flex-1 rounded-xl px-3 py-2 text-xs font-mono truncate" style={{ background: '#F0E5D2', color: '#334266' }}>
                {inviteLink}
              </div>
              <button onClick={copyInvite} className="px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1" style={{ background: copied ? '#2D6A4F' : '#334266', color: '#fff', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'background 200ms' }}>
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="px-5 mt-6">
          <div className="flex items-center justify-between mb-3">
            <p style={{ fontSize: 11, fontWeight: 700, color: '#8A7E6B', letterSpacing: 0.8, textTransform: 'uppercase' }}>Recent Activity</p>
            <button onClick={() => router.push('/feed')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#334266', fontWeight: 700 }}>See all</button>
          </div>
          {feedLoading ? (
            <div className="flex flex-col gap-2">
              {[1,2,3].map((i) => <div key={i} className="h-14 rounded-[12px] animate-pulse" style={{ background: '#E8DFCB' }} />)}
            </div>
          ) : feed.length === 0 ? (
            <div className="py-8 text-center">
              <p style={{ fontSize: 30 }}>📋</p>
              <p style={{ fontSize: 14, color: '#8A7E6B', marginTop: 8 }}>No activity yet</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {feed.map((entry) => (
                <div key={entry.id} className="rounded-[12px] px-3 py-3 flex items-center gap-3" style={{ background: '#FBF8F1', border: '1px solid #E8DFCB' }}>
                  <span style={{ fontSize: 18 }}>{ENTITY_EMOJI[entry.entityType] ?? '📌'}</span>
                  <div className="flex-1 min-w-0">
                    <p style={{ fontSize: 13, color: '#1E1E2E', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.description}</p>
                    <p style={{ fontSize: 11, color: '#9BA3AF', marginTop: 1 }}>{timeAgo(entry.createdAt)}</p>
                  </div>
                </div>
              ))}
              <button onClick={() => router.push('/feed')} className="w-full py-2.5 rounded-[12px] text-sm font-semibold" style={{ background: '#F0E5D2', border: 'none', cursor: 'pointer', color: '#334266' }}>
                View full activity feed
              </button>
            </div>
          )}
        </div>

        {/* Account actions */}
        <div className="px-5 mt-6 mb-4">
          <div className="rounded-[16px] overflow-hidden" style={{ background: '#FBF8F1', border: '1px solid #E8DFCB' }}>
            <button onClick={() => router.push('/profile')} className="w-full px-5 py-4 flex items-center gap-3" style={{ background: 'none', border: 'none', cursor: 'pointer', borderBottom: '1px solid #E8DFCB' }}>
              <div className="w-8 h-8 rounded-[10px] flex items-center justify-center" style={{ background: '#F0E5D2' }}><Icon name="user" size={16} color="#334266" /></div>
              <span style={{ fontSize: 15, fontWeight: 600, color: '#333' }}>My Profile</span>
              <Icon name="chevron" size={16} color="#8A7E6B" />
            </button>
            <button onClick={() => router.push('/settings')} className="w-full px-5 py-4 flex items-center gap-3" style={{ background: 'none', border: 'none', cursor: 'pointer', borderBottom: '1px solid #E8DFCB' }}>
              <div className="w-8 h-8 rounded-[10px] flex items-center justify-center" style={{ background: '#F0E5D2' }}><Icon name="settings" size={16} color="#334266" /></div>
              <span style={{ fontSize: 15, fontWeight: 600, color: '#333' }}>Settings</span>
              <Icon name="chevron" size={16} color="#8A7E6B" />
            </button>
            <button onClick={handleSignOut} className="w-full px-5 py-4 flex items-center gap-3" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <div className="w-8 h-8 rounded-[10px] flex items-center justify-center" style={{ background: '#F2D9CF' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C65A3A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>
              </div>
              <span style={{ fontSize: 15, fontWeight: 600, color: '#C65A3A' }}>Sign out</span>
            </button>
          </div>
        </div>
      </div>

      <TabBar active="family" />
    </div>
  );
}
