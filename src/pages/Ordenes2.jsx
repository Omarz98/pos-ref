import { useEffect, useState } from "react";
import FormCard from "../components/FormCard";
import DataTable from "../components/DataTable";
import { FaEdit, FaTrash } from "react-icons/fa";

export function Ordenes() {
  const [ordenes, setOrdenes] = useState([]);
  const [isActivoAgregar, setIsActivoAgregar] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [busqueda, setBusqueda] = useState("");

  const cancelarFormulario = () => {
    limpiarFormulario();
    setEditandoId(null);
    setIsActivoAgregar(false);
  };

  const limpiarFormulario = () => {};

  useEffect(() => {
    fetchOrdenes();
  }, []);

  const ordenesFiltradas = ordenes.filter(
    (producto) =>
      producto.activo &&
      producto.nombre.toLowerCase().includes(busqueda.toLowerCase()),
  );

  const fetchOrdenes = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/ordenes");
      const data = await response.json();
      setOrdenes(data);
    } catch (error) {
      console.error("Error al obtener ordenes", error);
    }
  };

  const crearOrden = async () => {};

  const editarOrden = (producto) => {};

  const eliminarOrden = (producto) => {};

  const columns = [
    { key: "orden", label: "#Orden" },
    { key: "nombreCliente", label: "Nombre" },
    { key: "estado", label: "Descripcion" },
    { key: "fechaRecepcion", label: "Fecha de recepcion" },
  ];

  const actions = [
    {
      icon: <FaEdit />,
      title: "Editar",
      className: "btn-action btn-edit",
      onClick: editarOrden,
    },
    {
      icon: <FaTrash />,
      title: "Eliminar",
      className: "btn-action btn-delete",
      onClick: eliminarOrden,
    },
  ];

  return (
    <>
      <header className="header">
        <div>
          <h1>Ordenes</h1>
          <p>Administra las Ordenes de tus clientes.</p>
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
            {isActivoAgregar ? "Cancelar" : "+ Generar orden"}
          </button>
        </div>
      </header>
      {isActivoAgregar && (
        <section className="content-productos">
          <FormCard
            title={editandoId ? "Editar orden" : "Agregar orden"}
            buttonText={editandoId ? "Actualizar producto" : "Guardar orden"}
            onSubmit={crearOrden}
          ></FormCard>
          <div className="product-form">
            <div className="form-section">
              <h3>Datos generales</h3>
            </div>
          </div>
        </section>
      )}
      {!isActivoAgregar && (
        <section className="content-table-productos">
          <DataTable
            title="Listado de Ordenes"
            searchPlaceholder="Buscar Orden..."
            searchValue={busqueda}
            onSearchChange={setBusqueda}
            columns={columns}
            data={ordenesFiltradas}
            actions={actions}
          />
        </section>
      )}
    </>
  );
}
