import { Crosshair, LockKeyhole, ShieldCheck } from 'lucide-react';
import { terminalLines } from '../data/siteData.js';

export default function CyberVisual() {
  return (
    <div className="cyber-visual" aria-label="Cybersecurity visual">
      <div className="circuit-layer circuit-layer-left" />
      <div className="circuit-layer circuit-layer-right" />
      <div className="visual-grid" />

      <div className="holo-field">
        <div className="orbit orbit-one"><span /></div>
        <div className="orbit orbit-two"><span /></div>
        <div className="central-shield">
          <div className="shield-glow" />
          <div className="shield-face">
            <ShieldCheck size={116} strokeWidth={1.5} />
            <span className="shield-lock">
              <LockKeyhole size={34} strokeWidth={2.5} />
            </span>
          </div>
        </div>
        <div className="holo-base">
          <span />
          <span />
          <span />
        </div>
      </div>

      <div className="terminal-card">
        <div className="terminal-topbar">
          <span />
          <span />
          <span />
          <strong>Cyber Terminal</strong>
        </div>
        <div className="terminal-body">
          {terminalLines.map((line, index) => (
            <p
              key={line}
              className={index === 1 || index === 3 ? 'line-hot' : ''}
              style={{ '--terminal-line-delay': `${360 + index * 115}ms` }}
            >
              {line}
            </p>
          ))}
        </div>
      </div>

      <div className="system-card">
        <Crosshair size={34} strokeWidth={2.1} />
        <div>
          <small>Status</small>
          <strong>All Systems Secure</strong>
        </div>
        <div className="status-bars">
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  );
}
