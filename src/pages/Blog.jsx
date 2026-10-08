import PageHeader from "../components/PageHeader.jsx";
import Seo from "../components/Seo.jsx";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { blogPosts } from "../data/content.js";
import { physioArticle } from "../data/physio.js";
import "./Blog.css";

export default function Blog() {
  const featured = physioArticle;

  return (
    <>
      <Seo path="/blog" />
      <PageHeader
        eyebrow="From the clinic"
        title="Health notes from the Kildare Clinic team"
        lede="Read our guide to your first physiotherapy appointment in Kildare, and browse health note previews on seasonal care, family health and long-term conditions."
      />

      <section className="section">
        <div className="container">
          <article className="blog-featured">
            <div className="blog-featured__body">
              <span className="blog-tag">{featured.tag}</span>
              <h2>{featured.title}</h2>
              <p>{featured.excerpt}</p>
              <div className="blog-meta">
                <time dateTime={featured.datePublished}>{featured.date}</time>
              </div>
              <Link className="blog-read-more" to={featured.path}>Read the first physio appointment guide <ArrowRight size={16} /></Link>
            </div>
          </article>

          <div className="blog-grid">
            {blogPosts.map((post) => (
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
