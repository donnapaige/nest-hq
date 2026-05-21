'use client';

import { useState, useCallback, useEffect } from 'react';
import { createClient } from '@/src/lib/supabase/client';
import { useHousehold } from '@/src/context/HouseholdContext';
import { useAuth } from '@/src/context/AuthContext';
import type { CalendarEvent, MemberId } from '@/src/lib/types';

export type CalendarView = 'week' | 'month';

function mapRow(r: Record<string, unknown>): CalendarEvent {
  return {
    id:           r.id as string,
    title:        r.title as string,
    start:        r.start_time as string,
    end:          (r.end_time as string) || (r.start_time as string),
    allDay:       r.all_day as boolean,
    memberIds:    (r.member_ids as string[]) || [],
    forMemberId:  (r.for_member_id as string) || null,
    location:     r.location as string | undefined,
    notes:        r.notes as string | undefined,
    recurrence:   r.recurrence as CalendarEvent['recurrence'],
  };
}

export function useCalendar() {
  const { householdId } = useHousehold();
  const { user }        = useAuth();

  const [events,        setEvents]        = useState<CalendarEvent[]>([]);
  const [view,          setView]          = useState<CalendarView>('week');
  const [activeFilters, setActiveFilters] = useState<MemberId[]>([]);
  const [weekOffset,    setWeekOffset]    = useState(0);
  const [status,        setStatus]        = useState<'loading' | 'ready' | 'error'>('loading');

  const load = useCallback(async () => {
    if (!householdId) { setEvents([]); setStatus('ready'); return; }
    setStatus('loading');
    const supabase = createClient();
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('household_id', householdId)
      .order('start_time');
    if (error) { setStatus('error'); return; }
    setEvents((data || []).map(mapRow));
    setStatus('ready');
  }, [householdId]);

  useEffect(() => { load(); }, [load]);

  const toggleFilter = useCallback((id: MemberId) => {
    setActiveFilters((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const clearFilters = useCallback(() => setActiveFilters([]), []);

  const visibleEvents =
    activeFilters.length === 0
      ? events
      : events.filter((e) => e.memberIds.some((id) => activeFilters.includes(id)));

  const addEvent = useCallback(async (ev: CalendarEvent) => {
    if (!householdId) return;
    const supabase = createClient();
    const { data, error } = await supabase
      .from('events')
      .insert({
        household_id:  householdId,
        title:         ev.title,
        start_time:    ev.start,
        end_time:      ev.end,
        all_day:       ev.allDay ?? false,
        member_ids:    ev.memberIds ?? [],
        for_member_id: ev.forMemberId ?? null,
        location:      ev.location,
        notes:         ev.notes,
        recurrence:    ev.recurrence,
        created_by:    user?.id,
      })
      .select()
      .single();
    if (!error && data) setEvents((prev) => [...prev, mapRow(data)]);
  }, [householdId, user]);

  const updateEvent = useCallback(async (ev: CalendarEvent) => {
    if (!householdId) return;
    const supabase = createClient();
    const { error } = await supabase
      .from('events')
      .update({
        title:         ev.title,
        start_time:    ev.start,
        end_time:      ev.end,
        all_day:       ev.allDay ?? false,
        member_ids:    ev.memberIds ?? [],
        for_member_id: ev.forMemberId ?? null,
        location:      ev.location,
        notes:         ev.notes,
        recurrence:    ev.recurrence,
      })
      .eq('id', ev.id);
    if (!error) setEvents((prev) => prev.map((e) => (e.id === ev.id ? ev : e)));
  }, [householdId]);

  const deleteEvent = useCallback(async (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    const supabase = createClient();
    await supabase.from('events').delete().eq('id', id);
  }, []);

  return {
    events: visibleEvents,
    allEvents: events,
    view, setView,
    activeFilters, toggleFilter, clearFilters,
    weekOffset, setWeekOffset,
    status,
    addEvent, updateEvent, deleteEvent,
  };
}
