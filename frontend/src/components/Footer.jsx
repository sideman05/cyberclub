import { Link } from 'react-router-dom';
import { Camera, Code2, Mail, MapPin, Network, Send } from 'lucide-react';
import logo from '../assets/cyberclub-logo.webp';
import { navLinks } from '../data/siteData.js';

const iconMap = [Network, Camera, Send, Code2];

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-glow" />
      <div className="container footer-grid">
        <div className="footer-brand">
          <Link className="brand-mark" to="/">
            <span className="brand-logo-wrap">
              <img src={logo} alt="Cyber Club DIT logo" width="62" height="62" loading="lazy" decoding="async" />
            </span>
            <span className="brand-copy">
              <strong>Cyber Club <span>DIT</span></strong>
              <small>Dar es Salaam Institute of Technology</small>
            </span>
          </Link>
          <p>
            A student-led cybersecurity community at Dar es Salaam Institute of Technology focused on
            ethical hacking, digital safety, and innovation.
          </p>
          <div className="social-row">
            {iconMap.map((Icon, index) => (
              <a href="#" aria-label={`Social ${index + 1}`} key={index}><Icon size={18} /></a>
            ))}
          </div>
        </div>
        <div>
          <h3>Quick Links</h3>
          <div className="footer-links">
            {navLinks.map((link) => (
              <Link to={link.path} key={link.path}>{link.label}</Link>
            ))}
          </div>
        </div>
        <div>
          <h3>Contact</h3>
          <div className="footer-contact">
            <span><MapPin size={16} /> Dar es Salaam Institute of Technology</span>
            <span><Mail size={16} /> cyberclub@dit.ac.tz</span>
          </div>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>(c) 2026 Cyber Club DIT. All rights reserved.</span>
        <span>Secure. Learn. Build. Lead.</span>
      </div>
    </footer>
  );
}
