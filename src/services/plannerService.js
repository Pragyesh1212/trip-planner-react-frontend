
import api from "./api";

// Keep planner endpoint details in one place.
// Existing backend routes remain unchanged.
export const plannerService = {
  getHistory() {
    return api.get("/planner/history");
  },

  saveHistory(payload) {
    return api.put("/planner/history", payload);
  },

  sendMessage(payload) {
    return api.post("/planner/message", payload);
  },

  searchHotels(payload) {
    return api.post("/planner/hotels/search", payload);
  },

  prebookHotel(payload) {
    return api.post("/planner/hotels/prebook", payload);
  },

  bookHotel(payload) {
    return api.post("/planner/hotels/book", payload);
  },

  createFlightBooking(payload) {
    return api.post("/bookings/flights", payload);
  },

  // Load bookings belonging to the authenticated user.
  getFlightBookings() {
    return api.get("/planner/flight-bookings");
  },

  getHotelBookings() {
    return api.get("/planner/hotel-bookings");
  },

  deleteHistory(conversationId) {
    return api.delete(
      `/planner/history/${encodeURIComponent(conversationId)}`
    );
  },
};

export default plannerService;
