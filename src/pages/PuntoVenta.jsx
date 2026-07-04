export function PuntoVenta(){

    const productos = [
        { codigo: "REF-001", nombre: "Aceite 4T 20W50", categoria: "Lubricantes", stock: 18, precio: 165 },
        { codigo: "REF-002", nombre: "Bujía NGK", categoria: "Encendido", stock: 35, precio: 85 },
        { codigo: "REF-003", nombre: "Balatas delanteras", categoria: "Frenos", stock: 12, precio: 240 },
        { codigo: "REF-004", nombre: "Filtro de aire Italika", categoria: "Filtros", stock: 9, precio: 130 },
        
      ];
    
      

    return(
        <>
        <header className="header">
          <div>
            <h1>Punto de venta</h1>
            <p>Refaccionaria y taller de motocicletas</p>
          </div>

          <div className="header-actions">
            

          <button className="primary-btn">Nueva venta</button>
          </div>
        </header>        

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

        
        </>
    );

}