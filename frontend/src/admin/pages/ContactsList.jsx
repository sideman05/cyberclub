import { useEffect, useMemo, useState } from 'react';
import { Archive, Eye, MailCheck, Search, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import ConfirmModal from '../components/ConfirmModal.jsx';
import DataTable from '../components/DataTable.jsx';
import ErrorState from '../components/ErrorState.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { contactService } from '../services/contactService.js';

function formatDate(value) {
  if (!value) return '';
  return new Date(value.replace(' ', 'T')).toLocaleString();
}

export default function ContactsList() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [alert, setAlert] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setMessages(await contactService.all());
    } catch (err) {
      setError(err.message || 'Unable to load messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return messages.filter((message) =>
      [message.full_name, message.email, message.subject, message.status].join(' ').toLowerCase().includes(term),
    );
  }, [messages, search]);

  const updateStatus = async (message, status) => {
    try {
      await contactService.updateStatus(message.id, status);
      setAlert('Message status updated successfully.');
      load();
    } catch (err) {
      setAlert(err.message || 'Unable to update message.');
    }
  };

  const remove = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      await contactService.remove(deleteTarget.id);
      setAlert('Message deleted successfully.');
      setDeleteTarget(null);
      load();
    } catch (err) {
      setAlert(err.message || 'Unable to delete message.');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    { header: 'Name', render: (row) => <strong>{row.full_name}</strong> },
    { header: 'Email', accessor: 'email' },
    { header: 'Subject', accessor: 'subject' },
    { header: 'Date', render: (row) => formatDate(row.created_at) },
    { header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      header: 'Actions',
      render: (row) => (
        <div className="admin-row-actions">
          <Link className="admin-icon-button" to={`/admin/contacts/${row.id}`} aria-label="View">
            <Eye size={16} />
          </Link>
          <button className="admin-icon-button" type="button" onClick={() => updateStatus(row, 'read')} aria-label="Mark as read">
            <MailCheck size={16} />
          </button>
          <button className="admin-icon-button" type="button" onClick={() => updateStatus(row, 'archived')} aria-label="Archive">
            <Archive size={16} />
          </button>
          <button className="admin-icon-button danger" type="button" onClick={() => setDeleteTarget(row)} aria-label="Delete">
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <section className="admin-page">
      <div className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <span className="admin-kicker">Inbox</span>
            <h2>Contact Messages</h2>
          </div>
        </div>

        {alert && <div className="admin-alert">{alert}</div>}

        <label className="admin-search">
          <Search size={18} />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search messages" />
        </label>

        <DataTable columns={columns} rows={filtered} loading={loading} emptyTitle="No contact messages found" />
      </div>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete message"
        message={`Delete message from "${deleteTarget?.full_name}"?`}
        onClose={() => setDeleteTarget(null)}
        onConfirm={remove}
        busy={deleting}
      />
    </section>
  );
}
