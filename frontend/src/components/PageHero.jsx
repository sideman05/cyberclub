export default function PageHero({ badge, title, text, children, backgroundImage, backgroundPosition = 'center center' }) {
  return (
    <section
      className={`page-hero ${backgroundImage ? 'page-hero--image' : ''}`}
      style={backgroundImage ? { '--page-hero-image': `url(${backgroundImage})`, '--page-hero-position': backgroundPosition } : undefined}
    >
      {backgroundImage && <div className="page-hero-image" aria-hidden="true" />}
      <div className="container page-hero-inner animate-on-scroll fade-up">
        <span className="eyebrow hero-eyebrow page-hero-badge">{badge}</span>
        <h1 className="page-hero-title">{title}</h1>
        <p className="page-hero-text">{text}</p>
        {children && <div className="page-hero-extra">{children}</div>}
      </div>
    </section>
  );
}
