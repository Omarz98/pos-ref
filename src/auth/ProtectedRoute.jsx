import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import { useAuth } from "./AuthContext";

export default function ProtectedRoute() {
  const {
    autenticado,
    cargando,
  } = useAuth();

  const location = useLocation();

  if (cargando) {
    return (
      <div className="loading-page">
        Cargando sistema...
      </div>
    );
  }

  if (!autenticado) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          desde: location,
        }}
      />
    );
  }

  return <Outlet />;
}