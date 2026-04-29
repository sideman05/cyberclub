import { Code2, LockKeyhole, ShieldCheck, Trophy, UsersRound } from 'lucide-react';
import Button from './Button.jsx';
import CyberVisual from './CyberVisual.jsx';

const signalTags = [
  { label: 'Ethical Labs', icon: ShieldCheck },
  { label: 'CTF Practice', icon: Trophy },
  { label: 'Secure Coding', icon: Code2 },
  { label: 'Digital Safety', icon: LockKeyhole },
];

export default function Hero() {
  return (
    <section className="hero-section">
      <div className="container hero-grid">
        <div className="hero-copy animate-on-scroll fade-up" data-delay="0s">
          <span className="hero-badge">
            <UsersRound size={16} />
            DIT Cybersecurity Community
          </span>
          <h1 className="hero-title">
            <span className="hero-title-line">Secure.</span>
            <span className="hero-title-line">Learn.</span>
            <span className="hero-title-line">Build. <span className="hero-gradient">Lead.</span></span>
          </h1>
          <p className="hero-subtitle">
            Empowering DIT students with cybersecurity skills, ethical hacking knowledge,
            and real-world digital innovation.
          </p>
          <div className="hero-actions">
            <Button to="/contact">Join Cyber Club DIT</Button>
            <Button to="/events" variant="secondary">Explore Events</Button>
          </div>
          <div className="hero-signal-row" aria-label="Cyber Club DIT focus areas">
            {signalTags.map(({ label, icon: Icon }) => (
              <span key={label}>
                <Icon size={15} strokeWidth={2.4} />
                {label}
              </span>
            ))}
          </div>
        </div>
        <div className="hero-visual animate-on-scroll fade-left" data-delay="0.06s">
          <CyberVisual />
        </div>
      </div>
    </section>
  );
}
