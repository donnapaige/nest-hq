interface SavingsEmptyProps {
  onAdd: () => void;
}

export function SavingsEmpty({ onAdd }: SavingsEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center px-8 py-12 gap-4">
      <span className="text-[40px]">🎯</span>
      <h3 className="m-0 text-[18px] font-bold text-ink">Start a savings goal</h3>
      <p className="m-0 text-[14px] text-muted">
        Track progress toward trips, repairs, or rainy-day funds
      </p>
      <button
        onClick={onAdd}
        className="bg-primary text-white rounded-pill text-[15px] font-bold border-none cursor-pointer"
        style={{ padding: '12px 28px' }}
      >
        Add goal
      </button>
    </div>
  );
}
