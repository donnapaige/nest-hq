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

const todayDate = new Date();
const TODAY = todayDate.toISOString().split('T')[0];
const CURRENT_YEAR  = todayDate.getFullYear();
const CURRENT_MONTH = todayDate.getMonth(); // 0-based

export function CalendarScreen() {
  const { events, view, setView, activeFilters, toggleFilter, clearFilters, status, addEvent, updateEvent, deleteEvent } = useCalendar();
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
    const monthName = new Date(first.date + 'T12:00:00').toLocaleString('default', { month: 'long' });
    return `${monthName} ${first.n} – ${last.n}`;
  })();

  const monthTitle = todayDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="bg-bg h-full font-sans text-ink relative overflow-hidden flex flex-col">
      <CalendarHeader
        eyebrow="This week"
        title={view === 'week' ? rangeLabel : monthTitle}
        view={view}
        onViewChange={setView}
      />

      <MemberFilterRow
        active={activeFilters}
        onToggle={toggleFilter}
        onClearAll={clearFilters}
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
                year={CURRENT_YEAR}
                month={CURRENT_MONTH}
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
        onDelete={deleteEvent}
      />
    </div>
  );
}
