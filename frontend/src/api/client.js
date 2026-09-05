import axios from "axios";

// More robust API URL resolution
const getApiUrl = () => {
  // 1. Use environment variable if set
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // 2. Fallback for production (Render URL)
  if (import.meta.env.PROD) {
    return "https://anti-poaching-backend.onrender.com/api";
  }
  
  // 3. Fallback for local development
  return "http://localhost:8000/api";
};

const API_BASE_URL = getApiUrl();
console.log(`🔵 API Base URL (${import.meta.env.MODE} mode):`, API_BASE_URL);

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - add token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem("access_token");
      // Avoid redirect loop
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    
    // Handle CORS or network errors
    if (error.code === "ERR_NETWORK") {
      console.error("🌐 Network error - is the backend running?", error.message);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;