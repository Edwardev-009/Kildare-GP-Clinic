// Static appointment booking rules.
// Slots are generated from `openingSchedule` in content.js, so changing the clinic
// hours there changes the bookable days and times here automatically.
// Later this can be replaced by data from the doctors' dashboard (booked slots etc.).

import { openingSchedule, formatTime } from "./content.js";

export const BOOKING_WINDOW_DAYS = 30; // how far ahead a patient can book
export const SLOT_MINUTES = 30; // length of one appointment slot

export const SHIFTS = [
  { id: "morning", label: "Morning" },
  { id: "evening", label: "Evening" },
];

export const APPOINTMENT_REASONS = [
  "General consultation",
  "Follow-up",
  "Travel health advice",
  "Chronic disease review",
  "Physiotherapy",
  "Other",
];

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Same rule as content.js: a session that opens before 12:00 is "Morning", otherwise "Evening".
const isMorningSession = ({ opens }) => Number(opens.split(":")[0]) < 12;

const toMinutes = (value) => {
  const [h, m] = value.split(":").map(Number);
  return h * 60 + m;
};

const toValue = (minutes) =>
  `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;

// ---- date helpers (all in the visitor's local time) ----

export const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
export const addDays = (date, days) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
export const monthStart = (date) => new Date(date.getFullYear(), date.getMonth(), 1);
export const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

export const formatDateLong = (date) =>
  date.toLocaleDateString("en-IE", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

// ---- slots ----

export function sessionsFor(date, shift) {
  const row = openingSchedule.find(({ day }) => day === WEEKDAYS[date.getDay()]);
  return (row?.sessions ?? []).filter((session) => isMorningSession(session) === (shift === "morning"));
}

// Returns [{ value: "10:30", label: "10:30 AM" }, ...] in 30-minute steps.
// For today, slots that have already started are left out.
export function slotsFor(date, shift, now = new Date()) {
  const slots = [];
  for (const { opens, closes } of sessionsFor(date, shift)) {
    for (let t = toMinutes(opens); t + SLOT_MINUTES <= toMinutes(closes); t += SLOT_MINUTES) slots.push(t);
  }
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  return slots
    .filter((t) => !sameDay(date, now) || t > nowMinutes)
    .map((t) => ({ value: toValue(t), label: formatTime(toValue(t)) }));
}

export function isBookable(date, shift, today, now = new Date()) {
  const day = startOfDay(date);
  if (day < today || day > addDays(today, BOOKING_WINDOW_DAYS)) return false;
  return slotsFor(day, shift, now).length > 0;
}

export function firstBookableDate(shift, today, now = new Date()) {
  for (let i = 0; i <= BOOKING_WINDOW_DAYS; i += 1) {
    const day = addDays(today, i);
    if (isBookable(day, shift, today, now)) return day;
  }
  return null;
}
