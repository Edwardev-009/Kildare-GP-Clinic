import { clinic, services, faqs, blogPosts, hoursSummary } from "./content.js";
import { SITE_URL, pages, markdownPath } from "./seo.js";
import { certificates, certificateSteps, certificateNotIncluded, certificateFaqs, CERTIFICATE_TURNAROUND } from "./certificates.js";

// Build these files from the same facts as the site rather than separate copies.
export function discoveryFiles() {
  const contact = [
    `- Address: ${clinic.address}, Ireland.`,
    `- Telephone: [${clinic.phone}](${clinic.phoneHref}).`,
    `- Email: [${clinic.email}](mailto:${clinic.email}).`,
    `- WhatsApp: [Contact the clinic](https://wa.me/${clinic.whatsappNumber}).`,
    `- Website: ${SITE_URL}/.`,
  ].join("\n");
  const serviceText = services.map((service) => `### ${service.title}\n\n${service.text}`).join("\n\n");
  const availability = `${hoursSummary} Contact the clinic to confirm current opening hours, waiting times and service availability before travelling.`;
  const certificateText = `# Medical certificates at Kildare Clinic\n\nSource: ${SITE_URL}/medical-certificate\n\nKildare Clinic offers medical certificates requested online and reviewed by Irish-registered GPs. Certificates are issued ${CERTIFICATE_TURNAROUND.toLowerCase()} and only where clinically appropriate.\n\n## Certificates and prices\n\n${certificates.map((cert) => `- ${cert.title}: €${cert.price}. ${cert.summary}`).join("\n")}\n\n## How it works\n\n${certificateSteps.map((step, i) => `${i + 1}. ${step.title}: ${step.text}`).join("\n")}\n\n## Not included\n\n${certificateNotIncluded.map((item) => `- ${item}`).join("\n")}\n\n## Questions\n\n${certificateFaqs.map((faq) => `**${faq.question}** ${faq.answer}`).join("\n\n")}\n`;
  const documents = {
    "/": `# Kildare Clinic\n\n> GP walk-in medical centre on Claregate Street in Kildare, Ireland.\n\nSource: ${SITE_URL}/\n\n## Contact and location\n\n${contact}\n\n## Services listed on the website\n\n${serviceText}\n\n## Plan a visit\n\nWalk in or call ahead. Register at the front desk, see the doctor and discuss the next steps for your care. ${availability}\n\n## Location question\n\n${faqs.find((faq) => faq.question === "Where is Kildare Clinic located?").answer}\n`,
    "/about": `# About Kildare Clinic\n\nSource: ${SITE_URL}/about\n\nKildare Clinic is a local GP walk-in practice on Claregate Street, Kildare. The website describes general practice, family healthcare, travel advice and ongoing support for long-term conditions.\n\n## Location and contact\n\n${contact}\n\n## Visiting the practice\n\nThe practice welcomes walk-in visits and also describes booked appointments for visits that benefit from planning ahead. ${availability}\n`,
    "/medical-certificate": certificateText,
    "/contact": `# Contact Kildare Clinic\n\nSource: ${SITE_URL}/contact\n\n${contact}\n\n## Opening hours and availability\n\n${availability}\n\n## Contact methods\n\nCall, email or WhatsApp the clinic directly. Email is listed for non-urgent queries. The contact page includes a location map.\n`,
    "/blog": `# Kildare Clinic health notes\n\nSource: ${SITE_URL}/blog\n\nThe blog page currently contains article titles and short previews. Full articles and individual article URLs are not available. These previews should not be presented as complete, medically reviewed guidance.\n\n## Preview topics\n\n${blogPosts.map((post) => `- ${post.title} (${post.tag}).`).join("\n")}\n`,
  };
  const links = pages.map((page) => `- [${page.label}](${SITE_URL}${markdownPath(page.path)}): ${page.description}`).join("\n");
  const llms = `# ${clinic.name}\n\n> GP walk-in medical centre on Claregate Street, Kildare, R51 P635, Ireland. The website lists general practice, family healthcare, travel advice and disease management.\n\nOfficial website: ${SITE_URL}/. Call ${clinic.phone} or email ${clinic.email} for clinic enquiries. Contact the clinic to confirm opening hours, waiting times and service availability before travelling.\n\nThe resources below are concise Markdown summaries of the public website. No individual medical advice, clinician qualifications or review ratings are asserted here. Medical certificate prices are listed on the medical certificate page.\n\n## Clinic information\n\n${links}\n\n## Optional\n\n- [Combined clinic information](${SITE_URL}/llms-full.txt): All Markdown summaries in a single file.\n- [XML sitemap](${SITE_URL}/sitemap.xml): Canonical public page URLs.\n- [Crawler access rules](${SITE_URL}/robots.txt): Public crawler permissions.\n`;
  const robots = `# Public pages and assets are available to search and AI crawlers.\n# Search access and model-training access are distinct; the current policy allows both.\n# llms.txt: ${SITE_URL}/llms.txt\n\n${["*", "Googlebot", "Bingbot", "OAI-SearchBot", "ChatGPT-User", "PerplexityBot", "Perplexity-User", "Claude-SearchBot", "Claude-User", "GPTBot", "ClaudeBot"].map((agent) => `User-agent: ${agent}\nAllow: /`).join("\n\n")}\n\nSitemap: ${SITE_URL}/sitemap.xml\n`;
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map((page) => `  <url><loc>${SITE_URL}${page.path}</loc></url>`).join("\n")}\n</urlset>\n`;
  return {
    "robots.txt": robots,
    "sitemap.xml": sitemap,
    "llms.txt": llms,
    "llms-full.txt": `${Object.values(documents).join("\n\n---\n\n")}\n`,
    ...Object.fromEntries(pages.map((page) => [markdownPath(page.path).slice(1), documents[page.path]])),
  };
}
