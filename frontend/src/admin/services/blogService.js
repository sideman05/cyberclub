import { apiFormRequest, apiRequest } from './api.js';

export const blogService = {
  all() {
    return apiRequest('/admin/blogs');
  },

  find(id) {
    return apiRequest(`/admin/blogs/${id}`);
  },

  create(data) {
    return apiFormRequest('/admin/blogs', data);
  },

  update(id, data) {
    return apiFormRequest(`/admin/blogs/${id}`, data, 'PUT');
  },

  remove(id) {
    return apiRequest(`/admin/blogs/${id}`, { method: 'DELETE' });
  },
};
