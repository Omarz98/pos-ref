import {
  FaCashRegister,
  FaPlus,
  FaTrash,
  FaTimes,
} from "react-icons/fa";

export default function CobroModal({
  venta,
  onClose,
  onConfirmar,
}) {
  const aplicarEfectivo = (monto) => {
    const index = venta.pagos.findIndex(
      (pago) => pago.metodo === "EFECTIVO",
    );

    if (index >= 0) {
      venta.actualizarPago(index, "monto", monto);
      return;
    }

    venta.agregarMetodoPago();
  };

  const siguienteBillete = () => {
    const total = Math.ceil(venta.total);

    const denominaciones = [
      20, 50, 100, 200, 500, 1000, 2000,
    ];

    return (
      denominaciones.find(
        (denominacion) => denominacion >= total,
      ) || total
    );
  };

  return (
    <div className="pos-modal-overlay" onMouseDown={onClose}>
      <div
        className="pos-modal payment-modal"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="pos-modal-header">
          <div>
            <span className="modal-eyebrow">
              Finalizar venta
            </span>
            <h2>Cobrar venta</h2>
          </div>

          <button
            className="modal-close"
            type="button"
            onClick={onClose}
          >
            <FaTimes />
          </button>
        </div>

        <div className="payment-total-banner">
          <span>Total a cobrar</span>
          <strong>${venta.total.toFixed(2)}</strong>
        </div>

        <div className="payment-quick-actions">
          <button
            type="button"
            onClick={() => aplicarEfectivo(venta.total)}
          >
            Exacto
          </button>

          {[50, 100, 200, 500].map((monto) => (
            <button
              key={monto}
              type="button"
              onClick={() => aplicarEfectivo(monto)}
            >
              ${monto}
            </button>
          ))}

          <button
            type="button"
            onClick={() =>
              aplicarEfectivo(siguienteBillete())
            }
          >
            Billete
          </button>
        </div>

        <div className="payment-section">
          <div className="payment-section-title">
            <h3>Métodos de pago</h3>

            <button
              type="button"
              className="link-button"
              onClick={venta.agregarMetodoPago}
            >
              <FaPlus />
              Agregar método
            </button>
          </div>

          <div className="payment-rows">
            {venta.pagos.map((pago, index) => (
              <div className="payment-row-new" key={index}>
                <select
                  value={pago.metodo}
                  onChange={(e) =>
                    venta.actualizarPago(
                      index,
                      "metodo",
                      e.target.value,
                    )
                  }
                >
                  <option value="EFECTIVO">Efectivo</option>
                  <option value="TARJETA">Tarjeta</option>
                  <option value="TRANSFERENCIA">
                    Transferencia
                  </option>
                </select>

                <div className="money-input">
                  <span>$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={pago.monto}
                    onChange={(e) =>
                      venta.actualizarPago(
                        index,
                        "monto",
                        e.target.value,
                      )
                    }
                  />
                </div>

                <button
                  type="button"
                  className="payment-delete"
                  disabled={venta.pagos.length === 1}
                  onClick={() =>
                    venta.eliminarMetodoPago(index)
                  }
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="payment-client">
          <label>Cliente</label>
          <select
            value={venta.clienteId}
            disabled={Boolean(venta.ordenSeleccionada)}
            onChange={(e) =>
              venta.setClienteId(e.target.value)
            }
          >
            <option value="">Público general</option>

            {venta.clientes.map((cliente) => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="payment-result-grid">
          <div>
            <span>Total pagado</span>
            <strong>
              ${venta.totalPagado.toFixed(2)}
            </strong>
          </div>

          {venta.saldoPendiente > 0 ? (
            <div className="pending">
              <span>Saldo pendiente</span>
              <strong>
                ${venta.saldoPendiente.toFixed(2)}
              </strong>
            </div>
          ) : (
            <div className="change">
              <span>Cambio</span>
              <strong>${venta.cambio.toFixed(2)}</strong>
            </div>
          )}
        </div>

        {venta.error && (
          <div className="pos-inline-error">
            {venta.error}
          </div>
        )}

        <div className="pos-modal-footer">
          <button
            type="button"
            className="pos-btn pos-btn-light"
            onClick={onClose}
            disabled={venta.procesandoVenta}
          >
            Cancelar
          </button>

          <button
            type="button"
            className="pos-btn pos-btn-primary"
            onClick={onConfirmar}
            disabled={venta.procesandoVenta}
          >
            <FaCashRegister />
            {venta.procesandoVenta
              ? "Procesando..."
              : "Confirmar cobro"}
          </button>
        </div>
      </div>
    </div>
  );
}