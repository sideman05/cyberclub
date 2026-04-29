import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';

const Home = lazy(() => import('./pages/Home.jsx'));
const About = lazy(() => import('./pages/About.jsx'));
const Leaders = lazy(() => import('./pages/Leaders.jsx'));
const Blog = lazy(() => import('./pages/Blog.jsx'));
const BlogPost = lazy(() => import('./pages/BlogPost.jsx'));
const Gallery = lazy(() => import('./pages/Gallery.jsx'));
const Events = lazy(() => import('./pages/Events.jsx'));
const EventDetail = lazy(() => import('./pages/EventDetail.jsx'));
const EventJoin = lazy(() => import('./pages/EventJoin.jsx'));
const Contact = lazy(() => import('./pages/Contact.jsx'));
const AdminRoutes = lazy(() => import('./admin/AdminRoutes.jsx'));

function RouteLoader() {
  return (
    <div className="route-loader" role="status" aria-live="polite">
      Loading...
    </div>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    requestAnimationFrame(() => {
      window.__refreshAnimateOnScroll?.();
    });
  }, [pathname]);

  return null;
}

export default function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  if (isAdminRoute) {
    return (
      <Suspense fallback={<RouteLoader />}>
        <ScrollToTop />
        <AdminRoutes />
      </Suspense>
    );
  }

  return (
    <div className="site-shell">
      <ScrollToTop />
      <Navbar />
      <main className="page-transition" key={location.pathname}>
        <Suspense fallback={<RouteLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/leaders" element={<Leaders />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:id" element={<BlogPost />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/:id" element={<EventDetail />} />
            <Route path="/events/:id/join" element={<EventJoin />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
