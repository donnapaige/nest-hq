'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  snapPercent?: number;
}

export function BottomSheet({ open, onClose, children, snapPercent = 60 }: BottomSheetProps) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  /* Portal mount */
  useEffect(() => { setMounted(true); }, []);

  /* Animate in / out */
  useEffect(() => {
    if (open) {
      setVisible(true);
    } else {
      const t = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(t);
    }
  }, [open]);

  /* Drag-to-dismiss */
  const dragStartY = useRef(0);
  const handlePointerDown = (e: React.PointerEvent) => {
    dragStartY.current = e.clientY;
  };
  const handlePointerUp = (e: React.PointerEvent) => {
    const delta = e.clientY - dragStartY.current;
    if (delta > 80) onClose();
  };

  if (!mounted || !visible) return null;

  const content = (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{
          background: 'rgba(31,42,69,0.45)',
          opacity: open ? 1 : 0,
          transition: 'opacity 200ms ease',
        }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className="fixed left-0 right-0 bottom-0 z-50 bg-surface-alt rounded-t-sheet shadow-sheet flex flex-col overflow-hidden"
        style={{
          maxHeight: `${snapPercent}vh`,
          transform: open ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 300ms cubic-bezier(0.16,1,0.3,1)',
        }}
        role="dialog"
        aria-modal="true"
      >
        {/* Drag handle */}
        <div
          className="flex justify-center pt-2 pb-1 cursor-grab"
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
        >
          <div className="w-9 h-1 rounded-pill bg-muted/40" />
        </div>

        <div className="overflow-y-auto flex-1 px-5 pb-safe-bot">
          {children}
        </div>
      </div>
    </>
  );

  return createPortal(content, document.body);
}
