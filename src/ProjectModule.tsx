import { useMemo, useState, type ReactNode } from 'react'
import {
  AlertTriangle, BarChart3, Bot, BriefcaseBusiness, CalendarClock, CheckCircle2,
  CircleDollarSign, Clock3, FileText, Gauge, GitBranch, Layers3, Milestone,
  Plus, Search, ShieldAlert, Sparkles, Target, TimerReset, UsersRound, Zap,
} from 'lucide-react'
import type { Department } from './data'
import DepartmentAgentWorkspace from './DepartmentAgentWorkspace'
import './project-premium.css'

type Tab='command'|'portfolio'|'roadmap'|'kanban'|'capacity'|'risks'|'scenarios'|'documents'|'agent'
type ProjectStatus='Propuesto'|'En curso'|'En riesgo'|'Pausado'|'Completado'
type Priority='Baja'|'Media'|'Alta'|'Crítica'
type TaskStatus='Backlog'|'En curso'|'Bloqueada'|'Hecha'
type RiskLevel='Bajo'|'Medio'|'Alto'|'Crítico'
type ResourceStatus='Disponible'|'Óptimo'|'Sobrecargado'

type Project={
  id:string;name:string;program:string;owner:string;sponsor:string;status:ProjectStatus;priority:Priority;
  budget:number;spent:number;progress:number;start:string;target:string;health:number;value:number;
  team:number;criticalPathDays:number;nextMilestone:string;source:string
}
type Task={id:string;projectId:string;title:string;owner:string;status:TaskStatus;priority:Priority;due:string;effort:number;blockedBy:string[]}
type MilestoneRow={id:string;projectId:string;name:string;date:string;status:'Pendiente'|'En curso'|'Completado'|'En riesgo';owner:string;dependency:string}
type Risk={id:string;projectId:string;title:string;level:RiskLevel;impact:string;owner:string;mitigation:string;status:'Abierto'|'Mitigando'|'Resuelto'}
type Resource={name:string;role:string;capacity:number;allocated:number;projects:string[];status:ResourceStatus}
type Dependency={from:string;to:string;type:'Finish-to-start'|'External'|'Approval';lag:number;critical:boolean}

const money=(v:number)=>new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN',maximumFractionDigits:0}).format(v)
const pct=(v:number)=>`${Math.round(v)}%`

const seedProjects:Project[]=[
  {id:'PRJ-2609-01',name:'Enterprise AI Core v4',program:'Producto',owner:'Andrea Flores',sponsor:'AURORA',status:'En curso',priority:'Crítica',budget:420000,spent:248000,progress:68,start:'04 ago 2026',target:'30 sep 2026',health:78,value:920000,team:7,criticalPathDays:21,nextMilestone:'Orquestación multiagente',source:'NEXUS + AURORA'},
  {id:'PRJ-2609-02',name:'Customer Experience 360',program:'Experiencia',owner:'Mauricio León',sponsor:'CARE',status:'En curso',priority:'Alta',budget:210000,spent:108000,progress:56,start:'12 ago 2026',target:'08 oct 2026',health:87,value:480000,team:5,criticalPathDays:28,nextMilestone:'Omnichannel integration',source:'CARE + CLOSER'},
  {id:'PRJ-2609-03',name:'Finance & Accounting Close',program:'Backoffice',owner:'Andrea Flores',sponsor:'STERLING',status:'En riesgo',priority:'Alta',budget:165000,spent:121000,progress:61,start:'10 ago 2026',target:'18 sep 2026',health:58,value:360000,team:4,criticalPathDays:17,nextMilestone:'Reconciliation gate',source:'STERLING + LEDGER'},
  {id:'PRJ-2609-04',name:'Supplier Risk Network',program:'Supply Chain',owner:'Ricardo Domínguez',sponsor:'SOURCE',status:'En curso',priority:'Media',budget:128000,spent:61000,progress:47,start:'19 ago 2026',target:'20 oct 2026',health:82,value:250000,team:3,criticalPathDays:34,nextMilestone:'Risk graph v1',source:'SOURCE + PROCURE'},
  {id:'PRJ-2609-05',name:'Enterprise Security Hardening',program:'Risk',owner:'Diego Cruz',sponsor:'SENTINEL',status:'En riesgo',priority:'Crítica',budget:250000,spent:181000,progress:72,start:'01 ago 2026',target:'12 sep 2026',health:63,value:600000,team:4,criticalPathDays:11,nextMilestone:'Privileged access review',source:'SENTINEL + NORM'},
  {id:'PRJ-2608-09',name:'Commercial Revenue OS',program:'Growth',owner:'Carolina Mata',sponsor:'CLOSER',status:'Completado',priority:'Alta',budget:175000,spent:169000,progress:100,start:'06 jul 2026',target:'28 ago 2026',health:96,value:510000,team:5,criticalPathDays:0,nextMilestone:'Operación estable',source:'PULSE + CLOSER'},
]

const seedTasks:Task[]=[
  {id:'TSK-401',projectId:'PRJ-2609-01',title:'Command bus tipado para agentes',owner:'Diego Cruz',status:'En curso',priority:'Crítica',due:'05 sep',effort:18,blockedBy:[]},
  {id:'TSK-402',projectId:'PRJ-2609-01',title:'RAG tenant-aware con citas',owner:'Fernando Peña',status:'Backlog',priority:'Alta',due:'09 sep',effort:24,blockedBy:['TSK-401']},
  {id:'TSK-403',projectId:'PRJ-2609-02',title:'Adapter omnicanal',owner:'Ricardo Domínguez',status:'En curso',priority:'Alta',due:'07 sep',effort:16,blockedBy:[]},
  {id:'TSK-404',projectId:'PRJ-2609-02',title:'Customer event model',owner:'Fernando Peña',status:'Hecha',priority:'Alta',due:'30 ago',effort:12,blockedBy:[]},
  {id:'TSK-405',projectId:'PRJ-2609-03',title:'Cerrar diferencia auxiliar vs mayor',owner:'Jorge González',status:'Bloqueada',priority:'Crítica',due:'03 sep',effort:10,blockedBy:['EXT-CFDI']},
  {id:'TSK-406',projectId:'PRJ-2609-03',title:'Checklist continuous close',owner:'Andrea Flores',status:'En curso',priority:'Alta',due:'06 sep',effort:8,blockedBy:[]},
  {id:'TSK-407',projectId:'PRJ-2609-04',title:'Modelo de concentración de proveedor',owner:'Fernando Peña',status:'Backlog',priority:'Media',due:'12 sep',effort:14,blockedBy:[]},
  {id:'TSK-408',projectId:'PRJ-2609-05',title:'Review privilegios críticos',owner:'Diego Cruz',status:'Bloqueada',priority:'Crítica',due:'02 sep',effort:12,blockedBy:['APR-CISO']},
  {id:'TSK-409',projectId:'PRJ-2609-05',title:'Threat model final',owner:'Diego Cruz',status:'En curso',priority:'Alta',due:'05 sep',effort:15,blockedBy:[]},
]

const seedMilestones:MilestoneRow[]=[
  {id:'MS-101',projectId:'PRJ-2609-05',name:'Privileged access review',date:'02 sep 2026',status:'En riesgo',owner:'SENTINEL',dependency:'Aprobación CISO'},
  {id:'MS-102',projectId:'PRJ-2609-03',name:'Reconciliation gate',date:'06 sep 2026',status:'En riesgo',owner:'LEDGER',dependency:'CFDI / auxiliares'},
  {id:'MS-103',projectId:'PRJ-2609-01',name:'Orquestación multiagente',date:'09 sep 2026',status:'En curso',owner:'NEXUS',dependency:'Command bus'},
  {id:'MS-104',projectId:'PRJ-2609-02',name:'Omnichannel integration',date:'14 sep 2026',status:'Pendiente',owner:'CARE',dependency:'Adapter de canales'},
  {id:'MS-105',projectId:'PRJ-2609-04',name:'Risk graph v1',date:'19 sep 2026',status:'Pendiente',owner:'SOURCE',dependency:'Supplier scoring'},
  {id:'MS-106',projectId:'PRJ-2609-01',name:'Release candidate v4',date:'26 sep 2026',status:'Pendiente',owner:'PMO + NEXUS',dependency:'RAG + agent QA'},
]

const seedRisks:Risk[]=[
  {id:'RSK-301',projectId:'PRJ-2609-05',title:'Aprobación de privilegios retrasa hardening',level:'Crítico',impact:'Puede mover el gate de seguridad y la fecha objetivo.',owner:'SENTINEL',mitigation:'Escalamiento AURORA + ventana de aprobación de 24h.',status:'Mitigando'},
  {id:'RSK-302',projectId:'PRJ-2609-03',title:'Dependencia de evidencia CFDI / conciliación',level:'Alto',impact:'Bloquea readiness de cierre y validación contable.',owner:'LEDGER',mitigation:'Resolver diferencia y documentar fuente antes del gate.',status:'Abierto'},
  {id:'RSK-303',projectId:'PRJ-2609-01',title:'Acoplamiento del router actual',level:'Alto',impact:'Aumenta riesgo de regresión durante refactor multiagente.',owner:'NEXUS',mitigation:'Feature gates, CI y migración incremental.',status:'Mitigando'},
  {id:'RSK-304',projectId:'PRJ-2609-02',title:'Canales externos aún no conectados',level:'Medio',impact:'Limita prueba end-to-end omnicanal.',owner:'CARE',mitigation:'Adapters mock + contrato de integración versionado.',status:'Abierto'},
]

const resources:Resource[]=[
  {name:'Diego Cruz',role:'Engineering / Security',capacity:40,allocated:46,projects:['AI Core','Security'],status:'Sobrecargado'},
  {name:'Fernando Peña',role:'Data / AI',capacity:40,allocated:38,projects:['AI Core','Supplier'],status:'Óptimo'},
  {name:'Andrea Flores',role:'PM / Operations',capacity:40,allocated:36,projects:['AI Core','Finance Close'],status:'Óptimo'},
  {name:'Ricardo Domínguez',role:'Operations / CX',capacity:40,allocated:29,projects:['CX 360','Supplier'],status:'Disponible'},
  {name:'Carolina Mata',role:'Commercial',capacity:40,allocated:31,projects:['Revenue OS','CX 360'],status:'Óptimo'},
  {name:'Jorge González',role:'Accounting',capacity:40,allocated:33,projects:['Finance Close'],status:'Óptimo'},
]

const dependencies:Dependency[]=[
  {from:'Command bus',to:'RAG tenant-aware',type:'Finish-to-start',lag:0,critical:true},
  {from:'RAG tenant-aware',to:'Release candidate v4',type:'Finish-to-start',lag:1,critical:true},
  {from:'CFDI / auxiliares',to:'Reconciliation gate',type:'External',lag:0,critical:true},
  {from:'Aprobación CISO',to:'Privileged access review',type:'Approval',lag:0,critical:true},
  {from:'Adapter de canales',to:'Omnichannel integration',type:'Finish-to-start',lag:2,critical:false},
]

const documents=[
  'Portfolio Executive Review','Project Charter','Business Case','Project Plan','Roadmap ejecutivo',
  'Milestone Review','RAID Log','Risk Register','Decision Log','Dependency Map','Resource Capacity Plan',
  'Budget vs Actual','Change Request','Steering Committee Pack','Postmortem / Lessons Learned','Project Closure Report',
]
const knowledge=[
  'Metodología PMO y stage gates autorizados','Portafolio, tareas y milestones del tenant','Presupuestos y límites STERLING',
  'Capacidad y roles TALENT','Dependencias operativas ORBIT','Arquitectura y releases NEXUS','Riesgos SENTINEL / NORM',
  'Contratos y compromisos JUSTITIA','Histórico de decisiones, cambios y lecciones aprendidas',
]
const suggestions=[
  '¿Qué proyectos requieren decisión ejecutiva hoy?','Detecta la ruta crítica y los bloqueos que amenazan fechas',
  '¿Dónde tenemos sobreasignación o capacidad ociosa?','Simula el impacto de mover recursos entre proyectos',
]

function projectRiskTone(project:Project){
  if(project.status==='En riesgo'||project.health<65)return 'risk'
  if(project.health<80)return 'warn'
  return 'good'
}
function taskBlocked(task:Task){return task.status==='Bloqueada'||task.blockedBy.length>0&&task.status!=='Hecha'}

export default function ProjectModule({department}:{department:Department}){
  const [tab,setTab]=useState<Tab>('command')
  const [projects,setProjects]=useState(seedProjects)
  const [tasks,setTasks]=useState(seedTasks)
  const [risks,setRisks]=useState(seedRisks)
  const [query,setQuery]=useState('')
  const [selected,setSelected]=useState('PRJ-2609-01')
  const [open,setOpen]=useState(false)
  const [draft,setDraft]=useState({name:'',program:'Producto',owner:'Andrea Flores',sponsor:'AURORA',budget:150000,value:300000,priority:'Media' as Priority})
  const [scenario,setScenario]=useState({extraPeople:0,budgetDelta:0,delayDays:0})

  const active=projects.filter(p=>!['Completado','Pausado'].includes(p.status))
  const totalBudget=active.reduce((s,p)=>s+p.budget,0)
  const totalSpent=active.reduce((s,p)=>s+p.spent,0)
  const portfolioValue=active.reduce((s,p)=>s+p.value,0)
  const atRisk=active.filter(p=>p.status==='En riesgo'||p.health<65).length
  const criticalRisks=risks.filter(r=>r.status!=='Resuelto'&&(r.level==='Crítico'||r.level==='Alto')).length
  const blockedTasks=tasks.filter(taskBlocked).length
  const avgHealth=Math.round(active.reduce((s,p)=>s+p.health,0)/Math.max(1,active.length))
  const utilization=Math.round(resources.reduce((s,r)=>s+r.allocated,0)/resources.reduce((s,r)=>s+r.capacity,0)*100)
  const portfolioProgress=Math.round(active.reduce((s,p)=>s+p.progress*p.budget,0)/Math.max(1,totalBudget))
  const budgetVariance=totalSpent-totalBudget*(portfolioProgress/100)
  const selectedProject=projects.find(p=>p.id===selected)??projects[0]

  const filtered=useMemo(()=>{
    const q=query.trim().toLowerCase();if(!q)return projects
    return projects.filter(p=>[p.id,p.name,p.program,p.owner,p.sponsor,p.status,p.priority,p.nextMilestone,p.source].some(v=>v.toLowerCase().includes(q)))
  },[projects,query])

  const actions=useMemo(()=>{
    const list:{title:string;reason:string;tone:'good'|'warn'|'risk';projectId?:string}[]=[]
    const risky=[...active].sort((a,b)=>a.health-b.health)[0]
    if(risky)list.push({title:`Steering review · ${risky.name}`,reason:`Health ${risky.health}/100, ${pct(risky.progress)} avance y ${risky.criticalPathDays} días de ruta crítica restantes.`,tone:'risk',projectId:risky.id})
    const overloaded=resources.find(r=>r.status==='Sobrecargado')
    if(overloaded)list.push({title:`Rebalancear capacidad · ${overloaded.name}`,reason:`Asignación ${overloaded.allocated}h sobre ${overloaded.capacity}h disponibles; revisar ruta crítica antes de mover trabajo.`,tone:'warn'})
    const gate=seedMilestones.find(m=>m.status==='En riesgo')
    if(gate)list.push({title:`Desbloquear milestone · ${gate.name}`,reason:`${gate.date} · dependencia: ${gate.dependency}. Requiere owner y decisión explícita.`,tone:'risk',projectId:gate.projectId})
    const value=[...active].filter(p=>p.health>=80).sort((a,b)=>(b.value/b.budget)-(a.value/a.budget))[0]
    if(value)list.push({title:`Proteger capacidad · ${value.name}`,reason:`Health ${value.health}/100 y valor esperado ${money(value.value)}; evitar desviar recursos sin comparar impacto de portafolio.`,tone:'good',projectId:value.id})
    return list
  },[projects,risks,tasks])

  const createProject=()=>{
    if(!draft.name.trim()||draft.budget<=0)return
    const id=`PRJ-2609-${String(projects.length+1).padStart(2,'0')}`
    const next:Project={id,name:draft.name.trim(),program:draft.program,owner:draft.owner,sponsor:draft.sponsor,status:'Propuesto',priority:draft.priority,budget:Number(draft.budget),spent:0,progress:0,start:'Por aprobar',target:'Por definir',health:75,value:Number(draft.value),team:0,criticalPathDays:0,nextMilestone:'Aprobar charter y capacidad',source:'PMO intake'}
    setProjects(v=>[next,...v]);setSelected(id);setDraft({name:'',program:'Producto',owner:'Andrea Flores',sponsor:'AURORA',budget:150000,value:300000,priority:'Media'});setOpen(false);setTab('portfolio')
  }
  const advanceProject=(id:string)=>setProjects(v=>v.map(p=>{
    if(p.id!==id)return p
    if(p.status==='Propuesto')return {...p,status:'En curso',start:'01 sep 2026',health:82,team:3,criticalPathDays:30,nextMilestone:'Kickoff y baseline'}
    if(p.status==='En riesgo')return {...p,status:'En curso',health:Math.min(100,p.health+8)}
    if(p.status==='En curso'&&p.progress>=95)return {...p,status:'Completado',progress:100,health:95,criticalPathDays:0}
    return p
  }))
  const moveTask=(id:string)=>setTasks(v=>v.map(t=>{
    if(t.id!==id||t.status==='Hecha')return t
    if(t.status==='Bloqueada')return t
    return {...t,status:t.status==='Backlog'?'En curso':'Hecha'}
  }))
  const resolveRisk=(id:string)=>setRisks(v=>v.map(r=>r.id===id?{...r,status:'Resuelto'}:r))

  const scenarioImpact=useMemo(()=>{
    const capacityGain=scenario.extraPeople*12
    const scheduleGain=scenario.extraPeople>0?Math.min(12,scenario.extraPeople*3):0
    const projectedDelay=Math.max(0,scenario.delayDays-scheduleGain)
    const projectedBudget=totalBudget+scenario.budgetDelta+scenario.extraPeople*45000
    const projectedHealth=Math.max(0,Math.min(100,avgHealth+Math.min(8,scenario.extraPeople*2)-Math.round(projectedDelay/3)+(scenario.budgetDelta>0?2:scenario.budgetDelta<0?-3:0)))
    return {capacityGain,projectedDelay,projectedBudget,projectedHealth}
  },[scenario,totalBudget,avgHealth])

  const openWorkspace=(title:string)=>{
    localStorage.setItem('wae-workspace-draft',JSON.stringify({title,body:`# ${title}\n\n**Departamento:** Proyectos / PMO\n**Agente:** PMO\n\n## Resumen ejecutivo\n- Proyectos activos: ${active.length}\n- Portfolio health demo: ${avgHealth}/100\n- Presupuesto activo demo: ${money(totalBudget)}\n- Portafolio en riesgo: ${atRisk}\n- Riesgos altos/críticos abiertos: ${criticalRisks}\n- Tareas bloqueadas: ${blockedTasks}\n\n## Objetivo / Business case\n\n## Alcance y entregables\n\n## Baseline de tiempo y presupuesto\n\n## Milestones y ruta crítica\n\n## Dependencias\n\n## Capacidad y responsables\n\n## RAID / riesgos\n\n## Decisiones y cambios\n\n## Evidencia / fuentes\n\n## Próximo steering gate\n\n> Documento operativo demo. Validar sponsor, presupuesto, capacidad, dependencias y aprobaciones antes de comprometer fechas o gasto real.\n`}))
    const workspace=[...document.querySelectorAll('button')].find(b=>b.textContent?.trim()==='Workspace')
    if(workspace instanceof HTMLButtonElement)workspace.click()
  }

  return <section className="project-premium">
    <header className="project-head">
      <div className="project-brand"><span><Layers3 size={25}/></span><div><small>PMO · DIRECTOR DE PROYECTOS AI</small><h1>Project & Portfolio Intelligence</h1><p>Portafolio, ruta crítica, capacidad, presupuesto y decisiones ejecutivas en una sola capa.</p></div></div>
      <div className="project-head-status"><i/>Datos demo · Governed delivery</div>
    </header>

    <nav className="project-tabs">{[
      ['command','Command Center'],['portfolio','Portafolio'],['roadmap','Roadmap'],['kanban','Kanban'],['capacity','Capacidad'],['risks','Riesgos'],['scenarios','Scenarios'],['documents','Documentos'],['agent','PMO AI'],
    ].map(([id,label])=><button key={id} className={tab===id?'active':''} onClick={()=>setTab(id as Tab)}>{label}</button>)}</nav>

    {tab!=='agent'&&<div className="project-kpis">
      <Kpi icon={<Gauge size={18}/>} label="Portfolio health" value={`${avgHealth}/100`} detail={`${portfolioProgress}% progreso ponderado`} tone="violet"/>
      <Kpi icon={<CircleDollarSign size={18}/>} label="Presupuesto activo" value={money(totalBudget)} detail={`${money(totalSpent)} ejecutado`} tone="cyan"/>
      <Kpi icon={<Target size={18}/>} label="Valor esperado" value={money(portfolioValue)} detail={`${active.length} proyectos activos`} tone="emerald"/>
      <Kpi icon={<ShieldAlert size={18}/>} label="En riesgo" value={String(atRisk)} detail={`${criticalRisks} riesgos altos/críticos`} tone="amber"/>
      <Kpi icon={<UsersRound size={18}/>} label="Utilización" value={pct(utilization)} detail={`${resources.filter(r=>r.status==='Sobrecargado').length} sobrecargados`} tone="rose"/>
    </div>}

    {tab==='command'&&<div className="project-grid">
      <article className="project-card project-hero">
        <div className="card-title"><div><small>PORTFOLIO CONTROL TOWER</small><h2>Estado ejecutivo del portafolio</h2></div><Sparkles size={20}/></div>
        <div className="project-health-row"><div className="health-ring"><b>{avgHealth}</b><span>/100</span></div><div><strong>{atRisk?`${atRisk} proyectos requieren intervención`:'Portafolio estable'}</strong><p>{blockedTasks} tareas bloqueadas · {criticalRisks} riesgos altos/críticos · variación vs progreso {money(budgetVariance)}</p></div></div>
        <div className="project-bars">
          <MetricBar label="Progreso ponderado" value={portfolioProgress}/><MetricBar label="Uso de presupuesto" value={totalBudget?totalSpent/totalBudget*100:0}/><MetricBar label="Utilización capacidad" value={utilization}/>
        </div>
      </article>

      <article className="project-card">
        <div className="card-title"><div><small>NEXT BEST ACTION</small><h2>Decision Queue</h2></div><Zap size={19}/></div>
        <div className="decision-list">{actions.map(a=><button key={a.title} className={a.tone} onClick={()=>{if(a.projectId){setSelected(a.projectId);setTab('portfolio')}}}><span>{a.tone==='risk'?<AlertTriangle size={17}/>:a.tone==='warn'?<TimerReset size={17}/>:<CheckCircle2 size={17}/>}</span><div><b>{a.title}</b><p>{a.reason}</p></div></button>)}</div>
      </article>

      <article className="project-card">
        <div className="card-title"><div><small>UPCOMING GATES</small><h2>Milestones prioritarios</h2></div><Milestone size={19}/></div>
        <div className="milestone-list">{seedMilestones.slice(0,5).map(m=><div key={m.id} className={`milestone-row ${m.status.replaceAll(' ','-').toLowerCase()}`}><span>{m.date.split(' ')[0]}<small>{m.date.split(' ')[1]}</small></span><div><b>{m.name}</b><p>{m.owner} · {m.dependency}</p></div><em>{m.status}</em></div>)}</div>
      </article>

      <article className="project-card">
        <div className="card-title"><div><small>CRITICAL PATH</small><h2>Dependencias que mandan la fecha</h2></div><GitBranch size={19}/></div>
        <div className="dependency-list">{dependencies.filter(d=>d.critical).map((d,i)=><div key={`${d.from}-${d.to}`}><span>{i+1}</span><div><b>{d.from}</b><small>{d.type} · lag {d.lag}d</small><strong>→ {d.to}</strong></div></div>)}</div>
      </article>
    </div>}

    {tab==='portfolio'&&<div className="project-panel">
      <div className="panel-toolbar"><div className="searchbox"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar proyecto, programa, owner, sponsor..."/></div><button className="primary" onClick={()=>setOpen(true)}><Plus size={17}/>Nuevo proyecto</button></div>
      <div className="portfolio-layout">
        <div className="project-table-wrap"><table className="project-table"><thead><tr><th>Proyecto</th><th>Estado</th><th>Health</th><th>Avance</th><th>Presupuesto</th><th>Valor</th><th>Milestone</th><th/></tr></thead><tbody>{filtered.map(p=><tr key={p.id} className={selected===p.id?'selected':''} onClick={()=>setSelected(p.id)}><td><b>{p.name}</b><small>{p.id} · {p.program} · {p.owner}</small></td><td><span className={`status ${p.status.replaceAll(' ','-').toLowerCase()}`}>{p.status}</span></td><td><b className={`health-${projectRiskTone(p)}`}>{p.health}/100</b></td><td><div className="mini-progress"><i style={{width:`${p.progress}%`}}/></div><small>{p.progress}%</small></td><td>{money(p.spent)}<small>de {money(p.budget)}</small></td><td>{money(p.value)}</td><td><b>{p.nextMilestone}</b><small>{p.target}</small></td><td><button className="mini-btn" onClick={e=>{e.stopPropagation();advanceProject(p.id)}}>{p.status==='Propuesto'?'Aprobar':p.status==='En riesgo'?'Estabilizar':'Actualizar'}</button></td></tr>)}</tbody></table></div>
        <aside className="project-passport"><small>PROJECT 360</small><h3>{selectedProject.name}</h3><p>{selectedProject.id} · {selectedProject.program}</p><div className="passport-score"><b>{selectedProject.health}</b><span>Health</span></div><dl><div><dt>Sponsor</dt><dd>{selectedProject.sponsor}</dd></div><div><dt>Owner</dt><dd>{selectedProject.owner}</dd></div><div><dt>Prioridad</dt><dd>{selectedProject.priority}</dd></div><div><dt>Equipo</dt><dd>{selectedProject.team}</dd></div><div><dt>Ruta crítica</dt><dd>{selectedProject.criticalPathDays} días</dd></div><div><dt>Fuente</dt><dd>{selectedProject.source}</dd></div></dl><button onClick={()=>openWorkspace(`Project Brief · ${selectedProject.name}`)}><FileText size={16}/>Abrir Project Brief</button></aside>
      </div>
    </div>}

    {tab==='roadmap'&&<div className="project-panel">
      <div className="section-heading"><div><small>PORTFOLIO ROADMAP</small><h2>Milestones, gates y dependencias</h2></div><CalendarClock size={20}/></div>
      <div className="roadmap-grid">{seedMilestones.map(m=>{const p=projects.find(x=>x.id===m.projectId);return <article key={m.id} className={`roadmap-card ${m.status.replaceAll(' ','-').toLowerCase()}`}><header><span>{m.date}</span><em>{m.status}</em></header><h3>{m.name}</h3><p>{p?.name}</p><div><GitBranch size={15}/><span>{m.dependency}</span></div><footer>{m.owner}</footer></article>})}</div>
      <div className="project-card dependency-map"><div className="card-title"><div><small>DEPENDENCY INTELLIGENCE</small><h2>Mapa de dependencias</h2></div><GitBranch size={19}/></div>{dependencies.map(d=><div key={`${d.from}-${d.to}`} className={d.critical?'critical':''}><b>{d.from}</b><span>→</span><b>{d.to}</b><small>{d.type} · lag {d.lag}d</small>{d.critical&&<em>Critical path</em>}</div>)}</div>
    </div>}

    {tab==='kanban'&&<div className="project-panel">
      <div className="section-heading"><div><small>DELIVERY BOARD</small><h2>Kanban multi-proyecto</h2></div><BriefcaseBusiness size={20}/></div>
      <div className="kanban-grid">{(['Backlog','En curso','Bloqueada','Hecha'] as TaskStatus[]).map(status=><section key={status} className="kanban-col"><header><b>{status}</b><span>{tasks.filter(t=>t.status===status).length}</span></header>{tasks.filter(t=>t.status===status).map(t=>{const p=projects.find(x=>x.id===t.projectId);return <article key={t.id} className={t.priority.toLowerCase()}><small>{p?.name}</small><h3>{t.title}</h3><p>{t.owner} · {t.effort}h · vence {t.due}</p>{t.blockedBy.length>0&&<div className="blocked"><AlertTriangle size={14}/>Bloqueo: {t.blockedBy.join(', ')}</div>}<footer><span>{t.priority}</span>{status!=='Bloqueada'&&status!=='Hecha'&&<button onClick={()=>moveTask(t.id)}>{status==='Backlog'?'Iniciar':'Completar'}</button>}</footer></article>})}</section>)}</div>
    </div>}

    {tab==='capacity'&&<div className="project-panel">
      <div className="section-heading"><div><small>RESOURCE INTELLIGENCE</small><h2>Capacidad, carga y riesgo de cuello de botella</h2></div><UsersRound size={20}/></div>
      <div className="capacity-grid">{resources.map(r=>{const use=r.allocated/r.capacity*100;return <article key={r.name} className={r.status.toLowerCase()}><header><div><b>{r.name}</b><small>{r.role}</small></div><span>{r.status}</span></header><div className="capacity-value"><b>{r.allocated}h</b><span>/ {r.capacity}h</span></div><div className="capacity-bar"><i style={{width:`${Math.min(100,use)}%`}}/></div><p>{r.projects.join(' · ')}</p>{use>100&&<div className="capacity-alert"><AlertTriangle size={15}/>Sobreasignación de {Math.round(use-100)}%</div>}</article>})}</div>
      <article className="project-card"><div className="card-title"><div><small>CAPACITY POLICY</small><h2>Regla PMO</h2></div><Gauge size={19}/></div><p className="policy-copy">No reasignar recursos únicamente por utilización. PMO debe comparar impacto en ruta crítica, valor esperado, riesgo, especialidad y costo de cambio de contexto antes de mover capacidad entre proyectos.</p></article>
    </div>}

    {tab==='risks'&&<div className="project-panel">
      <div className="section-heading"><div><small>RAID CONTROL</small><h2>Riesgos y bloqueos de portafolio</h2></div><ShieldAlert size={20}/></div>
      <div className="risk-grid">{risks.map(r=>{const p=projects.find(x=>x.id===r.projectId);return <article key={r.id} className={`${r.level.toLowerCase()} ${r.status==='Resuelto'?'resolved':''}`}><header><span>{r.level}</span><em>{r.status}</em></header><h3>{r.title}</h3><p>{p?.name}</p><dl><div><dt>Impacto</dt><dd>{r.impact}</dd></div><div><dt>Mitigación</dt><dd>{r.mitigation}</dd></div><div><dt>Owner</dt><dd>{r.owner}</dd></div></dl>{r.status!=='Resuelto'&&<button onClick={()=>resolveRisk(r.id)}><CheckCircle2 size={15}/>Marcar resuelto</button>}</article>})}</div>
    </div>}

    {tab==='scenarios'&&<div className="project-panel">
      <div className="section-heading"><div><small>PORTFOLIO WHAT-IF ENGINE</small><h2>Scenario planning</h2></div><Sparkles size={20}/></div>
      <div className="scenario-layout"><article className="scenario-controls"><label>Recursos adicionales <b>{scenario.extraPeople}</b><input type="range" min="0" max="4" value={scenario.extraPeople} onChange={e=>setScenario(v=>({...v,extraPeople:Number(e.target.value)}))}/></label><label>Variación de presupuesto <b>{money(scenario.budgetDelta)}</b><input type="range" min="-150000" max="250000" step="25000" value={scenario.budgetDelta} onChange={e=>setScenario(v=>({...v,budgetDelta:Number(e.target.value)}))}/></label><label>Shock de calendario <b>+{scenario.delayDays} días</b><input type="range" min="0" max="30" value={scenario.delayDays} onChange={e=>setScenario(v=>({...v,delayDays:Number(e.target.value)}))}/></label><p>Modelo demo para explorar sensibilidad. No modifica proyectos reales.</p></article><article className="scenario-result"><small>IMPACTO PROYECTADO</small><div><span>Portfolio health</span><b>{scenarioImpact.projectedHealth}/100</b></div><div><span>Presupuesto proyectado</span><b>{money(scenarioImpact.projectedBudget)}</b></div><div><span>Delay neto</span><b>+{scenarioImpact.projectedDelay} días</b></div><div><span>Capacidad incremental</span><b>+{scenarioImpact.capacityGain} h/sem</b></div><p>Antes de ejecutar una reasignación real, validar skills, costo, contratos, ruta crítica y autorizaciones con TALENT, STERLING y responsables del proyecto.</p></article></div>
    </div>}

    {tab==='documents'&&<div className="project-panel"><div className="section-heading"><div><small>PROJECT DOCUMENT STUDIO</small><h2>Documentos gobernados</h2></div><FileText size={20}/></div><div className="document-grid">{documents.map(d=><button key={d} onClick={()=>openWorkspace(d)}><FileText size={18}/><div><b>{d}</b><small>Generar borrador editable en Workspace</small></div><span>→</span></button>)}</div></div>}

    {tab==='agent'&&<DepartmentAgentWorkspace department={department} documents={documents} knowledge={knowledge} suggestions={suggestions} onOpenWorkspace={openWorkspace}/>}    

    {open&&<div className="project-modal-backdrop" onMouseDown={()=>setOpen(false)}><div className="project-modal" onMouseDown={e=>e.stopPropagation()}><header><div><small>PMO INTAKE</small><h2>Nuevo proyecto</h2></div><button onClick={()=>setOpen(false)}>×</button></header><div className="project-form"><label>Nombre<input value={draft.name} onChange={e=>setDraft(v=>({...v,name:e.target.value}))} placeholder="Nombre del proyecto"/></label><label>Programa<select value={draft.program} onChange={e=>setDraft(v=>({...v,program:e.target.value}))}><option>Producto</option><option>Experiencia</option><option>Backoffice</option><option>Growth</option><option>Risk</option><option>Supply Chain</option></select></label><label>Owner<input value={draft.owner} onChange={e=>setDraft(v=>({...v,owner:e.target.value}))}/></label><label>Sponsor<input value={draft.sponsor} onChange={e=>setDraft(v=>({...v,sponsor:e.target.value}))}/></label><label>Presupuesto<input type="number" value={draft.budget} onChange={e=>setDraft(v=>({...v,budget:Number(e.target.value)}))}/></label><label>Valor esperado<input type="number" value={draft.value} onChange={e=>setDraft(v=>({...v,value:Number(e.target.value)}))}/></label><label>Prioridad<select value={draft.priority} onChange={e=>setDraft(v=>({...v,priority:e.target.value as Priority}))}><option>Baja</option><option>Media</option><option>Alta</option><option>Crítica</option></select></label></div><div className="project-modal-note"><AlertTriangle size={16}/>El proyecto se crea como <b>Propuesto</b>. Activarlo requiere charter, sponsor, presupuesto y capacidad aprobados.</div><footer><button onClick={()=>setOpen(false)}>Cancelar</button><button className="primary" onClick={createProject}><Plus size={16}/>Crear propuesta</button></footer></div></div>}
  </section>
}

function Kpi({icon,label,value,detail,tone}:{icon:ReactNode;label:string;value:string;detail:string;tone:string}){return <div className={`project-kpi ${tone}`}><span>{icon}</span><div><small>{label}</small><b>{value}</b><em>{detail}</em></div></div>}
function MetricBar({label,value}:{label:string;value:number}){return <div className="metric-bar"><div><span>{label}</span><b>{pct(value)}</b></div><i><em style={{width:`${Math.max(3,Math.min(100,value))}%`}}/></i></div>}
