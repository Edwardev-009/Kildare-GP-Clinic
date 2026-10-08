import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import ContactForm from "./ContactForm.jsx";
import { CERTIFICATE_REASON, CERTIFICATE_TURNAROUND } from "../data/certificates.js";
import "./CertificateModal.css";

export default function CertificateModal({ certificate, onClose }) {
  const closeRef = useRef(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      previouslyFocused?.focus?.();
    };
  }, [onClose]);

  return (
    <div
      className="cert-modal"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="cert-modal__panel" role="dialog" aria-modal="true" aria-labelledby="cert-modal-title">
        <button ref={closeRef} type="button" className="cert-modal__close" onClick={onClose} aria-label="Close form">
          <X size={20} />
        </button>
        <span className="eyebrow">Medical certificate request</span>
        <h2 id="cert-modal-title">{certificate.title}</h2>
        <p className="cert-modal__meta">
          €{certificate.price} · {CERTIFICATE_TURNAROUND}
        </p>
        <ContactForm compact initialReason={CERTIFICATE_REASON} initialCertificate={certificate.id} />
      </div>
    </div>
  );
}
