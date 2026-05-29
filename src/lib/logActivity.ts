import { createClient } from '@/src/lib/supabase/client';

export async function logActivity(opts: {
  householdId: string;
  actorId?: string | null;
  action: 'created' | 'updated' | 'deleted' | 'completed';
  entityType: string;
  entityId?: string;
  description: string;
}) {
  const supabase = createClient();
  await supabase.from('activity_log').insert({
    household_id: opts.householdId,
    actor_id:     opts.actorId ?? null,
    action:       opts.action,
    entity_type:  opts.entityType,
    entity_id:    opts.entityId ?? null,
    description:  opts.description,
  });
}
