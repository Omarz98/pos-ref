import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  BsSpeedometer2, BsClipboardCheck, BsCalendar3, BsPlusCircle
} from "react-icons/bs";
import "./taller.css";

export function Taller() {
  const navigate = useNavigate();

  return (
    <div className="taller-shell">
      <header className="taller-header">
        <div>
          <span className="eyebrow">OPERACIÓN</span>
          <h1>Taller</h1>
          <p>Recepción, diagnóstico, reparación, entrega y seguimiento.</p>
        </div>
        <button className="btn-primary" onClick={() => navigate("/taller/ordenes/nueva")}>
          <BsPlusCircle /> Nueva orden
        </button>
      </header>

      <nav className="taller-tabs">
        <NavLink to="/taller" end><BsSpeedometer2 /> Dashboard</NavLink>
        <NavLink to="/taller/ordenes"><BsClipboardCheck /> Órdenes</NavLink>
        <NavLink to="/taller/agenda"><BsCalendar3 /> Agenda</NavLink>
      </nav>

      <main className="taller-content">
        <Outlet />
      </main>
    </div>
  );
}
