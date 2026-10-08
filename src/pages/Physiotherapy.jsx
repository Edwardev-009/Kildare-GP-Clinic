import { Link } from "react-router-dom";
import { Phone, MessageCircle, MapPin, ArrowRight } from "lucide-react";
import Seo from "../components/Seo.jsx";
import PageHeader from "../components/PageHeader.jsx";
import Faq from "../components/Faq.jsx";
import { clinic, hours, whatsappLink } from "../data/content.js";
import { physioPath, physiotherapist, physioDescription, physioSteps, physioFaqs, physioArticle } from "../data/physio.js";
import "./Physiotherapy.css";

export default function Physiotherapy() {
  return (
    <>
      <Seo path={physioPath} />
      <PageHeader eyebrow="Physiotherapy at Kildare Clinic" title="Physio in Kildare Town" lede={physioDescription} />
      <section className="section">
        <div className="container physio-layout">
          <div className="physio-copy">
            <span className="eyebrow">Your local clinic</span>
            <h2>Physiotherapy on Claregate Street</h2>
            <p>Looking for a Kildare physio? Our team includes {physiotherapist.name}, our physiotherapist, alongside our GPs at Kildare Clinic. Contact reception to discuss your concern and arrange a visit.</p>
            <p>Physiotherapy focuses on movement and physical function. A visit may include an assessment, advice and a discussion of next steps suited to your needs. Ask the clinic about the specific service you need before booking.</p>
            <p>GP consultations and physiotherapy are available at the same clinic. If you are unsure which appointment to arrange, contact reception for guidance.</p>
            <div className="physio-actions">
              <a className="btn btn-primary" href={clinic.phoneHref}><Phone size={18} /> Call to book physio</a>
              <a className="btn btn-ghost" href={whatsappLink("Hi Kildare Clinic, I'd like to arrange a physiotherapy appointment with Muqadas.")} target="_blank" rel="noopener noreferrer"><MessageCircle size={18} /> Ask about an appointment</a>
            </div>
            <Link className="physio-text-link" to={physioArticle.path}>Read our guide to your first physio appointment <ArrowRight size={16} /></Link>
          </div>
          <aside className="physio-visit" aria-labelledby="physio-visit-title">
            <h2 id="physio-visit-title">Plan your appointment</h2>
            <p><MapPin size={18} aria-hidden="true" /> {clinic.address}</p>
            <h3>Physio appointment hours</h3>
            <ul className="hours-list">{hours.map((row) => <li key={row.day}><span>{row.day}</span><span>{row.time}</span></li>)}</ul>
            <p>These hours apply to the whole clinic, including physiotherapy. Call to confirm an appointment before travelling.</p>
            <Link className="physio-text-link" to="/contact">Contact details and directions <ArrowRight size={16} /></Link>
          </aside>
        </div>
      </section>
      <section className="section section--paper-dim">
        <div className="container">
          <div className="section-head"><span className="eyebrow">Before your visit</span><h2>Getting started with physiotherapy</h2><p>A little preparation helps you make the most of your appointment.</p></div>
          <ol className="physio-steps">{physioSteps.map((step) => <li key={step.title}><h3>{step.title}</h3><p>{step.text}</p></li>)}</ol>
        </div>
      </section>
      <section className="section">
        <div className="container physio-layout">
          <div className="section-head"><span className="eyebrow">Good to know</span><h2>Kildare physio appointment questions</h2><p>For fees, availability or a question about a particular service, call {clinic.phone}.</p></div>
          <Faq items={physioFaqs} />
        </div>
      </section>
    </>
  );
}
