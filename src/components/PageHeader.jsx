import "./PageHeader.css";

export default function PageHeader({ eyebrow, title, lede }) {
  return (
    <section className="page-header">
      <div className="container page-header__inner">
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        {lede && <p>{lede}</p>}
      </div>
    </section>
  );
}
