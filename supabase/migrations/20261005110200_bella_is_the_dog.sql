-- Bella jest psem salonu, nie stylistką. Personel rezerwacji to wyłącznie Pani Iryna.

delete from public.staff_services
where staff_id = '33333333-3333-4333-8333-333333333333';

delete from public.working_hours
where staff_id = '33333333-3333-4333-8333-333333333333';

delete from public.time_offs
where staff_id = '33333333-3333-4333-8333-333333333333';

delete from public.appointments
where staff_id = '33333333-3333-4333-8333-333333333333';

delete from public.staff_members
where id = '33333333-3333-4333-8333-333333333333';
