import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";

export function bookingBackend(): "supabase" | "local" | "unconfigured" {
  if (isSupabaseAdminConfigured()) return "supabase";
  if (process.env.NODE_ENV !== "production") return "local";
  return "unconfigured";
}
