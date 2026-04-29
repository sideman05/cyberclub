import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import PageHero from '../components/PageHero.jsx';
import BlogCard from '../components/BlogCard.jsx';
import { publicApi } from '../services/publicApi.js';

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortMode, setSortMode] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const postsPerPage = 4;

  const categories = useMemo(() => {
    const unique = [...new Set(posts.map((post) => post.category))];
    return ['All', ...unique];
  }, [posts]);

  const filteredPosts = useMemo(() => {
    const query = searchValue.trim().toLowerCase();

    let nextPosts = posts.filter((post) => {
      const inCategory = activeCategory === 'All' || post.category === activeCategory;
      if (!inCategory) return false;

      if (!query) return true;
      const haystack = [post.title, post.text, post.category, post.author, ...(post.tags || [])]
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    });

    nextPosts = [...nextPosts].sort((first, second) => {
      const dateA = new Date(first.date).getTime();
      const dateB = new Date(second.date).getTime();
      return sortMode === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return nextPosts;
  }, [activeCategory, posts, searchValue, sortMode]);

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / postsPerPage));
  const pagedPosts = filteredPosts.slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage);
  const featuredPost = filteredPosts[0] || null;

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, searchValue, sortMode]);

  useEffect(() => {
    let active = true;

    publicApi
      .getBlogs()
      .then((data) => {
        if (active) setPosts(data);
      })
      .catch((err) => {
        if (active) setError(err.message || 'Unable to load blog posts.');
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
        badge="Cyber Knowledge"
        title="Latest Cybersecurity Insights"
        text="Knowledge, awareness, and student research for anyone interested in cybersecurity and digital safety."
      />

      <section className="section">
        <div className="container">
          <div className="blog-toolbar glass-panel">
            <label className="blog-search" htmlFor="blog-search-input">
              <Search size={18} />
              <input
                id="blog-search-input"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                type="search"
                placeholder="Search posts, tags, categories..."
              />
            </label>

            <div className="blog-filters">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  className={`blog-chip ${category === activeCategory ? 'active' : ''}`}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>

            <label className="blog-sort" htmlFor="blog-sort-select">
              Sort
              <select
                id="blog-sort-select"
                value={sortMode}
                onChange={(event) => setSortMode(event.target.value)}
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
            </label>
          </div>

          {loading && <div className="public-state glass-panel">Loading blog posts...</div>}
          {!loading && error && <div className="public-state glass-panel public-state-error">{error}</div>}

          {!loading && !error && featuredPost && (
            <article className="blog-feature glass-panel">
              <div className="blog-feature-top">
                <span className="eyebrow">Featured Article</span>
                <small>{featuredPost.date} • {featuredPost.readTime}</small>
              </div>
              <h2>{featuredPost.title}</h2>
              <p>{featuredPost.text}</p>
              <div className="blog-feature-meta">
                <span>{featuredPost.author}</span>
                <div>
                  {(featuredPost.tags || []).map((tag) => (
                    <small key={tag}>{tag}</small>
                  ))}
                </div>
              </div>
              <button
                className="button button-primary"
                type="button"
                onClick={() => navigate(`/blog/${featuredPost.id}`)}
              >
                Read Featured Article
              </button>
            </article>
          )}

          {!loading && !error && pagedPosts.length > 0 ? (
            <>
              <div className="blog-grid full-grid">
                {pagedPosts.map((post, index) => (
                  <BlogCard
                    key={post.id || post.title}
                    {...post}
                    delay={index * 85}
                    onRead={() => navigate(`/blog/${post.id}`)}
                  />
                ))}
              </div>

              <div className="blog-pagination">
                <button
                  type="button"
                  className="blog-page-btn"
                  onClick={() => setCurrentPage((previous) => Math.max(1, previous - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <span>Page {currentPage} of {totalPages}</span>
                <button
                  type="button"
                  className="blog-page-btn"
                  onClick={() => setCurrentPage((previous) => Math.min(totalPages, previous + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            </>
          ) : !loading && !error ? (
            <div className="blog-empty glass-panel">
              <h3>No posts matched your search</h3>
              <p>Try another keyword or reset to the "All" category to explore more articles.</p>
            </div>
          ) : null}
        </div>
      </section>

      {/* Article pages opened via /blog/:id; modal preview removed in favor of full page routes */}
    </>
  );
}
