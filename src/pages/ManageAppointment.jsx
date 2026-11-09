import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CheckCircle2, Loader2 } from "lucide-react";
import PageHeader from "../components/PageHeader.jsx";
import Seo from "../components/Seo.jsx";
import { clinic } from "../data/content.js";
import usePaymentProviders from "../lib/usePaymentProviders.js";
import { ApiError, cancelAppointment, formatDateLong, dateOfIso, formatPrice, getAppointment, goToPayment, payAppointment, timeLabel } from "../lib/booking.js";

// Opened from the link in the patient's confirmation email: /appointment/<token>
// The first render is the same with or without a token so the prerendered page hydrates cleanly.
export default function ManageAppointment() {
  const { token } = useParams();
  const [appt, setAppt] = useState(null);
  const [state, setState] = useState("loading"); // loading | ready | missing | error
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [provider, setProvider] = useState("stripe");
  const providers = usePaymentProviders(); // only the methods the dashboard has switched on
  useEffect(() => {
    if (!providers.includes(provider)) setProvider(providers[0]);
  }, [providers, provider]);

  const load = useCallback(() => {
    if (!token) {
      setState("missing");
      return;
    }
    getAppointment(token)
      .then((r) => {
        setAppt(r.appointment);
        setState("ready");
      })
      .catch((err) => {
        setState(err.status === 404 ? "missing" : "error");
        setMessage(err.message);
      });
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  async function cancel() {
    if (!window.confirm("Cancel this appointment?")) return;
    setBusy(true);
    setMessage("");
    try {
      const r = await cancelAppointment(token);
      setAppt(r.appointment);
      setMessage(r.message || "Your appointment has been cancelled.");
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function payNow() {
    setBusy(true);
    setMessage("");
    try {
      const r = await payAppointment(token, provider);
      goToPayment(r.payment.checkoutUrl);
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      setBusy(false);
    }
  }

  const awaitingPayment = appt && appt.status === "pending_payment" && appt.paymentStatus !== "paid";

  return (
    <>
      <Seo path="/appointment" />
      <PageHeader eyebrow="Your appointment" title="Manage your appointment" />
      <section className="section container bk">
        {state === "loading" && <p className="bk-loading"><Loader2 size={18} className="appt-form__spin" /> Loading your appointment…</p>}
        {state === "missing" && (
          <div className="bk-empty">
            <p>We couldn&apos;t find that appointment. Please check the link in your confirmation email, or call <a href={clinic.phoneHref}>{clinic.phone}</a>.</p>
            <Link className="btn btn-ghost" to="/book">Book an appointment</Link>
          </div>
        )}
        {state === "error" && <div className="bk-empty"><p>{message || "Something went wrong."}</p><button type="button" className="btn btn-ghost" onClick={load}>Try again</button></div>}

        {state === "ready" && appt && (
          <div className="appt-success bk-done">
            {appt.status === "cancelled" ? null : <CheckCircle2 size={40} strokeWidth={1.8} />}
            <h2>{appt.status === "cancelled" ? "Appointment cancelled" : awaitingPayment ? "Payment needed" : "Appointment confirmed"}</h2>
            <dl className="appt-success__summary">
              <div><dt>Reference</dt><dd>{appt.reference}</dd></div>
              <div><dt>Service</dt><dd>{appt.service?.name}</dd></div>
              <div><dt>Doctor</dt><dd>{appt.doctor?.name}</dd></div>
              <div><dt>When</dt><dd>{formatDateLong(dateOfIso(appt.start))} at {timeLabel(appt.start)}</dd></div>
              {Number.isFinite(Number(appt.price)) && <div><dt>Price</dt><dd>{formatPrice(appt.price)}{appt.paymentStatus === "paid" ? " (paid)" : appt.paymentMethod === "pay_at_clinic" ? " (pay at the clinic)" : ""}</dd></div>}
            </dl>
            {message && <p role="status">{message}</p>}

            {awaitingPayment && (
              <div className="bk-radios">
                <label className="bk-radio"><input type="radio" name="provider" checked={provider === "stripe"} onChange={() => setProvider("stripe")} /> Card</label>
                {providers.includes("paypal") && <label className="bk-radio"><input type="radio" name="provider" checked={provider === "paypal"} onChange={() => setProvider("paypal")} /> PayPal</label>}
                <button type="button" className="btn btn-primary" disabled={busy} onClick={payNow}>Pay now</button>
              </div>
            )}
            {appt.canCancel && (
              <button type="button" className="btn btn-ghost" disabled={busy} onClick={cancel}>Cancel appointment</button>
            )}
            {!appt.canCancel && appt.status !== "cancelled" && (
              <p className="appt-success__note">
                Appointments can be cancelled online up to {appt.cancelWindowHours} hours beforehand. To change or cancel now, please call <a href={clinic.phoneHref}>{appt.clinicPhone || clinic.phone}</a>.
              </p>
            )}
          </div>
        )}
      </section>
    </>
  );
}
