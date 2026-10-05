import { writeFile } from "node:fs/promises";
import { SALON, STAFF } from "../lib/brand.ts";
import { DEFAULT_WORKING_HOURS, SERVICE_CATALOG } from "../lib/booking/catalog.ts";

const serviceRows = SERVICE_CATALOG.flatMap((group) =>
  group.variants.map(
    (variant) =>
      `  ('${variant.id}', '${SALON.tenantId}', '${group.id}-${variant.hairLength ?? "standard"}', '${group.name.replaceAll("'", "''")} — ${variant.label.replaceAll("'", "''")}', '${group.category.replaceAll("'", "''")}', ${variant.durationMinutes}, ${variant.bufferMinutes}, ${variant.priceCents})`,
  ),
).join(",\n");

const linkRows = SERVICE_CATALOG.flatMap((group) =>
  group.staffIds.flatMap((staffId) =>
    group.variants.map((variant) => `  ('${SALON.tenantId}', '${staffId}', '${variant.id}')`),
  ),
).join(",\n");

const hourRows = [STAFF.iryna.id]
  .flatMap((staffId) =>
    DEFAULT_WORKING_HOURS.map(
      (window) =>
        `  ('${SALON.tenantId}', '${staffId}', ${window.dayOfWeek}, '${window.startTime}', '${window.endTime}')`,
    ),
  )
  .join(",\n");

const sql = `-- Cennik startowy PaniFryzjerki. Identyfikatory są zsynchronizowane z lib/booking/catalog.ts.
insert into public.services (
  id, tenant_id, external_id, name, category, duration_minutes, buffer_time_minutes, price_min_cents
) values
${serviceRows};

insert into public.staff_services (tenant_id, staff_id, service_id) values
${linkRows};

insert into public.working_hours (tenant_id, staff_id, day_of_week, start_time, end_time) values
${hourRows};
`;

await writeFile(new URL("../supabase/migrations/20261005104500_seed_catalog.sql", import.meta.url), sql, "utf8");
console.log("seed written");
