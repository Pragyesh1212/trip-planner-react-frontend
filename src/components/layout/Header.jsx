import { Link } from "react-router-dom";
import { Compass, Menu, X } from "lucide-react";
import { useState } from "react";
import "./Header.css";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="nav-container">
        <Link to="/" className="brand">
          <span className="brand-icon">
            <Compass size={23} strokeWidth={2.3} />
          </span>
          <span>trip<span className="brand-accent">mate</span></span>
        </Link>

        <nav className={`nav-links ${menuOpen ? "nav-open" : ""}`}>
          <Link to="#destinations" onClick={() => setMenuOpen(false)}>
            Destinations
          </Link>
          <Link to="#how-it-works" onClick={() => setMenuOpen(false)}>
            How it works
          </Link>
          <Link to="#features" onClick={() => setMenuOpen(false)}>
            Features
          </Link>

          <div className="mobile-auth">
            <Link className="nav-login" to="/login">Log in</Link>
            <Link className="nav-signup" to="/signup">Get started <span>↗</span></Link>
          </div>
        </nav>

        <div className="nav-actions">
          <Link className="nav-login" to="/login">Log in</Link>
          <Link className="nav-signup" to="/signup">
            Get started <span>↗</span>
          </Link>
        </div>

        <button
          className="menu-toggle"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={23} /> : <Menu size={23} />}
        </button>
      </div>
    </header>
  );
}
