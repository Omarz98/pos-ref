import { useCallback, useEffect, useState } from "react";

const API_URL = "http://localhost:8080/api";

const valorInicialMovimiento = {
  tipo: "ENTRADA",
  monto: "",
  concepto: "",
};

export function Caja() {
  const [caja, setCaja] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const [apertura, setApertura] = useState({
    nombreCaja: "Caja 1",
    montoInicial: "",
    observaciones: "",
  });

  const [movimiento, setMovimiento] = useState(
    valorInicialMovimiento
  );

  const [cierre, setCierre] = useState({
    efectivoContado: "",
    observaciones: "",
  });

  const obtenerHeaders = () => {
    const token = localStorage.getItem("token");

    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  const obtenerCajaActual = useCallback(async () => {
    setCargando(true);

    try {
      const response = await fetch(`${API_URL}/caja/actual`, {
        headers: obtenerHeaders(),
      });

      if (response.status === 404 || response.status === 400) {
        setCaja(null);
        return;
      }

      if (!response.ok) {
        const texto = await response.text();
        throw new Error(texto || "No fue posible consultar la caja");
      }

      const data = await response.json();
      setCaja(data);
    } catch (error) {
      console.error(error);

      /*
       * Si tu backend responde 500 cuando no existe caja,
       * cambia el backend para devolver 404 o usa un endpoint
       * que responda null.
       */
      setCaja(null);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    obtenerCajaActual();
  }, [obtenerCajaActual]);

  const abrirCaja = async (event) => {
    event.preventDefault();

    if (
      apertura.montoInicial === "" ||
      Number(apertura.montoInicial) < 0
    ) {
      alert("Captura un monto inicial válido");
      return;
    }

    setProcesando(true);
    setMensaje("");

    try {
      const response = await fetch(`${API_URL}/caja/abrir`, {
        method: "POST",
        headers: obtenerHeaders(),
        body: JSON.stringify({
          nombreCaja: apertura.nombreCaja,
          montoInicial: Number(apertura.montoInicial),
          observaciones: apertura.observaciones,
        }),
      });

      const texto = await response.text();

      if (!response.ok) {
        throw new Error(texto || "No fue posible abrir la caja");
      }

      const data = texto ? JSON.parse(texto) : null;

      setCaja(data);
      setMensaje("Caja abierta correctamente");
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setProcesando(false);
    }
  };

  const registrarMovimiento = async (event) => {
    event.preventDefault();

    if (
      !movimiento.monto ||
      Number(movimiento.monto) <= 0
    ) {
      alert("Captura un monto mayor a cero");
      return;
    }

    if (!movimiento.concepto.trim()) {
      alert("Captura el concepto del movimiento");
      return;
    }

    setProcesando(true);

    try {
      const response = await fetch(
        `${API_URL}/caja/movimientos`,
        {
          method: "POST",
          headers: obtenerHeaders(),
          body: JSON.stringify({
            tipo: movimiento.tipo,
            monto: Number(movimiento.monto),
            concepto: movimiento.concepto.trim(),
          }),
        }
      );

      const texto = await response.text();

      if (!response.ok) {
        throw new Error(
          texto || "No fue posible registrar el movimiento"
        );
      }

      const data = texto ? JSON.parse(texto) : null;

      setCaja(data);
      setMovimiento(valorInicialMovimiento);
      setMensaje("Movimiento registrado");
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setProcesando(false);
    }
  };

  const cerrarCaja = async (event) => {
    event.preventDefault();

    if (
      cierre.efectivoContado === "" ||
      Number(cierre.efectivoContado) < 0
    ) {
      alert("Captura el efectivo contado");
      return;
    }

    const confirmar = window.confirm(
      "¿Confirmas el cierre de caja? Esta operación no se puede deshacer."
    );

    if (!confirmar) {
      return;
    }

    setProcesando(true);

    try {
      const response = await fetch(`${API_URL}/caja/cerrar`, {
        method: "POST",
        headers: obtenerHeaders(),
        body: JSON.stringify({
          efectivoContado: Number(cierre.efectivoContado),
          observaciones: cierre.observaciones,
        }),
      });

      const texto = await response.text();

      if (!response.ok) {
        throw new Error(texto || "No fue posible cerrar la caja");
      }

      const data = texto ? JSON.parse(texto) : null;

      setCaja(data);
      setMensaje("Caja cerrada correctamente");
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setProcesando(false);
    }
  };

  const moneda = (valor) =>
    Number(valor || 0).toLocaleString("es-MX", {
      style: "currency",
      currency: "MXN",
    });

  if (cargando) {
    return <p>Consultando caja...</p>;
  }

  return (
    <>
      <header className="header">
        <div>
          <h1>Control de caja</h1>
          <p>Apertura, movimientos y cierre de caja</p>
        </div>
      </header>

      {mensaje && (
        <div className="alert-success">{mensaje}</div>
      )}

      {!caja || caja.estado === "CERRADA" ? (
        <section className="cash-opening-card">
          <h2>Abrir caja</h2>

          <form onSubmit={abrirCaja}>
            <div className="form-group">
              <label>Nombre de caja</label>

              <input
                type="text"
                value={apertura.nombreCaja}
                onChange={(event) =>
                  setApertura({
                    ...apertura,
                    nombreCaja: event.target.value,
                  })
                }
                required
              />
            </div>

            <div className="form-group">
              <label>Fondo inicial</label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={apertura.montoInicial}
                onChange={(event) =>
                  setApertura({
                    ...apertura,
                    montoInicial: event.target.value,
                  })
                }
                required
              />
            </div>

            <div className="form-group">
              <label>Observaciones</label>

              <textarea
                value={apertura.observaciones}
                onChange={(event) =>
                  setApertura({
                    ...apertura,
                    observaciones: event.target.value,
                  })
                }
              />
            </div>

            <button
              type="submit"
              className="primary-btn"
              disabled={procesando}
            >
              {procesando ? "Abriendo..." : "Abrir caja"}
            </button>
          </form>
        </section>
      ) : (
        <section className="cash-layout">
          <div className="cash-main">
            <section className="cash-summary">
              <h2>{caja.nombreCaja}</h2>

              <p>
                Abierta por <strong>{caja.usuario}</strong>
              </p>

              <div className="cash-cards">
                <article>
                  <span>Fondo inicial</span>
                  <strong>{moneda(caja.montoInicial)}</strong>
                </article>

                <article>
                  <span>Ventas en efectivo</span>
                  <strong>{moneda(caja.ventasEfectivo)}</strong>
                </article>

                <article>
                  <span>Ventas con tarjeta</span>
                  <strong>{moneda(caja.ventasTarjeta)}</strong>
                </article>

                <article>
                  <span>Transferencias</span>
                  <strong>
                    {moneda(caja.ventasTransferencia)}
                  </strong>
                </article>

                <article>
                  <span>Entradas</span>
                  <strong>{moneda(caja.entradas)}</strong>
                </article>

                <article>
                  <span>Retiros</span>
                  <strong>{moneda(caja.retiros)}</strong>
                </article>

                <article className="cash-expected">
                  <span>Efectivo esperado</span>
                  <strong>
                    {moneda(caja.efectivoEsperado)}
                  </strong>
                </article>
              </div>
            </section>

            <section className="cash-movement-card">
              <h2>Registrar movimiento</h2>

              <form onSubmit={registrarMovimiento}>
                <div className="form-group">
                  <label>Tipo</label>

                  <select
                    value={movimiento.tipo}
                    onChange={(event) =>
                      setMovimiento({
                        ...movimiento,
                        tipo: event.target.value,
                      })
                    }
                  >
                    <option value="ENTRADA">
                      Entrada de efectivo
                    </option>

                    <option value="RETIRO">
                      Retiro de efectivo
                    </option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Monto</label>

                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={movimiento.monto}
                    onChange={(event) =>
                      setMovimiento({
                        ...movimiento,
                        monto: event.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Concepto</label>

                  <input
                    type="text"
                    value={movimiento.concepto}
                    onChange={(event) =>
                      setMovimiento({
                        ...movimiento,
                        concepto: event.target.value,
                      })
                    }
                    placeholder="Ejemplo: pago a proveedor"
                  />
                </div>

                <button
                  type="submit"
                  className="secondary-btn"
                  disabled={procesando}
                >
                  Registrar movimiento
                </button>
              </form>
            </section>
          </div>

          <aside className="cash-close-card">
            <h2>Cuadrar caja</h2>

            <div className="cash-expected-total">
              <span>Efectivo esperado</span>

              <strong>
                {moneda(caja.efectivoEsperado)}
              </strong>
            </div>

            <form onSubmit={cerrarCaja}>
              <div className="form-group">
                <label>Efectivo contado</label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={cierre.efectivoContado}
                  onChange={(event) =>
                    setCierre({
                      ...cierre,
                      efectivoContado: event.target.value,
                    })
                  }
                  required
                />
              </div>

              {cierre.efectivoContado !== "" && (
                <div className="cash-difference-preview">
                  <span>Diferencia</span>

                  <strong>
                    {moneda(
                      Number(cierre.efectivoContado) -
                        Number(caja.efectivoEsperado)
                    )}
                  </strong>
                </div>
              )}

              <div className="form-group">
                <label>Observaciones</label>

                <textarea
                  value={cierre.observaciones}
                  onChange={(event) =>
                    setCierre({
                      ...cierre,
                      observaciones: event.target.value,
                    })
                  }
                  placeholder="Explica cualquier diferencia"
                />
              </div>

              <button
                type="submit"
                className="danger-btn"
                disabled={procesando}
              >
                {procesando ? "Cerrando..." : "Cerrar caja"}
              </button>
            </form>
          </aside>
        </section>
      )}
    </>
  );
}