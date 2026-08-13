import { useCallback, useEffect, useState } from "react";
import api from "../../../services/api";

export function useCaja() {
  const [caja, setCaja] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const limpiarMensajes = () => {
    setMensaje("");
    setError("");
  };

  const consultarCaja = useCallback(async () => {
    setCargando(true);
    setError("");

    try {
      const response = await api.get("/caja/actual");
      const cajaActual = response.data ?? null;

      if (cajaActual?.estado === "CERRADA") {
        setCaja(null);
      } else {
        setCaja(cajaActual);
      }
    } catch (exception) {
      if (
        exception.response?.status === 404 ||
        exception.response?.status === 400
      ) {
        setCaja(null);
      } else {
        console.error("Error consultando caja:", exception);
        setCaja(null);
        setError(
          exception.response?.data?.message ||
            "No fue posible consultar la caja",
        );
      }
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    consultarCaja();
  }, [consultarCaja]);

  const abrirCaja = async (datos) => {
    limpiarMensajes();

    if (
      datos.montoInicial === "" ||
      Number(datos.montoInicial) < 0
    ) {
      setError("Captura un fondo inicial válido");
      return false;
    }

    setProcesando(true);

    try {
      const response = await api.post("/caja/abrir", {
        nombreCaja: datos.nombreCaja.trim() || "Caja 1",
        montoInicial: Number(datos.montoInicial),
        observaciones: datos.observaciones?.trim() || "",
      });

      setCaja(response.data);
      setMensaje("Caja abierta correctamente");
      return true;
    } catch (exception) {
      console.error("Error abriendo caja:", exception);
      setError(
        exception.response?.data?.message ||
          exception.response?.data?.error ||
          "No fue posible abrir la caja",
      );
      return false;
    } finally {
      setProcesando(false);
    }
  };

  const registrarMovimiento = async (datos) => {
    limpiarMensajes();

    if (!datos.monto || Number(datos.monto) <= 0) {
      setError("Captura un monto mayor a cero");
      return false;
    }

    if (!datos.concepto?.trim()) {
      setError("Captura el concepto del movimiento");
      return false;
    }

    setProcesando(true);

    try {
      const response = await api.post("/caja/movimientos", {
        tipo: datos.tipo,
        monto: Number(datos.monto),
        concepto: datos.concepto.trim(),
      });

      setCaja(response.data);
      setMensaje("Movimiento registrado correctamente");
      return true;
    } catch (exception) {
      console.error("Error registrando movimiento:", exception);
      setError(
        exception.response?.data?.message ||
          exception.response?.data?.error ||
          "No fue posible registrar el movimiento",
      );
      return false;
    } finally {
      setProcesando(false);
    }
  };

  const cerrarCaja = async (datos) => {
    limpiarMensajes();

    if (
      datos.efectivoContado === "" ||
      Number(datos.efectivoContado) < 0
    ) {
      setError("Captura el efectivo contado");
      return false;
    }

    setProcesando(true);

    try {
      await api.post("/caja/cerrar", {
        efectivoContado: Number(datos.efectivoContado),
        observaciones: datos.observaciones?.trim() || "",
      });

      setCaja(null);
      setMensaje("Caja cerrada correctamente");
      return true;
    } catch (exception) {
      console.error("Error cerrando caja:", exception);
      setError(
        exception.response?.data?.message ||
          exception.response?.data?.error ||
          "No fue posible cerrar la caja",
      );
      return false;
    } finally {
      setProcesando(false);
    }
  };

  const moneda = (valor) =>
    Number(valor || 0).toLocaleString("es-MX", {
      style: "currency",
      currency: "MXN",
    });

  return {
    caja,
    cargando,
    procesando,
    mensaje,
    error,
    consultarCaja,
    abrirCaja,
    registrarMovimiento,
    cerrarCaja,
    moneda,
  };
}