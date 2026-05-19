import { Card } from '@/src/components/primitives/Card';
import { Icon } from '@/src/components/primitives/Icon';
import { Pill } from '@/src/components/primitives/Pill';

interface ShoppingStatCardProps {
  count: number;
  sample: string[];
  isLow: boolean;
  onClick?: () => void;
}

export function ShoppingStatCard({ count, sample, isLow, onClick }: ShoppingStatCardProps) {
  const preview = sample.slice(0, 3).join(', ') + (count > 3 ? ` +${count - 3}` : '');

  return (
    <Card pad={14} style={{ flex: 1 }} onClick={onClick}>
      <div className="flex items-center justify-between mb-2.5">
        <Icon name="cart" size={18} color="#334266" />
        {isLow && <Pill color="#F28C38" size="sm">Low</Pill>}
      </div>
      <div className="text-[13px] text-muted font-medium">Shopping</div>
      <div className="mt-0.5" style={{ fontSize: 22, fontWeight: 700, color: '#333333', letterSpacing: -0.4 }}>
        {count}<span className="text-[13px] text-muted font-medium"> items</span>
      </div>
      <div className="text-[11px] text-muted mt-1.5">{preview}</div>
    </Card>
  );
}
