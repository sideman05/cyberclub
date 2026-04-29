import { useEffect, useMemo, useState } from 'react';
import { Edit, Plus, Search, Trash2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import ConfirmModal from '../components/ConfirmModal.jsx';
import DataTable from '../components/DataTable.jsx';
import ErrorState from '../components/ErrorState.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { resolveAssetUrl } from '../services/api.js';
import { galleryService } from '../services/galleryService.js';

export default function GalleryList() {
  const location = useLocation();
  const [items, setItems] = useState([]);
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
      setItems(await galleryService.all());
    } catch (err) {
      setError(err.message || 'Unable to load gallery');
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
    return items.filter((item) => [item.title, item.category].join(' ').toLowerCase().includes(term));
  }, [items, search]);

  const remove = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      await galleryService.remove(deleteTarget.id);
      setAlert('Gallery item deleted successfully.');
      setDeleteTarget(null);
      load();
    } catch (err) {
      setAlert(err.message || 'Unable to delete gallery item.');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      header: 'Image',
      render: (row) => <img className="admin-thumb" src={resolveAssetUrl(row.image_path)} alt="" width="76" height="54" loading="lazy" decoding="async" />,
    },
    { header: 'Title', render: (row) => <strong>{row.title}</strong> },
    { header: 'Category', accessor: 'category' },
    { header: 'Order', accessor: 'display_order' },
    { header: 'Featured', render: (row) => <StatusBadge status={Number(row.is_featured) === 1 ? 'featured' : 'standard'} /> },
    {
      header: 'Actions',
      render: (row) => (
        <div className="admin-row-actions">
          <Link className="admin-icon-button" to={`/admin/gallery/edit/${row.id}`} aria-label="Edit">
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
            <span className="admin-kicker">Media</span>
            <h2>Gallery</h2>
          </div>
          <Link className="admin-button admin-button-primary" to="/admin/gallery/create">
            <Plus size={17} />
            Add New
          </Link>
        </div>

        {alert && <div className="admin-alert">{alert}</div>}

        <label className="admin-search">
          <Search size={18} />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search gallery" />
        </label>

        <DataTable columns={columns} rows={filtered} loading={loading} emptyTitle="No gallery images found" />
      </div>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete gallery item"
        message={`Delete "${deleteTarget?.title}"?`}
        onClose={() => setDeleteTarget(null)}
        onConfirm={remove}
        busy={deleting}
      />
    </section>
  );
}
