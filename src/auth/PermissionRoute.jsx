import {
  Navigate,
  Outlet,
} from "react-router-dom";

import { useAuth } from "./AuthContext";

export default function PermissionRoute({
  permiso,
  roles = [],
}) {
  
  const {
    tienePermiso,
    tieneRol,
  } = useAuth();

  const autorizadoPorPermiso =
    permiso
      ? tienePermiso(permiso)
      : false;

  const autorizadoPorRol =
    roles.some((rol) =>
      tieneRol(rol)
    );

  if (
    !autorizadoPorPermiso &&
    !autorizadoPorRol
  ) {
    return (
      <Navigate
        to="/sin-permiso"
        replace
      />
    );
  }

  return <Outlet />;
}