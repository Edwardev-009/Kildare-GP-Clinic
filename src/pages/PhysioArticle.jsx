import { Link } from "react-router-dom";
import { Phone, ArrowRight } from "lucide-react";
import Seo from "../components/Seo.jsx";
import PageHeader from "../components/PageHeader.jsx";
import { clinic } from "../data/content.js";
import { physioArticle, physioPath } from "../data/physio.js";
import "./Physiotherapy.css";

export default function PhysioArticle() {
  return (
    <>
      <Seo path={physioArticle.path} />
      <PageHeader eyebrow="Physiotherapy · Health notes" title={physioArticle.title} lede={physioArticle.excerpt} />
      <article className="section">
        <div className="container physio-article">
          <nav aria-label="Breadcrumb" className="physio-breadcrumb"><Link to="/">Home</Link><span aria-hidden="true">/</span><Link to="/blog">Health notes</Link><span aria-hidden="true">/</span><span>First physio appointment</span></nav>
          <p className="physio-article__meta">By <Link to="/about">{clinic.name}</Link> · Published <time dateTime={physioArticle.datePublished}>{physioArticle.date}</time></p>
          <p className="physio-article__note">General information to help you plan a visit. Your clinician can advise you about your own symptoms and care.</p>
          <nav className="physio-contents" aria-label="In this guide"><h2>In this guide</h2><ul>{physioArticle.sections.map((section) => <li key={section.id}><a href={`#${section.id}`}>{section.title}</a></li>)}</ul></nav>
          {physioArticle.sections.map((section) => (
            <section className="physio-article__section" id={section.id} key={section.id}>
              <h2>{section.title}</h2>
              {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              {section.items && <ul>{section.items.map((item) => <li key={item}>{item}</li>)}</ul>}
            </section>
          ))}
          <section className="physio-article__section" aria-labelledby="physio-sources"><h2 id="physio-sources">Further information</h2><ul>{physioArticle.sources.map((source) => <li key={source.url}><a href={source.url}>{source.title}</a></li>)}</ul></section>
          <div className="physio-article__booking"><h2>Arrange a physio appointment in Kildare</h2><p>Find us at {clinic.address}. Contact the clinic to confirm an available time.</p><div className="physio-actions"><a className="btn btn-primary" href={clinic.phoneHref}><Phone size={18} /> {clinic.phone}</a><Link className="btn btn-ghost" to={physioPath}>Physiotherapy at Kildare Clinic <ArrowRight size={16} /></Link></div><Link className="physio-text-link" to="/">Looking for a GP in Kildare? View our walk-in GP service.</Link></div>
        </div>
      </article>
    </>
  );
}
