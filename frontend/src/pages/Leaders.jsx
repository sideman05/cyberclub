import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import PageHero from '../components/PageHero.jsx';
import SectionTitle from '../components/SectionTitle.jsx';
import LeaderCard from '../components/LeaderCard.jsx';
import Button from '../components/Button.jsx';
import { publicApi } from '../services/publicApi.js';
import { lockPageScroll } from '../utils/lockPageScroll.js';
import { leaders as fallbackLeaders } from '../data/siteData.js';
import { ShieldCheck, UsersRound } from 'lucide-react';

function toLeaderCard(item, index) {
  return {
    id: item.id || item.fullName || `leader-${index}`,
    fullName: item.fullName || item.full_name || 'Cyber Club DIT Leader',
    position: item.position || 'Leader',
    bio: item.bio || '',
    image: item.image || item.image_path || '',
    imageAlt: item.imageAlt || `${item.fullName || item.full_name || 'Cyber Club DIT Leader'} portrait`,
    linkedinUrl: item.linkedinUrl || item.linkedin_url,
    githubUrl: item.githubUrl || item.twitter_url || item.github_url,
  };
}

export default function Leaders() {
  const [leaders, setLeaders] = useState([]);
  const [selectedLeader, setSelectedLeader] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    publicApi
      .getLeaders()
      .then((data) => {
        if (!active) return;

        if (data.length > 0) {
          setLeaders(data);
          return;
        }

        setLeaders(fallbackLeaders.map(toLeaderCard));
      })
      .catch((err) => {
        if (!active) return;

        if (fallbackLeaders.length > 0) {
          setLeaders(fallbackLeaders.map(toLeaderCard));
          setError('');
          return;
        }

        setError(err.message || 'Unable to load leaders.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedLeader) return undefined;

    const unlockPageScroll = lockPageScroll();

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setSelectedLeader(null);
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      unlockPageScroll();
    };
  }, [selectedLeader]);

  const previewLeader = useMemo(() => selectedLeader, [selectedLeader]);

  return (
    <div className="leaders-page leaders-page--static">
      <PageHero
        badge="Meet Our Team"
        title="Cyber Club DIT Leaders"
        text="Meet the dedicated leaders driving cybersecurity awareness, innovation, and student growth at DIT."
      />

      <section className="section">
        <div className="container">
          {loading && <div className="public-state glass-panel">Loading leaders...</div>}
          {!loading && error && <div className="public-state glass-panel public-state-error">{error}</div>}
          {!loading && !error && leaders.length === 0 && (
            <div className="public-state glass-panel">No active leaders have been posted yet.</div>
          )}
          {!loading && !error && leaders.length > 0 && (
            <div className="leaders-grid">
              {leaders.map((leader, index) => (
                <LeaderCard
                  key={leader.id || leader.fullName}
                  {...leader}
                  delay={index * 90}
                  onPreview={() => setSelectedLeader(leader)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section section-muted">
        <div className="container leadership-cta glass-panel">
          <div>
            <span className="eyebrow">Together We Lead</span>
            <h2>Together we secure, learn, build, and lead</h2>
            <p>
              Our leadership team coordinates training, events, media, technical practice,
              and community initiatives so members can grow with confidence.
            </p>
          </div>
          <div className="cta-icons">
            <ShieldCheck size={42} />
            <UsersRound size={42} />
          </div>
          <Button to="/contact">Join Cyber Club DIT</Button>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionTitle
            center
            eyebrow="Leadership Culture"
            title="Built around service and responsibility"
            text="Every leader is expected to support members, organize learning opportunities, and promote ethical cybersecurity practices."
          />
        </div>
      </section>

      {previewLeader && createPortal(
        <div
          className="leader-preview-backdrop"
          role="presentation"
          onClick={() => setSelectedLeader(null)}
        >
          <div
            className="leader-preview-panel glass-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="leader-preview-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="leader-preview-close"
              type="button"
              onClick={() => setSelectedLeader(null)}
              aria-label="Close preview"
            >
              ×
            </button>
            <img
              className="leader-preview-image"
              src={previewLeader.image}
              alt={previewLeader.imageAlt || `${previewLeader.fullName} portrait`}
              width="860"
              height="620"
              decoding="async"
            />
            <div className="leader-preview-copy">
              <span className="eyebrow">Leader Preview</span>
              <h3 id="leader-preview-title">{previewLeader.fullName}</h3>
              <span className="role-badge">{previewLeader.position}</span>
              <p>{previewLeader.bio}</p>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
