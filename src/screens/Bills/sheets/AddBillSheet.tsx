'use client';

import { useState, useRef } from 'react';
import { BottomSheet } from '@/src/components/primitives/BottomSheet';
import { createClient } from '@/src/lib/supabase/client';
import type { Bill } from '@/src/lib/types';

interface AddBillSheetProps {
  open: boolean;
  onClose: () => void;
  onSave: (bill: Omit<Bill, 'id'> & { imageUrl?: string; paymentMethod?: string; reminderDaysBefore?: number }) => void;
}

const RECURRENCE = ['monthly', 'weekly', 'yearly', 'none'] as const;

const PAYMENT_METHODS = [
  { id: 'gcash', label: 'GCash',  color: '#0066CC', emoji: '💙' },
  { id: 'maya',  label: 'Maya',   color: '#00A86B', emoji: '💚' },
  { id: 'bpi',   label: 'BPI',    color: '#CC0000', emoji: '❤️' },
  { id: 'bdo',   label: 'BDO',    color: '#0066CC', emoji: '💙' },
  { id: 'manual',label: 'Cash',   color: '#8A7E6B', emoji: '💵' },
  { id: 'auto',  label: 'Auto',   color: '#334266', emoji: '🔄' },
];

export function AddBillSheet({ open, onClose, onSave }: AddBillSheetProps) {
  const [name,           setName]          = useState('');
  const [vendor,         setVendor]        = useState('');
  const [amount,         setAmount]        = useState('');
  const [dueDate,        setDueDate]       = useState(new Date().toISOString().split('T')[0]);
  const [recurrence,     setRecurrence]    = useState<string>('monthly');
  const [autoPay,        setAutoPay]       = useState(false);
  const [paymentMethod,  setPaymentMethod] = useState('manual');
  const [reminderDays,   setReminderDays]  = useState('3');
  const [imageUrl,       setImageUrl]      = useState('');
  const [uploading,      setUploading]     = useState(false);
  const [error,          setError]         = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImagePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const supabase = createClient();
    const path = `bills/${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
    const { error: upErr } = await supabase.storage.from('bill-images').upload(path, file);
    if (upErr) { setError('Image upload failed'); setUploading(false); return; }
    const { data } = supabase.storage.from('bill-images').getPublicUrl(path);
    setImageUrl(data.publicUrl);
    setUploading(false);
  };

  const handleSave = () => {
    if (!name.trim()) { setError('Name is required'); return; }
    if (!amount || isNaN(Number(amount))) { setError('Valid amount is required'); return; }
    setError('');
    onSave({
      name:               name.trim(),
      vendor:             vendor.trim(),
      amount:             Number(amount),
      dueDate,
      paid:               false,
      autoPay,
      recurrence:         recurrence === 'none' ? null : (recurrence as Bill['recurrence']),
      imageUrl:           imageUrl || undefined,
      paymentMethod,
      reminderDaysBefore: Number(reminderDays) || undefined,
    });
    setName(''); setVendor(''); setAmount(''); setRecurrence('monthly');
    setAutoPay(false); setPaymentMethod('manual'); setReminderDays('3');
    setImageUrl(''); setError('');
    onClose();
  };

  const rowCls   = 'flex items-center h-14 px-4 border-b border-hairline';
  const labelCls = 'text-[13px] text-muted font-medium w-28 shrink-0';
  const valCls   = 'flex-1 text-[15px] text-ink font-medium bg-transparent border-none outline-none';

  return (
    <BottomSheet open={open} onClose={onClose} snapPercent={92}>
      <div className="pt-2 pb-8">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onClose} className="text-[15px] text-ink font-medium bg-transparent border-none cursor-pointer p-0">Cancel</button>
          <span className="text-[15px] font-bold text-ink">New bill</span>
          <button
            onClick={handleSave}
            disabled={!name.trim() || !amount || uploading}
            className="text-[15px] font-bold text-primary bg-transparent border-none cursor-pointer p-0 disabled:opacity-40"
          >
            Save
          </button>
        </div>

        {error && <p className="text-danger text-xs mb-3 px-1">{error}</p>}

        <input
          className="w-full text-h2 font-bold text-ink bg-transparent border-none outline-none mb-4 placeholder:text-muted/50"
          placeholder="Bill name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />

        {/* Bill image */}
        <div className="mb-4">
          {imageUrl ? (
            <div className="relative rounded-xl overflow-hidden h-36" style={{ border: '1px solid #E8DFCB' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt="Bill" className="w-full h-full object-cover" />
              <button
                onClick={() => setImageUrl('')}
                className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{ background: 'rgba(0,0,0,0.5)', border: 'none', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="w-full h-20 rounded-xl flex flex-col items-center justify-center gap-1"
              style={{ background: '#F0E5D2', border: '2px dashed #E8DFCB', cursor: 'pointer' }}
            >
              <span style={{ fontSize: 22 }}>📸</span>
              <span style={{ fontSize: 12, color: '#8A7E6B', fontWeight: 600 }}>
                {uploading ? 'Uploading…' : 'Add bill photo'}
              </span>
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleImagePick}
          />
        </div>

        {/* Payment method */}
        <div className="mb-4">
          <p className="text-[12px] font-bold text-muted mb-2" style={{ letterSpacing: 0.6, textTransform: 'uppercase' }}>Pay with</p>
          <div className="flex flex-wrap gap-2">
            {PAYMENT_METHODS.map((pm) => (
              <button
                key={pm.id}
                onClick={() => setPaymentMethod(pm.id)}
                className="px-3 py-1.5 rounded-full text-[13px] font-bold flex items-center gap-1.5"
                style={{
                  background:   paymentMethod === pm.id ? pm.color : '#F0E5D2',
                  color:        paymentMethod === pm.id ? '#fff' : '#334266',
                  border:       'none',
                  cursor:       'pointer',
                  transition:   'all 0.15s',
                }}
              >
                <span>{pm.emoji}</span> {pm.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-surface border border-hairline rounded-card overflow-hidden">
          <div className={rowCls}>
            <span className={labelCls}>Vendor</span>
            <input placeholder="e.g. Meralco" value={vendor} onChange={(e) => setVendor(e.target.value)} className={valCls} />
          </div>
          <div className={rowCls}>
            <span className={labelCls}>Amount</span>
            <input type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} className={valCls} />
          </div>
          <div className={rowCls}>
            <span className={labelCls}>Due date</span>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={valCls} />
          </div>
          <div className={rowCls}>
            <span className={labelCls}>Repeats</span>
            <select value={recurrence} onChange={(e) => setRecurrence(e.target.value)} className={valCls + ' cursor-pointer'}>
              {RECURRENCE.map((r) => (
                <option key={r} value={r}>{r === 'none' ? 'Does not repeat' : r.charAt(0).toUpperCase() + r.slice(1)}</option>
              ))}
            </select>
          </div>
          <div className={rowCls}>
            <span className={labelCls}>Remind me</span>
            <select value={reminderDays} onChange={(e) => setReminderDays(e.target.value)} className={valCls + ' cursor-pointer'}>
              <option value="0">No reminder</option>
              <option value="1">1 day before</option>
              <option value="3">3 days before</option>
              <option value="7">1 week before</option>
              <option value="14">2 weeks before</option>
            </select>
          </div>
          <div className={rowCls + ' border-none'}>
            <span className={labelCls}>Auto-pay</span>
            <button
              onClick={() => setAutoPay((p) => !p)}
              className="relative cursor-pointer border-none p-0"
              style={{
                width: 44, height: 24, borderRadius: 12,
                background: autoPay ? '#334266' : '#E8DFCB',
                transition: 'background 0.15s',
              }}
              aria-label="Toggle auto-pay"
            >
              <div
                className="absolute top-0.5 rounded-full bg-white"
                style={{
                  left: autoPay ? 22 : 2, width: 20, height: 20,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
                  transition: 'left 0.15s',
                }}
              />
            </button>
          </div>
        </div>
      </div>
    </BottomSheet>
  );
}
