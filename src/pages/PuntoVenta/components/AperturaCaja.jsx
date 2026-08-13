import { useState } from "react";
import { FaCashRegister } from "react-icons/fa";

export default function AperturaCaja({
  procesando,
  onAbrir,
}) {
  const [form, setForm] = useState({
    nombreCaja: "Caja 1",
    montoInicial: "",
    observaciones: "",
  });

  const submit = async (event) => {
    event.preventDefault();

    const ok = await onAbrir(form);

    if (ok) {
      setForm({
        nombreCaja: "Caja 1",
        montoInicial: "",
        observaciones: "",
      });
    }
  };

  return (
    <section className="opening-wrapper">
      <div className="opening-card">
        <div className="opening-hero">
          <div className="opening-icon">
            <FaCashRegister />
          </div>

          <h2>Inicia tu turno</h2>
          <p>
            Abre la caja para comenzar a registrar ventas,
            cobros y movimientos.
          </p>
        </div>

        <form className="pos-form" onSubmit={submit}>
          <div className="pos-form-group">
            <label>Nombre de caja</label>
            <input
              type="text"
              value={form.nombreCaja}
              onChange={(e) =>
                setForm({
                  ...form,
                  nombreCaja: e.target.value,
                })
              }
              required
            />
          </div>

          <div className="pos-form-group">
            <label>Fondo inicial</label>

            <div className="money-input">
              <span>$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={form.montoInicial}
                onChange={(e) =>
                  setForm({
                    ...form,
                    montoInicial: e.target.value,
                  })
                }
                autoFocus
                required
              />
            </div>
          </div>

          <div className="pos-form-group">
            <label>Observaciones</label>
            <textarea
              rows="3"
              placeholder="Opcional"
              value={form.observaciones}
              onChange={(e) =>
                setForm({
                  ...form,
                  observaciones: e.target.value,
                })
              }
            />
          </div>

          <button
            className="pos-btn pos-btn-primary opening-button"
            type="submit"
            disabled={procesando}
          >
            <FaCashRegister />
            {procesando ? "Abriendo..." : "Abrir caja"}
          </button>
        </form>
      </div>
    </section>
  );
}