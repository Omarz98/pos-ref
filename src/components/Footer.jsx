import {
  FaCircle,
  FaUser,
  FaStore,
  FaCashRegister,
} from "react-icons/fa";


export function Footer() {
  const fecha = new Date().toLocaleDateString("es-MX");

  // Posteriormente estos datos pueden venir del login
  const usuario = "Administrador";
  const sucursal = "Derians";
  const caja = "Caja 1";

  return (
    <footer className="footer">

      <div className="footer-item status">
        <FaCircle />
        <span>Conectado</span>
      </div>

      <div className="footer-item">
        <FaUser />
        <span>{usuario}</span>
      </div>

      <div className="footer-item">
        <FaStore />
        <span>{sucursal}</span>
      </div>

      <div className="footer-item">
        <FaCashRegister />
        <span>{caja}</span>
      </div>

      <div className="footer-version">
        MotoPOS v1.0
      </div>

      <div className="footer-date">
        {fecha}
      </div>

    </footer>
  );
}
