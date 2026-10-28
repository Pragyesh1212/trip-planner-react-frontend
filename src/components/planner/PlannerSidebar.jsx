import {
  ArrowLeft, Compass, LoaderCircle, LogOut, Menu, MessageCircle, MessageSquarePlus, Trash2, Plane, Hotel
} from "lucide-react";

export default function PlannerSidebar({
  sidebarOpen,
  setSidebarOpen,
  conversations,
  activeId,
  historyLoading,
  onNewConversation,
  onOpenConversation,
  onDeleteConversation,
  onLogout,
  onOpenTravel,
  travelView,
  userName,
}) {
  return (
    <aside className={`planner-sidebar ${sidebarOpen ? "" : "planner-sidebar--collapsed"}`}>
      <div className="planner-brand-row">
        <div className="planner-brand-mark"><Compass size={21} /></div>
        {sidebarOpen && <span className="planner-brand-name">trip<span>mate</span></span>}
        <button
          className="planner-icon-button planner-collapse-button"
          type="button"
          onClick={() => setSidebarOpen((open) => !open)}
          aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {sidebarOpen ? <ArrowLeft size={18} /> : <Menu size={19} />}
        </button>
      </div>

      <button className="planner-new-chat" type="button" onClick={onNewConversation} title="Start a new trip">
        <MessageSquarePlus size={18} />
        {sidebarOpen && <span>New trip</span>}
        {sidebarOpen && <span className="planner-shortcut">+</span>}
      </button>

      <div className="planner-travel-section">
        {sidebarOpen && <div className="planner-history-label planner-travel-heading">MY TRAVELS</div>}
        <button
          type="button"
          className={`planner-travel-link ${travelView === "flights" ? "is-active" : ""}`}
          onClick={() => onOpenTravel("flights")}
          title="Flight Bookings"
        >
          <Plane size={17} />{sidebarOpen && <span>Flight Bookings</span>}
        </button>
        <button
          type="button"
          className={`planner-travel-link ${travelView === "hotels" ? "is-active" : ""}`}
          onClick={() => onOpenTravel("hotels")}
          title="Hotel Bookings"
        >
          <Hotel size={17} />{sidebarOpen && <span>Hotel Bookings</span>}
        </button>
      </div>

      {sidebarOpen && <div className="planner-history-label">YOUR CONVERSATIONS</div>}
      <div className="planner-history-list">
        {historyLoading ? (
          <div className="planner-history-status">
            <LoaderCircle size={16} className="planner-spin" />{sidebarOpen && "Loading history…"}
          </div>
        ) : conversations.length === 0 ? (
          sidebarOpen && <p className="planner-empty-history">Your trips will appear here.</p>
        ) : conversations.map((conversation) => (
          <div
            className={`planner-history-item ${activeId === conversation.conversation_id ? "is-active" : ""}`}
            key={conversation.conversation_id}
          >
            <button
              className="planner-history-open"
              type="button"
              onClick={() => onOpenConversation(conversation)}
              title={conversation.title || "New Trip"}
            >
              <MessageCircle size={16} />
              {sidebarOpen && <span>{conversation.title || "New Trip"}</span>}
            </button>
            {sidebarOpen && (
              <button
                className="planner-history-delete"
                type="button"
                onClick={() => onDeleteConversation(conversation)}
                aria-label={`Delete ${conversation.title || "conversation"}`}
                title="Remove conversation"
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="planner-sidebar-bottom">
        <div className="planner-user-avatar">{(userName || "Traveller").trim().charAt(0).toUpperCase()}</div>
        {sidebarOpen && (
          <div className="planner-user-copy">
            <strong title={userName || "Traveller"}>{userName || "Traveller"}</strong><span>Personal planner</span>
          </div>
        )}
        <button className="planner-icon-button planner-logout" type="button" onClick={onLogout} title="Log out" aria-label="Log out">
          <LogOut size={17} />
        </button>
      </div>
    </aside>
  );
}
