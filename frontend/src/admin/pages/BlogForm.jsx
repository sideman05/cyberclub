import { useEffect, useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import FormInput from '../components/FormInput.jsx';
import ImageUpload from '../components/ImageUpload.jsx';
import LoadingState from '../components/LoadingState.jsx';
import Select from '../components/Select.jsx';
import Textarea from '../components/Textarea.jsx';
import { blogService } from '../services/blogService.js';

const emptyBlog = {
  title: '',
  slug: '',
  category: '',
  excerpt: '',
  content: '',
  featured_image: '',
  author: '',
  status: 'draft',
  published_at: '',
};

function toDatetimeLocal(value) {
  if (!value) return '';
  return value.replace(' ', 'T').slice(0, 16);
}

export default function BlogForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const editing = Boolean(id);
  const [form, setForm] = useState(emptyBlog);
  const [imageFile, setImageFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(editing);
  const [busy, setBusy] = useState(false);
  const [alert, setAlert] = useState('');

  useEffect(() => {
    if (!editing) return;

    blogService
      .find(id)
      .then((blog) => {
        setForm({
          title: blog.title || '',
          slug: blog.slug || '',
          category: blog.category || '',
          excerpt: blog.excerpt || '',
          content: blog.content || '',
          featured_image: blog.featured_image || '',
          author: blog.author || '',
          status: blog.status || 'draft',
          published_at: toDatetimeLocal(blog.published_at),
        });
      })
      .catch((err) => setAlert(err.message || 'Unable to load blog post.'))
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
      const payload = { ...form, featured_image: imageFile };
      if (editing) {
        await blogService.update(id, payload);
      } else {
        await blogService.create(payload);
      }
      navigate('/admin/blogs', { state: { message: 'Blog post saved successfully.' } });
    } catch (err) {
      setErrors(err.errors || {});
      setAlert(err.message || 'Unable to save blog post.');
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <LoadingState label="Loading blog post..." />;

  return (
    <section className="admin-page">
      <form className="admin-panel admin-form" onSubmit={submit}>
        <div className="admin-panel-header">
          <div>
            <span className="admin-kicker">Blog</span>
            <h2>{editing ? 'Edit Blog Post' : 'Create Blog Post'}</h2>
          </div>
          <Link className="admin-button admin-button-secondary" to="/admin/blogs">
            <ArrowLeft size={17} />
            Back
          </Link>
        </div>

        {alert && <div className="admin-alert admin-alert-error">{alert}</div>}

        <div className="admin-form-grid">
          <FormInput label="Title" name="title" value={form.title} onChange={change} error={errors.title} required />
          <FormInput label="Slug" name="slug" value={form.slug} onChange={change} error={errors.slug} placeholder="auto-generated if empty" />
          <FormInput label="Category" name="category" value={form.category} onChange={change} error={errors.category} required />
          <FormInput label="Author" name="author" value={form.author} onChange={change} error={errors.author} required />
          <Select label="Status" name="status" value={form.status} onChange={change} error={errors.status}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </Select>
          <FormInput label="Published At" type="datetime-local" name="published_at" value={form.published_at} onChange={change} error={errors.published_at} />
        </div>

        <Textarea label="Excerpt" name="excerpt" value={form.excerpt} onChange={change} error={errors.excerpt} rows={4} required />
        <Textarea label="Content" name="content" value={form.content} onChange={change} error={errors.content} rows={12} required />
        <ImageUpload label="Featured Image" value={form.featured_image} file={imageFile} onFileChange={setImageFile} error={errors.featured_image} />

        <div className="admin-form-actions">
          <button className="admin-button admin-button-primary" type="submit" disabled={busy}>
            <Save size={17} />
            {busy ? 'Saving...' : 'Save Blog Post'}
          </button>
        </div>
      </form>
    </section>
  );
}
