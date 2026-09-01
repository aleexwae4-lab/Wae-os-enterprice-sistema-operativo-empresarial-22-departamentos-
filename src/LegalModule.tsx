import { useMemo, useState } from 'react'
import {
  AlertTriangle, Bot, CalendarClock, CheckCircle2, FileCheck2, FileText, Gavel,
  Landmark, Link2, Plus, Scale, Search, ShieldAlert, Sparkles, TimerReset, X,
} from 'lucide-react'
import type { Department } from './data'
import DepartmentAgentWorkspace from './DepartmentAgentWorkspace'
import './legal-premium.css'

type Tab='command'|'matters'|'contracts'|'obligations'|'calendar'|'risk'|'evidence'|'documents'|'agent'
type Risk='Bajo'|'Medio'|'Alto'|'Crítico'
type MatterStatus='Activo'|'En revisión'|'Pendiente'|'Cerrado'
type ContractStatus='Vigente'|'Por vencer'|'En revisión'|'Finalizado'

type Matter={
  id:string;title:string;type:string;authority:string;caseNo:string;owner:string;
  nextDate:string;risk:Risk;status:MatterStatus;provision:number;evidence:number
}
type Contract={
  id:string;counterparty:string;type:string;value:number;start:string;end:string;
  owner:string;risk:Risk;status:ContractStatus;obligations:number
}
type Obligation={id:string;title:string;source:string;owner:string;due:string;status:'Pendiente'|'Cumplida'|'En riesgo';risk:Risk}
type Evidence={id:string;matterId:string;name:string;kind:string;source:string;integrity:'Verificada'|'Pendiente';updated:string}

const money=(v:number)=>new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN',maximumFractionDigits:0}).format(v)

const seedMatters:Matter[]=[
  {id:'MAT-001',title:'Renovación contrato estratégico',type:'Corporativo',authority:'Interno',caseNo:'CORP-2026-018',owner:'Legal Corporativo',nextDate:'08 sep 2026',risk:'Alto',status:'Activo',provision:0,evidence:8},
  {id:'MAT-002',title:'Controversia proveedor crítico',type:'Civil / Mercantil',authority:'Mediación privada',caseNo:'MED-2026-044',owner:'JUSTITIA',nextDate:'12 sep 2026',risk:'Crítico',status:'En revisión',provision:185000,evidence:14},
  {id:'MAT-003',title:'Revisión cumplimiento laboral',type:'Laboral',authority:'Interno',caseNo:'LAB-2026-031',owner:'Legal Laboral',nextDate:'18 sep 2026',risk:'Medio',status:'Pendiente',provision:45000,evidence:6},
  {id:'MAT-004',title:'Protección de propiedad intelectual',type:'PI / Tecnología',authority:'IMPI · seguimiento interno',caseNo:'IP-2026-009',owner:'Legal Tech',nextDate:'26 sep 2026',risk:'Medio',status:'Activo',provision:0,evidence:11},
]

const seedContracts:Contract[]=[
  {id:'CTR-101',counterparty:'CloudNet Services',type:'SLA / Tecnología',value:456000,start:'01 ene 2026',end:'14 sep 2026',owner:'NEXUS + Legal',risk:'Alto',status:'Por vencer',obligations:6},
  {id:'CTR-102',counterparty:'Cobalt',type:'Servicios profesionales',value:690000,start:'01 mar 2026',end:'30 nov 2026',owner:'Ventas + Legal',risk:'Bajo',status:'Vigente',obligations:4},
  {id:'CTR-103',counterparty:'Northwind',type:'Marco comercial',value:820000,start:'15 feb 2026',end:'02 oct 2026',owner:'CLOSER + Legal',risk:'Medio',status:'Por vencer',obligations:7},
  {id:'CTR-104',counterparty:'Seguros Atlas',type:'Seguro corporativo',value:505200,start:'01 oct 2025',end:'30 sep 2026',owner:'Finanzas + Legal',risk:'Alto',status:'Por vencer',obligations:5},
]

const seedObligations:Obligation[]=[
  {id:'OBL-01',title:'Renovar SLA de infraestructura',source:'CTR-101',owner:'NEXUS',due:'14 sep 2026',status:'En riesgo',risk:'Alto'},
  {id:'OBL-02',title:'Actualizar aviso de privacidad corporativo',source:'LFPDPPP / Política interna',owner:'SENTINEL + Legal',due:'20 sep 2026',status:'Pendiente',risk:'Medio'},
  {id:'OBL-03',title:'Revisión trimestral de poderes',source:'Gobierno corporativo',owner:'Dirección + Legal',due:'25 sep 2026',status:'Pendiente',risk:'Medio'},
  {id:'OBL-04',title:'Renovar póliza corporativa',source:'CTR-104',owner:'STERLING',due:'30 sep 2026',status:'En riesgo',risk:'Alto'},
  {id:'OBL-05',title:'Entrega de evidencia contractual a auditoría',source:'Control interno',owner:'Legal',due:'05 oct 2026',status:'Pendiente',risk:'Bajo'},
]

const seedEvidence:Evidence[]=[
  {id:'EVD-201',matterId:'MAT-002',name:'Contrato marco firmado.pdf',kind:'Contrato',source:'Biblioteca corporativa',integrity:'Verificada',updated:'31 ago 2026'},
  {id:'EVD-202',matterId:'MAT-002',name:'Cadena de correos de incumplimiento.eml',kind:'Comunicación',source:'Expediente interno',integrity:'Verificada',updated:'31 ago 2026'},
  {id:'EVD-203',matterId:'MAT-001',name:'SLA vigente.pdf',kind:'Contrato',source:'NEXUS / Documentos',integrity:'Verificada',updated:'30 ago 2026'},
  {id:'EVD-204',matterId:'MAT-003',name:'Matriz de cumplimiento laboral.xlsx',kind:'Matriz',source:'TALENT / Compliance',integrity:'Pendiente',updated:'01 sep 2026'},
  {id:'EVD-205',matterId:'MAT-004',name:'Registro de activos de marca.pdf',kind:'Propiedad intelectual',source:'Legal Tech',integrity:'Verificada',updated:'29 ago 2026'},
]

const legalDocs=[
  'Contrato marco de servicios','NDA / Acuerdo de confidencialidad','Convenio modificatorio','Acta corporativa',
  'Memorándum jurídico ejecutivo','Matriz de riesgos legales','Reporte de vencimientos','Checklist de due diligence',
  'Cronología del asunto','Informe de obligaciones contractuales','Legal hold / preservación de evidencia','Reporte para Consejo',
]
const legalKnowledge=[
  'Constitución Política de los Estados Unidos Mexicanos','Código de Comercio','Código Civil Federal',
  'Ley Federal del Trabajo','Ley Federal de Protección de Datos Personales en Posesión de los Particulares',
  'Ley Federal de Protección a la Propiedad Industrial','Políticas corporativas y matriz de autorizaciones',
  'Contratos y evidencia interna autorizada de la empresa',
]
const legalSuggestions=[
  'Dame el mapa de riesgo jurídico de la empresa','¿Qué contratos y obligaciones vencen primero?',
  'Resume el expediente MAT-002 usando solo evidencia disponible','Prepara un plan de acción para los riesgos legales críticos',
]

export default function LegalModule({department}:{department:Department}){
  const [tab,setTab]=useState<Tab>('command')
  const [matters,setMatters]=useState(seedMatters)
  const [contracts,setContracts]=useState(seedContracts)
  const [obligations,setObligations]=useState(seedObligations)
  const [query,setQuery]=useState('')
  const [matterOpen,setMatterOpen]=useState(false)
  const [draft,setDraft]=useState({title:'',type:'Corporativo',authority:'Interno',owner:'JUSTITIA',risk:'Medio' as Risk})

  const activeMatters=matters.filter(m=>m.status!=='Cerrado')
  const critical=activeMatters.filter(m=>m.risk==='Crítico').length
  const high=activeMatters.filter(m=>m.risk==='Alto').length
  const expiring=contracts.filter(c=>c.status==='Por vencer').length
  const atRisk=obligations.filter(o=>o.status==='En riesgo').length
  const provisions=matters.reduce((s,m)=>s+m.provision,0)
  const evidenceVerified=seedEvidence.filter(e=>e.integrity==='Verificada').length

  const filteredMatters=useMemo(()=>{
    const q=query.trim().toLowerCase();if(!q)return matters
    return matters.filter(m=>[m.id,m.title,m.type,m.authority,m.caseNo,m.owner,m.risk,m.status].some(v=>v.toLowerCase().includes(q)))
  },[matters,query])

  const createMatter=()=>{
    if(!draft.title.trim())return
    setMatters(v=>[{id:`MAT-${String(v.length+1).padStart(3,'0')}`,title:draft.title.trim(),type:draft.type,authority:draft.authority,caseNo:`NEW-${Date.now().toString().slice(-5)}`,owner:draft.owner,nextDate:'Por definir',risk:draft.risk,status:'En revisión',provision:0,evidence:0},...v])
    setDraft({title:'',type:'Corporativo',authority:'Interno',owner:'JUSTITIA',risk:'Medio'});setMatterOpen(false);setTab('matters')
  }
  const closeMatter=(id:string)=>setMatters(v=>v.map(m=>m.id===id?{...m,status:'Cerrado'}:m))
  const reviewContract=(id:string)=>setContracts(v=>v.map(c=>c.id===id?{...c,status:'En revisión'}:c))
  const completeObligation=(id:string)=>setObligations(v=>v.map(o=>o.id===id?{...o,status:'Cumplida'}:o))

  const openWorkspace=(title:string)=>{
    localStorage.setItem('wae-workspace-draft',JSON.stringify({title,body:`# ${title}\n\n**Departamento:** Legal\n**Agente:** JUSTITIA\n\n## Objeto\n\n## Hechos / contexto\n\n## Documentos y evidencia fuente\n\n## Marco jurídico aplicable\n\n## Análisis\n\n## Riesgos y supuestos\n\n## Recomendaciones\n\n## Aprobaciones\n\n> Borrador operativo. JUSTITIA debe distinguir evidencia interna, fuente jurídica y conocimiento general; validar vigencia normativa y revisión profesional antes de una actuación externa.\n`}))
    const workspace=[...document.querySelectorAll('button')].find(b=>b.textContent?.trim()==='Workspace')
    if(workspace instanceof HTMLButtonElement)workspace.click()
  }

  return <section className="legal-premium">
    <header className="legal-head">
      <div className="legal-brand"><span><Gavel size={25}/></span><div><small>JUSTITIA · DIRECTOR JURÍDICO AI</small><h1>Legal Command Center</h1><p>Asuntos, contratos, obligaciones, evidencia, calendario y riesgo jurídico en una sola capa de control.</p></div></div>
      <div className="legal-head-status"><i/>Datos demo · Evidence-aware</div>
    </header>

    <nav className="legal-tabs">
      {[
        ['command','Command Center'],['matters','Asuntos'],['contracts','Contratos'],['obligations','Obligaciones'],
        ['calendar','Calendario'],['risk','Riesgo'],['evidence','Evidencia'],['documents','Documentos'],['agent','JUSTITIA AI'],
      ].map(([id,label])=><button key={id} className={tab===id?'active':''} onClick={()=>setTab(id as Tab)}>{label}</button>)}
    </nav>

    {tab!=='agent'&&<div className="legal-kpis">
      <LegalKpi icon={<Gavel size={18}/>} label="Asuntos activos" value={String(activeMatters.length)} detail={`${critical} crítico · ${high} alto`} tone="violet"/>
      <LegalKpi icon={<FileCheck2 size={18}/>} label="Contratos" value={String(contracts.length)} detail={`${expiring} por vencer`} tone="cyan"/>
      <LegalKpi icon={<CalendarClock size={18}/>} label="Obligaciones" value={String(obligations.length)} detail={`${atRisk} en riesgo`} tone="amber"/>
      <LegalKpi icon={<Landmark size={18}/>} label="Provisiones" value={money(provisions)} detail="Exposición estimada demo" tone="rose"/>
      <LegalKpi icon={<ShieldAlert size={18}/>} label="Evidencia" value={`${evidenceVerified}/${seedEvidence.length}`} detail="integridad verificada" tone="emerald"/>
    </div>}

    {tab==='command'&&<div className="legal-layout">
      <section className="legal-panel legal-hero-panel">
        <div className="legal-panel-title"><div><small>GENERAL COUNSEL VIEW</small><h2>Postura jurídica corporativa</h2></div><span className="legal-score"><Scale size={17}/>78/100</span></div>
        <div className="legal-health-grid">
          <div><span>Contratos</span><b>{expiring} por vencer</b><i className={expiring?'warn':'good'}/></div>
          <div><span>Litigio / controversia</span><b>{critical?'Crítico':'Controlado'}</b><i className={critical?'risk':'good'}/></div>
          <div><span>Compliance legal</span><b>{atRisk?'Atención':'Estable'}</b><i className={atRisk?'warn':'good'}/></div>
          <div><span>Evidence readiness</span><b>{Math.round(evidenceVerified/seedEvidence.length*100)}%</b><i className="good"/></div>
        </div>
        <div className="legal-ai-brief"><Sparkles size={21}/><div><b>Lectura de JUSTITIA</b><p>La prioridad jurídica es resolver la controversia con proveedor crítico y renovar los contratos que vencen en septiembre. Toda recomendación debe vincularse a evidencia disponible y a una fuente jurídica vigente antes de una actuación externa.</p></div></div>
      </section>

      <section className="legal-panel">
        <div className="legal-panel-title"><div><small>PRÓXIMOS HITOS</small><h2>Calendario crítico</h2></div><CalendarClock size={18}/></div>
        <div className="legal-timeline">{[
          ['08 sep','MAT-001','Revisión renovación contractual','Alto'],['12 sep','MAT-002','Sesión de mediación','Crítico'],
          ['14 sep','CTR-101','Vence SLA CloudNet','Alto'],['20 sep','OBL-02','Aviso de privacidad','Medio'],['30 sep','CTR-104','Renovación póliza','Alto'],
        ].map(x=><div key={x[1]}><span>{x[0]}</span><div><b>{x[2]}</b><small>{x[1]}</small></div><em className={`risk-${x[3].toLowerCase()}`}>{x[3]}</em></div>)}</div>
      </section>

      <section className="legal-panel">
        <div className="legal-panel-title"><div><small>DECISION SUPPORT</small><h2>Acciones recomendadas</h2></div><Bot size={18}/></div>
        <div className="legal-decisions">
          <Decision n="01" title="Blindar evidencia de MAT-002" text="Preservar contrato, comunicaciones y cronología antes de cualquier negociación." tone="risk"/>
          <Decision n="02" title="Renovar contratos críticos" text="Priorizar CloudNet y póliza corporativa; revisar SLA, responsabilidad y terminación." tone="warn"/>
          <Decision n="03" title="Cerrar obligaciones de septiembre" text="Asignar responsables y evidencia de cumplimiento antes de cada vencimiento." tone="good"/>
        </div>
      </section>
    </div>}

    {tab==='matters'&&<section className="legal-panel legal-wide">
      <div className="legal-panel-title"><div><small>MATTER MANAGEMENT</small><h2>Asuntos y expedientes</h2></div><button className="legal-primary" onClick={()=>setMatterOpen(true)}><Plus size={15}/>Nuevo asunto</button></div>
      <label className="legal-search"><Search size={15}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar asunto, expediente, autoridad, responsable..."/></label>
      <div className="legal-table-wrap"><table><thead><tr><th>ID</th><th>Asunto</th><th>Tipo</th><th>Autoridad / foro</th><th>Próximo hito</th><th>Riesgo</th><th>Estado</th><th/></tr></thead><tbody>{filteredMatters.map(m=><tr key={m.id}><td>{m.id}</td><td><b>{m.title}</b><small>{m.caseNo} · {m.evidence} evidencias</small></td><td>{m.type}</td><td>{m.authority}</td><td>{m.nextDate}</td><td><span className={`legal-risk risk-${m.risk.toLowerCase()}`}>{m.risk}</span></td><td>{m.status}</td><td>{m.status!=='Cerrado'&&<button onClick={()=>closeMatter(m.id)}>Cerrar</button>}</td></tr>)}</tbody></table></div>
    </section>}

    {tab==='contracts'&&<section className="legal-panel legal-wide">
      <div className="legal-panel-title"><div><small>CONTRACT LIFECYCLE</small><h2>Contratos</h2></div><span>{expiring} requieren renovación</span></div>
      <div className="legal-table-wrap"><table><thead><tr><th>Contrato</th><th>Contraparte</th><th>Tipo</th><th>Valor</th><th>Vigencia</th><th>Obligaciones</th><th>Riesgo</th><th>Estado</th><th/></tr></thead><tbody>{contracts.map(c=><tr key={c.id}><td>{c.id}</td><td><b>{c.counterparty}</b><small>{c.owner}</small></td><td>{c.type}</td><td>{money(c.value)}</td><td>{c.start}<br/>{c.end}</td><td>{c.obligations}</td><td><span className={`legal-risk risk-${c.risk.toLowerCase()}`}>{c.risk}</span></td><td>{c.status}</td><td>{c.status!=='En revisión'&&<button onClick={()=>reviewContract(c.id)}>Revisar</button>}</td></tr>)}</tbody></table></div>
    </section>}

    {tab==='obligations'&&<section className="legal-panel legal-wide">
      <div className="legal-panel-title"><div><small>OBLIGATION TRACKING</small><h2>Obligaciones y compromisos</h2></div><span>{atRisk} en riesgo</span></div>
      <div className="legal-obligation-list">{obligations.map(o=><article key={o.id}><span className="legal-orb"><TimerReset size={16}/></span><div><b>{o.title}</b><small>{o.source} · Responsable: {o.owner}</small></div><span>{o.due}</span><em className={`risk-${o.risk.toLowerCase()}`}>{o.status}</em>{o.status!=='Cumplida'&&<button onClick={()=>completeObligation(o.id)}>Cumplir</button>}</article>)}</div>
    </section>}

    {tab==='calendar'&&<section className="legal-panel legal-wide">
      <div className="legal-panel-title"><div><small>DEADLINE INTELLIGENCE</small><h2>Calendario legal consolidado</h2></div><CalendarClock size={18}/></div>
      <div className="legal-calendar-grid">{['08 sep · MAT-001 · Revisión','12 sep · MAT-002 · Mediación','14 sep · CTR-101 · Vencimiento','18 sep · MAT-003 · Auditoría laboral','20 sep · OBL-02 · Privacidad','25 sep · OBL-03 · Poderes','30 sep · CTR-104 · Seguro','02 oct · CTR-103 · Vencimiento','05 oct · OBL-05 · Evidencia'].map((x,i)=><div key={x} className={i<3?'urgent':''}><CalendarClock size={16}/><span>{x}</span></div>)}</div>
    </section>}

    {tab==='risk'&&<div className="legal-layout">
      <section className="legal-panel legal-wide"><div className="legal-panel-title"><div><small>LEGAL RISK MATRIX</small><h2>Mapa de riesgo jurídico</h2></div><ShieldAlert size={18}/></div><div className="risk-matrix">
        <RiskBox label="Crítico" value={critical} text="Controversias con impacto inmediato"/>
        <RiskBox label="Alto" value={high+contracts.filter(c=>c.risk==='Alto').length} text="Contratos, vencimientos y exposición"/>
        <RiskBox label="Medio" value={matters.filter(m=>m.risk==='Medio').length+contracts.filter(c=>c.risk==='Medio').length} text="Revisión y mitigación programada"/>
        <RiskBox label="Bajo" value={contracts.filter(c=>c.risk==='Bajo').length} text="Monitoreo ordinario"/>
      </div></section>
      <section className="legal-panel"><h2>Exposición económica demo</h2><div className="exposure-number">{money(provisions)}</div><p>Provisión asociada a asuntos abiertos. No representa una valuación contable ni jurídica definitiva.</p></section>
      <section className="legal-panel"><h2>Controles</h2>{['Revisión contractual','Calendario de términos','Preservación de evidencia','Matriz de autorizaciones','Revisión de conflictos'].map(x=><div className="legal-control" key={x}><CheckCircle2 size={16}/><span>{x}</span><b>Activo</b></div>)}</section>
    </div>}

    {tab==='evidence'&&<section className="legal-panel legal-wide">
      <div className="legal-panel-title"><div><small>EVIDENCE LAYER</small><h2>Documentos y evidencia vinculada</h2></div><span>{evidenceVerified} verificadas</span></div>
      <div className="legal-evidence-list">{seedEvidence.map(e=><article key={e.id}><span className="legal-orb"><FileCheck2 size={16}/></span><div><b>{e.name}</b><small>{e.id} · {e.matterId} · {e.kind}</small></div><span>{e.source}</span><em className={e.integrity==='Verificada'?'verified':'pending'}>{e.integrity}</em><small>{e.updated}</small></article>)}</div>
      <div className="evidence-rule"><AlertTriangle size={18}/><p><b>Regla de JUSTITIA:</b> no afirmar hechos del expediente si no están soportados por evidencia disponible; separar hechos, inferencias y conocimiento jurídico general.</p></div>
    </section>}

    {tab==='documents'&&<section className="legal-panel legal-wide"><div className="legal-panel-title"><div><small>WORKSPACE READY</small><h2>Biblioteca jurídica</h2></div><FileText size={18}/></div><div className="legal-doc-grid">{legalDocs.map(d=><button key={d} onClick={()=>openWorkspace(d)}><FileText size={17}/><span>{d}</span><small>Editar en Workspace</small></button>)}</div></section>}

    {tab==='agent'&&<DepartmentAgentWorkspace department={department} documents={legalDocs} knowledge={legalKnowledge} suggestions={legalSuggestions} onOpenWorkspace={(title)=>openWorkspace(title)}/>} 

    {matterOpen&&<div className="legal-modal-backdrop" onMouseDown={()=>setMatterOpen(false)}><div className="legal-modal" onMouseDown={e=>e.stopPropagation()}><div className="legal-modal-head"><div><Gavel size={17}/><b>Nuevo asunto</b></div><button onClick={()=>setMatterOpen(false)}><X size={17}/></button></div><label><span>Título</span><input value={draft.title} onChange={e=>setDraft({...draft,title:e.target.value})}/></label><div className="legal-modal-grid"><label><span>Tipo</span><select value={draft.type} onChange={e=>setDraft({...draft,type:e.target.value})}><option>Corporativo</option><option>Civil / Mercantil</option><option>Laboral</option><option>Fiscal</option><option>PI / Tecnología</option><option>Compliance</option></select></label><label><span>Riesgo</span><select value={draft.risk} onChange={e=>setDraft({...draft,risk:e.target.value as Risk})}><option>Bajo</option><option>Medio</option><option>Alto</option><option>Crítico</option></select></label></div><label><span>Autoridad / foro</span><input value={draft.authority} onChange={e=>setDraft({...draft,authority:e.target.value})}/></label><label><span>Responsable</span><input value={draft.owner} onChange={e=>setDraft({...draft,owner:e.target.value})}/></label><div className="legal-modal-actions"><button className="legal-primary" onClick={createMatter}>Crear asunto</button><button onClick={()=>setMatterOpen(false)}>Cancelar</button></div></div></div>}
  </section>
}

function LegalKpi({icon,label,value,detail,tone}:{icon:React.ReactNode;label:string;value:string;detail:string;tone:string}){return <div className={`legal-kpi ${tone}`}><span>{icon}</span><div><small>{label}</small><b>{value}</b><em>{detail}</em></div></div>}
function Decision({n,title,text,tone}:{n:string;title:string;text:string;tone:string}){return <div className={`legal-decision ${tone}`}><span>{n}</span><div><b>{title}</b><p>{text}</p></div><Link2 size={16}/></div>}
function RiskBox({label,value,text}:{label:string;value:number;text:string}){return <div className={`risk-box risk-${label.toLowerCase()}`}><span>{label}</span><b>{value}</b><p>{text}</p></div>}
