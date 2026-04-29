const remoteApiBase = 'http://38.247.148.233/api/index.php';
const proxiedApiBase = '/api/index.php';
const configuredApiBase = import.meta.env.VITE_API_BASE_URL;

function defaultApiBase() {
  if (typeof window === 'undefined') return remoteApiBase;
  return window.location.protocol === 'https:' ? proxiedApiBase : remoteApiBase;
}

function shouldUseProxy(value) {
  return typeof window !== 'undefined' && window.location.protocol === 'https:' && /^http:\/\//i.test(value || '');
}

export const API_BASE_URL = (configuredApiBase && !shouldUseProxy(configuredApiBase) ? configuredApiBase : defaultApiBase()).replace(/\/$/, '');
const ASSET_BASE_URL = API_BASE_URL.replace(/\/index\.php$/i, '');

export function resolveAssetUrl(path) {
  if (!path) return '';
  if (/^(data:|blob:|https?:\/\/)/i.test(path)) return path;
  return `${ASSET_BASE_URL}/${String(path).replace(/^\/+/, '')}`;
}
