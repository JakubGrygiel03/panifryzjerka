export type HairLength = "short" | "medium" | "long" | "very_long";

export type AppointmentStatus = "confirmed" | "cancelled" | "completed" | "no_show";
export type AppointmentSource = "online" | "phone" | "walk_in";

export type ServiceVariant = {
  id: string;
  hairLength: HairLength | null;
  label: string;
  durationMinutes: number;
  priceCents: number;
  bufferMinutes: number;
};

export type ServiceGroup = {
  id: string;
  name: string;
  category: string;
  highlight?: boolean;
  staffIds: string[];
  variants: ServiceVariant[];
};

export type BusyInterval = {
  start: Date;
  end: Date;
};

export type WorkingWindow = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
};

export type StaffDayInput = {
  staffId: string;
  workingHours: WorkingWindow[];
  timeOffs: BusyInterval[];
  appointments: BusyInterval[];
};

export type SlotCalculatorInput = {
  date: string;
  timeZone: string;
  durationMinutes: number;
  bufferMinutes: number;
  slotIntervalMinutes: number;
  staff: StaffDayInput[];
  now?: Date;
  leadMinutes?: number;
};

export type AvailableSlot = {
  start: Date;
  end: Date;
  staffId: string;
};

export type PublicSlot = {
  start: string;
  end: string;
  staffId: string;
  staffName: string;
  available: boolean;
};

export type StoredAppointment = {
  id: string;
  tenantId: string;
  serviceId: string;
  staffId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  customerId?: string | null;
  notes: string | null;
  startsAt: string;
  endsAt: string;
  status: AppointmentStatus;
  source: AppointmentSource;
  createdAt: string;
};

export type BookingConfirmation = {
  id: string;
  serviceName: string;
  staffName: string;
  customerName: string;
  startsAt: string;
  endsAt: string;
  googleCalendarUrl: string;
  ics: string;
  emailSent: boolean;
  smsSent: boolean;
};

export type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };
