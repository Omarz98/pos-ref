import api from "./api.js"; // Ajusta la ruta a tu instancia Axios

export const reportesApi = {
  resumenVentas: async (params, signal) => {
    const { data } = await api.get("/reportes/ventas/resumen", {
      params,
      signal,
    });

    return data;
  },

  ventasDiarias: async (params, signal) => {
    const { data } = await api.get("/reportes/ventas/diarias", {
      params,
      signal,
    });

    return data;
  },

  detalleVentas: async (params, signal) => {
    const { data } = await api.get("/reportes/ventas/detalle", {
      params,
      signal,
    });

    return data;
  },

  metodosPago: async (params, signal) => {
    const { data } = await api.get("/reportes/ventas/metodos-pago", {
      params,
      signal,
    });

    return data;
  },

  ingresosCaja: async (params, signal) => {
    const { data } = await api.get("/reportes/caja/ingresos", {
      params,
      signal,
    });
    return data;
  },

  operacion: async (signal) => {
    const { data } = await api.get("/reportes/operacion", {
      signal,
    });

    return data;
  },
};
