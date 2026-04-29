import { apiFormRequest, apiRequest } from './api.js';

export const leaderService = {
  all() {
    return apiRequest('/admin/leaders');
  },

  find(id) {
    return apiRequest(`/admin/leaders/${id}`);
  },

  create(data) {
    return apiFormRequest('/admin/leaders', data);
  },

  update(id, data) {
    return apiFormRequest(`/admin/leaders/${id}`, data, 'PUT');
  },

  remove(id) {
    return apiRequest(`/admin/leaders/${id}`, { method: 'DELETE' });
  },
};
