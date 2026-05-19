'use client';

import { useState, useCallback } from 'react';
import { CALENDAR_FIXTURE } from '@/src/lib/fixtures/calendar';
import type { CalendarEvent, MemberId } from '@/src/lib/types';

export type CalendarView = 'week' | 'month';

export function useCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>(CALENDAR_FIXTURE);
  const [view, setView] = useState<CalendarView>('week');
  const [activeFilters, setActiveFilters] = useState<MemberId[]>([]);
  const [weekOffset, setWeekOffset] = useState(0);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('ready');

  const toggleFilter = useCallback((id: MemberId) => {
    setActiveFilters((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const clearFilters = useCallback(() => setActiveFilters([]), []);

  const visibleEvents = activeFilters.length === 0
    ? events
    : events.filter((e) => e.memberIds.some((id) => activeFilters.includes(id)));

  const addEvent = useCallback((ev: CalendarEvent) => {
    setEvents((prev) => [...prev, ev]);
  }, []);

  const updateEvent = useCallback((ev: CalendarEvent) => {
    setEvents((prev) => prev.map((e) => (e.id === ev.id ? ev : e)));
  }, []);

  return {
    events: visibleEvents,
    allEvents: events,
    view, setView,
    activeFilters, toggleFilter, clearFilters,
    weekOffset, setWeekOffset,
    status,
    addEvent, updateEvent,
  };
}
