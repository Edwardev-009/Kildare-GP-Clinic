// Static appointment booking rules.
// Slots are generated from `openingSchedule` in content.js, so changing the clinic
// hours there changes the bookable days and times here automatically.
// Later this can be replaced by data from the doctors' dashboard (booked slots etc.).

import { openingSchedule, formatTime } from "./content.js";

export const BOOKING_WINDOW_DAYS = 30; // how far ahead a patient can book
export const MIN_NOTICE_DAYS = 1; // no same-day bookings: earliest bookable day is tomorrow
export const CLINIC_TIME_ZONE = "Europe/Dublin"; // "today" is always the date in Kildare, Ireland
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

// Only offer a shift in the form if the clinic has at least one session for it.
// (If evening hours are switched off in content.js, the Evening option disappears automatically.)
export const ACTIVE_SHIFTS = SHIFTS.filter(({ id }) =>
  openingSchedule.some(({ sessions }) => sessions.some((session) => isMorningSession(session) === (id === "morning"))),
);

const toMinutes = (value) => {
  const [h, m] = value.split(":").map(Number);
  return h * 60 + m;
};

const toValue = (minutes) =>
  `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;

// ---- date helpers (all in the visitor's local time) ----

// Today's calendar date in Ireland, whatever time zone the patient's device is in.
// Returned as a date-only value (midnight) so it can be compared with calendar days.
export function clinicToday(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: CLINIC_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const get = (type) => Number(parts.find((part) => part.type === type).value);
  return new Date(get("year"), get("month") - 1, get("day"));
}

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
// Same-day booking is not allowed, so every slot of an open session is offered.
export function slotsFor(date, shift) {
  const slots = [];
  for (const { opens, closes } of sessionsFor(date, shift)) {
    for (let t = toMinutes(opens); t + SLOT_MINUTES <= toMinutes(closes); t += SLOT_MINUTES) slots.push(t);
  }
  return slots.map((t) => ({ value: toValue(t), label: formatTime(toValue(t)) }));
}

// `today` must be the clinic's (Irish) date from clinicToday().
export function isBookable(date, shift, today) {
  const day = startOfDay(date);
  if (day < addDays(today, MIN_NOTICE_DAYS) || day > addDays(today, BOOKING_WINDOW_DAYS)) return false;
  return slotsFor(day, shift).length > 0;
}

export function firstBookableDate(shift, today) {
  for (let i = MIN_NOTICE_DAYS; i <= BOOKING_WINDOW_DAYS; i += 1) {
    const day = addDays(today, i);
    if (isBookable(day, shift, today)) return day;
  }
  return null;
}