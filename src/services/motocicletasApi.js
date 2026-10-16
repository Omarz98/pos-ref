import api from "./api"; // Ajusta a la ruta de tu instancia Axios

export const motocicletasApi = {
  listar: () =>
    api.get("/motocicletas"),

  obtener: (id) =>
    api.get(`/motocicletas/${id}`),

  porCliente: (clienteId) =>
    api.get(`/motocicletas/cliente/${clienteId}`),

  crear: (data) =>
    api.post("/motocicletas", data),

  actualizar: (id, data) =>
    api.put(`/motocicletas/${id}`, data),

  historial: (id) =>
    api.get(`/motocicletas/${id}/historial`),
};