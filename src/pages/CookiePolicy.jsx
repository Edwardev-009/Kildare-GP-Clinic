import PageHeader from "../components/PageHeader.jsx";
import Seo from "../components/Seo.jsx";
import { useCookieConsent } from "../lib/cookie-context.js";
import { clinic } from "../data/content.js";
import "./CookiePolicy.css";

export default function CookiePolicy() {
  const { openSettings } = useCookieConsent();

  return (
    <>
      <Seo path="/cookies" />
      <PageHeader
        eyebrow="Your website choices"
        title="Cookies and browser storage"
        lede="Choose whether to allow Google Analytics and the Google Maps embed. You can use the clinic website with both switched off."
      />
      <section className="section">
        <div className="container cookie-policy">
          <p className="cookie-policy__updated">Last updated: 8 October 2026</p>

          <section>
            <h2>Choose what loads</h2>
            <p>
              Analytics and maps are optional and start switched off. The cookie banner lets you
              reject both, accept both or choose them separately. Closing preferences without saving
              does not give consent. Your choice is remembered on this browser for 180 days, after
              which we ask again. Clearing your browser data can remove your choice sooner.
              If browser storage is blocked, your choice applies only to the current page session.
            </p>
            <p>
              You can change your choice at any time using Cookie settings in the footer or the
              button below. Rejecting optional services does not stop you reading our pages or
              using the clinic contact details.
            </p>
            <button className="btn btn-primary" type="button" onClick={openSettings}>
              Cookie settings
            </button>
          </section>

          <section>
            <h2>What is stored</h2>
            <p>
              Cookies are small files saved by your browser. Local storage is another way to
              remember information on your device. We use local storage to remember your cookie
              choices and load the optional services only when you allow them.
            </p>
            <div className="cookie-policy__table-wrap">
              <table>
                <caption>Website storage and optional services</caption>
                <thead>
                  <tr>
                    <th scope="col">Name or service</th>
                    <th scope="col">Purpose and provider</th>
                    <th scope="col">Duration</th>
                    <th scope="col">Your choice</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row"><code>kildare_cookie_preferences</code></th>
                    <td>Kildare Clinic local storage remembers your analytics and map choices and when you saved them.</td>
                    <td>The choice is valid for 180 days. The browser entry remains until cleared, updated or removed by the website.</td>
                    <td>Necessary to remember and apply your choice; saved when you choose.</td>
                  </tr>
                  <tr>
                    <th scope="row"><code>_ga</code> and <code>_ga_*</code></th>
                    <td>Google Analytics cookies help distinguish visits and measure website use.</td>
                    <td>Up to 180 days from creation. This website disables automatic cookie-expiry updates.</td>
                    <td>Optional: Analytics.</td>
                  </tr>
                  <tr>
                    <th scope="row">Google Maps embed</th>
                    <td>Google displays the clinic location. Its embed may use Google cookies or other browser storage.</td>
                    <td>Cookie names and durations depend on Google, your Google account and browser settings. See Google’s cookie information below.</td>
                    <td>Optional: Maps.</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              The Google cookie reference describes cookies across Google services; it is not a
              claim that every cookie in that reference is used by this website. Browser settings
              can also limit or block cookies from these services.
            </p>
          </section>

          <section>
            <h2>What allowing a service means</h2>
            <p>
              Allowing analytics loads Google Analytics and sends website usage and browser/device
              information to Google. Allowing maps loads a Google frame, which sends your IP address
              and browser information to Google to display the map. These services can process
              information outside Ireland. See <a href="https://policies.google.com/privacy">Google’s Privacy Policy</a> for
              its processing and your Google privacy controls.
            </p>
            <p>
              Google Fonts is used to display the website’s fonts and still makes requests to
              Google when optional services are rejected. Ordinary links to Google Maps or WhatsApp
              open those providers only when you follow the link; their own privacy and cookie
              settings then apply.
            </p>
          </section>

          <section>
            <h2>Changing or withdrawing your choice</h2>
            <p>
              Turn a service off in Cookie settings and save. The embedded maps are removed when
              maps is turned off. If analytics has already started loading, the website clears Google
              Analytics cookies it can access on this site and reloads the page to stop the loaded
              tag. The reload may discard unsent form entries.
            </p>
            <p>
              This website cannot clear cookies belonging to Google’s own domains or undo data
              already sent while a service was allowed. You can manage those cookies in your
              browser and review <a href="https://myaccount.google.com/data-and-privacy">your Google privacy controls</a>.
            </p>
          </section>

          <section>
            <h2>Further information</h2>
            <ul>
              <li><a href="https://policies.google.com/technologies/cookies">How Google uses cookies</a></li>
              <li><a href="https://developers.google.com/tag-platform/security/concepts/cookies">Google tag cookies and user identification</a></li>
              <li><a href="https://developers.google.com/tag-platform/security/guides/customize-cookies">Google Analytics cookie expiry settings</a></li>
              <li><a href="https://www.dataprotection.ie/sites/default/files/uploads/2020-04/Guidance%20note%20on%20cookies%20and%20other%20tracking%20technologies.pdf">Irish Data Protection Commission cookie guidance (PDF)</a></li>
            </ul>
            <p>For website cookie questions, contact <a href={`mailto:${clinic.email}`}>{clinic.email}</a>.</p>
          </section>
        </div>
      </section>
    </>
  );
}
