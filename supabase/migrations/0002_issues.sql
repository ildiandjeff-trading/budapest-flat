-- Problems guests report about the flat
create table public.issues (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  details text,
  area text not null default 'Other',
  urgency text not null default 'normal' check (urgency in ('low', 'normal', 'urgent')),
  reported_by text,
  status text not null default 'open' check (status in ('open', 'in_progress', 'resolved')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);
create index issues_created on public.issues (created_at desc);

alter table public.issues enable row level security;
create policy "members manage issues" on public.issues for all to authenticated
  using ((select public.is_member())) with check ((select public.is_member()));

alter publication supabase_realtime add table public.issues;
