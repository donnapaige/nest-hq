import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const today = new Date().toISOString().split('T')[0];

  // Fetch all households that have push subscriptions
  const { data: subs } = await supabase
    .from('push_subscriptions')
    .select('household_id, endpoint, p256dh, auth');

  if (!subs?.length) return NextResponse.json({ ok: true });

  // Group by household
  const byHousehold = new Map<string, typeof subs>();
  for (const s of subs) {
    if (!byHousehold.has(s.household_id)) byHousehold.set(s.household_id, []);
    byHousehold.get(s.household_id)!.push(s);
  }

  for (const [householdId, devices] of byHousehold) {
    // Count today's chores
    const { count: choreCount } = await supabase
      .from('chores')
      .select('id', { count: 'exact', head: true })
      .eq('household_id', householdId)
      .eq('is_done', false)
      .lte('due_date', today);

    // Count bills due this week
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const { count: billCount } = await supabase
      .from('bills')
      .select('id', { count: 'exact', head: true })
      .eq('household_id', householdId)
      .eq('is_paid', false)
      .lte('due_date', nextWeek.toISOString().split('T')[0]);

    const parts: string[] = [];
    if (choreCount) parts.push(`${choreCount} chore${choreCount === 1 ? '' : 's'} pending`);
    if (billCount) parts.push(`${billCount} bill${billCount === 1 ? '' : 's'} due this week`);

    const body = parts.length ? parts.join(' · ') : 'All clear for today!';
    const payload = JSON.stringify({
      title: '☀️ Good morning, Nest HQ',
      body,
      url: '/',
      tag: 'daily-briefing',
    });

    await Promise.allSettled(
      devices.map((d) =>
        webpush.sendNotification(
          { endpoint: d.endpoint, keys: { p256dh: d.p256dh, auth: d.auth } },
          payload
        )
      )
    );
  }

  return NextResponse.json({ ok: true });
}
