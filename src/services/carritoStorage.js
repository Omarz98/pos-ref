const PREFIJO = "posref_carrito_";

const obtenerClave = (usuarioId) =>
  `${PREFIJO}${usuarioId}`;

export function guardarCarrito(usuarioId, datos) {
  if (usuarioId == null) return;

  try {
    localStorage.setItem(
      obtenerClave(usuarioId),
      JSON.stringify({
        ...datos,
        fechaGuardado: new Date().toISOString(),
      })
    );
  } catch (error) {
    console.error("Error guardando carrito:", error);
  }
}

export function recuperarCarrito(usuarioId) {
  if (usuarioId == null) return null;

  try {
    const guardado = localStorage.getItem(
      obtenerClave(usuarioId)
    );

    if (!guardado) return null;

    const datos = JSON.parse(guardado);

    return datos &&
      typeof datos === "object" &&
      !Array.isArray(datos)
      ? datos
      : null;
  } catch (error) {
    console.error("Error recuperando carrito:", error);
    return null;
  }
}

export function eliminarCarrito(usuarioId) {
  if (usuarioId == null) return;

  localStorage.removeItem(obtenerClave(usuarioId));
}
