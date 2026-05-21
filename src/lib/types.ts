export type MemberId = string;

export interface Member {
  id: MemberId;
  name: string;
  role: string;
  color: string;
  soft: string;
  emoji: string;
}

export type ScreenVariant = 'loading' | 'empty' | 'error' | 'ready';

/* ── Today ── */
export interface EventLite {
  id: string;
  time: string;
  title: string;
  subtitle: string;
  memberId: MemberId;
}

export interface ChoreLite {
  id: string;
  title: string;
  subtitle: string;
  memberId: MemberId;
  points: number;
}

export interface BillLite {
  id: string;
  name: string;
  amount: number;
  dueLabel: string;
  autoPay: boolean;
  daysUntilDue: number;
}

export interface TodaySummary {
  date: string;
  greeting: string;
  household: { name: string; memberIds: MemberId[] };
  counts: { events: number; chores: number; billsDue: number };
  events: EventLite[];
  choresDueToday: ChoreLite[];
  shoppingPreview: { count: number; sample: string[]; isLow: boolean };
  nextBill: BillLite | null;
  streakDays: number;
}

/* ── Calendar ── */
export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay?: boolean;
  memberIds: MemberId[];
  forMemberId?: string | null;
  location?: string;
  notes?: string;
  recurrence?: RRule | null;
  reminder?: { minutesBefore: number };
}

export interface RRule {
  freq: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  interval: number;
  byDay?: string[];
  until?: string;
}

/* ── Chores ── */
export interface Chore {
  id: string;
  title: string;
  memberId: MemberId;
  forMemberId?: string | null;
  status: 'todo' | 'inProgress' | 'done';
  due: string;
  recurrence?: string | null;
  points: number;
  completedAt?: string;
}

/* ── Shopping ── */
export type ShoppingCategory = 'Produce' | 'Dairy' | 'Pantry' | 'Household';

export interface ShoppingItem {
  id: string;
  name: string;
  qty?: string;
  category: ShoppingCategory | string;
  done: boolean;
  addedBy: MemberId;
  createdAt: string;
  completedAt?: string;
  upc?: string;
}

/* ── Bills ── */
export interface Bill {
  id: string;
  forMemberId?: string | null;
  name: string;
  vendor: string;
  amount: number;
  dueDate: string;
  paid: boolean;
  autoPay?: boolean;
  recurrence?: 'monthly' | 'weekly' | 'yearly' | null;
  category?: string;
  // Variable billing fields
  billType?: 'fixed' | 'variable';
  arrivalDay?: number | null;      // day of month bill arrives (1–28)
  amountConfirmed?: boolean;       // false = awaiting this cycle's amount
  remindArrival?: boolean;         // show arrival reminder badge
}

export interface SavingsTx {
  id: string;
  amount: number;
  note?: string;
  date: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  icon: string;
  color: string;
  saved: number;
  target: number;
  contributions: SavingsTx[];
  createdAt: string;
}
