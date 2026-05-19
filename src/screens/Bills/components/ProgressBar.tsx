'use client';

import { useEffect, useRef, useState } from 'react';

interface ProgressBarProps {
  percent: number;
  color: string;
  duration?: number;
}

export function ProgressBar({ percent, color, duration = 1200 }: ProgressBarProps) {
  const [width, setWidth] = useState(0);
  const prevRef = useRef(0);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setWidth(percent);
      prevRef.current = percent;
      return;
    }

    const from = prevRef.current;
    startRef.current = null;

    const tick = (ts: number) => {
      if (startRef.current === null) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setWidth(from + (percent - from) * eased);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
      else prevRef.current = percent;
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [percent, duration]);

  return (
    <div className="h-2 rounded-[4px] bg-hairline overflow-hidden">
      <div
        className="h-full rounded-[4px]"
        style={{ width: `${width}%`, background: color }}
      />
    </div>
  );
}
