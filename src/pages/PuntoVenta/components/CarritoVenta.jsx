import {
  FaMinus,
  FaPlus,
  FaTrash,
  FaShoppingCart,
  FaTimes,
} from "react-icons/fa";

export default function CarritoVenta({
  venta,
  onCobrar,
}) {
  return (
    <aside className="cart-card">
      <div className="cart-title-row">
        <div>
          <h2>Venta actual</h2>
          <p>
            {venta.carrito.length} concepto
            {venta.carrito.length === 1 ? "" : "s"}
          </p>
        </div>

        {venta.carrito.length > 0 &&
          !venta.ordenSeleccionada && (
            <button
              type="button"
              className="icon-text-button"
              onClick={venta.nuevaVenta}
            >
              <FaTrash />
              Limpiar
            </button>
          )}
      </div>

      {venta.ordenSeleccionada && (
        <div className="selected-order-card">
          <div>
            <span>Orden de servicio</span>
            <strong>
              {venta.ordenSeleccionada.folio ||
                venta.ordenSeleccionada.numeroOrden}
            </strong>
          </div>

          <div>
            <span>Cliente</span>
            <strong>
              {venta.ordenSeleccionada.clienteNombre ||
                "Cliente"}
            </strong>
          </div>

          <button
            type="button"
            onClick={venta.quitarOrden}
            title="Quitar orden"
          >
            <FaTimes />
          </button>
        </div>
      )}

      <div className="cart-items">
        {venta.carrito.length === 0 ? (
          <div className="cart-empty">
            <FaShoppingCart />
            <strong>Tu venta está vacía</strong>
            <span>
              Agrega un producto, servicio u orden.
            </span>
          </div>
        ) : (
          venta.carrito.map((item) => (
            <div className="cart-line" key={item.id}>
              <div className="cart-line-info">
                <strong>{item.nombre}</strong>
                <small>
                  ${Number(item.precio).toFixed(2)} c/u
                </small>

                {!venta.ordenSeleccionada && (
                  <div className="quantity-control">
                    <button
                      type="button"
                      onClick={() =>
                        venta.disminuirCantidad(item)
                      }
                    >
                      <FaMinus />
                    </button>

                    <span>{item.cantidad}</span>

                    <button
                      type="button"
                      onClick={() =>
                        venta.aumentarCantidad(item)
                      }
                    >
                      <FaPlus />
                    </button>

                    <button
                      type="button"
                      className="delete"
                      onClick={() =>
                        venta.eliminarDelCarrito(item.id)
                      }
                    >
                      <FaTrash />
                    </button>
                  </div>
                )}
              </div>

              <strong className="cart-line-total">
                $
                {(
                  Number(item.cantidad) *
                  Number(item.precio)
                ).toFixed(2)}
              </strong>
            </div>
          ))
        )}
      </div>

      <div className="cart-summary">
        <div>
          <span>Subtotal</span>
          <strong>${venta.subtotal.toFixed(2)}</strong>
        </div>

        <div>
          <span>IVA</span>
          <strong>${venta.iva.toFixed(2)}</strong>
        </div>

        <div className="cart-grand-total">
          <span>Total</span>
          <strong>${venta.total.toFixed(2)}</strong>
        </div>
      </div>

      <button
        className="checkout-button"
        type="button"
        onClick={onCobrar}
        disabled={venta.carrito.length === 0}
      >
        Cobrar
        <strong>${venta.total.toFixed(2)}</strong>
      </button>
    </aside>
  );
}