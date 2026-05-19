'use client';

import { useState, useCallback } from 'react';
import { TODAY_FIXTURE } from '@/src/lib/fixtures/today';
import type { TodaySummary } from '@/src/lib/types';

type Status = 'loading' | 'ready' | 'error' | 'empty';

export function useTodaySummary() {
  const [status, setStatus] = useState<Status>('ready');
  const [data, setData] = useState<TodaySummary>(TODAY_FIXTURE);
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 800));
    setData(TODAY_FIXTURE);
    setRefreshing(false);
  }, []);

  const simulate = useCallback((s: Status) => {
    setStatus(s);
    if (s === 'empty') {
      setData({ ...TODAY_FIXTURE, events: [], choresDueToday: [], nextBill: null, streakDays: 0 });
    } else {
      setData(TODAY_FIXTURE);
    }
  }, []);

  return { status, data, refreshing, refresh, simulate };
}
