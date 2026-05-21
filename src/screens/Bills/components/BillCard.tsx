'use client';

import { useState } from 'react';
import { DueCountdownChip, daysUntilDue } from './DueCountdownChip';
import { useHousehold } from '@/src/context/HouseholdContext';
import type { Bill } from '@/src/lib/types';

interface BillCardProps {
  bill: Bill;
  onTogglePaid: (id: string) => void;
  onUpdateAmount: (id: string, amount: number) => void;
}

function formatDueDate(iso: string) {
  const d = new Date(iso);
  return {
    month: d.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
    day:   d.getDate().toString(),
  };
}

// Returns true if today is on/after the arrival day this month
function isArrivalDue(arrivalDay: number | null | undefined): boolean {
  if (!arrivalDay) return false;
  return new Date().getDate() >= arrivalDay;
}

export function BillCard({ bill, onTogglePaid, onUpdateAmount }: BillCardProps) {
  const { formatMoney } = useHousehold();
  const { month, day } = formatDueDate(bill.dueDate);
  const days    = daysUntilDue(bill.dueDate);
  const isUrgent = !bill.paid && days <= 3;

  const needsAmount = bill.billType === 'variable' && !bill.amountConfirmed;
  const showArrivalBadge = needsAmount && bill.remindArrival && isArrivalDue(bill.arrivalDay);

  const [editingAmount, setEditingAmount] = useState(false);
  const [amountInput,   setAmountInput]   = useState('');

  const handleAmountSave = () => {
    const val = Number(amountInput);
    if (!isNaN(val) && val > 0) {
      onUpdateAmount(bill.id, val);
    }
    setEditingAmount(false);
    setAmountInput('');
  };

  return (
    <div
      className="bg-surface border border-hairline rounded-card relative overflow-hidden"
      style={{
        opacity:    bill.paid ? 0.6 : 1,
        borderLeft: isUrgent ? '4px solid #C65A3A' : needsAmount ? '4px solid #DBA03A' : undefined,
      }}
    >
      {/* Arrival reminder banner */}
      {showArrivalBadge && !bill.paid && (
        <button
          onClick={() => setEditingAmount(true)}
          className="w-full px-4 py-2 flex items-center gap-2 text-left"
          style={{ background: '#FFF8EC', borderBottom: '1px solid #DBA03A33', border: 'none', cursor: 'pointer' }}
        >
          <span style={{ fontSize: 14 }}>📋</span>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#DBA03A', flex: 1 }}>
            Bill arrived — tap to enter this month&apos;s amount
          </p>
          <span style={{ fontSize: 12, color: '#DBA03A', fontWeight: 600 }}>Enter →</span>
        </button>
      )}

      {/* Variable bill without arrival reminder but still needs amount */}
      {needsAmount && !showArrivalBadge && !bill.paid && (
        <button
          onClick={() => setEditingAmount(true)}
          className="w-full px-4 py-2 flex items-center gap-2 text-left"
          style={{ background: '#FFF8EC', borderBottom: '1px solid #DBA03A33', border: 'none', cursor: 'pointer' }}
        >
          <span style={{ fontSize: 14 }}>📊</span>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#DBA03A', flex: 1 }}>Variable bill — enter this cycle&apos;s amount</p>
          <span style={{ fontSize: 12, color: '#DBA03A', fontWeight: 600 }}>Enter →</span>
        </button>
      )}

      {/* Amount edit inline */}
      {editingAmount && (
        <div className="px-4 py-3 flex items-center gap-2" style={{ background: '#FFF8EC', borderBottom: '1px solid #DBA03A33' }}>
          <span style={{ fontSize: 13, color: '#8A7E6B', fontWeight: 600, flexShrink: 0 }}>Amount this cycle:</span>
          <input
            autoFocus
            type="number"
            placeholder="0.00"
            value={amountInput}
            onChange={(e) => setAmountInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAmountSave(); if (e.key === 'Escape') setEditingAmount(false); }}
            className="flex-1 px-2 py-1 rounded-lg text-sm border outline-none"
            style={{ borderColor: '#DBA03A', background: '#fff', color: '#1E1E2E' }}
          />
          <button onClick={handleAmountSave} className="px-3 py-1 rounded-lg text-sm font-bold text-white flex-shrink-0" style={{ background: '#DBA03A', border: 'none', cursor: 'pointer' }}>Save</button>
          <button onClick={() => setEditingAmount(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8A7E6B', fontSize: 18, lineHeight: 1, padding: '0 2px' }}>✕</button>
        </div>
      )}

      {/* Main card row */}
      <div className="flex items-center gap-3 px-4 py-3.5 relative">
        {/* Urgent gradient overlay */}
        {isUrgent && (
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(90deg, #C65A3A18 0%, transparent 60%)' }} />
        )}

        {/* Due date badge */}
        <div className="flex flex-col items-center justify-center rounded-[12px] shrink-0" style={{ width: 44, height: 44, background: isUrgent ? '#C65A3A18' : '#33426614', color: isUrgent ? '#C65A3A' : '#334266' }}>
          <span className="text-[9px] font-bold uppercase tracking-[0.4px] leading-none">{month}</span>
          <span className="text-[16px] font-bold leading-tight mt-0.5">{day}</span>
        </div>

        {/* Name / vendor / chip */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[15px] font-semibold text-ink">{bill.name}</span>
            {bill.billType === 'variable' && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: '#DBA03A22', color: '#DBA03A' }}>variable</span>
            )}
            <DueCountdownChip dueDate={bill.dueDate} paid={bill.paid} />
            {bill.autoPay && !bill.paid && (
              <span className="text-[11px] font-bold rounded-pill" style={{ color: '#334266', background: '#33426618', padding: '2px 8px' }}>Auto</span>
            )}
          </div>
          <div className="text-[12px] text-muted mt-0.5">{bill.vendor}</div>
        </div>

        {/* Amount + paid toggle */}
        <div className="text-right shrink-0">
          <div className="text-[16px] font-bold text-ink" style={{ letterSpacing: -0.3 }}>
            {needsAmount ? (
              <span style={{ color: '#DBA03A', fontSize: 13 }}>TBD</span>
            ) : (
              formatMoney(bill.amount)
            )}
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onTogglePaid(bill.id); }}
            aria-label={bill.paid ? 'Mark unpaid' : 'Mark paid'}
            className="relative mt-1.5 cursor-pointer border-none p-0 ml-auto block"
            style={{ width: 44, height: 24, borderRadius: 12, background: bill.paid ? '#334266' : '#E8DFCB', transition: 'background 0.15s' }}
          >
            <div className="absolute top-0.5 rounded-full bg-white" style={{ left: bill.paid ? 22 : 2, width: 20, height: 20, boxShadow: '0 1px 2px rgba(0,0,0,0.15)', transition: 'left 0.15s' }} />
          </button>
        </div>
      </div>
    </div>
  );
}
