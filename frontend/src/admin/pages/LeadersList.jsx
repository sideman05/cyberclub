import { useEffect, useMemo, useState } from 'react';
import { Edit, Plus, Search, Trash2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import ConfirmModal from '../components/ConfirmModal.jsx';
import DataTable from '../components/DataTable.jsx';
import ErrorState from '../components/ErrorState.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { resolveAssetUrl } from '../services/api.js';
import { leaderService } from '../services/leaderService.js';

function initials(name) {
  return String(name || '')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function LeadersList() {
  const location = useLocation();
  const [leaders, setLeaders] = useState([]);
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
      setLeaders(await leaderService.all());
    } catch (err) {
      setError(err.message || 'Unable to load leaders');
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
    return leaders.filter((leader) => [leader.full_name, leader.position].join(' ').toLowerCase().includes(term));
  }, [leaders, search]);

  const remove = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      await leaderService.remove(deleteTarget.id);
      setAlert('Leader deleted successfully.');
      setDeleteTarget(null);
      load();
    } catch (err) {
      setAlert(err.message || 'Unable to delete leader.');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      header: 'Leader',
      render: (row) => (
        <div className="admin-person-cell">
          {row.image_path ? <img src={resolveAssetUrl(row.image_path)} alt="" width="42" height="42" loading="lazy" decoding="async" /> : <span>{initials(row.full_name)}</span>}
          <strong>{row.full_name}</strong>
        </div>
      ),
    },
    { header: 'Position', accessor: 'position' },
    { header: 'Order', accessor: 'display_order' },
    { header: 'Status', render: (row) => <StatusBadge status={Number(row.is_active) === 1 ? 'active' : 'inactive'} /> },
    {
      header: 'Actions',
      render: (row) => (
        <div className="admin-row-actions">
          <Link className="admin-icon-button" to={`/admin/leaders/edit/${row.id}`} aria-label="Edit">
            <Edit size={16} />
          </Link>
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
            <span className="admin-kicker">People</span>
            <h2>Leaders</h2>
          </div>
          <Link className="admin-button admin-button-primary" to="/admin/leaders/create">
            <Plus size={17} />
            Add New
          </Link>
        </div>

        {alert && <div className="admin-alert">{alert}</div>}

        <label className="admin-search">
          <Search size={18} />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search leaders" />
        </label>

        <DataTable columns={columns} rows={filtered} loading={loading} emptyTitle="No leaders found" />
      </div>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete leader"
        message={`Delete "${deleteTarget?.full_name}"?`}
        onClose={() => setDeleteTarget(null)}
        onConfirm={remove}
        busy={deleting}
      />
    </section>
  );
}
