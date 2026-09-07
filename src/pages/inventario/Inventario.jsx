import { useEffect, useMemo, useState } from "react";
import api from "../../services/api.js";

import {
  FaBoxes,
  FaExclamationTriangle,
  FaTimesCircle,
  FaDollarSign,
  FaHistory,
  FaPlus,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
} from "react-icons/fa";

import "../../styles/inventario/Inventario.css";

export default function Inventario() {
  /* =========================================================
     ESTADOS
  ========================================================= */

  const [inventario, setInventario] = useState([]);

  const [resumen, setResumen] = useState({
    totalProductos: 0,
    productosStockBajo: 0,
    productosAgotados: 0,
    valorInventario: 0,
  });

  const [busqueda, setBusqueda] = useState("");

  /* =========================================================
     PAGINACIÓN
  ========================================================= */

  const [paginaActual, setPaginaActual] = useState(1);

  const [registrosPorPagina, setRegistrosPorPagina] = useState(10);

  /* =========================================================
     MODALES
  ========================================================= */

  const [modalMovimiento, setModalMovimiento] = useState(false);

  const [modalKardex, setModalKardex] = useState(false);

  const [productoSeleccionado, setProductoSeleccionado] = useState(null);

  const [movimientos, setMovimientos] = useState([]);

  /* =========================================================
     MOVIMIENTO
  ========================================================= */

  const [tipo, setTipo] = useState("ENTRADA");

  const [cantidad, setCantidad] = useState("");

  const [costoUnitario, setCostoUnitario] = useState("");

  const [motivo, setMotivo] = useState("");

  /* =========================================================
     ESTADOS GENERALES
  ========================================================= */

  const [error, setError] = useState("");

  const [cargando, setCargando] = useState(false);

  /* =========================================================
     CARGA INICIAL
  ========================================================= */

  useEffect(() => {
    cargarDatos();
  }, []);

  /* =========================================================
     CARGAR INVENTARIO
  ========================================================= */

  const cargarDatos = async () => {
    setCargando(true);
    setError("");

    try {
      const [inventarioResponse, resumenResponse] = await Promise.all([
        api.get("/inventario"),
        api.get("/inventario/resumen"),
      ]);

      setInventario(inventarioResponse.data ?? []);

      setResumen(resumenResponse.data ?? {});
    } catch (error) {
      console.error("Error al consultar inventario", error);

      setError(
        error.response?.data?.message ||
          "No fue posible consultar el inventario",
      );
    } finally {
      setCargando(false);
    }
  };

  /* =========================================================
     FILTRAR INVENTARIO
  ========================================================= */

  const inventarioFiltrado = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    if (!texto) {
      return inventario;
    }

    return inventario.filter((item) => {
      return (
        item.nombre?.toLowerCase().includes(texto) ||
        item.codigo?.toLowerCase().includes(texto) ||
        item.codigoBarras?.toLowerCase().includes(texto) ||
        item.descripcion?.toLowerCase().includes(texto)
      );
    });
  }, [inventario, busqueda]);

  /* =========================================================
     PAGINACIÓN
  ========================================================= */

  const totalRegistros = inventarioFiltrado.length;

  const totalPaginas = Math.ceil(totalRegistros / registrosPorPagina);

  const indiceInicio = (paginaActual - 1) * registrosPorPagina;

  const indiceFin = indiceInicio + registrosPorPagina;

  const inventarioPaginado = useMemo(() => {
    return inventarioFiltrado.slice(indiceInicio, indiceFin);
  }, [inventarioFiltrado, indiceInicio, indiceFin]);

  /*
   * Si después de una búsqueda la página
   * actual queda fuera del total disponible,
   * regresamos a una página válida.
   */

  useEffect(() => {
    if (totalPaginas > 0 && paginaActual > totalPaginas) {
      setPaginaActual(totalPaginas);
    }
  }, [totalPaginas, paginaActual]);

  /* =========================================================
     CAMBIAR PÁGINA
  ========================================================= */

  const cambiarPagina = (pagina) => {
    if (pagina < 1) {
      return;
    }

    if (totalPaginas > 0 && pagina > totalPaginas) {
      return;
    }

    setPaginaActual(pagina);
  };

  /* =========================================================
     ABRIR MOVIMIENTO
  ========================================================= */

  const abrirMovimiento = (producto = null) => {
    setProductoSeleccionado(producto);

    setTipo("ENTRADA");
    setCantidad("");
    setCostoUnitario("");
    setMotivo("");

    setModalMovimiento(true);
  };

  /* =========================================================
     CERRAR MOVIMIENTO
  ========================================================= */

  const cerrarMovimiento = () => {
    setModalMovimiento(false);

    setProductoSeleccionado(null);

    setCantidad("");
    setCostoUnitario("");
    setMotivo("");
  };

  /* =========================================================
     REGISTRAR MOVIMIENTO
  ========================================================= */

  const registrarMovimiento = async () => {
    if (!productoSeleccionado) {
      alert("Selecciona un producto");

      return;
    }

    if (!cantidad || Number(cantidad) <= 0) {
      alert("La cantidad debe ser mayor a cero");

      return;
    }

    try {
      const payload = {
        productoId: productoSeleccionado.productoId,

        tipo,

        cantidad: Number(cantidad),

        costoUnitario: costoUnitario ? Number(costoUnitario) : null,

        motivo,

        referenciaTipo: "MANUAL",

        referenciaId: null,

        usuarioId: null,
      };

      await api.post("/inventario/movimientos", payload);

      cerrarMovimiento();

      await cargarDatos();
    } catch (error) {
      console.error("Error registrando movimiento", error);

      alert(
        error.response?.data?.message ||
          "No fue posible registrar el movimiento",
      );
    }
  };

  /* =========================================================
     KARDEX
  ========================================================= */

  const verKardex = async (producto) => {
    setProductoSeleccionado(producto);

    try {
      const response = await api.get(
        `/inventario/producto/${producto.productoId}/movimientos`,
      );

      setMovimientos(response.data ?? []);

      setModalKardex(true);
    } catch (error) {
      console.error("Error consultando movimientos", error);

      alert("No fue posible consultar el Kardex");
    }
  };

  /* =========================================================
     FORMATO MONEDA
  ========================================================= */

  const formatoMoneda = (valor) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(Number(valor || 0));
  };

  /* =========================================================
     ESTADO STOCK
  ========================================================= */

  const claseEstado = (estado) => {
    switch (estado) {
      case "NORMAL":
        return "stock-normal";

      case "BAJO":
        return "stock-bajo";

      case "AGOTADO":
        return "stock-agotado";

      default:
        return "";
    }
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="inventario-page">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="inventario-header">
        <div>
          <h1>Inventario</h1>

          <p>Control de existencias y movimientos de productos.</p>
        </div>
      </header>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && <div className="inventory-error">{error}</div>}

      {/* =====================================================
          KPIs
      ===================================================== */}

      <section className="inventory-kpis">
        <div className="inventory-card">
          <div className="inventory-icon">
            <FaBoxes />
          </div>

          <div>
            <span>Productos</span>

            <strong>{resumen.totalProductos || 0}</strong>
          </div>
        </div>

        <div className="inventory-card">
          <div className="inventory-icon">
            <FaExclamationTriangle />
          </div>

          <div>
            <span>Stock bajo</span>

            <strong>{resumen.productosStockBajo || 0}</strong>
          </div>
        </div>

        <div className="inventory-card">
          <div className="inventory-icon">
            <FaTimesCircle />
          </div>

          <div>
            <span>Agotados</span>

            <strong>{resumen.productosAgotados || 0}</strong>
          </div>
        </div>

        <div className="inventory-card">
          <div className="inventory-icon">
            <FaDollarSign />
          </div>

          <div>
            <span>Valor inventario</span>

            <strong>{formatoMoneda(resumen.valorInventario)}</strong>
          </div>
        </div>
      </section>

      {/* =====================================================
          TABLA INVENTARIO
      ===================================================== */}

      <section className="inventory-table-card">
        {/* ===============================
            TOOLBAR
        =============================== */}

        <div className="inventory-toolbar">
          <div>
            <h2>Existencias</h2>

            <span className="inventory-count">
              {totalRegistros} producto
              {totalRegistros !== 1 ? "s" : ""}
            </span>
          </div>

          <input
            type="search"
            placeholder="Buscar producto..."
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);

              setPaginaActual(1);
            }}
          />
        </div>

        {/* ===============================
            CARGANDO
        =============================== */}

        {cargando ? (
          <div className="inventory-loading">Cargando inventario...</div>
        ) : (
          <>
            {/* ===========================
                TABLA
            =========================== */}

            <div className="inventory-table-wrapper">
              <table className="inventory-table">
                <thead>
                  <tr>
                    <th>Código</th>

                    <th>Producto</th>

                    <th>Descripcion</th>

                    <th>Existencia</th>

                    <th>Mínimo</th>

                    <th>Unidad</th>

                    <th>Estado</th>

                    <th>Compra</th>

                    <th>Venta</th>

                    <th>Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {inventarioPaginado.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="inventory-empty">
                        {busqueda
                          ? "No se encontraron productos con esa búsqueda"
                          : "No existen productos registrados"}
                      </td>
                    </tr>
                  ) : (
                    inventarioPaginado.map((producto) => (
                      <tr key={producto.productoId}>
                        <td>
                          {producto.codigoBarras || producto.codigo || "-"}
                        </td>

                        <td>
                          <strong>{producto.nombre}</strong>
                        </td>

                        <td>
                          <strong>{producto.descripcion}</strong>
                        </td>

                        <td>{producto.stockActual}</td>

                        <td>{producto.stockMinimo}</td>

                        <td>{producto.unidadMedida}</td>

                        <td>
                          <span
                            className={`inventory-status ${claseEstado(
                              producto.estado,
                            )}`}
                          >
                            {producto.estado}
                          </span>
                        </td>

                        <td>{formatoMoneda(producto.precioCompra)}</td>

                        <td>{formatoMoneda(producto.precioVenta)}</td>

                        <td>
                          <div className="inventory-actions">
                            <button
                              type="button"
                              className="inventory-action movement"
                              title="Registrar movimiento"
                              onClick={() => abrirMovimiento(producto)}
                            >
                              <FaPlus />
                            </button>

                            <button
                              type="button"
                              className="inventory-action history"
                              title="Ver Kardex"
                              onClick={() => verKardex(producto)}
                            >
                              <FaHistory />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* ===========================
                PAGINACIÓN
            =========================== */}

            <div className="inventory-pagination">
              {/* INFORMACIÓN */}

              <div className="inventory-pagination-info">
                {totalRegistros > 0 ? (
                  <>
                    Mostrando <strong>{indiceInicio + 1}</strong>
                    {" - "}
                    <strong>{Math.min(indiceFin, totalRegistros)}</strong>
                    {" de "}
                    <strong>{totalRegistros}</strong>
                    {" productos"}
                  </>
                ) : (
                  <>0 productos</>
                )}
              </div>

              {/* CONTROLES */}

              <div className="inventory-pagination-controls">
                <div className="inventory-page-size">
                  <span>Mostrar</span>

                  <select
                    value={registrosPorPagina}
                    onChange={(e) => {
                      setRegistrosPorPagina(Number(e.target.value));

                      setPaginaActual(1);
                    }}
                  >
                    <option value={10}>10</option>

                    <option value={20}>20</option>

                    <option value={50}>50</option>

                    <option value={100}>100</option>
                  </select>
                </div>

                {/* PRIMERA */}

                <button
                  type="button"
                  title="Primera página"
                  disabled={paginaActual === 1 || totalPaginas === 0}
                  onClick={() => cambiarPagina(1)}
                >
                  <FaAngleDoubleLeft />
                </button>

                {/* ANTERIOR */}

                <button
                  type="button"
                  title="Página anterior"
                  disabled={paginaActual === 1 || totalPaginas === 0}
                  onClick={() => cambiarPagina(paginaActual - 1)}
                >
                  <FaChevronLeft />
                </button>

                {/* PÁGINA */}

                <div className="inventory-page-number">
                  Página{" "}
                  <strong>{totalPaginas === 0 ? 0 : paginaActual}</strong>
                  {" de "}
                  <strong>{totalPaginas}</strong>
                </div>

                {/* SIGUIENTE */}

                <button
                  type="button"
                  title="Página siguiente"
                  disabled={paginaActual >= totalPaginas || totalPaginas === 0}
                  onClick={() => cambiarPagina(paginaActual + 1)}
                >
                  <FaChevronRight />
                </button>

                {/* ÚLTIMA */}

                <button
                  type="button"
                  title="Última página"
                  disabled={paginaActual >= totalPaginas || totalPaginas === 0}
                  onClick={() => cambiarPagina(totalPaginas)}
                >
                  <FaAngleDoubleRight />
                </button>
              </div>
            </div>
          </>
        )}
      </section>

      {/* =====================================================
          MODAL MOVIMIENTO
      ===================================================== */}

      {modalMovimiento && (
        <div className="inventory-modal-overlay">
          <div className="inventory-modal">
            <div className="inventory-modal-header">
              <h2>Movimiento de inventario</h2>

              <button type="button" onClick={cerrarMovimiento}>
                <FaTimes />
              </button>
            </div>

            <div className="inventory-modal-body">
              <div className="inventory-field">
                <label>Producto</label>

                <input
                  value={
                    productoSeleccionado
                      ? `${productoSeleccionado.nombre || ""}-${productoSeleccionado.descripcion || ""}`
                      : ""
                  }
                  disabled
                />
              </div>

              <div className="inventory-field">
                <label>Tipo</label>

                <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
                  <option value="ENTRADA">Entrada</option>

                  <option value="SALIDA">Salida</option>

                  <option value="AJUSTE_ENTRADA">Ajuste entrada</option>

                  <option value="AJUSTE_SALIDA">Ajuste salida</option>
                </select>
              </div>

              <div className="inventory-field">
                <label>Cantidad</label>

                <input
                  type="number"
                  min="0.001"
                  step="0.001"
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                />
              </div>

              <div className="inventory-field">
                <label>Costo unitario</label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={costoUnitario}
                  onChange={(e) => setCostoUnitario(e.target.value)}
                />
              </div>

              <div className="inventory-field">
                <label>Motivo</label>

                <textarea
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Motivo del movimiento"
                />
              </div>
            </div>

            <div className="inventory-modal-footer">
              <button
                type="button"
                className="inventory-cancel"
                onClick={cerrarMovimiento}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="inventory-save"
                onClick={registrarMovimiento}
              >
                Registrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          MODAL KARDEX
      ===================================================== */}

      {modalKardex && (
        <div className="inventory-modal-overlay">
          <div
            className="
              inventory-modal
              inventory-modal-large
            "
          >
            <div className="inventory-modal-header">
              <div>
                <h2>Kardex</h2>

                <span>{productoSeleccionado?.nombre}</span>
              </div>

              <button type="button" onClick={() => setModalKardex(false)}>
                <FaTimes />
              </button>
            </div>

            <div className="inventory-table-wrapper">
              <table className="inventory-table">
                <thead>
                  <tr>
                    <th>Fecha</th>

                    <th>Tipo</th>

                    <th>Cantidad</th>

                    <th>Anterior</th>

                    <th>Nuevo</th>

                    <th>Motivo</th>
                  </tr>
                </thead>

                <tbody>
                  {movimientos.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="inventory-empty">
                        No existen movimientos para este producto.
                      </td>
                    </tr>
                  ) : (
                    movimientos.map((movimiento) => (
                      <tr key={movimiento.id}>
                        <td>
                          {movimiento.fecha
                            ? new Date(movimiento.fecha).toLocaleString("es-MX")
                            : "-"}
                        </td>

                        <td>{movimiento.tipo}</td>

                        <td>{movimiento.cantidad}</td>

                        <td>{movimiento.stockAnterior}</td>

                        <td>{movimiento.stockNuevo}</td>

                        <td>{movimiento.motivo || "-"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
