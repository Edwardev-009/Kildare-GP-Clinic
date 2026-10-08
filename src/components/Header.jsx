import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { Cross, Phone, Menu, X } from "lucide-react";
import { clinic } from "../data/content.js";
import "./Header.css";

const links = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/physiotherapy", label: "Physio" },
  { to: "/blog", label: "Blog" },
  { to: "/medical-certificate", label: "Medical Certificate" },
  { to: "/contact", label: "Contact" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [links]);

  return (
    <header className={`site-header ${scrolled ? "site-header--scrolled" : ""}`}>
      <div className="site-header__bar container">
        <NavLink to="/" className="brand" onClick={() => setOpen(false)}>
          <span className="brand__mark">
            <Cross size={20} strokeWidth={2.4} />
          </span>
          <span className="brand__text">
            <span className="brand__name">{clinic.name}</span>
            <span className="brand__sub">GP Walk-In Medical Centre</span>
          </span>
        </NavLink>

        <nav className={`site-nav ${open ? "site-nav--open" : ""}`} aria-label="Primary">
          <ul>
            {links.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.to === "/"}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) => (isActive ? "is-active" : "")}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
          <a className="site-nav__phone" href={clinic.phoneHref}>
            <span className="site-nav__phone__icon">
              <Phone size={15} strokeWidth={2.4} />
            </span>
            <span className="site-nav__phone__text">
              <span className="site-nav__phone__label">Call Now</span>
              <span className="site-nav__phone__number">{clinic.phone}</span>
            </span>
          </a>
        </nav>

        <button
          className="menu-toggle"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <a className="mobile-call-bar" href={clinic.phoneHref}>
        <Phone size={25} strokeWidth={2.4} />
        <span>Call now {clinic.phone}</span>
      </a>
    </header>
  );
}
