import { useState, useEffect, useRef } from "react";
import { Quote, ChevronLeft, ChevronRight } from "lucide-react";
import "./TestimonialSlider.css";

export default function TestimonialSlider({ items }) {
  const [index, setIndex] = useState(0);
  const timer = useRef(null);

  const go = (i) => setIndex((i + items.length) % items.length);

  useEffect(() => {
    timer.current = setInterval(() => go(index + 1), 6000);
    return () => clearInterval(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  return (
    <div className="testimonial-slider">
      <Quote className="testimonial-slider__mark" size={54} strokeWidth={1.4} />
      <div className="testimonial-slider__viewport">
        <div
          className="testimonial-slider__track"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {items.map((item, i) => (
            <div className="testimonial-slider__slide" key={i}>
              <p className="testimonial-slider__quote">&ldquo;{item.quote}&rdquo;</p>
              <p className="testimonial-slider__name">
                {item.name} <span>({item.detail})</span>
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="testimonial-slider__controls">
        <button onClick={() => go(index - 1)} aria-label="Previous testimonial">
          <ChevronLeft size={18} />
        </button>
        <div className="testimonial-slider__dots">
          {items.map((_, i) => (
            <button
              key={i}
              className={i === index ? "is-active" : ""}
              onClick={() => go(i)}
              aria-label={`Go to testimonial ${i + 1}`}
            />
          ))}
        </div>
        <button onClick={() => go(index + 1)} aria-label="Next testimonial">
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
