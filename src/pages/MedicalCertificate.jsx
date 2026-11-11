import { useState, useCallback } from "react";
import {
  Thermometer,
  PlaneTakeoff,
  PlaneLanding,
  BriefcaseMedical,
  ShieldCheck,
  FileCheck2,
  Check,
  Ban,
  Stethoscope,
  MessageCircle,
  Phone,
  Clock3,
} from "lucide-react";
import PageHeader from "../components/PageHeader.jsx";
import Seo from "../components/Seo.jsx";
import Faq from "../components/Faq.jsx";
import CertificateModal from "../components/CertificateModal.jsx";
import receptionImg from "../assets/gallery-reception.webp";
import { clinic, whatsappLink } from "../data/content.js";
import {
  certificates,
  certificateSteps,
  certificateIncluded,
  certificateNotIncluded,
  certificateWhen,
  certificateFaqs,
  CERTIFICATE_PRICE,
  CERTIFICATE_ONLINE_NOTE,
  CERTIFICATE_TURNAROUND,
} from "../data/certificates.js";
import "./MedicalCertificate.css";

const icons = { Thermometer, PlaneTakeoff, PlaneLanding, BriefcaseMedical };

const trust = [
  { icon: ShieldCheck, text: "Seen by Irish-registered GPs" },
  { icon: Stethoscope, text: "No clinic visit needed" },
  { icon: Clock3, text: `Certificate ${CERTIFICATE_TURNAROUND} of your doctor's call` },
  { icon: FileCheck2, text: `€${CERTIFICATE_PRICE} for every certificate` },
];

export default function MedicalCertificate() {
  const [active, setActive] = useState(null);
  const close = useCallback(() => setActive(null), []);

  return (
    <>
      <Seo path="/medical-certificate" />
      <PageHeader
        eyebrow="Medical Certificates"
        title="Medical certificates at Kildare Clinic"
        lede={`Get a sick note, travel or return-to-work certificate online for €${CERTIFICATE_PRICE}. No clinic visit: request and pay online, an Irish-registered GP phones you, and your certificate is sent by email or WhatsApp within 1–2 hours.`}
      />

      {/* ---------- Trust strip ---------- */}
      <section className="cert-trust">
        <ul className="container cert-trust__list">
          {trust.map(({ icon: Icon, text }) => (
            <li key={text}>
              <Icon size={20} />
              <span>{text}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------- Certificate cards ---------- */}
      <section className="section" id="certificates">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Choose a certificate</span>
            <h2>Which medical certificate do you need?</h2>
            <p>Pick the certificate that matches your situation, pay online and a doctor will call you. You do not need to visit the clinic.</p>
          </div>

          <div className="cert-grid">
            {certificates.map((cert) => {
              const Icon = icons[cert.icon] || Stethoscope;
              return (
                <article className="cert-card" key={cert.id}>
                  <div className="cert-card__top">
                    <span className="cert-card__icon">
                      <Icon size={24} strokeWidth={1.8} />
                    </span>
                    <div className="cert-card__price">
                      <strong>€{cert.price}</strong>
                      <span>
                        <Stethoscope size={14} /> {CERTIFICATE_ONLINE_NOTE}
                      </span>
                    </div>
                  </div>
                  <h3>{cert.title}</h3>
                  <p className="cert-card__summary">{cert.summary}</p>
                  <p className="cert-card__time">A doctor phones you, then your certificate is sent {CERTIFICATE_TURNAROUND} if appropriate.</p>
                  <ul className="cert-card__points">
                    {cert.points.map((point) => (
                      <li key={point}>
                        <Check size={16} /> <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                  <button type="button" className="btn btn-primary cert-card__btn" onClick={() => setActive(cert)}>
                    Get {cert.title.split(" / ")[0]} Now
                  </button>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------- How it works ---------- */}
      <section className="section section--paper-dim">
        <div className="container cert-how">
          <div className="cert-how__image">
            <img src={receptionImg} alt="Reception area at Kildare Clinic" loading="lazy" />
          </div>
          <div>
            <span className="eyebrow">How it works</span>
            <h2>How to get your medical certificate</h2>
            <p className="cert-how__lede">
              Everything is done online and by phone. Pay online, speak to a GP and, if a certificate
              is appropriate, receive it by email or WhatsApp.
            </p>
            <ol className="cert-steps">
              {certificateSteps.map((step, i) => (
                <li key={step.title}>
                  <span className="cert-steps__num">{i + 1}</span>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ---------- SEO copy ---------- */}
      <section className="section">
        <div className="container">
          <div>
            <span className="eyebrow">Online sick note in Ireland</span>
            <h2>Online medical certificate from Irish-registered GPs</h2>
            <p>
              If you are unwell and need a sick note for your employer, college or school, or a certificate
              for travel, you can request one online from Kildare Clinic without taking time to visit a surgery.
              Our Irish-registered GPs speak to you by phone, ask about your symptoms and the reason for the
              certificate, and issue it where it is clinically appropriate.
            </p> <br />
            <p>
              A sick certificate, an unfit-to-travel or fit-to-travel certificate and a return-to-work (fit for work)
              certificate each cost €{CERTIFICATE_PRICE}. You pay securely online by card, Apple Pay or Google Pay.
              If the doctor decides a certificate cannot be issued, you are refunded in full. We cannot issue
              backdated certificates.
            </p>
          </div>
        </div>
      </section>

      {/* ---------- Included / not included / when ---------- */}
      <section className="section">
        <div className="container cert-info">
          <div className="cert-info__card">
            <Check size={26} />
            <h3>What's included?</h3>
            <ul>
              {certificateIncluded.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
          <div className="cert-info__card">
            <Ban size={26} />
            <h3>What's not included?</h3>
            <ul>
              {certificateNotIncluded.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
          <div className="cert-info__card">
            <Stethoscope size={26} />
            <h3>When do I need a medical certificate?</h3>
            <ul>
              {certificateWhen.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ---------- FAQ ---------- */}
      <section className="section section--paper-dim">
        <div className="container cert-faq">
          <div className="section-head">
            <span className="eyebrow">Questions</span>
            <h2>Medical certificate FAQs</h2>
          </div>
          <Faq items={certificateFaqs} />
        </div>
      </section>

      {/* ---------- Help band ---------- */}
      <section className="section section--navy cert-help">
        <div className="container cert-help__inner">
          <div>
            <h2>Not sure which certificate you need?</h2>
            <p>Message or call the clinic and we'll point you in the right direction.</p>
          </div>
          <div className="cert-help__actions">
            <a
              className="btn btn-gold"
              href={whatsappLink("Hi Kildare Clinic, I have a question about a medical certificate.")}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle size={18} /> WhatsApp us
            </a>
            <a className="btn btn-ghost btn-ghost--light" href={clinic.phoneHref}>
              <Phone size={18} /> {clinic.phone}
            </a>
          </div>
        </div>
      </section>

      {active && <CertificateModal certificate={active} onClose={close} />}
    </>
  );
}