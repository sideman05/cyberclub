import { memo } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

function BlogCard({ id, title, category, date, text, icon: Icon, image, readTime, onRead, delay = 0 }) {
  const articlePath = id ? `/blog/${id}` : '/blog';

  return (
    <article className="blog-card" style={{ '--blog-delay': `${delay}ms` }}>
      <div className="blog-media">
        {image ? <img src={image} alt={`${title} cover`} width="640" height="360" loading="lazy" decoding="async" /> : <Icon size={42} />}
        <span>{category}</span>
      </div>
      <div className="blog-body">
        <div className="card-kicker">
          <span>{category}</span>
          <small>{date}{readTime ? ` • ${readTime}` : ''}</small>
        </div>
        <h3>{title}</h3>
        <p>{text}</p>
        {onRead ? (
          <button className="text-link" type="button" onClick={onRead}>
            Read Article <ArrowRight size={16} />
          </button>
        ) : (
          <Link className="text-link" to={articlePath}>
            Read More <ArrowRight size={16} />
          </Link>
        )}
      </div>
    </article>
  );
}

export default memo(BlogCard);
