'use client';

import { useState, useCallback, useEffect } from 'react';
import { createClient } from '@/src/lib/supabase/client';
import { useHousehold } from '@/src/context/HouseholdContext';

export interface Routine {
  id: string;
  memberId: string;
  title: string;
  timeLabel: string;
  days: string[];
  doneToday: boolean;
  orderIdx: number;
}

const ALL_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export { ALL_DAYS };

function mapRow(r: Record<string, unknown>): Routine {
  return {
    id:        r.id as string,
    memberId:  r.member_id as string,
    title:     r.title as string,
    timeLabel: (r.time_label as string) || '',
    days:      (r.days as string[]) || [],
    doneToday: (r.done_today as boolean) || false,
    orderIdx:  (r.order_idx as number) || 0,
  };
}

export function useMemberRoutines(memberId: string) {
  const { householdId } = useHousehold();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading,  setLoading]  = useState(true);

  const load = useCallback(async () => {
    if (!householdId || !memberId) { setRoutines([]); setLoading(false); return; }
    const supabase = createClient();
    const { data } = await supabase
      .from('member_routines')
      .select('*')
      .eq('member_id', memberId)
      .eq('household_id', householdId)
      .order('order_idx');
    setRoutines((data || []).map(mapRow));
    setLoading(false);
  }, [householdId, memberId]);

  useEffect(() => { load(); }, [load]);

  const addRoutine = useCallback(async (r: Omit<Routine, 'id' | 'memberId' | 'doneToday' | 'orderIdx'>) => {
    if (!householdId) return;
    const supabase = createClient();
    const { data, error } = await supabase
      .from('member_routines')
      .insert({
        household_id: householdId,
        member_id:    memberId,
        title:        r.title,
        time_label:   r.timeLabel,
        days:         r.days,
        order_idx:    routines.length,
      })
      .select()
      .single();
    if (!error && data) setRoutines((prev) => [...prev, mapRow(data)]);
  }, [householdId, memberId, routines.length]);

  const toggleDone = useCallback(async (id: string) => {
    const routine = routines.find((r) => r.id === id);
    if (!routine) return;
    const newDone = !routine.doneToday;
    setRoutines((prev) => prev.map((r) => r.id === id ? { ...r, doneToday: newDone } : r));
    const supabase = createClient();
    await supabase.from('member_routines').update({ done_today: newDone }).eq('id', id);
  }, [routines]);

  const deleteRoutine = useCallback(async (id: string) => {
    setRoutines((prev) => prev.filter((r) => r.id !== id));
    const supabase = createClient();
    await supabase.from('member_routines').delete().eq('id', id);
  }, []);

  return { routines, loading, addRoutine, toggleDone, deleteRoutine };
}
