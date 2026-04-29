import { apiRequest } from './api.js';

export const contactService = {
  all() {
    return apiRequest('/admin/contacts');
  },

  find(id) {
    return apiRequest(`/admin/contacts/${id}`);
  },

  updateStatus(id, status) {
    return apiRequest(`/admin/contacts/${id}/status`, {
      method: 'PUT',
      body: { status },
    });
  },

  remove(id) {
    return apiRequest(`/admin/contacts/${id}`, { method: 'DELETE' });
  },
};
