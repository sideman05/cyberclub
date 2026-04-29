import { useEffect, useState } from 'react';
import PageHero from '../components/PageHero.jsx';
import EventCard from '../components/EventCard.jsx';
import { publicApi } from '../services/publicApi.js';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    publicApi
      .getEvents()
      .then((data) => {
        if (active) setEvents(data);
      })
      .catch((err) => {
        if (active) setError(err.message || 'Unable to load events.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <PageHero
        badge="Upcoming Events"
        title="Learn, Compete, and Connect"
        text="Join upcoming workshops, bootcamps, CTF competitions, and digital safety programs organized by DIT CyberClub."
      />

      <section className="section">
        <div className="container">
          {loading && <div className="public-state glass-panel">Loading events...</div>}
          {!loading && error && <div className="public-state glass-panel public-state-error">{error}</div>}
          {!loading && !error && events.length === 0 && (
            <div className="public-state glass-panel">No public events have been posted yet.</div>
          )}
          {!loading && !error && events.length > 0 && (
            <div className="events-grid full-events-grid">
              {events.map((event) => <EventCard key={event.id} {...event} />)}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
