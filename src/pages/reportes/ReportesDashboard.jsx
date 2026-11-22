import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

import {
  FaChartLine,
  FaCashRegister,
  FaFileInvoiceDollar,
  FaClock,
} from "react-icons/fa";

import { reportesApi } from "../../services/reportesApi";

const moneda = (valor) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(Number(valor ?? 0));

const numero = (valor) => Number(valor ?? 0).toLocaleString("es-MX");

const fechaLocal = (fecha) => {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");

  return `${anio}-${mes}-${dia}`;
};

const rangoInicial = () => {
  const hoy = new Date();

  return {
    desde: fechaLocal(new Date(hoy.getFullYear(), hoy.getMonth(), 1)),
    hasta: fechaLocal(hoy),
  };
};

const fechaCorta = (fecha) => {
  if (!fecha) return "-";

  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
  }).format(new Date(`${fecha}T12:00:00`));
};

export default function ReportesDashboard() {
  const [filtros, setFiltros] = useState(rangoInicial);
  const [aplicados, setAplicados] = useState(rangoInicial);

  const [resumen, setResumen] = useState(null);
  const [ventasDiarias, setVentasDiarias] = useState([]);
  const [ingresosCaja, setIngresosCaja] = useState([]);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [errorCaja, setErrorCaja] = useState("");

  const [operacion, setOperacion] = useState(null);
  const [errorOperacion, setErrorOperacion] = useState("");

  const consultar = (e) => {
    e.preventDefault();

    if (!filtros.desde || !filtros.hasta) {
      setError("Selecciona ambas fechas.");
      return;
    }

    if (filtros.desde > filtros.hasta) {
      setError("La fecha inicial no puede superar la final.");
      return;
    }

    const dias =
      (new Date(`${filtros.hasta}T12:00:00`) -
        new Date(`${filtros.desde}T12:00:00`)) /
      86400000;

    if (dias > 366) {
      setError("Selecciona un periodo máximo de 367 días.");
      return;
    }

    setError("");
    setAplicados({ ...filtros });
  };

  useEffect(() => {
    const controller = new AbortController();

    const cargar = async () => {
      setCargando(true);
      setError("");
      setErrorCaja("");

      try {
        const [resumenData, diariasData, cajaResult, operacionResult] =
          await Promise.all([
            reportesApi.resumenVentas(aplicados, controller.signal),

            reportesApi.ventasDiarias(aplicados, controller.signal),

            reportesApi.ingresosCaja(aplicados, controller.signal).then(
              (data) => ({ ok: true, data }),
              (error) => ({ ok: false, error }),
            ),

            reportesApi.operacion(controller.signal).then(
              (data) => ({ ok: true, data }),
              (error) => ({ ok: false, error }),
            ),
          ]);

        if (controller.signal.aborted) return;

        setResumen(resumenData);
        setVentasDiarias(diariasData ?? []);

        if (cajaResult.ok) {
          setIngresosCaja(cajaResult.data ?? []);
        } else {
          setIngresosCaja([]);
          setErrorCaja(
            cajaResult.error?.response?.status === 403
              ? "No tienes permiso para consultar ingresos de caja."
              : "No fue posible consultar los ingresos de caja.",
          );
        }

        if (operacionResult.ok) {
          setOperacion(operacionResult.data);
          setErrorOperacion("");
        } else {
          setOperacion(null);
          setErrorOperacion(
            operacionResult.error?.response?.status === 403
              ? "No tienes permiso para consultar los indicadores operativos."
              : "No fue posible cargar los indicadores de Inventario y Taller.",
          );
        }
      } catch (err) {
        if (controller.signal.aborted) return;

        setResumen(null);
        setVentasDiarias([]);
        setIngresosCaja([]);

        setError(
          err.response?.status === 403
            ? "No tienes permiso para consultar los reportes de ventas."
            : "No fue posible cargar el resumen general.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setCargando(false);
        }
      }
    };

    cargar();

    return () => controller.abort();
  }, [aplicados]);

  const ingresosPorMetodo = useMemo(
    () =>
      ingresosCaja.map((item) => ({
        metodo: item.metodo,
        cobrosPos: Number(item.cobrosPos ?? 0),
        anticiposTaller: Number(item.anticiposTaller ?? 0),
        totalIngresos: Number(item.totalIngresos ?? 0),
      })),
    [ingresosCaja],
  );

  const totalCaja = useMemo(
    () =>
      ingresosPorMetodo.reduce((total, item) => total + item.totalIngresos, 0),
    [ingresosPorMetodo],
  );

  const kpis = [
    {
      titulo: "Total vendido",
      valor: moneda(resumen?.totalVentas),
      descripcion: "Ventas generadas en el periodo",
      icono: <FaChartLine />,
    },
    {
      titulo: "Pagos POS acumulados",
      valor: moneda(resumen?.pagosPos),
      descripcion: "Aplicados a ventas del periodo",
      icono: <FaCashRegister />,
    },
    {
      titulo: "Anticipos aplicados",
      valor: moneda(resumen?.anticiposAplicados),
      descripcion: "Descontados de ventas del taller",
      icono: <FaFileInvoiceDollar />,
    },
    {
      titulo: "Saldo pendiente",
      valor: moneda(resumen?.saldoPendiente),
      descripcion: "Pendiente en ventas del periodo",
      icono: <FaClock />,
    },
    {
      titulo: "Total cubierto",
      valor: moneda(resumen?.totalCubierto),
      descripcion: "Pagos POS + anticipos aplicados",
    },
    {
      titulo: "Ticket promedio",
      valor: moneda(resumen?.ticketPromedio),
      descripcion: "Importe promedio por venta",
    },
    {
      titulo: "Ventas realizadas",
      valor: numero(resumen?.cantidadVentas),
      descripcion: "Operaciones registradas",
    },
    {
      titulo: "Ventas pendientes",
      valor: numero(resumen?.ventasPendientes),
      descripcion: "Operaciones sin liquidar",
    },
  ];

  // Colores para la gráfica
  const COLORES_ESTADO = [
    "#2563eb",
    "#f59e0b",
    "#10b981",
    "#8b5cf6",
    "#ef4444",
    "#64748b",
  ];

  // Transformar los datos del backend para Recharts
  const ordenesPorEstado = (operacion?.ordenesPorEstado ?? []).map((item) => ({
    name: item.estado,
    value: Number(item.cantidad ?? 0),
  }));

  return (
    <div className="reports-content reports-dashboard">
      <div className="reports-section-heading">
        <h2>Resumen general</h2>
        <p>Indicadores de ventas y cobros de POSREF.</p>
      </div>

      <form
        className="reports-filters reports-dashboard-filters"
        onSubmit={consultar}
      >
        <label>
          Desde
          <input
            type="date"
            value={filtros.desde}
            onChange={(e) =>
              setFiltros((prev) => ({
                ...prev,
                desde: e.target.value,
              }))
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
              setFiltros((prev) => ({
                ...prev,
                hasta: e.target.value,
              }))
            }
            required
          />
        </label>

        <div className="reports-filter-actions">
          <button type="submit" className="reports-btn primary">
            Consultar
          </button>

          <button
            type="button"
            className="reports-btn"
            onClick={() => {
              const inicial = rangoInicial();
              setFiltros(inicial);
              setAplicados(inicial);
            }}
          >
            Mes actual
          </button>
        </div>
      </form>

      {error && (
        <div className="reports-alert" role="alert">
          {error}
        </div>
      )}

      {cargando && <p className="reports-loading">Cargando indicadores...</p>}

      {!cargando && resumen && !error && (
        <>
          <section className="reports-kpis">
            {kpis.map((kpi) => (
              <article className="reports-kpi" key={kpi.titulo}>
                <div className="reports-kpi-top">
                  <span>{kpi.titulo}</span>
                  {kpi.icono && (
                    <span className="reports-kpi-icon">{kpi.icono}</span>
                  )}
                </div>

                <strong>{kpi.valor}</strong>
                <small>{kpi.descripcion}</small>
              </article>
            ))}
          </section>

          {/* INDICADORES OPERATIVOS */}

          <section className="reports-operational">
            <div className="reports-section-heading">
              <h2>Indicadores operativos</h2>
              <p>
                Estado actual del inventario y del taller. Estos datos no
                dependen del filtro de fechas.
              </p>
            </div>

            {errorOperacion && (
              <div className="reports-alert">{errorOperacion}</div>
            )}

            {operacion && (
              <>
                <h3 className="reports-group-title">Inventario</h3>

                <div className="reports-kpis reports-inventory-kpis">
                  <article className="reports-kpi">
                    <p>Productos con existencia baja</p>
                    <strong>{numero(operacion.productosBajos)}</strong>
                    <small>Productos que requieren revisión de stock</small>
                  </article>

                  <article className="reports-kpi">
                    <p>Productos agotados</p>
                    <strong>{numero(operacion.productosAgotados)}</strong>
                    <small>Productos sin existencia disponible</small>
                  </article>
                </div>

                <h3 className="reports-group-title">Taller</h3>

                <div className="reports-kpis">
                  <article className="reports-kpi">
                    <p>Órdenes activas</p>
                    <strong>{numero(operacion.ordenesActivas)}</strong>
                  </article>

                  <article className="reports-kpi">
                    <p>Órdenes pendientes</p>
                    <strong>{numero(operacion.ordenesPendientes)}</strong>
                  </article>

                  <article className="reports-kpi">
                    <p>En reparación</p>
                    <strong>{numero(operacion.ordenesReparacion)}</strong>
                  </article>

                  <article className="reports-kpi">
                    <p>Órdenes terminadas</p>
                    <strong>{numero(operacion.ordenesTerminadas)}</strong>
                  </article>
                </div>
              </>
            )}
          </section>

          {/* GRÁFICA DE ÓRDENES POR ESTADO */}

          {operacion && (
            <section className="reports-panel">
              <div className="reports-panel-header">
                <div>
                  <h3>Órdenes de taller por estado</h3>
                  <p>Distribución actual de las órdenes del taller</p>
                </div>
              </div>

              {ordenesPorEstado.length === 0 ? (
                <p className="reports-empty">No existen órdenes registradas.</p>
              ) : (
                <div className="reports-chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={ordenesPorEstado}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={105}
                        label
                      >
                        {ordenesPorEstado.map((item, index) => (
                          <Cell
                            key={item.name}
                            fill={COLORES_ESTADO[index % COLORES_ESTADO.length]}
                          />
                        ))}
                      </Pie>

                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </section>
          )}

          <section className="reports-panel">
            <div className="reports-panel-header">
              <div>
                <h3>Evolución de ventas</h3>
                <p>Importe vendido por día</p>
              </div>

              <Link to="/reportes/ventas" className="reports-detail-link">
                Ver reporte de ventas
              </Link>
            </div>

            <div className="reports-chart">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={ventasDiarias}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />

                  <XAxis
                    dataKey="fecha"
                    tickFormatter={fechaCorta}
                    minTickGap={20}
                  />

                  <YAxis
                    width={75}
                    tickFormatter={(valor) =>
                      `$${Number(valor).toLocaleString("es-MX")}`
                    }
                  />

                  <Tooltip
                    labelFormatter={fechaCorta}
                    formatter={(valor) => [moneda(valor), "Total vendido"]}
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
                <h3>Ingresos de caja por método</h3>
                <p>Cobros POS y anticipos recibidos durante el periodo.</p>
              </div>

              {!errorCaja && (
                <div className="reports-caja-total">
                  <span>Total recibido</span>
                  <strong>{moneda(totalCaja)}</strong>
                </div>
              )}
            </div>

            {errorCaja ? (
              <div className="reports-alert">{errorCaja}</div>
            ) : ingresosPorMetodo.length === 0 ? (
              <p className="reports-empty">
                No se encontraron cobros en el periodo.
              </p>
            ) : (
              <div className="reports-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ingresosPorMetodo}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />

                    <XAxis dataKey="metodo" />

                    <YAxis
                      width={75}
                      tickFormatter={(valor) =>
                        `$${Number(valor).toLocaleString("es-MX")}`
                      }
                    />

                    <Tooltip
                      formatter={(valor, nombre) => [moneda(valor), nombre]}
                    />

                    <Legend />

                    <Bar
                      dataKey="cobrosPos"
                      name="Cobros POS"
                      stackId="ingresos"
                      fill="#2563eb"
                    />

                    <Bar
                      dataKey="anticiposTaller"
                      name="Anticipos taller"
                      stackId="ingresos"
                      fill="#10b981"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </section>

          <section className="reports-panel">
            <div className="reports-panel-header">
              <div>
                <h3>Explorar reportes</h3>
                <p>Consulta información detallada por módulo.</p>
              </div>
            </div>

            <div className="reports-shortcuts">
              <Link to="/reportes/ventas" className="reports-shortcut">
                <FaFileInvoiceDollar />
                <div>
                  <strong>Reporte de ventas</strong>
                  <span>Detalle, pagos, anticipos y saldos</span>
                </div>
              </Link>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
