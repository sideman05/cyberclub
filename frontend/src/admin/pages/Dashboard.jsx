import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, FileText, Images, Mail, Newspaper, Users } from 'lucide-react';
import ErrorState from '../components/ErrorState.jsx';
import LoadingState from '../components/LoadingState.jsx';
import { blogService } from '../services/blogService.js';
import { contactService } from '../services/contactService.js';
import { eventService } from '../services/eventService.js';
import { galleryService } from '../services/galleryService.js';
import { leaderService } from '../services/leaderService.js';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');

    try {
      const [blogs, leaders, gallery, events, contacts] = await Promise.all([
        blogService.all(),
        leaderService.all(),
        galleryService.all(),
        eventService.all(),
        contactService.all(),
      ]);
      setData({ blogs, leaders, gallery, events, contacts });
    } catch (err) {
      setError(err.message || 'Unable to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const stats = useMemo(() => {
    if (!data) return [];

    return [
      { label: 'Total Blog Posts', value: data.blogs.length, icon: FileText },
      { label: 'Published Blog Posts', value: data.blogs.filter((item) => item.status === 'published').length, icon: Newspaper },
      { label: 'Total Leaders', value: data.leaders.length, icon: Users },
      { label: 'Gallery Images', value: data.gallery.length, icon: Images },
      { label: 'Upcoming Events', value: data.events.filter((item) => item.status === 'upcoming').length, icon: CalendarDays },
      { label: 'Unread Messages', value: data.contacts.filter((item) => item.status === 'unread').length, icon: Mail },
    ];
  }, [data]);

  if (loading) return <LoadingState label="Loading dashboard..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <section className="admin-page">
      <div className="admin-stats-grid">
        {stats.map(({ label, value, icon: Icon }) => (
          <article className="admin-stat-card" key={label}>
            <div className="admin-stat-icon">
              <Icon size={22} />
            </div>
            <span>{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </div>

      <div className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <span className="admin-kicker">System</span>
            <h2>Content Overview</h2>
          </div>
        </div>
        <div className="admin-dashboard-list">
          <span>Draft blogs</span>
          <strong>{data.blogs.filter((item) => item.status === 'draft').length}</strong>
          <span>Active leaders</span>
          <strong>{data.leaders.filter((item) => Number(item.is_active) === 1).length}</strong>
          <span>Featured gallery images</span>
          <strong>{data.gallery.filter((item) => Number(item.is_featured) === 1).length}</strong>
          <span>Archived messages</span>
          <strong>{data.contacts.filter((item) => item.status === 'archived').length}</strong>
        </div>
      </div>
    </section>
  );
}
