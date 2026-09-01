import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  Activity, AlertTriangle, Bot, CheckCircle2, CircleDot, FileText, Fingerprint,
  Gauge, GitBranch, KeyRound, Layers3, LockKeyhole, Network, Play, RefreshCw,
  Route, Search, ShieldCheck, Sparkles, TimerReset, Workflow, Zap,
} from 'lucide-react'
import type { Department } from './data'
import { departments } from './data'
import DepartmentAgentWorkspace from './DepartmentAgentWorkspace'
import {
  advanceWorkflow, approveCommand, getBackboneSnapshot, policyGates, publishEvent,
  queueAdapter, requestCommand, resetBackboneDemo, subscribeBackbone,
  type BackboneRisk,
} from './enterpriseBackbone'
import './enterprise-backbone-premium.css'

type Tab='command'|'events'|'commands'|'workflows'|'policies'|'audit'|'runtime'|'topology'|'documents'|'agent'

const documents=[
  'Enterprise Control Plane Brief','Event Contract','Command Contract','Workflow Definition','Policy Gate Review',
  'Approval Matrix','Correlation Trace','Audit Evidence Pack','Cross-Module Integration Map','AI Runtime Policy',
  'Tenant Isolation Review','Adapter Readiness Report','Backbone Incident Review','Control Plane QBR','Architecture Decision Record',
]
const knowledge=[
  '22 directores AI y sus boundaries','NEXUS service/dependency model','SENTINEL security policy gates','NORM compliance and approvals',
  'ARCHIVE evidence constraints','Supabase Enterprise22 isolation model','Render/GitHub deployment evidence','Cross-module demo contracts',
  'AURORA orchestration principles','Fail-closed AI runtime policy',
]
const suggestions=[
  '¿Qué workflow está bloqueado y por qué?','Traza una decisión desde evento hasta comando y evidencia',
  '¿Qué comandos requieren aprobación ejecutiva?','Prioriza adapters backend para conectar módulos reales',
]

const runtime=[
  {capability:'Executive reasoning',state:'Configured',owner:'NEXUS + AURORA',policy:'No declarar LLM disponible sin runtime validado',adapter:'Pending'},
  {capability:'Document RAG',state:'Offline',owner:'NEXUS + ARCHIVE',policy:'Evidence-first + tenant scoped',adapter:'Pending'},
  {capability:'Embeddings',state:'Offline',owner:'NEXUS',policy:'No simular búsqueda vectorial persistente',adapter:'Pending'},
  {capability:'Vision',state:'Offline',owner:'NEXUS',policy:'Fail closed sin provider autorizado',adapter:'Pending'},
]

function riskTone(risk:BackboneRisk){return risk==='Crítico'?'risk':risk==='Alto'?'warn':risk==='Medio'?'mid':'good'}
function Kpi({icon,label,value,detail,tone='cyan'}:{icon:ReactNode;label:string;value:string;detail:string;tone?:string}){return <div className={`backbone-kpi ${tone}`}><span>{icon}</span><div><small>{label}</small><b>{value}</b><p>{detail}</p></div></div>}

export default function EnterpriseBackboneModule({department}:{department:Department}){
  const [tab,setTab]=useState<Tab>('command')
  const [state,setState]=useState(()=>getBackboneSnapshot())
  const [query,setQuery]=useState('')
  const [selectedCorrelation,setSelectedCorrelation]=useState('COR-SEC-GW')

  useEffect(()=>subscribeBackbone(()=>setState(getBackboneSnapshot())),[])

  const waitingApproval=state.commands.filter(c=>c.status==='Awaiting approval').length
  const adapterPending=state.commands.filter(c=>c.status==='Adapter pending').length
  const activeWorkflows=state.workflows.filter(w=>w.status!=='Completed').length
  const blockedWorkflows=state.workflows.filter(w=>w.status==='Blocked'||w.status==='Waiting approval').length
  const avgPolicy=Math.round(policyGates.reduce((s,p)=>s+p.coverage,0)/policyGates.length)
  const backboneHealth=Math.max(0,Math.min(100,Math.round(avgPolicy-waitingApproval*3-adapterPending*2-blockedWorkflows*2+4)))

  const correlations=useMemo(()=>Array.from(new Set([
    ...state.events.map(e=>e.correlationId),...state.commands.map(c=>c.correlationId),...state.workflows.map(w=>w.correlationId),
  ])),[state])
  const trace=useMemo(()=>{
    const id=selectedCorrelation
    return [
      ...state.events.filter(e=>e.correlationId===id).map(e=>({at:e.createdAt,kind:'EVENT',actor:e.source,title:e.type,status:e.status,evidence:e.evidence,risk:e.risk})),
      ...state.commands.filter(c=>c.correlationId===id).map(c=>({at:c.createdAt,kind:'COMMAND',actor:`${c.source} → ${c.target}`,title:c.type,status:c.status,evidence:c.evidence,risk:c.risk})),
      ...state.audit.filter(a=>a.correlationId===id).map(a=>({at:a.createdAt,kind:'AUDIT',actor:a.actor,title:a.action,status:a.result,evidence:a.evidence,risk:'Bajo' as BackboneRisk})),
    ].sort((a,b)=>a.at.localeCompare(b.at))
  },[state,selectedCorrelation])

  const filteredEvents=useMemo(()=>{const q=query.toLowerCase().trim();return q?state.events.filter(e=>[e.id,e.type,e.source,e.targets.join(' '),e.correlationId,e.summary,e.evidence].some(v=>v.toLowerCase().includes(q))):state.events},[state.events,query])

  const publishDemo=()=>publishEvent({
    type:'customer.health.degraded',source:'CARE',targets:['CLOSER','AURORA','INSIGHT'],correlationId:`COR-CX-${Date.now().toString().slice(-5)}`,
    risk:'Alto',confidence:'Media',summary:'Cuenta estratégica presenta deterioro de customer health; requiere revisión humana.',evidence:'CARE frontend demo signal',
  })
  const requestDemo=()=>requestCommand({
    type:'capacity.rebalance.propose',source:'ORBIT',target:'TALENT',correlationId:`COR-OPS-${Date.now().toString().slice(-5)}`,
    risk:'Alto',summary:'Proponer rebalanceo de capacidad; no modificar asignaciones reales.',evidence:'ORBIT capacity demo',
  })

  const openWorkspace=(title:string)=>{
    localStorage.setItem('wae-workspace-draft',JSON.stringify({title,body:`# ${title}\n\n**Sistema:** WAE Enterprise Intelligence Backbone\n**Control plane:** AURORA + NEXUS\n\n## Correlation / tenant\n- Tenant demo: aurora-dynamics-demo\n- Correlation ID: ${selectedCorrelation}\n\n## Evento / señal\n\n## Comando solicitado\n\n## Policy gates\n\n## Evidencia\n\n## Aprobaciones\n\n## Adapter / execution state\n\n## Audit trail\n\n## Resultado\n\n> Documento demo del control plane. Los adapters backend, persistencia Supabase y AI runtime real no están conectados en esta fase; no declarar ejecución externa sin evidencia.\n`}))
    const workspace=[...document.querySelectorAll('button')].find(b=>b.textContent?.trim()==='Workspace')
    if(workspace instanceof HTMLButtonElement)workspace.click()
  }

  return <section className="backbone-premium">
    <header className="backbone-head">
      <div className="backbone-brand"><span><Network size={26}/></span><div><small>AURORA + NEXUS · ENTERPRISE CONTROL PLANE</small><h1>WAE Enterprise Intelligence Backbone</h1><p>Event fabric, command governance, workflows, policy gates, audit y AI runtime truthfulness.</p></div></div>
      <div className="backbone-head-status"><i/>Browser-local backbone · tenant demo</div>
    </header>

    <nav className="backbone-tabs">{[
      ['command','Command Center'],['events','Event Fabric'],['commands','Commands'],['workflows','Workflows'],['policies','Policy Gates'],['audit','Audit'],['runtime','AI Runtime'],['topology','Topology'],['documents','Documentos'],['agent','AURORA AI'],
    ].map(([id,label])=><button key={id} className={tab===id?'active':''} onClick={()=>setTab(id as Tab)}>{label}</button>)}</nav>

    {tab!=='agent'&&<div className="backbone-kpis">
      <Kpi icon={<Gauge size={18}/>} label="Backbone health" value={`${backboneHealth}/100`} detail={`${avgPolicy}% policy coverage`} tone="emerald"/>
      <Kpi icon={<Activity size={18}/>} label="Signals" value={String(state.events.length)} detail={`${correlations.length} correlations`} tone="cyan"/>
      <Kpi icon={<LockKeyhole size={18}/>} label="Approvals" value={String(waitingApproval)} detail={`${adapterPending} adapter pending`} tone="amber"/>
      <Kpi icon={<Workflow size={18}/>} label="Workflows" value={String(activeWorkflows)} detail={`${blockedWorkflows} waiting/blocked`} tone="violet"/>
    </div>}

    {tab==='command'&&<>
      <div className="backbone-grid-2">
        <article className="backbone-panel hero"><div className="panel-title"><div><small>CONTROL PLANE</small><h2>One enterprise nervous system</h2></div><GitBranch size={20}/></div>
          <div className="backbone-ring"><strong>{backboneHealth}</strong><span>/100</span></div>
          <p>Los módulos pueden expresar señales y comandos usando contratos explícitos. Riesgo, tenant, evidencia, aprobación y adapter se evalúan antes de cualquier ejecución sensible.</p>
          <div className="mini-stats"><span><b>22</b> directores</span><span><b>{state.commands.length}</b> commands</span><span><b>{state.audit.length}</b> audit records</span></div>
          <div className="backbone-quick"><button onClick={publishDemo}><Zap size={15}/>Publicar señal demo</button><button onClick={requestDemo}><Route size={15}/>Solicitar comando</button><button onClick={resetBackboneDemo}><RefreshCw size={15}/>Reset demo</button></div>
        </article>
        <article className="backbone-panel"><div className="panel-title"><div><small>CORRELATION TRACE</small><h2>Decision lineage</h2></div><Fingerprint size={20}/></div>
          <div className="correlation-select">{correlations.slice(0,6).map(c=><button className={selectedCorrelation===c?'active':''} key={c} onClick={()=>setSelectedCorrelation(c)}>{c}</button>)}</div>
          <div className="trace-list">{trace.slice(0,8).map((x,i)=><div key={`${x.kind}-${x.at}-${i}`}><span className={riskTone(x.risk)}>{x.kind}</span><div><b>{x.title}</b><small>{x.actor} · {x.status}</small><p>{x.evidence}</p></div></div>)}</div>
        </article>
      </div>
      <div className="backbone-grid-2">
        <article className="backbone-panel"><div className="panel-title"><div><small>EXECUTION QUEUE</small><h2>Commands requiring attention</h2></div><KeyRound size={20}/></div>{state.commands.slice(0,5).map(c=><div className="command-row" key={c.id}><div><b>{c.type}</b><small>{c.source} → {c.target} · {c.correlationId}</small><p>{c.summary}</p></div><span className={`risk-chip ${riskTone(c.risk)}`}>{c.status}</span></div>)}</article>
        <article className="backbone-panel"><div className="panel-title"><div><small>WORKFLOW ORCHESTRATION</small><h2>Cross-module runs</h2></div><Workflow size={20}/></div>{state.workflows.map(w=><div className="workflow-row" key={w.id}><div><b>{w.name}</b><small>{w.owner}</small><p>{w.current}</p><div className="workflow-progress"><i style={{width:`${Math.round(w.step/w.totalSteps*100)}%`}}/></div></div><span>{w.step}/{w.totalSteps}</span></div>)}</article>
      </div>
    </>}

    {tab==='events'&&<article className="backbone-panel"><div className="panel-title"><div><small>EVENT FABRIC</small><h2>Signals with tenant + correlation + evidence</h2></div><button className="backbone-action" onClick={publishDemo}><Zap size={15}/>Nueva señal demo</button></div><div className="backbone-search"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar evento, agente, correlation ID o evidencia..."/></div><div className="backbone-table events"><div className="head"><span>Evento</span><span>Ruta</span><span>Correlation</span><span>Evidence</span><span>Estado</span></div>{filteredEvents.map(e=><div key={e.id}><span><b>{e.type}</b><small>{e.id} · tenant {e.tenantId}</small></span><span>{e.source} → {e.targets.join(', ')}</span><span><button className="link-btn" onClick={()=>{setSelectedCorrelation(e.correlationId);setTab('command')}}>{e.correlationId}</button></span><span>{e.evidence}</span><span className={`risk-chip ${riskTone(e.risk)}`}>{e.status}</span></div>)}</div></article>}

    {tab==='commands'&&<article className="backbone-panel"><div className="panel-title"><div><small>COMMAND GOVERNANCE</small><h2>Intent is not execution</h2></div><button className="backbone-action" onClick={requestDemo}><Route size={15}/>Solicitar demo</button></div><div className="backbone-table commands"><div className="head"><span>Comando</span><span>Destino</span><span>Riesgo</span><span>Aprobación</span><span>Acción</span></div>{state.commands.map(c=><div key={c.id}><span><b>{c.type}</b><small>{c.correlationId} · {c.evidence}</small></span><span>{c.source} → {c.target}</span><span className={`risk-chip ${riskTone(c.risk)}`}>{c.risk}</span><span><b>{c.status}</b><small>{c.approver}</small></span><span className="row-actions">{c.status==='Awaiting approval'&&<button onClick={()=>approveCommand(c.id)}>Aprobar demo</button>}{(c.status==='Approved'||c.status==='Queued')&&<button onClick={()=>queueAdapter(c.id)}>Validar adapter</button>}{c.status==='Adapter pending'&&<small>Backend pendiente</small>}</span></div>)}</div><div className="backbone-note"><ShieldCheck size={17}/><p>Las aprobaciones de esta pantalla son demo local. No sustituyen autorización corporativa ni ejecutan cambios externos.</p></div></article>}

    {tab==='workflows'&&<div className="backbone-workflow-grid">{state.workflows.map(w=><article className="backbone-panel workflow-card" key={w.id}><div className="panel-title"><div><small>{w.id} · {w.correlationId}</small><h2>{w.name}</h2></div><span className={`risk-chip ${riskTone(w.risk)}`}>{w.status}</span></div><p>{w.owner}</p><div className="workflow-big"><strong>{w.step}</strong><span>/ {w.totalSteps}</span></div><div className="workflow-progress"><i style={{width:`${Math.round(w.step/w.totalSteps*100)}%`}}/></div><dl><div><dt>Actual</dt><dd>{w.current}</dd></div><div><dt>Siguiente</dt><dd>{w.next}</dd></div><div><dt>Evidencia</dt><dd>{w.evidence}</dd></div></dl><button disabled={w.status!=='Running'} onClick={()=>advanceWorkflow(w.id)}><Play size={15}/>Avanzar gate demo</button></article>)}</div>}

    {tab==='policies'&&<article className="backbone-panel"><div className="panel-title"><div><small>FAIL-CLOSED GOVERNANCE</small><h2>Policy gates</h2></div><ShieldCheck size={20}/></div><div className="policy-grid">{policyGates.map(p=><div key={p.id}><span className="policy-icon"><LockKeyhole size={18}/></span><div><b>{p.name}</b><small>{p.id} · {p.scope}</small><p>{p.rule}</p><div className="policy-progress"><i style={{width:`${p.coverage}%`}}/></div><em>{p.coverage}% · {p.owner}</em></div><span className="good-chip">{p.mode}</span></div>)}</div></article>}

    {tab==='audit'&&<article className="backbone-panel"><div className="panel-title"><div><small>APPEND-STYLE DEMO LOG</small><h2>Audit trail</h2></div><Fingerprint size={20}/></div><div className="audit-list">{state.audit.map(a=><div key={a.id}><span><CircleDot size={14}/></span><div><b>{a.action}</b><small>{a.actor} · {a.correlationId}</small><p>{a.result} · {a.evidence}</p></div><time>{new Date(a.createdAt).toLocaleString('es-MX')}</time></div>)}</div></article>}

    {tab==='runtime'&&<div className="backbone-grid-2"><article className="backbone-panel"><div className="panel-title"><div><small>AI CONTROL PLANE</small><h2>Runtime truth table</h2></div><Bot size={20}/></div>{runtime.map(r=><div className="runtime-row" key={r.capability}><div><b>{r.capability}</b><small>{r.owner}</small><p>{r.policy}</p></div><span className={r.state==='Offline'?'offline-chip':'mid-chip'}>{r.state}</span></div>)}</article><article className="backbone-panel"><div className="panel-title"><div><small>RESILIENCE</small><h2>Execution contract</h2></div><Layers3 size={20}/></div><div className="execution-chain">{['Request','Tenant context','Policy gate','Evidence gate','Provider / adapter health','Approval','Execution adapter','Audit result'].map((x,i)=><div key={x}><span>{String(i+1).padStart(2,'0')}</span><b>{x}</b></div>)}</div><div className="backbone-note"><AlertTriangle size={17}/><p>Hoy el bus es browser-local. Supabase persistence, server-side workers y providers AI permanecen pendientes de integración real.</p></div></article></div>}

    {tab==='topology'&&<article className="backbone-panel"><div className="panel-title"><div><small>ENTERPRISE TOPOLOGY</small><h2>22 directors on one contract fabric</h2></div><Network size={20}/></div><div className="topology-core"><span><Sparkles size={22}/></span><div><b>AURORA</b><small>Orchestration / decision authority</small></div></div><div className="topology-grid">{departments.filter(d=>d.id!=='ceo').map(d=>{const Icon=d.icon;return <div key={d.id}><span className={`topology-icon ${d.tone}`}><Icon size={17}/></span><div><b>{d.agent}</b><small>{d.name}</small></div><em>Event · Command · Evidence</em></div>})}</div></article>}

    {tab==='documents'&&<article className="backbone-panel"><div className="panel-title"><div><small>CONTROL PLANE DOCUMENT STUDIO</small><h2>Governance artifacts</h2></div><FileText size={20}/></div><div className="document-grid">{documents.map(d=><button key={d} onClick={()=>openWorkspace(d)}><FileText size={17}/><span><b>{d}</b><small>Workspace · correlation aware</small></span></button>)}</div></article>}

    {tab==='agent'&&<DepartmentAgentWorkspace department={department} documents={documents} knowledge={knowledge} suggestions={suggestions} onOpenWorkspace={(title,body)=>{if(body)localStorage.setItem('wae-workspace-draft',JSON.stringify({title,body}));openWorkspace(title)}}/>}
  </section>
}
