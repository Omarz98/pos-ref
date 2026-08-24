import { NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useState } from "react";
import { FaFileInvoiceDollar, FaCashRegister, FaTags } from "react-icons/fa6";
import { MdNoteAlt, MdOutlineInventory } from "react-icons/md";
import { FaUsers, FaPeopleCarry } from "react-icons/fa";
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

  return (
    <>
      <button className="hamburger-btn" onClick={() => setMenuOpen(!menuOpen)}>
        ☰
      </button>
      <aside
        className={`sidebar ${menuOpen ? "open" : ""} ${
          collapsed ? "collapsed" : ""
        }`}
      >
        <div className="derians">
          <NavLink to="/home" className="sidebar-brand" onClick={closeMenu}>
            {/*<img src={logo} alt="MotoPOS" className="logo" />*/}

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
        <nav>
          <NavLink to="/pos" className="menu-link" title="POS">
            <BsShop className="menu-icon" />
            {!collapsed && <span>Punto de venta</span>}
          </NavLink>
          <NavLink to="/ventas" className="menu-link" title="Ventas">
            <FaFileInvoiceDollar className="menu-icon" />
            {!collapsed && <span>Ventas</span>}
          </NavLink>
          <NavLink to="/ordenes" className="menu-link" title="Ordenes">
            <MdNoteAlt className="menu-icon" />
            {!collapsed && <span>Ordenes</span>}
          </NavLink>
          <NavLink to="/taller" title="Taller" className="menu-link">
            <GiFullMotorcycleHelmet className="menu-icon" />
            {!collapsed && <span>Taller</span>}
          </NavLink>
          <NavLink to="/usuarios" className="menu-link" title="Usuarios">
            <FaUsers className="menu-icon" />
            {!collapsed && <span>Usuarios</span>}
          </NavLink>
          {/*<NavLink to="/caja" className="menu-link" title="Cajas">
            <FaCashRegister className="menu-icon" />
            {!collapsed && <span>Cajas</span>}
          </NavLink>*/}
          <NavLink to="/categorias" title="Categorias" className="menu-link">
            <MdOutlineFormatListNumbered className="menu-icon" />
            {!collapsed && <span>Categorias</span>}
          </NavLink>
          <NavLink to="/proveedores" title="Proveedores" className="menu-link">
            <FaPeopleCarry className="menu-icon" />
            {!collapsed && <span>Proveedores</span>}
          </NavLink>
          <NavLink to="/marcas" title="Marcas" className="menu-link">
            <FaTags className="menu-icon" />
            {!collapsed && <span>Marcas</span>}
          </NavLink>
          <NavLink to="/productos" className="menu-link" title="Productos">
            <BsBoxSeam className="menu-icon" />

            {!collapsed && <span>Productos</span>}
          </NavLink>
          {/*
          <NavLink to="/motomarcas" onClick={closeMenu} className="menu-link">
            Moto Marcas
          </NavLink>
          <NavLink to="/motomodelos" onClick={closeMenu} className="menu-link">
            Moto Modelos
          </NavLink>
          <NavLink to="/motoversion" onClick={closeMenu} className="menu-link">
            Moto Versiones
          </NavLink>
          */}
          <NavLink to="/clientes" title="Clientes" className="menu-link">
            <FiUserPlus className="menu-icon" />
            {!collapsed && <span>Clientes</span>}
          </NavLink>
          {/*
          <NavLink to="/servicios" onClick={closeMenu} className="menu-link">
            Servicios
          </NavLink>
          */}
          <NavLink to="/inventario" title="Inventario" className="menu-link">
            <MdOutlineInventory className="menu-icon" />
            {!collapsed && <span>Inventario</span>}
          </NavLink>
          
          <NavLink to="/reportes" title="Reportes" className="menu-link">
            <TbReportAnalyticsFilled className="menu-icon" />
            {!collapsed && <span>Reportes</span>}
          </NavLink>
          <NavLink
            to="/configuracion"
            title="Configuración"
            className="menu-link"
          >
            <GrDocumentConfig className="menu-icon" />
            {!collapsed && <span>Configuración</span>}
          </NavLink>
          <button className="btn-primary" onClick={cambiarTema}>
            {theme === "light" ? <MdDarkMode /> : <MdLightMode />}
          </button>
        </nav>
      </aside>
      {menuOpen && (
        <div className="overlay" onClick={() => setMenuOpen(false)} />
      )}
    </>
  );
}
