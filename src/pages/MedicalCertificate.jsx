import { useState, useCallback } from "react";
import {
  Thermometer,
  PlaneTakeoff,
  PlaneLanding,
  BriefcaseMedical,
  Clock3,
  ShieldCheck,
  FileCheck2,
  Check,
  Ban,
  Stethoscope,
  MessageCircle,
  Phone,
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
  CERTIFICATE_TURNAROUND,
} from "../data/certificates.js";
import "./MedicalCertificate.css";

const icons = { Thermometer, PlaneTakeoff, PlaneLanding, BriefcaseMedical };

const trust = [
  { icon: ShieldCheck, text: "Reviewed by Irish-registered GPs" },
  { icon: Clock3, text: `${CERTIFICATE_TURNAROUND} turnaround` },
  { icon: FileCheck2, text: "Simple online request" },
];

export default function MedicalCertificate() {
  const [active, setActive] = useState(null);
  const close = useCallback(() => setActive(null), []);

  return (
    <>
      <Seo path="/medical-certificate" />
      <PageHeader
        eyebrow="Medical Certificates"
        title="Get your medical certificate online"
        lede="Sick, travel and return-to-work certificates from Irish-registered GPs at Kildare Clinic. Send a short request and we'll take care of the rest."
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
            <p>Pick the certificate that matches your situation and send your request in a minute.</p>
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
                        <Clock3 size={14} /> {CERTIFICATE_TURNAROUND}
                      </span>
                    </div>
                  </div>
                  <h3>{cert.title}</h3>
                  <p className="cert-card__summary">{cert.summary}</p>
                  <p className="cert-card__time">You get it {CERTIFICATE_TURNAROUND.toLowerCase()}.</p>
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
            <h2>Online medical certificates made simple</h2>
            <p className="cert-how__lede">
              Request a certificate from your phone or computer. A GP at Kildare Clinic reviews your
              request and, where clinically appropriate, issues your certificate by email.
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
