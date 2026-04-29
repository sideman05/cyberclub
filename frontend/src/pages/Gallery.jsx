import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import PageHero from '../components/PageHero.jsx';
import GalleryCard from '../components/GalleryCard.jsx';
import { publicApi } from '../services/publicApi.js';
import { lockPageScroll } from '../utils/lockPageScroll.js';

export default function Gallery() {
  const [galleryItems, setGalleryItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    publicApi
      .getGallery()
      .then((data) => {
        if (active) setGalleryItems(data);
      })
      .catch((err) => {
        if (active) setError(err.message || 'Unable to load gallery.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedItem) return undefined;

    const unlockPageScroll = lockPageScroll();

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setSelectedItem(null);
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      unlockPageScroll();
    };
  }, [selectedItem]);

  const previewItem = useMemo(() => selectedItem, [selectedItem]);

  return (
    <>
      <PageHero
        badge="Club Moments"
        title="CyberClub Gallery"
        text="A visual look at our workshops, trainings, competitions, tech talks, and community events."
      />

      <section className="section">
        <div className="container">
          {loading && <div className="public-state glass-panel">Loading gallery...</div>}
          {!loading && error && <div className="public-state glass-panel public-state-error">{error}</div>}
          {!loading && !error && galleryItems.length === 0 && (
            <div className="public-state glass-panel">No gallery images have been posted yet.</div>
          )}
          {!loading && !error && galleryItems.length > 0 && (
            <div className="gallery-grid">
              {galleryItems.map((item, index) => (
                <GalleryCard
                  key={item.id || item.title}
                  {...item}
                  delay={index * 90}
                  onPreview={() => setSelectedItem(item)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {previewItem && createPortal(
        <div
          className="gallery-preview-backdrop"
          role="presentation"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="gallery-preview-panel glass-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="gallery-preview-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="gallery-preview-close"
              type="button"
              onClick={() => setSelectedItem(null)}
              aria-label="Close preview"
            >
              ×
            </button>
            <img
              className="gallery-preview-image"
              src={previewItem.image}
              alt={previewItem.imageAlt || `${previewItem.title} gallery preview`}
              width="920"
              height="620"
              decoding="async"
            />
            <div className="gallery-preview-copy">
              <span className="eyebrow">Gallery Preview</span>
              <h3 id="gallery-preview-title">{previewItem.title}</h3>
              <span className="role-badge">{previewItem.category}</span>
              <p>{previewItem.description || `A highlighted moment from our ${previewItem.category.toLowerCase()} showcasing the club’s cybersecurity culture and student energy.`}</p>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
