import { useEffect, useState } from "react";
import FormCard from "../components/FormCard";
import DataTable from "../components/DataTable";
import { FaEdit, FaTrash } from "react-icons/fa";
export function MotoModelos() {
  const [motoModelos, setMotoModelos] = useState([]);
  const [motoMarcas, setMotoMarcas] = useState([]);
  const [nombre, setNombre] = useState("");
  const [motoMarcaId, setMotoMarcaId] = useState("");
  const [editandoId, setEditandoId] = useState(null);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    fetchMotoModelos();
    fetchMotoMarcas();
  }, []);

  const motoMarcasMap = Object.fromEntries(
    motoMarcas.map((m) => [m.id, m.nombre]),
  );

  const motoModeloTabla = motoModelos.map((motoModelo) => ({
    ...motoModelo,
    motoMarcaNombre: motoMarcasMap[motoModelo.motoMarcaId] || "",
    
  }));

  const motoModelosFiltrados = motoModeloTabla.filter(
    
    (motoModelos) =>
      motoModelos.activo &&
      motoModelos.nombre.toLowerCase().includes(busqueda.toLowerCase()),
      
  );

  const fetchMotoModelos = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/motomodelos");
      const data = await response.json();
      setMotoModelos(data);
    } catch (error) {
      console.error("Error al obtener MotoModelos", error);
    }
  };

  const fetchMotoMarcas = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/motomarcas");
      const data = await response.json();
      setMotoMarcas(data);
    } catch (error) {
      console.error("Error al obtener motomarcas", error);
    }
  };

  const crearMotoModelos = async () => {
    
    if (!nombre || !motoMarcaId) {
      alert("Completa todos los campos");
      return;
    }

    try {
      const motoModelo = {
        nombre,
        motoMarcaId,
        activo: true,
      };
      if (editandoId) {
        await fetch(`http://localhost:8080/api/motomodelos/${editandoId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(motoModelo),
        });

        setEditandoId(null);
      } else {
        await fetch("http://localhost:8080/api/motomodelos", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(motoModelo),
        });
      }

      limpiarFormulario();
      fetchMotoModelos();
    } catch (error) {
      console.error("Error al guardar motoModelo", error);
    }
  };

  const eliminarMotoModelos = async (motoModelo) => {
    try {
      await fetch(`http://localhost:8080/api/motomodelos/${motoModelo.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: motoModelo.nombre,
          motoMarcaId: motoModelo.motoMarcaId,
          activo: false,
        }),
      });

      fetchMotoModelos();
      fetchMotoMarcas();
    } catch (error) {
      console.error("Error al eliminar motomodelo", error);
    }
  };

  const editarMotoModelos = (motoModelo) => {
    setNombre(motoModelo.nombre);
    setMotoMarcaId(motoModelo.motoMarcaId);
    setEditandoId(motoModelo.id);
  };

  const limpiarFormulario = () => {
    setNombre("");
    setMotoMarcaId("");
    setEditandoId(null);
  };

  const columns = [
    { key: "nombre", label: "Modelo" },
    { key: "motoMarcaNombre", label: "Marca" },
  ];

  const actions = [
    {
      icon: <FaEdit />,
      title: "Editar",
      className: "btn-action btn-edit",
      onClick: editarMotoModelos,
    },
    {
      icon: <FaTrash />,
      title: "Eliminar",
      className: "btn-action btn-delete",
      onClick: eliminarMotoModelos,
    },
  ];

  return (
    <>
      <header className="header">
        <div>
          <h1>Moto Modelos</h1>
          <p>Administra los modelos de las motos.</p>
        </div>
        <div className="header-actions">
          <button
            className="primary-btn"
            onClick={() => {
              setNombre("");
              setMotoMarcaId("");
              setEditandoId(null);
            }}
          >
            + Nuevo Modelo
          </button>
        </div>
      </header>

      <section className="content">
        <DataTable
          title="Listado de modelos"
          searchPlaceholder="Buscar modelo..."
          searchValue={busqueda}
          onSearchChange={setBusqueda}
          columns={columns}
          data={motoModelosFiltrados}
          actions={actions}
        />

        <FormCard
          title={editandoId ? "Editar marca" : "Nueva marca"}
          buttonText={editandoId ? "Actualizar marca" : "Guardar marca"}
          onSubmit={crearMotoModelos}
        >
          <div className="form-group">
            <label>Nombre</label>
            <input
              type="text"
              placeholder="Ej. Vort-X"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Marca</label>

            <select
              value={motoMarcaId}
              onChange={(e) => setMotoMarcaId(e.target.value)}
              className="form-select"
            >
              <option value="">Selecciona una marca</option>

              {motoMarcas.map((motoMarca) => (
                <option key={motoMarca.id} value={motoMarca.id}>
                  {motoMarca.nombre}
                </option>
              ))}
            </select>
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
