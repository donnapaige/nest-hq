'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/src/lib/supabase/client';
import { useAuth } from './AuthContext';
import { formatCurrency as fmt } from '@/src/lib/currency';

export interface HouseholdMember {
  id: string;
  name: string;
  role: string;
  access_level: string; // 'adult' | 'child' | 'caregiver'
  color: string;
  softColor: string;
  emoji: string;
  userId: string | null;
}

interface HouseholdContextValue {
  householdId: string | null;
  householdName: string;
  inviteCode: string;
  currency: string;
  members: HouseholdMember[];
  currentMember: HouseholdMember | null;
  getMemberById: (id: string) => HouseholdMember | undefined;
  formatMoney: (amount: number) => string;
  loading: boolean;
  refetch: () => Promise<void>;
  updateCurrency: (code: string) => Promise<void>;
}

const HouseholdContext = createContext<HouseholdContextValue>({
  householdId: null,
  householdName: '',
  inviteCode: '',
  currency: 'PHP',
  members: [],
  currentMember: null,
  getMemberById: () => undefined,
  formatMoney: (n) => `₱${n}`,
  loading: true,
  refetch: async () => {},
  updateCurrency: async () => {},
});

const PUBLIC_PATHS = ['/login', '/signup', '/setup'];

export function HouseholdProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [householdId,   setHouseholdId]   = useState<string | null>(null);
  const [householdName, setHouseholdName] = useState('');
  const [inviteCode,    setInviteCode]    = useState('');
  const [currency,      setCurrency]      = useState('PHP');
  const [members,       setMembers]       = useState<HouseholdMember[]>([]);
  const [loading,       setLoading]       = useState(true);

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
      .select('id, name, invite_code, currency')
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
    setCurrency(household.currency ?? 'PHP');

    const { data: membersData } = await supabase
      .from('household_members')
      .select('*')
      .eq('household_id', household.id)
      .order('created_at');

    setMembers(
      (membersData || []).map((m) => ({
        id:           m.id,
        name:         m.name,
        role:         m.role,
        access_level: m.access_level ?? 'adult',
        color:        m.color,
        softColor:    m.soft_color,
        emoji:        m.emoji,
        userId:       m.user_id,
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

  const formatMoney = useCallback(
    (amount: number) => fmt(amount, currency),
    [currency]
  );

  const updateCurrency = useCallback(async (code: string) => {
    setCurrency(code);
    const supabase = createClient();
    await supabase.rpc('update_household_currency', { p_currency: code });
  }, []);

  return (
    <HouseholdContext.Provider
      value={{
        householdId,
        householdName,
        inviteCode,
        currency,
        members,
        currentMember,
        getMemberById,
        formatMoney,
        loading,
        refetch: fetchHousehold,
        updateCurrency,
      }}
    >
      {children}
    </HouseholdContext.Provider>
  );
}

export const useHousehold = () => useContext(HouseholdContext);
