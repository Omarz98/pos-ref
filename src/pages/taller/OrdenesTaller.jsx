import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { tallerApi } from "../../services/tallerApi";
import EstadoBadge from "../../components/taller/EstadoBadge";

const estados = [
  "", "RECIBIDA", "EN_DIAGNOSTICO", "ESPERANDO_AUTORIZACION",
  "AUTORIZADA", "EN_REPARACION", "ESPERANDO_REFACCIONES",
  "EN_PRUEBAS", "TERMINADA", "LISTA_PARA_ENTREGA",
  "PAGO_PARCIAL", "PAGADA", "ENTREGADA", "CANCELADA"
];

const dinero = v => Number(v || 0).toLocaleString("es-MX", {
  style: "currency", currency: "MXN"
});

export function OrdenesTaller() {
  const navigate = useNavigate();
  const [ordenes, setOrdenes] = useState([]);
  const [estado, setEstado] = useState("");
  const [buscar, setBuscar] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = setTimeout(cargar, 250);
    return () => clearTimeout(t);
  }, [estado, buscar]);

  async function cargar() {
    setLoading(true);
    try {
      const r = await tallerApi.listarOrdenes({ estado, buscar });
      setOrdenes(r.data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="panel">
      <div className="panel-title">
        <div>
          <h2>Órdenes de trabajo</h2>
          <p>Consulta, filtra y abre el expediente completo de cada reparación.</p>
        </div>
        <button className="btn-primary" onClick={() => navigate("/ordenes")}>
          Nueva orden
        </button>
      </div>

      <div className="toolbar">
        <input
          value={buscar}
          onChange={e => setBuscar(e.target.value)}
          placeholder="Folio, cliente, teléfono o placas..."
        />
        <select value={estado} onChange={e => setEstado(e.target.value)}>
          <option value="">Todos los estados</option>
          {estados.filter(Boolean).map(e => <option key={e} value={e}>{e.replaceAll("_"," ")}</option>)}
        </select>
      </div>

      <div className="table-wrap">
        <table className="taller-table">
          <thead>
            <tr>
              <th>Orden</th><th>Cliente / Moto</th><th>Técnico</th>
              <th>Estado</th><th>Entrega</th><th>Total</th><th></th>
            </tr>
          </thead>
          <tbody>
            {ordenes.map(o => (
              <tr key={o.id} className={o.atrasada ? "row-danger" : ""}>
                <td><strong>{o.folio}</strong><small>{o.prioridad}</small></td>
                <td><strong>{o.clienteNombre}</strong><small>{o.motocicleta} · {o.placas || "S/P"}</small></td>
                <td>{o.tecnicoNombre || "Sin asignar"}</td>
                <td><EstadoBadge estado={o.estado} /></td>
                <td>{o.fechaEntregaEstimada ? new Date(o.fechaEntregaEstimada).toLocaleString("es-MX") : "Sin fecha"}</td>
                <td>{dinero(o.total)}</td>
                <td><button className="btn-link" onClick={() => navigate(`/taller/ordenes/${o.id}`)}>Ver</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!loading && !ordenes.length && <div className="empty-state">No hay órdenes para el filtro seleccionado.</div>}
    </section>
  );
}
