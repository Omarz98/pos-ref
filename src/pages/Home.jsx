import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import api from "../../services/api.js";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import {
  BsCashStack,
  BsCartCheck,
  BsReceipt,
  BsClockHistory,
  BsTools,
  BsCheckCircle,
  BsExclamationTriangle,
  BsBoxSeam,
  BsPeople,
  BsGraphUpArrow,
} from "react-icons/bs";

import "../styles/Home/Home.css";

export function Home() {

  const { usuario } = useAuth();

  const [cargando, setCargando] = useState(true);

  const [dashboard, setDashboard] = useState({
    ventasHoy: 0,
    ventasMes: 0,
    ticketPromedio: 0,
    saldoPendiente: 0,

    ordenesActivas: 0,
    ordenesPendientes: 0,
    ordenesReparacion: 0,
    ordenesTerminadas: 0,

    ingresosTaller: 0,

    productosBajos: 0,
    productosAgotados: 0,

    clientesHoy: 1,

    ventasUltimos7Dias: [],
    ordenesPorEstado: [],
    productosMasVendidos: [],
    serviciosMasSolicitados: [],
    ordenesRecientes: [],
  });


  // ============================================================
  // CARGAR DASHBOARD
  // ============================================================

  useEffect(() => {

    cargarDashboard();

  }, []);


  async function cargarDashboard() {

    try {
      setCargando(true);
      const response = await api.get("/dashboard");

      setDashboard(response.data ?? []);

    } catch (error) {

      console.error(
        "Error dashboard:",
        error
      );

    } finally {

      setCargando(false);

    }

  }


  // ============================================================
  // FORMATO MONEDA
  // ============================================================

  const moneda = (valor) => {

    return Number(valor || 0)
      .toLocaleString(
        "es-MX",
        {
          style: "currency",
          currency: "MXN",
        }
      );

  };


  // ============================================================
  // FORMATO FECHA
  // ============================================================

  const fechaCorta = (fecha) => {

    if (!fecha) {
      return "";
    }

    return new Date(
      `${fecha}T12:00:00`
    ).toLocaleDateString(
      "es-MX",
      {
        weekday: "short",
      }
    );

  };


  // ============================================================
  // DATOS GRÁFICA VENTAS
  // ============================================================

  const ventasGrafica =
    dashboard.ventasUltimos7Dias.map(
      (venta) => ({
        ...venta,
        dia: fechaCorta(venta.fecha),
        total: Number(venta.total),
      })
    );


  // ============================================================
  // DATOS TALLER
  // ============================================================

  const tallerGrafica =
    dashboard.ordenesPorEstado.map(
      (estado) => ({
        name: estado.estado,
        value: Number(estado.cantidad),
      })
    );


  // ============================================================
  // COLORES PIE
  // ============================================================

  const PIE_COLORS = [
    "#3b82f6",
    "#f59e0b",
    "#10b981",
    "#ef4444",
    "#8b5cf6",
    "#06b6d4",
  ];


  if (cargando) {

    return (

      <div className="dashboard-loading">

        <div className="loader" />

        <span>
          Cargando dashboard...
        </span>

      </div>

    );

  }


  return (

    <div className="dashboard">

      {/* ============================================= */}
      {/* HEADER */}
      {/* ============================================= */}

      <header className="dashboard-header">

        <div>

          <h1>
            Dashboard
          </h1>

          <p>
            Bienvenido,{" "}
            <strong>
              {usuario?.nombre ||
                usuario?.username ||
                "Usuario"}
            </strong>
          </p>

        </div>

        <button
          className="btn-refresh"
          onClick={cargarDashboard}
        >
          Actualizar
        </button>

      </header>


      {/* ============================================= */}
      {/* KPIS PRINCIPALES */}
      {/* ============================================= */}

      <section className="dashboard-kpis">

        <KpiCard
          titulo="Ventas hoy"
          valor={moneda(
            dashboard.ventasHoy
          )}
          icono={<BsCashStack />}
          clase="success"
        />

        <KpiCard
          titulo="Ventas del mes"
          valor={moneda(
            dashboard.ventasMes
          )}
          icono={<BsGraphUpArrow />}
          clase="primary"
        />

        <KpiCard
          titulo="Ticket promedio"
          valor={moneda(
            dashboard.ticketPromedio
          )}
          icono={<BsReceipt />}
          clase="info"
        />

        <KpiCard
          titulo="Saldo pendiente"
          valor={moneda(
            dashboard.saldoPendiente
          )}
          icono={<BsClockHistory />}
          clase="warning"
        />

      </section>


      {/* ============================================= */}
      {/* TALLER */}
      {/* ============================================= */}

      <div className="dashboard-section-title">

        <div>

          <h2>
            Taller
          </h2>

          <p>
            Estado actual de las órdenes de servicio
          </p>

        </div>

      </div>


      <section className="dashboard-kpis">

        <KpiCard
          titulo="Órdenes activas"
          valor={
            dashboard.ordenesActivas
          }
          icono={<BsTools />}
          clase="primary"
        />

        <KpiCard
          titulo="Pendientes"
          valor={
            dashboard.ordenesPendientes
          }
          icono={<BsClockHistory />}
          clase="warning"
        />

        <KpiCard
          titulo="En reparación"
          valor={
            dashboard.ordenesReparacion
          }
          icono={<BsTools />}
          clase="info"
        />

        <KpiCard
          titulo="Listas para entregar"
          valor={
            dashboard.ordenesTerminadas
          }
          icono={<BsCheckCircle />}
          clase="success"
        />

      </section>


      {/* ============================================= */}
      {/* INVENTARIO */}
      {/* ============================================= */}

      <div className="dashboard-section-title">

        <div>

          <h2>
            Operación
          </h2>

          <p>
            Inventario, clientes e ingresos del taller
          </p>

        </div>

      </div>


      <section className="dashboard-kpis">

        <KpiCard
          titulo="Ingresos taller"
          valor={moneda(
            dashboard.ingresosTaller
          )}
          icono={<BsCashStack />}
          clase="success"
        />

        <KpiCard
          titulo="Stock bajo"
          valor={
            dashboard.productosBajos
          }
          icono={
            <BsExclamationTriangle />
          }
          clase="warning"
        />

        <KpiCard
          titulo="Productos agotados"
          valor={
            dashboard.productosAgotados
          }
          icono={<BsBoxSeam />}
          clase="danger"
        />

        <KpiCard
          titulo="Clientes hoy"
          valor={
            dashboard.clientesHoy
          }
          icono={<BsPeople />}
          clase="primary"
        />

      </section>


      {/* ============================================= */}
      {/* GRÁFICAS */}
      {/* ============================================= */}

      <section className="dashboard-charts">

        <div className="dashboard-panel">

          <div className="panel-header">

            <div>

              <h3>
                Ventas últimos 7 días
              </h3>

              <p>
                Comportamiento diario de ventas
              </p>

            </div>

          </div>


          <div className="chart-container">

            <ResponsiveContainer
              width="100%"
              height={300}
            >

              <AreaChart
                data={ventasGrafica}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="dia"
                />

                <YAxis />

                <Tooltip
                  formatter={(value) =>
                    moneda(value)
                  }
                />

                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.15}
                />

              </AreaChart>

            </ResponsiveContainer>

          </div>

        </div>


        {/* TALLER PIE */}

        <div className="dashboard-panel">

          <div className="panel-header">

            <div>

              <h3>
                Órdenes por estado
              </h3>

              <p>
                Distribución del taller
              </p>

            </div>

          </div>


          <div className="chart-container">

            <ResponsiveContainer
              width="100%"
              height={300}
            >

              <PieChart>

                <Pie
                  data={tallerGrafica}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                >

                  {tallerGrafica.map(
                    (_, index) => (

                      <Cell
                        key={index}
                        fill={
                          PIE_COLORS[
                            index %
                              PIE_COLORS.length
                          ]
                        }
                      />

                    )
                  )}

                </Pie>

                <Tooltip />

              </PieChart>

            </ResponsiveContainer>

          </div>


          <div className="chart-legend">

            {tallerGrafica.map(
              (item, index) => (

                <div
                  className="legend-item"
                  key={item.name}
                >

                  <span
                    className="legend-color"
                    style={{
                      backgroundColor:
                        PIE_COLORS[
                          index %
                            PIE_COLORS.length
                        ],
                    }}
                  />

                  <span>
                    {formatearEstado(
                      item.name
                    )}
                  </span>

                  <strong>
                    {item.value}
                  </strong>

                </div>

              )
            )}

          </div>

        </div>

      </section>


      {/* ============================================= */}
      {/* RANKINGS */}
      {/* ============================================= */}

      <section className="dashboard-rankings">

        <RankingTable
          titulo="Productos más vendidos"
          subtitulo="Últimos 30 días"
          datos={
            dashboard.productosMasVendidos
          }
          moneda={moneda}
        />

        <RankingTable
          titulo="Servicios más solicitados"
          subtitulo="Últimos 30 días"
          datos={
            dashboard.serviciosMasSolicitados
          }
          moneda={moneda}
        />

      </section>


      <Outlet />

    </div>

  );

}



// ============================================================
// KPI
// ============================================================

function KpiCard({
  titulo,
  valor,
  icono,
  clase,
}) {

  return (

    <article
      className={`dashboard-kpi ${clase}`}
    >

      <div className="kpi-content">

        <span className="kpi-title">
          {titulo}
        </span>

        <strong className="kpi-value">
          {valor}
        </strong>

      </div>

      <div className="kpi-icon">

        {icono}

      </div>

    </article>

  );

}



// ============================================================
// RANKING
// ============================================================

function RankingTable({
  titulo,
  subtitulo,
  datos,
  moneda,
}) {

  return (

    <div className="dashboard-panel">

      <div className="panel-header">

        <div>

          <h3>
            {titulo}
          </h3>

          <p>
            {subtitulo}
          </p>

        </div>

      </div>


      <div className="table-responsive">

        <table className="dashboard-table">

          <thead>

            <tr>

              <th>#</th>

              <th>
                Nombre
              </th>

              <th>
                Cantidad
              </th>

              <th>
                Total 
              </th>

            </tr>

          </thead>

          <tbody>

            {datos?.length === 0 && (

              <tr>

                <td
                  colSpan="4"
                  className="empty-table"
                >
                  Sin información
                </td>

              </tr>

            )}


            {datos?.map(
              (item, index) => (

                <tr key={item.id}>

                  <td>

                    <span className="ranking-position">

                      {index + 1}

                    </span>

                  </td>

                  <td>
                    {item.nombre}
                  </td>

                  <td>
                    {item.cantidad}
                  </td>

                  <td>
                    {moneda(
                      item.total
                    )}
                  </td>

                </tr>

              )
            )}

          </tbody>

        </table>

      </div>

    </div>

  );

}



function formatearEstado(estado) {

  if (!estado) {
    return "";
  }

  return estado
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(
      /\b\w/g,
      (letra) =>
        letra.toUpperCase()
    );

}