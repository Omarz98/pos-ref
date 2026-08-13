import { useEffect, useMemo, useState } from "react";

import api from "../services/api";
import { useAuth } from "../auth/AuthContext";

const formularioInicial = {
  nombre: "",
  username: "",
  email: "",
  password: "",
  activo: true,
  rolesIds: [],
};

export function Usuarios() {
  const {
    tienePermiso,
    tieneRol,
  } = useAuth();

  const [usuarios, setUsuarios] =
    useState([]);

  const [roles, setRoles] =
    useState([]);

  const [formulario, setFormulario] =
    useState(formularioInicial);

  const [editandoId, setEditandoId] =
    useState(null);

  const [busqueda, setBusqueda] =
    useState("");

  const [mostrarFormulario, setMostrarFormulario] =
    useState(false);

  const [mostrarPassword, setMostrarPassword] =
    useState(false);

  const [usuarioPassword, setUsuarioPassword] =
    useState(null);

  const [nuevaPassword, setNuevaPassword] =
    useState("");

  const [cargando, setCargando] =
    useState(false);

  const [error, setError] =
    useState("");

  const [mensaje, setMensaje] =
    useState("");

  const esAdministrador =
    tieneRol("ADMINISTRADOR");

  const puedeCrear =
    esAdministrador ||
    tienePermiso("USUARIO_CREAR");

  const puedeEditar =
    esAdministrador ||
    tienePermiso("USUARIO_EDITAR");

  const puedeCambiarEstado =
    esAdministrador ||
    tienePermiso(
      "USUARIO_CAMBIAR_ESTADO"
    );

  const puedeCambiarPassword =
    esAdministrador ||
    tienePermiso(
      "USUARIO_RESTABLECER_PASSWORD"
    );

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    setError("");
    setCargando(true);

    try {
      const [
        usuariosResponse,
        rolesResponse,
      ] = await Promise.all([
        api.get("/usuarios"),
        api.get("/roles"),
      ]);

      setUsuarios(
        usuariosResponse.data ?? []
      );

      setRoles(
        (rolesResponse.data ?? []).filter(
          (rol) => rol.activo !== false
        )
      );
    } catch (exception) {
      console.error(
        "Error al cargar usuarios:",
        exception
      );

      setError(
        obtenerMensajeError(
          exception,
          "No fue posible consultar los usuarios"
        )
      );
    } finally {
      setCargando(false);
    }
  }

  function handleChange(event) {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  }

  function handleRolChange(rolId) {
    setFormulario((anterior) => {
      const seleccionado =
        anterior.rolesIds.includes(rolId);

      return {
        ...anterior,
        rolesIds: seleccionado
          ? anterior.rolesIds.filter(
              (id) => id !== rolId
            )
          : [
              ...anterior.rolesIds,
              rolId,
            ],
      };
    });
  }

  function nuevoUsuario() {
    setEditandoId(null);
    setFormulario(formularioInicial);
    setError("");
    setMensaje("");
    setMostrarFormulario(true);
  }

  function editarUsuario(usuario) {
    setEditandoId(usuario.id);

    setFormulario({
      nombre: usuario.nombre ?? "",
      username: usuario.username ?? "",
      email: usuario.email ?? "",
      password: "",
      activo: usuario.activo !== false,
      rolesIds:
        usuario.roles?.map(
          (rol) => rol.id
        ) ?? [],
    });

    setError("");
    setMensaje("");
    setMostrarFormulario(true);
  }

  function cancelarFormulario() {
    setEditandoId(null);
    setFormulario(formularioInicial);
    setMostrarFormulario(false);
  }

  async function guardarUsuario(event) {
    event.preventDefault();

    setError("");
    setMensaje("");

    if (!formulario.nombre.trim()) {
      setError("El nombre es obligatorio");
      return;
    }

    if (
      !editandoId &&
      !formulario.username.trim()
    ) {
      setError(
        "El nombre de usuario es obligatorio"
      );
      return;
    }

    if (
      !editandoId &&
      formulario.password.length < 8
    ) {
      setError(
        "La contraseña debe tener al menos 8 caracteres"
      );
      return;
    }

    if (formulario.rolesIds.length === 0) {
      setError(
        "Selecciona al menos un rol"
      );
      return;
    }

    setCargando(true);

    try {
      if (editandoId) {
        await api.put(
          `/usuarios/${editandoId}`,
          {
            nombre:
              formulario.nombre.trim(),
            email:
              formulario.email.trim() ||
              null,
            activo: formulario.activo,
            rolesIds:
              formulario.rolesIds,
          }
        );

        setMensaje(
          "Usuario actualizado correctamente"
        );
      } else {
        await api.post("/usuarios", {
          nombre:
            formulario.nombre.trim(),
          username:
            formulario.username.trim(),
          email:
            formulario.email.trim() ||
            null,
          password:
            formulario.password,
          activo:
            formulario.activo,
          rolesIds:
            formulario.rolesIds,
        });

        setMensaje(
          "Usuario registrado correctamente"
        );
      }

      cancelarFormulario();
      await cargarDatos();
    } catch (exception) {
      console.error(
        "Error al guardar usuario:",
        exception
      );

      setError(
        obtenerMensajeError(
          exception,
          "No fue posible guardar el usuario"
        )
      );
    } finally {
      setCargando(false);
    }
  }

  async function cambiarEstado(usuario) {
    const nuevoEstado = !usuario.activo;

    const accion = nuevoEstado
      ? "activar"
      : "desactivar";

    const confirmado = window.confirm(
      `¿Deseas ${accion} al usuario ${usuario.username}?`
    );

    if (!confirmado) {
      return;
    }

    setError("");
    setMensaje("");

    try {
      await api.patch(
        `/usuarios/${usuario.id}/estado`,
        {
          activo: nuevoEstado,
        }
      );

      setMensaje(
        `Usuario ${
          nuevoEstado
            ? "activado"
            : "desactivado"
        } correctamente`
      );

      await cargarDatos();
    } catch (exception) {
      console.error(exception);

      setError(
        obtenerMensajeError(
          exception,
          "No fue posible cambiar el estado"
        )
      );
    }
  }

  function abrirCambioPassword(usuario) {
    setUsuarioPassword(usuario);
    setNuevaPassword("");
    setMostrarPassword(true);
    setError("");
    setMensaje("");
  }

  async function guardarNuevaPassword(
    event
  ) {
    event.preventDefault();

    if (nuevaPassword.length < 8) {
      setError(
        "La contraseña debe tener al menos 8 caracteres"
      );
      return;
    }

    try {
      await api.patch(
        `/usuarios/${usuarioPassword.id}/password`,
        {
          nuevaPassword,
        }
      );

      setMostrarPassword(false);
      setUsuarioPassword(null);
      setNuevaPassword("");

      setMensaje(
        "Contraseña actualizada correctamente"
      );
    } catch (exception) {
      console.error(exception);

      setError(
        obtenerMensajeError(
          exception,
          "No fue posible actualizar la contraseña"
        )
      );
    }
  }

  const usuariosFiltrados =
    useMemo(() => {
      const termino =
        busqueda.trim().toLowerCase();

      if (!termino) {
        return usuarios;
      }

      return usuarios.filter((usuario) => {
        const rolesTexto =
          usuario.roles
            ?.map((rol) => rol.nombre)
            .join(" ") ?? "";

        return [
          usuario.nombre,
          usuario.username,
          usuario.email,
          rolesTexto,
        ]
          .filter(Boolean)
          .some((valor) =>
            valor
              .toLowerCase()
              .includes(termino)
          );
      });
    }, [usuarios, busqueda]);

  return (
    <section className="usuarios-page">
      <header className="usuarios-header">
        <div>
          <h1>Usuarios</h1>

          <p>
            Administra accesos, roles y
            estados de los usuarios.
          </p>
        </div>

        {puedeCrear && (
          <button
            type="button"
            className="btn-primary"
            onClick={nuevoUsuario}
          >
            + Nuevo usuario
          </button>
        )}
      </header>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {mensaje && (
        <div className="alert alert-success">
          {mensaje}
        </div>
      )}

      <div className="usuarios-toolbar">
        <input
          type="search"
          value={busqueda}
          onChange={(event) =>
            setBusqueda(event.target.value)
          }
          placeholder="Buscar por nombre, usuario, correo o rol..."
        />

        <span>
          {usuariosFiltrados.length} usuarios
        </span>
      </div>

      {cargando && usuarios.length === 0 ? (
        <div className="usuarios-loading">
          Cargando usuarios...
        </div>
      ) : (
        <div className="usuarios-table-wrapper">
          <table className="usuarios-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Usuario</th>
                <th>Correo</th>
                <th>Roles</th>
                <th>Estado</th>
                <th>Registro</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {usuariosFiltrados.map(
                (usuario) => (
                  <tr key={usuario.id}>
                    <td>
                      {usuario.nombre}
                    </td>

                    <td>
                      <strong>
                        {usuario.username}
                      </strong>
                    </td>

                    <td>
                      {usuario.email || "—"}
                    </td>

                    <td>
                      <div className="roles-list">
                        {usuario.roles?.map(
                          (rol) => (
                            <span
                              key={rol.id}
                              className="role-badge"
                            >
                              {rol.nombre}
                            </span>
                          )
                        )}
                      </div>
                    </td>

                    <td>
                      <span
                        className={
                          usuario.activo
                            ? "status status-active"
                            : "status status-inactive"
                        }
                      >
                        {usuario.activo
                          ? "Activo"
                          : "Inactivo"}
                      </span>
                    </td>

                    <td>
                      {usuario.fechaCreacion
                        ? new Date(
                            usuario.fechaCreacion
                          ).toLocaleString(
                            "es-MX"
                          )
                        : "—"}
                    </td>

                    <td>
                      <div className="table-actions">
                        {puedeEditar && (
                          <button
                            type="button"
                            onClick={() =>
                              editarUsuario(
                                usuario
                              )
                            }
                          >
                            Editar
                          </button>
                        )}

                        {puedeCambiarPassword && (
                          <button
                            type="button"
                            onClick={() =>
                              abrirCambioPassword(
                                usuario
                              )
                            }
                          >
                            Contraseña
                          </button>
                        )}

                        {puedeCambiarEstado && (
                          <button
                            type="button"
                            className={
                              usuario.activo
                                ? "btn-danger"
                                : "btn-success"
                            }
                            onClick={() =>
                              cambiarEstado(
                                usuario
                              )
                            }
                          >
                            {usuario.activo
                              ? "Desactivar"
                              : "Activar"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              )}

              {usuariosFiltrados.length === 0 && (
                <tr>
                  <td
                    colSpan="7"
                    className="empty-row"
                  >
                    No se encontraron usuarios.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {mostrarFormulario && (
        <div className="modal-overlay">
          <div className="usuario-modal">
            <header className="modal-header">
              <div>
                <h2>
                  {editandoId
                    ? "Editar usuario"
                    : "Nuevo usuario"}
                </h2>

                <p>
                  Captura la información y
                  asigna sus roles.
                </p>
              </div>

              <button
                type="button"
                onClick={cancelarFormulario}
              >
                ✕
              </button>
            </header>

            <form
              className="usuario-form"
              onSubmit={guardarUsuario}
            >
              <label>
                Nombre completo

                <input
                  name="nombre"
                  value={formulario.nombre}
                  onChange={handleChange}
                  placeholder="Nombre del usuario"
                />
              </label>

              <label>
                Usuario

                <input
                  name="username"
                  value={formulario.username}
                  onChange={handleChange}
                  placeholder="Nombre de acceso"
                  disabled={Boolean(editandoId)}
                />
              </label>

              <label>
                Correo electrónico

                <input
                  type="email"
                  name="email"
                  value={formulario.email}
                  onChange={handleChange}
                  placeholder="usuario@correo.com"
                />
              </label>

              {!editandoId && (
                <label>
                  Contraseña inicial

                  <input
                    type="password"
                    name="password"
                    value={formulario.password}
                    onChange={handleChange}
                    placeholder="Mínimo 8 caracteres"
                  />
                </label>
              )}

              <fieldset className="roles-fieldset">
                <legend>Roles</legend>

                <div className="roles-options">
                  {roles.map((rol) => (
                    <label
                      key={rol.id}
                      className="role-option"
                    >
                      <input
                        type="checkbox"
                        checked={formulario.rolesIds.includes(
                          rol.id
                        )}
                        onChange={() =>
                          handleRolChange(
                            rol.id
                          )
                        }
                      />

                      <span>
                        <strong>
                          {rol.nombre}
                        </strong>

                        {rol.descripcion && (
                          <small>
                            {rol.descripcion}
                          </small>
                        )}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <label className="checkbox-row">
                <input
                  type="checkbox"
                  name="activo"
                  checked={formulario.activo}
                  onChange={handleChange}
                />

                Usuario activo
              </label>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={cancelarFormulario}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={cargando}
                >
                  {cargando
                    ? "Guardando..."
                    : editandoId
                      ? "Actualizar"
                      : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {mostrarPassword && usuarioPassword && (
        <div className="modal-overlay">
          <div className="password-modal">
            <header className="modal-header">
              <div>
                <h2>
                  Restablecer contraseña
                </h2>

                <p>
                  Usuario:{" "}
                  <strong>
                    {usuarioPassword.username}
                  </strong>
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setMostrarPassword(false)
                }
              >
                ✕
              </button>
            </header>

            <form
              className="usuario-form"
              onSubmit={
                guardarNuevaPassword
              }
            >
              <label>
                Nueva contraseña

                <input
                  type="password"
                  value={nuevaPassword}
                  onChange={(event) =>
                    setNuevaPassword(
                      event.target.value
                    )
                  }
                  placeholder="Mínimo 8 caracteres"
                  autoFocus
                />
              </label>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() =>
                    setMostrarPassword(
                      false
                    )
                  }
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="btn-primary"
                >
                  Cambiar contraseña
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

function obtenerMensajeError(
  exception,
  mensajeDefault
) {
  if (exception.response?.status === 401) {
    return "La sesión expiró. Inicia sesión nuevamente.";
  }

  if (exception.response?.status === 403) {
    return "No tienes permisos para realizar esta operación.";
  }

  return (
    exception.response?.data?.mensaje ||
    exception.response?.data?.message ||
    mensajeDefault
  );
}