import { clinic, faqs, services, openingSchedule } from "./content.js";

export const SITE_URL = `https://${clinic.website}`;
export const ROBOTS = "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";

export const pages = [
  {
    path: "/",
    label: "Home",
    title: "GP Walk-In Medical Centre in Kildare",
    description: "Kildare Clinic is a walk-in GP practice on Claregate Street, Kildare. General practice, family healthcare, travel advice and chronic disease management. Contact the clinic to plan your visit.",
    type: "WebPage",
  },
  {
    path: "/about",
    label: "About",
    title: "About Us",
    description: "Learn about Kildare Clinic, a walk-in GP practice on Claregate Street, Kildare, and its approach to healthcare for the local community.",
    type: "AboutPage",
  },
  {
    path: "/blog",
    label: "Health Notes",
    title: "Health Notes & Blog",
    description: "Browse health note previews from Kildare Clinic on seasonal health, travel health, family health and long-term conditions.",
    type: "CollectionPage",
  },
  {
    path: "/contact",
    label: "Contact",
    title: "Contact",
    description: "Contact Kildare Clinic on Claregate Street, Kildare, R51 P635. Call 085 867 8192, email or WhatsApp the practice. Find contact details, opening hours and a location map.",
    type: "ContactPage",
  },
];

export function pageSeo(path) {
  return pages.find((page) => page.path === path);
}

export function structuredData(page) {
  const url = `${SITE_URL}${page.path}`;
  const clinicId = `${SITE_URL}/#clinic`;
  const websiteId = `${SITE_URL}/#website`;
  const pageId = `${url}#webpage`;
  const graph = [
    {
      "@type": "MedicalClinic",
      "@id": clinicId,
      name: clinic.name,
      alternateName: "Kildare Clinic GP Walk-In Medical Centre",
      url: `${SITE_URL}/`,
      telephone: clinic.phoneHref.replace("tel:", ""),
      email: clinic.email,
      image: `${SITE_URL}/social-preview.webp`,
      address: {
        "@type": "PostalAddress",
        ...clinic.structuredAddress,
      },
      openingHoursSpecification: openingSchedule.flatMap(({ day, sessions }) =>
        (sessions.length ? sessions : [{ opens: "00:00", closes: "00:00" }]).map((session) => ({
          "@type": "OpeningHoursSpecification",
          dayOfWeek: `https://schema.org/${day}`,
          ...session,
        })),
      ),
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Clinic services",
        itemListElement: services.map((service) => ({
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: service.title,
            description: service.text,
            provider: { "@id": clinicId },
          },
        })),
      },
    },
    {
      "@type": "WebSite",
      "@id": websiteId,
      url: `${SITE_URL}/`,
      name: clinic.name,
      publisher: { "@id": clinicId },
      inLanguage: "en-IE",
    },
    {
      "@type": page.type,
      "@id": pageId,
      url,
      name: `${page.title} | ${clinic.name}`,
      description: page.description,
      isPartOf: { "@id": websiteId },
      about: { "@id": clinicId },
      inLanguage: "en-IE",
      ...(page.path !== "/" ? { breadcrumb: { "@id": `${url}#breadcrumb` } } : {}),
    },
  ];
  if (page.path !== "/") {
    graph.push({
      "@type": "BreadcrumbList",
      "@id": `${url}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: page.label, item: url },
      ],
    });
  } else {
    graph.push({
      "@type": "FAQPage",
      "@id": `${SITE_URL}/#faq`,
      isPartOf: { "@id": pageId },
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
      })),
    });
  }
  return { "@context": "https://schema.org", "@graph": graph };
}

export function markdownPath(path) {
  return path === "/" ? "/index.md" : `${path}.md`;
}
