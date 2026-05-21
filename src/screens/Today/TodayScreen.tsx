'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TabBar } from '@/src/components/primitives/TabBar';
import { Icon } from '@/src/components/primitives/Icon';
import { GreetingHeader } from './components/GreetingHeader';
import { FamilySummaryBanner } from './components/FamilySummaryBanner';
import { EventRow } from './components/EventRow';
import { ChoreCard } from './components/ChoreCard';
import { TodayEmpty } from './components/TodayEmpty';
import { TodaySkeleton } from './components/TodaySkeleton';
import { useTodaySummary } from './hooks/useTodaySummary';
import { useHousehold } from '@/src/context/HouseholdContext';
import { createClient } from '@/src/lib/supabase/client';

/* ── Widget types ─────────────────────────────────────────────── */
const WIDGET_DEFS = [
  { id: 'shopping', label: 'Shopping',  emoji: '🛒', color: '#F0E5D2', textColor: '#334266' },
  { id: 'fuel',     label: 'Fuel',      emoji: '⛽', color: '#DDEAEB', textColor: '#2D6A4F' },
  { id: 'bills',    label: 'Bills',     emoji: '💸', color: '#FFF8EC', textColor: '#DBA03A' },
  { id: 'routines', label: 'Routines',  emoji: '⏰', color: '#DCE0EB', textColor: '#334266' },
  { id: 'savings',  label: 'Savings',   emoji: '🐷', color: '#D8F0E4', textColor: '#2D6A4F' },
  { id: 'kids',     label: 'Kids',      emoji: '👶', color: '#F2D9CF', textColor: '#C65A3A' },
] as const;

type WidgetId = typeof WIDGET_DEFS[number]['id'];

const DEFAULT_WIDGETS: Record<WidgetId, boolean> = {
  shopping: true, fuel: true, bills: true, routines: true, savings: true, kids: true,
};
const DEFAULT_ORDER: WidgetId[] = WIDGET_DEFS.map((w) => w.id);
const DEFAULT_SECTIONS = { summary: true, feed: true };

function loadWidgetPrefs(): Record<WidgetId, boolean> {
  if (typeof window === 'undefined') return DEFAULT_WIDGETS;
  try {
    const stored = localStorage.getItem('nest-hq-widgets');
    return stored ? { ...DEFAULT_WIDGETS, ...JSON.parse(stored) } : DEFAULT_WIDGETS;
  } catch { return DEFAULT_WIDGETS; }
}
function saveWidgetPrefs(prefs: Record<WidgetId, boolean>) {
  localStorage.setItem('nest-hq-widgets', JSON.stringify(prefs));
}
function loadWidgetOrder(): WidgetId[] {
  if (typeof window === 'undefined') return DEFAULT_ORDER;
  try {
    const stored = localStorage.getItem('nest-hq-widget-order');
    if (!stored) return DEFAULT_ORDER;
    const arr = JSON.parse(stored) as WidgetId[];
    const allIds = new Set(DEFAULT_ORDER);
    const valid = arr.filter((id) => allIds.has(id));
    const missing = DEFAULT_ORDER.filter((id) => !valid.includes(id));
    return [...valid, ...missing];
  } catch { return DEFAULT_ORDER; }
}
function saveWidgetOrder(order: WidgetId[]) {
  localStorage.setItem('nest-hq-widget-order', JSON.stringify(order));
}
function loadSectionPrefs(): { summary: boolean; feed: boolean } {
  if (typeof window === 'undefined') return DEFAULT_SECTIONS;
  try {
    const stored = localStorage.getItem('nest-hq-sections');
    return stored ? { ...DEFAULT_SECTIONS, ...JSON.parse(stored) } : DEFAULT_SECTIONS;
  } catch { return DEFAULT_SECTIONS; }
}
function saveSectionPrefs(prefs: { summary: boolean; feed: boolean }) {
  localStorage.setItem('nest-hq-sections', JSON.stringify(prefs));
}

/* ── Widget data ──────────────────────────────────────────────── */
interface WidgetData {
  shoppingCount: number;
  fuelThisMonth: number;
  billCount: number;
  billTotal: number;
  routineCount: number;
  savingsTotal: number;
  kidsCount: number;
}

interface FeedEntry { id: string; description: string; entityType: string; createdAt: string; }

const ENTITY_EMOJI: Record<string, string> = {
  bill: '💸', chore: '✅', event: '📅', shopping_item: '🛒', goal: '🎯', member: '👤', fuel_log: '⛽',
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

/* ── Main screen ──────────────────────────────────────────────── */
export function TodayScreen() {
  const { status, data, refreshing, refresh } = useTodaySummary();
  const { householdId, members, formatMoney } = useHousehold();
  const router = useRouter();

  const [widgetPrefs,    setWidgetPrefs]    = useState<Record<WidgetId, boolean>>(DEFAULT_WIDGETS);
  const [widgetOrder,    setWidgetOrder]    = useState<WidgetId[]>(DEFAULT_ORDER);
  const [sectionPrefs,   setSectionPrefs]   = useState(DEFAULT_SECTIONS);
  const [editingWidgets, setEditingWidgets] = useState(false);
  const [widgetData, setWidgetData] = useState<WidgetData>({ shoppingCount: 0, fuelThisMonth: 0, billCount: 0, billTotal: 0, routineCount: 0, savingsTotal: 0, kidsCount: 0 });
  const [feed, setFeed] = useState<FeedEntry[]>([]);
  const [feedLoading, setFeedLoading] = useState(true);

  useEffect(() => {
    setWidgetPrefs(loadWidgetPrefs());
    setWidgetOrder(loadWidgetOrder());
    setSectionPrefs(loadSectionPrefs());
  }, []);

  const loadWidgets = useCallback(async () => {
    if (!householdId) return;
    const supabase = createClient();
    const now   = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const [shopRes, fuelRes, billRes, routineRes, savingsRes, feedRes] = await Promise.all([
      supabase.from('shopping_items').select('id', { count: 'exact', head: true }).eq('household_id', householdId).eq('done', false),
      supabase.from('fuel_logs').select('total_cost').eq('household_id', householdId).gte('fuel_date', `${month}-01`),
      supabase.from('bills').select('id, amount').eq('household_id', householdId).eq('paid', false),
      supabase.from('member_routines').select('id', { count: 'exact', head: true }).eq('household_id', householdId),
      supabase.from('savings_goals').select('saved_amount').eq('household_id', householdId),
      supabase.from('activity_log').select('id, description, entity_type, created_at').eq('household_id', householdId).order('created_at', { ascending: false }).limit(4),
    ]);

    setWidgetData({
      shoppingCount: shopRes.count ?? 0,
      fuelThisMonth: (fuelRes.data || []).reduce((s, r) => s + (r.total_cost ?? 0), 0),
      billCount:     (billRes.data || []).length,
      billTotal:     (billRes.data || []).reduce((s, r) => s + (r.amount ?? 0), 0),
      routineCount:  routineRes.count ?? 0,
      savingsTotal:  (savingsRes.data || []).reduce((s, r) => s + (r.saved_amount ?? 0), 0),
      kidsCount:     members.filter((m) => m.access_level === 'child').length,
    });

    setFeed((feedRes.data || []).map((r) => ({
      id: r.id, description: r.description, entityType: r.entity_type, createdAt: r.created_at,
    })));
    setFeedLoading(false);
  }, [householdId, members]);

  useEffect(() => { loadWidgets(); }, [loadWidgets]);

  const toggleWidget = (id: WidgetId) => {
    setWidgetPrefs((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      saveWidgetPrefs(next);
      return next;
    });
  };

  const moveWidget = (id: WidgetId, dir: -1 | 1) => {
    setWidgetOrder((prev) => {
      const idx = prev.indexOf(id);
      if (idx < 0) return prev;
      const next = [...prev];
      const swap = idx + dir;
      if (swap < 0 || swap >= next.length) return prev;
      [next[idx], next[swap]] = [next[swap], next[idx]];
      saveWidgetOrder(next);
      return next;
    });
  };

  const toggleSection = (key: 'summary' | 'feed') => {
    setSectionPrefs((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      saveSectionPrefs(next);
      return next;
    });
  };

  const isLoading = status === 'loading';
  const isEmpty   = status === 'empty' || (status === 'ready' && data.events.length === 0 && data.choresDueToday.length === 0);
  const isError   = status === 'error';
  const isReady   = !isLoading && !isError;

  const widgetValue: Record<WidgetId, { value: string; sub: string; href: string }> = {
    shopping: { value: String(widgetData.shoppingCount), sub: 'items to buy',          href: '/shop'    },
    fuel:     { value: formatMoney(widgetData.fuelThisMonth), sub: 'this month',       href: '/bills'   },
    bills:    { value: String(widgetData.billCount),    sub: formatMoney(widgetData.billTotal) + ' due', href: '/bills'   },
    routines: { value: String(widgetData.routineCount), sub: 'total routines',         href: '/family'  },
    savings:  { value: formatMoney(widgetData.savingsTotal), sub: 'saved',            href: '/bills'   },
    kids:     { value: String(widgetData.kidsCount),    sub: 'children',               href: '/family'  },
  };

  return (
    <div className="bg-bg h-full font-sans text-ink relative overflow-hidden flex flex-col">
      <div className="h-full overflow-y-auto" style={{ paddingBottom: 110 }}>

        {isError && (
          <div className="bg-danger text-white px-5 py-3 flex items-center justify-between">
            <span className="text-[14px] font-medium">Something went wrong</span>
            <button onClick={refresh} className="text-[13px] font-bold underline bg-transparent border-none text-white cursor-pointer">Retry</button>
          </div>
        )}

        <GreetingHeader
          date={new Date().toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric' })}
          greeting={data.greeting}
          householdName={data.household.name}
          hasBadge={isReady}
          onBell={() => {}}
        />

        {!isLoading && (
          <FamilySummaryBanner
            familyName={data.household.name}
            summaryLine={isEmpty ? 'Nothing on the agenda 🎉' : `${data.counts.events} events · ${data.counts.chores} chores · ${data.counts.billsDue} bill due`}
            memberIds={data.household.memberIds}
          />
        )}

        {isLoading && <div className="mt-5"><TodaySkeleton /></div>}
        {status === 'empty' && <TodayEmpty />}

        {isReady && data.events.length > 0 && (
          <div className="px-5 mt-4">
            <div className="flex items-center justify-between mb-3">
              <p style={{ fontSize: 11, fontWeight: 700, color: '#8A7E6B', letterSpacing: 0.8, textTransform: 'uppercase' }}>Today</p>
              <button onClick={() => router.push('/calendar')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#DBA03A', fontWeight: 700 }}>See all</button>
            </div>
            <div className="flex flex-col gap-2">
              {data.events.map((ev) => <EventRow key={ev.id} event={ev} />)}
            </div>
          </div>
        )}

        {isReady && data.choresDueToday.length > 0 && (
          <div className="px-5 mt-5">
            <div className="flex items-center justify-between mb-3">
              <p style={{ fontSize: 11, fontWeight: 700, color: '#8A7E6B', letterSpacing: 0.8, textTransform: 'uppercase' }}>Chores due today</p>
              <span style={{ fontSize: 12, color: '#8A7E6B' }}>{data.choresDueToday.length} left</span>
            </div>
            <div className="flex gap-[10px] overflow-x-auto scrollbar-none -mx-5 px-5 pb-1">
              {data.choresDueToday.map((chore) => <ChoreCard key={chore.id} chore={chore} />)}
            </div>
          </div>
        )}

        {/* ── Quick Summary widgets ─────────────────────────────── */}
        {sectionPrefs.summary && (
          <div className="px-5 mt-6">
            <div className="flex items-center justify-between mb-3">
              <p style={{ fontSize: 11, fontWeight: 700, color: '#8A7E6B', letterSpacing: 0.8, textTransform: 'uppercase' }}>Quick Summary</p>
              <button
                onClick={() => setEditingWidgets(true)}
                className="flex items-center gap-1"
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#DBA03A', fontWeight: 700 }}
              >
                <Icon name="edit" size={12} color="#DBA03A" /> Edit
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {widgetOrder.filter((id) => widgetPrefs[id]).map((id) => {
                const w = WIDGET_DEFS.find((x) => x.id === id);
                if (!w) return null;
                const val = widgetValue[w.id];
                return (
                  <button
                    key={w.id}
                    onClick={() => router.push(val.href)}
                    className="rounded-[16px] p-4 text-left"
                    style={{ background: w.color, border: 'none', cursor: 'pointer' }}
                  >
                    <span style={{ fontSize: 24 }}>{w.emoji}</span>
                    <p style={{ fontSize: 22, fontWeight: 900, color: w.textColor, marginTop: 8, lineHeight: 1 }}>{val.value}</p>
                    <p style={{ fontSize: 10, fontWeight: 700, color: w.textColor, opacity: 0.6, letterSpacing: 0.5, textTransform: 'uppercase', marginTop: 3 }}>{w.label}</p>
                    <p style={{ fontSize: 11, color: w.textColor, opacity: 0.5, marginTop: 1 }}>{val.sub}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {!sectionPrefs.summary && (
          <div className="px-5 mt-4">
            <button onClick={() => setEditingWidgets(true)} className="w-full py-2 rounded-xl text-sm font-semibold" style={{ background: '#F0E5D2', color: '#8A7E6B', border: 'none', cursor: 'pointer' }}>
              + Show Quick Summary
            </button>
          </div>
        )}

        {/* ── Family activity feed ──────────────────────────────── */}
        {sectionPrefs.feed && <div className="px-5 mt-6">
          <div className="flex items-center justify-between mb-3">
            <p style={{ fontSize: 11, fontWeight: 700, color: '#8A7E6B', letterSpacing: 0.8, textTransform: 'uppercase' }}>Family Activity</p>
            <button onClick={() => router.push('/feed')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#DBA03A', fontWeight: 700 }}>See all</button>
          </div>
          {feedLoading ? (
            <div className="flex flex-col gap-2">{[1,2].map((i) => <div key={i} className="h-14 rounded-[12px] animate-pulse" style={{ background: '#E8DFCB' }} />)}</div>
          ) : feed.length === 0 ? (
            <div className="rounded-[14px] px-4 py-6 text-center" style={{ background: '#FBF8F1', border: '1px solid #E8DFCB' }}>
              <p style={{ fontSize: 13, color: '#8A7E6B' }}>No activity yet — start adding bills, chores, and events.</p>
            </div>
          ) : (
            <div className="rounded-[16px] overflow-hidden" style={{ background: '#FBF8F1', border: '1px solid #E8DFCB' }}>
              {feed.map((entry, i) => (
                <div key={entry.id} className="px-4 py-3 flex items-center gap-3" style={{ borderTop: i > 0 ? '1px solid #E8DFCB' : 'none' }}>
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{ENTITY_EMOJI[entry.entityType] ?? '📌'}</span>
                  <div className="flex-1 min-w-0">
                    <p style={{ fontSize: 13, color: '#1E1E2E', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.description}</p>
                    <p style={{ fontSize: 11, color: '#9BA3AF', marginTop: 1 }}>{timeAgo(entry.createdAt)}</p>
                  </div>
                </div>
              ))}
              <button onClick={() => router.push('/feed')} className="w-full py-3 text-sm font-semibold" style={{ background: '#F0E5D2', border: 'none', cursor: 'pointer', color: '#334266', borderTop: '1px solid #E8DFCB' }}>
                View full activity feed
              </button>
            </div>
          )}
        </div>}

        {!sectionPrefs.feed && (
          <div className="px-5 mt-4">
            <button onClick={() => setEditingWidgets(true)} className="w-full py-2 rounded-xl text-sm font-semibold" style={{ background: '#F0E5D2', color: '#8A7E6B', border: 'none', cursor: 'pointer' }}>
              + Show Family Activity
            </button>
          </div>
        )}

        {/* Refresh */}
        <div className="flex justify-center px-5 mt-4 mb-2">
          <button onClick={refresh} disabled={refreshing} className="flex items-center gap-1.5 text-[12px] text-muted font-medium bg-transparent border-none cursor-pointer p-0">
            <Icon name="sync" size={13} color={refreshing ? '#DBA03A' : '#8A7E6B'} />
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </div>

      <TabBar active="today" />

      {/* Customize sheet */}
      {editingWidgets && (
        <div className="absolute inset-0 z-50" style={{ background: 'rgba(0,0,0,0.45)' }} onClick={() => setEditingWidgets(false)}>
          <div className="absolute bottom-0 left-0 right-0 rounded-t-[24px] overflow-y-auto" style={{ background: '#FBF8F1', maxHeight: '85vh' }} onClick={(e) => e.stopPropagation()}>
            <div className="px-5 pt-5 pb-3 flex items-center justify-between" style={{ borderBottom: '1px solid #E8DFCB' }}>
              <h2 style={{ fontSize: 17, fontWeight: 800, color: '#1E1E2E' }}>Customize Today</h2>
              <button onClick={() => setEditingWidgets(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, color: '#334266', fontWeight: 700 }}>Done</button>
            </div>

            {/* Sections */}
            <div className="px-5 pt-4 pb-2">
              <p style={{ fontSize: 11, fontWeight: 700, color: '#8A7E6B', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8 }}>Sections</p>
              {[
                { key: 'summary' as const, label: 'Quick Summary', emoji: '📊' },
                { key: 'feed'    as const, label: 'Family Activity', emoji: '📋' },
              ].map((s) => (
                <div key={s.key} className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid #F0EAE0' }}>
                  <div className="flex items-center gap-3">
                    <span style={{ fontSize: 20, width: 28, textAlign: 'center' }}>{s.emoji}</span>
                    <span style={{ fontSize: 15, fontWeight: 600, color: '#1E1E2E' }}>{s.label}</span>
                  </div>
                  <button
                    onClick={() => toggleSection(s.key)}
                    className="relative cursor-pointer border-none p-0 flex-shrink-0"
                    style={{ width: 44, height: 24, borderRadius: 12, background: sectionPrefs[s.key] ? '#334266' : '#E8DFCB', transition: 'background 0.15s' }}
                  >
                    <div className="absolute top-0.5 rounded-full bg-white" style={{ left: sectionPrefs[s.key] ? 22 : 2, width: 20, height: 20, boxShadow: '0 1px 2px rgba(0,0,0,0.15)', transition: 'left 0.15s' }} />
                  </button>
                </div>
              ))}
            </div>

            {/* Widgets */}
            <div className="px-5 pt-3 pb-10">
              <p style={{ fontSize: 11, fontWeight: 700, color: '#8A7E6B', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8 }}>Quick Summary Widgets</p>
              {widgetOrder.map((id, idx) => {
                const w = WIDGET_DEFS.find((x) => x.id === id);
                if (!w) return null;
                return (
                  <div key={w.id} className="flex items-center gap-2 py-2.5" style={{ borderBottom: '1px solid #F0EAE0' }}>
                    {/* Reorder buttons */}
                    <div className="flex flex-col gap-0.5 flex-shrink-0">
                      <button
                        onClick={() => moveWidget(w.id, -1)}
                        disabled={idx === 0}
                        style={{ background: 'none', border: 'none', cursor: idx === 0 ? 'default' : 'pointer', padding: '1px 4px', opacity: idx === 0 ? 0.2 : 0.7, fontSize: 12, lineHeight: 1 }}
                      >▲</button>
                      <button
                        onClick={() => moveWidget(w.id, 1)}
                        disabled={idx === widgetOrder.length - 1}
                        style={{ background: 'none', border: 'none', cursor: idx === widgetOrder.length - 1 ? 'default' : 'pointer', padding: '1px 4px', opacity: idx === widgetOrder.length - 1 ? 0.2 : 0.7, fontSize: 12, lineHeight: 1 }}
                      >▼</button>
                    </div>
                    <span style={{ fontSize: 20, width: 28, textAlign: 'center', flexShrink: 0 }}>{w.emoji}</span>
                    <span style={{ fontSize: 15, fontWeight: 600, color: '#1E1E2E', flex: 1 }}>{w.label}</span>
                    <button
                      onClick={() => toggleWidget(w.id)}
                      className="relative cursor-pointer border-none p-0 flex-shrink-0"
                      style={{ width: 44, height: 24, borderRadius: 12, background: widgetPrefs[w.id] ? '#334266' : '#E8DFCB', transition: 'background 0.15s' }}
                    >
                      <div className="absolute top-0.5 rounded-full bg-white" style={{ left: widgetPrefs[w.id] ? 22 : 2, width: 20, height: 20, boxShadow: '0 1px 2px rgba(0,0,0,0.15)', transition: 'left 0.15s' }} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
