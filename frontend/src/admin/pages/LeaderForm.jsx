import { useEffect, useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import FormInput from '../components/FormInput.jsx';
import ImageUpload from '../components/ImageUpload.jsx';
import LoadingState from '../components/LoadingState.jsx';
import Textarea from '../components/Textarea.jsx';
import { leaderService } from '../services/leaderService.js';

const emptyLeader = {
  full_name: '',
  position: '',
  bio: '',
  image_path: '',
  linkedin_url: '',
  github_url: '',
  display_order: 0,
  is_active: true,
};

export default function LeaderForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const editing = Boolean(id);
  const [form, setForm] = useState(emptyLeader);
  const [imageFile, setImageFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(editing);
  const [busy, setBusy] = useState(false);
  const [alert, setAlert] = useState('');

  useEffect(() => {
    if (!editing) return;

    leaderService
      .find(id)
      .then((leader) =>
        setForm({
          full_name: leader.full_name || '',
          position: leader.position || '',
          bio: leader.bio || '',
          image_path: leader.image_path || '',
          linkedin_url: leader.linkedin_url || '',
          github_url: leader.github_url || '',
          display_order: leader.display_order || 0,
          is_active: Number(leader.is_active) === 1,
        }),
      )
      .catch((err) => setAlert(err.message || 'Unable to load leader.'))
      .finally(() => setLoading(false));
  }, [editing, id]);

  const change = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setErrors({});
    setAlert('');

    try {
      const payload = { ...form, image_path: imageFile };
      if (editing) {
        await leaderService.update(id, payload);
      } else {
        await leaderService.create(payload);
      }
      navigate('/admin/leaders', { state: { message: 'Leader saved successfully.' } });
    } catch (err) {
      setErrors(err.errors || {});
      setAlert(err.message || 'Unable to save leader.');
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <LoadingState label="Loading leader..." />;

  return (
    <section className="admin-page">
      <form className="admin-panel admin-form" onSubmit={submit}>
        <div className="admin-panel-header">
          <div>
            <span className="admin-kicker">Leader</span>
            <h2>{editing ? 'Edit Leader' : 'Create Leader'}</h2>
          </div>
          <Link className="admin-button admin-button-secondary" to="/admin/leaders">
            <ArrowLeft size={17} />
            Back
          </Link>
        </div>

        {alert && <div className="admin-alert admin-alert-error">{alert}</div>}

        <div className="admin-form-grid">
          <FormInput label="Full Name" name="full_name" value={form.full_name} onChange={change} error={errors.full_name} required />
          <FormInput label="Position" name="position" value={form.position} onChange={change} error={errors.position} required />
          <FormInput label="Display Order" type="number" name="display_order" value={form.display_order} onChange={change} error={errors.display_order} />
          <FormInput label="LinkedIn URL" name="linkedin_url" value={form.linkedin_url} onChange={change} error={errors.linkedin_url} />
          <FormInput label="GitHub URL" name="github_url" value={form.github_url} onChange={change} error={errors.github_url} />
          <label className="admin-toggle">
            <input type="checkbox" name="is_active" checked={form.is_active} onChange={change} />
            <span>Active</span>
          </label>
        </div>

        <Textarea label="Bio" name="bio" value={form.bio} onChange={change} error={errors.bio} rows={6} />
        <ImageUpload label="Leader Image" value={form.image_path} file={imageFile} onFileChange={setImageFile} error={errors.image_path} />

        <div className="admin-form-actions">
          <button className="admin-button admin-button-primary" type="submit" disabled={busy}>
            <Save size={17} />
            {busy ? 'Saving...' : 'Save Leader'}
          </button>
        </div>
      </form>
    </section>
  );
}
