import { CalendarDays, FileText, Gauge, Images, LogOut, Mail, Users } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService.js';

const links = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: Gauge },
  { to: '/admin/blogs', label: 'Blog Posts', icon: FileText },
  { to: '/admin/leaders', label: 'Leaders', icon: Users },
  { to: '/admin/gallery', label: 'Gallery', icon: Images },
  { to: '/admin/events', label: 'Events', icon: CalendarDays },
  { to: '/admin/contacts', label: 'Contact Messages', icon: Mail },
];

export default function Sidebar({ open, onClose }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await authService.logout();
    navigate('/admin/login', { replace: true });
  };

  return (
    <>
      <aside className={`admin-sidebar ${open ? 'is-open' : ''}`}>
        <div className="admin-brand">
          <span className="admin-brand-mark">DIT</span>
          <div>
            <strong>CyberClub</strong>
            <small>Admin Console</small>
          </div>
        </div>

        <nav className="admin-nav">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} onClick={onClose} className={({ isActive }) => (isActive ? 'is-active' : '')}>
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <button className="admin-logout" type="button" onClick={handleLogout}>
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </aside>
      <button className={`admin-sidebar-scrim ${open ? 'is-open' : ''}`} type="button" aria-label="Close menu" onClick={onClose} />
    </>
  );
}
