'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useHousehold } from '@/src/context/HouseholdContext';
import { TabBar } from '@/src/components/primitives/TabBar';
import { Icon } from '@/src/components/primitives/Icon';
import { createClient } from '@/src/lib/supabase/client';
import { useMemberRecords, TYPE_META, type RecordType } from './hooks/useMemberRecords';
import { useMemberRoutines, ALL_DAYS } from './hooks/useMemberRoutines';
import { useMemberTasks } from './hooks/useMemberTasks';

type ProfileTab = 'records' | 'routines' | 'notes' | 'tasks';

const RECORD_TYPES: RecordType[] = ['milestone', 'health', 'allergy', 'appointment', 'note'];

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
  { value: 'adult',     label: 'Adult' },
  { value: 'caregiver', label: 'Caregiver' },
  { value: 'child',     label: 'Child' },
];

export function MemberProfileScreen({ memberId }: { memberId: string }) {
  const { members, refetch } = useHousehold();
  const router = useRouter();
  const member = members.find((m) => m.id === memberId);
  const { records, addRecord, deleteRecord } = useMemberRecords(memberId);
  const { routines, addRoutine, toggleDone, deleteRoutine } = useMemberRoutines(memberId);
  const { tasks, addTask, toggleTask, deleteTask } = useMemberTasks(memberId);

  const [tab,            setTab]           = useState<ProfileTab>('records');
  const [showAddRecord,  setShowAddRecord] = useState(false);
  const [showAddRoutine, setShowAddRoutine]= useState(false);
  const [filterType,     setFilterType]   = useState<RecordType | 'all'>('all');
  const [showEdit,       setShowEdit]     = useState(false);
  const [confirmDelete,  setConfirmDelete]= useState(false);

  /* edit form state */
  const [editName,   setEditName]   = useState('');
  const [editRole,   setEditRole]   = useState('');
  const [editAccess, setEditAccess] = useState('adult');
  const [editPreset, setEditPreset] = useState(0);
  const [editSaving, setEditSaving] = useState(false);
  const [editError,  setEditError]  = useState('');

  /* photo upload */
  const [uploading,  setUploading]  = useState(false);
  const photoRef = useRef<HTMLInputElement>(null);

  /* add-record form */
  const [recType,    setRecType]    = useState<RecordType>('milestone');
  const [recTitle,   setRecTitle]   = useState('');
  const [recContent, setRecContent] = useState('');
  const [recDate,    setRecDate]    = useState('');

  /* add-routine form */
  const [rotTitle, setRotTitle] = useState('');
  const [rotTime,  setRotTime]  = useState('');
  const [rotDays,  setRotDays]  = useState<string[]>([]);

  /* add-task form */
  const [showAddTask, setShowAddTask] = useState(false);
  const [taskTitle,   setTaskTitle]   = useState('');
  const [taskDue,     setTaskDue]     = useState('');

  if (!member) return null;

  const isKid = member.access_level === 'child';

  const filteredRecords = filterType === 'all' ? records : records.filter((r) => r.type === filterType);

  const openEdit = () => {
    setEditName(member.name);
    setEditRole(member.role ?? '');
    setEditAccess(member.access_level);
    const pi = PRESETS.findIndex((p) => p.color === member.color);
    setEditPreset(pi >= 0 ? pi : 0);
    setEditError('');
    setShowEdit(true);
  };

  const handleSaveEdit = async () => {
    if (!editName.trim()) { setEditError('Name is required'); return; }
    setEditSaving(true); setEditError('');
    const p = PRESETS[editPreset];
    const supabase = createClient();
    const { error } = await supabase.from('household_members').update({
      name:         editName.trim(),
      role:         editRole.trim() || editAccess,
      access_level: editAccess,
      emoji:        p.emoji,
      color:        p.color,
      soft_color:   p.soft,
    }).eq('id', memberId);
    if (error) { setEditError('Could not save. Try again.'); setEditSaving(false); return; }
    await refetch();
    setShowEdit(false);
    setEditSaving(false);
  };

  const handleDelete = async () => {
    const supabase = createClient();
    await supabase.from('household_members').delete().eq('id', memberId);
    await refetch();
    router.back();
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const supabase = createClient();
    const path = `${memberId}/${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
    const { error: upErr } = await supabase.storage.from('member-photos').upload(path, file, { upsert: true });
    if (upErr) { setUploading(false); return; }
    // Store the storage path (not a URL) — signed URL is generated in HouseholdContext on load
    await supabase.from('household_members').update({ photo_url: path }).eq('id', memberId);
    await refetch();
    setUploading(false);
  };

  const handleSaveRecord = async () => {
    if (!recTitle.trim()) return;
    await addRecord({ type: recType, title: recTitle.trim(), content: recContent.trim(), recordDate: recDate || null });
    setRecTitle(''); setRecContent(''); setRecDate(''); setRecType('milestone');
    setShowAddRecord(false);
  };

  const handleSaveRoutine = async () => {
    if (!rotTitle.trim()) return;
    await addRoutine({ title: rotTitle.trim(), timeLabel: rotTime.trim(), days: rotDays });
    setRotTitle(''); setRotTime(''); setRotDays([]);
    setShowAddRoutine(false);
  };

  return (
    <div className="bg-bg h-full font-sans text-ink relative overflow-hidden flex flex-col">
      <div className="h-full overflow-y-auto" style={{ paddingBottom: 110 }}>

        {/* Header */}
        <div className="px-5 pt-12 pb-5 flex items-center gap-3" style={{ borderBottom: '1px solid #E8DFCB' }}>
          <button onClick={() => router.back()} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: '#F0E5D2', border: 'none', cursor: 'pointer' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#334266" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>

          {/* Avatar + photo upload */}
          <div className="relative flex-shrink-0">
            {member.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={member.photoUrl} alt={member.name} className="w-14 h-14 rounded-full object-cover" />
            ) : (
              <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: member.softColor, fontSize: 28 }}>
                {member.emoji}
              </div>
            )}
            <button
              onClick={() => photoRef.current?.click()}
              disabled={uploading}
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
              style={{ background: '#334266', border: '2px solid #FBF8F1', cursor: 'pointer' }}
            >
              {uploading ? <span style={{ fontSize: 8, color: '#fff' }}>…</span> : <Icon name="camera" size={11} color="#fff" />}
            </button>
            <input ref={photoRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoUpload} />
          </div>

          <div className="flex-1">
            <h1 style={{ fontSize: 20, fontWeight: 800, color: '#334266' }}>{member.name}</h1>
            <div className="flex items-center gap-2">
              <span
                className="px-2 py-0.5 rounded-full text-[11px] font-bold"
                style={{ background: isKid ? '#F4E4C7' : '#DCE0EB', color: isKid ? '#8B5E17' : '#334266' }}
              >
                {isKid ? '👧 Kid' : member.access_level === 'caregiver' ? '🧑 Caregiver' : '👤 Adult'}
              </span>
              {member.role && <span style={{ fontSize: 12, color: '#8A7E6B' }}>{member.role}</span>}
            </div>
          </div>

          {/* Edit button */}
          <button onClick={openEdit} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: '#F0E5D2', border: 'none', cursor: 'pointer' }}>
            <Icon name="edit" size={15} color="#334266" />
          </button>
        </div>

        {/* Tab strip */}
        <div className="flex px-5 pt-4 gap-2 overflow-x-auto scrollbar-none">
          {(['records', 'routines', 'notes', 'tasks'] as ProfileTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-4 py-2 rounded-full text-sm font-bold transition-colors"
              style={{ background: tab === t ? '#334266' : '#F0E5D2', color: tab === t ? '#fff' : '#8A7E6B', border: 'none', cursor: 'pointer' }}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* ─── Records tab ─────────────────────────────────── */}
        {tab === 'records' && (
          <div className="px-5 mt-4">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
              {(['all', ...RECORD_TYPES] as (RecordType | 'all')[]).map((t) => {
                const meta = t === 'all' ? null : TYPE_META[t];
                return (
                  <button key={t} onClick={() => setFilterType(t)} className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-colors"
                    style={{ background: filterType === t ? '#334266' : '#F0E5D2', color: filterType === t ? '#fff' : '#8A7E6B', border: 'none', cursor: 'pointer' }}>
                    {meta ? `${meta.emoji} ${meta.label}` : 'All'}
                  </button>
                );
              })}
            </div>
            <button onClick={() => setShowAddRecord(true)} className="w-full mt-3 py-3 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm"
              style={{ background: '#DCE0EB', color: '#334266', border: 'none', cursor: 'pointer' }}>
              <Icon name="plus" size={16} color="#334266" /> Add record
            </button>
            {filteredRecords.length === 0 ? (
              <div className="text-center py-12">
                <p style={{ fontSize: 32 }}>📋</p>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#8A7E6B', marginTop: 8 }}>No records yet</p>
              </div>
            ) : (
              <div className="mt-3 flex flex-col gap-2.5">
                {filteredRecords.map((rec) => {
                  const meta = TYPE_META[rec.type];
                  return (
                    <div key={rec.id} className="rounded-[14px] px-4 py-4" style={{ background: '#FBF8F1', border: '1px solid #E8DFCB' }}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2 flex-1">
                          <span style={{ fontSize: 18, flexShrink: 0 }}>{meta.emoji}</span>
                          <div className="flex-1">
                            <p style={{ fontSize: 15, fontWeight: 700, color: '#1E1E2E' }}>{rec.title}</p>
                            {rec.content && <p style={{ fontSize: 13, color: '#6B7280', marginTop: 3 }}>{rec.content}</p>}
                            {rec.recordDate && <p style={{ fontSize: 11, color: '#8A7E6B', marginTop: 4 }}>📅 {new Date(rec.recordDate).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}</p>}
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold flex-shrink-0" style={{ background: `${meta.color}22`, color: meta.color }}>{meta.label}</span>
                      </div>
                      <button onClick={() => deleteRecord(rec.id)} className="mt-3 text-xs font-medium" style={{ color: '#C65A3A', background: 'none', border: 'none', cursor: 'pointer' }}>
                        Remove
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ─── Routines tab ────────────────────────────────── */}
        {tab === 'routines' && (
          <div className="px-5 mt-4">
            <button onClick={() => setShowAddRoutine(true)} className="w-full py-3 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm"
              style={{ background: '#DCE0EB', color: '#334266', border: 'none', cursor: 'pointer' }}>
              <Icon name="plus" size={16} color="#334266" /> Add routine step
            </button>
            {routines.length === 0 ? (
              <div className="text-center py-12">
                <p style={{ fontSize: 32 }}>⏰</p>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#8A7E6B', marginTop: 8 }}>No routines yet</p>
              </div>
            ) : (
              <div className="mt-3 flex flex-col gap-2">
                {routines.map((r) => (
                  <div key={r.id} className="rounded-[14px] px-4 py-3.5 flex items-center gap-3" style={{ background: '#FBF8F1', border: '1px solid #E8DFCB' }}>
                    <button onClick={() => toggleDone(r.id)} className="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                      style={{ borderColor: r.doneToday ? '#2D6A4F' : '#E8DFCB', background: r.doneToday ? '#2D6A4F' : 'transparent', cursor: 'pointer' }}>
                      {r.doneToday && <Icon name="check" size={12} color="#fff" stroke={2.5} />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p style={{ fontSize: 15, fontWeight: 600, color: r.doneToday ? '#9BA3AF' : '#1E1E2E', textDecoration: r.doneToday ? 'line-through' : 'none' }}>{r.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {r.timeLabel && <span style={{ fontSize: 11, color: '#8A7E6B' }}>⏰ {r.timeLabel}</span>}
                        {r.days.length > 0 && <span style={{ fontSize: 11, color: '#8A7E6B' }}>{r.days.join(', ')}</span>}
                      </div>
                    </div>
                    <button onClick={() => deleteRoutine(r.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                      <Icon name="trash" size={15} color="#C65A3A" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── Notes tab ───────────────────────────────────── */}
        {tab === 'notes' && (
          <div className="px-5 mt-4">
            <button onClick={() => { setRecType('note'); setShowAddRecord(true); }} className="w-full py-3 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm mb-3"
              style={{ background: '#DCE0EB', color: '#334266', border: 'none', cursor: 'pointer' }}>
              <Icon name="plus" size={16} color="#334266" /> Add note or appointment
            </button>
            {records.filter((r) => r.type === 'note' || r.type === 'appointment').length === 0 ? (
              <div className="text-center py-12">
                <p style={{ fontSize: 32 }}>📝</p>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#8A7E6B', marginTop: 8 }}>No notes yet</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {records.filter((r) => r.type === 'note' || r.type === 'appointment').map((rec) => {
                  const meta = TYPE_META[rec.type];
                  return (
                    <div key={rec.id} className="rounded-[14px] px-4 py-4" style={{ background: '#FBF8F1', border: '1px solid #E8DFCB' }}>
                      <p style={{ fontSize: 15, fontWeight: 700, color: '#1E1E2E' }}>{meta.emoji} {rec.title}</p>
                      {rec.content && <p style={{ fontSize: 13, color: '#6B7280', marginTop: 3 }}>{rec.content}</p>}
                      {rec.recordDate && <p style={{ fontSize: 11, color: '#8A7E6B', marginTop: 4 }}>📅 {rec.recordDate}</p>}
                      <button onClick={() => deleteRecord(rec.id)} className="mt-3 text-xs font-medium" style={{ color: '#C65A3A', background: 'none', border: 'none', cursor: 'pointer' }}>Remove</button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ─── Tasks tab ───────────────────────────────────── */}
        {tab === 'tasks' && (
          <div className="px-5 mt-4">
            <button onClick={() => setShowAddTask(true)} className="w-full py-3 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm mb-3"
              style={{ background: '#DCE0EB', color: '#334266', border: 'none', cursor: 'pointer' }}>
              <Icon name="plus" size={16} color="#334266" /> Add task
            </button>
            {tasks.length === 0 ? (
              <div className="text-center py-12">
                <p style={{ fontSize: 32 }}>📋</p>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#8A7E6B', marginTop: 8 }}>No tasks yet</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {tasks.map((task) => (
                  <div key={task.id} className="rounded-[14px] px-4 py-3.5 flex items-center gap-3" style={{ background: '#FBF8F1', border: '1px solid #E8DFCB' }}>
                    <button onClick={() => toggleTask(task.id)}
                      className="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                      style={{ borderColor: task.completed ? '#2D6A4F' : '#E8DFCB', background: task.completed ? '#2D6A4F' : 'transparent', cursor: 'pointer' }}>
                      {task.completed && <Icon name="check" size={12} color="#fff" stroke={2.5} />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p style={{ fontSize: 15, fontWeight: 600, color: task.completed ? '#9BA3AF' : '#1E1E2E', textDecoration: task.completed ? 'line-through' : 'none' }}>{task.title}</p>
                      {task.dueDate && <p style={{ fontSize: 11, color: '#8A7E6B', marginTop: 2 }}>📅 Due {new Date(task.dueDate + 'T12:00:00').toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}</p>}
                    </div>
                    <button onClick={() => deleteTask(task.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                      <Icon name="trash" size={15} color="#C65A3A" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Delete member button */}
        <div className="px-5 mt-8 mb-4">
          {confirmDelete ? (
            <div className="flex flex-col gap-2">
              <p style={{ fontSize: 13, color: '#C65A3A', fontWeight: 600, textAlign: 'center' }}>Remove {member.name} from the household?</p>
              <button onClick={handleDelete} className="w-full py-3 rounded-xl text-sm font-bold text-white" style={{ background: '#C65A3A', border: 'none', cursor: 'pointer' }}>
                Yes, remove member
              </button>
              <button onClick={() => setConfirmDelete(false)} className="w-full py-3 rounded-xl text-sm font-bold" style={{ background: '#F0E5D2', color: '#334266', border: 'none', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          ) : (
            <button onClick={() => setConfirmDelete(true)} className="w-full py-3 text-sm font-semibold" style={{ color: '#C65A3A', background: 'none', border: 'none', cursor: 'pointer' }}>
              Remove from household
            </button>
          )}
        </div>
      </div>

      {/* ── Edit member sheet ──────────────────────────────────── */}
      {showEdit && (
        <div className="absolute inset-0 z-50" style={{ background: 'rgba(0,0,0,0.45)' }} onClick={() => setShowEdit(false)}>
          <div className="absolute bottom-0 left-0 right-0 rounded-t-[24px]" style={{ background: '#FBF8F1', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div className="px-5 pt-5 pb-3 flex items-center justify-between" style={{ borderBottom: '1px solid #E8DFCB' }}>
              <button onClick={() => setShowEdit(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8A7E6B', fontSize: 15 }}>Cancel</button>
              <h2 style={{ fontSize: 17, fontWeight: 800, color: '#1E1E2E' }}>Edit member</h2>
              <button onClick={handleSaveEdit} disabled={editSaving} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#334266', fontSize: 15, fontWeight: 700, opacity: editSaving ? 0.5 : 1 }}>
                {editSaving ? 'Saving…' : 'Save'}
              </button>
            </div>
            <div className="px-5 py-5 space-y-4">
              <div>
                <label className="text-sm font-medium block mb-2" style={{ color: '#1E1E2E' }}>Name *</label>
                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                  style={{ borderColor: '#E8DFCB', color: '#1E1E2E', background: '#fff' }} />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2" style={{ color: '#1E1E2E' }}>Role (optional)</label>
                <input type="text" value={editRole} onChange={(e) => setEditRole(e.target.value)}
                  placeholder="e.g. Mom, Nanny, Kid · 8 yrs"
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                  style={{ borderColor: '#E8DFCB', color: '#1E1E2E', background: '#fff' }} />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2" style={{ color: '#1E1E2E' }}>Access level</label>
                <div className="flex gap-2">
                  {ACCESS_LEVELS.map((al) => (
                    <button key={al.value} onClick={() => setEditAccess(al.value)}
                      className="px-4 py-2 rounded-xl text-sm font-bold"
                      style={{ background: editAccess === al.value ? '#334266' : '#F0E5D2', color: editAccess === al.value ? '#fff' : '#8A7E6B', border: 'none', cursor: 'pointer' }}>
                      {al.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-3" style={{ color: '#1E1E2E' }}>Color &amp; emoji</label>
                <div className="flex flex-wrap gap-3">
                  {PRESETS.map((p, i) => (
                    <button key={i} onClick={() => setEditPreset(i)}
                      style={{ width: 44, height: 44, borderRadius: '50%', background: p.soft, border: i === editPreset ? `3px solid ${p.color}` : '3px solid transparent', fontSize: 20, cursor: 'pointer', transform: i === editPreset ? 'scale(1.15)' : 'scale(1)', transition: 'transform 150ms' }}>
                      {p.emoji}
                    </button>
                  ))}
                </div>
              </div>
              {editError && <p className="text-red-500 text-sm">{editError}</p>}
            </div>
          </div>
        </div>
      )}

      {/* ── Add record sheet ──────────────────────────────────────── */}
      {showAddRecord && (
        <div className="absolute inset-0 z-50" style={{ background: 'rgba(0,0,0,0.45)' }} onClick={() => setShowAddRecord(false)}>
          <div className="absolute bottom-0 left-0 right-0 rounded-t-[24px] overflow-y-auto" style={{ background: '#FBF8F1', maxHeight: '90vh' }} onClick={(e) => e.stopPropagation()}>
            <div className="px-5 pt-5 pb-3 flex items-center justify-between" style={{ borderBottom: '1px solid #E8DFCB' }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1E1E2E' }}>Add record</h2>
              <button onClick={() => setShowAddRecord(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8A7E6B' }}>Cancel</button>
            </div>
            <div className="px-5 py-5 space-y-4">
              <div>
                <label className="text-sm font-medium block mb-2" style={{ color: '#1E1E2E' }}>Type</label>
                <div className="flex flex-wrap gap-2">
                  {RECORD_TYPES.map((t) => {
                    const m = TYPE_META[t];
                    return (
                      <button key={t} onClick={() => setRecType(t)} className="px-3 py-1.5 rounded-full text-xs font-bold"
                        style={{ background: recType === t ? '#334266' : '#F0E5D2', color: recType === t ? '#fff' : '#8A7E6B', border: 'none', cursor: 'pointer' }}>
                        {m.emoji} {m.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-2" style={{ color: '#1E1E2E' }}>Title *</label>
                <input type="text" value={recTitle} onChange={(e) => setRecTitle(e.target.value)}
                  placeholder={recType === 'milestone' ? 'e.g. First tooth!' : recType === 'allergy' ? 'e.g. Allergic to peanuts' : 'Title'}
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none" style={{ borderColor: '#E8DFCB', background: '#fff' }} />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2" style={{ color: '#1E1E2E' }}>Details (optional)</label>
                <textarea value={recContent} onChange={(e) => setRecContent(e.target.value)} placeholder="Additional notes..." rows={3}
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none resize-none" style={{ borderColor: '#E8DFCB', background: '#fff' }} />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2" style={{ color: '#1E1E2E' }}>Date (optional)</label>
                <input type="date" value={recDate} onChange={(e) => setRecDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none" style={{ borderColor: '#E8DFCB', background: '#fff' }} />
              </div>
              <button onClick={handleSaveRecord} className="w-full py-3.5 rounded-xl font-semibold text-white text-sm"
                style={{ background: '#334266', border: 'none', cursor: 'pointer' }}>
                Save record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add routine sheet ─────────────────────────────────────── */}
      {showAddRoutine && (
        <div className="absolute inset-0 z-50" style={{ background: 'rgba(0,0,0,0.45)' }} onClick={() => setShowAddRoutine(false)}>
          <div className="absolute bottom-0 left-0 right-0 rounded-t-[24px] overflow-y-auto" style={{ background: '#FBF8F1', maxHeight: '80vh' }} onClick={(e) => e.stopPropagation()}>
            <div className="px-5 pt-5 pb-3 flex items-center justify-between" style={{ borderBottom: '1px solid #E8DFCB' }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1E1E2E' }}>Add routine step</h2>
              <button onClick={() => setShowAddRoutine(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8A7E6B' }}>Cancel</button>
            </div>
            <div className="px-5 py-5 space-y-4">
              <div>
                <label className="text-sm font-medium block mb-2" style={{ color: '#1E1E2E' }}>Step title *</label>
                <input type="text" value={rotTitle} onChange={(e) => setRotTitle(e.target.value)}
                  placeholder="e.g. Brush teeth, Take vitamins"
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none" style={{ borderColor: '#E8DFCB', background: '#fff' }} />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2" style={{ color: '#1E1E2E' }}>Time (optional)</label>
                <input type="text" value={rotTime} onChange={(e) => setRotTime(e.target.value)}
                  placeholder="e.g. 7:00 AM, After school"
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none" style={{ borderColor: '#E8DFCB', background: '#fff' }} />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2" style={{ color: '#1E1E2E' }}>Days</label>
                <div className="flex gap-2 flex-wrap">
                  {ALL_DAYS.map((d) => (
                    <button key={d} onClick={() => setRotDays((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d])}
                      className="px-3 py-1.5 rounded-full text-xs font-bold"
                      style={{ background: rotDays.includes(d) ? '#334266' : '#F0E5D2', color: rotDays.includes(d) ? '#fff' : '#8A7E6B', border: 'none', cursor: 'pointer' }}>
                      {d}
                    </button>
                  ))}
                </div>
                <button onClick={() => setRotDays(ALL_DAYS)} className="mt-2 text-xs font-medium" style={{ color: '#4C8A8B', background: 'none', border: 'none', cursor: 'pointer' }}>
                  Select every day
                </button>
              </div>
              <button onClick={handleSaveRoutine} className="w-full py-3.5 rounded-xl font-semibold text-white text-sm"
                style={{ background: '#334266', border: 'none', cursor: 'pointer' }}>
                Save routine step
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add task sheet ────────────────────────────────────── */}
      {showAddTask && (
        <div className="absolute inset-0 z-50" style={{ background: 'rgba(0,0,0,0.45)' }} onClick={() => setShowAddTask(false)}>
          <div className="absolute bottom-0 left-0 right-0 rounded-t-[24px]" style={{ background: '#FBF8F1', maxHeight: '60vh' }} onClick={(e) => e.stopPropagation()}>
            <div className="px-5 pt-5 pb-3 flex items-center justify-between" style={{ borderBottom: '1px solid #E8DFCB' }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1E1E2E' }}>Add task</h2>
              <button onClick={() => setShowAddTask(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8A7E6B' }}>Cancel</button>
            </div>
            <div className="px-5 py-5 space-y-4">
              <div>
                <label className="text-sm font-medium block mb-2" style={{ color: '#1E1E2E' }}>Task *</label>
                <input type="text" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g. Pick up prescription"
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none" style={{ borderColor: '#E8DFCB', background: '#fff' }} />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2" style={{ color: '#1E1E2E' }}>Due date (optional)</label>
                <input type="date" value={taskDue} onChange={(e) => setTaskDue(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none" style={{ borderColor: '#E8DFCB', background: '#fff' }} />
              </div>
              <button
                onClick={async () => {
                  if (!taskTitle.trim()) return;
                  await addTask(taskTitle.trim(), taskDue || undefined);
                  setTaskTitle(''); setTaskDue(''); setShowAddTask(false);
                }}
                className="w-full py-3.5 rounded-xl font-semibold text-white text-sm"
                style={{ background: '#334266', border: 'none', cursor: 'pointer' }}>
                Save task
              </button>
            </div>
          </div>
        </div>
      )}

      <TabBar active="family" />
    </div>
  );
}
