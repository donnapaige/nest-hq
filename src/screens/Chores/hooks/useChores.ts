'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { createClient } from '@/src/lib/supabase/client';
import { useHousehold } from '@/src/context/HouseholdContext';
import { useAuth } from '@/src/context/AuthContext';
import type { Chore, MemberId } from '@/src/lib/types';

function mapRow(r: Record<string, unknown>): Chore {
  return {
    id:           r.id as string,
    title:        r.title as string,
    memberId:     (r.member_id as string) || '',
    forMemberId:  (r.for_member_id as string) || null,
    status:       r.status as Chore['status'],
    due:          (r.due_label as string) || 'No due date',
    recurrence:   r.recurrence as string | null,
    points:       r.points as number,
    completedAt:  r.completed_at as string | undefined,
  };
}

export function useChores() {
  const { householdId, members } = useHousehold();
  const { user }                 = useAuth();

  const [chores,        setChores]        = useState<Chore[]>([]);
  const [activeFilters, setActiveFilters] = useState<MemberId[]>([]);
  const [status,        setStatus]        = useState<'loading' | 'ready' | 'error'>('loading');

  const load = useCallback(async () => {
    if (!householdId) { setChores([]); setStatus('ready'); return; }
    setStatus('loading');
    const supabase = createClient();
    const { data, error } = await supabase
      .from('chores')
      .select('*')
      .eq('household_id', householdId)
      .order('created_at', { ascending: false });
    if (error) { setStatus('error'); return; }
    setChores((data || []).map(mapRow));
    setStatus('ready');
  }, [householdId]);

  useEffect(() => { load(); }, [load]);

  const leaderboard = useMemo(() =>
    members
      .map((m) => ({
        memberId: m.id,
        pts: chores
          .filter((c) => c.memberId === m.id && c.status === 'done')
          .reduce((sum, c) => sum + c.points, 0),
      }))
      .sort((a, b) => b.pts - a.pts),
  [members, chores]);

  const toggleFilter = useCallback((id: MemberId) => {
    setActiveFilters((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const completeChore = useCallback(async (id: string) => {
    const now = new Date().toISOString();
    setChores((prev) =>
      prev.map((c) => c.id === id ? { ...c, status: 'done' as const, completedAt: now } : c)
    );
    if (!householdId) return;
    const supabase = createClient();
    await supabase
      .from('chores')
      .update({ status: 'done', completed_at: now })
      .eq('id', id);
  }, [householdId]);

  const moveChore = useCallback(async (id: string, newStatus: Chore['status']) => {
    setChores((prev) => prev.map((c) => c.id === id ? { ...c, status: newStatus } : c));
    if (!householdId) return;
    const supabase = createClient();
    await supabase.from('chores').update({ status: newStatus }).eq('id', id);
  }, [householdId]);

  const addChore = useCallback(async (c: Chore) => {
    if (!householdId) return;
    const supabase = createClient();
    const { data, error } = await supabase
      .from('chores')
      .insert({
        household_id:  householdId,
        title:         c.title,
        member_id:     c.memberId || null,
        for_member_id: c.forMemberId || null,
        status:        c.status,
        due_label:     c.due,
        recurrence:    c.recurrence,
        points:        c.points,
        created_by:    user?.id,
      })
      .select()
      .single();
    if (!error && data) setChores((prev) => [mapRow(data), ...prev]);
  }, [householdId, user]);

  const updateChore = useCallback(async (c: Chore) => {
    setChores((prev) => prev.map((x) => x.id === c.id ? c : x));
    const supabase = createClient();
    await supabase.from('chores').update({
      title:         c.title,
      member_id:     c.memberId || null,
      for_member_id: c.forMemberId || null,
      status:        c.status,
      due_label:     c.due,
      recurrence:    c.recurrence,
      points:        c.points,
    }).eq('id', c.id);
  }, []);

  const deleteChore = useCallback(async (id: string) => {
    setChores((prev) => prev.filter((c) => c.id !== id));
    const supabase = createClient();
    await supabase.from('chores').delete().eq('id', id);
  }, []);

  const visibleChores =
    activeFilters.length === 0
      ? chores
      : chores.filter((c) => activeFilters.includes(c.memberId));

  return {
    chores: visibleChores,
    leaderboard,
    activeFilters, toggleFilter,
    clearFilters: () => setActiveFilters([]),
    completeChore, moveChore, addChore, updateChore, deleteChore,
    status,
  };
}
