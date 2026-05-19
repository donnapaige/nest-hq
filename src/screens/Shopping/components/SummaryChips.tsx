interface SummaryChipsProps {
  toBuy: number;
  inCart: number;
}

export function SummaryChips({ toBuy, inCart }: SummaryChipsProps) {
  return (
    <div className="flex gap-2 px-5 pb-4">
      <div
        className="flex-1 bg-primary rounded-[14px] text-white"
        style={{ padding: '12px 14px' }}
      >
        <div className="text-[11px] font-bold tracking-[0.6px] uppercase" style={{ opacity: 0.7 }}>
          To buy
        </div>
        <div className="text-[22px] font-bold mt-0.5" style={{ letterSpacing: -0.4 }}>
          {toBuy} items
        </div>
      </div>

      <div
        className="flex-1 bg-surface border border-hairline rounded-[14px]"
        style={{ padding: '12px 14px' }}
      >
        <div className="text-[11px] font-bold tracking-[0.6px] uppercase text-muted" style={{ opacity: 0.6 }}>
          In cart
        </div>
        <div className="text-[22px] font-bold text-accent mt-0.5" style={{ letterSpacing: -0.4 }}>
          {inCart} items
        </div>
      </div>
    </div>
  );
}
