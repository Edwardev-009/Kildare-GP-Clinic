import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { CONSENT_KEY, CONSENT_LIFETIME_MS, createPreferences, parsePreferences, readPreferences, storePreferences } from "../lib/cookie-consent.js";
import { disableAnalytics, enableAnalytics } from "../lib/analytics.js";
import { CookieContext } from "../lib/cookie-context.js";
import "./CookieConsent.css";

export function CookieConsentProvider({ children }) {
  // SSR and first hydration both block optional services; storage is read on mount.
  const [preferences, setPreferences] = useState(null);
  const [ready, setReady] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [draft, setDraft] = useState({ analytics: false, maps: false });
  const [sessionOnly, setSessionOnly] = useState(false);
  const sessionChoice = useRef(null);
  const panel = useRef(null);

  useEffect(() => {
    function refresh(event) {
      if (event?.type === "storage" && event.key !== null && event.key !== CONSENT_KEY) return;
      if (event?.type === "storage") sessionChoice.current = null;
      let choice = null;
      if (sessionChoice.current) {
        choice = parsePreferences(JSON.stringify(sessionChoice.current));
      } else {
        try { choice = readPreferences(window.localStorage); } catch { /* Browser storage may be blocked. */ }
      }
      setPreferences(choice);
      setSessionOnly(sessionChoice.current !== null && choice !== null);
      setReady(true);
    }
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (preferences?.analytics) enableAnalytics();
    else disableAnalytics();
  }, [preferences, ready]);

  useEffect(() => {
    if (!preferences) return;
    let timer;
    function checkExpiry() {
      const remaining = preferences.savedAt + CONSENT_LIFETIME_MS - Date.now();
      if (remaining <= 0) {
        sessionChoice.current = null;
        setPreferences(null);
        setSessionOnly(false);
        return;
      }
      timer = window.setTimeout(checkExpiry, Math.min(remaining, 2147483647));
    }
    checkExpiry();
    return () => window.clearTimeout(timer);
  }, [preferences]);

  const openSettings = useCallback(() => {
    setDraft({ analytics: preferences?.analytics === true, maps: preferences?.maps === true });
    setSettingsOpen(true);
    window.requestAnimationFrame(() => panel.current?.focus());
  }, [preferences]);

  const savePreferences = useCallback((choices) => {
    const choice = createPreferences(choices);
    let remembered = false;
    try { remembered = storePreferences(window.localStorage, choice); } catch { /* Keep a page-session choice. */ }
    sessionChoice.current = remembered ? null : choice;
    setSessionOnly(!remembered);
    setPreferences(choice);
    setSettingsOpen(false);
  }, []);

  return (
    <CookieContext.Provider value={{ preferences, openSettings, savePreferences }}>
      {children}
      {(!preferences || settingsOpen) && (
        <section className="cookie-panel" aria-label="Cookie preferences" ref={panel} tabIndex={-1}>
          <div className="cookie-panel__body">
            <h2>{settingsOpen ? "Cookie settings" : "Your cookie choices"}</h2>
            <p>We use optional cookies for website analytics and embedded Google Maps. Both stay off until you choose. You can change your choice at any time. <Link to="/cookies">Read our cookie information</Link>.</p>
            {settingsOpen && (
              <div className="cookie-panel__options">
                <p><strong>Necessary preferences</strong> — always on. Remembers your choice on this browser for up to 180 days.</p>
                <label>
                  <input type="checkbox" checked={draft.analytics} onChange={(event) => setDraft({ ...draft, analytics: event.target.checked })} />
                  <span><strong>Website analytics</strong><small>Allow Google Analytics to measure visits and use of this website.</small></span>
                </label>
                <label>
                  <input type="checkbox" checked={draft.maps} onChange={(event) => setDraft({ ...draft, maps: event.target.checked })} />
                  <span><strong>Embedded maps</strong><small>Allow Google Maps to load here and receive your IP address and browser information.</small></span>
                </label>
              </div>
            )}
            <div className="cookie-panel__actions">
              <button type="button" className="cookie-panel__choice" onClick={() => savePreferences({ analytics: false, maps: false })}>Reject optional</button>
              <button type="button" className="cookie-panel__choice" onClick={() => savePreferences({ analytics: true, maps: true })}>Accept optional</button>
              {settingsOpen ? (
                <button type="button" className="cookie-panel__choice" onClick={() => savePreferences(draft)}>Save choices</button>
              ) : (
                <button type="button" className="cookie-panel__choice" onClick={openSettings}>Choose cookies</button>
              )}
              {settingsOpen && preferences && <button type="button" className="cookie-panel__close" onClick={() => setSettingsOpen(false)}>Close without changes</button>}
            </div>
          </div>
        </section>
      )}
      {sessionOnly && <p className="cookie-session-note" role="status">Your browser blocked preference storage. Your choice applies to this page session; use Cookie settings to change it.</p>}
    </CookieContext.Provider>
  );
}
