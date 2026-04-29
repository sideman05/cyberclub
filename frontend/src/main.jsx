import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './styles/global.css';
import { initAnimateOnScroll } from './utils/animateOnScroll';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
// initialize animations once initial render has painted
requestAnimationFrame(() => {
  try { initAnimateOnScroll(); } catch (e) { /* ignore */ }
});
