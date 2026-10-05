import assert from "node:assert/strict";
import { calculateAnyStaffSlots, calculateSlots } from "./slot-calculator.ts";
import type { StaffDayInput } from "./types.ts";

const hours = [{ dayOfWeek: 1, startTime: "09:00", endTime: "11:00" }];
const now = new Date("2026-10-05T06:00:00.000Z");

function staff(id: string, appointments: StaffDayInput["appointments"] = [], timeOffs: StaffDayInput["timeOffs"] = []): StaffDayInput {
  return { staffId: id, workingHours: hours, appointments, timeOffs };
}

const base = {
  date: "2026-10-05",
  timeZone: "Europe/Warsaw",
  durationMinutes: 30,
  bufferMinutes: 15,
  slotIntervalMinutes: 15,
  now,
  leadMinutes: 30,
};

const slots = calculateSlots({ ...base, staff: [staff("a")] });
assert.deepEqual(
  slots.map((slot) => slot.start.toISOString()),
  [
    "2026-10-05T07:00:00.000Z",
    "2026-10-05T07:15:00.000Z",
    "2026-10-05T07:30:00.000Z",
    "2026-10-05T07:45:00.000Z",
    "2026-10-05T08:00:00.000Z",
    "2026-10-05T08:15:00.000Z",
  ],
);

const blocked = calculateSlots({
  ...base,
  staff: [
    staff("a", [{ start: new Date("2026-10-05T07:00:00.000Z"), end: new Date("2026-10-05T07:45:00.000Z") }]),
  ],
});
assert.equal(blocked[0]?.start.toISOString(), "2026-10-05T07:45:00.000Z");

const off = calculateSlots({
  ...base,
  staff: [staff("a", [], [{ start: new Date("2026-10-05T07:00:00.000Z"), end: new Date("2026-10-05T09:00:00.000Z") }])],
});
assert.equal(off.length, 0);

const sunday = calculateSlots({ ...base, date: "2026-10-04", staff: [staff("a")] });
assert.equal(sunday.length, 0);

const any = calculateAnyStaffSlots({
  ...base,
  staff: [
    staff("b", [{ start: new Date("2026-10-05T07:00:00.000Z"), end: new Date("2026-10-05T08:00:00.000Z") }]),
    staff("a"),
  ],
});
assert.equal(any[0]?.staffId, "a");

const winter = calculateSlots({
  ...base,
  date: "2026-12-07",
  now: new Date("2026-12-07T06:00:00.000Z"),
  staff: [staff("a")],
});
assert.equal(winter[0]?.start.toISOString(), "2026-12-07T08:00:00.000Z");

console.log("slot-calculator: ok");
