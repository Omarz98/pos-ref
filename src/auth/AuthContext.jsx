
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import api from "../services/api.js";

import {
  TIEMPO_INACTIVIDAD,
  CLAVE_ULTIMA_ACTIVIDAD,
  obtenerExpiracionToken,
  sesionExpirada,
  limpiarSesion,
} from "../auth/session.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  // ==========================================
  // CERRAR SESIÓN
  // ==========================================
  const cerrarSesion = useCallback(() => {
    limpiarSesion();
    setUsuario(null);
  }, []);

  // ==========================================
  // RECUPERAR SESIÓN AL CARGAR POSREF
  // ==========================================
  useEffect(() => {
    const usuarioGuardado =
      localStorage.getItem("usuario");

    if (usuarioGuardado && !sesionExpirada()) {
      try {
        setUsuario(JSON.parse(usuarioGuardado));
      } catch {
        limpiarSesion();
      }
    } else {
      limpiarSesion();
    }

    setCargando(false);
  }, []);

  // ==========================================
  // DETECTAR CIERRE DE SESIÓN DESDE AXIOS
  // ==========================================
  useEffect(() => {
    const manejarSesionExpirada = () => {
      cerrarSesion();
    };

    window.addEventListener(
      "posref:sesion-expirada",
      manejarSesionExpirada
    );

    return () => {
      window.removeEventListener(
        "posref:sesion-expirada",
        manejarSesionExpirada
      );
    };
  }, [cerrarSesion]);

  // ==========================================
  // CONTROL DE EXPIRACIÓN E INACTIVIDAD
  // ==========================================
  useEffect(() => {
    if (!usuario) return;

    let temporizador;
    let ultimaActualizacion = 0;

    const programarCierre = () => {
      clearTimeout(temporizador);

      if (sesionExpirada()) {
        cerrarSesion();
        return;
      }

      const token = localStorage.getItem("token");

      const expiracion = obtenerExpiracionToken(token);

      const ultimaActividad = Number(
        localStorage.getItem(CLAVE_ULTIMA_ACTIVIDAD)
      );

      const vencimientoInactividad =
        ultimaActividad + TIEMPO_INACTIVIDAD;

      const siguienteVencimiento = Math.min(
        expiracion,
        vencimientoInactividad
      );

      temporizador = setTimeout(
        programarCierre,
        Math.max(
          1,
          siguienteVencimiento - Date.now()
        )
      );
    };

    // Registrar actividad del usuario
    const registrarActividad = () => {
      if (sesionExpirada()) {
        cerrarSesion();
        return;
      }

      const ahora = Date.now();

      // Evitar escrituras excesivas
      if (ahora - ultimaActualizacion < 1000) {
        return;
      }

      ultimaActualizacion = ahora;

      localStorage.setItem(
        CLAVE_ULTIMA_ACTIVIDAD,
        String(ahora)
      );

      programarCierre();
    };

    // Verificar al regresar a la pestaña
    const verificarSesion = () => {
      if (sesionExpirada()) {
        cerrarSesion();
      } else {
        programarCierre();
      }
    };

    const eventos = [
      "pointerdown",
      "keydown",
      "scroll",
      "touchstart",
    ];

    eventos.forEach((evento) => {
      window.addEventListener(
        evento,
        registrarActividad,
        { passive: true }
      );
    });

    document.addEventListener(
      "visibilitychange",
      verificarSesion
    );

    window.addEventListener(
      "focus",
      verificarSesion
    );

    window.addEventListener(
      "storage",
      verificarSesion
    );

    programarCierre();

    return () => {
      clearTimeout(temporizador);

      eventos.forEach((evento) => {
        window.removeEventListener(
          evento,
          registrarActividad
        );
      });

      document.removeEventListener(
        "visibilitychange",
        verificarSesion
      );

      window.removeEventListener(
        "focus",
        verificarSesion
      );

      window.removeEventListener(
        "storage",
        verificarSesion
      );
    };
  }, [usuario, cerrarSesion]);

  // ==========================================
  // INICIAR SESIÓN
  // ==========================================
  const iniciarSesion = useCallback(
    async (username, password) => {
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

      localStorage.setItem(
        CLAVE_ULTIMA_ACTIVIDAD,
        String(Date.now())
      );

      setUsuario(usuarioAutenticado);

      return usuarioAutenticado;
    },
    []
  );

  // ==========================================
  // ROLES Y PERMISOS
  // ==========================================
  const tieneRol = useCallback(
    (rol) =>
      usuario?.roles?.includes(rol) ?? false,
    [usuario]
  );

  const tienePermiso = useCallback(
    (permiso) =>
      usuario?.permisos?.includes(permiso) ?? false,
    [usuario]
  );

  // ==========================================
  // CONTEXTO
  // ==========================================
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
    [
      usuario,
      cargando,
      iniciarSesion,
      cerrarSesion,
      tieneRol,
      tienePermiso,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ==========================================
// HOOK DE AUTENTICACIÓN
// ==========================================
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth debe utilizarse dentro de AuthProvider"
    );
  }

  return context;
}
