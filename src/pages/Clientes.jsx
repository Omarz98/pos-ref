import { useEffect, useState, FaMotorcycle } from "react";
import FormCard from "../components/FormCard";
import DataTable from "../components/DataTable";
import { FaEdit, FaTrash } from "react-icons/fa";
import api from "../services/api";

export function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [direccion, setDireccion] = useState("");
  const [rfc, setRfc] = useState("");
  const [activo, setActivo] = useState("");
  const [editandoId, setEditandoId] = useState(null);
  const [busqueda, setBusqueda] = useState("");

  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [mostrarFormularioMoto, setMostrarFormularioMoto] = useState(false);

  const [motoMarcas, setMotoMarcas] = useState([]);
  const [motoModelos, setMotoModelos] = useState([]);
  const [motoVersiones, setMotoVersiones] = useState([]);

  const [marcaId, setMarcaId] = useState("");
  const [modeloId, setModeloId] = useState("");
  const [versionId, setVersionId] = useState("");

  const [anio, setAnio] = useState("");
  const [placas, setPlaca] = useState("");
  const [color, setColor] = useState("");
  const [numeroSerie, setNumeroSerie] = useState("");
  const [kilometraje, setKilometraje] = useState("");

  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    fetchClientes();
  }, []);

  const clientesFiltrados = clientes.filter(
    (cliente) =>
      cliente.activo &&
      cliente.nombre.toLowerCase().includes(busqueda.toLowerCase()),
  );

  const fetchClientes = async () => {
    try {
      const [clientesResponse, motoversionesResponse, motomodelosResponse] =
        await Promise.all([
          api.get("/clientes"),
          api.get("/motoversiones"),
          api.get("/motomodelos"),
        ]);

      const clientesData = clientesResponse.data ?? [];
      const motoversionesData = motoversionesResponse.data ?? [];
      const motomodelosData = motomodelosResponse.data ?? [];

      setClientes(clientesData);
      setMotoVersiones(motoversionesData);
      setMotoModelos(motomodelosData);
    } catch (error) {
      console.error("Error al obtener cliente", error);
      console.error("Código HTTP:", exception.response?.status);

      console.error("Respuesta backend:", exception.response?.data);

      const mensajeBackend = exception.response?.data?.message;

      if (exception.response?.status === 401) {
        setError("La sesión expiró. Inicia sesión nuevamente.");
      } else if (exception.response?.status === 403) {
        setError("No tienes permisos para consultar clientes.");
      } else {
        setError(mensajeBackend || "No fue posible cargar los clientes");
      }
    }
  };

  const abrirFormularioMoto = (cliente) => {
    setClienteSeleccionado(cliente);
    limpiarFormularioMoto();
    setMostrarFormularioMoto(true);
  };

  const limpiarFormularioMoto = () => {
    setMarcaId("");
    setModeloId("");
    setVersionId("");
    setAnio("");
    setPlaca("");
    setColor("");
    setNumeroSerie("");
    setKilometraje("");
  };

  const crearCliente = async () => {
    setMensaje("");
    setError("");
    if (!nombre || !telefono || !email || !direccion) {
      alert("Completa todos los campos");
      return;
    }

    try {
      const cliente = {
        nombre,
        telefono,
        email,
        direccion,
        rfc,
        activo: true,
      };

      if (editandoId) {
        const response = await api.put(`clientes/${editandoId}`, cliente);

        const clienteGuardado = response.data;

        setMensaje(
          `Cliente ${clienteGuardado.nombre} editado correctamente`,
        );
        setEditandoId(null);
      } else {
        const response = await api.post("/clientes", cliente);
         const clienteGuardado = response.data;

        setMensaje(
          `Cliente ${clienteGuardado.nombre} agregado correctamente`,
        );
      }

      limpiarFormulario();
      fetchClientes();
    } catch (error) {
      console.error("Error al guardar cliente", error);
      const mensajeError = "No fue posible registrar el cliente";
      setError(
      typeof mensajeError === "string"
        ? mensajeError
        : JSON.stringify(mensajeError)
    );

    }
  };

  const guardarMoto = async (event) => {
    event.preventDefault();

    if (!clienteSeleccionado) {
      alert("Selecciona un cliente");
      return;
    }

    if (!modeloId || !versionId) {
      alert("Selecciona el modelo y version");
      return;
    }

    const versionSeleccionada = motoVersiones.find(
      (v) => v.id === Number(versionId),
    );

    const moto = {
      clienteId: clienteSeleccionado.id,
      modeloId: Number(modeloId),
      motoVersionId: versionId ? Number(versionId) : null,
      anio: versionSeleccionada ? versionSeleccionada.anio : null,
      placas,
      color,
      numeroSerie,
      kilometrajeActual: kilometraje ? Number(kilometraje) : 0,
      activo: true,
    };
    console.log(JSON.stringify(moto, null, 2));
    try {
      const response = await api.post(`http://localhost:8080/api/clientes/${clienteSeleccionado.id}/motos`, moto);
      
      alert("Motocicleta registrada correctamente");

      limpiarFormularioMoto();
      setMostrarFormularioMoto(false);
      setClienteSeleccionado(null);
    } catch (error) {
      console.error("Error al guardar motocicleta", error);
      alert(error.message);
    }
  };

  const eliminarCliente = async (cliente) => {

  const confirmar = window.confirm(
    `¿Estás seguro de que deseas eliminar al cliente "${cliente.nombre}"?`
  );

  if (!confirmar) {
    return;
  }

  try {
    const clienteAEliminar = {
      nombre: cliente.nombre,
      telefono: cliente.telefono,
      email: cliente.email,
      direccion: cliente.direccion,
      rfc: cliente.rfc,
      activo: false,
    };

    const response = await api.put(
      `/clientes/${cliente.id}`,
      clienteAEliminar
    );

    const clienteEliminado = response.data;

    alert(`Cliente "${clienteEliminado.nombre}" eliminado correctamente`);

    fetchClientes();

  } catch (error) {
    console.error("Error al eliminar cliente", error);

    alert("Ocurrió un error al eliminar el cliente");
  }
};

  const editarCliente = (cliente) => {
    setNombre(cliente.nombre);
    setTelefono(cliente.telefono);
    setEmail(cliente.email);
    setDireccion(cliente.direccion);
    setRfc(cliente.rfc);
    setActivo(cliente.activo);
    setEditandoId(cliente.id);
  };

  const limpiarFormulario = () => {
    setNombre("");
    setTelefono("");
    setEmail("");
    setDireccion("");
    setRfc("");
    setActivo("");
    setEditandoId(null);
  };

  const columns = [
    { key: "nombre", label: "Nombre" },
    { key: "telefono", label: "Telefono" },
    { key: "email", label: "Email" },
    { key: "direccion", label: "Direccion" },
    { key: "rfc", label: "RFC" },
  ];

  const actions = [
    {
      icon: <>🏍️</>,
      title: "Agregar motocicleta",
      className: "btn-action btn-moto",
      onClick: abrirFormularioMoto,
    },
    {
      icon: <FaEdit />,
      title: "Editar",
      className: "btn-action btn-edit",
      onClick: editarCliente,
    },
    {
      icon: <FaTrash />,
      title: "Eliminar",
      className: "btn-action btn-delete",
      onClick: eliminarCliente,
    },
  ];

  return (
    <>
      <header className="header">
        <div>
          <h1>Clientes</h1>
          <p>Administra tus clientes.</p>
        </div>
        <div className="header-actions">
          <button
            className="primary-btn"
            onClick={() => {
              setNombre("");
              setEditandoId(null);
            }}
          >
            + Nuevo cliente
          </button>
        </div>
      </header>

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

      <section className="content">
        <DataTable
          title="Listado de clientes"
          searchPlaceholder="Buscar cliente..."
          searchValue={busqueda}
          onSearchChange={setBusqueda}
          columns={columns}
          data={clientesFiltrados}
          actions={actions}
        />

        <FormCard
          title={editandoId ? "Editar cliente" : "Nuevo cliente"}
          buttonText={editandoId ? "Actualizar cliente" : "Guardar cliente"}
          onSubmit={crearCliente}
        >
          <div className="form-group">
            <label>Nombre</label>
            <input
              type="text"
              placeholder="Ej. Abel"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Telefono</label>
            <input
              type="number"
              placeholder="5510203040"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="ejemplo@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Direccion</label>
            <textarea
              placeholder="CDMX"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>RFC</label>
            <input
              type="text"
              placeholder="XAXXXXXXXX"
              value={rfc}
              onChange={(e) => setRfc(e.target.value)}
            />
          </div>

          {editandoId && (
            <button className="primary-btn" onClick={limpiarFormulario}>
              Cancelar edición
            </button>
          )}
        </FormCard>
        {mostrarFormularioMoto && clienteSeleccionado && (
          <div className="modal-overlay">
            <div className="modal-content modal-moto">
              <div className="modal-header">
                <div>
                  <h2>Agregar motocicleta</h2>
                  <p>
                    Cliente: <strong>{clienteSeleccionado.nombre}</strong>
                  </p>
                </div>

                <button
                  type="button"
                  className="modal-close"
                  onClick={() => setMostrarFormularioMoto(false)}
                >
                  ×
                </button>
              </div>

              <form onSubmit={guardarMoto}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Modelo</label>

                    <select
                      value={modeloId}
                      onChange={(e) => setModeloId(e.target.value)}
                    >
                      <option value="">Selecciona un modelo</option>

                      {motoModelos
                        .filter((modelo) => modelo.activo)
                        .map((modelo) => (
                          <option key={modelo.id} value={modelo.id}>
                            {modelo.nombre}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Versión</label>

                    <select
                      value={versionId}
                      onChange={(e) => setVersionId(e.target.value)}
                      disabled={!modeloId}
                    >
                      <option value="">Sin versión</option>

                      {motoVersiones
                        .filter(
                          (version) =>
                            version.activo &&
                            version.motoModeloId === Number(modeloId),
                        )
                        .map((version) => (
                          <option key={version.id} value={version.id}>
                            {`${version.version} (${version.anio})`}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Placa</label>

                    <input
                      type="text"
                      value={placas}
                      onChange={(e) => setPlaca(e.target.value.toUpperCase())}
                      placeholder="Ej. 45ABC2"
                    />
                  </div>

                  <div className="form-group">
                    <label>Color</label>

                    <input
                      type="text"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      placeholder="Ej. Negro"
                    />
                  </div>

                  <div className="form-group">
                    <label>Número de serie</label>

                    <input
                      type="text"
                      value={numeroSerie}
                      onChange={(e) =>
                        setNumeroSerie(e.target.value.toUpperCase())
                      }
                      placeholder="Número VIN o serie"
                    />
                  </div>

                  <div className="form-group">
                    <label>Kilometraje</label>

                    <input
                      type="number"
                      min="0"
                      value={kilometraje}
                      onChange={(e) => setKilometraje(e.target.value)}
                      placeholder="Ej. 12500"
                    />
                  </div>
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={() => setMostrarFormularioMoto(false)}
                  >
                    Cancelar
                  </button>

                  <button type="submit" className="primary-btn">
                    Guardar motocicleta
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
