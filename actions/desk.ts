"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod";
import { ADMIN_COOKIE, isAdminCookieValue } from "@/lib/cms/session";
import { saveNote, setTaking, setWaitDone } from "@/lib/salon/desk";

async function requireAdmin() {
  const store = await cookies();
  if (!isAdminCookieValue(store.get(ADMIN_COOKIE)?.value)) {
    throw new Error("Zaloguj się do panelu.");
  }
}

function refresh() {
  revalidatePath("/admin");
  revalidatePath("/admin/klientki");
  revalidatePath("/admin/rezerwa");
  revalidatePath("/admin/analityka");
}

export async function saveClientNote(phone: string, note: string) {
  await requireAdmin();
  const clean = z.string().trim().max(280).parse(note);
  await saveNote(phone, clean);
  refresh();
  return "Notatka zapisana.";
}

export async function closeWait(id: string) {
  await requireAdmin();
  await setWaitDone(z.string().uuid().parse(id), true);
  refresh();
}

export async function reopenWait(id: string) {
  await requireAdmin();
  await setWaitDone(z.string().uuid().parse(id), false);
  refresh();
}

export async function saveTaking(date: string, amountZl: number) {
  await requireAdmin();
  const day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).parse(date);
  const amount = z.number().int().min(0).max(20000).parse(amountZl);
  await setTaking(day, amount);
  refresh();
  return "Kasa zapisana.";
}
