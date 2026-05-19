import { EmptyIllustration } from '@/src/components/EmptyIllustration';

export function TodayEmpty() {
  return (
    <div className="px-7 pt-6 flex flex-col items-center text-center">
      <EmptyIllustration />
      <h2
        className="font-bold text-ink mt-3.5 mb-1.5"
        style={{ fontSize: 18, letterSpacing: -0.3 }}
      >
        All clear today, Vasquez family!
      </h2>
      <p className="m-0 text-[14px] text-ink leading-relaxed max-w-[280px]">
        Enjoy your day. We&apos;ll let you know if anything pops up.
      </p>
      <div
        className="mt-[18px] inline-flex items-center gap-1.5 rounded-pill text-[12px] font-bold"
        style={{
          background: '#DBA03A22',
          color: '#1F2A45',
          padding: '8px 14px',
        }}
      >
        <span className="text-[14px]">🌱</span>
        Family streak: 6 days
      </div>
    </div>
  );
}
