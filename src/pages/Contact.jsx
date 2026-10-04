import { MapPin, Phone, Mail, MessageCircle, Clock3, Sunrise, Sunset } from "lucide-react";
import PageHeader from "../components/PageHeader.jsx";
import Seo from "../components/Seo.jsx";
import ContactForm from "../components/ContactForm.jsx";
import { clinic, hoursMorning, hoursEvening, whatsappLink } from "../data/content.js";
import "./Contact.css";

export default function Contact() {
  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(
    clinic.address
  )}&output=embed`;

  return (
    <>
      <Seo
        title="Contact"
        description="Contact Kildare Clinic on Claregate Street, Kildare — call, email or WhatsApp the practice, or send a message using the form. Opening hours and map included."
        path="/contact"
      />
      <PageHeader
        eyebrow="Contact"
        title="Reach the clinic"
        lede="Send a message, call the front desk, or WhatsApp us directly — whichever is easiest for you."
      />

      <section className="section">
        <div className="container contact-page">
          <div className="contact-cards">
            <a
              className="contact-card"
              href={whatsappLink("Hi Kildare Clinic, I'd like some information.")}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle size={22} />
              <div>
                <h3>WhatsApp</h3>
                <p>Fastest way to reach us</p>
              </div>
            </a>
            <a className="contact-card" href={clinic.phoneHref}>
              <Phone size={22} />
              <div>
                <h3>{clinic.phone}</h3>
                <p>Front desk, during opening hours</p>
              </div>
            </a>
            <a className="contact-card" href={`mailto:${clinic.email}`}>
              <Mail size={22} />
              <div>
                <h3>{clinic.email}</h3>
                <p>For non-urgent queries</p>
              </div>
            </a>
            <div className="contact-card contact-card--static">
              <MapPin size={22} />
              <div>
                <h3>Claregate Street</h3>
                <p>{clinic.address}</p>
              </div>
            </div>
          </div>

          <div className="contact-hours">
            <span className="eyebrow">
              <Clock3 size={14} style={{ marginRight: 6, verticalAlign: "-2px" }} />
              Opening hours
            </span>
            <div className="contact-hours__cards">
              {[
                { title: "Morning", subtitle: "Opening hours", rows: hoursMorning, Icon: Sunrise },
                { title: "Evening", subtitle: "Opening hours", rows: hoursEvening, Icon: Sunset },
              ].map(({ title, subtitle, rows, Icon }) => (
                <div className="contact-hours__card" key={title}>
                  <div className="contact-hours__head">
                    <Icon size={22} />
                    <div>
                      <h3>{title}</h3>
                      <p>{subtitle}</p>
                    </div>
                  </div>
                  <ul>
                    {rows.map((h) => (
                      <li key={h.day} className={h.off ? "is-off" : ""}>
                        <span>{h.day}</span>
                        <span>{h.time}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="contact-page__grid">
            <div className="contact-page__form-wrap">
              <h2>Send us a message</h2>
              <ContactForm />
            </div>

            <div className="contact-page__side">
              <div className="contact-page__map">
                <iframe
                  title="Kildare Clinic location"
                  src={mapSrc}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}