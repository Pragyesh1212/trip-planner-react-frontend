import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";

const toISO = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const fromISO = (value) => {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const sameDay = (a, b) =>
  Boolean(a && b) &&
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const monthLabel = (date) =>
  date.toLocaleDateString("en-US", { month: "long", year: "numeric" });

function CalendarMonth({ month, start, end, onSelect }) {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstDay = new Date(year, monthIndex, 1);
  const offset = firstDay.getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const today = new Date();
  const cells = [
    ...Array.from({ length: offset }, (_, i) => ({ key: `empty-${i}`, empty: true })),
    ...Array.from({ length: daysInMonth }, (_, i) => ({
      key: `${year}-${monthIndex}-${i + 1}`,
      date: new Date(year, monthIndex, i + 1),
    })),
  ];
  while (cells.length % 7) cells.push({ key: `end-${cells.length}`, empty: true });

  return (
    <div className="planner-calendar-month">
      <h3>{monthLabel(month)}</h3>
      <div className="planner-calendar-weekdays">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
      <div className="planner-calendar-days">
        {cells.map((cell) => {
          if (cell.empty) return <span className="planner-calendar-empty" key={cell.key} />;
          const date = cell.date;
          const value = toISO(date);
          const isPast = toISO(date) < toISO(today);
          const isStart = sameDay(date, start);
          const isEnd = sameDay(date, end);
          const inRange = start && end && date > start && date < end;
          return (
            <button
              type="button"
              key={cell.key}
              disabled={isPast}
              className={[
                "planner-calendar-day",
                isStart || isEnd ? "is-selected" : "",
                inRange ? "is-in-range" : "",
                sameDay(date, today) ? "is-today" : "",
              ].filter(Boolean).join(" ")}
              aria-label={date.toLocaleDateString()}
              aria-pressed={isStart || isEnd}
              onClick={() => onSelect(value)}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function TravelDatePicker({ startDate, setStartDate, endDate, setEndDate, autoOpen = false, onDatesUpdated }) {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(() => {
    const selected = fromISO(startDate) || new Date();
    return new Date(selected.getFullYear(), selected.getMonth(), 1);
  });
  const [draftStart, setDraftStart] = useState(startDate || "");
  const [draftEnd, setDraftEnd] = useState(endDate || "");
  const [mode, setMode] = useState("dates");

  // Automatically open the calendar when the assistant asks the user to choose dates.
  useEffect(() => {
    if (autoOpen) setOpen(true);
  }, [autoOpen]);

  useEffect(() => {
    if (open) {
      setDraftStart(startDate || "");
      setDraftEnd(endDate || "");
      const selected = fromISO(startDate) || new Date();
      setMonth(new Date(selected.getFullYear(), selected.getMonth(), 1));
    }
  }, [open, startDate, endDate]);

  const start = useMemo(() => fromISO(draftStart), [draftStart]);
  const end = useMemo(() => fromISO(draftEnd), [draftEnd]);
  const secondMonth = useMemo(
    () => new Date(month.getFullYear(), month.getMonth() + 1, 1),
    [month]
  );

  const selectDate = (value) => {
    if (!draftStart || (draftStart && draftEnd)) {
      setDraftStart(value);
      setDraftEnd("");
      setMode("dates");
      return;
    }
    if (value < draftStart) {
      setDraftStart(value);
      setDraftEnd("");
    } else {
      setDraftEnd(value);
    }
  };

  const updateDates = () => {
    // Pass the current draft values directly to the parent. React state setters
    // do not update the parent's state synchronously, so relying on startDate /
    // endDate immediately after setStartDate / setEndDate can send stale values.
    const selectedStartDate = mode === "flexible" ? "" : draftStart;
    const selectedEndDate = mode === "flexible" ? "" : draftEnd;

    setStartDate(selectedStartDate);
    setEndDate(selectedEndDate);
    setOpen(false);
    onDatesUpdated?.({
      startDate: selectedStartDate,
      endDate: selectedEndDate,
      flexible: mode === "flexible",
    });
  };

  const formatDate = (value) => {
    const date = fromISO(value);
    return date
      ? date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
      : "Select dates";
  };

  return (
    <>
      <div className="planner-date-controls">
        <button type="button" className="planner-date-open-button" onClick={() => setOpen(true)}>
          <CalendarDays size={16} />
          <span>{mode === "flexible" ? "Flexible dates" : startDate && endDate ? `${formatDate(startDate)} – ${formatDate(endDate)}` : startDate ? `${formatDate(startDate)} – Return date` : "Choose travel dates"}</span>
          <ChevronRight size={15} />
        </button>
      </div>

      {open && (
        <div
          className="planner-calendar-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <section className="planner-calendar-modal" role="dialog" aria-modal="true" aria-labelledby="planner-calendar-title">
            <button className="planner-calendar-close" type="button" onClick={() => setOpen(false)} aria-label="Close calendar">
              <X size={20} />
            </button>
            <header className="planner-calendar-header">
              <h2 id="planner-calendar-title">When</h2>
              <div className="planner-calendar-mode">
                <button type="button" className={mode === "dates" ? "is-active" : ""} onClick={() => setMode("dates")}>Dates</button>
                <button type="button" className={mode === "flexible" ? "is-active" : ""} onClick={() => setMode("flexible")}>Flexible</button>
              </div>
            </header>

            {mode === "dates" ? (
              <>
                <div className="planner-calendar-navigation">
                  <button type="button" aria-label="Previous month" onClick={() => setMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))}>
                    <ChevronLeft size={21} />
                  </button>
                  <div className="planner-calendar-month-titles">
                    <strong>{monthLabel(month)}</strong>
                    <strong>{monthLabel(secondMonth)}</strong>
                  </div>
                  <button type="button" aria-label="Next month" onClick={() => setMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))}>
                    <ChevronRight size={21} />
                  </button>
                </div>
                <div className="planner-calendar-two-months">
                  <CalendarMonth month={month} start={start} end={end} onSelect={selectDate} />
                  <CalendarMonth month={secondMonth} start={start} end={end} onSelect={selectDate} />
                </div>
                <div className="planner-calendar-selection">
                  <div><span>Departure</span><strong>{formatDate(draftStart)}</strong></div>
                  <ArrowRight size={16} />
                  <div><span>Return</span><strong>{formatDate(draftEnd)}</strong></div>
                </div>
              </>
            ) : (
              <div className="planner-calendar-flexible">
                <CalendarDays size={30} />
                <strong>My dates are flexible</strong>
                <p>Continue planning without choosing exact departure and return dates.</p>
              </div>
            )}

            <footer className="planner-calendar-footer">
              <button type="button" className="planner-calendar-clear" onClick={() => { setDraftStart(""); setDraftEnd(""); setMode("dates"); }}>Clear dates</button>
              <button type="button" className="planner-calendar-update" disabled={mode === "dates" && (!draftStart || !draftEnd)} onClick={updateDates}>Update</button>
            </footer>
          </section>
        </div>
      )}
    </>
  );
}
