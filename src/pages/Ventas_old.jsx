import { useEffect, useState } from "react";
import DataTable from "../components/DataTable";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
import api from "../services/api";

export function Ventas() {
  const [ventas, setVentas] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("TODAS");

  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
  const [mostrarDetalle, setMostrarDetalle] = useState(false);

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
    try {
      const ventasResponse = await api.get("/ventas");
      
      const ventasData = ventasResponse.data ?? [];
      
      setVentas(ventasData);
    } catch (error) {
      console.error("Error al consultar ventas:", error);
      console.error("Código HTTP:", error.response?.status);

      console.error("Respuesta backend:", error.response?.data);
    }
  };

  

  const verVenta = (venta) => {
    setVentaSeleccionada(venta);

    setPagos([
      {
        metodo: "EFECTIVO",
        monto: 0,
      },
    ]);

    setMostrarDetalle(true);
  };

  const cerrarModal = () => {
    setMostrarDetalle(false);
    setVentaSeleccionada(null);

    setPagos([
      {
        metodo: "EFECTIVO",
        monto: 0,
      },
    ]);
  };

  const ventasFiltradas = ventas.filter((venta) => {
    const nombreCliente = venta.clienteNombre || "";

    const coincideBusqueda = nombreCliente
      .toLowerCase()
      .includes(busqueda.toLowerCase());

    const coincideEstado =
      filtroEstado === "TODAS" || venta.estado === filtroEstado;

    return coincideBusqueda && coincideEstado;
  });

  const agregarMetodoPago = () => {
    setPagos((pagosActuales) => [
      ...pagosActuales,
      {
        metodo: "EFECTIVO",
        monto: 0,
      },
    ]);
  };

  const eliminarMetodoPago = (index) => {
    if (pagos.length === 1) {
      alert("Debe existir al menos un método de pago");
      return;
    }

    setPagos((pagosActuales) => pagosActuales.filter((_, i) => i !== index));
  };

  const actualizarMetodoPago = (index, metodo) => {
    setPagos((pagosActuales) =>
      pagosActuales.map((pago, i) =>
        i === index
          ? {
              ...pago,
              metodo,
            }
          : pago,
      ),
    );
  };

  const actualizarMontoPago = (index, monto) => {
    setPagos((pagosActuales) =>
      pagosActuales.map((pago, i) =>
        i === index
          ? {
              ...pago,
              monto: Number(monto),
            }
          : pago,
      ),
    );
  };

  const nuevoPago = pagos.reduce(
    (total, pago) => total + Number(pago.monto || 0),
    0,
  );

  const saldoActual = Number(ventaSeleccionada?.saldoPendiente || 0);

  const nuevoSaldoPendiente = Math.max(saldoActual - nuevoPago, 0);

  const cambio = Math.max(nuevoPago - saldoActual, 0);

  const cobrarVenta = async () => {
    if (nuevoPago <= 0) {
      alert("Ingresa un monto válido");
      return;
    }

    if (!ventaSeleccionada) {
      alert("No hay una venta seleccionada");
      return;
    }

    if (ventaSeleccionada.estado !== "PENDIENTE") {
      alert("Esta venta ya se encuentra pagada");
      return;
    }

    /*const datosCobro = {
      ventaId: ventaSeleccionada.id,
      pagos,
      nuevoPago,
      saldoPendiente: nuevoSaldoPendiente,
      estado: nuevoSaldoPendiente <= 0 ? "PAGADA" : "PENDIENTE",
    };*/
    const datosCobro = {
      pagos: pagos.map((pago) => ({
        metodo: pago.metodo,
        monto: Number(pago.monto),
      })),
    };

    console.log("Cobro:", JSON.stringify(datosCobro, null, 2));
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:8080/api/ventas/${ventaSeleccionada.id}/cobrar`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(datosCobro),
        },
      );

      if (!response.ok) {
        const mensaje = await response.text();
        throw new Error(mensaje || "Error al registrar el cobro");
      }

      const ventaActualizada = await response.json();

      console.log("Venta actualizada:", ventaActualizada);

      alert("Cobro registrado correctamente");

      cerrarModal();
      await fetchVentas();
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  const formatearMoneda = (valor) => {
    return Number(valor || 0).toLocaleString("es-MX", {
      style: "currency",
      currency: "MXN",
    });
  };

  const formatearFecha = (fecha) => {
    if (!fecha) {
      return "Sin fecha";
    }

    return new Date(fecha).toLocaleString("es-MX");
  };

  const columns = [
    {
      key: "id",
      label: "Folio",
    },
    {
      key: "fecha",
      label: "Fecha",
      render: (venta) => formatearFecha(venta.fecha),
    },
    {
      key: "clienteNombre",
      label: "Cliente",
    },
    {
      key: "total",
      label: "Total",
      render: (venta) => formatearMoneda(venta.total),
    },
    {
      key: "totalPagado",
      label: "Pagado",
      render: (venta) => formatearMoneda(venta.totalPagado),
    },
    {
      key: "saldoPendiente",
      label: "Saldo",
      render: (venta) => formatearMoneda(venta.saldoPendiente),
    },
    {
      key: "estado",
      label: "Estado",
    },
  ];

  const actions = [
    {
      icon: <FaEye />,
      title: "Ver venta",
      className: "btn-action btn-edit",
      onClick: verVenta,
    },
  ];

  return (
    <>
      <header className="header">
        <div>
          <h1>Ventas</h1>
          <p>Consulta y administra las ventas</p>
        </div>

        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
        >
          <option value="TODAS">Todas</option>
          <option value="PENDIENTE">Pendientes</option>
          <option value="PAGADA">Pagadas</option>
        </select>
      </header>

      <section>
        <DataTable
          title="Listado de ventas"
          searchPlaceholder="Buscar venta..."
          searchValue={busqueda}
          onSearchChange={setBusqueda}
          columns={columns}
          data={ventasFiltradas}
          actions={actions}
        />

        {mostrarDetalle && ventaSeleccionada && (
          <div className="modal-overlay" onClick={cerrarModal}>
            <div className="modal-cobro" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <h2>Detalle Venta #{ventaSeleccionada.id}</h2>

                  <h3>
                    Cliente:{" "}
                    {ventaSeleccionada.clienteNombre || "Público general"}
                  </h3>
                </div>

                <button
                  type="button"
                  className="close-btn"
                  onClick={cerrarModal}
                >
                  ✕
                </button>
              </div>

              <div className="modal-body">
                <div className="summary">
                  <div>
                    <span>Fecha</span>
                    <strong>{formatearFecha(ventaSeleccionada.fecha)}</strong>
                  </div>

                  <div>
                    <span>Subtotal</span>
                    <strong>
                      {formatearMoneda(ventaSeleccionada.subtotal)}
                    </strong>
                  </div>

                  <div>
                    <span>IVA</span>
                    <strong>{formatearMoneda(ventaSeleccionada.iva)}</strong>
                  </div>

                  <div className="grand-total">
                    <span>Total</span>
                    <strong>{formatearMoneda(ventaSeleccionada.total)}</strong>
                  </div>

                  <div>
                    <span>Total pagado</span>
                    <strong>
                      {formatearMoneda(ventaSeleccionada.totalPagado)}
                    </strong>
                  </div>

                  <div className="grand-total">
                    <span>Pendiente</span>
                    <strong>
                      {formatearMoneda(ventaSeleccionada.saldoPendiente)}
                    </strong>
                  </div>

                  <div>
                    <span>Estado</span>

                    <strong
                      className={
                        ventaSeleccionada.estado === "PAGADA"
                          ? "estado-pagada"
                          : "estado-pendiente"
                      }
                    >
                      {ventaSeleccionada.estado || "SIN ESTADO"}
                    </strong>
                  </div>
                </div>

                {ventaSeleccionada.items?.length > 0 && (
                  <>
                    <h3>Productos</h3>

                    <div className="sale-items">
                      {ventaSeleccionada.items.map((item, index) => (
                        <div key={item.id || index} className="sale-item-row">
                          <div>
                            <strong>
                              {item.productoNombre ||
                                item.nombreProducto ||
                                "Producto"}
                            </strong>

                            <span>
                              {item.cantidad} ×{" "}
                              {formatearMoneda(item.precioUnitario)}
                            </span>
                          </div>

                          <strong>
                            {formatearMoneda(
                              item.subtotal ||
                                Number(item.cantidad || 0) *
                                  Number(item.precioUnitario || 0),
                            )}
                          </strong>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {ventaSeleccionada.estado === "PENDIENTE" && (
                  <>
                    <h3>Métodos de pago</h3>

                    {pagos.map((pago, index) => (
                      <div key={index} className="payment-row">
                        <select
                          value={pago.metodo}
                          onChange={(e) =>
                            actualizarMetodoPago(index, e.target.value)
                          }
                        >
                          <option value="EFECTIVO">Efectivo</option>
                          <option value="TARJETA">Tarjeta</option>
                          <option value="TRANSFERENCIA">Transferencia</option>
                        </select>

                        <input
                          type="number"
                          placeholder="Monto"
                          onChange={(e) =>
                            actualizarMontoPago(index, e.target.value)
                          }
                        />

                        <button
                          type="button"
                          className="remove-payment-btn"
                          onClick={() => eliminarMetodoPago(index)}
                          disabled={pagos.length === 1}
                        >
                          <FaTrash />
                        </button>
                        <button
                          type="button"
                          title="Agregar metodo de pago"
                          className="add-payment-btn"
                          onClick={agregarMetodoPago}
                        >
                          +
                        </button>
                      </div>
                    ))}

                    <div className="payment-summary">
                      <div>
                        <span>Nuevo pago</span>
                        <strong>{formatearMoneda(nuevoPago)}</strong>
                      </div>

                      {nuevoSaldoPendiente > 0 ? (
                        <div className="pending">
                          <span>Saldo restante</span>

                          <strong>
                            {formatearMoneda(nuevoSaldoPendiente)}
                          </strong>
                        </div>
                      ) : (
                        <div className="change">
                          <span>Cambio</span>

                          <strong>{formatearMoneda(cambio)}</strong>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {ventaSeleccionada.estado === "PAGADA" &&
                  ventaSeleccionada.pagos?.length > 0 && (
                    <>
                      <h3>Pagos registrados</h3>

                      <div className="registered-payments">
                        {ventaSeleccionada.pagos.map((pago, index) => (
                          <div
                            key={pago.id || index}
                            className="payment-history-row"
                          >
                            <span>
                              {pago.metodo || pago.metodoPago || "Sin método"}
                            </span>

                            <strong>{formatearMoneda(pago.monto)}</strong>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={cerrarModal}
                >
                  {ventaSeleccionada.estado === "PENDIENTE"
                    ? "Cancelar"
                    : "Cerrar"}
                </button>

                {ventaSeleccionada.estado === "PENDIENTE" && (
                  <button
                    type="button"
                    className="confirm-btn"
                    onClick={cobrarVenta}
                    disabled={nuevoPago <= 0}
                  >
                    Confirmar cobro
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
