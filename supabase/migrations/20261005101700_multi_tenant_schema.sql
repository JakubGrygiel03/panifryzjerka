-- PaniFryzjerka — krok 1: schemat multi-tenant silnika rezerwacji.
-- RLS i granty dla anon/authenticated są świadomie pominięte (krok 2).
-- Do tego momentu tabele są odczytywalne tylko przez właściciela migracji i rolę service_role.

create extension if not exists pgcrypto;
create extension if not exists btree_gist;

-- confirmed  — wizyta blokuje slot
-- cancelled  — slot wraca do puli
-- completed  — wizyta się odbyła, historia zostaje zablokowana
-- no_show    — klient nie przyszedł, historia zostaje zablokowana
create type public.appointment_status as enum (
  'confirmed',
  'cancelled',
  'completed',
  'no_show'
);

-- online   — widget na stronie
-- phone    — dopisana z telefonu w panelu /salon
-- walk_in  — klient z ulicy
create type public.appointment_source as enum (
  'online',
  'phone',
  'walk_in'
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Salon (najemca). Jeden wiersz = jeden salon podpięty do silnika.
create table public.tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  phone text not null,
  email text not null,
  timezone text not null default 'Europe/Warsaw',
  address_line text,
  city text,
  slot_interval_minutes integer not null default 15,
  default_buffer_minutes integer not null default 15,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tenants_slug_key unique (slug),
  constraint tenants_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint tenants_phone_not_blank check (char_length(btrim(phone)) between 5 and 32),
  constraint tenants_slot_interval_range check (slot_interval_minutes between 5 and 120),
  constraint tenants_buffer_range check (default_buffer_minutes between 0 and 120)
);

create trigger tenants_set_updated_at
before update on public.tenants
for each row execute function public.set_updated_at();

-- Stylistka przypisana do jednego salonu. auth_user_id spina konto Supabase Auth z panelem /salon.
create table public.staff_members (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  auth_user_id uuid unique references auth.users (id) on delete set null,
  name text not null,
  role text not null default 'Stylistka fryzur',
  avatar_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint staff_members_id_tenant_key unique (id, tenant_id),
  constraint staff_members_name_not_blank check (char_length(btrim(name)) between 1 and 80)
);

create index idx_staff_members_tenant_active
  on public.staff_members (tenant_id)
  where is_active;

create trigger staff_members_set_updated_at
before update on public.staff_members
for each row execute function public.set_updated_at();

-- Usługa rezerwowalna. Wariant długości włosów to osobny wiersz (albo jeden wiersz, gdy cena jest stała).
-- Ceny w groszach. external_id spina wiersz z dokumentem Sanity.
create table public.services (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  external_id text,
  name text not null,
  category text not null,
  duration_minutes integer not null,
  buffer_time_minutes integer not null default 15,
  price_min_cents integer not null,
  price_max_cents integer,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint services_id_tenant_key unique (id, tenant_id),
  constraint services_external_id_key unique (tenant_id, external_id),
  constraint services_name_not_blank check (char_length(btrim(name)) between 1 and 120),
  constraint services_category_not_blank check (char_length(btrim(category)) between 1 and 80),
  constraint services_duration_range check (duration_minutes between 5 and 720),
  constraint services_buffer_range check (buffer_time_minutes between 0 and 180),
  constraint services_price_non_negative check (price_min_cents >= 0),
  constraint services_price_range check (
    price_max_cents is null or price_max_cents >= price_min_cents
  )
);

create index idx_services_tenant_active
  on public.services (tenant_id, category)
  where is_active;

create trigger services_set_updated_at
before update on public.services
for each row execute function public.set_updated_at();

-- Która stylistka wykonuje którą usługę. Oba końce muszą należeć do tego samego salonu.
create table public.staff_services (
  tenant_id uuid not null,
  staff_id uuid not null,
  service_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (staff_id, service_id),
  constraint staff_services_staff_fk
    foreign key (staff_id, tenant_id)
    references public.staff_members (id, tenant_id)
    on delete cascade,
  constraint staff_services_service_fk
    foreign key (service_id, tenant_id)
    references public.services (id, tenant_id)
    on delete cascade
);

create index idx_staff_services_service
  on public.staff_services (service_id);

create index idx_staff_services_tenant
  on public.staff_services (tenant_id);

-- Grafik tygodniowy. Dzień 0 = niedziela … 6 = sobota (zgodnie z date_part('dow') w Europe/Warsaw).
-- Kilka okien jednego dnia jest dozwolone (przerwa obiadowa); okna nie mogą na siebie nachodzić.
create table public.working_hours (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  staff_id uuid not null,
  day_of_week smallint not null,
  start_time time not null,
  end_time time not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint working_hours_staff_fk
    foreign key (staff_id, tenant_id)
    references public.staff_members (id, tenant_id)
    on delete cascade,
  constraint working_hours_day check (day_of_week between 0 and 6),
  constraint working_hours_range check (end_time > start_time),
  constraint working_hours_no_overlap
    exclude using gist (
      staff_id with =,
      day_of_week with =,
      timerange(start_time, end_time, '[)') with &&
    )
);

create index idx_working_hours_staff_day
  on public.working_hours (staff_id, day_of_week);

create trigger working_hours_set_updated_at
before update on public.working_hours
for each row execute function public.set_updated_at();

-- Urlop, chorobowe albo blokada godzin. Zakres jest absolutny (timestamptz, porównywany w UTC).
create table public.time_offs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  staff_id uuid not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  reason text,
  created_at timestamptz not null default now(),
  constraint time_offs_staff_fk
    foreign key (staff_id, tenant_id)
    references public.staff_members (id, tenant_id)
    on delete cascade,
  constraint time_offs_range check (ends_at > starts_at),
  constraint time_offs_no_overlap
    exclude using gist (
      staff_id with =,
      tstzrange(starts_at, ends_at, '[)') with &&
    )
);

create index idx_time_offs_staff_start
  on public.time_offs (staff_id, starts_at);

-- Wizyta. ends_at to koniec okna zajętości: czas usługi + bufor sanitarny.
-- blocking_range jest puste po odwołaniu, więc constraint przestaje trzymać slot.
create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  service_id uuid not null,
  staff_id uuid not null,
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  notes text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status public.appointment_status not null default 'confirmed',
  source public.appointment_source not null default 'online',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  blocking_range tstzrange generated always as (
    case
      when status <> 'cancelled' then tstzrange(starts_at, ends_at, '[)')
      else null
    end
  ) stored,
  constraint appointments_staff_fk
    foreign key (staff_id, tenant_id)
    references public.staff_members (id, tenant_id),
  constraint appointments_service_fk
    foreign key (service_id, tenant_id)
    references public.services (id, tenant_id),
  constraint appointments_range check (ends_at > starts_at),
  constraint appointments_customer_name check (char_length(btrim(customer_name)) between 1 and 120),
  constraint appointments_customer_phone check (char_length(btrim(customer_phone)) between 5 and 32),
  constraint appointments_notes_length check (notes is null or char_length(notes) <= 1000),
  constraint appointments_no_overlap
    exclude using gist (
      staff_id with =,
      blocking_range with &&
    )
);

create index idx_appointments_staff_start
  on public.appointments (staff_id, starts_at);

create index idx_appointments_tenant_start
  on public.appointments (tenant_id, starts_at);

create index idx_appointments_active_staff_start
  on public.appointments (staff_id, starts_at)
  where status <> 'cancelled';

create trigger appointments_set_updated_at
before update on public.appointments
for each row execute function public.set_updated_at();

-- Personel może przyjąć tylko usługę, którą faktycznie wykonuje.
create or replace function public.appointments_require_staff_service()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if not exists (
    select 1
    from public.staff_services as staff_service
    where staff_service.tenant_id = new.tenant_id
      and staff_service.staff_id = new.staff_id
      and staff_service.service_id = new.service_id
  ) then
    raise exception 'Stylistka nie wykonuje tej usługi w tym salonie'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

create trigger appointments_require_staff_service
before insert or update of tenant_id, staff_id, service_id
on public.appointments
for each row execute function public.appointments_require_staff_service();

comment on table public.tenants is 'Salon podpięty do silnika rezerwacji.';
comment on column public.services.price_min_cents is 'Cena minimalna w groszach PLN.';
comment on column public.services.buffer_time_minutes is 'Bufor sanitarny po usłudze. Kalkulator slotów dolicza go do ends_at.';
comment on column public.appointments.ends_at is 'Koniec zajętości fotela: start + czas usługi + bufor. Zakres półotwarty [starts_at, ends_at).';
comment on column public.appointments.blocking_range is 'Puste po statusie cancelled, żeby odwołana wizyta zwolniła termin.';

-- Zamknięcie publicznego API do czasu polityk z kroku 2.
revoke all on table
  public.tenants,
  public.staff_members,
  public.services,
  public.staff_services,
  public.working_hours,
  public.time_offs,
  public.appointments
from anon, authenticated;

-- Salon startowy. Godziny i cennik doszlusują z grafiku oraz CMS, nie z tej migracji.
insert into public.tenants (
  id,
  name,
  slug,
  phone,
  email,
  timezone,
  address_line,
  city
) values (
  '11111111-1111-4111-8111-111111111111',
  'PaniFryzjerka',
  'panifryzjerka',
  '+48880606454',
  'kontakt@panifryzjerka.pl',
  'Europe/Warsaw',
  'ul. Skarpowa 24',
  'Gdańsk'
);

insert into public.staff_members (id, tenant_id, name, role) values
  (
    '22222222-2222-4222-8222-222222222222',
    '11111111-1111-4111-8111-111111111111',
    'Pani Iryna',
    'Stylistka fryzur'
  );
