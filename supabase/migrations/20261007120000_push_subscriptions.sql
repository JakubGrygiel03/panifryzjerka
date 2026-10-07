-- Subskrypcje powiadomień telefonu właścicielki. Odczyt tylko kluczem serwisowym.
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

alter table public.push_subscriptions enable row level security;

grant select, insert, update, delete on public.push_subscriptions to service_role;
