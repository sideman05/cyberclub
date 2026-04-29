import { memo } from 'react';
import { ExternalLink } from 'lucide-react';

function LeaderCard({ fullName, position, bio, image, imageAlt, linkedinUrl, githubUrl, onPreview, delay = 0 }) {
  return (
    <article className="leader-card" style={{ '--leader-delay': `${delay}ms` }}>
      <button
        className="leader-media"
        type="button"
        onClick={onPreview}
        aria-label={`Preview image for ${fullName}`}
      >
        <img src={image} alt={imageAlt || `${fullName} portrait`} width="640" height="480" loading="lazy" decoding="async" />
        <span className="leader-image-overlay">Preview image</span>
      </button>

      <div className="leader-card-body">
        <div className="leader-name-row">
          <h3>{fullName}</h3>
          <span className="role-badge">{position}</span>
        </div>
        <p>{bio}</p>
        <div className="leader-socials" aria-label={`${fullName} social links`}>
          {linkedinUrl && (
            <a href={linkedinUrl} target="_blank" rel="noreferrer" aria-label="LinkedIn">
              <ExternalLink size={18} />
            </a>
          )}
          {githubUrl && (
            <a href={githubUrl} target="_blank" rel="noreferrer" aria-label="GitHub">
              <ExternalLink size={18} />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

export default memo(LeaderCard);
