import { useState } from "react";
import emailjs from "@emailjs/browser";
import { Send, CheckCircle2, Loader2 } from "lucide-react";
import {
  CERTIFICATE_REASON,
  CERTIFICATE_TURNAROUND,
  certificateOptions,
} from "../data/certificates.js";
import "./ContactForm.css";

const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

const NOT_APPLICABLE = "Not applicable";

const reasons = [
  "General enquiry",
  "Book a walk-in visit",
  "Vaccinations & travel advice",
  "Chronic condition follow-up",
  CERTIFICATE_REASON,
  "Something else",
];

export default function ContactForm({
  compact = false,
  initialReason = reasons[0],
  initialCertificate = "",
}) {
  // Every form value lives in React state.
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState(initialReason);
  const [certificate, setCertificate] = useState(initialCertificate);
  const [message, setMessage] = useState("");

  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [sentReason, setSentReason] = useState("");

  const needsCertificate = reason === CERTIFICATE_REASON;
  const selectedCertificate = certificateOptions.find((c) => c.id === certificate);

  // Pricing is only relevant for certificates; everything else sends "Not applicable".
  const pricing = needsCertificate
    ? selectedCertificate?.price
      ? `€${selectedCertificate.price}`
      : selectedCertificate
        ? "To be confirmed by the doctor"
        : ""
    : NOT_APPLICABLE;

  async function handleSubmit(e) {
    e.preventDefault();
    if (status === "sending") return;

    if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
      console.error("EmailJS is not configured. Set the VITE_EMAILJS_* environment variables.");
      setStatus("error");
      return;
    }

    setStatus("sending");
    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          from_name: name,
          phone,
          email,
          reply_to: email,
          reason,
          certificate_type: needsCertificate ? selectedCertificate?.label || "" : NOT_APPLICABLE,
          pricing,
          turnaround: needsCertificate ? CERTIFICATE_TURNAROUND : NOT_APPLICABLE,
          message,
        },
        { publicKey: EMAILJS_PUBLIC_KEY },
      );
      setSentReason(reason);
      setStatus("sent");
    } catch (err) {
      console.error("EmailJS send failed:", err);
      setStatus("error");
    }
  }

  if (status === "sent") {
    const isCertificate = sentReason === CERTIFICATE_REASON;
    return (
      <div className="contact-form__success" role="status">
        <CheckCircle2 size={36} strokeWidth={1.8} />
        {isCertificate ? (
          <>
            <h3>Request received</h3>
            <p>
              You'll receive a payment link via email shortly, and one of our
              Doctors will call you for verification. For anything urgent,
              please call or WhatsApp us directly.
            </p>
          </>
        ) : (
          <>
            <h3>Message received</h3>
            <p>
              Thanks for reaching out, a member of our team will get back to you
              during opening hours. For anything urgent, please call or WhatsApp us
              directly.
            </p>
          </>
        )}
      </div>
    );
  }

  const sending = status === "sending";

  return (
    <form className={`contact-form ${compact ? "contact-form--compact" : ""}`} onSubmit={handleSubmit}>
      <div className="contact-form__row">
        <label>
          Full name
          <input
            type="text"
            name="name"
            required
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
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>

      <label>
        Reason for contact
        <select name="reason" value={reason} onChange={(e) => setReason(e.target.value)}>
          {reasons.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </label>

      {needsCertificate && (
        <>
          <label>
            Type of certificate
            <select
              name="certificate"
              required
              value={certificate}
              onChange={(e) => setCertificate(e.target.value)}
            >
              <option value="" disabled>
                Select a certificate type
              </option>
              {certificateOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.price ? `${c.label} — €${c.price}` : c.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            Pricing
            <input
              type="text"
              name="pricing"
              readOnly
              value={pricing}
              placeholder="Select a certificate type to see the price"
            />
          </label>
        </>
      )}

      <label>
        Message
        <textarea
          name="message"
          rows={compact ? 3 : 5}
          placeholder="Tell us a little about what you need"
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </label>

      {status === "error" && (
        <p className="contact-form__error" role="alert">
          Sorry, we couldn't send your message. Please try again, or call or WhatsApp the clinic directly.
        </p>
      )}

      <button type="submit" className="btn btn-primary" disabled={sending}>
        {sending ? (
          <>
            Sending… <Loader2 size={16} className="contact-form__spin" />
          </>
        ) : (
          <>
            {needsCertificate ? "Request certificate" : "Send message"} <Send size={16} />
          </>
        )}
      </button>
    </form>
  );
}
