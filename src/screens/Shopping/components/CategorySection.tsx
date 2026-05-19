import { ShoppingRow } from './ShoppingRow';
import type { ShoppingItem } from '@/src/lib/types';

const CAT_EMOJI: Record<string, string> = {
  Produce:   '🥬',
  Dairy:     '🥛',
  Pantry:    '🌾',
  Household: '🧺',
};

interface CategorySectionProps {
  category: string;
  items: ShoppingItem[];
  pending: Set<string>;
  onToggle: (id: string) => void;
}

export function CategorySection({ category, items, pending, onToggle }: CategorySectionProps) {
  return (
    <div className="mb-3.5">
      {/* Sticky header */}
      <div
        className="sticky top-0 z-[5] bg-bg flex items-center justify-between border-b border-hairline"
        style={{ padding: '8px 20px' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-[16px]">{CAT_EMOJI[category] ?? '📦'}</span>
          <h3 className="m-0 text-[13px] font-bold text-ink uppercase tracking-[0.8px]">
            {category}
          </h3>
        </div>
        <span className="text-[11px] text-muted font-semibold">{items.length} left</span>
      </div>

      <div className="px-5 mt-2">
        {items.length === 0 ? (
          <p className="text-[12px] italic text-muted text-center py-3.5 m-0">
            All caught up
          </p>
        ) : (
          <div className="bg-surface border border-hairline rounded-card overflow-hidden">
            {items.map((it, i) => (
              <ShoppingRow
                key={it.id}
                item={it}
                pending={pending.has(it.id)}
                onToggle={() => onToggle(it.id)}
                isLast={i === items.length - 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
