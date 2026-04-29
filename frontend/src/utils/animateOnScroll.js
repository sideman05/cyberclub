const ANIMATED_SELECTOR = [
  '.animate-on-scroll',
  '.section-title',
  '.stats-panel',
  '.stat-card',
  '.service-card',
  '.blog-card',
  '.event-card',
  '.value-card',
  '.leader-card',
  '.gallery-card',
  '.highlight-card',
  '.mission-box',
  '.public-state',
  '.blog-toolbar',
  '.blog-feature',
  '.blog-pagination',
  '.blog-empty',
  '.blog-article',
  '.blog-sidebar',
  '.event-detail-card',
  '.event-detail-meta-item',
  '.event-detail-section',
  '.event-detail-join-box',
  '.event-join-summary',
  '.event-join-form',
  '.event-join-field-card',
  '.contact-details',
  '.contact-form-card',
  '.contact-item',
  '.contact-form label',
  '.contact-form button',
  '.leadership-cta',
  '.footer-grid > *',
  '.footer-bottom',
].join(',');

const DEFAULT_VARIANTS = ['fade-up', 'fade-left', 'fade-right', 'fade-in', 'scale-up'];

let revealObserver;
let mutationObserver;
let refreshFrame = 0;

function prefersReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

function isPublicNode(node) {
  return node instanceof HTMLElement && !node.closest('[class^="admin-"], [class*=" admin-"]');
}

function getStaggerDelay(node) {
  const explicitDelay = node.getAttribute('data-delay');
  if (explicitDelay) return explicitDelay;

  const parent = node.parentElement;
  if (!parent) return '0ms';

  const staggerParents = [
    'services-grid',
    'blog-grid',
    'events-grid',
    'values-grid',
    'leaders-grid',
    'gallery-grid',
    'mission-grid',
    'highlight-stack',
    'contact-list',
    'contact-form',
    'event-detail-meta-grid',
    'event-join-grid',
    'footer-grid',
  ];

  if (!staggerParents.some((className) => parent.classList.contains(className))) {
    return '0ms';
  }

  const index = Array.from(parent.children).indexOf(node);
  return `${Math.min(Math.max(index, 0), 8) * 70}ms`;
}

function prepareNode(node) {
  if (!isPublicNode(node)) return;

  node.classList.add('animate-on-scroll');

  if (!DEFAULT_VARIANTS.some((variant) => node.classList.contains(variant))) {
    node.classList.add(node.getAttribute('data-animate') || 'fade-up');
  }

  node.style.transitionDelay = getStaggerDelay(node);

  if (prefersReducedMotion()) {
    node.classList.add('in-view');
  }
}

function collectNodes(root = document) {
  const nodes = [];

  if (root instanceof HTMLElement && root.matches(ANIMATED_SELECTOR)) {
    nodes.push(root);
  }

  if (root.querySelectorAll) {
    nodes.push(...root.querySelectorAll(ANIMATED_SELECTOR));
  }

  return nodes.filter(isPublicNode);
}

function observeNodes(root = document) {
  if (!revealObserver) return;

  collectNodes(root).forEach((node) => {
    prepareNode(node);
    if (!node.classList.contains('in-view')) {
      revealObserver.observe(node);
    }
  });
}

// Lightweight scroll animation initializer using IntersectionObserver
export function initAnimateOnScroll() {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;

  if (revealObserver) {
    observeNodes();
    return;
  }

  revealObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      const el = entry.target;
      if (entry.isIntersecting) {
        el.classList.add('in-view');
        if (el.getAttribute('data-once') !== 'false') {
          obs.unobserve(el);
        }
      } else if (el.getAttribute('data-once') === 'false') {
        el.classList.remove('in-view');
      }
    });
  }, {
    rootMargin: '0px 0px -8% 0px',
    threshold: 0.12,
  });

  window.__refreshAnimateOnScroll = () => {
    if (refreshFrame) cancelAnimationFrame(refreshFrame);
    refreshFrame = requestAnimationFrame(() => observeNodes());
  };

  observeNodes();

  if ('MutationObserver' in window && !mutationObserver) {
    mutationObserver = new MutationObserver((mutations) => {
      if (refreshFrame) cancelAnimationFrame(refreshFrame);
      refreshFrame = requestAnimationFrame(() => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node instanceof HTMLElement) observeNodes(node);
          });
        });
      });
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });
  }
}

export default initAnimateOnScroll;
