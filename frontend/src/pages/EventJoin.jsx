import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CalendarDays, Clock3, MapPin, AlertCircle, CheckCircle } from 'lucide-react';
import { publicApi } from '../services/publicApi.js';

export default function EventJoin() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [joinStep, setJoinStep] = useState(1);
  const [formAnswers, setFormAnswers] = useState({});
  const [basicData, setBasicData] = useState({
    responder_name: '',
    responder_email: '',
  });

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        setLoading(true);
        setError('');

        const eventData = await publicApi.getEvent(id);
        if (active) setEvent(eventData);

        // Try to load the form for this event
        try {
          const formData = await publicApi.getEventForm(eventData.databaseId);
          if (active && formData) {
            setForm(formData);
            setJoinStep(1);
            // Initialize form answers
            const answers = {};
            formData.fields?.forEach((field) => {
              answers[field.id] = '';
            });
            setFormAnswers(answers);
          }
        } catch (err) {
          // It's okay if there's no form
          console.log('No form found for this event');
        }
      } catch (err) {
        if (active) setError(err.message || 'Unable to load this event.');
      } finally {
        if (active) setLoading(false);
      }
    }

    loadData();
    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    if (submitted) {
      const timer = setTimeout(() => {
        navigate('/events');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [submitted, navigate]);

  function handleBasicChange(e) {
    const { name, value } = e.target;
    setBasicData((prev) => ({ ...prev, [name]: value }));
  }

  function handleNextStep() {
    setError('');

    if (!basicData.responder_name.trim()) {
      setError('Full name is required');
      return;
    }

    if (!basicData.responder_email.trim()) {
      setError('Email is required');
      return;
    }

    if (form && form.fields && form.fields.length > 0) {
      setJoinStep(2);
      return;
    }

    handleSubmit();
  }

  function handleBackStep() {
    setJoinStep(1);
    setError('');
  }

  function handleFormFieldChange(fieldId, value, fieldType) {
    setFormAnswers((prev) => {
      if (fieldType === 'checkbox') {
        const current = prev[fieldId] || [];
        if (Array.isArray(current)) {
          if (current.includes(value)) {
            return { ...prev, [fieldId]: current.filter((v) => v !== value) };
          } else {
            return { ...prev, [fieldId]: [...current, value] };
          }
        }
        return { ...prev, [fieldId]: [value] };
      } else {
        return { ...prev, [fieldId]: value };
      }
    });
  }

  async function handleSubmit(e) {
    if (e?.preventDefault) e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      if (form) {
        // Validate required fields
        const errors = [];
        form.fields?.forEach((field) => {
          if (field.is_required) {
            const answer = formAnswers[field.id];
            if (!answer || answer === '' || (Array.isArray(answer) && answer.length === 0)) {
              errors.push(`${field.label} is required`);
            }
          }
        });

        if (errors.length > 0) {
          setError(errors.join(', '));
          setSubmitting(false);
          return;
        }

        // Submit form
        await publicApi.submitEventForm(form.id, event.databaseId, {
          responder_name: basicData.responder_name,
          responder_email: basicData.responder_email,
          answers: formAnswers,
        });
      }

      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Failed to submit form');
    } finally {
      setSubmitting(false);
    }
  }

  if (!event) {
    return (
      <section className="section">
        <div className="container">
          <div className="glass-panel" style={{ textAlign: 'center', padding: '2rem' }}>
            <h2>Event not found</h2>
            <button type="button" className="button button-primary" onClick={() => navigate('/events')}>
              Back to Events
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section event-join-section">
      <div className="container">
        <div className="event-join-layout">
          <aside className="event-join-summary glass-panel">
            <div className="event-join-image">
              <img src={event.image} alt={`${event.title} cover`} width="520" height="320" loading="lazy" decoding="async" />
            </div>
            <span className="eyebrow">Join registration</span>
            <h1>{event.title}</h1>
            <div className="event-join-meta">
              <span><CalendarDays size={16} /> {event.month} {event.day}, {event.year || 'TBA'}</span>
              <span><Clock3 size={16} /> {event.time}</span>
              <span><MapPin size={16} /> {event.location}</span>
            </div>
            <p>{event.text}</p>
            <button type="button" className="button button-secondary" onClick={() => navigate(`/events/${event.id}`)}>
              Back to Event Details
            </button>
          </aside>

          <article className="event-join-form glass-panel">
            <span className="eyebrow">Registration form</span>
            <h2>Join this event</h2>
            <div className="event-join-stepper" aria-label="Registration steps">
              <div className={`event-join-step ${joinStep === 1 ? 'active' : 'done'}`}>
                <span>1</span>
                <div>
                  <strong>Your details</strong>
                  <small>Name and email</small>
                </div>
              </div>
              <div className={`event-join-step ${joinStep === 2 ? 'active' : ''}`}>
                <span>2</span>
                <div>
                  <strong>Event form</strong>
                  <small>Questions and preferences</small>
                </div>
              </div>
            </div>
            {form ? (
              <p>{form.description || 'Please complete the form to register for this event.'}</p>
            ) : (
              <p>Please complete the form to register for this event.</p>
            )}
            {loading && <div className="public-state">Loading form...</div>}

            {submitted ? (
              <div className="event-join-modal-overlay">
                <div className="event-join-modal-content">
                  <div className="event-join-modal-icon success">
                    <CheckCircle size={64} />
                  </div>
                  <h2>Congratulations!</h2>
                  <p className="event-join-modal-subtitle">You're successfully registered for this event</p>
                  <p className="event-join-modal-details">We'll send you updates about {event.title} to your email.</p>
                  <div className="event-join-modal-actions">
                    <button type="button" className="button button-primary" onClick={() => navigate('/events')}>
                      Back to Events
                    </button>
                    <button type="button" className="button button-secondary" onClick={() => navigate('/')}>
                      Go to Home
                    </button>
                  </div>
                  <p className="event-join-modal-timer">Redirecting in 5 seconds...</p>
                </div>
              </div>
            ) : (
              <form className="event-join-grid" onSubmit={handleSubmit}>
                {error && (
                  <div className="event-join-error" style={{ gridColumn: '1 / -1', color: '#ef4444', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <AlertCircle size={18} /> {error}
                  </div>
                )}

                {joinStep === 1 ? (
                  <>
                    <label className="event-join-field event-join-field-full event-join-field-card">
                      <span className="event-join-field-label">Full Name</span>
                      <input
                        type="text"
                        name="responder_name"
                        value={basicData.responder_name}
                        onChange={handleBasicChange}
                        placeholder="Enter your full name"
                        required
                      />
                    </label>
                    <label className="event-join-field event-join-field-full event-join-field-card">
                      <span className="event-join-field-label">Email</span>
                      <input
                        type="email"
                        name="responder_email"
                        value={basicData.responder_email}
                        onChange={handleBasicChange}
                        placeholder="Enter your email"
                        required
                      />
                    </label>

                    <div className="event-join-actions event-join-actions-main">
                      <button type="button" className="button button-primary" onClick={handleNextStep} disabled={submitting}>
                        Next
                      </button>
                      <button type="button" className="button button-secondary" onClick={() => navigate(`/events/${event.id}`)}>
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="event-join-question-header">
                      <span className="eyebrow">Event questions</span>
                      <h3>{form.title} Questions</h3>
                      <p>Answer the questions below to complete your registration.</p>
                    </div>
                    {form && form.fields && form.fields.map((field) => (
                      <FormField
                        key={field.id}
                        field={field}
                        value={formAnswers[field.id] || ''}
                        onChange={(val) => handleFormFieldChange(field.id, val, field.field_type)}
                      />
                    ))}
                    <div className="event-join-actions event-join-actions-main">
                      <button type="button" className="button button-secondary" onClick={handleBackStep} disabled={submitting}>
                        Back
                      </button>
                      <button type="submit" className="button button-primary" disabled={submitting}>
                        {submitting ? 'Submitting...' : 'Submit Registration'}
                      </button>
                    </div>
                  </>
                )}
              </form>
            )}
          </article>
        </div>
      </div>
    </section>
  );
}

function FormField({ field, value, onChange }) {
  const commonProps = {
    className: 'form-control',
  };

  if (field.is_required) {
    commonProps.required = true;
  }

  switch (field.field_type) {
    case 'textarea':
      return (
        <label className="event-join-field event-join-field-card event-join-field-full">
          <span className="event-join-field-label">
            {field.label}
            {field.is_required && <span className="required-indicator">*</span>}
          </span>
          {field.help_text && <small className="event-join-help">{field.help_text}</small>}
          <textarea
            {...commonProps}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || ''}
            rows={4}
          />
        </label>
      );

    case 'number':
      return (
        <label className="event-join-field event-join-field-card">
          <span className="event-join-field-label">
            {field.label}
            {field.is_required && <span className="required-indicator">*</span>}
          </span>
          {field.help_text && <small className="event-join-help">{field.help_text}</small>}
          <input
            {...commonProps}
            type="number"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || ''}
          />
        </label>
      );

    case 'email':
      return (
        <label className="event-join-field event-join-field-card">
          <span className="event-join-field-label">
            {field.label}
            {field.is_required && <span className="required-indicator">*</span>}
          </span>
          {field.help_text && <small className="event-join-help">{field.help_text}</small>}
          <input
            {...commonProps}
            type="email"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || ''}
          />
        </label>
      );

    case 'tel':
      return (
        <label className="event-join-field event-join-field-card">
          <span className="event-join-field-label">
            {field.label}
            {field.is_required && <span className="required-indicator">*</span>}
          </span>
          {field.help_text && <small className="event-join-help">{field.help_text}</small>}
          <input
            {...commonProps}
            type="tel"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || ''}
          />
        </label>
      );

    case 'url':
      return (
        <label className="event-join-field event-join-field-card">
          <span className="event-join-field-label">
            {field.label}
            {field.is_required && <span className="required-indicator">*</span>}
          </span>
          {field.help_text && <small className="event-join-help">{field.help_text}</small>}
          <input
            {...commonProps}
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || ''}
          />
        </label>
      );

    case 'date':
      return (
        <label className="event-join-field event-join-field-card">
          <span className="event-join-field-label">
            {field.label}
            {field.is_required && <span className="required-indicator">*</span>}
          </span>
          {field.help_text && <small className="event-join-help">{field.help_text}</small>}
          <input
            {...commonProps}
            type="date"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        </label>
      );

    case 'time':
      return (
        <label className="event-join-field event-join-field-card">
          <span className="event-join-field-label">
            {field.label}
            {field.is_required && <span className="required-indicator">*</span>}
          </span>
          {field.help_text && <small className="event-join-help">{field.help_text}</small>}
          <input
            {...commonProps}
            type="time"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        </label>
      );

    case 'select': {
      const options = JSON.parse(field.options || '[]');
      return (
        <label className="event-join-field event-join-field-card event-join-field-full">
          <span className="event-join-field-label">
            {field.label}
            {field.is_required && <span className="required-indicator">*</span>}
          </span>
          {field.help_text && <small className="event-join-help">{field.help_text}</small>}
          <select {...commonProps} value={value} onChange={(e) => onChange(e.target.value)}>
            <option value="">-- Select an option --</option>
            {options.map((opt, idx) => (
              <option key={idx} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </label>
      );
    }

    case 'radio': {
      const options = JSON.parse(field.options || '[]');
      return (
        <fieldset className="event-join-field event-join-field-card event-join-field-full radio-group">
          <legend>
            <span className="event-join-field-label">
              {field.label}
              {field.is_required && <span className="required-indicator">*</span>}
            </span>
            {field.help_text && <small className="event-join-help">{field.help_text}</small>}
          </legend>
          <div className="event-join-options">
            {options.map((opt, idx) => (
              <label key={idx} className="radio-label event-join-option-card">
                <input
                  type="radio"
                  name={`field-${field.id}`}
                  value={opt}
                  checked={value === opt}
                  onChange={(e) => onChange(e.target.value)}
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        </fieldset>
      );
    }

    case 'checkbox': {
      const options = JSON.parse(field.options || '[]');
      const selectedValues = Array.isArray(value) ? value : [];
      return (
        <fieldset className="event-join-field event-join-field-card event-join-field-full checkbox-group">
          <legend>
            <span className="event-join-field-label">
              {field.label}
              {field.is_required && <span className="required-indicator">*</span>}
            </span>
            {field.help_text && <small className="event-join-help">{field.help_text}</small>}
          </legend>
          <div className="event-join-options">
            {options.map((opt, idx) => (
              <label key={idx} className="checkbox-label event-join-option-card">
                <input
                  type="checkbox"
                  name={`field-${field.id}`}
                  value={opt}
                  checked={selectedValues.includes(opt)}
                  onChange={(e) => onChange(e.target.value)}
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        </fieldset>
      );
    }

    case 'text':
    default:
      return (
        <label className="event-join-field event-join-field-card">
          <span className="event-join-field-label">
            {field.label}
            {field.is_required && <span className="required-indicator">*</span>}
          </span>
          {field.help_text && <small className="event-join-help">{field.help_text}</small>}
          <input
            {...commonProps}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || ''}
          />
        </label>
      );
  }
}
