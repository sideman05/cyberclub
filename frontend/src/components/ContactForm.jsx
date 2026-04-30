import { useState } from 'react';
import { publicApi } from '../services/publicApi.js';

export default function ContactForm() {
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [busy, setBusy] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setStatus({ type: '', message: '' });

    try {
      await publicApi.sendContactMessage(form);
      setForm({ full_name: '', email: '', subject: '', message: '' });
      setStatus({ type: 'success', message: 'Message sent successfully. We will get back to you soon.' });
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Unable to send your message right now.' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      {status.message && (
        <div className={`form-alert ${status.type === 'error' ? 'form-alert-error' : ''}`}>
          {status.message}
        </div>
      )}
      <label>
        <span>Full Name</span>
        <input name="full_name" type="text" placeholder="Enter your full name" value={form.full_name} onChange={handleChange} required />
      </label>
      <label>
        <span>Email</span>
        <input name="email" type="email" placeholder="name@example.com" value={form.email} onChange={handleChange} required />
      </label>
      <label>
        <span>Subject</span>
        <input name="subject" type="text" placeholder="How can we help?" value={form.subject} onChange={handleChange} required />
      </label>
      <label className="field-full">
        <span>Message</span>
        <textarea name="message" placeholder="Write your message here" value={form.message} onChange={handleChange} required />
      </label>
      <button className="button button-primary contact-form-submit" type="submit" disabled={busy}>
        <span>{busy ? 'Sending...' : 'Send Message'}</span>
      </button>
    </form>
  );
}
