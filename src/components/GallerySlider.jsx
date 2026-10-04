import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "./GallerySlider.css";

export default function GallerySlider({ slides }) {
  const [index, setIndex] = useState(0);
  const timer = useRef(null);

  const go = (i) => setIndex((i + slides.length) % slides.length);

  useEffect(() => {
    timer.current = setInterval(() => go(index + 1), 5500);
    return () => clearInterval(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  return (
    <div className="gallery-slider">
      <div
        className="gallery-slider__track"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {slides.map((slide, i) => (
          <figure className="gallery-slider__slide" key={i}>
            <img
              src={slide.src}
              alt={slide.alt}
              loading={i === 0 ? "eager" : "lazy"}
              style={slide.position ? { objectPosition: slide.position } : undefined}
            />
            <figcaption>
              <span className="eyebrow">{slide.eyebrow}</span>
              <p>{slide.caption}</p>
            </figcaption>
          </figure>
        ))}
      </div>

      <button
        className="gallery-slider__nav gallery-slider__nav--prev"
        onClick={() => go(index - 1)}
        aria-label="Previous image"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        className="gallery-slider__nav gallery-slider__nav--next"
        onClick={() => go(index + 1)}
        aria-label="Next image"
      >
        <ChevronRight size={20} />
      </button>

      <div className="gallery-slider__dots">
        {slides.map((_, i) => (
          <button
            key={i}
            className={i === index ? "is-active" : ""}
            onClick={() => go(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}