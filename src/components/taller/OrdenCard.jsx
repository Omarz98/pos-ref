import { useNavigate } from "react-router-dom";
import EstadoBadge from "./EstadoBadge";

const dinero = (v) =>
  Number(v || 0).toLocaleString("es-MX", { style: "currency", currency: "MXN" });

export default function OrdenCard({ orden }) {
  const navigate = useNavigate();

  return (
    <article
      className={`orden-card ${orden.atrasada ? "orden-atrasada" : ""}`}
      onClick={() => navigate(`/taller/ordenes/${orden.id}`)}
    >
      <div className="orden-card-top">
        <div>
          <strong>{orden.folio}</strong>
          <span>{orden.clienteNombre}</span>
        </div>
        <EstadoBadge estado={orden.estado} />
      </div>

      <div className="orden-card-body">
        <div>
          <small>Motocicleta</small>
          <span>{orden.motocicleta}</span>
        </div>
        <div>
          <small>Placas</small>
          <span>{orden.placas || "S/P"}</span>
        </div>
        <div>
          <small>Técnico</small>
          <span>{orden.tecnicoNombre || "Sin asignar"}</span>
        </div>
        <div>
          <small>Total</small>
          <span>{dinero(orden.total)}</span>
        </div>
      </div>

      {orden.atrasada && <div className="orden-alerta">Entrega atrasada</div>}
    </article>
  );
}
