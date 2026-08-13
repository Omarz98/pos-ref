import { useState } from "react";
import {
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../auth/AuthContext";
import logo from "../assets/derians-logo.png";


export default function Login() {
  const {
    iniciarSesion,
    autenticado,
  } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const [cargando, setCargando] =
    useState(false);

  if (autenticado) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!username.trim() || !password) {
      setError(
        "Ingresa el usuario y la contraseña"
      );
      return;
    }

    try {
      setCargando(true);
      setError("");

      await iniciarSesion(
        username.trim(),
        password
      );

      const destino =
        location.state?.desde?.pathname ??
        "/";

      navigate(destino, {
        replace: true,
      });
    } catch (err) {
      if (err.response?.status === 401) {
        setError(
          "Usuario o contraseña incorrectos"
        );
      } else {
        setError(
          err.response?.data?.message ??
            "No fue posible iniciar sesión"
        );
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            🏍️
          </div>

          <h1>DERIANS</h1>

          <p>
            Ingresa para administrar el sistema
          </p>
        </div>

        <form
          className="login-form"
          onSubmit={handleSubmit}
        >
          <label>
            Usuario

            <input
              type="text"
              value={username}
              onChange={(event) =>
                setUsername(
                  event.target.value
                )
              }
              placeholder="Ingresa tu usuario"
              autoComplete="username"
              autoFocus
            />
          </label>

          <label>
            Contraseña

            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value
                )
              }
              placeholder="Ingresa tu contraseña"
              autoComplete="current-password"
            />
          </label>

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={cargando}
          >
            {cargando
              ? "Ingresando..."
              : "Iniciar sesión"}
          </button>
        </form>
      </div>
    </div>
  );
}