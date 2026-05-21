'use client';

import { useState, useCallback, useEffect } from 'react';
import { createClient } from '@/src/lib/supabase/client';
import { useHousehold } from '@/src/context/HouseholdContext';
import type { ShoppingItem } from '@/src/lib/types';

function mapRow(r: Record<string, unknown>): ShoppingItem {
  return {
    id:          r.id as string,
    name:        r.name as string,
    qty:         r.qty as string | undefined,
    category:    (r.category as string) || 'Other',
    done:        r.done as boolean,
    addedBy:     (r.added_by as string) || '',
    createdAt:   r.created_at as string,
    completedAt: r.completed_at as string | undefined,
    upc:         r.upc as string | undefined,
  };
}

export function useShoppingList() {
  const { householdId, currentMember } = useHousehold();

  const [items,   setItems]   = useState<ShoppingItem[]>([]);
  const [listId,  setListId]  = useState<string | null>(null);
  const [pending, setPending] = useState<Set<string>>(new Set());
  const [status,  setStatus]  = useState<'loading' | 'ready' | 'error'>('loading');

  const load = useCallback(async () => {
    if (!householdId) { setItems([]); setStatus('ready'); return; }
    setStatus('loading');
    const supabase = createClient();

    const { data: lists } = await supabase
      .from('shopping_lists')
      .select('id')
      .eq('household_id', householdId)
      .limit(1)
      .maybeSingle();

    const lid = lists?.id ?? null;
    setListId(lid);

    if (!lid) { setItems([]); setStatus('ready'); return; }

    const { data, error } = await supabase
      .from('shopping_items')
      .select('*')
      .eq('list_id', lid)
      .order('created_at');

    if (error) { setStatus('error'); return; }
    setItems((data || []).map(mapRow));
    setStatus('ready');
  }, [householdId]);

  useEffect(() => { load(); }, [load]);

  // Real-time subscription
  useEffect(() => {
    if (!householdId) return;
    const supabase = createClient();
    const channel = supabase
      .channel('shopping-items')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'shopping_items', filter: `household_id=eq.${householdId}` },
        () => { load(); }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [householdId, load]);

  const checkItem = useCallback(async (id: string) => {
    const now = new Date().toISOString();
    setPending((p) => new Set(p).add(id));
    setItems((prev) =>
      prev.map((it) => it.id === id ? { ...it, done: true, completedAt: now } : it)
    );
    const supabase = createClient();
    await supabase.from('shopping_items').update({ done: true, completed_at: now }).eq('id', id);
    setPending((p) => { const n = new Set(p); n.delete(id); return n; });
  }, []);

  const uncheckItem = useCallback(async (id: string) => {
    setItems((prev) => prev.map((it) => it.id === id ? { ...it, done: false, completedAt: undefined } : it));
    const supabase = createClient();
    await supabase.from('shopping_items').update({ done: false, completed_at: null }).eq('id', id);
  }, []);

  const deleteItem = useCallback(async (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
    const supabase = createClient();
    await supabase.from('shopping_items').delete().eq('id', id);
  }, []);

  const addItem = useCallback(async (item: ShoppingItem) => {
    if (!householdId || !listId) return;
    const supabase = createClient();
    const { data, error } = await supabase
      .from('shopping_items')
      .insert({
        household_id: householdId,
        list_id:      listId,
        name:         item.name,
        qty:          item.qty,
        category:     item.category,
        done:         false,
        added_by:     currentMember?.id ?? null,
        upc:          item.upc,
      })
      .select()
      .single();
    if (!error && data) setItems((prev) => [...prev, mapRow(data)]);
  }, [householdId, listId, currentMember]);

  const activeItems = items.filter((it) => !it.done);
  const doneItems   = items.filter((it) => it.done);

  return {
    items, pending,
    activeItems, doneItems,
    checkItem, uncheckItem, deleteItem, addItem,
    status,
  };
}
