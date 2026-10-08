import { Routes, Route, Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import WhatsAppFab from "./components/WhatsAppFab.jsx";
import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";
import Blog from "./pages/Blog.jsx";
import Contact from "./pages/Contact.jsx";
import MedicalCertificate from "./pages/MedicalCertificate.jsx";
import Seo from "./components/Seo.jsx";
import PageHeader from "./components/PageHeader.jsx";

function NotFound() {
  return (
    <>
      <Seo path="/404" />
      <PageHeader eyebrow="404" title="Page not found" lede="The page you're looking for is unavailable." />
      <section className="section container"><Link className="btn btn-primary" to="/">Return to the home page</Link></section>
    </>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
      <ScrollToTop />
      <Header />
      <main id="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/medical-certificate" element={<MedicalCertificate />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <WhatsAppFab />
    </>
  );
}
