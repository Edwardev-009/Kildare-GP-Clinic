import { MapPin } from "lucide-react";
import { clinic } from "../data/content.js";
import { useCookieConsent } from "../lib/cookie-context.js";
import "./ConsentMap.css";

export default function ConsentMap(props) {
  const { preferences, openSettings } = useCookieConsent();
  if (preferences?.maps) return <iframe {...props} />;
  return (
    <div className="consent-map">
      <MapPin size={28} aria-hidden="true" />
      <h3>Find Kildare Clinic</h3>
      <p>{clinic.address}</p>
      <p>The embedded Google map loads when you allow maps in Cookie settings.</p>
      <div className="consent-map__actions">
        <button type="button" className="btn btn-primary" onClick={openSettings}>Map cookie settings</button>
        <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(clinic.address)}`} target="_blank" rel="noopener noreferrer">Open Google Maps in a new tab</a>
      </div>
    </div>
  );
}
