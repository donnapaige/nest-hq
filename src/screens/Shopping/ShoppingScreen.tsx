'use client';

import { useState } from 'react';
import { TabBar } from '@/src/components/primitives/TabBar';
import { FAB } from '@/src/components/primitives/FAB';
import { ShoppingHeader } from './components/ShoppingHeader';
import { PresenceBar } from './components/PresenceBar';
import { SummaryChips } from './components/SummaryChips';
import { CategorySection } from './components/CategorySection';
import { CompletedDrawer } from './components/CompletedDrawer';
import { ShoppingSkeleton } from './components/ShoppingSkeleton';
import { ShoppingEmpty } from './components/ShoppingEmpty';
import { AddItemSheet } from './sheets/AddItemSheet';
import { BarcodeScanner } from './scanner/BarcodeScanner';
import { useShoppingList } from './hooks/useShoppingList';
import { usePresence } from './hooks/usePresence';
import type { ShoppingItem } from '@/src/lib/types';

const CATEGORY_ORDER = ['Produce', 'Dairy', 'Pantry', 'Household'];

export function ShoppingScreen() {
  const {
    activeItems, doneItems, pending,
    checkItem, uncheckItem, addItem,
    status,
  } = useShoppingList();

  const presence = usePresence();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannedUpc, setScannedUpc] = useState<string | undefined>();

  const openAdd    = () => { setScannedUpc(undefined); setSheetOpen(true); };
  const openScanner = () => setScannerOpen(true);

  const handleDetect = (upc: string) => {
    setScannerOpen(false);
    setScannedUpc(upc);
    setSheetOpen(true);
  };

  const handleSave = (item: ShoppingItem) => addItem(item);

  /* Group active items by category */
  const byCategory = CATEGORY_ORDER.map((cat) => ({
    cat,
    items: activeItems.filter((it) => it.category === cat),
  }));
  /* Also include any custom categories not in the order */
  const extraCats = [...new Set(activeItems.map((it) => it.category))].filter(
    (c) => !CATEGORY_ORDER.includes(c)
  );
  extraCats.forEach((cat) => {
    byCategory.push({ cat, items: activeItems.filter((it) => it.category === cat) });
  });

  const totalActive = activeItems.length;

  return (
    <div className="bg-bg h-full font-sans text-ink relative overflow-hidden flex flex-col">
      <ShoppingHeader onAdd={openAdd} />

      {status === 'loading' && <ShoppingSkeleton />}

      {status === 'error' && (
        <div className="bg-danger text-white px-5 py-3 text-[14px]">
          Something went wrong. Pull to refresh.
        </div>
      )}

      {status === 'ready' && totalActive === 0 && doneItems.length === 0 && (
        <ShoppingEmpty onAdd={openAdd} />
      )}

      {status === 'ready' && (totalActive > 0 || doneItems.length > 0) && (
        <div className="flex-1 overflow-y-auto" style={{ paddingBottom: 110 }}>
          <PresenceBar
            isLive={presence.isLive}
            activePeers={presence.activePeers}
            lastEditor={presence.lastEditor}
            secondsAgo={presence.secondsAgo}
          />

          <SummaryChips toBuy={totalActive} inCart={doneItems.length} />

          {byCategory
            .filter(({ items }) => items.length > 0 || CATEGORY_ORDER.includes(''))
            .map(({ cat, items }) => (
              <CategorySection
                key={cat}
                category={cat}
                items={items}
                pending={pending}
                onToggle={checkItem}
              />
            ))}

          <CompletedDrawer items={doneItems} onUncheck={uncheckItem} />
        </div>
      )}

      {/* FAB: barcode scanner */}
      <FAB icon="qr" label="Scan barcode" onClick={openScanner} />
      <TabBar active="shop" />

      <AddItemSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        initial={scannedUpc ? { upc: scannedUpc } : undefined}
        onSave={handleSave}
      />

      {scannerOpen && (
        <BarcodeScanner
          onDetect={handleDetect}
          onClose={() => setScannerOpen(false)}
        />
      )}
    </div>
  );
}
