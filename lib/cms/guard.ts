import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, isAdminCookieValue } from "@/lib/cms/session";

export async function assertAdmin() {
  const store = await cookies();
  if (!isAdminCookieValue(store.get(ADMIN_COOKIE)?.value)) {
    redirect("/admin/logowanie");
  }
}
