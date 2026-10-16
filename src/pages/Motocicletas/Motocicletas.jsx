import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motocicletasApi } from "../../services/motocicletasApi.js";
import { BsPlusCircle } from "react-icons/bs";
import "../../styles/Motocicletas/Motocicletas.css";

export default function Motocicletas() {
  const [motos, setMotos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [seleccionada, setSeleccionada] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const verDetalle = (moto) => {
    navigate(`/taller/motocicletas/${moto.id}`);
  };

  useEffect(() => {
    cargarMotos();
  }, []);

  const cargarMotos = async () => {
    try {
      const { data } = await motocicletasApi.listar();
      setMotos(data);
    } catch (err) {
      setError("No fue posible cargar las motocicletas");
    }
  };

  const verHistorial = async (moto) => {
    setSeleccionada(moto);
    setHistorial([]);
    setError("");

    try {
      const { data } = await motocicletasApi.historial(moto.id);
      setHistorial(data);
    } catch (err) {
      setError("No fue posible cargar el historial");
    }
  };

  const motosFiltradas = motos.filter((moto) => {
    const texto = [
      moto.placas,
      moto.numeroSerie,
      moto.motoModeloNombre,
      moto.version,
      moto.clienteNombre,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return texto.includes(busqueda.toLowerCase());
  });

  return (
    <section className="motos-shell">
      <header className="motos-header">
        <div>
          {/*<span className="eyebrow">OPERACIÓN</span>*/}
          <h1>Motocicletas</h1>
          <p>Registro e historial de servicios.</p>
        </div>
        <button
          className="btn-primary"
          onClick={() => navigate("/taller/motocicletas/nueva")}
        >
          <BsPlusCircle /> Nueva motocicleta
        </button>
      </header>

      <div className="motos-toolbar">
        <input
          type="search"
          placeholder="Buscar por cliente, placa o modelo..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {error && <p role="alert">{error}</p>}

      <div className="motos-grid">
        {motosFiltradas.map((moto) => (
          <article className="moto-card" key={moto.id}>
            <h3>
              {moto.motoModeloNombre}-{moto.version}
            </h3>
            <p>Cliente: {moto.clienteNombre}</p>
            <p>Placas: {moto.placas || "Sin placas"}</p>

            {/*<button onClick={() => verHistorial(moto)}>Ver historial</button>*/}
            <button className="btn-primary" onClick={() => verDetalle(moto)}>
              Ver detalle
            </button>
          </article>
        ))}
      </div>

      {seleccionada && (
        <section className="moto-historial">
          <h2>Historial de {seleccionada.modelo}</h2>

          {historial.length === 0 ? (
            <p>No hay servicios registrados.</p>
          ) : (
            historial.map((orden) => (
              <article key={orden.id}>
                <h3>Orden {orden.folio}</h3>
                <p>Fecha: {orden.fechaRecepcion}</p>
                <p>Estado: {orden.estado}</p>
                <p>Total: ${orden.total}</p>
              </article>
            ))
          )}

          <button onClick={() => setSeleccionada(null)}>Cerrar</button>
        </section>
      )}
    </section>
  );
}
