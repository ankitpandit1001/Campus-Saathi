import axios from 'axios';

/**
 * Resolves the API base URL cleanly:
 * - If VITE_API_URL is provided as https://backend.onrender.com, automatically normalizes to https://backend.onrender.com/api
 * - If VITE_API_URL is empty, defaults to '/api' (proxied by Vite in dev or Vercel rewrites)
 */
export function getApiBase() {
  let base = (import.meta.env.VITE_API_URL || '/api').trim();
  if (base.endsWith('/')) {
    base = base.slice(0, -1);
  }
  if (/^https?:\/\//i.test(base) && !base.endsWith('/api')) {
    base = `${base}/api`;
  }
  return base;
}

/**
 * Resolves asset and upload URLs for uploaded images.
 * In production when backend is on Render and frontend is on Vercel,
 * relative paths like '/uploads/abc.jpg' will be resolved to the backend origin.
 */
export function getAssetUrl(path) {
  if (!path) return '';
  if (/^(https?:|\/\/|data:|blob:)/i.test(path)) {
    return path;
  }
  const apiBase = import.meta.env.VITE_API_URL;
  if (apiBase && /^https?:\/\//i.test(apiBase)) {
    const origin = apiBase.replace(/\/api\/?$/, '');
    return `${origin}${path.startsWith('/') ? '' : '/'}${path}`;
  }
  return path;
}

const api = axios.create({
  baseURL: getApiBase(),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.getAssetUrl = getAssetUrl;


// Request interceptor to attach Bearer token and active institution context
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cf_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const activeInstitutionId = localStorage.getItem('cf_active_institution_id');
    if (activeInstitutionId && !config.headers['X-Institution-Id']) {
      config.headers['X-Institution-Id'] = activeInstitutionId;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle session expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if expired or invalid
      if (
        window.location.pathname !== '/login' &&
        window.location.pathname !== '/register' &&
        window.location.pathname !== '/'
      ) {
        localStorage.removeItem('cf_token');
        localStorage.removeItem('cf_user');
        localStorage.removeItem('cf_active_institution_id');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
