import {
  Binary,
  CalendarDays,
  Code2,
  Flag,
  Images,
  LockKeyhole,
  Megaphone,
  RadioTower,
  ScanSearch,
  ShieldCheck,
  TerminalSquare,
  Trophy,
  UsersRound,
} from 'lucide-react';
import { API_BASE_URL, resolveAssetUrl } from './apiConfig.js';

const blogIcons = {
  awareness: ScanSearch,
  'ethical hacking': TerminalSquare,
  'digital safety': LockKeyhole,
  'web security': Code2,
  'security basics': Binary,
  ctf: Flag,
};

const galleryIcons = {
  workshops: ShieldCheck,
  'training sessions': TerminalSquare,
  'ctf competitions': Trophy,
  'community events': UsersRound,
  'tech talks': RadioTower,
  'digital safety campaigns': Megaphone,
};

const galleryTones = ['blue', 'cyan', 'lime'];
const CACHE_TTL = 1000 * 60 * 5;
const responseCache = new Map();
const pendingRequests = new Map();

function key(value) {
  return String(value || '').trim().toLowerCase();
}

function buildQuery(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([paramKey, value]) => {
    if (value === undefined || value === null || value === '') return;
    query.set(paramKey, String(value));
  });

  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
}

function stripHtml(value) {
  if (!value) return '';
  const div = document.createElement('div');
  div.innerHTML = String(value);
  return div.textContent || div.innerText || '';
}

function truncate(value, length = 180) {
  const text = stripHtml(value).trim();
  return text.length > length ? `${text.slice(0, length).trim()}...` : text;
}

function formatDate(value) {
  if (!value) return 'Not scheduled';
  const normalized = String(value).replace(' ', 'T');
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return 'Not scheduled';
  return date.toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' });
}

function readTime(content) {
  const words = stripHtml(content).split(/\s+/).filter(Boolean).length;
  return `${Math.max(3, Math.ceil(words / 180))} min read`;
}

function formatTime(value) {
  if (!value) return 'Time TBA';
  const [hour = '0', minute = '0'] = String(value).split(':');
  const date = new Date();
  date.setHours(Number(hour), Number(minute), 0, 0);
  return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

function dateParts(value) {
  const date = new Date(`${value || ''}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return { day: '--', month: 'TBA' };
  }

  return {
    day: date.toLocaleDateString(undefined, { day: '2-digit' }),
    month: date.toLocaleDateString(undefined, { month: 'short' }),
    year: date.getFullYear(),
  };
}

function placeholderImage(title, category, accent = '#38bdf8') {
  const safeTitle = String(title || 'DIT CyberClub').replace(/[<>&"']/g, '');
  const safeCategory = String(category || 'CyberClub').replace(/[<>&"']/g, '');
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="760" viewBox="0 0 1200 760" role="img" aria-label="${safeTitle}">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${accent}" stop-opacity="0.9" />
          <stop offset="48%" stop-color="#081221" />
          <stop offset="100%" stop-color="#020817" />
        </linearGradient>
      </defs>
      <rect width="1200" height="760" rx="36" fill="url(#bg)" />
      <circle cx="980" cy="130" r="210" fill="#ffffff" fill-opacity="0.12" />
      <circle cx="200" cy="630" r="160" fill="#dfff00" fill-opacity="0.1" />
      <g fill="none" stroke="#ffffff" stroke-opacity="0.12" stroke-width="12">
        <path d="M100 120h280" />
        <path d="M820 642h260" />
        <path d="M120 616h120" />
      </g>
      <text x="600" y="420" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="64" font-weight="900" fill="#ffffff">${safeTitle}</text>
      <text x="600" y="480" text-anchor="middle" font-family="monospace" font-size="25" font-weight="700" letter-spacing="5" fill="#f8fafc" fill-opacity="0.78">${safeCategory.toUpperCase()}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function initials(name) {
  return String(name || 'CC')
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function leaderPlaceholder(name) {
  return placeholderImage(initials(name), 'DIT CyberClub', '#38bdf8');
}

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: options.body instanceof FormData ? undefined : { 'Content-Type': 'application/json' },
    ...options,
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload?.success) {
    const error = new Error(payload?.message || 'Unable to connect to the API');
    error.status = response.status;
    error.errors = payload?.errors || {};
    throw error;
  }

  return payload.data;
}

async function cachedRequest(endpoint, ttl = CACHE_TTL) {
  const now = Date.now();
  const cached = responseCache.get(endpoint);

  if (cached && now - cached.timestamp < ttl) {
    return cached.data;
  }

  if (pendingRequests.has(endpoint)) {
    return pendingRequests.get(endpoint);
  }

  const pending = request(endpoint)
    .then((data) => {
      responseCache.set(endpoint, { data, timestamp: Date.now() });
      pendingRequests.delete(endpoint);
      return data;
    })
    .catch((error) => {
      pendingRequests.delete(endpoint);
      throw error;
    });

  pendingRequests.set(endpoint, pending);
  return pending;
}

export function mapBlogPost(item) {
  const categoryKey = key(item.category);
  const title = item.title || 'Untitled post';

  return {
    id: item.slug || String(item.id),
    databaseId: item.id,
    slug: item.slug,
    title,
    category: item.category || 'Cybersecurity',
    date: formatDate(item.published_at || item.created_at),
    text: truncate(item.excerpt || item.content),
    content: stripHtml(item.content || item.excerpt || ''),
    author: item.author || 'DIT CyberClub',
    readTime: readTime(item.content || item.excerpt || ''),
    tags: [item.category].filter(Boolean),
    icon: blogIcons[categoryKey] || ShieldCheck,
    image: item.featured_image ? resolveAssetUrl(item.featured_image) : placeholderImage(title, item.category || 'Blog', '#2563eb'),
  };
}

export function mapLeader(item) {
  const fullName = item.full_name || 'CyberClub Leader';

  return {
    id: item.id,
    fullName,
    position: item.position || 'Leader',
    bio: stripHtml(item.bio || ''),
    image: item.image_path ? resolveAssetUrl(item.image_path) : leaderPlaceholder(fullName),
    imageAlt: `${fullName} portrait`,
    linkedinUrl: item.linkedin_url,
    githubUrl: item.twitter_url,
  };
}

export function mapGalleryItem(item, index = 0) {
  const categoryKey = key(item.category);
  const title = item.title || 'Gallery item';

  return {
    id: item.id,
    title,
    category: item.category || 'Gallery',
    description: stripHtml(item.description || ''),
    icon: galleryIcons[categoryKey] || Images,
    tone: galleryTones[index % galleryTones.length],
    image: item.image_path ? resolveAssetUrl(item.image_path) : placeholderImage(title, item.category || 'Gallery', '#00d4ff'),
    imageAlt: `${title} gallery preview`,
  };
}

export function mapEvent(item) {
  const parts = dateParts(item.event_date);
  const title = item.title || 'CyberClub Event';

  return {
    id: item.slug || String(item.id),
    databaseId: item.id,
    slug: item.slug,
    day: parts.day,
    month: parts.month,
    year: parts.year,
    title,
    location: item.location || 'DIT Main Campus',
    time: formatTime(item.event_time),
    text: truncate(item.description, 220),
    description: stripHtml(item.description || ''),
    category: item.status || 'Event',
    status: item.status,
    image: item.image_path ? resolveAssetUrl(item.image_path) : placeholderImage(title, item.status || 'Event', '#38bdf8'),
  };
}

export const publicApi = {
  async getBlogs(params) {
    const data = await cachedRequest(`/blogs${buildQuery(params)}`);
    return data.map(mapBlogPost);
  },

  async getBlog(slug) {
    const data = await cachedRequest(`/blogs/${encodeURIComponent(slug)}`);
    return mapBlogPost(data);
  },

  async getLeaders(params) {
    const data = await cachedRequest(`/leaders${buildQuery(params)}`);
    return data.map(mapLeader);
  },

  async getGallery(params) {
    const { limit, offset, ...rest } = params || {};

    if (limit !== undefined || offset !== undefined) {
      const data = await cachedRequest(`/gallery${buildQuery(params)}`);
      return data.map(mapGalleryItem);
    }

    const pageSize = 60;
    const items = [];
    let currentOffset = 0;

    while (true) {
      const page = await cachedRequest(`/gallery${buildQuery({ ...rest, limit: pageSize, offset: currentOffset })}`);
      items.push(...page.map((item, index) => mapGalleryItem(item, items.length + index)));

      if (page.length < pageSize) {
        break;
      }

      currentOffset += pageSize;
    }

    return items;
  },

  async getEvents(params) {
    const data = await cachedRequest(`/events${buildQuery(params)}`);
    return data.map(mapEvent);
  },

  async getEvent(slug) {
    const data = await cachedRequest(`/events/${encodeURIComponent(slug)}`);
    return mapEvent(data);
  },

  async getEventForm(eventId) {
    try {
      const data = await request(`/events/forms/${eventId}`);
      return data;
    } catch (err) {
      // No form exists for this event
      if (err.status === 404) {
        return null;
      }
      throw err;
    }
  },

  submitEventForm(formId, eventId, data) {
    return request('/events/forms/submit', {
      method: 'POST',
      body: JSON.stringify({
        form_id: formId,
        event_id: eventId,
        ...data,
      }),
    });
  },

  sendContactMessage(data) {
    return request('/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
