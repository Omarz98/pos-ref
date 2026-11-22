import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  BsArrowLeft,
  BsCheckCircle,
  BsBicycle,
  BsPerson,
  BsCardChecklist,
} from "react-icons/bs";

import api from "../../services/api";
import "../../styles/Motocicletas/Motocicletas.css";

const initialForm = {
  clienteId: "",
  motoMarcaId: "",
  motoModeloId: "",
  motoVersionId: "",
  anio: "",
  color: "",
  placas: "",
  numeroSerie: "",
  kilometraje: "",
  observaciones: "",
};

export default function MotoForm() {
  const navigate = useNavigate();
  const { id } = useParams();

  const editando = Boolean(id);

  const [form, setForm] = useState(initialForm);

  const [clientes, setClientes] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [modelos, setModelos] = useState([]);
  const [versiones, setVersiones] = useState([]);

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;

    const cargarDatos = async () => {
      setCargando(true);

      try {
        const [resClientes, resMarcas, resModelos, resVersiones] =
          await Promise.all([
            api.get("/clientes"),
            api.get("/motomarcas"),
            api.get("/motomodelos"),
            api.get("/motoversiones"),
          ]);

        if (!activo) return;

        setClientes(resClientes.data);
        setMarcas(resMarcas.data);
        setModelos(resModelos.data);
        setVersiones(resVersiones.data);

        if (editando) {
          const { data } = await api.get(`/motocicletas/${id}`);

          if (!activo) return;

          setForm({
            clienteId: data.clienteId ?? "",
            motoMarcaId: data.motoMarcaId ?? "",
            motoModeloId: data.motoModeloId ?? "",
            motoVersionId: data.motoVersionId ?? "",
            anio: data.anio ?? "",
            color: data.color ?? "",
            placas: data.placas ?? "",
            numeroSerie: data.numeroSerie ?? "",
            kilometraje: data.kilometraje ?? "",
            observaciones: data.observaciones ?? "",
          });
        }
      } catch (err) {
        if (activo) {
          setError("No se pudieron cargar los datos del formulario.");
          console.error(err);
        }
      } finally {
        if (activo) setCargando(false);
      }
    };

    cargarDatos();

    return () => {
      activo = false;
    };
  }, [id, editando]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => {
      const nuevo = { ...prev, [name]: value };

      if (name === "motoMarcaId") {
        nuevo.motoModeloId = "";
        nuevo.motoVersionId = "";
        nuevo.anio = "";
      }

      if (name === "motoModeloId") {
        nuevo.motoVersionId = "";
        nuevo.anio = "";
      }

      if (name === "motoVersionId") {
        const version = versiones.find(
          (v) => String(v.id) === String(value)
        );

        nuevo.anio = version?.anio ?? "";
      }

      return nuevo;
    });
  };

  // Los nombres de las relaciones pueden variar según tus DTO.
  const modelosFiltrados = modelos.filter(
    (modelo) =>
      String(modelo.motoMarcaId) === String(form.motoMarcaId)
  );

  const versionesFiltradas = versiones.filter(
    (version) =>
      String(version.motoModeloId) === String(form.motoModeloId)
  );

  const guardarMoto = async (e) => {
    e.preventDefault();
    setError("");

    if (
      !form.clienteId ||
      !form.motoVersionId
    ) {
      setError("Selecciona un cliente y una versión de motocicleta.");
      return;
    }

    if (form.kilometraje !== "" && Number(form.kilometraje) < 0) {
      setError("El kilometraje no puede ser negativo.");
      return;
    }

    const payload = {
      clienteId: Number(form.clienteId),
      motoVersionId: Number(form.motoVersionId),
      color: form.color.trim(),
      placas: form.placas.trim().toUpperCase(),
      numeroSerie: form.numeroSerie.trim().toUpperCase(),
      kilometraje:
        form.kilometraje === ""
          ? null
          : Number(form.kilometraje),
      observaciones: form.observaciones.trim(),
    };

    setGuardando(true);

    try {
      if (editando) {
        await api.put(`/motocicletas/${id}`, payload);
      } else {
        await api.post("/motocicletas", payload);
      }

      navigate("/taller/motocicletas", {
        state: {
          mensaje: editando
            ? "Motocicleta actualizada correctamente."
            : "Motocicleta registrada correctamente.",
        },
      });
    } catch (err) {
      console.error("Error al guardar motocicleta:", err);

      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "No fue posible guardar la motocicleta."
      );
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <div className="moto-form-card">
        Cargando información...
      </div>
    );
  }

  return (
    <div className="moto-form-page">
      <div className="moto-form-header">
        <div>
          <span className="eyebrow">GESTIÓN DE MOTOCICLETAS</span>
          <h2>
            {editando ? "Editar motocicleta" : "Registrar motocicleta"}
          </h2>
          <p>
            Completa la información de la motocicleta del cliente.
          </p>
        </div>

        <button
          type="button"
          className="btn-secondary"
          onClick={() => navigate("/taller/motocicletas")}
        >
          <BsArrowLeft /> Regresar
        </button>
      </div>

      {error && (
        <div className="moto-form-error" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={guardarMoto}>
        <section className="moto-form-card">
          <h3>
            <BsPerson /> Información del propietario
          </h3>

          <div className="moto-form-grid">
            <div className="form-group">
              <label htmlFor="clienteId">Cliente *</label>
              <select
                id="clienteId"
                name="clienteId"
                className="form-select"
                value={form.clienteId}
                onChange={handleChange}
                required
              >
                <option value="">Selecciona un cliente</option>

                {clientes.map((cliente) => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className="moto-form-card">
          <h3>
            <BsBicycle /> Información de la motocicleta
          </h3>

          <div className="moto-form-grid">
            <div className="form-group">
              <label htmlFor="motoMarcaId">Marca *</label>
              <select
                id="motoMarcaId"
                name="motoMarcaId"
                className="form-select"
                value={form.motoMarcaId}
                onChange={handleChange}
                required
              >
                <option value="">Selecciona una marca</option>

                {marcas.map((marca) => (
                  <option key={marca.id} value={marca.id}>
                    {marca.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="motoModeloId">Modelo *</label>
              <select
                id="motoModeloId"
                name="motoModeloId"
                className="form-select"
                value={form.motoModeloId}
                onChange={handleChange}
                disabled={!form.motoMarcaId}
                required
              >
                <option value="">Selecciona un modelo</option>

                {modelosFiltrados.map((modelo) => (
                  <option key={modelo.id} value={modelo.id}>
                    {modelo.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="motoVersionId">Versión *</label>
              <select
                id="motoVersionId"
                name="motoVersionId"
                className="form-select"
                value={form.motoVersionId}
                onChange={handleChange}
                disabled={!form.motoModeloId}
                required
              >
                <option value="">Selecciona una versión</option>

                {versionesFiltradas.map((version) => (
                  <option key={version.id} value={version.id}>
                    {version.nombre || version.cilindrada || version.anio}
                    {version.anio ? ` - ${version.anio}` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="anio">Año</label>
              <input
                id="anio"
                name="anio"
                type="number"
                className="form-input"
                value={form.anio}
                readOnly
                placeholder="Año de la versión"
              />
            </div>

            <div className="form-group">
              <label htmlFor="color">Color</label>
              <input
                id="color"
                name="color"
                className="form-input"
                value={form.color}
                onChange={handleChange}
                placeholder="Ej. Negro"
              />
            </div>

            <div className="form-group">
              <label htmlFor="placas">Placas</label>
              <input
                id="placas"
                name="placas"
                className="form-input"
                value={form.placas}
                onChange={handleChange}
                placeholder="Ej. ABC123"
                maxLength={20}
              />
            </div>

            <div className="form-group">
              <label htmlFor="numeroSerie">Número de serie (VIN)</label>
              <input
                id="numeroSerie"
                name="numeroSerie"
                className="form-input"
                value={form.numeroSerie}
                onChange={handleChange}
                placeholder="Número de identificación"
                maxLength={50}
              />
            </div>

            <div className="form-group">
              <label htmlFor="kilometraje">Kilometraje actual</label>
              <input
                id="kilometraje"
                name="kilometraje"
                type="number"
                min="0"
                step="1"
                className="form-input"
                value={form.kilometraje}
                onChange={handleChange}
                placeholder="Ej. 12500"
              />
            </div>
          </div>
        </section>

        <section className="moto-form-card">
          <h3>
            <BsCardChecklist /> Información adicional
          </h3>

          <div className="form-group">
            <label htmlFor="observaciones">Observaciones</label>
            <textarea
              id="observaciones"
              name="observaciones"
              className="form-textarea"
              value={form.observaciones}
              onChange={handleChange}
              rows={4}
              placeholder="Detalles adicionales de la motocicleta..."
            />
          </div>
        </section>

        <div className="moto-form-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate("/taller/motocicletas")}
            disabled={guardando}
          >
            Cancelar
          </button>

          <button
            type="submit"
            className="btn-primary"
            disabled={guardando}
          >
            <BsCheckCircle />
            {guardando
              ? "Guardando..."
              : editando
              ? "Actualizar motocicleta"
              : "Registrar motocicleta"}
          </button>
        </div>
      </form>
    </div>
  );
}