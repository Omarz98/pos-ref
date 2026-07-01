import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

function App() {

  const [categorias, setCategorias] = useState([]);

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");

  // Para editar notas
  const [editandoId, setEditandoId] = useState(null);

  useEffect(() => {
    fetchCategorias();
  }, []);

  const fetchCategorias = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/categorias");
      const data = await response.json();
      setCategorias(data);
    } catch (error) {
      console.error("Error al obtener categorias");
    }
  };

  const crearCategoria = async () => {
    if (!nombre || !descripcion) return alert("Completa todos los campos");

    try {
      if (editandoId) {
        await fetch(`http://localhost:8080/api/categorias/${editandoId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ nombre, descripcion, "activo":true }),
        });

        setEditandoId(null);
      } else {
        await fetch("http://localhost:8080/api/categorias", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ nombre, descripcion, "activo":true }),
        });
      }

      setNombre("");
      setDescripcion("");
      fetchCategorias();
    } catch (error) {
      console.error("Error al guardar o editar nota");
    }
  };

  const eliminarCategoria = async (categoria) => {
    try {
      await fetch(`http://localhost:8080/api/categorias/${categoria.id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
          nombre: categoria.nombre,
          descripcion: categoria.descripcion,
          activo: false,
          }),
      });
       fetchCategorias(); 
    } catch (error) {
      console.log("Error al eliminar categoria");
    }
  };

  const editarCategoria = (categoria) => {
    setNombre(categoria.nombre);
    setDescripcion(categoria.descripcion);
    setEditandoId(categoria.id);
  };

  return (
    <>
      
      
          <h1>Categorias</h1>
          <div className="form">
            <input
              type="text"
              placeholder="Nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />

            <input
              type="text"
              placeholder="Descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          
        <button onClick={crearCategoria}>
          {editandoId ? "Actualizar categoria" : "Crear categoria"}
        </button>
      </div>
        
        
      

      <div className="categorias">
  {categorias.map((categoria) =>
    categoria.activo === true ? (
      <div className="categoria" key={categoria.id}>
        <h3>{categoria.nombre}</h3>
        <p>{categoria.descripcion}</p>

        <button onClick={() => editarCategoria(categoria)}>
          Editar
        </button>
        <button onClick={() => eliminarCategoria(categoria)}>
          Eliminar
        </button>
      </div>
    ) : null
  )}
</div>
      

      
    </>
  )
}

export default App
