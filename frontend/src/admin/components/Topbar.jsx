import { Menu, ShieldCheck } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { getStoredAdmin } from '../services/api.js';

const titles = [
  ['/admin/dashboard', 'Dashboard'],
  ['/admin/blogs/create', 'Create Blog Post'],
  ['/admin/blogs/edit', 'Edit Blog Post'],
  ['/admin/blogs', 'Blog Posts'],
  ['/admin/leaders/create', 'Create Leader'],
  ['/admin/leaders/edit', 'Edit Leader'],
  ['/admin/leaders', 'Leaders'],
  ['/admin/gallery/create', 'Create Gallery Item'],
  ['/admin/gallery/edit', 'Edit Gallery Item'],
  ['/admin/gallery', 'Gallery'],
  ['/admin/events/create', 'Create Event'],
  ['/admin/events/edit', 'Edit Event'],
  ['/admin/events', 'Events'],
  ['/admin/contacts/', 'Message Details'],
  ['/admin/contacts', 'Contact Messages'],
];

function pageTitle(pathname) {
  return titles.find(([prefix]) => pathname.startsWith(prefix))?.[1] || 'Admin';
}

export default function Topbar({ onMenuClick }) {
  const location = useLocation();
  const admin = getStoredAdmin();

  return (
    <header className="admin-topbar">
      <button className="admin-icon-button admin-menu-button" type="button" onClick={onMenuClick} aria-label="Open menu">
        <Menu size={20} />
      </button>
      <div>
        <span className="admin-kicker">Cyber Club DIT</span>
        <h1>{pageTitle(location.pathname)}</h1>
      </div>
      <div className="admin-profile">
        <ShieldCheck size={18} />
        <span>{admin?.full_name || 'Admin'}</span>
      </div>
    </header>
  );
}
