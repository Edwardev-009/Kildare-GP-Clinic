import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import PageHeader from "../components/PageHeader.jsx";
import Seo from "../components/Seo.jsx";
import { clinic } from "../data/content.js";
import { getAppointment, getCertificateRequest, goToPayment, payAppointment, payCertificateRequest } from "../lib/booking.js";
import usePaymentProviders from "../lib/usePaymentProviders.js";

// Where Stripe / PayPal send the patient back to: /payment-result?type=appointment|certificate&t=<token>
// What is shown comes from the server's record (set by the payment webhook), never from the address bar.
const TRIES = 20;
const WAIT_MS = 3000;

export default function PaymentResult() {
  const [params] = useSearchParams();
  const type = params.get("type") === "certificate" ? "certificate" : "appointment";
  const token = params.get("t");
  const cancelled = params.get("cancelled") === "1";

  const [phase, setPhase] = useState("checking"); // checking | paid | unpaid | slow | error | expired
  const [record, setRecord] = useState(null);
  const [busy, setBusy] = useState(false);
  const providers = usePaymentProviders(); // only the methods the dashboard has switched on

  useEffect(() => {
    if (!token) {
      setPhase("error");
      return undefined;
    }
    let stop = false;
    const read = type === "certificate" ? getCertificateRequest : getAppointment;
    (async () => {
      for (let i = 0; i < TRIES && !stop; i += 1) {
        try {
          const r = await read(token);
          const rec = r.appointment || r.request;
          if (stop) return;
          setRecord(rec);
          if (rec.paymentStatus === "paid") return setPhase("paid");
          if (rec.status === "cancelled") return setPhase("expired");
          if (cancelled) return setPhase("unpaid"); // the patient backed out of the payment page
        } catch {
          if (!stop) return setPhase("error");
        }
        // eslint-disable-next-line no-await-in-loop
        await new Promise((res) => setTimeout(res, WAIT_MS));
      }
      if (!stop) setPhase("slow");
    })();
    return () => {
      stop = true;
    };
  }, [token, type, cancelled]);

  async function retry(provider) {
    setBusy(true);
    try {
      const r = await (type === "certificate" ? payCertificateRequest : payAppointment)(token, provider);
      goToPayment(r.payment.checkoutUrl);
    } catch {
      setPhase("expired");
      setBusy(false);
    }
  }

  const again = type === "certificate" ? "/medical-certificate" : "/book";

  return (
    <>
      <Seo path="/payment-result" />
      <PageHeader eyebrow="Payment" title="Payment status" />
      <section className="section container bk">
        <div className="appt-success bk-done" role="status">
          {phase === "checking" && <><Loader2 size={40} className="appt-form__spin" /><h2>Confirming your payment…</h2><p>Please don&apos;t close this page. This only takes a moment.</p></>}
          {phase === "paid" && (
            <>
              <CheckCircle2 size={40} strokeWidth={1.8} />
              <h2>Payment received</h2>
              {type === "certificate" ? (
                <p>Thank you. A doctor will call you shortly to ask a few questions about your certificate. If a certificate is appropriate it will be sent to you within 1–2 hours of the call.</p>
              ) : (
                <p>Thank you. Your appointment is confirmed and a confirmation email is on its way.</p>
              )}
              {record?.reference && <p><strong>Reference: {record.reference}</strong></p>}
              {type === "appointment" && <Link className="btn btn-primary" to={`/appointment/${token}`}>View appointment</Link>}
            </>
          )}
          {phase === "unpaid" && (
            <>
              <AlertCircle size={40} strokeWidth={1.8} />
              <h2>Payment not completed</h2>
              <p>You have not been charged. {type === "appointment" ? "Your time is held for a few minutes, so you can try again now." : "You can try again to send your request."}</p>
              <div className="bk-radios">
                <button type="button" className="btn btn-primary" disabled={busy} onClick={() => retry("stripe")}>Pay by card</button>
                {providers.includes("paypal") && <button type="button" className="btn btn-ghost" disabled={busy} onClick={() => retry("paypal")}>Pay with PayPal</button>}
              </div>
            </>
          )}
          {phase === "expired" && (
            <>
              <AlertCircle size={40} strokeWidth={1.8} />
              <h2>This booking has expired</h2>
              <p>The payment was not completed in time, so the request was released. You have not been charged.</p>
              <Link className="btn btn-primary" to={again}>Start again</Link>
            </>
          )}
          {phase === "slow" && (
            <>
              <Loader2 size={40} strokeWidth={1.8} />
              <h2>Still confirming</h2>
              <p>Your payment is taking longer than usual to confirm. If you were charged, you will get an email shortly. Questions? Call <a href={clinic.phoneHref}>{clinic.phone}</a>.</p>
            </>
          )}
          {phase === "error" && (
            <>
              <AlertCircle size={40} strokeWidth={1.8} />
              <h2>We couldn&apos;t check your payment</h2>
              <p>Please check your email for a confirmation, or call <a href={clinic.phoneHref}>{clinic.phone}</a>.</p>
              <Link className="btn btn-ghost" to="/">Back to home</Link>
            </>
          )}
        </div>
      </section>
    </>
  );
}
