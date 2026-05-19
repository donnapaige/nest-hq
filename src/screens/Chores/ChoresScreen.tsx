'use client';

import { useState } from 'react';
import { TabBar } from '@/src/components/primitives/TabBar';
import { FAB } from '@/src/components/primitives/FAB';
import { ChoresHeader } from './components/ChoresHeader';
import { LeaderboardStrip } from './components/LeaderboardStrip';
import { KanbanBoard } from './components/KanbanBoard';
import { ChoreSkeleton } from './components/ChoreSkeleton';
import { ChoreSheet } from './sheets/ChoreSheet';
import { useChores } from './hooks/useChores';
import { EmptyIllustration } from '@/src/components/EmptyIllustration';
import { MemberFilterRow } from '@/src/screens/Calendar/components/MemberFilterRow';
import type { Chore } from '@/src/lib/types';

export type KanbanView = 'board' | 'byPerson';

export function ChoresScreen() {
  const {
    chores, leaderboard,
    activeFilters, toggleFilter, clearFilters,
    completeChore, moveChore, addChore,
    status,
  } = useChores();

  const [view, setView] = useState<KanbanView>('board');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingChore, setEditingChore] = useState<Chore | undefined>();

  const openNew  = () => { setEditingChore(undefined); setSheetOpen(true); };
  const openEdit = (id: string) => {
    const c = chores.find((x) => x.id === id);
    if (c) { setEditingChore(c); setSheetOpen(true); }
  };

  const handleSave = (chore: Chore) => {
    if (editingChore) {
      moveChore(chore.id, chore.status);
    } else {
      addChore(chore);
    }
  };

  const done  = chores.filter((c) => c.status === 'done').length;
  const total = chores.length;

  return (
    <div className="bg-bg h-full font-sans text-ink relative overflow-hidden flex flex-col">
      <ChoresHeader
        done={done}
        total={total}
        view={view}
        onViewChange={setView}
        onAdd={openNew}
      />

      {status === 'loading' && <ChoreSkeleton />}

      {status === 'error' && (
        <div className="bg-danger text-white px-5 py-3 text-[14px]">
          Something went wrong. Pull to refresh.
        </div>
      )}

      {status === 'ready' && total === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-4">
          <EmptyIllustration />
          <h2 className="text-[20px] font-bold text-ink m-0">No chores this week</h2>
          <p className="text-[14px] text-muted m-0">Tap + to add a chore and assign it to a family member.</p>
          <button
            onClick={openNew}
            className="bg-accent text-white rounded-pill text-[15px] font-bold border-none cursor-pointer"
            style={{ padding: '12px 28px' }}
          >
            Add chore
          </button>
        </div>
      )}

      {status === 'ready' && total > 0 && (
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Leaderboard */}
          <div className="px-5 pb-3 pt-1">
            <LeaderboardStrip entries={leaderboard} />
          </div>

          {/* Member filter */}
          <MemberFilterRow
            active={activeFilters}
            onToggle={toggleFilter}
            onClearAll={clearFilters}
            totalCount={5}
          />

          {/* Board content */}
          <div className="flex-1 overflow-y-auto" style={{ paddingBottom: 110 }}>
            <KanbanBoard
              chores={chores}
              onComplete={completeChore}
              onEdit={openEdit}
            />
          </div>
        </div>
      )}

      <FAB label="Add chore" onClick={openNew} />
      <TabBar active="chores" />

      <ChoreSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        initial={editingChore}
        onSave={handleSave}
      />
    </div>
  );
}
