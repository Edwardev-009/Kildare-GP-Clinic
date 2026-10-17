import { useEffect, useMemo, useRef, useState } from "react";
import { X, Send, CheckCircle2, Loader2, Sunrise, Sunset } from "lucide-react";
import BookingCalendar from "./BookingCalendar.jsx";
import {
  ACTIVE_SHIFTS,
  APPOINTMENT_REASONS,
  SHIFTS,
  clinicClock,
  formatDateLong,
  slotsFor,
} from "../data/appointments.js";
import "./AppointmentModal.css";

const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
// A separate EmailJS template for appointment requests (the contact form has its own).
const EMAILJS_APPOINTMENT_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_APPOINTMENT_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

const shiftIcons = { morning: Sunrise, evening: Sunset };

export default function AppointmentModal({ onClose }) {
  const closeRef = useRef(null);
  const [clock] = useState(() => clinicClock());

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [shift, setShift] = useState("");
  const [date, setDate] = useState(null);
  const [time, setTime] = useState(""); // "HH:MM"
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error

  const slots = useMemo(() => (shift && date ? slotsFor(date, shift, clock) : []), [shift, date, clock]);
  const selectedSlot = slots.find((slot) => slot.value === time);
  const shiftLabel = SHIFTS.find((s) => s.id === shift)?.label ?? "";

  useEffect(() => {
    const previouslyFocused = document.activeElement;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      previouslyFocused?.focus?.();
    };
  }, [onClose]);

  function chooseShift(next) {
    if (next === shift) return;
    setShift(next);
    setDate(null);
    setTime("");
  }

  function chooseDate(next) {
    setDate(next);
    setTime("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (status === "sending" || !date || !selectedSlot) return;

    if (!EMAILJS_SERVICE_ID || !EMAILJS_APPOINTMENT_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
      console.error(
        "EmailJS is not configured for appointments. Set VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_APPOINTMENT_TEMPLATE_ID and VITE_EMAILJS_PUBLIC_KEY.",
      );
      setStatus("error");
      return;
    }

    setStatus("sending");
    try {
      // Loaded only when the form is submitted (same approach as the contact form).
      const { default: emailjs } = await import("@emailjs/browser");
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_APPOINTMENT_TEMPLATE_ID,
        {
          from_name: name,
          phone,
          email,
          reply_to: email,
          shift: shiftLabel,
          date: formatDateLong(date),
          time: selectedSlot.label,
          appointment_datetime: `${formatDateLong(date)} at ${selectedSlot.label}`,
          reason,
          message,
        },
        { publicKey: EMAILJS_PUBLIC_KEY },
      );
      setStatus("sent");
    } catch (err) {
      console.error("EmailJS appointment send failed:", err);
      setStatus("error");
    }
  }

  const sending = status === "sending";

  return (
    <div
      className="appt-modal"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="appt-modal__panel" role="dialog" aria-modal="true" aria-labelledby="appt-modal-title">
        <button ref={closeRef} type="button" className="appt-modal__close" onClick={onClose} aria-label="Close form">
          <X size={20} />
        </button>

        {status === "sent" ? (
          <div className="appt-success" role="status">
            <CheckCircle2 size={40} strokeWidth={1.8} />
            <h2 id="appt-modal-title">Request received</h2>
            <p>Our team will confirm your appointment by phone or email.</p>
            <dl className="appt-success__summary">
              <div>
                <dt>Date</dt>
                <dd>{formatDateLong(date)}</dd>
              </div>
              <div>
                <dt>Time</dt>
                <dd>{selectedSlot?.label}</dd>
              </div>
              <div>
                <dt>Reason</dt>
                <dd>{reason}</dd>
              </div>
            </dl>
            <p className="appt-success__note">For anything urgent, please call or WhatsApp us directly.</p>
            <button type="button" className="btn btn-primary" onClick={onClose}>
              Close
            </button>
          </div>
        ) : (
          <>
            <span className="eyebrow">Appointment request</span>
            <h2 id="appt-modal-title">Book an appointment</h2>
            <p className="appt-modal__lede">
              Tell us a little about yourself and choose a time. We&apos;ll confirm your appointment by phone or email.
            </p>

            <form className="appt-form" onSubmit={handleSubmit}>
              <div className="appt-form__row">
                <label>
                  Full name
                  <input
                    type="text"
                    name="name"
                    required
                    autoComplete="name"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </label>
                <label>
                  Phone number
                  <input
                    type="tel"
                    name="phone"
                    required
                    autoComplete="tel"
                    pattern="[0-9+\(\)\s\-]{7,20}"
                    title="Please enter a valid phone number"
                    placeholder="085 000 0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </label>
              </div>

              <label>
                Email address
                <input
                  type="email"
                  name="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>

              <fieldset className="appt-form__group">
                <legend>When would you like to come?</legend>
                <div className="appt-shifts">
                  {ACTIVE_SHIFTS.map(({ id, label }) => {
                    const Icon = shiftIcons[id];
                    return (
                      <label key={id} className={`appt-shift${shift === id ? " is-active" : ""}`}>
                        <input
                          type="radio"
                          name="shift"
                          value={id}
                          required
                          checked={shift === id}
                          onChange={() => chooseShift(id)}
                        />
                        <span className="appt-shift__body">
                          <Icon size={20} />
                          {label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              {shift && (
                <fieldset className="appt-form__group">
                  <legend>Choose a date</legend>
                  <BookingCalendar key={shift} shift={shift} clock={clock} selected={date} onSelect={chooseDate} />
                </fieldset>
              )}

              {shift && date && (
                <fieldset className="appt-form__group">
                  <legend>Choose a time on {formatDateLong(date)}</legend>
                  <div className="appt-slots" role="group" aria-label="Available time slots">
                    {slots.map((slot) => (
                      <button
                        key={slot.value}
                        type="button"
                        className={`appt-slot${time === slot.value ? " is-selected" : ""}`}
                        aria-pressed={time === slot.value}
                        onClick={() => setTime(slot.value)}
                      >
                        {slot.label}
                      </button>
                    ))}
                  </div>
                </fieldset>
              )}

              {selectedSlot && (
                <>
                  <label>
                    Reason for your visit
                    <select name="reason" required value={reason} onChange={(e) => setReason(e.target.value)}>
                      <option value="" disabled>
                        Select a reason
                      </option>
                      {APPOINTMENT_REASONS.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Tell us about your problem
                    <textarea
                      name="message"
                      rows={4}
                      required
                      maxLength={1000}
                      placeholder="Briefly describe your symptoms or what you need help with"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                  </label>

                  {status === "error" && (
                    <p className="appt-form__error" role="alert">
                      Sorry, we couldn&apos;t send your request. Please try again, or call or WhatsApp the clinic directly.
                    </p>
                  )}

                  <button type="submit" className="btn btn-primary appt-form__submit" disabled={sending}>
                    {sending ? (
                      <>
                        Sending… <Loader2 size={16} className="appt-form__spin" />
                      </>
                    ) : (
                      <>
                        Request appointment <Send size={16} />
                      </>
                    )}
                  </button>
                </>
              )}
            </form>
          </>
        )}
      </div>
    </div>
  );
}