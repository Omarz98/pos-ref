import {
  FaPrint,
  FaReceipt,
  FaTimes,
  FaShoppingCart,
} from "react-icons/fa";
import { PiMotorcycleFill } from "react-icons/pi";

const moneda = (valor) =>
  Number(valor || 0).toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
  });

const fechaTicket = (fecha) => {
  if (!fecha) return new Date().toLocaleString("es-MX");

  const date = new Date(fecha);

  if (Number.isNaN(date.getTime())) {
    return String(fecha);
  }

  return date.toLocaleString("es-MX", {
    dateStyle: "short",
    timeStyle: "short",
  });
};

export default function TicketModal({
  ticket,
  onClose,
  onNuevaVenta,
}) {
  if (!ticket) return null;

  const imprimir = () => {
    window.print();
  };

  return (
    <div className="pos-modal-overlay ticket-overlay">
      <div className="ticket-dialog">
        <div className="ticket-dialog-header no-print">
          <div>
            <span className="modal-eyebrow">
              Venta registrada
            </span>
            <h2>Ticket de venta</h2>
          </div>

          <button
            type="button"
            className="modal-close"
            onClick={onClose}
          >
            <FaTimes />
          </button>
        </div>

        <div className="ticket-paper ticket-print-area">
          <div className="ticket-business">
            <PiMotorcycleFill className="ticket-logo" />

            <h1>DERIAN MOTORS</h1>
            <strong>Refaccionaria y taller de motocicletas</strong>

            <span>Gracias por su compra</span>
          </div>

          <div className="ticket-separator" />

          <div className="ticket-meta">
            <div>
              <span>Ticket</span>
              <strong>
                #{ticket.folio || ticket.id || "N/D"}
              </strong>
            </div>

            <div>
              <span>Fecha</span>
              <strong>{fechaTicket(ticket.fecha)}</strong>
            </div>

            <div>
              <span>Caja</span>
              <strong>{ticket.cajaNombre || "Caja 1"}</strong>
            </div>

            <div>
              <span>Cajero</span>
              <strong>{ticket.usuario || "Usuario"}</strong>
            </div>

            <div className="ticket-meta-full">
              <span>Cliente</span>
              <strong>
                {ticket.clienteNombre || "Público general"}
              </strong>
            </div>

            {ticket.ordenFolio && (
              <div className="ticket-meta-full">
                <span>Orden de servicio</span>
                <strong>{ticket.ordenFolio}</strong>
              </div>
            )}
          </div>

          <div className="ticket-separator" />

          <div className="ticket-items">
            {ticket.items?.map((item, index) => (
              <div
                className="ticket-item"
                key={`${item.tipo}-${item.id || index}`}
              >
                <div className="ticket-item-name">
                  <strong>{item.nombre}</strong>

                  {item.codigo && (
                    <small>{item.codigo}</small>
                  )}
                </div>

                <div className="ticket-item-detail">
                  <span>
                    {Number(item.cantidad)} x{" "}
                    {moneda(item.precio)}
                  </span>

                  <strong>
                    {moneda(
                      Number(item.cantidad) *
                        Number(item.precio),
                    )}
                  </strong>
                </div>
              </div>
            ))}
          </div>

          <div className="ticket-separator" />

          <div className="ticket-totals">
            <div>
              <span>Subtotal</span>
              <strong>{moneda(ticket.subtotal)}</strong>
            </div>

            <div>
              <span>IVA</span>
              <strong>{moneda(ticket.iva)}</strong>
            </div>

            <div className="ticket-total-main">
              <span>TOTAL</span>
              <strong>{moneda(ticket.total)}</strong>
            </div>
          </div>

          <div className="ticket-separator" />

          <div className="ticket-payments">
            <strong className="ticket-section-title">
              Forma de pago
            </strong>

            {ticket.pagosRecibidos?.map((pago, index) => (
              <div key={`${pago.metodo}-${index}`}>
                <span>{pago.metodo}</span>
                <strong>{moneda(pago.monto)}</strong>
              </div>
            ))}

            <div className="ticket-payment-summary">
              <span>Recibido</span>
              <strong>{moneda(ticket.totalRecibido)}</strong>
            </div>

            {Number(ticket.cambio || 0) > 0 && (
              <div className="ticket-change">
                <span>CAMBIO</span>
                <strong>{moneda(ticket.cambio)}</strong>
              </div>
            )}

            {Number(ticket.saldoPendiente || 0) > 0 && (
              <div className="ticket-pending">
                <span>SALDO PENDIENTE</span>
                <strong>
                  {moneda(ticket.saldoPendiente)}
                </strong>
              </div>
            )}
          </div>

          <div className="ticket-separator" />

          <div className="ticket-footer">
            <strong>¡Gracias por su preferencia!</strong>
            <span>
              Conserve este ticket para cualquier aclaración.
            </span>

            <small>
              Venta #{ticket.id || ticket.folio || ""}
            </small>
          </div>
        </div>

        <div className="ticket-actions no-print">
          <button
            type="button"
            className="pos-btn pos-btn-light"
            onClick={imprimir}
          >
            <FaPrint />
            Imprimir ticket
          </button>

          <button
            type="button"
            className="pos-btn pos-btn-primary"
            onClick={onNuevaVenta}
          >
            <FaShoppingCart />
            Nueva venta
          </button>
        </div>
      </div>
    </div>
  );
}
