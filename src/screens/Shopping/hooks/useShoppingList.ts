'use client';

import { useState, useCallback } from 'react';
import { SHOPPING_FIXTURE } from '@/src/lib/fixtures/shopping';
import type { ShoppingItem } from '@/src/lib/types';

export function useShoppingList() {
  const [items, setItems] = useState<ShoppingItem[]>(SHOPPING_FIXTURE);
  const [pending, setPending] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('ready');

  const checkItem = useCallback((id: string) => {
    setPending((p) => new Set(p).add(id));
    setTimeout(() => {
      setItems((prev) =>
        prev.map((it) =>
          it.id === id
            ? { ...it, done: true, completedAt: new Date().toISOString() }
            : it
        )
      );
      setPending((p) => { const n = new Set(p); n.delete(id); return n; });
    }, 480);
  }, []);

  const uncheckItem = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((it) =>
        it.id === id ? { ...it, done: false, completedAt: undefined } : it
      )
    );
  }, []);

  const deleteItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  }, []);

  const addItem = useCallback((item: ShoppingItem) => {
    setItems((prev) => [...prev, item]);
  }, []);

  const activeItems  = items.filter((it) => !it.done);
  const doneItems    = items.filter((it) => it.done);

  return {
    items,
    pending,
    activeItems,
    doneItems,
    checkItem,
    uncheckItem,
    deleteItem,
    addItem,
    status,
  };
}
