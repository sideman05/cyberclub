import { API_BASE_URL, resolveAssetUrl } from '../../services/apiConfig.js';

export const AUTH_TOKEN_KEY = 'ditCyberClubAdminToken';
export const AUTH_ADMIN_KEY = 'ditCyberClubAdmin';
const ADMIN_CACHE_TTL = 1000 * 60;
const adminResponseCache = new Map();
const pendingAdminRequests = new Map();
export { API_BASE_URL, resolveAssetUrl };

export function getStoredToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function getStoredAdmin() {
  const value = localStorage.getItem(AUTH_ADMIN_KEY);
  if (!value) return null;

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export function clearAuthStorage() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_ADMIN_KEY);
  clearAdminApiCache();
}

export function clearAdminApiCache() {
  adminResponseCache.clear();
  pendingAdminRequests.clear();
}

function buildUrl(endpoint) {
  return `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
}

async function parseResponse(response) {
  const text = await response.text();
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return {
      success: false,
      message: 'Invalid server response',
      errors: { response: text },
    };
  }
}

export async function apiRequest(endpoint, options = {}) {
  const { useCache = true, ...requestOptions } = options;
  const method = (requestOptions.method || 'GET').toUpperCase();
  const token = getStoredToken();
  const cacheKey = `${token || 'guest'}:${endpoint}`;

  if (method === 'GET' && useCache) {
    const cached = adminResponseCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < ADMIN_CACHE_TTL) {
      return cached.data;
    }

    if (pendingAdminRequests.has(cacheKey)) {
      return pendingAdminRequests.get(cacheKey);
    }
  }

  if (method !== 'GET') {
    clearAdminApiCache();
  }

  const headers = new Headers(requestOptions.headers || {});
  let body = requestOptions.body;

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (body && !(body instanceof FormData) && typeof body !== 'string') {
    headers.set('Content-Type', 'application/json');
    body = JSON.stringify(body);
  }

  const execute = async () => {
    const response = await fetch(buildUrl(endpoint), {
      ...requestOptions,
      headers,
      body,
    });

    const payload = await parseResponse(response);

    if (!response.ok || payload.success === false) {
      if (response.status === 401) {
        clearAuthStorage();
      }

      const error = new Error(payload.message || 'Request failed');
      error.status = response.status;
      error.errors = payload.errors || {};
      throw error;
    }

    return payload.data;
  };

  if (method !== 'GET' || !useCache) {
    return execute();
  }

  const pending = execute()
    .then((data) => {
      adminResponseCache.set(cacheKey, { data, timestamp: Date.now() });
      pendingAdminRequests.delete(cacheKey);
      return data;
    })
    .catch((error) => {
      pendingAdminRequests.delete(cacheKey);
      throw error;
    });

  pendingAdminRequests.set(cacheKey, pending);
  return pending;
}

export function objectToFormData(data, method = 'POST') {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value === null || value === undefined) return;

    if (value instanceof File) {
      if (value.size > 0) formData.append(key, value);
      return;
    }

    if (typeof value === 'boolean') {
      formData.append(key, value ? '1' : '0');
      return;
    }

    formData.append(key, value);
  });

  if (method !== 'POST') {
    formData.append('_method', method);
  }

  return formData;
}

export function apiFormRequest(endpoint, data, method = 'POST') {
  const formData = objectToFormData(data, method);
  return apiRequest(endpoint, {
    method: 'POST',
    body: formData,
  });
}
