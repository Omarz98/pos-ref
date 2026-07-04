import { useEffect, useState } from "react";
import FormCard from "../components/FormCard";
import DataTable from "../components/DataTable";
import { FaEdit, FaTrash } from "react-icons/fa";

export function Proveedores() {
  const [proveedores, setProveedores] = useState([]);
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
    const [email, setEmail] = useState("");
    const [direccion, setDireccion] = useState("");
    const [contacto, setContacto] = useState("");
  const [editandoId, setEditandoId] = useState(null);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    fetchProveedores();
  }, []);

  const proveedoresFiltrados = proveedores.filter(
    (proveedor) =>
      proveedor.activo &&
      (proveedor.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        proveedor.contacto.toLowerCase().includes(busqueda.toLowerCase())),
  );

  const fetchProveedores = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/proveedores");
      const data = await response.json();
      setProveedores(data);
    } catch (error) {
      console.error("Error al obtener Proveedores", error);
    }
  };

  const crearProveedor = async () => {
    if (!nombre || !telefono || !email || !direccion || !contacto ) {
      alert("Completa todos los campos");
      return;
    }

    try {
      const proveedor = {
        nombre,
        telefono,
        email,
        direccion,
        contacto,
        activo: true,
      };

      if (editandoId) {
        await fetch(`http://localhost:8080/api/proveedores/${editandoId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(proveedor),
        });

        setEditandoId(null);
      } else {
        await fetch("http://localhost:8080/api/proveedores", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(proveedor),
        });
      }

      limpiarFormulario();
      fetchProveedores();
    } catch (error) {
      console.error("Error al guardar proveedor", error);
    }
  };

  const eliminarProveedor = async (proveedor) => {
    try {
      await fetch(`http://localhost:8080/api/proveedores/${proveedor.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
        nombre:proveedor.nombre,
        telefono:proveedor.telefono,
        email:proveedor.email,
        direccion:proveedor.direccion,
        contacto:proveedor.contacto,
        activo: false,
        }),
      });

      fetchProveedores();
    } catch (error) {
      console.error("Error al eliminar proveedor", error);
    }
  };

  const editarProveedor = (proveedor) => {
    setNombre(proveedor.nombre);
    setTelefono(proveedor.telefono);
    setEmail(proveedor.email);
    setDireccion(proveedor.direccion);
    setContacto(proveedor.contacto);
    setEditandoId(proveedor.id);
  };

  const limpiarFormulario = () => {
    setNombre("");
    setTelefono("");
    setEmail("");
    setDireccion("");
    setContacto("");
    setEditandoId(null);
  };

  const columns = [
    { key: "nombre", label: "Nombre" },
    { key: "telefono", label: "Telefono" },
    { key: "email", label: "Email" },
    { key: "direccion", label: "Direccion" },
    { key: "contacto", label: "Contacto" },
  ];

  const actions = [
    {
      icon: <FaEdit />,
      title: "Editar",
      className: "btn-action btn-edit",
      onClick: editarProveedor,
    },
    {
      icon: <FaTrash />,
      title: "Eliminar",
      className: "btn-action btn-delete",
      onClick: eliminarProveedor,
    },
  ];

  return (
    <>
      <header className="header">
        <div>
          <h1>Proveedores</h1>
          <p>Administra los proveedores de tus refacciones.</p>
        </div>
        <div className="header-actions">
          <button
            className="primary-btn"
            onClick={() => {
              setNombre("");
                setTelefono("");
                setEmail("");
                setDireccion("");
                setContacto("");
              setEditandoId(null);
            }}
          >
            + Nuevo proveedor
          </button>
        </div>
      </header>

      <section className="content">
        <DataTable
          title="Listado de proveedores"
          searchPlaceholder="Buscar proveedor..."
          searchValue={busqueda}
          onSearchChange={setBusqueda}
          columns={columns}
          data={proveedoresFiltrados}
          actions={actions}
        />

        <FormCard
          title={editandoId ? "Editar proveedor" : "Agregar proveedor"}
          buttonText={editandoId ? "Editar proveedor" : "Guardar proveedor"}
          onSubmit={crearProveedor}
        >
          <div className="form-group">
            <label>Nombre</label>
            <input
              type="text"
              placeholder="Proveedor motorefa"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Telefono</label>
            <input
                type="number"
              placeholder="5555555555"
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
            <input
              type="text"
              placeholder="CDMX, 06600"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Contacto</label>
            <input
              type="text"
              placeholder="Laura Ramirez"
              value={contacto}
              onChange={(e) => setContacto(e.target.value)}
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
