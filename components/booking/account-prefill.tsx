"use client";

import { useEffect } from "react";
import { useBookingStore } from "@/store/use-booking-store";

export function AccountPrefill({ profile }: { profile: { name: string; phone: string; email: string } | null }) {
  useEffect(() => {
    if (!profile) return;
    const state = useBookingStore.getState();
    if (!state.customerName && profile.name) state.setField("customerName", profile.name);
    if (!state.customerPhone && profile.phone) state.setField("customerPhone", profile.phone);
    if (!state.customerEmail && profile.email) state.setField("customerEmail", profile.email);
  }, [profile]);
  return null;
}
