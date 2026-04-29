import { useEffect, useMemo, useState } from 'react';
import { Edit, Plus, Search, Trash2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import ConfirmModal from '../components/ConfirmModal.jsx';
import DataTable from '../components/DataTable.jsx';
import ErrorState from '../components/ErrorState.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { blogService } from '../services/blogService.js';

function formatDate(value) {
  if (!value) return 'Not scheduled';
  return new Date(value.replace(' ', 'T')).toLocaleDateString();
}

export default function BlogsList() {
  const location = useLocation();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [alert, setAlert] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setBlogs(await blogService.all());
    } catch (err) {
      setError(err.message || 'Unable to load blog posts');
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
    return blogs.filter((blog) => [blog.title, blog.category, blog.status].join(' ').toLowerCase().includes(term));
  }, [blogs, search]);

  const remove = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      await blogService.remove(deleteTarget.id);
      setAlert('Blog post deleted successfully.');
      setDeleteTarget(null);
      load();
    } catch (err) {
      setAlert(err.message || 'Unable to delete blog post.');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    { header: 'Title', render: (row) => <strong>{row.title}</strong> },
    { header: 'Category', accessor: 'category' },
    { header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    { header: 'Published', render: (row) => formatDate(row.published_at) },
    {
      header: 'Actions',
      render: (row) => (
        <div className="admin-row-actions">
          <Link className="admin-icon-button" to={`/admin/blogs/edit/${row.id}`} aria-label="Edit">
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
            <span className="admin-kicker">Content</span>
            <h2>Blog Posts</h2>
          </div>
          <Link className="admin-button admin-button-primary" to="/admin/blogs/create">
            <Plus size={17} />
            Add New
          </Link>
        </div>

        {alert && <div className="admin-alert">{alert}</div>}

        <label className="admin-search">
          <Search size={18} />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search blog posts" />
        </label>

        <DataTable columns={columns} rows={filtered} loading={loading} emptyTitle="No blog posts found" />
      </div>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete blog post"
        message={`Delete "${deleteTarget?.title}"?`}
        onClose={() => setDeleteTarget(null)}
        onConfirm={remove}
        busy={deleting}
      />
    </section>
  );
}
