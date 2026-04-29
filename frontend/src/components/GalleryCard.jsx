import { memo } from 'react';

function GalleryCard({ title, category, icon: Icon, tone = 'blue', image, imageAlt, onPreview, delay = 0 }) {
  return (
    <article className={`gallery-card gallery-${tone}`} style={{ '--gallery-delay': `${delay}ms` }}>
      <button
        className="gallery-media"
        type="button"
        onClick={onPreview}
        aria-label={`Preview image for ${title}`}
      >
        <img src={image} alt={imageAlt || `${title} gallery preview`} width="640" height="420" loading="lazy" decoding="async" />
        <span className="gallery-preview-chip">Preview image</span>
      </button>
      <div className="gallery-pattern" />
      <div className="gallery-icon"><Icon size={46} /></div>
      <div className="gallery-overlay">
        <span>{category}</span>
        <h3>{title}</h3>
      </div>
    </article>
  );
}

export default memo(GalleryCard);
