import { IconButton } from '@/src/components/primitives/IconButton';
import { Icon } from '@/src/components/primitives/Icon';

interface ShoppingHeaderProps {
  onAdd: () => void;
}

export function ShoppingHeader({ onAdd }: ShoppingHeaderProps) {
  return (
    <div className="px-5 pt-safe-top pb-3">
      <div className="text-[13px] text-muted font-medium mb-1">Weekly groceries</div>
      <div className="flex items-center justify-between">
        <h1 className="m-0 text-h1 font-bold text-ink" style={{ letterSpacing: -0.5 }}>
          Shopping List
        </h1>
        <IconButton label="Add item" onClick={onAdd}>
          <Icon name="plus" size={20} color="#333333" />
        </IconButton>
      </div>
    </div>
  );
}
