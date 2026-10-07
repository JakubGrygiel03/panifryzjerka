create table if not exists public.admin_credentials (
  id int primary key default 1 check (id = 1),
  password_hash text not null
);

create table if not exists public.customers (
  id uuid primary key,
  email text not null unique,
  name text not null,
  phone text not null,
  password_hash text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.password_resets (
  hash text primary key,
  email text not null,
  role text not null check (role in ('customer', 'admin')),
  exp timestamptz not null
);

alter table public.admin_credentials enable row level security;
alter table public.customers enable row level security;
alter table public.password_resets enable row level security;

grant select, insert, update, delete on public.admin_credentials to service_role;
grant select, insert, update, delete on public.customers to service_role;
grant select, insert, update, delete on public.password_resets to service_role;
