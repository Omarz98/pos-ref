import { NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useState } from "react";
import { FaFileInvoiceDollar, FaCashRegister, FaTags } from "react-icons/fa6";
import { MdNoteAlt, MdOutlineInventory } from "react-icons/md";
import {
  FaUsers,
  FaPeopleCarry,
  FaBoxes,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import {
  MdOutlineFormatListNumbered,
  MdDarkMode,
  MdLightMode,
} from "react-icons/md";
import { FiUserPlus } from "react-icons/fi";
import { GiFullMotorcycleHelmet } from "react-icons/gi";
import { TbReportAnalyticsFilled } from "react-icons/tb";
import { GrDocumentConfig } from "react-icons/gr";
import { PiMotorcycleFill } from "react-icons/pi";

import {
  BsShop,
  BsCart3,
  BsPeople,
  BsBoxSeam,
  BsGear,
  BsTags,
  BsTruck,
  BsPersonBadge,
  BsClipboardData,
  BsWrench,
  BsReceipt,
  BsCashCoin,
  BsChevronLeft,
  BsChevronRight,
} from "react-icons/bs";
import logo from "../assets/react.svg";

export default function Sidebar({ theme, cambiarTema }) {
  const [collapsed, setCollapsed] = useState(false);

  const { usuario, tieneRol, tienePermiso, cerrarSesion } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  const puedeAcceder = (permiso, roles = []) => {
    const permisoValido = !permiso || tienePermiso(permiso);

    const rolValido = roles.length === 0 || roles.some((rol) => tieneRol(rol));

    return permisoValido && rolValido;
  };

  return (
    <>
      <button
        type="button"
        className={`hamburger-btn ${menuOpen ? "active" : ""}`}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={menuOpen}
      >
        {menuOpen ? <FaTimes /> : <FaBars />}
      </button>

      <aside
        className={`sidebar ${menuOpen ? "open" : ""} ${
          collapsed ? "collapsed" : ""
        }`}
      >
        {/* HEADER FIJO */}
        <div className="sidebar-top">
          <div className="derians">
            <NavLink to="/home" className="sidebar-brand" onClick={closeMenu}>
              <PiMotorcycleFill className="menu-icon" />
              {!collapsed && <h2>POS-DERIANS</h2>}
            </NavLink>
          </div>

          <div className="sidebar-header">
            <button
              className="collapse-btn"
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? <BsChevronRight /> : <BsChevronLeft />}
            </button>
          </div>
        </div>

        <nav className="sidebar-nav">
          {/* PUNTO DE VENTA */}
          {puedeAcceder("VENTA_CREAR") && (
            <NavLink
              to="/pos"
              className="menu-link"
              title="POS"
              onClick={closeMenu}
            >
              <BsShop className="menu-icon" />
              {!collapsed && <span>Punto de venta</span>}
            </NavLink>
          )}

          {/* VENTAS */}
          {puedeAcceder("VENTA_VER") && (
            <NavLink
              to="/ventas"
              className="menu-link"
              title="Ventas"
              onClick={closeMenu}
            >
              <FaFileInvoiceDollar className="menu-icon" />
              {!collapsed && <span>Ventas</span>}
            </NavLink>
          )}

          {/* ORDENES */}
          {puedeAcceder("TALLER_ORDEN_VER") && (
            <NavLink
              to="/ordenes"
              className="menu-link"
              title="Órdenes"
              onClick={closeMenu}
            >
              <MdNoteAlt className="menu-icon" />
              {!collapsed && <span>Órdenes</span>}
            </NavLink>
          )}

          {/* TALLER */}
          {puedeAcceder("TALLER_DASHBOARD_VER", [
            "ADMINISTRADOR",
            "ENCARGADO",
            "MECANICO",
          ]) && (
            <NavLink
              to="/taller"
              className="menu-link"
              title="Taller"
              onClick={closeMenu}
            >
              <GiFullMotorcycleHelmet className="menu-icon" />
              {!collapsed && <span>Taller</span>}
            </NavLink>
          )}

          {/* INVENTARIO */}
          {puedeAcceder("INVENTARIO_VER", ["ADMINISTRADOR", "ENCARGADO"]) && (
            <NavLink
              to="/inventario"
              className="menu-link"
              title="Inventario"
              onClick={closeMenu}
            >
              <FaBoxes className="menu-icon" />
              {!collapsed && <span>Inventario</span>}
            </NavLink>
          )}

          {/* USUARIOS */}
          {puedeAcceder("USUARIO_VER", ["ADMINISTRADOR"]) && (
            <NavLink
              to="/usuarios"
              className="menu-link"
              title="Usuarios"
              onClick={closeMenu}
            >
              <FaUsers className="menu-icon" />
              {!collapsed && <span>Usuarios</span>}
            </NavLink>
          )}

          {/* CATEGORÍAS */}
          {puedeAcceder("CATEGORIA_VER") && (
            <NavLink
              to="/categorias"
              className="menu-link"
              title="Categorías"
              onClick={closeMenu}
            >
              <MdOutlineFormatListNumbered className="menu-icon" />
              {!collapsed && <span>Categorías</span>}
            </NavLink>
          )}

          {/* PROVEEDORES */}
          {puedeAcceder("PROVEEDOR_VER") && (
            <NavLink
              to="/proveedores"
              className="menu-link"
              title="Proveedores"
              onClick={closeMenu}
            >
              <FaPeopleCarry className="menu-icon" />
              {!collapsed && <span>Proveedores</span>}
            </NavLink>
          )}

          {/* MARCAS */}
          {puedeAcceder("MARCA_VER") && (
            <NavLink
              to="/marcas"
              className="menu-link"
              title="Marcas"
              onClick={closeMenu}
            >
              <FaTags className="menu-icon" />
              {!collapsed && <span>Marcas</span>}
            </NavLink>
          )}

          {/* PRODUCTOS */}
          {puedeAcceder("PRODUCTO_VER") && (
            <NavLink
              to="/productos"
              className="menu-link"
              title="Productos"
              onClick={closeMenu}
            >
              <BsBoxSeam className="menu-icon" />
              {!collapsed && <span>Productos</span>}
            </NavLink>
          )}

          {/* CLIENTES */}
          {puedeAcceder("CLIENTE_VER") && (
            <NavLink
              to="/clientes"
              className="menu-link"
              title="Clientes"
              onClick={closeMenu}
            >
              <FiUserPlus className="menu-icon" />
              {!collapsed && <span>Clientes</span>}
            </NavLink>
          )}

          {/* REPORTES */}
          {puedeAcceder("REPORTE_VER") && (
            <NavLink
              to="/reportes"
              className="menu-link"
              title="Reportes"
              onClick={closeMenu}
            >
              <TbReportAnalyticsFilled className="menu-icon" />
              {!collapsed && <span>Reportes</span>}
            </NavLink>
          )}

          {/* CONFIGURACIÓN */}
          {puedeAcceder("CONFIGURACION_VER", ["ADMINISTRADOR"]) && (
            <NavLink
              to="/configuracion"
              className="menu-link"
              title="Configuración"
              onClick={closeMenu}
            >
              <GrDocumentConfig className="menu-icon" />
              {!collapsed && <span>Configuración</span>}
            </NavLink>
          )}
        </nav>
        {/* SWITCH MODO OSCURO */}
        {/* FOOTER FIJO */}
        <div className="sidebar-footer">
          <div className="sidebar-theme">
            <button
              type="button"
              className={`theme-switch ${theme === "dark" ? "active" : ""}`}
              onClick={cambiarTema}
              role="switch"
              aria-checked={theme === "dark"}
              aria-label="Cambiar modo oscuro"
            >
              <span className="theme-switch-icon theme-sun">
                <MdLightMode />
              </span>

              <span className="theme-switch-icon theme-moon">
                <MdDarkMode />
              </span>

              <span className="theme-switch-thumb" />
            </button>
          </div>
        </div>
      </aside>
      {menuOpen && (
        <div className="overlay" onClick={() => setMenuOpen(false)} />
      )}
    </>
  );
}
