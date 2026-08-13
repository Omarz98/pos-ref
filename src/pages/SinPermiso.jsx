import { useNavigate } from "react-router-dom";

export default function SinPermiso() {
  const navigate = useNavigate();

  return (
    <div className="error-page">
      <h1>403</h1>

      <h2>Acceso no autorizado</h2>

      <p>
        Tu usuario no tiene permiso para
        consultar este módulo.
      </p>

      <button
        onClick={() => navigate("/")}
      >
        Regresar al inicio
      </button>
    </div>
  );
}