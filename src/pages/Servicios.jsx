import { useEffect, useState } from "react";
import FormCard from "../components/FormCard";
import DataTable from "../components/DataTable";
import { FaEdit, FaTrash } from "react-icons/fa";
import api from "../services/api.js";
export function Servicios(){
    const [servicios, setServicios] = useState([]);
    const [activo, setActivo] = useState("");
    const [codigo, setCodigo] = useState("");
  const [nombre, setNombre] = useState("");
  const [precioVenta, setPrecioVenta] = useState("");
  const [editandoId, setEditandoId] = useState(null);
  const [busqueda, setBusqueda] = useState("");
     
  useEffect(() => {
    fetchServicios();
    
  }, []);

  const serviciosFiltrados = servicios.filter(
  (servicio) =>
    servicio.activo &&
    (
      servicio.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      servicio.codigo.toLowerCase().includes(busqueda.toLowerCase())
    )
  );

  const fetchServicios = async () => {
    try {
      const response = await api.get("/servicios");
      
      setServicios(response.data);
    } catch (error) {
      console.error("Error al obtener servicios", error);
    }
  };

  const crearServicio = async () => {
    if (!codigo || !nombre || !precioVenta) {
      alert("Completa todos los campos");
      return;
    }

    try {
      const servicio = {
        codigo,
        nombre,
        precioVenta,
        activo: true,
      };
      
      if (editandoId) {
        await api.put(`/servicios/${editandoId}`,servicio);
        setEditandoId(null);
      } else {
        await api.post("/servicios",servicio)
       
      }

      limpiarFormulario();
      fetchServicios();
    } catch (error) {
      console.error("Error al guardar servicio", error);
    }
  };

  const eliminarServicio = async (servicio) => {
    const servicioDelete = {
codigo: servicio.codigo,
          nombre: servicio.nombre,
          precioVenta: servicio.precioVenta,
          activo: false,
    }
    try {
      await api.put(`/servicios/${servicio.id}`,servicioDelete);

      fetchServicios();
    } catch (error) {
      console.error("Error al eliminar servicio", error);
    }
  };

  const editarServicio = (servicio) => {
    setEditandoId(servicio.id);
    setNombre(servicio.nombre);
    setCodigo(servicio.codigo);
    setPrecioVenta(servicio.precioVenta);
  };

  const limpiarFormulario = () => {
    setNombre("");
    setCodigo("");
    setPrecioVenta("");
    setEditandoId(null);
  };

  const columns = [
    { key: "nombre", label: "Nombre" },
    { key: "codigo", label: "Codigo" },
    { key: "precioVenta", label: "Precio" },
  ];

  const actions = [
  {
    icon: <FaEdit />,
    title: "Editar",
    className: "btn-action btn-edit",
    onClick: editarServicio,
  },
  {
    icon: <FaTrash />,
    title: "Eliminar",
    className: "btn-action btn-delete",
    onClick: eliminarServicio,
  },
];

  return (
  <>
  <header className="header">
      <div>
        
          <h1>Servicios</h1>
          <p>Administra los servicios de tu taller.</p>
        </div>
         <div className="header-actions">
        <button className="primary-btn" onClick={() => {
          setNombre("");
    setCodigo("");
    setPrecioVenta("");
    setEditandoId(null);
          }}>
          + Nuevo servicio
        </button>
        
      </div>
    </header>   

    <section className="content">
      

      <DataTable
        title="Listado de categorías"
        searchPlaceholder="Buscar categoría..."
        searchValue={busqueda}
        onSearchChange={setBusqueda}
        columns={columns}
        data={serviciosFiltrados}
        actions={actions}
      />

      <FormCard
        title={editandoId ? "Editar servicio" : "Nueva servicio"}
        buttonText={editandoId ? "Actualizar servicio" : "Guardar servicio"}
        onSubmit={crearServicio}
      >
        <div className="form-group">
          <label>Codigo</label>
          <input
            type="text"
            placeholder="SERV-001"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Nombre</label>
          <input
            type="text"
            placeholder="Nombre del servicio"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Precio Venta</label>
          <input
            type="number"
            placeholder="100.00"
            value={precioVenta}
            onChange={(e) => setPrecioVenta(e.target.value)}
          />
        </div>

        {editandoId && (
          <button className="primary-btn" onClick={limpiarFormulario}>
            Cancelar servicio
          </button>
        )}
      </FormCard>
    </section>
    </>
  );
}