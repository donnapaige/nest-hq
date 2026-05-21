import { AnimatedNumber } from '@/src/components/AnimatedNumber';
import { useHousehold } from '@/src/context/HouseholdContext';
import type { Bill } from '@/src/lib/types';

interface MonthSummaryHeroProps {
  bills: Bill[];
}

export function MonthSummaryHero({ bills }: MonthSummaryHeroProps) {
  const { formatMoney } = useHousehold();

  const outstanding = bills.filter((b) => !b.paid).reduce((s, b) => s + b.amount, 0);
  const paid        = bills.filter((b) => b.paid).reduce((s, b) => s + b.amount, 0);
  const autoPay     = bills.filter((b) => b.autoPay && !b.paid).reduce((s, b) => s + b.amount, 0);
  const manual      = bills.filter((b) => !b.autoPay && !b.paid).reduce((s, b) => s + b.amount, 0);

  return (
    <div className="px-5 pb-[18px] pt-2">
      <div
        className="bg-primary text-white rounded-[20px] relative overflow-hidden"
        style={{ padding: 18 }}
      >
        <div className="text-[12px] font-semibold uppercase tracking-[0.6px]" style={{ opacity: 0.75 }}>
          Outstanding this month
        </div>
        <div className="text-[34px] font-bold mt-1" style={{ letterSpacing: -1 }}>
          {formatMoney(outstanding)}
        </div>

        <div className="flex gap-3.5 mt-3.5 text-[12px]">
          <div>
            <div className="font-semibold" style={{ opacity: 0.7 }}>Paid</div>
            <div className="font-bold text-[14px] mt-0.5">{formatMoney(paid)}</div>
          </div>
          <div className="w-px" style={{ background: 'rgba(255,255,255,0.18)' }} />
          <div>
            <div className="font-semibold" style={{ opacity: 0.7 }}>Auto-pay</div>
            <div className="font-bold text-[14px] mt-0.5">{formatMoney(autoPay)}</div>
          </div>
          <div className="w-px" style={{ background: 'rgba(255,255,255,0.18)' }} />
          <div>
            <div className="font-semibold" style={{ opacity: 0.7 }}>Manual</div>
            <div className="font-bold text-[14px] mt-0.5">{formatMoney(manual)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
