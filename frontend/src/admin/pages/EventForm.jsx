import { useEffect, useState } from 'react';
import { ArrowLeft, Calendar, Clock, FileText, ImagePlus, MapPin, Save, Settings2 } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import FormInput from '../components/FormInput.jsx';
import ImageUpload from '../components/ImageUpload.jsx';
import LoadingState from '../components/LoadingState.jsx';
import Select from '../components/Select.jsx';
import Textarea from '../components/Textarea.jsx';
import { eventService } from '../services/eventService.js';
import { eventFormService } from '../services/eventFormService.js';

const emptyEvent = {
  title: '',
  slug: '',
  event_date: '',
  event_time: '',
  location: '',
  description: '',
  image_path: '',
  status: 'upcoming',
};

export default function EventForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const editing = Boolean(id);
  const [form, setForm] = useState(emptyEvent);
  const [imageFile, setImageFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(editing);
  const [busy, setBusy] = useState(false);
  const [alert, setAlert] = useState('');
  const [eventForm, setEventForm] = useState(null);

  useEffect(() => {
    if (!editing) return;

    eventService
      .find(id)
      .then((event) => {
        setForm({
          title: event.title || '',
          slug: event.slug || '',
          event_date: event.event_date || '',
          event_time: event.event_time ? event.event_time.slice(0, 5) : '',
          location: event.location || '',
          description: event.description || '',
          image_path: event.image_path || '',
          status: event.status || 'upcoming',
        });

        // Load associated form if exists
        return eventFormService.all();
      })
      .then((allForms) => {
        const form = allForms.find((f) => f.event_id == id);
        setEventForm(form);
      })
      .catch((err) => setAlert(err.message || 'Unable to load event.'))
      .finally(() => setLoading(false));
  }, [editing, id]);

  const change = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setErrors({});
    setAlert('');

    try {
      const payload = { ...form, image_path: imageFile };
      if (editing) {
        await eventService.update(id, payload);
      } else {
        await eventService.create(payload);
      }
      navigate('/admin/events', { state: { message: 'Event saved successfully.' } });
    } catch (err) {
      setErrors(err.errors || {});
      setAlert(err.message || 'Unable to save event.');
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <LoadingState label="Loading event..." />;

  return (
    <section className="admin-page admin-event-editor-page">
      <form className="admin-event-editor" onSubmit={submit}>
        <div className="admin-panel admin-event-editor-hero">
          <div>
            <span className="admin-kicker">Event</span>
            <h2>{editing ? 'Edit Event' : 'Create Event'}</h2>
            <p className="admin-subtitle-text">
              Build the public event page, schedule details, and registration form workflow.
            </p>
          </div>
          <div className="admin-event-hero-actions">
            <Link className="admin-button admin-button-secondary" to="/admin/events">
              <ArrowLeft size={17} />
              Back
            </Link>
            <button className="admin-button admin-button-primary" type="submit" disabled={busy}>
              <Save size={17} />
              {busy ? 'Saving...' : 'Save Event'}
            </button>
          </div>
        </div>

        {alert && <div className="admin-alert admin-alert-error">{alert}</div>}

        <div className="admin-event-editor-layout">
          <div className="admin-event-editor-main">
            <section className="admin-panel admin-editor-section">
              <div className="admin-editor-section-head">
                <span className="admin-editor-section-icon"><Settings2 size={18} /></span>
                <div>
                  <h3>Event details</h3>
                  <p>Core identity, status, and where the event will happen.</p>
                </div>
              </div>

              <div className="admin-form-grid">
                <FormInput label="Title" name="title" value={form.title} onChange={change} error={errors.title} required />
                <FormInput label="Slug" name="slug" value={form.slug} onChange={change} error={errors.slug} placeholder="auto-generated if empty" />
                <FormInput label="Event Date" type="date" name="event_date" value={form.event_date} onChange={change} error={errors.event_date} required />
                <FormInput label="Event Time" type="time" name="event_time" value={form.event_time} onChange={change} error={errors.event_time} />
                <FormInput label="Location" name="location" value={form.location} onChange={change} error={errors.location} required />
                <Select label="Status" name="status" value={form.status} onChange={change} error={errors.status}>
                  <option value="upcoming">Upcoming</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </Select>
              </div>
            </section>

            <section className="admin-panel admin-editor-section">
              <div className="admin-editor-section-head">
                <span className="admin-editor-section-icon"><ImagePlus size={18} /></span>
                <div>
                  <h3>Public content</h3>
                  <p>Describe the event clearly and attach the image shown on the public website.</p>
                </div>
              </div>

              <Textarea label="Description" name="description" value={form.description} onChange={change} error={errors.description} rows={9} required />
              <ImageUpload label="Event Image" value={form.image_path} file={imageFile} onFileChange={setImageFile} error={errors.image_path} />
            </section>
          </div>

          <aside className="admin-event-editor-aside">
            <div className="admin-panel admin-event-preview-card">
              <span className="admin-kicker">Preview</span>
              <h3>{form.title || 'Untitled event'}</h3>
              <p>{form.description || 'Add a description to preview how this event will read to members.'}</p>
              <div className="admin-event-preview-meta">
                <span><Calendar size={16} /> {form.event_date || 'Date not set'}</span>
                <span><Clock size={16} /> {form.event_time || 'Time not set'}</span>
                <span><MapPin size={16} /> {form.location || 'Location not set'}</span>
              </div>
              <span className={`admin-status admin-status-${form.status}`}>{form.status}</span>
            </div>

            <div className="admin-panel admin-event-form-card">
              <span className="admin-editor-section-icon"><FileText size={18} /></span>
              <h3>Registration form</h3>
              <p>
                Save the event first, then create or edit the questions members answer when joining.
              </p>
              {editing ? (
                <button
                  className="admin-button admin-button-secondary"
                  type="button"
                  onClick={() =>
                    navigate(
                      eventForm
                        ? `/admin/events/${id}/form/${eventForm.id}`
                        : `/admin/events/${id}/form/new`,
                    )
                  }
                >
                  <FileText size={17} />
                  {eventForm ? 'Edit Form' : 'Create Form'}
                </button>
              ) : (
                <button className="admin-button admin-button-secondary" type="button" disabled>
                  <FileText size={17} />
                  Save event first
                </button>
              )}
            </div>
          </aside>
        </div>
      </form>
    </section>
  );
}
