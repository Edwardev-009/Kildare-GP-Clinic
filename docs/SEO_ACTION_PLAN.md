# Kildare GP and Kildare Physio search visibility

Audit and local changes: 9 October 2026. Deployment and search-account changes remain owner actions.

## What changed locally

| Search intent | Primary page | Supporting content |
| --- | --- | --- |
| Kildare GP, GP in Kildare, walk-in doctor Kildare | `/` | Local title/H1/introduction, GP FAQs, contact details and About/team information |
| Kildare Physio, physiotherapy Kildare Town | `/physiotherapy` | Muqadas, enquiries, shared clinic hours, preparation steps and FAQs |
| First physio appointment in Kildare | `/blog/kildare-physio-first-appointment` | Complete guide, organization byline, publication date, HSE reference and service links |

The service page answers booking intent; the blog answers preparation questions.
Both are prerendered into readable HTML, have their own metadata/canonical URL,
and appear in the sitemap and generated discovery summaries. Navigation, homepage,
About and footer link to the service; the blog links to the guide. `BlogPosting`
markup belongs only to the complete guide, never the six existing preview cards.

Owner confirmed Muqadas's name, general physio content and shared opening hours.
No physio price, registration number, specialist treatment, insurance cover or
clinician review is asserted. The GP homepage remains the primary GP landing page;
there is no duplicate GP keyword page.

The hero image receives high fetch priority. Browser checking also identified
and fixed a contact-form width constraint that caused horizontal overflow on
the homepage at 320px. No form submission behavior was changed.

## Live findings before these changes

Public HTTP checks confirmed:

- Homepage, About and Blog return 200 with page-specific, prerendered content.
- `robots.txt`, `sitemap.xml` and `llms.txt` return 200 with appropriate MIME types.
  Googlebot and Bingbot are allowed. The sitemap contains six existing pages.
- Unknown URLs return an actual 404, rather than a soft 404.
- Both `https://kildaredoc.ie/` and `https://www.kildaredoc.ie/` return 200.
  The non-www version does **not** redirect; both declare www canonicals.
- Inner pages redirect to a trailing slash while their canonicals and sitemap
  use URLs without a trailing slash. Keep a consistent preference at the host.
- Homepage H1 was “Walk-in GP care on Claregate Street.” Its local introductory
  paragraph was commented out. There was no dedicated physio URL in the sitemap;
  the Blog page contained previews only.

The owner reports Google position 2 and Bing position 4 for “Kildare GP”, and no
visibility for “Kildare Physio”. These are reported baselines, not independently
verified positions. Research searches returned established providers with
dedicated location/service pages, including
[Kildare Physiotherapy](https://www.kildarephysiotherapy.ie/) and
[MDC Physiotherapy](https://www.mdcphysiotherapy.ie/). Research results do not
reproduce a Google/Bing ranking from a particular location or distinguish a map
result from an organic result.

## Actions after deployment, in priority order

1. **Deploy the entire `dist/` build.** Serve each route's own `index.html`,
   including the nested blog directory; preserve direct asset/discovery access
   and real 404 responses. Check new URLs before requesting indexing.
2. **Consolidate hostnames.** Configure permanent 301/308 redirects from non-www
   and HTTP to `https://www.kildaredoc.ie`, preserving paths and query strings.
   Align trailing-slash handling with canonical/sitemap URLs without creating
   loops. This needs hosting configuration; a React redirect cannot replace an
   HTTP redirect. No hosting configuration was changed locally.
3. **Use Google Search Console and Bing Webmaster Tools.** Verify the canonical
   site, submit `https://www.kildaredoc.ie/sitemap.xml`, and inspect `/`,
   `/physiotherapy` and the guide. Check rendered content, crawl eligibility,
   canonical selection and indexing errors. Request indexing of the new pages
   through those accounts. Avoid repeated submissions of unchanged pages.
4. **Update Google Business Profile and Bing Places.** Confirm name, address,
   Eircode, phone and the current shared hours match the website. Use accurate
   available categories and add physiotherapy as a service/category only where
   appropriate to the real business. Link the physio service to its page where
   supported. Keep the actual business name; do not add keywords to it.
5. **Build local trust.** Add current clinic/team photos, ask patients for honest
   reviews without incentives or filtering, and reply without disclosing health
   information. Seek relevant local links/listings with consistent contact
   details. Publish registration details once confirmed by the clinic; publish
   clinician-reviewed health articles only after actual review.
6. **Measure progress.** Record a baseline in both webmaster accounts. Track
   exact queries plus “GP in Kildare”, “walk-in GP Kildare”, “physiotherapy
   Kildare” and “physio Kildare Town” by target page, country and device. Compare
   impressions, clicks, CTR and average position across 28-day periods. For
   manual checks, record location/date/device and whether results are organic
   or map listings. Check enquiries alongside rankings. Use live Core Web
   Vitals/PageSpeed evidence to choose further performance work.

Bing's [Webmaster Tools guidance](https://blogs.bing.com/webmaster/2025/6/Start-Using-Bing-Webmaster-Tools-to-Improve-Your-Site-Visibility/)
also recommends IndexNow for changed URLs. Configure it after deployment with a
key hosted on the canonical site if desired. This change has no configured
submission key or automatic submission. Submissions help discovery, not ranking.

Google explains that [local ranking](https://support.google.com/business/answer/7091)
depends mainly on relevance, distance and prominence. Content and technical SEO
can improve relevance/discoverability, but first place cannot be promised.
Its [helpful-content guidance](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)
supports useful, accurate content with clear sourcing and authorship. Do not
inflate word counts, claim reviews that did not happen or create duplicate town
pages solely to target keyword variants.

## Verification and deployment check

```powershell
npm run build
npm run check:seo
npm run lint
npm run test:consent
npm run preview -- --host 127.0.0.1 --port 4173 --strictPort
# In another terminal:
npm run check:seo:http
# After deployment:
npm run check:seo:http -- https://www.kildaredoc.ie
```

The HTTP checker validates generated file contents, MIME types, canonical pages
and 404/noindex behavior. A production host using its own 404 template must
include `noindex` for that final check. Inspect hostname/slash redirects
separately. Local checks cannot establish indexing, account configuration or
ranking improvement. No deployment, listing edits or indexing submissions were
made as part of this local implementation.

Final local verification passed: production build; all eight pages' static SEO,
schema, internal links, discovery parity and HTTP checks; browser checks at 320,
390, 768, 1024, 1180 and 1440px; hydrated navigation and article metadata cleanup;
six consent unit checks; and `git diff --check`. Lint has no errors and retains
three pre-existing Header effect/dependency warnings. Browser checks intercepted
external requests and sent no form submissions. Screenshots are saved in the
ignored `.seo-preview.local/` directory.

For reproducible browser checks, set `KILDARE_PLAYWRIGHT_MODULE` to an available
Playwright module's absolute `index.mjs` path and run
`node scripts/check-search-pages-browser.mjs` while the preview is running.
Playwright is a verification tool, not a production dependency.
