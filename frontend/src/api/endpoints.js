import apiClient from "./client";

// Helper to handle API errors consistently
const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error
    console.error(`❌ API Error (${error.response.status}):`, error.response.data);
    throw new Error(error.response.data?.detail || error.response.data?.message || "Server error occurred");
  } else if (error.request) {
    // Request made but no response
    console.error("🌐 Network Error - Backend might be down:", error.request);
    throw new Error("Network error - please check your internet connection");
  } else {
    // Something else happened
    console.error("⚠️ API Setup Error:", error.message);
    throw error;
  }
};

// Species
export const speciesApi = {
  getAll: (params) => apiClient.get("/species", { params }).catch(handleApiError),
  getById: (id) => apiClient.get(`/species/${id}`).catch(handleApiError),
  search: (q) => apiClient.get("/species/search", { params: { q } }).catch(handleApiError),
  create: (data) => apiClient.post("/species", data).catch(handleApiError),
  update: (id, data) => apiClient.put(`/species/${id}`, data).catch(handleApiError),
  delete: (id) => apiClient.delete(`/species/${id}`).catch(handleApiError),
};

// Incidents
export const incidentsApi = {
  getAll: (params) => apiClient.get("/incidents", { params }).catch(handleApiError),
  getById: (id) => apiClient.get(`/incidents/${id}`).catch(handleApiError),
  create: (data) => apiClient.post("/incidents", data).catch(handleApiError),
  update: (id, data) => apiClient.put(`/incidents/${id}`, data).catch(handleApiError),
  delete: (id) => apiClient.delete(`/incidents/${id}`).catch(handleApiError),
  resolve: (id) => apiClient.post(`/incidents/${id}/resolve`).catch(handleApiError),
  assign: (id, rangerId) => apiClient.post(`/incidents/${id}/assign`, null, { 
    params: { ranger_id: rangerId } 
  }).catch(handleApiError),
};

// Rangers
export const rangersApi = {
  getAll: () => apiClient.get("/rangers").catch(handleApiError),
  getById: (id) => apiClient.get(`/rangers/${id}`).catch(handleApiError),
  create: (data) => apiClient.post("/rangers", data).catch(handleApiError),
  update: (id, data) => apiClient.put(`/rangers/${id}`, data).catch(handleApiError),
  delete: (id) => apiClient.delete(`/rangers/${id}`).catch(handleApiError),
};

// Patrols
export const patrolsApi = {
  getAll: () => apiClient.get("/patrols").catch(handleApiError),
  getById: (id) => apiClient.get(`/patrols/${id}`).catch(handleApiError),
  create: (data) => apiClient.post("/patrols", data).catch(handleApiError),
  update: (id, data) => apiClient.put(`/patrols/${id}`, data).catch(handleApiError),
  delete: (id) => apiClient.delete(`/patrols/${id}`).catch(handleApiError),
  complete: (id) => apiClient.post(`/patrols/${id}/complete`).catch(handleApiError),
};

// Reports
export const reportsApi = {
  getAll: () => apiClient.get("/reports").catch(handleApiError),
  getById: (id) => apiClient.get(`/reports/${id}`).catch(handleApiError),
  create: (data) => apiClient.post("/reports", data).catch(handleApiError),
  update: (id, data) => apiClient.put(`/reports/${id}`, data).catch(handleApiError),
  delete: (id) => apiClient.delete(`/reports/${id}`).catch(handleApiError),
};

// Protected Areas
export const protectedAreasApi = {
  getAll: (config) => apiClient.get("/protected-areas", config).catch(handleApiError),
  getById: (id) => apiClient.get(`/protected-areas/${id}`).catch(handleApiError),
  create: (data) => apiClient.post("/protected-areas", data).catch(handleApiError),
  update: (id, data) => apiClient.put(`/protected-areas/${id}`, data).catch(handleApiError),
  delete: (id) => apiClient.delete(`/protected-areas/${id}`).catch(handleApiError),
};

// Authentication
export const authApi = {
  login: (email, password) => {
    const form = new URLSearchParams({ username: email, password });
    return apiClient.post("/auth/login", form, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }).catch(handleApiError);
  },
  me: () => apiClient.get("/auth/me").catch(handleApiError),
  register: (data) => apiClient.post("/auth/register", data).catch(handleApiError),
  requestPasswordReset: (email) => apiClient.post("/auth/request-password-reset", { email }).catch(handleApiError),
  resetPassword: (token, new_password) => apiClient.post("/auth/reset-password", { token, new_password }).catch(handleApiError),
  changePassword: (current_password, new_password) => apiClient.post("/auth/change-password", { current_password, new_password }).catch(handleApiError),
};

// Alerts
export const alertsApi = {
  getAll: (params) => apiClient.get("/alerts", { params }).catch(handleApiError),
  create: (data) => apiClient.post("/alerts", data).catch(handleApiError),
  acknowledge: (id) => apiClient.post(`/alerts/${id}/acknowledge`).catch(handleApiError),
};

// Equipment
export const equipmentApi = {
  getAll: (params) => apiClient.get("/equipment", { params }).catch(handleApiError),
  getById: (id) => apiClient.get(`/equipment/${id}`).catch(handleApiError),
  create: (data) => apiClient.post("/equipment", data).catch(handleApiError),
  update: (id, data) => apiClient.put(`/equipment/${id}`, data).catch(handleApiError),
  delete: (id) => apiClient.delete(`/equipment/${id}`).catch(handleApiError),
};

// Observations
export const observationsApi = {
  getAll: (params) => apiClient.get("/observations", { params }).catch(handleApiError),
  create: (data) => apiClient.post("/observations", data).catch(handleApiError),
};

// Poachers
export const poachersApi = {
  getAll: (params) => apiClient.get("/poachers", { params }).catch(handleApiError),
  getById: (id) => apiClient.get(`/poachers/${id}`).catch(handleApiError),
  create: (data) => apiClient.post("/poachers", data).catch(handleApiError),
  update: (id, data) => apiClient.put(`/poachers/${id}`, data).catch(handleApiError),
  delete: (id) => apiClient.delete(`/poachers/${id}`).catch(handleApiError),
};

// Stats
export const statsApi = {
  dashboard: (params) => apiClient.get("/stats/dashboard", { params }).catch(handleApiError),
  analytics: (params) => apiClient.get("/stats/analytics", { params }).catch(handleApiError),
};

// Predictions
export const predictionsApi = {
  hotspots: (params) => apiClient.get("/predictions/hotspots", { params }).catch(handleApiError),
  heatmap: (params) => apiClient.get("/predictions/heatmap", { params }).catch(handleApiError),
  parkHeatmap: () => apiClient.get("/predictions/park-heatmap").catch(handleApiError),
  predict: (params) => apiClient.post("/predictions/predict", null, { params }).catch(handleApiError),
};

// Optional: Export a health check function
export const healthApi = {
  check: () => apiClient.get("/health").catch(handleApiError),
};

// Optional: Export all APIs as a single object
export const api = {
  species: speciesApi,
  incidents: incidentsApi,
  rangers: rangersApi,
  patrols: patrolsApi,
  reports: reportsApi,
  protectedAreas: protectedAreasApi,
  auth: authApi,
  alerts: alertsApi,
  equipment: equipmentApi,
  observations: observationsApi,
  poachers: poachersApi,
  stats: statsApi,
  predictions: predictionsApi,
  health: healthApi,
};