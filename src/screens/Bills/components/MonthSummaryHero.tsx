import { AnimatedNumber } from '@/src/components/AnimatedNumber';
import type { Bill } from '@/src/lib/types';

interface MonthSummaryHeroProps {
  bills: Bill[];
}

export function MonthSummaryHero({ bills }: MonthSummaryHeroProps) {
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
          $<AnimatedNumber value={Math.floor(outstanding)} duration={1000} />
          <span className="text-[18px] font-semibold" style={{ opacity: 0.7 }}>
            .{String(Math.round((outstanding % 1) * 100)).padStart(2, '0')}
          </span>
        </div>

        <div className="flex gap-3.5 mt-3.5 text-[12px]">
          <div>
            <div className="font-semibold" style={{ opacity: 0.7 }}>Paid</div>
            <div className="font-bold text-[14px] mt-0.5">
              ${paid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="w-px" style={{ background: 'rgba(255,255,255,0.18)' }} />
          <div>
            <div className="font-semibold" style={{ opacity: 0.7 }}>Auto-pay</div>
            <div className="font-bold text-[14px] mt-0.5">
              ${autoPay.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
          </div>
          <div className="w-px" style={{ background: 'rgba(255,255,255,0.18)' }} />
          <div>
            <div className="font-semibold" style={{ opacity: 0.7 }}>Manual</div>
            <div className="font-bold text-[14px] mt-0.5">
              ${manual.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
