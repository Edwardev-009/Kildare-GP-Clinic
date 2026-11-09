import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, CreditCard, Loader2, ShieldCheck } from "lucide-react";
import TurnstileWidget from "./TurnstileWidget.jsx";
import { certificates, CERTIFICATE_PRICE } from "../data/certificates.js";
import { clinic } from "../data/content.js";
import { sendCertificateEmail } from "../lib/notify-email.js";
import { ApiError, LIVE, TURNSTILE_SITE_KEY, createCertificateRequest, goToPayment } from "../lib/booking.js";
import usePaymentProviders from "../lib/usePaymentProviders.js";
import "./AppointmentModal.css";
import "../pages/Book.css";

const PHONE_RE = /^[0-9+()\-\s]{6,30}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Online medical certificate request: details -> pay online (card / PayPal) -> the doctor phones the patient.
export default function CertificateRequestForm({ certificate }) {
  const [form, setForm] = useState({ type: certificate?.id || "", fullName: "", phone: "", email: "", contactVia: "email", note: "", consent: false });
  const [provider, setProvider] = useState("stripe");
  const providers = usePaymentProviders(); // only the methods the dashboard has switched on
  useEffect(() => {
    if (!providers.includes(provider)) setProvider(providers[0]);
  }, [providers, provider]);
  const [errors, setErrors] = useState({});
  const [botToken, setBotToken] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState("");
  const [done, setDone] = useState(null);

  const set = (name) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((er) => ({ ...er, [name]: undefined }));
  };

  async function submit(e) {
    e.preventDefault();
    if (submitting) return;
    const er = {};
    if (!form.type) er.type = "Please choose a certificate.";
    if (form.fullName.trim().length < 2) er.fullName = "Please enter your full name.";
    if (!PHONE_RE.test(form.phone.trim())) er.phone = "Please enter a phone number the doctor can call.";
    if (!EMAIL_RE.test(form.email.trim())) er.email = "Please enter a valid email address.";
    if (!form.consent) er.consent = "Please agree so we can process your request.";
    setErrors(er);
    if (Object.keys(er).length) return;
    if (TURNSTILE_SITE_KEY && !botToken) {
      setNotice("Please complete the security check.");
      return;
    }
    setSubmitting(true);
    setNotice("");
    try {
      const res = await createCertificateRequest({
        type: form.type,
        patient: { fullName: form.fullName.trim(), phone: form.phone.trim(), email: form.email.trim(), contactVia: form.contactVia, note: form.note.trim() },
        gdprConsent: true,
        paymentProvider: provider,
        ...(botToken ? { turnstileToken: botToken } : {}),
      });
      // Email the clinic inbox too. Wait briefly (max 4 s) so the redirect to the payment page can't cancel it.
      await Promise.race([
        sendCertificateEmail({
          reference: res.reference,
          name: form.fullName.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          certificate: certificates.find((c) => c.id === form.type)?.title || form.type,
          price: certificates.find((c) => c.id === form.type)?.price ?? CERTIFICATE_PRICE,
          contactVia: form.contactVia,
          note: form.note.trim(),
          provider,
        }),
        new Promise((resolve) => setTimeout(resolve, 4000)),
      ]);
      if (res.payment?.checkoutUrl) {
        goToPayment(res.payment.checkoutUrl);
        return;
      }
      setDone(res);
    } catch (err) {
      const api = err instanceof ApiError ? err : new ApiError(0, "ERROR", "Something went wrong. Please try again.");
      if (api.code === "VALIDATION" && api.fields) {
        const map = {};
        Object.entries(api.fields).forEach(([k, v]) => {
          map[k.replace("patient.", "").replace("gdprConsent", "consent")] = v;
        });
        setErrors(map);
      }
      setNotice(api.message);
      setBotToken("");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="appt-success" role="status">
        <CheckCircle2 size={40} strokeWidth={1.8} />
        <h2>Request received</h2>
        {!LIVE && <p className="appt-success__note">Preview mode: nothing was sent and no payment was taken.</p>}
        <p>Reference: <strong>{done.reference}</strong></p>
      </div>
    );
  }

  const chosen = certificates.find((c) => c.id === form.type);

  return (
    <form className="appt-form" onSubmit={submit} noValidate>
      {!LIVE && <p className="bk-demo">Preview mode: nothing is sent and no payment is taken.</p>}
      <label>
        Certificate
        <select value={form.type} onChange={set("type")}>
          <option value="" disabled>Select a certificate</option>
          {certificates.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
        {errors.type && <span className="bk-err">{errors.type}</span>}
      </label>
      <label>
        Full name
        <input type="text" autoComplete="name" value={form.fullName} onChange={set("fullName")} />
        {errors.fullName && <span className="bk-err">{errors.fullName}</span>}
      </label>
      <div className="appt-form__row">
        <label>
          Phone (the doctor will call you)
          <input type="tel" autoComplete="tel" value={form.phone} onChange={set("phone")} />
          {errors.phone && <span className="bk-err">{errors.phone}</span>}
        </label>
        <label>
          Email
          <input type="email" autoComplete="email" value={form.email} onChange={set("email")} />
          {errors.email && <span className="bk-err">{errors.email}</span>}
        </label>
      </div>
      <fieldset className="appt-form__group">
        <legend>Send my certificate by</legend>
        <div className="bk-radios">
          <label className="bk-radio"><input type="radio" name="contactVia" value="email" checked={form.contactVia === "email"} onChange={set("contactVia")} /> Email</label>
          <label className="bk-radio"><input type="radio" name="contactVia" value="whatsapp" checked={form.contactVia === "whatsapp"} onChange={set("contactVia")} /> WhatsApp (to the phone number above)</label>
        </div>
      </fieldset>
      <label>
        What do you need it for? <span className="bk-opt">(optional)</span>
        <textarea rows={2} maxLength={300} value={form.note} onChange={set("note")} />
        <span className="bk-hint">For example the dates, or who asked for it. The doctor will ask you more on the call. Please don&apos;t enter medical history here.</span>
      </label>

      <fieldset className="appt-form__group">
        <legend>Pay online</legend>
        <div className="bk-radios">
          <label className="bk-radio"><input type="radio" name="provider" checked={provider === "stripe"} onChange={() => setProvider("stripe")} /> <CreditCard size={16} /> Card (Visa, Mastercard, Apple Pay, Google Pay)</label>
          {providers.includes("paypal") && <label className="bk-radio"><input type="radio" name="provider" checked={provider === "paypal"} onChange={() => setProvider("paypal")} /> PayPal</label>}
        </div>
        <span className="bk-hint"><ShieldCheck size={13} /> Secure payment page. We never see or store your card details. If the doctor decides a certificate can&apos;t be issued, you are refunded in full.</span>
      </fieldset>

      <label className="bk-consent">
        <input type="checkbox" checked={form.consent} onChange={set("consent")} />
        <span>I have read the <Link to="/privacy" target="_blank">Privacy Policy</Link> and agree to {clinic.name} using my details to process this request and contact me about it.</span>
      </label>
      {errors.consent && <span className="bk-err">{errors.consent}</span>}

      <TurnstileWidget onToken={setBotToken} />
      {notice && <p className="appt-form__error" role="alert">{notice}</p>}

      <button type="submit" className="btn btn-primary appt-form__submit" disabled={submitting}>
        {submitting ? <>Please wait… <Loader2 size={16} className="appt-form__spin" /></> : <>Pay €{chosen?.price ?? CERTIFICATE_PRICE} &amp; request certificate</>}
      </button>
    </form>
  );
}
