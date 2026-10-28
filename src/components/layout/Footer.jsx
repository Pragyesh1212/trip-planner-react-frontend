import { ArrowUpRight, Compass,Camera, Users, Globe } from "lucide-react";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-brand-column">
          <a href="/" className="brand footer-brand">
            <span className="brand-icon">
              <Compass size={22} />
            </span>
            <span>trip<span className="brand-accent">mate</span></span>
          </a>

          <p>
            Less planning stress. More unforgettable places.
            Your next adventure starts with one conversation.
          </p>

          <div className="footer-socials">
            <a href="https://www.instagram.com/" aria-label="Instagram">
              <Camera size={18} />
            </a>
            <a href="https://www.linkedin.com/" aria-label="LinkedIn">
              <Users size={18} />
            </a>
            <a href="https://twitter.com/" aria-label="Twitter">
              <Globe size={18} />
            </a>
          </div>
        </div>

        <div className="footer-column">
          <h4>Explore</h4>
          <a href="#destinations">Destinations</a>
          <a href="#how-it-works">How it works</a>
          <a href="#features">Features</a>
        </div>

        <div className="footer-column">
          <h4>Your journey</h4>
          <a href="/login">Start planning <ArrowUpRight size={14} /></a>
          <a href="/signup">Create account <ArrowUpRight size={14} /></a>
          <a href="/login">Sign in <ArrowUpRight size={14} /></a>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Tripmate. Made for curious travellers.</span>
        <span className="footer-status">
          <span className="status-dot" /> Powered by AI
        </span>
      </div>
    </footer>
  );
}
