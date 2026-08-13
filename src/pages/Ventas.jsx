import { useEffect, useMemo, useState } from "react";
import {
  FaEye,
  FaPrint,
  FaReceipt,
  FaSearch,
  FaShoppingBag,
  FaMoneyBillWave,
  FaClock,
  FaCheckCircle,
  FaTrash,
  FaPlus,
  FaTimes,
  FaCreditCard,
} from "react-icons/fa";

import api from "../services/api";
import TicketModal from "../pages/PuntoVenta/components/TicketModal";
import "../styles/Ventas.css";

export function Ventas() {
  const [ventas, setVentas] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("TODAS");

  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
  const [mostrarDetalle, setMostrarDetalle] = useState(false);
  const [mostrarTicket, setMostrarTicket] = useState(false);

  const [cargando, setCargando] = useState(true);
  const [procesandoCobro, setProcesandoCobro] = useState(false);
  const [error, setError] = useState("");

  const [pagos, setPagos] = useState([
    {
      metodo: "EFECTIVO",
      monto: 0,
    },
  ]);

  useEffect(() => {
    fetchVentas();
  }, []);

  const fetchVentas = async () => {
    setCargando(true);
    setError("");

    try {
      const ventasResponse = await api.get("/ventas");
      setVentas(ventasResponse.data ?? []);
    } catch (exception) {
      console.error("Error al consultar ventas:", exception);

      setError(
        exception.response?.data?.message ||
          exception.response?.data?.error ||
          "No fue posible consultar las ventas",
      );
    } finally {
      setCargando(false);
    }
  };

  /*
   * Si GET /ventas ya devuelve items y pagos completos,
   * puedes simplificar esta función y usar directamente la fila.
   *
   * De momento intentamos consultar /ventas/{id}, y si tu backend
   * no devuelve ese endpoint usamos la información ya disponible.
   */
  const verVenta = async (venta) => {
    setError("");

    try {
      const response = await api.get(`/ventas/${venta.id}`);

      setVentaSeleccionada(response.data ?? venta);
    } catch (exception) {
      console.warn(
        "No fue posible consultar el detalle; se usará la venta del listado:",
        exception,
      );

      setVentaSeleccionada(venta);
    }

    setPagos([
      {
        metodo: "EFECTIVO",
        monto: 0,
      },
    ]);

    setMostrarDetalle(true);
  };

  const cerrarDetalle = () => {
    setMostrarDetalle(false);
    setVentaSeleccionada(null);

    setPagos([
      {
        metodo: "EFECTIVO",
        monto: 0,
      },
    ]);
  };

  const formatearMoneda = (valor) =>
    Number(valor || 0).toLocaleString("es-MX", {
      style: "currency",
      currency: "MXN",
    });

  const formatearFecha = (fecha) => {
    if (!fecha) return "Sin fecha";

    const date = new Date(fecha);

    if (Number.isNaN(date.getTime())) {
      return String(fecha);
    }

    return date.toLocaleString("es-MX", {
      dateStyle: "short",
      timeStyle: "short",
    });
  };

  const ventasFiltradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return ventas.filter((venta) => {
      const coincideEstado =
        filtroEstado === "TODAS" ||
        venta.estado === filtroEstado;

      if (!coincideEstado) return false;

      if (!texto) return true;

      return [
        venta.id,
        venta.folio,
        venta.clienteNombre,
        venta.estado,
      ]
        .map((value) => String(value || "").toLowerCase())
        .some((value) => value.includes(texto));
    });
  }, [ventas, busqueda, filtroEstado]);

  const metricas = useMemo(() => {
    const totalVentas = ventas.reduce(
      (acc, venta) => acc + Number(venta.total || 0),
      0,
    );

    const pagadas = ventas.filter(
      (venta) => venta.estado === "PAGADA",
    );

    const pendientes = ventas.filter(
      (venta) => venta.estado === "PENDIENTE",
    );

    const saldoPendiente = pendientes.reduce(
      (acc, venta) =>
        acc + Number(venta.saldoPendiente || 0),
      0,
    );

    return {
      cantidad: ventas.length,
      totalVentas,
      pagadas: pagadas.length,
      pendientes: pendientes.length,
      saldoPendiente,
    };
  }, [ventas]);

  const agregarMetodoPago = () => {
    setPagos((actuales) => [
      ...actuales,
      {
        metodo: "EFECTIVO",
        monto: 0,
      },
    ]);
  };

  const eliminarMetodoPago = (index) => {
    if (pagos.length === 1) return;

    setPagos((actuales) =>
      actuales.filter((_, i) => i !== index),
    );
  };

  const actualizarPago = (index, campo, valor) => {
    setPagos((actuales) =>
      actuales.map((pago, i) =>
        i === index
          ? {
              ...pago,
              [campo]:
                campo === "monto"
                  ? Number(valor || 0)
                  : valor,
            }
          : pago,
      ),
    );
  };

  const nuevoPago = pagos.reduce(
    (total, pago) => total + Number(pago.monto || 0),
    0,
  );

  const saldoActual = Number(
    ventaSeleccionada?.saldoPendiente || 0,
  );

  const nuevoSaldoPendiente = Math.max(
    saldoActual - nuevoPago,
    0,
  );

  const cambio = Math.max(
    nuevoPago - saldoActual,
    0,
  );

  const cobrarVenta = async () => {
    if (!ventaSeleccionada) {
      setError("No hay una venta seleccionada");
      return;
    }

    if (ventaSeleccionada.estado !== "PENDIENTE") {
      setError("Esta venta ya se encuentra pagada");
      return;
    }

    const pagosValidos = pagos.filter(
      (pago) => Number(pago.monto || 0) > 0,
    );

    if (pagosValidos.length === 0) {
      setError("Captura al menos un pago mayor a cero");
      return;
    }

    /*
     * Si el cliente entrega más efectivo que el saldo,
     * al backend enviamos solamente el monto aplicado.
     */
    let exceso = Math.max(nuevoPago - saldoActual, 0);

    const pagosAplicados = pagosValidos
      .map((pago) => {
        let monto = Number(pago.monto || 0);

        if (
          exceso > 0 &&
          pago.metodo === "EFECTIVO"
        ) {
          const descuento = Math.min(monto, exceso);
          monto -= descuento;
          exceso -= descuento;
        }

        return {
          metodo: pago.metodo,
          monto: Number(monto.toFixed(2)),
        };
      })
      .filter((pago) => pago.monto > 0);

    setProcesandoCobro(true);
    setError("");

    try {
      const response = await api.put(
        `/ventas/${ventaSeleccionada.id}/cobrar`,
        {
          pagos: pagosAplicados,
        },
      );

      const actualizada = response.data;

      setVentaSeleccionada(actualizada);

      await fetchVentas();

      setPagos([
        {
          metodo: "EFECTIVO",
          monto: 0,
        },
      ]);
    } catch (exception) {
      console.error("Error al registrar cobro:", exception);

      setError(
        exception.response?.data?.message ||
          exception.response?.data?.error ||
          (typeof exception.response?.data === "string"
            ? exception.response.data
            : null) ||
          "No fue posible registrar el cobro",
      );
    } finally {
      setProcesandoCobro(false);
    }
  };

  const obtenerPrecioItem = (item) =>
    Number(
      item.precioUnitario ??
        item.precio ??
        item.precioVenta ??
        0,
    );

  const obtenerNombreItem = (item) =>
    item.productoNombre ||
    item.servicioNombre ||
    item.nombreProducto ||
    item.nombreServicio ||
    item.nombre ||
    (item.tipo === "SERVICIO"
      ? "Servicio"
      : "Producto");

  /*
   * Adaptador entre VentaResponse y el TicketModal del POS.
   * Así POS y Ventas utilizan exactamente el mismo ticket.
   */
  const construirTicket = (venta) => {
    const items = Array.isArray(venta?.items)
      ? venta.items
      : [];

    const pagosRegistrados = Array.isArray(venta?.pagos)
      ? venta.pagos
      : [];

    const totalPagos = pagosRegistrados.reduce(
      (acc, pago) => acc + Number(pago.monto || 0),
      0,
    );

    return {
      id: venta?.id,
      folio:
        venta?.folio ||
        venta?.numeroVenta ||
        venta?.id,

      fecha:
        venta?.fecha ||
        venta?.fechaVenta ||
        venta?.fechaCreacion,

      cajaNombre:
        venta?.cajaNombre ||
        venta?.nombreCaja ||
        "Caja 1",

      usuario:
        venta?.usuario ||
        venta?.usuarioNombre ||
        venta?.cajero ||
        "Usuario",

      clienteNombre:
        venta?.clienteNombre ||
        "Público general",

      ordenFolio:
        venta?.ordenFolio ||
        venta?.folioOrden ||
        null,

      items: items.map((item) => ({
        id: item.id,
        codigo:
          item.codigo ||
          item.productoCodigo ||
          item.servicioCodigo ||
          "",
        tipo: item.tipo,
        nombre: obtenerNombreItem(item),
        cantidad: Number(item.cantidad || 0),
        precio: obtenerPrecioItem(item),
      })),

      subtotal: Number(venta?.subtotal || 0),
      iva: Number(venta?.iva || 0),
      total: Number(venta?.total || 0),

      pagosRecibidos: pagosRegistrados.map((pago) => ({
        metodo:
          pago.metodo ||
          pago.metodoPago ||
          "Sin método",
        monto: Number(pago.monto || 0),
      })),

      pagosAplicados: pagosRegistrados.map((pago) => ({
        metodo:
          pago.metodo ||
          pago.metodoPago ||
          "Sin método",
        monto: Number(pago.monto || 0),
      })),

      totalRecibido:
        totalPagos > 0
          ? totalPagos
          : Number(venta?.totalPagado || 0),

      totalAplicado: Number(
        venta?.totalPagado || totalPagos || 0,
      ),

      /*
       * Una venta histórica normalmente no almacena el efectivo
       * que físicamente entregó el cliente, únicamente el pago
       * aplicado. Por ello el cambio histórico será 0 salvo que
       * tu backend lo incluya explícitamente.
       */
      cambio: Number(venta?.cambio || 0),

      saldoPendiente: Number(
        venta?.saldoPendiente || 0,
      ),

      estado: venta?.estado,
    };
  };

  const imprimirTicket = () => {
    setMostrarTicket(true);
  };

  return (
    <div className="sales-page">
      <header className="sales-header">
        <div className="sales-title">
          <div className="sales-title-icon">
            <FaReceipt />
          </div>

          <div>
            <h1>Ventas</h1>
            <p>
              Historial, cobros pendientes y reimpresión de
              tickets.
            </p>
          </div>
        </div>
      </header>

      <section className="sales-metrics">
        <article>
          <div className="sales-metric-icon">
            <FaShoppingBag />
          </div>

          <div>
            <span>Ventas registradas</span>
            <strong>{metricas.cantidad}</strong>
          </div>
        </article>

        <article>
          <div className="sales-metric-icon">
            <FaMoneyBillWave />
          </div>

          <div>
            <span>Importe total</span>
            <strong>
              {formatearMoneda(metricas.totalVentas)}
            </strong>
          </div>
        </article>

        <article>
          <div className="sales-metric-icon success">
            <FaCheckCircle />
          </div>

          <div>
            <span>Pagadas</span>
            <strong>{metricas.pagadas}</strong>
          </div>
        </article>

        <article>
          <div className="sales-metric-icon pending">
            <FaClock />
          </div>

          <div>
            <span>Saldo por cobrar</span>
            <strong>
              {formatearMoneda(metricas.saldoPendiente)}
            </strong>
          </div>
        </article>
      </section>

      <section className="sales-card">
        <div className="sales-toolbar">
          <div className="sales-search">
            <FaSearch />

            <input
              type="text"
              value={busqueda}
              onChange={(e) =>
                setBusqueda(e.target.value)
              }
              placeholder="Buscar por folio, cliente o estado..."
            />
          </div>

          <div className="sales-filter-chips">
            {[
              {
                value: "TODAS",
                label: "Todas",
                count: ventas.length,
              },
              {
                value: "PAGADA",
                label: "Pagadas",
                count: metricas.pagadas,
              },
              {
                value: "PENDIENTE",
                label: "Pendientes",
                count: metricas.pendientes,
              },
            ].map((filtro) => (
              <button
                type="button"
                key={filtro.value}
                className={
                  filtroEstado === filtro.value
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setFiltroEstado(filtro.value)
                }
              >
                {filtro.label}
                <span>{filtro.count}</span>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="sales-error">
            {error}
          </div>
        )}

        <div className="sales-table-wrapper">
          <table className="sales-table">
            <thead>
              <tr>
                <th>Venta</th>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Total</th>
                <th>Pagado</th>
                <th>Saldo</th>
                <th>Estado</th>
                <th />
              </tr>
            </thead>

            <tbody>
              {cargando ? (
                <tr>
                  <td
                    colSpan="8"
                    className="sales-table-empty"
                  >
                    Consultando ventas...
                  </td>
                </tr>
              ) : ventasFiltradas.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="sales-table-empty"
                  >
                    No hay ventas que coincidan con los
                    filtros.
                  </td>
                </tr>
              ) : (
                ventasFiltradas.map((venta) => (
                  <tr key={venta.id}>
                    <td>
                      <strong className="sale-folio">
                        #{venta.folio || venta.id}
                      </strong>
                    </td>

                    <td>
                      <span className="sale-date">
                        {formatearFecha(venta.fecha)}
                      </span>
                    </td>

                    <td>
                      {venta.clienteNombre ||
                        "Público general"}
                    </td>

                    <td>
                      <strong>
                        {formatearMoneda(venta.total)}
                      </strong>
                    </td>

                    <td>
                      {formatearMoneda(
                        venta.totalPagado,
                      )}
                    </td>

                    <td>
                      <span
                        className={
                          Number(
                            venta.saldoPendiente || 0,
                          ) > 0
                            ? "sale-balance-pending"
                            : ""
                        }
                      >
                        {formatearMoneda(
                          venta.saldoPendiente,
                        )}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`sale-status ${String(
                          venta.estado || "",
                        ).toLowerCase()}`}
                      >
                        {venta.estado === "PAGADA" && (
                          <FaCheckCircle />
                        )}

                        {venta.estado ===
                          "PENDIENTE" && <FaClock />}

                        {venta.estado || "SIN ESTADO"}
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="sale-view-button"
                        title="Ver venta"
                        onClick={() => verVenta(venta)}
                      >
                        <FaEye />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {mostrarDetalle && ventaSeleccionada && (
        <div
          className="sales-modal-overlay"
          onMouseDown={cerrarDetalle}
        >
          <div
            className="sales-detail-modal"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="sales-detail-header">
              <div>
                <span className="sales-eyebrow">
                  Detalle de venta
                </span>

                <div className="sales-detail-title-row">
                  <h2>
                    Venta #
                    {ventaSeleccionada.folio ||
                      ventaSeleccionada.id}
                  </h2>

                  <span
                    className={`sale-status ${String(
                      ventaSeleccionada.estado || "",
                    ).toLowerCase()}`}
                  >
                    {ventaSeleccionada.estado ===
                      "PAGADA" && <FaCheckCircle />}

                    {ventaSeleccionada.estado ===
                      "PENDIENTE" && <FaClock />}

                    {ventaSeleccionada.estado}
                  </span>
                </div>

                <p>
                  {ventaSeleccionada.clienteNombre ||
                    "Público general"}{" "}
                  ·{" "}
                  {formatearFecha(
                    ventaSeleccionada.fecha,
                  )}
                </p>
              </div>

              <button
                type="button"
                className="sales-modal-close"
                onClick={cerrarDetalle}
              >
                <FaTimes />
              </button>
            </div>

            <div className="sales-detail-body">
              <section className="sales-detail-summary">
                <article>
                  <span>Subtotal</span>
                  <strong>
                    {formatearMoneda(
                      ventaSeleccionada.subtotal,
                    )}
                  </strong>
                </article>

                <article>
                  <span>IVA</span>
                  <strong>
                    {formatearMoneda(
                      ventaSeleccionada.iva,
                    )}
                  </strong>
                </article>

                <article className="total">
                  <span>Total</span>
                  <strong>
                    {formatearMoneda(
                      ventaSeleccionada.total,
                    )}
                  </strong>
                </article>

                <article>
                  <span>Pagado</span>
                  <strong>
                    {formatearMoneda(
                      ventaSeleccionada.totalPagado,
                    )}
                  </strong>
                </article>

                <article
                  className={
                    Number(
                      ventaSeleccionada.saldoPendiente ||
                        0,
                    ) > 0
                      ? "pending"
                      : ""
                  }
                >
                  <span>Saldo pendiente</span>
                  <strong>
                    {formatearMoneda(
                      ventaSeleccionada.saldoPendiente,
                    )}
                  </strong>
                </article>
              </section>

              <section className="sales-detail-section">
                <div className="sales-section-heading">
                  <div>
                    <h3>Conceptos</h3>
                    <p>
                      Productos y servicios incluidos en la
                      venta.
                    </p>
                  </div>
                </div>

                {ventaSeleccionada.items?.length > 0 ? (
                  <div className="sales-items-list">
                    {ventaSeleccionada.items.map(
                      (item, index) => {
                        const precio =
                          obtenerPrecioItem(item);

                        const subtotalItem = Number(
                          item.subtotal ??
                            Number(item.cantidad || 0) *
                              precio,
                        );

                        return (
                          <div
                            className="sales-item"
                            key={item.id || index}
                          >
                            <div className="sales-item-main">
                              <span
                                className={`sales-item-type ${String(
                                  item.tipo || "PRODUCTO",
                                ).toLowerCase()}`}
                              >
                                {item.tipo ||
                                  "PRODUCTO"}
                              </span>

                              <div>
                                <strong>
                                  {obtenerNombreItem(
                                    item,
                                  )}
                                </strong>

                                <small>
                                  {item.codigo ||
                                    item.productoCodigo ||
                                    item.servicioCodigo ||
                                    "Sin código"}
                                </small>
                              </div>
                            </div>

                            <div className="sales-item-price">
                              <span>
                                {Number(
                                  item.cantidad || 0,
                                )}{" "}
                                ×{" "}
                                {formatearMoneda(
                                  precio,
                                )}
                              </span>

                              <strong>
                                {formatearMoneda(
                                  subtotalItem,
                                )}
                              </strong>
                            </div>
                          </div>
                        );
                      },
                    )}
                  </div>
                ) : (
                  <div className="sales-empty-section">
                    Esta respuesta no contiene el detalle de
                    productos o servicios.
                  </div>
                )}
              </section>

              {ventaSeleccionada.estado ===
                "PAGADA" && (
                <section className="sales-detail-section">
                  <div className="sales-section-heading">
                    <div>
                      <h3>Pagos registrados</h3>
                      <p>
                        Formas de pago aplicadas a la venta.
                      </p>
                    </div>
                  </div>

                  {ventaSeleccionada.pagos?.length > 0 ? (
                    <div className="sales-payment-history">
                      {ventaSeleccionada.pagos.map(
                        (pago, index) => (
                          <div
                            key={pago.id || index}
                          >
                            <span>
                              <FaCreditCard />
                              {pago.metodo ||
                                pago.metodoPago ||
                                "Sin método"}
                            </span>

                            <strong>
                              {formatearMoneda(
                                pago.monto,
                              )}
                            </strong>
                          </div>
                        ),
                      )}
                    </div>
                  ) : (
                    <div className="sales-empty-section">
                      No se recibieron pagos en la respuesta
                      de esta venta.
                    </div>
                  )}
                </section>
              )}

              {ventaSeleccionada.estado ===
                "PENDIENTE" && (
                <section className="sales-detail-section payment-box">
                  <div className="sales-section-heading">
                    <div>
                      <h3>Registrar pago</h3>
                      <p>
                        Saldo actual:{" "}
                        <strong>
                          {formatearMoneda(saldoActual)}
                        </strong>
                      </p>
                    </div>

                    <button
                      type="button"
                      className="sales-link-button"
                      onClick={agregarMetodoPago}
                    >
                      <FaPlus />
                      Agregar método
                    </button>
                  </div>

                  <div className="sales-payment-rows">
                    {pagos.map((pago, index) => (
                      <div
                        className="sales-payment-row"
                        key={index}
                      >
                        <select
                          value={pago.metodo}
                          onChange={(e) =>
                            actualizarPago(
                              index,
                              "metodo",
                              e.target.value,
                            )
                          }
                        >
                          <option value="EFECTIVO">
                            Efectivo
                          </option>
                          <option value="TARJETA">
                            Tarjeta
                          </option>
                          <option value="TRANSFERENCIA">
                            Transferencia
                          </option>
                        </select>

                        <div className="sales-money-input">
                          <span>$</span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={pago.monto}
                            onChange={(e) =>
                              actualizarPago(
                                index,
                                "monto",
                                e.target.value,
                              )
                            }
                          />
                        </div>

                        <button
                          type="button"
                          className="sales-payment-delete"
                          disabled={
                            pagos.length === 1
                          }
                          onClick={() =>
                            eliminarMetodoPago(index)
                          }
                        >
                          <FaTrash />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="sales-payment-result">
                    <div>
                      <span>Nuevo pago</span>
                      <strong>
                        {formatearMoneda(nuevoPago)}
                      </strong>
                    </div>

                    {nuevoSaldoPendiente > 0 ? (
                      <div className="pending">
                        <span>
                          Saldo después del pago
                        </span>
                        <strong>
                          {formatearMoneda(
                            nuevoSaldoPendiente,
                          )}
                        </strong>
                      </div>
                    ) : (
                      <div className="change">
                        <span>Cambio</span>
                        <strong>
                          {formatearMoneda(cambio)}
                        </strong>
                      </div>
                    )}
                  </div>
                </section>
              )}
            </div>

            <div className="sales-detail-footer">
              <button
                type="button"
                className="sales-btn light"
                onClick={cerrarDetalle}
              >
                Cerrar
              </button>

              <button
                type="button"
                className="sales-btn light print"
                onClick={imprimirTicket}
              >
                <FaPrint />
                Imprimir ticket
              </button>

              {ventaSeleccionada.estado ===
                "PENDIENTE" && (
                <button
                  type="button"
                  className="sales-btn primary"
                  onClick={cobrarVenta}
                  disabled={
                    procesandoCobro || nuevoPago <= 0
                  }
                >
                  <FaMoneyBillWave />
                  {procesandoCobro
                    ? "Procesando..."
                    : "Registrar cobro"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {mostrarTicket && ventaSeleccionada && (
        <TicketModal
          ticket={construirTicket(
            ventaSeleccionada,
          )}
          onClose={() => setMostrarTicket(false)}
          onNuevaVenta={() =>
            setMostrarTicket(false)
          }
        />
      )}
    </div>
  );
}
