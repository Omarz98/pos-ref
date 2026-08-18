import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { tallerApi } from "../../services/tallerApi";
import OrdenCard from "../../components/taller/OrdenCard";

export function TallerDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => { cargar(); }, []);

  async function cargar() {
    try {
      const response = await tallerApi.dashboard();
      setData(response.data);
    } catch (e) {
      setError(e.response?.data?.message || "No fue posible cargar el dashboard");
    }
  }

  if (!data) return <div className="panel">{error || "Cargando taller..."}</div>;

  const kpis = [
    ["Recibidas", data.recibidas],
    ["Diagnóstico", data.diagnostico],
    ["Autorización", data.esperandoAutorizacion],
    ["En reparación", data.reparacion],
    ["Esperando piezas", data.esperandoRefacciones],
    ["En pruebas", data.pruebas],
    ["Listas", data.listasEntrega],
    ["Atrasadas", data.atrasadas],
  ];

  return (
    <>
      <section className="kpi-grid">
        {kpis.map(([titulo, valor]) => (
          <button
            className={`kpi-card ${titulo === "Atrasadas" && valor > 0 ? "kpi-danger" : ""}`}
            key={titulo}
            onClick={() => navigate("/taller/ordenes")}
          >
            <span>{titulo}</span>
            <strong>{valor}</strong>
          </button>
        ))}
      </section>

      <section className="panel">
        <div className="panel-title">
          <div>
            <h2>Próximas entregas</h2>
            <p>Órdenes activas ordenadas por fecha comprometida.</p>
          </div>
          <button className="btn-secondary" onClick={() => navigate("/taller/agenda")}>
            Ver agenda
          </button>
        </div>

        <div className="ordenes-grid">
          {data.proximasEntregas?.length
            ? data.proximasEntregas.map(o => <OrdenCard key={o.id} orden={o} />)
            : <div className="empty-state">No hay entregas próximas.</div>}
        </div>
      </section>
    </>
  );
}
