# Kildare Clinic website ↔ dashboard: API contract

This is the contract the **website** (`kildaredoc.ie`, React + Vite) now expects from the **dashboard backend**
(`kildare-clinic-backend`, Express + Mongoose, deployed on Vercel). It is written for the dashboard chat/project:
everything under "Already exists" needs no change; everything under "To build" is new.

All public endpoints live under `/api/public` (already mounted before the dashboard's own CORS and login).
Times are UTC ISO strings in JSON, shown by the website in Europe/Dublin. Doctors and services are identified by
`slug`, never by database id. Patient phone / email / reason are never returned by public GET endpoints.

---

## 0. What the website does now

| Feature | Website route | Backend it calls |
|---|---|---|
| Online booking (5 steps: Service → Morning/Evening → Date & time → Details → Payment) | `/book` (`?service=<slug>` pre-selects, e.g. `blood-test`) | services, doctors, availability, slots, `POST /appointments` |
| View / cancel / pay for an appointment | `/appointment/:token` (link in the confirmation email) | `GET/POST /appointments/:token…` |
| Back from Stripe / PayPal | `/payment-result?type=appointment\|certificate&t=<token>[&cancelled=1]` | `GET /appointments/:token`, `GET /certificate-requests/:token` (polled every 3 s, up to 60 s) |
| Online medical certificate (€25, pay first) | `/medical-certificate` | `POST /certificate-requests` (and an EmailJS email to the clinic inbox, see 5.4) |
| Opening-hours cards (Home hero, Contact, About, Physiotherapy, Footer) | all pages | `GET /clinic-hours` (section 6) |
| Privacy policy | `/privacy` | none (static page; linked from the footer and both consent checkboxes) |

The website only **redirects** to Stripe Checkout / PayPal (hosted pages). No card data, no payment SDK, no payment
scripts on the website. The website never trusts the redirect: it shows "paid" only when the API says `paymentStatus: "paid"`.

**Morning / Evening buttons show the doctor's name.** The website works this out itself from the availability the
doctors set (it calls `availability` and `slots` per doctor). A slot is "Morning" if it falls inside an opening
session that opens before 12:00 in `src/data/content.js` (`openingSchedule`), otherwise "Evening". Nothing is hard-coded
per doctor, so changing a doctor's availability in the dashboard changes the website.

---

## 1. Already exists (used as is)

```
GET  /services                                  -> { services:[{slug,name,durationMinutes,description}] }
GET  /doctors                                   -> { doctors:[{slug,name,photoUrl,qualifications,specialties,bio,services:[{slug,name,durationMinutes}]}] }
GET  /doctors/:slug/availability?from&to&service-> { dates:["YYYY-MM-DD"] }        (max 60 days)
GET  /doctors/:slug/slots?date&service          -> { slots:[{start,end,label}] }   (free slots only)
POST /appointments                              -> 201 { reference, cancelToken, cancelUrl, emailSent, appointment }
GET  /appointments/:token                       -> { appointment }
POST /appointments/:token/cancel                -> { appointment, message }
```

Error shape: `{ message, code, errors? }`. Codes the website handles: `SLOT_TAKEN` (409, sends the patient back to pick another time),
`VALIDATION` (400 + `errors` keyed like `patient.email`), `TOO_MANY_BOOKINGS` / `RATE_LIMITED` (429), `BOT_CHECK_FAILED` (400),
`NOT_FOUND` (404), `CANCEL_TOO_LATE` (409), `UNAVAILABLE` (503).

---

## 2. To build — changes to existing endpoints

### 2.1 Price in the catalogue
`GET /services` and the `services[]` inside `GET /doctors` must include `price` (euro, number, from `Service.price`).
The website shows it on the service card and on the payment step. The server price is always the one charged.

### 2.2 `POST /appointments` accepts payment choice
Extend `bookingBody` in `publicSchemas.js` (it is `.strict()`, so unknown fields are rejected today):

```js
paymentMethod:   z.enum(["online", "pay_at_clinic"]).default("pay_at_clinic"),
paymentProvider: z.enum(["stripe", "paypal"]).optional(),   // required when paymentMethod === "online"
```

* `pay_at_clinic` → exactly today's behaviour: `status: "confirmed"`, `paymentMethod: "pay_at_clinic"`, `paymentStatus: "unpaid"`.
* `online` → create the appointment as `status: "pending_payment"`, `paymentMethod: "online"`, `paymentStatus: "pending"`,
  `holdExpiresAt = now + paymentHoldMinutes`, then create the provider checkout (section 4) and return it.
  **Do not email the patient / notify doctors yet** — that happens when the payment is confirmed (section 4.4).
  `createAppointment()` currently hard-codes `status: "confirmed"`; let it take `status`, `paymentMethod`, `holdExpiresAt`.

Response `201`:

```json
{
  "reference": "KC-7H2KQX",
  "cancelToken": "48 hex chars",
  "cancelUrl": "https://kildaredoc.ie/appointment/<token>",
  "emailSent": false,
  "status": "confirmed | pending_payment",
  "appointment": { "...existing summary...", "price": 25 },
  "payment": null
}
```

`payment` is `null` for pay-at-clinic. For online it is `{ "provider": "stripe" | "paypal", "checkoutUrl": "https://…", "expiresAt": "ISO" }`.
Only `https://` checkout URLs are followed by the website.

### 2.3 `GET /appointments/:token` returns payment info
Add to `viewOf()`: `price` (`servicePrice`), `paymentMethod`, `paymentStatus`, `holdExpiresAt`. `canCancel` must be true
for `pending_payment` too (it already allows that status).

### 2.4 `POST /appointments/:token/pay` (new, rate-limited with `tokenLimiter`)
Body `{ "paymentProvider": "stripe" | "paypal" }`. Allowed only when `status === "pending_payment"`,
`paymentStatus !== "paid"` and `holdExpiresAt` is in the future. Creates a fresh checkout and returns
`{ "payment": { "provider", "checkoutUrl", "expiresAt" } }`. Otherwise `409 HOLD_EXPIRED` / `409 ALREADY_PAID`.
Used by "Pay now" on `/appointment/:token` and "Try again" on `/payment-result`.

### 2.5 Slot holds must expire (double-booking safety)
The unique index `(doctor, slotKeys)` with `isActive: true` stays the safety net. An **unpaid hold must not block a slot forever**
(`bookingService.js` already has a note about this):

1. Before `createAppointment` inserts, free expired holds for that doctor/day with `updateMany`
   (`status: "pending_payment"`, `holdExpiresAt < now`) → `{ status: "cancelled", isActive: false, cancelledBy: "system", cancelledAt: now }`.
   **`isActive` must be set explicitly**: `updateMany` does not run the `pre("validate")` hook that syncs it.
2. `loadBusy()` must ignore pending holds that have expired (so slots reappear on the website without waiting for a sweep).
3. A Vercel Cron (every 5 min) cancels expired holds and expires the provider checkout.

**Stripe nuance:** a Checkout Session can't expire sooner than 30 minutes (`expires_at` minimum). Set
`BOOKING_PAYMENT_HOLD_MINUTES=30` so the hold and the session match, and also call `stripe.checkout.sessions.expire()` when a hold is cancelled.
If a payment still arrives for an expired hold (see 4.4), re-claim the slot if it is free, otherwise refund automatically and email the patient.

### 2.6 Cancelling a paid online appointment — refunds are MANUAL
Decided by the clinic: **no automatic refunds** for cancelled appointments (otherwise anyone could book and instantly cancel for a refund).
When a patient cancels a paid online appointment through the website link, the appointment becomes `cancelled` and the slot is freed, but
`paymentStatus` stays `"paid"` and a new `refundStatus: "requested"` is set. The response `message` should say the clinic will review the payment
and be in touch, e.g. "Your appointment is cancelled. The clinic will contact you about your payment." (the website shows `message` as is).
Staff (SuperAdmin/Admin) see a **Refund requested** badge in the dashboard and a **Refund** action that calls the provider's refund API
(Stripe refund / PayPal capture refund), then sets `paymentStatus: "refunded"`, `refundStatus: "done"`, `refundedAt`, plus an audit entry.
Unpaid (pay-at-clinic) cancellations need nothing.

---

## 3. To build — a separate availability for "Blood Test" (Fridays only)

The website needs **no change** for this: it already passes `service=<slug>` to `availability` and `slots`, and shows whatever comes back.
`DoctorAvailability` today has one weekly schedule per doctor, so the backend needs a per-service schedule:

* `Service`: add `ownSchedule: Boolean` (default `false`). SuperAdmin toggles "This service has its own availability" in Settings → Services.
* `DoctorAvailability`: add `serviceSchedules: [{ service: ObjectId, weekly: [weekdaySchema], exceptions: [...], blocks: [...] }]`
  (same shapes as today's `weekly / exceptions / blocks`).
* `loadContext()` returns the service's schedule when `service.ownSchedule` and the doctor has one; otherwise the general one.
  If the service has `ownSchedule` but the doctor has not set it, that doctor has **no** slots for it.
* `loadBusy()` keeps counting **all** of the doctor's active appointments (any service), so a blood test and a GP visit can never overlap.
* Dashboard → Availability page: a selector "General hours | Blood Test hours" above the weekly editor (Friday for blood tests).

Create the service in Settings → Services with the exact name **`Blood Test`** (slug `blood-test`, price 25, `isBookable`, a duration, the doctors
who take bloods). The Home page button links to `/book?service=blood-test`.

---

## 4. To build — online payments (Stripe and PayPal)

New env vars: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `PAYPAL_ENV` (`sandbox`|`live`), `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`,
`PAYPAL_WEBHOOK_ID`, `PUBLIC_SITE_URL` (`https://kildaredoc.ie`, already used by the mailer), `PUBLIC_SITE_ORIGINS`
(`https://kildaredoc.ie,https://www.kildaredoc.ie` plus the Vercel preview URL), `BOOKING_PAYMENT_HOLD_MINUTES=30`, `CERTIFICATE_PRICE_EUR=25`.
Package: `stripe`. PayPal is called over its REST API with `fetch` (no SDK).

### 4.1 Stripe Checkout (card, Apple Pay, Google Pay)
Create a Checkout Session (`mode: "payment"`, `currency: "eur"`, `unit_amount = price * 100` from the **server-side** price, one line item named after the service),
`client_reference_id = reference`, `metadata: { kind: "appointment"|"certificate", id: "<mongo id>" }`, `customer_email` = patient email,
`success_url = ${PUBLIC_SITE_URL}/payment-result?type=<kind>&t=<token>`, `cancel_url = …&cancelled=1`, `expires_at = now + 30 min`.
Return `session.url` as `checkoutUrl`. Store `paymentProvider: "stripe"` and `providerRef: session.id`.

### 4.2 PayPal (Orders v2)
Create an order (`intent: "CAPTURE"`, `purchase_units[0].amount` in EUR from the server price, `custom_id` = `kind:id`,
`payment_source.paypal.experience_context`: `return_url`, `cancel_url` (same URLs as above), `user_action: "PAY_NOW"`).
Return the order's `payer-action` (or `approve`) link as `checkoutUrl`. After approval the order must be **captured**: do it in the webhook
(`CHECKOUT.ORDER.APPROVED` → capture), then `PAYMENT.CAPTURE.COMPLETED` marks it paid.

### 4.3 Webhooks (the only thing that marks something as paid)
* `POST /api/webhooks/stripe` — mount **before** `express.json()` with `express.raw({ type: "application/json" })`;
  verify with `stripe.webhooks.constructEvent`. Handle `checkout.session.completed` (paid), `checkout.session.expired`, `charge.refunded`.
* `POST /api/webhooks/paypal` — verify with PayPal's `verify-webhook-signature` API. Handle `CHECKOUT.ORDER.APPROVED`, `PAYMENT.CAPTURE.COMPLETED`, `PAYMENT.CAPTURE.REFUNDED`.
* **Idempotent**: keep a `PaymentEvent` collection with a unique `eventId`; ignore repeats. State changes must be conditional
  (`findOneAndUpdate({ _id, paymentStatus: { $ne: "paid" } }, …)`) so a duplicate event can't send two emails or create two bookings.
* **Verify before trusting**: amount and currency in the event equal the stored price; `metadata` matches an existing record.
* Respond `2xx` quickly; do the emails after the state change.

### 4.4 When payment is confirmed
* Appointment: `status: "confirmed"`, `paymentStatus: "paid"`, `paidAt`, clear `holdExpiresAt`. **Now** send the patient confirmation email,
  the clinic notice, and `notifyAppointmentEvent({ type: "booking_created" … })` (this is what `POST /appointments` does today for pay-at-clinic).
  Late payment for a cancelled/expired hold: re-activate if the slot is still free, else refund and email the patient.
* Certificate request: `status: "awaiting_doctor"`, `paymentStatus: "paid"` → notification + email to the clinic (section 5.3).

---

## 5. To build — online medical certificates

Not a bookable service: a paid request the doctor works through. The existing `MedicalCertificate` model is the certificate the doctor
**writes**; it requires a registered `Patient`, so the request is a separate collection.

### 5.1 Model `CertificateRequest`
```
reference        "MC-XXXXXX" (same character set as appointments)
token            48 hex chars (public link, unguessable)
type             "sick" | "unfit-travel" | "fit-travel" | "return-to-work"
typeName         snapshot of the title
price            number, from CERTIFICATE_PRICE_EUR (25), never from the client
patient          { fullName, phone, email, contactVia: "email" | "whatsapp", note (≤300) }
gdprConsent      { given, at }
status           "pending_payment" | "awaiting_doctor" | "in_progress" | "issued" | "declined" | "cancelled"
paymentStatus    "unpaid" | "pending" | "paid" | "refunded"
paymentProvider, providerRef, paidAt, refundedAt
assignedDoctor, internalNotes, issuedAt, certificateRef -> MedicalCertificate, declinedReason
timestamps
```
Unpaid requests auto-cancel after 24 h (same cron as 2.5).

### 5.2 Public endpoints
```
POST /certificate-requests                (bookingLimiter + Turnstile, .strict() zod)
  body: { type, patient:{fullName,phone,email,contactVia,note?}, gdprConsent:true, paymentProvider:"stripe"|"paypal", turnstileToken? }
  201:  { reference, token, payment:{provider, checkoutUrl, expiresAt} }
GET  /certificate-requests/:token         (tokenLimiter, no-store)
  200:  { request:{ reference, type, typeName, price, status, paymentStatus } }      // no phone / email / note
POST /certificate-requests/:token/pay     { paymentProvider } -> { payment:{…} }       // only while paymentStatus is not "paid"
```
Limit open unpaid requests per email (like `maxActivePerEmail`). Validation rules mirror the website: name ≥ 2, phone `^[0-9+()\-\s]{6,30}$`, valid email, note ≤ 300.

### 5.3 Dashboard work
* New page **Certificate requests** (SuperAdmin, Admin, Doctor): list with status filter, "awaiting doctor" first, minutes since payment.
* Detail view: patient phone (tap to call), WhatsApp link, note, type, payment status. Actions: **Start call** (`in_progress`),
  **Issue certificate** (opens the existing Certificate form pre-filled; find or create the `Patient`; on save set `issued`, `certificateRef`, `issuedAt`;
  the doctor sends the PDF by the patient's chosen channel), **Decline & refund** (reason; triggers refund; `declined`).
* Notifications (existing bell + email to `info@kildaredoc.ie`) on `awaiting_doctor`: "New paid certificate request". Add types `certificate_request_paid` and `booking_paid`.
* **Decline & refund** is a **full** refund (decided by the clinic) and is triggered by the doctor/admin clicking the action, using the provider refund API (Stripe refund on the payment intent / PayPal capture refund), then `paymentStatus: "refunded"`.
* Audit log entries for every status change (no patient details in logs).

### 5.4 EmailJS email on submit (website side, already built)
When `POST /certificate-requests` succeeds, the website also sends an EmailJS email to the clinic inbox (same service/template as the Contact form,
variables `from_name, phone, email, reply_to, reason, certificate_type, pricing, message`). It states **"payment not confirmed yet"** and the request
reference, because it is sent before the patient pays. The dashboard's own "paid" notification (5.3) is what tells the doctor to call.

---

## 6. Website Clinic Timing (opening-hours cards)

The Home hero card, Contact page cards, About, Physiotherapy and the Footer show the clinic's opening hours. Today they come from
`openingSchedule` in `src/data/content.js`. They must now be editable by SuperAdmin/Admin in the dashboard.

**This changes only what the website displays.** Bookable times still come from each doctor's Availability; the two are independent.

### 6.1 Public endpoint (new)
```
GET /api/public/clinic-hours
200: { "timezone": "Europe/Dublin",
       "schedule": [ { "day": "Monday", "sessions": [ { "shift": "morning", "opens": "09:00", "closes": "13:00" },
                                                      { "shift": "evening", "opens": "17:00", "closes": "19:00" } ] },
                     … Tuesday … Sunday ],            // exactly 7 days, Monday first; sessions: [] = OFF
       "updatedAt": "ISO" }
```
Rules the website enforces (it ignores the response and keeps its built-in hours if any rule fails): exactly 7 days named Monday…Sunday in that order;
`opens`/`closes` are `HH:MM` (24 h) with `opens < closes`; `shift` is `"morning"` or `"evening"` (optional; without it the site treats a session that opens before 12:00 as Morning).
Cache it briefly (`Cache-Control: public, max-age=60, stale-while-revalidate=300`), unlike the token endpoints. Until someone saves, return the current
defaults (the values in `content.js`: Mon, Tue, Thu 9–1 & 5–7; Wed 9–1; Fri OFF; Sat 9–1; Sun 11:55–4:00 shown under Morning).

### 6.2 Storage
Add `openingHours: [{ day, sessions:[{ shift, opens, closes }] }]` to the existing single `ClinicSettings` document (key `clinic`), with `updatedBy`.
Validate on write with the same rules; at most one Morning and one Evening session per day.

### 6.3 Dashboard tab "Website Clinic Timing" (SuperAdmin + Admin only)
New sidebar item and route (e.g. `/website-timing`). A table of 7 rows (Monday–Sunday) with two column groups **Morning** and **Evening**, like the website cards:
each cell has an Open/Closed switch and From / To time inputs (5-minute steps). A day with both cells Closed shows **OFF**. A live preview of the website
cards and of the footer summary line next to the form. Save → `PUT /api/clinic-hours` (authenticated, role-checked) + an audit-log entry
(who, when; no patient data). Show "Last updated by … on …".

### 6.4 What stays static
Google structured data (opening hours in the page JSON-LD), `llms.txt` and the `.md` summaries are generated at build time from `content.js`.
To keep them in step, the dashboard can call a **Vercel Deploy Hook** for the website after each save (store the hook URL in a backend env var). Optional but recommended;
without it those machine-readable copies only change when the website is next deployed.

---

## 7. Dashboard UI for bookings
* Appointments list/detail: show `paymentMethod`, `paymentStatus` (badge: Unpaid – pay at clinic / Pending / Paid / Refunded) and the `pending_payment` status.
* Pay-at-clinic bookings: a "Mark as paid" action (staff took cash/card at the desk).
* Doctors and Admins see website bookings in the existing notification bell (already implemented for `booking_created`).
* Settings → Services (SuperAdmin): price, duration, `isBookable`, doctors, and the new "own availability" toggle (section 3). Services added here appear on the website automatically.

---

## 8. Risks and how each is handled

| Risk | Handling |
|---|---|
| **Double booking** | Unique index `(doctor, slotKeys)` on active bookings; slot re-checked inside `createAppointment`; website handles `409 SLOT_TAKEN`; unpaid holds expire (2.5). |
| **Timezone / DST** | Stored in UTC; availability typed in Europe/Dublin; website formats with `Intl` in `Europe/Dublin`, never the browser's zone. |
| **GDPR** | Both forms have a checkbox saying the patient has read the Privacy Policy (`gdprConsent: true` is still the field name and is required; store it with a timestamp as an acknowledgement); `/privacy` page is live; no patient details in logs or public GETs; free-text fields warn against medical history. Still open for the clinic: legal entity/controller details, retention periods, and whether a DPO/DPIA applies (the privacy page deliberately states none of these). |
| **CORS** | Only `PUBLIC_SITE_ORIGINS`; simple GETs; `Content-Type` is the only allowed header (already in `publicSecurity.js`). |
| **Rate limiting / bots** | Per-IP limits + per-email cap + Cloudflare Turnstile (website reads `VITE_TURNSTILE_SITE_KEY`; backend `TURNSTILE_ENABLED=true`, `TURNSTILE_SECRET`). On serverless the per-IP limit is only a speed bump. |
| **Payments** | Hosted checkout only (no card data on our servers); server-side price; webhook-signed, idempotent, amount-checked confirmation; refund path for declined certificates, late payments and cancellations. |

---

## 9. Website environment

```
VITE_API_URL=https://<dashboard-backend>.vercel.app        # origin only; leave empty for demo mode (sample times, nothing saved)
VITE_TURNSTILE_SITE_KEY=                                  # optional
```
Deploy order: backend changes first (sections 2–6), then the website; the website sends `paymentMethod` / `paymentProvider`, which the current strict
schema rejects. `vercel.json` in the website rewrites `/appointment/:token` to the prerendered page so the emailed link works.
