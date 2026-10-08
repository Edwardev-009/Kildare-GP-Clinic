import { HeartHandshake, ShieldCheck, Users2, MessageCircle, MapPin, Clock3 } from "lucide-react";
import PageHeader from "../components/PageHeader.jsx";
import Seo from "../components/Seo.jsx";
import { Link } from "react-router-dom";
import reception from "../assets/reception.jpeg";
import doorOpen from "../assets/door-open.jpeg";
import { clinic, hours, whatsappLink, team } from "../data/content.js";
import "./About.css";

const values = [
  {
    icon: Users2,
    title: "Accessible",
    text: "Walk-ins welcome during opening hours, with no referral needed for a standard GP visit.",
  },
  {
    icon: ShieldCheck,
    title: "Professional",
    text: "Experienced GPs and nursing staff, following the same clinical standards you'd expect anywhere.",
  },
  {
    icon: HeartHandshake,
    title: "Trusted",
    text: "A local practice that keeps the same faces on the team, so care stays consistent over time.",
  },
];

export default function About() {
  return (
    <>
      <Seo path="/about" />
      <PageHeader
        eyebrow="About Kildare Clinic"
        title="Your GP practice in Kildare Town"
        lede="We opened Kildare Clinic to give the town a walk-in option for everyday healthcare — no long booking queues, no six-week wait for a routine concern."
      />

      {/* ---------- Story ---------- */}
      <section className="section">
        <div className="container about-story">
          <div className="about-story__image">
            <img src={reception} alt="Kildare Clinic reception area" />
          </div>
          <div className="about-story__copy">
            <span className="eyebrow">Our story</span>
            <h2>Healthcare that fits around your day, not the other way round</h2>
            <p>
              Kildare Clinic started with a simple observation: illness doesn't
              wait for a convenient appointment slot. We set up a walk-in GP
              practice on Claregate Street so locals could get seen the same
              day, whether that's a child with a fever, a repeat prescription,
              or a routine check that's been put off for too long.
            </p>
            <p>
              We still take booked appointments for anything that benefits
              from planning ahead — travel vaccinations, longer reviews, or
              ongoing management of a chronic condition — but walk-in stays
              our default, because we think it should be the easy option, not
              the exception.
            </p>
            <a
              className="btn btn-primary"
              href={whatsappLink("Hi Kildare Clinic, I have a question about visiting.")}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle size={18} /> Message us on WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* ---------- Values ---------- */}
      <section className="section section--paper-dim">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">What guides us</span>
            <h2>Three things every visit is built on</h2>
          </div>
          <div className="values-grid">
            {values.map((v) => (
              <div className="value-card" key={v.title}>
                <v.icon size={28} strokeWidth={1.7} />
                <h3>{v.title}</h3>
                <p>{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Hours + Map ---------- */}
      <section className="section">
        <div className="container">
          <div className="section-head"><span className="eyebrow">Meet the practice</span><h2>Our GP and physiotherapy team</h2><p>Meet the people listed on our clinic team, based on Claregate Street in Kildare.</p></div>
          <ul className="about-team">
            {team.map((member) => <li key={member.name}><h3>{member.name}</h3><p>{member.role}</p>{member.role === "Physiotherapist" && <Link to="/physiotherapy">Physiotherapy appointments in Kildare</Link>}</li>)}
          </ul>
        </div>
      </section>

      <section className="section">
        <div className="container about-visit">
          <div className="about-visit__image">
            <img src={doorOpen} alt="Kildare Clinic entrance door" />
          </div>
          <div className="about-visit__panel">
            <span className="eyebrow">Plan your visit</span>
            <h2>Opening hours</h2>
            <ul className="hours-list">
              {hours.map((h) => (
                <li key={h.day}>
                  <span>{h.day}</span>
                  <span>{h.time}</span>
                </li>
              ))}
            </ul>
            <hr className="hairline" style={{ margin: "26px 0" }} />
            <div className="about-visit__contact">
              <p><MapPin size={16} /> {clinic.address}</p>
              <p><Clock3 size={16} /> Walk-ins are seen in the order they arrive</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
