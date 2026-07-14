import { useEffect, useState } from "react";
import FormCard from "../components/FormCard";
import DataTable from "../components/DataTable";
import { FaEdit, FaTrash } from "react-icons/fa";
import { MdAddShoppingCart } from "react-icons/md";
export function PuntoVenta() {
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [showCobroModal, setShowCobroModal] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [clienteId, setClienteId] = useState("");
  const [servicios, setServicios] = useState([]);

  useEffect(() => {
    fetchProductos();
    fetchClientes();
    fetchServicios();
  }, []);

  /*const [servicios, setServicio] = useState([
    {
      id: 1,
      codigo: "SERV-001",
      nombre: "Cambio de aceite",
      precioVenta: 150,
      activo: true,
    },
    {
      id: 2,
      codigo: "SERV-002",
      nombre: "Cambio de balatas",
      precioVenta: 250,
      activo: true,
    },
    {
      id: 3,
      codigo: "SERV-003",
      nombre: "Afinación básica",
      precioVenta: 350,
      activo: true,
    },
  ]);*/

  const [pagos, setPagos] = useState([
    {
      metodo: "EFECTIVO",
      monto: 0,
    },
  ]);

  const agregarMetodoPago = () => {
    setPagos([
      ...pagos,
      {
        metodo: "EFECTIVO",
        monto: 0,
      },
    ]);
  };

  const eliminarMetodoPago = (index) => {
    if (pagos.length === 1) {
      alert("Debe existir al menos un método de pago");
      return;
    }

    setPagos(pagos.filter((_, i) => i !== index));
  };

  /*const productos = [
    {
      codigo: "REF-001",
      nombre: "Aceite 4T 20W50",
      categoria: "Lubricantes",
      stock: 18,
      precio: 165,
    },
    {
      codigo: "REF-002",
      nombre: "Bujía NGK",
      categoria: "Encendido",
      stock: 35,
      precio: 85,
    },
    {
      codigo: "REF-003",
      nombre: "Balatas delanteras",
      categoria: "Frenos",
      stock: 12,
      precio: 240,
    },
    {
      codigo: "REF-004",
      nombre: "Filtro de aire Italika",
      categoria: "Filtros",
      stock: 9,
      precio: 130,
    },
  ];*/

  const fetchProductos = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/productos");
      const data = await response.json();
      setProductos(data);
    } catch (error) {
      console.error("Error al obtener prosuctos", error);
    }
  };
  const fetchClientes = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/clientes");
      const data = await response.json();
      setClientes(data);
    } catch (error) {
      console.error("Error al obtener clientes", error);
    }
  };

  const fetchServicios = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/servicios");
      const data = await response.json();
      setServicios(data);
    } catch (error) {
      console.error("Error al obtener clientes", error);
    }
  };

  /*const serviciosMap = Object.fromEntries(
    servicios.map((s) => [s.id, s.nombre]),
  );*/

  /*const productosYServiciosTabla = productos.map((producto) => ({
    
    ...producto,
    ...servicios,
  }));*/
  const productosYServiciosTabla = [
    ...productos.map((p) => ({
      ...p,
      tipo: "PRODUCTO",
    })),

    ...servicios.map((s) => ({
      ...s,
      tipo: "SERVICIO",
    })),
  ];

  const productosFiltrados = productosYServiciosTabla.filter(
    (producto) =>
      producto.activo &&
      (producto.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        producto.codigo.toLowerCase().includes(busqueda.toLowerCase())),
  );

  const agregarProducto = (producto) => {
   
    const existe = carrito.find(
      (item) => item.id === producto.codigo && item.tipo === "PRODUCTO",
    );
    if (existe) {
      
      if (existe.cantidad >= producto.stock) {
        alert(`Solo hay ${producto.stock} unidades disponibles`);
        return;
      }

      setCarrito(
        carrito.map((item) =>
          item.id === producto.codigo
            ? { ...item, cantidad: item.cantidad + 1 }
            : item,
        ),
      );
    } else {
      if (producto.stock <= 0) {
        alert("Producto sin existencias");
        return;
      }

      setCarrito([
        ...carrito,
        {
          id: producto.codigo,
          tipo: producto.tipo,
          nombre: producto.nombre,
          cantidad: 1,
          precio: Number(producto.precioVenta),
        },
      ]);
    }
    
  };

  const agregarServicio = (servicio) => {
    setCarrito([
      ...carrito,
      {
        id: servicio.id,
        tipo: "SERVICIO",
        nombre: servicio.nombre,
        cantidad: 1,
        precio: Number(servicio.precioVenta),
      },
    ]);
  };

  const aumentarCantidad = (itemCarrito) => {
    const producto = productos.find((p) => p.codigo === itemCarrito.id);

    if (
      itemCarrito.tipo === "PRODUCTO" &&
      producto &&
      itemCarrito.cantidad >= producto.stock
    ) {
      alert(`Solo hay ${producto.stock} piezas disponibles`);
      return;
    }

    setCarrito(
      carrito.map((item) =>
        item.id === itemCarrito.id
          ? { ...item, cantidad: item.cantidad + 1 }
          : item,
      ),
    );
  };

  const disminuirCantidad = (itemCarrito) => {
    if (itemCarrito.cantidad === 1) {
      eliminarDelCarrito(itemCarrito.id);
      return;
    }

    setCarrito(
      carrito.map((item) =>
        item.id === itemCarrito.id
          ? { ...item, cantidad: item.cantidad - 1 }
          : item,
      ),
    );
  };

  const eliminarDelCarrito = (id) => {
    setCarrito(carrito.filter((item) => item.id !== id));
  };

  const subtotal = carrito.reduce(
    (acc, item) => acc + item.cantidad * item.precio,
    0,
  );

  const iva = subtotal * 0.16;
  const total = subtotal;

  const totalPagado = pagos.reduce(
    (acc, pago) => acc + Number(pago.monto || 0),
    0,
  );

  const saldoPendiente = total - totalPagado;

  const efectivoPagado = pagos
    .filter((p) => p.metodo === "EFECTIVO")
    .reduce((acc, p) => acc + Number(p.monto || 0), 0);

  const cambio =
    saldoPendiente < 0 && efectivoPagado > 0 ? Math.abs(saldoPendiente) : 0;

  const cobrarVenta = async () => {
    if (carrito.length === 0) {
      alert("Agrega productos o servicios a la venta");
      return;
    }

    const venta = {
      items: carrito,

      subtotal,
      iva,
      total,
      clienteId,
      pagos,

      totalPagado,

      saldoPendiente,

      estado: saldoPendiente <= 0 ? "PAGADA" : "PENDIENTE",
    };

    /*console.log(JSON.stringify(venta, null, 2));*/

    try {
      const response = await fetch("http://localhost:8080/api/ventas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(venta),
      });

      if (!response.ok) {
        throw new Error("Error al registrar venta");
      }

      alert("Venta registrada correctamente");

      setCarrito([]);

      setPagos([
        {
          metodo: "EFECTIVO",
          monto: 0,
        },
      ]);
      setShowCobroModal(false);
      setBusqueda("");
    } catch (error) {
      console.error(error);
      alert("Error al registrar venta");
    }
  };

  const columns = [
    { key: "codigo", label: "NIC" },
    { key: "nombre", label: "Nombre" },
    { key: "precioVenta", label: "Precio Venta" },
    { key: "stock", label: "Stock" },
  ];

  const actions = [
    {
      icon: <MdAddShoppingCart />,
      title: "Agregar a carrito",
      className: "btn-action btn-edit",
      onClick: agregarProducto,
    },
  ];
  return (
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
        <section className="content-table-productos">
          <DataTable
            title="Buscar Refaccion o Servicio"
            searchPlaceholder="Buscar Productos..."
            searchValue={busqueda}
            onSearchChange={setBusqueda}
            columns={columns}
            data={productosFiltrados}
            actions={actions}
          />
        </section>

        <aside className="cart-panel">
          <h2>Venta actual</h2>

          {carrito.map((c) => (
            <div key={c.id} className="cart-item">
              <div>
                <strong>{c.nombre}</strong>

                <p>
                  {c.cantidad} x ${c.precio.toFixed(2)}
                </p>

                <div className="cart-actions">
                  <button
                    className="btn-minus"
                    title="Quitar"
                    onClick={() => disminuirCantidad(c)}
                  >
                    -
                  </button>

                  <span>{c.cantidad}</span>

                  <button
                    className="btn-plus"
                    title="Agregar"
                    onClick={() => aumentarCantidad(c)}
                  >
                    +
                  </button>

                  <button
                    className="btn-delete-cart"
                    title="Borrar"
                    onClick={() => eliminarDelCarrito(c.id)}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>

              <span>${(c.cantidad * c.precio).toFixed(2)}</span>
            </div>
          ))}

          <div className="totals">
            <div>
              <span>Subtotal</span>
              <strong>${subtotal.toFixed(2)}</strong>
            </div>

            <div>
              <span>IVA</span>
              <strong>${iva.toFixed(2)}</strong>
            </div>

            <div className="total">
              <span>Total</span>
              <strong>${total.toFixed(2)}</strong>
            </div>
          </div>

          <button className="pay-btn" onClick={() => setShowCobroModal(true)}>
            Cobrar venta
          </button>
        </aside>
        {showCobroModal && (
          <div
            className="modal-overlay"
            onClick={() => setShowCobroModal(false)}
          >
            <div className="modal-cobro" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Cobrar venta</h2>

                <button
                  className="close-btn"
                  onClick={() => setShowCobroModal(false)}
                >
                  ✕
                </button>
              </div>

              <div className="modal-body">
                <div className="summary">
                  <div>
                    <span>Subtotal</span>
                    <strong>${subtotal.toFixed(2)}</strong>
                  </div>

                  <div>
                    <span>IVA</span>
                    <strong>${iva.toFixed(2)}</strong>
                  </div>

                  <div className="grand-total">
                    <span>Total</span>
                    <strong>${total.toFixed(2)}</strong>
                  </div>
                </div>

                <h3>Métodos de pago</h3>

                {pagos.map((pago, index) => (
                  <div key={index} className="payment-row">
                    <select
                      value={pago.metodo}
                      onChange={(e) => {
                        const nuevos = [...pagos];
                        nuevos[index].metodo = e.target.value;
                        setPagos(nuevos);
                      }}
                    >
                      <option value="EFECTIVO">Efectivo</option>
                      <option value="TARJETA">Tarjeta</option>
                      <option value="TRANSFERENCIA">Transferencia</option>
                    </select>

                    <input
                      type="number"
                      min="0"
                      placeholder="Monto"
                      value={pago.monto}
                      onChange={(e) => {
                        const nuevos = [...pagos];
                        nuevos[index].monto = Number(e.target.value);
                        setPagos(nuevos);
                      }}
                    />

                    <button
                      type="button"
                      className="remove-payment-btn"
                      onClick={() => eliminarMetodoPago(index)}
                      disabled={pagos.length === 1}
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}

                <button className="add-payment-btn" onClick={agregarMetodoPago}>
                  + Agregar método de pago
                </button>

                <div className="payment-summary">
                  <div>
                    <span>Total pagado</span>
                    <strong>${totalPagado.toFixed(2)}</strong>
                  </div>

                  {saldoPendiente > 0 ? (
                    <div className="pending">
                      <span>Saldo pendiente</span>

                      <strong>${saldoPendiente.toFixed(2)}</strong>
                    </div>
                  ) : (
                    <div className="change">
                      <span>Cambio</span>

                      <strong>${cambio.toFixed(2)}</strong>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Cliente</label>

                <select
                  value={clienteId}
                  onChange={(e) => setClienteId(e.target.value)}
                  className="form-select"
                >
                  <option value="">Selecciona una cliente</option>

                  {clientes.map((cliente) => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-footer">
                <button
                  className="secondary-btn"
                  onClick={() => setShowCobroModal(false)}
                >
                  Cancelar
                </button>

                <button className="confirm-btn" onClick={cobrarVenta}>
                  Confirmar cobro
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
