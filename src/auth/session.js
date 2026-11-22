{/*export const TIEMPO_INACTIVIDAD = 15 * 1000;*/}

export const TIEMPO_INACTIVIDAD = 15 * 60 * 1000;

export const CLAVE_ULTIMA_ACTIVIDAD = "ultimaActividad";

export function obtenerExpiracionToken(token) {
  if (!token) return null;

  try {
    const payloadBase64 = token.split(".")[1];

    const base64 = payloadBase64
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const payload = JSON.parse(atob(base64));

    return typeof payload.exp === "number"
      ? payload.exp * 1000
      : null;
  } catch {
    return null;
  }
}

export function sesionExpirada() {
  const token = localStorage.getItem("token");

  const expiracion = obtenerExpiracionToken(token);

  if (!expiracion || Date.now() >= expiracion) {
    return true;
  }

  const ultimaActividad = Number(
    localStorage.getItem(CLAVE_ULTIMA_ACTIVIDAD)
  );

  if (!ultimaActividad) return true;

  return (
    Date.now() - ultimaActividad >=
    TIEMPO_INACTIVIDAD
  );
}

export function limpiarSesion() {
  localStorage.removeItem("token");
  localStorage.removeItem("usuario");
  localStorage.removeItem(CLAVE_ULTIMA_ACTIVIDAD);
}
