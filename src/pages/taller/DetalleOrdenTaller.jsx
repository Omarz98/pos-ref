import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { tallerApi } from "../../services/tallerApi";
import EstadoBadge from "../../components/taller/EstadoBadge";

const money = (v) =>
  Number(v || 0).toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
  });

const siguientes = {
  RECIBIDA: ["EN_DIAGNOSTICO", "CANCELADA"],
  EN_DIAGNOSTICO: ["ESPERANDO_AUTORIZACION", "AUTORIZADA", "CANCELADA"],
  ESPERANDO_AUTORIZACION: ["AUTORIZADA", "RECHAZADA", "CANCELADA"],
  RECHAZADA: ["ESPERANDO_AUTORIZACION", "CANCELADA"],
  AUTORIZADA: ["EN_REPARACION", "CANCELADA"],
  EN_REPARACION: ["ESPERANDO_REFACCIONES", "EN_PRUEBAS", "TERMINADA"],
  ESPERANDO_REFACCIONES: ["EN_REPARACION", "CANCELADA"],
  EN_PRUEBAS: ["EN_REPARACION", "TERMINADA"],
  TERMINADA: ["LISTA_PARA_ENTREGA"],
  LISTA_PARA_ENTREGA: ["PAGO_PARCIAL", "PAGADA"],
  PAGO_PARCIAL: ["PAGADA"],
  PAGADA: ["ENTREGADA"],
};

export function DetalleOrdenTaller() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [orden, setOrden] = useState(null);
  const [tecnicos, setTecnicos] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [productos, setProductos] = useState([]);
  const [productoBuscar, setProductoBuscar] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    cargar();
    Promise.all([tallerApi.tecnicos(), tallerApi.servicios()]).then(
      ([t, s]) => {
        setTecnicos(t.data);
        setServicios(s.data);
      },
    );
  }, [id]);
  useEffect(() => {
    const t = setTimeout(
      () =>
        tallerApi.productos(productoBuscar).then((r) => setProductos(r.data)),
      250,
    );
    return () => clearTimeout(t);
  }, [productoBuscar]);

  async function cargar() {
    const r = await tallerApi.obtenerOrden(id);
    setOrden(r.data);
  }

  async function cambiarEstado(estado) {
    try {
      const r = await tallerApi.cambiarEstado(id, {
        estado,
        observacion: `Cambio a ${estado}`,
      });
      setOrden(r.data);
    } catch (e) {
      setMsg(e.response?.data?.message || "No se pudo cambiar el estado");
    }
  }

  async function asignarTecnico(tecnicoId) {
    const r = await tallerApi.asignarTecnico(id, {
      tecnicoId: Number(tecnicoId),
    });
    setOrden(r.data);
  }

  async function addServicio(servicioId) {
    const s = servicios.find((x) => String(x.id) === String(servicioId));
    if (!s) return;
    const r = await tallerApi.agregarServicio(id, {
      servicioId: s.id,
      cantidad: 1,
      precio: s.precio_venta,
      descripcion: s.nombre,
    });
    setOrden(r.data);
  }

  async function addProducto(productoId) {
    const p = productos.find((x) => String(x.id) === String(productoId));
    if (!p) return;
    const r = await tallerApi.agregarProducto(id, {
      productoId: p.id,
      cantidad: 1,
      precio: p.precio_venta,
    });
    setOrden(r.data);
  }

  function enviarPos() {
    navigate("/pos", { state: { ordenId: orden.id, ordenTaller: orden } });
  }

  if (!orden) return <div className="panel">Cargando orden...</div>;

  return (
    <div className="detalle-orden">
      <section className="panel orden-hero">
        <div>
          <small>ORDEN DE TRABAJO</small>
          <h2>{orden.folio}</h2>
          <div className="hero-meta">
            <EstadoBadge estado={orden.estado} />
            <span>{orden.prioridad}</span>
          </div>
        </div>
        <div className="hero-actions">
          {siguientes[orden.estado]?.map((e) => (
            <button
              key={e}
              className="btn-secondary"
              onClick={() => cambiarEstado(e)}
            >
              {e.replaceAll("_", " ")}
            </button>
          ))}
          {orden.estado === "LISTA_PARA_ENTREGA" && !orden.ventaId && (
            <button className="btn-primary" onClick={enviarPos}>
              Enviar a Punto de Venta
            </button>
          )}
          {orden.ventaId && (
            <button className="btn-primary" onClick={() => navigate("/ventas")}>
              Venta #{orden.ventaId} · {orden.estadoVenta}
            </button>
          )}
        </div>
      </section>

      {msg && <div className="alert-danger">{msg}</div>}

      <div className="detail-grid">
        <section className="panel">
          <h3>Cliente</h3>
          <strong>{orden.clienteNombre}</strong>
          <span>{orden.clienteTelefono}</span>
          <span>{orden.clienteEmail}</span>
        </section>
        <section className="panel">
          <h3>Motocicleta</h3>
          <strong>
            {orden.marca} {orden.modelo}
          </strong>
          <span>
            {orden.version} · {orden.anio}
          </span>
          <span>
            Placas: {orden.placas || "S/P"} · {orden.color}
          </span>
          <span>{orden.kilometraje?.toLocaleString("es-MX")} km</span>
        </section>
        <section className="panel">
          <h3>Responsable</h3>
          <select
            value={orden.tecnicoId || ""}
            onChange={(e) => e.target.value && asignarTecnico(e.target.value)}
          >
            <option value="">Sin asignar</option>
            {tecnicos.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nombre}
              </option>
            ))}
          </select>
          <span>
            Entrega:{" "}
            {orden.fechaEntregaEstimada
              ? new Date(orden.fechaEntregaEstimada).toLocaleString("es-MX")
              : "Sin compromiso"}
          </span>
        </section>
      </div>

      <section className="panel">
        <h3>Trabajo</h3>
        <div className="notes-grid">
          <div>
            <small>Falla reportada</small>
            <p>{orden.fallaReportada}</p>
          </div>
          <div>
            <small>Diagnóstico</small>
            <p>{orden.diagnosticoInicial || "Pendiente"}</p>
          </div>
          <div>
            <small>Observaciones</small>
            <p>{orden.observaciones || "Sin observaciones"}</p>
          </div>
        </div>
      </section>

      <div className="detail-columns">
        <section className="panel">
          <div className="panel-title">
            <h3>Servicios</h3>
            <select
              defaultValue=""
              onChange={(e) => {
                addServicio(e.target.value);
                e.target.value = "";
              }}
            >
              <option value="">Agregar...</option>
              {servicios.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre}
                </option>
              ))}
            </select>
          </div>
          {orden.servicios.map((s) => (
            <div className="line-item" key={s.id}>
              <div>
                <strong>{s.nombre}</strong>
                <small>{s.descripcion}</small>
              </div>
              <span>
                {s.cantidad} × {money(s.precioUnitario)}
              </span>
              <strong>{money(s.subtotal)}</strong>
              <button
                className="btn-danger-ghost"
                onClick={async () =>
                  setOrden((await tallerApi.eliminarServicio(id, s.id)).data)
                }
              >
                ×
              </button>
            </div>
          ))}
        </section>

        <section className="panel">
          <div className="panel-title">
            <h3>Refacciones</h3>
          </div>
          <input
            placeholder="Buscar refacción..."
            value={productoBuscar}
            onChange={(e) => setProductoBuscar(e.target.value)}
          />
          <select
            defaultValue=""
            onChange={(e) => {
              addProducto(e.target.value);
              e.target.value = "";
            }}
          >
            <option value="">Agregar producto...</option>
            {productos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre} · stock {p.stock_actual}
              </option>
            ))}
          </select>
          {orden.productos.map((p) => (
            <div className="line-item" key={p.id}>
              <div>
                <strong>{p.nombre}</strong>
                <small>
                  {p.codigo} · stock actual {p.stockActual}
                </small>
              </div>
              <span>
                {p.cantidad} × {money(p.precioUnitario)}
              </span>
              <strong>{money(p.subtotal)}</strong>
              <button
                className="btn-danger-ghost"
                onClick={async () =>
                  setOrden((await tallerApi.eliminarProducto(id, p.id)).data)
                }
              >
                ×
              </button>
            </div>
          ))}
        </section>
      </div>

      <div className="detail-columns">
        <section className="panel totals-card">
          <h3>Totales</h3>
          <div>
            <span>Servicios</span>
            <strong>{money(orden.subtotalServicios)}</strong>
          </div>
          <div>
            <span>Refacciones</span>
            <strong>{money(orden.subtotalProductos)}</strong>
          </div>
          <div>
            <span>IVA desglosado</span>
            <strong>{money(orden.iva)}</strong>
          </div>
          <div className="total-main">
            <span>Total</span>
            <strong>{money(orden.total)}</strong>
          </div>
          <div>
            <span>Anticipo</span>
            <strong>{money(orden.anticipo)}</strong>
          </div>
          <div>
            <span>Saldo</span>
            <strong>{money(orden.saldoPendiente)}</strong>
          </div>
        </section>

        <section className="panel">
          <h3>Historial</h3>
          <div className="timeline">
            {orden.historial.map((h) => (
              <div className="timeline-item" key={h.id}>
                <span className="timeline-dot" />
                <div>
                  <strong>{h.tipo.replaceAll("_", " ")}</strong>
                  <p>{h.descripcion}</p>
                  <small>
                    {new Date(h.fecha).toLocaleString("es-MX")} ·{" "}
                    {h.usuarioNombre || "Sistema"}
                  </small>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
