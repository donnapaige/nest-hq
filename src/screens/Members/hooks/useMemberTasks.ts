'use client';

import { useState, useCallback, useEffect } from 'react';
import { createClient } from '@/src/lib/supabase/client';

export interface MemberTask {
  id: string;
  title: string;
  completed: boolean;
  dueDate: string | null;
  createdAt: string;
}

export function useMemberTasks(memberId: string) {
  const [tasks, setTasks] = useState<MemberTask[]>([]);

  const load = useCallback(async () => {
    if (!memberId) return;
    const supabase = createClient();
    const { data } = await supabase
      .from('member_tasks')
      .select('*')
      .eq('member_id', memberId)
      .order('created_at');
    setTasks(
      (data || []).map((r) => ({
        id:        r.id,
        title:     r.title,
        completed: r.completed,
        dueDate:   r.due_date ?? null,
        createdAt: r.created_at,
      }))
    );
  }, [memberId]);

  useEffect(() => { load(); }, [load]);

  const addTask = useCallback(async (title: string, dueDate?: string) => {
    const supabase = createClient();
    const { data } = await supabase
      .from('member_tasks')
      .insert({ member_id: memberId, title, due_date: dueDate ?? null })
      .select()
      .single();
    if (data) setTasks((prev) => [...prev, { id: data.id, title: data.title, completed: false, dueDate: data.due_date ?? null, createdAt: data.created_at }]);
  }, [memberId]);

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

  return { tasks, addTask, toggleTask, deleteTask };
}
