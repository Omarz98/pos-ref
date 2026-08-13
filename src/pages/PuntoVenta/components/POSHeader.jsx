import {
  FaCashRegister,
  FaPlus,
  FaExchangeAlt,
  FaLock,
} from "react-icons/fa";

export default function POSHeader({
  caja,
  cajaAbierta,
  onNuevaVenta,
  onMovimiento,
  onCerrarCaja,
}) {
  return (
    <header className="pos-header">
      <div className="pos-header-title">
        <div className="pos-header-icon">
          <FaCashRegister />
        </div>

        <div>
          <h1>Punto de venta</h1>
          <p>Refaccionaria y taller de motocicletas</p>
        </div>
      </div>

      <div className="pos-header-right">
        <div
          className={`pos-cash-status ${
            cajaAbierta ? "open" : "closed"
          }`}
        > 
          <span className="status-dot" />

          <div>
            <strong>
              {cajaAbierta
                ? caja?.nombreCaja || "Caja abierta"
                : "Caja cerrada"}
            </strong>

            <small>
              {cajaAbierta
                ? `Usuario: ${caja?.usuario || "Actual"}`
                : "Abre caja para comenzar"}
            </small>
          </div>
        </div>

        {cajaAbierta && (
          <div className="pos-header-actions">
            <button
              type="button"
              className="pos-btn pos-btn-light"
              onClick={onNuevaVenta}
            >
              <FaPlus />
              Nueva venta
            </button>

            <button
              type="button"
              className="pos-btn pos-btn-light"
              onClick={onMovimiento}
            >
              <FaExchangeAlt />
              Movimiento
            </button>

            <button
              type="button"
              className="pos-btn pos-btn-danger-outline"
              onClick={onCerrarCaja}
            >
              <FaLock />
              Cerrar caja
            </button>
          </div>
        )}
      </div>
    </header>
  );
}