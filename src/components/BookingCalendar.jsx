import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  BOOKING_WINDOW_DAYS,
  addDays,
  firstBookableDate,
  formatDateLong,
  isBookable,
  monthStart,
  sameDay,
} from "../data/appointments.js";

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Month calendar. Only days when the clinic is open for the chosen shift (and within the
// booking window) can be selected; everything else is disabled.
export default function BookingCalendar({ shift, clock, selected, onSelect }) {
  const { today } = clock;
  const firstMonth = monthStart(today);
  const lastMonth = monthStart(addDays(today, BOOKING_WINDOW_DAYS));
  const [view, setView] = useState(() => monthStart(firstBookableDate(shift, clock) ?? today));

  const year = view.getFullYear();
  const month = view.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingBlanks = (new Date(year, month, 1).getDay() + 6) % 7; // week starts on Monday
  const cells = [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ];

  const monthLabel = view.toLocaleDateString("en-IE", { month: "long", year: "numeric" });

  return (
    <div className="booking-cal">
      <div className="booking-cal__head">
        <button
          type="button"
          className="booking-cal__nav"
          onClick={() => setView(new Date(year, month - 1, 1))}
          disabled={view <= firstMonth}
          aria-label="Previous month"
        >
          <ChevronLeft size={18} />
        </button>
        <strong aria-live="polite">{monthLabel}</strong>
        <button
          type="button"
          className="booking-cal__nav"
          onClick={() => setView(new Date(year, month + 1, 1))}
          disabled={view >= lastMonth}
          aria-label="Next month"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="booking-cal__grid">
        {WEEKDAY_LABELS.map((d) => (
          <span key={d} className="booking-cal__weekday" aria-hidden="true">
            {d}
          </span>
        ))}
        {cells.map((date, i) => {
          if (!date) return <span key={`blank-${i}`} />;
          const available = isBookable(date, shift, clock);
          const isSelected = selected && sameDay(date, selected);
          return (
            <button
              key={date.getDate()}
              type="button"
              className={`booking-cal__day${available ? " is-available" : ""}${isSelected ? " is-selected" : ""}${sameDay(date, today) ? " is-today" : ""}`}
              disabled={!available}
              aria-pressed={isSelected || false}
              aria-label={formatDateLong(date)}
              onClick={() => onSelect(date)}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
      <p className="booking-cal__hint">
        Highlighted days are available, from today up to {BOOKING_WINDOW_DAYS} days ahead. Times are Irish time.
      </p>
    </div>
  );
}