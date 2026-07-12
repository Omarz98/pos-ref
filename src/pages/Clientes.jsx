import { useEffect, useState } from "react";
import FormCard from "../components/FormCard";
import DataTable from "../components/DataTable";
import { FaEdit, FaTrash } from "react-icons/fa";
export function Clientes(){

    const [clientes, setClientes] = useState([]);
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [direccion, setDireccion] = useState("");
  const [rfc, setRfc] = useState("");
  const [activo, setActivo] = useState("");
  const [editandoId, setEditandoId] = useState(null);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    fetchClientes();
  }, []);

  const clientesFiltrados = clientes.filter(
  (cliente) =>
    cliente.activo &&
    (
      cliente.nombre.toLowerCase().includes(busqueda.toLowerCase()) 
    )
  );

  const fetchClientes = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/clientes");
      const data = await response.json();
      setClientes(data);
    } catch (error) {
      console.error("Error al obtener cliente", error);
    }
  };

  const crearCliente = async () => {
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
        await fetch(`http://localhost:8080/api/clientes/${editandoId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(cliente),
        });

        setEditandoId(null);
      } else {
        await fetch("http://localhost:8080/api/clientes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(cliente),
        });
      }

      limpiarFormulario();
      fetchClientes();
    } catch (error) {
      console.error("Error al guardar cliente", error);
    }
  };

  const eliminarCliente = async (cliente) => {
    try {
      await fetch(`http://localhost:8080/api/clientes/${cliente.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: cliente.nombre,
          telefono: cliente.telefono,
          email:cliente.email,
          direccion:cliente.direccion,
          rfc:cliente.rfc,
          activo: false,
        }),
      });

      fetchClientes();
    } catch (error) {
      console.error("Error al eliminar cliente", error);
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
        <button className="primary-btn" onClick={() => {
          setNombre("");
          setEditandoId(null);
          }}>
          + Nuevo cliente
        </button>
        
      </div>
    </header>   

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
        title={editandoId ? "Editar categoría" : "Nueva categoría"}
        buttonText={editandoId ? "Actualizar categoría" : "Guardar categoría"}
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
    </section>
    </>
  );
}
