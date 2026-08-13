import { useState } from "react";
import {
  FaCashRegister,
  FaShoppingCart,
  FaMoneyBillWave,
  FaExchangeAlt,
} from "react-icons/fa";

import "./PuntoVenta.css";
import "./ticket.css";
import { useCaja } from "./hooks/useCaja";
import { usePuntoVenta } from "./hooks/usePuntoVenta";

import POSHeader from "./components/POSHeader";
import POSTabs from "./components/POSTabs";
import AperturaCaja from "./components/AperturaCaja";
import VentaPanel from "./components/VentaPanel";
import CajaPanel from "./components/CajaPanel";
import MovimientoCajaModal from "./components/MovimientoCajaModal";
import CierreCajaModal from "./components/CierreCajaModal";
import CobroModal from "./components/CobroModal";
import TicketModal from "./components/TicketModal";

export function PuntoVenta() {
  const [tab, setTab] = useState("VENTA");
  const [mostrarMovimiento, setMostrarMovimiento] = useState(false);
  const [mostrarCierre, setMostrarCierre] = useState(false);
  const [mostrarCobro, setMostrarCobro] = useState(false);
  const [ticket, setTicket] = useState(null);

  const caja = useCaja();

  const venta = usePuntoVenta({
    caja: caja.caja,
    onVentaRegistrada: async () => {
      await caja.consultarCaja();
    },
  });

  if (caja.cargando) {
    return (
      <div className="pos-loading">
        <FaCashRegister />
        <span>Consultando estado de caja...</span>
      </div>
    );
  }

  const cajaAbierta = caja.caja && caja.caja.estado !== "CERRADA";

  return (
    <div className="pos-page">
      <POSHeader
        caja={caja.caja}
        cajaAbierta={cajaAbierta}
        onNuevaVenta={() => {
          venta.nuevaVenta();
          setTab("VENTA");
        }}
        onMovimiento={() => setMostrarMovimiento(true)}
        onCerrarCaja={() => setMostrarCierre(true)}
      />

      {caja.mensaje && (
        <div className="pos-alert pos-alert-success">{caja.mensaje}</div>
      )}

      {caja.error && (
        <div className="pos-alert pos-alert-error">{caja.error}</div>
      )}

      {!cajaAbierta ? (
        <AperturaCaja procesando={caja.procesando} onAbrir={caja.abrirCaja} />
      ) : (
        <>
          <POSTabs
            tab={tab}
            onChange={setTab}
            items={[
              {
                id: "VENTA",
                label: "Venta",
                icon: <FaShoppingCart />,
              },
              {
                id: "CAJA",
                label: "Caja",
                icon: <FaMoneyBillWave />,
              },
            ]}
          />

          {tab === "VENTA" && (
            <VentaPanel venta={venta} onCobrar={() => setMostrarCobro(true)} />
          )}

          {tab === "CAJA" && (
            <CajaPanel
              caja={caja.caja}
              moneda={caja.moneda}
              onMovimiento={() => setMostrarMovimiento(true)}
              onCerrarCaja={() => setMostrarCierre(true)}
            />
          )}
        </>
      )}

      {mostrarMovimiento && cajaAbierta && (
        <MovimientoCajaModal
          procesando={caja.procesando}
          onClose={() => setMostrarMovimiento(false)}
          onGuardar={async (datos) => {
            const ok = await caja.registrarMovimiento(datos);
            if (ok) {
              setMostrarMovimiento(false);
            }
          }}
        />
      )}

      {mostrarCierre && cajaAbierta && (
        <CierreCajaModal
          caja={caja.caja}
          moneda={caja.moneda}
          procesando={caja.procesando}
          onClose={() => setMostrarCierre(false)}
          onCerrar={async (datos) => {
            const ok = await caja.cerrarCaja(datos);
            if (ok) {
              setMostrarCierre(false);
              setTab("VENTA");
              venta.nuevaVenta();
            }
          }}
        />
      )}

      {mostrarCobro && cajaAbierta && (
        <CobroModal
          venta={venta}
          onClose={() => setMostrarCobro(false)}
          onConfirmar={async () => {
            const ticketGenerado = await venta.cobrarVenta();

            if (ticketGenerado) {
              setMostrarCobro(false);
              setTicket(ticketGenerado);
            }
          }}
        />
      )}

      {ticket && (
        <TicketModal
          ticket={ticket}
          onClose={() => setTicket(null)}
          onNuevaVenta={() => {
            setTicket(null);
            venta.nuevaVenta();
            setTab("VENTA");
          }}
        />
      )}
    </div>
  );
}
