
import axios from "axios";
import { useAuthStore } from "../store/authStore";

const isPhoneTunnel = window.location.hostname ===
  "creates-exams-opinion-say.trycloudflare.com";

const API_URL = isPhoneTunnel
  ? "https://graphic-reward-george-bottles.trycloudflare.com/api"
  : import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatically attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
