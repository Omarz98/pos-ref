import { useEffect, useState } from "react";
import FormCard from "../components/FormCard";
import DataTable from "../components/DataTable";
import { FaEdit, FaTrash } from "react-icons/fa";

export function Marcas() {
  const [marcas, setMarcas] = useState([]);
  const [nombre, setNombre] = useState("");
  const [editandoId, setEditandoId] = useState(null);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    fetchMarcas();
  }, []);

  const marcasFiltrados = marcas.filter(
    (marca) =>
      marca.activo &&
      marca.nombre.toLowerCase().includes(busqueda.toLowerCase()),
  );

  const fetchMarcas = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/marcas");
      const data = await response.json();
      setMarcas(data);
    } catch (error) {
      console.error("Error al obtener Marcas", error);
    }
  };

  const crearMarca = async () => {
    if (!nombre) {
      alert("Completa todos los campos");
      return;
    }

    try {
      const marca = {
        nombre,
        activo: true,
      };

      if (editandoId) {
        await fetch(`http://localhost:8080/api/marcas/${editandoId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(marca),
        });

        setEditandoId(null);
      } else {
        await fetch("http://localhost:8080/api/marcas", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(marca),
        });
      }

      limpiarFormulario();
      fetchMArcas();
    } catch (error) {
      console.error("Error al guardar marca", error);
    }
  };

  const eliminarMarca = async (marca) => {
    try {
      await fetch(`http://localhost:8080/api/marcas/${marca.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: marca.nombre,
          activo: false,
        }),
      });

      fetchMarcas();
    } catch (error) {
      console.error("Error al eliminar marca", error);
    }
  };

  const editarMarca = (marca) => {
    setNombre(marca.nombre);
    setEditandoId(marca.id);
  };

  const limpiarFormulario = () => {
    setNombre("");
  };

  const columns = [{ key: "nombre", label: "Marca" }];

  const actions = [
    {
      icon: <FaEdit />,
      title: "Editar",
      className: "btn-action btn-edit",
      onClick: editarMarca,
    },
    {
      icon: <FaTrash />,
      title: "Eliminar",
      className: "btn-action btn-delete",
      onClick: eliminarMarca,
    },
  ];

  return (
    <>
      <header className="header">
        <div>
          <h1>Marcas</h1>
          <p>Administra las marcas de tus refacciones.</p>
        </div>
        <div className="header-actions">
          <button
            className="primary-btn"
            onClick={() => {
              setNombre("");
              setEditandoId(null);
            }}
          >
            + Nueva marca
          </button>
        </div>
      </header>

      <section className="content">
        <DataTable
          title="Listado de marcas"
          searchPlaceholder="Buscar marca..."
          searchValue={busqueda}
          onSearchChange={setBusqueda}
          columns={columns}
          data={marcasFiltrados}
          actions={actions}
        />

        <FormCard
          title={editandoId ? "Editar marca" : "Agregar marca"}
          buttonText={editandoId ? "Editar marca" : "Guardar marca"}
          onSubmit={crearMarca}
        >
          <div className="form-group">
            <label>Nombre</label>
            <input
              type="text"
              placeholder="marca"
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
