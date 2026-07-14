import { useEffect, useState } from "react";
import FormCard from "../components/FormCard";
import DataTable from "../components/DataTable";
import { FaEdit, FaTrash } from "react-icons/fa";
export function Ventas() {
  const [ventas, setVentas] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("TODAS");
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);

  const [mostrarDetalle, setMostrarDetalle] = useState(false);

  const verVenta = (venta) => {
    setVentaSeleccionada(venta);
    setMostrarDetalle(true);
  };

  const fetchVentas = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/ventas");

      const data = await response.json();

      setVentas(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchVentas();
  }, []);

  const ventasFiltradas = ventas.filter((venta) => {
    const coincideBusqueda =
      venta.id?.toLowerCase().includes(busqueda.toLowerCase()) ||
      venta.cliente?.nombre?.toLowerCase().includes(busqueda.toLowerCase());

    const coincideEstado =
      filtroEstado === "TODAS" ? true : venta.estado === filtroEstado;

    return coincideBusqueda && coincideEstado;
  });
  return (
    <>
      <header className="header">
        <div>
          <h1>Ventas</h1>
          <p>Consulta y administra las ventas</p>
        </div>
      </header>
      <div className="ventas-filtros">
        <input
          placeholder="Buscar venta..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />

        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
        >
          <option value="TODAS">Todas</option>
          <option value="PENDIENTE">Pendientes</option>
          <option value="PAGADA">Pagadas</option>
        </select>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Folio</th>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Total</th>
              <th>Pagado</th>
              <th>Saldo</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {ventasFiltradas.map((venta) => (
              <tr key={venta.id}>
                <td>{venta.folio}</td>

                <td>{new Date(venta.fechaVenta).toLocaleDateString()}</td>

                <td>{venta.cliente?.nombre}</td>

                <td>${Number(venta.total).toFixed(2)}</td>

                <td>${Number(venta.totalPagado).toFixed(2)}</td>

                <td>${Number(venta.saldoPendiente).toFixed(2)}</td>

                <td>
                  <span
                    className={
                      venta.estado === "PAGADA" ? "badge-paid" : "badge-pending"
                    }
                  >
                    {venta.estado}
                  </span>
                </td>

                <td>
                  <button className="btn-view" onClick={() => verVenta(venta)}>
                    Ver
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
