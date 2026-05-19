'use client';

import {
  createContext,
  useContext,
  useCallback,
  type ReactNode,
} from 'react';

interface FireOptions {
  x?: number;
  y?: number;
  memberId?: string;
}

type FireFn = (opts?: FireOptions) => void;

const ConfettiContext = createContext<FireFn>(() => {});

export function useConfetti() {
  return useContext(ConfettiContext);
}

export function ConfettiProvider({ children }: { children: ReactNode }) {
  const fire: FireFn = useCallback(async (opts = {}) => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const confetti = (await import('canvas-confetti')).default;
    const origin = {
      x: opts.x !== undefined ? opts.x / window.innerWidth  : 0.5,
      y: opts.y !== undefined ? opts.y / window.innerHeight : 0.5,
    };

    confetti({
      particleCount: 80,
      spread: 70,
      angle: 90,
      origin,
      colors: ['#DBA03A', '#F28C38', '#4C8A8B', '#9DB28F', '#C65A3A'],
      gravity: 1.2,
      scalar: 0.9,
    });
  }, []);

  return (
    <ConfettiContext.Provider value={fire}>
      {children}
    </ConfettiContext.Provider>
  );
}
