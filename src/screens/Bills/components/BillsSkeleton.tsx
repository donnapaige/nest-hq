import { Skel } from '@/src/components/primitives/Skel';

export function BillsSkeleton() {
  return (
    <div className="px-5">
      {/* Hero card skeleton */}
      <div className="bg-primary rounded-[20px] mb-4" style={{ padding: 18 }}>
        <Skel w={120} h={10} r={4} className="opacity-30" />
        <div className="mt-2">
          <Skel w={220} h={38} r={6} className="opacity-30" />
        </div>
        <div className="flex gap-3.5 mt-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <Skel w={40} h={10} r={4} className="opacity-30" />
              <Skel w={60} h={14} r={4} className="opacity-30" />
            </div>
          ))}
        </div>
      </div>

      {/* Bill card skeletons */}
      <div className="flex flex-col gap-2.5 mb-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="bg-surface border border-hairline rounded-card flex items-center gap-3"
            style={{ padding: 14 }}
          >
            <Skel w={44} h={44} r={12} />
            <div className="flex-1 flex flex-col gap-1.5">
              <Skel w="60%" h={14} r={4} />
              <Skel w="40%" h={10} r={4} />
            </div>
            <Skel w={60} h={16} r={4} />
          </div>
        ))}
      </div>

      {/* Goal card skeletons */}
      <div className="flex flex-col gap-2.5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="bg-surface border border-hairline rounded-card"
            style={{ padding: 14 }}
          >
            <div className="flex items-start gap-3 mb-3">
              <Skel w={40} h={40} r={12} />
              <div className="flex-1 flex flex-col gap-1.5">
                <Skel w="60%" h={14} r={4} />
                <Skel w="40%" h={10} r={4} />
              </div>
              <Skel w={34} h={13} r={4} />
            </div>
            <Skel w="100%" h={8} r={4} />
          </div>
        ))}
      </div>
    </div>
  );
}
