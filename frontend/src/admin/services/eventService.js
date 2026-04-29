import { apiFormRequest, apiRequest } from './api.js';

export const eventService = {
  all() {
    return apiRequest('/admin/events');
  },

  find(id) {
    return apiRequest(`/admin/events/${id}`);
  },

  create(data) {
    return apiFormRequest('/admin/events', data);
  },

  update(id, data) {
    return apiFormRequest(`/admin/events/${id}`, data, 'PUT');
  },

  remove(id) {
    return apiRequest(`/admin/events/${id}`, { method: 'DELETE' });
  },
};
