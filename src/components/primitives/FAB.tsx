'use client';

import { Icon } from './Icon';
import type { ComponentProps } from 'react';

type IconName = ComponentProps<typeof Icon>['name'];

interface FABProps {
  icon?: IconName;
  label?: string;
  onClick?: () => void;
  rotated?: boolean;
  className?: string;
}

export function FAB({ icon = 'plus', label = 'Add', onClick, rotated = false, className = '' }: FABProps) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`
        absolute right-6 w-14 h-14 rounded-full border-none
        bg-accent text-primary cursor-pointer
        flex items-center justify-center
        shadow-fab
        active:scale-[0.92] transition-all duration-[120ms]
        ${className}
      `}
      style={{ bottom: 100 }}
    >
      <div
        style={{
          transform: rotated ? 'rotate(45deg)' : 'rotate(0deg)',
          transition: 'transform 200ms cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        <Icon name={icon} size={24} color="#334266" stroke={2.6} />
      </div>
    </button>
  );
}
