import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

import { reportesApi } from "../../services/reportesApi.js";

const moneda = (valor) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(Number(valor ?? 0));

const fechaLocal = (fecha) => {
  const y = fecha.getFullYear();
  const m = String(fecha.getMonth() + 1).padStart(2, "0");
  const d = String(fecha.getDate()).padStart(2, "0");

  return `${y}-${m}-${d}`;
};

const fechaInicial = () => {
  const hoy = new Date();
  return fechaLocal(
    new Date(hoy.getFullYear(), hoy.getMonth(), 1)
  );
};

const fechaFinal = () => fechaLocal(new Date());

const fechaCorta = (fecha) => {
  if (!fecha) return "-";

  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
  }).format(new Date(`${fecha}T12:00:00`));
};

export default function ReporteVentas() {
  const [filtros, setFiltros] = useState({
    desde: fechaInicial(),
    hasta: fechaFinal(),
    estado: "",
    ventaId: "",
  });

  const [aplicados, setAplicados] = useState(filtros);

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  const [resumen, setResumen] = useState(null);
  const [diarias, setDiarias] = useState([]);
  const [detalle, setDetalle] = useState(null);

  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const cambiarFiltro = (campo, valor) => {
    setFiltros((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  const aplicarFiltros = (e) => {
    e.preventDefault();

    if (filtros.desde > filtros.hasta) {
      setError("La fecha inicial no puede superar la final");
      return;
    }

    if (
      filtros.ventaId &&
      (!/^[1-9]\d*$/.test(filtros.ventaId) ||
        !Number.isSafeInteger(Number(filtros.ventaId)))
    ) {
      setError("Ingresa un ID de venta válido");
      return;
    }

    setError("");
    setPage(0);
    setAplicados({ ...filtros });
  };

  const limpiarFiltros = () => {
    const iniciales = {
      desde: fechaInicial(),
      hasta: fechaFinal(),
      estado: "",
      ventaId: "",
    };

    setFiltros(iniciales);
    setAplicados(iniciales);
    setPage(0);
  };

  useEffect(() => {
    const controller = new AbortController();

    const cargarReportes = async () => {
      setCargando(true);
      setError("");

      const rango = {
        desde: aplicados.desde,
        hasta: aplicados.hasta,
      };

      const filtrosDetalle = {
        ...rango,
        page,
        size,
      };

      if (aplicados.estado) {
        filtrosDetalle.estado = aplicados.estado;
      }

      if (aplicados.ventaId) {
        filtrosDetalle.ventaId = Number(aplicados.ventaId);
      }

      try {
        const [resumenData, diariasData, detalleData] =
          await Promise.all([
            reportesApi.resumenVentas(
              rango,
              controller.signal
            ),
            reportesApi.ventasDiarias(
              rango,
              controller.signal
            ),
            reportesApi.detalleVentas(
              filtrosDetalle,
              controller.signal
            ),
          ]);

        if (controller.signal.aborted) return;

        setResumen(resumenData);
        setDiarias(diariasData);
        setDetalle(detalleData);
      } catch (err) {
        if (controller.signal.aborted) return;

        setResumen(null);
        setDiarias([]);
        setDetalle(null);

        setError(
          err.response?.status === 403
            ? "No tienes permiso para consultar estos reportes."
            : "No fue posible cargar los reportes."
        );
      } finally {
        if (!controller.signal.aborted) {
          setCargando(false);
        }
      }
    };

    cargarReportes();

    return () => controller.abort();
  }, [aplicados, page, size]);

  const indicadores = [
    {
      titulo: "Total vendido",
      valor: moneda(resumen?.totalVentas),
    },
    {
      titulo: "Pagos POS",
      valor: moneda(resumen?.pagosPos),
    },
    {
      titulo: "Anticipos aplicados",
      valor: moneda(resumen?.anticiposAplicados),
    },
    {
      titulo: "Saldo pendiente",
      valor: moneda(resumen?.saldoPendiente),
    },
    {
      titulo: "Total cubierto",
      valor: moneda(resumen?.totalCubierto),
    },
    {
      titulo: "Ticket promedio",
      valor: moneda(resumen?.ticketPromedio),
    },
    {
      titulo: "Ventas realizadas",
      valor: resumen?.cantidadVentas ?? 0,
    },
    {
      titulo: "Ventas pendientes",
      valor: resumen?.ventasPendientes ?? 0,
    },
  ];

  return (
    <div className="reports-content">
      <div className="reports-section-heading">
        <h2>Reporte de ventas</h2>
        <p>
          Consulta ventas, anticipos, cobros y saldos.
        </p>
      </div>

      <form
        className="reports-filters"
        onSubmit={aplicarFiltros}
      >
        <label>
          Desde
          <input
            type="date"
            value={filtros.desde}
            onChange={(e) =>
              cambiarFiltro("desde", e.target.value)
            }
            required
          />
        </label>

        <label>
          Hasta
          <input
            type="date"
            value={filtros.hasta}
            onChange={(e) =>
              cambiarFiltro("hasta", e.target.value)
            }
            required
          />
        </label>

        <label>
          Estado
          <select
            value={filtros.estado}
            onChange={(e) =>
              cambiarFiltro("estado", e.target.value)
            }
          >
            <option value="">Todos</option>
            <option value="PAGADA">Pagada</option>
            <option value="PENDIENTE">Pendiente</option>
          </select>
        </label>

        <label>
          Número de venta
          <input
            type="number"
            min="1"
            placeholder="Ej. 301"
            value={filtros.ventaId}
            onChange={(e) =>
              cambiarFiltro("ventaId", e.target.value)
            }
          />
        </label>

        <div className="reports-filter-actions">
          <button
            type="submit"
            className="reports-btn primary"
          >
            Consultar
          </button>

          <button
            type="button"
            className="reports-btn"
            onClick={limpiarFiltros}
          >
            Limpiar
          </button>
        </div>
      </form>

      {error && (
        <div className="reports-alert" role="alert">
          {error}
        </div>
      )}

      {cargando && (
        <p className="reports-loading">
          Cargando información...
        </p>
      )}

      {!cargando && !error && resumen && detalle && (
        <>
          <section className="reports-kpis">
            {indicadores.map((indicador) => (
              <article
                className="reports-kpi"
                key={indicador.titulo}
              >
                <p>{indicador.titulo}</p>
                <strong>{indicador.valor}</strong>
              </article>
            ))}
          </section>

          <section className="reports-panel">
            <div className="reports-panel-header">
              <div>
                <h3>Ventas diarias</h3>
                <p>Importe vendido por fecha</p>
              </div>
            </div>

            <div className="reports-chart">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={diarias}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="fecha"
                    tickFormatter={fechaCorta}
                    minTickGap={20}
                  />

                  <YAxis
                    width={70}
                    tickFormatter={(v) =>
                      `$${Number(v).toLocaleString("es-MX")}`
                    }
                  />

                  <Tooltip
                    labelFormatter={fechaCorta}
                    formatter={(valor) => [
                      moneda(valor),
                      "Total vendido",
                    ]}
                  />

                  <Area
                    type="monotone"
                    dataKey="totalVentas"
                    stroke="#2563eb"
                    fill="#2563eb"
                    fillOpacity={0.12}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="reports-panel">
            <div className="reports-panel-header">
              <div>
                <h3>Detalle de ventas</h3>
                <p>
                  {detalle.totalElements ?? 0} registros
                  encontrados
                </p>
              </div>

              <label className="reports-page-size">
                Mostrar
                <select
                  value={size}
                  onChange={(e) => {
                    setSize(Number(e.target.value));
                    setPage(0);
                  }}
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </label>
            </div>

            <div className="reports-table-scroll">
              <table className="reports-table">
                <thead>
                  <tr>
                    <th>Venta</th>
                    <th>Fecha</th>
                    <th>Cliente</th>
                    <th>Tipo</th>
                    <th>Total</th>
                    <th>Anticipo</th>
                    <th>Pagos POS</th>
                    <th>Saldo</th>
                    <th>Estado</th>
                  </tr>
                </thead>

                <tbody>
                  {detalle.content?.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="reports-empty">
                        No se encontraron ventas.
                      </td>
                    </tr>
                  ) : (
                    detalle.content?.map((venta) => (
                      <tr key={venta.id}>
                        <td>#{venta.id}</td>

                        <td>
                          {new Date(
                            venta.fecha
                          ).toLocaleString("es-MX")}
                        </td>

                        <td>{venta.cliente || "-"}</td>

                        <td>{venta.tipoVenta}</td>

                        <td>{moneda(venta.total)}</td>

                        <td>
                          {moneda(venta.anticipoAplicado)}
                        </td>

                        <td>{moneda(venta.pagosPos)}</td>

                        <td>
                          {moneda(venta.saldoPendiente)}
                        </td>

                        <td>
                          <span
                            className={`reports-status ${
                              venta.estado === "PAGADA"
                                ? "paid"
                                : "pending"
                            }`}
                          >
                            {venta.estado}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="reports-pagination">
              <span>
                Página {detalle.number + 1} de{" "}
                {Math.max(detalle.totalPages, 1)}
              </span>

              <div>
                <button
                  type="button"
                  className="reports-btn"
                  disabled={page === 0}
                  onClick={() =>
                    setPage((prev) => Math.max(0, prev - 1))
                  }
                >
                  Anterior
                </button>

                <button
                  type="button"
                  className="reports-btn"
                  disabled={
                    page + 1 >= detalle.totalPages
                  }
                  onClick={() =>
                    setPage((prev) => prev + 1)
                  }
                >
                  Siguiente
                </button>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}