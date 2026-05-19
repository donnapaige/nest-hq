interface CalendarEmptyProps {
  onAdd?: () => void;
}

export function CalendarEmpty({ onAdd }: CalendarEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      <div className="text-[32px] mb-3" aria-hidden="true">🌤️</div>
      <h3 className="text-h3 font-bold text-ink mb-2">Nothing scheduled this week</h3>
      <p className="text-[14px] text-muted mb-5">Tap + to add the first event.</p>
      <button
        onClick={onAdd}
        className="bg-accent text-primary font-bold text-[15px] px-5 py-3 rounded-card border-none cursor-pointer"
      >
        Add event
      </button>
    </div>
  );
}
