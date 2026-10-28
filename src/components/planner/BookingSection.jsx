import { CalendarDays, CloudSun, Hotel, Plane, ArrowRight, CheckCircle2, MapPin } from "lucide-react";

const dateOnly = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};
const timeOnly = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
};
const durationLabel = (value) => {
  const match = String(value || "").match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  return match ? [match[1] ? `${match[1]}h` : "", match[2] ? `${match[2]}m` : ""].filter(Boolean).join(" ") || "—" : value || "Duration unavailable";
};
const priceLabel = (flight) => {
  const formatINR = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);

  // Prefer a backend-provided INR amount whenever it is available.
  const inr = Number(flight?.price_inr);
  if (Number.isFinite(inr) && inr > 0) return formatINR(inr);

  const rawAmount = flight?.total_amount ?? flight?.price ?? flight?.amount;
  const currency = String(
    flight?.total_currency || flight?.currency || flight?.price_currency || ""
  ).toUpperCase();

  if (rawAmount == null || rawAmount === "") return "Price unavailable";

  const amount = Number(rawAmount);
  if (!Number.isFinite(amount)) return String(rawAmount);

  // Frontend-only fallback. This approximate rate is not live.
  // Update it periodically if the backend does not provide price_inr.
  const EUR_TO_INR_FALLBACK_RATE = 106.65;

  if (currency === "EUR") return formatINR(amount * EUR_TO_INR_FALLBACK_RATE);
  if (currency === "INR") return formatINR(amount);

  // Do not mislabel other currencies as INR without a conversion rate.
  return currency
    ? `${currency} ${amount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`
    : String(rawAmount);
};

function WeatherCard({ weather }) {
  if (!weather || typeof weather !== "object" || !Object.keys(weather).length) return null;
  const entries = Object.entries(weather).filter(([, value]) => value != null && typeof value !== "object");
  if (!entries.length) return null;
  return <section className="planner-result-card"><div className="planner-result-heading"><CloudSun size={18} /><strong>Weather</strong></div><div className="planner-detail-grid">{entries.slice(0, 6).map(([key, value]) => <div className="planner-detail" key={key}><span>{key.replaceAll("_", " ")}</span><strong>{String(value)}</strong></div>)}</div></section>;
}

function JourneyPanel({ journey, label, isReturn = false }) {
  const segments = Array.isArray(journey?.segments) ? journey.segments : [];
  const first = segments[0] || {};
  const last = segments[segments.length - 1] || first;
  const origin = first.origin || {};
  const destination = last.destination || {};
  const flights = segments.map((segment) => segment.flight_number).filter(Boolean);
  return (
    <section style={{ background: isReturn ? "#F0F6FF" : "#F8FAFC", border: "1px solid #E3EAF4", borderRadius: 14, padding: 15 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 14 }}><span style={{ color: "#245BE8", fontSize: 11, fontWeight: 800, letterSpacing: ".08em" }}>{label}</span><span style={{ color: "#64748B", fontSize: 12 }}>{dateOnly(first.departure)}</span></div>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto minmax(0,1fr)", alignItems: "center", gap: 10 }}>
        <div style={{ minWidth: 0 }}><div style={{ color: "#0F172A", fontSize: 20, fontWeight: 750 }}>{timeOnly(first.departure)}</div><div style={{ color: "#334155", fontSize: 13, fontWeight: 700, marginTop: 4 }}>{origin.iata_code || "—"}</div><div style={{ color: "#64748B", fontSize: 11, lineHeight: 1.4, marginTop: 3, overflowWrap: "anywhere" }}>{origin.name || "Departure airport"}</div></div>
        <div style={{ minWidth: 76, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}><span style={{ color: "#64748B", fontSize: 11, whiteSpace: "nowrap" }}>{durationLabel(journey?.duration || first.duration)}</span><div style={{ width: "100%", display: "flex", alignItems: "center", gap: 4 }}><span style={{ height: 1, background: "#C9D8F2", flex: 1 }} /><Plane size={16} color="#2563EB" /><span style={{ height: 1, background: "#C9D8F2", flex: 1 }} /></div><span style={{ color: "#64748B", fontSize: 10 }}>{segments.length > 1 ? `${segments.length - 1} stop(s)` : "Non-stop"}</span></div>
        <div style={{ minWidth: 0, textAlign: "right" }}><div style={{ color: "#0F172A", fontSize: 20, fontWeight: 750 }}>{timeOnly(last.arrival)}</div><div style={{ color: "#334155", fontSize: 13, fontWeight: 700, marginTop: 4 }}>{destination.iata_code || "—"}</div><div style={{ color: "#64748B", fontSize: 11, lineHeight: 1.4, marginTop: 3, overflowWrap: "anywhere" }}>{destination.name || "Arrival airport"}</div></div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 7, borderTop: "1px solid #E2E8F0", paddingTop: 10, marginTop: 13, color: "#64748B", fontSize: 11 }}><Plane size={13} /><span>{first.operating_carrier || first.marketing_carrier || "Airline"}{flights.length ? ` · ${flights.join(", ")}` : ""}</span></div>
    </section>
  );
}

function RoundTripCard({ flight, index, onSelectFlight, onPassengerDetails, onSelectDifferentFlights, review = false }) {
  const journeys = Array.isArray(flight?.journeys) ? flight.journeys : [];
  const airline = flight?.airline || flight?.owner?.name || "Airline";
  return (
    <article style={{ width: "100%", maxWidth: 650, border: "1px solid #D9E5FA", borderRadius: 19, background: "#FFFFFF", boxShadow: "0 8px 24px rgba(15,23,42,.055)", overflow: "hidden", marginTop: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "17px 18px", borderBottom: "1px solid #EEF2F7" }}>
        <div style={{ width: 42, height: 42, flexShrink: 0, display: "grid", placeItems: "center", borderRadius: 13, background: "#EAF1FF", color: "#2563EB" }}><Plane size={20} /></div>
        <div style={{ flex: 1, minWidth: 0 }}><div style={{ color: "#0F172A", fontSize: 14, fontWeight: 800 }}>{airline}</div><div style={{ color: "#64748B", fontSize: 12, marginTop: 3 }}>Round-trip option {index + 1}{flight?.airline_iata ? ` · ${flight.airline_iata}` : ""}</div></div>
        <div style={{ textAlign: "right", flexShrink: 0 }}><div style={{ color: "#1D4ED8", fontSize: 19, fontWeight: 850 }}>{priceLabel(flight)}</div><div style={{ color: "#64748B", fontSize: 10, marginTop: 2 }}>Round-trip total</div></div>
      </div>
      <div style={{ padding: 12, display: "grid", gap: 10 }}>
        {journeys[0] ? <JourneyPanel journey={journeys[0]} label="OUTBOUND FLIGHT" /> : <div style={{ color: "#B45309", background: "#FFFBEB", padding: 12, borderRadius: 10, fontSize: 12 }}>Outbound journey details were not included in the response.</div>}
        {journeys[1] ? <JourneyPanel journey={journeys[1]} label="RETURN FLIGHT" isReturn /> : <div style={{ color: "#B45309", background: "#FFFBEB", padding: 12, borderRadius: 10, fontSize: 12 }}>Return journey details were not included in the response.</div>}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", padding: "12px 16px 16px", background: "#FBFCFE" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#64748B", fontSize: 11 }}><MapPin size={13} /> Prices and schedules may change until booking.</div>
        {review ? <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}><div style={{ display: "inline-flex", alignItems: "center", gap: 7, color: "#166534", background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 10, padding: "10px 13px", fontSize: 12, fontWeight: 750 }}><CheckCircle2 size={16} /> Itinerary selected</div><button type="button" onClick={() => onPassengerDetails?.(flight)} style={{ display: "inline-flex", alignItems: "center", gap: 8, border: 0, borderRadius: 11, padding: "11px 15px", color: "#FFFFFF", background: "#2563EB", fontSize: 12, fontWeight: 750, cursor: "pointer" }}>Passenger details <ArrowRight size={15} /></button><button type="button" onClick={onSelectDifferentFlights} style={{ display: "inline-flex", alignItems: "center", gap: 8, border: "1px solid #CBD5E1", borderRadius: 11, padding: "10px 13px", color: "#334155", background: "#FFFFFF", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Select different flights</button></div> : <button type="button" onClick={() => onSelectFlight?.(flight, index)} style={{ display: "inline-flex", alignItems: "center", gap: 8, border: 0, borderRadius: 11, padding: "11px 15px", color: "#FFFFFF", background: "#2563EB", fontSize: 12, fontWeight: 750, cursor: "pointer" }}>Select round-trip flight <ArrowRight size={15} /></button>}
      </div>
    </article>
  );
}

function HotelCards({ hotels, onSelectHotel }) {
  if (!Array.isArray(hotels) || !hotels.length) return null;
  const value = (...values) => values.find((item) => item !== undefined && item !== null && item !== "");
  const money = (hotel) => {
    const raw = value(hotel?.price_inr, hotel?.total_price_inr, hotel?.price, hotel?.amount, hotel?.total_amount?.value, hotel?.total_amount, hotel?.totalPrice, hotel?.rate?.price);
    if (raw === undefined) return "Price unavailable";
    const amount = Number(raw);
    const currency = value(hotel?.currency, hotel?.total_currency, hotel?.totalCurrency, hotel?.rate?.currency, hotel?.price_currency, hotel?.price_inr != null ? "INR" : undefined) || "INR";
    return `${currency} ${Number.isFinite(amount) ? amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : String(raw)}`;
  };
  return <section style={{ width: "100%", maxWidth: 650, marginTop: 14 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10, color: "#0F172A" }}><Hotel size={18} color="#2563EB" /><strong>Available hotel rates</strong><span style={{ marginLeft: "auto", color: "#2563EB", border: "1px solid #DBEAFE", borderRadius: 99, padding: "4px 9px", fontSize: 11 }}>{hotels.length} options</span></div>
    <div style={{ display: "grid", gap: 10 }}>
      {hotels.slice(0, 8).map((hotel, index) => {
        const name = value(hotel?.hotel_name, hotel?.hotelName, hotel?.name, hotel?.hotel?.name, hotel?.title, "Hotel option");
        const location = value(hotel?.city, hotel?.location, hotel?.address, hotel?.hotel?.address, hotel?.destination, "");
        const room = value(hotel?.room_name, hotel?.roomName, hotel?.room_type, hotel?.roomType, hotel?.room?.name, hotel?.description, hotel?.board_name, "");
        const offerId = value(hotel?.offerId, hotel?.offer_id, hotel?.rateId, hotel?.rate_id, hotel?.prebookId, hotel?.prebook_id, hotel?.id, hotel?.hotel_id);
        const retry = Boolean(hotel?.requires_revalidation || hotel?.revalidate || hotel?.is_stale || hotel?.available === false);
        return <article key={String(offerId || index)} style={{ display: "grid", gridTemplateColumns: "minmax(74px, 100px) minmax(0, 1fr)", gap: 12, padding: 12, border: "1px solid #D9E5FA", borderRadius: 15, background: "#FFFFFF", boxShadow: "0 4px 15px rgba(15,23,42,.045)" }}>
          <div style={{ display: "grid", placeItems: "center", minHeight: 86, borderRadius: 11, background: "#F1F5F9", color: "#2563EB" }}><Hotel size={27} /></div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#0F172A" }}>{String(name)}</div>
            {location && <div style={{ marginTop: 4, color: "#64748B", fontSize: 12 }}>{String(location)}</div>}
            {room && <div style={{ marginTop: 5, color: "#475569", fontSize: 12, lineHeight: 1.45 }}>{String(room)}</div>}
            <div style={{ marginTop: 8, color: "#1D4ED8", fontSize: 13, fontWeight: 800 }}>{money(hotel)}</div>
            <div style={{ marginTop: 5, color: "#64748B", fontSize: 10 }}>Sandbox rate; availability and price may need revalidation before booking.</div>
            <button type="button" disabled={!offerId || !onSelectHotel} onClick={() => onSelectHotel?.(hotel, index)} style={{ marginTop: 9, border: 0, borderRadius: 9, padding: "9px 12px", background: !offerId || !onSelectHotel ? "#CBD5E1" : "#2563EB", color: "#FFFFFF", fontSize: 11, fontWeight: 750, cursor: !offerId || !onSelectHotel ? "not-allowed" : "pointer" }}>{retry ? "Retry rate check" : "Select this room"}</button>
          </div>
        </article>;
      })}
    </div>
  </section>;
}

function ChoiceList({ title, items, icon: Icon }) {
  if (!Array.isArray(items) || !items.length) return null;
  return <section className="planner-result-card"><div className="planner-result-heading"><Icon size={18} /><strong>{title}</strong><span>{items.length}</span></div><div className="planner-options-list">{items.slice(0, 5).map((item, index) => { const name = item?.name || item?.hotel_name || item?.hotelName || item?.airline || item?.owner?.name || item?.destination || item?.flight_number || item?.id || `${title.slice(0, -1)} ${index + 1}`; const price = item?.price_inr ?? item?.price ?? item?.total_amount?.value ?? item?.total_amount ?? item?.totalPrice ?? item?.amount; const currency = item?.price_inr != null ? "INR" : (item?.currency || item?.total_currency || item?.totalCurrency || ""); return <div className="planner-option" key={item?.id || item?.offer_id || item?.offerId || index}><div className="planner-option-icon"><Icon size={17} /></div><div className="planner-option-copy"><strong>{String(name)}</strong></div>{price != null && <strong className="planner-option-price">{currency ? `${currency} ${Number(price).toLocaleString("en-IN", { maximumFractionDigits: 2 })}` : String(price)}</strong>}</div>; })}</div></section>;
}

export default function BookingSection({ message, onSelectFlight, onPassengerDetails, onSelectDifferentFlights, onFindHotels, onSkipHotels, onSelectHotel }) {
  const nextStep = String(message?.next_step || "").toLowerCase();
  const isTripReview = nextStep === "trip_review";
  const isHotelSearchResponse = message?.request_intent === "hotel_search";
  const isHotelConfirmation = nextStep === "hotel_confirmation" || Boolean(message?.flight_booking_order);
  const flights = isHotelSearchResponse ? [] : (Array.isArray(message?.flights) ? message.flights : []);
  const isRoundTrip = (flight) => Array.isArray(flight?.journeys) && flight.journeys.length >= 2;
  const roundTrips = flights.filter(isRoundTrip);
  const selected = message?.selected_outbound_flight || message?.selected_return_flight || (isTripReview ? roundTrips[0] : null);
  const selectedId = selected?.offer_id || selected?.id;

  return <div className="planner-extras">
    <WeatherCard weather={message.weather} />
    {!isTripReview && roundTrips.length > 0 && <section style={{ width: "100%", maxWidth: 650, marginTop: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 3 }}><div style={{ width: 38, height: 38, display: "grid", placeItems: "center", borderRadius: 12, color: "#2563EB", background: "#EAF1FF" }}><Plane size={19} /></div><div><div style={{ color: "#0F172A", fontSize: 14, fontWeight: 800 }}>Choose your round-trip flight</div><div style={{ color: "#64748B", fontSize: 12, marginTop: 3 }}>Compare both journeys and the total fare before selecting.</div></div><span style={{ marginLeft: "auto", color: "#2563EB", border: "1px solid #DBEAFE", borderRadius: 99, padding: "5px 9px", fontSize: 11 }}>{roundTrips.length} {roundTrips.length === 1 ? "option" : "options"}</span></div>
      {roundTrips.slice(0, 5).map((flight, index) => <RoundTripCard key={flight?.offer_id || flight?.id || index} flight={flight} index={index} onSelectFlight={onSelectFlight} />)}
    </section>}
    {isTripReview && selected && isRoundTrip(selected) && <section style={{ width: "100%", maxWidth: 650, marginTop: 8 }}><div style={{ display: "flex", alignItems: "center", gap: 9, color: "#166534", fontSize: 13, fontWeight: 800, marginBottom: 5 }}><CheckCircle2 size={18} /> Selected itinerary · Review before booking</div><RoundTripCard flight={selected} index={0} review onPassengerDetails={onPassengerDetails} onSelectDifferentFlights={onSelectDifferentFlights} /></section>}
    {!isHotelSearchResponse && !roundTrips.length && !isTripReview && <><ChoiceList title="Outbound flights" items={message.outbound_flights} icon={Plane} /><ChoiceList title="Return flights" items={message.return_flights} icon={Plane} />{!message.outbound_flights?.length && <ChoiceList title="Flights" items={message.flights} icon={Plane} />}</>}
    {message.hotel_booking_result && (() => {
      const result = message.hotel_booking_result;
      const bookingId = result.bookingId || result.booking_id || result.id || result.booking_id;
      const status = String(result.status || (result.success ? "CONFIRMED" : "RECEIVED")).toUpperCase();
      const price = result.price ?? result.total_price ?? result.amount;
      const currency = result.currency || result.price_currency || "INR";
      return <article style={{ width: "100%", maxWidth: 650, marginTop: 14, border: "1px solid #BBF7D0", borderRadius: 19, background: "#FFFFFF", boxShadow: "0 8px 24px rgba(15,23,42,.055)", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "17px 18px", borderBottom: "1px solid #DCFCE7", background: "#F0FDF4" }}>
          <div style={{ width: 42, height: 42, flexShrink: 0, display: "grid", placeItems: "center", borderRadius: 13, background: "#FFFFFF", color: "#15803D", border: "1px solid #DCFCE7" }}><Hotel size={20} /></div>
          <div style={{ flex: 1, minWidth: 0 }}><div style={{ color: "#166534", fontSize: 14, fontWeight: 850 }}>Hotel booking confirmation</div><div style={{ color: "#64748B", fontSize: 12, marginTop: 3 }}>{result.message || message.content || "Booking response returned by the hotel provider"}</div></div>
          <span style={{ flexShrink: 0, border: "1px solid #BBF7D0", borderRadius: 99, padding: "5px 9px", background: "#FFFFFF", color: "#166534", fontSize: 10, fontWeight: 850 }}>{status}</span>
        </div>
        <div style={{ padding: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 9 }}>
            <div style={{ border: "1px solid #E2E8F0", borderRadius: 12, background: "#F8FAFC", padding: 12 }}><div style={{ color: "#64748B", fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".04em" }}>Hotel</div><div style={{ color: "#0F172A", fontSize: 13, fontWeight: 750, marginTop: 6, overflowWrap: "anywhere" }}>{result.hotel_name ||result.hotelName ||result.name ||message.hotel_name ||"Selected hotel"}</div></div>
            {bookingId && <div style={{ border: "1px solid #E2E8F0", borderRadius: 12, background: "#F8FAFC", padding: 12 }}><div style={{ color: "#64748B", fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".04em" }}>Booking ID</div><div style={{ color: "#0F172A", fontSize: 13, fontWeight: 750, marginTop: 6, overflowWrap: "anywhere" }}>{String(bookingId)}</div></div>}
            {price != null && <div style={{ border: "1px solid #E2E8F0", borderRadius: 12, background: "#F8FAFC", padding: 12 }}><div style={{ color: "#64748B", fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".04em" }}>Price</div><div style={{ color: "#0F172A", fontSize: 13, fontWeight: 750, marginTop: 6 }}>{currency} {String(price)}</div></div>}
          </div>
          <p style={{ margin: "12px 2px 1px", color: "#64748B", fontSize: 11, lineHeight: 1.5 }}>This is the booking status returned by the hotel provider. Please retain the booking ID for reference.</p>
        </div>
      </article>;
    })()}
    <HotelCards hotels={message.hotels} onSelectHotel={onSelectHotel} />
    {isHotelConfirmation && <section style={{ width: "100%", maxWidth: 650, marginTop: 14, padding: 14, border: "1px solid #D9E5FA", borderRadius: 14, background: "#FFFFFF" }}>
      <div style={{ fontSize: 14, fontWeight: 800, color: "#0F172A", marginBottom: 6 }}>Would you like to book a hotel too?</div>
      <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
        <button type="button" onClick={onFindHotels} style={{ border: 0, borderRadius: 10, padding: "10px 14px", color: "#FFFFFF", background: "#2563EB", fontSize: 12, fontWeight: 750, cursor: "pointer" }}>Find hotels</button>
        <button type="button" onClick={onSkipHotels} style={{ border: "1px solid #CBD5E1", borderRadius: 10, padding: "10px 14px", color: "#334155", background: "#FFFFFF", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Skip hotels</button>
      </div>
    </section>}
    {!(["trip_review", "flight_search", "outbound_results", "return_results"].includes(nextStep)) && Array.isArray(message.suggested_dates) && message.suggested_dates.length > 0 && <section className="planner-result-card"><div className="planner-result-heading"><CalendarDays size={18} /><strong>Suggested dates</strong></div>{message.suggested_dates.map((range, index) => <div className="planner-date-option" key={`${range.start_date}-${range.end_date}-${index}`}><span>{dateOnly(range.start_date)} – {dateOnly(range.end_date)}</span></div>)}</section>}
  </div>;
}
