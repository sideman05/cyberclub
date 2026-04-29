import PageHero from '../components/PageHero.jsx';
import ContactForm from '../components/ContactForm.jsx';
import { contactDetails, socials } from '../data/siteData.js';
import { Camera, Code2, Network, Send } from 'lucide-react';

const socialIcons = [Network, Camera, Send, Code2];

export default function Contact() {
  return (
    <>
      <PageHero
        badge="Get In Touch"
        title="Contact DIT CyberClub"
        text="Reach out to join the club, collaborate on cybersecurity programs, or ask questions about our upcoming activities."
      />

      <section className="section">
        <div className="container contact-grid">
          <div className="contact-details glass-panel">
            <span className="eyebrow">Contact Details</span>
            <h2>Ready to join or collaborate?</h2>
            <p>
              Send us a message and our team will guide you through membership,
              events, workshops, and student-led cybersecurity activities.
            </p>

            <div className="contact-list">
              {contactDetails.map((detail) => {
                const Icon = detail.icon;
                return (
                  <div className="contact-item" key={detail.label}>
                    <Icon size={22} />
                    <div>
                      <small>{detail.label}</small>
                      <strong>{detail.value}</strong>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="social-row social-row-large">
              {socials.map((social, index) => {
                const Icon = socialIcons[index];
                return <a href="#" aria-label={social} key={social}><Icon size={18} /></a>;
              })}
            </div>
          </div>

          <div className="contact-form-card glass-panel">
            <span className="eyebrow" >Send Message</span>
            <h2>Tell us how we can help</h2>
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
