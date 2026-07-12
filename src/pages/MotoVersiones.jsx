import { useEffect, useState } from "react";
import FormCard from "../components/FormCard";
import DataTable from "../components/DataTable";
import { FaEdit, FaTrash } from "react-icons/fa";

export function MotoVersiones() {
  const [motoVersiones, setMotoVersiones] = useState([]);
  const [motoModelos, setMotoModelos] = useState([]);
  const [motoMarcas, setMotoMarcas] = useState([]);
  const [anio, setAnio] = useState("");
  const [cilindraje, setCilindraje] = useState("");
  const [version, setVersion] = useState("");
  const [motoMarcaId, setMotoMarcaId] = useState("");
  const [motoModeloId, setMotoModeloId] = useState("");
  const [motoVersionId, setMotoVersionId] = useState("");
  const [editandoId, setEditandoId] = useState(null);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    fetchMotoVersiones();
    fetchMotoModelos();
  }, []);

  const motoModelosMap = Object.fromEntries(
    motoModelos.map((m) => [m.id, m.nombre]),
  );

  const motoVersionTabla = motoVersiones.map((motoVersion) => ({
    ...motoVersion,
    motoModeloNombre: motoModelosMap[motoVersion.motoModeloId] || "",
  }));

  const motoVersionesFiltrados = motoVersionTabla.filter(
    (motoVersion) =>
      motoVersion.activo &&
      motoVersion.version
        .toLowerCase()
        .includes(busqueda.toLowerCase()),
  );

  const fetchMotoVersiones = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/motoversiones");
      const data = await response.json();
      setMotoVersiones(data);
    } catch (error) {
      console.error("Error al obtener MotoModelos", error);
    }
  };

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

  const crearMotoVersion = async () => {
    if (!motoModeloId || !anio || !cilindraje || !version) {
      alert("Completa todos los campos");
      return;
    }

    try {
      const motoVersion = {
        motoModeloId,
        anio,
        cilindraje,
        version,
        activo: true,
      };
      if (editandoId) {
        await fetch(`http://localhost:8080/api/motoversiones/${editandoId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(motoVersion),
        });

        setEditandoId(null);
      } else {
        await fetch("http://localhost:8080/api/motoversiones", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(motoVersion),
        });
      }

      limpiarFormulario();
      fetchMotoModelos();
      fetchMotoVersiones();
    } catch (error) {
      console.error("Error al guardar motoModelo", error);
    }
  };

  const eliminarMotoVersion = async (motoVersion) => {
    try {
      await fetch(`http://localhost:8080/api/motoversiones/${motoVersion.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          motoModeloId: motoVersion.motoModeloId,
          anio: motoVersion.anio,
          cilindraje: motoVersion.cilindraje,
          version: motoVersion.version,
          activo: false,
        }),
      });

      fetchMotoModelos();
      fetchMotoModelos();
      fetchMotoVersiones();
    } catch (error) {
      console.error("Error al eliminar motoversion", error);
    }
  };

  const editarMotoVersion = (motoVersion) => {
    setMotoModeloId(motoVersion.motoModeloId);
    setAnio(motoVersion.anio);
    setCilindraje(motoVersion.cilindraje);
    setVersion(motoVersion.version);
    setEditandoId(motoVersion.id);
  };

  const limpiarFormulario = () => {
    setMotoModeloId("");
    setAnio("");
    setCilindraje("");
    setVersion("");
    setEditandoId(null);
  };

  const columns = [
    { key: "motoModeloNombre", label: "Modelo" },
    { key: "anio", label: "Año" },
    { key: "cilindraje", label: "Cilindraje" },
    { key: "version", label: "Version" },
  ];

  const actions = [
    {
      icon: <FaEdit />,
      title: "Editar",
      className: "btn-action btn-edit",
      onClick: editarMotoVersion,
    },
    {
      icon: <FaTrash />,
      title: "Eliminar",
      className: "btn-action btn-delete",
      onClick: eliminarMotoVersion,
    },
  ];

  return (
    <>
      <header className="header">
        <div>
          <h1>Moto Verisones</h1>
          <p>Administra las versiones de las motos.</p>
        </div>
        <div className="header-actions">
          <button
            className="primary-btn"
            onClick={() => {
              setMotoModeloId("");
              setAnio("");
              setCilindraje("");
              setVersion("");
              setEditandoId(null);
            }}
          >
            + Nuevo Version
          </button>
        </div>
      </header>

      <section className="content">
        <DataTable
          title="Listado de versiones"
          searchPlaceholder="Buscar version..."
          searchValue={busqueda}
          onSearchChange={setBusqueda}
          columns={columns}
          data={motoVersionesFiltrados}
          actions={actions}
        />

        <FormCard
          title={editandoId ? "Editar version" : "Nueva version"}
          buttonText={editandoId ? "Actualizar version" : "Guardar version"}
          onSubmit={crearMotoVersion}
        >
          <div className="form-group">
            <label>Modelo</label>

            <select
              value={motoModeloId}
              onChange={(e) => setMotoModeloId(e.target.value)}
              className="form-select"
            >
              <option value="">Selecciona un modelo</option>

              {motoModelos.map((motoVersion) => (
                
                <option
                  key={motoVersion.id}
                  value={motoVersion.id}
                >
                  {motoVersion.nombre}
                </option>
                ))}
            </select>
          </div>

          <div className="form-group">
            <label>Año</label>
            <input
              type="number"
              placeholder="2026"
              value={anio}
              onChange={(e) => setAnio(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Cilindraje</label>
            <input
              type="number"
              placeholder="150"
              value={cilindraje}
              onChange={(e) => setCilindraje(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Version</label>
            <input
              type="text"
              placeholder="Ej. LTS"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
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
