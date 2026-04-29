import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { authService } from './services/authService.js';
import './styles/admin.css';

const AdminLayout = lazy(() => import('./components/AdminLayout.jsx'));
const BlogForm = lazy(() => import('./pages/BlogForm.jsx'));
const BlogsList = lazy(() => import('./pages/BlogsList.jsx'));
const ContactDetails = lazy(() => import('./pages/ContactDetails.jsx'));
const ContactsList = lazy(() => import('./pages/ContactsList.jsx'));
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const EventForm = lazy(() => import('./pages/EventForm.jsx'));
const EventFormBuilder = lazy(() => import('./pages/EventFormBuilder.jsx'));
const FormResponses = lazy(() => import('./pages/FormResponses.jsx'));
const EventsList = lazy(() => import('./pages/EventsList.jsx'));
const GalleryForm = lazy(() => import('./pages/GalleryForm.jsx'));
const GalleryList = lazy(() => import('./pages/GalleryList.jsx'));
const LeaderForm = lazy(() => import('./pages/LeaderForm.jsx'));
const LeadersList = lazy(() => import('./pages/LeadersList.jsx'));
const Login = lazy(() => import('./pages/Login.jsx'));

function AdminRouteLoader() {
  return (
    <div className="admin-state admin-route-loader" role="status" aria-live="polite">
      <div className="admin-spinner" />
      <span>Loading admin workspace...</span>
    </div>
  );
}

function ProtectedAdmin() {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/admin/login" replace />;
  }

  return <AdminLayout />;
}

export default function AdminRoutes() {
  return (
    <Suspense fallback={<AdminRouteLoader />}>
      <Routes>
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin" element={<ProtectedAdmin />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="blogs" element={<BlogsList />} />
          <Route path="blogs/create" element={<BlogForm />} />
          <Route path="blogs/edit/:id" element={<BlogForm />} />
          <Route path="leaders" element={<LeadersList />} />
          <Route path="leaders/create" element={<LeaderForm />} />
          <Route path="leaders/edit/:id" element={<LeaderForm />} />
          <Route path="gallery" element={<GalleryList />} />
          <Route path="gallery/create" element={<GalleryForm />} />
          <Route path="gallery/edit/:id" element={<GalleryForm />} />
          <Route path="events" element={<EventsList />} />
          <Route path="events/create" element={<EventForm />} />
          <Route path="events/edit/:id" element={<EventForm />} />
          <Route path="events/:eventId/form/new" element={<EventFormBuilder />} />
          <Route path="events/:eventId/form/:formId" element={<EventFormBuilder />} />
          <Route path="events/:eventId/form/:formId/responses" element={<FormResponses />} />
          <Route path="contacts" element={<ContactsList />} />
          <Route path="contacts/:id" element={<ContactDetails />} />
        </Route>
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}
