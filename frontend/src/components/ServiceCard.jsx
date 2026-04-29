import { memo } from 'react';

function ServiceCard({ title, text, icon: Icon }) {
  return (
    <article className="service-card">
      <div className="card-icon"><Icon size={24} /></div>
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  );
}

export default memo(ServiceCard);
