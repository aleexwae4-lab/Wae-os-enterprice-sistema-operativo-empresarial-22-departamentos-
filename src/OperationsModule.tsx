import { useMemo, useState, type ReactNode } from 'react'
import {
  Activity, AlertTriangle, Bot, CheckCircle2, Clock3, FileText, Gauge, GitBranch,
  Layers3, Network, Search, Sparkles, Target, TimerReset, UsersRound, Workflow, Zap,
} from 'lucide-react'
import type { Department } from './data'
import DepartmentAgentWorkspace from './DepartmentAgentWorkspace'
import './operations-premium.css'

type Tab='command'|'processes'|'sla'|'capacity'|'queues'|'incidents'|'twin'|'documents'|'agent'
type Risk='Bajo'|'Medio'|'Alto'|'Crítico'
type ProcessStatus='Saludable'|'Atención'|'Degradado'|'Crítico'
type IncidentStatus='Nuevo'|'Investigando'|'Mitigando'|'Monitoreando'|'Cerrado'
type QueueStatus='Pendiente'|'En curso'|'Bloqueado'|'Resuelto'

type Process={id:string;name:string;owner:string;domain:string;volume:number;throughput:number;cycle:number;targetCycle:number;wip:number;sla:number;health:number;status:ProcessStatus;bottleneck:string;source:string}
type Sla={id:string;service:string;owner:string;target:number;actual:number;atRisk:number;breaches:number;window:string;source:string}
type Capacity={id:string;team:string;owner:string;available:number;assigned:number;criticalSkills:string;backlog:number;status:'Disponible'|'Óptimo'|'Sobrecargado'}
type QueueItem={id:string;title:string;queue:string;owner:string;age:number;slaLeft:number;risk:Risk;status:QueueStatus;dependency:string;value:string}
type Incident={id:string;title:string;severity:Risk;process:string;owner:string;opened:string;status:IncidentStatus;impact:string;evidence:string;confidence:number}
type Sop={id:string;name:string;process:string;owner:string;coverage:number;version:string;updated:string;status:'Vigente'|'Revisión'|'Brecha'}

const processes:Process[]=[
  {id:'PRC-001',name:'Order-to-Cash',owner:'ORBIT + CLOSER + INVOICER',domain:'Revenue Ops',volume:142,throughput:31,cycle:5.8,targetCycle:4.5,wip:18,sla:92,health:74,status:'Atención',bottleneck:'Validación comercial → facturación',source:'CLOSER + INVOICER demo'},
  {id:'PRC-002',name:'Procure-to-Pay',owner:'ORBIT + PROCURE + LEDGER',domain:'Procurement Ops',volume:89,throughput:22,cycle:7.2,targetCycle:6,wip:14,sla:88,health:69,status:'Degradado',bottleneck:'Recepción parcial / 3-way match',source:'PROCURE + LEDGER demo'},
  {id:'PRC-003',name:'Incident-to-Resolution',owner:'ORBIT + CARE + NEXUS',domain:'Service Ops',volume:64,throughput:18,cycle:3.1,targetCycle:2.5,wip:9,sla:94,health:81,status:'Atención',bottleneck:'Escalamiento técnico N2',source:'CARE + NEXUS demo'},
  {id:'PRC-004',name:'Hire-to-Productive',owner:'ORBIT + TALENT + ACADEMY',domain:'People Ops',volume:18,throughput:6,cycle:11.5,targetCycle:10,wip:4,sla:96,health:86,status:'Saludable',bottleneck:'Asignación de accesos',source:'TALENT + ACADEMY demo'},
  {id:'PRC-005',name:'Month-End Close',owner:'ORBIT + LEDGER + STERLING',domain:'Finance Ops',volume:36,throughput:12,cycle:4.8,targetCycle:4,wip:7,sla:89,health:71,status:'Degradado',bottleneck:'Evidencia y conciliación tardía',source:'LEDGER + STERLING demo'},
  {id:'PRC-006',name:'Security Incident Response',owner:'ORBIT + SENTINEL',domain:'Security Ops',volume:12,throughput:5,cycle:2.2,targetCycle:2,wip:3,sla:97,health:91,status:'Saludable',bottleneck:'—',source:'SENTINEL demo'},
]

const slas:Sla[]=[
  {id:'SLA-01',service:'Atención Enterprise P1',owner:'CARE + ORBIT',target:98,actual:94.2,atRisk:3,breaches:1,window:'30 días',source:'CARE demo'},
  {id:'SLA-02',service:'Facturación post-cierre',owner:'INVOICER + ORBIT',target:97,actual:95.4,atRisk:2,breaches:0,window:'30 días',source:'INVOICER demo'},
  {id:'SLA-03',service:'Recepción → contabilización',owner:'PROCURE + LEDGER',target:95,actual:88.1,atRisk:4,breaches:2,window:'30 días',source:'PROCURE + LEDGER demo'},
  {id:'SLA-04',service:'Incidente seguridad crítico',owner:'SENTINEL + ORBIT',target:99,actual:98.5,atRisk:1,breaches:0,window:'90 días',source:'SENTINEL demo'},
]

const capacity:Capacity[]=[
  {id:'CAP-01',team:'Operaciones Core',owner:'ORBIT',available:160,assigned:148,criticalSkills:'Process ops / escalamiento',backlog:18,status:'Óptimo'},
  {id:'CAP-02',team:'Soporte N2',owner:'CARE + NEXUS',available:120,assigned:136,criticalSkills:'Diagnóstico / integración',backlog:12,status:'Sobrecargado'},
  {id:'CAP-03',team:'Finance Operations',owner:'LEDGER + STERLING',available:100,assigned:94,criticalSkills:'Close / conciliación',backlog:9,status:'Óptimo'},
  {id:'CAP-04',team:'Procurement Operations',owner:'PROCURE + SOURCE',available:96,assigned:82,criticalSkills:'Sourcing / receiving',backlog:7,status:'Disponible'},
  {id:'CAP-05',team:'Security Operations',owner:'SENTINEL',available:80,assigned:62,criticalSkills:'IR / IAM',backlog:3,status:'Disponible'},
]

const seedQueues:QueueItem[]=[
  {id:'Q-301',title:'3-way match Office World',queue:'Procure-to-Pay',owner:'PROCURE + LEDGER',age:5,slaLeft:-8,risk:'Crítico',status:'Bloqueado',dependency:'Recepción parcial pendiente',value:'$18,690'},
  {id:'Q-302',title:'Escalamiento Enterprise · sync',queue:'Service Ops',owner:'CARE + NEXUS',age:2,slaLeft:18,risk:'Alto',status:'En curso',dependency:'Diagnóstico N2',value:'Cuenta estratégica'},
  {id:'Q-303',title:'Conciliación banco principal',queue:'Month-End Close',owner:'LEDGER',age:3,slaLeft:10,risk:'Alto',status:'En curso',dependency:'Evidencia bancaria',value:'Cierre mensual'},
  {id:'Q-304',title:'Alta de acceso nuevo analista',queue:'Hire-to-Productive',owner:'TALENT + NEXUS',age:1,slaLeft:22,risk:'Medio',status:'Pendiente',dependency:'Aprobación manager',value:'Onboarding'},
  {id:'Q-305',title:'Factura Enterprise vencida',queue:'Order-to-Cash',owner:'INVOICER + CLOSER',age:12,slaLeft:-24,risk:'Crítico',status:'Bloqueado',dependency:'Validación comercial',value:'$74,000'},
  {id:'Q-306',title:'Revisión proveedor CloudNet',queue:'Procure-to-Pay',owner:'SOURCE + NORM',age:4,slaLeft:14,risk:'Alto',status:'Pendiente',dependency:'Evidence pack',value:'Proveedor crítico'},
]

const seedIncidents:Incident[]=[
  {id:'OPS-INC-041',title:'Latencia elevada en flujo de sincronización',severity:'Alto',process:'Incident-to-Resolution',owner:'ORBIT + NEXUS',opened:'01 sep · 08:42',status:'Mitigando',impact:'Aumenta tiempos de atención y riesgo de SLA.',evidence:'EV-OPS-041',confidence:88},
  {id:'OPS-INC-042',title:'Recepción parcial bloquea cierre de compra',severity:'Crítico',process:'Procure-to-Pay',owner:'ORBIT + PROCURE',opened:'01 sep · 07:55',status:'Investigando',impact:'Bloquea 3-way match y contabilización.',evidence:'PO-2608-097 + M-002',confidence:96},
  {id:'OPS-INC-043',title:'Backlog N2 supera capacidad planificada',severity:'Alto',process:'Incident-to-Resolution',owner:'ORBIT + CARE + NEXUS',opened:'01 sep · 07:20',status:'Nuevo',impact:'Riesgo de saturación y deterioro de SLA.',evidence:'CAP-02 + queue snapshot',confidence:91},
]

const sops:Sop[]=[
  {id:'SOP-01',name:'Escalamiento Enterprise P1/P2',process:'Incident-to-Resolution',owner:'CARE + ORBIT',coverage:92,version:'v3.1',updated:'29 ago 2026',status:'Vigente'},
  {id:'SOP-02',name:'Recepción y three-way match',process:'Procure-to-Pay',owner:'PROCURE + LEDGER',coverage:78,version:'v2.4',updated:'28 ago 2026',status:'Revisión'},
  {id:'SOP-03',name:'Cierre mensual operativo',process:'Month-End Close',owner:'LEDGER + ORBIT',coverage:81,version:'v4.0',updated:'31 ago 2026',status:'Vigente'},
  {id:'SOP-04',name:'Alta operativa de nuevo colaborador',process:'Hire-to-Productive',owner:'TALENT + NEXUS',coverage:86,version:'v2.7',updated:'27 ago 2026',status:'Vigente'},
  {id:'SOP-05',name:'Continuidad de operación crítica',process:'Security Incident Response',owner:'SENTINEL + ORBIT',coverage:73,version:'v1.8',updated:'26 ago 2026',status:'Brecha'},
]

const documents=[
  'Operations Executive Brief','Process Health Review','SLA Performance Report','Capacity Plan','Queue Aging Review',
  'Bottleneck Analysis','Operational Incident Report','War Room Brief','SOP Review','Service Health Report','Shift Handover',
  'Operational Risk Register','Continuous Improvement Plan','Digital Twin Scenario','Operations QBR','Executive Operations Pack',
]
const knowledge=[
  'SOPs y procesos operativos autorizados','SLA y prioridades CARE / NEXUS','Capacidad y skills TALENT / ACADEMY',
  'Colas y dependencias PROCURE / LEDGER / INVOICER','Riesgos SENTINEL / NORM','Portafolio PMO y prioridades AURORA',
  'Métricas INSIGHT y health de servicios','Histórico de incidentes, cuellos y decisiones operativas',
]
const suggestions=[
  '¿Qué proceso amenaza más el SLA hoy?','Detecta cuellos de botella por cola, edad y capacidad',
  'Propón una redistribución de capacidad sin romper critical paths','Simula una caída de capacidad y prioriza la continuidad',
]

function riskTone(risk:Risk){return risk==='Crítico'?'risk':risk==='Alto'?'warn':risk==='Medio'?'mid':'good'}

export default function OperationsModule({department}:{department:Department}){
  const [tab,setTab]=useState<Tab>('command')
  const [queues,setQueues]=useState(seedQueues)
  const [incidents,setIncidents]=useState(seedIncidents)
  const [query,setQuery]=useState('')
  const [scenario,setScenario]=useState({capacity:-10,demand:15,automation:8,recovery:6})

  const processHealth=Math.round(processes.reduce((s,p)=>s+p.health,0)/processes.length)
  const slaHealth=Math.round(slas.reduce((s,x)=>s+x.actual,0)/slas.length)
  const overloaded=capacity.filter(c=>c.status==='Sobrecargado').length
  const blocked=queues.filter(q=>q.status==='Bloqueado').length
  const breached=queues.filter(q=>q.status!=='Resuelto'&&q.slaLeft<0).length
  const activeIncidents=incidents.filter(i=>i.status!=='Cerrado').length
  const opsHealth=Math.max(0,Math.min(100,Math.round(processHealth*.45+slaHealth*.35+20-overloaded*4-blocked*3-activeIncidents*1.5)))

  const filteredQueues=useMemo(()=>{
    const q=query.trim().toLowerCase();if(!q)return queues
    return queues.filter(x=>[x.id,x.title,x.queue,x.owner,x.risk,x.status,x.dependency,x.value].some(v=>String(v).toLowerCase().includes(q)))
  },[queues,query])

  const nextActions=useMemo(()=>[
    {title:'Desbloquear 3-way match Office World',reason:'Queue bloqueada + SLA vencido + dependencia conocida en recepción parcial.',tone:'risk'},
    {title:'Rebalancear soporte N2',reason:'136h asignadas / 120h disponibles y backlog de 12 casos. Validar skills antes de mover capacidad.',tone:'warn'},
    {title:'Proteger cierre mensual',reason:'Month-End Close health 71/100 con evidencia y conciliación como bottleneck.',tone:'warn'},
    {title:'Atacar cartera bloqueada',reason:'Order-to-Cash acumula una cuenta vencida de alto valor y una dependencia comercial explícita.',tone:'risk'},
  ] as const,[])

  const advanceQueue=(id:string)=>setQueues(v=>v.map(q=>{
    if(q.id!==id||q.status==='Bloqueado'||q.status==='Resuelto')return q
    return {...q,status:q.status==='Pendiente'?'En curso':'Resuelto'}
  }))
  const unblockQueue=(id:string)=>setQueues(v=>v.map(q=>q.id===id?{...q,status:'En curso',dependency:'Dependencia marcada como resuelta en demo'}:q))
  const advanceIncident=(id:string)=>setIncidents(v=>v.map(i=>{
    if(i.id!==id)return i
    const order:IncidentStatus[]=['Nuevo','Investigando','Mitigando','Monitoreando','Cerrado']
    return {...i,status:order[Math.min(order.length-1,order.indexOf(i.status)+1)]}
  }))

  const demandFactor=1+scenario.demand/100
  const capacityFactor=1+scenario.capacity/100+scenario.automation/200
  const projectedLoad=Math.round(capacity.reduce((s,c)=>s+c.assigned,0)*demandFactor)
  const projectedCapacity=Math.round(capacity.reduce((s,c)=>s+c.available,0)*capacityFactor)
  const utilization=Math.round(projectedLoad/Math.max(1,projectedCapacity)*100)
  const projectedSla=Math.max(0,Math.min(100,Math.round(slaHealth-(utilization-85)*.18+scenario.recovery*.3)))
  const projectedHealth=Math.max(0,Math.min(100,Math.round(opsHealth-(utilization-85)*.22+scenario.automation*.25+scenario.recovery*.2)))

  const openWorkspace=(title:string)=>{
    localStorage.setItem('wae-workspace-draft',JSON.stringify({title,body:`# ${title}\n\n**Departamento:** Operaciones\n**Agente:** ORBIT\n\n## Executive operations posture\n- Operations health demo: ${opsHealth}/100\n- SLA health demo: ${slaHealth}%\n- Colas bloqueadas: ${blocked}\n- Incidentes activos: ${activeIncidents}\n\n## Proceso / servicio\n\n## Volumen / throughput / WIP\n\n## SLA y aging\n\n## Capacidad y skills\n\n## Bottleneck / dependencia\n\n## Riesgo operativo\n\n## Next best action\n\n## Owner / aprobación\n\n## Evidencia de cierre\n\n> Documento operativo demo. Validar telemetría, capacidad, prioridades, dependencias y responsables antes de ejecutar cambios reales.\n`}))
    const workspace=[...document.querySelectorAll('button')].find(b=>b.textContent?.trim()==='Workspace')
    if(workspace instanceof HTMLButtonElement)workspace.click()
  }

  return <section className="operations-premium">
    <header className="operations-head">
      <div className="operations-brand"><span><Network size={25}/></span><div><small>ORBIT · COO AI</small><h1>Enterprise Operations Command Center</h1><p>Process intelligence, SLA, capacidad, colas, incidentes y digital twin operativo.</p></div></div>
      <div className="operations-head-status"><i/>Datos demo · Control tower</div>
    </header>

    <nav className="operations-tabs">{[
      ['command','Command Center'],['processes','Procesos'],['sla','SLA'],['capacity','Capacidad'],['queues','Colas'],['incidents','Incidentes'],['twin','Digital Twin'],['documents','Documentos'],['agent','ORBIT AI'],
    ].map(([id,label])=><button key={id} className={tab===id?'active':''} onClick={()=>setTab(id as Tab)}>{label}</button>)}</nav>

    {tab!=='agent'&&<div className="operations-kpis">
      <Kpi icon={<Gauge size={18}/>} label="Operations health" value={`${opsHealth}/100`} detail={`${blocked} colas bloqueadas`} tone="cyan"/>
      <Kpi icon={<TimerReset size={18}/>} label="SLA health" value={`${slaHealth}%`} detail={`${breached} items fuera de SLA`} tone="emerald"/>
      <Kpi icon={<UsersRound size={18}/>} label="Capacidad" value={`${capacity.filter(c=>c.status==='Sobrecargado').length}`} detail="equipos sobrecargados" tone="amber"/>
      <Kpi icon={<AlertTriangle size={18}/>} label="Incidentes activos" value={String(activeIncidents)} detail={`${incidents.filter(i=>i.severity==='Crítico'&&i.status!=='Cerrado').length} críticos`} tone="rose"/>
    </div>}

    {tab==='command'&&<>
      <div className="operations-grid-2">
        <article className="operations-panel hero"><div className="panel-title"><div><small>OPERATIONS CONTROL TOWER</small><h2>Enterprise operations posture</h2></div><Activity size={20}/></div>
          <div className="operations-ring"><strong>{opsHealth}</strong><span>/100</span></div>
          <p>ORBIT combina process health, SLA, capacidad, colas e incidentes para priorizar continuidad y throughput.</p>
          <div className="mini-stats"><span><b>{processes.filter(p=>p.status==='Degradado'||p.status==='Crítico').length}</b> procesos degradados</span><span><b>{breached}</b> SLA breach</span><span><b>{overloaded}</b> equipos saturados</span></div>
        </article>
        <article className="operations-panel"><div className="panel-title"><div><small>DECISION QUEUE</small><h2>Next Best Operational Actions</h2></div><Sparkles size={20}/></div>
          <div className="operations-actions">{nextActions.map(a=><div key={a.title} className={`operations-action ${a.tone}`}><span>{a.tone==='risk'?<AlertTriangle size={17}/>:<Zap size={17}/>}</span><div><b>{a.title}</b><p>{a.reason}</p></div></div>)}</div>
        </article>
      </div>
      <div className="operations-grid-2">
        <article className="operations-panel"><div className="panel-title"><div><small>PROCESS HEALTH</small><h2>Procesos prioritarios</h2></div><Workflow size={20}/></div>{[...processes].sort((a,b)=>a.health-b.health).slice(0,4).map(p=><div className="process-row" key={p.id}><div><b>{p.name}</b><small>{p.bottleneck}</small></div><strong>{p.health}</strong></div>)}</article>
        <article className="operations-panel"><div className="panel-title"><div><small>QUEUE AGING</small><h2>Trabajo que requiere intervención</h2></div><Clock3 size={20}/></div>{[...queues].filter(q=>q.status!=='Resuelto').sort((a,b)=>a.slaLeft-b.slaLeft).slice(0,4).map(q=><div className="queue-row" key={q.id}><div><b>{q.title}</b><small>{q.queue} · {q.dependency}</small></div><span className={`risk-chip ${riskTone(q.risk)}`}>{q.slaLeft<0?`${Math.abs(q.slaLeft)}h vencido`:`${q.slaLeft}h`}</span></div>)}</article>
      </div>
    </>}

    {tab==='processes'&&<article className="operations-panel"><div className="panel-title"><div><small>PROCESS INTELLIGENCE</small><h2>Value streams & bottlenecks</h2></div><Workflow size={20}/></div>
      <div className="operations-table process-table"><div className="thead"><span>Proceso</span><span>Cycle</span><span>WIP</span><span>SLA</span><span>Health</span><span>Bottleneck</span></div>{processes.map(p=><div className="trow" key={p.id}><span><b>{p.name}</b><small>{p.owner} · {p.source}</small></span><span>{p.cycle}d / {p.targetCycle}d</span><span>{p.wip}</span><span>{p.sla}%</span><span><b>{p.health}/100</b><small>{p.status}</small></span><span>{p.bottleneck}</span></div>)}</div>
      <div className="sop-grid">{sops.map(s=><div className="sop-card" key={s.id}><small>{s.id} · {s.status}</small><b>{s.name}</b><p>{s.process}</p><div className="progress"><i style={{width:`${s.coverage}%`}}/></div><span>{s.coverage}% coverage · {s.version}</span></div>)}</div>
    </article>}

    {tab==='sla'&&<article className="operations-panel"><div className="panel-title"><div><small>SLA CONTROL TOWER</small><h2>Service commitments</h2></div><Target size={20}/></div>
      <div className="sla-grid">{slas.map(s=><div className="sla-card" key={s.id}><div><small>{s.id} · {s.window}</small><b>{s.service}</b><p>{s.owner}</p></div><strong>{s.actual}%</strong><div className="progress"><i style={{width:`${Math.min(100,s.actual)}%`}}/></div><span>Target {s.target}% · {s.atRisk} en riesgo · {s.breaches} breaches</span><em>{s.source}</em></div>)}</div>
    </article>}

    {tab==='capacity'&&<article className="operations-panel"><div className="panel-title"><div><small>CAPACITY INTELLIGENCE</small><h2>Workforce & load balancing</h2></div><UsersRound size={20}/></div>
      <div className="capacity-grid">{capacity.map(c=>{const util=Math.round(c.assigned/c.available*100);return <div className={`capacity-card ${c.status==='Sobrecargado'?'hot':''}`} key={c.id}><small>{c.status}</small><b>{c.team}</b><p>{c.owner}</p><div className="capacity-number"><strong>{util}%</strong><span>{c.assigned}h / {c.available}h</span></div><div className="progress"><i style={{width:`${Math.min(100,util)}%`}}/></div><span>{c.backlog} backlog · {c.criticalSkills}</span></div>})}</div>
      <p className="operations-note">Rebalancear capacidad requiere validar skills, critical path, impacto y costo de cambio de contexto. ORBIT no reasigna personas automáticamente.</p>
    </article>}

    {tab==='queues'&&<article className="operations-panel"><div className="panel-title"><div><small>QUEUE INTELLIGENCE</small><h2>Aging, blockers & flow</h2></div><Layers3 size={20}/></div>
      <div className="searchbar"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar cola, owner, dependencia..."/></div>
      <div className="queue-cards">{filteredQueues.map(q=><div className="queue-card" key={q.id}><div className="queue-card-top"><div><small>{q.id} · {q.queue}</small><b>{q.title}</b></div><span className={`risk-chip ${riskTone(q.risk)}`}>{q.risk}</span></div><p>{q.dependency}</p><div className="queue-meta"><span>Edad <b>{q.age}d</b></span><span>SLA <b>{q.slaLeft<0?`${Math.abs(q.slaLeft)}h vencido`:`${q.slaLeft}h`}</b></span><span>{q.value}</span></div><div className="queue-footer"><span>{q.owner} · {q.status}</span>{q.status==='Bloqueado'?<button onClick={()=>unblockQueue(q.id)}>Resolver dependencia</button>:q.status!=='Resuelto'?<button onClick={()=>advanceQueue(q.id)}>Avanzar</button>:<CheckCircle2 size={18}/>}</div></div>)}</div>
    </article>}

    {tab==='incidents'&&<article className="operations-panel"><div className="panel-title"><div><small>OPERATIONAL INCIDENT COMMAND</small><h2>Continuity & recovery</h2></div><AlertTriangle size={20}/></div>
      <div className="incident-grid">{incidents.map(i=><div className="incident-card" key={i.id}><div className="incident-top"><span className={`risk-chip ${riskTone(i.severity)}`}>{i.severity}</span><small>{i.id} · {i.opened}</small></div><b>{i.title}</b><p>{i.impact}</p><div className="incident-meta"><span>{i.process}</span><span>{i.owner}</span><span>Confidence {i.confidence}%</span><span>{i.evidence}</span></div><div className="incident-footer"><strong>{i.status}</strong>{i.status!=='Cerrado'&&<button onClick={()=>advanceIncident(i.id)}>Avanzar respuesta</button>}</div></div>)}</div>
    </article>}

    {tab==='twin'&&<div className="operations-grid-2">
      <article className="operations-panel"><div className="panel-title"><div><small>OPERATIONAL DIGITAL TWIN</small><h2>What-if controls</h2></div><GitBranch size={20}/></div>
        <Scenario label="Capacidad" value={scenario.capacity} suffix="%" min={-30} max={30} onChange={v=>setScenario(s=>({...s,capacity:v}))}/>
        <Scenario label="Demanda" value={scenario.demand} suffix="%" min={-20} max={40} onChange={v=>setScenario(s=>({...s,demand:v}))}/>
        <Scenario label="Automatización" value={scenario.automation} suffix=" pts" min={0} max={20} onChange={v=>setScenario(s=>({...s,automation:v}))}/>
        <Scenario label="Recovery boost" value={scenario.recovery} suffix=" pts" min={0} max={20} onChange={v=>setScenario(s=>({...s,recovery:v}))}/>
      </article>
      <article className="operations-panel"><div className="panel-title"><div><small>PROJECTED STATE</small><h2>Impacto simulado</h2></div><Sparkles size={20}/></div>
        <div className="twin-results"><div><small>Demanda proyectada</small><b>{projectedLoad}h</b></div><div><small>Capacidad efectiva</small><b>{projectedCapacity}h</b></div><div><small>Utilización</small><b>{utilization}%</b></div><div><small>SLA proyectado</small><b>{projectedSla}%</b></div><div><small>Operations health</small><b>{projectedHealth}/100</b></div></div>
        <p className="operations-note">Escenario no destructivo. No cambia dotación, turnos, SLAs ni automatizaciones reales.</p>
      </article>
    </div>}

    {tab==='documents'&&<article className="operations-panel"><div className="panel-title"><div><small>OPERATIONS DOCUMENT STUDIO</small><h2>Playbooks & executive packs</h2></div><FileText size={20}/></div><div className="document-grid">{documents.map(d=><button key={d} onClick={()=>openWorkspace(d)}><FileText size={18}/><span><b>{d}</b><small>Abrir borrador editable en Workspace</small></span></button>)}</div></article>}

    {tab==='agent'&&<DepartmentAgentWorkspace department={department} documents={documents} knowledge={knowledge} suggestions={suggestions} onOpenWorkspace={(title)=>openWorkspace(title)}/>} 
  </section>
}

function Kpi({icon,label,value,detail,tone}:{icon:ReactNode;label:string;value:string;detail:string;tone:string}){return <div className={`operations-kpi ${tone}`}><span>{icon}</span><div><small>{label}</small><b>{value}</b><em>{detail}</em></div></div>}
function Scenario({label,value,suffix,min,max,onChange}:{label:string;value:number;suffix:string;min:number;max:number;onChange:(v:number)=>void}){return <label className="scenario-control"><span><b>{label}</b><em>{value>0?'+':''}{value}{suffix}</em></span><input type="range" min={min} max={max} value={value} onChange={e=>onChange(Number(e.target.value))}/></label>}
