import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ArrowRight, Menu, X } from 'lucide-react';
import logo from '../assets/cyberclub-logo.webp';
import { navLinks } from '../data/siteData.js';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const closeMenu = () => setOpen(false);

  useEffect(() => {
    const updateScrolled = () => setScrolled(window.scrollY > 12);

    updateScrolled();
    window.addEventListener('scroll', updateScrolled, { passive: true });

    return () => window.removeEventListener('scroll', updateScrolled);
  }, []);

  return (
    <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="container nav-shell">
        <Link className="brand-mark" to="/" onClick={closeMenu}>
          <span className="brand-logo-wrap">
            <img src={logo} alt="Cyber Club DIT logo" width="62" height="62" decoding="async" fetchPriority="high" />
          </span>
          <span className="brand-copy">
            <strong>Cyber Club <span>DIT</span></strong>
            <small>Dar es Salaam Institute of Technology</small>
          </span>
        </Link>

        <nav className={`main-nav ${open ? 'is-open' : ''}`} aria-label="Primary navigation">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={closeMenu}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              {link.label}
            </NavLink>
          ))}
          <Link to="/contact" onClick={closeMenu} className="button button-primary nav-cta">
            <span>Join Us</span>
            <ArrowRight size={18} strokeWidth={2.5} />
          </Link>
        </nav>

        <button
          className="nav-toggle"
          type="button"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={23} /> : <Menu size={23} />}
        </button>
      </div>
    </header>
  );
}
