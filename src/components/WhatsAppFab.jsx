import { MessageCircle } from "lucide-react";
import { whatsappLink } from "../data/content.js";
import "./WhatsAppFab.css";

export default function WhatsAppFab() {
  return (
    <a
      className="whatsapp-fab"
      href={whatsappLink("Hi Kildare Clinic, I'd like to book an appointment.")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Book an appointment on WhatsApp"
    >
      <MessageCircle size={22} strokeWidth={2.2} />
    </a>
  );
}
