'use client';

import { useState, useCallback } from 'react';
import { TabBar } from '@/src/components/primitives/TabBar';
import { FAB } from '@/src/components/primitives/FAB';
import { Section } from '@/src/components/primitives/Section';
import { BottomSheet } from '@/src/components/primitives/BottomSheet';
import { Icon } from '@/src/components/primitives/Icon';
import { GreetingHeader } from './components/GreetingHeader';
import { FamilySummaryBanner } from './components/FamilySummaryBanner';
import { EventRow } from './components/EventRow';
import { ChoreCard } from './components/ChoreCard';
import { ShoppingStatCard } from './components/ShoppingStatCard';
import { BillStatCard } from './components/BillStatCard';
import { StreakNudge } from './components/StreakNudge';
import { TodayEmpty } from './components/TodayEmpty';
import { TodaySkeleton } from './components/TodaySkeleton';
import { useTodaySummary } from './hooks/useTodaySummary';

const ACTION_SHEET_ITEMS = [
  { icon: 'calendar' as const, label: 'Event' },
  { icon: 'check'    as const, label: 'Chore' },
  { icon: 'cart'     as const, label: 'Shopping item' },
  { icon: 'coin'     as const, label: 'Bill' },
  { icon: 'sparkle'  as const, label: 'Savings goal' },
];

export function TodayScreen() {
  const { status, data, refreshing, refresh } = useTodaySummary();
  const [fabOpen, setFabOpen] = useState(false);
  const [actionPending, setActionPending] = useState<string | null>(null);

  const handleRefresh = useCallback(() => { refresh(); }, [refresh]);

  const isLoading = status === 'loading';
  const isEmpty = status === 'empty' ||
    (status === 'ready' && data.events.length === 0 && data.choresDueToday.length === 0);
  const isError = status === 'error';
  const isReady = !isLoading && !isEmpty && !isError;

  return (
    <div className="bg-bg h-full font-sans text-ink relative overflow-hidden flex flex-col">
      {/* Scrollable content */}
      <div
        className="h-full overflow-y-auto"
        style={{ paddingBottom: 110 }}
      >
        {/* Error banner */}
        {isError && (
          <div className="bg-danger text-white px-5 py-3 flex items-center justify-between">
            <span className="text-[14px] font-medium">Something went wrong</span>
            <button onClick={handleRefresh} className="text-[13px] font-bold underline bg-transparent border-none text-white cursor-pointer">
              Retry
            </button>
          </div>
        )}

        {/* Greeting (always shown) */}
        <GreetingHeader
          date="Thursday, May 14"
          greeting={data.greeting}
          householdName={data.household.name}
          hasBadge={isReady}
          onBell={() => {}}
        />

        {/* Family summary banner */}
        {!isLoading && (
          <FamilySummaryBanner
            familyName={data.household.name}
            summaryLine={
              isEmpty
                ? 'Nothing on the agenda 🎉'
                : `${data.counts.events} events · ${data.counts.chores} chores · ${data.counts.billsDue} bill due`
            }
            memberIds={data.household.memberIds}
          />
        )}

        {/* States */}
        {isLoading && <div className="mt-5"><TodaySkeleton /></div>}
        {isEmpty && <TodayEmpty />}

        {isReady && (
          <>
            {/* Refresh button (web substitute for pull-to-refresh) */}
            <div className="flex justify-end px-5 mt-3 mb-1">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-1 text-[12px] text-muted font-medium bg-transparent border-none cursor-pointer p-0"
              >
                <Icon name="sync" size={14} color={refreshing ? '#DBA03A' : '#8A7E6B'} />
                {refreshing ? 'Refreshing…' : 'Refresh'}
              </button>
            </div>

            {/* Today's Schedule */}
            <Section title="Today's Schedule" action="See all" onAction={() => {}}>
              {data.events.map((ev) => (
                <EventRow key={ev.id} event={ev} />
              ))}
            </Section>

            {/* Chores due today */}
            <Section title="Chores due today" action={`${data.choresDueToday.length} left`}>
              <div
                className="flex gap-[10px] overflow-x-auto scrollbar-none -mx-5 px-5 pb-1"
              >
                {data.choresDueToday.map((chore) => (
                  <ChoreCard key={chore.id} chore={chore} />
                ))}
              </div>
            </Section>

            {/* Quick row: Shopping + Bill */}
            <div className="px-5 flex gap-[10px] mb-4">
              <ShoppingStatCard
                count={data.shoppingPreview.count}
                sample={data.shoppingPreview.sample}
                isLow={data.shoppingPreview.isLow}
              />
              {data.nextBill && (
                <BillStatCard bill={data.nextBill} />
              )}
            </div>

            {/* Streak nudge */}
            {data.streakDays > 0 && <StreakNudge days={data.streakDays} />}
          </>
        )}
      </div>

      {/* FAB — hidden while loading */}
      {!isLoading && (
        <FAB
          icon="plus"
          label="Add"
          onClick={() => setFabOpen(true)}
          rotated={fabOpen}
        />
      )}

      {/* Tab bar */}
      <TabBar active="today" />

      {/* Action sheet (bottom sheet with 5 options) */}
      <BottomSheet open={fabOpen} onClose={() => setFabOpen(false)} snapPercent={50}>
        <div className="pt-2 pb-6">
          <div className="text-[15px] font-bold text-ink mb-4 text-center">Add to HomeBase</div>
          <div className="flex flex-col gap-2">
            {ACTION_SHEET_ITEMS.map((item) => (
              <button
                key={item.label}
                onClick={() => { setFabOpen(false); }}
                className="flex items-center gap-3 h-touch px-4 rounded-card bg-surface border border-hairline text-[15px] font-medium text-ink text-left cursor-pointer hover:bg-light transition-colors duration-[200ms]"
              >
                <div className="w-8 h-8 rounded-chip bg-primary/10 flex items-center justify-center">
                  <Icon name={item.icon} size={18} color="#334266" />
                </div>
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}
