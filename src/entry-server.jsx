// This build-only module exports functions, rather than Fast Refresh components.
/* eslint-disable react/only-export-components */
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.jsx";

export { pages, SITE_URL, markdownPath } from "./data/seo.js";
export { discoveryFiles } from "./data/discovery.js";

// React 19 hoists the page's title, meta and link elements into this head.
// Vite's compiled scripts, styles and shared head elements are inserted later.
export function render(path) {
  return renderToString(
    <html lang="en-IE">
      <head />
      <body>
        <div id="root" data-prerendered="true">
          <HelmetProvider>
            <StaticRouter location={path}>
              <App />
            </StaticRouter>
          </HelmetProvider>
        </div>
      </body>
    </html>,
  );
}
