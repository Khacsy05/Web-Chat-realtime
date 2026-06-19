import axios from "axios";

const isTokenExpired = (token) => {
  if (!token) return true;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const now = Date.now() / 1000;

    return payload.exp <= now;
  } catch {
    return true;
  }
};

const clearStoredAuth = () => {
  localStorage.removeItem("auth-storage");
};
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
});

api.interceptors.request.use(
  (config) => {
    const storage = localStorage.getItem("auth-storage");

    if (!storage) {
      return config;
    }

    const parsedStorage = JSON.parse(storage);
    const token = parsedStorage?.state?.token;

    if (!token || isTokenExpired(token)) {
      clearStoredAuth();

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }

      return config;
    }

    config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearStoredAuth();

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
