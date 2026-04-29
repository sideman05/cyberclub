import PageHero from '../components/PageHero.jsx';
import SectionTitle from '../components/SectionTitle.jsx';
import ServiceCard from '../components/ServiceCard.jsx';
import Button from '../components/Button.jsx';
import { aboutHighlights, services, values } from '../data/siteData.js';
import { Eye, Flag, Target } from 'lucide-react';

export default function About() {
  return (
    <>
      <PageHero
        badge="About Us"
        title="About DIT CyberClub"
        text="We build cybersecurity awareness, practical skills, ethical hacking knowledge, and student innovation at Dar es Salaam Institute of Technology."
      />

      <section className="section">
        <div className="container split-layout">
          <div className="glass-panel mission-panel large-panel">
            <span className="eyebrow">Who We Are</span>
            <h2>A student community focused on real cyber skills</h2>
            <p>
              DIT CyberClub brings together students interested in cybersecurity, ethical hacking,
              digital safety, networking, Linux, CTF competitions, and technology innovation.
            </p>
            <Button to="/leaders" variant="secondary">Meet The Leaders</Button>
          </div>
          <div className="highlight-stack">
            {aboutHighlights.map((item) => {
              const Icon = item.icon;
              return (
                <article className="highlight-card" key={item.title}>
                  <Icon size={24} />
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section section-muted">
        <div className="container mission-grid">
          <article className="mission-box">
            <Target size={34} />
            <span className="eyebrow">Mission</span>
            <h2>Empower students with practical cybersecurity skills</h2>
            <p>
              To empower DIT students with practical cybersecurity skills, ethical hacking knowledge,
              and digital safety awareness.
            </p>
          </article>
          <article className="mission-box">
            <Eye size={34} />
            <span className="eyebrow">Vision</span>
            <h2>Become a leading student cyber community</h2>
            <p>
              To become a leading student cybersecurity community that inspires innovation, ethical
              digital practices, and real-world problem solving.
            </p>
          </article>
          <article className="mission-box">
            <Flag size={34} />
            <span className="eyebrow">Purpose</span>
            <h2>Promote safe and responsible technology</h2>
            <p>
              We help students learn, build, and lead with responsibility while creating impact across campus.
            </p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionTitle
            center
            eyebrow="What We Do"
            title="Cybersecurity activities that build confidence"
            text="Every activity is designed to make students more skilled, aware, and ready for real-world technology challenges."
          />
          <div className="services-grid">
            {services.map((service) => <ServiceCard key={service.title} {...service} />)}
          </div>
        </div>
      </section>

      <section className="section section-muted">
        <div className="container">
          <SectionTitle
            center
            eyebrow="Our Values"
            title="The principles behind our community"
            text="These values guide how we learn, collaborate, and represent the cybersecurity field."
          />
          <div className="values-grid">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <article className="value-card" key={value.title}>
                  <Icon size={25} />
                  <h3>{value.title}</h3>
                  <p>{value.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
