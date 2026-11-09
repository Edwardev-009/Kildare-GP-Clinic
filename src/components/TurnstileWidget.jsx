import { useEffect, useRef } from "react";
import { TURNSTILE_SITE_KEY } from "../lib/booking.js";

// Cloudflare Turnstile bot check. Renders nothing (and loads nothing) unless VITE_TURNSTILE_SITE_KEY is set.

export default function TurnstileWidget({ onToken }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) return undefined;
    let widgetId;
    let cancelled = false;
    const render = () => {
      if (cancelled || !window.turnstile || !ref.current) return;
      widgetId = window.turnstile.render(ref.current, {
        sitekey: TURNSTILE_SITE_KEY,
        callback: (token) => onToken(token),
        "expired-callback": () => onToken(""),
        "error-callback": () => onToken(""),
      });
    };
    let script = document.querySelector("script[data-turnstile]");
    if (window.turnstile) {
      render();
    } else {
      if (!script) {
        script = document.createElement("script");
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        script.async = true;
        script.defer = true;
        script.dataset.turnstile = "1";
        document.head.appendChild(script);
      }
      script.addEventListener("load", render);
    }
    return () => {
      cancelled = true;
      script?.removeEventListener("load", render);
      if (widgetId !== undefined && window.turnstile) window.turnstile.remove(widgetId);
    };
  }, [onToken]);

  if (!TURNSTILE_SITE_KEY) return null;
  return <div ref={ref} className="bk-turnstile" />;
}
