import { NavLink } from "react-router-dom";
import { Cross, MapPin, Phone, Mail } from "lucide-react";
import { clinic, hoursSummary } from "../data/content.js";
import ConsentMap from "./ConsentMap.jsx";
import { useCookieConsent } from "../lib/cookie-context.js";
import "./Footer.css";

export default function Footer() {
  const { openSettings } = useCookieConsent();
  return (
    <footer className="site-footer">
      <div className="container site-footer__grid">
        <div className="site-footer__col site-footer__brand">
          <div className="brand">
            <span className="brand__mark brand__mark--light">
              <Cross size={20} strokeWidth={2.4} />
            </span>
            <span className="brand__name" style={{ color: "#fff" }}>
              {clinic.name}
            </span>
          </div>
          <p>
            A walk-in GP practice on Claregate Street, Kildare - general practice,
            family healthcare and chronic condition management for the local community.
          </p>
          <nav className="site-footer__social" aria-label="Social media">
            <a href="https://www.instagram.com/kildaregp/" target="_blank" rel="noopener noreferrer">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" focusable="false">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>
              <span>Instagram</span>
            </a>
            <a href="https://www.facebook.com/profile.php?id=61594213060923" target="_blank" rel="noopener noreferrer">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
                <path d="M14 22v-9h3l.5-4H14V6.5c0-1.1.3-1.5 1.5-1.5H18V1h-3c-3.2 0-5 1.8-5 5v3H7v4h3v9z" />
              </svg>
              <span>Facebook</span>
            </a>
          </nav>
        </div>

        <div className="site-footer__col">
          <h4>Navigate</h4>
          <ul>
            <li><NavLink to="/">Home</NavLink></li>
            <li><NavLink to="/about">About</NavLink></li>
            <li><NavLink to="/blog">Blog</NavLink></li>
            <li><NavLink to="/medical-certificate">Medical Certificate</NavLink></li>
            <li><NavLink to="/contact">Contact</NavLink></li>
          </ul>
        </div>

        <div className="site-footer__col">
          <h4>Contact</h4>
          <ul className="site-footer__contact">
            <li>
              <MapPin size={16} /> <span>{clinic.address}</span>
            </li>
            <li>
              <Phone size={16} /> <a href={clinic.phoneHref}>{clinic.phone}</a>
            </li>
            <li>
              <Mail size={16} /> <a href={`mailto:${clinic.email}`}>{clinic.email}</a>
            </li>
          </ul>
        </div>

        <div className="site-footer__col">
          <h4>Opening Hours</h4>
          <div className="site-footer__hours">
            <div className="site-footer__shift"><p>{hoursSummary}</p></div>
          </div>
        </div>
      </div>

      <div className="container site-footer__map">
        <ConsentMap
          title="Kildare Clinic location on Google Maps"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d22138353.99547006!2d-61.23961336936484!3d47.36441237330849!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x485d79fa600d6857%3A0x75497d6a9ec0a8e5!2sKildare%20Clinic!5e0!3m2!1sen!2s!4v1791123486993!5m2!1sen!2s"
          width="600"
          height="450"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>

      <div className="container site-footer__bottom">
        <p>&copy; {new Date().getFullYear()} {clinic.name}. All rights reserved.</p>
        <div className="site-footer__cookies">
          <NavLink to="/cookies">Cookie information</NavLink>
          <button type="button" onClick={openSettings}>Cookie settings</button>
        </div>
        <a className="site-footer__credit" href="https://www.webpalm.ie/" target="_blank" rel="noopener noreferrer">
          <span>Design by</span> WebPalm
        </a>
      </div>
    </footer>
  );
}
