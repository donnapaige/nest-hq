import type { Bill, SavingsGoal } from '../types';

export const BILLS_FIXTURE: Bill[] = [
  { id: 'b1', name: 'Internet',      vendor: 'Spectrum',     amount: 89,    dueDate: '2026-05-15', paid: false, autoPay: false, recurrence: 'monthly', category: 'utility'      },
  { id: 'b2', name: 'Electric',      vendor: 'ConEdison',    amount: 142.5, dueDate: '2026-05-22', paid: false, autoPay: false, recurrence: 'monthly', category: 'utility'      },
  { id: 'b3', name: 'Mortgage',      vendor: 'Chase',        amount: 2480,  dueDate: '2026-06-01', paid: false, autoPay: true,  recurrence: 'monthly', category: 'rent'         },
  { id: 'b4', name: 'Water',         vendor: 'NYC DEP',      amount: 64.2,  dueDate: '2026-04-28', paid: true,  autoPay: false, recurrence: 'monthly', category: 'utility'      },
  { id: 'b5', name: 'Mateo soccer',  vendor: 'Riverside SC', amount: 120,   dueDate: '2026-04-25', paid: true,  autoPay: false, recurrence: null,      category: 'activity'     },
];

export const GOALS_FIXTURE: SavingsGoal[] = [
  {
    id: 'g1',
    name: 'Summer Cape Cod trip',
    icon: '🏖️',
    color: '#334266',
    saved: 1850,
    target: 3000,
    contributions: [],
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'g2',
    name: 'Family emergency fund',
    icon: '🛟',
    color: '#4C8A8B',
    saved: 7200,
    target: 10000,
    contributions: [],
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'g3',
    name: "Sofia's braces",
    icon: '🦷',
    color: '#C65A3A',
    saved: 920,
    target: 4500,
    contributions: [],
    createdAt: '2026-02-01T00:00:00Z',
  },
];
