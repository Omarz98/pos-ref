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
  const [ordenes, setOrdenes] = useState([]);
  const [ordenSeleccionada, setOrdenSeleccionada] = useState(null);

  useEffect(() => {
    fetchProductos();
    fetchClientes();
    fetchServicios();
    fetchOrdenesPendientes();
  }, []);

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

  const fetchOrdenesPendientes = async () => {
    try {
      const response = await fetch(
        "http://localhost:8080/api/ordenes-taller/pendientes",
      );

      if (!response.ok) {
        throw new Error("No fue posible obtener las órdenes pendientes");
      }

      const data = await response.json();
      setOrdenes(data);
    } catch (error) {
      console.error("Error al obtener órdenes de servicio:", error);
    }
  };

  /*const serviciosMap = Object.fromEntries(
    servicios.map((s) => [s.id, s.nombre]),
  );*/

  /*const productosYServiciosTabla = productos.map((producto) => ({
    
    ...producto,
    ...servicios,
  }));*/
  /*const productosYServiciosTabla = [
    ...productos.map((p) => ({
      ...p,
      tipo: "PRODUCTO",
    })),

    ...servicios.map((s) => ({
      ...s,
      tipo: "SERVICIO",
    })),
  ];*/

  const elementosPOS = [
    ...productos.map((producto) => ({
      ...producto,
      tipo: "PRODUCTO",
      precioMostrar: Number(producto.precioVenta || 0),
    })),

    ...servicios.map((servicio) => ({
      ...servicio,
      tipo: "SERVICIO",
      codigo: servicio.codigo || `SERV-${servicio.id}`,
      precioMostrar: Number(servicio.precioVenta || 0),
      stockActual: null,
    })),

    ...ordenes.map((orden) => ({
      ...orden,
      tipo: "ORDEN",
      folio: orden.folio,
      nombre: `Orden ${orden.folio} - ${orden.clienteNombre || "Cliente"}`,
      precioVenta: Number(
        orden.saldoPendiente != null ? orden.saldoPendiente : orden.total || 0,
      ),
      precioMostrar: Number(
        orden.saldoPendiente != null ? orden.saldoPendiente : orden.total || 0,
      ),
      stockActual: null,
      activo: true,
    })),
  ];
  /*const productosFiltrados = productosYServiciosTabla.filter(
    (producto) =>
      producto.activo &&
      (producto.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        producto.codigo.toLowerCase().includes(busqueda.toLowerCase())),
  );*/
  const elementosFiltrados = elementosPOS.filter((elemento) => {
    const texto = busqueda.trim().toLowerCase();

    if (!elemento.activo) {
      return false;
    }

    if (!texto) {
      return true;
    }

    const nombre = String(elemento.nombre || "").toLowerCase();
    const codigo = String(elemento.codigo || "").toLowerCase();
    const numeroOrden = String(elemento.numeroOrden || "").toLowerCase();
    const clienteNombre = String(elemento.clienteNombre || "").toLowerCase();

    return (
      nombre.includes(texto) ||
      codigo.includes(texto) ||
      numeroOrden.includes(texto) ||
      clienteNombre.includes(texto)
    );
  });

  const agregarProducto = (producto) => {
    const existe = carrito.find(
      (item) => item.id === producto.codigo && item.tipo === "PRODUCTO",
    );
    if (existe) {
      if (existe.cantidad >= producto.stockActual) {
        alert(`Solo hay ${producto.stockActual} unidades disponibles`);
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
      if (producto.stockActual <= 0) {
        alert("Producto sin existencias");
        return;
      }

      setCarrito([
        ...carrito,
        {
          id: producto.id,
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

  const cargarOrdenEnCarrito = (orden) => {
    const servicios = Array.isArray(orden.servicios) ? orden.servicios : [];

    const productos = Array.isArray(orden.productos) ? orden.productos : [];

    if (servicios.length === 0 && productos.length === 0) {
      alert("La orden no contiene productos o servicios");
      return;
    }

    if (carrito.length > 0) {
      const reemplazar = window.confirm(
        "La venta actual contiene elementos. ¿Deseas reemplazarla con la orden?",
      );

      if (!reemplazar) {
        return;
      }
    }

    const serviciosCarrito = servicios.map((servicio) => ({
      id: `SERVICIO-${servicio.servicioId ?? servicio.id}`,

      detalleOrdenId: servicio.id,

      productoId: null,

      servicioId: servicio.servicioId ?? servicio.id,

      codigo: servicio.codigo ?? "",

      tipo: "SERVICIO",

      nombre:
        servicio.nombre ?? servicio.servicioNombre ?? "Servicio sin nombre",

      cantidad: Number(servicio.cantidad ?? 1),

      precio: Number(servicio.precioUnitario ?? servicio.precio ?? 0),

      origenOrden: true,
    }));

    const productosCarrito = productos.map((producto) => ({
      id: `PRODUCTO-${producto.productoId ?? producto.id}`,

      detalleOrdenId: producto.id,

      productoId: producto.productoId ?? producto.id,

      servicioId: null,

      codigo: producto.codigo ?? "",

      tipo: "PRODUCTO",

      nombre:
        producto.nombre ?? producto.productoNombre ?? "Producto sin nombre",

      cantidad: Number(producto.cantidad ?? 1),

      precio: Number(producto.precioUnitario ?? producto.precio ?? 0),

      origenOrden: true,
    }));

    const elementosCarrito = [...serviciosCarrito, ...productosCarrito];

    setCarrito(elementosCarrito);
    setOrdenSeleccionada(orden);
    setClienteId(String(orden.clienteId ?? ""));

    setPagos([
      {
        metodo: "EFECTIVO",
        monto: Number(orden.saldoPendiente ?? orden.total ?? 0),
      },
    ]);

    setBusqueda("");
  };

  const seleccionarElemento = (elemento) => {
    switch (elemento.tipo) {
      case "PRODUCTO":
        agregarProducto(elemento);
        break;

      case "SERVICIO":
        agregarServicio(elemento);
        break;

      case "ORDEN":
        cargarOrdenEnCarrito(elemento);
        break;

      default:
        console.warn("Tipo de elemento desconocido:", elemento.tipo);
    }
  };

  const aumentarCantidad = (itemCarrito) => {
    const producto = productos.find((p) => p.codigo === itemCarrito.id);

    if (
      itemCarrito.tipo === "PRODUCTO" &&
      producto &&
      itemCarrito.cantidad >= producto.stockActual
    ) {
      alert(`Solo hay ${producto.stockActual} piezas disponibles`);
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

  const total = carrito.reduce(
    (acc, item) => acc + item.cantidad * item.precio,
    0,
  );

  const subtotal = total / 1.16;
  const iva = total - subtotal;

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

    /*const venta = {
      items: carrito,

      subtotal,
      iva,
      total,
      clienteId,
      pagos,

      totalPagado,

      saldoPendiente,

      estado: saldoPendiente <= 0 ? "PAGADA" : "PENDIENTE",
    };*/
    const venta = {
      ordenServicioId: ordenSeleccionada?.id || null,

      clienteId: clienteId ? Number(clienteId) : null,

      items: carrito.map((item) => ({
        productoId: item.productoId || null,
        servicioId: item.servicioId || null,
        detalleOrdenId: item.detalleOrdenId || null,
        codigo: item.codigo || item.id,
        tipo: item.tipo,
        nombre: item.nombre,
        cantidad: Number(item.cantidad),
        precio: Number(item.precio),
      })),

      subtotal: Number(subtotal.toFixed(2)),
      iva: Number(iva.toFixed(2)),
      total: Number(total.toFixed(2)),

      pagos: pagos.map((pago) => ({
        metodo: pago.metodo,
        monto: Number(pago.monto || 0),
      })),

      totalPagado: Number(totalPagado.toFixed(2)),

      saldoPendiente: Number(Math.max(saldoPendiente, 0).toFixed(2)),

      estado: saldoPendiente <= 0 ? "PAGADA" : "PENDIENTE",
    };

    /*console.log(JSON.stringify(venta, null, 2));*/
    console.log(venta);

    try {
      const response = await fetch("http://localhost:8080/api/ventas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(venta),
      });

      if (!response.ok) {
        const mensaje = await response.text();
        throw new Error(mensaje || "Error al registrar venta");
      }

      alert(
        ordenSeleccionada
          ? `Orden ${ordenSeleccionada.folio} cobrada correctamente`
          : "Venta registrada correctamente",
      );

      setCarrito([]);
      setOrdenSeleccionada(null);
      setClienteId("");

      setPagos([
        {
          metodo: "EFECTIVO",
          monto: 0,
        },
      ]);

      setShowCobroModal(false);
      setBusqueda("");

      await Promise.all([fetchProductos(), fetchOrdenesPendientes()]);
    } catch (error) {
      console.error(error);
      alert("Error al registrar venta");
    }
  };

  /*const columns = [
    { key: "codigo", label: "NIC" },
    { key: "nombre", label: "Nombre" },
    { key: "precioVenta", label: "Precio Venta" },
    { key: "stockActual", label: "Stock" },
  ];*/
  const columns = [
    {
      key: "codigo",
      label: "Código / Orden",
    },
    {
      key: "nombre",
      label: "Descripción",
    },
    {
      key: "tipo",
      label: "Tipo",
    },
    {
      key: "precioVenta",
      label: "Precio",
      render: (row) => `$${Number(row.precioVenta || 0).toFixed(2)}`,
    },
    {
      key: "stockActual",
      label: "Stock",
      render: (row) => (row.tipo === "PRODUCTO" ? row.stockActual : "N/A"),
    },
  ];

  /*const actions = [
    {
      icon: <MdAddShoppingCart />,
      title: "Agregar a carrito",
      className: "btn-action btn-edit",
      onClick: agregarProducto,
    },
  ];*/
  const actions = [
    {
      icon: <MdAddShoppingCart />,
      title: "Agregar o cargar",
      className: "btn-action btn-edit",
      onClick: seleccionarElemento,
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
            title="Buscar refacción, servicio u orden"
            searchPlaceholder="Buscar por código, nombre o número de orden..."
            searchValue={busqueda}
            onSearchChange={setBusqueda}
            columns={columns}
            data={elementosFiltrados}
            actions={actions}
          />
        </section>

        <aside className="cart-panel">
          {ordenSeleccionada && (
            <div className="selected-order">
              <div>
                <span>Orden de servicio</span>
                <strong>{ordenSeleccionada.folio}</strong>
              </div>

              <div>
                <span>Cliente</span>
                <strong>{ordenSeleccionada.clienteNombre}</strong>
              </div>

              <button
                type="button"
                className="secondary-btn"
                onClick={() => {
                  setOrdenSeleccionada(null);
                  setCarrito([]);
                  setClienteId("");
                }}
              >
                Quitar orden
              </button>
            </div>
          )}
          <h2>Venta actual</h2>

          {carrito.map((c) => (
            <div key={c.id} className="cart-item">
              <div>
                <strong>{c.nombre}</strong>

                <p>
                  {c.cantidad} x ${c.precio.toFixed(2)}
                </p>
                {!ordenSeleccionada && (
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
                )}
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
                    <button
                      type="button"
                      title="Agregar metodo de pago"
                      className="add-payment-btn"
                      onClick={agregarMetodoPago}
                    >
                      +
                    </button>
                  </div>
                ))}

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
                  disabled={clienteId}
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
