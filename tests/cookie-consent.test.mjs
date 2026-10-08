import assert from "node:assert/strict";
import { test } from "node:test";
import { CONSENT_KEY, CONSENT_VERSION, CONSENT_LIFETIME_MS, createPreferences, parsePreferences, readPreferences, storePreferences, analyticsCookieNames, cookieDomains } from "../src/lib/cookie-consent.js";

const now = 1791450000000;
test("only explicit booleans enable optional purposes, independently", () => {
  assert.deepEqual(createPreferences({ analytics: "true", maps: true }, now), { version: CONSENT_VERSION, analytics: false, maps: true, savedAt: now });
  assert.equal(parsePreferences(JSON.stringify(createPreferences({ analytics: true, maps: false }, now)), now).maps, false);
});
test("invalid, future, stale and mismatched-version choices fail closed", () => {
  const choice = createPreferences({ analytics: true, maps: true }, now);
  for (const value of [null, "bad json", "{}", JSON.stringify({ ...choice, version: 0 }), JSON.stringify({ ...choice, analytics: 1 }), JSON.stringify({ ...choice, maps: "false" }), JSON.stringify({ ...choice, savedAt: now + 1 }), JSON.stringify({ ...choice, savedAt: "today" })]) assert.equal(parsePreferences(value, now), null);
  assert.equal(parsePreferences(JSON.stringify(choice), now + CONSENT_LIFETIME_MS), null);
  assert.equal(parsePreferences(JSON.stringify(choice), now + CONSENT_LIFETIME_MS - 1).analytics, true);
});
test("rejecting is remembered and contains only purpose flags/version/time", () => {
  const values = new Map();
  const storage = { getItem: (key) => values.get(key), setItem: (key, value) => values.set(key, value) };
  const choice = createPreferences({ analytics: false, maps: false, patientName: "do not retain" }, now);
  assert.equal(storePreferences(storage, choice), true);
  assert.deepEqual(readPreferences(storage, now), choice);
  assert.ok(!values.get(CONSENT_KEY).includes("patientName"));
});
test("blocked browser storage does not grant consent or throw", () => {
  const storage = { getItem: () => { throw Error("blocked"); }, setItem: () => { throw Error("blocked"); } };
  assert.equal(readPreferences(storage, now), null);
  assert.equal(storePreferences(storage, createPreferences({}, now)), false);
});
test("withdrawal selects GA cookies without selecting unrelated site cookies", () => {
  assert.deepEqual(analyticsCookieNames("session=keep; _ga=one; _ga_YVVFSVJP08=two; _gid=old; _gat_gtag=old; other_ga=keep"), ["_ga", "_ga_YVVFSVJP08", "_gid", "_gat_gtag"]);
  assert.deepEqual(cookieDomains("www.kildareclinic.ie"), ["", "www.kildareclinic.ie", ".www.kildareclinic.ie", "kildareclinic.ie", ".kildareclinic.ie"]);
  assert.deepEqual(cookieDomains("127.0.0.1"), [""]);
});

test("analytics starts once and withdrawal reloads even while its script is pending or cookie access fails", async () => {
  const appended = [];
  let reloads = 0;
  const originalWindow = globalThis.window;
  const originalDocument = globalThis.document;
  try {
    globalThis.window = { location: { pathname: "/contact", hostname: "www.kildareclinic.ie", reload: () => { reloads++; } } };
    globalThis.document = {
      head: { appendChild: (script) => appended.push(script) },
      createElement: () => ({ remove() { this.removed = true; } }),
      getElementById: () => appended[0],
      get cookie() { throw Error("cookie storage blocked"); },
    };
    const { enableAnalytics, disableAnalytics, ANALYTICS_ID } = await import("../src/lib/analytics.js");
    enableAnalytics();
    enableAnalytics();
    assert.equal(appended.length, 1, "StrictMode/remounts must not duplicate the tracker");
    const config = window.dataLayer.find((command) => command[0] === "config")[2];
    assert.equal(config.cookie_expires, CONSENT_LIFETIME_MS / 1000);
    assert.equal(config.cookie_update, false);
    disableAnalytics();
    assert.equal(window[`ga-disable-${ANALYTICS_ID}`], true);
    assert.equal(appended[0].removed, true);
    assert.equal(reloads, 1, "withdrawal unloads a pending tracker despite inaccessible cookies");
  } finally {
    if (originalWindow === undefined) delete globalThis.window; else globalThis.window = originalWindow;
    if (originalDocument === undefined) delete globalThis.document; else globalThis.document = originalDocument;
  }
});
