import { Hotel, X, ArrowRight, LoaderCircle } from "lucide-react";

export default function HotelBooking({ hotel, prebook, guestDetails, setGuestDetails, loading, error, onClose, onSubmit }) {
  const name = hotel?.hotel_name || hotel?.hotelName || hotel?.name || hotel?.hotel?.name || "Selected hotel";
  const prebookId = prebook?.prebook_id || prebook?.prebookId || "Not returned";
  const price = prebook?.price;
  const currency = prebook?.currency || "INR";

  return (
    <div className="planner-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !loading) onClose(); }}>
      <section className="planner-passenger-modal" role="dialog" aria-modal="true" aria-labelledby="hotel-booking-title">
        <div className="planner-passenger-header">
          <div>
            <span className="planner-passenger-eyebrow">HOTEL BOOKING</span>
            <h2 id="hotel-booking-title">Confirm your hotel</h2>
            <p>Enter the lead guest's details to submit the existing hotel booking request.</p>
          </div>
          <button type="button" className="planner-passenger-close" onClick={onClose} disabled={loading} aria-label="Close hotel booking"><X size={20} /></button>
        </div>
        <div className="planner-booking-confirmation" style={{ paddingTop: 0 }}>
          <div className="planner-booking-confirmation-icon"><Hotel size={24} /></div>
          <h3>{String(name)}</h3>
          <div className="planner-booking-summary">
            <div><span>Prebook reference</span><strong>{String(prebookId)}</strong></div>
            {price != null && <div><span>Revalidated price</span><strong>{currency} {Number(price).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</strong></div>}
            <div><span>Rate status</span><strong>{prebook?.message || "Rate revalidated; not yet booked"}</strong></div>
          </div>
          <form onSubmit={onSubmit}>
            <div className="planner-passenger-grid">
              <label>Guest full name * <input required autoComplete="name" value={guestDetails.fullName} onChange={(event) => setGuestDetails((current) => ({ ...current, fullName: event.target.value }))} placeholder="First and last name" /></label>
              <label>Email address * <input required type="email" autoComplete="email" value={guestDetails.email} onChange={(event) => setGuestDetails((current) => ({ ...current, email: event.target.value }))} placeholder="name@example.com" /></label>
              <label>Phone number * <input required type="tel" autoComplete="tel" value={guestDetails.phone} onChange={(event) => setGuestDetails((current) => ({ ...current, phone: event.target.value }))} placeholder="Mobile number" /></label>
            </div>
            {error && <p role="alert" style={{ color: "#B91C1C", fontSize: 12, marginTop: 12 }}>{error}</p>}
            <div className="planner-booking-confirmation-notice"><strong>Important</strong><p>Prebooking only revalidates the rate. The reservation is not complete until the booking endpoint returns a successful response.</p></div>
            <div className="planner-passenger-actions">
              <button type="button" className="planner-modal-cancel" onClick={onClose} disabled={loading}>Cancel</button>
              <button type="submit" className="planner-passenger-submit" disabled={loading}>{loading ? <><LoaderCircle size={16} className="animate-spin" /> Booking…</> : <>Confirm hotel booking <ArrowRight size={16} /></>}</button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
