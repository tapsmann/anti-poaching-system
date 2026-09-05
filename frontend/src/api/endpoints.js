import apiClient from "./client";

// Species
export const speciesApi = {
  getAll: (params) => apiClient.get("/species", { params }),
  getById: (id) => apiClient.get(`/species/${id}`),
  search: (q) => apiClient.get("/species/search", { params: { q } }),
  create: (data) => apiClient.post("/species", data),
  update: (id, data) => apiClient.put(`/species/${id}`, data),
  delete: (id) => apiClient.delete(`/species/${id}`),
};

// Incidents
export const incidentsApi = {
  getAll: (params) => apiClient.get("/incidents", { params }),
  getById: (id) => apiClient.get(`/incidents/${id}`),
  create: (data) => apiClient.post("/incidents", data),
  update: (id, data) => apiClient.put(`/incidents/${id}`, data),
  delete: (id) => apiClient.delete(`/incidents/${id}`),
  resolve: (id) => apiClient.post(`/incidents/${id}/resolve`),
  assign: (id, rangerId) => apiClient.post(`/incidents/${id}/assign`, null, { params: { ranger_id: rangerId } }),
};

// Rangers
export const rangersApi = {
  getAll: () => apiClient.get("/rangers"),
  getById: (id) => apiClient.get(`/rangers/${id}`),
  create: (data) => apiClient.post("/rangers", data),
  update: (id, data) => apiClient.put(`/rangers/${id}`, data),
  delete: (id) => apiClient.delete(`/rangers/${id}`),
};

// Patrols
export const patrolsApi = {
  getAll: () => apiClient.get("/patrols"),
  getById: (id) => apiClient.get(`/patrols/${id}`),
  create: (data) => apiClient.post("/patrols", data),
  update: (id, data) => apiClient.put(`/patrols/${id}`, data),
  delete: (id) => apiClient.delete(`/patrols/${id}`),
  complete: (id) => apiClient.post(`/patrols/${id}/complete`),
};

// Reports
export const reportsApi = {
  getAll: () => apiClient.get("/reports"),
  getById: (id) => apiClient.get(`/reports/${id}`),
  create: (data) => apiClient.post("/reports", data),
  update: (id, data) => apiClient.put(`/reports/${id}`, data),
  delete: (id) => apiClient.delete(`/reports/${id}`),
};

// Protected Areas
export const protectedAreasApi = {
  getAll: () => apiClient.get("/protected-areas"),
  getById: (id) => apiClient.get(`/protected-areas/${id}`),
  create: (data) => apiClient.post("/protected-areas", data),
  update: (id, data) => apiClient.put(`/protected-areas/${id}`, data),
  delete: (id) => apiClient.delete(`/protected-areas/${id}`),
};

// Authentication
export const authApi = {
  login: (email, password) => {
    const form = new URLSearchParams({ username: email, password });
    return apiClient.post("/auth/login", form, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
  },
  me: () => apiClient.get("/auth/me"),
  register: (data) => apiClient.post("/auth/register", data),
  requestPasswordReset: (email) => apiClient.post("/auth/request-password-reset", { email }),
  resetPassword: (token, new_password) => apiClient.post("/auth/reset-password", { token, new_password }),
  changePassword: (current_password, new_password) => apiClient.post("/auth/change-password", { current_password, new_password }),
};

// Alerts
export const alertsApi = {
  getAll: (params) => apiClient.get("/alerts", { params }),
  create: (data) => apiClient.post("/alerts", data),
  acknowledge: (id) => apiClient.post(`/alerts/${id}/acknowledge`),
};

// Equipment
export const equipmentApi = {
  getAll: (params) => apiClient.get("/equipment", { params }),
  getById: (id) => apiClient.get(`/equipment/${id}`),
  create: (data) => apiClient.post("/equipment", data),
  update: (id, data) => apiClient.put(`/equipment/${id}`, data),
  delete: (id) => apiClient.delete(`/equipment/${id}`),
};

// Observations
export const observationsApi = {
  getAll: (params) => apiClient.get("/observations", { params }),
  create: (data) => apiClient.post("/observations", data),
};

// Poachers
export const poachersApi = {
  getAll: (params) => apiClient.get("/poachers", { params }),
  getById: (id) => apiClient.get(`/poachers/${id}`),
  create: (data) => apiClient.post("/poachers", data),
  update: (id, data) => apiClient.put(`/poachers/${id}`, data),
  delete: (id) => apiClient.delete(`/poachers/${id}`),
};

// Stats
export const statsApi = {
  dashboard: (params) => apiClient.get("/stats/dashboard", { params }),
  analytics: (params) => apiClient.get("/stats/analytics", { params }),
};

// Predictions
export const predictionsApi = {
  hotspots: (params) => apiClient.get("/predictions/hotspots", { params }),
  heatmap: (params) => apiClient.get("/predictions/heatmap", { params }),
  parkHeatmap: () => apiClient.get("/predictions/park-heatmap"),
  predict: (params) => apiClient.post("/predictions/predict", null, { params }),
};