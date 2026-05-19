'use client';

import { DueCountdownChip, daysUntilDue } from './DueCountdownChip';
import type { Bill } from '@/src/lib/types';

interface BillCardProps {
  bill: Bill;
  onTogglePaid: (id: string) => void;
}

function formatDueDate(iso: string) {
  const d = new Date(iso);
  return {
    month: d.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
    day:   d.getDate().toString(),
  };
}

export function BillCard({ bill, onTogglePaid }: BillCardProps) {
  const { month, day } = formatDueDate(bill.dueDate);
  const days  = daysUntilDue(bill.dueDate);
  const isUrgent = !bill.paid && days <= 3;

  return (
    <div
      className="bg-surface border border-hairline rounded-card flex items-center gap-3 relative overflow-hidden"
      style={{
        padding: 14,
        opacity: bill.paid ? 0.6 : 1,
        borderLeft: isUrgent ? '4px solid #C65A3A' : undefined,
      }}
    >
      {/* Urgent warm gradient overlay */}
      {isUrgent && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(90deg, #C65A3A18 0%, transparent 60%)' }}
        />
      )}

      {/* Due date badge */}
      <div
        className="flex flex-col items-center justify-center rounded-[12px] shrink-0"
        style={{
          width: 44,
          height: 44,
          background: isUrgent ? '#C65A3A18' : '#33426614',
          color: isUrgent ? '#C65A3A' : '#334266',
        }}
      >
        <span className="text-[9px] font-bold uppercase tracking-[0.4px] leading-none">{month}</span>
        <span className="text-[16px] font-bold leading-tight mt-0.5">{day}</span>
      </div>

      {/* Name / vendor / chip */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[15px] font-semibold text-ink">{bill.name}</span>
          <DueCountdownChip dueDate={bill.dueDate} paid={bill.paid} />
          {bill.autoPay && !bill.paid && (
            <span
              className="text-[11px] font-bold rounded-pill"
              style={{ color: '#334266', background: '#33426618', padding: '2px 8px' }}
            >
              Auto
            </span>
          )}
        </div>
        <div className="text-[12px] text-muted mt-0.5">{bill.vendor}</div>
      </div>

      {/* Amount + paid toggle */}
      <div className="text-right shrink-0">
        <div className="text-[16px] font-bold text-ink" style={{ letterSpacing: -0.3 }}>
          ${bill.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        {/* Toggle switch */}
        <button
          onClick={(e) => { e.stopPropagation(); onTogglePaid(bill.id); }}
          aria-label={bill.paid ? 'Mark unpaid' : 'Mark paid'}
          className="relative mt-1.5 cursor-pointer border-none p-0 ml-auto block"
          style={{
            width: 44,
            height: 24,
            borderRadius: 12,
            background: bill.paid ? '#334266' : '#E8DFCB',
            transition: 'background 0.15s',
          }}
        >
          <div
            className="absolute top-0.5 rounded-full bg-white"
            style={{
              left: bill.paid ? 22 : 2,
              width: 20,
              height: 20,
              boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
              transition: 'left 0.15s',
            }}
          />
        </button>
      </div>
    </div>
  );
}
