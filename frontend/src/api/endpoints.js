import apiClient from './client';

// Species
export const speciesApi = {
  getAll: (params) => apiClient.get('/species', { params }),
  getById: (id) => apiClient.get(`/species/${id}`),
  search: (q) => apiClient.get('/species/search', { params: { q } }),
  create: (data) => apiClient.post('/species', data),
  update: (id, data) => apiClient.put(`/species/${id}`, data),
  delete: (id) => apiClient.delete(`/species/${id}`),
};

// Incidents
export const incidentsApi = {
  getAll: (params) => apiClient.get('/incidents', { params }),
  getById: (id) => apiClient.get(`/incidents/${id}`),
  create: (data) => apiClient.post('/incidents', data),
  update: (id, data) => apiClient.put(`/incidents/${id}`, data),
  delete: (id) => apiClient.delete(`/incidents/${id}`),
  resolve: (id) => apiClient.post(`/incidents/${id}/resolve`),
  assign: (id, rangerId) => apiClient.post(`/incidents/${id}/assign`, null, { params: { ranger_id: rangerId } }),
};

// Rangers
export const rangersApi = {
  getAll: () => apiClient.get('/rangers'),
  getById: (id) => apiClient.get(`/rangers/${id}`),
  create: (data) => apiClient.post('/rangers', data),
  update: (id, data) => apiClient.put(`/rangers/${id}`, data),
  delete: (id) => apiClient.delete(`/rangers/${id}`),
};

// Patrols
export const patrolsApi = {
  getAll: () => apiClient.get('/patrols'),
  getById: (id) => apiClient.get(`/patrols/${id}`),
  create: (data) => apiClient.post('/patrols', data),
  update: (id, data) => apiClient.put(`/patrols/${id}`, data),
  delete: (id) => apiClient.delete(`/patrols/${id}`),
  complete: (id) => apiClient.post(`/patrols/${id}/complete`),
};

// Reports
export const reportsApi = {
  getAll: () => apiClient.get('/reports'),
  getById: (id) => apiClient.get(`/reports/${id}`),
  create: (data) => apiClient.post('/reports', data),
  update: (id, data) => apiClient.put(`/reports/${id}`, data),
  delete: (id) => apiClient.delete(`/reports/${id}`),
};

// Protected Areas
export const protectedAreasApi = {
  getAll: () => apiClient.get('/protected-areas'),
  getById: (id) => apiClient.get(`/protected-areas/${id}`),
  create: (data) => apiClient.post('/protected-areas', data),
  update: (id, data) => apiClient.put(`/protected-areas/${id}`, data),
  delete: (id) => apiClient.delete(`/protected-areas/${id}`),
};

// Authentication
export const authApi = {
  login: (email, password) => {
    const form = new URLSearchParams({ username: email, password });
    return apiClient.post('/auth/login', form, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
  },
  me: () => apiClient.get('/auth/me'),
  register: (data) => apiClient.post('/auth/register', data),
  requestPasswordReset: (email) => apiClient.post('/auth/request-password-reset', { email }),
  resetPassword: (token, newPassword) => apiClient.post('/auth/reset-password', { token, new_password: newPassword }),
  changePassword: (currentPassword, newPassword) => apiClient.post('/auth/change-password', { current_password: currentPassword, new_password: newPassword }),
};

// Live operational data and ML-powered risk analysis
export const statsApi = {
  dashboard: () => apiClient.get('/stats/dashboard'),
  analytics: () => apiClient.get('/stats/analytics'),
};

export const predictionsApi = {
  hotspots: (params) => apiClient.get('/predictions/hotspots', { params }),
  heatmap: (params) => apiClient.get('/predictions/heatmap', { params }),
  predict: (params) => apiClient.post('/predictions/predict', null, { params }),
};
