import { useState } from "react";
import {
  FaArrowDown,
  FaArrowUp,
  FaTimes,
} from "react-icons/fa";

export default function MovimientoCajaModal({
  procesando,
  onClose,
  onGuardar,
}) {
  const [form, setForm] = useState({
    tipo: "ENTRADA",
    monto: "",
    concepto: "",
  });

  const submit = (event) => {
    event.preventDefault();
    onGuardar(form);
  };

  return (
    <div className="pos-modal-overlay" onMouseDown={onClose}>
      <div
        className="pos-modal small-modal"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="pos-modal-header">
          <div>
            <span className="modal-eyebrow">Caja</span>
            <h2>Registrar movimiento</h2>
          </div>

          <button
            type="button"
            className="modal-close"
            onClick={onClose}
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={submit}>
          <div className="movement-type-selector">
            <button
              type="button"
              className={
                form.tipo === "ENTRADA" ? "active" : ""
              }
              onClick={() =>
                setForm({ ...form, tipo: "ENTRADA" })
              }
            >
              <FaArrowDown />
              Entrada
            </button>

            <button
              type="button"
              className={
                form.tipo === "RETIRO" ? "active danger" : ""
              }
              onClick={() =>
                setForm({ ...form, tipo: "RETIRO" })
              }
            >
              <FaArrowUp />
              Retiro
            </button>
          </div>

          <div className="pos-form-group">
            <label>Monto</label>

            <div className="money-input large">
              <span>$</span>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={form.monto}
                onChange={(e) =>
                  setForm({
                    ...form,
                    monto: e.target.value,
                  })
                }
                autoFocus
                required
              />
            </div>
          </div>

          <div className="pos-form-group">
            <label>Concepto</label>
            <input
              type="text"
              placeholder="Ej. Pago a proveedor"
              value={form.concepto}
              onChange={(e) =>
                setForm({
                  ...form,
                  concepto: e.target.value,
                })
              }
              required
            />
          </div>

          <div className="pos-modal-footer">
            <button
              type="button"
              className="pos-btn pos-btn-light"
              onClick={onClose}
              disabled={procesando}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="pos-btn pos-btn-primary"
              disabled={procesando}
            >
              {procesando ? "Registrando..." : "Registrar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}