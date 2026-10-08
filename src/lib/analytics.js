import { CONSENT_LIFETIME_MS, analyticsCookieNames, cookieDomains } from "./cookie-consent.js";

export const ANALYTICS_ID = "G-YVVFSVJP08";
const SCRIPT_ID = "kildare-google-analytics";
let started = false;

export function enableAnalytics() {
  if (started || typeof window === "undefined") return;
  started = true;
  window[`ga-disable-${ANALYTICS_ID}`] = false;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  // Only analytics is offered here; advertising consent is never inferred.
  window.gtag("consent", "default", {
    analytics_storage: "granted", ad_storage: "denied",
    ad_user_data: "denied", ad_personalization: "denied",
  });
  window.gtag("js", new Date());
  window.gtag("config", ANALYTICS_ID, {
    cookie_expires: CONSENT_LIFETIME_MS / 1000,
    cookie_update: false,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  });
  const script = document.createElement("script");
  script.id = SCRIPT_ID;
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${ANALYTICS_ID}`;
  document.head.appendChild(script);
}

export function clearAnalyticsCookies() {
  const names = analyticsCookieNames(document.cookie);
  const parts = window.location.pathname.split("/").filter(Boolean);
  const paths = new Set(["/"]);
  while (parts.length) {
    paths.add(`/${parts.join("/")}`);
    paths.add(`/${parts.join("/")}/`);
    parts.pop();
  }
  for (const name of names) {
    for (const path of paths) {
      for (const domain of cookieDomains(window.location.hostname)) {
        document.cookie = `${name}=; Max-Age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}${domain ? `; domain=${domain}` : ""}`;
      }
    }
  }
}

export function disableAnalytics() {
  window[`ga-disable-${ANALYTICS_ID}`] = true;
  try { clearAnalyticsCookies(); } catch { /* Cookie restrictions must not prevent withdrawal. */ }
  if (!started) return;
  window.gtag?.("consent", "update", { analytics_storage: "denied" });
  document.getElementById(SCRIPT_ID)?.remove();
  // Reload after saving the new choice: removing a script cannot unload its code.
  window.location.reload();
}
