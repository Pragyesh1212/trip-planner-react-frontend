
import { Compass, Menu, X } from "lucide-react";
import { useState } from "react";
import "./Header.css";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="nav-container">
        <a href="/" className="brand">
          <span className="brand-icon">
            <Compass size={23} strokeWidth={2.3} />
          </span>
          <span>trip<span className="brand-accent">mate</span></span>
        </a>

        <nav className={`nav-links ${menuOpen ? "nav-open" : ""}`}>
          <a href="#destinations" onClick={() => setMenuOpen(false)}>
            Destinations
          </a>
          <a href="#how-it-works" onClick={() => setMenuOpen(false)}>
            How it works
          </a>
          <a href="#features" onClick={() => setMenuOpen(false)}>
            Features
          </a>

          <div className="mobile-auth">
            <a className="nav-login" href="/login">Log in</a>
            <a className="nav-signup" href="/signup">Get started <span>↗</span></a>
          </div>
        </nav>

        <div className="nav-actions">
          <a className="nav-login" href="/login">Log in</a>
          <a className="nav-signup" href="/signup">
            Get started <span>↗</span>
          </a>
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
