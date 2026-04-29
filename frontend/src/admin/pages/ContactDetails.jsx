import { useEffect, useState } from 'react';
import { Archive, ArrowLeft, MailCheck, Trash2 } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ConfirmModal from '../components/ConfirmModal.jsx';
import ErrorState from '../components/ErrorState.jsx';
import LoadingState from '../components/LoadingState.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { contactService } from '../services/contactService.js';

function formatDate(value) {
  if (!value) return '';
  return new Date(value.replace(' ', 'T')).toLocaleString();
}

export default function ContactDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [alert, setAlert] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setMessage(await contactService.find(id));
    } catch (err) {
      setError(err.message || 'Unable to load message');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const updateStatus = async (status) => {
    try {
      setMessage(await contactService.updateStatus(id, status));
      setAlert('Message status updated successfully.');
    } catch (err) {
      setAlert(err.message || 'Unable to update message.');
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      await contactService.remove(id);
      navigate('/admin/contacts');
    } catch (err) {
      setAlert(err.message || 'Unable to delete message.');
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <LoadingState label="Loading message..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <section className="admin-page">
      <article className="admin-panel admin-message-panel">
        <div className="admin-panel-header">
          <div>
            <span className="admin-kicker">Message</span>
            <h2>{message.subject}</h2>
          </div>
          <Link className="admin-button admin-button-secondary" to="/admin/contacts">
            <ArrowLeft size={17} />
            Back
          </Link>
        </div>

        {alert && <div className="admin-alert">{alert}</div>}

        <div className="admin-message-meta">
          <span>{message.full_name}</span>
          <a href={`mailto:${message.email}`}>{message.email}</a>
          <span>{formatDate(message.created_at)}</span>
          <StatusBadge status={message.status} />
        </div>

        <p className="admin-message-body">{message.message}</p>

        <div className="admin-form-actions">
          <button className="admin-button admin-button-secondary" type="button" onClick={() => updateStatus('read')}>
            <MailCheck size={17} />
            Mark Read
          </button>
          <button className="admin-button admin-button-secondary" type="button" onClick={() => updateStatus('archived')}>
            <Archive size={17} />
            Archive
          </button>
          <button className="admin-button admin-button-danger" type="button" onClick={() => setConfirmOpen(true)}>
            <Trash2 size={17} />
            Delete
          </button>
        </div>
      </article>

      <ConfirmModal
        open={confirmOpen}
        title="Delete message"
        message={`Delete message from "${message.full_name}"?`}
        onClose={() => setConfirmOpen(false)}
        onConfirm={remove}
        busy={busy}
      />
    </section>
  );
}
