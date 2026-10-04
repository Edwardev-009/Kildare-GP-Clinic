import { NavLink } from "react-router-dom";
import { Cross, MapPin, Phone, Mail } from "lucide-react";
import { clinic, hoursSummary } from "../data/content.js";
import "./Footer.css";

export default function Footer() {
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
            A walk-in GP practice on Claregate Street, Kildare — general practice,
            family healthcare and chronic condition management for the local community.
          </p>
        </div>

        <div className="site-footer__col">
          <h4>Navigate</h4>
          <ul>
            <li><NavLink to="/">Home</NavLink></li>
            <li><NavLink to="/about">About</NavLink></li>
            <li><NavLink to="/blog">Blog</NavLink></li>
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

      <div className="container site-footer__bottom">
        <p>&copy; {new Date().getFullYear()} {clinic.name}. All rights reserved.</p>
        <a className="site-footer__credit" href="https://www.webpalm.ie/" target="_blank" rel="noopener noreferrer">
          <span>Design by</span> WebPalm
        </a>
      </div>
    </footer>
  );
}
