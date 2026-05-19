'use client';

import { useState } from 'react';
import { BottomSheet } from '@/src/components/primitives/BottomSheet';
import { Avatar } from '@/src/components/primitives/Avatar';
import { MEMBER_IDS } from '@/src/lib/members';
import type { ShoppingItem, MemberId, ShoppingCategory } from '@/src/lib/types';

const CATEGORIES: ShoppingCategory[] = ['Produce', 'Dairy', 'Pantry', 'Household'];

interface AddItemSheetProps {
  open: boolean;
  onClose: () => void;
  initial?: Partial<ShoppingItem>;
  onSave: (item: ShoppingItem) => void;
}

export function AddItemSheet({ open, onClose, initial, onSave }: AddItemSheetProps) {
  const [name, setName]         = useState(initial?.name ?? '');
  const [qty, setQty]           = useState(initial?.qty ?? '');
  const [category, setCategory] = useState<ShoppingCategory>(
    (initial?.category as ShoppingCategory) ?? 'Produce'
  );
  const [addedBy, setAddedBy]   = useState<MemberId>(initial?.addedBy ?? 'maya');
  const [error, setError]       = useState('');

  const handleSave = () => {
    if (!name.trim()) { setError('Item name is required'); return; }
    setError('');
    onSave({
      id: initial?.id ?? `item-${Date.now()}`,
      name: name.trim(),
      qty: qty || undefined,
      category,
      done: false,
      addedBy,
      createdAt: new Date().toISOString(),
      upc: initial?.upc,
    });
    onClose();
  };

  const rowCls   = 'flex items-center h-14 px-4 border-b border-hairline';
  const labelCls = 'text-[13px] text-muted font-medium w-24 shrink-0';
  const valCls   = 'flex-1 text-[15px] text-ink font-medium bg-transparent border-none outline-none';

  return (
    <BottomSheet open={open} onClose={onClose} snapPercent={80}>
      <div className="pt-2 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={onClose} className="text-[15px] text-ink font-medium bg-transparent border-none cursor-pointer p-0">
            Cancel
          </button>
          <span className="text-[15px] font-bold text-ink">Add item</span>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="text-[15px] font-bold text-primary bg-transparent border-none cursor-pointer p-0 disabled:opacity-40"
          >
            Add
          </button>
        </div>

        {error && <p className="text-danger text-xs mb-3 px-1">{error}</p>}

        <input
          className="w-full text-h2 font-bold text-ink bg-transparent border-none outline-none mb-4 placeholder:text-muted/50"
          placeholder="Item name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />

        {/* Who's adding */}
        <div className="mb-4">
          <div className="text-label text-muted mb-2">Added by</div>
          <div className="flex gap-2">
            {MEMBER_IDS.map((id) => (
              <button
                key={id}
                onClick={() => setAddedBy(id)}
                className={`rounded-full border-2 transition-all duration-[200ms] p-0 cursor-pointer ${
                  addedBy === id ? 'border-transparent' : 'border-transparent opacity-40'
                }`}
              >
                <Avatar member={id} size={36} ring={addedBy === id} />
              </button>
            ))}
          </div>
        </div>

        <div className="bg-surface border border-hairline rounded-card overflow-hidden">
          <div className={rowCls}>
            <span className={labelCls}>Quantity</span>
            <input
              placeholder="e.g. 1 gal, 3, bunch"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              className={valCls}
            />
          </div>
          <div className={rowCls + ' border-none'}>
            <span className={labelCls}>Category</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ShoppingCategory)}
              className={valCls + ' cursor-pointer'}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </BottomSheet>
  );
}
