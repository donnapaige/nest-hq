interface ShoppingEmptyProps {
  onAdd: () => void;
}

export function ShoppingEmpty({ onAdd }: ShoppingEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center px-8 py-16 gap-4">
      <span className="text-[40px]">🧺</span>
      <h3 className="m-0 text-[18px] font-bold text-ink">Cart is empty</h3>
      <p className="m-0 text-[14px] text-muted">
        Tap the scanner or + to add something
      </p>
      <button
        onClick={onAdd}
        className="bg-primary text-white rounded-pill text-[15px] font-bold border-none cursor-pointer"
        style={{ padding: '12px 28px' }}
      >
        Add item
      </button>
    </div>
  );
}
