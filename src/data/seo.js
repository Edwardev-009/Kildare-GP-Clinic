import { clinic, faqs, services, openingSchedule } from "./content.js";
import { certificates, certificateFaqs, CERTIFICATE_TURNAROUND } from "./certificates.js";
import { physioPath, physioDescription, physioFaqs, physioArticle } from "./physio.js";

export const SITE_URL = `https://${clinic.website}`;
export const ROBOTS = "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";

export const pages = [
  {
    path: "/",
    label: "Home",
    title: "Kildare GP – Walk-In Doctor in Kildare Town",
    description: "Looking for a GP in Kildare? Visit Kildare Clinic on Claregate Street for walk-in GP care, family healthcare and physio appointments. Call 085 867 8192.",
    type: "WebPage",
  },
  {
    path: "/about",
    label: "About",
    title: "Our GP & Physiotherapy Team in Kildare",
    description: "Learn about Kildare Clinic, a walk-in GP practice on Claregate Street, Kildare, and its approach to healthcare for the local community.",
    type: "AboutPage",
  },
  {
    path: "/blog",
    label: "Health Notes",
    title: "Health Notes & Blog",
    description: "Read Kildare Clinic's first physio appointment guide and browse health note previews on family health, seasonal care and long-term conditions.",
    type: "CollectionPage",
  },
  {
    path: physioPath,
    label: "Physiotherapy",
    title: "Kildare Physio – Physiotherapy in Kildare Town",
    description: physioDescription,
    type: "WebPage",
  },
  {
    path: physioArticle.path,
    label: "First physio appointment",
    title: physioArticle.title,
    description: physioArticle.description,
    type: "WebPage",
    article: physioArticle,
    lastModified: physioArticle.datePublished,
  },
  {
    path: "/medical-certificate",
    label: "Medical Certificate",
    title: "Online Medical Certificate in Ireland",
    description: "Request a sick, unfit for travel, fit to travel or return-to-work medical certificate from Irish-registered GPs at Kildare Clinic. From €30, issued within 5 hours.",
    type: "WebPage",
  },
  {
    path: "/contact",
    label: "Contact",
    title: "Contact Our Kildare GP & Physio Clinic",
    description: "Contact Kildare Clinic on Claregate Street, Kildare, R51 P635. Call 085 867 8192, email or WhatsApp the practice. Find contact details, opening hours and a location map.",
    type: "ContactPage",
  },
  {
    path: "/cookies",
    label: "Cookies",
    title: "Cookies and Browser Storage",
    description: "Learn about Kildare Clinic’s cookie choices, optional Google Analytics and Maps, browser storage and how to change or withdraw your choice.",
    type: "WebPage",
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
      areaServed: { "@type": "City", name: "Kildare Town" },
      sameAs: ["https://www.instagram.com/kildaregp/", "https://www.facebook.com/profile.php?id=61594213060923"],
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
      ...(page.article ? { mainEntity: { "@id": `${url}#article` } } : {}),
      ...(page.path !== "/" ? { breadcrumb: { "@id": `${url}#breadcrumb` } } : {}),
    },
  ];
  if (page.path !== "/") {
    graph.push({
      "@type": "BreadcrumbList",
      "@id": `${url}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
        ...(page.article ? [{ "@type": "ListItem", position: 2, name: "Health notes", item: `${SITE_URL}/blog` }] : []),
        { "@type": "ListItem", position: page.article ? 3 : 2, name: page.label, item: url },
      ],
    });
  }
  if (page.path === physioPath) {
    graph.push(
      {
        "@type": "Service",
        "@id": `${url}#service`,
        name: "Physiotherapy in Kildare Town",
        serviceType: "Physiotherapy",
        description: physioDescription,
        url,
        provider: { "@id": clinicId },
        areaServed: { "@type": "City", name: "Kildare Town" },
        mainEntityOfPage: { "@id": pageId },
      },
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        isPartOf: { "@id": pageId },
        mainEntity: physioFaqs.map((faq) => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })),
      },
    );
  }
  if (page.article) {
    graph.push({
      "@type": "BlogPosting",
      "@id": `${url}#article`,
      url,
      headline: page.article.title,
      description: page.article.description,
      datePublished: page.article.datePublished,
      dateModified: page.lastModified,
      author: { "@type": "Organization", "@id": clinicId, name: clinic.name, url: `${SITE_URL}/about` },
      publisher: { "@id": clinicId },
      mainEntityOfPage: { "@id": pageId },
      isPartOf: { "@id": `${SITE_URL}/blog#webpage` },
      image: `${SITE_URL}/social-preview.webp`,
      inLanguage: "en-IE",
      citation: page.article.sources.map((source) => source.url),
    });
  }
  if (page.path === "/medical-certificate") {
    graph.push(
      {
        "@type": "OfferCatalog",
        "@id": `${url}#certificates`,
        name: "Medical certificates",
        isPartOf: { "@id": pageId },
        itemListElement: certificates.map((cert) => ({
          "@type": "Offer",
          price: String(cert.price),
          priceCurrency: "EUR",
          description: `${cert.summary} Issued ${CERTIFICATE_TURNAROUND.toLowerCase()}.`,
          itemOffered: {
            "@type": "Service",
            name: cert.title,
            provider: { "@id": clinicId },
          },
        })),
      },
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        isPartOf: { "@id": pageId },
        mainEntity: certificateFaqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      },
    );
  }
  if (page.path === "/") {
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
