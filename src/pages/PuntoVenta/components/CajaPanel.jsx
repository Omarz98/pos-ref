import {
  FaCashRegister,
  FaCreditCard,
  FaExchangeAlt,
  FaArrowDown,
  FaArrowUp,
  FaMoneyBillWave,
  FaLock,
} from "react-icons/fa";

export default function CajaPanel({
  caja,
  moneda,
  onMovimiento,
  onCerrarCaja,
}) {
  const cards = [
    {
      label: "Fondo inicial",
      value: caja.montoInicial,
      icon: <FaCashRegister />,
    },
    {
      label: "Ventas en efectivo",
      value: caja.ventasEfectivo,
      icon: <FaMoneyBillWave />,
    },
    {
      label: "Ventas con tarjeta",
      value: caja.ventasTarjeta,
      icon: <FaCreditCard />,
    },
    {
      label: "Transferencias",
      value: caja.ventasTransferencia,
      icon: <FaExchangeAlt />,
    },
    {
      label: "Entradas",
      value: caja.entradas,
      icon: <FaArrowDown />,
    },
    {
      label: "Retiros",
      value: caja.retiros,
      icon: <FaArrowUp />,
    },
  ];

  return (
    <section className="cash-panel">
      <div className="cash-panel-heading">
        <div>
          <span className="cash-open-label">
            <span className="status-dot" />
            Caja abierta
          </span>

          <h2>{caja.nombreCaja}</h2>

          <p>
            Abierta por{" "}
            <strong>{caja.usuario || "Usuario actual"}</strong>
          </p>
        </div>

        <div className="cash-panel-actions">
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
      </div>

      <div className="cash-metric-grid">
        {cards.map((card) => (
          <article className="cash-metric" key={card.label}>
            <div className="cash-metric-icon">
              {card.icon}
            </div>

            <div>
              <span>{card.label}</span>
              <strong>{moneda(card.value)}</strong>
            </div>
          </article>
        ))}
      </div>

      <section className="cash-expected-card">
        <div>
          <span>Efectivo esperado en caja</span>
          <strong>{moneda(caja.efectivoEsperado)}</strong>
        </div>

        <small>
          Fondo inicial + ventas en efectivo + entradas -
          retiros
        </small>
      </section>

      {Array.isArray(caja.movimientos) &&
        caja.movimientos.length > 0 && (
          <section className="cash-history-card">
            <div className="cash-history-header">
              <div>
                <h3>Movimientos recientes</h3>
                <p>Actividad registrada durante el turno.</p>
              </div>
            </div>

            <div className="cash-table-wrapper">
              <table className="cash-table">
                <thead>
                  <tr>
                    <th>Hora</th>
                    <th>Tipo</th>
                    <th>Concepto</th>
                    <th>Monto</th>
                  </tr>
                </thead>

                <tbody>
                  {caja.movimientos.map((movimiento, index) => (
                    <tr key={movimiento.id || index}>
                      <td>
                        {movimiento.fecha
                          ? new Date(
                              movimiento.fecha,
                            ).toLocaleTimeString("es-MX", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "-"}
                      </td>

                      <td>
                        <span
                          className={`movement-badge ${
                            movimiento.tipo === "RETIRO"
                              ? "withdraw"
                              : "entry"
                          }`}
                        >
                          {movimiento.tipo}
                        </span>
                      </td>

                      <td>{movimiento.concepto}</td>
                      <td>{moneda(movimiento.monto)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
    </section>
  );
}