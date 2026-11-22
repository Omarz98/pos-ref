import { NavLink, Outlet } from "react-router-dom";
import { FaChartPie, FaFileInvoiceDollar } from "react-icons/fa";
import "../../styles/Reportes/Reportes.css";

export default function ReportesLayout() {
  return (
    <div className="reports-module">
      <header className="reports-module-header">
        <div>
          <h1>Reportes</h1>
          <p>Análisis y estadísticas de POSREF</p>
        </div>
      </header>

      <nav className="reports-tabs">
        <NavLink
          to="/reportes"
          end
          className={({ isActive }) =>
            `reports-tab ${isActive ? "active" : ""}`
          }
        >
          <FaChartPie />
          Resumen general
        </NavLink>

        <NavLink
          to="/reportes/ventas"
          className={({ isActive }) =>
            `reports-tab ${isActive ? "active" : ""}`
          }
        >
          <FaFileInvoiceDollar />
          Ventas
        </NavLink>
      </nav>

      <Outlet />
    </div>
  );
}