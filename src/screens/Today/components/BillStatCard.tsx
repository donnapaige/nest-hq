import { Icon } from '@/src/components/primitives/Icon';
import { Pill } from '@/src/components/primitives/Pill';
import type { BillLite } from '@/src/lib/types';

interface BillStatCardProps {
  bill: BillLite;
  onClick?: () => void;
}

export function BillStatCard({ bill, onClick }: BillStatCardProps) {
  const isUrgent = bill.daysUntilDue <= 3;
  const warnColor = '#F28C38';

  return (
    <div
      onClick={onClick}
      className="flex-1 bg-surface border border-hairline rounded-card relative cursor-pointer overflow-hidden"
      style={{
        padding: 14,
        borderLeft: isUrgent ? `4px solid ${warnColor}` : undefined,
      }}
    >
      {/* Amber gradient overlay for urgent bills */}
      {isUrgent && (
        <div
          className="absolute inset-0 pointer-events-none rounded-card"
          style={{ background: 'linear-gradient(90deg, #F28C3810 0%, transparent 40%)' }}
        />
      )}
      <div className="relative">
        <div className="flex items-center justify-between mb-2.5">
          <Icon name="coin" size={18} color={isUrgent ? warnColor : '#334266'} />
          {isUrgent && (
            <Pill color={warnColor} size="sm">Due in {bill.daysUntilDue} day{bill.daysUntilDue !== 1 ? 's' : ''}</Pill>
          )}
        </div>
        <div className="text-[13px] text-muted font-medium">{bill.name}</div>
        <div className="mt-0.5" style={{ fontSize: 22, fontWeight: 700, color: '#333333', letterSpacing: -0.4 }}>
          ${bill.amount.toFixed(2).split('.')[0]}
          <span className="text-[13px] text-muted font-medium">.{bill.amount.toFixed(2).split('.')[1]}</span>
        </div>
        <div className="text-[11px] text-muted mt-1.5">{bill.dueLabel}</div>
      </div>
    </div>
  );
}
