'use client';

interface DayInfo { d: string; n: number; date: string; today: boolean }

interface WeekStripProps {
  days: DayInfo[];
  selectedDate: string;
  onSelect: (date: string) => void;
  onPrev?: () => void;
  onNext?: () => void;
}

export function WeekStrip({ days, selectedDate, onSelect, onPrev, onNext }: WeekStripProps) {
  return (
    <div className="flex items-center px-3 pb-2 gap-1">
      <button
        onClick={onPrev}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 3px', color: '#8A7E6B', flexShrink: 0, lineHeight: 1, fontSize: 18 }}
        aria-label="Previous week"
      >‹</button>
      <div className="flex flex-1 gap-1.5">
      {days.map((day) => {
        const isToday = day.today;
        const isSelected = day.date === selectedDate;
        const highlight = isToday || isSelected;
        return (
          <button
            key={day.date}
            onClick={() => onSelect(day.date)}
            className={`flex-1 rounded-[12px] py-2 text-center border-none cursor-pointer transition-colors duration-[200ms] ${
              highlight
                ? 'bg-primary text-white'
                : 'bg-transparent border border-hairline text-ink'
            }`}
          >
            <div
              className="text-[10px] font-bold uppercase tracking-[0.6px]"
              style={{ opacity: highlight ? 0.85 : 0.65 }}
            >
              {day.d}
            </div>
            <div className="text-[16px] font-bold mt-0.5">{day.n}</div>
          </button>
        );
      })}
      </div>
      <button
        onClick={onNext}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 3px', color: '#8A7E6B', flexShrink: 0, lineHeight: 1, fontSize: 18 }}
        aria-label="Next week"
      >›</button>
    </div>
  );
}

export function buildWeekDays(weekOffset = 0): DayInfo[] {
  const today = new Date();
  const startOfWeek = new Date(today);
  const dayOfWeek = today.getDay(); // 0=Sun
  startOfWeek.setDate(today.getDate() - dayOfWeek + weekOffset * 7); // Start Sunday

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    const abbr = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
    return {
      d: abbr,
      n: d.getDate(),
      date: d.toISOString().split('T')[0],
      today: d.toDateString() === today.toDateString(),
    };
  });
}
