"use client";

import { create } from "zustand";
import { STAFF } from "@/lib/brand";
import type { BookingConfirmation } from "@/lib/booking/types";

type BookingState = {
  open: boolean;
  step: 1 | 2 | 3 | 4;
  groupId: string | null;
  variantId: string | null;
  staffId: string;
  date: string | null;
  slotStart: string | null;
  slotEnd: string | null;
  slotStaffId: string | null;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  notes: string;
  confirmation: BookingConfirmation | null;
  openBooking: (groupId?: string, variantId?: string) => void;
  closeBooking: () => void;
  setStep: (step: 1 | 2 | 3 | 4) => void;
  setGroup: (groupId: string) => void;
  setVariant: (variantId: string) => void;
  setStaff: (staffId: string) => void;
  setDate: (date: string) => void;
  setSlot: (slot: { start: string; end: string; staffId: string } | null) => void;
  setField: (field: "customerName" | "customerPhone" | "customerEmail" | "notes", value: string) => void;
  setConfirmation: (confirmation: BookingConfirmation | null) => void;
  resetFlow: () => void;
};

const empty = {
  step: 1 as const,
  groupId: null,
  variantId: null,
  staffId: STAFF.iryna.id,
  date: null,
  slotStart: null,
  slotEnd: null,
  slotStaffId: null,
  customerName: "",
  customerPhone: "",
  customerEmail: "",
  notes: "",
  confirmation: null,
};

export const useBookingStore = create<BookingState>((set) => ({
  open: false,
  ...empty,
  openBooking: (groupId, variantId) =>
    set({
      ...empty,
      open: true,
      groupId: groupId ?? null,
      variantId: variantId ?? null,
      step: variantId ? 3 : 1,
      staffId: STAFF.iryna.id,
    }),
  closeBooking: () => set({ open: false }),
  setStep: (step) => set({ step }),
  setGroup: (groupId) => set({ groupId, variantId: null, slotStart: null, slotEnd: null, slotStaffId: null }),
  setVariant: (variantId) => set({ variantId, slotStart: null, slotEnd: null, slotStaffId: null }),
  setStaff: (staffId) => set({ staffId, slotStart: null, slotEnd: null, slotStaffId: null }),
  setDate: (date) => set({ date, slotStart: null, slotEnd: null, slotStaffId: null }),
  setSlot: (slot) =>
    set(
      slot
        ? { slotStart: slot.start, slotEnd: slot.end, slotStaffId: slot.staffId }
        : { slotStart: null, slotEnd: null, slotStaffId: null },
    ),
  setField: (field, value) => set({ [field]: value }),
  setConfirmation: (confirmation) => set({ confirmation }),
  resetFlow: () => set({ ...empty, open: true }),
}));
