const API_URL = "http://localhost:8080/api/configuracion";

const obtenerConfiguracion = async () => {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("No fue posible obtener la configuración");
  }

  return response.json();
};

const guardarConfiguracion = async (configuracion) => {
  const response = await fetch(API_URL, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(configuracion),
  });

  if (!response.ok) {
    const mensaje = await response.text();
    throw new Error(mensaje || "No fue posible guardar la configuración");
  }

  return response.json();
};

export {
  obtenerConfiguracion,
  guardarConfiguracion,
};