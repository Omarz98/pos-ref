import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { tallerApi } from "../../services/tallerApi";

const money = v => Number(v || 0).toLocaleString("es-MX", {style:"currency",currency:"MXN"});

export function NuevaOrdenTaller() {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState([]);
  const [motos, setMotos] = useState([]);
  const [serviciosCatalogo, setServiciosCatalogo] = useState([]);
  const [productosCatalogo, setProductosCatalogo] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [productos, setProductos] = useState([]);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    clienteId: "", motoClienteId: "", tecnicoId: "",
    fechaRecepcion: new Date().toISOString().slice(0,16),
    fechaEntregaEstimada: "",
    kilometraje: "", nivelCombustible: "MEDIO", prioridad: "NORMAL",
    fallaReportada: "", diagnosticoInicial: "", observaciones: "", anticipo: 0
  });

  useEffect(() => {
    Promise.all([
      tallerApi.clientes(""), tallerApi.servicios(), tallerApi.tecnicos(), tallerApi.productos("")
    ]).then(([c,s,t,p]) => {
      setClientes(c.data); setServiciosCatalogo(s.data); setTecnicos(t.data); setProductosCatalogo(p.data);
    });
  }, []);

  useEffect(() => {
    if (!form.clienteId) { setMotos([]); return; }
    tallerApi.motosCliente(form.clienteId).then(r => setMotos(r.data));
  }, [form.clienteId]);

  const total = useMemo(() =>
    servicios.reduce((a,x)=>a + Number(x.precio)*Number(x.cantidad),0) +
    productos.reduce((a,x)=>a + Number(x.precio)*Number(x.cantidad),0),
  [servicios, productos]);

  function addServicio(id) {
    const s = serviciosCatalogo.find(x => String(x.id) === String(id));
    if (!s) return;
    setServicios(v => [...v, {
      servicioId: s.id, nombre:s.nombre, cantidad:1,
      precio:Number(s.precio_venta), descripcion:s.nombre
    }]);
  }

  function addProducto(id) {
    const p = productosCatalogo.find(x => String(x.id) === String(id));
    if (!p) return;
    setProductos(v => [...v, {
      productoId:p.id, nombre:p.nombre, cantidad:1, precio:Number(p.precio_venta)
    }]);
  }

  async function guardar(e) {
    e.preventDefault();
    setError("");
    try {
      const payload = {
        ...form,
        clienteId:Number(form.clienteId),
        motoClienteId:Number(form.motoClienteId),
        tecnicoId: form.tecnicoId ? Number(form.tecnicoId) : null,
        kilometraje: form.kilometraje ? Number(form.kilometraje) : null,
        anticipo:Number(form.anticipo || 0),
        fechaEntregaEstimada: form.fechaEntregaEstimada || null,
        servicios: servicios.map(({nombre,...x}) => x),
        productos: productos.map(({nombre,...x}) => x),
      };
      const r = await tallerApi.crearOrden(payload);
      navigate(`/taller/ordenes/${r.data.id}`);
    } catch (e) {
      setError(e.response?.data?.message || "No fue posible crear la orden");
    }
  }

  return (
    <form className="orden-form" onSubmit={guardar}>
      <section className="panel">
        <div className="panel-title"><div><h2>Nueva orden</h2><p>Recepción de motocicleta.</p></div></div>
        {error && <div className="alert-danger">{error}</div>}
        <div className="form-grid">
          <label>Cliente
            <select required value={form.clienteId} onChange={e=>setForm({...form,clienteId:e.target.value,motoClienteId:""})}>
              <option value="">Selecciona</option>
              {clientes.map(x=><option key={x.id} value={x.id}>{x.nombre} · {x.telefono}</option>)}
            </select>
          </label>
          <label>Motocicleta
            <select required value={form.motoClienteId} onChange={e=>setForm({...form,motoClienteId:e.target.value})}>
              <option value="">Selecciona</option>
              {motos.map(x=><option key={x.id} value={x.id}>{x.marca} {x.modelo} {x.version} · {x.placas||"S/P"}</option>)}
            </select>
          </label>
          <label>Técnico
            <select value={form.tecnicoId} onChange={e=>setForm({...form,tecnicoId:e.target.value})}>
              <option value="">Sin asignar</option>
              {tecnicos.map(x=><option key={x.id} value={x.id}>{x.nombre}</option>)}
            </select>
          </label>
          <label>Prioridad
            <select value={form.prioridad} onChange={e=>setForm({...form,prioridad:e.target.value})}>
              <option>BAJA</option><option>NORMAL</option><option>ALTA</option><option>URGENTE</option>
            </select>
          </label>
          <label>Recepción<input type="datetime-local" value={form.fechaRecepcion} onChange={e=>setForm({...form,fechaRecepcion:e.target.value})}/></label>
          <label>Entrega estimada<input type="datetime-local" value={form.fechaEntregaEstimada} onChange={e=>setForm({...form,fechaEntregaEstimada:e.target.value})}/></label>
          <label>Kilometraje<input type="number" min="0" value={form.kilometraje} onChange={e=>setForm({...form,kilometraje:e.target.value})}/></label>
          <label>Combustible
            <select value={form.nivelCombustible} onChange={e=>setForm({...form,nivelCombustible:e.target.value})}>
              <option>VACIO</option><option>RESERVA</option><option>CUARTO</option><option>MEDIO</option><option>TRES_CUARTOS</option><option>LLENO</option>
            </select>
          </label>
          <label className="span-2">Falla reportada<textarea required value={form.fallaReportada} onChange={e=>setForm({...form,fallaReportada:e.target.value})}/></label>
          <label className="span-2">Diagnóstico inicial<textarea value={form.diagnosticoInicial} onChange={e=>setForm({...form,diagnosticoInicial:e.target.value})}/></label>
          <label className="span-2">Observaciones de recepción<textarea value={form.observaciones} onChange={e=>setForm({...form,observaciones:e.target.value})}/></label>
        </div>
      </section>

      <section className="panel">
        <h2>Servicios</h2>
        <select defaultValue="" onChange={e=>{addServicio(e.target.value);e.target.value=""}}>
          <option value="">Agregar servicio...</option>
          {serviciosCatalogo.map(s=><option key={s.id} value={s.id}>{s.nombre} · {money(s.precio_venta)}</option>)}
        </select>
        <EditorItems items={servicios} setItems={setServicios} />
      </section>

      <section className="panel">
        <h2>Refacciones</h2>
        <select defaultValue="" onChange={e=>{addProducto(e.target.value);e.target.value=""}}>
          <option value="">Agregar producto...</option>
          {productosCatalogo.map(p=><option key={p.id} value={p.id}>{p.nombre} · stock {p.stock_actual} · {money(p.precio_venta)}</option>)}
        </select>
        <EditorItems items={productos} setItems={setProductos} />
      </section>

      <section className="panel resumen-pago">
        <label>Anticipo
          <input type="number" step="0.01" min="0" value={form.anticipo} onChange={e=>setForm({...form,anticipo:e.target.value})}/>
        </label>
        <div><span>Total estimado</span><strong>{money(total)}</strong></div>
        <div><span>Saldo estimado</span><strong>{money(Math.max(total-Number(form.anticipo||0),0))}</strong></div>
        <button className="btn-primary" type="submit">Crear orden de trabajo</button>
      </section>
    </form>
  );
}

function EditorItems({items,setItems}) {
  return <div className="item-editor">
    {items.map((x,i)=><div className="item-row" key={`${x.servicioId||x.productoId}-${i}`}>
      <strong>{x.nombre}</strong>
      <input type="number" min="1" value={x.cantidad}
        onChange={e=>setItems(items.map((a,j)=>j===i?{...a,cantidad:Number(e.target.value)}:a))}/>
      <input type="number" step="0.01" min="0" value={x.precio}
        onChange={e=>setItems(items.map((a,j)=>j===i?{...a,precio:Number(e.target.value)}:a))}/>
      <span>{money(Number(x.cantidad)*Number(x.precio))}</span>
      <button type="button" className="btn-danger-ghost" onClick={()=>setItems(items.filter((_,j)=>j!==i))}>Quitar</button>
    </div>)}
  </div>
}
