import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import {
  Sparkles,
  X,
  MapPin,
  Plane,
  CloudSun,
  Hotel,
  ArrowRight,
  Menu,
  Trash2,
} from "lucide-react";

import { plannerService } from "../services/plannerService";
import authService from "../services/authService";
import TravelBookingsView from "../components/planner/TravelBookingsView";
import PlannerSidebar from "../components/planner/PlannerSidebar";
import ChatMessage from "../components/planner/ChatMessage";
import ChatComposer from "../components/planner/ChatComposer";
import TravelDatePicker from "../components/planner/TravelDatePicker";
import HotelBooking from "../components/hotels/HotelBooking";
import "./Planner.css";
const makeConversationId = () =>
  globalThis.crypto?.randomUUID?.() ??
  `trip-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const titleFromMessage = (message) => {
  const clean = message.trim().replace(/\s+/g, " ");
  return clean.length > 42 ? `${clean.slice(0, 39)}…` : clean || "New Trip";
};


const getTripDestination = (messages, title = "") => {
  const candidates = [
    title,
    ...(messages || []).map((item) => item.content || ""),
  ];

  const patterns = [
    /\btrip\s+to\s+([A-Za-z][A-Za-z .'-]*?)(?=\s+(?:under|for|from|on|between|with|budget)|[,.!?]|$)/i,
    /\btravel\s+to\s+([A-Za-z][A-Za-z .'-]*?)(?=\s+(?:under|for|from|on|between|with|budget)|[,.!?]|$)/i,
    /\bdestination\s*(?:is|:)\s*([A-Za-z][A-Za-z .'-]*?)(?=\s+(?:under|for|from|on|between|with|budget)|[,.!?]|$)/i,
  ];

  for (const candidate of candidates) {
    const text = String(candidate);

    for (const pattern of patterns) {
      const match = text.match(pattern);

      if (match?.[1]) {
        return match[1].trim();
      }
    }
  }

  return "";
};


function Planner() {
  const [authorized, setAuthorized] = useState(Boolean(sessionStorage.getItem("access_token")));
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [travelView, setTravelView] = useState(null);
  const [currentUserName, setCurrentUserName] = useState("");
  const [travelBookings, setTravelBookings] = useState({ flights: [], hotels: [] });
  const [travelBookingsLoading, setTravelBookingsLoading] = useState(false);
  const [travelBookingsError, setTravelBookingsError] = useState("");
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState("");
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [calendarMessageId, setCalendarMessageId] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showPassengerForm, setShowPassengerForm] = useState(false);
  const [passengerDetails, setPassengerDetails] = useState({ fullName: "", dateOfBirth: "", gender: "", email: "", phone: "", passportNumber: "" });
  const [passengerSaved, setPassengerSaved] = useState(false);
  const [showBookingConfirmation, setShowBookingConfirmation] = useState(false);
  const [flightBookingStage, setFlightBookingStage] = useState("review");
  const [flightBookingOrder, setFlightBookingOrder] = useState(null);
  const [selectedFlightOffer, setSelectedFlightOffer] = useState(null);
  const [hotelFlowStage, setHotelFlowStage] = useState("idle");
  const [guestDetails, setGuestDetails] = useState({ fullName: "", email: "", phone: "" });
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [hotelPrebook, setHotelPrebook] = useState(null);
  const [showHotelBooking, setShowHotelBooking] = useState(false);
  const scrollRef = useRef(null);
  const textareaRef = useRef(null);

  const lastAssistantMessage = useMemo(
    () => [...messages].reverse().find((message) => message.role === "assistant" || message.role === "ai"),
    [messages]
  );

  // Suggested alternatives during a weather warning must not open the calendar.
  // The calendar opens only when the backend enters its dates step or explicitly asks for dates.
  const nextStepKey = String(lastAssistantMessage?.next_step || "").toLowerCase();
  const lastAssistantText = String(
    lastAssistantMessage?.content ?? lastAssistantMessage?.message ?? ""
  ).toLowerCase();
  const lastIsWeatherConfirmation = nextStepKey === "weather_confirmation";
  const showDateControls = !lastIsWeatherConfirmation && (
  ["dates", "date", "date_selection", "provide_dates", "travel_dates"].includes(nextStepKey) ||
  /what dates would you like to travel|when would you like to travel|select your travel dates|what are your travel dates/.test(lastAssistantText)
);

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.conversation_id === activeId),
    [conversations, activeId]
  );

  
  useEffect(() => {
    let mounted = true;
    authService.getCurrentUser().then((user) => {
      if (!mounted) return;
      const profile = user?.user || user?.profile || user;
      const name = profile?.name || profile?.full_name || profile?.fullName || profile?.display_name || profile?.email || "Traveller";
      setCurrentUserName(String(name));
    }).catch(() => {
      if (!mounted) return;
      const storedName = sessionStorage.getItem("user_name") || sessionStorage.getItem("name") || "Traveller";
      setCurrentUserName(storedName);
    });
    return () => { mounted = false; };
  }, []);

  const loadTravelBookings = useCallback(async (type) => {
    setTravelBookingsLoading(true);
    setTravelBookingsError("");
    try {
      const response = type === "flights"
        ? await plannerService.getFlightBookings()
        : await plannerService.getHotelBookings();
      const list = Array.isArray(response.data?.bookings) ? response.data.bookings : [];
      setTravelBookings((current) => ({ ...current, [type]: list }));
    } catch (requestError) {
      if (requestError.response?.status === 401) {
        sessionStorage.removeItem("access_token");
        sessionStorage.removeItem("token_type");
        setAuthorized(false);
      }
      const detail = requestError.response?.data?.detail;
      setTravelBookingsError(typeof detail === "string" ? detail : detail?.message || `Couldn't load your ${type === "flights" ? "flight" : "hotel"} bookings.`);
    } finally {
      setTravelBookingsLoading(false);
    }
  }, []);

  const openTravelView = (type) => {
    setTravelView(type);
    setError("");
    loadTravelBookings(type);
  };

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const response = await plannerService.getHistory();
      const list = Array.isArray(response.data?.conversations) ? response.data.conversations : [];
      setConversations(list);
      if (activeId && list.some((item) => item.conversation_id === activeId)) return;
      if (list.length) {
        const first = list[0];
        setActiveId(first.conversation_id);
        setMessages(Array.isArray(first.messages) ? first.messages : []);
      } else {
        setActiveId("");
        setMessages([]);
      }
    } catch (requestError) {
      if (requestError.response?.status === 401) {
        sessionStorage.removeItem("access_token");
        sessionStorage.removeItem("token_type");
        setAuthorized(false);
      } else {
        setError(
          requestError.response?.data?.detail?.message ||
            requestError.response?.data?.detail ||
            "Couldn't load your conversation history."
        );
      }
    } finally {
      setHistoryLoading(false);
    }
  }, [activeId]);

  useEffect(() => {
    loadHistory();
    // Initial load only, matching the existing behavior.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  const persistConversation = useCallback(async (conversationId, title, nextMessages) => {
    try {
      await plannerService.saveHistory({
        conversation_id: conversationId,
        title,
        messages: nextMessages,
      });
      setConversations((current) => {
        const existing = current.find((item) => item.conversation_id === conversationId);
        const next = {
          ...(existing || {}),
          conversation_id: conversationId,
          title,
          messages: nextMessages,
          updated_at: new Date().toISOString(),
        };
        return [next, ...current.filter((item) => item.conversation_id !== conversationId)];
      });
    } catch (requestError) {
      if (requestError.response?.status === 401) {
        sessionStorage.removeItem("access_token");
        sessionStorage.removeItem("token_type");
        setAuthorized(false);
      } else {
        setError("Your message was sent, but saving the conversation failed. Please try again.");
      }
    }
  }, []);

  const startNewConversation = () => {
    setTravelView(null);
    setActiveId("");
    setMessages([]);
    setDraft("");
    setStartDate("");
    setEndDate("");
    setCalendarMessageId("");
    setFlightBookingStage("review");
    setHotelFlowStage("idle");
    setSelectedHotel(null);
    setHotelPrebook(null);
    setShowHotelBooking(false);
    setError("");
    textareaRef.current?.focus();
  };

  const openConversation = (conversation) => {
    setTravelView(null);
    setActiveId(conversation.conversation_id);
    setMessages(Array.isArray(conversation.messages) ? conversation.messages : []);
    setDraft("");
    setError("");
    setStartDate("");
    setEndDate("");
    setCalendarMessageId("");
    setFlightBookingStage("review");
    setHotelFlowStage("idle");
    setSelectedHotel(null);
    setHotelPrebook(null);
    setShowHotelBooking(false);
  };

  const handleSelectHotel = async (hotel, index) => {
    const offerId = hotel?.offerId || hotel?.offer_id || hotel?.rateId || hotel?.rate_id || hotel?.offer?.id;
    const hotelName = hotel?.hotel_name || hotel?.hotelName || hotel?.name || hotel?.hotel?.name || `Hotel option ${index + 1}`;
    if (!offerId) {
      setError(`The selected hotel (${hotelName}) has no offer/rate ID. Search for hotels again and select a rate returned by the backend.`);
      return;
    }
    setError("");
    setLoading(true);
    try {
      // A selected rate must be revalidated by the backend before booking.
      const response = await plannerService.prebookHotel({ offer_id: offerId });
      const result = response.data || {};
      if (result.success === false || !(result.prebook_id || result.prebookId)) {
        throw new Error(result.message || result.error || "The hotel rate could not be revalidated. Please search again.");
      }
      setSelectedHotel(hotel);
      setHotelPrebook(result);
      setGuestDetails({ fullName: "", email: "", phone: "" });
      setShowHotelBooking(true);
      setHotelFlowStage("guest_details");
    } catch (requestError) {
      const detail = requestError.response?.data?.detail;
      setError(typeof detail === "string" ? detail : detail?.message || requestError.message || "Hotel prebooking failed. Please search again.");
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (event, options = {}) => {
    event?.preventDefault();
    const text = String(options.message ?? draft).trim();
    const visibleText = String(options.displayMessage ?? text).trim();
    const requestStartDate = options.startDate !== undefined ? options.startDate : startDate;
    const requestEndDate = options.endDate !== undefined ? options.endDate : endDate;
    if (!text || loading) return;
    setError("");

    const conversationId = activeId || makeConversationId();
    const title = activeConversation?.title || titleFromMessage(visibleText);
    const userMessage = { role: "user", content: visibleText, created_at: new Date().toISOString() };
    const previousMessages = activeId ? messages : [];
    const optimisticMessages = [...previousMessages, userMessage];
    setActiveId(conversationId);
    setMessages(optimisticMessages);
    setDraft("");
    setLoading(true);

    try {
      const requestIntent = /\b(find|search|show|look for)\s+hotels?\b/i.test(text)
        ? "hotel_search"
        : /\b(skip)\s+hotels?\b/i.test(text)
          ? "skip_hotels"
          : "";
      let response;
      if (requestIntent === "hotel_search") {
        // Hotel search has its own FastAPI route. Do not send this action to
        // /planner/message, which only runs the conversational planner workflow.
        const destination = getTripDestination(previousMessages, activeConversation?.title || "");
        const datePattern = /\b(20\d{2}-\d{2}-\d{2})\b/g;
        const datesInHistory = [...(previousMessages || []).map((item) => item.content || "").join(" ").matchAll(datePattern)].map((match) => match[1]);
        const checkin = requestStartDate || datesInHistory[0] || "";
        const checkout = requestEndDate || datesInHistory[1] || "";
        if (!destination || !checkin || !checkout) {
          throw new Error(`To search hotels, I need the trip destination and both stay dates. Destination: ${destination || "missing"}; check-in: ${checkin || "missing"}; check-out: ${checkout || "missing"}.`);
        }
        console.log("Hotel search debug:", {
          destination,
          checkin,
          checkout,
          previousMessages,
          conversationTitle: activeConversation?.title,
        });
        response = await plannerService.searchHotels({
          destination,
          checkin,
          checkout,
          adults: 1,
          currency: "INR",
          guest_nationality: "IN",
          limit: 8,
        });
      } else {
        response = await plannerService.sendMessage({
          message: text,
          conversation_id: conversationId,
          start_date: requestStartDate || null,
          end_date: requestEndDate || null,
        });
      }
      const data = response.data || {};
      // A hotel search is a distinct chat action. Some planner responses retain
      // flight fields from the earlier itinerary; do not render those as new results.
      const returnedHotels = Array.isArray(data.hotels)
        ? data.hotels
        : Array.isArray(data.hotel_options)
          ? data.hotel_options
          : Array.isArray(data.hotel_rates)
            ? data.hotel_rates
            : [];
      const assistantMessage = {
        role: "assistant",
        content: data.response || "I received a response, but it didn't contain any text.",
        request_intent: requestIntent,
        hotel_results_returned: returnedHotels.length > 0,
        next_step: data.next_step ?? null,
        weather: data.weather ?? null,
        hotels: returnedHotels,
        flights: requestIntent === "hotel_search" ? [] : (data.flights ?? []),
        outbound_flights: requestIntent === "hotel_search" ? [] : (data.outbound_flights ?? []),
        return_flights: requestIntent === "hotel_search" ? [] : (data.return_flights ?? []),
        selected_outbound_flight: data.selected_outbound_flight ?? null,
        selected_return_flight: data.selected_return_flight ?? null,
        booking_order: data.booking_order ?? null,
        suggested_dates: data.suggested_dates ?? [],
        created_at: new Date().toISOString(),
      };
      if (requestIntent === "hotel_search" && returnedHotels.length === 0) {
        assistantMessage.content = `${assistantMessage.content}\n\nThe hotel-search endpoint did not return any hotel offers for these dates. Please try different dates or another destination.`;
      }
      const completedMessages = [...optimisticMessages, assistantMessage];
      const assistantMessageId = assistantMessage.created_at;
      const responseText = String(assistantMessage.content || "").toLowerCase();
      const responseStep = String(assistantMessage.next_step || "").toLowerCase();
      const isWeatherConfirmation = responseStep === "weather_confirmation";
      const asksForDates = !isWeatherConfirmation && (
        ["dates", "date", "date_selection", "provide_dates", "travel_dates"].includes(responseStep) ||
        /what dates would you like to travel|when would you like to travel|select your travel dates|what are your travel dates/.test(responseText)
      );
      setCalendarMessageId(asksForDates ? assistantMessageId : "");
      if (responseStep === "hotel_confirmation" && data.booking_order) {
        setFlightBookingOrder(data.booking_order);
        setFlightBookingStage("confirmed");
      } else if (options.isFlightBookingRequest && responseStep === "flight_passenger_details") {
        setFlightBookingStage("error");
      }
      setMessages(completedMessages);
      await persistConversation(conversationId, title, completedMessages);
      // Keep selected dates through weather confirmation and flight search.
      // They are cleared only when starting/opening another conversation or choosing new dates.
    } catch (requestError) {
      const status = requestError.response?.status;
      if (status === 401) {
        sessionStorage.removeItem("access_token");
        sessionStorage.removeItem("token_type");
        setAuthorized(false);
        return;
      }
      if (options.isFlightBookingRequest) setFlightBookingStage("error");
      const detail = requestError.response?.data?.detail;
      const message = requestError.message;
      setError(
        typeof detail === "string"
          ? detail
          : detail?.message || message || "Couldn't send your message. Check that the backend is running and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const confirmFlightBooking = async () => {
    const parts = passengerDetails.fullName.trim().split(/\s+/);
    const givenName = parts.shift() || "";
    const familyName = parts.join(" ");
    if (!givenName || !familyName) { setError("Enter the passenger's first and last name as shown on their ID."); return; }
    const offerId = selectedFlightOffer?.offer_id || selectedFlightOffer?.offerId || selectedFlightOffer?.id || selectedFlightOffer?.offer?.id;
    if (!offerId) { setError("The selected flight offer ID is missing. Please select a flight again."); setFlightBookingStage("error"); return; }
    if (!passengerDetails.dateOfBirth || !passengerDetails.gender || !passengerDetails.email.trim() || !passengerDetails.phone.trim()) { setError("Complete all required passenger details before confirming."); return; }
    const gender = passengerDetails.gender === "female" ? "f" : "m";
    const passenger = { given_name: givenName, family_name: familyName, title: gender === "f" ? "ms" : "mr", gender, born_on: passengerDetails.dateOfBirth, email: passengerDetails.email.trim(), phone_number: passengerDetails.phone.trim() };
    setError(""); setFlightBookingStage("submitting");
    try {
      const response = await plannerService.createFlightBooking({ offer_id: offerId, passengers: [passenger] });
      const result = response.data || {};
      if (!result.success || (!result.provider_order_id && !result.booking_reference && !result.booking_id)) throw new Error(result.message || "Booking service did not return an order.");
      const bookingOrder = { ...result, id: result.provider_order_id || result.order_id || result.booking_id, booking_reference: result.booking_reference || null, status: result.status || "unknown", payment_status: result.payment_status || "Not returned by backend" };
      setFlightBookingOrder(bookingOrder);
      setFlightBookingStage("confirmed");
      setPassengerSaved(true);
      setShowBookingConfirmation(false);
      setShowPassengerForm(false);

      // Put the real booking response into the conversation so it remains visible
      // with the hotel choices, instead of keeping it only inside the modal.
      const confirmationMessage = {
        role: "assistant",
        content: "Your flight booking request has been processed. Would you like to book a hotel too?",
        next_step: "hotel_confirmation",
        flight_booking_order: bookingOrder,
        created_at: new Date().toISOString(),
      };
      const updatedMessages = [...messages, confirmationMessage];
      setMessages(updatedMessages);
      const conversationId = activeId || makeConversationId();
      const title = activeConversation?.title || "Trip planning";
      setActiveId(conversationId);
      await persistConversation(conversationId, title, updatedMessages);
    } catch (e) { const d=e.response?.data?.detail; setError(typeof d === "string" ? d : d?.message || e.message || "Flight booking could not be created."); setFlightBookingStage("error"); }
  };

  const deleteConversation = async () => {
    if (!deleteTarget) return;
    try {
      await plannerService.deleteHistory(deleteTarget.conversation_id);
      const wasActive = activeId === deleteTarget.conversation_id;
      setConversations((current) =>
        current.filter((item) => item.conversation_id !== deleteTarget.conversation_id)
      );
      setDeleteTarget(null);
      if (wasActive) {
        setActiveId("");
        setMessages([]);
      }
    } catch (requestError) {
      setError(requestError.response?.data?.detail || "Couldn't remove this conversation.");
      setDeleteTarget(null);
    }
  };

  const logout = () => {
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("token_type");
    setAuthorized(false);
  };

  if (!authorized) return <Navigate to="/login" replace />;

  return (
    <div className={`planner-shell ${sidebarOpen ? "" : "planner-shell--collapsed"}`}>
      <PlannerSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        conversations={conversations}
        activeId={activeId}
        historyLoading={historyLoading}
        onNewConversation={startNewConversation}
        onOpenConversation={openConversation}
        onDeleteConversation={setDeleteTarget}
        onLogout={logout}
        onOpenTravel={openTravelView}
        travelView={travelView}
        userName={currentUserName}
      />

      <main className="planner-main">
        <header className="planner-topbar">
          <div className="planner-topbar-left">
            {!sidebarOpen && (
              <button
                className="planner-icon-button planner-expand-mobile"
                type="button"
                onClick={() => setSidebarOpen(true)}
                aria-label="Expand sidebar"
              >
                <Menu size={20} />
              </button>
            )}
            <div>
              <span className="planner-eyebrow">YOUR PERSONAL TRAVEL ASSISTANT</span>
              <h1>{travelView ? (travelView === "flights" ? "Flight Bookings" : "Hotel Bookings") : (activeConversation?.title || (messages.length ? "Your trip" : "Where will we go?"))}</h1>
            </div>
          </div>
          <div className="planner-secure-label"><span /> AI trip planner</div>
        </header>

        {travelView ? (
          <TravelBookingsView
            type={travelView}
            bookings={travelBookings[travelView] || []}
            loading={travelBookingsLoading}
            error={travelBookingsError}
            onBack={() => setTravelView(null)}
            onRefresh={() => loadTravelBookings(travelView)}
          />
        ) : <>
        <section className="planner-chat-area" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="planner-welcome">
              <div className="planner-welcome-icon"><Sparkles size={25} /></div>
              <p className="planner-welcome-kicker">YOUR NEXT ADVENTURE STARTS HERE</p>
              <h2>Let's plan somewhere<br /><span>extraordinary.</span></h2>
              <p className="planner-welcome-description">
                Tell me where you'd like to go, your budget, or the kind of experience you're dreaming of. We'll figure out the details together.
              </p>
              <div className="planner-prompt-grid">
                {[
                  { icon: MapPin, title: "A weekend escape", prompt: "Plan a 2-day weekend trip from my current city under ₹8,000." },
                  { icon: Plane, title: "A trip on a budget", prompt: "Plan a trip to Goa under ₹20,000." },
                  { icon: CloudSun, title: "Best time to travel", prompt: "Suggest the best dates and check the weather for a trip to Manali." },
                  { icon: Hotel, title: "Stay somewhere lovely", prompt: "Help me plan a trip with comfortable hotel options within my budget." },
                ].map(({ icon: Icon, title, prompt }) => (
                  <button
                    className="planner-prompt-card"
                    type="button"
                    key={title}
                    onClick={() => { setDraft(prompt); textareaRef.current?.focus(); }}
                  >
                    <Icon size={18} /><span>{title}</span><ArrowRight size={16} className="planner-prompt-arrow" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="planner-messages">
              {messages.map((message, index) => {
                const messageId = message.created_at || `message-${index}`;
                const isDateQuestion = messageId === calendarMessageId &&
                  (message.role === "assistant" || message.role === "ai");
                return (
                  <div key={`${messageId}-${index}`}>
                    <ChatMessage
                        message={message}
                        onSelectFlight={(flight, index) => {
                          setSelectedFlightOffer(flight);
                          const airline = flight?.airline || flight?.owner?.name || flight?.name || "flight option";
                          sendMessage(null, { message: `Select round-trip flight option ${index + 1}: ${airline}` });
                        }}
                        onPassengerDetails={() => { setPassengerSaved(false); setShowBookingConfirmation(false); setFlightBookingStage("review"); setFlightBookingOrder(null); setShowPassengerForm(true); sendMessage(null, { message: "Passenger details", displayMessage: "Continue to passenger details" }); }}
                        onSelectDifferentFlights={() => sendMessage(null, { message: "show different flights" })}
                        onFindHotels={() => sendMessage(null, { message: "find hotels", displayMessage: `Find hotels for ${startDate || "saved check-in date"} to ${endDate || "saved check-out date"}` })}
                        onSkipHotels={() => sendMessage(null, { message: "skip hotels", displayMessage: "Skip hotels and finish my trip" })}
                        onSelectHotel={handleSelectHotel}
                      />
                    {index === messages.length - 1 &&
                      (message.role === "assistant" || message.role === "ai") &&
                      String(message.next_step || "").toLowerCase() === "weather_confirmation" && (
                        <div className="planner-weather-actions">
                          <button
                            type="button"
                            className="planner-weather-action planner-weather-action--primary"
                            disabled={loading}
                            onClick={() => sendMessage(null, { message: "continue" })}
                          >Continue with these dates</button>
                          <button
                            type="button"
                            className="planner-weather-action"
                            disabled={loading}
                            onClick={() => {
                              setStartDate("");
                              setEndDate("");
                              setCalendarMessageId("");
                              sendMessage(null, { message: "change dates", startDate: "", endDate: "" });
                            }}
                          >Choose different dates</button>
                        </div>
                      )}
                    {isDateQuestion && (
                      <div className="planner-inline-calendar-wrap">
                        <TravelDatePicker
                          key={messageId}
                          startDate={startDate}
                          setStartDate={setStartDate}
                          endDate={endDate}
                          setEndDate={setEndDate}
                          autoOpen
                          onDatesUpdated={({ startDate: selectedStartDate, endDate: selectedEndDate, flexible } = {}) => {
                            // Submit the values supplied by the picker instead of
                            // waiting for React state to update (which can be stale
                            // during the first click on Update).
                            const message = flexible
                              ? "My travel dates are flexible. Continue planning without exact dates."
                              : `My travel dates are ${selectedStartDate} to ${selectedEndDate}`;

                            setStartDate(selectedStartDate || "");
                            setEndDate(selectedEndDate || "");
                            setDraft(message);
                            sendMessage(null, {
                              message,
                              startDate: selectedStartDate || "",
                              endDate: selectedEndDate || "",
                            });
                          }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
              {loading && (
                <div className="planner-loading-line">
                  <span className="planner-assistant-avatar"><Sparkles size={16} /></span>
                  <div>
                    <div className="planner-message-author">Tripmate</div>
                    <div className="planner-typing"><i /><i /><i /></div>
                  </div>
                </div>
              )}
              <div className="planner-scroll-anchor" />
            </div>
          )}
        </section>

        <footer className="planner-composer-wrap">
          {error && (
            <div className="planner-error" role="alert">
              <span>{String(error)}</span>
              <button type="button" onClick={() => setError("")} aria-label="Dismiss error"><X size={16} /></button>
            </div>
          )}
          <ChatComposer
            draft={draft}
            setDraft={setDraft}
            loading={loading}
            onSubmit={sendMessage}
            textareaRef={textareaRef}
            showDateControls={false}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
          />
          <p className="planner-disclaimer">Tripmate can make mistakes. Confirm prices and availability before booking.</p>
        </footer>
        </>}
      </main>

      {showPassengerForm && (
        <div className="planner-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowPassengerForm(false); }}>
          <section className="planner-passenger-modal" role="dialog" aria-modal="true" aria-labelledby="passenger-details-title">
            <div className="planner-passenger-header">
              <div><span className="planner-passenger-eyebrow">FLIGHT BOOKING</span><h2 id="passenger-details-title">Passenger details</h2><p>Enter the details exactly as they appear on the traveller’s official ID.</p></div>
              <button type="button" className="planner-passenger-close" onClick={() => setShowPassengerForm(false)} aria-label="Close passenger details"><X size={20} /></button>
            </div>
            {passengerSaved ? (
              showBookingConfirmation ? (
                flightBookingStage === "review" ? (
                  <div className="planner-booking-confirmation">
                    <div className="planner-booking-confirmation-icon"><Plane size={25} /></div>
                    <span className="planner-passenger-eyebrow">FLIGHT BOOKING</span>
                    <h3>Review your booking details</h3>
                    <p className="planner-booking-confirmation-intro">Please confirm the passenger information before continuing. Your flight has not been booked yet.</p>
                    <div className="planner-booking-summary">
                      <div><span>Passenger</span><strong>{passengerDetails.fullName}</strong></div>
                      <div><span>Email</span><strong>{passengerDetails.email}</strong></div>
                      <div><span>Phone</span><strong>{passengerDetails.phone}</strong></div>
                      <div><span>Date of birth</span><strong>{passengerDetails.dateOfBirth}</strong></div>
                      <div><span>Gender</span><strong>{passengerDetails.gender.replaceAll("_", " ")}</strong></div>
                      {passengerDetails.passportNumber && <div><span>Passport number</span><strong>{passengerDetails.passportNumber}</strong></div>}
                    </div>
                    <div className="planner-booking-confirmation-notice"><strong>Before you continue</strong><p>Confirm booking sends passenger details to the existing Duffel sandbox hold-order endpoint. A hold order is not the same as a paid ticket.</p></div>
                    <div className="planner-passenger-actions">
                      <button type="button" className="planner-modal-cancel" onClick={() => setShowBookingConfirmation(false)}>Back to passenger details</button>
                      <button type="button" className="planner-passenger-submit" onClick={() => setFlightBookingStage("pending")}>Continue <ArrowRight size={16} /></button>
                    </div>
                  </div>
                ) : flightBookingStage === "confirmed" && flightBookingOrder ? (
                  <div className="planner-booking-confirmation">
                    <div className="planner-booking-confirmation-icon"><Plane size={25} /></div>
                    <span className="planner-passenger-eyebrow">FLIGHT BOOKING</span>
                    <h3>Flight booking response</h3>
                    <div className="planner-booking-summary">
                      <div><span>Booking reference</span><strong>{flightBookingOrder.booking_reference || "Not provided by provider"}</strong></div>
                      <div><span>Order ID</span><strong>{flightBookingOrder.provider_order_id || flightBookingOrder.id || "Not provided by provider"}</strong></div>
                      <div><span>Status</span><strong>{flightBookingOrder.status || "unknown"}</strong></div>
                      <div><span>Booking type</span><strong>{flightBookingOrder.booking_type || "hold"}</strong></div>
                      <div><span>Payment status</span><strong>{flightBookingOrder.payment_status || "Not returned by backend"}</strong></div>
                    </div>
                    <div className="planner-booking-confirmation-notice"><strong>Next step</strong><p>The details above come from the backend response. Provider order status and payment status are shown as returned; they are not inferred by the frontend.</p></div>
                    <div className="planner-passenger-actions">
                      <button type="button" className="planner-modal-cancel" onClick={() => { setHotelFlowStage("skipped"); setShowPassengerForm(false); sendMessage(null, { message: "skip hotels", displayMessage: "Skip hotels and finish my trip" }); }}>Skip hotels</button>
                      <button type="button" className="planner-passenger-submit" onClick={() => { setHotelFlowStage("searching"); setShowPassengerForm(false); sendMessage(null, { message: "find hotels", displayMessage: `Find hotels for ${startDate || "saved check-in date"} to ${endDate || "saved check-out date"}` }); }}>Find hotels <Hotel size={16} /></button>
                    </div>
                  </div>
                ) : (
                  <div className="planner-booking-confirmation">
                    <div className="planner-booking-confirmation-icon"><Plane size={25} /></div>
                    <span className="planner-passenger-eyebrow">FLIGHT BOOKING</span>
                    <h3>{flightBookingStage === "submitting" ? "Confirming flight booking…" : flightBookingStage === "error" ? "Booking needs attention" : "Ready to confirm booking"}</h3>
                    <p className="planner-booking-confirmation-intro">{flightBookingStage === "submitting" ? "Passenger details have been sent to the booking workflow. Please wait for the provider response." : flightBookingStage === "error" ? "The backend did not return a confirmed booking response. Check the message in the chat and correct any missing details before retrying." : "Confirm to send the passenger details to the existing backend flight-booking flow."}</p>
                    <div className="planner-passenger-actions">
                      <button type="button" className="planner-modal-cancel" disabled={flightBookingStage === "submitting"} onClick={() => setShowBookingConfirmation(false)}>Back to passenger details</button>
                      <button type="button" className="planner-passenger-submit" disabled={flightBookingStage === "submitting"} onClick={confirmFlightBooking}>{flightBookingStage === "submitting" ? "Please wait…" : "Confirm booking"} <ArrowRight size={16} /></button>
                    </div>
                  </div>
                )
              ) : (
                <div className="planner-passenger-success" role="status">
                  <strong>Passenger details saved</strong>
                  <p>Next, review your passenger information before continuing to flight booking.</p>
                  <button type="button" onClick={() => setShowBookingConfirmation(true)}>Review booking confirmation <ArrowRight size={16} /></button>
                </div>
              )
            ) : (
              <form onSubmit={(event) => { event.preventDefault(); setPassengerSaved(true); setShowBookingConfirmation(true); setFlightBookingStage("review"); }}>
                <div className="planner-passenger-grid">
                  <label>Full name * <input required autoComplete="name" value={passengerDetails.fullName} onChange={(event) => setPassengerDetails((current) => ({ ...current, fullName: event.target.value }))} placeholder="Name as on ID" /></label>
                  <label>Date of birth * <input required type="date" value={passengerDetails.dateOfBirth} onChange={(event) => setPassengerDetails((current) => ({ ...current, dateOfBirth: event.target.value }))} /></label>
                  <label>Gender * <select required value={passengerDetails.gender} onChange={(event) => setPassengerDetails((current) => ({ ...current, gender: event.target.value }))}><option value="">Select gender</option><option value="female">Female</option><option value="male">Male</option><option value="other">Other</option><option value="prefer_not_to_say">Prefer not to say</option></select></label>
                  <label>Email address * <input required type="email" autoComplete="email" value={passengerDetails.email} onChange={(event) => setPassengerDetails((current) => ({ ...current, email: event.target.value }))} placeholder="name@example.com" /></label>
                  <label>Phone number * <input required type="tel" autoComplete="tel" value={passengerDetails.phone} onChange={(event) => setPassengerDetails((current) => ({ ...current, phone: event.target.value }))} placeholder="Mobile number" /></label>
                  <label>Passport number <small>Optional, if required for your route</small><input value={passengerDetails.passportNumber} onChange={(event) => setPassengerDetails((current) => ({ ...current, passportNumber: event.target.value }))} placeholder="Passport number" /></label>
                </div>
                <div className="planner-passenger-note">Please check spelling and dates carefully. Confirm booking sends the required passenger fields to the existing backend booking workflow.</div>
                <div className="planner-passenger-actions"><button type="button" className="planner-modal-cancel" onClick={() => setShowPassengerForm(false)}>Cancel</button><button type="submit" className="planner-passenger-submit">Save passenger details <ArrowRight size={16} /></button></div>
              </form>
            )}
          </section>
        </div>
      )}

      {showHotelBooking && selectedHotel && hotelPrebook && (
        <HotelBooking
          hotel={selectedHotel}
          prebook={hotelPrebook}
          guestDetails={guestDetails}
          setGuestDetails={setGuestDetails}
          loading={loading}
          error={error}
          onClose={() => { setShowHotelBooking(false); setHotelFlowStage("idle"); }}
          onSubmit={async (event) => {
            event.preventDefault();
            if (loading) return;
            const parts = guestDetails.fullName.trim().split(/\s+/);
            const firstName = parts.shift() || "";
            const lastName = parts.join(" ");
            if (!firstName || !lastName) { setError("Enter the guest's first and last name."); return; }
            const prebookId = hotelPrebook.prebook_id || hotelPrebook.prebookId;
            if (!prebookId) { setError("The backend did not return a prebook ID. Search for hotels again."); return; }
            setError("");
            setLoading(true);
            try {
              const response = await plannerService.bookHotel({
                prebook_id: prebookId,
                first_name: firstName,
                last_name: lastName,
                email: guestDetails.email.trim(),
                phone: guestDetails.phone.trim(),
              });
              const result = response.data || {};
              if (result.success === false) throw new Error(result.message || result.error || "Hotel booking failed.");
              const hotelName = selectedHotel.hotel_name || selectedHotel.hotelName || selectedHotel.name || selectedHotel.hotel?.name || "Selected hotel";
              const confirmation = {
                role: "assistant",
                content: result.message || "The hotel booking endpoint returned a response.",
                next_step: "hotel_booking_result",
                hotel_booking_result: result,
                hotel_name: hotelName,
                created_at: new Date().toISOString(),
              };
              const updatedMessages = [...messages, confirmation];
              setMessages(updatedMessages);
              const conversationId = activeId || makeConversationId();
              const title = activeConversation?.title || "Trip planning";
              setActiveId(conversationId);
              await persistConversation(conversationId, title, updatedMessages);
              setHotelFlowStage("booked");
              setShowHotelBooking(false);
            } catch (requestError) {
              const detail = requestError.response?.data?.detail;
              setError(typeof detail === "string" ? detail : detail?.message || requestError.message || "Hotel booking failed.");
            } finally {
              setLoading(false);
            }
          }}
        />
      )}

      {hotelFlowStage === "skipped" && !showPassengerForm && (
        <div className="planner-modal-backdrop" role="presentation">
          <section className="planner-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="trip-thanks-title">
            <div className="planner-modal-icon"><Plane size={21} /></div>
            <h2 id="trip-thanks-title">Thank you for planning with Tripmate!</h2>
            <p>Your hotel search was skipped. Note that your flight booking is not confirmed until the booking provider confirms it.</p>
            <div className="planner-modal-actions"><button type="button" className="planner-modal-delete" onClick={() => setHotelFlowStage("idle")}>Back to trip</button></div>
          </section>
        </div>
      )}

      {deleteTarget && (
        <div
          className="planner-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => { if (event.target === event.currentTarget) setDeleteTarget(null); }}
        >
          <section className="planner-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="planner-delete-title">
            <div className="planner-modal-icon"><Trash2 size={21} /></div>
            <h2 id="planner-delete-title">Remove this conversation?</h2>
            <p>Are you sure you want to remove this conversation from your chat history?</p>
            <div className="planner-modal-actions">
              <button type="button" className="planner-modal-cancel" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button type="button" className="planner-modal-delete" onClick={deleteConversation}><Trash2 size={15} /> Remove</button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default Planner;
