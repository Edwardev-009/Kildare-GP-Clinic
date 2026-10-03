import { ArrowUpRight } from "lucide-react";
import PageHeader from "../components/PageHeader.jsx";
import Seo from "../components/Seo.jsx";
import { blogPosts } from "../data/content.js";
import "./Blog.css";

export default function Blog() {
  const [featured, ...rest] = blogPosts;

  return (
    <>
      <Seo
        title="Health Notes & Blog"
        description="Practical health articles from Kildare Clinic — seasonal care, travel vaccinations, chronic condition management and family health tips from our GP team."
        path="/blog"
      />
      <PageHeader
        eyebrow="From the clinic"
        title="Health notes from the Kildare Clinic team"
        lede="Short, practical reads on the health topics our patients ask about most — seasonal care, family health and living well with a long-term condition."
      />

      <section className="section">
        <div className="container">
          <article className="blog-featured">
            <div className="blog-featured__body">
              <span className="blog-tag">{featured.tag}</span>
              <h2>{featured.title}</h2>
              <p>{featured.excerpt}</p>
              <div className="blog-meta">
                <span>{featured.date}</span>
                <span className="blog-meta__divider" />
                <span>{featured.readTime}</span>
              </div>
              <a className="blog-read-more" href="#">
                Read the full article <ArrowUpRight size={16} />
              </a>
            </div>
          </article>

          <div className="blog-grid">
            {rest.map((post) => (
              <article className="blog-card" key={post.title}>
                <span className="blog-tag">{post.tag}</span>
                <h3>{post.title}</h3>
                <p>{post.excerpt}</p>
                <div className="blog-meta">
                  <span>{post.date}</span>
                  <span className="blog-meta__divider" />
                  <span>{post.readTime}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
