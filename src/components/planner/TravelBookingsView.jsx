import { useEffect, useState } from "react";
import { ArrowLeft, CalendarDays, ChevronDown, ChevronUp, Hotel, LoaderCircle, MapPin, Plane, Plus, RefreshCw, Users } from "lucide-react";

const formatDate = (value) => {
  if (!value) return "Not provided";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const formatDateTime = (value) => {
  if (!value) return "Not provided";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true });
};

// Booking APIs may expose journey timestamps under different field names.
const firstAvailable = (...values) => values.find((value) => value !== undefined && value !== null && value !== "");

const getDepartureDate = (booking) => firstAvailable(
  booking?.departure_date,
  booking?.departing_at,
  booking?.departure_datetime,
  booking?.departure_time,
  booking?.outbound_departure_date,
  booking?.outbound_departure,
  booking?.outbound_journey?.departing_at,
  booking?.outbound_journey?.departure_time,
  booking?.slices?.[0]?.departing_at,
  booking?.slices?.[0]?.departure_time
);

const getReturnDate = (booking) => firstAvailable(
  booking?.return_date,
  booking?.returning_at,
  booking?.return_datetime,
  booking?.return_time,
  booking?.inbound_departure_date,
  booking?.return_departure,
  booking?.return_journey?.departing_at,
  booking?.return_journey?.departure_time,
  booking?.inbound?.departing_at,
  booking?.inbound?.departure_time,
  booking?.slices?.[1]?.departing_at,
  booking?.slices?.[1]?.departure_time
);

const placeName = (place) => {
  if (!place) return "—";
  if (typeof place === "string") return place;
  const name = place.city_name || place.city || place.name || place.iata_code || place.code;
  const code = place.iata_code || place.code;
  return name && code && name !== code ? `${name} (${code})` : name || "Not provided";
};

const money = (amount, currency = "INR") => {
  if (amount === null || amount === undefined || amount === "") return "Not provided";
  const number = Number(amount);
  if (!Number.isFinite(number)) return `${currency} ${amount}`;
  try { return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 2 }).format(number); }
  catch { return `${currency} ${number.toLocaleString("en-IN")}`; }
};



function PriceDisplay({ amount, currency = "INR" }) {
  const code = String(currency || "INR").toUpperCase();
  const [exchangeRate, setExchangeRate] = useState(null);

  useEffect(() => {
    if (
      code === "INR" ||
      amount === "" ||
      amount == null ||
      !Number.isFinite(Number(amount))
    ) {
      return;
    }

    let cancelled = false;

    fetch(`https://open.er-api.com/v6/latest/${encodeURIComponent(code)}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Exchange rate unavailable");
        }
        return response.json();
      })
      .then((data) => {
        const rate = Number(data?.rates?.INR);

        if (!cancelled && data?.result === "success" && rate > 0) {
          setExchangeRate({ code, rate });
        }
      })
      .catch(() => {
        if (!cancelled) setExchangeRate({ code, rate: null });
      });

    return () => {
      cancelled = true;
    };
  }, [amount, code]);

  if (amount === "" || amount == null) {
    return <>Not provided</>;
  }

  let displayAmount;

  if (code === "INR") {
    displayAmount = money(amount, "INR");
  } else if (exchangeRate?.code === code && exchangeRate.rate !== null) {
    displayAmount = money(Number(amount) * exchangeRate.rate, "INR");
  } else {
    displayAmount = money(amount, code);
  }

  // Return plain text so the parent <strong> controls the price styling.
  // A <span> here inherits the generic label styling from .planner-travel-card-details span.
  return displayAmount;
}


export default function TravelBookingsView({ type, bookings, loading, error, onBack, onRefresh }) {
  const isFlights = type === "flights";
  const title = isFlights ? "Flight Bookings" : "Hotel Bookings";
  const Icon = isFlights ? Plane : Hotel;
  const [expandedBookings, setExpandedBookings] = useState({});

  return (
    <section className="planner-travel-view">
      <div className="planner-travel-view-top">
        <button type="button" className="planner-travel-back" onClick={onBack}><ArrowLeft size={16} /> Back to trip planner</button>
        <button type="button" className="planner-travel-refresh" onClick={onRefresh} disabled={loading}><RefreshCw size={15} className={loading ? "planner-spin" : ""} /> Refresh</button>
      </div>
      <div className="planner-travel-title-row">
        <div className="planner-travel-title-icon"><Icon size={23} /></div>
        <div><p className="planner-travel-eyebrow">MY TRAVELS</p><h2>{title}</h2><p className="planner-travel-subtitle">Bookings saved to your account.</p></div>
      </div>

      {loading ? (
        <div className="planner-travel-state"><LoaderCircle size={22} className="planner-spin" /><span>Loading your {isFlights ? "flight" : "hotel"} bookings…</span></div>
      ) : error ? (
        <div className="planner-travel-error" role="alert">{error}</div>
      ) : bookings.length === 0 ? (
        <div className="planner-travel-empty"><div className="planner-travel-empty-icon"><Icon size={24} /></div><h3>No {isFlights ? "flight" : "hotel"} bookings yet</h3><p>When you make a {isFlights ? "flight" : "hotel"} booking, it will appear here.</p><button type="button" onClick={onBack}>Plan a trip</button></div>
      ) : (
        <div className="planner-travel-booking-list">
          {bookings.map((booking, index) => {
            const id = booking.booking_id || booking.provider_order_id || booking.booking_reference || `${type}-${index}`;
            const route = `${placeName(booking.origin)} → ${placeName(booking.destination)}`;
            const hotelName = booking.hotel_name || booking.hotelName || booking.name || "Hotel booking";
            const status = booking.status || "unknown";
            const expanded = Boolean(expandedBookings[id]);
            const slices = Array.isArray(booking.slices) ? booking.slices : [];
            const outbound = slices[0] || booking.outbound_journey || booking.outbound || null;
            const inbound = slices[1] || booking.return_journey || booking.inbound || null;
            const passengers = Array.isArray(booking.passengers) && booking.passengers.length
              ? booking.passengers
              : Array.isArray(booking.passenger_details)
                ? booking.passenger_details
                : booking.passenger_details && Object.keys(booking.passenger_details).length
                  ? [booking.passenger_details]
                  : [];
            const outboundSegments = Array.isArray(outbound?.segments) ? outbound.segments : Array.isArray(outbound) ? outbound : [];
            const inboundSegments = Array.isArray(inbound?.segments) ? inbound.segments : Array.isArray(inbound) ? inbound : [];
            const departureDate = firstAvailable(
              outbound?.departing_at,
              outbound?.departure_time,
              outboundSegments[0]?.departing_at,
              outboundSegments[0]?.departure_time,
              getDepartureDate(booking)
            );
            const returnDate = firstAvailable(
              inbound?.departing_at,
              inbound?.departure_time,
              inboundSegments[0]?.departing_at,
              inboundSegments[0]?.departure_time,
              getReturnDate(booking)
            );
            return (
              <article className="planner-travel-booking-card" key={id}>
                <div className="planner-travel-card-head">
                  <div className="planner-travel-card-icon"><Icon size={19} /></div>
                  <div className="planner-travel-card-heading"><h3>{isFlights ? route : hotelName}</h3><p>{isFlights ? "Flight itinerary" : `${placeName(booking.destination) === "—" ? "Hotel stay" : placeName(booking.destination)}`}</p></div>
                  <span className={`planner-booking-status ${String(status).toLowerCase() === "confirmed" ? "is-confirmed" : ""}`}>{status}</span>
                </div>
                <div className="planner-travel-card-details">
                  {isFlights ? <>
                    <div><span>Departure</span><strong>{formatDate(departureDate)}</strong></div>
                    <div><span>Return</span><strong>{formatDate(returnDate)}</strong></div>
                    <div><span>Booking reference</span><strong>{booking.booking_reference || "Not provided"}</strong></div>
                    <div><span>Order ID</span><strong>{booking.provider_order_id || "Not provided"}</strong></div>
                    <div><span>Booking type</span><strong>{booking.booking_type || "—"}</strong></div>
                  </> : <>
                    <div><span>Check-in</span><strong>{formatDate(booking.checkin)}</strong></div>
                    <div><span>Check-out</span><strong>{formatDate(booking.checkout)}</strong></div>
                    <div><span>Booking ID</span><strong>{booking.booking_id || "Not provided"}</strong></div>
                    <div><span>Confirmation code</span><strong>{booking.confirmation_code || booking.hotel_confirmation_code || "Not provided"}</strong></div>
                  </>}
                  <div><span>Price</span><strong><PriceDisplay amount={booking.price} currency={booking.currency || "INR"} /></strong></div>
                  <div><span>Booked on</span><strong>{formatDate(booking.created_at)}</strong></div>
                </div>
                {isFlights && (
                  <>
                    <button
                      type="button"
                      className="planner-travel-details-toggle"
                      aria-expanded={expanded}
                      onClick={() => setExpandedBookings((current) => ({ ...current, [id]: !current[id] }))}
                    >
                      {expanded ? "Hide round-trip details" : "View round-trip details"}
                      {expanded ? <ChevronUp size={17} /> : <Plus size={17} />}
                    </button>
                    {expanded && (
                      <div className="planner-travel-expanded-details">
                        <h3>Round-trip details</h3>
                        <div className="planner-travel-journey-grid">
                          {[
                            { title: "Outbound journey", journey: outbound, origin: booking.origin, destination: booking.destination, date: departureDate },
                            { title: "Return journey", journey: inbound, origin: booking.destination, destination: booking.origin, date: returnDate },
                          ].map(({ title, journey, origin, destination, date }) => {
                            const segments = Array.isArray(journey?.segments) ? journey.segments : Array.isArray(journey) ? journey : Array.isArray(journey?.flights) ? journey.flights : [];
                            const first = segments[0] || {};
                            const last = segments[segments.length - 1] || {};
                            const from = journey?.origin || first.origin || origin;
                            const to = journey?.destination || last.destination || destination;
                            const depart = journey?.departing_at || first.departing_at || date;
                            const arrive = journey?.arriving_at || journey?.arrival_time || last.arriving_at || last.arrival_time || (title === "Outbound journey" ? firstAvailable(booking?.arrival_date, booking?.arriving_at, booking?.arrival_time) : firstAvailable(booking?.return_arrival_date, booking?.return_arriving_at, booking?.return_arrival_time));
                            return (
                              <section className="planner-travel-journey" key={title}>
                                <h4>{title}</h4>
                                <div className="planner-travel-journey-route">
                                  <div><span>From</span><strong>{placeName(from)}</strong><small>{depart ? formatDateTime(depart) : "Departure date/time not provided"}</small></div>
                                  <Plane size={18} />
                                  <div><span>To</span><strong>{placeName(to)}</strong><small>{arrive ? formatDateTime(arrive) : "Arrival time not provided"}</small></div>
                                </div>
                                {segments.map((segment, segmentIndex) => (
                                  <div className="planner-travel-segment" key={segment.id || `${title}-${segmentIndex}`}>
                                    <strong>{segment.marketing_carrier?.name || segment.operating_carrier?.name || segment.airline || "Flight segment"}</strong>
                                    <span>{segment.marketing_carrier_flight_number || segment.flight_number || "Flight number not provided"}</span>
                                    <span>{placeName(segment.origin)} → {placeName(segment.destination)}</span>
                                    <span>Departure: {formatDateTime(segment.departing_at || segment.departure_time)} – Arrival: {formatDateTime(segment.arriving_at || segment.arrival_time)}</span>
                                  </div>
                                ))}
                              </section>
                            );
                          })}
                        </div>
                        <div className="planner-travel-expanded-meta">
                          <div><span>Booking reference</span><strong>{booking.booking_reference || "Not provided"}</strong></div>
                          <div><span>Provider order ID</span><strong>{booking.provider_order_id || "Not provided"}</strong></div>
                          <div><span>Provider</span><strong>{booking.provider || "Not provided"}</strong></div>
                          <div><span>Total price</span><strong><PriceDisplay amount={booking.price} currency={booking.currency || "INR"} /></strong></div>
                        </div>
                        <section className="planner-travel-passengers">
                          <div className="planner-travel-passengers-heading">
                            <div><span className="planner-travel-section-eyebrow">TRAVELLERS</span><h4>Passenger details</h4></div>
                            <span className="planner-travel-count">{passengers.length} passenger{passengers.length === 1 ? "" : "s"}</span>
                          </div>
                          {passengers.length ? (
                            <div className="planner-travel-passenger-list">
                              {passengers.map((passenger, passengerIndex) => {
                                const name = [passenger.given_name || passenger.first_name || passenger.firstName, passenger.family_name || passenger.last_name || passenger.lastName].filter(Boolean).join(" ") || passenger.full_name || passenger.name || "Passenger";
                                return <article className="planner-travel-passenger-card" key={passenger.id || `${name}-${passengerIndex}`}>
                                  <div className="planner-travel-passenger-avatar">{name.charAt(0).toUpperCase()}</div>
                                  <div className="planner-travel-passenger-copy"><strong>{name}</strong><span>{passenger.type || passenger.passenger_type || "Traveller"}</span>
                                    {passenger.email && <span>Email: {passenger.email}</span>}
                                    {(passenger.phone_number || passenger.phone) && <span>Phone: {passenger.phone_number || passenger.phone}</span>}
                                  </div>
                                </article>;
                              })}
                            </div>
                          ) : <p className="planner-travel-detail-note">Passenger details were not included in the booking-list response.</p>}
                        </section>
                        {!outbound && !inbound && <p className="planner-travel-detail-note">The booking-list API currently returns the route and dates, but not flight segments. No missing flight times or segment details have been guessed.</p>}
                      </div>
                    )}
                  </>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
