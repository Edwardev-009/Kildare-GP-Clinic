import { useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";
import "./ContactForm.css";

const reasons = [
  "General enquiry",
  "Book a walk-in visit",
  "Vaccinations & travel advice",
  "Chronic condition follow-up",
  "Something else",
];

export default function ContactForm({ compact = false }) {
  const [sent, setSent] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    // Front-end only for now — wire this up to your mail/CRM endpoint of choice.
    setSent(true);
  }

  if (sent) {
    return (
      <div className="contact-form__success">
        <CheckCircle2 size={36} strokeWidth={1.8} />
        <h3>Message received</h3>
        <p>
          Thanks for reaching out — a member of our team will get back to you
          during opening hours. For anything urgent, please call or WhatsApp us
          directly.
        </p>
      </div>
    );
  }

  return (
    <form className={`contact-form ${compact ? "contact-form--compact" : ""}`} onSubmit={handleSubmit}>
      <div className="contact-form__row">
        <label>
          Full name
          <input type="text" name="name" required placeholder="Your name" />
        </label>
        <label>
          Phone number
          <input type="tel" name="phone" required placeholder="085 000 0000" />
        </label>
      </div>

      <label>
        Email address
        <input type="email" name="email" required placeholder="you@example.com" />
      </label>

      <label>
        Reason for contact
        <select name="reason" defaultValue={reasons[0]}>
          {reasons.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </label>

      <label>
        Message
        <textarea name="message" rows={compact ? 3 : 5} placeholder="Tell us a little about what you need" required />
      </label>

      <button type="submit" className="btn btn-primary">
        Send message <Send size={16} />
      </button>
    </form>
  );
}
