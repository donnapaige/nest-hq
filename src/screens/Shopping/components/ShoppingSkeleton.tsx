import { Skel } from '@/src/components/primitives/Skel';

const CATEGORIES = ['Produce', 'Dairy', 'Pantry'];

export function ShoppingSkeleton() {
  return (
    <div>
      {/* Presence bar skeleton */}
      <div className="mx-5 mb-3 bg-surface border border-hairline rounded-[14px] flex items-center gap-3" style={{ padding: '10px 14px' }}>
        <Skel w={100} h={10} r={4} />
        <Skel w={60} h={10} r={4} />
      </div>

      {/* Summary chips skeleton */}
      <div className="flex gap-2 px-5 pb-4">
        {[0, 1].map((i) => (
          <div key={i} className="flex-1 bg-surface border border-hairline rounded-[14px]" style={{ padding: '12px 14px' }}>
            <Skel w={40} h={10} r={4} />
            <div className="mt-2">
              <Skel w="60%" h={22} r={4} />
            </div>
          </div>
        ))}
      </div>

      {/* Category sections skeleton */}
      {CATEGORIES.map((cat) => (
        <div key={cat} className="mb-3.5">
          <div className="flex items-center justify-between border-b border-hairline mb-2" style={{ padding: '8px 20px' }}>
            <span className="text-[13px] font-bold text-ink uppercase tracking-[0.8px]">{cat}</span>
          </div>
          <div className="px-5">
            <div className="bg-surface border border-hairline rounded-card overflow-hidden">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 border-b border-hairline last:border-none"
                  style={{ padding: '12px 14px' }}
                >
                  <Skel w={22} h={22} r={11} />
                  <div className="flex-1 flex flex-col gap-1.5">
                    <Skel w="60%" h={14} r={4} />
                    <Skel w="30%" h={10} r={4} />
                  </div>
                  <Skel w={24} h={24} r={12} />
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
