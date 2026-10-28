import { Hotel } from "lucide-react";

export default function HotelResults({ hotels, onSelectHotel }) {
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

