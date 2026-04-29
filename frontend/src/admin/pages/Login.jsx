import { useState } from 'react';
import { Lock, Mail, Shield } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService.js';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (authService.isAuthenticated()) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');

    try {
      await authService.login(form);
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Unable to login');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="admin-login-screen">
      <form className="admin-login-card" onSubmit={submit}>
        <div className="admin-login-mark">
          <Shield size={32} />
        </div>
        <div className="admin-login-title">
          <span>DIT CyberClub</span>
          <h1>Admin Login</h1>
        </div>

        {error && <div className="admin-alert admin-alert-error">{error}</div>}

        <label className="admin-login-field">
          <Mail size={18} />
          <input
            type="email"
            placeholder="Email address"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            required
          />
        </label>
        <label className="admin-login-field">
          <Lock size={18} />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            required
          />
        </label>

        <button className="admin-button admin-button-primary admin-login-submit" type="submit" disabled={busy}>
          {busy ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </main>
  );
}
