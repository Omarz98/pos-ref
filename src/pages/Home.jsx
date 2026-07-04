export function Home(){
    const ordenesTaller = [
        { moto: "Italika FT150", cliente: "Carlos Pérez", estado: "En reparación", total: 850 },
        { moto: "Honda Cargo 150", cliente: "Luis Gómez", estado: "Pendiente", total: 420 },
      ];
    return(
        <>
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
    </>
        
    );
}