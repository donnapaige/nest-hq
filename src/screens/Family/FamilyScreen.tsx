'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useHousehold } from '@/src/context/HouseholdContext';
import { useAuth } from '@/src/context/AuthContext';
import { createClient } from '@/src/lib/supabase/client';
import { TabBar } from '@/src/components/primitives/TabBar';
import { Avatar } from '@/src/components/primitives/Avatar';
import { Icon } from '@/src/components/primitives/Icon';

/* ── Types ─────────────────────────────────────────────────────── */
interface FeedEntry {
  id: string; description: string; entityType: string; createdAt: string;
}

interface FamilyNote {
  id: string; title: string; content: string;
  category: string; pinned: boolean; createdAt: string; updatedAt: string;
}

const ENTITY_EMOJI: Record<string, string> = {
  bill: '💸', chore: '✅', event: '📅', shopping_item: '🛒',
  goal: '🎯', member: '👤', fuel_log: '⛽',
};

const NOTE_CATEGORIES = ['All', 'Pinned', 'General', 'Recipe', 'Reminder', 'Reference', 'Baby'];

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return `about ${Math.floor(days / 30)} month${Math.floor(days / 30) > 1 ? 's' : ''} ago`;
}

/* ══════════════════════════════════════════════════════════════════ */
export function FamilyScreen() {
  const { members, householdName, householdId } = useHousehold();
  const { user } = useAuth();
  const router = useRouter();

  /* Feed */
  const [feed, setFeed] = useState<FeedEntry[]>([]);
  const [feedLoading, setFeedLoading] = useState(true);

  /* Notes */
  const [notes, setNotes] = useState<FamilyNote[]>([]);
  const [notesLoading, setNotesLoading] = useState(true);
  const [boardView, setBoardView] = useState<'notes' | 'board'>('notes');
  const [noteFilter, setNoteFilter] = useState('All');

  /* Add / Edit note sheet */
  const [noteSheetOpen, setNoteSheetOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<FamilyNote | null>(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteCategory, setNoteCategory] = useState('General');
  const [noteSaving, setNoteSaving] = useState(false);

  const currentUser = members.find((m) => m.userId === user?.id);
  void currentUser; // kept for potential future use

  /* Load feed */
  const loadFeed = useCallback(async () => {
    if (!householdId) { setFeed([]); setFeedLoading(false); return; }
    const supabase = createClient();
    const { data } = await supabase
      .from('activity_log')
      .select('id, description, entity_type, created_at')
      .eq('household_id', householdId)
      .order('created_at', { ascending: false })
      .limit(5);
    setFeed((data || []).map((r) => ({ id: r.id, description: r.description, entityType: r.entity_type, createdAt: r.created_at })));
    setFeedLoading(false);
  }, [householdId]);

  /* Load notes */
  const loadNotes = useCallback(async () => {
    if (!householdId) { setNotes([]); setNotesLoading(false); return; }
    const supabase = createClient();
    const { data } = await supabase
      .from('family_notes')
      .select('*')
      .eq('household_id', householdId)
      .order('pinned', { ascending: false })
      .order('updated_at', { ascending: false });
    setNotes((data || []).map((r) => ({
      id: r.id, title: r.title, content: r.content ?? '',
      category: r.category ?? 'General', pinned: r.pinned ?? false,
      createdAt: r.created_at, updatedAt: r.updated_at,
    })));
    setNotesLoading(false);
  }, [householdId]);

  useEffect(() => { loadFeed(); loadNotes(); }, [loadFeed, loadNotes]);

  /* Note actions */
  const togglePin = async (id: string) => {
    const note = notes.find((n) => n.id === id);
    if (!note) return;
    const newPinned = !note.pinned;
    setNotes((prev) => prev.map((n) => n.id === id ? { ...n, pinned: newPinned } : n));
    await createClient().from('family_notes').update({ pinned: newPinned }).eq('id', id);
  };

  const openAddNote = () => {
    setEditingNote(null);
    setNoteTitle(''); setNoteContent(''); setNoteCategory('General');
    setNoteSheetOpen(true);
  };

  const openEditNote = (note: FamilyNote) => {
    setEditingNote(note);
    setNoteTitle(note.title); setNoteContent(note.content); setNoteCategory(note.category);
    setNoteSheetOpen(true);
  };

  const handleSaveNote = async () => {
    if (!noteTitle.trim() || !householdId) return;
    setNoteSaving(true);
    const supabase = createClient();
    if (editingNote) {
      await supabase.from('family_notes').update({ title: noteTitle.trim(), content: noteContent.trim(), category: noteCategory, updated_at: new Date().toISOString() }).eq('id', editingNote.id);
    } else {
      await supabase.from('family_notes').insert({ household_id: householdId, title: noteTitle.trim(), content: noteContent.trim(), category: noteCategory, created_by: user?.id });
    }
    await loadNotes();
    setNoteSaving(false);
    setNoteSheetOpen(false);
  };

  const deleteNote = async (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    await createClient().from('family_notes').delete().eq('id', id);
  };

  /* Filtered notes */
  const filteredNotes = notes.filter((n) => {
    if (noteFilter === 'All') return true;
    if (noteFilter === 'Pinned') return n.pinned;
    return n.category === noteFilter;
  });
  const pinnedNotes = filteredNotes.filter((n) => n.pinned);
  const unpinnedNotes = filteredNotes.filter((n) => !n.pinned);

  return (
    <div className="bg-bg h-full font-sans text-ink flex flex-col relative overflow-hidden">
      <div className="h-full overflow-y-auto" style={{ paddingBottom: 110 }}>

        {/* Header */}
        <div className="px-5 pt-14 pb-4 flex items-center justify-between" style={{ borderBottom: '1px solid #E8DFCB' }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: '#1E1E2E' }}>Family</h1>
            <p style={{ fontSize: 13, color: '#8A7E6B', marginTop: 1 }}>{householdName}</p>
          </div>
          <button onClick={() => router.push('/settings')} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: '#F0E5D2', border: 'none', cursor: 'pointer' }}>
              <Icon name="settings" size={17} color="#334266" />
            </button>
        </div>

        {/* Members carousel */}
        <div className="px-5 mt-5">
          <div className="flex items-center justify-between mb-3">
            <p style={{ fontSize: 11, fontWeight: 700, color: '#8A7E6B', letterSpacing: 0.8, textTransform: 'uppercase' }}>Members</p>
            <button onClick={() => router.push('/members')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#334266', fontWeight: 700 }}>Manage</button>
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-none pb-1">
            {members.map((m) => {
              const isMe = m.userId === user?.id;
              return (
                <button key={m.id} onClick={() => router.push(isMe ? '/profile' : `/members/${m.id}`)} className="flex flex-col items-center gap-1.5 flex-shrink-0" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <div style={{ position: 'relative' }}>
                    <Avatar member={m.id} size={isMe ? 68 : 52} />
                    {isMe && (
                      <span style={{ position: 'absolute', bottom: 0, right: 0, background: '#334266', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #FBF8F1', fontSize: 9, fontWeight: 700, color: '#fff' }}>You</span>
                    )}
                  </div>
                  <p style={{ fontSize: 11, fontWeight: isMe ? 700 : 600, color: '#334266', maxWidth: isMe ? 72 : 56, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</p>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: m.access_level === 'child' ? '#F4E4C7' : '#DCE0EB', color: m.access_level === 'child' ? '#8B5E17' : '#334266' }}>
                    {m.access_level === 'child' ? 'Kid' : m.access_level === 'caregiver' ? 'Caregiver' : 'Adult'}
                  </span>
                </button>
              );
            })}
            <button onClick={() => router.push('/members')} className="flex flex-col items-center gap-1.5 flex-shrink-0" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <div className="w-[52px] h-[52px] rounded-full flex items-center justify-center" style={{ background: '#F0E5D2', border: '2px dashed #E8DFCB' }}>
                <Icon name="plus" size={20} color="#8A7E6B" />
              </div>
              <p style={{ fontSize: 11, fontWeight: 600, color: '#8A7E6B' }}>Add</p>
            </button>
          </div>
        </div>

        {/* ── Family Board ───────────────────────────────────────── */}
        <div className="px-5 mt-6">
          <div className="flex items-center justify-between mb-3">
            <p style={{ fontSize: 11, fontWeight: 700, color: '#8A7E6B', letterSpacing: 0.8, textTransform: 'uppercase' }}>Family Board</p>
            <button onClick={openAddNote} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#334266', border: 'none', cursor: 'pointer' }}>
              <Icon name="plus" size={15} color="#fff" />
            </button>
          </div>

          {/* Notes / Board toggle */}
          <div className="flex gap-2 mb-3">
            {(['notes', 'board'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setBoardView(v)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-bold"
                style={{ background: boardView === v ? '#1E1E2E' : '#F0E5D2', color: boardView === v ? '#fff' : '#8A7E6B', border: 'none', cursor: 'pointer' }}
              >
                {v === 'notes' ? '📝' : '📋'} {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>

          {boardView === 'notes' && (
            <>
              {/* Category filter chips */}
              <div className="flex gap-2 overflow-x-auto scrollbar-none pb-2 mb-3">
                {NOTE_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setNoteFilter(cat)}
                    className="flex-shrink-0 px-3 py-1.5 rounded-full text-[12px] font-bold"
                    style={{ background: noteFilter === cat ? '#334266' : '#F0E5D2', color: noteFilter === cat ? '#fff' : '#8A7E6B', border: 'none', cursor: 'pointer' }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {notesLoading ? (
                <div className="flex flex-col gap-2">{[1,2].map((i) => <div key={i} className="h-16 rounded-[14px] animate-pulse" style={{ background: '#E8DFCB' }} />)}</div>
              ) : filteredNotes.length === 0 ? (
                <div className="rounded-[16px] py-10 text-center" style={{ background: '#FBF8F1', border: '1px solid #E8DFCB' }}>
                  <p style={{ fontSize: 32 }}>📝</p>
                  <p style={{ fontSize: 15, fontWeight: 600, color: '#334266', marginTop: 10 }}>No notes yet</p>
                  <p style={{ fontSize: 13, color: '#8A7E6B', marginTop: 4 }}>Tap + to add the first note.</p>
                </div>
              ) : (
                <>
                  {pinnedNotes.length > 0 && (
                    <>
                      <p style={{ fontSize: 10, fontWeight: 700, color: '#8A7E6B', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8 }}>PINNED</p>
                      {pinnedNotes.map((note) => <NoteCard key={note.id} note={note} onPin={togglePin} onEdit={openEditNote} onDelete={deleteNote} />)}
                    </>
                  )}
                  {unpinnedNotes.length > 0 && (
                    <>
                      {pinnedNotes.length > 0 && <div style={{ height: 8 }} />}
                      {unpinnedNotes.map((note) => <NoteCard key={note.id} note={note} onPin={togglePin} onEdit={openEditNote} onDelete={deleteNote} />)}
                    </>
                  )}
                </>
              )}
            </>
          )}

          {boardView === 'board' && (
            <div className="rounded-[16px] py-14 text-center" style={{ background: '#FBF8F1', border: '1px solid #E8DFCB' }}>
              <p style={{ fontSize: 36 }}>📋</p>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#334266', marginTop: 10 }}>Board view coming soon</p>
              <p style={{ fontSize: 13, color: '#8A7E6B', marginTop: 4 }}>Kanban-style planning for the family.</p>
            </div>
          )}
        </div>

        {/* ── Recent Activity (compact) ──────────────────────────── */}
        <div className="px-5 mt-6 mb-6">
          <div className="flex items-center justify-between mb-2">
            <p style={{ fontSize: 11, fontWeight: 700, color: '#8A7E6B', letterSpacing: 0.8, textTransform: 'uppercase' }}>Recent Activity</p>
            <button onClick={() => router.push('/feed')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#334266', fontWeight: 700 }}>See all</button>
          </div>
          {feedLoading ? (
            <div className="flex flex-col gap-1">{[1,2,3].map((i) => <div key={i} className="h-8 rounded-lg animate-pulse" style={{ background: '#E8DFCB' }} />)}</div>
          ) : feed.length === 0 ? (
            <p style={{ fontSize: 13, color: '#8A7E6B', paddingTop: 8 }}>No activity yet.</p>
          ) : (
            <div>
              {feed.map((entry, i) => (
                <div key={entry.id} className="flex items-center gap-2 py-2" style={{ borderTop: i > 0 ? '1px solid #F0EAE0' : 'none' }}>
                  <span style={{ fontSize: 14, flexShrink: 0 }}>{ENTITY_EMOJI[entry.entityType] ?? '📌'}</span>
                  <p style={{ fontSize: 13, color: '#1E1E2E', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.description}</p>
                  <span style={{ fontSize: 11, color: '#9BA3AF', flexShrink: 0 }}>{timeAgo(entry.createdAt)}</span>
                </div>
              ))}
              <button onClick={() => router.push('/feed')} className="mt-2 text-[12px] font-semibold" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#334266', padding: 0 }}>
                View full feed →
              </button>
            </div>
          )}
        </div>
      </div>

      <TabBar active="family" />

      {/* ── Add / Edit Note Sheet ──────────────────────────────────── */}
      {noteSheetOpen && (
        <div className="absolute inset-0 z-50" style={{ background: 'rgba(0,0,0,0.45)' }} onClick={() => setNoteSheetOpen(false)}>
          <div className="absolute bottom-0 left-0 right-0 rounded-t-[24px] overflow-y-auto" style={{ background: '#FBF8F1', maxHeight: '85vh' }} onClick={(e) => e.stopPropagation()}>
            <div className="px-5 pt-5 pb-3 flex items-center justify-between" style={{ borderBottom: '1px solid #E8DFCB' }}>
              <button onClick={() => setNoteSheetOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, color: '#8A7E6B' }}>Cancel</button>
              <h2 style={{ fontSize: 17, fontWeight: 800, color: '#1E1E2E' }}>{editingNote ? 'Edit Note' : 'New Note'}</h2>
              <button onClick={handleSaveNote} disabled={noteSaving || !noteTitle.trim()} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, fontWeight: 700, color: '#334266', opacity: noteSaving || !noteTitle.trim() ? 0.4 : 1 }}>
                {noteSaving ? 'Saving…' : 'Save'}
              </button>
            </div>
            <div className="px-5 py-5 space-y-4">
              <div>
                <label className="text-sm font-medium block mb-2" style={{ color: '#1E1E2E' }}>Title *</label>
                <input
                  type="text" value={noteTitle} onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="Note title…" autoFocus
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                  style={{ borderColor: '#E8DFCB', background: '#fff', color: '#1E1E2E' }}
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2" style={{ color: '#1E1E2E' }}>Content</label>
                <textarea
                  value={noteContent} onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Write something…" rows={4}
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none resize-none"
                  style={{ borderColor: '#E8DFCB', background: '#fff', color: '#1E1E2E' }}
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2" style={{ color: '#1E1E2E' }}>Category</label>
                <div className="flex flex-wrap gap-2">
                  {['General', 'Recipe', 'Reminder', 'Reference', 'Baby'].map((cat) => (
                    <button key={cat} onClick={() => setNoteCategory(cat)}
                      className="px-3 py-1.5 rounded-full text-xs font-bold"
                      style={{ background: noteCategory === cat ? '#334266' : '#F0E5D2', color: noteCategory === cat ? '#fff' : '#8A7E6B', border: 'none', cursor: 'pointer' }}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              {editingNote && (
                <button onClick={() => { deleteNote(editingNote.id); setNoteSheetOpen(false); }}
                  className="w-full py-3 text-sm font-semibold"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C65A3A' }}>
                  Delete note
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── NoteCard ─────────────────────────────────────────────────── */
function NoteCard({
  note, onPin, onEdit, onDelete,
}: {
  note: FamilyNote;
  onPin: (id: string) => void;
  onEdit: (note: FamilyNote) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="rounded-[14px] px-4 py-4 mb-2" style={{ background: '#FBF8F1', border: '1px solid #E8DFCB' }}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p style={{ fontSize: 15, fontWeight: 700, color: '#1E1E2E' }}>{note.title}</p>
          <p style={{ fontSize: 12, color: '#8A7E6B', marginTop: 2 }}>{timeAgo(note.updatedAt)}</p>
          {note.content && (
            <p style={{ fontSize: 13, color: '#6B7280', marginTop: 6, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' } as React.CSSProperties}>
              {note.content}
            </p>
          )}
          {note.category !== 'General' && (
            <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: '#F0E5D2', color: '#334266' }}>{note.category}</span>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={() => onPin(note.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', fontSize: 16, opacity: note.pinned ? 1 : 0.4 }} title={note.pinned ? 'Unpin' : 'Pin'}>
            📌
          </button>
          <button onClick={() => onEdit(note)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8A7E6B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
