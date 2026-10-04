import PageHeader from "../components/PageHeader.jsx";
import Seo from "../components/Seo.jsx";
import { blogPosts } from "../data/content.js";
import "./Blog.css";

export default function Blog() {
  const [featured, ...rest] = blogPosts;

  return (
    <>
      <Seo path="/blog" />
      <PageHeader
        eyebrow="From the clinic"
        title="Health notes from the Kildare Clinic team"
        lede="Browse short previews of topics including seasonal care, family health and living with a long-term condition."
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
