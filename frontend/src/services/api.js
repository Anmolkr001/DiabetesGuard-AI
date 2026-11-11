import axios from 'axios';

// Dynamically select API base URL with resilient fallback
const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // If running on Vite dev server (port 3000), default to proxy /api
    if (window.location.port === '3000') {
      return '/api';
    }
    // If served on any other host/port (e.g. 5173, 4173), target backend directly
    return 'http://127.0.0.1:8000/api';
  }
  return 'http://127.0.0.1:8000/api';
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 20000,
});

// Automatic fallback interceptor: if relative /api fails with Network Error, fallback to direct http://127.0.0.1:8000/api
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      (!error.response || error.code === 'ERR_NETWORK') &&
      !originalRequest._retry &&
      originalRequest.baseURL === '/api'
    ) {
      originalRequest._retry = true;
      originalRequest.baseURL = 'http://127.0.0.1:8000/api';
      return api(originalRequest);
    }
    return Promise.reject(error);
  }
);

export const assessmentService = {
  // 1. Clinical Assessment (PIMA)
  assessPima: async (data) => {
    const response = await api.post('/assessment/pima', data);
    return response.data;
  },

  // 2. Non-Invasive Lifestyle Screening (CDC)
  assessCdc: async (data) => {
    const response = await api.post('/assessment/cdc', data);
    return response.data;
  },

  // 3. Symptom-Based Triage (UCI)
  assessUci: async (data) => {
    const response = await api.post('/assessment/uci', data);
    return response.data;
  },

  // 4. Assessment History
  getHistory: async () => {
    const response = await api.get('/assessment/history');
    return response.data;
  },

  // 5. Model Analytics & Metrics
  getModelMetrics: async () => {
    const response = await api.get('/model/metrics');
    return response.data;
  },

  // 6. Platform Information
  getModelInfo: async () => {
    const response = await api.get('/model/information');
    return response.data;
  },

  // 7. System Health
  checkHealth: async () => {
    const response = await api.get('/health');
    return response.data;
  }
};

export default api;
