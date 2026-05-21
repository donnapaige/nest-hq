'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/src/lib/supabase/client';
import { useAuth } from './AuthContext';

export interface HouseholdMember {
  id: string;
  name: string;
  role: string;
  color: string;
  softColor: string;
  emoji: string;
  userId: string | null;
}

interface HouseholdContextValue {
  householdId: string | null;
  householdName: string;
  inviteCode: string;
  members: HouseholdMember[];
  currentMember: HouseholdMember | null;
  getMemberById: (id: string) => HouseholdMember | undefined;
  loading: boolean;
  refetch: () => Promise<void>;
}

const HouseholdContext = createContext<HouseholdContextValue>({
  householdId: null,
  householdName: '',
  inviteCode: '',
  members: [],
  currentMember: null,
  getMemberById: () => undefined,
  loading: true,
  refetch: async () => {},
});

const PUBLIC_PATHS = ['/login', '/signup', '/setup'];

export function HouseholdProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [householdId, setHouseholdId] = useState<string | null>(null);
  const [householdName, setHouseholdName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHousehold = useCallback(async () => {
    if (!user) {
      setHouseholdId(null);
      setMembers([]);
      setLoading(false);
      return;
    }

    const supabase = createClient();

    const { data: memberRow } = await supabase
      .from('household_members')
      .select('household_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!memberRow) {
      setHouseholdId(null);
      setLoading(false);
      return;
    }

    const { data: household } = await supabase
      .from('households')
      .select('id, name, invite_code')
      .eq('id', memberRow.household_id)
      .single();

    if (!household) {
      setHouseholdId(null);
      setLoading(false);
      return;
    }

    setHouseholdId(household.id);
    setHouseholdName(household.name);
    setInviteCode(household.invite_code);

    const { data: membersData } = await supabase
      .from('household_members')
      .select('*')
      .eq('household_id', household.id)
      .order('created_at');

    setMembers(
      (membersData || []).map((m) => ({
        id: m.id,
        name: m.name,
        role: m.role,
        color: m.color,
        softColor: m.soft_color,
        emoji: m.emoji,
        userId: m.user_id,
      }))
    );

    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!authLoading) fetchHousehold();
  }, [authLoading, fetchHousehold]);

  // Redirect unauthenticated or unsetup users
  useEffect(() => {
    if (loading || authLoading) return;
    const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
    if (!user && !isPublic) {
      router.push('/login');
    } else if (user && !householdId && !isPublic) {
      router.push('/setup');
    }
  }, [loading, authLoading, user, householdId, pathname, router]);

  const currentMember = members.find((m) => m.userId === user?.id) ?? null;

  const getMemberById = useCallback(
    (id: string) => members.find((m) => m.id === id),
    [members]
  );

  return (
    <HouseholdContext.Provider
      value={{
        householdId,
        householdName,
        inviteCode,
        members,
        currentMember,
        getMemberById,
        loading,
        refetch: fetchHousehold,
      }}
    >
      {children}
    </HouseholdContext.Provider>
  );
}

export const useHousehold = () => useContext(HouseholdContext);
