import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader.jsx";
import Seo from "../components/Seo.jsx";
import { clinic } from "../data/content.js";
import "./CookiePolicy.css";

// Plain-language privacy notice for the website. It only states what the website actually does.
// It deliberately gives no retention periods, legal-entity details or DPO: the clinic adds those once confirmed.
export default function Privacy() {
  return (
    <>
      <Seo path="/privacy" />
      <PageHeader
        eyebrow="Your data"
        title="Privacy policy"
        lede="How Kildare Clinic uses the personal information you give us through this website, and the choices and rights you have."
      />
      <section className="section">
        <div className="container cookie-policy">
          <p className="cookie-policy__updated">Last updated: 10 November 2026</p>

          <section>
            <h2>Who we are</h2>
            <p>
              This website is run by {clinic.name}, {clinic.address}. For anything in this policy, contact us at{" "}
              <a href={`mailto:${clinic.email}`}>{clinic.email}</a> or call <a href={clinic.phoneHref}>{clinic.phone}</a>.
            </p>
          </section>

          <section>
            <h2>What we collect and why</h2>
            <ul>
              <li><strong>Booking an appointment:</strong> your name, phone number, email address, whether you are a new or existing patient, the service, doctor and time you choose, and an optional short reason for the visit. We use this to book and manage your appointment, to contact you about it and to prepare for your visit.</li>
              <li><strong>Online medical certificate requests:</strong> your name, phone number, email address, the certificate you want, how you want it sent (email or WhatsApp) and an optional short note. A doctor uses this to call you and, if appropriate, issue your certificate.</li>
              <li><strong>Payments:</strong> if you pay online, the payment is taken on the secure pages of Stripe. We receive confirmation that you paid, the amount and a payment reference. We never see or store your card details. If you cancel and are refunded, the refund is sent back to the card you paid with through Stripe.</li>
              <li><strong>Emails about your booking or request:</strong> we send the email address you give us to our email provider so that we can send you your booking confirmation, receipt, cancellation and refund emails, and a notice to the clinic.</li>
              <li><strong>Contact form:</strong> the name, phone, email and message you send us, so we can reply.</li>
              <li><strong>Cookies and similar technologies:</strong> see our <Link to="/cookies">cookie information</Link>. Analytics and maps are optional and off until you allow them.</li>
            </ul>
            <p>
              Some of what you tell us may relate to your health. Please keep the optional text fields short and do not
              enter medical history or test results there: a doctor will ask what they need when they speak to you.
            </p>
          </section>

          <section>
            <h2>Who we share it with</h2>
            <p>We do not sell your information. We share it only with the people and services that help us run the clinic:</p>
            <ul>
              <li>our doctors and clinic staff, through the clinic's patient-management system;</li>
              <li>service providers that process data for us: Vercel for website and system hosting, MongoDB Atlas for the database that holds bookings and patient records, Resend for booking, receipt and refund emails, EmailJS for messages sent from the website forms to the clinic's inbox, and Stripe for card payments;</li>
              <li>Google, if you choose to allow analytics or the map embed (see the cookie information);</li>
              <li>WhatsApp, if you ask us to send a certificate or message by WhatsApp, or contact us there.</li>
            </ul>
            <p>Some of these providers may process data outside Ireland or the EU. Where that happens, it is covered by the safeguards the law requires.</p>
          </section>

          <section>
            <h2>How long we keep it</h2>
            <p>
              We keep your information only for as long as we need it for the purposes above and to meet our legal and
              professional record-keeping obligations. Unpaid online bookings and certificate requests are cancelled
              automatically and are not treated as appointments or certificates.
            </p>
          </section>

          <section>
            <h2>Your rights</h2>
            <p>
              You can ask us for a copy of your personal information, to correct it, to delete it where the law allows,
              to restrict or object to how we use it, and to receive it in a portable form. Where we rely on your
              agreement, you can withdraw it at any time. To use any of these rights, contact us using the details above. We will reply within one month.
            </p>
            <p>
              If you are unhappy with how we handle your information, you can complain to the Data Protection
              Commission, Ireland's data protection authority, at{" "}
              <a href="https://www.dataprotection.ie" target="_blank" rel="noopener noreferrer">dataprotection.ie</a>.
            </p>
          </section>

          <section>
            <h2>Changes to this policy</h2>
            <p>We will update this page if how we use your information changes and show the date it was last updated above.</p>
          </section>
        </div>
      </section>
    </>
  );
}