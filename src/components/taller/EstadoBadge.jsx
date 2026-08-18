const labels = {
  RECIBIDA: "Recibida",
  EN_DIAGNOSTICO: "En diagnóstico",
  ESPERANDO_AUTORIZACION: "Esperando autorización",
  AUTORIZADA: "Autorizada",
  RECHAZADA: "Rechazada",
  EN_REPARACION: "En reparación",
  ESPERANDO_REFACCIONES: "Esperando refacciones",
  EN_PRUEBAS: "En pruebas",
  TERMINADA: "Terminada",
  LISTA_PARA_ENTREGA: "Lista para entrega",
  PAGO_PARCIAL: "Pago parcial",
  PAGADA: "Pagada",
  ENTREGADA: "Entregada",
  CANCELADA: "Cancelada",
};

export default function EstadoBadge({ estado }) {
  return (
    <span className={`estado-badge estado-${estado || "SIN_ESTADO"}`}>
      {labels[estado] || estado}
    </span>
  );
}
