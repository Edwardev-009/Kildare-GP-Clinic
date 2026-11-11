import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CalendarCheck, CheckCircle2, Clock3, CreditCard, Loader2, Banknote, Sunrise, Sunset, Droplets } from "lucide-react";
import PageHeader from "../components/PageHeader.jsx";
import Seo from "../components/Seo.jsx";
import AvailabilityCalendar from "../components/AvailabilityCalendar.jsx";
import TurnstileWidget from "../components/TurnstileWidget.jsx";
import { clinic } from "../data/content.js";
import { useClinicHours } from "../lib/clinic-hours-context.js";
import usePaymentProviders from "../lib/usePaymentProviders.js";
import {
  ApiError,
  LIVE,
  TURNSTILE_SITE_KEY,
  WINDOW_DAYS,
  addDays,
  createAppointment,
  dateOfIso,
  dublinToday,
  formatDateLong,
  formatDateShort,
  formatPrice,
  getCatalog,
  goToPayment,
  loadSessions,
  loadSlotsFor,
  sessionInfo,
  timeLabel,
} from "../lib/booking.js";
import "../components/AppointmentModal.css";
import "./Book.css";

const STEPS = ["Service", "Morning / Evening", "Date & time", "Your details", "Payment"];
const SHIFTS = [
  { id: "morning", label: "Morning", Icon: Sunrise },
  { id: "evening", label: "Evening", Icon: Sunset },
];
const PHONE_RE = /^[0-9+()\-\s]{6,30}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Book() {
  const [params] = useSearchParams();
  const topRef = useRef(null);
  const { schedule, hoursSummary } = useClinicHours();

  const [step, setStep] = useState(1);
  const [catalog, setCatalog] = useState(null); // { services, doctors }
  const [catalogError, setCatalogError] = useState("");
  const [service, setService] = useState(null);

  const [sessions, setSessions] = useState(null); // per-doctor availability for the chosen service
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [shift, setShift] = useState("");
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsNonce, setSlotsNonce] = useState(0);
  const [slot, setSlot] = useState(null);

  const [form, setForm] = useState({ fullName: "", phone: "", email: "", patientType: "", reason: "", consent: false });
  const [errors, setErrors] = useState({});
  const [method, setMethod] = useState(""); // "online" | "clinic"
  const [provider, setProvider] = useState("stripe"); // "stripe" | "paypal"
  const providers = usePaymentProviders(); // only the methods the dashboard has switched on
  useEffect(() => {
    if (!providers.includes(provider)) setProvider(providers[0]);
  }, [providers, provider]);
  const [botToken, setBotToken] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState("");
  const [result, setResult] = useState(null);

  const today = useMemo(() => (typeof window === "undefined" ? "" : dublinToday()), []);

  /* ---- load the catalogue once ---- */
  const loadCatalog = useCallback(() => {
    setCatalogError("");
    getCatalog()
      .then((c) => {
        setCatalog(c);
        const wanted = params.get("service");
        const match = wanted && c.services.find((s) => s.slug === wanted);
        if (match) setService(match);
      })
      .catch((err) => setCatalogError(err.message || "Online booking is unavailable right now."));
  }, [params]);

  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  /* ---- when the service changes: find out who works Morning / Evening ---- */
  useEffect(() => {
    if (!service || !catalog) return undefined;
    const ctrl = new AbortController();
    setSessions(null);
    setSessionsLoading(true);
    const doctors = catalog.doctors.filter((d) => (d.services || []).some((s) => s.slug === service.slug));
    loadSessions(service.slug, doctors, ctrl.signal, schedule)
      .then((s) => {
        setSessions(s);
        setSessionsLoading(false);
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        setSessions([]);
        setSessionsLoading(false);
      });
    return () => ctrl.abort();
  }, [service, catalog, schedule]);

  /* ---- when a date is chosen: load that day's times ---- */
  useEffect(() => {
    if (!sessions || !service || !shift || !date) return undefined;
    const ctrl = new AbortController();
    setSlotsLoading(true);
    loadSlotsFor(sessions, service.slug, date, shift, ctrl.signal, schedule)
      .then((rows) => {
        setSlots(rows);
        setSlotsLoading(false);
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        setSlots([]);
        setSlotsLoading(false);
        setNotice(err.message);
      });
    return () => ctrl.abort();
  }, [sessions, service, shift, date, slotsNonce, schedule]);

  const info = useMemo(() => {
    const out = {};
    SHIFTS.forEach(({ id }) => {
      out[id] = sessions ? sessionInfo(sessions, id) : { doctors: [], dates: new Set(), next: null };
    });
    return out;
  }, [sessions]);

  const price = service?.price;
  const multipleDoctors = new Set(slots.map((s) => s.doctorSlug)).size > 1;

  function go(next) {
    setNotice("");
    setStep(next);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function chooseService(s) {
    if (service?.slug === s.slug) return;
    setService(s);
    setShift("");
    setDate("");
    setSlot(null);
    setSlots([]);
  }

  function chooseShift(id) {
    if (shift === id) return;
    setShift(id);
    setDate("");
    setSlot(null);
    setSlots([]);
  }

  function chooseDate(d) {
    setDate(d);
    setSlot(null);
  }

  const setField = (name) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((er) => ({ ...er, [name]: undefined }));
  };

  function validateDetails() {
    const er = {};
    if (form.fullName.trim().length < 2) er.fullName = "Please enter your full name.";
    if (!PHONE_RE.test(form.phone.trim())) er.phone = "Please enter a phone number we can reach you on.";
    if (!EMAIL_RE.test(form.email.trim())) er.email = "Please enter a valid email address.";
    if (!form.patientType) er.patientType = "Please tell us if you are a new or existing patient.";
    if (form.reason.length > 300) er.reason = "Please keep this under 300 characters.";
    if (!form.consent) er.consent = "Please agree so we can process your booking.";
    setErrors(er);
    return Object.keys(er).length === 0;
  }

  async function submit(e) {
    e.preventDefault();
    if (submitting) return;
    if (!method) {
      setNotice("Please choose how you would like to pay.");
      return;
    }
    if (TURNSTILE_SITE_KEY && !botToken) {
      setNotice("Please complete the security check.");
      return;
    }
    setSubmitting(true);
    setNotice("");
    try {
      const res = await createAppointment({
        doctor: slot.doctorSlug,
        service: service.slug,
        startTime: slot.start,
        patient: {
          fullName: form.fullName.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          isNewPatient: form.patientType === "new",
          reason: form.reason.trim(),
        },
        gdprConsent: true,
        paymentMethod: method === "online" ? "online" : "pay_at_clinic",
        ...(method === "online" ? { paymentProvider: provider } : {}),
        ...(botToken ? { turnstileToken: botToken } : {}),
      });
      if (method === "online" && res.payment?.checkoutUrl) {
        goToPayment(res.payment.checkoutUrl); // leaves the site: Stripe / PayPal take it from here
        return;
      }
      setResult(res);
    } catch (err) {
      const api = err instanceof ApiError ? err : new ApiError(0, "ERROR", "Something went wrong. Please try again.");
      if (api.code === "SLOT_TAKEN") {
        setNotice("Sorry, that time has just been taken. Please choose another time.");
        setSlot(null);
        setSlotsNonce((n) => n + 1);
        setStep(3);
      } else if (api.code === "VALIDATION" && api.fields) {
        const map = {};
        Object.entries(api.fields).forEach(([k, v]) => {
          map[k.replace("patient.", "").replace("gdprConsent", "consent")] = v;
        });
        setErrors(map);
        setNotice(api.message);
        setStep(4);
      } else {
        setNotice(api.message);
      }
      setBotToken("");
    } finally {
      setSubmitting(false);
    }
  }

  /* ---------------------------------------------------------------- done */
  if (result) {
    const online = method === "online";
    return (
      <>
        <Seo path="/book" />
        <PageHeader eyebrow="Book online" title="Book an appointment" />
        <section className="section container bk">
          <div className="appt-success bk-done" role="status">
            <CheckCircle2 size={40} strokeWidth={1.8} />
            <h2>{online ? "Booking received" : "Appointment booked"}</h2>
            <p>
              {online
                ? "Your booking is saved. Complete payment to confirm it."
                : result.emailSent
                  ? "We've emailed your confirmation. Please pay at the clinic when you visit."
                  : "Your appointment is confirmed. Please pay at the clinic when you visit."}
            </p>
            <dl className="appt-success__summary">
              <div><dt>Reference</dt><dd>{result.reference}</dd></div>
              <div><dt>Service</dt><dd>{service.name}</dd></div>
              <div><dt>Doctor</dt><dd>{slot.doctorName}</dd></div>
              <div><dt>When</dt><dd>{formatDateLong(dateOfIso(slot.start))} at {slot.label}</dd></div>
            </dl>
            {!LIVE && <p className="appt-success__note">Preview mode: nothing was saved.</p>}
            <p className="appt-success__note">
              Need to cancel? Use the link in your confirmation email, or call <a href={clinic.phoneHref}>{clinic.phone}</a>.
            </p>
            {LIVE && result.cancelToken && (
              <Link className="btn btn-primary" to={`/appointment/${result.cancelToken}`}>View or cancel this appointment</Link>
            )}
          </div>
        </section>
      </>
    );
  }

  /* ---------------------------------------------------------------- flow */
  return (
    <>
      <Seo path="/book" />
      <PageHeader
        eyebrow="Book online"
        title="Book a GP or blood test appointment online"
        lede="Choose your service, pick a morning or evening time that suits you and book in a few minutes. Pay online or at the clinic."
      />

      <section className="section container bk" ref={topRef}>
        {!LIVE && <p className="bk-demo">Preview mode: times shown are sample data and nothing is saved.</p>}

        <ol className="bk-steps" aria-label="Booking progress">
          {STEPS.map((label, i) => (
            <li key={label} className={step === i + 1 ? "is-current" : step > i + 1 ? "is-done" : ""} aria-current={step === i + 1 ? "step" : undefined}>
              <span>{i + 1}. {label}</span>
            </li>
          ))}
        </ol>

        {notice && <p className="appt-form__error bk-notice" role="alert">{notice}</p>}

        {/* ---------- 1. Service ---------- */}
        {step === 1 && (
          <div>
            <h2 className="bk-h">Which service do you need?</h2>
            {catalogError ? (
              <div className="bk-empty">
                <p>{catalogError}</p>
                <button type="button" className="btn btn-ghost" onClick={loadCatalog}>Try again</button>
                <p>Or call us on <a href={clinic.phoneHref}>{clinic.phone}</a>.</p>
              </div>
            ) : !catalog ? (
              <p className="bk-loading"><Loader2 size={18} className="appt-form__spin" /> Loading services…</p>
            ) : catalog.services.length === 0 ? (
              <p className="bk-empty">Online booking is not open yet. Please call <a href={clinic.phoneHref}>{clinic.phone}</a> or walk in during opening hours.</p>
            ) : (
              <div className="bk-options">
                {catalog.services.map((s) => (
                  <button key={s.slug} type="button" className={`bk-option${service?.slug === s.slug ? " is-selected" : ""}`} aria-pressed={service?.slug === s.slug} onClick={() => chooseService(s)}>
                    <span className="bk-option__title">
                      {s.slug.includes("blood") && <Droplets size={18} />} {s.name}
                    </span>
                    {s.description && <span className="bk-option__text">{s.description}</span>}
                    <span className="bk-option__meta">
                      <Clock3 size={14} /> {s.durationMinutes} min{Number.isFinite(Number(s.price)) ? ` · ${formatPrice(s.price)}` : ""}
                    </span>
                  </button>
                ))}
              </div>
            )}
            <div className="bk-nav">
              <span />
              <button type="button" className="btn btn-primary" disabled={!service} onClick={() => go(2)}>Continue</button>
            </div>
          </div>
        )}

        {/* ---------- 2. Morning / Evening ---------- */}
        {step === 2 && (
          <div>
            <h2 className="bk-h">Morning or evening?</h2>
            <p className="bk-sub">{service.name} · the doctor you will see depends on the session you choose.</p>
            {sessionsLoading || !sessions ? (
              <p className="bk-loading"><Loader2 size={18} className="appt-form__spin" /> Checking availability…</p>
            ) : (
              <div className="bk-shifts">
                {SHIFTS.map(({ id, label, Icon }) => {
                  const s = info[id];
                  const none = s.dates.size === 0;
                  return (
                    <button key={id} type="button" disabled={none} className={`bk-shift${shift === id ? " is-selected" : ""}`} aria-pressed={shift === id} onClick={() => chooseShift(id)}>
                      <span className="bk-shift__head"><Icon size={20} /> {label}</span>
                      <span className="bk-shift__doc">{none ? "No appointments available" : s.doctors.map((d) => d.name).join(" · ")}</span>
                      {!none && <span className="bk-shift__next">Next available: {formatDateShort(s.next)}</span>}
                    </button>
                  );
                })}
              </div>
            )}
            {sessions && SHIFTS.every(({ id }) => info[id].dates.size === 0) && (
              <p className="bk-empty">There are no online appointments for this service at the moment. Please call <a href={clinic.phoneHref}>{clinic.phone}</a>.</p>
            )}
            <div className="bk-nav">
              <button type="button" className="bk-back" onClick={() => go(1)}>Back</button>
              <button type="button" className="btn btn-primary" disabled={!shift} onClick={() => go(3)}>Continue</button>
            </div>
          </div>
        )}

        {/* ---------- 3. Date & time ---------- */}
        {step === 3 && (
          <div>
            <h2 className="bk-h">Pick a date and time</h2>
            <p className="bk-sub">
              {service.name} · {SHIFTS.find((s) => s.id === shift)?.label} · {info[shift].doctors.map((d) => d.name).join(" · ")}. Times are shown in Irish time.
            </p>
            <div className="bk-datetime">
              <AvailabilityCalendar key={`${service.slug}-${shift}`} today={today} lastDate={addDays(today, WINDOW_DAYS)} available={info[shift].dates} selected={date} onSelect={chooseDate} />
              <div className="bk-times">
                {!date ? (
                  <p className="bk-sub">Choose a day to see available times.</p>
                ) : slotsLoading ? (
                  <p className="bk-loading"><Loader2 size={18} className="appt-form__spin" /> Loading times…</p>
                ) : slots.length === 0 ? (
                  <p className="bk-sub">No {shift} times are left on this day. Please choose another day.</p>
                ) : (
                  <>
                    <h3 className="bk-times__day">{formatDateLong(date)}</h3>
                    <div className="appt-slots" role="group" aria-label="Available times">
                      {slots.map((s) => (
                        <button key={`${s.doctorSlug}-${s.start}`} type="button" className={`appt-slot${slot?.start === s.start && slot?.doctorSlug === s.doctorSlug ? " is-selected" : ""}`} aria-pressed={slot?.start === s.start && slot?.doctorSlug === s.doctorSlug} onClick={() => setSlot(s)}>
                          {s.label}
                          {multipleDoctors && <small className="bk-slot__doc">{s.doctorName}</small>}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="bk-nav">
              <button type="button" className="bk-back" onClick={() => go(2)}>Back</button>
              <button type="button" className="btn btn-primary" disabled={!slot} onClick={() => go(4)}>Continue</button>
            </div>
          </div>
        )}

        {/* ---------- 4. Details ---------- */}
        {step === 4 && (
          <form
            className="appt-form"
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              if (validateDetails()) go(5);
            }}
          >
            <h2 className="bk-h">Your details</h2>
            <p className="bk-sub">{service.name} · {slot.doctorName} · {formatDateLong(dateOfIso(slot.start))} at {slot.label}</p>

            <label>
              Full name
              <input type="text" autoComplete="name" value={form.fullName} onChange={setField("fullName")} aria-invalid={Boolean(errors.fullName)} />
              {errors.fullName && <span className="bk-err">{errors.fullName}</span>}
            </label>
            <div className="appt-form__row">
              <label>
                Phone
                <input type="tel" autoComplete="tel" value={form.phone} onChange={setField("phone")} aria-invalid={Boolean(errors.phone)} />
                {errors.phone && <span className="bk-err">{errors.phone}</span>}
              </label>
              <label>
                Email
                <input type="email" autoComplete="email" value={form.email} onChange={setField("email")} aria-invalid={Boolean(errors.email)} />
                {errors.email && <span className="bk-err">{errors.email}</span>}
              </label>
            </div>

            <fieldset className="appt-form__group">
              <legend>Have you been to the clinic before?</legend>
              <div className="bk-radios">
                {[["new", "New patient"], ["existing", "Existing patient"]].map(([v, l]) => (
                  <label key={v} className="bk-radio">
                    <input type="radio" name="patientType" value={v} checked={form.patientType === v} onChange={setField("patientType")} /> {l}
                  </label>
                ))}
              </div>
              {errors.patientType && <span className="bk-err">{errors.patientType}</span>}
            </fieldset>

            <label>
              Reason for visit <span className="bk-opt">(optional)</span>
              <textarea rows={3} maxLength={300} value={form.reason} onChange={setField("reason")} />
              <span className="bk-hint">A few words are enough. Please do not enter medical history or test results.</span>
              {errors.reason && <span className="bk-err">{errors.reason}</span>}
            </label>

            <label className="bk-consent">
              <input type="checkbox" checked={form.consent} onChange={setField("consent")} />
              <span>
                I have read the <Link to="/privacy" target="_blank">Privacy Policy</Link> and agree to {clinic.name} using my details to manage this appointment and contact me about it.
              </span>
            </label>
            {errors.consent && <span className="bk-err">{errors.consent}</span>}

            <div className="bk-nav">
              <button type="button" className="bk-back" onClick={() => go(3)}>Back</button>
              <button type="submit" className="btn btn-primary">Continue to payment</button>
            </div>
          </form>
        )}

        {/* ---------- 5. Payment ---------- */}
        {step === 5 && (
          <form className="appt-form" onSubmit={submit}>
            <h2 className="bk-h">Payment</h2>
            <dl className="bk-summary">
              <div><dt>Service</dt><dd>{service.name}</dd></div>
              <div><dt>Doctor</dt><dd>{slot.doctorName}</dd></div>
              <div><dt>When</dt><dd>{formatDateLong(dateOfIso(slot.start))} at {timeLabel(slot.start)}</dd></div>
              <div><dt>Patient</dt><dd>{form.fullName}</dd></div>
              {Number.isFinite(Number(price)) && <div><dt>Price</dt><dd><strong>{formatPrice(price)}</strong></dd></div>}
            </dl>

            <fieldset className="appt-form__group">
              <legend>How would you like to pay?</legend>
              <div className="bk-pay">
                <label className={`bk-pay__opt${method === "online" ? " is-selected" : ""}`}>
                  <input type="radio" name="method" value="online" checked={method === "online"} onChange={() => setMethod("online")} />
                  <span><CreditCard size={18} /> <strong>Pay online now</strong><small>Secure card payment. Your appointment is confirmed once paid.</small></span>
                </label>
                <label className={`bk-pay__opt${method === "clinic" ? " is-selected" : ""}`}>
                  <input type="radio" name="method" value="clinic" checked={method === "clinic"} onChange={() => setMethod("clinic")} />
                  <span><Banknote size={18} /> <strong>Pay at the clinic</strong><small>Your appointment is booked now and you pay when you visit.</small></span>
                </label>
              </div>
            </fieldset>

            {method === "online" && (
              <fieldset className="appt-form__group">
                <legend>Pay with</legend>
                <div className="bk-radios">
                  <label className="bk-radio"><input type="radio" name="provider" value="stripe" checked={provider === "stripe"} onChange={() => setProvider("stripe")} /> Card (Visa, Mastercard, Apple Pay, Google Pay)</label>
                  {providers.includes("paypal") && <label className="bk-radio"><input type="radio" name="provider" value="paypal" checked={provider === "paypal"} onChange={() => setProvider("paypal")} /> PayPal</label>}
                </div>
                <span className="bk-hint">You will be taken to a secure payment page. We never see or store your card details. Your time is held for a few minutes while you pay.</span>
              </fieldset>
            )}

            <TurnstileWidget onToken={setBotToken} />

            <div className="bk-nav">
              <button type="button" className="bk-back" onClick={() => go(4)}>Back</button>
              <button type="submit" className="btn btn-primary" disabled={submitting || !method}>
                {submitting ? <>Please wait… <Loader2 size={16} className="appt-form__spin" /></> : method === "online" ? <>Pay{Number.isFinite(Number(price)) ? ` ${formatPrice(price)}` : ""} &amp; confirm <CalendarCheck size={16} /></> : <>Confirm booking <CalendarCheck size={16} /></>}
              </button>
            </div>
          </form>
        )}

        <details className="bk-info">
          <summary>How online booking works</summary>
          <p>
            Choose a service, then Morning or Evening, and pick a free time. You can pay online or at the clinic. Opening hours: {hoursSummary}
            {" "}Blood tests are by online appointment only. For urgent problems call <a href={clinic.phoneHref}>{clinic.phone}</a> or 999 in an emergency.
          </p>
        </details>
      </section>
    </>
  );
}
