'use client';

import { useState, useCallback, useEffect } from 'react';
import { createClient } from '@/src/lib/supabase/client';
import { useHousehold } from '@/src/context/HouseholdContext';
import type { Bill } from '@/src/lib/types';

function mapRow(r: Record<string, unknown>): Bill {
  return {
    id:         r.id as string,
    name:       r.name as string,
    vendor:     (r.vendor as string) || '',
    amount:     r.amount as number,
    dueDate:    r.due_date as string,
    paid:       r.paid as boolean,
    autoPay:    r.auto_pay as boolean,
    recurrence: r.recurrence as Bill['recurrence'],
    category:   r.category as string | undefined,
  };
}

export function useBills() {
  const { householdId } = useHousehold();
  const [bills,  setBills]  = useState<Bill[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  const load = useCallback(async () => {
    if (!householdId) { setBills([]); setStatus('ready'); return; }
    setStatus('loading');
    const supabase = createClient();
    const { data, error } = await supabase
      .from('bills')
      .select('*')
      .eq('household_id', householdId)
      .order('due_date');
    if (error) { setStatus('error'); return; }
    setBills((data || []).map(mapRow));
    setStatus('ready');
  }, [householdId]);

  useEffect(() => { load(); }, [load]);

  const togglePaid = useCallback(async (id: string) => {
    const bill = bills.find((b) => b.id === id);
    if (!bill) return;
    const newPaid = !bill.paid;
    setBills((prev) => prev.map((b) => b.id === id ? { ...b, paid: newPaid } : b));
    const supabase = createClient();
    await supabase.from('bills').update({ paid: newPaid }).eq('id', id);
  }, [bills]);

  const addBill = useCallback(async (bill: Bill) => {
    if (!householdId) return;
    const supabase = createClient();
    const { data, error } = await supabase
      .from('bills')
      .insert({
        household_id: householdId,
        name:         bill.name,
        vendor:       bill.vendor,
        amount:       bill.amount,
        due_date:     bill.dueDate,
        paid:         bill.paid,
        auto_pay:     bill.autoPay,
        recurrence:   bill.recurrence,
        category:     bill.category,
      })
      .select()
      .single();
    if (!error && data) setBills((prev) => [...prev, mapRow(data)]);
  }, [householdId]);

  return { bills, status, togglePaid, addBill };
}
