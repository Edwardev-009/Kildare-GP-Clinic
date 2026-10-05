import { Helmet } from "react-helmet-async";
import { clinic } from "../data/content.js";
import { SITE_URL, ROBOTS, pageSeo, structuredData, markdownPath } from "../data/seo.js";

const SITE_NAME = clinic.name;
const DEFAULT_IMAGE = `${SITE_URL}/social-preview.webp`;

export default function Seo({ path = "/" }) {
  const page = pageSeo(path);
  if (!page) {
    return (
      <Helmet>
        <title>Page not found | {SITE_NAME}</title>
        <meta name="robots" content="noindex, follow" />
      </Helmet>
    );
  }
  const { title, description } = page;
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | GP Walk-In Medical Centre, Kildare`;
  const url = `${SITE_URL}${path}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={ROBOTS} />
      <link rel="canonical" href={url} />
      <link rel="describedby" type="text/plain" href={`${SITE_URL}/llms.txt`} />
      <link rel="alternate" type="text/markdown" href={`${SITE_URL}${markdownPath(path)}`} />

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={DEFAULT_IMAGE} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_IE" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={DEFAULT_IMAGE} />

      <script type="application/ld+json">{JSON.stringify(structuredData(page)).replace(/</g, "\\u003c")}</script>
    </Helmet>
  );
}
