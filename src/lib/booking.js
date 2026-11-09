// Client for the Kildare dashboard's public API (see API.md).
//
// - Live mode: set VITE_API_URL to the dashboard backend origin (no trailing /api/public).
// - Demo mode (no VITE_API_URL): sample doctors and times are generated here and nothing is saved,
//   so `npm run dev` works without a backend.
//
// All times arrive as UTC ISO strings and are shown in Irish time (Europe/Dublin). The browser's own
// timezone is never used for display.

import { openingSchedule } from "../data/content.js";

const ORIGIN = String(import.meta.env.VITE_API_URL || "").trim().replace(/\/+$/, "");
const BASE = `${ORIGIN}/api/public`;

export const LIVE = Boolean(ORIGIN);
export const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || "";
export const TZ = "Europe/Dublin";
export const WINDOW_DAYS = 60; // how far ahead the calendar looks (the backend allows up to 60)

export class ApiError extends Error {
  constructor(status, code, message, fields) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.fields = fields || null;
  }
}

/* ---------------------------------------------------------------- date helpers (Irish time) */

const pad = (n) => String(n).padStart(2, "0");

export function dublinToday() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date()); // YYYY-MM-DD
}

export function addDays(dateStr, n) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`;
}

export const weekdayOf = (dateStr) => new Date(`${dateStr}T12:00:00Z`).getUTCDay(); // 0 = Sunday

export function formatDateLong(dateStr) {
  return new Date(`${dateStr}T12:00:00Z`).toLocaleDateString("en-IE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });
}

export function formatDateShort(dateStr) {
  return new Date(`${dateStr}T12:00:00Z`).toLocaleDateString("en-IE", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

export const dateOfIso = (iso) => new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date(iso));

export function timeLabel(iso) {
  return new Intl.DateTimeFormat("en-IE", { timeZone: TZ, hour: "numeric", minute: "2-digit", hour12: true })
    .format(new Date(iso))
    .replace(/\s/g, " ")
    .toLowerCase();
}

export function dublinHour(iso) {
  return Number(new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "2-digit", hourCycle: "h23" }).format(new Date(iso)));
}

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const toMinutes = (hhmm) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3));
// Slots starting before this hour count as Morning when no opening session covers them (e.g. Friday blood tests).
const FALLBACK_SPLIT_HOUR = 15;

/**
 * Morning or evening? Uses the clinic's opening sessions in src/data/content.js (a session that opens before
 * noon is "Morning", otherwise "Evening"), the same rule the Home and Contact pages use. A slot outside every
 * opening session (a doctor's special hours) falls back to a simple clock rule.
 */
export function shiftOfSlot(iso, date, schedule = openingSchedule) {
  const day = schedule.find((d) => d.day === DAY_NAMES[weekdayOf(date)]);
  const hhmm = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(new Date(iso));
  const at = toMinutes(hhmm);
  const session = day?.sessions.find(({ opens, closes }) => at >= toMinutes(opens) && at < toMinutes(closes));
  if (session) return session.shift || (toMinutes(session.opens) < 12 * 60 ? "morning" : "evening");
  return dublinHour(iso) < FALLBACK_SPLIT_HOUR ? "morning" : "evening";
}

export const formatPrice = (n) => (Number.isFinite(Number(n)) ? `€${Number(n) % 1 === 0 ? Number(n) : Number(n).toFixed(2)}` : "");

/* ---------------------------------------------------------------- demo data */

function tzOffsetMs(utcMs) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(new Date(utcMs));
  const get = (t) => Number(parts.find((p) => p.type === t).value);
  return Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second")) - utcMs;
}

function dublinLocalToIso(dateStr, hhmm) {
  const [y, mo, d] = dateStr.split("-").map(Number);
  const [h, m] = hhmm.split(":").map(Number);
  const guess = Date.UTC(y, mo - 1, d, h, m);
  return new Date(guess - tzOffsetMs(guess)).toISOString();
}

const DEMO = {
  services: [
    { slug: "general-consultation", name: "General Consultation", durationMinutes: 20, price: 60, description: "See a GP about an illness, injury or health concern." },
    { slug: "blood-test", name: "Blood Test", durationMinutes: 20, price: 25, description: "Blood test by appointment, Fridays only." },
  ],
  doctors: [
    { slug: "dr-sania-batool", name: "Dr Sania Batool", qualifications: "", services: ["general-consultation", "blood-test"] },
    { slug: "dr-s-rasool", name: "Dr S. Rasool", qualifications: "", services: ["general-consultation"] },
  ],
  // [doctor, service] -> weekday (0 = Sun) -> [from, to]
  schedule: {
    "dr-sania-batool": { "general-consultation": { 1: ["09:00", "13:00"], 2: ["09:00", "13:00"], 3: ["09:00", "13:00"], 4: ["09:00", "13:00"], 6: ["09:00", "13:00"] }, "blood-test": { 5: ["09:00", "12:00"] } },
    "dr-s-rasool": { "general-consultation": { 1: ["17:00", "19:00"], 2: ["17:00", "19:00"], 4: ["17:00", "19:00"] } },
  },
};

function demoSlots(doctorSlug, serviceSlug, date) {
  const range = DEMO.schedule[doctorSlug]?.[serviceSlug]?.[weekdayOf(date)];
  if (!range) return [];
  const service = DEMO.services.find((s) => s.slug === serviceSlug);
  const step = service?.durationMinutes || 20;
  const toMin = (t) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3));
  const out = [];
  for (let m = toMin(range[0]); m + step <= toMin(range[1]); m += step) {
    const start = dublinLocalToIso(date, `${pad(Math.floor(m / 60))}:${pad(m % 60)}`);
    const end = new Date(Date.parse(start) + step * 60000).toISOString();
    if (Date.parse(start) > Date.now() + 2 * 3600000) out.push({ start, end, label: timeLabel(start) });
  }
  return out;
}

const demoDelay = (v) => new Promise((r) => setTimeout(() => r(v), 250));

/* ---------------------------------------------------------------- http */

async function request(path, { method = "GET", body, signal } = {}) {
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (err) {
    if (err && err.name === "AbortError") throw err;
    throw new ApiError(0, "NETWORK", "We couldn't reach the booking system. Please check your connection and try again.");
  }
  let data = null;
  try {
    data = await res.json();
  } catch {
    /* empty or non-JSON body */
  }
  if (!res.ok) {
    throw new ApiError(res.status, data?.code || "ERROR", data?.message || "Something went wrong. Please try again.", data?.errors);
  }
  return data;
}

/* ---------------------------------------------------------------- catalogue */

// { services: [{slug, name, durationMinutes, description, price?}], doctors: [{slug, name, qualifications, services:[{slug}]}] }
export async function getCatalog(signal) {
  if (!LIVE) {
    return demoDelay({
      services: DEMO.services,
      doctors: DEMO.doctors.map((d) => ({ ...d, services: d.services.map((slug) => ({ slug })) })),
    });
  }
  const [s, d] = await Promise.all([request("/services", { signal }), request("/doctors", { signal })]);
  return { services: s.services || [], doctors: d.doctors || [] };
}

async function getAvailableDates(doctor, service, from, to, signal) {
  if (!LIVE) {
    const out = [];
    for (let d = from; d <= to; d = addDays(d, 1)) if (demoSlots(doctor, service, d).length) out.push(d);
    return out;
  }
  const q = new URLSearchParams({ from, to, service });
  const r = await request(`/doctors/${encodeURIComponent(doctor)}/availability?${q}`, { signal });
  return r.dates || [];
}

async function getSlots(doctor, service, date, signal) {
  if (!LIVE) return demoSlots(doctor, service, date);
  const q = new URLSearchParams({ date, service });
  const r = await request(`/doctors/${encodeURIComponent(doctor)}/slots?${q}`, { signal });
  return r.slots || [];
}

/**
 * Works out which doctor works which session (Morning / Evening) for a service, from the availability
 * the doctors set in the dashboard. For each doctor it reads the free dates, then looks at one date per
 * weekday to see if that weekday is a morning and/or evening session.
 * -> [{ doctor, dates: ["2026-11-09", ...], shiftsByDow: Map(weekday -> Set("morning"|"evening")) }]
 */
export async function loadSessions(serviceSlug, doctors, signal, schedule = openingSchedule) {
  const from = dublinToday();
  const to = addDays(from, WINDOW_DAYS);
  return Promise.all(
    doctors.map(async (doctor) => {
      try {
        const dates = await getAvailableDates(doctor.slug, serviceSlug, from, to, signal);
        const firstPerWeekday = new Map();
        dates.forEach((d) => {
          const w = weekdayOf(d);
          if (!firstPerWeekday.has(w)) firstPerWeekday.set(w, d);
        });
        const probes = await Promise.all(
          [...firstPerWeekday].map(async ([w, d]) => {
            const slots = await getSlots(doctor.slug, serviceSlug, d, signal);
            return [w, new Set(slots.map((s) => shiftOfSlot(s.start, d, schedule)))];
          }),
        );
        return { doctor, dates, shiftsByDow: new Map(probes) };
      } catch (err) {
        if (err && err.name === "AbortError") throw err;
        return { doctor, dates: [], shiftsByDow: new Map() };
      }
    }),
  );
}

// For one session: which doctors work it, and which dates have it.
export function sessionInfo(sessions, shift) {
  const doctors = [];
  const dates = new Set();
  sessions.forEach(({ doctor, dates: ds, shiftsByDow }) => {
    const mine = ds.filter((d) => shiftsByDow.get(weekdayOf(d))?.has(shift));
    if (mine.length) {
      doctors.push(doctor);
      mine.forEach((d) => dates.add(d));
    }
  });
  return { doctors, dates, next: [...dates].sort()[0] || null };
}

// Free slots of one session on one date, from every doctor who works it: [{doctorSlug, doctorName, start, end, label}]
export async function loadSlotsFor(sessions, serviceSlug, date, shift, signal, schedule = openingSchedule) {
  const rows = await Promise.all(
    sessions
      .filter((s) => s.dates.includes(date))
      .map(async ({ doctor }) => {
        const slots = await getSlots(doctor.slug, serviceSlug, date, signal);
        return slots
          .filter((s) => shiftOfSlot(s.start, date, schedule) === shift)
          .map((s) => ({ doctorSlug: doctor.slug, doctorName: doctor.name, start: s.start, end: s.end, label: s.label || timeLabel(s.start) }));
      }),
  );
  return rows.flat().sort((a, b) => Date.parse(a.start) - Date.parse(b.start));
}

/* ---------------------------------------------------------------- clinic opening hours */

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

// Accepts the API's schedule only if every day and session is well formed; otherwise the site keeps its built-in hours.
function validSchedule(list) {
  if (!Array.isArray(list) || list.length !== 7) return null;
  const out = [];
  for (const d of list) {
    if (!d || !DAY_NAMES.includes(d.day) || !Array.isArray(d.sessions)) return null;
    const sessions = [];
    for (const s of d.sessions) {
      if (!s || !TIME_RE.test(s.opens) || !TIME_RE.test(s.closes) || s.opens >= s.closes) return null;
      sessions.push({ opens: s.opens, closes: s.closes, ...(s.shift === "morning" || s.shift === "evening" ? { shift: s.shift } : {}) });
    }
    out.push({ day: d.day, sessions });
  }
  return DAY_NAMES.slice(1).concat(DAY_NAMES[0]).every((n, i) => out[i].day === n) ? out : null; // Monday … Sunday
}

// -> the dashboard's "Website Clinic Timing" as [{ day, sessions:[{opens, closes, shift?}] }] (Monday first), or null.
export async function getClinicHours(signal) {
  if (!LIVE) return null;
  const r = await request("/clinic-hours", { signal });
  return validSchedule(r.schedule);
}

// -> which online payment providers the dashboard has switched on, e.g. ["stripe", "paypal"]
export async function getPaymentProviders(signal) {
  if (!LIVE) return ["stripe", "paypal"];
  const r = await request("/payment-methods", { signal });
  return (r.providers || []).filter((p) => p === "stripe" || p === "paypal");
}

/* ---------------------------------------------------------------- appointments */

// body: { doctor, service, startTime, patient{}, gdprConsent, paymentMethod: "online"|"pay_at_clinic",
//         paymentProvider?: "stripe"|"paypal", turnstileToken? }
export async function createAppointment(body) {
  if (!LIVE) {
    return demoDelay({
      reference: "KC-DEMO22",
      cancelToken: "demo",
      status: body.paymentMethod === "online" ? "pending_payment" : "confirmed",
      emailSent: false,
      payment: null,
      demo: true,
    });
  }
  return request("/appointments", { method: "POST", body });
}

export const getAppointment = (token) => (LIVE ? request(`/appointments/${encodeURIComponent(token)}`) : Promise.reject(new ApiError(404, "NOT_FOUND", "Appointment links work once online booking is connected.")));
export const cancelAppointment = (token) => request(`/appointments/${encodeURIComponent(token)}/cancel`, { method: "POST", body: {} });
export const payAppointment = (token, paymentProvider) => request(`/appointments/${encodeURIComponent(token)}/pay`, { method: "POST", body: { paymentProvider } });

/* ---------------------------------------------------------------- medical certificates */

// body: { type, patient{fullName, phone, email, contactVia: "email"|"whatsapp", note?}, gdprConsent,
//         paymentProvider: "stripe"|"paypal", turnstileToken? }
export async function createCertificateRequest(body) {
  if (!LIVE) return demoDelay({ reference: "MC-DEMO22", token: "demo", payment: null, demo: true });
  return request("/certificate-requests", { method: "POST", body });
}

export const getCertificateRequest = (token) => (LIVE ? request(`/certificate-requests/${encodeURIComponent(token)}`) : Promise.reject(new ApiError(404, "NOT_FOUND", "Not available in demo mode.")));
export const payCertificateRequest = (token, paymentProvider) => request(`/certificate-requests/${encodeURIComponent(token)}/pay`, { method: "POST", body: { paymentProvider } });

// Hands the patient over to the hosted payment page (Stripe Checkout / PayPal). No card details ever touch this site.
export function goToPayment(url) {
  if (!/^https:\/\//i.test(String(url || ""))) throw new ApiError(0, "BAD_PAYMENT_URL", "We couldn't open the payment page. Please try again.");
  window.location.assign(url);
}
