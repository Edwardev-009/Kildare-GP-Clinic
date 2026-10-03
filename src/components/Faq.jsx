import { ChevronDown } from "lucide-react";
import "./Faq.css";

export default function Faq({ items }) {
  return (
    <div className="faq">
      {items.map((item) => (
        <details className="faq__item" key={item.question}>
          <summary>
            <span>{item.question}</span>
            <ChevronDown size={18} className="faq__chevron" />
          </summary>
          <p>{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
