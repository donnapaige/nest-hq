'use client';

import { useState, useCallback, useEffect } from 'react';
import { createClient } from '@/src/lib/supabase/client';
import { useHousehold } from '@/src/context/HouseholdContext';
import type { SavingsGoal, SavingsTx } from '@/src/lib/types';

function mapRow(r: Record<string, unknown>): SavingsGoal {
  return {
    id:            r.id as string,
    name:          r.name as string,
    icon:          (r.icon as string) || '🎯',
    color:         (r.color as string) || '#4C8A8B',
    saved:         r.saved_amount as number,
    target:        r.target_amount as number,
    contributions: [],
    createdAt:     r.created_at as string,
  };
}

export function useGoals() {
  const { householdId } = useHousehold();
  const [goals, setGoals] = useState<SavingsGoal[]>([]);

  const load = useCallback(async () => {
    if (!householdId) { setGoals([]); return; }
    const supabase = createClient();
    const { data } = await supabase
      .from('savings_goals')
      .select('*')
      .eq('household_id', householdId)
      .order('created_at');
    setGoals((data || []).map(mapRow));
  }, [householdId]);

  useEffect(() => { load(); }, [load]);

  const addGoal = useCallback(async (goal: SavingsGoal) => {
    if (!householdId) return;
    const supabase = createClient();
    const { data, error } = await supabase
      .from('savings_goals')
      .insert({
        household_id:  householdId,
        name:          goal.name,
        icon:          goal.icon,
        color:         goal.color,
        target_amount: goal.target,
        saved_amount:  goal.saved,
      })
      .select()
      .single();
    if (!error && data) setGoals((prev) => [...prev, mapRow(data)]);
  }, [householdId]);

  const deposit = useCallback(async (goalId: string, tx: SavingsTx) => {
    setGoals((prev) =>
      prev.map((g) =>
        g.id === goalId
          ? { ...g, saved: g.saved + tx.amount, contributions: [...g.contributions, tx] }
          : g
      )
    );
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return;
    const supabase = createClient();
    await supabase
      .from('savings_goals')
      .update({ saved_amount: goal.saved + tx.amount })
      .eq('id', goalId);
  }, [goals]);

  return { goals, addGoal, deposit };
}
