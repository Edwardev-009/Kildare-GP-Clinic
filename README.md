# Kildare Clinic — Website

React + Vite site for Kildare Clinic (GP Walk-In Medical Centre), built with
`react-router-dom` for routing, `lucide-react` for icons and
`react-helmet-async` for per-page SEO tags. No UI framework (Tailwind/MUI) —
plain CSS with a small set of design tokens in `src/index.css`.

## Run locally

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build into /dist
npm run preview   # preview the production build
```

## Structure

```
src/
  components/   Header, Footer, PageHeader, GallerySlider, TestimonialSlider,
                ContactForm, Faq, Seo, WhatsAppFab (floating button)
  pages/        Home, About, Blog, Contact
  data/content.js   All clinic details in one place — edit here first
  assets/       Clinic photos, incl. hero-img.webp used in the hero + gallery
public/
  favicon.svg          Branded gold-cross-on-black favicon
  social-preview.webp  Used for WhatsApp/Facebook/Twitter link previews
  robots.txt, sitemap.xml  Search and AI crawler access and canonical page URLs
  llms.txt, llms-full.txt  AI discovery index and combined clinic summaries
  index.md, about.md, contact.md, blog.md  Concise public page summaries
scripts/
  build.mjs       Builds and prerenders all four pages; refreshes discovery files
  check-seo.mjs   Checks the generated HTML, schema, links, hours and assets
  check-http.mjs  Checks actual HTTP responses from a local or deployed site
```

## Design

Palette is strictly **black + gold**, taken from the clinic's own signage —
no blue/navy or green anywhere. CSS variable names (`--navy-*`, `--brass-*`,
`--sage-*`) were kept as-is to minimise the diff, but they all resolve to
black/gold/neutral values now — see the token block at the top of
`src/index.css` if you want to nudge the exact shades.

The hero uses `src/assets/hero-img.webp` full-bleed to the right edge of the
viewport on desktop (see `.hero__row` / `.hero__image` in `src/pages/Home.css`)
so it reads at full size instead of being squeezed into a half-width column.

## SEO

- The confirmed public origin is `https://www.kildaredoc.ie`, derived from
  `clinic.website` in `src/data/content.js`. Metadata and route inventory live
  in `src/data/seo.js`.
- `npm run build` generates complete static HTML for `/`, `/about`, `/blog`
  and `/contact`. Every page contains readable content, one title, description,
  canonical URL, Open Graph tags and Twitter Card tags before JavaScript runs.
  React hydrates that HTML to keep navigation, FAQs and sliders interactive.
- JSON-LD connects the `MedicalClinic`, `WebSite` and current page, with
  breadcrumbs on inner pages and a `FAQPage` on the homepage. Services, contact
  details and hours come from the same data as the visible pages. No invented
  ratings, prices, clinician credentials or full-article schema are included.
- Confirmed hours: Monday–Tuesday and Friday–Saturday, 10 AM–2 PM;
  Thursday, 4 PM–8 PM; Wednesday and Sunday OFF. Edit `openingSchedule` to update the visible
  hours, FAQ, JSON-LD and Markdown summaries together, then rebuild.
- `robots.txt` permits crawling of public content and assets. Its wildcard
  already covers unlisted bots; named groups explicitly cover Google, Bing,
  OpenAI, Perplexity and Anthropic search/user agents. The existing permission
  for GPTBot and ClaudeBot training crawlers is retained. Training permission
  is separate from search inclusion; allowing training does not guarantee
  mentions or referrals.
- `sitemap.xml` lists only the four existing canonical pages. No fabricated
  article URLs or modification dates are supplied.
- `llms.txt` follows the [community proposal](https://llmstxt.org/) and links
  to concise Markdown summaries. `llms-full.txt` combines those summaries.
  Page heads link to both the discovery index and their Markdown alternative.
  These are summaries of public content, not full medical articles.
- `src/data/discovery.js` generates crawler and Markdown files into both
  `public/` and `dist/` on build. Edit the source generator, rather than its
  generated files. Only `dist/` needs to be hosted; `dist-ssr/` is build tooling.
- Google says [ordinary SEO practices apply to AI features](https://developers.google.com/search/docs/appearance/ai-features):
  it requires no additional AI text file or special schema. `llms.txt` is
  supplemental; neither it nor FAQ markup guarantees indexing, ranking,
  rich results or citations in an AI answer.

Verification:

```bash
npm run build
npm run check:seo
npm run lint
npm run preview -- --host 127.0.0.1 --port 4173 --strictPort
# In a second terminal:
npm run check:seo:http
# After deploying:
npm run check:seo:http -- https://www.kildaredoc.ie
```

The HTTP checker checks the actual page metadata and discovery file contents,
not just a 200 status that could be a fallback HTML response.

Live audit on 2026-10-04: `/robots.txt` returned 200 with `text/plain`,
`/sitemap.xml` returned 200 with `application/xml`, and `/llms.txt` returned
404. The additions in this checkout must be deployed before they are live.

## Google Analytics

The shared `index.html` head contains the Google tag for measurement ID
`G-YVVFSVJP08`. The build carries it into every prerendered page, including
the 404 page, exactly once.

For React Router navigation, enable **Enhanced measurement → Page views →
Page changes based on browser history events** in the Analytics web data stream.
Google's [recommended SPA measurement](https://developers.google.com/analytics/devguides/collection/ga4/single-page-applications)
uses these history changes. No additional manual page-view events are sent,
which avoids duplicating automatic tracking. After deployment, check page
loads and navigation in Analytics Realtime or DebugView.

## Things to review/replace before going live

- **Team names and roles** (`src/data/content.js` → `team`): confirm that the
  listed people, roles and clinical claims are accurate and approved.
- **Testimonials** (`src/data/content.js` → `testimonials`): confirm their
  source, accuracy and permission to publish. They are not used for rating schema.
- **Blog posts** are placeholder articles for layout purposes — the Blog page
  currently only lists posts (no individual article routes yet).
- **Contact form** submits client-side only right now (`ContactForm.jsx`) —
  wire the `handleSubmit` function to an email/CRM endpoint (e.g. Formspree,
  a serverless function, or your own API) before launch.
- **Phone / WhatsApp number**: both point to `085 867 8192` /
  `+353 85 867 8192` (`src/data/content.js`) — confirm this is the number you
  want live everywhere before deploying.

## Deploying

Deploy the static files in `dist/` after `npm run build`. No production Node
server is required. Configure the host to serve `/about`, `/blog` and `/contact`
from their respective `dist/<route>/index.html` files. A blanket SPA rewrite to
the homepage would replace their prerendered content and metadata. Serve all
`.txt`, `.md`, `.xml` and `/assets/` files directly with appropriate MIME types.
Use `dist/404.html` for missing pages with HTTP 404; it includes `noindex`.
The Vite preview includes middleware that serves the correct page HTML and
returns an actual 404 for missing paths. This local behavior does not configure
the production host; its routing must be checked separately after deployment.

Use HTTPS and redirect alternate hostnames and HTTP to the confirmed canonical
origin. Run the HTTP checker against the public site after deployment and
inspect redirects, unknown-page 404 responses, security/CDN bot access,
mobile layout and Core Web Vitals on the actual host.

For greater search and AI visibility, verify the site in Google Search Console
and Bing Webmaster Tools and submit the sitemap. Keep the clinic's Google
Business Profile details consistent with the site. Replace preview-only blog
cards with complete clinician-reviewed articles, author information, review
dates and real article URLs before adding Article schema or sitemap entries.
Monitor search impressions, relevant enquiries and AI referral traffic;
file availability alone does not measure visibility or patient conversions.
