import { useMemo, useState } from 'react'
import {
  Activity, Bot, ChevronRight, FileText, Gauge, Layers3, Plus, Search, Sparkles,
  WandSparkles, Workflow, X, Zap,
} from 'lucide-react'
import type { Department } from './data'
import DepartmentAgentWorkspace from './DepartmentAgentWorkspace'
import { departmentBlueprints, type DepartmentRecord } from './departmentCatalog'
import './department-operations.css'

type Tab='dashboard'|'records'|'tools'|'documents'|'agent'

function openWorkspaceDraft(title:string,body:string){
  localStorage.setItem('wae-workspace-draft',JSON.stringify({title,body}))
  const workspace=[...document.querySelectorAll('button')].find(b=>b.textContent?.trim()==='Workspace')
  if(workspace instanceof HTMLButtonElement)workspace.click()
}

export default function DepartmentOperationsModule({department}:{department:Department}){
  const blueprint=departmentBlueprints[department.id]
  const [tab,setTab]=useState<Tab>('dashboard')
  const [records,setRecords]=useState<DepartmentRecord[]>(blueprint?.records??[])
  const [query,setQuery]=useState('')
  const [newOpen,setNewOpen]=useState(false)
  const [draft,setDraft]=useState({title:'',subtitle:'',amount:'',status:'Pendiente',meta:''})

  if(!blueprint)return null
  const filtered=useMemo(()=>{const q=query.trim().toLowerCase();return !q?records:records.filter(r=>[r.title,r.subtitle,r.status,r.meta??''].some(v=>v.toLowerCase().includes(q)))},[records,query])
  const activeCount=records.filter(r=>!['Completo','Resuelto','Pagada','Contabilizada','Operativo','Saludable'].includes(r.status)).length

  const createRecord=()=>{
    if(!draft.title.trim())return
    setRecords(v=>[{id:`${department.id}-${Date.now()}`,title:draft.title.trim(),subtitle:draft.subtitle.trim()||`Nuevo ${blueprint.recordLabel}`,amount:draft.amount||undefined,status:draft.status,meta:draft.meta||undefined},...v])
    setDraft({title:'',subtitle:'',amount:'',status:'Pendiente',meta:''});setNewOpen(false);setTab('records')
  }
  const advance=(id:string)=>setRecords(v=>v.map(r=>r.id===id?{...r,status:r.status==='Pendiente'?'En curso':r.status==='En curso'?'Completo':'En curso'}:r))
  const documentBody=(title:string)=>`# ${title}\n\n**Departamento:** ${blueprint.title}\n**Agente:** ${department.agent}\n\n## Objetivo\n\n## Contexto y datos\n\n## Desarrollo\n\n## Riesgos / excepciones\n\n## Acciones y responsables\n\n## Evidencia / anexos\n\n## Aprobaciones\n\n> Borrador operativo generado desde WAE OS. Validar información crítica antes de ejecutar acciones externas.\n`

  return <section className={`department-ops department-ops-${department.tone}`}>
    <header className="department-ops-heading">
      <span className="department-ops-icon"><department.icon size={25}/></span>
      <div><small>{department.agent} · {department.role}</small><h1>{blueprint.title}</h1><p>{blueprint.subtitle}</p></div>
      <span className="department-online"><i/>AI activa</span>
    </header>

    <nav className="department-ops-tabs">
      <button className={tab==='dashboard'?'active':''} onClick={()=>setTab('dashboard')}><Gauge size={15}/>Dashboard</button>
      <button className={tab==='records'?'active':''} onClick={()=>setTab('records')}><Layers3 size={15}/>Operación</button>
      <button className={tab==='tools'?'active':''} onClick={()=>setTab('tools')}><WandSparkles size={15}/>Herramientas</button>
      <button className={tab==='documents'?'active':''} onClick={()=>setTab('documents')}><FileText size={15}/>Documentos</button>
      <button className={tab==='agent'?'active':''} onClick={()=>setTab('agent')}><Bot size={15}/>{department.agent} AI</button>
    </nav>

    {tab!=='agent'&&<div className="department-ops-kpis">{blueprint.metrics.map(m=><div key={m.label}><span>{m.label}</span><b>{m.value}</b>{m.detail&&<small>{m.detail}</small>}</div>)}</div>}

    {tab==='dashboard'&&<div className="department-ops-dashboard">
      <section className="department-ops-panel">
        <div className="department-panel-head"><div><small>ESTADO OPERATIVO</small><h2>Prioridades de {blueprint.title}</h2></div><span>{activeCount} requieren seguimiento</span></div>
        <div className="department-record-preview">{records.slice(0,4).map(r=><button key={r.id} onClick={()=>setTab('records')}><span className="record-orb"><Activity size={15}/></span><div><b>{r.title}</b><small>{r.subtitle}</small></div>{r.amount&&<strong>{r.amount}</strong>}<em>{r.status}</em><ChevronRight size={15}/></button>)}</div>
      </section>
      <section className="department-ops-panel">
        <div className="department-panel-head"><div><small>AUTOMATIZACIÓN</small><h2>Flujos activos</h2></div><span>{department.automations.length}</span></div>
        <div className="department-auto-list">{department.automations.map((a,i)=><div key={a}><span>{String(i+1).padStart(2,'0')}</span><div><b>{a}</b><small>Validación → permisos → ejecución → auditoría</small></div><i/></div>)}</div>
      </section>
      <section className="department-ops-panel department-integrations">
        <div className="department-panel-head"><div><small>COLABORACIÓN</small><h2>Integraciones</h2></div></div>
        <div>{blueprint.integrations.map(x=><span key={x}>{x}</span>)}</div>
      </section>
    </div>}

    {tab==='records'&&<section className="department-ops-panel">
      <div className="department-panel-head"><div><small>OPERACIÓN</small><h2>{blueprint.recordLabel.charAt(0).toUpperCase()+blueprint.recordLabel.slice(1)}s</h2></div><button className="department-primary" onClick={()=>setNewOpen(true)}><Plus size={15}/>Nuevo {blueprint.recordLabel}</button></div>
      <label className="department-search"><Search size={15}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={`Buscar ${blueprint.recordLabel}, estado o contexto...`}/></label>
      <div className="department-record-list">{filtered.map(r=><article key={r.id}><span className="record-orb"><Activity size={15}/></span><div><b>{r.title}</b><small>{r.subtitle}</small>{r.meta&&<em>{r.meta}</em>}</div>{r.amount&&<strong>{r.amount}</strong>}<span className="department-status">{r.status}</span><button onClick={()=>advance(r.id)}>Actualizar</button></article>)}</div>
    </section>}

    {tab==='tools'&&<section className="department-ops-panel"><div className="department-panel-head"><div><small>TOOLKIT</small><h2>Herramientas especializadas</h2></div></div><div className="department-tool-grid">{blueprint.tools.map(tool=><button key={tool}><Zap size={17}/><span>{tool}</span><small>Disponible</small></button>)}</div></section>}

    {tab==='documents'&&<section className="department-ops-panel"><div className="department-panel-head"><div><small>WORKSPACE READY</small><h2>Documentos del departamento</h2></div></div><div className="department-doc-list">{blueprint.documents.map(doc=><div key={doc}><FileText size={17}/><span>{doc}</span><button onClick={()=>openWorkspaceDraft(doc,documentBody(doc))}>Editar en Workspace</button></div>)}</div></section>}

    {tab==='agent'&&<DepartmentAgentWorkspace department={department} documents={blueprint.documents} knowledge={blueprint.knowledge} suggestions={blueprint.quickPrompts} onOpenWorkspace={(title,body)=>openWorkspaceDraft(title,body??documentBody(title))}/>} 

    {newOpen&&<div className="department-modal-backdrop" onMouseDown={()=>setNewOpen(false)}><div className="department-modal" onMouseDown={e=>e.stopPropagation()}><div className="department-modal-head"><div><Sparkles size={17}/><b>Nuevo {blueprint.recordLabel}</b></div><button onClick={()=>setNewOpen(false)}><X size={17}/></button></div><label><span>Título</span><input value={draft.title} onChange={e=>setDraft({...draft,title:e.target.value})}/></label><label><span>Descripción</span><textarea value={draft.subtitle} onChange={e=>setDraft({...draft,subtitle:e.target.value})}/></label><div className="department-modal-grid"><label><span>Importe / valor</span><input value={draft.amount} onChange={e=>setDraft({...draft,amount:e.target.value})} placeholder="Opcional"/></label><label><span>Estado</span><select value={draft.status} onChange={e=>setDraft({...draft,status:e.target.value})}><option>Pendiente</option><option>En curso</option><option>Programado</option><option>Atención</option><option>Crítico</option></select></label></div><label><span>Contexto</span><input value={draft.meta} onChange={e=>setDraft({...draft,meta:e.target.value})} placeholder="Responsable, SLA, área, fecha..."/></label><div className="department-modal-actions"><button className="department-primary" onClick={createRecord}>Crear</button><button onClick={()=>setNewOpen(false)}>Cancelar</button></div></div></div>}
  </section>
}
