import { useEffect, useState } from "react";
import FormCard from "../components/FormCard";
import DataTable from "../components/DataTable";
import { FaEdit, FaTrash } from "react-icons/fa";
import api from "../services/api.js";

function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [editandoId, setEditandoId] = useState(null);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    fetchCategorias();
  }, []);

  const categoriasFiltradas = categorias.filter(
  (categoria) =>
    categoria.activo &&
    (
      categoria.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      categoria.descripcion.toLowerCase().includes(busqueda.toLowerCase())
    )
  );
   const token = localStorage.getItem("token");
  const fetchCategorias = async () => {
    try {
      const response = await api.get("/categorias");

      setCategorias(response.data ?? []);
    } catch (error) {
      console.error("Error al obtener categorías", error);
    }
  };

  const crearCategoria = async () => {
    if (!nombre || !descripcion) {
      alert("Completa todos los campos");
      return;
    }

    try {
      const categoria = {
        nombre,
        descripcion,
        activo: true,
      };

      if (editandoId) {

        await api.put(`/categorias/${editandoId}`, categoria);

        setEditandoId(null);
      } else {
        await api.post("/categorias", categoria);
      }

      limpiarFormulario();
      fetchCategorias();
    } catch (error) {
      console.error("Error al guardar categoría", error);
    }
  };

  const eliminarCategoria = async (categoria) => {

    const categoriaEliminada = {
      nombre: categoria.nombre,
      descripcion: categoria.descripcion,
      activo: false,
    }
    try {
      await api.put(`/categorias/${categoria.id}`, categoriaEliminada)
      fetchCategorias();
    } catch (error) {
      console.error("Error al eliminar categoría", error);
    }
  };

  const editarCategoria = (categoria) => {
    setNombre(categoria.nombre);
    setDescripcion(categoria.descripcion);
    setEditandoId(categoria.id);
  };

  const limpiarFormulario = () => {
    setNombre("");
    setDescripcion("");
    setEditandoId(null);
  };

  const columns = [
    { key: "nombre", label: "Nombre" },
    { key: "descripcion", label: "Descripción" },
  ];

  const actions = [
  {
    icon: <FaEdit />,
    title: "Editar",
    className: "btn-action btn-edit",
    onClick: editarCategoria,
  },
  {
    icon: <FaTrash />,
    title: "Eliminar",
    className: "btn-action btn-delete",
    onClick: eliminarCategoria,
  },
];

  return (
  <>
  <header className="header">
      <div>
        
          <h1>Categorías</h1>
          <p>Administra las categorías de tus refacciones.</p>
        </div>
         <div className="header-actions">
        <button className="primary-btn" onClick={() => {
          setNombre("");
          setDescripcion("");
          setEditandoId(null);
          }}>
          + Nueva categoría
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
        data={categoriasFiltradas}
        actions={actions}
      />

      <FormCard
        title={editandoId ? "Editar categoría" : "Nueva categoría"}
        buttonText={editandoId ? "Actualizar categoría" : "Guardar categoría"}
        onSubmit={crearCategoria}
      >
        <div className="form-group">
          <label>Nombre</label>
          <input
            type="text"
            placeholder="Ej. Aceites"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Descripción</label>
          <textarea
            placeholder="Descripción de la categoría"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />
        </div>

        {editandoId && (
          <button className="primary-btn" onClick={limpiarFormulario}>
            Cancelar edición
          </button>
        )}
      </FormCard>
    </section>
    </>
  );
}

export default Categorias;