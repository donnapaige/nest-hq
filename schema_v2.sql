-- ============================================================
-- Nest HQ — Schema v2
-- Run AFTER schema.sql. Paste into Supabase SQL Editor and run.
-- ============================================================

-- Add currency to households (default PHP for Philippine market)
alter table public.households add column if not exists currency text default 'PHP';

-- Add access_level to household_members
-- 'adult' = full access, 'child' = restricted, 'caregiver' = no finance
alter table public.household_members
  add column if not exists access_level text default 'adult';

-- Add columns to bills
alter table public.bills add column if not exists image_url          text;
alter table public.bills add column if not exists payment_method     text; -- 'gcash','bpi','bdo','maya','manual','auto'
alter table public.bills add column if not exists reminder_days_before integer; -- notify X days before due

-- ── Member records (milestones, health, allergies, notes) ──────────────────
create table if not exists public.member_records (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id)      on delete cascade,
  member_id    uuid not null references public.household_members(id) on delete cascade,
  type         text not null,   -- 'milestone' | 'health' | 'allergy' | 'appointment' | 'note'
  title        text not null,
  content      text,
  record_date  date,
  created_by   uuid references auth.users(id),
  created_at   timestamptz default now()
);

-- ── Member routines ────────────────────────────────────────────────────────
create table if not exists public.member_routines (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id)      on delete cascade,
  member_id    uuid not null references public.household_members(id) on delete cascade,
  title        text not null,
  time_label   text,                           -- '7:00 AM', 'After school', etc.
  days         text[] default '{}'::text[],    -- ['Mon','Tue','Wed'...]
  order_idx    integer default 0,
  done_today   boolean default false,
  created_at   timestamptz default now()
);

-- ── Activity / family feed ─────────────────────────────────────────────────
create table if not exists public.activity_log (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id)      on delete cascade,
  actor_id     uuid references public.household_members(id)        on delete set null,
  action       text not null,       -- 'created' | 'updated' | 'deleted' | 'completed'
  entity_type  text not null,       -- 'bill' | 'chore' | 'event' | 'shopping_item' | 'goal' | 'member'
  entity_id    uuid,
  description  text not null,
  created_at   timestamptz default now()
);

-- ── Fuel logs ──────────────────────────────────────────────────────────────
create table if not exists public.fuel_logs (
  id             uuid primary key default gen_random_uuid(),
  household_id   uuid not null references public.households(id) on delete cascade,
  member_id      uuid references public.household_members(id)   on delete set null,
  vehicle_name   text,
  liters         numeric not null,
  price_per_liter numeric not null,
  total_cost     numeric not null,
  odometer       numeric,
  fuel_date      date not null default current_date,
  notes          text,
  created_at     timestamptz default now()
);

-- ── Notification preferences ───────────────────────────────────────────────
create table if not exists public.notification_prefs (
  id              uuid primary key default gen_random_uuid(),
  household_id    uuid not null references public.households(id) on delete cascade,
  user_id         uuid not null references auth.users(id)        on delete cascade,
  bills           boolean default true,
  chores          boolean default true,
  events          boolean default true,
  shopping        boolean default true,
  feed_bills      boolean default true,
  feed_chores     boolean default true,
  feed_events     boolean default true,
  feed_shopping   boolean default false,
  feed_members    boolean default true,
  unique(household_id, user_id)
);

-- ── RLS on new tables ──────────────────────────────────────────────────────
alter table public.member_records    enable row level security;
alter table public.member_routines   enable row level security;
alter table public.activity_log      enable row level security;
alter table public.fuel_logs         enable row level security;
alter table public.notification_prefs enable row level security;

-- member_records
create policy "view member records"   on public.member_records for select using (public.is_household_member(household_id));
create policy "add member records"    on public.member_records for insert with check (public.is_household_member(household_id));
create policy "update member records" on public.member_records for update using (public.is_household_member(household_id));
create policy "delete member records" on public.member_records for delete using (public.is_household_member(household_id));

-- member_routines
create policy "view routines"   on public.member_routines for select using (public.is_household_member(household_id));
create policy "add routines"    on public.member_routines for insert with check (public.is_household_member(household_id));
create policy "update routines" on public.member_routines for update using (public.is_household_member(household_id));
create policy "delete routines" on public.member_routines for delete using (public.is_household_member(household_id));

-- activity_log (read-only for members, system writes via triggers)
create policy "view feed"  on public.activity_log for select using (public.is_household_member(household_id));
create policy "add to feed" on public.activity_log for insert with check (public.is_household_member(household_id));

-- fuel_logs
create policy "view fuel"   on public.fuel_logs for select using (public.is_household_member(household_id));
create policy "add fuel"    on public.fuel_logs for insert with check (public.is_household_member(household_id));
create policy "update fuel" on public.fuel_logs for update using (public.is_household_member(household_id));
create policy "delete fuel" on public.fuel_logs for delete using (public.is_household_member(household_id));

-- notification_prefs
create policy "view own prefs"   on public.notification_prefs for select using (auth.uid() = user_id);
create policy "upsert own prefs" on public.notification_prefs for insert with check (auth.uid() = user_id);
create policy "update own prefs" on public.notification_prefs for update using (auth.uid() = user_id);

-- ── Function to add a non-user household member (kid, nanny, etc.) ─────────
create or replace function public.add_household_member(
  p_name         text,
  p_role         text default 'member',
  p_access_level text default 'adult',
  p_emoji        text default '👤',
  p_color        text default '#4C8A8B',
  p_soft         text default '#DDEAEB'
)
returns uuid language plpgsql security definer as $$
declare
  v_household_id uuid;
  v_member_id    uuid;
begin
  select household_id into v_household_id
  from public.household_members
  where user_id = auth.uid()
  limit 1;

  if v_household_id is null then
    raise exception 'no_household';
  end if;

  insert into public.household_members (household_id, user_id, name, role, access_level, color, soft_color, emoji)
  values (v_household_id, null, p_name, p_role, p_access_level, p_color, p_soft, p_emoji)
  returning id into v_member_id;

  -- Log the activity
  insert into public.activity_log (household_id, actor_id, action, entity_type, entity_id, description)
  select v_household_id, hm.id, 'created', 'member', v_member_id, 'Added ' || p_name || ' to the household'
  from public.household_members hm where hm.user_id = auth.uid() and hm.household_id = v_household_id
  limit 1;

  return v_member_id;
end;
$$;

-- ── Function to update household currency ──────────────────────────────────
create or replace function public.update_household_currency(p_currency text)
returns void language plpgsql security definer as $$
declare v_household_id uuid;
begin
  select household_id into v_household_id
  from public.household_members
  where user_id = auth.uid() limit 1;

  update public.households set currency = p_currency where id = v_household_id;
end;
$$;

-- ── Function to join a household via invite code ──────────────────────────
create or replace function public.join_household(
  p_household_id uuid,
  p_invite_code  text
)
returns void language plpgsql security definer as $$
declare
  v_existing uuid;
begin
  -- Verify invite code matches
  if not exists (select 1 from public.households where id = p_household_id and invite_code = p_invite_code) then
    raise exception 'invalid_invite_code';
  end if;

  -- Check user isn't already a member
  select id into v_existing
  from public.household_members
  where household_id = p_household_id and user_id = auth.uid();

  if v_existing is not null then
    return; -- Already a member, silently succeed
  end if;

  insert into public.household_members (household_id, user_id, name, role, access_level)
  values (p_household_id, auth.uid(), '', 'member', 'adult');
end;
$$;

-- ── Supabase Storage: bill-images bucket (run manually in Storage UI or uncomment) ──
-- insert into storage.buckets (id, name, public) values ('bill-images', 'bill-images', true)
-- on conflict do nothing;
-- create policy "Household members can upload bill images"
--   on storage.objects for insert with check (bucket_id = 'bill-images' and auth.role() = 'authenticated');
-- create policy "Anyone can view bill images"
--   on storage.objects for select using (bucket_id = 'bill-images');
