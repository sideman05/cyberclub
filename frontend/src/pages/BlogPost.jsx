import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { publicApi } from '../services/publicApi.js';

function getViewsKey(id) {
  return `post:views:${id}`;
}

function getCommentsKey(id) {
  return `post:comments:${id}`;
}

export default function BlogPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [views, setViews] = useState(0);
  const [comments, setComments] = useState([]);
  const [name, setName] = useState('');
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError('');
    publicApi
      .getBlog(id)
      .then((data) => {
        if (active) setPost(data);
      })
      .catch((err) => {
        if (active) setError(err.message || 'Unable to load this article.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    if (!post) return;
    const key = getViewsKey(id);
    const stored = parseInt(localStorage.getItem(key) || '0', 10) || 0;
    const next = stored + 1;
    localStorage.setItem(key, String(next));
    setViews(next);

    const cKey = getCommentsKey(id);
    const storedComments = JSON.parse(localStorage.getItem(cKey) || '[]');
    setComments(storedComments);
  }, [id, post]);

  if (loading) {
    return (
      <section className="section">
        <div className="container">
          <div className="public-state glass-panel">Loading article...</div>
        </div>
      </section>
    );
  }

  if (error || !post) {
    return (
      <section className="section">
        <div className="container">
          <h2>Article not found</h2>
          <p>{error || "We couldn't locate that article."} Try the <button type="button" className="text-link" onClick={() => navigate('/blog')}>blog index</button>.</p>
        </div>
      </section>
    );
  }

  const url = typeof window !== 'undefined' ? window.location.href : `${window.location.origin}/blog/${id}`;
  const contentParagraphs = (post.content || post.text || '')
    .split(/(?<=[.!?])\s+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  function shareToWhatsApp() {
    const share = encodeURIComponent(`${post.title} — ${url}`);
    window.open(`https://wa.me/?text=${share}`, '_blank');
  }

  function shareToX() {
    const share = encodeURIComponent(`${post.title} — ${url}`);
    window.open(`https://twitter.com/intent/tweet?text=${share}`, '_blank');
  }

  function shareToLinkedIn() {
    const share = encodeURIComponent(url);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${share}`, '_blank');
  }

  function shareToInstagramFallback() {
    // Instagram doesn't support direct link sharing to feed from web. Copy link as fallback.
    navigator.clipboard?.writeText(url).then(() => {
      alert('Post link copied to clipboard — open Instagram and paste in your story or DM.');
    }).catch(() => {
      prompt('Copy this link to share on Instagram:', url);
    });
  }

  function copyLink() {
    navigator.clipboard?.writeText(url).then(() => {
      alert('Link copied to clipboard');
    }).catch(() => {
      prompt('Copy this link:', url);
    });
  }

  function submitComment(event) {
    event.preventDefault();
    const cKey = getCommentsKey(id);
    const newComment = {
      id: Date.now(),
      name: name || 'Anonymous',
      text: commentText,
      date: new Date().toISOString(),
    };
    const updated = [newComment, ...comments];
    localStorage.setItem(cKey, JSON.stringify(updated));
    setComments(updated);
    setName('');
    setCommentText('');
  }

  return (
    <>
      <section className="section">
        <div className="container">
          <div className="blog-post-shell">
            <article className="blog-article glass-panel">
              <div className="blog-article-top">
                <button type="button" className="blog-back-link" onClick={() => navigate('/blog')}>
                  ← Back to Blog
                </button>
                <div className="blog-article-stats">
                  <span>{post.readTime}</span>
                  <span>{views} views</span>
                </div>
              </div>

              <div className="blog-article-meta">
                <div>
                  <span className="eyebrow">{post.category}</span>
                  <h2 className="blog-article-title">{post.title}</h2>
                  <div className="blog-article-byline">
                    <strong>{post.author}</strong>
                    <small>{post.date}</small>
                  </div>
                </div>
                <div className="blog-share">
                  <button type="button" className="blog-share-btn" onClick={shareToWhatsApp}>WhatsApp</button>
                  <button type="button" className="blog-share-btn" onClick={shareToX}>X</button>
                  <button type="button" className="blog-share-btn" onClick={shareToLinkedIn}>LinkedIn</button>
                  <button type="button" className="blog-share-btn" onClick={shareToInstagramFallback}>Instagram</button>
                  <button type="button" className="blog-share-btn blog-share-btn-alt" onClick={copyLink}>Copy Link</button>
                </div>
              </div>

              <div className="blog-article-hero">
                <div className="blog-article-hero-mark">
                  <span>{post.category}</span>
                  <strong>{post.readTime}</strong>
                </div>
                <p className="blog-article-intro">{post.text}</p>
                {post.image && (
                  <div className="blog-article-cover-wrap">
                    <img src={post.image} alt={`${post.title} cover`} className="blog-cover" width="960" height="420" decoding="async" fetchPriority="high" />
                  </div>
                )}
              </div>

              <article className="blog-body blog-article-content">
                {contentParagraphs.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </article>

              <div className="blog-article-tags">
                {(post.tags || []).map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>

              <section className="comments">
                <div className="comments-head">
                  <div>
                    <span className="eyebrow">Discussion</span>
                    <h3>Comments</h3>
                  </div>
                  <small>{comments.length} comment{comments.length === 1 ? '' : 's'}</small>
                </div>

                <form onSubmit={submitComment} className="comment-form">
                  <div className="comment-form-row">
                    <input placeholder="Your name (optional)" value={name} onChange={(e) => setName(e.target.value)} />
                    <input value={url} readOnly aria-label="Article link" />
                  </div>
                  <textarea placeholder="Write a comment" value={commentText} onChange={(e) => setCommentText(e.target.value)} required />
                  <div className="comment-form-actions">
                    <button type="submit" className="button button-primary">Post comment</button>
                    <button type="button" className="button button-secondary" onClick={() => { setName(''); setCommentText(''); }}>Reset</button>
                  </div>
                </form>

                <div className="comment-list">
                  {comments.length === 0 ? (
                    <div className="comment comment-empty">
                      <strong>No comments yet</strong>
                      <p>Be the first to start the discussion on this article.</p>
                    </div>
                  ) : (
                    comments.map((c) => (
                      <div key={c.id} className="comment">
                        <div className="comment-meta">
                          <strong>{c.name}</strong>
                          <small>{new Date(c.date).toLocaleString()}</small>
                        </div>
                        <p>{c.text}</p>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </article>

            <aside className="blog-sidebar glass-panel">
              <div className="blog-sidebar-section">
                <span className="eyebrow">Post Overview</span>
                <ul className="blog-sidebar-list">
                  <li><span>Author</span><strong>{post.author}</strong></li>
                  <li><span>Published</span><strong>{post.date}</strong></li>
                  <li><span>Read time</span><strong>{post.readTime}</strong></li>
                  <li><span>Views</span><strong>{views}</strong></li>
                </ul>
              </div>

              <div className="blog-sidebar-section">
                <span className="eyebrow">Share</span>
                <p>Open the share tools to send this post through your favorite platform.</p>
                <div className="blog-sidebar-actions">
                  <button type="button" className="button button-secondary" onClick={shareToWhatsApp}>WhatsApp</button>
                  <button type="button" className="button button-secondary" onClick={shareToX}>X</button>
                  <button type="button" className="button button-secondary" onClick={shareToLinkedIn}>LinkedIn</button>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
