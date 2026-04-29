import { apiFormRequest, apiRequest } from './api.js';

export const eventFormService = {
  // Forms
  all() {
    return apiRequest('/admin/event-forms');
  },

  find(id) {
    return apiRequest(`/admin/event-forms/${id}`);
  },

  create(data) {
    return apiRequest('/admin/event-forms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  update(id, data) {
    return apiRequest(`/admin/event-forms/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  remove(id) {
    return apiRequest(`/admin/event-forms/${id}`, { method: 'DELETE' });
  },

  // Fields
  getFields(formId) {
    return apiRequest(`/admin/event-forms/${formId}/fields`);
  },

  addField(formId, data) {
    return apiRequest(`/admin/event-forms/${formId}/fields`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  updateField(formId, fieldId, data) {
    return apiRequest(`/admin/event-forms/${formId}/fields/${fieldId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  deleteField(formId, fieldId) {
    return apiRequest(`/admin/event-forms/${formId}/fields/${fieldId}`, { method: 'DELETE' });
  },

  updateFieldsOrder(formId, fields) {
    return apiRequest(`/admin/event-forms/${formId}/fields`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields }),
    });
  },

  // Responses
  getResponses(formId) {
    return apiRequest(`/admin/event-forms/${formId}/responses`);
  },

  getResponseDetail(formId, responseId) {
    return apiRequest(`/admin/event-forms/${formId}/responses/${responseId}`);
  },

  deleteResponse(formId, responseId) {
    return apiRequest(`/admin/event-forms/${formId}/responses/${responseId}`, { method: 'DELETE' });
  },
};
