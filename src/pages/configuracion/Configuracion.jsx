import { useEffect, useState } from "react";
import ConfigSection from "../../components/ConfigSection";
import {
  obtenerConfiguracion,
  guardarConfiguracion,
} from "../../services/configuracionService";

import { Clientes } from "../../index";


const configuracionInicial = {
  nombreNegocio: "MotoPOS",
  razonSocial: "",
  rfc: "",
  telefono: "",
  email: "",
  direccion: "",

  moneda: "MXN",
  porcentajeIva: 16,
  preciosIncluyenIva: true,
  permitirVentaSinStock: false,
  permitirVentasPendientes: true,

  stockMinimoDefault: 5,
  mostrarAlertasStock: true,

  diasGarantiaServicio: 30,
  kilometrosGarantiaServicio: 500,
  prefijoOrdenServicio: "OS",
  imprimirOrdenServicio: true,

  tema: "CLARO",
  mostrarFooter: true,
  nombreSucursal: "Matriz",
  nombreCaja: "Caja 1",

  ticketEncabezado: "Gracias por su compra",
  ticketPiePagina: "Conserve su ticket para cualquier aclaración",
};

const opcionesMenu = [
  {
    id: "negocio",
    nombre: "Negocio",
    icono: "🏪",
  },
  {
    id: "ventas",
    nombre: "Ventas",
    icono: "💰",
  },
  {
    id: "clientes",
    nombre: "Clientes",
    icono: "🙋​",
  },
  {
    id: "inventario",
    nombre: "Inventario",
    icono: "📦",
  },
  {
    id: "taller",
    nombre: "Taller",
    icono: "🔧",
  },
  {
    id: "apariencia",
    nombre: "Apariencia",
    icono: "🎨",
  },
  {
    id: "ticket",
    nombre: "Ticket",
    icono: "🧾",
  },
];

const Configuracion = () => {
  const [configuracion, setConfiguracion] = useState(
    configuracionInicial
  );

  const [seccionActiva, setSeccionActiva] = useState("negocio");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState("");

  useEffect(() => {
    cargarConfiguracion();
  }, []);

  const cargarConfiguracion = async () => {
    try {
      setCargando(true);

      const data = await obtenerConfiguracion();

      setConfiguracion({
        ...configuracionInicial,
        ...data,
      });
    } catch (error) {
      console.error(error);

      setMensaje(
        "No se pudo cargar la configuración. Se muestran valores predeterminados."
      );
      setTipoMensaje("error");
    } finally {
      setCargando(false);
    }
  };

  const actualizarCampo = (event) => {
    const { name, value, type, checked } = event.target;

    setConfiguracion((anterior) => ({
      ...anterior,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const actualizarNumero = (event) => {
    const { name, value } = event.target;

    setConfiguracion((anterior) => ({
      ...anterior,
      [name]: value === "" ? "" : Number(value),
    }));
  };

  const guardar = async (event) => {
    event.preventDefault();

    try {
      setGuardando(true);
      setMensaje("");

      const data = await guardarConfiguracion(configuracion);

      setConfiguracion({
        ...configuracionInicial,
        ...data,
      });

      setMensaje("Configuración guardada correctamente.");
      setTipoMensaje("success");
    } catch (error) {
      console.error(error);

      setMensaje(error.message);
      setTipoMensaje("error");
    } finally {
      setGuardando(false);
    }
  };

  const restaurarValores = () => {
    const confirmar = window.confirm(
      "¿Deseas restaurar los valores predeterminados?"
    );

    if (!confirmar) {
      return;
    }

    setConfiguracion(configuracionInicial);
    setMensaje("Se restauraron los valores predeterminados.");
    setTipoMensaje("success");
  };

  if (cargando) {
    return (
      <div className="config-loading">
        Cargando configuración...
      </div>
    );
  }

  return (
    <div className="config-page">
      <header className="config-header">
        <div>
          <h1>Configuración</h1>
          <p>
            Administra las preferencias generales de MotoPOS.
          </p>
        </div>

        <div className="config-header-actions">
          <button
            type="button"
            className="button-secondary"
            onClick={restaurarValores}
            disabled={guardando}
          >
            Restaurar
          </button>

          <button
            type="submit"
            form="config-form"
            className="button-primary"
            disabled={guardando}
          >
            {guardando ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </header>

      {mensaje && (
        <div className={`config-message ${tipoMensaje}`}>
          {mensaje}
        </div>
      )}

      <div className="config-layout">
        <aside className="config-menu">
          {opcionesMenu.map((opcion) => (
            <button
              key={opcion.id}
              type="button"
              className={
                seccionActiva === opcion.id
                  ? "config-menu-item active"
                  : "config-menu-item"
              }
              onClick={() => setSeccionActiva(opcion.id)}
            >
              <span>{opcion.icono}</span>
              {opcion.nombre}
            </button>
          ))}
        </aside>

        <form
          id="config-form"
          className="config-content"
          onSubmit={guardar}
        >
          {seccionActiva === "negocio" && (
            <ConfigSection
              titulo="Datos del negocio"
              descripcion="Información que identifica a la refaccionaria."
            >
              <div className="config-grid">
                <div className="form-group">
                  <label htmlFor="nombreNegocio">
                    Nombre comercial
                  </label>
                  <input
                    id="nombreNegocio"
                    name="nombreNegocio"
                    value={configuracion.nombreNegocio}
                    onChange={actualizarCampo}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="razonSocial">
                    Razón social
                  </label>
                  <input
                    id="razonSocial"
                    name="razonSocial"
                    value={configuracion.razonSocial}
                    onChange={actualizarCampo}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="rfc">RFC</label>
                  <input
                    id="rfc"
                    name="rfc"
                    value={configuracion.rfc}
                    onChange={actualizarCampo}
                    maxLength={13}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="telefono">Teléfono</label>
                  <input
                    id="telefono"
                    name="telefono"
                    value={configuracion.telefono}
                    onChange={actualizarCampo}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">
                    Correo electrónico
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={configuracion.email}
                    onChange={actualizarCampo}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="nombreSucursal">
                    Sucursal
                  </label>
                  <input
                    id="nombreSucursal"
                    name="nombreSucursal"
                    value={configuracion.nombreSucursal}
                    onChange={actualizarCampo}
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="direccion">Dirección</label>
                  <textarea
                    id="direccion"
                    name="direccion"
                    value={configuracion.direccion}
                    onChange={actualizarCampo}
                    rows="3"
                  />
                </div>
              </div>
            </ConfigSection>
          )}

          {seccionActiva === "ventas" && (
            <ConfigSection
              titulo="Ventas e impuestos"
              descripcion="Controla el comportamiento del punto de venta."
            >
              <div className="config-grid">
                <div className="form-group">
                  <label htmlFor="moneda">Moneda</label>
                  <select
                    id="moneda"
                    name="moneda"
                    value={configuracion.moneda}
                    onChange={actualizarCampo}
                  >
                    <option value="MXN">
                      Peso mexicano - MXN
                    </option>
                    <option value="USD">
                      Dólar estadounidense - USD
                    </option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="porcentajeIva">
                    Porcentaje de IVA
                  </label>
                  <input
                    id="porcentajeIva"
                    name="porcentajeIva"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={configuracion.porcentajeIva}
                    onChange={actualizarNumero}
                  />
                </div>
              </div>

              <div className="switch-list">
                <label className="switch-row">
                  <div>
                    <strong>Precios con IVA incluido</strong>
                    <span>
                      Los precios capturados ya contienen el impuesto.
                    </span>
                  </div>

                  <input
                    type="checkbox"
                    name="preciosIncluyenIva"
                    checked={configuracion.preciosIncluyenIva}
                    onChange={actualizarCampo}
                  />
                </label>

                <label className="switch-row">
                  <div>
                    <strong>Permitir ventas sin stock</strong>
                    <span>
                      Permite vender productos con existencia insuficiente.
                    </span>
                  </div>

                  <input
                    type="checkbox"
                    name="permitirVentaSinStock"
                    checked={configuracion.permitirVentaSinStock}
                    onChange={actualizarCampo}
                  />
                </label>

                <label className="switch-row">
                  <div>
                    <strong>Permitir ventas pendientes</strong>
                    <span>
                      Permite registrar ventas con saldo pendiente.
                    </span>
                  </div>

                  <input
                    type="checkbox"
                    name="permitirVentasPendientes"
                    checked={configuracion.permitirVentasPendientes}
                    onChange={actualizarCampo}
                  />
                </label>
              </div>
            </ConfigSection>
          )}

          {seccionActiva === "clientes" && (
            <Clientes />
          )}

          {seccionActiva === "inventario" && (
            <ConfigSection
              titulo="Inventario"
              descripcion="Configura las reglas generales de existencias."
            >
              <div className="config-grid">
                <div className="form-group">
                  <label htmlFor="stockMinimoDefault">
                    Stock mínimo predeterminado
                  </label>
                  <input
                    id="stockMinimoDefault"
                    name="stockMinimoDefault"
                    type="number"
                    min="0"
                    value={configuracion.stockMinimoDefault}
                    onChange={actualizarNumero}
                  />
                </div>
              </div>

              <div className="switch-list">
                <label className="switch-row">
                  <div>
                    <strong>Mostrar alertas de stock</strong>
                    <span>
                      Notifica cuando un producto alcanza su mínimo.
                    </span>
                  </div>

                  <input
                    type="checkbox"
                    name="mostrarAlertasStock"
                    checked={configuracion.mostrarAlertasStock}
                    onChange={actualizarCampo}
                  />
                </label>
              </div>
            </ConfigSection>
          )}

          {seccionActiva === "taller" && (
            <ConfigSection
              titulo="Configuración del taller"
              descripcion="Define valores predeterminados para las órdenes de servicio."
            >
              <div className="config-grid">
                <div className="form-group">
                  <label htmlFor="prefijoOrdenServicio">
                    Prefijo de orden
                  </label>
                  <input
                    id="prefijoOrdenServicio"
                    name="prefijoOrdenServicio"
                    value={configuracion.prefijoOrdenServicio}
                    onChange={actualizarCampo}
                    maxLength={10}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="diasGarantiaServicio">
                    Días de garantía
                  </label>
                  <input
                    id="diasGarantiaServicio"
                    name="diasGarantiaServicio"
                    type="number"
                    min="0"
                    value={configuracion.diasGarantiaServicio}
                    onChange={actualizarNumero}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="kilometrosGarantiaServicio">
                    Kilómetros de garantía
                  </label>
                  <input
                    id="kilometrosGarantiaServicio"
                    name="kilometrosGarantiaServicio"
                    type="number"
                    min="0"
                    value={
                      configuracion.kilometrosGarantiaServicio
                    }
                    onChange={actualizarNumero}
                  />
                </div>
              </div>

              <div className="switch-list">
                <label className="switch-row">
                  <div>
                    <strong>Imprimir orden de servicio</strong>
                    <span>
                      Muestra la opción de impresión al guardar.
                    </span>
                  </div>

                  <input
                    type="checkbox"
                    name="imprimirOrdenServicio"
                    checked={configuracion.imprimirOrdenServicio}
                    onChange={actualizarCampo}
                  />
                </label>
              </div>
            </ConfigSection>
          )}

          {seccionActiva === "apariencia" && (
            <ConfigSection
              titulo="Apariencia"
              descripcion="Personaliza la presentación del sistema."
            >
              <div className="config-grid">
                <div className="form-group">
                  <label htmlFor="tema">Tema</label>
                  <select
                    id="tema"
                    name="tema"
                    value={configuracion.tema}
                    onChange={actualizarCampo}
                  >
                    <option value="CLARO">Claro</option>
                    <option value="OSCURO">Oscuro</option>
                    <option value="SISTEMA">
                      Usar configuración del sistema
                    </option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="nombreCaja">
                    Nombre de la caja
                  </label>
                  <input
                    id="nombreCaja"
                    name="nombreCaja"
                    value={configuracion.nombreCaja}
                    onChange={actualizarCampo}
                  />
                </div>
              </div>

              <div className="switch-list">
                <label className="switch-row">
                  <div>
                    <strong>Mostrar pie de página</strong>
                    <span>
                      Muestra estado, usuario, sucursal y caja.
                    </span>
                  </div>

                  <input
                    type="checkbox"
                    name="mostrarFooter"
                    checked={configuracion.mostrarFooter}
                    onChange={actualizarCampo}
                  />
                </label>
              </div>
            </ConfigSection>
          )}

          {seccionActiva === "ticket" && (
            <ConfigSection
              titulo="Configuración del ticket"
              descripcion="Personaliza los mensajes impresos en las ventas."
            >
              <div className="config-grid">
                <div className="form-group full-width">
                  <label htmlFor="ticketEncabezado">
                    Encabezado
                  </label>
                  <textarea
                    id="ticketEncabezado"
                    name="ticketEncabezado"
                    value={configuracion.ticketEncabezado}
                    onChange={actualizarCampo}
                    rows="3"
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="ticketPiePagina">
                    Pie de página
                  </label>
                  <textarea
                    id="ticketPiePagina"
                    name="ticketPiePagina"
                    value={configuracion.ticketPiePagina}
                    onChange={actualizarCampo}
                    rows="3"
                  />
                </div>
              </div>

              <div className="ticket-preview">
                <h3>Vista previa</h3>

                <div className="ticket-paper">
                  <strong>{configuracion.nombreNegocio}</strong>
                  <span>{configuracion.razonSocial}</span>
                  <span>{configuracion.rfc}</span>

                  <hr />

                  <p>{configuracion.ticketEncabezado}</p>

                  <div className="ticket-product">
                    <span>Aceite para motocicleta</span>
                    <span>$150.00</span>
                  </div>

                  <div className="ticket-product">
                    <span>Servicio de cambio</span>
                    <span>$200.00</span>
                  </div>

                  <hr />

                  <div className="ticket-total">
                    <strong>Total</strong>
                    <strong>$350.00</strong>
                  </div>

                  <p>{configuracion.ticketPiePagina}</p>
                </div>
              </div>
            </ConfigSection>
          )}

          <div className="config-mobile-actions">
            <button
              type="button"
              className="button-secondary"
              onClick={restaurarValores}
              disabled={guardando}
            >
              Restaurar
            </button>

            <button
              type="submit"
              className="button-primary"
              disabled={guardando}
            >
              {guardando ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Configuracion;