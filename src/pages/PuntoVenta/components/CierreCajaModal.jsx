import { useMemo, useState } from "react";
import { FaLock, FaTimes } from "react-icons/fa";

export default function CierreCajaModal({
  caja,
  moneda,
  procesando,
  onClose,
  onCerrar,
}) {
  const [form, setForm] = useState({
    efectivoContado: "",
    observaciones: "",
  });

  const diferencia = useMemo(() => {
    if (form.efectivoContado === "") return null;

    return (
      Number(form.efectivoContado) -
      Number(caja.efectivoEsperado || 0)
    );
  }, [form.efectivoContado, caja.efectivoEsperado]);

  const submit = async (event) => {
    event.preventDefault();

    const confirmar = window.confirm(
      "¿Confirmas el cierre de caja? Esta operación no se puede deshacer.",
    );

    if (!confirmar) return;

    await onCerrar(form);
  };

  return (
    <div className="pos-modal-overlay" onMouseDown={onClose}>
      <div
        className="pos-modal small-modal"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="pos-modal-header">
          <div>
            <span className="modal-eyebrow">
              Fin de turno
            </span>
            <h2>Cuadrar y cerrar caja</h2>
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
          <div className="close-expected">
            <span>Efectivo esperado</span>
            <strong>
              {moneda(caja.efectivoEsperado)}
            </strong>
          </div>

          <div className="pos-form-group">
            <label>Efectivo contado</label>

            <div className="money-input large">
              <span>$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.efectivoContado}
                onChange={(e) =>
                  setForm({
                    ...form,
                    efectivoContado: e.target.value,
                  })
                }
                autoFocus
                required
              />
            </div>
          </div>

          {diferencia !== null && (
            <div
              className={`close-difference ${
                diferencia === 0
                  ? "balanced"
                  : diferencia < 0
                    ? "negative"
                    : "positive"
              }`}
            >
              <span>Diferencia</span>
              <strong>{moneda(diferencia)}</strong>
            </div>
          )}

          <div className="pos-form-group">
            <label>Observaciones</label>
            <textarea
              rows="3"
              placeholder="Explica cualquier diferencia"
              value={form.observaciones}
              onChange={(e) =>
                setForm({
                  ...form,
                  observaciones: e.target.value,
                })
              }
            />
          </div>

          <div className="close-warning">
            Al cerrar la caja ya no podrás registrar ventas
            hasta abrir un nuevo turno.
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
              className="pos-btn pos-btn-danger"
              disabled={procesando}
            >
              <FaLock />
              {procesando ? "Cerrando..." : "Cerrar caja"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}