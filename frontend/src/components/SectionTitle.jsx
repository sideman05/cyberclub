import { memo } from 'react';

function SectionTitle({ eyebrow, title, text, center = false }) {
  return (
    <div className={`section-title ${center ? 'section-title-center' : ''} animate-on-scroll fade-up`} data-delay="0s">
      {eyebrow && <span className="eyebrow section-title-badge">{eyebrow}</span>}
      <h2 className="section-title-heading">{title}</h2>
      {text && <p className="section-title-text">{text}</p>}
    </div>
  );
}

export default memo(SectionTitle);
