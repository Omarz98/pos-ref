import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  BsArrowLeft,
  BsPencil,
  BsPlusCircle,
  BsBicycle,
  BsPerson,
  BsClockHistory,
  BsTelephone,
  BsEnvelope,
  BsSpeedometer2,
  BsGeoAlt,
} from "react-icons/bs";

import api from "../../services/api";
import "../../styles/Motocicletas/Motocicletas.css";
import HistorialServicios from "./HistorialServicios";

const formatoMoneda = (valor) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(Number(valor ?? 0));

const formatoFecha = (fecha) => {
  if (!fecha) return "Sin fecha";

  const soloFecha = String(fecha).split("T")[0];
  const partes = soloFecha.split("-");

  if (partes.length !== 3) return soloFecha;

  return `${partes[2]}/${partes[1]}/${partes[0]}`;
};

const texto = (valor, defecto = "No registrado") =>
  valor === null || valor === undefined || valor === "" ? defecto : valor;

export default function MotoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [moto, setMoto] = useState(null);
  const [cliente, setCliente] = useState(null);
  const [historial, setHistorial] = useState([]);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;

    const cargarDetalle = async () => {
      setCargando(true);
      setError("");
      setCliente(null);
      setHistorial([]);

      try {
        const { data: datosMoto } = await api.get(`/motocicletas/${id}`);

        if (!activo) return;

        setMoto(datosMoto);

        // Consultar historial de servicios
        const historialPromise = api.get(`/motocicletas/${id}/historial`);

        // Consultar propietario si tenemos clienteId
        const clienteId = datosMoto.clienteId ?? datosMoto.cliente?.id;

        const clientePromise = clienteId
          ? api.get(`/clientes/${clienteId}`)
          : Promise.resolve({ data: datosMoto.cliente ?? null });

        const [resHistorial, resCliente] = await Promise.allSettled([
          historialPromise,
          clientePromise,
        ]);

        if (!activo) return;

        if (resHistorial.status === "fulfilled") {
          setHistorial(
            Array.isArray(resHistorial.value.data)
              ? resHistorial.value.data
              : [],
          );
        } else {
          setError(
            "Se cargó la motocicleta, pero no fue posible consultar su historial.",
          );
        }

        if (resCliente.status === "fulfilled") {
          setCliente(resCliente.value.data);
        }
      } catch (err) {
        if (!activo) return;

        console.error("Error al cargar motocicleta:", err);

        setError(
          err.response?.data?.message ||
            "No fue posible cargar la motocicleta.",
        );
      } finally {
        if (activo) setCargando(false);
      }
    };

    cargarDetalle();

    return () => {
      activo = false;
    };
  }, [id]);

  const editarMoto = () => {
    navigate(`/taller/motocicletas/${id}/editar`);
  };

  const nuevaOrden = () => {
    navigate(
      `/taller/ordenes/nueva?clienteId=${
        moto.clienteId ?? moto.cliente?.id ?? ""
      }&motoClienteId=${id}`,
    );
  };

  if (cargando) {
    return (
      <div className="moto-detalle-card">
        Cargando información de la motocicleta...
      </div>
    );
  }

  if (!moto) {
    return (
      <div className="moto-detalle-card">
        <p role="alert">{error || "Motocicleta no encontrada."}</p>
        <button
          className="btn-secondary"
          onClick={() => navigate("/taller/motocicletas")}
        >
          Regresar
        </button>
      </div>
    );
  }

  const marca =
    moto.motoMarcaNombre ??
    moto.motoVersion?.motoModelo?.motoMarca?.nombre ??
    moto.marca?.nombre ??
    moto.motoMarca;

  const modelo =
    moto.motoModeloNombre ??
    moto.motoVersion?.motoModelo?.nombre ??
    moto.modelo?.nombre;

  const version = moto.version ?? moto.motoVersion?.nombre;

  const anio = moto.anio ?? moto.motoVersion?.anio;

  const propietario = cliente ?? moto.cliente ?? {};

  return (
    <div className="moto-detalle-page">
      {/* ENCABEZADO */}
      <header className="moto-detalle-header">
        <div>
          <span className="eyebrow">TALLER / MOTOCICLETAS</span>

          <h2>
            {texto(marca, "")} {texto(modelo, "Motocicleta")}
          </h2>

          <p>
            {texto(anio)} · {texto(moto.placas, "Sin placas")}
          </p>
        </div>

        <div className="moto-detalle-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate("/taller/motocicletas")}
          >
            <BsArrowLeft /> Regresar
          </button>

          <button type="button" className="btn-secondary" onClick={editarMoto}>
            <BsPencil /> Editar
          </button>

          <button type="button" className="btn-primary" onClick={nuevaOrden}>
            <BsPlusCircle /> Nueva orden
          </button>
        </div>
      </header>

      {error && (
        <div className="moto-form-error" role="alert">
          {error}
        </div>
      )}

      {/* INFORMACIÓN GENERAL */}
      <div className="moto-detalle-grid">
        <section className="moto-detalle-card">
          <h3>
            <BsBicycle /> Información de la motocicleta
          </h3>

          <div className="moto-detalle-info">
            <div>
              <span>Marca</span>
              <strong>{texto(marca)}</strong>
            </div>

            <div>
              <span>Modelo</span>
              <strong>{texto(modelo)}</strong>
            </div>

            <div>
              <span>Versión</span>
              <strong>{texto(version)}</strong>
            </div>

            <div>
              <span>Año</span>
              <strong>{texto(anio)}</strong>
            </div>

            <div>
              <span>Color</span>
              <strong>{texto(moto.color)}</strong>
            </div>

            <div>
              <span>Placas</span>
              <strong>{texto(moto.placas)}</strong>
            </div>

            <div>
              <span>Número de serie (VIN)</span>
              <strong>{texto(moto.numeroSerie)}</strong>
            </div>

            <div>
              <span>
                <BsSpeedometer2 /> Kilometraje
              </span>
              <strong>
                {moto.kilometrajeActual != null
                  ? `${Number(moto.kilometrajeActual).toLocaleString("es-MX")} km`
                  : "No registrado"}
              </strong>
            </div>
          </div>

          {moto.observaciones && (
            <div className="moto-detalle-observaciones">
              <h4>Observaciones</h4>
              <p>{moto.observaciones}</p>
            </div>
          )}
        </section>

        {/* PROPIETARIO */}
        <section className="moto-detalle-card">
          <h3>
            <BsPerson /> Información del propietario
          </h3>

          <div className="moto-detalle-info">
            <div>
              <span>Nombre</span>
              <strong>{texto(propietario.nombre ?? moto.clienteNombre)}</strong>
            </div>

            <div>
              <span>
                <BsTelephone /> Teléfono
              </span>
              <strong>{texto(propietario.telefono)}</strong>
            </div>

            <div>
              <span>
                <BsEnvelope /> Correo electrónico
              </span>
              <strong>{texto(propietario.email)}</strong>
            </div>

            <div>
              <span>
                <BsGeoAlt /> Dirección
              </span>
              <strong>{texto(propietario.direccion)}</strong>
            </div>
          </div>
        </section>
      </div>
      
      {
        /* HISTORIAL */
        <HistorialServicios historial={historial} cargando={false} />
        
      }
      {/*
      <section className="moto-detalle-card">
        <h3>
          <BsClockHistory /> Historial de servicios
        </h3>

        <p className="moto-detalle-subtitle">
          {historial.length} órdenes de taller registradas
        </p>

        {historial.length === 0 ? (
          <div className="moto-detalle-empty">
            <BsClockHistory size={32} />
            <p>Esta motocicleta todavía no tiene servicios registrados.</p>
          </div>
        ) : (
          <div className="moto-historial-lista">
            {historial.map((orden) => (
              <article key={orden.id} className="moto-historial-item">
                <div className="moto-historial-top">
                  <div>
                    <h4>Orden {texto(orden.folio, `#${orden.id}`)}</h4>

                    <span>{formatoFecha(orden.fechaRecepcion)}</span>
                  </div>

                  <span className="moto-estado">{texto(orden.estado)}</span>
                </div>

                {orden.fallaReportada && (
                  <p>
                    <strong>Falla reportada:</strong> {orden.fallaReportada}
                  </p>
                )}

                {orden.diagnosticoInicial && (
                  <p>
                    <strong>Diagnóstico:</strong> {orden.diagnosticoInicial}
                  </p>
                )}

                {Array.isArray(orden.servicios) &&
                  orden.servicios.length > 0 && (
                    <div>
                      <strong>Servicios realizados</strong>

                      <ul>
                        {orden.servicios.map((servicio, index) => (
                          <li key={servicio.id ?? index}>
                            {servicio.nombre ??
                              servicio.servicioNombre ??
                              servicio.servicio?.nombre ??
                              "Servicio"}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                {Array.isArray(orden.productos) &&
                  orden.productos.length > 0 && (
                    <div>
                      <strong>Refacciones utilizadas</strong>

                      <ul>
                        {orden.productos.map((producto, index) => (
                          <li key={producto.id ?? index}>
                            {producto.nombre ??
                              producto.productoNombre ??
                              producto.producto?.nombre ??
                              "Producto"}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                <div className="moto-historial-footer">
                  <strong>{formatoMoneda(orden.total)}</strong>

                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => navigate(`/taller/ordenes/${orden.id}`)}
                  >
                    Ver orden
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section> */}
    </div>
  );
}
