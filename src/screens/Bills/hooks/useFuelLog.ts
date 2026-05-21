'use client';

import { useState, useCallback, useEffect } from 'react';
import { createClient } from '@/src/lib/supabase/client';
import { useHousehold } from '@/src/context/HouseholdContext';

export interface FuelLog {
  id: string;
  memberId: string | null;
  vehicleName: string;
  liters: number;
  pricePerLiter: number;
  totalCost: number;
  odometer: number | null;
  fuelDate: string;
  notes: string;
  createdAt: string;
}

function mapRow(r: Record<string, unknown>): FuelLog {
  return {
    id:            r.id as string,
    memberId:      r.member_id as string | null,
    vehicleName:   (r.vehicle_name as string) || '',
    liters:        r.liters as number,
    pricePerLiter: r.price_per_liter as number,
    totalCost:     r.total_cost as number,
    odometer:      r.odometer as number | null,
    fuelDate:      r.fuel_date as string,
    notes:         (r.notes as string) || '',
    createdAt:     r.created_at as string,
  };
}

export function useFuelLog() {
  const { householdId, currentMember } = useHousehold();
  const [logs, setLogs]       = useState<FuelLog[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!householdId) { setLogs([]); setLoading(false); return; }
    const supabase = createClient();
    const { data } = await supabase
      .from('fuel_logs')
      .select('*')
      .eq('household_id', householdId)
      .order('fuel_date', { ascending: false })
      .limit(50);
    setLogs((data || []).map(mapRow));
    setLoading(false);
  }, [householdId]);

  useEffect(() => { load(); }, [load]);

  const addLog = useCallback(async (entry: Omit<FuelLog, 'id' | 'createdAt' | 'memberId'>) => {
    if (!householdId) return;
    const supabase = createClient();
    const { data, error } = await supabase
      .from('fuel_logs')
      .insert({
        household_id:    householdId,
        member_id:       currentMember?.id ?? null,
        vehicle_name:    entry.vehicleName,
        liters:          entry.liters,
        price_per_liter: entry.pricePerLiter,
        total_cost:      entry.totalCost,
        odometer:        entry.odometer,
        fuel_date:       entry.fuelDate,
        notes:           entry.notes,
      })
      .select()
      .single();
    if (!error && data) setLogs((prev) => [mapRow(data), ...prev]);
  }, [householdId, currentMember]);

  const deleteLog = useCallback(async (id: string) => {
    setLogs((prev) => prev.filter((l) => l.id !== id));
    const supabase = createClient();
    await supabase.from('fuel_logs').delete().eq('id', id);
  }, []);

  const totalSpent = logs.reduce((sum, l) => sum + l.totalCost, 0);
  const totalLiters = logs.reduce((sum, l) => sum + l.liters, 0);
  const avgPrice = totalLiters > 0 ? totalSpent / totalLiters : 0;

  return { logs, loading, addLog, deleteLog, totalSpent, totalLiters, avgPrice };
}
