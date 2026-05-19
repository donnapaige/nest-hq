import type { TodaySummary } from '../types';

export const TODAY_FIXTURE: TodaySummary = {
  date: '2026-05-14',
  greeting: 'Good morning, Maya ☀️',
  household: { name: 'The Vasquez Family', memberIds: ['maya', 'david', 'sofia'] },
  counts: { events: 4, chores: 3, billsDue: 1 },
  events: [
    { id: 'e1', time: '8:00 AM',  title: 'School drop-off',        subtitle: 'Lincoln Elementary',   memberId: 'sofia'  },
    { id: 'e2', time: '12:30 PM', title: 'Pediatrician — Mateo',   subtitle: 'Dr. Patel · 30 min',   memberId: 'maya'   },
    { id: 'e3', time: '4:00 PM',  title: 'Soccer practice',        subtitle: 'Riverside Field',       memberId: 'mateo'  },
    { id: 'e4', time: '7:00 PM',  title: 'Dinner w/ Grandma',      subtitle: 'Home · whole family',  memberId: 'david'  },
  ],
  choresDueToday: [
    { id: 'c1', title: 'Feed Biscuit',        subtitle: 'Morning + evening',  memberId: 'sofia', points: 5  },
    { id: 'c2', title: 'Put toys away',        subtitle: 'Before dinner',      memberId: 'mateo', points: 5  },
    { id: 'c3', title: 'Take out recycling',   subtitle: 'Pickup tomorrow',    memberId: 'david', points: 10 },
  ],
  shoppingPreview: { count: 12, sample: ['Milk', 'eggs', 'coffee'], isLow: true },
  nextBill: {
    id: 'b1',
    name: 'Internet bill',
    amount: 89,
    dueLabel: 'Auto-pay tomorrow',
    autoPay: true,
    daysUntilDue: 1,
  },
  streakDays: 6,
};
