import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function pushToHousehold(householdId: string, payload: object) {
  const { data: subs } = await supabase
    .from('push_subscriptions')
    .select('endpoint, p256dh, auth')
    .eq('household_id', householdId);
  if (!subs?.length) return;
  const msg = JSON.stringify(payload);
  await Promise.allSettled(
    subs.map((s) =>
      webpush.sendNotification(
        { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
        msg
      )
    )
  );
}

export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const todayDay = today.getDate();

  // Fetch all unpaid bills
  const { data: bills } = await supabase
    .from('bills')
    .select('id, name, due_date, amount, bill_type, arrival_day, amount_confirmed, remind_arrival, reminder_days_before, household_id')
    .eq('is_paid', false);

  if (!bills?.length) return NextResponse.json({ ok: true, checked: 0 });

  const sent: string[] = [];

  for (const bill of bills) {
    // Fixed/variable due-date reminder
    if (bill.due_date && bill.reminder_days_before != null) {
      const due = new Date(bill.due_date);
      const daysUntil = Math.round((due.getTime() - today.getTime()) / 86_400_000);
      if (daysUntil === bill.reminder_days_before || daysUntil === 1 || daysUntil === 0) {
        const label = daysUntil === 0 ? 'due today' : daysUntil === 1 ? 'due tomorrow' : `due in ${daysUntil} days`;
        await pushToHousehold(bill.household_id, {
          title: `💸 Bill ${label}`,
          body: `${bill.name} — ${bill.amount ? `₱${bill.amount}` : 'amount TBD'}`,
          url: '/bills',
          tag: `bill-due-${bill.id}`,
        });
        sent.push(`due:${bill.id}`);
      }
    }

    // Variable bill arrival reminder
    if (
      bill.bill_type === 'variable' &&
      bill.remind_arrival &&
      !bill.amount_confirmed &&
      bill.arrival_day &&
      todayDay >= bill.arrival_day
    ) {
      await pushToHousehold(bill.household_id, {
        title: `📊 Enter bill amount`,
        body: `Your ${bill.name} bill has likely arrived. Tap to enter the amount.`,
        url: '/bills',
        tag: `bill-arrival-${bill.id}`,
        requireInteraction: true,
      });
      sent.push(`arrival:${bill.id}`);
    }
  }

  return NextResponse.json({ ok: true, sent });
}
