import { Avatar } from '@/src/components/primitives/Avatar';
import type { MemberId } from '@/src/lib/types';

interface FamilySummaryBannerProps {
  familyName: string;
  summaryLine: string;
  memberIds: MemberId[];
}

export function FamilySummaryBanner({ familyName, summaryLine, memberIds }: FamilySummaryBannerProps) {
  return (
    <div
      className="bg-primary text-white rounded-card-lg flex items-center gap-3.5 mx-5"
      style={{ padding: '14px 18px' }}
    >
      <div className="flex-1 min-w-0">
        <div className="text-[12px] font-semibold opacity-70 uppercase tracking-[0.4px]">
          {familyName.toUpperCase()} · TODAY
        </div>
        <div className="text-[15px] font-semibold mt-1 leading-[1.4]">{summaryLine}</div>
      </div>
      <div className="flex shrink-0">
        {memberIds.slice(0, 3).map((id, i) => (
          <div key={id} style={{ marginLeft: i > 0 ? -10 : 0 }}>
            <Avatar member={id} size={32} ring />
          </div>
        ))}
      </div>
    </div>
  );
}
