import { useState, useEffect, useRef } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import "./TestimonialSlider.css";

function GoogleLogo({ size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

const perView = () => {
  if (typeof window === "undefined") return 1;
  if (window.innerWidth >= 1100) return 3;
  if (window.innerWidth >= 720) return 2;
  return 1;
};

export default function TestimonialSlider({ items }) {
  const [index, setIndex] = useState(0);
  const [per, setPer] = useState(perView);
  const timer = useRef(null);

  const maxIndex = Math.max(0, items.length - per);
  const go = (i) => setIndex(i > maxIndex ? 0 : i < 0 ? maxIndex : i);

  useEffect(() => {
    const onResize = () => setPer(perView());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (index > maxIndex) setIndex(maxIndex);
  }, [maxIndex, index]);

  useEffect(() => {
    timer.current = setInterval(() => go(index + 1), 7000);
    return () => clearInterval(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, per]);

  return (
    <div className="greviews">
      <div className="greviews__badge">
        <GoogleLogo size={26} />
        <span>Google Reviews</span>
      </div>

      <div className="greviews__viewport">
        <div
          className="greviews__track"
          style={{ transform: `translateX(-${index * (100 / per)}%)` }}
        >
          {items.map((item, i) => (
            <div
              className="greviews__slide"
              style={{ flexBasis: `${100 / per}%` }}
              key={i}
            >
              <article className="greviews__card">
                <header className="greviews__head">
                  <span className="greviews__avatar" aria-hidden="true">
                    {item.name.charAt(0)}
                  </span>
                  <div className="greviews__who">
                    <h3>{item.name}</h3>
                    <span>Google review</span>
                  </div>
                  <GoogleLogo size={22} />
                </header>
                <div className="greviews__stars" aria-label="5 out of 5 stars">
                  {[0, 1, 2, 3, 4].map((n) => (
                    <Star key={n} size={17} fill="currentColor" strokeWidth={0} />
                  ))}
                </div>
                <p className="greviews__text">{item.text}</p>
              </article>
            </div>
          ))}
        </div>
      </div>

      <div className="greviews__controls">
        <button onClick={() => go(index - 1)} aria-label="Previous reviews">
          <ChevronLeft size={18} />
        </button>
        <div className="greviews__dots">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              className={i === index ? "is-active" : ""}
              onClick={() => go(i)}
              aria-label={`Go to reviews ${i + 1}`}
            />
          ))}
        </div>
        <button onClick={() => go(index + 1)} aria-label="Next reviews">
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}