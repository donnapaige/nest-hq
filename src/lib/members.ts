import type { Member, MemberId } from './types';

export const MEMBERS: Record<MemberId, Member> = {
  maya:  { id: 'maya',  name: 'Maya',  role: 'Mom',       color: '#4C8A8B', soft: '#DDEAEB', emoji: '🌿' },
  david: { id: 'david', name: 'David', role: 'Dad',       color: '#334266', soft: '#DCE0EB', emoji: '🛠️' },
  sofia: { id: 'sofia', name: 'Sofia', role: 'Kid · 8',   color: '#C65A3A', soft: '#F2D9CF', emoji: '🦄' },
  mateo: { id: 'mateo', name: 'Mateo', role: 'Kid · 6',   color: '#DBA03A', soft: '#F4E4C7', emoji: '🚀' },
  lola:  { id: 'lola',  name: 'Lola',  role: 'Nanny',     color: '#F28C38', soft: '#FCDCBE', emoji: '🌸' },
};

export function getMember(id: MemberId): Member {
  return MEMBERS[id];
}

export const MEMBER_IDS = Object.keys(MEMBERS) as MemberId[];
