import { useMemo, useState, type ReactNode } from 'react'
import {
  AlertTriangle, BadgeCheck, Bot, CheckCircle2, ClipboardCheck, FileCheck2,
  FileText, Fingerprint, Gauge, Layers3, Plus, Scale, Search, ShieldCheck,
  Sparkles, Target, TimerReset, UsersRound, Workflow,
} from 'lucide-react'
import type { Department } from './data'
import DepartmentAgentWorkspace from './DepartmentAgentWorkspace'
import './compliance-premium.css'

type Tab='command'|'frameworks'|'controls'|'obligations'|'evidence'|'audits'|'exceptions'|'thirdparty'|'documents'|'agent'
type Risk='Bajo'|'Medio'|'Alto'|'Crítico'
type Confidence='Alta'|'Media'|'Baja'
type ControlStatus='Efectivo'|'Parcial'|'Débil'|'No implementado'
type ObligationStatus='Pendiente'|'En curso'|'Cumplida'|'Vencida'
type AuditStatus='Planificada'|'En curso'|'Cerrada'
type ExceptionStatus='Solicitada'|'En revisión'|'Aprobada'|'Rechazada'|'Vencida'

type Framework={id:string;name:string;scope:string;owner:string;coverage:number;controls:number;gaps:number;status:'Activo'|'En adopción'|'Revisión';source:string}
type Control={id:string;name:string;domain:string;frameworks:string[];owner:string;coverage:number;status:ControlStatus;risk:Risk;lastTest:string;evidence:string;confidence:Confidence}
type Obligation={id:string;title:string;source:string;owner:string;due:string;risk:Risk;status:ObligationStatus;evidence:string;control:string}
type Evidence={id:string;name:string;controlId:string;source:string;updated:string;owner:string;confidence:Confidence;status:'Válida'|'Por renovar'|'Pendiente'}
type Finding={id:string;audit:string;title:string;risk:Risk;owner:string;due:string;status:'Abierto'|'Remediando'|'Cerrado';evidence:string}
type Audit={id:string;name:string;scope:string;owner:string;date:string;status:AuditStatus;readiness:number;findings:number}
type ExceptionRow={id:string;title:string;control:string;owner:string;risk:Risk;expires:string;status:ExceptionStatus;compensating:string;approver:string}
type ThirdParty={id:string;name:string;service:string;owner:string;risk:Risk;assessment:number;evidence:number;status:'Aprobado'|'Condicionado'|'Bloqueado';nextReview:string}

const frameworks:Framework[]=[
  {id:'FW-ISO27001',name:'ISO/IEC 27001',scope:'Seguridad de la información',owner:'NORM + SENTINEL',coverage:82,controls:14,gaps:3,status:'Activo',source:'Security governance demo'},
  {id:'FW-LFPDPPP',name:'LFPDPPP',scope:'Privacidad y datos personales',owner:'NORM + JUSTITIA',coverage:76,controls:10,gaps:4,status:'Activo',source:'Legal/privacy mapping demo'},
  {id:'FW-COSO',name:'COSO Internal Control',scope:'Control interno y finanzas',owner:'NORM + STERLING + LEDGER',coverage:79,controls:12,gaps:3,status:'En adopción',source:'Finance/control mapping demo'},
  {id:'FW-ISO31000',name:'ISO 31000',scope:'Gestión de riesgos',owner:'NORM + AURORA',coverage:71,controls:8,gaps:3,status:'En adopción',source:'Enterprise risk demo'},
  {id:'FW-ISO9001',name:'ISO 9001',scope:'Calidad y procesos',owner:'NORM + ORBIT',coverage:68,controls:9,gaps:4,status:'Revisión',source:'Quality/process mapping demo'},
]

const seedControls:Control[]=[
  {id:'CTL-001',name:'MFA para identidades privilegiadas',domain:'Access Control',frameworks:['FW-ISO27001'],owner:'SENTINEL',coverage:92,status:'Efectivo',risk:'Crítico',lastTest:'30 ago 2026',evidence:'EV-SEC-201',confidence:'Alta'},
  {id:'CTL-002',name:'Revisión periódica de privilegios',domain:'IAM',frameworks:['FW-ISO27001','FW-COSO'],owner:'SENTINEL + NORM',coverage:78,status:'Parcial',risk:'Crítico',lastTest:'29 ago 2026',evidence:'EV-IAM-044',confidence:'Alta'},
  {id:'CTL-003',name:'Clasificación y manejo de información',domain:'Data Governance',frameworks:['FW-ISO27001','FW-LFPDPPP'],owner:'ARCHIVE + NORM',coverage:67,status:'Débil',risk:'Alto',lastTest:'28 ago 2026',evidence:'EV-DATA-017',confidence:'Media'},
  {id:'CTL-004',name:'Conciliación y segregación financiera',domain:'Financial Control',frameworks:['FW-COSO'],owner:'LEDGER + STERLING',coverage:88,status:'Efectivo',risk:'Alto',lastTest:'31 ago 2026',evidence:'EV-FIN-078',confidence:'Alta'},
  {id:'CTL-005',name:'Gestión de proveedores críticos',domain:'Third Party',frameworks:['FW-ISO31000','FW-ISO27001'],owner:'SOURCE + NORM',coverage:74,status:'Parcial',risk:'Alto',lastTest:'27 ago 2026',evidence:'EV-SUP-030',confidence:'Media'},
  {id:'CTL-006',name:'Retención y ciclo de vida documental',domain:'Records',frameworks:['FW-LFPDPPP','FW-ISO9001'],owner:'ARCHIVE',coverage:61,status:'Débil',risk:'Medio',lastTest:'26 ago 2026',evidence:'EV-DOC-011',confidence:'Media'},
  {id:'CTL-007',name:'Gestión de incidentes y evidencia',domain:'Incident Response',frameworks:['FW-ISO27001','FW-ISO31000'],owner:'SENTINEL + ARCHIVE',coverage:86,status:'Efectivo',risk:'Crítico',lastTest:'31 ago 2026',evidence:'EV-IR-126',confidence:'Alta'},
]

const seedObligations:Obligation[]=[
  {id:'OBL-C01',title:'Revisión de accesos privilegiados Q3',source:'Política IAM + ISO/IEC 27001',owner:'SENTINEL + NORM',due:'05 sep 2026',risk:'Crítico',status:'En curso',evidence:'EV-IAM-044',control:'CTL-002'},
  {id:'OBL-C02',title:'Actualizar inventario de tratamientos de datos',source:'Programa privacidad / LFPDPPP',owner:'JUSTITIA + NORM',due:'09 sep 2026',risk:'Alto',status:'Pendiente',evidence:'Pendiente',control:'CTL-003'},
  {id:'OBL-C03',title:'Cerrar evidencia de conciliación mensual',source:'COSO + política financiera',owner:'LEDGER',due:'03 sep 2026',risk:'Alto',status:'En curso',evidence:'EV-FIN-078',control:'CTL-004'},
  {id:'OBL-C04',title:'Reevaluación proveedor CloudNet',source:'Third-party risk policy',owner:'SOURCE + NORM',due:'08 sep 2026',risk:'Crítico',status:'Pendiente',evidence:'EV-SUP-030',control:'CTL-005'},
  {id:'OBL-C05',title:'Actualizar matriz de retención documental',source:'Records policy',owner:'ARCHIVE + NORM',due:'15 sep 2026',risk:'Medio',status:'Pendiente',evidence:'EV-DOC-011',control:'CTL-006'},
  {id:'OBL-C06',title:'Ejercicio de respuesta a incidente',source:'IR policy + ISO/IEC 27001',owner:'SENTINEL + ACADEMY',due:'19 sep 2026',risk:'Alto',status:'Pendiente',evidence:'SIM-01',control:'CTL-007'},
]

const seedEvidence:Evidence[]=[
  {id:'EV-SEC-201',name:'Reporte MFA privilegiado',controlId:'CTL-001',source:'SENTINEL demo',updated:'30 ago 2026',owner:'SENTINEL',confidence:'Alta',status:'Válida'},
  {id:'EV-IAM-044',name:'Matriz de privilegios Q3',controlId:'CTL-002',source:'SENTINEL + TALENT demo',updated:'29 ago 2026',owner:'SENTINEL',confidence:'Alta',status:'Por renovar'},
  {id:'EV-DATA-017',name:'Matriz clasificación de información',controlId:'CTL-003',source:'ARCHIVE demo',updated:'28 ago 2026',owner:'ARCHIVE',confidence:'Media',status:'Pendiente'},
  {id:'EV-FIN-078',name:'Conciliación y segregación agosto',controlId:'CTL-004',source:'LEDGER demo',updated:'31 ago 2026',owner:'LEDGER',confidence:'Alta',status:'Válida'},
  {id:'EV-SUP-030',name:'Due diligence CloudNet',controlId:'CTL-005',source:'SOURCE demo',updated:'27 ago 2026',owner:'SOURCE',confidence:'Media',status:'Por renovar'},
  {id:'EV-DOC-011',name:'Matriz de retención v2',controlId:'CTL-006',source:'ARCHIVE demo',updated:'26 ago 2026',owner:'ARCHIVE',confidence:'Media',status:'Pendiente'},
  {id:'EV-IR-126',name:'Incident response evidence pack',controlId:'CTL-007',source:'SENTINEL + ARCHIVE demo',updated:'31 ago 2026',owner:'SENTINEL',confidence:'Alta',status:'Válida'},
]

const seedAudits:Audit[]=[
  {id:'AUD-2609-01',name:'Internal Control Review · Q3',scope:'Finance + IAM + Evidence',owner:'NORM',date:'06 sep 2026',status:'En curso',readiness:78,findings:3},
  {id:'AUD-2609-02',name:'Privacy Readiness Review',scope:'LFPDPPP / datos personales',owner:'NORM + JUSTITIA',date:'12 sep 2026',status:'Planificada',readiness:71,findings:2},
  {id:'AUD-2609-03',name:'Supplier Compliance Review',scope:'Critical third parties',owner:'NORM + SOURCE',date:'18 sep 2026',status:'Planificada',readiness:69,findings:2},
]
const seedFindings:Finding[]=[
  {id:'FND-101',audit:'AUD-2609-01',title:'Evidencia de clasificación de información incompleta',risk:'Alto',owner:'ARCHIVE + NORM',due:'07 sep',status:'Remediando',evidence:'EV-DATA-017'},
  {id:'FND-102',audit:'AUD-2609-01',title:'Revisión de privilegios requiere cierre formal',risk:'Crítico',owner:'SENTINEL',due:'05 sep',status:'Abierto',evidence:'EV-IAM-044'},
  {id:'FND-103',audit:'AUD-2609-01',title:'Registro de excepción sin compensating control probado',risk:'Alto',owner:'NORM',due:'09 sep',status:'Abierto',evidence:'EXC-014'},
]

const seedExceptions:ExceptionRow[]=[
  {id:'EXC-014',title:'Acceso temporal de soporte a producción',control:'CTL-002',owner:'NEXUS',risk:'Alto',expires:'06 sep 2026',status:'En revisión',compensating:'Session logging + ventana 4h',approver:'SENTINEL + NORM'},
  {id:'EXC-015',title:'Retención extendida de evidencia contractual',control:'CTL-006',owner:'JUSTITIA',risk:'Medio',expires:'30 sep 2026',status:'Aprobada',compensating:'Acceso restringido + legal hold',approver:'JUSTITIA + NORM'},
  {id:'EXC-016',title:'Proveedor condicionado por documentación pendiente',control:'CTL-005',owner:'SOURCE',risk:'Alto',expires:'10 sep 2026',status:'Solicitada',compensating:'Sin datos sensibles + aprobación por evento',approver:'SOURCE + NORM'},
]

const seedThirdParties:ThirdParty[]=[
  {id:'TP-01',name:'CloudNet Services',service:'Cloud / observabilidad',owner:'SOURCE + NEXUS',risk:'Alto',assessment:74,evidence:82,status:'Condicionado',nextReview:'08 sep 2026'},
  {id:'TP-02',name:'TechSupply MX',service:'Hardware',owner:'SOURCE',risk:'Bajo',assessment:92,evidence:100,status:'Aprobado',nextReview:'15 dic 2026'},
  {id:'TP-03',name:'Seguros Atlas',service:'Seguros corporativos',owner:'STERLING + JUSTITIA',risk:'Medio',assessment:86,evidence:84,status:'Condicionado',nextReview:'30 sep 2026'},
  {id:'TP-04',name:'DataSecure Labs',service:'Cybersecurity MDR',owner:'SENTINEL + SOURCE',risk:'Crítico',assessment:61,evidence:63,status:'Bloqueado',nextReview:'05 sep 2026'},
]

const documents=[
  'GRC Executive Brief','Compliance Obligations Register','Control Matrix','Framework Crosswalk','Evidence Readiness Pack',
  'Control Test Workpaper','Audit Plan','Audit Findings Report','Remediation Plan','Risk Acceptance Memo','Exception Register',
  'Policy Review','Third-Party Compliance Review','Board Compliance Pack','Management Attestation','Continuous Compliance Review',
]
const knowledge=[
  'Políticas y controles corporativos autorizados','Frameworks y obligaciones aplicables al tenant','Evidencia ARCHIVE / SENTINEL / LEDGER',
  'Riesgos JUSTITIA / SENTINEL / SOURCE','Matriz de autorizaciones y segregación de funciones','Calendario de auditorías y revisiones',
  'Excepciones y risk acceptance aprobados','Histórico de pruebas, hallazgos y remediaciones',
]
const suggestions=[
  '¿Qué gaps de compliance requieren decisión hoy?','Mapea obligaciones a controles y evidencia disponible',
  '¿Qué controles parecen efectivos pero tienen evidencia débil?','Prioriza auditorías, excepciones y terceros por riesgo residual',
]

function riskTone(risk:Risk){return risk==='Crítico'?'risk':risk==='Alto'?'warn':risk==='Medio'?'mid':'good'}

export default function ComplianceModule({department}:{department:Department}){
  const [tab,setTab]=useState<Tab>('command')
  const [controls,setControls]=useState(seedControls)
  const [obligations,setObligations]=useState(seedObligations)
  const [evidence,setEvidence]=useState(seedEvidence)
  const [findings,setFindings]=useState(seedFindings)
  const [exceptions,setExceptions]=useState(seedExceptions)
  const [query,setQuery]=useState('')
  const [open,setOpen]=useState(false)
  const [draft,setDraft]=useState({title:'',control:'CTL-002',owner:'NEXUS',risk:'Medio' as Risk,expires:'15 sep 2026'})

  const avgCoverage=Math.round(controls.reduce((s,c)=>s+c.coverage,0)/controls.length)
  const effective=controls.filter(c=>c.status==='Efectivo').length
  const highGaps=controls.filter(c=>(c.status==='Débil'||c.status==='No implementado')&&(c.risk==='Alto'||c.risk==='Crítico')).length
  const openObligations=obligations.filter(o=>o.status!=='Cumplida').length
  const highObligations=obligations.filter(o=>o.status!=='Cumplida'&&(o.risk==='Alto'||o.risk==='Crítico')).length
  const evidenceReadiness=Math.round(evidence.reduce((s,e)=>s+(e.status==='Válida'?100:e.status==='Por renovar'?75:45),0)/evidence.length)
  const openFindings=findings.filter(f=>f.status!=='Cerrado').length
  const openExceptions=exceptions.filter(e=>!['Rechazada','Vencida'].includes(e.status)).length
  const posture=Math.max(0,Math.min(100,Math.round(avgCoverage*.45+evidenceReadiness*.35+effective/controls.length*20-highGaps*3-highObligations*1.5)))

  const filteredControls=useMemo(()=>{
    const q=query.trim().toLowerCase();if(!q)return controls
    return controls.filter(c=>[c.id,c.name,c.domain,c.owner,c.status,c.risk,c.evidence,...c.frameworks].some(v=>v.toLowerCase().includes(q)))
  },[controls,query])

  const nextActions=useMemo(()=>[
    {title:'Cerrar revisión de privilegios Q3',reason:'Control crítico parcial + obligación próxima + finding abierto con evidencia por renovar.',tone:'risk'},
    {title:'Elevar clasificación de información',reason:'Coverage 67%, evidencia pendiente y dependencia directa con privacidad y seguridad.',tone:'warn'},
    {title:'Resolver excepción EXC-014',reason:'Acceso temporal de producción necesita aprobación y prueba del compensating control antes del vencimiento.',tone:'risk'},
    {title:'Reevaluar DataSecure Labs',reason:'Tercero crítico bloqueado con assessment y evidence score bajos; no aprobar sin remediación verificable.',tone:'warn'},
  ] as const,[])

  const testControl=(id:string)=>setControls(v=>v.map(c=>{
    if(c.id!==id)return c
    const status:ControlStatus=c.status==='No implementado'?'Débil':c.status==='Débil'?'Parcial':'Efectivo'
    return {...c,status,coverage:Math.min(100,c.coverage+8),lastTest:'01 sep 2026'}
  }))
  const completeObligation=(id:string)=>setObligations(v=>v.map(o=>o.id===id?{...o,status:'Cumplida'}:o))
  const validateEvidence=(id:string)=>setEvidence(v=>v.map(e=>e.id===id?{...e,status:'Válida',confidence:e.confidence==='Baja'?'Media':e.confidence}:e))
  const closeFinding=(id:string)=>setFindings(v=>v.map(f=>f.id===id?{...f,status:f.status==='Abierto'?'Remediando':'Cerrado'}:f))
  const advanceException=(id:string)=>setExceptions(v=>v.map(e=>{
    if(e.id!==id)return e
    const next:ExceptionStatus=e.status==='Solicitada'?'En revisión':e.status==='En revisión'?'Aprobada':e.status
    return {...e,status:next}
  }))
  const createException=()=>{
    if(!draft.title.trim())return
    const id=`EXC-${String(exceptions.length+17).padStart(3,'0')}`
    const row:ExceptionRow={id,title:draft.title.trim(),control:draft.control,owner:draft.owner,risk:draft.risk,expires:draft.expires,status:'Solicitada',compensating:'Pendiente de definir y probar',approver:'NORM + owner del control'}
    setExceptions(v=>[row,...v]);setOpen(false);setDraft({title:'',control:'CTL-002',owner:'NEXUS',risk:'Medio',expires:'15 sep 2026'});setTab('exceptions')
  }

  const openWorkspace=(title:string)=>{
    localStorage.setItem('wae-workspace-draft',JSON.stringify({title,body:`# ${title}\n\n**Departamento:** Compliance\n**Agente:** NORM\n\n## GRC posture\n- Compliance posture demo: ${posture}/100\n- Control coverage: ${avgCoverage}%\n- Evidence readiness: ${evidenceReadiness}%\n- Obligaciones abiertas: ${openObligations}\n- Findings abiertos: ${openFindings}\n- Excepciones activas: ${openExceptions}\n\n## Obligación / requisito\n\n## Control mapeado\n\n## Evidencia y fuente\n\n## Resultado de prueba\n\n## Gap / finding\n\n## Riesgo inherente y residual\n\n## Excepción / compensating control\n\n## Owner / aprobación\n\n## Plan de remediación\n\n## Evidencia de cierre\n\n> Documento GRC demo. No declarar cumplimiento legal, regulatorio o certificación sin validar alcance, aplicabilidad, evidencia, prueba independiente y aprobación competente.\n`}))
    const workspace=[...document.querySelectorAll('button')].find(b=>b.textContent?.trim()==='Workspace')
    if(workspace instanceof HTMLButtonElement)workspace.click()
  }

  return <section className="compliance-premium">
    <header className="compliance-head">
      <div className="compliance-brand"><span><Fingerprint size={25}/></span><div><small>NORM · DIRECTOR DE CUMPLIMIENTO AI</small><h1>Governance, Risk & Compliance Command Center</h1><p>Obligaciones, controles, evidencia, auditorías y excepciones con trazabilidad y riesgo residual.</p></div></div>
      <div className="compliance-head-status"><i/>Datos demo · Evidence-driven GRC</div>
    </header>

    <nav className="compliance-tabs">{[
      ['command','Command Center'],['frameworks','Frameworks'],['controls','Controles'],['obligations','Obligaciones'],['evidence','Evidencia'],['audits','Auditorías'],['exceptions','Excepciones'],['thirdparty','Terceros'],['documents','Documentos'],['agent','NORM AI'],
    ].map(([id,label])=><button key={id} className={tab===id?'active':''} onClick={()=>setTab(id as Tab)}>{label}</button>)}</nav>

    {tab!=='agent'&&<div className="compliance-kpis">
      <Kpi icon={<Gauge size={18}/>} label="GRC posture" value={`${posture}/100`} detail={`${highGaps} gaps críticos/altos`} tone="amber"/>
      <Kpi icon={<ShieldCheck size={18}/>} label="Control coverage" value={`${avgCoverage}%`} detail={`${effective}/${controls.length} efectivos`} tone="emerald"/>
      <Kpi icon={<FileCheck2 size={18}/>} label="Evidence readiness" value={`${evidenceReadiness}%`} detail={`${evidence.filter(e=>e.status!=='Válida').length} por renovar/pendientes`} tone="cyan"/>
      <Kpi icon={<AlertTriangle size={18}/>} label="Obligaciones" value={String(openObligations)} detail={`${highObligations} alto/crítico`} tone="rose"/>
    </div>}

    {tab==='command'&&<>
      <div className="compliance-grid-2">
        <article className="compliance-panel hero"><div className="panel-title"><div><small>GRC CONTROL TOWER</small><h2>Enterprise compliance posture</h2></div><Scale size={20}/></div>
          <div className="compliance-ring"><strong>{posture}</strong><span>/100</span></div>
          <p>NORM mide obligaciones, controles probados, evidencia vigente, findings y excepciones para estimar readiness; no sustituye una auditoría o certificación independiente.</p>
          <div className="mini-stats"><span><b>{openFindings}</b> findings</span><span><b>{openExceptions}</b> excepciones</span><span><b>{frameworks.length}</b> frameworks</span></div>
        </article>
        <article className="compliance-panel"><div className="panel-title"><div><small>DECISION QUEUE</small><h2>Next Best Compliance Actions</h2></div><Sparkles size={20}/></div>
          <div className="compliance-actions">{nextActions.map(a=><div key={a.title} className={`compliance-action ${a.tone}`}><span>{a.tone==='risk'?<AlertTriangle size={17}/>:<Target size={17}/>}</span><div><b>{a.title}</b><p>{a.reason}</p></div></div>)}</div>
        </article>
      </div>
      <div className="compliance-grid-2">
        <article className="compliance-panel"><div className="panel-title"><div><small>CONTROL GAPS</small><h2>Risk-weighted controls</h2></div><ShieldCheck size={20}/></div>{controls.filter(c=>c.status!=='Efectivo').sort((a,b)=>b.risk.localeCompare(a.risk)).slice(0,4).map(c=><div className="control-row" key={c.id}><div><b>{c.name}</b><small>{c.owner} · Evidence {c.evidence}</small></div><span className={`risk-chip ${riskTone(c.risk)}`}>{c.status}</span></div>)}</article>
        <article className="compliance-panel"><div className="panel-title"><div><small>OBLIGATION RADAR</small><h2>Upcoming governance gates</h2></div><TimerReset size={20}/></div>{obligations.filter(o=>o.status!=='Cumplida').slice(0,4).map(o=><div className="obligation-row" key={o.id}><div><b>{o.title}</b><small>{o.due} · {o.owner}</small></div><span className={`risk-chip ${riskTone(o.risk)}`}>{o.risk}</span></div>)}</article>
      </div>
    </>}

    {tab==='frameworks'&&<article className="compliance-panel"><div className="panel-title"><div><small>FRAMEWORK CROSSWALK</small><h2>Obligations mapped to operating controls</h2></div><Layers3 size={20}/></div>
      <div className="framework-grid">{frameworks.map(f=><div className="framework-card" key={f.id}><div className="framework-top"><span>{f.id}</span><b>{f.coverage}%</b></div><h3>{f.name}</h3><p>{f.scope}</p><div className="progress"><i style={{width:`${f.coverage}%`}}/></div><small>{f.controls} controles · {f.gaps} gaps · {f.owner}</small><em>{f.status} · {f.source}</em></div>)}</div>
    </article>}

    {tab==='controls'&&<article className="compliance-panel"><div className="panel-title"><div><small>CONTROL LIBRARY</small><h2>Controls, tests and evidence</h2></div><ClipboardCheck size={20}/></div>
      <div className="compliance-toolbar"><label><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar control, framework, owner..."/></label></div>
      <div className="compliance-table"><div className="tr head"><span>Control</span><span>Coverage</span><span>Status</span><span>Risk</span><span>Test</span></div>{filteredControls.map(c=><div className="tr" key={c.id}><span><b>{c.name}</b><small>{c.id} · {c.domain} · {c.owner}</small></span><span><b>{c.coverage}%</b><small>{c.frameworks.join(' · ')}</small></span><span>{c.status}</span><span><i className={`risk-chip ${riskTone(c.risk)}`}>{c.risk}</i></span><span><button onClick={()=>testControl(c.id)}>Probar control</button><small>{c.lastTest} · {c.evidence}</small></span></div>)}</div>
    </article>}

    {tab==='obligations'&&<article className="compliance-panel"><div className="panel-title"><div><small>OBLIGATION INTELLIGENCE</small><h2>Requirements, owners and due dates</h2></div><Scale size={20}/></div>
      <div className="card-list">{obligations.map(o=><div className="compliance-card" key={o.id}><div><span>{o.id}</span><h3>{o.title}</h3><p>{o.source}</p><small>{o.owner} · vence {o.due} · control {o.control} · evidence {o.evidence}</small></div><div><i className={`risk-chip ${riskTone(o.risk)}`}>{o.risk}</i><strong>{o.status}</strong>{o.status!=='Cumplida'&&<button onClick={()=>completeObligation(o.id)}>Marcar cumplida</button>}</div></div>)}</div>
    </article>}

    {tab==='evidence'&&<article className="compliance-panel"><div className="panel-title"><div><small>EVIDENCE READINESS</small><h2>Evidence packs with freshness and confidence</h2></div><FileCheck2 size={20}/></div>
      <div className="evidence-grid">{evidence.map(e=><div className="evidence-card" key={e.id}><div className="evidence-icon"><FileCheck2 size={19}/></div><div><b>{e.name}</b><p>{e.id} · {e.controlId}</p><small>{e.source} · {e.updated} · {e.owner}</small></div><div><span>{e.confidence}</span><strong>{e.status}</strong>{e.status!=='Válida'&&<button onClick={()=>validateEvidence(e.id)}>Validar demo</button>}</div></div>)}</div>
    </article>}

    {tab==='audits'&&<><article className="compliance-panel"><div className="panel-title"><div><small>AUDIT READINESS</small><h2>Audit portfolio</h2></div><BadgeCheck size={20}/></div><div className="audit-grid">{seedAudits.map(a=><div className="audit-card" key={a.id}><span>{a.id}</span><h3>{a.name}</h3><p>{a.scope}</p><div className="progress"><i style={{width:`${a.readiness}%`}}/></div><small>{a.readiness}% readiness · {a.findings} findings · {a.owner}</small><strong>{a.status} · {a.date}</strong></div>)}</div></article>
      <article className="compliance-panel"><div className="panel-title"><div><small>FINDINGS</small><h2>Remediation queue</h2></div><AlertTriangle size={20}/></div><div className="card-list">{findings.map(f=><div className="compliance-card" key={f.id}><div><span>{f.id}</span><h3>{f.title}</h3><small>{f.audit} · {f.owner} · vence {f.due} · {f.evidence}</small></div><div><i className={`risk-chip ${riskTone(f.risk)}`}>{f.risk}</i><strong>{f.status}</strong>{f.status!=='Cerrado'&&<button onClick={()=>closeFinding(f.id)}>{f.status==='Abierto'?'Iniciar remediación':'Cerrar demo'}</button>}</div></div>)}</div></article></>}

    {tab==='exceptions'&&<article className="compliance-panel"><div className="panel-title"><div><small>RISK ACCEPTANCE</small><h2>Exceptions with compensating controls</h2></div><Workflow size={20}/></div>
      <div className="compliance-toolbar"><button className="primary" onClick={()=>setOpen(true)}><Plus size={16}/>Nueva excepción</button></div>
      <div className="card-list">{exceptions.map(e=><div className="compliance-card" key={e.id}><div><span>{e.id}</span><h3>{e.title}</h3><p>{e.compensating}</p><small>{e.owner} · {e.control} · vence {e.expires} · aprueba {e.approver}</small></div><div><i className={`risk-chip ${riskTone(e.risk)}`}>{e.risk}</i><strong>{e.status}</strong>{(e.status==='Solicitada'||e.status==='En revisión')&&<button onClick={()=>advanceException(e.id)}>{e.status==='Solicitada'?'Revisar':'Aprobar demo'}</button>}</div></div>)}</div>
    </article>}

    {tab==='thirdparty'&&<article className="compliance-panel"><div className="panel-title"><div><small>THIRD-PARTY COMPLIANCE</small><h2>Supplier compliance posture</h2></div><UsersRound size={20}/></div>
      <div className="third-grid">{seedThirdParties.map(t=><div className="third-card" key={t.id}><div className="third-top"><span>{t.id}</span><i className={`risk-chip ${riskTone(t.risk)}`}>{t.risk}</i></div><h3>{t.name}</h3><p>{t.service}</p><div className="score-pair"><span><b>{t.assessment}</b><small>Assessment</small></span><span><b>{t.evidence}</b><small>Evidence</small></span></div><small>{t.owner} · próxima revisión {t.nextReview}</small><strong>{t.status}</strong></div>)}</div>
    </article>}

    {tab==='documents'&&<article className="compliance-panel"><div className="panel-title"><div><small>GRC DOCUMENT STUDIO</small><h2>Governance workpapers to Workspace</h2></div><FileText size={20}/></div><div className="document-grid">{documents.map(d=><button key={d} onClick={()=>openWorkspace(d)}><FileText size={18}/><span>{d}</span><small>Abrir borrador gobernado</small></button>)}</div></article>}

    {tab==='agent'&&<DepartmentAgentWorkspace department={department} documents={documents} knowledge={knowledge} suggestions={suggestions} onOpenWorkspace={openWorkspace}/>} 

    {open&&<div className="compliance-modal"><div className="compliance-modal-card"><h2>Nueva excepción / risk acceptance</h2><p>La excepción nace como <b>Solicitada</b>. No se aprueba sin owner, vencimiento, riesgo, compensating control y autoridad competente.</p><label>Título<input value={draft.title} onChange={e=>setDraft({...draft,title:e.target.value})}/></label><label>Control<select value={draft.control} onChange={e=>setDraft({...draft,control:e.target.value})}>{controls.map(c=><option key={c.id} value={c.id}>{c.id} · {c.name}</option>)}</select></label><label>Owner<input value={draft.owner} onChange={e=>setDraft({...draft,owner:e.target.value})}/></label><label>Riesgo<select value={draft.risk} onChange={e=>setDraft({...draft,risk:e.target.value as Risk})}>{['Bajo','Medio','Alto','Crítico'].map(r=><option key={r}>{r}</option>)}</select></label><label>Vence<input value={draft.expires} onChange={e=>setDraft({...draft,expires:e.target.value})}/></label><div><button onClick={()=>setOpen(false)}>Cancelar</button><button className="primary" onClick={createException}>Crear solicitud</button></div></div></div>}
  </section>
}

function Kpi({icon,label,value,detail,tone}:{icon:ReactNode;label:string;value:string;detail:string;tone:string}){return <div className={`compliance-kpi ${tone}`}><span>{icon}</span><div><small>{label}</small><strong>{value}</strong><p>{detail}</p></div></div>}
