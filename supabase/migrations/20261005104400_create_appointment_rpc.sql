-- Krok 9: transakcyjny zapis wizyty.
-- Blokada doradcza serializuje zapisy jednej stylistki, a constraint GiST
-- z kroku 1 jest drugą linią obrony, gdy dwa żądania wejdą równocześnie.

create or replace function public.create_appointment(
  p_tenant_id uuid,
  p_service_id uuid,
  p_staff_id uuid,
  p_customer_name text,
  p_customer_phone text,
  p_customer_email text,
  p_notes text,
  p_starts_at timestamptz,
  p_ends_at timestamptz,
  p_source public.appointment_source
) returns public.appointments
language plpgsql
security definer
set search_path = public
as $$
declare
  created public.appointments;
begin
  if p_ends_at <= p_starts_at then
    raise exception 'Nieprawidłowy zakres czasu' using errcode = '22023';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_staff_id::text, 0));

  if exists (
    select 1
    from public.appointments
    where staff_id = p_staff_id
      and status <> 'cancelled'
      and tstzrange(starts_at, ends_at, '[)') && tstzrange(p_starts_at, p_ends_at, '[)')
  ) then
    raise exception 'Ten termin został właśnie zajęty' using errcode = '23P01';
  end if;

  insert into public.appointments (
    tenant_id,
    service_id,
    staff_id,
    customer_name,
    customer_phone,
    customer_email,
    notes,
    starts_at,
    ends_at,
    status,
    source
  ) values (
    p_tenant_id,
    p_service_id,
    p_staff_id,
    btrim(p_customer_name),
    btrim(p_customer_phone),
    nullif(btrim(coalesce(p_customer_email, '')), ''),
    nullif(btrim(coalesce(p_notes, '')), ''),
    p_starts_at,
    p_ends_at,
    'confirmed',
    coalesce(p_source, 'online')
  )
  returning * into created;

  return created;
end;
$$;

revoke all on function public.create_appointment(
  uuid, uuid, uuid, text, text, text, text, timestamptz, timestamptz, public.appointment_source
) from public, anon, authenticated;

grant execute on function public.create_appointment(
  uuid, uuid, uuid, text, text, text, text, timestamptz, timestamptz, public.appointment_source
) to service_role;
