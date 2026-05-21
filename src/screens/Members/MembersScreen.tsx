'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useHousehold } from '@/src/context/HouseholdContext';
import { TabBar } from '@/src/components/primitives/TabBar';
import { Avatar } from '@/src/components/primitives/Avatar';
import { Icon } from '@/src/components/primitives/Icon';
import { createClient } from '@/src/lib/supabase/client';

const PRESETS = [
  { color: '#4C8A8B', soft: '#DDEAEB', emoji: '🌿' },
  { color: '#334266', soft: '#DCE0EB', emoji: '🛠️' },
  { color: '#C65A3A', soft: '#F2D9CF', emoji: '🌺' },
  { color: '#DBA03A', soft: '#F4E4C7', emoji: '⭐' },
  { color: '#2D6A4F', soft: '#D8F0E4', emoji: '🌱' },
  { color: '#9B5DE5', soft: '#EDE0FA', emoji: '✨' },
  { color: '#E63946', soft: '#FADCDE', emoji: '❤️' },
  { color: '#F28C38', soft: '#FCDCBE', emoji: '🌸' },
];

const ACCESS_LEVELS = [
  { value: 'adult',     label: 'Adult',     desc: 'Full access — can see and edit everything' },
  { value: 'caregiver', label: 'Caregiver', desc: 'Can manage schedules and chores, no finances' },
  { value: 'child',     label: 'Child',     desc: 'Sees only their chores and routines' },
];

export function MembersScreen() {
  const { members, refetch } = useHousehold();
  const router = useRouter();

  const [showAdd,    setShowAdd]    = useState(false);
  const [name,       setName]       = useState('');
  const [role,       setRole]       = useState('');
  const [access,     setAccess]     = useState('adult');
  const [preset,     setPreset]     = useState(0);
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState('');

  const handleAdd = async () => {
    if (!name.trim()) { setError('Name is required'); return; }
    setSaving(true); setError('');
    const p = PRESETS[preset];
    const supabase = createClient();
    const { error: rpcErr } = await supabase.rpc('add_household_member', {
      p_name:         name.trim(),
      p_role:         role.trim() || access,
      p_access_level: access,
      p_emoji:        p.emoji,
      p_color:        p.color,
      p_soft:         p.soft,
    });
    if (rpcErr) { setError('Could not add member. Try again.'); setSaving(false); return; }
    await refetch();
    setShowAdd(false); setName(''); setRole(''); setAccess('adult'); setPreset(0);
    setSaving(false);
  };

  return (
    <div className="bg-bg h-full font-sans text-ink relative overflow-hidden flex flex-col">
      <div className="h-full overflow-y-auto" style={{ paddingBottom: 110 }}>

        {/* Header */}
        <div className="px-5 pt-14 pb-5 flex items-center gap-3" style={{ borderBottom: '1px solid #E8DFCB' }}>
          <button onClick={() => router.back()} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: '#F0E5D2', border: 'none', cursor: 'pointer' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#334266" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <div className="flex-1">
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#334266' }}>Family Members</h1>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: '#334266', border: 'none', cursor: 'pointer' }}
          >
            <Icon name="plus" size={18} color="#fff" />
          </button>
        </div>

        {/* Member list */}
        <div className="px-5 mt-5">
          <div className="rounded-[16px] overflow-hidden" style={{ border: '1px solid #E8DFCB', background: '#FBF8F1' }}>
            {members.map((m, i) => (
              <div key={m.id}>
                {i > 0 && <div style={{ height: 1, background: '#E8DFCB', marginLeft: 20 }} />}
                <button
                  onClick={() => router.push(`/members/${m.id}`)}
                  className="w-full px-5 py-4 flex items-center gap-3"
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                >
                  <Avatar member={m.id} size={44} />
                  <div className="flex-1 text-left">
                    <p style={{ fontSize: 16, fontWeight: 700, color: '#1E1E2E' }}>{m.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className="px-2 py-0.5 rounded-full text-[11px] font-bold"
                        style={{
                          background: m.access_level === 'child' ? '#F4E4C7' : m.access_level === 'caregiver' ? '#FCDCBE' : '#DCE0EB',
                          color:      m.access_level === 'child' ? '#8B5E17' : m.access_level === 'caregiver' ? '#8B4513' : '#334266',
                        }}
                      >
                        {m.access_level === 'child' ? '👧 Kid' : m.access_level === 'caregiver' ? '🧑 Caregiver' : '👤 Adult'}
                      </span>
                      {m.role && <span style={{ fontSize: 12, color: '#8A7E6B' }}>{m.role}</span>}
                      {!m.userId && <span style={{ fontSize: 11, color: '#8A7E6B' }}>· No account</span>}
                    </div>
                  </div>
                  <Icon name="chevron" size={16} color="#8A7E6B" />
                </button>
              </div>
            ))}
          </div>

          <p className="mt-4 text-center" style={{ fontSize: 12, color: '#8A7E6B' }}>
            Tap a member to view their profile, chores, routines, and records.
          </p>
        </div>

        {/* Access level guide */}
        <div className="px-5 mt-6">
          <p style={{ fontSize: 11, fontWeight: 700, color: '#8A7E6B', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10 }}>Access Levels</p>
          <div className="rounded-[16px] overflow-hidden" style={{ border: '1px solid #E8DFCB', background: '#FBF8F1' }}>
            {ACCESS_LEVELS.map((al, i) => (
              <div key={al.value}>
                {i > 0 && <div style={{ height: 1, background: '#E8DFCB', marginLeft: 20 }} />}
                <div className="px-5 py-4">
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#1E1E2E', marginBottom: 2 }}>{al.label}</p>
                  <p style={{ fontSize: 12, color: '#8A7E6B' }}>{al.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add member sheet */}
      {showAdd && (
        <div className="absolute inset-0 z-50" style={{ background: 'rgba(0,0,0,0.45)' }} onClick={() => setShowAdd(false)}>
          <div
            className="absolute bottom-0 left-0 right-0 rounded-t-[24px]"
            style={{ background: '#FBF8F1', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 pt-5 pb-3 flex items-center justify-between" style={{ borderBottom: '1px solid #E8DFCB' }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1E1E2E' }}>Add family member</h2>
              <button onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8A7E6B', fontSize: 15 }}>Cancel</button>
            </div>

            <div className="px-5 py-5 space-y-5">
              {/* Name */}
              <div>
                <label className="text-sm font-medium block mb-2" style={{ color: '#1E1E2E' }}>Name *</label>
                <input
                  type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sofia, Ate Lola"
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                  style={{ borderColor: '#E8DFCB', color: '#1E1E2E', background: '#fff' }}
                />
              </div>

              {/* Role */}
              <div>
                <label className="text-sm font-medium block mb-2" style={{ color: '#1E1E2E' }}>Role (optional)</label>
                <input
                  type="text" value={role} onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Mom, Nanny, Kid · 8 yrs"
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                  style={{ borderColor: '#E8DFCB', color: '#1E1E2E', background: '#fff' }}
                />
              </div>

              {/* Access level */}
              <div>
                <label className="text-sm font-medium block mb-2" style={{ color: '#1E1E2E' }}>Access level</label>
                <div className="flex flex-col gap-2">
                  {ACCESS_LEVELS.map((al) => (
                    <button
                      key={al.value}
                      onClick={() => setAccess(al.value)}
                      className="w-full px-4 py-3 rounded-xl border text-left flex items-start gap-3"
                      style={{
                        background:   access === al.value ? '#DCE0EB' : '#fff',
                        borderColor:  access === al.value ? '#334266' : '#E8DFCB',
                        cursor: 'pointer',
                      }}
                    >
                      <div className="w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center" style={{ borderColor: '#334266', background: access === al.value ? '#334266' : 'transparent' }}>
                        {access === al.value && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 700, color: '#1E1E2E' }}>{al.label}</p>
                        <p style={{ fontSize: 12, color: '#8A7E6B', marginTop: 2 }}>{al.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color / emoji */}
              <div>
                <label className="text-sm font-medium block mb-3" style={{ color: '#1E1E2E' }}>Color</label>
                <div className="flex flex-wrap gap-3">
                  {PRESETS.map((p, i) => (
                    <button key={i} onClick={() => setPreset(i)} style={{ width: 40, height: 40, borderRadius: '50%', background: p.soft, border: i === preset ? `3px solid ${p.color}` : '3px solid transparent', fontSize: 18, cursor: 'pointer', transform: i === preset ? 'scale(1.15)' : 'scale(1)', transition: 'transform 150ms' }}>
                      {p.emoji}
                    </button>
                  ))}
                </div>
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <button
                onClick={handleAdd} disabled={saving}
                className="w-full py-3.5 rounded-xl font-semibold text-white text-sm"
                style={{ background: '#334266', opacity: saving ? 0.6 : 1, border: 'none', cursor: 'pointer' }}
              >
                {saving ? 'Adding…' : 'Add member'}
              </button>
            </div>
          </div>
        </div>
      )}

      <TabBar active="profile" />
    </div>
  );
}
