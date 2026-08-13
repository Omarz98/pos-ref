import {
  FaBox,
  FaTools,
  FaClipboardList,
  FaPlus,
  FaSearch,
} from "react-icons/fa";

const filtros = [
  { id: "TODOS", label: "Todos" },
  { id: "PRODUCTO", label: "Productos" },
  { id: "SERVICIO", label: "Servicios" },
  { id: "ORDEN", label: "Órdenes" },
];

const iconoTipo = (tipo) => {
  if (tipo === "PRODUCTO") return <FaBox />;
  if (tipo === "SERVICIO") return <FaTools />;
  return <FaClipboardList />;
};

export default function CatalogoPOS({ venta }) {
  return (
    <div className="catalog-card">
      <div className="catalog-header">
        <div>
          <h2>Catálogo</h2>
          <p>
            Busca refacciones, servicios u órdenes pendientes.
          </p>
        </div>
      </div>

      <div className="catalog-search">
        <FaSearch />
        <input
          value={venta.busqueda}
          onChange={(e) => venta.setBusqueda(e.target.value)}
          placeholder="Código, nombre, cliente o folio..."
        />
      </div>

      <div className="catalog-filters">
        {filtros.map((filtro) => (
          <button
            key={filtro.id}
            type="button"
            className={
              venta.filtroTipo === filtro.id ? "active" : ""
            }
            onClick={() => venta.setFiltroTipo(filtro.id)}
          >
            {filtro.label}
          </button>
        ))}
      </div>

      {venta.error && (
        <div className="pos-inline-error">
          {venta.error}
        </div>
      )}

      {venta.cargandoCatalogos ? (
        <div className="catalog-empty">
          Consultando catálogo...
        </div>
      ) : venta.elementosFiltrados.length === 0 ? (
        <div className="catalog-empty">
          No se encontraron resultados.
        </div>
      ) : (
        <div className="catalog-grid">
          {venta.elementosFiltrados.map((item) => (
            <article
              className="product-card"
              key={`${item.tipo}-${item.id}`}
            >
              <div className="product-card-top">
                <span
                  className={`type-badge ${item.tipo.toLowerCase()}`}
                >
                  {iconoTipo(item.tipo)}
                  {item.tipo}
                </span>

                {item.tipo === "PRODUCTO" && (
                  <span
                    className={`stock-badge ${
                      Number(item.stockActual || 0) <= 0
                        ? "empty"
                        : ""
                    }`}
                  >
                    Stock {item.stockActual ?? 0}
                  </span>
                )}
              </div>

              <div className="product-card-body">
                <small>{item.codigo || "Sin código"}</small>
                <h3>{item.nombre}</h3>

                <p>
                  {item.descripcion ||
                    (item.tipo === "ORDEN"
                      ? `Cliente: ${
                          item.clienteNombre || "Sin cliente"
                        }`
                      : "Sin descripción")}
                </p>
              </div>

              <div className="product-card-footer">
                <strong>
                  $
                  {Number(
                    item.precioMostrar ??
                      item.precioVenta ??
                      0,
                  ).toFixed(2)}
                </strong>

                <button
                  type="button"
                  className="add-item-button"
                  title="Agregar"
                  disabled={
                    item.tipo === "PRODUCTO" &&
                    Number(item.stockActual || 0) <= 0
                  }
                  onClick={() => venta.seleccionarElemento(item)}
                >
                  <FaPlus />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}