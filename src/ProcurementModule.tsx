import { useMemo, useState } from 'react'
import {
  AlertTriangle, BadgeCheck, Bot, Boxes, Building2, CheckCircle2, CircleDollarSign,
  FileCheck2, FileText, Gauge, PackageCheck, Plus, ReceiptText, Search, ShieldCheck,
  ShoppingCart, Sparkles, Target, Truck, WalletCards, X,
} from 'lucide-react'
import type { Department } from './data'
import DepartmentAgentWorkspace from './DepartmentAgentWorkspace'
import './procurement-premium.css'

type Tab='command'|'requests'|'sourcing'|'orders'|'approvals'|'receiving'|'match'|'documents'|'agent'
type RequestStatus='Borrador'|'En aprobación'|'Aprobada'|'Rechazada'
type OrderStatus='Emitida'|'Parcial'|'Recibida'|'Cerrada'
type MatchStatus='Match'|'Diferencia'|'Pendiente'
type Risk='Bajo'|'Medio'|'Alto'|'Crítico'

type Request={id:string;title:string;category:string;requester:string;budget:number;amount:number;supplier:string;needBy:string;risk:Risk;status:RequestStatus}
type Order={id:string;supplier:string;category:string;amount:number;issued:string;delivery:string;received:number;status:OrderStatus;owner:string}
type Match={id:string;po:string;supplier:string;poAmount:number;receiptAmount:number;invoiceAmount:number;variance:number;status:MatchStatus;reason:string}
type Sourcing={id:string;title:string;category:string;budget:number;quotes:number;bestSupplier:string;bestOffer:number;saving:number;status:'Abierto'|'Evaluación'|'Adjudicado'}

const money=(v:number)=>new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN',maximumFractionDigits:0}).format(v)

const seedRequests:Request[]=[
  {id:'REQ-2609-001',title:'Renovación infraestructura cloud',category:'Tecnología',requester:'NEXUS',budget:120000,amount:98200,supplier:'CloudNet Services',needBy:'12 sep 2026',risk:'Alto',status:'En aprobación'},
  {id:'REQ-2609-002',title:'Reposición routers WiFi 6',category:'Inventario',requester:'MERIDIAN',budget:45000,amount:36400,supplier:'TechSupply MX',needBy:'09 sep 2026',risk:'Medio',status:'Aprobada'},
  {id:'REQ-2609-003',title:'Seguro corporativo anual',category:'Seguros',requester:'STERLING',budget:520000,amount:505200,supplier:'Seguros Atlas',needBy:'25 sep 2026',risk:'Alto',status:'En aprobación'},
  {id:'REQ-2609-004',title:'Mobiliario equipo nuevo',category:'Operación',requester:'TALENT',budget:65000,amount:48100,supplier:'Office World',needBy:'20 sep 2026',risk:'Bajo',status:'Borrador'},
]

const seedOrders:Order[]=[
  {id:'PO-2609-101',supplier:'TechSupply MX',category:'Inventario',amount:36400,issued:'01 sep 2026',delivery:'09 sep 2026',received:0,status:'Emitida',owner:'PROCURE'},
  {id:'PO-2608-097',supplier:'Office World',category:'Operación',amount:18690,issued:'27 ago 2026',delivery:'03 sep 2026',received:9345,status:'Parcial',owner:'Operaciones'},
  {id:'PO-2608-094',supplier:'CloudNet Services',category:'Tecnología',amount:38200,issued:'22 ago 2026',delivery:'31 ago 2026',received:38200,status:'Recibida',owner:'NEXUS'},
  {id:'PO-2608-089',supplier:'LogiCore',category:'Logística',amount:27600,issued:'18 ago 2026',delivery:'28 ago 2026',received:27600,status:'Cerrada',owner:'ORBIT'},
]

const seedMatches:Match[]=[
  {id:'M-001',po:'PO-2608-094',supplier:'CloudNet Services',poAmount:38200,receiptAmount:38200,invoiceAmount:38200,variance:0,status:'Match',reason:'OC, recepción y factura coinciden.'},
  {id:'M-002',po:'PO-2608-097',supplier:'Office World',poAmount:18690,receiptAmount:9345,invoiceAmount:18690,variance:9345,status:'Diferencia',reason:'Factura total con recepción parcial.'},
  {id:'M-003',po:'PO-2609-101',supplier:'TechSupply MX',poAmount:36400,receiptAmount:0,invoiceAmount:0,variance:0,status:'Pendiente',reason:'Esperando recepción y factura.'},
]

const seedSourcing:Sourcing[]=[
  {id:'RFQ-26-041',title:'Servicios cloud 2027',category:'Tecnología',budget:620000,quotes:4,bestSupplier:'CloudNet Services',bestOffer:548000,saving:72000,status:'Evaluación'},
  {id:'RFQ-26-038',title:'Póliza corporativa',category:'Seguros',budget:520000,quotes:3,bestSupplier:'Seguros Atlas',bestOffer:505200,saving:14800,status:'Evaluación'},
  {id:'RFQ-26-036',title:'Equipo de red',category:'Inventario',budget:68000,quotes:5,bestSupplier:'TechSupply MX',bestOffer:57400,saving:10600,status:'Adjudicado'},
]

const docs=['Solicitud de compra','RFQ / RFP','Cuadro comparativo','Memo de adjudicación','Orden de compra','Acta de recepción','Reporte three-way match','Reporte de variaciones de precio','Matriz de aprobaciones','Spend analysis','Plan de ahorro','Checklist Procure-to-Pay','Reporte para Comité de Compras']
const knowledge=['Política corporativa de compras','Matriz de autorizaciones y límites de gasto','Catálogo y scorecards SOURCE','Presupuestos aprobados por STERLING','Contratos y SLA revisados por JUSTITIA','Inventario y niveles de reposición MERIDIAN','Reglas de segregación de funciones','Histórico de órdenes, recepciones y facturas del tenant']
const suggestions=['¿Qué compras requieren decisión hoy?','Detecta sobreprecios, diferencias y compras fuera de política','Compara las opciones de sourcing por costo total y riesgo','¿Qué OCs están bloqueadas por recepción o factura?']

export default function ProcurementModule({department}:{department:Department}){
  const [tab,setTab]=useState<Tab>('command')
  const [requests,setRequests]=useState(seedRequests)
  const [orders,setOrders]=useState(seedOrders)
  const [matches,setMatches]=useState(seedMatches)
  const [query,setQuery]=useState('')
  const [open,setOpen]=useState(false)
  const [draft,setDraft]=useState({title:'',category:'Tecnología',requester:'Operaciones',budget:0,amount:0,supplier:'Por definir'})

  const spend=orders.reduce((s,o)=>s+o.amount,0)
  const pendingApproval=requests.filter(r=>r.status==='En aprobación').length
  const sourcingSavings=seedSourcing.reduce((s,x)=>s+x.saving,0)
  const exceptions=matches.filter(m=>m.status==='Diferencia').length
  const received=orders.filter(o=>o.status==='Recibida'||o.status==='Cerrada').length
  const policyCompliant=Math.round(requests.filter(r=>r.amount<=r.budget&&r.status!=='Rechazada').length/requests.length*100)
  const health=Math.max(0,100-pendingApproval*5-exceptions*12-(100-policyCompliant)/4)

  const filteredRequests=useMemo(()=>{const q=query.trim().toLowerCase();if(!q)return requests;return requests.filter(r=>[r.id,r.title,r.category,r.requester,r.supplier,r.status].some(v=>v.toLowerCase().includes(q)))},[query,requests])

  const createRequest=()=>{
    if(!draft.title.trim()||draft.amount<=0)return
    const amount=Number(draft.amount), budget=Number(draft.budget)
    setRequests(v=>[{id:`REQ-2609-${String(v.length+1).padStart(3,'0')}`,title:draft.title.trim(),category:draft.category,requester:draft.requester,budget,amount,supplier:draft.supplier,needBy:'Por definir',risk:amount>250000?'Alto':'Medio',status:'En aprobación'},...v])
    setDraft({title:'',category:'Tecnología',requester:'Operaciones',budget:0,amount:0,supplier:'Por definir'});setOpen(false);setTab('requests')
  }
  const approve=(id:string)=>setRequests(v=>v.map(r=>r.id===id?{...r,status:'Aprobada'}:r))
  const reject=(id:string)=>setRequests(v=>v.map(r=>r.id===id?{...r,status:'Rechazada'}:r))
  const receive=(id:string)=>setOrders(v=>v.map(o=>o.id===id?{...o,received:o.amount,status:'Recibida'}:o))
  const resolveMatch=(id:string)=>setMatches(v=>v.map(m=>m.id===id?{...m,receiptAmount:m.poAmount,invoiceAmount:m.poAmount,variance:0,status:'Match',reason:'Excepción resuelta manualmente y marcada para auditoría.'}:m))

  const openWorkspace=(title:string)=>{
    localStorage.setItem('wae-workspace-draft',JSON.stringify({title,body:`# ${title}\n\n**Departamento:** Compras\n**Agente:** PROCURE\n\n## Solicitud / objetivo\n\n## Presupuesto y centro de costo\n\n## Proveedores evaluados\n\n## Comparativo costo total / SLA / riesgo\n\n## Evidencia y cotizaciones\n\n## Aprobaciones\n\n## Orden / recepción / factura\n\n## Excepciones y auditoría\n\n> Borrador operativo. Validar presupuesto, política, proveedor y segregación de funciones antes de comprometer gasto real.\n`}))
    const workspace=[...document.querySelectorAll('button')].find(b=>b.textContent?.trim()==='Workspace')
    if(workspace instanceof HTMLButtonElement)workspace.click()
  }

  return <section className="procurement-premium">
    <header className="procurement-head">
      <div className="procurement-brand"><span><ShoppingCart size={25}/></span><div><small>PROCURE · DIRECTOR DE COMPRAS AI</small><h1>Procurement Command Center</h1><p>Procure-to-Pay, sourcing, presupuesto, aprobaciones, recepción y three-way match en una sola capa.</p></div></div>
      <div className="procurement-head-status"><i/>Datos demo · Governed procurement</div>
    </header>

    <nav className="procurement-tabs">{[
      ['command','Command Center'],['requests','Solicitudes'],['sourcing','Sourcing'],['orders','Órdenes'],['approvals','Aprobaciones'],['receiving','Recepción'],['match','3-Way Match'],['documents','Documentos'],['agent','PROCURE AI'],
    ].map(([id,label])=><button key={id} className={tab===id?'active':''} onClick={()=>setTab(id as Tab)}>{label}</button>)}</nav>

    {tab!=='agent'&&<div className="procurement-kpis">
      <Kpi icon={<Gauge size={18}/>} label="Procurement health" value={`${Math.round(health)}/100`} detail={`${policyCompliant}% dentro de presupuesto`} tone="emerald"/>
      <Kpi icon={<CircleDollarSign size={18}/>} label="Spend gestionado" value={money(spend)} detail={`${orders.length} órdenes`} tone="cyan"/>
      <Kpi icon={<Target size={18}/>} label="Ahorro sourcing" value={money(sourcingSavings)} detail="pipeline demo" tone="violet"/>
      <Kpi icon={<FileCheck2 size={18}/>} label="Aprobaciones" value={String(pendingApproval)} detail="requieren decisión" tone="amber"/>
      <Kpi icon={<AlertTriangle size={18}/>} label="Excepciones" value={String(exceptions)} detail="three-way match" tone="rose"/>
    </div>}

    {tab==='command'&&<div className="procurement-layout">
      <section className="procurement-panel procurement-hero-panel"><div className="procurement-panel-title"><div><small>CPO VIEW</small><h2>Control Procure-to-Pay</h2></div><span className="procurement-score"><ShieldCheck size={17}/>{Math.round(health)}/100</span></div>
        <div className="procurement-health"><div><span>Presupuesto</span><b>{policyCompliant}% compliant</b><i className="good"/></div><div><span>Aprobaciones</span><b>{pendingApproval} pendientes</b><i className={pendingApproval?'warn':'good'}/></div><div><span>Recepción</span><b>{received}/{orders.length} completas</b><i className="good"/></div><div><span>3-way match</span><b>{exceptions} excepción</b><i className={exceptions?'risk':'good'}/></div></div>
        <div className="procurement-ai-brief"><Sparkles size={21}/><div><b>Lectura de PROCURE</b><p>La prioridad es decidir las solicitudes de alto impacto y resolver la diferencia de Office World antes de liberar pago. Las adjudicaciones deben considerar score SOURCE, presupuesto STERLING y contratos JUSTITIA.</p></div></div>
      </section>
      <section className="procurement-panel"><div className="procurement-panel-title"><div><small>DECISION QUEUE</small><h2>Compras por decidir</h2></div><Bot size={18}/></div>{requests.filter(r=>r.status==='En aprobación').map(r=><div className="decision-row" key={r.id}><span className={`risk-${r.risk.toLowerCase()}`}>{r.risk}</span><div><b>{r.title}</b><small>{r.supplier} · {money(r.amount)} / presupuesto {money(r.budget)}</small></div></div>)}</section>
      <section className="procurement-panel"><div className="procurement-panel-title"><div><small>CONTROL TOWER</small><h2>Excepciones</h2></div><AlertTriangle size={18}/></div>{matches.filter(m=>m.status!=='Match').map(m=><div className="exception-row" key={m.id}><span>{m.po}</span><div><b>{m.supplier}</b><small>{m.reason}</small></div><em className={m.status==='Diferencia'?'risk':'pending'}>{m.status}</em></div>)}</section>
    </div>}

    {tab==='requests'&&<section className="procurement-panel procurement-wide"><div className="procurement-toolbar"><div><small>DEMAND INTAKE</small><h2>Solicitudes de compra</h2></div><div className="procurement-actions"><label><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar solicitud..."/></label><button className="primary" onClick={()=>setOpen(true)}><Plus size={16}/>Nueva solicitud</button></div></div><div className="procurement-table-wrap"><table><thead><tr><th>ID</th><th>Solicitud</th><th>Solicita</th><th>Proveedor</th><th>Presupuesto</th><th>Monto</th><th>Riesgo</th><th>Estado</th></tr></thead><tbody>{filteredRequests.map(r=><tr key={r.id}><td>{r.id}</td><td><b>{r.title}</b><small>{r.category} · {r.needBy}</small></td><td>{r.requester}</td><td>{r.supplier}</td><td>{money(r.budget)}</td><td className={r.amount>r.budget?'over':''}>{money(r.amount)}</td><td><span className={`risk-${r.risk.toLowerCase()}`}>{r.risk}</span></td><td><span className="proc-status">{r.status}</span></td></tr>)}</tbody></table></div></section>}

    {tab==='sourcing'&&<section className="procurement-panel procurement-wide"><div className="procurement-panel-title"><div><small>STRATEGIC SOURCING</small><h2>RFQ / RFP y comparativos</h2></div><span>{money(sourcingSavings)} ahorro potencial</span></div><div className="sourcing-grid">{seedSourcing.map(s=><article key={s.id}><div><span>{s.id}</span><em>{s.status}</em></div><h3>{s.title}</h3><p>{s.category} · {s.quotes} cotizaciones</p><dl><div><dt>Presupuesto</dt><dd>{money(s.budget)}</dd></div><div><dt>Mejor oferta</dt><dd>{money(s.bestOffer)}</dd></div><div><dt>Ahorro</dt><dd>{money(s.saving)}</dd></div></dl><footer><PackageCheck size={15}/>{s.bestSupplier}<button onClick={()=>openWorkspace(`Comparativo · ${s.title}`)}>Comparar</button></footer></article>)}</div></section>}

    {tab==='orders'&&<section className="procurement-panel procurement-wide"><div className="procurement-panel-title"><div><small>PURCHASE ORDERS</small><h2>Órdenes de compra</h2></div><span>{orders.length} órdenes</span></div><div className="procurement-table-wrap"><table><thead><tr><th>OC</th><th>Proveedor</th><th>Categoría</th><th>Monto</th><th>Entrega</th><th>Recibido</th><th>Estado</th></tr></thead><tbody>{orders.map(o=><tr key={o.id}><td>{o.id}</td><td>{o.supplier}</td><td>{o.category}</td><td>{money(o.amount)}</td><td>{o.delivery}</td><td>{money(o.received)}</td><td><span className="proc-status">{o.status}</span></td></tr>)}</tbody></table></div></section>}

    {tab==='approvals'&&<section className="procurement-panel procurement-wide"><div className="procurement-panel-title"><div><small>GOVERNANCE</small><h2>Approval Center</h2></div><BadgeCheck size={18}/></div><div className="approval-list">{requests.filter(r=>r.status==='En aprobación').map(r=><article key={r.id}><div><b>{r.title}</b><span>{r.id} · {r.requester}</span></div><dl><div><dt>Monto</dt><dd>{money(r.amount)}</dd></div><div><dt>Presupuesto</dt><dd>{money(r.budget)}</dd></div><div><dt>Proveedor</dt><dd>{r.supplier}</dd></div><div><dt>Riesgo</dt><dd>{r.risk}</dd></div></dl><p><ShieldCheck size={15}/>Revisar SOURCE + presupuesto + política + contrato antes de comprometer gasto.</p><footer><button className="danger" onClick={()=>reject(r.id)}>Rechazar</button><button className="primary" onClick={()=>approve(r.id)}>Aprobar</button></footer></article>)}</div></section>}

    {tab==='receiving'&&<section className="procurement-panel procurement-wide"><div className="procurement-panel-title"><div><small>GOODS RECEIPT</small><h2>Recepción</h2></div><Truck size={18}/></div><div className="receiving-grid">{orders.filter(o=>o.status!=='Cerrada').map(o=><article key={o.id}><div><Boxes size={19}/><span>{o.id}</span><em>{o.status}</em></div><h3>{o.supplier}</h3><p>{money(o.received)} de {money(o.amount)} recibido</p><div className="progress"><i style={{width:`${Math.min(100,o.amount?o.received/o.amount*100:0)}%`}}/></div>{o.status!=='Recibida'&&<button onClick={()=>receive(o.id)}>Registrar recepción completa</button>}</article>)}</div></section>}

    {tab==='match'&&<section className="procurement-panel procurement-wide"><div className="procurement-panel-title"><div><small>PAYMENT CONTROL</small><h2>Three-way match</h2></div><ReceiptText size={18}/></div><div className="match-list">{matches.map(m=><article key={m.id} className={m.status==='Diferencia'?'has-risk':''}><header><div><b>{m.po}</b><span>{m.supplier}</span></div><em className={m.status==='Match'?'ok':m.status==='Diferencia'?'risk':'pending'}>{m.status}</em></header><dl><div><dt>OC</dt><dd>{money(m.poAmount)}</dd></div><div><dt>Recepción</dt><dd>{money(m.receiptAmount)}</dd></div><div><dt>Factura</dt><dd>{money(m.invoiceAmount)}</dd></div><div><dt>Variación</dt><dd>{money(m.variance)}</dd></div></dl><p>{m.reason}</p>{m.status==='Diferencia'&&<button onClick={()=>resolveMatch(m.id)}>Resolver excepción</button>}</article>)}</div></section>}

    {tab==='documents'&&<section className="procurement-panel procurement-wide"><div className="procurement-panel-title"><div><small>PROCUREMENT LIBRARY</small><h2>Documentos y controles</h2></div><FileText size={18}/></div><div className="procurement-docs">{docs.map(d=><button key={d} onClick={()=>openWorkspace(d)}><FileText size={17}/><span>{d}</span><em>Editar en Workspace</em></button>)}</div></section>}

    {tab==='agent'&&<DepartmentAgentWorkspace department={department} documents={docs} knowledge={knowledge} suggestions={suggestions} onOpenWorkspace={(title)=>openWorkspace(title)}/>}

    {open&&<div className="procurement-modal"><form onSubmit={e=>{e.preventDefault();createRequest()}}><header><div><small>NUEVA SOLICITUD</small><h2>Demand intake</h2></div><button type="button" onClick={()=>setOpen(false)}><X size={18}/></button></header><label>Título<input value={draft.title} onChange={e=>setDraft({...draft,title:e.target.value})}/></label><div className="form-grid"><label>Categoría<select value={draft.category} onChange={e=>setDraft({...draft,category:e.target.value})}><option>Tecnología</option><option>Inventario</option><option>Operación</option><option>Servicios</option><option>Marketing</option><option>Seguros</option></select></label><label>Solicitante<input value={draft.requester} onChange={e=>setDraft({...draft,requester:e.target.value})}/></label><label>Presupuesto<input type="number" value={draft.budget} onChange={e=>setDraft({...draft,budget:Number(e.target.value)})}/></label><label>Monto solicitado<input type="number" value={draft.amount} onChange={e=>setDraft({...draft,amount:Number(e.target.value)})}/></label></div><label>Proveedor propuesto<input value={draft.supplier} onChange={e=>setDraft({...draft,supplier:e.target.value})}/></label><div className="modal-note"><ShieldCheck size={16}/>La solicitud entra en aprobación; PROCURE no compromete gasto automáticamente.</div><footer><button type="button" onClick={()=>setOpen(false)}>Cancelar</button><button className="primary" type="submit">Enviar a aprobación</button></footer></form></div>}
  </section>
}

function Kpi({icon,label,value,detail,tone}:{icon:React.ReactNode;label:string;value:string;detail:string;tone:string}){return <div className={`procurement-kpi ${tone}`}><span>{icon}</span><div><small>{label}</small><b>{value}</b><em>{detail}</em></div></div>}
