'use client';

import { useState, useRef, useEffect } from 'react';
import { BottomSheet } from '@/src/components/primitives/BottomSheet';
import { ForMemberPicker } from '@/src/components/primitives/ForMemberPicker';
import { createClient } from '@/src/lib/supabase/client';
import type { Bill } from '@/src/lib/types';

interface EditBillSheetProps {
  open: boolean;
  bill: Bill | null;
  onClose: () => void;
  onSave: (id: string, bill: Omit<Bill, 'id'> & { imageUrl?: string; paymentMethod?: string; reminderDaysBefore?: number }) => void;
}

const RECURRENCE = ['monthly', 'weekly', 'yearly', 'none'] as const;

const PAYMENT_METHODS = [
  { id: 'gcash',  label: 'GCash', color: '#0066CC', emoji: '💙' },
  { id: 'maya',   label: 'Maya',  color: '#00A86B', emoji: '💚' },
  { id: 'bpi',    label: 'BPI',   color: '#CC0000', emoji: '❤️' },
  { id: 'bdo',    label: 'BDO',   color: '#0066CC', emoji: '💙' },
  { id: 'manual', label: 'Cash',  color: '#8A7E6B', emoji: '💵' },
  { id: 'auto',   label: 'Auto',  color: '#334266', emoji: '🔄' },
];

const ARRIVAL_DAYS = Array.from({ length: 28 }, (_, i) => i + 1);

export function EditBillSheet({ open, bill, onClose, onSave }: EditBillSheetProps) {
  const [name,           setName]          = useState('');
  const [vendor,         setVendor]        = useState('');
  const [amount,         setAmount]        = useState('');
  const [dueDate,        setDueDate]       = useState('');
  const [recurrence,     setRecurrence]    = useState<string>('monthly');
  const [autoPay,        setAutoPay]       = useState(false);
  const [paymentMethod,  setPaymentMethod] = useState('manual');
  const [reminderDays,   setReminderDays]  = useState('3');
  const [billType,       setBillType]      = useState<'fixed' | 'variable'>('fixed');
  const [arrivalDay,     setArrivalDay]    = useState('5');
  const [remindArrival,  setRemindArrival] = useState(true);
  const [imageUrl,       setImageUrl]      = useState('');
  const [previewUrl,     setPreviewUrl]    = useState('');
  const [uploading,      setUploading]     = useState(false);
  const [error,          setError]         = useState('');
  const [forMemberId,    setForMemberId]   = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Populate form when bill changes
  useEffect(() => {
    if (!bill) return;
    setName(bill.name);
    setVendor(bill.vendor || '');
    setAmount(bill.amount ? String(bill.amount) : '');
    setDueDate(bill.dueDate);
    setRecurrence(bill.recurrence ?? 'none');
    setAutoPay(bill.autoPay ?? false);
    setBillType(bill.billType ?? 'fixed');
    setArrivalDay(bill.arrivalDay ? String(bill.arrivalDay) : '5');
    setRemindArrival(bill.remindArrival ?? true);
    setForMemberId(bill.forMemberId ?? null);
    setImageUrl('');
    setPreviewUrl('');
    setError('');
  }, [bill]);

  const handleImagePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const supabase = createClient();
    const path = `bills/${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
    const { error: upErr } = await supabase.storage.from('bill-images').upload(path, file);
    if (upErr) { setError('Image upload failed'); setUploading(false); return; }
    const { data: signed } = await supabase.storage.from('bill-images').createSignedUrl(path, 3600);
    setImageUrl(path);
    if (signed?.signedUrl) setPreviewUrl(signed.signedUrl);
    setUploading(false);
  };

  const handleSave = () => {
    if (!bill) return;
    if (!name.trim()) { setError('Name is required'); return; }
    if (billType === 'fixed' && (!amount || isNaN(Number(amount)))) { setError('Valid amount is required for fixed bills'); return; }
    setError('');
    onSave(bill.id, {
      name:               name.trim(),
      vendor:             vendor.trim(),
      amount:             billType === 'variable' ? (bill.amount ?? 0) : Number(amount),
      dueDate,
      paid:               bill.paid,
      autoPay,
      recurrence:         recurrence === 'none' ? null : (recurrence as Bill['recurrence']),
      imageUrl:           imageUrl || undefined,
      paymentMethod,
      reminderDaysBefore: Number(reminderDays) || undefined,
      billType,
      arrivalDay:         billType === 'variable' ? Number(arrivalDay) : null,
      remindArrival:      billType === 'variable' ? remindArrival : false,
      amountConfirmed:    billType === 'fixed' ? true : (bill.amountConfirmed ?? false),
      forMemberId:        forMemberId || null,
    });
    onClose();
  };

  const rowCls   = 'flex items-center min-h-[56px] px-4 border-b border-hairline';
  const labelCls = 'text-[13px] text-muted font-medium w-32 shrink-0';
  const valCls   = 'flex-1 text-[15px] text-ink font-medium bg-transparent border-none outline-none';

  if (!bill) return null;

  return (
    <BottomSheet open={open} onClose={onClose} snapPercent={95}>
      <div className="pt-2 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={onClose} className="text-[15px] text-ink font-medium bg-transparent border-none cursor-pointer p-0">Cancel</button>
          <span className="text-[15px] font-bold text-ink">Edit bill</span>
          <button
            onClick={handleSave}
            disabled={!name.trim() || uploading}
            className="text-[15px] font-bold text-primary bg-transparent border-none cursor-pointer p-0 disabled:opacity-40"
          >
            Update
          </button>
        </div>

        {error && <p className="text-danger text-xs mb-3 px-1">{error}</p>}

        <input
          className="w-full text-h2 font-bold text-ink bg-transparent border-none outline-none mb-4 placeholder:text-muted/50"
          placeholder="Bill name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {/* Fixed vs Variable toggle */}
        <div className="mb-4">
          <p className="text-[12px] font-bold text-muted mb-2" style={{ letterSpacing: 0.6, textTransform: 'uppercase' }}>Amount type</p>
          <div className="flex rounded-xl overflow-hidden p-1 gap-1" style={{ background: '#F0E5D2' }}>
            <button
              onClick={() => setBillType('fixed')}
              className="flex-1 py-2.5 rounded-lg text-[13px] font-bold border-none cursor-pointer transition-all"
              style={{ background: billType === 'fixed' ? '#334266' : 'transparent', color: billType === 'fixed' ? '#fff' : '#8A7E6B' }}
            >
              🔒 Fixed
            </button>
            <button
              onClick={() => setBillType('variable')}
              className="flex-1 py-2.5 rounded-lg text-[13px] font-bold border-none cursor-pointer transition-all"
              style={{ background: billType === 'variable' ? '#DBA03A' : 'transparent', color: billType === 'variable' ? '#fff' : '#8A7E6B' }}
            >
              📊 Variable
            </button>
          </div>
        </div>

        {/* Bill image */}
        <div className="mb-4">
          {imageUrl ? (
            <div className="relative rounded-xl overflow-hidden h-32" style={{ border: '1px solid #E8DFCB' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewUrl} alt="Bill" className="w-full h-full object-cover" />
              <button onClick={() => { setImageUrl(''); setPreviewUrl(''); }} className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: 'rgba(0,0,0,0.5)', border: 'none', cursor: 'pointer' }}>✕</button>
            </div>
          ) : (
            <button onClick={() => fileRef.current?.click()} disabled={uploading} className="w-full h-16 rounded-xl flex items-center justify-center gap-2" style={{ background: '#F0E5D2', border: '2px dashed #E8DFCB', cursor: 'pointer' }}>
              <span style={{ fontSize: 18 }}>📸</span>
              <span style={{ fontSize: 12, color: '#8A7E6B', fontWeight: 600 }}>{uploading ? 'Uploading…' : 'Replace bill photo'}</span>
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImagePick} />
        </div>

        {/* Payment method */}
        <div className="mb-4">
          <p className="text-[12px] font-bold text-muted mb-2" style={{ letterSpacing: 0.6, textTransform: 'uppercase' }}>Pay with</p>
          <div className="flex flex-wrap gap-2">
            {PAYMENT_METHODS.map((pm) => (
              <button key={pm.id} onClick={() => setPaymentMethod(pm.id)} className="px-3 py-1.5 rounded-full text-[13px] font-bold flex items-center gap-1.5" style={{ background: paymentMethod === pm.id ? pm.color : '#F0E5D2', color: paymentMethod === pm.id ? '#fff' : '#334266', border: 'none', cursor: 'pointer', transition: 'all 0.15s' }}>
                <span>{pm.emoji}</span> {pm.label}
              </button>
            ))}
          </div>
        </div>

        {/* For (optional) */}
        <ForMemberPicker value={forMemberId} onChange={setForMemberId} />

        {/* Core fields */}
        <div className="bg-surface border border-hairline rounded-card overflow-hidden mb-4">
          <div className={rowCls}>
            <span className={labelCls}>Vendor</span>
            <input placeholder="e.g. Meralco" value={vendor} onChange={(e) => setVendor(e.target.value)} className={valCls} />
          </div>
          {billType === 'fixed' && (
            <div className={rowCls}>
              <span className={labelCls}>Amount</span>
              <input type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} className={valCls} />
            </div>
          )}
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
          <div className={rowCls + ' border-none'}>
            <span className={labelCls}>Auto-pay</span>
            <button onClick={() => setAutoPay((p) => !p)} className="relative cursor-pointer border-none p-0" style={{ width: 44, height: 24, borderRadius: 12, background: autoPay ? '#334266' : '#E8DFCB', transition: 'background 0.15s' }} aria-label="Toggle auto-pay">
              <div className="absolute top-0.5 rounded-full bg-white" style={{ left: autoPay ? 22 : 2, width: 20, height: 20, boxShadow: '0 1px 2px rgba(0,0,0,0.15)', transition: 'left 0.15s' }} />
            </button>
          </div>
        </div>

        {/* Variable bill settings */}
        {billType === 'variable' && (
          <div className="rounded-[14px] p-4 mb-4" style={{ background: '#FFF8EC', border: '1.5px solid #DBA03A33' }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#DBA03A', marginBottom: 10 }}>📊 Variable bill settings</p>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#1E1E2E' }}>Bill arrives around day…</p>
                <p style={{ fontSize: 11, color: '#8A7E6B' }}>Day of the month you usually receive it</p>
              </div>
              <select value={arrivalDay} onChange={(e) => setArrivalDay(e.target.value)} className="px-3 py-1.5 rounded-lg text-sm font-bold cursor-pointer" style={{ background: '#F0E5D2', border: 'none', color: '#334266' }}>
                {ARRIVAL_DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#1E1E2E' }}>Remind me to enter amount</p>
                <p style={{ fontSize: 11, color: '#8A7E6B' }}>Shows a badge when the bill is due for input</p>
              </div>
              <button onClick={() => setRemindArrival((p) => !p)} className="relative cursor-pointer border-none p-0 flex-shrink-0" style={{ width: 44, height: 24, borderRadius: 12, background: remindArrival ? '#DBA03A' : '#E8DFCB', transition: 'background 0.15s' }} aria-label="Toggle arrival reminder">
                <div className="absolute top-0.5 rounded-full bg-white" style={{ left: remindArrival ? 22 : 2, width: 20, height: 20, boxShadow: '0 1px 2px rgba(0,0,0,0.15)', transition: 'left 0.15s' }} />
              </button>
            </div>
          </div>
        )}

        {/* Due reminder */}
        <div className="bg-surface border border-hairline rounded-card overflow-hidden mb-4">
          <div className={rowCls + ' border-none'}>
            <span className={labelCls}>Due reminder</span>
            <select value={reminderDays} onChange={(e) => setReminderDays(e.target.value)} className={valCls + ' cursor-pointer'}>
              <option value="0">No reminder</option>
              <option value="1">1 day before</option>
              <option value="3">3 days before</option>
              <option value="7">1 week before</option>
              <option value="14">2 weeks before</option>
            </select>
          </div>
        </div>

        {/* Delete prompt */}
        <p style={{ fontSize: 12, color: '#C65A3A', textAlign: 'center', marginTop: 8, cursor: 'default' }}>
          To delete this bill, swipe left on the card.
        </p>
      </div>
    </BottomSheet>
  );
}
