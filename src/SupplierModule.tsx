import { useMemo, useState } from 'react'
import {
  AlertTriangle, BadgeCheck, Ban, Bot, Boxes, Building2, CalendarClock, CheckCircle2,
  CircleDollarSign, FileCheck2, FileText, Gauge, Handshake, PackageCheck, Plus,
  Search, ShieldCheck, Sparkles, Target, TrendingDown, TrendingUp, Truck, X,
} from 'lucide-react'
import type { Department } from './data'
import DepartmentAgentWorkspace from './DepartmentAgentWorkspace'
import './supplier-premium.css'

type Tab='command'|'suppliers'|'scorecards'|'contracts'|'risk'|'sourcing'|'documents'|'agent'
type SupplierStatus='Aprobado'|'Condicionado'|'Bloqueado'
type Risk='Bajo'|'Medio'|'Alto'|'Crítico'
type ContractStatus='Vigente'|'Por renovar'|'En revisión'

type Supplier={
  id:string;name:string;category:string;country:string;status:SupplierStatus;risk:Risk;
  spend:number;delivery:number;quality:number;sla:number;financial:number;documents:number;
  concentration:number;lastReview:string;owner:string
}
type SupplierContract={
  id:string;supplierId:string;name:string;value:number;start:string;end:string;sla:string;
  owner:string;risk:Risk;status:ContractStatus
}
type SourcingEvent={
  id:string;title:string;category:string;budget:number;quotes:number;deadline:string;status:'Abierto'|'Evaluación'|'Adjudicado';saving:number
}

const money=(v:number)=>new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN',maximumFractionDigits:0}).format(v)

const seedSuppliers:Supplier[]=[
  {id:'SUP-001',name:'CloudNet Services',category:'Infraestructura cloud',country:'México',status:'Condicionado',risk:'Alto',spend:456000,delivery:96,quality:93,sla:88,financial:82,documents:92,concentration:24,lastReview:'01 sep 2026',owner:'NEXUS + SOURCE'},
  {id:'SUP-002',name:'TechSupply MX',category:'Hardware y equipo',country:'México',status:'Aprobado',risk:'Bajo',spend:318400,delivery:98,quality:96,sla:95,financial:91,documents:100,concentration:17,lastReview:'30 ago 2026',owner:'MERIDIAN + SOURCE'},
  {id:'SUP-003',name:'Nova Logistics',category:'Logística',country:'México',status:'Aprobado',risk:'Medio',spend:286500,delivery:91,quality:94,sla:92,financial:88,documents:96,concentration:15,lastReview:'29 ago 2026',owner:'ORBIT + SOURCE'},
  {id:'SUP-004',name:'Seguros Atlas',category:'Seguros corporativos',country:'México',status:'Condicionado',risk:'Alto',spend:505200,delivery:100,quality:94,sla:90,financial:86,documents:84,concentration:26,lastReview:'01 sep 2026',owner:'STERLING + JUSTITIA'},
  {id:'SUP-005',name:'Office World',category:'Operación y mobiliario',country:'México',status:'Aprobado',risk:'Bajo',spend:184600,delivery:95,quality:91,sla:94,financial:90,documents:100,concentration:10,lastReview:'28 ago 2026',owner:'PROCURE + SOURCE'},
  {id:'SUP-006',name:'DataSecure Labs',category:'Ciberseguridad',country:'Estados Unidos',status:'Bloqueado',risk:'Crítico',spend:168000,delivery:87,quality:89,sla:78,financial:72,documents:61,concentration:8,lastReview:'31 ago 2026',owner:'SENTINEL + SOURCE'},
]

const seedContracts:SupplierContract[]=[
  {id:'SC-101',supplierId:'SUP-001',name:'Cloud Managed Services + SLA',value:456000,start:'01 ene 2026',end:'14 sep 2026',sla:'99.9% uptime',owner:'NEXUS',risk:'Alto',status:'Por renovar'},
  {id:'SC-102',supplierId:'SUP-002',name:'Acuerdo marco de hardware',value:318400,start:'01 feb 2026',end:'31 ene 2027',sla:'Entrega ≤ 5 días',owner:'MERIDIAN',risk:'Bajo',status:'Vigente'},
  {id:'SC-103',supplierId:'SUP-003',name:'Distribución nacional',value:286500,start:'01 mar 2026',end:'28 feb 2027',sla:'OTIF ≥ 94%',owner:'ORBIT',risk:'Medio',status:'Vigente'},
  {id:'SC-104',supplierId:'SUP-004',name:'Póliza corporativa integral',value:505200,start:'01 oct 2025',end:'30 sep 2026',sla:'Atención siniestro ≤ 2h',owner:'STERLING',risk:'Alto',status:'Por renovar'},
  {id:'SC-105',supplierId:'SUP-006',name:'MDR / monitoreo de seguridad',value:168000,start:'15 sep 2025',end:'15 sep 2026',sla:'MTTA ≤ 15 min',owner:'SENTINEL',risk:'Crítico',status:'En revisión'},
]

const seedSourcing:SourcingEvent[]=[
  {id:'RFQ-2609-01',title:'Renovación cloud y observabilidad',category:'Infraestructura',budget:520000,quotes:3,deadline:'08 sep 2026',status:'Evaluación',saving:42000},
  {id:'RFQ-2609-02',title:'Laptops para expansión comercial',category:'Hardware',budget:245000,quotes:4,deadline:'12 sep 2026',status:'Abierto',saving:18500},
  {id:'RFQ-2609-03',title:'Seguro de responsabilidad corporativa',category:'Seguros',budget:540000,quotes:2,deadline:'18 sep 2026',status:'Evaluación',saving:27500},
]

const supplierDocs=[
  'Ficha maestra de proveedor','Supplier scorecard','Evaluación de riesgo de tercero','Matriz de homologación',
  'Comparativo de proveedores','RFP / RFQ','Contrato marco de suministro','SLA y anexos de servicio',
  'Due diligence de proveedor','Plan de remediación','Reporte de concentración','Memo de adjudicación',
  'Checklist de onboarding','Reporte para Comité de Compras',
]
const supplierKnowledge=[
  'Política corporativa de compras y abastecimiento','Matriz de autorizaciones y segregación de funciones',
  'ISO 20400 · compras sostenibles','ISO 31000 · gestión de riesgos','ISO 9001 · calidad de proveedores',
  'Contratos y SLA vigentes autorizados','Histórico de órdenes, entregas, incidencias y devoluciones',
  'Evidencia financiera, legal y de compliance aprobada para cada tercero',
]
const supplierSuggestions=[
  '¿Qué proveedores representan mayor riesgo operativo?','Prioriza las renovaciones por impacto y vencimiento',
  'Compara proveedores por costo total, SLA y riesgo','¿Dónde tenemos concentración excesiva de suministro?',
]

const scoreOf=(s:Supplier)=>Math.round(s.delivery*.22+s.quality*.22+s.sla*.22+s.financial*.17+s.documents*.17)

export default function SupplierModule({department}:{department:Department}){
  const [tab,setTab]=useState<Tab>('command')
  const [suppliers,setSuppliers]=useState(seedSuppliers)
  const [contracts,setContracts]=useState(seedContracts)
  const [search,setSearch]=useState('')
  const [supplierOpen,setSupplierOpen]=useState(false)
  const [draft,setDraft]=useState({name:'',category:'Servicios',country:'México',spend:0,owner:'SOURCE'})

  const spend=suppliers.reduce((a,s)=>a+s.spend,0)
  const approved=suppliers.filter(s=>s.status==='Aprobado').length
  const conditioned=suppliers.filter(s=>s.status==='Condicionado').length
  const blocked=suppliers.filter(s=>s.status==='Bloqueado').length
  const highRisk=suppliers.filter(s=>s.risk==='Alto'||s.risk==='Crítico').length
  const expiring=contracts.filter(c=>c.status==='Por renovar'||c.status==='En revisión').length
  const avgScore=Math.round(suppliers.reduce((a,s)=>a+scoreOf(s),0)/suppliers.length)
  const avgDelivery=Math.round(suppliers.reduce((a,s)=>a+s.delivery,0)/suppliers.length)
  const topConcentration=Math.max(...suppliers.map(s=>s.concentration))
  const projectedSavings=seedSourcing.reduce((a,s)=>a+s.saving,0)

  const filtered=useMemo(()=>{
    const q=search.trim().toLowerCase();if(!q)return suppliers
    return suppliers.filter(s=>[s.id,s.name,s.category,s.country,s.status,s.risk,s.owner].some(v=>v.toLowerCase().includes(q)))
  },[suppliers,search])

  const createSupplier=()=>{
    if(!draft.name.trim())return
    const item:Supplier={
      id:`SUP-${String(suppliers.length+1).padStart(3,'0')}`,name:draft.name.trim(),category:draft.category,
      country:draft.country,status:'Condicionado',risk:'Medio',spend:Number(draft.spend)||0,delivery:80,quality:80,
      sla:80,financial:75,documents:60,concentration:0,lastReview:new Date().toLocaleDateString('es-MX'),owner:draft.owner,
    }
    setSuppliers(v=>[item,...v]);setDraft({name:'',category:'Servicios',country:'México',spend:0,owner:'SOURCE'});setSupplierOpen(false);setTab('suppliers')
  }

  const setStatus=(id:string,status:SupplierStatus)=>setSuppliers(v=>v.map(s=>s.id===id?{...s,status}:s))
  const renewContract=(id:string)=>setContracts(v=>v.map(c=>c.id===id?{...c,status:'En revisión'}:c))

  const openWorkspace=(title:string)=>{
    localStorage.setItem('wae-workspace-draft',JSON.stringify({title,body:`# ${title}\n\n**Departamento:** Proveedores\n**Agente:** SOURCE\n\n## Objetivo\n\n## Proveedor / categoría\n\n## Evaluación 360°\n- Calidad:\n- Entrega:\n- SLA:\n- Riesgo financiero:\n- Compliance documental:\n\n## Spend y costo total\n\n## Riesgos / concentración\n\n## Evidencia y documentos fuente\n\n## Recomendación\n\n## Aprobaciones\n\n> Borrador operativo. Las decisiones de alta, bloqueo o adjudicación deben sustentarse en evidencia verificable, autorizaciones y políticas de compra aplicables.\n`}))
    const workspace=[...document.querySelectorAll('button')].find(b=>b.textContent?.trim()==='Workspace')
    if(workspace instanceof HTMLButtonElement)workspace.click()
  }

  return <section className="supplier-premium">
    <header className="supplier-head">
      <div className="supplier-brand"><span><PackageCheck size={25}/></span><div><small>SOURCE · DIRECTOR DE ABASTECIMIENTO AI</small><h1>Supplier Intelligence Command Center</h1><p>Riesgo, desempeño, SLA, contratos, spend y sourcing con decisiones explicables.</p></div></div>
      <div className="supplier-head-status"><i/>Datos demo · Decision trace enabled</div>
    </header>

    <nav className="supplier-tabs">
      {[
        ['command','Command Center'],['suppliers','Proveedores'],['scorecards','Scorecards'],['contracts','Contratos & SLA'],
        ['risk','Risk Graph'],['sourcing','Sourcing'],['documents','Documentos'],['agent','SOURCE AI'],
      ].map(([id,label])=><button key={id} className={tab===id?'active':''} onClick={()=>setTab(id as Tab)}>{label}</button>)}
    </nav>

    {tab!=='agent'&&<div className="supplier-kpis">
      <SupplierKpi icon={<Building2 size={18}/>} label="Proveedores" value={String(suppliers.length)} detail={`${approved} aprobados · ${blocked} bloqueado`} tone="orange"/>
      <SupplierKpi icon={<CircleDollarSign size={18}/>} label="Spend gestionado" value={money(spend)} detail="Consolidado demo" tone="cyan"/>
      <SupplierKpi icon={<Gauge size={18}/>} label="Supplier score" value={`${avgScore}/100`} detail={`${avgDelivery}% entrega promedio`} tone="emerald"/>
      <SupplierKpi icon={<AlertTriangle size={18}/>} label="Riesgo elevado" value={String(highRisk)} detail={`${conditioned} condicionados`} tone="amber"/>
      <SupplierKpi icon={<CalendarClock size={18}/>} label="Renovaciones" value={String(expiring)} detail="Requieren decisión" tone="rose"/>
    </div>}

    {tab==='command'&&<div className="supplier-layout">
      <section className="supplier-panel supplier-hero-panel">
        <div className="supplier-panel-title"><div><small>CPO / PROCUREMENT VIEW</small><h2>Postura de suministro</h2></div><span className="supplier-score"><ShieldCheck size={17}/>{avgScore}/100</span></div>
        <div className="supplier-health-grid">
          <div><span>Continuidad</span><b>{highRisk<=2?'Controlada':'Presionada'}</b><i className={highRisk<=2?'good':'warn'}/></div>
          <div><span>Concentración máx.</span><b>{topConcentration}%</b><i className={topConcentration>25?'warn':'good'}/></div>
          <div><span>Renovaciones</span><b>{expiring} críticas</b><i className={expiring?'warn':'good'}/></div>
          <div><span>Savings pipeline</span><b>{money(projectedSavings)}</b><i className="good"/></div>
        </div>
        <div className="supplier-ai-brief"><Sparkles size={21}/><div><b>Lectura de SOURCE</b><p>La prioridad es reducir exposición en CloudNet, cerrar la renovación de Seguros Atlas y mantener bloqueado DataSecure hasta completar documentación y SLA. El costo no debe ser el único criterio: la recomendación pondera continuidad, calidad, cumplimiento y concentración.</p></div></div>
      </section>

      <section className="supplier-panel">
        <div className="supplier-panel-title"><div><small>PRIORIDAD</small><h2>Decisiones recomendadas</h2></div><Bot size={18}/></div>
        <div className="supplier-decisions">
          <Decision n="01" title="Renegociar CloudNet" text="Exigir SLA reforzado, plan de continuidad y alternativa secundaria antes de renovar." tone="warn"/>
          <Decision n="02" title="Cerrar seguro corporativo" text="Comparar cobertura total, exclusiones y costo antes del vencimiento del 30 de septiembre." tone="warn"/>
          <Decision n="03" title="Mantener bloqueo de DataSecure" text="No adjudicar nuevas órdenes mientras falte documentación crítica y el SLA permanezca bajo objetivo." tone="risk"/>
        </div>
      </section>

      <section className="supplier-panel">
        <div className="supplier-panel-title"><div><small>PORTFOLIO</small><h2>Spend por proveedor</h2></div><CircleDollarSign size={18}/></div>
        <div className="supplier-spend-bars">{[...suppliers].sort((a,b)=>b.spend-a.spend).map(s=><div key={s.id}><span>{s.name}</span><div><i style={{width:`${s.spend/spend*100}%`}}/></div><b>{money(s.spend)}</b></div>)}</div>
      </section>
    </div>}

    {tab==='suppliers'&&<section className="supplier-panel supplier-wide">
      <div className="supplier-panel-title"><div><small>SUPPLIER 360</small><h2>Directorio y homologación</h2></div><button className="supplier-primary" onClick={()=>setSupplierOpen(true)}><Plus size={15}/>Nuevo proveedor</button></div>
      <label className="supplier-search"><Search size={15}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar proveedor, categoría, país, riesgo..."/></label>
      <div className="supplier-table-wrap"><table><thead><tr><th>Proveedor</th><th>Categoría</th><th>Spend</th><th>Score</th><th>Riesgo</th><th>Concentración</th><th>Estado</th><th/></tr></thead><tbody>{filtered.map(s=><tr key={s.id}><td><b>{s.name}</b><small>{s.id} · {s.country}</small></td><td>{s.category}</td><td>{money(s.spend)}</td><td><strong>{scoreOf(s)}/100</strong></td><td><span className={`supplier-risk risk-${s.risk.toLowerCase()}`}>{s.risk}</span></td><td>{s.concentration}%</td><td><span className={`supplier-status ${s.status.toLowerCase()}`}>{s.status}</span></td><td><div className="supplier-row-actions"><button title="Aprobar" onClick={()=>setStatus(s.id,'Aprobado')}><BadgeCheck size={15}/></button><button title="Condicionar" onClick={()=>setStatus(s.id,'Condicionado')}><AlertTriangle size={15}/></button><button title="Bloquear" onClick={()=>setStatus(s.id,'Bloqueado')}><Ban size={15}/></button></div></td></tr>)}</tbody></table></div>
    </section>}

    {tab==='scorecards'&&<section className="supplier-panel supplier-wide">
      <div className="supplier-panel-title"><div><small>PERFORMANCE</small><h2>Supplier scorecards</h2></div><span>Modelo ponderado 5 dimensiones</span></div>
      <div className="scorecard-grid">{suppliers.map(s=><article key={s.id}><div className="scorecard-head"><div><b>{s.name}</b><small>{s.category}</small></div><strong>{scoreOf(s)}</strong></div><Score label="Entrega" value={s.delivery}/><Score label="Calidad" value={s.quality}/><Score label="SLA" value={s.sla}/><Score label="Financiero" value={s.financial}/><Score label="Documentación" value={s.documents}/><footer><span className={`supplier-risk risk-${s.risk.toLowerCase()}`}>{s.risk}</span><small>Revisado {s.lastReview}</small></footer></article>)}</div>
    </section>}

    {tab==='contracts'&&<section className="supplier-panel supplier-wide">
      <div className="supplier-panel-title"><div><small>CONTRACT LIFECYCLE</small><h2>Contratos y SLA</h2></div><span>{expiring} requieren decisión</span></div>
      <div className="supplier-table-wrap"><table><thead><tr><th>Contrato</th><th>Proveedor</th><th>Valor</th><th>Vence</th><th>SLA</th><th>Riesgo</th><th>Estado</th><th/></tr></thead><tbody>{contracts.map(c=>{const s=suppliers.find(x=>x.id===c.supplierId);return <tr key={c.id}><td><b>{c.name}</b><small>{c.id} · {c.owner}</small></td><td>{s?.name}</td><td>{money(c.value)}</td><td>{c.end}</td><td>{c.sla}</td><td><span className={`supplier-risk risk-${c.risk.toLowerCase()}`}>{c.risk}</span></td><td><span className="supplier-status condicionado">{c.status}</span></td><td>{c.status!=='Vigente'&&<button onClick={()=>renewContract(c.id)}>Abrir revisión</button>}</td></tr>})}</tbody></table></div>
    </section>}

    {tab==='risk'&&<div className="supplier-layout">
      <section className="supplier-panel supplier-wide">
        <div className="supplier-panel-title"><div><small>THIRD-PARTY RISK GRAPH</small><h2>Dependencia y exposición</h2></div><ShieldCheck size={18}/></div>
        <div className="risk-graph">{suppliers.map(s=><article key={s.id} className={`risk-card risk-${s.risk.toLowerCase()}`}><div><span>{s.id}</span><b>{s.name}</b><small>{s.category}</small></div><strong>{s.concentration}%</strong><p>Score {scoreOf(s)} · SLA {s.sla}% · Docs {s.documents}%</p></article>)}</div>
      </section>
      <section className="supplier-panel"><h2>Controles recomendados</h2><div className="supplier-control-list"><div><CheckCircle2 size={16}/><span>Proveedor alterno para categorías críticas</span></div><div><CheckCircle2 size={16}/><span>Seguro / garantías contractuales</span></div><div><CheckCircle2 size={16}/><span>Evidence pack actualizado</span></div><div><CheckCircle2 size={16}/><span>SLA y penalizaciones medibles</span></div><div><CheckCircle2 size={16}/><span>Revisión financiera periódica</span></div></div></section>
      <section className="supplier-panel"><h2>Señales de alerta</h2><div className="supplier-control-list alerts"><div><AlertTriangle size={16}/><span>Concentración superior a 25%</span></div><div><AlertTriangle size={16}/><span>Documentación menor a 80%</span></div><div><AlertTriangle size={16}/><span>SLA menor a 85%</span></div><div><AlertTriangle size={16}/><span>Contrato por vencer sin alternativa</span></div></div></section>
    </div>}

    {tab==='sourcing'&&<section className="supplier-panel supplier-wide">
      <div className="supplier-panel-title"><div><small>STRATEGIC SOURCING</small><h2>Eventos de compra y negociación</h2></div><span>{money(projectedSavings)} ahorro potencial</span></div>
      <div className="sourcing-grid">{seedSourcing.map(e=><article key={e.id}><div className="sourcing-head"><span>{e.id}</span><em>{e.status}</em></div><h3>{e.title}</h3><p>{e.category}</p><div className="sourcing-metrics"><div><small>Presupuesto</small><b>{money(e.budget)}</b></div><div><small>Cotizaciones</small><b>{e.quotes}</b></div><div><small>Ahorro</small><b>{money(e.saving)}</b></div></div><footer><CalendarClock size={14}/>{e.deadline}</footer></article>)}</div>
    </section>}

    {tab==='documents'&&<section className="supplier-panel supplier-wide"><div className="supplier-panel-title"><div><small>WORKSPACE READY</small><h2>Biblioteca de abastecimiento</h2></div><FileText size={18}/></div><div className="supplier-docs">{supplierDocs.map(d=><div key={d}><FileText size={17}/><span>{d}</span><button onClick={()=>openWorkspace(d)}>Editar en Workspace</button></div>)}</div></section>}

    {tab==='agent'&&<DepartmentAgentWorkspace department={department} documents={supplierDocs} knowledge={supplierKnowledge} suggestions={supplierSuggestions} onOpenWorkspace={(title)=>openWorkspace(title)}/>} 

    {supplierOpen&&<div className="supplier-modal-backdrop" onMouseDown={()=>setSupplierOpen(false)}><div className="supplier-modal" onMouseDown={e=>e.stopPropagation()}><div className="supplier-modal-head"><div><Handshake size={18}/><b>Nuevo proveedor</b></div><button onClick={()=>setSupplierOpen(false)}><X size={17}/></button></div><label><span>Nombre</span><input value={draft.name} onChange={e=>setDraft({...draft,name:e.target.value})}/></label><div className="supplier-modal-grid"><label><span>Categoría</span><input value={draft.category} onChange={e=>setDraft({...draft,category:e.target.value})}/></label><label><span>País</span><input value={draft.country} onChange={e=>setDraft({...draft,country:e.target.value})}/></label></div><div className="supplier-modal-grid"><label><span>Spend estimado</span><input type="number" value={draft.spend} onChange={e=>setDraft({...draft,spend:Number(e.target.value)})}/></label><label><span>Responsable</span><input value={draft.owner} onChange={e=>setDraft({...draft,owner:e.target.value})}/></label></div><div className="supplier-onboarding-note"><Boxes size={17}/><span>El proveedor entra como <b>Condicionado</b> hasta completar documentación, evaluación de riesgo y aprobación.</span></div><div className="supplier-modal-actions"><button className="supplier-primary" onClick={createSupplier}>Crear proveedor</button><button onClick={()=>setSupplierOpen(false)}>Cancelar</button></div></div></div>}
  </section>
}

function SupplierKpi({icon,label,value,detail,tone}:{icon:React.ReactNode;label:string;value:string;detail:string;tone:string}){return <div className={`supplier-kpi ${tone}`}><span>{icon}</span><div><small>{label}</small><b>{value}</b><em>{detail}</em></div></div>}
function Decision({n,title,text,tone}:{n:string;title:string;text:string;tone:string}){return <div className={`supplier-decision ${tone}`}><span>{n}</span><div><b>{title}</b><p>{text}</p></div>{tone==='risk'?<TrendingDown size={16}/>:<TrendingUp size={16}/>}</div>}
function Score({label,value}:{label:string;value:number}){return <div className="score-line"><span>{label}</span><div><i style={{width:`${value}%`}}/></div><b>{value}</b></div>}
