import { useMemo, useState, type ReactNode } from 'react'
import {
  Activity, AlertTriangle, Bot, Boxes, Braces, CheckCircle2, CircuitBoard,
  CloudCog, Cpu, Database, FileText, Gauge, GitBranch, Layers3, Network,
  PackageCheck, Rocket, Search, ServerCog, ShieldCheck, Sparkles, TimerReset,
  TriangleAlert, Workflow, Zap,
} from 'lucide-react'
import type { Department } from './data'
import DepartmentAgentWorkspace from './DepartmentAgentWorkspace'
import './technology-premium.css'

type Tab='command'|'services'|'apis'|'releases'|'observability'|'dependencies'|'debt'|'ai'|'documents'|'agent'
type Health='Healthy'|'Degraded'|'Critical'|'Maintenance'
type Criticality='Baja'|'Media'|'Alta'|'Crítica'
type ReleaseStatus='Draft'|'Ready'|'Deploying'|'Live'|'Rolled back'
type IncidentStatus='Open'|'Investigating'|'Mitigating'|'Monitoring'|'Closed'
type Confidence='Alta'|'Media'|'Baja'
type ProviderState='Configured'|'Available'|'Degraded'|'Offline'

type Service={id:string;name:string;domain:string;owner:string;criticality:Criticality;health:Health;availability:number;latency:number;errorRate:number;slo:number;version:string;region:string;source:string}
type Api={id:string;name:string;service:string;method:string;path:string;p95:number;errorRate:number;rpm:number;auth:string;status:Health;source:string}
type Release={id:string;name:string;service:string;version:string;owner:string;status:ReleaseStatus;risk:Criticality;created:string;changeFailureRisk:number;evidence:string}
type Incident={id:string;title:string;service:string;severity:Criticality;owner:string;opened:string;status:IncidentStatus;impact:string;evidence:string;confidence:Confidence}
type Dependency={from:string;to:string;relation:string;criticality:Criticality;blastRadius:string;confidence:Confidence}
type Debt={id:string;title:string;area:string;owner:string;impact:number;effort:number;risk:Criticality;age:number;status:'Backlog'|'Planned'|'In progress'|'Resolved';reason:string}
type AiRoute={id:string;capability:string;primary:string;fallback:string;state:ProviderState;latency:number;quality:number;costIndex:number;policy:string}

const services:Service[]=[
  {id:'SVC-001',name:'WAE Web App',domain:'Experience',owner:'NEXUS',criticality:'Alta',health:'Healthy',availability:99.97,latency:182,errorRate:.18,slo:99.9,version:'2026.09.01-4',region:'Render',source:'Deployment telemetry demo'},
  {id:'SVC-002',name:'Enterprise API Gateway',domain:'Platform',owner:'NEXUS + SENTINEL',criticality:'Crítica',health:'Degraded',availability:99.82,latency:426,errorRate:1.9,slo:99.95,version:'v4.8.2',region:'us-east',source:'Gateway metrics demo'},
  {id:'SVC-003',name:'Supabase Enterprise22',domain:'Data',owner:'NEXUS + LEDGER',criticality:'Crítica',health:'Healthy',availability:99.99,latency:92,errorRate:.09,slo:99.95,version:'managed',region:'us-east-1',source:'Database health demo'},
  {id:'SVC-004',name:'Document Intelligence',domain:'AI / Knowledge',owner:'NEXUS + ARCHIVE',criticality:'Alta',health:'Maintenance',availability:99.41,latency:618,errorRate:2.4,slo:99.5,version:'v0.9-demo',region:'logical',source:'ARCHIVE frontend demo'},
  {id:'SVC-005',name:'Revenue Intelligence',domain:'Business AI',owner:'NEXUS + CLOSER',criticality:'Alta',health:'Healthy',availability:99.91,latency:244,errorRate:.42,slo:99.7,version:'v1.6',region:'logical',source:'CLOSER module demo'},
  {id:'SVC-006',name:'Security Control Plane',domain:'Security',owner:'NEXUS + SENTINEL',criticality:'Crítica',health:'Healthy',availability:99.96,latency:133,errorRate:.21,slo:99.9,version:'v2.1',region:'logical',source:'SENTINEL module demo'},
]

const apis:Api[]=[
  {id:'API-01',name:'Health readiness',service:'Enterprise API Gateway',method:'GET',path:'/api/system/health/readiness',p95:118,errorRate:.05,rpm:22,auth:'Internal',status:'Healthy',source:'API inventory demo'},
  {id:'API-02',name:'Auth token',service:'Enterprise API Gateway',method:'POST',path:'/api/auth/token',p95:174,errorRate:.12,rpm:38,auth:'JWT',status:'Healthy',source:'API inventory demo'},
  {id:'API-03',name:'AI orchestration',service:'Enterprise API Gateway',method:'POST',path:'/api/ai/orchestrate',p95:1260,errorRate:2.8,rpm:9,auth:'JWT + RBAC',status:'Degraded',source:'Architecture target demo'},
  {id:'API-04',name:'Document query',service:'Document Intelligence',method:'POST',path:'/api/documents/query',p95:890,errorRate:2.1,rpm:6,auth:'Tenant + RBAC',status:'Maintenance',source:'Architecture target demo'},
  {id:'API-05',name:'Telemetry',service:'Enterprise API Gateway',method:'GET',path:'/api/system/telemetry',p95:132,errorRate:.08,rpm:16,auth:'Internal',status:'Healthy',source:'API inventory demo'},
]

const seedReleases:Release[]=[
  {id:'REL-260901-22',name:'NEXUS premium module',service:'WAE Web App',version:'2026.09.01-5',owner:'NEXUS',status:'Ready',risk:'Media',created:'01 sep · 09:34',changeFailureRisk:11,evidence:'CI pending/current change'},
  {id:'REL-260901-21',name:'ORBIT premium portal',service:'WAE Web App',version:'2026.09.01-4',owner:'NEXUS + ORBIT',status:'Live',risk:'Baja',created:'01 sep · 09:31',changeFailureRisk:6,evidence:'GitHub CI + Render deploy'},
  {id:'REL-260901-18',name:'Gateway timeout policy',service:'Enterprise API Gateway',version:'v4.8.2',owner:'NEXUS + SENTINEL',status:'Draft',risk:'Alta',created:'01 sep · 08:50',changeFailureRisk:28,evidence:'Design review demo'},
  {id:'REL-260831-09',name:'ARCHIVE evidence labels',service:'Document Intelligence',version:'v0.9-demo',owner:'ARCHIVE + NEXUS',status:'Live',risk:'Media',created:'31 ago · 18:20',changeFailureRisk:12,evidence:'Frontend release demo'},
]

const seedIncidents:Incident[]=[
  {id:'TECH-INC-071',title:'API Gateway p95 por encima de objetivo',service:'Enterprise API Gateway',severity:'Alto' as Criticality,owner:'NEXUS',opened:'01 sep · 08:42',status:'Mitigating',impact:'Aumenta latencia percibida y puede degradar CARE/CEO Chat.',evidence:'OBS-GW-071',confidence:'Alta'},
  {id:'TECH-INC-072',title:'Document Intelligence en mantenimiento',service:'Document Intelligence',severity:'Media',owner:'NEXUS + ARCHIVE',opened:'01 sep · 08:05',status:'Monitoring',impact:'Capacidades documentales avanzadas permanecen limitadas a demo/frontend.',evidence:'ARCHIVE state',confidence:'Alta'},
  {id:'TECH-INC-073',title:'AI orchestration sin provider runtime validado',service:'Enterprise API Gateway',severity:'Alta',owner:'NEXUS',opened:'01 sep · 07:40',status:'Investigating',impact:'Las respuestas especializadas no deben presentarse como LLM/RAG real hasta validar runtime.',evidence:'Architecture review',confidence:'Alta'},
]

const dependencies:Dependency[]=[
  {from:'WAE Web App',to:'Enterprise API Gateway',relation:'consume',criticality:'Crítica',blastRadius:'CEO Chat + módulos interactivos',confidence:'Alta'},
  {from:'Enterprise API Gateway',to:'Supabase Enterprise22',relation:'persiste / consulta',criticality:'Crítica',blastRadius:'tenant state y servicios backend',confidence:'Alta'},
  {from:'Document Intelligence',to:'Enterprise API Gateway',relation:'requiere routing',criticality:'Alta',blastRadius:'ARCHIVE / knowledge workflows',confidence:'Media'},
  {from:'Revenue Intelligence',to:'Enterprise API Gateway',relation:'requiere orchestration',criticality:'Alta',blastRadius:'CLOSER / PULSE intelligence',confidence:'Media'},
  {from:'Security Control Plane',to:'Supabase Enterprise22',relation:'evidence state',criticality:'Alta',blastRadius:'SENTINEL / NORM',confidence:'Media'},
  {from:'Enterprise API Gateway',to:'External AI Provider',relation:'target / not validated',criticality:'Alta',blastRadius:'AI generation and agent routing',confidence:'Baja'},
]

const seedDebt:Debt[]=[
  {id:'TD-001',title:'Reemplazar portal MutationObserver por routing tipado',area:'Frontend architecture',owner:'NEXUS',impact:94,effort:62,risk:'Alta',age:18,status:'Planned',reason:'Reduce acoplamiento DOM y riesgo al escalar módulos premium.'},
  {id:'TD-002',title:'Event/Command Bus entre módulos',area:'Platform',owner:'NEXUS',impact:96,effort:78,risk:'Crítica',age:14,status:'Backlog',reason:'Evita integraciones conceptuales sin persistencia/eventos reales.'},
  {id:'TD-003',title:'Persistencia tenant-aware para módulos premium',area:'Data platform',owner:'NEXUS + SENTINEL',impact:98,effort:86,risk:'Crítica',age:12,status:'Backlog',reason:'Convierte estados demo en workflows auditables sin usar tablas compartidas.'},
  {id:'TD-004',title:'AI Provider Runtime + circuit breaker real',area:'AI platform',owner:'NEXUS',impact:97,effort:81,risk:'Crítica',age:10,status:'Backlog',reason:'Necesario para pasar de respuestas deterministas a orquestación real.'},
  {id:'TD-005',title:'Observabilidad OpenTelemetry / traces',area:'Reliability',owner:'NEXUS + SENTINEL',impact:83,effort:58,risk:'Alta',age:9,status:'Planned',reason:'Permite correlacionar request → service → dependency → failure.'},
]

const seedAiRoutes:AiRoute[]=[
  {id:'AI-01',capability:'Executive reasoning',primary:'Provider runtime pendiente',fallback:'Deterministic agent response',state:'Configured',latency:0,quality:0,costIndex:0,policy:'No declarar LLM real sin provider validado'},
  {id:'AI-02',capability:'Document Q&A / RAG',primary:'RAG runtime pendiente',fallback:'ARCHIVE structured demo',state:'Offline',latency:0,quality:0,costIndex:0,policy:'Evidence-first; citar fuente/version cuando exista runtime'},
  {id:'AI-03',capability:'Vision',primary:'Vision provider pendiente',fallback:'No execution',state:'Offline',latency:0,quality:0,costIndex:0,policy:'Fail closed si no hay provider autorizado'},
  {id:'AI-04',capability:'Embeddings',primary:'Embedding provider pendiente',fallback:'No semantic persistence',state:'Offline',latency:0,quality:0,costIndex:0,policy:'No simular vector search persistente'},
]

const documents=[
  'Technology Executive Brief','Architecture Decision Record','Service Catalog','SLO Review','API Inventory','Release Readiness Review',
  'Deployment Plan','Rollback Plan','Incident Postmortem','Dependency Map','Blast Radius Analysis','Technical Debt Register',
  'Platform Resilience Review','AI Provider Evaluation','AI Routing Policy','Technology QBR','CTO Board Pack',
]
const knowledge=[
  'Arquitectura WAE OS y service boundaries','Repositorio GitHub y CI/CD autorizado','Render deployment topology','Supabase Enterprise22 isolation model',
  'SENTINEL security requirements','NORM control/evidence requirements','ORBIT SLA and operational dependencies','ARCHIVE knowledge/evidence constraints',
  'Histórico de releases, incidents y ADRs','AI provider policies y fail-closed rules',
]
const suggestions=[
  '¿Qué servicio amenaza más la experiencia del usuario hoy?','Prioriza deuda técnica por impacto, riesgo y esfuerzo',
  '¿Qué dependencia tiene mayor blast radius?','Diseña una ruta AI resiliente sin declarar providers no validados',
]

function toneByHealth(health:Health){return health==='Critical'?'risk':health==='Degraded'?'warn':health==='Maintenance'?'mid':'good'}
function toneByRisk(risk:Criticality){return risk==='Crítica'?'risk':risk==='Alta'?'warn':risk==='Media'?'mid':'good'}

export default function TechnologyModule({department}:{department:Department}){
  const [tab,setTab]=useState<Tab>('command')
  const [releases,setReleases]=useState(seedReleases)
  const [incidents,setIncidents]=useState(seedIncidents)
  const [debt,setDebt]=useState(seedDebt)
  const [query,setQuery]=useState('')
  const [selected,setSelected]=useState('SVC-002')

  const healthy=services.filter(s=>s.health==='Healthy').length
  const degraded=services.filter(s=>s.health==='Degraded'||s.health==='Critical').length
  const avgAvailability=services.reduce((s,x)=>s+x.availability,0)/services.length
  const activeIncidents=incidents.filter(i=>i.status!=='Closed').length
  const highDebt=debt.filter(d=>d.status!=='Resolved'&&(d.risk==='Alta'||d.risk==='Crítica')).length
  const apiDegraded=apis.filter(a=>a.status==='Degraded'||a.status==='Critical').length
  const platformHealth=Math.max(0,Math.min(100,Math.round(avgAvailability-degraded*4-activeIncidents*2-highDebt*1.2-apiDegraded*2)))

  const filteredServices=useMemo(()=>{
    const q=query.trim().toLowerCase();if(!q)return services
    return services.filter(s=>[s.id,s.name,s.domain,s.owner,s.criticality,s.health,s.region,s.source].some(v=>String(v).toLowerCase().includes(q)))
  },[query])
  const selectedService=services.find(s=>s.id===selected)??services[0]

  const debtPriority=useMemo(()=>debt.map(d=>({...d,priority:Math.round(d.impact*1.2+(d.risk==='Crítica'?25:d.risk==='Alta'?15:5)-d.effort*.35+d.age*.25)})).sort((a,b)=>b.priority-a.priority),[debt])

  const nextActions=useMemo(()=>[
    {title:'Estabilizar Enterprise API Gateway',reason:'Servicio crítico degradado, p95 alto y AI orchestration con error rate superior al baseline demo.',tone:'risk'},
    {title:'Construir Event/Command Bus tipado',reason:'Reduce acoplamiento entre módulos y habilita workflows reales con trazabilidad.',tone:'warn'},
    {title:'Implementar persistencia tenant-aware premium',reason:'Es el paso necesario para reemplazar estado local sin tocar tablas compartidas.',tone:'risk'},
    {title:'Validar runtime AI antes de activar routing',reason:'Los agentes actuales son deterministas; provider/model/RAG deben probarse antes de declararlos operativos.',tone:'warn'},
  ] as const,[])

  const advanceRelease=(id:string)=>setReleases(v=>v.map(r=>{
    if(r.id!==id)return r
    const order:ReleaseStatus[]=['Draft','Ready','Deploying','Live']
    if(r.status==='Rolled back'||r.status==='Live')return r
    return {...r,status:order[Math.min(order.length-1,order.indexOf(r.status)+1)]}
  }))
  const advanceIncident=(id:string)=>setIncidents(v=>v.map(i=>{
    if(i.id!==id)return i
    const order:IncidentStatus[]=['Open','Investigating','Mitigating','Monitoring','Closed']
    return {...i,status:order[Math.min(order.length-1,order.indexOf(i.status)+1)]}
  }))
  const advanceDebt=(id:string)=>setDebt(v=>v.map(d=>{
    if(d.id!==id||d.status==='Resolved')return d
    const order:Debt['status'][]=['Backlog','Planned','In progress','Resolved']
    return {...d,status:order[Math.min(order.length-1,order.indexOf(d.status)+1)]}
  }))

  const openWorkspace=(title:string)=>{
    localStorage.setItem('wae-workspace-draft',JSON.stringify({title,body:`# ${title}\n\n**Departamento:** Tecnología\n**Agente:** NEXUS\n\n## Platform posture\n- Platform health demo: ${platformHealth}/100\n- Servicio seleccionado: ${selectedService.name}\n- Health: ${selectedService.health}\n- Availability demo: ${selectedService.availability}%\n- SLO demo: ${selectedService.slo}%\n\n## Arquitectura / alcance\n\n## Servicio / API / dependencia\n\n## Observabilidad y evidencia\n\n## SLO / error budget\n\n## Release / rollback\n\n## Blast radius\n\n## Riesgo técnico y seguridad\n\n## Deuda técnica / decisión\n\n## AI routing / resiliencia\n\n## Owner / aprobación\n\n> Documento tecnológico demo. No afirmar disponibilidad, provider AI, integración, observabilidad ni SLO real sin telemetría y runtime validados.\n`}))
    const workspace=[...document.querySelectorAll('button')].find(b=>b.textContent?.trim()==='Workspace')
    if(workspace instanceof HTMLButtonElement)workspace.click()
  }

  return <section className="technology-premium">
    <header className="technology-head">
      <div className="technology-brand"><span><CircuitBoard size={25}/></span><div><small>NEXUS · CTO AI</small><h1>Technology & AI Platform Command Center</h1><p>Arquitectura, reliability, releases, dependencies y AI resilience con evidencia y gobierno.</p></div></div>
      <div className="technology-head-status"><i/>Datos demo · Platform intelligence</div>
    </header>

    <nav className="technology-tabs">{[
      ['command','Command Center'],['services','Servicios'],['apis','APIs'],['releases','Releases'],['observability','Observabilidad'],['dependencies','Dependencias'],['debt','Tech Debt'],['ai','AI Platform'],['documents','Documentos'],['agent','NEXUS AI'],
    ].map(([id,label])=><button key={id} className={tab===id?'active':''} onClick={()=>setTab(id as Tab)}>{label}</button>)}</nav>

    {tab!=='agent'&&<div className="technology-kpis">
      <Kpi icon={<Gauge size={18}/>} label="Platform health" value={`${platformHealth}/100`} detail={`${degraded} servicios degradados`} tone="cyan"/>
      <Kpi icon={<ServerCog size={18}/>} label="Servicios healthy" value={`${healthy}/${services.length}`} detail={`${avgAvailability.toFixed(2)}% disponibilidad demo`} tone="emerald"/>
      <Kpi icon={<TriangleAlert size={18}/>} label="Incidentes activos" value={String(activeIncidents)} detail={`${apiDegraded} APIs degradadas`} tone="rose"/>
      <Kpi icon={<GitBranch size={18}/>} label="High-risk debt" value={String(highDebt)} detail="priorizado por impacto/riesgo/esfuerzo" tone="violet"/>
    </div>}

    {tab==='command'&&<>
      <div className="technology-grid-2">
        <article className="technology-panel hero"><div className="panel-title"><div><small>PLATFORM CONTROL TOWER</small><h2>Technology posture</h2></div><Cpu size={20}/></div>
          <div className="technology-ring"><strong>{platformHealth}</strong><span>/100</span></div>
          <p>NEXUS correlaciona SLO, health, incidentes, releases, dependencias y deuda técnica antes de priorizar una decisión.</p>
          <div className="mini-stats"><span><b>{healthy}</b> healthy</span><span><b>{activeIncidents}</b> incidentes</span><span><b>{highDebt}</b> debt alto/crítico</span></div>
        </article>
        <article className="technology-panel"><div className="panel-title"><div><small>CTO DECISION QUEUE</small><h2>Next Best Technology Actions</h2></div><Sparkles size={20}/></div>
          <div className="technology-actions">{nextActions.map(a=><div key={a.title} className={`technology-action ${a.tone}`}><span>{a.tone==='risk'?<AlertTriangle size={17}/>:<Zap size={17}/>}</span><div><b>{a.title}</b><p>{a.reason}</p></div></div>)}</div>
        </article>
      </div>
      <div className="technology-grid-2">
        <article className="technology-panel"><div className="panel-title"><div><small>SERVICE HEALTH</small><h2>Critical service watch</h2></div><Activity size={20}/></div>
          {services.filter(s=>s.criticality==='Crítica'||s.health!=='Healthy').map(s=><div className="service-row" key={s.id} onClick={()=>{setSelected(s.id);setTab('services')}}><div><b>{s.name}</b><small>{s.owner} · p95 {s.latency}ms · err {s.errorRate}%</small></div><span className={`status-chip ${toneByHealth(s.health)}`}>{s.health}</span></div>)}
        </article>
        <article className="technology-panel"><div className="panel-title"><div><small>ARCHITECTURE RISK</small><h2>Blast-radius dependencies</h2></div><Network size={20}/></div>
          {dependencies.filter(d=>d.criticality==='Crítica'||d.criticality==='Alta').slice(0,5).map((d,i)=><div className="dependency-row" key={`${d.from}-${d.to}-${i}`}><div><b>{d.from} → {d.to}</b><small>{d.relation} · {d.blastRadius}</small></div><span className={`status-chip ${toneByRisk(d.criticality)}`}>{d.confidence}</span></div>)}
        </article>
      </div>
    </>}

    {tab==='services'&&<div className="technology-grid-library">
      <article className="technology-panel"><div className="panel-title"><div><small>SERVICE CATALOG</small><h2>Platform services</h2></div><Boxes size={20}/></div>
        <div className="technology-search"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar servicio, owner, región..."/></div>
        <div className="service-list">{filteredServices.map(s=><button key={s.id} className={selected===s.id?'active':''} onClick={()=>setSelected(s.id)}><div><b>{s.name}</b><small>{s.domain} · {s.owner}</small></div><span className={`status-chip ${toneByHealth(s.health)}`}>{s.health}</span></button>)}</div>
      </article>
      <article className="technology-panel passport"><div className="panel-title"><div><small>SERVICE PASSPORT</small><h2>{selectedService.name}</h2></div><ServerCog size={20}/></div>
        <div className="passport-grid"><Info label="ID" value={selectedService.id}/><Info label="Criticality" value={selectedService.criticality}/><Info label="Health" value={selectedService.health}/><Info label="Version" value={selectedService.version}/><Info label="Availability" value={`${selectedService.availability}% demo`}/><Info label="SLO" value={`${selectedService.slo}% demo`}/><Info label="p95" value={`${selectedService.latency} ms`}/><Info label="Error rate" value={`${selectedService.errorRate}%`}/><Info label="Region" value={selectedService.region}/><Info label="Source" value={selectedService.source}/></div>
        <div className="service-health-bar"><span style={{width:`${Math.max(0,Math.min(100,selectedService.availability))}%`}}/></div>
        <p className="technology-note">Availability/SLO/latency son datos demo salvo que exista telemetría explícitamente validada.</p>
      </article>
    </div>}

    {tab==='apis'&&<article className="technology-panel wide"><div className="panel-title"><div><small>API CONTROL PLANE</small><h2>API inventory & performance</h2></div><Braces size={20}/></div>
      <div className="technology-table"><div className="tr head"><span>API</span><span>Method / path</span><span>p95</span><span>Error</span><span>RPM</span><span>Auth</span><span>Status</span></div>{apis.map(a=><div className="tr" key={a.id}><span><b>{a.name}</b><small>{a.service}</small></span><span>{a.method} {a.path}</span><span>{a.p95}ms</span><span>{a.errorRate}%</span><span>{a.rpm}</span><span>{a.auth}</span><span><i className={`status-chip ${toneByHealth(a.status)}`}>{a.status}</i></span></div>)}</div>
      <p className="technology-note">Las rutas marcadas como architecture target no prueban que el endpoint exista o esté conectado en producción.</p>
    </article>}

    {tab==='releases'&&<div className="technology-grid-2">
      <article className="technology-panel"><div className="panel-title"><div><small>RELEASE GOVERNANCE</small><h2>Release train</h2></div><Rocket size={20}/></div>{releases.map(r=><div className="release-card" key={r.id}><div><b>{r.name}</b><small>{r.service} · {r.version} · {r.created}</small><p>{r.evidence}</p></div><div className="release-side"><span className={`status-chip ${toneByRisk(r.risk)}`}>{r.risk}</span><strong>{r.status}</strong>{r.status!=='Live'&&r.status!=='Rolled back'&&<button onClick={()=>advanceRelease(r.id)}>Avanzar gate</button>}</div></div>)}</article>
      <article className="technology-panel"><div className="panel-title"><div><small>CHANGE RISK</small><h2>Release safety</h2></div><ShieldCheck size={20}/></div>{releases.map(r=><div className="risk-meter" key={r.id}><div><b>{r.id}</b><span>{r.changeFailureRisk}% change-failure risk demo</span></div><div><i style={{width:`${r.changeFailureRisk}%`}}/></div></div>)}<p className="technology-note">Un botón de gate no ejecuta un deployment real ni sustituye CI/CD, approvals o rollback verification.</p></article>
    </div>}

    {tab==='observability'&&<div className="technology-grid-2">
      <article className="technology-panel"><div className="panel-title"><div><small>OBSERVABILITY</small><h2>Golden signals</h2></div><Activity size={20}/></div>{services.map(s=><div className="signal-row" key={s.id}><div><b>{s.name}</b><small>Availability {s.availability}% · SLO {s.slo}%</small></div><div><strong>{s.latency}ms</strong><span>{s.errorRate}% err</span></div></div>)}</article>
      <article className="technology-panel"><div className="panel-title"><div><small>INCIDENT COMMAND</small><h2>Technology incidents</h2></div><TimerReset size={20}/></div>{incidents.map(i=><div className="incident-card" key={i.id}><div><b>{i.title}</b><small>{i.service} · {i.opened} · {i.evidence}</small><p>{i.impact}</p></div><div><span className={`status-chip ${toneByRisk(i.severity)}`}>{i.severity}</span><strong>{i.status}</strong>{i.status!=='Closed'&&<button onClick={()=>advanceIncident(i.id)}>Avanzar</button>}</div></div>)}</article>
    </div>}

    {tab==='dependencies'&&<article className="technology-panel wide"><div className="panel-title"><div><small>DEPENDENCY GRAPH</small><h2>Architecture & blast radius</h2></div><Network size={20}/></div>
      <div className="dependency-graph">{dependencies.map((d,i)=><div className="dependency-card" key={`${d.from}-${d.to}-${i}`}><div className="dep-nodes"><span>{d.from}</span><GitBranch size={18}/><span>{d.to}</span></div><p>{d.relation}</p><small>Blast radius: {d.blastRadius}</small><div><i className={`status-chip ${toneByRisk(d.criticality)}`}>{d.criticality}</i><i className="confidence-chip">confidence {d.confidence}</i></div></div>)}</div>
      <p className="technology-note">El grafo describe arquitectura/hipótesis demo; no representa tracing distribuido real hasta implementar observabilidad correlacionada.</p>
    </article>}

    {tab==='debt'&&<article className="technology-panel wide"><div className="panel-title"><div><small>TECHNICAL DEBT INTELLIGENCE</small><h2>Debt portfolio</h2></div><Layers3 size={20}/></div>
      <div className="technology-table debt-table"><div className="tr head"><span>Item</span><span>Área</span><span>Impacto</span><span>Esfuerzo</span><span>Riesgo</span><span>Priority</span><span>Estado</span></div>{debtPriority.map(d=><div className="tr" key={d.id}><span><b>{d.title}</b><small>{d.reason}</small></span><span>{d.area}</span><span>{d.impact}</span><span>{d.effort}</span><span><i className={`status-chip ${toneByRisk(d.risk)}`}>{d.risk}</i></span><span><strong>{d.priority}</strong></span><span><button className="text-action" onClick={()=>advanceDebt(d.id)}>{d.status}</button></span></div>)}</div>
      <p className="technology-note">Priority score es heurístico demo; una decisión real debe considerar roadmap, costo, seguridad, revenue y capacidad.</p>
    </article>}

    {tab==='ai'&&<div className="technology-grid-2">
      <article className="technology-panel"><div className="panel-title"><div><small>AI PLATFORM REGISTRY</small><h2>Capability routing</h2></div><CloudCog size={20}/></div>{seedAiRoutes.map(r=><div className="ai-route" key={r.id}><div><b>{r.capability}</b><small>Primary: {r.primary}</small><small>Fallback: {r.fallback}</small><p>{r.policy}</p></div><span className={`provider-chip state-${r.state.toLowerCase()}`}>{r.state}</span></div>)}</article>
      <article className="technology-panel"><div className="panel-title"><div><small>RESILIENCE POLICY</small><h2>Fail-closed AI architecture</h2></div><Workflow size={20}/></div>
        <div className="resilience-flow"><span>Request</span><b>→</b><span>Policy gate</span><b>→</b><span>Provider health</span><b>→</b><span>Primary</span><b>→</b><span>Fallback</span><b>→</b><span>Audit</span></div>
        <div className="guardrail-list"><p><CheckCircle2 size={16}/>No declarar modelo/proveedor real sin runtime validado.</p><p><CheckCircle2 size={16}/>Circuit breaker y timeout deben existir en backend antes de llamarlos activos.</p><p><CheckCircle2 size={16}/>RAG debe conservar tenant isolation, fuente, versión y evidence references.</p><p><CheckCircle2 size={16}/>Fallback determinista debe identificarse como tal.</p></div>
      </article>
    </div>}

    {tab==='documents'&&<article className="technology-panel wide"><div className="panel-title"><div><small>TECHNOLOGY DOCUMENT STUDIO</small><h2>Architecture, reliability & AI governance</h2></div><FileText size={20}/></div><div className="document-grid">{documents.map(d=><button key={d} onClick={()=>openWorkspace(d)}><FileText size={19}/><span>{d}</span><small>Abrir en Workspace</small></button>)}</div></article>}

    {tab==='agent'&&<DepartmentAgentWorkspace department={department} documents={documents} knowledge={knowledge} suggestions={suggestions} onOpenWorkspace={openWorkspace}/>}
  </section>
}

function Kpi({icon,label,value,detail,tone}:{icon:ReactNode;label:string;value:string;detail:string;tone:string}){return <article className={`technology-kpi ${tone}`}><span>{icon}</span><div><small>{label}</small><strong>{value}</strong><p>{detail}</p></div></article>}
function Info({label,value}:{label:string;value:string}){return <div className="passport-info"><small>{label}</small><b>{value}</b></div>}
