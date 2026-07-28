import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import "../styles/AgregarOrden.css";

const API_URL = "http://localhost:8080/api";

const crearDetalleServicio = () => ({
    servicioId: "",
    nombre: "",
    descripcion: "",
    cantidad: 1,
    precioUnitario: 0,
    subtotal: 0
});

const crearDetalleProducto = () => ({
    productoId: "",
    codigo: "",
    nombre: "",
    cantidad: 1,
    precioUnitario: 0,
    stockDisponible: 0,
    subtotal: 0
});

export function Ordenes() {
    const [clientes, setClientes] = useState([]);
    const [servicios, setServicios] = useState([]);
    const [productos, setProductos] = useState([]);
    const [motosCliente, setMotosCliente] = useState([]);

    const [busquedaCliente, setBusquedaCliente] = useState("");
    const [busquedaProducto, setBusquedaProducto] = useState("");

    const [mostrarClientes, setMostrarClientes] = useState(false);
    const [mostrarProductos, setMostrarProductos] = useState(false);

    const [guardando, setGuardando] = useState(false);
    const [mensaje, setMensaje] = useState("");
    const [error, setError] = useState("");

     const navigate = useNavigate();

     const irAgregarCliente = () => {
        navigate("/clientes");
    };

    const [orden, setOrden] = useState({
        clienteId: "",
        clienteNombre: "",
        motoClienteId: "",
        fechaRecepcion: obtenerFechaActual(),
        fechaEntregaEstimada: "",
        kilometraje: "",
        nivelCombustible: "MEDIO",
        prioridad: "NORMAL",
        estado: "RECIBIDA",
        fallaReportada: "",
        diagnosticoInicial: "",
        observaciones: "",
        anticipo: 0
    });

    const [detallesServicios, setDetallesServicios] = useState([
        crearDetalleServicio()
    ]);

    const [detallesProductos, setDetallesProductos] = useState([]);

    useEffect(() => {
        cargarCatalogos();
    }, []);

    async function cargarCatalogos() {
        setError("");

        try {
            const [clientesResponse, serviciosResponse, productosResponse] =
                await Promise.all([
                    fetch(`${API_URL}/clientes`),
                    fetch(`${API_URL}/servicios`),
                    fetch(`${API_URL}/productos`)
                ]);

            if (!clientesResponse.ok) {
                throw new Error("No fue posible consultar los clientes");
            }

            if (!serviciosResponse.ok) {
                throw new Error("No fue posible consultar los servicios");
            }

            if (!productosResponse.ok) {
                throw new Error("No fue posible consultar los productos");
            }

            const clientesData = await clientesResponse.json();
            const serviciosData = await serviciosResponse.json();
            const productosData = await productosResponse.json();

            setClientes(clientesData);
            setServicios(serviciosData.filter((servicio) => servicio.activo !== false));
            setProductos(productosData.filter((producto) => producto.activo !== false));
        } catch (exception) {
            console.error(exception);
            setError(exception.message);
        }
    }

    async function cargarMotosCliente(clienteId) {
        if (!clienteId) {
            setMotosCliente([]);
            return;
        }

        try {
            const response = await fetch(
                `${API_URL}/motocicletas/cliente/${clienteId}`
            );

            if (!response.ok) {
                throw new Error(
                    "No fue posible consultar las motocicletas del cliente"
                );
            }

            const data = await response.json();
            setMotosCliente(data);
        } catch (exception) {
            console.error(exception);
            setMotosCliente([]);
            setError(exception.message);
        }
    }

    function seleccionarCliente(cliente) {
        setOrden((ordenActual) => ({
            ...ordenActual,
            clienteId: cliente.id,
            clienteNombre: obtenerNombreCliente(cliente),
            motoClienteId: ""
        }));

        setBusquedaCliente(obtenerNombreCliente(cliente));
        setMostrarClientes(false);
        cargarMotosCliente(cliente.id);
    }

    function cambiarCampo(event) {
        const { name, value } = event.target;

        setOrden((ordenActual) => ({
            ...ordenActual,
            [name]: value
        }));
    }

    function cambiarServicio(index, campo, valor) {
        setDetallesServicios((detallesActuales) =>
            detallesActuales.map((detalle, posicion) => {
                if (posicion !== index) {
                    return detalle;
                }

                const detalleActualizado = {
                    ...detalle,
                    [campo]: valor
                };

                if (campo === "servicioId") {
                    const servicioSeleccionado = servicios.find(
                        (servicio) => String(servicio.id) === String(valor)
                    );

                    if (servicioSeleccionado) {
                        detalleActualizado.nombre =
                            servicioSeleccionado.nombre;
                        detalleActualizado.descripcion =
                            servicioSeleccionado.descripcion || "";
                        detalleActualizado.precioUnitario = Number(
                            servicioSeleccionado.precio || 0
                        );
                    }
                }

                detalleActualizado.cantidad = Math.max(
                    Number(detalleActualizado.cantidad || 1),
                    1
                );

                detalleActualizado.precioUnitario = Math.max(
                    Number(detalleActualizado.precioUnitario || 0),
                    0
                );

                detalleActualizado.subtotal =
                    detalleActualizado.cantidad *
                    detalleActualizado.precioUnitario;

                return detalleActualizado;
            })
        );
    }

    function agregarServicio() {
        setDetallesServicios((detallesActuales) => [
            ...detallesActuales,
            crearDetalleServicio()
        ]);
    }

    function eliminarServicio(index) {
        setDetallesServicios((detallesActuales) =>
            detallesActuales.filter((_, posicion) => posicion !== index)
        );
    }

    function seleccionarProducto(producto) {
        const yaAgregado = detallesProductos.some(
            (detalle) => detalle.productoId === producto.id
        );

        if (yaAgregado) {
            setError("La refacción ya fue agregada a la orden");
            return;
        }

        const precio = Number(producto.precioVenta || 0);

        setDetallesProductos((detallesActuales) => [
            ...detallesActuales,
            {
                productoId: producto.id,
                codigo: producto.codigo,
                nombre: producto.nombre,
                cantidad: 1,
                precioUnitario: precio,
                stockDisponible: Number(
                    producto.stockActual ?? producto.stock ?? 0
                ),
                subtotal: precio
            }
        ]);

        setBusquedaProducto("");
        setMostrarProductos(false);
        setError("");
    }

    function cambiarProducto(index, campo, valor) {
        setDetallesProductos((detallesActuales) =>
            detallesActuales.map((detalle, posicion) => {
                if (posicion !== index) {
                    return detalle;
                }

                const detalleActualizado = {
                    ...detalle,
                    [campo]: Math.max(Number(valor || 0), 0)
                };

                detalleActualizado.subtotal =
                    detalleActualizado.cantidad *
                    detalleActualizado.precioUnitario;

                return detalleActualizado;
            })
        );
    }

    function eliminarProducto(index) {
        setDetallesProductos((detallesActuales) =>
            detallesActuales.filter((_, posicion) => posicion !== index)
        );
    }

    const subtotalServicios = useMemo(
        () =>
            detallesServicios.reduce(
                (total, detalle) => total + Number(detalle.subtotal || 0),
                0
            ),
        [detallesServicios]
    );

    const subtotalProductos = useMemo(
        () =>
            detallesProductos.reduce(
                (total, detalle) => total + Number(detalle.subtotal || 0),
                0
            ),
        [detallesProductos]
    );

    const subtotal = subtotalServicios + subtotalProductos;
    const iva = subtotal * 0.16;
    const total = subtotal;
    const anticipo = Number(orden.anticipo || 0);
    const saldoPendiente = Math.max(total - anticipo, 0);

    const clientesFiltrados = useMemo(() => {
        const texto = busquedaCliente.trim().toLowerCase();

        if (!texto) {
            return clientes.slice(0, 8);
        }

        return clientes
            .filter((cliente) => {
                const nombre = obtenerNombreCliente(cliente).toLowerCase();
                const telefono = cliente.telefono?.toLowerCase() || "";
                const email = cliente.email?.toLowerCase() || "";

                return (
                    nombre.includes(texto) ||
                    telefono.includes(texto) ||
                    email.includes(texto)
                );
            })
            .slice(0, 8);
    }, [clientes, busquedaCliente]);

    const productosFiltrados = useMemo(() => {
        const texto = busquedaProducto.trim().toLowerCase();

        if (!texto) {
            return productos.slice(0, 8);
        }

        return productos
            .filter((producto) => {
                const nombre = producto.nombre?.toLowerCase() || "";
                const codigo = producto.codigo?.toLowerCase() || "";
                const codigoBarras =
                    producto.codigoBarras?.toLowerCase() || "";

                return (
                    nombre.includes(texto) ||
                    codigo.includes(texto) ||
                    codigoBarras.includes(texto)
                );
            })
            .slice(0, 8);
    }, [productos, busquedaProducto]);

    function validarOrden() {
        if (!orden.clienteId) {
            return "Selecciona un cliente";
        }

        if (!orden.motoClienteId) {
            return "Selecciona una motocicleta";
        }

        if (!orden.fallaReportada.trim()) {
            return "Captura la falla reportada por el cliente";
        }

        const serviciosValidos = detallesServicios.filter(
            (detalle) => detalle.servicioId
        );

        if (
            serviciosValidos.length === 0 &&
            detallesProductos.length === 0
        ) {
            return "Agrega al menos un servicio o una refacción";
        }

        const productoSinStock = detallesProductos.find(
            (detalle) =>
                detalle.cantidad > detalle.stockDisponible
        );

        if (productoSinStock) {
            return `No hay stock suficiente para ${productoSinStock.nombre}`;
        }

        if (anticipo > total) {
            return "El anticipo no puede ser mayor al total";
        }

        return "";
    }

    async function guardarOrden(event) {
        event.preventDefault();

        setMensaje("");
        setError("");

        const errorValidacion = validarOrden();

        if (errorValidacion) {
            setError(errorValidacion);
            return;
        }

        const payload = {
            clienteId: Number(orden.clienteId),
            motoClienteId: Number(orden.motoClienteId),
            fechaRecepcion: convertirFecha(orden.fechaRecepcion),
            fechaEntregaEstimada: orden.fechaEntregaEstimada
                ? convertirFecha(orden.fechaEntregaEstimada)
                : null,
            kilometraje: orden.kilometraje
                ? Number(orden.kilometraje)
                : null,
            nivelCombustible: orden.nivelCombustible,
            prioridad: orden.prioridad,
            estado: orden.estado,
            fallaReportada: orden.fallaReportada,
            diagnosticoInicial: orden.diagnosticoInicial,
            observaciones: orden.observaciones,
            subtotalServicios,
            subtotalProductos,
            subtotal,
            iva,
            total,
            anticipo,
            saldoPendiente,
            servicios: detallesServicios
                .filter((detalle) => detalle.servicioId)
                .map((detalle) => ({
                    servicioId: Number(detalle.servicioId),
                    descripcion: detalle.descripcion,
                    cantidad: Number(detalle.cantidad),
                    precioUnitario: Number(detalle.precioUnitario),
                    subtotal: Number(detalle.subtotal)
                })),
            productos: detallesProductos.map((detalle) => ({
                productoId: Number(detalle.productoId),
                cantidad: Number(detalle.cantidad),
                precioUnitario: Number(detalle.precioUnitario),
                subtotal: Number(detalle.subtotal)
            }))
        };

        try {
            setGuardando(true);

            const response = await fetch(`${API_URL}/ordenes-taller`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const respuestaError = await obtenerRespuestaError(response);
                throw new Error(respuestaError);
            }

            const ordenGuardada = await response.json();

            setMensaje(
                `Orden ${
                    ordenGuardada.folio || ordenGuardada.id
                } registrada correctamente`
            );

            limpiarFormulario();
        } catch (exception) {
            console.error(exception);
            setError(exception.message);
        } finally {
            setGuardando(false);
        }
    }

    function limpiarFormulario() {
        setOrden({
            clienteId: "",
            clienteNombre: "",
            motoClienteId: "",
            fechaRecepcion: obtenerFechaActual(),
            fechaEntregaEstimada: "",
            kilometraje: "",
            nivelCombustible: "MEDIO",
            prioridad: "NORMAL",
            estado: "RECIBIDA",
            fallaReportada: "",
            diagnosticoInicial: "",
            observaciones: "",
            anticipo: 0
        });

        setBusquedaCliente("");
        setBusquedaProducto("");
        setMotosCliente([]);
        setDetallesServicios([crearDetalleServicio()]);
        setDetallesProductos([]);
    }

    return (
        <div className="orden-page">
            <div className="orden-page__header">
                <div>
                    <span className="orden-page__eyebrow">
                        Módulo de taller
                    </span>

                    <h1>Agregar orden</h1>

                    <p>
                        Registra la motocicleta, los servicios y las
                        refacciones requeridas.
                    </p>
                </div>

                <div className="orden-page__header-actions">
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={limpiarFormulario}
                    >
                        Limpiar
                    </button>

                    <button
                        className="btn btn-primary"
                        onClick={irAgregarCliente}
                    >
                        Agregar cliente
                    </button>
                </div>
            </div>

            {error && (
                <div className="alert alert-error">
                    <span>⚠️</span>
                    <span>{error}</span>
                </div>
            )}

            {mensaje && (
                <div className="alert alert-success">
                    <span>✅</span>
                    <span>{mensaje}</span>
                </div>
            )}

            <form
                id="form-orden"
                className="orden-layout"
                onSubmit={guardarOrden}
            >
                <main className="orden-main">
                    <section className="orden-card">
                        <div className="orden-card__header">
                            <div className="orden-card__icon">👤</div>

                            <div>
                                <h2>Cliente y motocicleta</h2>
                                <p>
                                    Selecciona al propietario y la motocicleta
                                    que ingresará al taller.
                                </p>
                            </div>
                        </div>

                        <div className="form-grid form-grid--2">
                            <div className="form-group search-container">
                                <label>Cliente *</label>

                                <input
                                    type="text"
                                    value={busquedaCliente}
                                    placeholder="Buscar por nombre o teléfono"
                                    autoComplete="off"
                                    onFocus={() => setMostrarClientes(true)}
                                    onChange={(event) => {
                                        setBusquedaCliente(event.target.value);
                                        setMostrarClientes(true);

                                        if (!event.target.value) {
                                            setOrden((ordenActual) => ({
                                                ...ordenActual,
                                                clienteId: "",
                                                clienteNombre: "",
                                                motoClienteId: ""
                                            }));

                                            setMotosCliente([]);
                                        }
                                    }}
                                />

                                {mostrarClientes && (
                                    <div className="search-results">
                                        {clientesFiltrados.length === 0 ? (
                                            <div className="search-empty">
                                                No se encontraron clientes
                                            </div>
                                        ) : (
                                            clientesFiltrados.map((cliente) => (
                                                <button
                                                    type="button"
                                                    className="search-result"
                                                    key={cliente.id}
                                                    onClick={() =>
                                                        seleccionarCliente(
                                                            cliente
                                                        )
                                                    }
                                                >
                                                    <span className="search-result__avatar">
                                                        {obtenerIniciales(
                                                            obtenerNombreCliente(
                                                                cliente
                                                            )
                                                        )}
                                                    </span>

                                                    <span>
                                                        <strong>
                                                            {obtenerNombreCliente(
                                                                cliente
                                                            )}
                                                        </strong>

                                                        <small>
                                                            {cliente.telefono ||
                                                                cliente.email ||
                                                                "Sin contacto"}
                                                        </small>
                                                    </span>
                                                </button>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="form-group">
                                <label>Motocicleta *</label>

                                <select
                                    name="motoClienteId"
                                    value={orden.motoClienteId}
                                    onChange={cambiarCampo}
                                    disabled={!orden.clienteId}
                                >
                                    <option value="">
                                        {orden.clienteId
                                            ? "Selecciona una motocicleta"
                                            : "Primero selecciona un cliente"}
                                    </option>

                                    {motosCliente.map((moto) => (
                                        <option key={moto.id} value={moto.id}>
                                            {obtenerDescripcionMoto(moto)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {orden.clienteId &&
                            orden.motoClienteId &&
                            motosCliente
                                .filter(
                                    (moto) =>
                                        String(moto.id) ===
                                        String(orden.motoClienteId)
                                )
                                .map((moto) => (
                                    <div
                                        className="moto-summary"
                                        key={moto.id}
                                    >
                                        <div className="moto-summary__image">
                                            🏍️
                                        </div>

                                        <div>
                                            <strong>
                                                {obtenerDescripcionMoto(moto)}
                                            </strong>

                                            <span>
                                                Placa:{" "}
                                                {moto.placas || "Sin placa"}
                                            </span>
                                        </div>

                                        <div>
                                            <small>Color</small>
                                            <strong>
                                                {moto.color || "No registrado"}
                                            </strong>
                                        </div>

                                        <div>
                                            <small>Número de serie</small>
                                            <strong>
                                                {moto.numeroSerie ||
                                                    "No registrado"}
                                            </strong>
                                        </div>
                                    </div>
                                ))}
                    </section>

                    <section className="orden-card">
                        <div className="orden-card__header">
                            <div className="orden-card__icon">🧾</div>

                            <div>
                                <h2>Datos de recepción</h2>
                                <p>
                                    Captura las condiciones con las que se
                                    recibe la motocicleta.
                                </p>
                            </div>
                        </div>

                        <div className="form-grid form-grid--3">
                            <div className="form-group">
                                <label>Fecha de recepción *</label>

                                <input
                                    type="datetime-local"
                                    name="fechaRecepcion"
                                    value={orden.fechaRecepcion}
                                    onChange={cambiarCampo}
                                    readOnly 
                                />
                            </div>

                            <div className="form-group">
                                <label>Entrega estimada</label>

                                <input
                                    type="datetime-local"
                                    name="fechaEntregaEstimada"
                                    value={orden.fechaEntregaEstimada}
                                    onChange={cambiarCampo}
                                />
                            </div>

                            <div className="form-group">
                                <label>Kilometraje</label>

                                <input
                                    type="number"
                                    name="kilometraje"
                                    value={orden.kilometraje}
                                    min="0"
                                    placeholder="Ej. 15000"
                                    onChange={cambiarCampo}
                                />
                            </div>

                            <div className="form-group">
                                <label>Nivel de combustible</label>

                                <select
                                    name="nivelCombustible"
                                    value={orden.nivelCombustible}
                                    onChange={cambiarCampo}
                                >
                                    <option value="VACIO">Vacío</option>
                                    <option value="RESERVA">Reserva</option>
                                    <option value="CUARTO">1/4</option>
                                    <option value="MEDIO">1/2</option>
                                    <option value="TRES_CUARTOS">3/4</option>
                                    <option value="LLENO">Lleno</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Prioridad</label>

                                <select
                                    name="prioridad"
                                    value={orden.prioridad}
                                    onChange={cambiarCampo}
                                >
                                    <option value="BAJA">Baja</option>
                                    <option value="NORMAL">Normal</option>
                                    <option value="ALTA">Alta</option>
                                    <option value="URGENTE">Urgente</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Estado inicial</label>

                                <select
                                    name="estado"
                                    value={orden.estado}
                                    onChange={cambiarCampo}
                                >
                                    <option value="RECIBIDA">Recibida</option>
                                    <option value="DIAGNOSTICO">
                                        En diagnóstico
                                    </option>
                                    <option value="PENDIENTE_AUTORIZACION">
                                        Pendiente de autorización
                                    </option>
                                </select>
                            </div>
                        </div>

                        <div className="form-grid form-grid--2">
                            <div className="form-group">
                                <label>Falla reportada *</label>

                                <textarea
                                    name="fallaReportada"
                                    value={orden.fallaReportada}
                                    rows="4"
                                    placeholder="Describe lo que reporta el cliente..."
                                    onChange={cambiarCampo}
                                />
                            </div>

                            <div className="form-group">
                                <label>Diagnóstico inicial</label>

                                <textarea
                                    name="diagnosticoInicial"
                                    value={orden.diagnosticoInicial}
                                    rows="4"
                                    placeholder="Captura la inspección inicial..."
                                    onChange={cambiarCampo}
                                />
                            </div>
                        </div>
                    </section>

                    <section className="orden-card">
                        <div className="orden-card__header orden-card__header--action">
                            <div className="orden-card__header-content">
                                <div className="orden-card__icon">🔧</div>

                                <div>
                                    <h2>Servicios</h2>
                                    <p>
                                        Agrega la mano de obra y los servicios
                                        que se realizarán.
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                className="btn btn-outline"
                                onClick={agregarServicio}
                            >
                                + Agregar servicio
                            </button>
                        </div>

                        <div className="table-container">
                            <table className="detail-table">
                                <thead>
                                    <tr>
                                        <th>Servicio</th>
                                        <th>Descripción</th>
                                        <th className="col-number">
                                            Cantidad
                                        </th>
                                        <th className="col-money">Precio</th>
                                        <th className="col-money">Subtotal</th>
                                        <th className="col-action"></th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {detallesServicios.map(
                                        (detalle, index) => (
                                            <tr key={`servicio-${index}`}>
                                                <td>
                                                    <select
                                                        value={
                                                            detalle.servicioId
                                                        }
                                                        onChange={(event) =>
                                                            cambiarServicio(
                                                                index,
                                                                "servicioId",
                                                                event.target
                                                                    .value
                                                            )
                                                        }
                                                    >
                                                        <option value="">
                                                            Seleccionar
                                                        </option>

                                                        {servicios.map(
                                                            (servicio) => (
                                                                <option
                                                                    key={
                                                                        servicio.id
                                                                    }
                                                                    value={
                                                                        servicio.id
                                                                    }
                                                                >
                                                                    {
                                                                        servicio.nombre
                                                                    }
                                                                </option>
                                                            )
                                                        )}
                                                    </select>
                                                </td>

                                                <td>
                                                    <input
                                                        type="text"
                                                        value={
                                                            detalle.descripcion
                                                        }
                                                        placeholder="Descripción"
                                                        onChange={(event) =>
                                                            cambiarServicio(
                                                                index,
                                                                "descripcion",
                                                                event.target
                                                                    .value
                                                            )
                                                        }
                                                    />
                                                </td>

                                                <td>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={
                                                            detalle.cantidad
                                                        }
                                                        onChange={(event) =>
                                                            cambiarServicio(
                                                                index,
                                                                "cantidad",
                                                                event.target
                                                                    .value
                                                            )
                                                        }
                                                    />
                                                </td>

                                                <td>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={
                                                            detalle.precioUnitario
                                                        }
                                                        onChange={(event) =>
                                                            cambiarServicio(
                                                                index,
                                                                "precioUnitario",
                                                                event.target
                                                                    .value
                                                            )
                                                        }
                                                    />
                                                </td>

                                                <td className="money-cell">
                                                    {formatearMoneda(
                                                        detalle.subtotal
                                                    )}
                                                </td>

                                                <td>
                                                    <button
                                                        type="button"
                                                        className="icon-button icon-button--danger"
                                                        title="Eliminar servicio"
                                                        onClick={() =>
                                                            eliminarServicio(
                                                                index
                                                            )
                                                        }
                                                        disabled={
                                                            detallesServicios.length ===
                                                            1
                                                        }
                                                    >
                                                        🗑️
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <section className="orden-card">
                        <div className="orden-card__header">
                            <div className="orden-card__icon">⚙️</div>

                            <div>
                                <h2>Refacciones</h2>
                                <p>
                                    Agrega los productos que se utilizarán en
                                    la reparación.
                                </p>
                            </div>
                        </div>

                        <div className="product-search search-container">
                            <span>🔍</span>

                            <input
                                type="text"
                                value={busquedaProducto}
                                placeholder="Buscar por código, nombre o código de barras"
                                onFocus={() => setMostrarProductos(true)}
                                onChange={(event) => {
                                    setBusquedaProducto(event.target.value);
                                    setMostrarProductos(true);
                                }}
                            />

                            {mostrarProductos && (
                                <div className="search-results search-results--products">
                                    {productosFiltrados.length === 0 ? (
                                        <div className="search-empty">
                                            No se encontraron productos
                                        </div>
                                    ) : (
                                        productosFiltrados.map((producto) => (
                                            <button
                                                type="button"
                                                className="product-result"
                                                key={producto.id}
                                                onClick={() =>
                                                    seleccionarProducto(
                                                        producto
                                                    )
                                                }
                                            >
                                                <span className="product-result__icon">
                                                    📦
                                                </span>

                                                <span className="product-result__info">
                                                    <strong>
                                                        {producto.nombre}
                                                    </strong>

                                                    <small>
                                                        {producto.codigo}
                                                    </small>
                                                </span>

                                                <span className="product-result__stock">
                                                    Stock:{" "}
                                                    {producto.stockActual ??
                                                        producto.stock ??
                                                        0}
                                                </span>

                                                <strong>
                                                    {formatearMoneda(
                                                        producto.precioVenta
                                                    )}
                                                </strong>
                                            </button>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>

                        {detallesProductos.length === 0 ? (
                            <div className="empty-state">
                                <span>📦</span>
                                <strong>No hay refacciones agregadas</strong>
                                <p>
                                    Utiliza el buscador para agregar productos.
                                </p>
                            </div>
                        ) : (
                            <div className="table-container">
                                <table className="detail-table">
                                    <thead>
                                        <tr>
                                            <th>Producto</th>
                                            <th>Código</th>
                                            <th>Stock</th>
                                            <th className="col-number">
                                                Cantidad
                                            </th>
                                            <th className="col-money">
                                                Precio
                                            </th>
                                            <th className="col-money">
                                                Subtotal
                                            </th>
                                            <th className="col-action"></th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {detallesProductos.map(
                                            (detalle, index) => (
                                                <tr
                                                    key={`producto-${detalle.productoId}`}
                                                >
                                                    <td>
                                                        <strong>
                                                            {detalle.nombre}
                                                        </strong>
                                                    </td>

                                                    <td>{detalle.codigo}</td>

                                                    <td>
                                                        <span
                                                            className={
                                                                detalle.cantidad >
                                                                detalle.stockDisponible
                                                                    ? "stock stock--danger"
                                                                    : "stock"
                                                            }
                                                        >
                                                            {
                                                                detalle.stockDisponible
                                                            }
                                                        </span>
                                                    </td>

                                                    <td>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            max={
                                                                detalle.stockDisponible
                                                            }
                                                            value={
                                                                detalle.cantidad
                                                            }
                                                            onChange={(
                                                                event
                                                            ) =>
                                                                cambiarProducto(
                                                                    index,
                                                                    "cantidad",
                                                                    event.target
                                                                        .value
                                                                )
                                                            }
                                                        />
                                                    </td>

                                                    <td>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={
                                                                detalle.precioUnitario
                                                            }
                                                            onChange={(
                                                                event
                                                            ) =>
                                                                cambiarProducto(
                                                                    index,
                                                                    "precioUnitario",
                                                                    event.target
                                                                        .value
                                                                )
                                                            }
                                                        />
                                                    </td>

                                                    <td className="money-cell">
                                                        {formatearMoneda(
                                                            detalle.subtotal
                                                        )}
                                                    </td>

                                                    <td>
                                                        <button
                                                            type="button"
                                                            className="icon-button icon-button--danger"
                                                            title="Eliminar producto"
                                                            onClick={() =>
                                                                eliminarProducto(
                                                                    index
                                                                )
                                                            }
                                                        >
                                                            🗑️
                                                        </button>
                                                    </td>
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>

                    <section className="orden-card">
                        <div className="orden-card__header">
                            <div className="orden-card__icon">📝</div>

                            <div>
                                <h2>Observaciones</h2>
                                <p>
                                    Agrega notas adicionales para el mecánico o
                                    para el cliente.
                                </p>
                            </div>
                        </div>

                        <div className="form-group">
                            <textarea
                                name="observaciones"
                                value={orden.observaciones}
                                rows="5"
                                placeholder="Ej. La motocicleta se recibe con rayón en el costado derecho..."
                                onChange={cambiarCampo}
                            />
                        </div>
                    </section>
                </main>

                <aside className="orden-sidebar">
                    <section className="summary-card">
                        <div className="summary-card__header">
                            <h2>Resumen de orden</h2>
                            <span className="status-badge">
                                {orden.estado.replaceAll("_", " ")}
                            </span>
                        </div>

                        <div className="summary-client">
                            <span>👤</span>

                            <div>
                                <small>Cliente</small>
                                <strong>
                                    {orden.clienteNombre ||
                                        "Sin seleccionar"}
                                </strong>
                            </div>
                        </div>

                        <div className="summary-separator"></div>

                        <div className="summary-row">
                            <span>Servicios</span>
                            <strong>{formatearMoneda(subtotalServicios)}</strong>
                        </div>

                        <div className="summary-row">
                            <span>Refacciones</span>
                            <strong>{formatearMoneda(subtotalProductos)}</strong>
                        </div>

                        <div className="summary-row">
                            <span>Subtotal</span>
                            <strong>{formatearMoneda(subtotal)}</strong>
                        </div>

                        <div className="summary-row">
                            <span>IVA 16%</span>
                            <strong>{formatearMoneda(iva)}</strong>
                        </div>

                        <div className="summary-total">
                            <span>Total</span>
                            <strong>{formatearMoneda(total)}</strong>
                        </div>

                        <div className="form-group">
                            <label>Anticipo</label>

                            <div className="money-input">
                                <span>$</span>

                                <input
                                    type="number"
                                    name="anticipo"
                                    value={orden.anticipo}
                                    min="0"
                                    max={total}
                                    step="0.01"
                                    onChange={cambiarCampo}
                                />
                            </div>
                        </div>

                        <div className="summary-balance">
                            <span>Saldo pendiente</span>
                            <strong>
                                {formatearMoneda(saldoPendiente)}
                            </strong>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-block"
                            disabled={guardando}
                        >
                            {guardando
                                ? "Guardando orden..."
                                : "Guardar orden"}
                        </button>

                        <button
                            type="button"
                            className="btn btn-secondary btn-block"
                            onClick={limpiarFormulario}
                        >
                            Cancelar
                        </button>
                    </section>
                </aside>
            </form>
        </div>
    );
}

function obtenerFechaActual() {
    const fecha = new Date();
    const offset = fecha.getTimezoneOffset() * 60000;

    return new Date(fecha.getTime() - offset)
        .toISOString()
        .slice(0, 16);
}

function convertirFecha(fecha) {
    return fecha ? `${fecha}:00` : null;
}

function obtenerNombreCliente(cliente) {
    if (cliente.nombreCompleto) {
        return cliente.nombreCompleto;
    }

    return [
        cliente.nombre,
        cliente.apellidoPaterno,
        cliente.apellidoMaterno
    ]
        .filter(Boolean)
        .join(" ");
}

function obtenerIniciales(nombre) {
    return nombre
        .split(" ")
        .slice(0, 2)
        .map((palabra) => palabra.charAt(0).toUpperCase())
        .join("");
}

function obtenerDescripcionMoto(moto) {
    const marca =
        moto.motoMarcaNombre ||
        moto.marca?.nombre ||
        moto.modelo?.marca?.nombre ||
        "";

    const modelo =
        moto.motoModeloNombre ||
        moto.modelo?.nombre ||
        "";

    const version =
        moto.versionNombre ||
        moto.version?.nombre ||
        "";

    const year = moto.year || moto.anio || "";

    return [marca, modelo, version, year]
        .filter(Boolean)
        .join(" ");
}

function formatearMoneda(valor) {
    return new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN"
    }).format(Number(valor || 0));
}

async function obtenerRespuestaError(response) {
    try {
        const data = await response.json();

        return (
            data.mensaje ||
            data.message ||
            data.error ||
            "No fue posible guardar la orden"
        );
    } catch {
        return "No fue posible guardar la orden";
    }
}