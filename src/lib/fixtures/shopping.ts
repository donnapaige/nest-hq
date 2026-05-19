import type { ShoppingItem } from '../types';

export const SHOPPING_FIXTURE: ShoppingItem[] = [
  { id: 'p1', name: 'Bananas',       qty: '1 bunch', category: 'Produce',   done: false, addedBy: 'maya',  createdAt: '2026-05-14T08:00:00Z' },
  { id: 'p2', name: 'Avocados',      qty: '3',       category: 'Produce',   done: true,  addedBy: 'david', createdAt: '2026-05-14T08:01:00Z' },
  { id: 'p3', name: 'Baby spinach',  qty: '1 bag',   category: 'Produce',   done: false, addedBy: 'maya',  createdAt: '2026-05-14T08:02:00Z' },
  { id: 'p4', name: 'Lemons',        qty: '4',       category: 'Produce',   done: false, addedBy: 'maya',  createdAt: '2026-05-14T08:03:00Z' },
  { id: 'd1', name: 'Whole milk',    qty: '1 gal',   category: 'Dairy',     done: false, addedBy: 'lola',  createdAt: '2026-05-14T08:04:00Z' },
  { id: 'd2', name: 'Greek yogurt',  qty: '32 oz',   category: 'Dairy',     done: false, addedBy: 'maya',  createdAt: '2026-05-14T08:05:00Z' },
  { id: 'd3', name: 'Sharp cheddar', qty: 'block',   category: 'Dairy',     done: true,  addedBy: 'david', createdAt: '2026-05-14T08:06:00Z' },
  { id: 'a1', name: 'Coffee beans',  qty: '12 oz',   category: 'Pantry',    done: false, addedBy: 'david', createdAt: '2026-05-14T08:07:00Z' },
  { id: 'a2', name: 'Olive oil',     qty: '1 L',     category: 'Pantry',    done: false, addedBy: 'maya',  createdAt: '2026-05-14T08:08:00Z' },
  { id: 'h1', name: 'Paper towels',  qty: '6 pk',    category: 'Household', done: false, addedBy: 'lola',  createdAt: '2026-05-14T08:09:00Z' },
  { id: 'h2', name: 'Dish soap',     qty: '1',       category: 'Household', done: false, addedBy: 'david', createdAt: '2026-05-14T08:10:00Z' },
  { id: 'h3', name: 'Trash bags',    qty: 'kitchen', category: 'Household', done: true,  addedBy: 'lola',  createdAt: '2026-05-14T08:11:00Z' },
];
