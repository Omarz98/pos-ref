
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BsClockHistory,
  BsCalendar3,
  BsTools,
  BsBoxSeam,
  BsEye,
  BsSpeedometer2,
} from "react-icons/bs";

const moneda = (valor) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(Number(valor ?? 0));

const fecha = (valor) => {
  if (!valor) return "Sin fecha";
  const partes = String(valor).substring(0, 10).split("-");
  return partes.length === 3
    ? `${partes[2]}/${partes[1]}/${partes[0]}`
    : valor;
};

export default function HistorialServicios({
  historial = [],
  cargando = false,
  error = "",
}) {
  const navigate = useNavigate();
  const [filtro, setFiltro] = useState("TODAS");

  const ordenes = useMemo(
    () =>
      [...historial].sort((a, b) =>
        String(b.fechaRecepcion ?? "").localeCompare(
          String(a.fechaRecepcion ?? "")
        )
      ),
    [historial]
  );

  const filtradas = ordenes.filter(
    (orden) =>
      filtro === "TODAS" || orden.estado === filtro
  );

  const totalGastado = ordenes
    .filter((o) =>
      ["FINALIZADA", "ENTREGADA"].includes(o.estado)
    )
    .reduce((total, orden) => total + Number(orden.total ?? 0), 0);

  const estados = [...new Set(ordenes.map((o) => o.estado))]
    .filter(Boolean);

  if (cargando) {
    return <p>Cargando historial de servicios...</p>;
  }

  return (
    <section className="historial-servicios">
      <div className="historial-encabezado">
        <div>
          <h3>
            <BsClockHistory /> Historial de servicios
          </h3>
          <p>Consulta los trabajos realizados a esta motocicleta.</p>
        </div>
      </div>

      {error && <p role="alert" className="moto-form-error">{error}</p>}

      <div className="historial-resumen">
        <div className="historial-kpi">
          <span>Órdenes registradas</span>
          <strong>{ordenes.length}</strong>
        </div>

        <div className="historial-kpi">
          <span>Órdenes entregadas o finalizadas</span>
          <strong>
            {ordenes.filter((o) =>
              ["FINALIZADA", "ENTREGADA"].includes(o.estado)
            ).length}
          </strong>
        </div>

        <div className="historial-kpi">
          <span>Total de órdenes finalizadas</span>
          <strong>{moneda(totalGastado)}</strong>
        </div>
      </div>

      <div className="historial-filtros">
        <label htmlFor="filtroHistorial">Filtrar por estado</label>
        <select
          id="filtroHistorial"
          className="form-select"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        >
          <option value="TODAS">Todas las órdenes</option>
          {estados.map((estado) => (
            <option key={estado} value={estado}>
              {estado.replaceAll("_", " ")}
            </option>
          ))}
        </select>
      </div>

      {filtradas.length === 0 ? (
        <div className="moto-detalle-empty">
          <BsClockHistory size={32} />
          <p>No hay órdenes para mostrar.</p>
        </div>
      ) : (
        <div className="historial-timeline">
          {filtradas.map((orden) => (
            <article className="historial-registro" key={orden.id}>
              <div className="historial-fecha">
                <BsCalendar3 />
                {fecha(orden.fechaRecepcion)}
              </div>

              <div className="historial-registro-cuerpo">
                <div className="historial-registro-top">
                  <h4>Orden {orden.folio ?? `#${orden.id}`}</h4>
                  <span className="moto-estado">
                    {orden.estado?.replaceAll("_", " ") ?? "SIN ESTADO"}
                  </span>
                </div>

                {orden.kilometraje != null && (
                  <p>
                    <BsSpeedometer2 />{" "}
                    {Number(orden.kilometraje).toLocaleString("es-MX")} km
                  </p>
                )}

                {orden.fallaReportada && (
                  <p><strong>Falla:</strong> {orden.fallaReportada}</p>
                )}

                {orden.diagnosticoInicial && (
                  <p>
                    <strong>Diagnóstico:</strong> {orden.diagnosticoInicial}
                  </p>
                )}

                {orden.servicios?.length > 0 && (
                  <div className="historial-detalles">
                    <h5><BsTools /> Servicios</h5>
                    <ul>
                      {orden.servicios.map((s, index) => (
                        <li key={s.id ?? index}>
                          {s.nombre ?? s.servicioNombre ??
                            s.servicio?.nombre ?? "Servicio"}
                          {s.cantidad != null && ` × ${s.cantidad}`}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {orden.productos?.length > 0 && (
                  <div className="historial-detalles">
                    <h5><BsBoxSeam /> Refacciones</h5>
                    <ul>
                      {orden.productos.map((p, index) => (
                        <li key={p.id ?? index}>
                          {p.nombre ?? p.productoNombre ??
                            p.producto?.nombre ?? "Refacción"}
                          {p.cantidad != null && ` × ${p.cantidad}`}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="historial-registro-footer">
                  <strong>{moneda(orden.total)}</strong>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() =>
                      navigate(`/taller/ordenes/${orden.id}`)
                    }
                  >
                    <BsEye /> Ver orden
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
