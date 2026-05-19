import { Skel } from '@/src/components/primitives/Skel';

const HOUR_HEIGHT = 34;

export function CalendarSkeleton() {
  return (
    <div className="px-5">
      <div className="flex pr-2">
        <div className="w-9 shrink-0">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{ height: HOUR_HEIGHT }} className="flex items-start pt-0.5 pl-2">
              <Skel w={16} h={8} r={4} />
            </div>
          ))}
        </div>
        <div className="flex-1 relative flex border-t border-hairline">
          {Array.from({ length: 7 }).map((_, di) => (
            <div
              key={di}
              className="flex-1 relative"
              style={{ minHeight: 8 * HOUR_HEIGHT, borderLeft: di > 0 ? '1px dashed #E8DFCB' : 'none' }}
            >
              {Array.from({ length: di % 3 === 0 ? 2 : 1 }).map((_, ei) => (
                <div
                  key={ei}
                  className="absolute left-0.5 right-0.5"
                  style={{
                    top: (ei * 2 + di) * HOUR_HEIGHT,
                    height: HOUR_HEIGHT * (1 + (ei % 2)),
                  }}
                >
                  <Skel w="90%" h={HOUR_HEIGHT * (1 + (ei % 2))} r={6} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
