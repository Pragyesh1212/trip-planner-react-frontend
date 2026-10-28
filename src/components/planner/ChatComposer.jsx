import { LoaderCircle, Send } from "lucide-react";
import TravelDatePicker from "./TravelDatePicker";

export default function ChatComposer({
  draft,
  setDraft,
  loading,
  onSubmit,
  textareaRef,
  showDateControls,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
}) {
  return (
    <form className="planner-composer" onSubmit={onSubmit}>
      <textarea
        ref={textareaRef}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            onSubmit();
          }
        }}
        placeholder="Tell me about the trip you're imagining…"
        rows={1}
        aria-label="Message Tripmate"
        disabled={loading}
      />
      <div className="planner-composer-bottom">
        {showDateControls && (
          <TravelDatePicker
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            autoOpen={showDateControls}
          />
        )}
        <button className="planner-send-button" type="submit" disabled={!draft.trim() || loading} aria-label="Send message">
          {loading ? <LoaderCircle size={18} className="planner-spin" /> : <Send size={17} />}
          <span>Send</span>
        </button>
      </div>
    </form>
  );
}
