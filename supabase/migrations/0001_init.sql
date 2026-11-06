-- Jildi's Budapest Flat: stays + guest guide, one shared login for everyone
create table public.members (email text primary key);

create or replace function public.is_member() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.members where lower(email) = lower(auth.jwt() ->> 'email'));
$$;
revoke execute on function public.is_member() from anon;

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

alter table public.members enable row level security;
alter table public.stays enable row level security;
alter table public.guide_sections enable row level security;

-- Only the shared family account (listed in members) can read or change anything.
create policy "members manage stays" on public.stays for all to authenticated
  using ((select public.is_member())) with check ((select public.is_member()));
create policy "members manage guide" on public.guide_sections for all to authenticated
  using ((select public.is_member())) with check ((select public.is_member()));

alter publication supabase_realtime add table public.stays;
