import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  Calendar,
  CheckCircle2,
  Clock,
  Edit,
  FileText,
  MapPin,
  Plus,
  Search,
  Trash2,
  XCircle,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import ConfirmModal from '../components/ConfirmModal.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import LoadingState from '../components/LoadingState.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { eventService } from '../services/eventService.js';
import { eventFormService } from '../services/eventFormService.js';

function formatDate(value) {
  if (!value) return 'Not set';
  return new Date(`${value}T00:00:00`).toLocaleDateString();
}

function formatTime(value) {
  if (!value) return 'Not set';
  return String(value).slice(0, 5);
}

function getDateBadge(value) {
  if (!value) return { day: '--', month: 'TBA' };

  const date = new Date(`${value}T00:00:00`);
  return {
    day: date.toLocaleDateString(undefined, { day: '2-digit' }),
    month: date.toLocaleDateString(undefined, { month: 'short' }),
  };
}

export default function EventsList() {
  const location = useLocation();
  const [events, setEvents] = useState([]);
  const [eventForms, setEventForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [alert, setAlert] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [eventData, formData] = await Promise.all([
        eventService.all(),
        eventFormService.all().catch(() => []),
      ]);
      setEvents(eventData);
      setEventForms(formData);
    } catch (err) {
      setError(err.message || 'Unable to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (location.state?.message) {
      setAlert(location.state.message);
    }
  }, [location.state]);

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return events.filter((event) => {
      const matchesSearch = [event.title, event.location, event.status].join(' ').toLowerCase().includes(term);
      const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [events, search, statusFilter]);

  const summaryCards = useMemo(() => {
    const upcoming = events.filter((event) => event.status === 'upcoming').length;
    const completed = events.filter((event) => event.status === 'completed').length;
    const cancelled = events.filter((event) => event.status === 'cancelled').length;

    return [
      { label: 'Total Events', value: events.length, icon: Calendar, tone: 'blue' },
      { label: 'Upcoming', value: upcoming, icon: Activity, tone: 'lime' },
      { label: 'Completed', value: completed, icon: CheckCircle2, tone: 'cyan' },
      { label: 'Cancelled', value: cancelled, icon: XCircle, tone: 'red' },
      { label: 'Forms', value: eventForms.length, icon: FileText, tone: 'blue' },
    ];
  }, [eventForms.length, events]);

  const remove = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      await eventService.remove(deleteTarget.id);
      setAlert('Event deleted successfully.');
      setDeleteTarget(null);
      load();
    } catch (err) {
      setAlert(err.message || 'Unable to delete event.');
    } finally {
      setDeleting(false);
    }
  };

  if (error) return <ErrorState message={error} onRetry={load} />;

  // Get unique statuses for filter
  const uniqueStatuses = [...new Set(events.map(e => e.status))];

  return (
    <section className="admin-page admin-events-page">
      <div className="admin-event-hero admin-panel">
        <div className="admin-event-hero-copy">
          <span className="admin-kicker">Event Control Center</span>
          <h2>Manage CyberClub events</h2>
          <p>
            Create, schedule, and monitor workshops, bootcamps, competitions, and registration forms from one focused workspace.
          </p>
        </div>
        <div className="admin-event-hero-actions">
          <button className="admin-button admin-button-secondary" type="button" onClick={load}>
            <Activity size={17} />
            Refresh View
          </button>
          <Link className="admin-button admin-button-primary" to="/admin/events/create">
            <Plus size={17} />
            Add New Event
          </Link>
        </div>
      </div>

      <div className="admin-event-stats">
        {summaryCards.map(({ label, value, icon: Icon, tone }) => (
          <div className={`admin-event-stat admin-event-stat-${tone}`} key={label}>
            <span className="admin-event-stat-icon"><Icon size={19} /></span>
            <div>
              <strong>{value}</strong>
              <small>{label}</small>
            </div>
          </div>
        ))}
      </div>

      <div className="admin-panel admin-event-workspace">
        <div className="admin-panel-header">
          <div>
            <span className="admin-kicker">Schedule</span>
            <h2>Events</h2>
            <p className="admin-subtitle-text">{filtered.length} of {events.length} event{events.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {alert && <div className="admin-alert">{alert}</div>}

        <div className="admin-toolbar admin-event-toolbar">
          <label className="admin-search">
            <Search size={18} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by title, location, or status..."
            />
          </label>

          <div className="admin-filters">
            <select
              className="admin-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              {uniqueStatuses.map(status => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <LoadingState label="Loading events..." />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No events found"
            action={(
              <Link className="admin-button admin-button-primary" to="/admin/events/create">
                <Plus size={17} />
                Create Event
              </Link>
            )}
          />
        ) : (
          <div className="admin-event-card-grid">
            {filtered.map((event) => {
              const dateBadge = getDateBadge(event.event_date);
              const linkedForm = eventForms.find((form) => String(form.event_id) === String(event.id));
              const formPath = linkedForm
                ? `/admin/events/${event.id}/form/${linkedForm.id}`
                : `/admin/events/${event.id}/form/new`;

              return (
                <article className="admin-event-card" key={event.id}>
                  <div className="admin-event-date-block">
                    <strong>{dateBadge.day}</strong>
                    <span>{dateBadge.month}</span>
                  </div>

                  <div className="admin-event-card-body">
                    <div className="admin-event-card-top">
                      <div>
                        <h3>{event.title}</h3>
                        <div className="admin-event-meta">
                          <span><Calendar size={15} /> {formatDate(event.event_date)}</span>
                          <span><Clock size={15} /> {formatTime(event.event_time)}</span>
                          <span><MapPin size={15} /> {event.location || 'Not set'}</span>
                        </div>
                      </div>
                      <StatusBadge status={event.status} />
                    </div>

                    <p>{event.description || 'No description has been added for this event yet.'}</p>

                    <div className="admin-event-card-footer">
                      <Link className="admin-button admin-button-secondary" to={`/admin/events/edit/${event.id}`}>
                        <Edit size={16} />
                        Edit
                      </Link>
                      <Link className="admin-button admin-button-secondary" to={formPath}>
                        <FileText size={16} />
                        {linkedForm ? 'Edit Form' : 'Create Form'}
                      </Link>
                      <button className="admin-button admin-button-danger" type="button" onClick={() => setDeleteTarget(event)}>
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete event"
        message={`Delete "${deleteTarget?.title}"?`}
        onClose={() => setDeleteTarget(null)}
        onConfirm={remove}
        busy={deleting}
      />
    </section>
  );
}
