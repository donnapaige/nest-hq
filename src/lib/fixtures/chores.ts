import type { Chore } from '../types';

export const CHORES_FIXTURE: Chore[] = [
  { id: 'ch1', title: 'Feed Biscuit',          memberId: 'sofia', status: 'todo',       due: 'Today',    recurrence: 'Daily',  points: 5  },
  { id: 'ch2', title: 'Pack tomorrow\'s lunch', memberId: 'sofia', status: 'done',       due: 'Today',    recurrence: null,     points: 10 },
  { id: 'ch3', title: 'Put toys away',          memberId: 'mateo', status: 'todo',       due: 'Today',    recurrence: 'Daily',  points: 5  },
  { id: 'ch4', title: 'Brush teeth (PM)',        memberId: 'mateo', status: 'inProgress', due: '8 PM',     recurrence: 'Daily',  points: 3  },
  { id: 'ch5', title: 'Take out recycling',     memberId: 'david', status: 'todo',       due: 'Today',    recurrence: null,     points: 10 },
  { id: 'ch6', title: 'Mow lawn',               memberId: 'david', status: 'inProgress', due: 'Saturday', recurrence: null,     points: 25 },
  { id: 'ch7', title: 'Grocery run',            memberId: 'lola',  status: 'todo',       due: 'Friday',   recurrence: null,     points: 15 },
];

export const LEADERBOARD_FIXTURE = [
  { memberId: 'sofia' as const, pts: 45 },
  { memberId: 'mateo' as const, pts: 32 },
  { memberId: 'david' as const, pts: 28 },
  { memberId: 'maya'  as const, pts: 22 },
  { memberId: 'lola'  as const, pts: 18 },
];
