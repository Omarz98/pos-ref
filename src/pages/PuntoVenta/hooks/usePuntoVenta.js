import { useEffect, useMemo, useState } from "react";
import api from "../../../services/api";

const pagoInicial = () => ({
  metodo: "EFECTIVO",
  monto: 0,
});

export function usePuntoVenta({ caja, onVentaRegistrada }) {
  const [productos, setProductos] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [ordenes, setOrdenes] = useState([]);
  const [clientes, setClientes] = useState([]);

  const [carrito, setCarrito] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("TODOS");
  const [clienteId, setClienteId] = useState("");
  const [ordenSeleccionada, setOrdenSeleccionada] = useState(null);
  const [pagos, setPagos] = useState([pagoInicial()]);

  const [cargandoCatalogos, setCargandoCatalogos] = useState(true);
  const [procesandoVenta, setProcesandoVenta] = useState(false);
  const [error, setError] = useState("");

  const cargarCatalogos = async () => {
    setCargandoCatalogos(true);
    setError("");

    try {
      const [
        clientesResponse,
        serviciosResponse,
        productosResponse,
        ordenesPendientesResponse,
      ] = await Promise.all([
        api.get("/clientes"),
        api.get("/servicios"),
        api.get("/productos"),
        api.get("/ordenes-taller/pendientes"),
      ]);

      setClientes(
        (clientesResponse.data ?? []).filter(
          (item) => item.activo !== false,
        ),
      );

      setServicios(
        (serviciosResponse.data ?? []).filter(
          (item) => item.activo !== false,
        ),
      );

      setProductos(
        (productosResponse.data ?? []).filter(
          (item) => item.activo !== false,
        ),
      );

      setOrdenes(ordenesPendientesResponse.data ?? []);
    } catch (exception) {
      console.error("Error cargando catálogos:", exception);

      if (exception.response?.status === 401) {
        setError("La sesión expiró. Inicia sesión nuevamente.");
      } else if (exception.response?.status === 403) {
        setError("No tienes permiso para consultar uno de los catálogos.");
      } else {
        setError(
          exception.response?.data?.message ||
            "No fue posible cargar los catálogos",
        );
      }
    } finally {
      setCargandoCatalogos(false);
    }
  };

  useEffect(() => {
    cargarCatalogos();
  }, []);

  const elementosPOS = useMemo(
    () => [
      ...productos.map((producto) => ({
        ...producto,
        tipo: "PRODUCTO",
        precioMostrar: Number(producto.precioVenta || 0),
      })),

      ...servicios.map((servicio) => ({
        ...servicio,
        tipo: "SERVICIO",
        codigo: servicio.codigo || `SERV-${servicio.id}`,
        precioVenta: Number(servicio.precioVenta || 0),
        precioMostrar: Number(servicio.precioVenta || 0),
        stockActual: null,
      })),

      ...ordenes.map((orden) => ({
        ...orden,
        tipo: "ORDEN",
        codigo: orden.folio || orden.numeroOrden || `ORD-${orden.id}`,
        nombre: `Orden ${orden.folio || orden.numeroOrden || orden.id} - ${
          orden.clienteNombre || "Cliente"
        }`,
        precioVenta: Number(
          orden.saldoPendiente != null
            ? orden.saldoPendiente
            : orden.total || 0,
        ),
        precioMostrar: Number(
          orden.saldoPendiente != null
            ? orden.saldoPendiente
            : orden.total || 0,
        ),
        stockActual: null,
        activo: true,
      })),
    ],
    [productos, servicios, ordenes],
  );

  const elementosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return elementosPOS.filter((elemento) => {
      if (elemento.activo === false) return false;

      if (
        filtroTipo !== "TODOS" &&
        elemento.tipo !== filtroTipo
      ) {
        return false;
      }

      if (!texto) return true;

      return [
        elemento.nombre,
        elemento.descripcion,
        elemento.codigo,
        elemento.numeroOrden,
        elemento.folio,
        elemento.clienteNombre,
      ]
        .map((value) => String(value || "").toLowerCase())
        .some((value) => value.includes(texto));
    });
  }, [elementosPOS, busqueda, filtroTipo]);

  const agregarProducto = (producto) => {
    if (Number(producto.stockActual || 0) <= 0) {
      setError("Producto sin existencias");
      return;
    }

    setError("");

    setCarrito((actual) => {
      const indice = actual.findIndex(
        (item) =>
          item.productoId === producto.id &&
          item.tipo === "PRODUCTO",
      );

      if (indice >= 0) {
        const existente = actual[indice];

        if (
          existente.cantidad >=
          Number(producto.stockActual || 0)
        ) {
          setError(
            `Solo hay ${producto.stockActual} unidades disponibles`,
          );
          return actual;
        }

        return actual.map((item, i) =>
          i === indice
            ? { ...item, cantidad: item.cantidad + 1 }
            : item,
        );
      }

      return [
        ...actual,
        {
          id: `PRODUCTO-${producto.id}`,
          codigo: producto.codigo || "",
          productoId: producto.id,
          servicioId: null,
          detalleOrdenId: null,
          tipo: "PRODUCTO",
          nombre: producto.nombre,
          cantidad: 1,
          precio: Number(producto.precioVenta || 0),
        },
      ];
    });
  };

  const agregarServicio = (servicio) => {
    setError("");

    setCarrito((actual) => {
      const indice = actual.findIndex(
        (item) =>
          item.servicioId === servicio.id &&
          item.tipo === "SERVICIO" &&
          !item.origenOrden,
      );

      if (indice >= 0) {
        return actual.map((item, i) =>
          i === indice
            ? { ...item, cantidad: item.cantidad + 1 }
            : item,
        );
      }

      return [
        ...actual,
        {
          id: `SERVICIO-${servicio.id}`,
          codigo: servicio.codigo || `SERV-${servicio.id}`,
          productoId: null,
          servicioId: servicio.id,
          detalleOrdenId: null,
          tipo: "SERVICIO",
          nombre: servicio.nombre,
          cantidad: 1,
          precio: Number(servicio.precioVenta || 0),
        },
      ];
    });
  };

  const cargarOrdenEnCarrito = (orden) => {
    const serviciosOrden = Array.isArray(orden.servicios)
      ? orden.servicios
      : [];

    const productosOrden = Array.isArray(orden.productos)
      ? orden.productos
      : [];

    if (
      serviciosOrden.length === 0 &&
      productosOrden.length === 0
    ) {
      setError("La orden no contiene productos o servicios");
      return;
    }

    if (carrito.length > 0) {
      const reemplazar = window.confirm(
        "La venta actual contiene elementos. ¿Deseas reemplazarla con la orden?",
      );

      if (!reemplazar) return;
    }

    const serviciosCarrito = serviciosOrden.map((servicio) => ({
      id: `SERVICIO-ORDEN-${servicio.id}`,
      detalleOrdenId: servicio.id,
      productoId: null,
      servicioId: servicio.servicioId ?? servicio.id,
      codigo: servicio.codigo ?? "",
      tipo: "SERVICIO",
      nombre:
        servicio.nombre ??
        servicio.servicioNombre ??
        "Servicio sin nombre",
      cantidad: Number(servicio.cantidad ?? 1),
      precio: Number(
        servicio.precioUnitario ?? servicio.precio ?? 0,
      ),
      origenOrden: true,
    }));

    const productosCarrito = productosOrden.map((producto) => ({
      id: `PRODUCTO-ORDEN-${producto.id}`,
      detalleOrdenId: producto.id,
      productoId: producto.productoId ?? producto.id,
      servicioId: null,
      codigo: producto.codigo ?? "",
      tipo: "PRODUCTO",
      nombre:
        producto.nombre ??
        producto.productoNombre ??
        "Producto sin nombre",
      cantidad: Number(producto.cantidad ?? 1),
      precio: Number(
        producto.precioUnitario ?? producto.precio ?? 0,
      ),
      origenOrden: true,
    }));

    setCarrito([...serviciosCarrito, ...productosCarrito]);
    setOrdenSeleccionada(orden);
    setClienteId(String(orden.clienteId ?? ""));

    setPagos([
      {
        metodo: "EFECTIVO",
        monto: Number(
          orden.saldoPendiente ?? 0,
        ),
      },
    ]);

    setBusqueda("");
    setError("");
  };

  const seleccionarElemento = (elemento) => {
    if (elemento.tipo === "PRODUCTO") {
      agregarProducto(elemento);
      return;
    }

    if (elemento.tipo === "SERVICIO") {
      agregarServicio(elemento);
      return;
    }

    if (elemento.tipo === "ORDEN") {
      cargarOrdenEnCarrito(elemento);
    }
  };

  const aumentarCantidad = (itemCarrito) => {
    if (ordenSeleccionada) return;

    if (itemCarrito.tipo === "PRODUCTO") {
      const producto = productos.find(
        (p) => p.id === itemCarrito.productoId,
      );

      if (
        producto &&
        itemCarrito.cantidad >= Number(producto.stockActual)
      ) {
        setError(
          `Solo hay ${producto.stockActual} piezas disponibles`,
        );
        return;
      }
    }

    setCarrito((actual) =>
      actual.map((item) =>
        item.id === itemCarrito.id
          ? { ...item, cantidad: item.cantidad + 1 }
          : item,
      ),
    );
  };

  const disminuirCantidad = (itemCarrito) => {
    if (ordenSeleccionada) return;

    if (itemCarrito.cantidad <= 1) {
      eliminarDelCarrito(itemCarrito.id);
      return;
    }

    setCarrito((actual) =>
      actual.map((item) =>
        item.id === itemCarrito.id
          ? { ...item, cantidad: item.cantidad - 1 }
          : item,
      ),
    );
  };

  const eliminarDelCarrito = (id) => {
    if (ordenSeleccionada) return;

    setCarrito((actual) =>
      actual.filter((item) => item.id !== id),
    );
  };

  const quitarOrden = () => {
    setOrdenSeleccionada(null);
    setCarrito([]);
    setClienteId("");
    setPagos([pagoInicial()]);
  };

  const nuevaVenta = () => {
    setCarrito([]);
    setBusqueda("");
    setFiltroTipo("TODOS");
    setClienteId("");
    setOrdenSeleccionada(null);
    setPagos([pagoInicial()]);
    setError("");
  };

  const total = useMemo(
    () =>
      carrito.reduce(
        (acc, item) =>
          acc + Number(item.cantidad) * Number(item.precio),
        0,
      ),
    [carrito],
  );

  const subtotal = total / 1.16;
  const iva = total - subtotal;

  const totalPagado = useMemo(
    () =>
      pagos.reduce(
        (acc, pago) => acc + Number(pago.monto || 0),
        0,
      ),
    [pagos],
  );

  const saldoPendiente = total - totalPagado;

  const efectivoPagado = pagos
    .filter((pago) => pago.metodo === "EFECTIVO")
    .reduce(
      (acc, pago) => acc + Number(pago.monto || 0),
      0,
    );

  const cambio =
    saldoPendiente < 0 && efectivoPagado > 0
      ? Math.abs(saldoPendiente)
      : 0;

  const actualizarPago = (index, campo, valor) => {
    setPagos((actual) =>
      actual.map((pago, i) =>
        i === index
          ? {
              ...pago,
              [campo]:
                campo === "monto" ? Number(valor || 0) : valor,
            }
          : pago,
      ),
    );
  };

  const agregarMetodoPago = () => {
    setPagos((actual) => [...actual, pagoInicial()]);
  };

  const eliminarMetodoPago = (index) => {
    if (pagos.length === 1) return;

    setPagos((actual) =>
      actual.filter((_, i) => i !== index),
    );
  };

  const cobrarVenta = async () => {
  setError("");

  if (!caja || caja.estado === "CERRADA") {
    setError("Debes abrir la caja antes de registrar ventas");
    return false;
  }

  if (carrito.length === 0) {
    setError("Agrega productos o servicios a la venta");
    return false;
  }

  if (pagos.some((pago) => Number(pago.monto) < 0)) {
    setError("Los montos de pago no pueden ser negativos");
    return false;
  }

  const pagosValidos = pagos.filter(
    (pago) => Number(pago.monto || 0) > 0,
  );

  if (pagosValidos.length === 0) {
    setError("Captura al menos un pago mayor a cero");
    return false;
  }

  /*
   * El cajero puede capturar:
   *
   * Total:    $18
   * Efectivo: $20
   *
   * El ticket debe mostrar recibido $20 y cambio $2,
   * pero al backend solamente se aplican $18.
   */
  let exceso = Math.max(totalPagado - total, 0);

  const pagosNormalizados = pagosValidos
    .map((pago) => {
      let monto = Number(pago.monto || 0);

      if (exceso > 0 && pago.metodo === "EFECTIVO") {
        const descuento = Math.min(monto, exceso);

        monto -= descuento;
        exceso -= descuento;
      }

      return {
        metodo: pago.metodo,
        monto: Number(monto.toFixed(2)),
      };
    })
    .filter((pago) => pago.monto > 0);

  const totalAplicado = pagosNormalizados.reduce(
    (acc, pago) => acc + Number(pago.monto),
    0,
  );

  const saldoAplicado = Math.max(
    total - totalAplicado,
    0,
  );

  const ventaRequest = {
    ordenServicioId: ordenSeleccionada?.id || null,

    clienteId: clienteId ? Number(clienteId) : null,

    items: carrito.map((item) => ({
      productoId:
        item.productoId != null
          ? Number(item.productoId)
          : null,

      servicioId:
        item.servicioId != null
          ? Number(item.servicioId)
          : null,

      detalleOrdenId:
        item.detalleOrdenId != null
          ? Number(item.detalleOrdenId)
          : null,

      codigo: item.codigo || item.id,
      tipo: item.tipo,
      nombre: item.nombre,
      cantidad: Number(item.cantidad),
      precio: Number(item.precio),
    })),

    subtotal: Number(subtotal.toFixed(2)),
    iva: Number(iva.toFixed(2)),
    total: Number(total.toFixed(2)),

    pagos: pagosNormalizados,

    totalPagado: Number(totalAplicado.toFixed(2)),
    saldoPendiente: Number(saldoAplicado.toFixed(2)),

    estado:
      saldoAplicado <= 0 ? "PAGADA" : "PENDIENTE",
  };

  setProcesandoVenta(true);

  try {
    const response = await api.post(
      "/ventas",
      ventaRequest,
    );

    const ventaGuardada = response.data;

    /*
     * IMPORTANTE:
     * Creamos el ticket ANTES de ejecutar nuevaVenta(),
     * porque nuevaVenta() vacía carrito, cliente y pagos.
     */
    const clienteSeleccionado = clientes.find(
      (cliente) =>
        String(cliente.id) === String(clienteId),
    );

    const ticket = {
      id: ventaGuardada?.id,
      folio:
        ventaGuardada?.folio ||
        ventaGuardada?.numeroVenta ||
        ventaGuardada?.id,

      fecha:
        ventaGuardada?.fecha ||
        ventaGuardada?.fechaVenta ||
        ventaGuardada?.fechaCreacion ||
        new Date().toISOString(),

      cajaNombre:
        caja?.nombreCaja || "Caja 1",

      usuario:
        caja?.usuario || "Usuario",

      clienteId:
        clienteId ? Number(clienteId) : null,

      clienteNombre:
        ventaGuardada?.clienteNombre ||
        clienteSeleccionado?.nombre ||
        "Público general",

      ordenFolio:
        ordenSeleccionada?.folio ||
        ordenSeleccionada?.numeroOrden ||
        null,

      items: carrito.map((item) => ({
        id: item.id,
        codigo: item.codigo || "",
        tipo: item.tipo,
        nombre: item.nombre,
        cantidad: Number(item.cantidad),
        precio: Number(item.precio),
      })),

      subtotal: Number(subtotal.toFixed(2)),
      iva: Number(iva.toFixed(2)),
      total: Number(total.toFixed(2)),

      /*
       * Lo que físicamente entregó/pagó el cliente.
       * Esto sí incluye los $20 si debe recibir $2 de cambio.
       */
      pagosRecibidos: pagosValidos.map((pago) => ({
        metodo: pago.metodo,
        monto: Number(pago.monto || 0),
      })),

      /*
       * Lo que realmente quedó aplicado a la venta
       * y fue enviado al backend.
       */
      pagosAplicados: pagosNormalizados,

      totalRecibido: Number(totalPagado.toFixed(2)),
      totalAplicado: Number(totalAplicado.toFixed(2)),
      cambio: Number(cambio.toFixed(2)),
      saldoPendiente: Number(saldoAplicado.toFixed(2)),
      estado:
        saldoAplicado <= 0 ? "PAGADA" : "PENDIENTE",
    };

    nuevaVenta();

    await cargarCatalogos();

    if (onVentaRegistrada) {
      await onVentaRegistrada(ventaGuardada);
    }

    /*
     * Antes devolvíamos true.
     * Ahora devolvemos el objeto ticket.
     */
    return ticket;
  } catch (exception) {
    console.error(
      "Error registrando venta:",
      exception,
    );

    setError(
      exception.response?.data?.message ||
        exception.response?.data?.error ||
        (typeof exception.response?.data === "string"
          ? exception.response.data
          : null) ||
        exception.message ||
        "Error al registrar la venta",
    );

    return false;
  } finally {
    setProcesandoVenta(false);
  }
};

  return {
    productos,
    servicios,
    ordenes,
    clientes,
    carrito,
    busqueda,
    setBusqueda,
    filtroTipo,
    setFiltroTipo,
    clienteId,
    setClienteId,
    ordenSeleccionada,
    pagos,
    elementosFiltrados,
    cargandoCatalogos,
    procesandoVenta,
    error,
    setError,

    total,
    subtotal,
    iva,
    totalPagado,
    saldoPendiente,
    cambio,

    seleccionarElemento,
    aumentarCantidad,
    disminuirCantidad,
    eliminarDelCarrito,
    quitarOrden,
    nuevaVenta,

    actualizarPago,
    agregarMetodoPago,
    eliminarMetodoPago,
    cobrarVenta,
  };
}
