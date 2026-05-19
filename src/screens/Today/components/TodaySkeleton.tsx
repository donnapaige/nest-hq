import { Skel } from '@/src/components/primitives/Skel';

export function TodaySkeleton() {
  return (
    <>
      {/* Family banner skeleton */}
      <div className="mx-5 bg-surface border border-hairline rounded-card-lg px-[18px] py-4">
        <Skel w={140} h={10} className="mb-2.5" />
        <Skel w="80%" h={14} />
      </div>

      {/* Events section skeleton */}
      <div className="mt-[22px]">
        <div className="px-5 mb-2.5">
          <Skel w={140} h={10} />
        </div>
        <div className="px-5 flex flex-col gap-[10px]">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-surface border border-hairline rounded-card flex items-center overflow-hidden"
              style={{ padding: '12px 14px' }}
            >
              <div className="w-1 self-stretch bg-hairline rounded mr-3" style={{ width: 4, height: 56, marginLeft: -14 }} />
              <div style={{ width: 60 }}>
                <Skel w={36} h={12} className="mb-1.5" />
                <Skel w={24} h={8} />
              </div>
              <div className="flex-1 ml-3">
                <Skel w="70%" h={12} className="mb-1.5" />
                <Skel w="40%" h={10} />
              </div>
              <Skel w={32} h={32} r={16} />
            </div>
          ))}
        </div>
      </div>

      {/* Quick cards skeleton */}
      <div className="mt-[22px]">
        <div className="px-5 mb-2.5">
          <Skel w={140} h={10} />
        </div>
        <div className="px-5 flex gap-[10px]">
          {[0, 1].map((i) => (
            <div key={i} className="flex-1 bg-surface border border-hairline rounded-card p-3.5">
              <Skel w={20} h={20} r={10} className="mb-2.5" />
              <Skel w="60%" h={10} className="mb-1.5" />
              <Skel w="40%" h={18} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
