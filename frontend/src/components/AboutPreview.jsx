import { services } from '../data/siteData.js';
import Button from './Button.jsx';
import SectionTitle from './SectionTitle.jsx';
import ServiceCard from './ServiceCard.jsx';

export default function AboutPreview() {
  return (
    <section className="section about-preview-section">
      <div className="container split-layout">
        <div className="sticky-copy">
          <SectionTitle
            eyebrow="About Us"
            title="Who We Are"
            text="We are a community of passionate students dedicated to promoting cybersecurity awareness, skills development, and innovation at DIT."
          />
          <Button to="/about" variant="secondary">Learn More About Us</Button>
        </div>
        <div className="services-grid compact-services-grid">
          {services.map((service) => (
            <ServiceCard key={service.title} {...service} />
          ))}
        </div>
      </div>
    </section>
  );
}
