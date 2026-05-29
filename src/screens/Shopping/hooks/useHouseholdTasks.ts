'use client';

import { useState, useCallback, useEffect } from 'react';
import { createClient } from '@/src/lib/supabase/client';
import { useHousehold } from '@/src/context/HouseholdContext';

export interface HouseholdTask {
  id: string;
  memberId: string;
  memberName: string;
  memberColor: string;
  title: string;
  completed: boolean;
  dueDate: string | null;
  createdAt: string;
}

export function useHouseholdTasks() {
  const { members } = useHousehold();
  const [tasks, setTasks] = useState<HouseholdTask[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!members.length) { setTasks([]); setLoading(false); return; }
    const supabase = createClient();
    const memberIds = members.map((m) => m.id);
    const { data } = await supabase
      .from('member_tasks')
      .select('*')
      .in('member_id', memberIds)
      .order('created_at');
    const memberMap = Object.fromEntries(members.map((m) => [m.id, m]));
    setTasks(
      (data || []).map((r) => {
        const m = memberMap[r.member_id];
        return {
          id:          r.id,
          memberId:    r.member_id,
          memberName:  m?.name ?? 'Unknown',
          memberColor: m?.color ?? '#334266',
          title:       r.title,
          completed:   r.completed,
          dueDate:     r.due_date ?? null,
          createdAt:   r.created_at,
        };
      })
    );
    setLoading(false);
  }, [members]);

  useEffect(() => { load(); }, [load]);

  const addTask = useCallback(async (memberId: string, title: string, dueDate?: string) => {
    const supabase = createClient();
    const { data } = await supabase
      .from('member_tasks')
      .insert({ member_id: memberId, title, due_date: dueDate ?? null })
      .select()
      .single();
    if (data) {
      const m = members.find((x) => x.id === memberId);
      setTasks((prev) => [...prev, {
        id: data.id, memberId, memberName: m?.name ?? '', memberColor: m?.color ?? '#334266',
        title: data.title, completed: false, dueDate: data.due_date ?? null, createdAt: data.created_at,
      }]);
    }
  }, [members]);

  const toggleTask = useCallback(async (id: string) => {
    setTasks((prev) => {
      const task = prev.find((t) => t.id === id);
      if (!task) return prev;
      const newCompleted = !task.completed;
      createClient().from('member_tasks').update({ completed: newCompleted }).eq('id', id);
      return prev.map((t) => t.id === id ? { ...t, completed: newCompleted } : t);
    });
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    await createClient().from('member_tasks').delete().eq('id', id);
  }, []);

  return { tasks, loading, addTask, toggleTask, deleteTask };
}
