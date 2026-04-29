import { useEffect, useRef, useState } from 'react';
import { stats } from '../data/siteData.js';

function parseStatValue(value) {
  const match = String(value).match(/^(\d+)(.*)$/);
  if (!match) return { number: 0, suffix: String(value) };
  return { number: Number(match[1]), suffix: match[2] || '' };
}

export default function StatsPanel() {
  const panelRef = useRef(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return undefined;

    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      setProgress(1);
      return undefined;
    }

    let animationFrame = 0;
    let startTime = 0;

    const animate = (time) => {
      if (!startTime) startTime = time;
      const nextProgress = Math.min((time - startTime) / 760, 1);
      setProgress(1 - Math.pow(1 - nextProgress, 3));

      if (nextProgress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    const observer = new IntersectionObserver((entries, obs) => {
      if (entries[0]?.isIntersecting) {
        animationFrame = requestAnimationFrame(animate);
        obs.disconnect();
      }
    }, { threshold: 0.35 });

    observer.observe(panel);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <section className="stats-section">
      <div className="container">
        <div className="stats-panel" ref={panelRef}>
          {stats.map((stat) => {
            const Icon = stat.icon;
            const { number, suffix } = parseStatValue(stat.value);
            const displayValue = progress >= 0.995
              ? stat.value
              : `${Math.round(number * progress)}${suffix}`;

            return (
              <div className="stat-card" key={stat.label}>
                <Icon size={26} />
                <strong>{displayValue}</strong>
                <span>{stat.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
