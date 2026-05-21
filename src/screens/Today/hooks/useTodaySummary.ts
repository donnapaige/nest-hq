'use client';

import { useState, useCallback, useEffect } from 'react';
import { createClient } from '@/src/lib/supabase/client';
import { useHousehold } from '@/src/context/HouseholdContext';
import type { TodaySummary } from '@/src/lib/types';

type Status = 'loading' | 'ready' | 'error' | 'empty';

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function dueLabelForBill(dueDate: string, autoPay: boolean) {
  const due = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Math.ceil((due.getTime() - today.getTime()) / 86_400_000);
  if (days === 0) return autoPay ? 'Auto-pay today'     : 'Due today';
  if (days === 1) return autoPay ? 'Auto-pay tomorrow'  : 'Due tomorrow';
  return `Due in ${days} days`;
}

function greeting(name: string) {
  const h = new Date().getHours();
  const time = h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';
  return `Good ${time}, ${name} ☀️`;
}

const EMPTY: TodaySummary = {
  date: new Date().toISOString().split('T')[0],
  greeting: 'Good morning ☀️',
  household: { name: '', memberIds: [] },
  counts: { events: 0, chores: 0, billsDue: 0 },
  events: [],
  choresDueToday: [],
  shoppingPreview: { count: 0, sample: [], isLow: false },
  nextBill: null,
  streakDays: 0,
};

export function useTodaySummary() {
  const { householdId, householdName, members, currentMember } = useHousehold();
  const [status, setStatus] = useState<Status>('loading');
  const [data, setData]     = useState<TodaySummary>(EMPTY);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!householdId) {
      setData(EMPTY);
      setStatus('empty');
      return;
    }

    const supabase = createClient();
    const today    = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86_400_000).toISOString().split('T')[0];

    const [evRes, chRes, shopRes, billRes] = await Promise.all([
      supabase
        .from('events')
        .select('id, title, start_time, location, member_ids')
        .eq('household_id', householdId)
        .gte('start_time', `${today}T00:00:00`)
        .lt('start_time',  `${tomorrow}T00:00:00`)
        .order('start_time'),

      supabase
        .from('chores')
        .select('id, title, due_label, member_id, points')
        .eq('household_id', householdId)
        .neq('status', 'done')
        .limit(5),

      supabase
        .from('shopping_items')
        .select('name')
        .eq('household_id', householdId)
        .eq('done', false)
        .limit(3),

      supabase
        .from('bills')
        .select('id, name, amount, due_date, auto_pay')
        .eq('household_id', householdId)
        .eq('paid', false)
        .gte('due_date', today)
        .order('due_date')
        .limit(1)
        .maybeSingle(),
    ]);

    const events = (evRes.data || []).map((r) => ({
      id:       r.id,
      time:     formatTime(r.start_time),
      title:    r.title,
      subtitle: r.location || '',
      memberId: (r.member_ids as string[])?.[0] ?? '',
    }));

    const choresDueToday = (chRes.data || []).map((r) => ({
      id:       r.id,
      title:    r.title,
      subtitle: r.due_label || 'Today',
      memberId: r.member_id || '',
      points:   r.points,
    }));

    const shopItems = shopRes.data || [];

    const bill = billRes.data;
    const nextBill = bill
      ? {
          id:          bill.id,
          name:        bill.name,
          amount:      bill.amount,
          dueLabel:    dueLabelForBill(bill.due_date, bill.auto_pay),
          autoPay:     bill.auto_pay,
          daysUntilDue: Math.ceil(
            (new Date(bill.due_date).getTime() - Date.now()) / 86_400_000
          ),
        }
      : null;

    const summary: TodaySummary = {
      date:    today,
      greeting: greeting(currentMember?.name || 'there'),
      household: {
        name:      householdName,
        memberIds: members.map((m) => m.id),
      },
      counts: {
        events:   events.length,
        chores:   choresDueToday.length,
        billsDue: bill ? 1 : 0,
      },
      events,
      choresDueToday,
      shoppingPreview: {
        count:  shopItems.length,
        sample: shopItems.map((i) => i.name),
        isLow:  shopItems.length < 5,
      },
      nextBill,
      streakDays: 0,
    };

    setData(summary);
    setStatus(
      events.length === 0 && choresDueToday.length === 0 && !bill
        ? 'empty'
        : 'ready'
    );
  }, [householdId, householdName, members, currentMember]);

  useEffect(() => { load(); }, [load]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  return { status, data, refreshing, refresh };
}
