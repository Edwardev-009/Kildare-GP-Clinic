import {
  Stethoscope,
  Users,
  Plane,
  ClipboardCheck,
  MessageCircle,
  Mail,
  MapPin,
  ShieldCheck,
  Clock3,
  Sunrise,
  Sunset,
  ArrowRight,
  Phone,
  Activity,
} from "lucide-react";
import { Link } from "react-router-dom";
import GallerySlider from "../components/GallerySlider.jsx";
import TestimonialSlider from "../components/TestimonialSlider.jsx";
import ContactForm from "../components/ContactForm.jsx";
import Faq from "../components/Faq.jsx";
import Seo from "../components/Seo.jsx";
import heroImg from "../assets/hero-clinic-signage.webp";
import galleryStorefront from "../assets/gallery-storefront.webp";
import galleryReception from "../assets/gallery-reception.webp";
import galleryWaiting from "../assets/gallery-waiting-area.webp";
import {
  clinic,
  hoursMorning,
  hoursEvening,
  openingDaysLabel,
  whatsappLink,
  services,
  process,
  team,
  testimonials,
  faqs,
} from "../data/content.js";
import "./Home.css";

const icons = { Stethoscope, Users, Plane, ClipboardCheck, Activity };

const gallerySlides = [
  {
    src: galleryStorefront,
    eyebrow: "Claregate Street",
    caption: "Easy to spot from the street — look for the black & gold signage.",
    alt: "Kildare Clinic GP walk-in storefront and signage on Claregate Street, Kildare",
  },
  {
    src: galleryReception,
    position: "center 20%",
    eyebrow: "Inside the clinic",
    caption: "A calm, tidy reception area just off the front door.",
    alt: "Kildare Clinic reception desk and entrance hallway",
  },
  {
    src: galleryWaiting,
    eyebrow: "Waiting area",
    caption: "A bright, comfortable space to sit while you wait to be seen.",
    alt: "Kildare Clinic waiting area with seating and reception desk",
  },
];

export default function Home() {
  return (
    <>
      <Seo path="/" />
      {/* ---------- Hero ---------- */}
      <section className="hero">
        <div className="container hero__grid">
          <div className="hero__copy">
            <span className="badge">
              <ShieldCheck size={15} /> Walk-ins welcome {openingDaysLabel}
            </span>
            
            <h1>
              Walk-in GP in Kildare Town.
            </h1>
            <p className="hero__lede">
              Kildare Clinic provides GP consultations and family healthcare on
              Claregate Street, Kildare, R51 P635. Walk in during opening hours
              or call ahead to plan your visit. <Link to="/physiotherapy">Physiotherapy appointments</Link> are
              also available at the clinic.
            </p>
            <div className="hero__actions">
              <a
                className="btn btn-gold"
                href={whatsappLink("Hi Kildare Clinic, I'd like to book an appointment.")}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle size={18} /> Book an Appointment
              </a>
              <a className="btn btn-ghost" href={`mailto:${clinic.email}`}>
                <Mail size={18} /> {clinic.email}
              </a>
            </div>
            <a className="hero__call" href={clinic.phoneHref}>
              <span className="hero__call__icon">
                <Phone size={20} strokeWidth={2.2} />
              </span>
              <span className="hero__call__text">
                <span className="hero__call__label">Prefer to talk? Call Us Directly</span>
                <span className="hero__call__number">{clinic.phone}</span>
              </span>
              <ArrowRight className="hero__call__arrow" size={18} />
            </a>

            <div className="hero__hours" aria-label="Opening hours">
              <div className="hero__hours__row hero__hours__row--head">
                <span className="hero__hours__days">
                  <Clock3 size={16} /> Days
                </span>
                <span>
                  <Sunrise size={16} /> Morning
                </span>
                <span>
                  <Sunset size={16} /> Evening
                </span>
              </div>
              {hoursMorning.map((m, i) => {
                const e = hoursEvening[i];
                const closed = m.off && e.off;
                return (
                  <div
                    className={`hero__hours__row${closed ? " is-off" : ""}`}
                    key={m.day}
                  >
                    <span className="hero__hours__day">{m.day}</span>
                    {closed ? (
                      <span className="hero__hours__off">{m.time}</span>
                    ) : (
                      <>
                        <span>{m.time}</span>
                        <span>{e.time}</span>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="hero__image">
            <img
              src={heroImg}
              alt="Kildare Clinic GP walk-in signage and window display on Claregate Street, Kildare"
              width="1369"
              height="972"
              fetchPriority="high"
              decoding="async"
            />
            {/* <div className="hero__image-tag">
              <span>Recognise us by the black &amp; gold signage</span>
            </div> */}
          </div>
        </div>
      </section>

      {/* ---------- Services ---------- */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">What we treat</span>
            <h2>GP services and physiotherapy in Kildare</h2>
            <p>
              From a same-day walk-in visit to ongoing management of a
              long-term condition, our GPs and nursing team cover the care
              most households need close to home.
            </p>
          </div>

          <div className="services-grid">
            {services.map((s) => {
              const Icon = icons[s.icon];
              return (
                <div className="service-card" key={s.title}>
                  <Icon size={26} strokeWidth={1.8} />
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                  {s.path && <Link className="service-card__link" to={s.path}>Physiotherapy in Kildare <ArrowRight size={16} /></Link>}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------- Gallery Slider ---------- */}
      <section className="section section--paper-dim">
        <div className="container gallery-section">
          <div className="section-head">
            <span className="eyebrow">Find us</span>
            <h2>What to expect when you visit</h2>
            <p>
              A quick look at our storefront and reception, so you know
              exactly what you're walking into.
            </p>
          </div>
          <GallerySlider slides={gallerySlides} />
        </div>
      </section>

      {/* ---------- How walk-in works (custom section) ---------- */}
      <section className="section process-section">
        <div className="container">
          <div className="process-section__grid">
            <div className="section-head process-section__head">
              <span className="eyebrow">How it works</span>
              <h2>Four steps, no referral required</h2>
              <p>
                We built our walk-in system around one idea: illness rarely
                waits for an appointment slot, so neither should you.
              </p>
              <Link className="btn btn-ghost" to="/contact">
                Ask us a question <ArrowRight size={16} />
              </Link>
            </div>

            <ol className="process-list">
              {process.map((p) => (
                <li key={p.step}>
                  <span className="process-list__step">{p.step}</span>
                  <div>
                    <h3>{p.title}</h3>
                    <p>{p.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ---------- Team ---------- */}
      <section className="section section--paper-dim">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Meet the practice</span>
            <h2>The people looking after Kildare</h2>
            <p>A small, steady team, you'll likely see a familiar face at every visit.</p>
          </div>

          <ul className="team-grid">
            {team.map((member) => (
              <li className="team-card" key={member.name}>
                <span className="team-card__initial">{member.name.charAt(0)}</span>
                <div>
                  <h3>{member.name}</h3>
                  <p>{member.role}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------- Testimonials ---------- */}
      <section className="section section--navy">
        <div className="container">
          <div className="section-head" style={{ margin: "0 auto 56px", textAlign: "center" }}>
            <span className="eyebrow">Patients tell it best</span>
            <h2>Trusted by the local community</h2>
          </div>
          <TestimonialSlider items={testimonials} />
        </div>
      </section>

      {/* ---------- FAQ ---------- */}
      <section className="section">
        <div className="container faq-section">
          <div className="section-head">
            <span className="eyebrow">Good to know</span>
            <h2>Frequently asked questions</h2>
            <p>Answers to what patients ask us most before their first visit.</p>
          </div>
          <Faq items={faqs} />
        </div>
      </section>

      {/* ---------- Contact form ---------- */}
      <section className="section contact-section">
        <div className="container contact-section__grid">
          <div className="section-head contact-section__head">
            <span className="eyebrow">Get in touch</span>
            <h2>Have a question before you visit?</h2>
            <p>
              Send us a message and we'll reply during clinic hours, or reach
              us directly by phone, email or WhatsApp.
            </p>
            <ul className="contact-section__list">
              <li>
                <MapPin size={17} /> {clinic.address}
              </li>
              <li>
                <Mail size={17} /> {clinic.email}
              </li>
              <li>
                <MessageCircle size={17} /> WhatsApp for the fastest reply
              </li>
            </ul>
          </div>
          <div className="contact-section__form">
            <ContactForm compact />
          </div>
        </div>
      </section>
    </>
  );
}
