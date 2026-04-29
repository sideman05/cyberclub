const liveApiBase = 'http://38.247.148.233/api/index.php';

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || liveApiBase).replace(/\/$/, '');
const ASSET_BASE_URL = API_BASE_URL.replace(/\/index\.php$/i, '');

export function resolveAssetUrl(path) {
  if (!path) return '';
  if (/^(data:|blob:|https?:\/\/)/i.test(path)) return path;
  return `${ASSET_BASE_URL}/${String(path).replace(/^\/+/, '')}`;
}
