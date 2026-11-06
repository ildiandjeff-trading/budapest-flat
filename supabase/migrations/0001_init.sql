-- Budapest flat app: stays, guest guide, owner-only editing
create table public.owners (email text primary key);

create or replace function public.is_owner() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.owners where lower(email) = lower(auth.jwt() ->> 'email'));
$$;

create table public.stays (
  id uuid primary key default gen_random_uuid(),
  guest_name text not null,
  start_date date not null,
  end_date date not null check (end_date > start_date),
  guests int not null default 1 check (guests > 0),
  color text not null default '#2b6cb0',
  notes text,
  created_at timestamptz not null default now()
);
create index stays_dates on public.stays (start_date, end_date);

create table public.guide_sections (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  icon text not null default 'info',
  body text not null default '',
  position int not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.owners enable row level security;
alter table public.stays enable row level security;
alter table public.guide_sections enable row level security;

-- Owners: full access to stays. Guests (anon): see the calendar.
create policy "stays readable" on public.stays for select using (true);
create policy "owners write stays" on public.stays for all to authenticated using (public.is_owner()) with check (public.is_owner());

-- Guide: everyone can read, owners edit.
create policy "guide readable" on public.guide_sections for select using (true);
create policy "owners write guide" on public.guide_sections for all to authenticated using (public.is_owner()) with check (public.is_owner());

create policy "owners see owners" on public.owners for select to authenticated using (public.is_owner());

alter publication supabase_realtime add table public.stays;
