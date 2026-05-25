'use client';

import { useState, useCallback, useEffect } from 'react';
import { createClient } from '@/src/lib/supabase/client';
import { useHousehold } from '@/src/context/HouseholdContext';
import type { Bill } from '@/src/lib/types';

function mapRow(r: Record<string, unknown>): Bill {
  return {
    id:              r.id as string,
    name:            r.name as string,
    vendor:          (r.vendor as string) || '',
    amount:          r.amount as number,
    dueDate:         r.due_date as string,
    paid:            r.paid as boolean,
    autoPay:         r.auto_pay as boolean,
    recurrence:      r.recurrence as Bill['recurrence'],
    category:        r.category as string | undefined,
    billType:        (r.bill_type as Bill['billType']) ?? 'fixed',
    arrivalDay:      r.arrival_day as number | null,
    amountConfirmed: (r.amount_confirmed as boolean) ?? true,
    remindArrival:   (r.remind_arrival as boolean) ?? false,
    forMemberId:     (r.for_member_id as string) || null,
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
    const updates: Record<string, unknown> = { paid: newPaid };
    // When a recurring variable bill is marked paid, reset for the next cycle
    if (newPaid && bill.billType === 'variable' && bill.recurrence) {
      updates.amount_confirmed = false;
      updates.amount = 0;
      setBills((prev) => prev.map((b) => b.id === id ? { ...b, amountConfirmed: false, amount: 0 } : b));
    }
    await supabase.from('bills').update(updates).eq('id', id);
  }, [bills]);

  const updateAmount = useCallback(async (id: string, amount: number) => {
    setBills((prev) => prev.map((b) => b.id === id ? { ...b, amount, amountConfirmed: true } : b));
    const supabase = createClient();
    await supabase.from('bills').update({ amount, amount_confirmed: true }).eq('id', id);
  }, []);

  const updateBill = useCallback(async (id: string, bill: Omit<Bill, 'id'> & { imageUrl?: string; paymentMethod?: string; reminderDaysBefore?: number }) => {
    const supabase = createClient();
    const isVariable = bill.billType === 'variable';
    const { data, error } = await supabase
      .from('bills')
      .update({
        name:                 bill.name,
        vendor:               bill.vendor,
        amount:               bill.amount,
        due_date:             bill.dueDate,
        auto_pay:             bill.autoPay,
        recurrence:           bill.recurrence,
        category:             bill.category,
        image_url:            bill.imageUrl,
        payment_method:       bill.paymentMethod,
        reminder_days_before: bill.reminderDaysBefore,
        bill_type:            bill.billType ?? 'fixed',
        arrival_day:          bill.arrivalDay ?? null,
        amount_confirmed:     isVariable ? (bill.amountConfirmed ?? false) : true,
        remind_arrival:       bill.remindArrival ?? false,
        for_member_id:        bill.forMemberId ?? null,
      })
      .eq('id', id)
      .select()
      .single();
    if (!error && data) setBills((prev) => prev.map((b) => b.id === id ? mapRow(data) : b));
  }, []);

  const addBill = useCallback(async (bill: Omit<Bill, 'id'> & { imageUrl?: string; paymentMethod?: string; reminderDaysBefore?: number }) => {
    if (!householdId) return;
    const supabase = createClient();
    const isVariable = bill.billType === 'variable';
    const { data, error } = await supabase
      .from('bills')
      .insert({
        household_id:         householdId,
        name:                 bill.name,
        vendor:               bill.vendor,
        amount:               bill.amount,
        due_date:             bill.dueDate,
        paid:                 bill.paid,
        auto_pay:             bill.autoPay,
        recurrence:           bill.recurrence,
        category:             bill.category,
        image_url:            bill.imageUrl,
        payment_method:       bill.paymentMethod,
        reminder_days_before: bill.reminderDaysBefore,
        bill_type:            bill.billType ?? 'fixed',
        arrival_day:          bill.arrivalDay ?? null,
        amount_confirmed:     isVariable ? false : true,
        remind_arrival:       bill.remindArrival ?? false,
        for_member_id:        bill.forMemberId ?? null,
      })
      .select()
      .single();
    if (!error && data) setBills((prev) => [...prev, mapRow(data)]);
  }, [householdId]);

  const deleteBill = useCallback(async (id: string) => {
    setBills((prev) => prev.filter((b) => b.id !== id));
    const supabase = createClient();
    await supabase.from('bills').delete().eq('id', id);
  }, []);

  return { bills, status, togglePaid, addBill, updateBill, updateAmount, deleteBill };
}
