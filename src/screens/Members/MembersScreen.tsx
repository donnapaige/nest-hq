'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useHousehold } from '@/src/context/HouseholdContext';
import type { HouseholdMember } from '@/src/context/HouseholdContext';
import { useAuth } from '@/src/context/AuthContext';
import { TabBar } from '@/src/components/primitives/TabBar';
import { Avatar } from '@/src/components/primitives/Avatar';
import { createClient } from '@/src/lib/supabase/client';
import { EditMemberSheet } from './sheets/EditMemberSheet';

/* ── Types ── */
type PermissionMap = Record<string, boolean>;

const PERMISSION_GROUPS = [
  {
    id: 'tasks', label: 'Tasks', icon: '✏️',
    items: [{ id: 'view_tasks', label: 'View tasks' }, { id: 'edit_tasks', label: 'Create & edit tasks' }],
  },
  {
    id: 'routines', label: 'Routines', icon: '⏰',
    items: [{ id: 'view_routines', label: 'View routines' }, { id: 'edit_routines', label: 'Edit routines' }],
  },
  {
    id: 'children', label: 'Children', icon: '🧒',
    items: [{ id: 'view_children', label: 'View child profiles' }, { id: 'edit_children', label: 'Edit child data' }],
  },
  {
    id: 'board', label: 'Family Board', icon: '📝',
    items: [{ id: 'view_board', label: 'View board & notes' }, { id: 'edit_board', label: 'Edit board & notes' }],
  },
  {
    id: 'finance', label: 'Finance', icon: '💰',
    items: [{ id: 'view_finance', label: 'View finance' }, { id: 'edit_bills', label: 'Edit bills' }],
  },
  {
    id: 'savings', label: 'Savings', icon: '🏦',
    items: [{ id: 'view_savings', label: 'View savings' }, { id: 'edit_savings', label: 'Edit savings goals' }],
  },
  {
    id: 'admin', label: 'Admin', icon: '👥',
    items: [{ id: 'delete_records', label: 'Delete records' }, { id: 'manage_members', label: 'Manage members & invites' }],
  },
];

const DISPLAY_LABELS = ['Dad', 'Mom', 'Partner', 'Brother', 'Sister', 'Grandparent', 'Nanny', 'Guardian', 'Caregiver', 'Other'];
const ACCESS_OPTIONS = [
  { value: 'adult',     label: 'Member' },
  { value: 'caregiver', label: 'Caregiver' },
  { value: 'child',     label: 'Child' },
];

function defaultPerms(): PermissionMap {
  const map: PermissionMap = {};
  PERMISSION_GROUPS.forEach((g) => g.items.forEach((i) => { map[i.id] = true; }));
  return map;
}

function generateCode() {
  return Math.floor(10_000_000 + Math.random() * 90_000_000).toString();
}

/* ══════════════════════════════════════════════════════════════════════ */
export function MembersScreen() {
  const { members, householdName, householdId, inviteCode, currentMember, refetch } = useHousehold();
  const { signOut } = useAuth();
  const router = useRouter();

  /* Invite modal */
  const [inviteOpen,    setInviteOpen]    = useState(false);
  const [inviteRole,    setInviteRole]    = useState('adult');
  const [inviteLabel,   setInviteLabel]   = useState('');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [codeCopied,    setCodeCopied]    = useState(false);
  const [codeLoading,   setCodeLoading]   = useState(false);

  /* Permissions sheet */
  const [permsMemberId, setPermsMemberId] = useState<string | null>(null);
  const [perms,         setPerms]         = useState<PermissionMap>(defaultPerms());

  /* Edit member sheet */
  const [editingMember, setEditingMember] = useState<HouseholdMember | null>(null);

  /* Save member edits */
  const handleSaveMember = useCallback(async (id: string, updates: { name: string; access_level: string }) => {
    const supabase = createClient();
    await supabase.from('household_members').update(updates).eq('id', id);
    setEditingMember(null);
    await refetch();
  }, [refetch]);

  /* Remove member */
  const handleRemoveMember = useCallback(async (memberId: string) => {
    const supabase = createClient();
    const { error } = await supabase.rpc('remove_household_member', { p_member_id: memberId });
    if (error) {
      alert(`Could not remove member: ${error.message}`);
      return;
    }
    setEditingMember(null);
    await refetch();
  }, [refetch]);

  /* Generate / refresh invite code */
  const handleGenerateCode = useCallback(async () => {
    setCodeLoading(true);
    const newCode = generateCode();
    const supabase = createClient();
    await supabase.from('households').update({ invite_code: newCode }).eq('id', householdId!);
    setGeneratedCode(newCode);
    setCodeLoading(false);
  }, [householdId]);

  const handleCopyCode = () => {
    const code = generatedCode ?? inviteCode;
    navigator.clipboard.writeText(code).then(() => {
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    });
  };

  const handleShareCode = async () => {
    const code = generatedCode ?? inviteCode;
    if (navigator.share) {
      await navigator.share({ title: 'Join our Nest HQ family', text: `Use code ${code} to join our family on Nest HQ.` });
    } else {
      handleCopyCode();
    }
  };

  const openInvite = () => {
    setInviteRole('adult');
    setInviteLabel('');
    setGeneratedCode(null);
    setCodeCopied(false);
    setInviteOpen(true);
  };

  const openPerms = (memberId: string) => {
    setPerms(defaultPerms());
    setPermsMemberId(memberId);
  };

  const permsMember = permsMemberId ? members.find((m) => m.id === permsMemberId) : null;
  const displayCode = generatedCode ?? inviteCode;

  const handleSignOut = async () => { await signOut(); router.push('/login'); };

  return (
    <div className="bg-bg h-full font-sans text-ink flex flex-col relative overflow-hidden">
      <div className="h-full overflow-y-auto" style={{ paddingBottom: 110 }}>

        {/* Header */}
        <div className="px-5 pt-14 pb-4 flex items-start justify-between">
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: '#1E1E2E', lineHeight: 1.15 }}>{householdName}</h1>
            <p style={{ fontSize: 13, color: '#8A7E6B', marginTop: 2 }}>Family Settings</p>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <button onClick={() => router.push('/settings')} style={{ width: 36, height: 36, borderRadius: '50%', background: '#F0E5D2', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-label="Settings">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#334266" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Members section */}
        <div className="px-5 mt-2">
          <div className="flex items-center justify-between mb-3">
            <p style={{ fontSize: 11, fontWeight: 700, color: '#8A7E6B', letterSpacing: 0.8, textTransform: 'uppercase' }}>
              Members ({members.length})
            </p>
          </div>

          <div className="rounded-[18px] overflow-hidden" style={{ background: '#FBF8F1', border: '1px solid #E8DFCB' }}>
            {members.map((m, i) => {
              const isMe = m.id === currentMember?.id;
              const isOwner = members[0]?.id === m.id;
              const accessOption = ACCESS_OPTIONS.find((o) => o.value === m.access_level) ?? ACCESS_OPTIONS[0];

              return (
                <div key={m.id}>
                  {i > 0 && <div style={{ height: 1, background: '#E8DFCB', marginLeft: 20 }} />}

                  <div className="px-4 py-3.5 flex items-center gap-3">
                    {/* Avatar */}
                    <button
                      onClick={() => router.push(`/members/${m.id}`)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }}
                    >
                      <Avatar member={m.id} size={42} />
                    </button>

                    {/* Name + role */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span style={{ fontSize: 15, fontWeight: 700, color: '#1E1E2E' }}>{m.name}</span>
                        {isMe && (
                          <span style={{ fontSize: 11, fontWeight: 700, color: '#334266', border: '1.5px solid #334266', borderRadius: 20, padding: '1px 7px' }}>You</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span style={{ fontSize: 12, color: '#8A7E6B' }}>{m.role || accessOption.label}</span>
                        {isOwner ? (
                          <span className="flex items-center gap-1" style={{ fontSize: 11, fontWeight: 700, color: '#334266', border: '1.5px solid #334266', borderRadius: 20, padding: '1px 7px' }}>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="#334266"><path d="M12 2L9 9H2l5.5 4L5 20l7-4 7 4-2.5-7L22 9h-7z"/></svg>
                            Owner
                          </span>
                        ) : (
                          <span style={{ fontSize: 11, fontWeight: 700, color: '#8A7E6B', border: '1.5px solid #C8BFB0', borderRadius: 20, padding: '1px 7px' }}>
                            Member
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Edit button (non-current members only) */}
                    {!isMe && (
                      <button
                        onClick={() => setEditingMember(m)}
                        style={{ width: 32, height: 32, borderRadius: '50%', background: '#F0E5D2', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                        aria-label="Edit member"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#334266" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Invite a Member */}
        <div className="px-5 mt-4">
          <button
            onClick={openInvite}
            className="w-full py-3.5 rounded-[14px] flex items-center justify-center gap-2 font-semibold text-[14px]"
            style={{ background: 'transparent', border: '1.5px solid #334266', color: '#334266', cursor: 'pointer' }}
          >
            <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Invite a Member
          </button>
        </div>

        {/* Sign Out */}
        <div className="px-5 mt-4">
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
      </div>

      <TabBar active="family" />

      {/* ── Edit Member Sheet ───────────────────────────────────── */}
      <EditMemberSheet
        open={editingMember !== null}
        onClose={() => setEditingMember(null)}
        member={editingMember}
        onSave={handleSaveMember}
        onRemove={handleRemoveMember}
        onOpenPerms={(id) => openPerms(id)}
      />

      {/* ── Invite Modal ──────────────────────────────────────────── */}
      {inviteOpen && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center px-5"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setInviteOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-[24px] overflow-hidden"
            style={{ background: '#FBF8F1' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="px-5 pt-5 pb-4 flex items-center justify-between" style={{ borderBottom: '1px solid #E8DFCB' }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1E1E2E' }}>Invite to Family</h2>
              <button onClick={() => setInviteOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8A7E6B', fontSize: 20, lineHeight: 1 }}>×</button>
            </div>

            <div className="px-5 py-5 space-y-4">
              {/* Role */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#1E1E2E', display: 'block', marginBottom: 6 }}>Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-4 py-3 rounded-[12px] text-sm font-medium cursor-pointer outline-none"
                  style={{ background: '#fff', border: '1.5px solid #E8DFCB', color: '#1E1E2E', appearance: 'auto' }}
                >
                  <option value="adult">Member</option>
                  <option value="caregiver">Caregiver</option>
                  <option value="adult_admin">Admin</option>
                </select>
              </div>

              {/* Display label */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#1E1E2E', display: 'block', marginBottom: 6 }}>Display Label</label>
                <select
                  value={inviteLabel}
                  onChange={(e) => setInviteLabel(e.target.value)}
                  className="w-full px-4 py-3 rounded-[12px] text-sm font-medium cursor-pointer outline-none"
                  style={{ background: '#fff', border: '1.5px solid #E8DFCB', color: inviteLabel ? '#1E1E2E' : '#9BA3AF', appearance: 'auto' }}
                >
                  <option value="">Select a label…</option>
                  {DISPLAY_LABELS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>

              {/* Generated code display */}
              {displayCode && (
                <div className="rounded-[14px] px-4 py-4 text-center" style={{ background: '#F0E5D2' }}>
                  <p style={{ fontSize: 28, fontWeight: 900, letterSpacing: 6, color: '#1E1E2E', fontFamily: 'monospace' }}>
                    {displayCode}
                  </p>
                  <p style={{ fontSize: 12, color: '#8A7E6B', marginTop: 4 }}>Expires in 7 days</p>
                </div>
              )}

              {/* Generate button */}
              {!generatedCode ? (
                <button
                  onClick={handleGenerateCode}
                  disabled={codeLoading}
                  className="w-full py-3.5 rounded-[12px] font-bold text-white text-[15px]"
                  style={{ background: '#334266', border: 'none', cursor: 'pointer', opacity: codeLoading ? 0.6 : 1 }}
                >
                  {codeLoading ? 'Generating…' : 'Generate Invite Code'}
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleCopyCode}
                    className="flex-1 py-3 rounded-[12px] font-semibold text-[14px] flex items-center justify-center gap-1.5"
                    style={{ background: codeCopied ? '#2D6A4F' : '#fff', color: codeCopied ? '#fff' : '#334266', border: '1.5px solid #E8DFCB', cursor: 'pointer' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                    {codeCopied ? 'Copied!' : 'Copy'}
                  </button>
                  <button
                    onClick={handleShareCode}
                    className="flex-1 py-3 rounded-[12px] font-semibold text-[14px] flex items-center justify-center gap-1.5"
                    style={{ background: '#fff', color: '#334266', border: '1.5px solid #E8DFCB', cursor: 'pointer' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
                    Share
                  </button>
                  <button
                    onClick={handleGenerateCode}
                    className="py-3 px-3.5 rounded-[12px]"
                    style={{ background: '#fff', border: '1.5px solid #E8DFCB', cursor: 'pointer' }}
                    aria-label="Refresh code"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#334266" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 4v6h6"/><path d="M23 20v-6h-6"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/></svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Permissions Sheet ─────────────────────────────────────── */}
      {permsMember && (
        <div
          className="absolute inset-0 z-50"
          style={{ background: 'rgba(0,0,0,0.45)' }}
          onClick={() => setPermsMemberId(null)}
        >
          <div
            className="absolute bottom-0 left-0 right-0 rounded-t-[24px]"
            style={{ background: '#FBF8F1', maxHeight: '88vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sheet header */}
            <div className="px-5 pt-5 pb-4 flex items-center gap-3" style={{ borderBottom: '1px solid #E8DFCB' }}>
              <Avatar member={permsMember.id} size={44} />
              <div className="flex-1 min-w-0">
                <p style={{ fontSize: 16, fontWeight: 700, color: '#1E1E2E' }}>{permsMember.name}</p>
                <p style={{ fontSize: 12, color: '#8A7E6B' }}>
                  {permsMember.role} · {permsMember.access_level}
                </p>
              </div>
              <button onClick={() => setPermsMemberId(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8A7E6B', fontSize: 22, lineHeight: 1 }}>×</button>
            </div>

            {/* Permission groups */}
            <div className="px-5 py-4 space-y-5">
              {PERMISSION_GROUPS.map((group) => (
                <div key={group.id}>
                  <div className="flex items-center gap-2 mb-2">
                    <span style={{ fontSize: 14 }}>{group.icon}</span>
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#8A7E6B', letterSpacing: 0.8, textTransform: 'uppercase' }}>{group.label}</p>
                  </div>
                  <div className="rounded-[14px] overflow-hidden" style={{ background: '#fff', border: '1px solid #E8DFCB' }}>
                    {group.items.map((item, idx) => (
                      <div key={item.id}>
                        {idx > 0 && <div style={{ height: 1, background: '#E8DFCB', marginLeft: 16 }} />}
                        <div className="px-4 py-3.5 flex items-center justify-between">
                          <span style={{ fontSize: 14, fontWeight: 500, color: '#1E1E2E' }}>{item.label}</span>
                          <Toggle
                            value={perms[item.id] ?? true}
                            onChange={(v) => setPerms((p) => ({ ...p, [item.id]: v }))}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <button
                onClick={() => setPermsMemberId(null)}
                className="w-full py-3.5 rounded-[12px] font-bold text-white text-[15px] mb-4"
                style={{ background: '#334266', border: 'none', cursor: 'pointer' }}
              >
                Save permissions
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Toggle component ── */
function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      style={{
        position: 'relative', width: 44, height: 26,
        background: value ? '#334266' : '#E8DFCB',
        borderRadius: 13, border: 'none', cursor: 'pointer',
        transition: 'background 0.2s', flexShrink: 0,
      }}
    >
      <div style={{
        position: 'absolute', top: 3,
        left: value ? 21 : 3,
        width: 20, height: 20,
        borderRadius: '50%', background: '#fff',
        boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
        transition: 'left 0.2s',
      }} />
    </button>
  );
}
