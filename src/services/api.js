import axios from "axios";

import {
  sesionExpirada,
  limpiarSesion,
} from "../auth/session.js";

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    const esLogin = config.url?.includes("/auth/login");

    if (!esLogin && token) {
      if (sesionExpirada()) {
        limpiarSesion();

        window.dispatchEvent(
          new Event("posref:sesion-expirada")
        );

        return Promise.reject(
          new Error("La sesión ha expirado")
        );
      }

      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      !error.config?.url?.includes("/auth/login")
    ) {
      limpiarSesion();

      window.dispatchEvent(
        new Event("posref:sesion-expirada")
      );
    }

    return Promise.reject(error);
  }
);

export default api;
