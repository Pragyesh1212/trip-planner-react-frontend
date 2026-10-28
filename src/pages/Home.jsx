
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  Compass,
  Globe2,
  Hotel,
  MapPin,
  Plane,
  Sparkles,
  Sun,
  Wallet,
  Zap,
} from "lucide-react";
import "./Home.css";

const destinations = [
  {
    name: "Goa",
    country: "India",
    description: "Sunsets, beaches & slow mornings.",
    image:
      "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=900&q=85",
    tag: "Beach escape",
  },
  {
    name: "Bali",
    country: "Indonesia",
    description: "Tropical escapes and hidden gems.",
    image:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=900&q=85",
    tag: "Island life",
  },
  {
    name: "Manali",
    country: "India",
    description: "Mountain air and winding roads.",
    image:
      "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=900&q=85",
    tag: "Mountain escape",
  },
  {
    name: "Santorini",
    country: "Greece",
    description: "Whitewashed views and blue horizons.",
    image:
      "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?auto=format&fit=crop&w=900&q=85",
    tag: "Bucket list",
  },
];

const steps = [
  {
    number: "01",
    icon: Sparkles,
    title: "Understand",
    description:
      "The AI interprets your natural-language request and extracts destination, budget, dates and preferences.",
  },
  {
    number: "02",
    icon: Compass,
    title: "Ask",
    description:
      "If something important is missing, the AI asks you for exactly what it needs before continuing.",
  },
  {
    number: "03",
    icon: Plane,
    title: "Call tools",
    description:
      "The AI selects and calls the right travel tools based on the current state of your trip.",
  },
  {
    number: "04",
    icon: Check,
    title: "Complete",
    description:
      "Your selected flights, hotels and bookings come together into one complete trip.",
  },
];

const features = [
  {
    icon: Sparkles,
    title: "Natural conversation",
    description:
      "No complicated travel forms. Describe your trip naturally and let the AI determine what information it needs.",
  },
  {
    icon: Wallet,
    title: "Intelligent decisions",
    description:
      "The system doesn’t blindly call every API. It decides which tool is needed based on the current trip state.",
  },
  {
    icon: Zap,
    title: "One connected journey",
    description:
      "From the first question to flight and hotel booking, your trip information stays connected throughout.",
  },
];

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [activeDestination, setActiveDestination] = useState("Goa");
  const navigate = useNavigate();

  function startPlanning(value = prompt) {
    const query = value.trim();

    if (!query) {
      setPrompt("Plan a trip to Goa under ₹20,000");
      return;
    }

    navigate(
      `/login?next=${encodeURIComponent(
        "/planner?prompt=" + query
      )}`
    );
  }

  return (
    <main className="home-page">
      {/* HERO */}
      <section className="hero-section">
        <div className="hero-background-glow" />

        <div className="hero-container">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="eyebrow-icon">
                <Sparkles size={14} />
              </span>
              AI-POWERED TRAVEL INTELLIGENCE
            </div>

            <h1>
              Tell us where
              <br />
              you want to go.
              <br />
              <span className="hero-blue-text">We'll plan the journey.</span>
            </h1>

            <p className="hero-description">
              Trip Planner is an AI travel agent that understands your request,
              collects what is missing and intelligently calls the right travel
              tools to build your trip.
            </p>

            <div className="hero-actions">
              <Link to="/login" className="primary-button">
                Sign In & Start Planning <ArrowRight size={18} />
              </Link>
              <Link to="#how-it-works" className="secondary-button">
                See how it works <ArrowDownRight size={17} />
              </Link>
            </div>

            <div className="hero-trust">
              <div className="trust-avatars">
                <span>✈</span>
                <span>⌁</span>
                <span>◈</span>
              </div>
              <p>
                <strong>One request. Multiple intelligent tools.</strong>
                <br />
                You stay focused on the journey.
              </p>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-image-wrap">
              <img
                className="hero-image"
                src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=90"
                alt="Turquoise ocean and tropical beach"
              />
              <div className="hero-image-shade" />

              <div className="image-top-label">
                <span className="live-dot" />
                AI TRIP AGENT
              </div>

              <div className="image-caption">
                <span className="image-location">
                  <MapPin size={15} /> 4+ travel tools orchestrated automatically
                </span>
                <h2>Intelligent trip planning.</h2>
                <p>The right tools, at the right time.</p>
              </div>
            </div>

            <div className="floating-trip-card">
              <div className="floating-card-top">
                <div className="floating-icon">
                  <Sparkles size={20} />
                </div>
                <div>
                  <strong>AI Trip Agent</strong>
                  <span>Tool orchestration</span>
                </div>
                <span className="floating-status">
                  <span />
                </span>
              </div>

              <label className="prompt-label" htmlFor="trip-prompt">
                USER REQUEST
              </label>

              <form
                className="trip-prompt-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  startPlanning();
                }}
              >
                <textarea
                  id="trip-prompt"
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  placeholder="Plan a trip to Goa under ₹20,000."
                  rows={2}
                />
                <button type="submit" aria-label="Start trip planning">
                  <ArrowRight size={19} />
                </button>
              </form>

              <div className="prompt-suggestions">
                <span>Try:</span>
                {["Goa under ₹20k", "Mountain escape"].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setPrompt(`Plan a trip to ${item}`)}
                  >
                    {item}
                  </button>
                ))}
              </div>

              <div className="trip-card-bottom">
                <span><Globe2 size={14} /> Made for your journey</span>
                <span><Sparkles size={14} /> AI powered</span>
              </div>
            </div>

            <div className="floating-note floating-note-top">
              <span className="note-icon"><Wallet size={18} /></span>
              <div>
                <strong>AI understanding</strong>
                <span>Destination and budget detected</span>
              </div>
            </div>

            <div className="floating-note floating-note-bottom">
              <span className="note-icon note-sun"><Sun size={18} /></span>
              <div>
                <strong>Weather tool</strong>
                <span>Validate travel conditions</span>
              </div>
              <Check size={17} className="note-check" />
            </div>
          </div>
        </div>

        <div className="hero-bottom-line">
          <span>AI-POWERED PLANNING. LESS TRAVEL STRESS.</span>
          <Link to="#destinations">
            SCROLL TO EXPLORE <ArrowDownRight size={15} />
          </Link>
        </div>
      </section>

      {/* DESTINATIONS */}
      <section className="destinations-section section-padding" id="destinations">
        <div className="section-container">
          <div className="section-heading heading-split">
            <div>
              <div className="eyebrow">
                <span className="eyebrow-icon"><MapPin size={14} /></span>
                EXPLORE YOUR NEXT DESTINATION
              </div>
              <h2>
                Tell us where
                <br />
                <span className="text-blue">you want to go.</span>
              </h2>
            </div>
            <p>
              From beach escapes to mountain adventures, choose a destination
              and let Trip Planner help organise your journey.
            </p>
          </div>

          <div className="destination-grid">
            {destinations.map((destination) => (
              <button
                className={`destination-card ${
                  activeDestination === destination.name ? "destination-active" : ""
                }`}
                key={destination.name}
                type="button"
                onClick={() => {
                  setActiveDestination(destination.name);
                  setPrompt(`Plan a trip to ${destination.name}`);
                }}
              >
                <img
                  src={destination.image}
                  alt={`${destination.name} travel destination`}
                  loading="lazy"
                />
                <span className="destination-shade" />
                <span className="destination-tag">{destination.tag}</span>
                <span className="destination-info">
                  <span className="destination-country">
                    <MapPin size={13} /> {destination.country}
                  </span>
                  <span className="destination-name">{destination.name}</span>
                  <span className="destination-description">
                    {destination.description}
                  </span>
                </span>
                <span className="destination-arrow">
                  <ArrowUpRight size={20} />
                </span>
              </button>
            ))}
          </div>

          <div className="destination-bottom">
            <span>
              <Compass size={17} /> Have another destination in mind?
            </span>
            <Link to="/login">
              Plan a trip your way <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="process-section section-padding" id="how-it-works">
        <div className="section-container">
          <div className="section-heading heading-centered">
            <div className="eyebrow">
              <span className="eyebrow-icon"><Zap size={14} /></span>
              HOW IT WORKS
            </div>
            <h2>
              One request.
              <br />
              <span className="text-blue">Multiple intelligent tools.</span>
            </h2>
            <p>
              You don't need to know which API to use or what information to
              provide first. The AI determines what is needed and orchestrates
              the journey for you.
            </p>
          </div>

          <div className="process-grid">
            {steps.map((step, index) => {
              const Icon = step.icon;

              return (
                <article className="process-card" key={step.number}>
                  <div className="process-card-top">
                    <span className="process-number">{step.number}</span>
                    <span className="process-icon"><Icon size={22} /></span>
                  </div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                  <div className="process-card-bottom">
                    <span>STEP {step.number}</span>
                    {index < steps.length - 1 && <ChevronRight size={17} />}
                  </div>
                </article>
              );
            })}
          </div>

          <div className="process-banner">
            <div className="process-banner-icon">
              <Sparkles size={24} />
            </div>
            <div>
              <strong>The AI decides what to call next.</strong>
              <p>It uses the information already available and dynamically determines the next action.</p>
            </div>
            <Link to="/login" className="process-banner-link">
              Start planning <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      {/* AI TOOLS */}
      <section className="intelligence-section section-padding" id="features">
        <div className="section-container intelligence-layout">
          <div className="intelligence-copy">
            <div className="eyebrow">
              <span className="eyebrow-icon"><Sparkles size={14} /></span>
              INTELLIGENT ORCHESTRATION
            </div>
            <h2>
              The AI decides
              <br />
              <span className="text-blue">what to call next.</span>
            </h2>
            <p>
              Instead of forcing you through a long form, Trip Planner uses the
              information already available and dynamically determines the next
              action.
            </p>
            <Link to="/login" className="primary-button">
              Explore the AI workflow <ArrowRight size={18} />
            </Link>

            <div className="intelligence-footnote">
              <Check size={17} />
              <span>Hotel booking is optional. Your journey stays yours.</span>
            </div>
          </div>

          <div className="tool-visual">
            <div className="tool-visual-header">
              <div>
                <span className="tool-kicker">EXAMPLE WORKFLOW</span>
                <h3>The next step, intelligently chosen.</h3>
              </div>
              <span className="tool-live"><span /> READY</span>
            </div>

            <div className="tool-list">
              <div className="tool-item">
                <span className="tool-icon"><MapPin size={21} /></span>
                <div>
                  <strong>Location</strong>
                  <span>Determine the user’s origin</span>
                </div>
                <span className="tool-index">01</span>
              </div>

              <div className="tool-connector"><span /></div>

              <div className="tool-item">
                <span className="tool-icon tool-weather"><Sun size={21} /></span>
                <div>
                  <strong>Weather</strong>
                  <span>Validate travel conditions</span>
                </div>
                <span className="tool-index">02</span>
              </div>

              <div className="tool-connector"><span /></div>

              <div className="tool-item">
                <span className="tool-icon tool-flight"><Plane size={21} /></span>
                <div>
                  <strong>Flights</strong>
                  <span>Find flight options within budget</span>
                </div>
                <span className="tool-index">03</span>
              </div>

              <div className="tool-connector"><span /></div>

              <div className="tool-item">
                <span className="tool-icon tool-hotel"><Hotel size={21} /></span>
                <div>
                  <strong>Hotels</strong>
                  <span>Search stays after flight booking</span>
                </div>
                <span className="tool-index">04</span>
              </div>
            </div>

            <div className="tool-visual-footer">
              <span className="tool-footer-icon"><Sparkles size={16} /></span>
              <div>
                <strong>AI agent orchestration</strong>
                <span>The AI selects the next tool based on your trip.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features-section section-padding">
        <div className="section-container">
          <div className="section-heading heading-centered">
            <div className="eyebrow">BUILT AROUND YOUR JOURNEY</div>
            <h2>
              Less searching.
              <br />
              <span className="text-blue">More travelling.</span>
            </h2>
          </div>

          <div className="features-grid">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <article className="feature-card" key={feature.title}>
                  <div className="feature-icon"><Icon size={22} /></div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                  <span className="feature-decoration" />
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="final-cta-section">
        <div className="final-cta">
          <div className="cta-decoration cta-decoration-one" />
          <div className="cta-decoration cta-decoration-two" />

          <div className="cta-icon"><Compass size={28} /></div>
          <div className="eyebrow">YOUR NEXT JOURNEY STARTS HERE</div>
          <h2>
            Your next journey starts
            <br />
            <span className="text-blue">with one request.</span>
          </h2>
          <p>
            Sign in to start an AI-powered planning session and let Trip Planner
            take care of the details.
          </p>
          <Link to="/login" className="primary-button">
            Sign In & Start Planning <ArrowRight size={18} />
          </Link>
          <span className="cta-note">
            <Check size={14} /> Sign in to start your personalised trip
          </span>
        </div>
      </section>
    </main>
  );
}
