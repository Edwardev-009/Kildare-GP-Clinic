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
  robots.txt, sitemap.xml
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

- Every page sets its own `<title>`, meta description and canonical URL via
  the `Seo` component (`src/components/Seo.jsx`), so search engines and
  AI answer engines get distinct, accurate descriptions per page instead of
  one repeated title across the site.
- `index.html` carries a `MedicalClinic` JSON-LD schema (name, address,
  phone, opening hours) plus Open Graph / Twitter Card tags and a
  `social-preview.webp` share image.
- The homepage FAQ section also ships its own `FAQPage` JSON-LD — this is
  one of the stronger, evidence-backed levers for showing up in Google's
  AI Overview and being cited by ChatGPT/Perplexity/Copilot.
- `public/robots.txt` explicitly allows Googlebot, Bingbot and the major AI
  crawlers (GPTBot, PerplexityBot, ClaudeBot, etc.) alongside a sitemap
  reference; `public/sitemap.xml` lists all four pages.
- **Before launch**, swap `https://www.kildaredoc.ie` for the real live
  domain everywhere it appears (`index.html`, `src/components/Seo.jsx`,
  `public/robots.txt`, `public/sitemap.xml`) — right now it's a placeholder.
- Off-page SEO (Google Business Profile, backlinks, review generation) isn't
  something a static site file can do — happy to help set that up separately
  once the domain is live.

## Things to review/replace before going live

- **Team names** (`src/data/content.js` → `team`) are placeholders — swap in
  real staff names and roles.
- **Testimonials** (`src/data/content.js` → `testimonials`) are sample copy —
  replace with real patient quotes once you have permission to use them.
- **Blog posts** are placeholder articles for layout purposes — the Blog page
  currently only lists posts (no individual article routes yet).
- **Contact form** submits client-side only right now (`ContactForm.jsx`) —
  wire the `handleSubmit` function to an email/CRM endpoint (e.g. Formspree,
  a serverless function, or your own API) before launch.
- **Phone / WhatsApp number**: both now point to `085 85 678 192` /
  `+353 85 867 8192` (`src/data/content.js`) — confirm this is the number you
  want live everywhere before deploying.

## Deploying

Static build in `/dist` after `npm run build` — deploy to Vercel, Netlify, or
any static host. No environment variables or backend required as-is. Once
the real domain is live, update the placeholder URLs listed under SEO above
and resubmit `sitemap.xml` in Google Search Console.
