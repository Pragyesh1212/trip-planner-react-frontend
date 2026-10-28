import { ArrowUpRight, Compass,Camera, Users, Globe } from "lucide-react";
import "./Footer.css";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-brand-column">
          <Link to="/" className="brand footer-brand">
            <span className="brand-icon">
              <Compass size={22} />
            </span>
            <span>trip<span className="brand-accent">mate</span></span>
          </Link>

          <p>
            Less planning stress. More unforgettable places.
            Your next adventure starts with one conversation.
          </p>

          <div className="footer-socials">
            <Link to="https://www.instagram.com/" aria-label="Instagram">
              <Camera size={18} />
            </Link>
            <Link to="https://www.linkedin.com/" aria-label="LinkedIn">
              <Users size={18} />
            </Link>
            <Link to="https://twitter.com/" aria-label="Twitter">
              <Globe size={18} />
            </Link>
          </div>
        </div>

        <div className="footer-column">
          <h4>Explore</h4>
          <Link to="#destinations">Destinations</Link>
          <Link to="#how-it-works">How it works</Link>
          <Link to="#features">Features</Link>
        </div>

        <div className="footer-column">
          <h4>Your journey</h4>
          <Link to="/login">Start planning <ArrowUpRight size={14} /></Link>
          <Link to="/signup">Create account <ArrowUpRight size={14} /></Link>
          <Link to="/login">Sign in <ArrowUpRight size={14} /></Link>
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
