'use client';

import { useState, useCallback } from 'react';
import { BILLS_FIXTURE } from '@/src/lib/fixtures/bills';
import type { Bill } from '@/src/lib/types';

export function useBills() {
  const [bills, setBills] = useState<Bill[]>(BILLS_FIXTURE);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('ready');

  const togglePaid = useCallback((id: string) => {
    setBills((prev) =>
      prev.map((b) => (b.id === id ? { ...b, paid: !b.paid } : b))
    );
  }, []);

  const addBill = useCallback((bill: Bill) => {
    setBills((prev) => [...prev, bill]);
  }, []);

  return { bills, status, togglePaid, addBill };
}
