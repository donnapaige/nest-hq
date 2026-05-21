'use client';

import Link from 'next/link';
import { Icon } from './Icon';

type TabId = 'today' | 'calendar' | 'chores' | 'shop' | 'bills' | 'family';

interface TabBarProps {
  active: TabId;
}

const TABS: { id: TabId; icon: Parameters<typeof Icon>[0]['name']; label: string; href: string }[] = [
  { id: 'today',    icon: 'sun',      label: 'Today',    href: '/'         },
  { id: 'calendar', icon: 'calendar', label: 'Calendar', href: '/calendar' },
  { id: 'chores',   icon: 'check',    label: 'Chores',   href: '/chores'   },
  { id: 'shop',     icon: 'cart',     label: 'Lists',    href: '/shop'     },
  { id: 'bills',    icon: 'coin',     label: 'Bills',    href: '/bills'    },
  { id: 'family',   icon: 'users',    label: 'Family',   href: '/family'   },
];

export function TabBar({ active }: TabBarProps) {
  return (
    <div
      className="absolute bottom-0 left-0 right-0 px-3 pt-2.5"
      style={{
        paddingBottom: 28,
        background: 'linear-gradient(to top, #F6F3EC 60%, rgba(246,243,236,0))',
      }}
    >
      <nav
        className="bg-surface border border-hairline rounded-[22px] py-2 px-1.5 flex items-center justify-around shadow-tabbar"
        aria-label="Main navigation"
      >
        {TABS.map((t) => {
          const on = t.id === active;
          return (
            <Link
              key={t.id}
              href={t.href}
              className="flex flex-col items-center gap-[3px] px-2.5 py-1.5 rounded-[14px] min-w-[50px] no-underline transition-colors duration-[200ms]"
              style={{ background: on ? '#DBA03A24' : 'transparent' }}
              aria-current={on ? 'page' : undefined}
            >
              <Icon name={t.icon} size={20} color={on ? '#DBA03A' : '#8A7E6B'} stroke={on ? 2.2 : 1.8} />
              <span
                className="leading-none"
                style={{ fontSize: 10.5, fontWeight: on ? 700 : 600, color: on ? '#DBA03A' : '#8A7E6B', letterSpacing: 0.1 }}
              >
                {t.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
