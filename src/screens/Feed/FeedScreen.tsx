'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useHousehold } from '@/src/context/HouseholdContext';
import { createClient } from '@/src/lib/supabase/client';
import { TabBar } from '@/src/components/primitives/TabBar';
import { Avatar } from '@/src/components/primitives/Avatar';
import { Icon } from '@/src/components/primitives/Icon';

interface FeedItem {
  id: string;
  actorId: string | null;
  action: string;
  entityType: string;
  description: string;
  createdAt: string;
}

const ENTITY_EMOJI: Record<string, string> = {
  bill:          '💸',
  chore:         '✅',
  event:         '📅',
  shopping_item: '🛒',
  goal:          '🎯',
  member:        '👤',
  fuel_log:      '⛽',
};

const ACTION_COLOR: Record<string, string> = {
  created:   '#2D6A4F',
  updated:   '#334266',
  deleted:   '#C65A3A',
  completed: '#DBA03A',
};

const FILTER_OPTIONS = [
  { key: 'all',           label: 'All'      },
  { key: 'bill',          label: 'Bills'    },
  { key: 'chore',         label: 'Chores'   },
  { key: 'event',         label: 'Events'   },
  { key: 'shopping_item', label: 'Shopping' },
  { key: 'member',        label: 'Members'  },
];

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60_000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function FeedScreen() {
  const { householdId, householdName } = useHousehold();
  const router = useRouter();
  const [items,  setItems]  = useState<FeedItem[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading,setLoading]= useState(true);

  const load = useCallback(async () => {
    if (!householdId) { setItems([]); setLoading(false); return; }
    const supabase = createClient();
    const { data } = await supabase
      .from('activity_log')
      .select('*')
      .eq('household_id', householdId)
      .order('created_at', { ascending: false })
      .limit(100);
    setItems(
      (data || []).map((r) => ({
        id:          r.id,
        actorId:     r.actor_id,
        action:      r.action,
        entityType:  r.entity_type,
        description: r.description,
        createdAt:   r.created_at,
      }))
    );
    setLoading(false);
  }, [householdId]);

  useEffect(() => { load(); }, [load]);

  // Real-time subscription
  useEffect(() => {
    if (!householdId) return;
    const supabase = createClient();
    const ch = supabase
      .channel('feed')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activity_log', filter: `household_id=eq.${householdId}` }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [householdId, load]);

  const visible = filter === 'all' ? items : items.filter((i) => i.entityType === filter);

  return (
    <div className="bg-bg h-full font-sans text-ink relative overflow-hidden flex flex-col">
      <div className="h-full overflow-y-auto" style={{ paddingBottom: 110 }}>

        {/* Header */}
        <div className="px-5 pt-14 pb-4" style={{ borderBottom: '1px solid #E8DFCB' }}>
          <div className="flex items-center gap-3 mb-1">
            <button onClick={() => router.back()} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: '#F0E5D2', border: 'none', cursor: 'pointer' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#334266" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: '#334266' }}>Family Feed</h1>
              <p style={{ fontSize: 12, color: '#8A7E6B' }}>{householdName}</p>
            </div>
          </div>

          {/* Filter chips */}
          <div className="flex gap-2 overflow-x-auto scrollbar-none mt-3">
            {FILTER_OPTIONS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold"
                style={{ background: filter === f.key ? '#334266' : '#F0E5D2', color: filter === f.key ? '#fff' : '#8A7E6B', border: 'none', cursor: 'pointer' }}
              >
                {f.key !== 'all' && ENTITY_EMOJI[f.key]} {f.label}
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <div className="px-5 mt-5 flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-[14px] animate-pulse" style={{ background: '#E8DFCB' }} />
            ))}
          </div>
        )}

        {!loading && visible.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
            <p style={{ fontSize: 40 }}>📋</p>
            <p style={{ fontSize: 17, fontWeight: 700, color: '#334266', marginTop: 12 }}>No activity yet</p>
            <p style={{ fontSize: 13, color: '#8A7E6B', marginTop: 6 }}>
              When anyone in your household adds bills, completes chores, or makes changes, it will appear here.
            </p>
          </div>
        )}

        {!loading && visible.length > 0 && (
          <div className="px-5 mt-4 flex flex-col gap-2">
            {visible.map((item) => (
              <div key={item.id} className="rounded-[14px] px-4 py-3.5 flex items-start gap-3" style={{ background: '#FBF8F1', border: '1px solid #E8DFCB' }}>
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0 mt-0.5"
                  style={{ background: '#F0E5D2' }}
                >
                  {ENTITY_EMOJI[item.entityType] ?? '📌'}
                </div>
                <div className="flex-1 min-w-0">
                  <p style={{ fontSize: 14, color: '#1E1E2E', lineHeight: 1.4 }}>{item.description}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    {item.actorId && <Avatar member={item.actorId} size={18} />}
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: `${ACTION_COLOR[item.action] ?? '#8A7E6B'}22`, color: ACTION_COLOR[item.action] ?? '#8A7E6B' }}
                    >
                      {item.action}
                    </span>
                    <span style={{ fontSize: 11, color: '#9BA3AF' }}>{timeAgo(item.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <TabBar active="family" />
    </div>
  );
}
