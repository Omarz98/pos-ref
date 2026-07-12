import { useEffect, useState } from "react";
import FormCard from "../components/FormCard";
import DataTable from "../components/DataTable";
import { FaEdit, FaTrash } from "react-icons/fa";
export function MotoMarcas(){
     const [motoMarcas, setMotoMarcas] = useState([]);
  const [nombre, setNombre] = useState("");
  const [editandoId, setEditandoId] = useState(null);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    fetchMotoMarcas();
  }, []);

  const motoMarcasFiltradas = motoMarcas.filter(
  (motoMarcas) =>
    motoMarcas.activo &&
    (
      motoMarcas.nombre.toLowerCase().includes(busqueda.toLowerCase())
    )
  );

  const fetchMotoMarcas = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/motomarcas");
      const data = await response.json();
      setMotoMarcas(data);
    } catch (error) {
      console.error("Error al obtener MotoMarcas", error);
    }
  };

  const crearMotoMarcas = async () => {
    if (!nombre ) {
      alert("Completa todos los campos");
      return;
    }

    try {
      const motoMarca = {
        nombre,
        activo: true,
      };

      if (editandoId) {
        await fetch(`http://localhost:8080/api/motomarcas/${editandoId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(motoMarca),
        });

        setEditandoId(null);
      } else {
        await fetch("http://localhost:8080/api/motomarcas", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(motoMarca),
        });
      }

      limpiarFormulario();
      fetchMotoMarcas();
    } catch (error) {
      console.error("Error al guardar motoMarca", error);
    }
  };

  const eliminarMotoMarca = async (motoMarca) => {
    try {
      await fetch(`http://localhost:8080/api/motomarcas/${motoMarca.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: motoMarca.nombre,
          activo: false,
        }),
      });

      fetchMotoMarcas();
    } catch (error) {
      console.error("Error al eliminar motomarca", error);
    }
  };

  const editarMotoMarca = (motoMarca) => {
    setNombre(motoMarca.nombre);
    setEditandoId(motoMarca.id);
  };

  const limpiarFormulario = () => {
    setNombre("");
    setEditandoId(null);
  };

  const columns = [
    { key: "nombre", label: "Nombre" },
  ];

  const actions = [
  {
    icon: <FaEdit />,
    title: "Editar",
    className: "btn-action btn-edit",
    onClick: editarMotoMarca,
  },
  {
    icon: <FaTrash />,
    title: "Eliminar",
    className: "btn-action btn-delete",
    onClick: eliminarMotoMarca,
  },
];

  return (
  <>
  <header className="header">
      <div>
        
          <h1>Moto Marcas</h1>
          <p>Administra las marcas de las motos.</p>
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
        data={motoMarcasFiltradas}
        actions={actions}
      />

      <FormCard
        title={editandoId ? "Editar marca" : "Nueva marca"}
        buttonText={editandoId ? "Actualizar marca" : "Guardar marca"}
        onSubmit={crearMotoMarcas}
      >
        <div className="form-group">
          <label>Nombre</label>
          <input
            type="text"
            placeholder="Ej. Italika"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
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