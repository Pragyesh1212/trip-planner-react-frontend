import { Sparkles } from "lucide-react";
import BookingSection from "./BookingSection";

export default function ChatMessage({ message, onSelectFlight, onPassengerDetails, onSelectDifferentFlights, onFindHotels, onSkipHotels, onSelectHotel }) {
  const isUser = message.role === "user" || message.role === "human";
  const content = message.content ?? message.message ?? "";

  return (
    <article className={`planner-message ${isUser ? "planner-message--user" : "planner-message--assistant"}`}>
      {!isUser && <div className="planner-assistant-avatar"><Sparkles size={16} /></div>}
      <div className="planner-message-body">
        <div className="planner-message-author">{isUser ? "You" : "Tripmate"}</div>
        <div className="planner-message-bubble">{String(content)}</div>
        {!isUser && message.flight_booking_order && (
          <section style={{ width: "100%", maxWidth: 650, marginTop: 12, border: "1px solid #BBF7D0", borderRadius: 16, overflow: "hidden", background: "#FFFFFF" }}>
            <header style={{ display: "flex", alignItems: "center", gap: 10, padding: "15px 16px", background: "#F0FDF4", borderBottom: "1px solid #DCFCE7" }}>
              <span style={{ display: "grid", placeItems: "center", width: 38, height: 38, borderRadius: 12, background: "#FFFFFF", color: "#2563EB" }}>✈</span>
              <div style={{ flex: 1 }}><strong style={{ display: "block", color: "#166534", fontSize: 14 }}>Flight booking confirmation</strong><span style={{ color: "#64748B", fontSize: 12 }}>Booking response from the provider</span></div>
              <span style={{ color: "#166534", background: "#FFFFFF", border: "1px solid #BBF7D0", borderRadius: 99, padding: "5px 9px", fontSize: 10, fontWeight: 800 }}>{String(message.flight_booking_order.status || "RECEIVED").toUpperCase()}</span>
            </header>
            <div style={{ padding: 15, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
              <div style={{ padding: 11, background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 11 }}><small style={{ display: "block", color: "#64748B", fontWeight: 800, fontSize: 10, marginBottom: 5 }}>BOOKING REFERENCE</small><strong style={{ overflowWrap: "anywhere", fontSize: 13 }}>{message.flight_booking_order.booking_reference || "Not provided by provider"}</strong></div>
              <div style={{ padding: 11, background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 11 }}><small style={{ display: "block", color: "#64748B", fontWeight: 800, fontSize: 10, marginBottom: 5 }}>ORDER ID</small><strong style={{ overflowWrap: "anywhere", fontSize: 13 }}>{message.flight_booking_order.provider_order_id || message.flight_booking_order.id || message.flight_booking_order.booking_id || "Not provided by provider"}</strong></div>
              <div style={{ padding: 11, background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 11 }}><small style={{ display: "block", color: "#64748B", fontWeight: 800, fontSize: 10, marginBottom: 5 }}>PAYMENT STATUS</small><strong style={{ fontSize: 13 }}>{message.flight_booking_order.payment_status || "Not returned by backend"}</strong></div>
            </div>
            <div style={{ padding: "0 15px 15px" }}><p style={{ margin: "0 0 12px", color: "#475569", fontSize: 12 }}>This is the booking status returned by the backend. Payment or ticket issuance is not assumed.</p><strong style={{ display: "block", marginBottom: 10, fontSize: 13, color: "#0F172A" }}>Would you like to book a hotel too?</strong><div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}><button type="button" onClick={onFindHotels} style={{ border: 0, borderRadius: 10, padding: "11px 15px", color: "#FFFFFF", background: "#2563EB", fontWeight: 750, cursor: "pointer" }}>Find hotels</button><button type="button" onClick={onSkipHotels} style={{ border: "1px solid #CBD5E1", borderRadius: 10, padding: "11px 15px", color: "#334155", background: "#FFFFFF", fontWeight: 700, cursor: "pointer" }}>Skip hotels</button></div></div>
          </section>
        )}
        {!isUser && !message.flight_booking_order && <BookingSection message={message} onSelectFlight={onSelectFlight} onPassengerDetails={onPassengerDetails} onSelectDifferentFlights={onSelectDifferentFlights} onSelectHotel={onSelectHotel} />}
        {!isUser && message.next_step && !message.flight_booking_order && (
          <div className="planner-next-step"><span aria-hidden="true">➜</span><span>{String(message.next_step).replaceAll("_", " ")}</span></div>
        )}
      </div>
    </article>
  );
}
