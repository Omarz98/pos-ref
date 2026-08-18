import api from "./api";

export const tallerApi = {

  // =====================================================
  // DASHBOARD
  // =====================================================

  dashboard: () =>
    api.get("/taller/dashboard"),


  // =====================================================
  // ORDENES DE TALLER
  // =====================================================

  listarOrdenes: (params = {}) =>
    api.get("/ordenes-taller", {
      params,
    }),

  obtenerOrden: (id) =>
    api.get(`/ordenes-taller/${id}`),

  crearOrden: (data) =>
    api.post("/ordenes-taller", data),

  actualizarOrden: (id, data) =>
    api.put(`/ordenes-taller/${id}`, data),


  // =====================================================
  // ESTADO
  // =====================================================

  cambiarEstado: (id, data) =>
    api.patch(
      `/ordenes-taller/${id}/estado`,
      data
    ),


  // =====================================================
  // TECNICO
  // =====================================================

  asignarTecnico: (id, data) =>
    api.patch(
      `/ordenes-taller/${id}/tecnico`,
      data
    ),

  tecnicos: () =>
    api.get("/taller/tecnicos"),


  // =====================================================
  // SERVICIOS DE LA ORDEN
  // =====================================================

  agregarServicio: (id, data) =>
    api.post(
      `/ordenes-taller/${id}/servicios`,
      data
    ),

  eliminarServicio: (id, detalleId) =>
    api.delete(
      `/ordenes-taller/${id}/servicios/${detalleId}`
    ),


  // =====================================================
  // PRODUCTOS / REFACCIONES DE LA ORDEN
  // =====================================================

  agregarProducto: (id, data) =>
    api.post(
      `/ordenes-taller/${id}/productos`,
      data
    ),

  eliminarProducto: (id, detalleId) =>
    api.delete(
      `/ordenes-taller/${id}/productos/${detalleId}`
    ),


  // =====================================================
  // HISTORIAL
  // =====================================================

  historialMoto: (motoId) =>
    api.get(
      `/ordenes-taller/motocicleta/${motoId}/historial`
    ),


  // =====================================================
  // ORDENES PENDIENTES DE COBRO
  // =====================================================

  ordenesPendientes: () =>
    api.get("/ordenes-taller/pendientes"),


  // =====================================================
  // CATALOGOS EXISTENTES DEL SISTEMA
  // =====================================================

  clientes: () =>
    api.get("/clientes"),

  motosCliente: (clienteId) =>
    api.get(
      `/motocicletas/cliente/${clienteId}`
    ),

  servicios: () =>
    api.get("/servicios"),

  productos: () =>
    api.get("/productos"),
};