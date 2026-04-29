import { memo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock3, MapPin } from 'lucide-react';

function EventCard({ id, day, month, title, location, time, text, image }) {
  return (
    <article className="event-card">
      <div className="event-card-media">
        <img src={image} alt={`${title} event cover`} width="520" height="360" loading="lazy" decoding="async" />
        <div className="event-date">
          <span>{month}</span>
          <strong>{day}</strong>
        </div>
      </div>
      <div className="event-content">
        <h3>{title}</h3>
        <div className="event-meta">
          <span><MapPin size={15} /> {location}</span>
          <span><Clock3 size={15} /> {time}</span>
        </div>
        <p>{text}</p>
        <div className="event-actions">
          <Link className="text-link event-link-button" to={`/events/${id}`}>
            Learn More <ArrowRight size={16} />
          </Link>
          <Link className="button button-secondary event-join-button" to={`/events/${id}/join`}>
            Join This Event
          </Link>
        </div>
      </div>
    </article>
  );
}

export default memo(EventCard);
