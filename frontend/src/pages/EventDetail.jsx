import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CalendarDays, Clock3, MapPin, UsersRound } from 'lucide-react';
import { publicApi } from '../services/publicApi.js';

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError('');
    publicApi
      .getEvent(id)
      .then((data) => {
        if (active) setEvent(data);
      })
      .catch((err) => {
        if (active) setError(err.message || 'Unable to load this event.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <section className="section">
        <div className="container">
          <div className="public-state glass-panel">Loading event...</div>
        </div>
      </section>
    );
  }

  if (error || !event) {
    return (
      <section className="section">
        <div className="container">
          <div className="glass-panel event-detail-empty">
            <h2>Event not found</h2>
            <p>{error || 'The event you tried to open does not exist.'}</p>
            <button type="button" className="button button-primary" onClick={() => navigate('/events')}>
              Back to Events
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section event-detail-section">
      <div className="container">
        <article className="event-detail-card glass-panel">
          <div className="event-detail-hero">
            <img src={event.image} alt={`${event.title} cover`} width="1180" height="520" decoding="async" fetchPriority="high" />
            <div className="event-detail-hero-overlay" />
            <div className="event-detail-hero-copy">
              <span className="eyebrow">{event.category || 'Event'}</span>
              <h1>{event.title}</h1>
              <p>{event.text}</p>
            </div>
          </div>

          <div className="event-detail-body">
            <div className="event-detail-meta-grid">
              <div className="event-detail-meta-item"><CalendarDays size={18} /><span>{event.month} {event.day}, {event.year || 'TBA'}</span></div>
              <div className="event-detail-meta-item"><MapPin size={18} /><span>{event.location}</span></div>
              <div className="event-detail-meta-item"><Clock3 size={18} /><span>{event.time}</span></div>
              <div className="event-detail-meta-item"><UsersRound size={18} /><span>Open to DIT students</span></div>
            </div>

            <div className="event-detail-grid">
              <div className="event-detail-section">
                <span className="eyebrow">About this event</span>
                <h2>What to expect</h2>
                <p>{event.description || event.text}</p>
              </div>
            </div>

            <div className="event-detail-join-box">
              <span className="eyebrow">Ready to join?</span>
              <h2>Join this event</h2>
              <p>Fill out the join form to reserve your spot and receive event updates.</p>
              <button type="button" className="button button-primary" onClick={() => navigate(`/events/${event.id}/join`)}>
                Join This Event
              </button>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
