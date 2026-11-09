import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatDateLong } from "../lib/booking.js";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const pad = (n) => String(n).padStart(2, "0");
const monthOf = (s) => ({ y: Number(s.slice(0, 4)), m: Number(s.slice(5, 7)) - 1 });
const shiftMonth = ({ y, m }, n) => {
  const t = new Date(Date.UTC(y, m + n, 1));
  return { y: t.getUTCFullYear(), m: t.getUTCMonth() };
};
const monthIndex = ({ y, m }) => y * 12 + m;

// Month calendar driven by the doctors' availability. Dates are plain "YYYY-MM-DD" strings (Irish dates).
// `available` is a Set of the dates that can be picked; everything else is disabled.
export default function AvailabilityCalendar({ today, lastDate, available, selected, onSelect }) {
  const first = useMemo(() => [...available].sort()[0] || today, [available, today]);
  const [view, setView] = useState(() => monthOf(first));
  const min = monthOf(today);
  const max = monthOf(lastDate);

  const daysInMonth = new Date(Date.UTC(view.y, view.m + 1, 0)).getUTCDate();
  const blanks = (new Date(Date.UTC(view.y, view.m, 1)).getUTCDay() + 6) % 7; // week starts on Monday
  const cells = [
    ...Array.from({ length: blanks }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => `${view.y}-${pad(view.m + 1)}-${pad(i + 1)}`),
  ];
  const label = new Date(Date.UTC(view.y, view.m, 1)).toLocaleDateString("en-IE", { month: "long", year: "numeric", timeZone: "UTC" });

  return (
    <div className="booking-cal">
      <div className="booking-cal__head">
        <button type="button" className="booking-cal__nav" onClick={() => setView(shiftMonth(view, -1))} disabled={monthIndex(view) <= monthIndex(min)} aria-label="Previous month">
          <ChevronLeft size={18} />
        </button>
        <strong aria-live="polite">{label}</strong>
        <button type="button" className="booking-cal__nav" onClick={() => setView(shiftMonth(view, 1))} disabled={monthIndex(view) >= monthIndex(max)} aria-label="Next month">
          <ChevronRight size={18} />
        </button>
      </div>
      <div className="booking-cal__grid">
        {WEEKDAYS.map((d) => (
          <span key={d} className="booking-cal__weekday" aria-hidden="true">{d}</span>
        ))}
        {cells.map((date, i) => {
          if (!date) return <span key={`b${i}`} />;
          const ok = available.has(date);
          const isSelected = selected === date;
          return (
            <button
              key={date}
              type="button"
              className={`booking-cal__day${ok ? " is-available" : ""}${isSelected ? " is-selected" : ""}${date === today ? " is-today" : ""}`}
              disabled={!ok}
              aria-pressed={isSelected}
              aria-label={formatDateLong(date)}
              onClick={() => onSelect(date)}
            >
              {Number(date.slice(8))}
            </button>
          );
        })}
      </div>
      <p className="booking-cal__hint">Highlighted days have appointments available. Times are Irish time.</p>
    </div>
  );
}
