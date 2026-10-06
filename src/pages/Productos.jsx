import { useEffect, useState } from "react";
import FormCard from "../components/FormCard";
import DataTable from "../components/DataTable";
import { FaEdit, FaTrash } from "react-icons/fa";
import api from "../services/api";

export function Productos() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [codigo, setCodigo] = useState("");
  const [codigoBarras, setCodigoBarras] = useState("");
  const [nombre, setNombre, setEmail] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [marcaId, setMarcaId] = useState("");
  const [compatibilidadUniversal, setUniversal] = useState(false);
  const [proveedorId, setProveedorId] = useState("");
  const [precioCompra, setPrecioCompra] = useState("");
  const [precioVenta, setPrecioVenta] = useState("");
  const [stockActual, setStockActual] = useState("");
  const [stockMinimo, setStockMinimo] = useState("");
  const [unidadMedida, setUnidadMedida] = useState("");
  const [editandoId, setEditandoId] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [timestamp, setTimestamp] = useState(Date.now());
  const [error, setError] = useState("");

  //Se pretende crear el backen para unidades
  const unidades = [
    { id: "1", unidad: "Pieza" },
    { id: "2", unidad: "Litro" },
    { id: "3", unidad: "Juego" },
  ];

  const [isActivoAgregar, setIsActivoAgregar] = useState(false);

  useEffect(() => {
    cargarProductos();
  }, []);

  const categoriasMap = Object.fromEntries(
    categorias.map((c) => [c.id, c.nombre]),
  );

  const marcasMap = Object.fromEntries(marcas.map((m) => [m.id, m.nombre]));

  const proveedoresMap = Object.fromEntries(
    proveedores.map((p) => [p.id, p.nombre]),
  );

  const productosTabla = productos.map((producto) => ({
    ...producto,
    categoriaNombre: categoriasMap[producto.categoriaId] || "",
    marcaNombre: marcasMap[producto.marcaId] || "",
    proveedorNombre: proveedoresMap[producto.proveedorId] || "",
  }));

  const productosFiltrados = productosTabla.filter(
    (producto) =>
      producto.activo &&
      (producto.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        producto.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
        producto.codigoBarras.toLowerCase().includes(busqueda.toLowerCase()) ||
        producto.descripcion.toLowerCase().includes(busqueda.toLowerCase())),
  );

 async function cargarProductos() {
    setError("");
    try {
      const [productosResponse, categoriasResponse,marcasResponse, proveedoresResponse] = await Promise.all([
        api.get("/productos"),
        api.get("/categorias"),
        api.get("/marcas"),
        api.get("/proveedores"),
      ]);
      
      const productosData = productosResponse.data ?? [];
      const categoriasData = categoriasResponse.data ?? [];
      const marcasData = marcasResponse.data ?? [];
      const proveedoresData = proveedoresResponse.data ?? [];

      setProductos(productosData);
      setCategorias(categoriasData);
      setMarcas(marcasData);
      setProveedores(proveedoresData);

    } catch (error) {
      console.error("Error al obtener productos", error);
      console.error("Código HTTP:", exception.response?.status);

      console.error("Respuesta backend:", exception.response?.data);

      const mensajeBackend = exception.response?.data?.message;

      if (exception.response?.status === 401) {
        setError("La sesión expiró. Inicia sesión nuevamente.");
      } else if (exception.response?.status === 403) {
        setError("No tienes permisos para consultar uno de los productos.");
      } else {
        setError(mensajeBackend || "No fue posible cargar los productos");
      }
    }
  };

  

  const crearProducto = async () => {
    if (
      !codigo ||
      !codigoBarras ||
      !nombre ||
      !descripcion ||
      !categoriaId ||
      !marcaId ||
      !proveedorId ||
      !precioCompra ||
      !precioVenta ||
      !stockActual ||
      !stockMinimo ||
      !unidadMedida
    ) {
      alert("Completa todos los campos");
      return;
    }

    try {
      const productos = {
        codigo,
        codigoBarras,
        nombre,
        descripcion,
        categoriaId,
        marcaId,
        compatibilidadUniversal,
        proveedorId,
        precioCompra,
        precioVenta,
        stockActual,
        stockMinimo,
        unidadMedida,
        activo: true,
      };

      /*console.log(JSON.stringify(productos));*/

      if (editandoId) {
      
        const response = await api.put(`/productos/${editandoId}`,productos);

        setEditandoId(null);
      } else {
        const response = await api.post("/productos",productos);
      }

      limpiarFormulario();
      cargarProductos();
    } catch (error) {
      console.error("Error al guardar producto", error);
    }
  };

  const eliminarProducto = async (producto) => {
    const productoDelete = {
      codigo: producto.codigo,
          codigoBarras: producto.codigoBarras,
          nombre: producto.nombre,
          descripcion: producto.descripcion,
          categoriaId: producto.categoriaId,
          marcaId: producto.marcaId,
          compatibilidadUniversal: producto.compatibilidadUniversal,
          proveedorId: producto.proveedorId,
          precioCompra: producto.precioCompra,
          precioVenta: producto.precioVenta,
          stockActual: producto.stockActual,
          stockMinimo: producto.stockMinimo,
          unidadMedida: producto.unidadMedida,
          activo: false,
    }
    try {
      await api.put(`/productos/${producto.id}`,productoDelete);
    } catch (error) {
      console.error("Error al eliminar producto", error);
    }
  };

  const editarProducto = (producto) => {
    setIsActivoAgregar(!isActivoAgregar);
    setCodigo(producto.codigo);
    setCodigoBarras(producto.codigoBarras);
    setNombre(producto.nombre);
    setDescripcion(producto.descripcion);
    setCategoriaId(producto.categoriaId);
    setMarcaId(producto.marcaId);
    setUniversal(producto.compatibilidadUniversal);
    setProveedorId(producto.proveedorId);
    setPrecioCompra(producto.precioCompra);
    setPrecioVenta(producto.precioVenta);
    setStockActual(producto.stockActual);
    setStockMinimo(producto.stockMinimo);
    setUnidadMedida(producto.unidadMedida);
    setEditandoId(producto.id);
  };

  const limpiarFormulario = () => {
    setCodigo("");
    setCodigoBarras("");
    setNombre("");
    setDescripcion("");
    setCategoriaId("");
    setMarcaId("");
    setUniversal("");
    setProveedorId("");
    setPrecioCompra("");
    setPrecioVenta("");
    setStockActual("");
    setStockMinimo("");
    setUnidadMedida("");
  };

  const columns = [
    /*{ key: "codigo", label: "NIC" },*/
    { key: "codigoBarras", label: "Codigo" },
    { key: "nombre", label: "Nombre" },
    { key: "descripcion", label: "Descripcion" },
    /*{ key: "categoriaNombre", label: "Categoría" },*/
    /*{ key: "marcaNombre", label: "Marca" },*/
    /*{ key: "proveedorNombre", label: "Proveedor" },*/
    { key: "precioCompra", label: "Precio Compra" },
    { key: "precioVenta", label: "Precio Venta" },
    { key: "stockActual", label: "Stock" },
    /*{ key: "stockMinimo", label: "Stock Minimo" },*/
    /*{ key: "unidadMedida", label: "Unidad" },*/
  ];

  const actions = [
    {
      icon: <FaEdit />,
      title: "Editar",
      className: "btn-action btn-edit",
      onClick: editarProducto,
    },
    {
      icon: <FaTrash />,
      title: "Eliminar",
      className: "btn-action btn-delete",
      onClick: eliminarProducto,
    },
  ];

  const toggleFormulario = () => {
    setIsActivoAgregar(!isActivoAgregar);
  };

  const cancelarFormulario = () => {
    limpiarFormulario();
    setEditandoId(null);
    setIsActivoAgregar(false);
  };

  return (
    <>
      <header className="header">
        <div>
          <h1>Productos</h1>
          <p>Administra los Productos de tus refacciones.</p>
        </div>
        <div className="header-actions">
          <button
            className="primary-btn"
            onClick={() => {
              if (isActivoAgregar) {
                cancelarFormulario();
              } else {
                setIsActivoAgregar(true);
              }
            }}
          >
            {isActivoAgregar ? "Cancelar" : "+ Nuevo producto"}
          </button>
        </div>
      </header>
      {isActivoAgregar && (
        <section className="content-productos">
          <FormCard
            title={editandoId ? "Editar producto" : "Agregar producto"}
            buttonText={editandoId ? "Actualizar producto" : "Guardar producto"}
            onSubmit={crearProducto}
          >
            <div className="product-form">
              <div className="form-section">
                <h3>Datos generales</h3>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Código</label>
                    <input
                      type="text"
                      placeholder="12345"
                      value={codigo}
                      onChange={(e) => setCodigo(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Código de barras</label>
                    <input
                      type="text"
                      placeholder="7501234567890"
                      value={codigoBarras}
                      onChange={(e) => setCodigoBarras(e.target.value)}
                    />
                  </div>

                  <div className="form-group form-full">
                    <label>Nombre</label>
                    <input
                      type="text"
                      placeholder="Balata delantera"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                    />
                  </div>

                  <div className="form-group form-full">
                    <label>Descripción</label>
                    <textarea
                      placeholder="Descripción del producto"
                      value={descripcion}
                      onChange={(e) => setDescripcion(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Clasificación</h3>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Categoría</label>

                    <select
                      value={categoriaId}
                      onChange={(e) => setCategoriaId(e.target.value)}
                      className="form-select"
                    >
                      <option value="">Selecciona una categoría</option>

                      {categorias.map((categoria) => (
                        <option key={categoria.id} value={categoria.id}>
                          {categoria.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Marca</label>
                    <select
                      value={marcaId}
                      onChange={(e) => setMarcaId(e.target.value)}
                      className="form-select"
                    >
                      <option value="">Selecciona una marca</option>

                      {marcas.map((marca) => (
                        <option key={marca.id} value={marca.id}>
                          {marca.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Proveedor</label>
                    <select
                      value={proveedorId}
                      onChange={(e) => setProveedorId(e.target.value)}
                      className="form-select"
                    >
                      <option value="">Selecciona un proveedor</option>

                      {proveedores.map((proveedor) => (
                        <option key={proveedor.id} value={proveedor.id}>
                          {proveedor.nombre}
                        </option>
                      ))}
                    </select>

                    <label>Universal</label>
                    <select
                      value={compatibilidadUniversal}
                      onChange={(e) => setUniversal(e.target.value)}
                      className="form-select"
                    >
                      <option value="">Selecciona una opcion</option>

                      <option key="true" value="true">
                        SI
                      </option>
                      <option key="false" value="false">
                        NO
                      </option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Precio e inventario</h3>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Precio compra</label>
                    <input
                      type="number"
                      placeholder="35.14"
                      value={precioCompra}
                      onChange={(e) => setPrecioCompra(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Precio venta</label>
                    <input
                      type="number"
                      placeholder="65.00"
                      value={precioVenta}
                      onChange={(e) => setPrecioVenta(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Stock</label>
                    <input
                      type="number"
                      placeholder="5"
                      value={stockActual}
                      onChange={(e) => setStockActual(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Stock mínimo</label>
                    <input
                      type="number"
                      placeholder="2"
                      value={stockMinimo}
                      onChange={(e) => setStockMinimo(e.target.value)}
                    />
                  </div>

                  <div className="form-group form-full">
                    <label>Unidad</label>
                    <select
                      value={unidadMedida}
                      onChange={(e) => setUnidadMedida(e.target.value)}
                      className="form-select"
                    >
                      <option value="">Selecciona la unidad</option>

                      {unidades.map((unidad) => (
                        <option key={unidad.id} value={unidad.unidad}>
                          {unidad.unidad}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={cancelarFormulario}
                >
                  Cancelar
                </button>
              }
            </div>
          </FormCard>
        </section>
      )}
      {!isActivoAgregar && (
        <section className="content-table-productos">
          <DataTable
            title="Listado de Productos"
            searchPlaceholder="Buscar Productos..."
            searchValue={busqueda}
            onSearchChange={setBusqueda}
            columns={columns}
            data={productosFiltrados}
            actions={actions}
          />
        </section>
      )}
    </>
  );
}
