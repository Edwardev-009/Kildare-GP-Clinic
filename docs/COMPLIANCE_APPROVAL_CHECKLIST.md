# Ireland website compliance: approval checklist

**Prepared:** 8 October 2026

**Original review baseline:** `91926e7` on branch `Talha`

**Current implementation baseline:** `daddd3a`, containing the previously approved cookie changes

**Decision status:** C01, the cookie-information part of C03, and the owner's confirmed C06 schedule are implemented and locally verified. The remaining owner decisions are recorded below.

This checklist covers the public Kildare Clinic website, including the contact and medical-certificate requests added by the latest `main`. It records observed code gaps, items requiring evidence, and conditional obligations separately. Missing evidence in this repository does not establish that a clinic procedure is absent or that a person is unqualified.

## Owner decisions — 8 October 2026

| ID | Decision | Effect on this implementation |
| --- | --- | --- |
| C01 | Approved; implemented locally | Prior, separate opt-in for Google Analytics and Google Maps embeds, reject/accept/preferences controls and later withdrawal. Both features are preserved. |
| C02 | Not selected | No separate clinical-analytics/account audit or certificate-route exclusion is approved. |
| C03 | Cookies implemented; privacy deferred | Cookie/storage information and Cookie settings are available. No privacy page, form privacy notice or invented controller/provider/retention details were added. |
| C04 | Ignore; outside the owner's scope | No health-data collection/provider/mailbox workflow changes. |
| C05 | Ignore; outside the owner's scope | No live EmailJS test messages, delivery audit or acknowledgement-copy changes. |
| C06 | Approved; implemented and locally verified | Opening hours everywhere derive from the confirmed shared schedule: Monday–Tuesday 10:00 AM–2:00 PM; Wednesday OFF; Thursday 4:00 PM–8:00 PM; Friday–Saturday 10:00 AM–2:00 PM; Sunday OFF. |
| C07 | Confirmed by owner | Keep the existing certificate fees, timing and workflow wording. No independent operational/provider verification is claimed. |
| C08 | Owner states reviews are from Google and there are 51 ratings | Record this statement. Keep the five published testimonials and their existing presentation; do not invent individual ratings, a new aggregate score or review links. |
| C09 | Verified by owner | Keep the existing team, service/marketing copy and blog previews. No independent clinical/registration review is claimed. |
| C10–C11 | Ignore accessibility items; outside the owner's scope | No certificate-modal, navigation, contrast or slider/motion redesign. |
| C12 | Not selected | No host/header/configuration/provider-security changes or credential handling. |
| C13–C15 | Ignore conditional obligations | No accessibility-law, company-disclosure, DPIA/DPO or broader clinic-procedure implementation. |

Owner confirmations above are recorded as supplied; they are separate from source observations and independent verification. An ignored/deferred item is a scope decision, not a finding that an obligation is satisfied or inapplicable.

## Approved opening-hours update — C06

The owner's latest instruction supersedes the earlier decision to defer C06. The confirmed schedule is:

| Days | Opening hours |
| --- | --- |
| Monday–Tuesday | 10:00 AM–2:00 PM |
| Wednesday | OFF |
| Thursday | 4:00 PM–8:00 PM |
| Friday–Saturday | 10:00 AM–2:00 PM |
| Sunday | OFF |

`openingSchedule` in `src/data/content.js` is the shared source. The daily tables, Morning/Evening table columns, grouped `hoursSummary` and Home's opening-days badge derive from it. Thursday's 4:00 PM start belongs in the Evening column even though it is that day's only session. The schedule also propagates to the About/Contact/Footer opening-hours displays, opening-hours FAQ, `openingHoursSpecification` structured data and generated Markdown/discovery summaries. The production build regenerated the public discovery files and prerendered pages from this source.

Only the approved opening days/times and their dependent displays were changed. Certificate turnaround claims, service wording, contact information and all earlier excluded/deferred decisions remain as recorded above.

### Verification of the latest hours update

- A literal seven-day expectation check passed against the owner's supplied times, including Thursday Morning OFF / Evening 4:00 PM–8:00 PM and Wednesday/Sunday OFF.
- `npm run build` and `npm run check:seo` passed for all six routes and the 404 page; visible text, JSON-LD and generated discovery files use the new schedule.
- `npm run check:seo:http -- http://127.0.0.1:4174` passed for pages, discovery files and HTTP 404.
- Six targeted desktop/mobile browser inspections passed across Home, Contact and About, including the Home badge/table, Contact shift cards, About list, footer, opened hours FAQ and structured data. No horizontal overflow, page errors or hydration errors. No real external/provider requests were made; the fresh cookie choices still blocked Analytics/Maps.
- Searches found no old opening hours in application source or generated public/build pages. Historical observations below remain labelled as historical.
- Full lint reported the three existing Header warnings plus an unused import made obsolete by updating the old hours assertion. That import was removed; targeted lint then passed for every changed source/check file. No unrelated Header edits were made.

The earlier cookie tests below were not rerun as a full suite for this hours-only change. No push or deployment is included in C06.

## Approved cookie implementation

- Google Analytics `G-YVVFSVJP08` is requested only after the Analytics category is allowed. Google Maps frames are mounted only after the Maps category is allowed.
- The initial banner has **Reject optional**, **Accept optional** and **Choose cookies** actions. Settings allow analytics and maps to be selected independently; neither is preselected for a new visitor.
- A permanent **Cookie settings** footer control and the `/cookies` page allow the visitor to reopen and change the choices.
- The first-party local-storage key `kildare_cookie_preferences` remembers versioned analytics/maps choices and `savedAt`. Choices are honoured for 180 days. This is a site implementation choice informed by the DPC recommendation to refresh consent; it is not a fixed statutory expiry for every cookie.
- The tag configuration sets site-owned `_ga`/`_ga_*` cookie expiry to 180 days and disables automatic expiry updates with `cookie_update: false`. This cookie expiry is distinct from the saved-choice validity.
- Withdrawing Maps removes the frames. Withdrawing Analytics after the tag has started loading clears site-accessible GA cookies and reloads to unload the tag. The reload can discard unsent form entries; Google-domain cookies and already-transmitted data cannot be removed by this site.
- The cookie page describes the actual site configuration, Google service requests, provider-dependent embed cookies and withdrawal limits. It links provider information rather than inventing a complete audited Google-domain cookie inventory.
- Google Fonts and ordinary external WhatsApp/Google Maps links remain unchanged. Cookie information is not a substitute for the privacy information the owner has deferred.
- As a supporting C01 fix, `ContactForm.jsx` loads EmailJS inside the existing submit handler instead of at application startup. Its library reads browser storage during import; deferring that import keeps cookie controls usable if storage access is denied. Form fields, request payloads, success/error wording and the EmailJS send call are unchanged. No C04/C05 workflow or provider-account work was performed.

References: [DPC cookies/tracking guidance — PDF attachment](https://www.dataprotection.ie/sites/default/files/uploads/2020-04/Guidance%20note%20on%20cookies%20and%20other%20tracking%20technologies.pdf), [Google cookie information](https://policies.google.com/technologies/cookies), [Google tag cookies](https://developers.google.com/tag-platform/security/concepts/cookies), [Google cookie expiry settings](https://developers.google.com/tag-platform/security/guides/customize-cookies) and [Google Privacy Policy](https://policies.google.com/privacy).

### Historical verification of the cookie implementation, before C06

The previously approved cookie implementation was checked on 8 October 2026, before the latest C06 schedule update:

- `npm run test:consent`: **6 tests passed**, covering strict purpose flags, invalid/future/expired choices, storage failures, selective GA cookie cleanup, duplicate-script prevention and withdrawal while the script is pending.
- `scripts/check-cookie-consent-browser.mjs`: **12 scenarios passed** using bundled Playwright. Covered initial/rejected requests, independent analytics/maps choices, acceptance/withdrawal, persisted choices, invalid/expired choices, expiry in an open tab, cross-tab rejection/clearing, blocked storage methods/getter, desktop/mobile layout and preserved clinic content. No page or hydration errors.
- The browser harness intercepts every external request and uses mock analytics/maps. It verifies the website's consent gating without sending real analytics data or loading real Google embeds. No EmailJS chunk loaded before submission; no forms were submitted.
- `npm run build`: passed, including all six public routes and the 404 page.
- `npm run check:seo` and `npm run check:seo:http -- http://127.0.0.1:4174`: passed, including `/cookies`, generated discovery parity and the actual HTTP 404.
- `npm run lint`: passed with the same **three existing Header warnings**; no new warnings from the cookie implementation.
- At that verification point, source comparison confirmed team/reviews/blogs, certificate offerings/copy, opening hours, fonts, existing sliders and certificate-modal behaviour were preserved. Opening hours are now separately authorised to change under C06. The only Contact form source change in the cookie work was the deferred EmailJS import described above.

The browser script accepts a `KILDARE_PLAYWRIGHT_MODULE` path for the bundled Playwright runtime, or uses an installed `playwright` module. No dependency was added for these browser checks.

No live EmailJS messages, clinical requests, certificate issuance, payment transactions, provider-account changes, push or deployment were performed. These checks establish local website behaviour; live analytics reporting and provider cookie behaviour are separate.

## Rollback and Git update

- The previous uncommitted compliance implementation was undone. Its policy pages, consent controls, content filters, copy changes, headers and added test/dependency changes are no longer in the website source.
- A recovery copy remains in `stash@{0}`, named **Recovery snapshot before owner-requested compliance rollback on 2026-10-08**. This is a backup, not a set of approved changes; do not apply it to implement this checklist.
- Previous local screenshots were saved outside the website at `C:\Users\talha\AppData\Local\Temp\kildare-compliance-rollback-2026-10-08\artifacts`.
- `git pull origin main --rebase` completed successfully as a fast-forward from `4659d95` to `91926e7`. There were no conflicts to resolve.
- The EmailJS integration, certificate page and other changes brought in by `main` are retained.
- All three team profiles are visible: **Dr. S.Rasool**, **Dr. Sania Batool**, and **Muqadas — Physiotherapist**. The last profile already has no “Dr.” in the pulled version.
- Five testimonials and six blog previews are restored. Their existing text, dates, read times, Google branding and presentation are retained.

## Original proposals and baseline observations

The proposals below preserve the original baseline review and its reference links. Their unchecked boxes are historical proposal markers, not the current approval status; the owner-decision table above is authoritative. C01, C03's cookie portion and the confirmed C06 schedule update are authorised for implementation. No review authorises deleting a feature or changing other business facts.

### Privacy, tracking and request handling

- [ ] **C01 — Add consent controls for optional tracking and embeds.** **Confirmed gap:** `index.html` loads/configures GA4 before a choice; Footer and Contact load Google Maps frames without a choice. Proposed: prior opt-in for analytics, an appropriately classified opt-in map embed, equally accessible reject/preferences controls and later withdrawal. Keep the map location, directions and analytics capability. Inventory actual cookies/storage first; do not label all third-party requests as cookies. Basis: [DPC analytics consent FAQ](https://www.dataprotection.ie/en/faqs/cookies/do-i-need-consent-analytics-cookies) and [DPC cookies/tracking guidance — PDF attachment](https://www.dataprotection.ie/sites/default/files/uploads/2020-04/Guidance%20note%20on%20cookies%20and%20other%20tracking%20technologies.pdf).

- [ ] **C02 — Prevent clinical request information reaching analytics.** **Needs verification:** the analytics account, enhanced measurement and runtime requests have not been audited. Proposed: exclude form values, contact details, certificate selections and sensitive URL/query data from tracking; agree whether analytics should run on certificate/intake views at all. Cookie consent alone does not authorise processing health data. Retain the certificate flow. Basis: [DPC tracking guidance, special-category data — PDF attachment](https://www.dataprotection.ie/sites/default/files/uploads/2020-04/Guidance%20note%20on%20cookies%20and%20other%20tracking%20technologies.pdf) and [DPC health-data guidance](https://dataprotection.ie/en/dpc-guidance/case-studies/transparency/processing-health-data).

- [ ] **C03 — Publish accurate privacy and cookie information.** **Confirmed website gap:** no privacy/cookie notices or collection-time privacy link appear in the current routes/forms. Proposed: accessible notices and short information beside both contact/certificate forms, describing the confirmed controller, purposes, bases, recipients, retention, rights and applicable transfers. Include EmailJS, mailbox/hosting providers, Google services and WhatsApp where relevant. Use actual provider/cookie details; do not invent legal identity, retention periods or a DPO. Basis: [DPC transparency obligations](https://www.dataprotection.ie/en/organisations/know-your-obligations/transparency) and [DPC cookies guidance — PDF attachment](https://www.dataprotection.ie/sites/default/files/uploads/2020-04/Guidance%20note%20on%20cookies%20and%20other%20tracking%20technologies.pdf).

- [ ] **C04 — Review health-data collection and the EmailJS/email workflow.** **Source observation / operational evidence needed:** reasons, certificate type and required free text may contain health information. These are sent through `emailjs.send()` with name, phone and email. Proposed: confirm the Article 6 basis and Article 9 condition; assess which fields must be required; add agreed minimisation guidance; review provider roles/agreements, transfers, mailbox access, security, deletion and retention. Do not add a compulsory “GDPR consent” checkbox as a substitute for this assessment or rewrite the form into a new backend without separate agreement. Basis: [DPC health-data processing](https://dataprotection.ie/en/dpc-guidance/case-studies/transparency/processing-health-data), [processor contracts — PDF attachment](https://www.dataprotection.ie/sites/default/files/uploads/2019-06/190624%20Practical%20Guide%20to%20Controller-Processor%20Contracts.pdf), [DPC international transfers](https://www.dataprotection.ie/en/organisations/international-transfers/transfers-personal-data-third-countries-or-international-organisations), and [DPC data security](https://www.dataprotection.ie/en/organisations/know-your-obligations/data-security-guidance).

- [ ] **C05 — Verify delivery and agree form acknowledgements.** **Implemented, live delivery unverified:** the current form awaits EmailJS and handles errors; it is no longer the earlier front-end-only form. Proposed: inspect approved provider/template configuration, then verify delivery using an explicitly authorised test recipient and synthetic data. Review “Message received”, “Request received”, payment-link timing and callback promises against the actual clinic process. Provider acceptance does not prove the clinic mailbox received or a clinician accepted a request. Any copy correction must be agreed; preserve the working integration. Basis: [DPC transparency](https://www.dataprotection.ie/en/organisations/know-your-obligations/transparency) and [Medical Council guide, sections 49–50 — PDF attachment](https://www.medicalcouncil.ie/news-and-publications/publications/guide-to-professional-conduct-and-ethics-for-registered-medical-practitioners-2024.pdf).

### Published information and service claims

- [ ] **C06 — Resolve opening-hours inconsistency after confirmation.** **Historical baseline mismatch, superseded by the approved schedule above:** the original `hoursSummary` and Home's hard-coded walk-in badge said Monday–Saturday; `openingSchedule` opened Monday–Thursday and closed Friday–Sunday. Tables and structured data used the latter. The original proposal was to obtain authoritative days/sessions before synchronising text, the Home badge, tables, FAQs, schema and discovery summaries. The owner has now supplied that schedule and approved the update. Contact details remain unchanged. Basis: accurate practice information in [Medical Council guide, section 50 — PDF attachment](https://www.medicalcouncil.ie/news-and-publications/publications/guide-to-professional-conduct-and-ethics-for-registered-medical-practitioners-2024.pdf).

- [ ] **C07 — Verify certificate fees, timing and clinical workflow; correct only agreed wording.** **Needs owner evidence:** the new page advertises €30/€40 fees, “Within 5 hours”, Irish-registered GP review, payment links and secure email delivery. Confirm eligibility, clinical review, registration-number handling on issued certificates, turnaround start point/opening hours, payment provider, refusal/refund handling and recipient acceptance claims. The website does not itself issue certificates or process card payments. Keep the page, services and prices unless a specific correction is approved. Any approved correction must also cover the repeated SEO/discovery text. Basis: [Medical Council guide, sections 37, 50 and 52 — PDF attachment](https://www.medicalcouncil.ie/news-and-publications/publications/guide-to-professional-conduct-and-ethics-for-registered-medical-practitioners-2024.pdf).

- [ ] **C08 — Verify review provenance and actual ratings.** **Confirmed code limitation:** the slider renders five stars for every testimonial; its data stores names/text without rating/source fields. This does not establish that the reviews or ratings are false. Proposed: obtain original review links/ratings and republication basis, then display substantiated ratings and provenance. Any removal, text edit or removal of Google branding requires an explicit decision. Basis: accurate advertising under [Medical Council guide, section 50 — PDF attachment](https://www.medicalcouncil.ie/news-and-publications/publications/guide-to-professional-conduct-and-ethics-for-registered-medical-practitioners-2024.pdf).

- [ ] **C09 — Review clinical/marketing copy and blog metadata with the clinic.** **Needs evidence:** verify staffing/nursing descriptions, waits, consultation/booking promises, listed services and clinical preview accuracy. The six blog cards are previews, not full articles; confirm dates/read times before changing them or adding full articles. Review professional titles/qualifications with the clinic while retaining all three profiles, including Muqadas without “Dr.”. No automatic hiding based on a missing internal approval flag. Basis: [Medical Council guide, public communication and practice information — PDF attachment](https://www.medicalcouncil.ie/news-and-publications/publications/guide-to-professional-conduct-and-ethics-for-registered-medical-practitioners-2024.pdf). This is a verification proposal, not a finding against any named clinician.

### Accessibility and technical safeguards

- [ ] **C10 — Fix certificate-modal keyboard behaviour and verify navigation.** **Source finding:** the modal supports initial/return focus and Escape, but has no focus trap or background isolation. Proposed: keep keyboard focus inside the open modal, make the background non-interactive and verify tab order, labels/errors, focus visibility, mobile navigation, contrast and zoom. Keep the existing design. A targeted browser audit should establish further defects before they are described as failures. Basis: [W3C modal-dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/). This is a technical accessibility improvement; legal applicability is assessed separately in C13.

- [ ] **C11 — Add usable slider pause/motion controls.** **Source finding:** gallery/testimonial timers advance automatically; current controls provide navigation but no persistent pause button. CSS already reduces motion, but JavaScript still auto-advances the slides. Proposed: add pause/resume, sensible focus/hover behaviour and extend reduced-motion support to stop that auto-advance, while retaining the sliders, photos and normal autoplay for users who choose it. Do not remove autoplay globally without approval. Basis: [WCAG pause, stop, hide criterion](https://www.w3.org/TR/WCAG22/#pause-stop-hide).

- [ ] **C12 — Review security/configuration with the actual host and providers.** **Unverified settings:** assess HTTPS, applicable security headers, provider origin restrictions, spam/rate controls, access permissions and dependency maintenance. `.env` is tracked upstream; classify its variables privately. Browser-public EmailJS keys are not automatically secret leaks. If actual private credentials are present, agree rotation/removal and the scope of any history cleanup. Never publish values in this report. Keep EmailJS/Maps/fonts working; font self-hosting or infrastructure changes need a specific approval. Basis: [DPC security guidance](https://www.dataprotection.ie/en/organisations/know-your-obligations/data-security-guidance). Header choices are implementation safeguards, not a universal statutory list.

### Conditional obligations and clinic-owned procedures

- [ ] **C13 — Establish accessibility-law applicability.** **Conditional:** assess the certificate request/payment journey as a potential consumer e-commerce service; do not assume the website is information-only. Confirm clinic size and any service-provider microenterprise exemption. Add applicable accessibility information and requirements only after the scope is established; do not claim WCAG/EAA compliance from a build or automated scan. Basis: [CCPC covered products/services](https://www.ccpc.ie/enforcement-and-regulation/market-surveillance/accessibility/accessibility-for-businesses/products-and-services-covered-by-the-european-accessibility-act), [CCPC microenterprise guidance](https://www.ccpc.ie/enforcement-and-regulation/market-surveillance/accessibility/accessibility-for-businesses/european-accessibility-act-guidelines-for-microenterprises) and [full guidance — PDF attachment](https://assets.ccpc.ie/data/docs/default-source/enforcement-and-regulation/accessibility/european-accessibility-act-guidelines-for-microenterprises---pdf-version.pdf?sfvrsn=babc54bf_1).

- [ ] **C14 — Confirm legal entity and applicable service disclosures.** **Conditional / identity unverified:** if operated by an Irish limited liability company, publish its legal name/form, registration details and registered office where CRO requires. Assess online service/professional disclosure requirements against the certificate flow; add only confirmed details. Do not invent a company number, VAT registration, regulator affiliation or clinician registration number. Basis: [CRO website disclosures](https://cro.ie/registration/company/incidental-obligations/letterheads/) and [Irish e-commerce regulations, Regulation 7](https://www.irishstatutebook.ie/eli/2003/si/68/made/en/print). The Statute Book reference was blocked to the research tool on 8 October; applicability/detail needs verification before drafting.

- [ ] **C15 — Confirm privacy operations, DPIA/DPO applicability and complaint routes.** **Operational evidence needed:** identify the responsible privacy contact; review rights requests, retention/deletion, breach handling, provider records and clinic complaint procedures. Assess whether the processing requires a DPIA or DPO rather than automatically appointing one for every clinic. Publish only the agreed contact/procedure information relevant to this website. Broader medical-record, safeguarding or staff-system implementation is outside this website checklist. Basis: [DPC DPIA guidance](https://www.dataprotection.ie/en/organisations/know-your-obligations/data-protection-impact-assessments), [DPC DPO guidance](https://www.dataprotection.ie/en/organisations/know-your-obligations/data-protection-officers) and [DPC security guidance](https://www.dataprotection.ie/en/organisations/know-your-obligations/data-security-guidance).

## What must remain unchanged without a specific approval

| Content / feature | Preservation instruction |
| --- | --- |
| Team profiles | Keep all three visible and in their existing order. Keep **Muqadas — Physiotherapist**, without “Dr.”. Do not require an internal approval flag to display a profile. |
| Reviews | Keep the five names/texts, review section and Google presentation. C08 permits agreed factual corrections only; it does not authorise blanket removal. |
| Blog | Keep all six previews, titles, excerpts, dates and read times. No suppression because full article pages are absent. |
| Headlines and service copy | Preserve existing wording, staffing references, walk-in/booking and reply promises until a specific C07/C09/C05 correction is approved. |
| Certificate service | Keep the route, navigation, four offerings, prices, request modal and EmailJS flow brought in by `main`. Review proposals do not authorise removing them. |
| Contact routes | Keep phone, email, WhatsApp links, address and booking actions. No substitution with disabled buttons or an unsending form. |
| Opening hours | Apply the confirmed C06 schedule and synchronise its dependent displays. Do not retain the superseded inconsistent hours or change the confirmed schedule without a new owner instruction. |
| Branding and layout | Keep palette, fonts, photographs, page layout and sliders. Accessibility improvements must retain the design unless a visual change is agreed. |
| External features | Keep Maps and GA4 capability. Approved C01 changes when those optional services load and permits visitor withdrawal. Fonts remain unchanged. |
| SEO / discovery | Keep existing routes, canonical URLs, prerendering and discovery behaviour; coordinate generated content only with an approved factual change. |
| Remote work | Preserve the updates pulled from `main`. No unrelated refactors, push, deployment or provider/account changes are authorised by approving this document. |

The earlier work hid team profiles, testimonials and blog previews; removed their stars/Google presentation; softened service, staffing, appointment and response claims; changed WhatsApp wording, font loading, embeds/tracking and slider behaviour. Those unapproved edits have been rolled back. The commented-out manager/coordinator/receptionist entries in `content.js` already exist in upstream; this rollback has not newly hidden them.

## Information needed before dependent changes

1. Legal operator/controller identity and privacy contact; company details if applicable.
2. EmailJS/email/hosting/WhatsApp/payment providers, their roles and countries; actual access, retention and security arrangements.
3. Approved basis/condition for ordinary and health-data processing, and the minimum information required for each request.
4. Certificate fees, turnaround conditions, clinical assessment/issuance process, payment and refusal/refund handling.
5. Review sources/ratings and confirmed professional/service/clinical-content facts.
6. Clinic size and service scope for conditional accessibility/DPO/DPIA assessments.

Only information relevant to the IDs you select needs to be supplied before those changes. Do not send patient records or credentials for this review.

## Approval and verification

The owner decisions above define this implementation. Any later approval should name the additional IDs and scope explicitly. A decision to hide/remove content must name that content; approval of a review is not permission to hide it.

After approval, implement only the agreed IDs and necessary supporting changes, record the exact scope, and verify the resulting website. If a new concern arises, add it as another pending proposal. No additional intuition-based content filtering or copy rewrite.

Historical local verification of the restored/pulled `91926e7` baseline, before the approved cookie and C06 changes:

- Locked dependencies installed with `npm ci`; no package/lock changes requested.
- Production/prerender build passed for all five public routes and the 404 page.
- `npm run check:seo` passed, including metadata/schema/assets and generated discovery parity. This checked consistency with that baseline source; it did not resolve its opening-hours contradiction, which is now addressed separately by approved C06.
- `npm run lint` exited successfully with three existing warnings in `src/components/Header.jsx` (effect state/dependencies).
- `npm run check:seo:http -- http://127.0.0.1:4174` passed for all five routes, discovery files and the actual HTTP 404. The temporary verification server was stopped afterward.
- No live EmailJS messages, clinical requests, certificate issuance, payment transactions, provider setting changes or deployment were performed. These local checks are not legal certification or live-provider acceptance.

The linked official guidance/PDFs are reference attachments for the proposals, not clinic policies already adopted. A separate Terms, accessibility statement, DPO appointment or DPIA is not assumed mandatory for every clinic merely because a template can be created.
