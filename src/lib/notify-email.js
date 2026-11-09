// Emails the clinic inbox through EmailJS (same service and template as the Contact form) when someone submits an
// online medical certificate request. The patient has not necessarily paid yet at this point, so the message says
// so clearly: the dashboard's "paid" notification is what confirms payment.

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

export async function sendCertificateEmail({ reference, name, phone, email, certificate, price, contactVia, note, provider }) {
  if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
    console.error("EmailJS is not configured. Set the VITE_EMAILJS_* environment variables.");
    return false;
  }
  try {
    const { default: emailjs } = await import("@emailjs/browser");
    await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      {
        from_name: name,
        phone,
        email,
        reply_to: email,
        reason: "Online medical certificate request",
        certificate_type: certificate,
        pricing: `€${price} - online payment via ${provider === "paypal" ? "PayPal" : "card (Stripe)"} started, NOT confirmed yet`,
        message: [
          `Reference: ${reference || "n/a"}`,
          `Send the certificate by: ${contactVia === "whatsapp" ? "WhatsApp" : "email"}`,
          "Payment: not confirmed yet. Only call the patient once the dashboard shows this request as paid.",
          note ? `Patient note: ${note}` : "",
        ].filter(Boolean).join("\n"),
      },
      { publicKey: PUBLIC_KEY },
    );
    return true;
  } catch (err) {
    console.error("EmailJS send failed:", err);
    return false;
  }
}
