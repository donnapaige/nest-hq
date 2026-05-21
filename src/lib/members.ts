import type { Member } from './types';

const FALLBACK_MEMBER: Member = {
  id: '',
  name: 'Member',
  role: '',
  color: '#9BA3AF',
  soft: '#F3F4F6',
  emoji: '👤',
};

export function getMember(id: string, members?: Member[]): Member {
  if (members) {
    return members.find((m) => m.id === id) ?? FALLBACK_MEMBER;
  }
  return FALLBACK_MEMBER;
}

export const MEMBER_IDS: string[] = [];
