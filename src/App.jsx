import "./App.css";
import {
  NavLink,
  Route,
  Routes,
  BrowserRouter,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { useAuth } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";
import PermissionRoute from "./auth/PermissionRoute";
import { useState } from "react";
/*import { PuntoVenta } from "./pages/PuntoVenta";*/
import { PuntoVenta } from "./pages/PuntoVenta/PuntoVenta";
import { Home } from "./pages/Home";
import { Proveedores } from "./pages/Proveedores";
import { Marcas } from "./pages/Marcas";
import { Productos } from "./pages/Productos";
import { Footer } from "./components/Footer";
import Categorias from "./pages/Categorias";
import { MotoMarcas } from "./pages/MotoMarcas";
import { MotoModelos } from "./pages/MotoModelos";
import { MotoVersiones } from "./pages/MotoVersiones";
import { Clientes } from "./pages/Clientes";
import { Servicios } from "./pages/Servicios";
import { Ventas } from "./pages/Ventas";
import { Ordenes } from "./pages/Ordenes";
import Configuracion from "./pages/configuracion/Configuracion";
import Login from "./pages/Login";
import SinPermiso from "./pages/SinPermiso";
import Sidebar from "./pages/Sidebar";
import { MainLayout } from "./pages/MainLayout";
import { Usuarios } from "./pages/Usuarios";
import { Caja } from "./pages/Caja";

function App() {
  const [theme, setTheme] = useState("light");
  const cambiarTema = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const { autenticado } = useAuth();

  return (
    <div data-theme={theme}>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/sin-permiso" element={<SinPermiso />} />

        {/* Rutas protegidas */}
        <Route element={<ProtectedRoute />}>
          <Route
            element={<MainLayout theme={theme} cambiarTema={cambiarTema} />}
          >
            <Route index element={<Navigate to="/pos" replace />} />

            <Route
              element={
                <PermissionRoute
                  permiso="VENTA_CREAR"
                  roles={["ADMINISTRADOR"]}
                />
              }
            >
              <Route path="pos" element={<PuntoVenta />} />
            </Route>

            <Route
              element={
                <PermissionRoute
                  permiso="VENTA_VER"
                  roles={["ADMINISTRADOR"]}
                />
              }
            >
              <Route path="ventas" element={<Ventas />} />
            </Route>

            <Route
              element={
                <PermissionRoute
                  permiso="PRODUCTO_VER"
                  roles={["ADMINISTRADOR"]}
                />
              }
            >
              <Route path="productos" element={<Productos />} />
            </Route>

            <Route
              element={
                <PermissionRoute
                  permiso="TALLER_VER"
                  roles={["ADMINISTRADOR"]}
                />
              }
            >
              <Route path="ordenes" element={<Ordenes />} />
            </Route>

            <Route
              element={
                <PermissionRoute
                  permiso="USUARIO_VER"
                  roles={["ADMINISTRADOR"]}
                />
              }
            >
              <Route path="/usuarios" element={<Usuarios />} />
            </Route>
            
            <Route
              element={
                <PermissionRoute
                  permiso="CAJA_VER"
                  roles={["ADMINISTRADOR", "CAJERO"]}
                />
              }
            >
              <Route path="/caja" element={<Caja />} />
            </Route>

            <Route
              element={
                <PermissionRoute
                  permiso="CATEGORIA_VER"
                  roles={["ADMINISTRADOR"]}
                />
              }
            >
              <Route path="/categorias" element={<Categorias />} />
            </Route>

            <Route
              element={
                <PermissionRoute
                  permiso="PROVEEDOR_VER"
                  roles={["ADMINISTRADOR"]}
                />
              }
            >
              <Route path="/proveedores" element={<Proveedores />} />
            </Route>

            <Route
              element={
                <PermissionRoute
                  permiso="MARCA_VER"
                  roles={["ADMINISTRADOR"]}
                />
              }
            >
              <Route path="/marcas" element={<Marcas />} />
            </Route>

            <Route
              element={
                <PermissionRoute
                  permiso="CLIENTE_VER"
                  roles={["ADMINISTRADOR"]}
                />
              }
            >
              <Route path="/clientes" element={<Clientes />} />
            </Route>


            <Route
              element={
                <PermissionRoute
                  permiso="CONFIGURACION_VER"
                  roles={["ADMINISTRADOR"]}
                />
              }
            >
              <Route path="/configuracion" element={<Configuracion />} />
            </Route>

            
            <Route
              element={
                <PermissionRoute
                  roles={["ADMINISTRADOR"]}
                />
              }
            >
              <Route path="/home" element={<Home />} />
            </Route>


          </Route>

        </Route>

        {/* Ruta desconocida */}
        <Route path="*" element={<Navigate to="/pos" replace />} />
      </Routes>
    </div>
  );
}

function Inventario() {
  return <h2>Inventario</h2>;
}

function Taller() {
  return <h2>Taller</h2>;
}

function Reportes() {
  return <h2>Reportes</h2>;
}

function Layout() {
  return <h2>Layout</h2>;
}

export default App;
