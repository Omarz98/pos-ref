import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import api from "../services/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const usuarioGuardado =
      localStorage.getItem("usuario");

    const token =
      localStorage.getItem("token");

    if (usuarioGuardado && token) {
      try {
        setUsuario(JSON.parse(usuarioGuardado));
      } catch {
        cerrarSesion();
      }
    }

    setCargando(false);
  }, []);

  const iniciarSesion = async (
    username,
    password
  ) => {
    const response = await api.post(
      "/auth/login",
      {
        username,
        password,
      }
    );

    const data = response.data;

    const usuarioAutenticado = {
      id: data.usuarioId,
      nombre: data.nombre,
      username: data.username,
      roles: data.roles ?? [],
      permisos: data.permisos ?? [],
    };

    localStorage.setItem(
      "token",
      data.token
    );

    localStorage.setItem(
      "usuario",
      JSON.stringify(usuarioAutenticado)
    );

    setUsuario(usuarioAutenticado);

    return usuarioAutenticado;
  };

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");

    setUsuario(null);
  };

  const tieneRol = (rol) => {
    return usuario?.roles?.includes(rol) ?? false;
  };

  const tienePermiso = (permiso) => {
    return (
      usuario?.permisos?.includes(permiso) ??
      false
    );
  };

  const value = useMemo(
    () => ({
      usuario,
      cargando,
      autenticado: Boolean(usuario),
      iniciarSesion,
      cerrarSesion,
      tieneRol,
      tienePermiso,
    }),
    [usuario, cargando]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth debe utilizarse dentro de AuthProvider"
    );
  }

  return context;
}