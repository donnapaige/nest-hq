'use client';

import { useState, useRef, useCallback } from 'react';
import { TabBar } from '@/src/components/primitives/TabBar';
import { FAB } from '@/src/components/primitives/FAB';
import { CalendarHeader } from './components/CalendarHeader';
import { MemberFilterRow } from './components/MemberFilterRow';
import { WeekStrip, buildWeekDays } from './components/WeekStrip';
import { WeekGrid } from './components/WeekGrid';
import { MonthGrid } from './components/MonthGrid';
import { TimeOfDayList } from './components/TimeOfDayList';
import { AgendaList } from './components/AgendaList';
import { CalendarSkeleton } from './components/CalendarSkeleton';
import { CalendarEmpty } from './components/CalendarEmpty';
import { EventSheet } from './sheets/EventSheet';
import { useCalendar } from './hooks/useCalendar';
import type { CalendarEvent } from '@/src/lib/types';

const todayDate = new Date();
const TODAY        = todayDate.toISOString().split('T')[0];
const CURRENT_YEAR  = todayDate.getFullYear();
const CURRENT_MONTH = todayDate.getMonth(); // 0-based

/** How many Monday-based weeks separate two ISO date strings. */
function weeksBetween(isoA: string, isoB: string): number {
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const a = new Date(isoA + 'T12:00:00');
  const b = new Date(isoB + 'T12:00:00');
  // Align both to Monday of their week
  const mondayOf = (d: Date) => {
    const copy = new Date(d);
    const day = copy.getDay(); // 0=Sun
    copy.setDate(copy.getDate() - ((day + 6) % 7)); // shift to Monday
    return copy;
  };
  const diff = mondayOf(b).getTime() - mondayOf(a).getTime();
  return Math.round(diff / msPerWeek);
}

export function CalendarScreen() {
  const {
    events, view, setView,
    activeFilters, toggleFilter, clearFilters,
    status, addEvent, updateEvent, deleteEvent,
    weekOffset, setWeekOffset,
  } = useCalendar();

  const [selectedDate,  setSelectedDate]  = useState(TODAY);
  const [monthOffset,   setMonthOffset]   = useState(0);
  const [sheetOpen,     setSheetOpen]     = useState(false);
  const [editingEvent,  setEditingEvent]  = useState<CalendarEvent | undefined>();

  // Swipe gesture tracking
  const swipeStartX = useRef(0);
  const swipeStartY = useRef(0);

  const weekDays = buildWeekDays(weekOffset);

  const selectedDayEvents = events.filter((e) => e.start.startsWith(selectedDate));

  // Display month/year derived from monthOffset
  const displayDate  = new Date(CURRENT_YEAR, CURRENT_MONTH + monthOffset, 1);
  const displayYear  = displayDate.getFullYear();
  const displayMonth = displayDate.getMonth();

  const openNew  = (date?: string) => { setEditingEvent(undefined); setSelectedDate(date ?? TODAY); setSheetOpen(true); };
  const openEdit = (ev: CalendarEvent) => { setEditingEvent(ev); setSheetOpen(true); };

  const handleSave = (ev: CalendarEvent) => {
    if (editingEvent) updateEvent(ev); else addEvent(ev);
  };

  // Navigation helpers
  const goToPrev = useCallback(() => {
    if (view === 'week')  setWeekOffset((o) => o - 1);
    else                  setMonthOffset((o) => o - 1);
  }, [view, setWeekOffset]);

  const goToNext = useCallback(() => {
    if (view === 'week')  setWeekOffset((o) => o + 1);
    else                  setMonthOffset((o) => o + 1);
  }, [view, setWeekOffset]);

  // Swipe handlers (PointerEvents — works mouse + touch, no library needed)
  const handlePointerDown = (e: React.PointerEvent) => {
    swipeStartX.current = e.clientX;
    swipeStartY.current = e.clientY;
  };
  const handlePointerUp = (e: React.PointerEvent) => {
    const dx = e.clientX - swipeStartX.current;
    const dy = e.clientY - swipeStartY.current;
    // Only register horizontal swipes (ignore vertical scrolls)
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx < 0) goToNext(); else goToPrev();
    }
  };

  // MonthGrid day tap → switch to correct week and select the day
  const handleDaySelect = useCallback((date: string) => {
    const offset = weeksBetween(TODAY, date);
    setWeekOffset(offset);
    setSelectedDate(date);
    setView('week');
  }, [setWeekOffset, setView]);

  const rangeLabel = (() => {
    const first = weekDays[0], last = weekDays[6];
    const monthName = new Date(first.date + 'T12:00:00').toLocaleString('default', { month: 'long' });
    return `${monthName} ${first.n} – ${last.n}`;
  })();

  const monthTitle = displayDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const headerEyebrow = view === 'week' ? 'This week' : view === 'month' ? 'Monthly view' : 'All events';
  const headerTitle   = view === 'week' ? rangeLabel : view === 'month' ? monthTitle : 'Agenda';

  return (
    <div className="bg-bg h-full font-sans text-ink relative overflow-hidden flex flex-col">
      <CalendarHeader
        eyebrow={headerEyebrow}
        title={headerTitle}
        view={view}
        onViewChange={setView}
        onPrev={goToPrev}
        onNext={goToNext}
      />

      <MemberFilterRow
        active={activeFilters}
        onToggle={toggleFilter}
        onClearAll={clearFilters}
      />

      {view === 'week' && (
        <WeekStrip days={weekDays} selectedDate={selectedDate} onSelect={setSelectedDate} />
      )}
      {/* No strip for month or agenda */}

      <div
        className="flex-1 overflow-hidden"
        style={{ paddingBottom: 110 }}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      >
        {status === 'loading' && <CalendarSkeleton />}

        {status === 'ready' && events.length === 0 && view !== 'agenda' && (
          <CalendarEmpty onAdd={() => openNew()} />
        )}

        {status === 'error' && (
          <div className="bg-danger text-white px-5 py-3 text-[14px]">
            Something went wrong. Pull to refresh.
          </div>
        )}

        {(status === 'ready' && events.length > 0) || view === 'agenda' ? (
          <div className="h-full overflow-y-auto">
            {view === 'week' && (
              <>
                <WeekGrid
                  days={weekDays}
                  events={events}
                  activeFilters={activeFilters}
                  onEventClick={openEdit}
                  onSlotClick={(date) => openNew(date)}
                />
                <div className="mt-4">
                  <TimeOfDayList
                    events={selectedDayEvents}
                    onEventClick={openEdit}
                  />
                </div>
              </>
            )}
            {view === 'month' && (
              <MonthGrid
                year={displayYear}
                month={displayMonth}
                events={events}
                activeFilters={activeFilters}
                today={TODAY}
                onDaySelect={handleDaySelect}
              />
            )}
            {view === 'agenda' && (
              <AgendaList events={events} onEventClick={openEdit} />
            )}
          </div>
        ) : null}
      </div>

      <FAB label="Add event" onClick={() => openNew()} />
      <TabBar active="calendar" />

      <EventSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        initial={editingEvent}
        onSave={handleSave}
        onDelete={deleteEvent}
      />
    </div>
  );
}
