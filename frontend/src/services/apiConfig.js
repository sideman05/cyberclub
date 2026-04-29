const hostedBase =
  typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname.startsWith('/ditweb') ? '/ditweb' : ''}/api`
    : '/api';

const devBase =
  typeof window !== 'undefined'
    ? `${window.location.protocol}//${window.location.hostname}/ditweb/api`
    : '/ditweb/api';

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? devBase : hostedBase)).replace(/\/$/, '');

export function resolveAssetUrl(path) {
  if (!path) return '';
  if (/^(data:|blob:|https?:\/\/)/i.test(path)) return path;
  return `${API_BASE_URL}/${String(path).replace(/^\/+/, '')}`;
}
