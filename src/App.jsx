import "./App.css";
import { NavLink, Route, Routes } from "react-router-dom";
import { useState } from "react";
import { PuntoVenta } from "./pages/PuntoVenta";
import { Home } from "./pages/Home";
import { Proveedores } from "./pages/Proveedores";
import { Marcas } from "./pages/Marcas";
import { Productos } from "./pages/Productos";
import { Footer } from "./components/Footer"
import Categorias from "./pages/Categorias";  

function App() {
  

  const [theme, setTheme] = useState("light");
  
  const [menuOpen, setMenuOpen] = useState(false);

  const cambiarTema = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const closeMenu = () => setMenuOpen(false);


  return (
    <div className="app" data-theme={theme}>
      <button
        className="hamburger-btn"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        ☰
      </button>
      <aside  className={`sidebar ${menuOpen ? "open" : ""}`}>
        <h2> POSREF</h2>

        <nav>
          
          <NavLink to="/pos" onClick={closeMenu} className="menu-link">Punto de venta</NavLink>
          <NavLink to="/categorias" onClick={closeMenu} className="menu-link">Categorias</NavLink>
          <NavLink to="/proveedores" onClick={closeMenu} className="menu-link">Proveedores</NavLink>
          <NavLink to="/marcas" onClick={closeMenu} className="menu-link">Marcas</NavLink>
          <NavLink to="/productos" onClick={closeMenu} className="menu-link">Productos</NavLink>
          <NavLink to="/inventario" onClick={closeMenu} className="menu-link">Inventario</NavLink>
          <NavLink to="/taller" onClick={closeMenu} className="menu-link">Taller</NavLink>
          <NavLink to="/clientes" onClick={closeMenu} className="menu-link">Clientes</NavLink>
          <NavLink to="/reportes" onClick={closeMenu} className="menu-link">Reportes</NavLink>
          <NavLink to="/configuracion" onClick={closeMenu} className="menu-link">Configuración</NavLink>
          <button className="theme-btn" onClick={cambiarTema}>
              {theme === "light" ? "Modo oscuro" : "Modo claro"}
            </button>
        </nav>
      </aside>
      {menuOpen && (
        <div
          className="overlay"
          onClick={() => setMenuOpen(false)}
        />
      )}
      <main className="main">
        
        
        

        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/pos" element={<PuntoVenta/>} />
          <Route path="/categorias" element={<Categorias/>} />
          <Route path="/proveedores" element={<Proveedores/>} />
          <Route path="/marcas" element={<Marcas/>} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/inventario" element={<Inventario />} />
          <Route path="/taller" element={<Taller />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/reportes" element={<Reportes />} />
          <Route path="/configuracion" element={<Configuracion />} />
        </Routes>

        <Footer />
      </main>
    </div>
  );
}



function Inventario() {
  return <h2>Inventario</h2>;
}

function Taller() {
  return <h2>Taller</h2>;
}

function Clientes() {
  return <h2>Clientes</h2>;
}

function Reportes() {
  return <h2>Reportes</h2>;
}

function Configuracion() {
  return <h2>Configuración</h2>;
}


export default App;