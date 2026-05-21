-- ============================================================
-- Nest HQ — Supabase Schema
-- Paste this entire file into your Supabase SQL Editor and run it.
-- ============================================================

-- 1. Households
create table if not exists public.households (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  created_by  uuid references auth.users(id) on delete set null,
  invite_code text unique default substring(md5(random()::text), 1, 8),
  created_at  timestamptz default now()
);

-- 2. Household members (links auth users to households + display profile)
create table if not exists public.household_members (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  user_id      uuid references auth.users(id) on delete cascade,
  name         text not null,
  role         text not null default 'member',
  color        text not null default '#4C8A8B',
  soft_color   text not null default '#DDEAEB',
  emoji        text not null default '👤',
  created_at   timestamptz default now(),
  unique(household_id, user_id)
);

-- 3. Events
create table if not exists public.events (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  title        text not null,
  start_time   timestamptz not null,
  end_time     timestamptz,
  all_day      boolean default false,
  member_ids   uuid[] default '{}',
  location     text,
  notes        text,
  recurrence   jsonb,
  created_by   uuid references auth.users(id),
  created_at   timestamptz default now()
);

-- 4. Chores
create table if not exists public.chores (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  title        text not null,
  member_id    uuid references public.household_members(id) on delete set null,
  status       text not null default 'todo',
  due_label    text,
  recurrence   text,
  points       integer default 0,
  completed_at timestamptz,
  created_by   uuid references auth.users(id),
  created_at   timestamptz default now()
);

-- 5. Shopping lists
create table if not exists public.shopping_lists (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  name         text not null default 'Grocery',
  created_at   timestamptz default now()
);

-- 6. Shopping items
create table if not exists public.shopping_items (
  id           uuid primary key default gen_random_uuid(),
  list_id      uuid references public.shopping_lists(id) on delete cascade,
  household_id uuid not null references public.households(id) on delete cascade,
  name         text not null,
  qty          text,
  category     text default 'Other',
  done         boolean default false,
  added_by     uuid references public.household_members(id) on delete set null,
  completed_at timestamptz,
  upc          text,
  created_at   timestamptz default now()
);

-- 7. Bills
create table if not exists public.bills (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  name         text not null,
  vendor       text,
  amount       numeric not null,
  due_date     date not null,
  paid         boolean default false,
  auto_pay     boolean default false,
  recurrence   text,
  category     text,
  created_at   timestamptz default now()
);

-- 8. Savings goals
create table if not exists public.savings_goals (
  id             uuid primary key default gen_random_uuid(),
  household_id   uuid not null references public.households(id) on delete cascade,
  name           text not null,
  icon           text default '🎯',
  color          text default '#4C8A8B',
  target_amount  numeric not null,
  saved_amount   numeric default 0,
  created_at     timestamptz default now()
);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.households       enable row level security;
alter table public.household_members enable row level security;
alter table public.events           enable row level security;
alter table public.chores           enable row level security;
alter table public.shopping_lists   enable row level security;
alter table public.shopping_items   enable row level security;
alter table public.bills            enable row level security;
alter table public.savings_goals    enable row level security;

-- Helper: is the current user a member of a given household?
create or replace function public.is_household_member(hid uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.household_members
    where household_id = hid and user_id = auth.uid()
  );
$$;

-- Households
create policy "view own household"   on public.households for select using (public.is_household_member(id));
create policy "create household"     on public.households for insert with check (auth.uid() = created_by);
create policy "update own household" on public.households for update using (public.is_household_member(id));

-- Household members
create policy "view members"   on public.household_members for select using (public.is_household_member(household_id));
create policy "add members"    on public.household_members for insert with check (public.is_household_member(household_id));
create policy "update members" on public.household_members for update using (public.is_household_member(household_id));

-- Events
create policy "view events"   on public.events for select using (public.is_household_member(household_id));
create policy "add events"    on public.events for insert with check (public.is_household_member(household_id));
create policy "update events" on public.events for update using (public.is_household_member(household_id));
create policy "delete events" on public.events for delete using (public.is_household_member(household_id));

-- Chores
create policy "view chores"   on public.chores for select using (public.is_household_member(household_id));
create policy "add chores"    on public.chores for insert with check (public.is_household_member(household_id));
create policy "update chores" on public.chores for update using (public.is_household_member(household_id));
create policy "delete chores" on public.chores for delete using (public.is_household_member(household_id));

-- Shopping lists
create policy "view lists"   on public.shopping_lists for select using (public.is_household_member(household_id));
create policy "add lists"    on public.shopping_lists for insert with check (public.is_household_member(household_id));

-- Shopping items
create policy "view items"   on public.shopping_items for select using (public.is_household_member(household_id));
create policy "add items"    on public.shopping_items for insert with check (public.is_household_member(household_id));
create policy "update items" on public.shopping_items for update using (public.is_household_member(household_id));
create policy "delete items" on public.shopping_items for delete using (public.is_household_member(household_id));

-- Bills
create policy "view bills"   on public.bills for select using (public.is_household_member(household_id));
create policy "add bills"    on public.bills for insert with check (public.is_household_member(household_id));
create policy "update bills" on public.bills for update using (public.is_household_member(household_id));
create policy "delete bills" on public.bills for delete using (public.is_household_member(household_id));

-- Savings goals
create policy "view goals"   on public.savings_goals for select using (public.is_household_member(household_id));
create policy "add goals"    on public.savings_goals for insert with check (public.is_household_member(household_id));
create policy "update goals" on public.savings_goals for update using (public.is_household_member(household_id));
create policy "delete goals" on public.savings_goals for delete using (public.is_household_member(household_id));

-- ============================================================
-- Household creation function (SECURITY DEFINER bypasses RLS
-- so the first member row can be inserted before the user is
-- technically "a member" yet).
-- ============================================================

create or replace function public.create_household(
  p_name        text,
  p_member_name text,
  p_member_emoji text default '👤',
  p_member_color text default '#4C8A8B',
  p_member_soft  text default '#DDEAEB'
)
returns jsonb language plpgsql security definer as $$
declare
  v_household_id uuid;
  v_member_id    uuid;
  v_invite_code  text;
begin
  -- Guard: user shouldn't already have a household
  if exists (select 1 from public.household_members where user_id = auth.uid()) then
    raise exception 'already_has_household';
  end if;

  -- Unique 8-char invite code
  v_invite_code := substring(md5(random()::text || clock_timestamp()::text), 1, 8);
  while exists (select 1 from public.households where invite_code = v_invite_code) loop
    v_invite_code := substring(md5(random()::text || clock_timestamp()::text), 1, 8);
  end loop;

  insert into public.households (name, created_by, invite_code)
  values (p_name, auth.uid(), v_invite_code)
  returning id into v_household_id;

  insert into public.household_members (household_id, user_id, name, role, color, soft_color, emoji)
  values (v_household_id, auth.uid(), p_member_name, 'owner', p_member_color, p_member_soft, p_member_emoji)
  returning id into v_member_id;

  -- Create the default grocery list
  insert into public.shopping_lists (household_id, name)
  values (v_household_id, 'Grocery');

  return jsonb_build_object(
    'household_id', v_household_id,
    'member_id',    v_member_id,
    'invite_code',  v_invite_code
  );
end;
$$;
