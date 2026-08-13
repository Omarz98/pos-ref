import CatalogoPOS from "./CatalogoPOS";
import CarritoVenta from "./CarritoVenta";

export default function VentaPanel({
  venta,
  onCobrar,
}) {
  return (
    <section className="sale-layout">
      <CatalogoPOS venta={venta} />

      <CarritoVenta
        venta={venta}
        onCobrar={onCobrar}
      />
    </section>
  );
}