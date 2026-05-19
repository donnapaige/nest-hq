'use client';

import { useState } from 'react';
import { TabBar } from '@/src/components/primitives/TabBar';
import { FAB } from '@/src/components/primitives/FAB';
import { CalendarHeader } from './components/CalendarHeader';
import { MemberFilterRow } from './components/MemberFilterRow';
import { WeekStrip, buildWeekDays } from './components/WeekStrip';
import { WeekGrid } from './components/WeekGrid';
import { MonthGrid } from './components/MonthGrid';
import { TimeOfDayList } from './components/TimeOfDayList';
import { CalendarSkeleton } from './components/CalendarSkeleton';
import { CalendarEmpty } from './components/CalendarEmpty';
import { EventSheet } from './sheets/EventSheet';
import { useCalendar } from './hooks/useCalendar';
import type { CalendarEvent } from '@/src/lib/types';

const TODAY = '2026-05-14';

export function CalendarScreen() {
  const { events, view, setView, activeFilters, toggleFilter, clearFilters, status, addEvent, updateEvent } = useCalendar();
  const [selectedDate, setSelectedDate] = useState(TODAY);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | undefined>();

  const weekDays = buildWeekDays(0);

  const selectedDayEvents = events.filter((e) => e.start.startsWith(selectedDate));

  const openNew  = (date?: string) => { setEditingEvent(undefined); setSelectedDate(date ?? TODAY); setSheetOpen(true); };
  const openEdit = (ev: CalendarEvent) => { setEditingEvent(ev); setSheetOpen(true); };

  const handleSave = (ev: CalendarEvent) => {
    if (editingEvent) updateEvent(ev); else addEvent(ev);
  };

  const rangeLabel = (() => {
    const first = weekDays[0], last = weekDays[6];
    return `May ${first.n} – ${last.n}`;
  })();

  return (
    <div className="bg-bg h-full font-sans text-ink relative overflow-hidden flex flex-col">
      <CalendarHeader
        eyebrow="This week"
        title={view === 'week' ? rangeLabel : 'May 2026'}
        view={view}
        onViewChange={setView}
      />

      <MemberFilterRow
        active={activeFilters}
        onToggle={toggleFilter}
        onClearAll={clearFilters}
        totalCount={5}
      />

      {view === 'week' && (
        <WeekStrip days={weekDays} selectedDate={selectedDate} onSelect={setSelectedDate} />
      )}

      <div className="flex-1 overflow-hidden" style={{ paddingBottom: 110 }}>
        {status === 'loading' && <CalendarSkeleton />}

        {status === 'ready' && events.length === 0 && (
          <CalendarEmpty onAdd={() => openNew()} />
        )}

        {status === 'error' && (
          <div className="bg-danger text-white px-5 py-3 text-[14px]">
            Something went wrong. Pull to refresh.
          </div>
        )}

        {status === 'ready' && events.length > 0 && (
          <div className="h-full overflow-y-auto">
            {view === 'week' ? (
              <>
                <WeekGrid
                  days={weekDays}
                  events={events}
                  activeFilters={activeFilters}
                  onEventClick={openEdit}
                  onSlotClick={(date, hour) => openNew(date)}
                />
                <div className="mt-4">
                  <TimeOfDayList
                    events={selectedDayEvents}
                    onEventClick={openEdit}
                  />
                </div>
              </>
            ) : (
              <MonthGrid
                year={2026}
                month={4}
                events={events}
                activeFilters={activeFilters}
                today={TODAY}
              />
            )}
          </div>
        )}
      </div>

      <FAB label="Add event" onClick={() => openNew()} />
      <TabBar active="calendar" />

      <EventSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        initial={editingEvent}
        onSave={handleSave}
      />
    </div>
  );
}
