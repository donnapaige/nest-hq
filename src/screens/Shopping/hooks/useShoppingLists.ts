'use client';

import { useState, useCallback, useEffect } from 'react';
import { createClient } from '@/src/lib/supabase/client';
import { useHousehold } from '@/src/context/HouseholdContext';

export interface ListItem {
  id: string;
  name: string;
  category: string;
  done: boolean;
  addedBy: string;
  createdAt: string;
}

export interface ShoppingList {
  id: string;
  name: string;
  items: ListItem[];
}

export const SHOPPING_CATEGORIES = [
  'General', 'Produce', 'Meat', 'Pantry', 'Dairy',
  'Frozen', 'Baby', 'Household', 'Personal Care', 'Beverages',
];

export function useShoppingLists() {
  const { householdId, currentMember } = useHousehold();
  const [lists,  setLists]  = useState<ShoppingList[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  const load = useCallback(async () => {
    if (!householdId) { setLists([]); setStatus('ready'); return; }
    setStatus('loading');
    const supabase = createClient();

    const { data: listsData, error: listErr } = await supabase
      .from('shopping_lists')
      .select('id, name')
      .eq('household_id', householdId)
      .order('created_at');

    if (listErr) { setStatus('error'); return; }
    if (!listsData?.length) { setLists([]); setStatus('ready'); return; }

    const { data: itemsData } = await supabase
      .from('shopping_items')
      .select('*')
      .in('list_id', listsData.map((l) => l.id))
      .order('created_at');

    const byList: Record<string, ListItem[]> = {};
    for (const item of itemsData || []) {
      if (!byList[item.list_id]) byList[item.list_id] = [];
      byList[item.list_id].push({
        id:        item.id,
        name:      item.name,
        category:  item.category || 'General',
        done:      item.done,
        addedBy:   item.added_by || '',
        createdAt: item.created_at,
      });
    }

    setLists(listsData.map((l) => ({ id: l.id, name: l.name, items: byList[l.id] || [] })));
    setStatus('ready');
  }, [householdId]);

  useEffect(() => { load(); }, [load]);

  // Realtime
  useEffect(() => {
    if (!householdId) return;
    const supabase = createClient();
    const ch = supabase
      .channel('shopping-lists-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shopping_items', filter: `household_id=eq.${householdId}` }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shopping_lists',  filter: `household_id=eq.${householdId}` }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [householdId, load]);

  const createList = useCallback(async (name: string) => {
    if (!householdId) return;
    const supabase = createClient();
    const { data, error } = await supabase
      .from('shopping_lists')
      .insert({ household_id: householdId, name: name.trim() })
      .select('id, name')
      .single();
    if (!error && data) setLists((prev) => [...prev, { id: data.id, name: data.name, items: [] }]);
    return data?.id;
  }, [householdId]);

  const deleteList = useCallback(async (listId: string) => {
    setLists((prev) => prev.filter((l) => l.id !== listId));
    const supabase = createClient();
    await supabase.from('shopping_lists').delete().eq('id', listId);
  }, []);

  const addItem = useCallback(async (listId: string, name: string, category = 'General') => {
    if (!householdId || !name.trim()) return;
    const supabase = createClient();
    const { data, error } = await supabase
      .from('shopping_items')
      .insert({
        household_id: householdId,
        list_id:      listId,
        name:         name.trim(),
        category,
        done:         false,
        added_by:     currentMember?.id ?? null,
      })
      .select()
      .single();
    if (!error && data) {
      const newItem: ListItem = {
        id: data.id, name: data.name, category: data.category || 'General',
        done: data.done, addedBy: data.added_by || '', createdAt: data.created_at,
      };
      setLists((prev) => prev.map((l) => l.id === listId ? { ...l, items: [...l.items, newItem] } : l));
    }
  }, [householdId, currentMember]);

  const toggleItem = useCallback(async (listId: string, itemId: string) => {
    setLists((prev) => prev.map((l) => l.id === listId
      ? { ...l, items: l.items.map((it) => it.id === itemId ? { ...it, done: !it.done } : it) }
      : l
    ));
    const supabase = createClient();
    const list = lists.find((l) => l.id === listId);
    const item = list?.items.find((it) => it.id === itemId);
    if (!item) return;
    await supabase.from('shopping_items').update({ done: !item.done, completed_at: !item.done ? new Date().toISOString() : null }).eq('id', itemId);
  }, [lists]);

  const deleteItem = useCallback(async (listId: string, itemId: string) => {
    setLists((prev) => prev.map((l) => l.id === listId ? { ...l, items: l.items.filter((it) => it.id !== itemId) } : l));
    const supabase = createClient();
    await supabase.from('shopping_items').delete().eq('id', itemId);
  }, []);

  return { lists, status, load, createList, deleteList, addItem, toggleItem, deleteItem };
}
