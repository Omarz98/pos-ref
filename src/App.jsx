import "./App.css";
import { useState } from "react";

function App() {
  const productos = [
    { codigo: "REF-001", nombre: "Aceite 4T 20W50", categoria: "Lubricantes", stock: 18, precio: 165 },
    { codigo: "REF-002", nombre: "Bujía NGK", categoria: "Encendido", stock: 35, precio: 85 },
    { codigo: "REF-003", nombre: "Balatas delanteras", categoria: "Frenos", stock: 12, precio: 240 },
    { codigo: "REF-004", nombre: "Filtro de aire Italika", categoria: "Filtros", stock: 9, precio: 130 },
  ];

  const ordenesTaller = [
    { moto: "Italika FT150", cliente: "Carlos Pérez", estado: "En reparación", total: 850 },
    { moto: "Honda Cargo 150", cliente: "Luis Gómez", estado: "Pendiente", total: 420 },
  ];

  const [theme, setTheme] = useState("light");

  const cambiarTema = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };


  return (
    <div className="app" data-theme={theme}>
      <aside className="sidebar">
        <h2> POSREF</h2>

        <nav>
          <a className="active">Punto de venta</a>
          <a>Productos</a>
          <a>Inventario</a>
          <a>Taller</a>
          <a>Clientes</a>
          <a>Reportes</a>
          <a>Configuración</a>
        </nav>
      </aside>

      <main className="main">
        <header className="header">
          <div>
            <h1>Punto de venta</h1>
            <p>Refaccionaria y taller de motocicletas</p>
          </div>

          <div className="header-actions">
            <button className="theme-btn" onClick={cambiarTema}>
              {theme === "light" ? "Modo oscuro" : "Modo claro"}
            </button>

          <button className="primary-btn">Nueva venta</button>
          </div>
        </header>
        
        <section className="cards">
          <div className="card">
            <span>Ventas hoy</span>
            <h3>$8,450.00</h3>
          </div>

          <div className="card">
            <span>Órdenes taller</span>
            <h3>12</h3>
          </div>

          <div className="card">
            <span>Productos bajos</span>
            <h3>7</h3>
          </div>

          <div className="card">
            <span>Servicios pendientes</span>
            <h3>4</h3>
          </div>
        </section>

        <section className="content">
          <div className="products-panel">
            <div className="panel-header">
              <h2>Buscar refacción</h2>
              <input placeholder="Buscar por código, nombre o código de barras..." />
            </div>
            <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th>Stock</th>
                  <th>Precio</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {productos.map((p) => (
                  <tr key={p.codigo}>
                    <td>{p.codigo}</td>
                    <td>{p.nombre}</td>
                    <td>{p.categoria}</td>
                    <td>
                      <span className={p.stock <= 10 ? "stock low" : "stock"}>
                        {p.stock}
                      </span>
                    </td>
                    <td>${p.precio.toFixed(2)}</td>
                    <td>
                      <button className="small-btn">Agregar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>

          <aside className="cart-panel">
            <h2>Venta actual</h2>

            <div className="cart-item">
              <div>
                <strong>Aceite 4T 20W50</strong>
                <p>1 x $165.00</p>
              </div>
              <span>$165.00</span>
            </div>

            <div className="cart-item">
              <div>
                <strong>Bujía NGK</strong>
                <p>2 x $85.00</p>
              </div>
              <span>$170.00</span>
            </div>

            <div className="totals">
              <div>
                <span>Subtotal</span>
                <strong>$335.00</strong>
              </div>
              <div>
                <span>IVA</span>
                <strong>$53.60</strong>
              </div>
              <div className="total">
                <span>Total</span>
                <strong>$388.60</strong>
              </div>
            </div>

            <button className="pay-btn">Cobrar venta</button>
          </aside>
        </section>

        <section className="workshop">
          <h2>Órdenes de taller</h2>

          <div className="orders">
            {ordenesTaller.map((o, index) => (
              <div className="order-card" key={index}>
                <div>
                  <h3>{o.moto}</h3>
                  <p>{o.cliente}</p>
                </div>

                <span>{o.estado}</span>
                <strong>${o.total.toFixed(2)}</strong>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;