import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { tallerApi } from "../../services/tallerApi";
import EstadoBadge from "../../components/taller/EstadoBadge";

export function AgendaTaller() {
  const navigate=useNavigate();
  const [ordenes,setOrdenes]=useState([]);

  useEffect(()=>{ tallerApi.listarOrdenes().then(r=>setOrdenes(r.data.filter(x=>x.fechaEntregaEstimada))); },[]);

  const porDia=useMemo(()=>{
    return ordenes.reduce((acc,o)=>{
      const k=new Date(o.fechaEntregaEstimada).toLocaleDateString("es-MX",{weekday:"long",day:"2-digit",month:"long"});
      (acc[k] ||= []).push(o); return acc;
    },{});
  },[ordenes]);

  return <section className="panel">
    <div className="panel-title"><div><h2>Agenda del taller</h2><p>Entregas comprometidas y órdenes atrasadas.</p></div></div>
    <div className="agenda">
      {Object.entries(porDia).map(([dia,items])=><section className="agenda-day" key={dia}>
        <h3>{dia}</h3>
        {items.map(o=><button key={o.id} className={`agenda-item ${o.atrasada?"agenda-atrasada":""}`} onClick={()=>navigate(`/taller/ordenes/${o.id}`)}>
          <span>{new Date(o.fechaEntregaEstimada).toLocaleTimeString("es-MX",{hour:"2-digit",minute:"2-digit"})}</span>
          <div><strong>{o.folio} · {o.clienteNombre}</strong><small>{o.motocicleta} · {o.tecnicoNombre||"Sin tecnico asignado"}</small></div>
          <EstadoBadge estado={o.estado}/>
        </button>)}
      </section>)}
    </div>
  </section>;
}
