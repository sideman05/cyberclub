import { useEffect, useMemo, useState } from 'react';
import { Lock, Mail, Shield } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService.js';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [lockoutUntil, setLockoutUntil] = useState('');

  useEffect(() => {
    if (!lockoutUntil) return undefined;

    const timer = setInterval(() => {
      const until = new Date(lockoutUntil).getTime();
      if (!Number.isFinite(until) || until <= Date.now()) {
        setLockoutUntil('');
      }
    }, 30000);

    return () => clearInterval(timer);
  }, [lockoutUntil]);

  const isLocked = useMemo(() => {
    if (!lockoutUntil) return false;
    const until = new Date(lockoutUntil).getTime();
    return Number.isFinite(until) && until > Date.now();
  }, [lockoutUntil]);

  const lockoutMessage = useMemo(() => {
    if (!isLocked) return '';

    const remainingMs = new Date(lockoutUntil).getTime() - Date.now();
    const hours = Math.max(0, Math.ceil(remainingMs / (1000 * 60 * 60)));
    return `Account locked. Try again in about ${hours} hour${hours === 1 ? '' : 's'}.`;
  }, [isLocked, lockoutUntil]);

  if (authService.isAuthenticated()) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');

    try {
      await authService.login(form);
      setLockoutUntil('');
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Unable to login');

      if (err.status === 423) {
        if (err.errors?.lockout_until) {
          setLockoutUntil(err.errors.lockout_until);
        }
      }
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
          <span>Cyber Club DIT</span>
          <h1>Admin Login</h1>
        </div>

        {error && <div className="admin-alert admin-alert-error">{error}</div>}
        {lockoutMessage && <div className="admin-alert admin-alert-error">{lockoutMessage}</div>}

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

        <button className="admin-button admin-button-primary admin-login-submit" type="submit" disabled={busy || isLocked}>
          {busy ? 'Signing in...' : isLocked ? 'Locked' : 'Sign in'}
        </button>
      </form>
    </main>
  );
}
