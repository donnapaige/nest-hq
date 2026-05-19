'use client';

import { useState, useCallback } from 'react';
import { CHORES_FIXTURE, LEADERBOARD_FIXTURE } from '@/src/lib/fixtures/chores';
import type { Chore, MemberId } from '@/src/lib/types';

export function useChores() {
  const [chores, setChores] = useState<Chore[]>(CHORES_FIXTURE);
  const [leaderboard, setLeaderboard] = useState(LEADERBOARD_FIXTURE);
  const [activeFilters, setActiveFilters] = useState<MemberId[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('ready');

  const toggleFilter = useCallback((id: MemberId) => {
    setActiveFilters((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  }, []);

  const completeChore = useCallback((id: string) => {
    setChores((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, status: 'done' as const, completedAt: new Date().toISOString() }
          : c
      )
    );
    const chore = chores.find((c) => c.id === id);
    if (chore) {
      setLeaderboard((prev) =>
        prev.map((row) =>
          row.memberId === chore.memberId
            ? { ...row, pts: row.pts + chore.points }
            : row
        )
      );
    }
  }, [chores]);

  const moveChore = useCallback((id: string, newStatus: Chore['status']) => {
    setChores((prev) => prev.map((c) => c.id === id ? { ...c, status: newStatus } : c));
  }, []);

  const addChore = useCallback((c: Chore) => setChores((prev) => [...prev, c]), []);

  const visibleChores = activeFilters.length === 0
    ? chores
    : chores.filter((c) => activeFilters.includes(c.memberId));

  return {
    chores: visibleChores,
    leaderboard,
    activeFilters, toggleFilter,
    clearFilters: () => setActiveFilters([]),
    completeChore, moveChore, addChore,
    status,
  };
}
