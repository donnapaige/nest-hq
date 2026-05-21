'use client';

import { useState, useCallback, useEffect } from 'react';
import { createClient } from '@/src/lib/supabase/client';
import { useHousehold } from '@/src/context/HouseholdContext';
import { useAuth } from '@/src/context/AuthContext';

export type RecordType = 'milestone' | 'health' | 'allergy' | 'appointment' | 'note';

export interface MemberRecord {
  id: string;
  memberId: string;
  type: RecordType;
  title: string;
  content: string;
  recordDate: string | null;
  createdAt: string;
}

const TYPE_META: Record<RecordType, { label: string; emoji: string; color: string }> = {
  milestone:   { label: 'Milestone',   emoji: '🌟', color: '#DBA03A' },
  health:      { label: 'Health',      emoji: '🏥', color: '#4C8A8B' },
  allergy:     { label: 'Allergy',     emoji: '⚠️', color: '#C65A3A' },
  appointment: { label: 'Appointment', emoji: '📅', color: '#334266' },
  note:        { label: 'Note',        emoji: '📝', color: '#8A7E6B' },
};

export { TYPE_META };

function mapRow(r: Record<string, unknown>): MemberRecord {
  return {
    id:         r.id as string,
    memberId:   r.member_id as string,
    type:       r.type as RecordType,
    title:      r.title as string,
    content:    (r.content as string) || '',
    recordDate: r.record_date as string | null,
    createdAt:  r.created_at as string,
  };
}

export function useMemberRecords(memberId: string) {
  const { householdId } = useHousehold();
  const { user }        = useAuth();
  const [records, setRecords] = useState<MemberRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!householdId || !memberId) { setRecords([]); setLoading(false); return; }
    const supabase = createClient();
    const { data } = await supabase
      .from('member_records')
      .select('*')
      .eq('member_id', memberId)
      .eq('household_id', householdId)
      .order('record_date', { ascending: false, nullsFirst: false });
    setRecords((data || []).map(mapRow));
    setLoading(false);
  }, [householdId, memberId]);

  useEffect(() => { load(); }, [load]);

  const addRecord = useCallback(async (rec: Omit<MemberRecord, 'id' | 'createdAt' | 'memberId'>) => {
    if (!householdId) return;
    const supabase = createClient();
    const { data, error } = await supabase
      .from('member_records')
      .insert({
        household_id: householdId,
        member_id:    memberId,
        type:         rec.type,
        title:        rec.title,
        content:      rec.content,
        record_date:  rec.recordDate,
        created_by:   user?.id,
      })
      .select()
      .single();
    if (!error && data) setRecords((prev) => [mapRow(data), ...prev]);
  }, [householdId, memberId, user]);

  const deleteRecord = useCallback(async (id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
    const supabase = createClient();
    await supabase.from('member_records').delete().eq('id', id);
  }, []);

  return { records, loading, addRecord, deleteRecord };
}
