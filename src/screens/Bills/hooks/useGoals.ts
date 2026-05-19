'use client';

import { useState, useCallback } from 'react';
import { GOALS_FIXTURE } from '@/src/lib/fixtures/bills';
import type { SavingsGoal, SavingsTx } from '@/src/lib/types';

export function useGoals() {
  const [goals, setGoals] = useState<SavingsGoal[]>(GOALS_FIXTURE);

  const addGoal = useCallback((goal: SavingsGoal) => {
    setGoals((prev) => [...prev, goal]);
  }, []);

  const deposit = useCallback((goalId: string, tx: SavingsTx) => {
    setGoals((prev) =>
      prev.map((g) =>
        g.id === goalId
          ? { ...g, saved: g.saved + tx.amount, contributions: [...g.contributions, tx] }
          : g
      )
    );
  }, []);

  return { goals, addGoal, deposit };
}
