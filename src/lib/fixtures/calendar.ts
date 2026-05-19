import type { CalendarEvent } from '../types';

export const CALENDAR_FIXTURE: CalendarEvent[] = [
  { id: 'ev1',  title: 'School drop',           start: '2026-05-11T08:00', end: '2026-05-11T09:00', memberIds: ['sofia']  },
  { id: 'ev2',  title: 'Gym',                   start: '2026-05-11T18:00', end: '2026-05-11T19:30', memberIds: ['david']  },
  { id: 'ev3',  title: 'Yoga',                  start: '2026-05-12T09:00', end: '2026-05-12T10:00', memberIds: ['maya']   },
  { id: 'ev4',  title: 'Soccer',                start: '2026-05-12T16:00', end: '2026-05-12T17:00', memberIds: ['mateo']  },
  { id: 'ev5',  title: 'Pickup + park',         start: '2026-05-13T14:00', end: '2026-05-13T16:00', memberIds: ['lola']   },
  { id: 'ev6',  title: 'School',                start: '2026-05-14T08:00', end: '2026-05-14T09:00', memberIds: ['sofia']  },
  { id: 'ev7',  title: 'Pediatrician',          start: '2026-05-14T12:30', end: '2026-05-14T13:30', memberIds: ['maya']   },
  { id: 'ev8',  title: 'Soccer',                start: '2026-05-14T16:00', end: '2026-05-14T17:00', memberIds: ['mateo']  },
  { id: 'ev9',  title: 'Dinner w/ Grandma',     start: '2026-05-14T19:00', end: '2026-05-14T20:30', memberIds: ['david']  },
  { id: 'ev10', title: 'Piano lesson',          start: '2026-05-15T15:00', end: '2026-05-15T16:00', memberIds: ['sofia']  },
  { id: 'ev11', title: 'Farmers market',        start: '2026-05-16T10:00', end: '2026-05-16T12:00', memberIds: ['david']  },
  { id: 'ev12', title: 'Birthday party',        start: '2026-05-16T13:00', end: '2026-05-16T16:00', memberIds: ['mateo']  },
  { id: 'ev13', title: "Brunch w/ Sam",         start: '2026-05-17T11:00', end: '2026-05-17T13:00', memberIds: ['maya']   },
];
