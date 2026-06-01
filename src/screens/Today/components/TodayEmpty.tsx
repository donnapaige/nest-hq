'use client';

import { EmptyIllustration } from '@/src/components/EmptyIllustration';
import { useHousehold } from '@/src/context/HouseholdContext';

export function TodayEmpty() {
  const { householdName } = useHousehold();

  return (
    <div className="px-7 pt-6 flex flex-col items-center text-center">
      <EmptyIllustration />
      <h2
        className="font-bold text-ink mt-3.5 mb-1.5"
        style={{ fontSize: 18, letterSpacing: -0.3 }}
      >
        All clear today, {householdName}!
      </h2>
      <p className="m-0 text-[14px] text-ink leading-relaxed max-w-[280px]">
        Enjoy your day. We&apos;ll let you know if anything pops up.
      </p>
    </div>
  );
}
