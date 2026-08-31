import axios from "axios";

// 1. Приоритет: переменная окружения -> fallback на текущий хост (/api)
const baseURL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD
    ? "/api"
    : "https://ortera-crm.onrender.com/api");

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// 2. Автоматическое добавление токена к каждому запросу
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 3. Обработка протухшей сессии (401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("userRole");
      if (window.location.pathname !== "/auth") {
        window.location.href = "/auth";
      }
    }
    return Promise.reject(error);
  }
);

export default api;