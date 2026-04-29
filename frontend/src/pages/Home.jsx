import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, CalendarDays, Clock3, MapPin, Search, ShieldCheck, Sparkles } from 'lucide-react';
import Hero from '../components/Hero.jsx';
import StatsPanel from '../components/StatsPanel.jsx';
import AboutPreview from '../components/AboutPreview.jsx';
import SectionTitle from '../components/SectionTitle.jsx';
import ServiceCard from '../components/ServiceCard.jsx';
import BlogCard from '../components/BlogCard.jsx';
import EventCard from '../components/EventCard.jsx';
import Button from '../components/Button.jsx';
import { services, values } from '../data/siteData.js';
import { publicApi } from '../services/publicApi.js';

const contentFilters = [
  { label: 'All', value: 'all' },
  { label: 'Events', value: 'event' },
  { label: 'Blog', value: 'blog' },
  { label: 'Skills', value: 'skill' },
];

function eventDate(event) {
  const year = event.year || new Date().getFullYear();
  const date = new Date(`${event.month} ${event.day}, ${year}`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function daysUntil(event) {
  const date = eventDate(event);
  if (!date) return 'TBA';

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  const diff = Math.ceil((date.getTime() - today.getTime()) / 86400000);

  if (diff < 0) return 'Soon';
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  return `${diff} days`;
}

export default function Home() {
  const [content, setContent] = useState({ blogs: [], events: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [insightSearch, setInsightSearch] = useState('');
  const [insightCategory, setInsightCategory] = useState('All');
  const [insightSort, setInsightSort] = useState('newest');

  useEffect(() => {
    let active = true;

    Promise.all([publicApi.getBlogs({ limit: 6 }), publicApi.getEvents({ limit: 6 })])
      .then(([blogs, events]) => {
        if (active) setContent({ blogs, events });
      })
      .catch((err) => {
        if (active) setError(err.message || 'Unable to load live content.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const nextEvent = useMemo(() => {
    return [...content.events].sort((first, second) => {
      const firstDate = eventDate(first)?.getTime() || Number.MAX_SAFE_INTEGER;
      const secondDate = eventDate(second)?.getTime() || Number.MAX_SAFE_INTEGER;
      return firstDate - secondDate;
    })[0] || null;
  }, [content.events]);

  const commandItems = useMemo(() => {
    const eventItems = content.events.map((event) => ({
      type: 'event',
      eyebrow: 'Event',
      title: event.title,
      text: event.text,
      meta: `${event.month} ${event.day} • ${event.time}`,
      to: `/events/${event.id}`,
      icon: CalendarDays,
    }));

    const blogItems = content.blogs.map((post) => ({
      type: 'blog',
      eyebrow: post.category || 'Blog',
      title: post.title,
      text: post.text,
      meta: post.readTime || post.date,
      to: `/blog/${post.id}`,
      icon: BookOpen,
    }));

    const skillItems = services.map((service) => ({
      type: 'skill',
      eyebrow: 'Skill Track',
      title: service.title,
      text: service.text,
      meta: 'Start learning',
      to: '/about',
      icon: service.icon || ShieldCheck,
    }));

    const query = search.trim().toLowerCase();

    return [...eventItems, ...blogItems, ...skillItems]
      .filter((item) => activeFilter === 'all' || item.type === activeFilter)
      .filter((item) => {
        if (!query) return true;
        return [item.eyebrow, item.title, item.text, item.meta].join(' ').toLowerCase().includes(query);
      })
      .slice(0, 6);
  }, [activeFilter, content.blogs, content.events, search]);

  const insightCategories = useMemo(() => {
    const categories = [...new Set(content.blogs.map((post) => post.category).filter(Boolean))];
    return ['All', ...categories];
  }, [content.blogs]);

  const homepageInsights = useMemo(() => {
    const query = insightSearch.trim().toLowerCase();

    return [...content.blogs]
      .filter((post) => insightCategory === 'All' || post.category === insightCategory)
      .filter((post) => {
        if (!query) return true;
        return [post.title, post.text, post.category, post.author, ...(post.tags || [])].join(' ').toLowerCase().includes(query);
      })
      .sort((first, second) => {
        const firstDate = new Date(first.date).getTime() || 0;
        const secondDate = new Date(second.date).getTime() || 0;
        return insightSort === 'oldest' ? firstDate - secondDate : secondDate - firstDate;
      })
      .slice(0, 4);
  }, [content.blogs, insightCategory, insightSearch, insightSort]);

  return (
    <>
      <Hero />
      <StatsPanel />

      <section className="section user-command-section">
        <div className="container user-command-grid">
          <div className="user-command-panel glass-panel">
            <div className="user-command-head">
              <div>
                <span className="eyebrow">Member Command Center</span>
                <h2>Find your next cyber move</h2>
                <p>
                  Search events, student-friendly articles, and practical skill tracks from one place.
                </p>
              </div>
              <Sparkles size={34} />
            </div>

            <label className="user-command-search">
              <Search size={18} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search events, CTF, phishing, Linux, web security..."
              />
            </label>

            <div className="user-command-filters" aria-label="Homepage content filters">
              {contentFilters.map((filter) => (
                <button
                  key={filter.value}
                  className={activeFilter === filter.value ? 'active' : ''}
                  type="button"
                  onClick={() => setActiveFilter(filter.value)}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="public-state">Loading command center...</div>
            ) : commandItems.length === 0 ? (
              <div className="public-state">No matches found. Try a broader keyword.</div>
            ) : (
              <div className="user-command-results">
                {commandItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link className="user-command-result" to={item.to} key={`${item.type}-${item.title}`}>
                      <span className="user-command-result-icon"><Icon size={19} /></span>
                      <span>
                        <small>{item.eyebrow}</small>
                        <strong>{item.title}</strong>
                        <p>{item.text}</p>
                      </span>
                      <em>{item.meta}</em>
                      <ArrowRight size={17} />
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          <aside className="user-next-event glass-panel">
            <span className="eyebrow">Next Up</span>
            {nextEvent ? (
              <>
                <div className="user-next-event-date">
                  <strong>{nextEvent.day}</strong>
                  <span>{nextEvent.month}</span>
                </div>
                <h3>{nextEvent.title}</h3>
                <div className="user-next-event-meta">
                  <span><Clock3 size={15} /> {nextEvent.time}</span>
                  <span><MapPin size={15} /> {nextEvent.location}</span>
                </div>
                <p>{nextEvent.text}</p>
                <div className="user-next-event-countdown">
                  <small>Starts in</small>
                  <strong>{daysUntil(nextEvent)}</strong>
                </div>
                <div className="user-next-event-actions">
                  <Link className="button button-primary" to={`/events/${nextEvent.id}/join`}>
                    <span>Join Event</span>
                    <ArrowRight size={18} strokeWidth={2.5} />
                  </Link>
                  <Link className="button button-secondary" to={`/events/${nextEvent.id}`}>
                    <span>Details</span>
                  </Link>
                </div>
              </>
            ) : (
              <>
                <h3>Events are being scheduled</h3>
                <p>Check back soon or contact the club to learn about upcoming sessions.</p>
                <Link className="button button-primary" to="/contact">
                  <span>Contact CyberClub</span>
                  <ArrowRight size={18} strokeWidth={2.5} />
                </Link>
              </>
            )}
          </aside>
        </div>
      </section>

      <AboutPreview />

      <section className="section section-muted">
        <div className="container">
          <SectionTitle
            center
            eyebrow="What We Do"
            title="Building practical security skills"
            text="From awareness sessions to technical labs, DIT CyberClub creates a space where students learn by doing."
          />
          <div className="services-grid">
            {services.slice(0, 3).map((service) => <ServiceCard key={service.title} {...service} />)}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container preview-block home-insights-block">
          <div className="preview-head home-insights-head">
            <SectionTitle
              eyebrow="Latest Insights"
              title="Cyber knowledge for students"
              text="Explore beginner-friendly security topics and practical digital safety guidance."
            />
            <Button to="/blog" variant="secondary">View Blog</Button>
          </div>

          <div className="home-insights-tools glass-panel">
            <label className="home-insights-search">
              <Search size={18} />
              <input
                value={insightSearch}
                onChange={(event) => setInsightSearch(event.target.value)}
                placeholder="Search articles, topics, and tags..."
              />
            </label>
            <div className="home-insights-categories" aria-label="Insight categories">
              {insightCategories.map((category) => (
                <button
                  key={category}
                  className={category === insightCategory ? 'active' : ''}
                  type="button"
                  onClick={() => setInsightCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
            <select
              className="home-insights-sort"
              value={insightSort}
              onChange={(event) => setInsightSort(event.target.value)}
              aria-label="Sort insights"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>

          {loading && <div className="public-state glass-panel">Loading latest posts...</div>}
          {!loading && error && <div className="public-state glass-panel public-state-error">{error}</div>}
          {!loading && !error && content.blogs.length === 0 && (
            <div className="public-state glass-panel">No published blog posts yet.</div>
          )}
          {!loading && !error && content.blogs.length > 0 && homepageInsights.length === 0 && (
            <div className="public-state glass-panel">No insights matched your filters.</div>
          )}
          {!loading && !error && homepageInsights.length > 0 && (
            <div className="blog-grid home-insights-grid">
              {homepageInsights.map((post, index) => <BlogCard key={post.id} {...post} delay={index * 80} />)}
            </div>
          )}
        </div>
      </section>

      <section className="section section-muted">
        <div className="container split-layout values-split">
          <div>
            <SectionTitle
              eyebrow="Our Direction"
              title="Ethical, practical, and community-driven"
              text="The club focuses on building technical confidence while keeping digital responsibility at the center of everything."
            />
            <Button to="/about" variant="primary">Explore Our Values</Button>
          </div>
          <div className="values-grid small-values-grid">
            {values.slice(0, 4).map((value) => {
              const Icon = value.icon;
              return (
                <article className="value-card" key={value.title}>
                  <Icon size={24} />
                  <h3>{value.title}</h3>
                  <p>{value.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container preview-block">
          <div className="preview-head">
            <SectionTitle
              eyebrow="Upcoming Events"
              title="Learn, compete, and connect"
              text="Join our upcoming workshops, bootcamps, and cybersecurity community activities."
            />
            <Button to="/events" variant="secondary">View Events</Button>
          </div>
          {loading && <div className="public-state glass-panel">Loading upcoming events...</div>}
          {!loading && error && <div className="public-state glass-panel public-state-error">{error}</div>}
          {!loading && !error && content.events.length === 0 && (
            <div className="public-state glass-panel">No public events have been posted yet.</div>
          )}
          {!loading && !error && content.events.length > 0 && (
            <div className="events-grid compact-events">
              {content.events.slice(0, 2).map((event) => <EventCard key={event.id} {...event} />)}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
