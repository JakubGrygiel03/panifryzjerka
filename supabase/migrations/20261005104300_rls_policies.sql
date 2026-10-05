-- Krok 2: Row Level Security.
-- anon czyta aktywny cennik, personel i godziny pracy oraz może wstawić wyłącznie
-- potwierdzoną wizytę online. Odczyt danych klientów i edycja grafiku należą do personelu salonu.

create or replace function public.is_staff_of(target_tenant uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.staff_members
    where auth_user_id = auth.uid()
      and tenant_id = target_tenant
      and is_active = true
  );
$$;

revoke all on function public.is_staff_of(uuid) from public;
grant execute on function public.is_staff_of(uuid) to authenticated, service_role;

alter table public.tenants enable row level security;
alter table public.staff_members enable row level security;
alter table public.services enable row level security;
alter table public.staff_services enable row level security;
alter table public.working_hours enable row level security;
alter table public.time_offs enable row level security;
alter table public.appointments enable row level security;

create policy "Public read tenants"
  on public.tenants
  for select
  to anon, authenticated
  using (true);

create policy "Staff manage own tenant"
  on public.tenants
  for all
  to authenticated
  using (public.is_staff_of(id))
  with check (public.is_staff_of(id));

create policy "Public read active staff"
  on public.staff_members
  for select
  to anon, authenticated
  using (is_active = true);

create policy "Staff manage staff"
  on public.staff_members
  for all
  to authenticated
  using (public.is_staff_of(tenant_id))
  with check (public.is_staff_of(tenant_id));

create policy "Public read active services"
  on public.services
  for select
  to anon, authenticated
  using (is_active = true);

create policy "Staff manage services"
  on public.services
  for all
  to authenticated
  using (public.is_staff_of(tenant_id))
  with check (public.is_staff_of(tenant_id));

create policy "Public read staff services"
  on public.staff_services
  for select
  to anon, authenticated
  using (true);

create policy "Staff manage staff services"
  on public.staff_services
  for all
  to authenticated
  using (public.is_staff_of(tenant_id))
  with check (public.is_staff_of(tenant_id));

create policy "Public read working hours"
  on public.working_hours
  for select
  to anon, authenticated
  using (true);

create policy "Staff manage working hours"
  on public.working_hours
  for all
  to authenticated
  using (public.is_staff_of(tenant_id))
  with check (public.is_staff_of(tenant_id));

create policy "Staff read time offs"
  on public.time_offs
  for select
  to authenticated
  using (public.is_staff_of(tenant_id));

create policy "Staff manage time offs"
  on public.time_offs
  for all
  to authenticated
  using (public.is_staff_of(tenant_id))
  with check (public.is_staff_of(tenant_id));

-- Brak publicznego SELECT: telefon i e-mail klientki nie wychodzą do anon.
create policy "Public insert online appointment"
  on public.appointments
  for insert
  to anon, authenticated
  with check (
    status = 'confirmed'
    and source = 'online'
    and ends_at > starts_at
    and char_length(btrim(customer_name)) between 1 and 120
    and char_length(btrim(customer_phone)) between 5 and 32
    and exists (
      select 1
      from public.services
      where services.id = service_id
        and services.tenant_id = tenant_id
        and services.is_active = true
    )
    and exists (
      select 1
      from public.staff_members
      where staff_members.id = staff_id
        and staff_members.tenant_id = tenant_id
        and staff_members.is_active = true
    )
  );

create policy "Staff read appointments"
  on public.appointments
  for select
  to authenticated
  using (public.is_staff_of(tenant_id));

create policy "Staff manage appointments"
  on public.appointments
  for all
  to authenticated
  using (public.is_staff_of(tenant_id))
  with check (public.is_staff_of(tenant_id));

grant select on table
  public.tenants,
  public.staff_members,
  public.services,
  public.staff_services,
  public.working_hours
to anon, authenticated;

grant insert on table public.appointments to anon, authenticated;

grant select, insert, update, delete on table
  public.tenants,
  public.staff_members,
  public.services,
  public.staff_services,
  public.working_hours,
  public.time_offs,
  public.appointments
to authenticated;
