export const CONSENT_KEY = "kildare_cookie_preferences";
export const CONSENT_VERSION = 1;
export const CONSENT_LIFETIME_MS = 180 * 24 * 60 * 60 * 1000;

export function createPreferences(choices, now = Date.now()) {
  return {
    version: CONSENT_VERSION,
    analytics: choices.analytics === true,
    maps: choices.maps === true,
    savedAt: now,
  };
}

export function parsePreferences(value, now = Date.now()) {
  try {
    const choice = JSON.parse(value);
    if (
      !choice || choice.version !== CONSENT_VERSION ||
      typeof choice.analytics !== "boolean" || typeof choice.maps !== "boolean" ||
      !Number.isFinite(choice.savedAt) || choice.savedAt > now ||
      now - choice.savedAt >= CONSENT_LIFETIME_MS
    ) return null;
    return createPreferences(choice, choice.savedAt);
  } catch {
    return null;
  }
}

export function readPreferences(storage, now = Date.now()) {
  try {
    return parsePreferences(storage.getItem(CONSENT_KEY), now);
  } catch {
    return null;
  }
}

export function storePreferences(storage, choice) {
  try {
    storage.setItem(CONSENT_KEY, JSON.stringify(choice));
    return true;
  } catch {
    return false;
  }
}

export function analyticsCookieNames(cookieString) {
  return cookieString.split(";").map((part) => part.trim().split("=")[0])
    .filter((name) => /^_ga(?:_|$)|^_gid$|^_gat(?:_|$)/.test(name));
}

export function cookieDomains(hostname) {
  const domains = [""];
  if (!hostname || hostname === "localhost" || /^[\d.]+$/.test(hostname) || hostname.includes(":")) return domains;
  const labels = hostname.split(".");
  while (labels.length >= 2) {
    const domain = labels.join(".");
    domains.push(domain, `.${domain}`);
    labels.shift();
  }
  return domains;
}
