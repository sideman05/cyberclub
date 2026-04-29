import { useEffect, useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import FormInput from '../components/FormInput.jsx';
import ImageUpload from '../components/ImageUpload.jsx';
import LoadingState from '../components/LoadingState.jsx';
import Select from '../components/Select.jsx';
import Textarea from '../components/Textarea.jsx';
import { galleryService } from '../services/galleryService.js';

const categories = [
  'Workshops',
  'Training Sessions',
  'CTF Competitions',
  'Community Events',
  'Tech Talks',
  'Digital Safety Campaigns',
];

const emptyItem = {
  title: '',
  category: 'Workshops',
  image_path: '',
  description: '',
  display_order: 0,
  is_featured: false,
};

export default function GalleryForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const editing = Boolean(id);
  const [form, setForm] = useState(emptyItem);
  const [imageFile, setImageFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(editing);
  const [busy, setBusy] = useState(false);
  const [alert, setAlert] = useState('');

  useEffect(() => {
    if (!editing) return;

    galleryService
      .find(id)
      .then((item) =>
        setForm({
          title: item.title || '',
          category: item.category || 'Workshops',
          image_path: item.image_path || '',
          description: item.description || '',
          display_order: item.display_order || 0,
          is_featured: Number(item.is_featured) === 1,
        }),
      )
      .catch((err) => setAlert(err.message || 'Unable to load gallery item.'))
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
        await galleryService.update(id, payload);
      } else {
        await galleryService.create(payload);
      }
      navigate('/admin/gallery', { state: { message: 'Gallery item saved successfully.' } });
    } catch (err) {
      setErrors(err.errors || {});
      setAlert(err.message || 'Unable to save gallery item.');
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <LoadingState label="Loading gallery item..." />;

  return (
    <section className="admin-page">
      <form className="admin-panel admin-form" onSubmit={submit}>
        <div className="admin-panel-header">
          <div>
            <span className="admin-kicker">Gallery</span>
            <h2>{editing ? 'Edit Gallery Item' : 'Create Gallery Item'}</h2>
          </div>
          <Link className="admin-button admin-button-secondary" to="/admin/gallery">
            <ArrowLeft size={17} />
            Back
          </Link>
        </div>

        {alert && <div className="admin-alert admin-alert-error">{alert}</div>}

        <div className="admin-form-grid">
          <FormInput label="Title" name="title" value={form.title} onChange={change} error={errors.title} required />
          <Select label="Category" name="category" value={form.category} onChange={change} error={errors.category}>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Select>
          <FormInput label="Display Order" type="number" name="display_order" value={form.display_order} onChange={change} error={errors.display_order} />
          <label className="admin-toggle">
            <input type="checkbox" name="is_featured" checked={form.is_featured} onChange={change} />
            <span>Featured</span>
          </label>
        </div>

        <Textarea label="Description" name="description" value={form.description} onChange={change} error={errors.description} rows={5} />
        <ImageUpload label="Gallery Image" value={form.image_path} file={imageFile} onFileChange={setImageFile} error={errors.image_path} />

        <div className="admin-form-actions">
          <button className="admin-button admin-button-primary" type="submit" disabled={busy}>
            <Save size={17} />
            {busy ? 'Saving...' : 'Save Gallery Item'}
          </button>
        </div>
      </form>
    </section>
  );
}
