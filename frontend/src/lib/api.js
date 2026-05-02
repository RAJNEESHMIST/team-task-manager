import axios from 'axios';

let baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Diagnostic: Log the API URL being used
if (import.meta.env.PROD) {
  if (!import.meta.env.VITE_API_URL) {
    console.warn("⚠️ VITE_API_URL is NOT set in production. Defaulting to localhost:8080 which will likely fail.");
  } else {
    console.log("🚀 Production API URL:", baseURL);
  }
}

// Force HTTPS for any production URL (non-localhost)
if (baseURL && !baseURL.includes('localhost') && !baseURL.startsWith('https://')) {
  baseURL = baseURL.replace('http://', '').replace('https://', '');
  baseURL = `https://${baseURL}`;
}

const api = axios.create({
  baseURL,
  timeout: 10000, // 10s timeout
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Diagnostic: Log detailed error info
    console.group("❌ API Error");
    console.error("Path:", error.config?.url);
    console.error("Status:", error.response?.status);
    console.error("Message:", error.message);
    if (error.response?.data) console.error("Data:", error.response.data);
    console.groupEnd();

    if (error.response && error.response.status === 403) {
      window.dispatchEvent(new Event('auth:restricted'));
    }
    return Promise.reject(error);
  }
);

export default api;
