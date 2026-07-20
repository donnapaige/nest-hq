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
  photoUrl: string | null;
}

interface HouseholdSummary {
  id: string;
  name: string;
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
  // Multi-household
  householdsList: HouseholdSummary[];
  switchHousehold: (id: string) => Promise<void>;
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
  householdsList: [],
  switchHousehold: async () => {},
});

const PUBLIC_PATHS = ['/login', '/signup', '/setup', '/auth', '/join'];
const STORAGE_KEY  = 'nest-hq-active-household';

export function HouseholdProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const router   = useRouter();
  const pathname = usePathname();

  const [householdId,    setHouseholdId]    = useState<string | null>(null);
  const [householdName,  setHouseholdName]  = useState('');
  const [inviteCode,     setInviteCode]     = useState('');
  const [currency,       setCurrency]       = useState('PHP');
  const [members,        setMembers]        = useState<HouseholdMember[]>([]);
  const [householdsList, setHouseholdsList] = useState<HouseholdSummary[]>([]);
  const [loading,        setLoading]        = useState(true);

  const fetchHousehold = useCallback(async () => {
    if (!user) {
      setHouseholdId(null);
      setMembers([]);
      setHouseholdsList([]);
      setLoading(false);
      return;
    }

    const supabase = createClient();

    // 1. Fetch ALL household memberships for this user
    const { data: memberRows } = await supabase
      .from('household_members')
      .select('household_id')
      .eq('user_id', user.id);

    if (!memberRows || memberRows.length === 0) {
      setHouseholdId(null);
      setHouseholdsList([]);
      setLoading(false);
      return;
    }

    const householdIds = memberRows.map((r) => r.household_id as string);

    // 2. Fetch all household records in one query
    const { data: householdsData } = await supabase
      .from('households')
      .select('id, name, invite_code, currency')
      .in('id', householdIds);

    if (!householdsData || householdsData.length === 0) {
      setHouseholdId(null);
      setHouseholdsList([]);
      setLoading(false);
      return;
    }

    // Build the list for the switcher
    const list: HouseholdSummary[] = householdsData.map((h) => ({ id: h.id, name: h.name }));
    setHouseholdsList(list);

    // 3. Determine which household is active
    let activeId: string | null = null;
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && householdIds.includes(stored)) {
        activeId = stored;
      }
    }
    if (!activeId) activeId = householdIds[0];

    const household = householdsData.find((h) => h.id === activeId) ?? householdsData[0];

    setHouseholdId(household.id);
    setHouseholdName(household.name);
    setInviteCode(household.invite_code);
    setCurrency(household.currency ?? 'PHP');

    // 4. Load members for the active household
    const { data: membersData } = await supabase
      .from('household_members')
      .select('*')
      .eq('household_id', household.id)
      .order('created_at');

    // Sign photo URLs (private bucket)
    const withPhotos = (membersData || []).filter((m) => m.photo_url);
    const signedMap: Record<string, string> = {};
    if (withPhotos.length > 0) {
      const results = await Promise.all(
        withPhotos.map((m) =>
          supabase.storage
            .from('member-photos')
            .createSignedUrl(m.photo_url, 3600)
            .then(({ data }) => ({ id: m.id, url: data?.signedUrl ?? null }))
        )
      );
      for (const r of results) {
        if (r.url) signedMap[r.id] = r.url;
      }
    }

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
        photoUrl:     signedMap[m.id] ?? null,
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
    } else if (user && householdsList.length === 0 && !loading && !isPublic) {
      router.push('/setup');
    }
  }, [loading, authLoading, user, householdsList, pathname, router]);

  const switchHousehold = useCallback(async (id: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, id);
    }
    await fetchHousehold();
  }, [fetchHousehold]);

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
        householdsList,
        switchHousehold,
      }}
    >
      {children}
    </HouseholdContext.Provider>
  );
}

export const useHousehold = () => useContext(HouseholdContext);
