import { Skel } from '@/src/components/primitives/Skel';

export function ChoreSkeleton() {
  return (
    <div className="px-5 pt-2">
      {/* Leaderboard strip skeleton */}
      <div
        className="bg-surface border border-hairline rounded-[18px] flex items-center justify-between mb-4"
        style={{ padding: '14px 12px' }}
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
            <Skel w={36} h={36} r={18} />
            <Skel w={40} h={10} r={4} />
            <Skel w={28} h={14} r={999} />
          </div>
        ))}
      </div>

      {/* Member filter row skeleton */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none pb-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skel key={i} w={80} h={30} r={999} />
        ))}
      </div>

      {/* Column header skeleton */}
      <div className="pt-2">
        <Skel w={80} h={11} r={4} />
        <div className="flex flex-col gap-2 mt-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-surface border border-hairline rounded-card flex items-center gap-3"
              style={{ padding: '12px 14px' }}
            >
              <Skel w={28} h={28} r={14} />
              <div className="flex-1 flex flex-col gap-1.5">
                <Skel w="70%" h={14} r={4} />
                <Skel w="50%" h={10} r={4} />
              </div>
              <Skel w={32} h={16} r={999} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
