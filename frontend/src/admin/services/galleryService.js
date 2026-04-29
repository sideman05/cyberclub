import { apiFormRequest, apiRequest } from './api.js';

export const galleryService = {
  all() {
    return apiRequest('/admin/gallery');
  },

  find(id) {
    return apiRequest(`/admin/gallery/${id}`);
  },

  create(data) {
    return apiFormRequest('/admin/gallery', data);
  },

  update(id, data) {
    return apiFormRequest(`/admin/gallery/${id}`, data, 'PUT');
  },

  remove(id) {
    return apiRequest(`/admin/gallery/${id}`, { method: 'DELETE' });
  },
};
