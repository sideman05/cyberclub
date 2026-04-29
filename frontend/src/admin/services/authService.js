import {
  apiRequest,
  AUTH_ADMIN_KEY,
  AUTH_TOKEN_KEY,
  clearAuthStorage,
  getStoredAdmin,
  getStoredToken,
} from './api.js';

export const authService = {
  isAuthenticated() {
    return Boolean(getStoredToken());
  },

  admin() {
    return getStoredAdmin();
  },

  async login(credentials) {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: credentials,
    });

    localStorage.setItem(AUTH_TOKEN_KEY, data.token);
    localStorage.setItem(AUTH_ADMIN_KEY, JSON.stringify(data.admin));
    return data;
  },

  async me() {
    const admin = await apiRequest('/auth/me');
    localStorage.setItem(AUTH_ADMIN_KEY, JSON.stringify(admin));
    return admin;
  },

  async logout() {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } finally {
      clearAuthStorage();
    }
  },
};
