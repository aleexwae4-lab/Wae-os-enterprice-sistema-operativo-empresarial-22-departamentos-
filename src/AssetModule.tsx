import { useMemo, useState, type ReactNode } from 'react'
import {
  AlertTriangle, BadgeCheck, Bot, Building2, CalendarClock, CheckCircle2, CircleDollarSign,
  FileCheck2, FileText, Gauge, HardDrive, History, Landmark, Laptop, Plus, QrCode,
  ScanLine, Search, ShieldCheck, Sparkles, Target, ToolCase, UserRound, Warehouse, X,
} from 'lucide-react'
import type { Department } from './data'
import DepartmentAgentWorkspace from './DepartmentAgentWorkspace'
import './asset-premium.css'

type Tab='command'|'assets'|'lifecycle'|'maintenance'|'depreciation'|'assignments'|'risk'|'documents'|'agent'
type AssetStatus='Operativo'|'Mantenimiento'|'Reserva'|'Retirado'
type Criticality='Baja'|'Media'|'Alta'|'Crítica'
type MaintenanceStatus='Programado'|'En curso'|'Completado'
type Risk='Bajo'|'Medio'|'Alto'|'Crítico'

type Asset={
  id:string;name:string;category:string;serial:string;location:string;custodian:string;department:string;
  costCenter:string;purchaseDate:string;purchaseCost:number;supplier:string;warrantyEnd:string;usefulLife:number;
  ageMonths:number;health:number;criticality:Criticality;status:AssetStatus;lastAudit:string;documents:number
}
type Maintenance={id:string;assetId:string;title:string;vendor:string;date:string;cost:number;type:'Preventivo'|'Correctivo'|'Predictivo';status:MaintenanceStatus}
type AssetRisk={id:string;assetId:string;title:string;risk:Risk;impact:string;control:string;status:'Abierto'|'Mitigado'}
type Assignment={id:string;assetId:string;from:string;to:string;date:string;reason:string;status:'Activo'|'Histórico'}

const money=(v:number)=>new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN',maximumFractionDigits:0}).format(v)
const todayYear=2026

const seedAssets:Asset[]=[
  {id:'AST-IT-001',name:'Servidor Rack 2U',category:'Infraestructura',serial:'SRV2-WAE-8841',location:'Site principal · Rack A3',custodian:'NEXUS',department:'Tecnología',costCenter:'CC-TECH-01',purchaseDate:'15 ene 2025',purchaseCost:186000,supplier:'CloudNet Services',warrantyEnd:'15 ene 2028',usefulLife:5,ageMonths:20,health:92,criticality:'Crítica',status:'Operativo',lastAudit:'30 ago 2026',documents:9},
  {id:'AST-IT-014',name:'Laptop ProBook 14',category:'Equipo de cómputo',serial:'LP14-0A91-MX',location:'Oficina Dirección',custodian:'Andrea Flores',department:'Operaciones',costCenter:'CC-OPS-02',purchaseDate:'10 nov 2025',purchaseCost:29800,supplier:'TechSupply MX',warrantyEnd:'10 nov 2027',usefulLife:3,ageMonths:10,health:88,criticality:'Alta',status:'Operativo',lastAudit:'29 ago 2026',documents:6},
  {id:'AST-NET-006',name:'Router WiFi 6 Core',category:'Redes',serial:'RT6-COR-3320',location:'Site principal · MDF',custodian:'NEXUS',department:'Tecnología',costCenter:'CC-TECH-01',purchaseDate:'05 mar 2025',purchaseCost:18400,supplier:'TechSupply MX',warrantyEnd:'05 mar 2027',usefulLife:4,ageMonths:18,health:73,criticality:'Crítica',status:'Mantenimiento',lastAudit:'31 ago 2026',documents:7},
  {id:'AST-MOB-021',name:'Laptop Comercial 13',category:'Equipo de cómputo',serial:'LC13-8821-MX',location:'Ventas · Piso 2',custodian:'Carolina Mata',department:'Ventas',costCenter:'CC-SALES-01',purchaseDate:'22 feb 2026',purchaseCost:24400,supplier:'TechSupply MX',warrantyEnd:'22 feb 2028',usefulLife:3,ageMonths:7,health:96,criticality:'Media',status:'Operativo',lastAudit:'28 ago 2026',documents:5},
  {id:'AST-OFF-032',name:'Silla ergonómica Ejecutiva',category:'Mobiliario',serial:'CHAIR-EX-032',location:'Dirección General',custodian:'Dirección',department:'Dirección General',costCenter:'CC-ADM-01',purchaseDate:'12 jun 2024',purchaseCost:12600,supplier:'Office World',warrantyEnd:'12 jun 2027',usefulLife:8,ageMonths:27,health:94,criticality:'Baja',status:'Operativo',lastAudit:'22 ago 2026',documents:3},
  {id:'AST-SEC-004',name:'Firewall NGFW',category:'Ciberseguridad',serial:'NGFW-WAE-401',location:'Site principal · Perímetro',custodian:'SENTINEL',department:'Seguridad',costCenter:'CC-SEC-01',purchaseDate:'08 oct 2024',purchaseCost:118000,supplier:'DataSecure',warrantyEnd:'08 oct 2026',usefulLife:5,ageMonths:23,health:69,criticality:'Crítica',status:'Operativo',lastAudit:'01 sep 2026',documents:11},
  {id:'AST-AV-011',name:'Cámara conferencia 4K',category:'Audiovisual',serial:'CAM4K-9112',location:'Sala Consejo',custodian:'Operaciones',department:'Operaciones',costCenter:'CC-OPS-01',purchaseDate:'18 may 2025',purchaseCost:15700,supplier:'Office World',warrantyEnd:'18 may 2027',usefulLife:4,ageMonths:16,health:90,criticality:'Media',status:'Reserva',lastAudit:'20 ago 2026',documents:4},
]

const seedMaintenance:Maintenance[]=[
  {id:'MNT-2609-01',assetId:'AST-NET-006',title:'Diagnóstico de latencia y temperatura',vendor:'NEXUS interno',date:'03 sep 2026',cost:0,type:'Predictivo',status:'En curso'},
  {id:'MNT-2609-02',assetId:'AST-IT-001',title:'Mantenimiento preventivo servidor',vendor:'CloudNet Services',date:'12 sep 2026',cost:8400,type:'Preventivo',status:'Programado'},
  {id:'MNT-2609-03',assetId:'AST-SEC-004',title:'Renovación soporte y health check',vendor:'DataSecure',date:'20 sep 2026',cost:12400,type:'Preventivo',status:'Programado'},
  {id:'MNT-2608-14',assetId:'AST-IT-014',title:'Actualización BIOS y batería',vendor:'TechSupply MX',date:'27 ago 2026',cost:1650,type:'Correctivo',status:'Completado'},
]

const seedRisks:AssetRisk[]=[
  {id:'RSK-A01',assetId:'AST-SEC-004',title:'Garantía próxima a vencer',risk:'Alto',impact:'Activo perimetral crítico sin cobertura extendida.',control:'Cotizar renovación y alternativa antes de octubre.',status:'Abierto'},
  {id:'RSK-A02',assetId:'AST-NET-006',title:'Health score degradado',risk:'Crítico',impact:'Posible indisponibilidad de red central.',control:'Diagnóstico predictivo y stock de reemplazo MERIDIAN.',status:'Abierto'},
  {id:'RSK-A03',assetId:'AST-IT-001',title:'Dependencia de infraestructura crítica',risk:'Medio',impact:'Concentración de servicio en un activo de cómputo principal.',control:'DR, respaldo y capacidad alternativa documentada.',status:'Abierto'},
]

const seedAssignments:Assignment[]=[
  {id:'ASN-01',assetId:'AST-IT-014',from:'Inventario TI',to:'Andrea Flores',date:'10 nov 2025',reason:'Asignación laboral',status:'Activo'},
  {id:'ASN-02',assetId:'AST-MOB-021',from:'Inventario TI',to:'Carolina Mata',date:'22 feb 2026',reason:'Asignación comercial',status:'Activo'},
  {id:'ASN-03',assetId:'AST-AV-011',from:'Marketing',to:'Operaciones',date:'18 jul 2026',reason:'Centralización de equipo audiovisual',status:'Activo'},
]

const documents=['Ficha maestra / Pasaporte digital de activo','Acta de asignación y custodia','Alta de activo fijo','Baja / disposición de activo','Cédula de depreciación','Programa de mantenimiento','Bitácora de mantenimiento','Reporte de inventario físico','Matriz de criticidad y riesgo','Reporte de garantías','Análisis TCO','Plan de renovación CAPEX','Checklist de auditoría patrimonial','Reporte para Comité de Activos']
const knowledge=['Política corporativa de activos fijos','Catálogo contable y vidas útiles LEDGER','Órdenes y recepciones PROCURE','Garantías y contratos SOURCE / JUSTITIA','Inventario físico MERIDIAN','Controles de seguridad NEXUS / SENTINEL','Centros de costo STERLING','Histórico autorizado de custodias, mantenimientos y bajas del tenant']
const suggestions=['¿Qué activos requieren decisión o mantenimiento hoy?','Prioriza renovaciones por criticidad, salud y TCO','Detecta activos sin custodio, garantía o evidencia suficiente','Prepara el plan CAPEX de renovación de los próximos 12 meses']

function bookValue(a:Asset){
  const months=Math.max(1,a.usefulLife*12)
  const depreciation=Math.min(a.purchaseCost,a.purchaseCost*(a.ageMonths/months))
  return Math.max(0,a.purchaseCost-depreciation)
}

export default function AssetModule({department}:{department:Department}){
  const [tab,setTab]=useState<Tab>('command')
  const [assets,setAssets]=useState(seedAssets)
  const [maintenance,setMaintenance]=useState(seedMaintenance)
  const [risks,setRisks]=useState(seedRisks)
  const [assignments,setAssignments]=useState(seedAssignments)
  const [query,setQuery]=useState('')
  const [selected,setSelected]=useState<string>('AST-IT-001')
  const [open,setOpen]=useState(false)
  const [draft,setDraft]=useState({name:'',category:'Equipo de cómputo',serial:'',location:'Por asignar',custodian:'Sin custodio',department:'Tecnología',cost:0,supplier:'Por definir',life:3})

  const acquisitionValue=assets.reduce((s,a)=>s+a.purchaseCost,0)
  const totalBook=assets.reduce((s,a)=>s+bookValue(a),0)
  const depreciation=acquisitionValue-totalBook
  const critical=assets.filter(a=>a.criticality==='Crítica').length
  const unhealthy=assets.filter(a=>a.health<75).length
  const maintenanceDue=maintenance.filter(m=>m.status!=='Completado').length
  const openRisks=risks.filter(r=>r.status==='Abierto').length
  const avgHealth=Math.round(assets.reduce((s,a)=>s+a.health,0)/Math.max(1,assets.length))
  const assetHealth=Math.max(0,Math.round(avgHealth-openRisks*1.5-unhealthy*2))

  const filtered=useMemo(()=>{
    const q=query.trim().toLowerCase();if(!q)return assets
    return assets.filter(a=>[a.id,a.name,a.category,a.serial,a.location,a.custodian,a.department,a.supplier,a.status].some(v=>v.toLowerCase().includes(q)))
  },[assets,query])
  const selectedAsset=assets.find(a=>a.id===selected)??assets[0]

  const createAsset=()=>{
    if(!draft.name.trim()||!draft.serial.trim()||draft.cost<=0)return
    const id=`AST-NEW-${String(assets.length+1).padStart(3,'0')}`
    setAssets(v=>[{id,name:draft.name.trim(),category:draft.category,serial:draft.serial.trim(),location:draft.location,custodian:draft.custodian,department:draft.department,costCenter:'POR-ASIGNAR',purchaseDate:'01 sep 2026',purchaseCost:Number(draft.cost),supplier:draft.supplier,warrantyEnd:'Por validar',usefulLife:Number(draft.life),ageMonths:0,health:100,criticality:'Media',status:'Reserva',lastAudit:'01 sep 2026',documents:1},...v])
    setDraft({name:'',category:'Equipo de cómputo',serial:'',location:'Por asignar',custodian:'Sin custodio',department:'Tecnología',cost:0,supplier:'Por definir',life:3});setSelected(id);setOpen(false);setTab('assets')
  }
  const service=(id:string)=>{
    setMaintenance(v=>v.map(m=>m.id===id?{...m,status:m.status==='Programado'?'En curso':'Completado'}:m))
    const task=maintenance.find(m=>m.id===id)
    if(task&&task.status==='En curso')setAssets(v=>v.map(a=>a.id===task.assetId?{...a,status:'Operativo',health:Math.min(100,a.health+12)}:a))
  }
  const mitigateRisk=(id:string)=>setRisks(v=>v.map(r=>r.id===id?{...r,status:'Mitigado'}:r))
  const transferAsset=(assetId:string)=>{
    const asset=assets.find(a=>a.id===assetId);if(!asset)return
    const next=asset.custodian==='NEXUS'?'Operaciones':'NEXUS'
    setAssignments(v=>[{id:`ASN-${String(v.length+1).padStart(2,'0')}`,assetId,from:asset.custodian,to:next,date:'01 sep 2026',reason:'Transferencia demo gobernada',status:'Activo'},...v.map(a=>a.assetId===assetId?{...a,status:'Histórico'}:a)])
    setAssets(v=>v.map(a=>a.id===assetId?{...a,custodian:next,lastAudit:'01 sep 2026'}:a))
  }

  const openWorkspace=(title:string)=>{
    localStorage.setItem('wae-workspace-draft',JSON.stringify({title,body:`# ${title}\n\n**Departamento:** Activos\n**Agente:** APEX\n\n## Alcance patrimonial\n- Activos registrados: ${assets.length}\n- Valor de adquisición: ${money(acquisitionValue)}\n- Valor en libros estimado: ${money(totalBook)}\n- Depreciación acumulada estimada: ${money(depreciation)}\n- Riesgos abiertos: ${openRisks}\n\n## Activo / población analizada\n\n## Custodia y ubicación\n\n## Evidencia y documentos\n\n## Estado, criticidad y mantenimiento\n\n## Garantía / lifecycle / TCO\n\n## Impacto contable y CAPEX\n\n## Aprobaciones\n\n> Documento operativo demo. Validar factura, alta contable, vida útil, política, evidencia física y autorizaciones antes de registrar movimientos patrimoniales reales.\n`}))
    const workspace=[...document.querySelectorAll('button')].find(b=>b.textContent?.trim()==='Workspace')
    if(workspace instanceof HTMLButtonElement)workspace.click()
  }

  return <section className="asset-premium">
    <header className="asset-head">
      <div className="asset-brand"><span><Landmark size={25}/></span><div><small>APEX · DIRECTOR DE ACTIVOS AI</small><h1>Asset Intelligence Command Center</h1><p>Pasaporte digital, lifecycle, custodia, mantenimiento, depreciación, TCO y riesgo patrimonial.</p></div></div>
      <div className="asset-head-status"><i/>Datos demo · Asset passport ready</div>
    </header>

    <nav className="asset-tabs">{[
      ['command','Command Center'],['assets','Asset 360'],['lifecycle','Lifecycle'],['maintenance','Mantenimiento'],['depreciation','Depreciación'],['assignments','Custodia'],['risk','Riesgo'],['documents','Documentos'],['agent','APEX AI'],
    ].map(([id,label])=><button key={id} className={tab===id?'active':''} onClick={()=>setTab(id as Tab)}>{label}</button>)}</nav>

    {tab!=='agent'&&<div className="asset-kpis">
      <Kpi icon={<Gauge size={18}/>} label="Asset health" value={`${assetHealth}/100`} detail={`${unhealthy} activos bajo 75`} tone="emerald"/>
      <Kpi icon={<Landmark size={18}/>} label="Valor adquisición" value={money(acquisitionValue)} detail={`${assets.length} activos`} tone="cyan"/>
      <Kpi icon={<CircleDollarSign size={18}/>} label="Valor en libros" value={money(totalBook)} detail={`${money(depreciation)} depreciado`} tone="violet"/>
      <Kpi icon={<ToolCase size={18}/>} label="Mantenimiento" value={String(maintenanceDue)} detail="intervenciones abiertas" tone="amber"/>
      <Kpi icon={<AlertTriangle size={18}/>} label="Criticidad" value={String(critical)} detail={`${openRisks} riesgos abiertos`} tone="rose"/>
    </div>}

    {tab==='command'&&<div className="asset-layout">
      <section className="asset-panel asset-hero-panel"><div className="asset-panel-title"><div><small>ASSET OWNER VIEW</small><h2>Postura patrimonial</h2></div><span className="asset-score"><ShieldCheck size={17}/>{assetHealth}/100</span></div>
        <div className="asset-health-grid"><div><span>Identidad</span><b>100% serializada</b><i className="good"/></div><div><span>Salud promedio</span><b>{avgHealth}%</b><i className={avgHealth>=85?'good':'warn'}/></div><div><span>Críticos</span><b>{critical}</b><i className={unhealthy?'risk':'warn'}/></div><div><span>Mantenimiento</span><b>{maintenanceDue} abiertos</b><i className={maintenanceDue?'warn':'good'}/></div></div>
        <div className="asset-ai-brief"><Sparkles size={21}/><div><b>Lectura de APEX</b><p>El mayor riesgo patrimonial está en el Router Core y el Firewall: ambos son críticos y muestran señales de lifecycle que requieren mantenimiento, garantía o renovación. El CAPEX debe priorizar continuidad antes que crecimiento no crítico.</p></div></div>
      </section>
      <section className="asset-panel"><div className="asset-panel-title"><div><small>DECISION QUEUE</small><h2>Activos por decidir</h2></div><Bot size={18}/></div>{assets.filter(a=>a.health<80||a.criticality==='Crítica').slice(0,4).map(a=><button className="asset-decision" key={a.id} onClick={()=>{setSelected(a.id);setTab('assets')}}><span className={`criticality-${a.criticality.toLowerCase()}`}>{a.criticality}</span><div><b>{a.name}</b><small>{a.id} · Health {a.health}% · {a.status}</small></div></button>)}</section>
      <section className="asset-panel"><div className="asset-panel-title"><div><small>LIFECYCLE SIGNALS</small><h2>Alertas</h2></div><AlertTriangle size={18}/></div>{risks.filter(r=>r.status==='Abierto').map(r=><div className="asset-alert" key={r.id}><span className={`risk-${r.risk.toLowerCase()}`}>{r.risk}</span><div><b>{r.title}</b><small>{r.assetId} · {r.control}</small></div></div>)}</section>
    </div>}

    {tab==='assets'&&<div className="asset-layout asset-360-layout">
      <section className="asset-panel asset-list-panel"><div className="asset-toolbar"><div><small>ASSET REGISTER</small><h2>Asset 360</h2></div><div className="asset-actions"><label><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar activo..."/></label><button className="primary" onClick={()=>setOpen(true)}><Plus size={16}/>Nuevo activo</button></div></div><div className="asset-register">{filtered.map(a=><button key={a.id} className={selected===a.id?'active':''} onClick={()=>setSelected(a.id)}><AssetIcon category={a.category}/><div><b>{a.name}</b><small>{a.id} · {a.serial}</small><span>{a.location} · {a.custodian}</span></div><em>{a.health}%</em></button>)}</div></section>
      {selectedAsset&&<section className="asset-panel passport"><div className="passport-head"><div className="passport-code"><QrCode size={38}/><span>DIGITAL ASSET PASSPORT</span></div><div><small>{selectedAsset.id}</small><h2>{selectedAsset.name}</h2><p>{selectedAsset.category} · {selectedAsset.serial}</p></div><span className={`asset-status ${selectedAsset.status.toLowerCase()}`}>{selectedAsset.status}</span></div><div className="passport-grid"><Field label="Custodio" value={selectedAsset.custodian}/><Field label="Departamento" value={selectedAsset.department}/><Field label="Ubicación" value={selectedAsset.location}/><Field label="Centro de costo" value={selectedAsset.costCenter}/><Field label="Proveedor" value={selectedAsset.supplier}/><Field label="Compra" value={selectedAsset.purchaseDate}/><Field label="Costo" value={money(selectedAsset.purchaseCost)}/><Field label="Valor libro" value={money(bookValue(selectedAsset))}/><Field label="Garantía" value={selectedAsset.warrantyEnd}/><Field label="Vida útil" value={`${selectedAsset.usefulLife} años`}/><Field label="Health" value={`${selectedAsset.health}/100`}/><Field label="Última auditoría" value={selectedAsset.lastAudit}/></div><div className="passport-footer"><span><FileCheck2 size={16}/>{selectedAsset.documents} documentos/evidencias</span><span><BadgeCheck size={16}/>{selectedAsset.criticality} criticidad</span><button onClick={()=>transferAsset(selectedAsset.id)}><UserRound size={15}/>Transferir custodia</button></div></section>}
    </div>}

    {tab==='lifecycle'&&<section className="asset-panel asset-wide"><div className="asset-panel-title"><div><small>LIFECYCLE ENGINE</small><h2>Compra → operación → mantenimiento → renovación → baja</h2></div><History size={18}/></div><div className="lifecycle-grid">{assets.map(a=>{const used=Math.min(100,Math.round(a.ageMonths/(a.usefulLife*12)*100));return <div className="lifecycle-card" key={a.id}><div><AssetIcon category={a.category}/><span><b>{a.name}</b><small>{a.id} · {a.criticality}</small></span></div><div className="life-track"><i style={{width:`${used}%`}}/></div><div className="life-metrics"><span>Vida consumida <b>{used}%</b></span><span>Health <b>{a.health}%</b></span><span>Libro <b>{money(bookValue(a))}</b></span></div><em>{used>75||a.health<75?'Revisar renovación':'Operación normal'}</em></div>})}</div></section>}

    {tab==='maintenance'&&<section className="asset-panel asset-wide"><div className="asset-panel-title"><div><small>MAINTENANCE INTELLIGENCE</small><h2>Preventivo, correctivo y predictivo</h2></div><ToolCase size={18}/></div><div className="maintenance-grid">{maintenance.map(m=>{const a=assets.find(x=>x.id===m.assetId);return <div className="maintenance-card" key={m.id}><div><span className={`maint-type ${m.type.toLowerCase()}`}>{m.type}</span><span className="maint-status">{m.status}</span></div><h3>{m.title}</h3><p>{a?.name} · {m.assetId}</p><div className="maint-info"><span><CalendarClock size={14}/>{m.date}</span><span><Building2 size={14}/>{m.vendor}</span><span><CircleDollarSign size={14}/>{money(m.cost)}</span></div>{m.status!=='Completado'&&<button onClick={()=>service(m.id)}>{m.status==='Programado'?'Iniciar':'Completar'} intervención</button>}</div>})}</div></section>}

    {tab==='depreciation'&&<section className="asset-panel asset-wide"><div className="asset-panel-title"><div><small>LEDGER LINK</small><h2>Depreciación y valor en libros</h2></div><CircleDollarSign size={18}/></div><div className="depreciation-summary"><div><span>Costo histórico</span><b>{money(acquisitionValue)}</b></div><div><span>Depreciación acumulada</span><b>{money(depreciation)}</b></div><div><span>Valor en libros</span><b>{money(totalBook)}</b></div></div><div className="asset-table-wrap"><table><thead><tr><th>Activo</th><th>Compra</th><th>Vida útil</th><th>Edad</th><th>Costo</th><th>Depreciación</th><th>Valor libro</th></tr></thead><tbody>{assets.map(a=>{const bv=bookValue(a);return <tr key={a.id}><td><b>{a.name}</b><small>{a.id}</small></td><td>{a.purchaseDate}</td><td>{a.usefulLife} años</td><td>{a.ageMonths} meses</td><td>{money(a.purchaseCost)}</td><td>{money(a.purchaseCost-bv)}</td><td>{money(bv)}</td></tr>})}</tbody></table></div><p className="asset-disclaimer">Cálculo demo lineal para gestión. Vida útil, valor residual, componentes y tratamiento fiscal/contable deben validarse en LEDGER antes de contabilizar.</p></section>}

    {tab==='assignments'&&<section className="asset-panel asset-wide"><div className="asset-panel-title"><div><small>CUSTODY CHAIN</small><h2>Custodia y trazabilidad</h2></div><UserRound size={18}/></div><div className="assignment-grid">{assignments.map(a=>{const asset=assets.find(x=>x.id===a.assetId);return <div className="assignment-card" key={a.id}><ScanLine size={20}/><div><b>{asset?.name??a.assetId}</b><small>{a.date} · {a.reason}</small><p>{a.from} <strong>→</strong> {a.to}</p></div><span>{a.status}</span></div>})}</div></section>}

    {tab==='risk'&&<section className="asset-panel asset-wide"><div className="asset-panel-title"><div><small>ASSET RISK</small><h2>Criticidad, continuidad y garantías</h2></div><ShieldCheck size={18}/></div><div className="risk-grid">{risks.map(r=>{const asset=assets.find(a=>a.id===r.assetId);return <div className={`risk-card ${r.status==='Mitigado'?'resolved':''}`} key={r.id}><div><span className={`risk-${r.risk.toLowerCase()}`}>{r.risk}</span><span>{r.status}</span></div><h3>{r.title}</h3><p><b>{asset?.name}</b> · {r.assetId}</p><small>{r.impact}</small><em>Control: {r.control}</em>{r.status==='Abierto'&&<button onClick={()=>mitigateRisk(r.id)}>Marcar mitigado</button>}</div>})}</div></section>}

    {tab==='documents'&&<section className="asset-panel asset-wide"><div className="asset-panel-title"><div><small>ASSET DOCUMENT HUB</small><h2>Documentos y auditoría patrimonial</h2></div><FileText size={18}/></div><div className="asset-docs">{documents.map((d,i)=><button key={d} onClick={()=>openWorkspace(d)}><span><FileText size={18}/></span><div><b>{d}</b><small>{i<5?'Documento maestro':'Generable desde APEX'}</small></div><em>Editar en Workspace</em></button>)}</div></section>}

    {tab==='agent'&&<DepartmentAgentWorkspace department={department} documents={documents} knowledge={knowledge} suggestions={suggestions} integrations={['PROCURE','SOURCE','MERIDIAN','LEDGER','STERLING','NEXUS','SENTINEL','CEO Chat']} onOpenWorkspace={openWorkspace}/>} 

    {open&&<div className="asset-modal"><div className="asset-modal-card"><button className="modal-close" onClick={()=>setOpen(false)}><X size={18}/></button><div><small>ASSET ONBOARDING</small><h2>Nuevo activo</h2><p>El alta queda en reserva hasta validar factura, recepción, custodia y tratamiento contable.</p></div><div className="asset-form"><label>Nombre<input value={draft.name} onChange={e=>setDraft({...draft,name:e.target.value})}/></label><label>Categoría<select value={draft.category} onChange={e=>setDraft({...draft,category:e.target.value})}><option>Equipo de cómputo</option><option>Infraestructura</option><option>Redes</option><option>Ciberseguridad</option><option>Mobiliario</option><option>Audiovisual</option><option>Vehículo</option></select></label><label>Serial<input value={draft.serial} onChange={e=>setDraft({...draft,serial:e.target.value})}/></label><label>Ubicación<input value={draft.location} onChange={e=>setDraft({...draft,location:e.target.value})}/></label><label>Custodio<input value={draft.custodian} onChange={e=>setDraft({...draft,custodian:e.target.value})}/></label><label>Departamento<input value={draft.department} onChange={e=>setDraft({...draft,department:e.target.value})}/></label><label>Costo<input type="number" value={draft.cost||''} onChange={e=>setDraft({...draft,cost:Number(e.target.value)})}/></label><label>Proveedor<input value={draft.supplier} onChange={e=>setDraft({...draft,supplier:e.target.value})}/></label><label>Vida útil (años)<input type="number" min="1" max="20" value={draft.life} onChange={e=>setDraft({...draft,life:Number(e.target.value)})}/></label></div><button className="primary full" onClick={createAsset}><Plus size={16}/>Crear pasaporte de activo</button></div></div>}
  </section>
}

function Kpi({icon,label,value,detail,tone}:{icon:ReactNode;label:string;value:string;detail:string;tone:string}){return <div className={`asset-kpi ${tone}`}><span>{icon}</span><div><small>{label}</small><b>{value}</b><em>{detail}</em></div></div>}
function Field({label,value}:{label:string;value:string}){return <div className="passport-field"><span>{label}</span><b>{value}</b></div>}
function AssetIcon({category}:{category:string}){if(category.includes('cómputo'))return <Laptop size={20}/>;if(category==='Infraestructura'||category==='Ciberseguridad'||category==='Redes')return <HardDrive size={20}/>;if(category==='Mobiliario')return <Landmark size={20}/>;return <Warehouse size={20}/>}
