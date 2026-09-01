import { useMemo, useState } from 'react'
import {
  BrainCircuit, CheckCircle2, ChevronRight, Database, FileSearch, Layers3, Network,
  ShieldCheck, Sparkles, TriangleAlert, WandSparkles,
} from 'lucide-react'
import {
  auditBacklog, buildSectorContext, cognitiveCapabilities, contextPipeline, corporateLibrary,
  industryProfiles, knowledgeRules, modelProviders,
} from './enterprise'

export function SectorContextPanel(){
  const [selected,setSelected]=useState<string[]>(['technology'])
  const profiles=industryProfiles.filter(p=>selected.includes(p.id))
  const toggle=(id:string)=>setSelected(v=>v.includes(id)?(v.length===1?v:v.filter(x=>x!==id)):[...v,id])
  return <section className="panel evolution-panel">
    <div className="panel-head"><div><span className="eyebrow">ADAPTACIÓN AUTOMÁTICA</span><h2>Perfil sectorial de la empresa</h2></div><span className="pill">{selected.length} sector{selected.length===1?'':'es'}</span></div>
    <div className="sector-selector">{industryProfiles.map(p=><button key={p.id} className={selected.includes(p.id)?'active':''} onClick={()=>toggle(p.id)}>{p.name}</button>)}</div>
    <div className="sector-context-grid">{profiles.map(p=><article key={p.id} className="sector-card"><div><b>{p.name}</b><small>{p.subSectors.slice(0,3).join(' · ')}</small></div><dl><div><dt>KPIs</dt><dd>{p.kpis.slice(0,4).join(', ')}</dd></div><div><dt>Riesgos</dt><dd>{p.risks.slice(0,3).join(', ')}</dd></div><div><dt>Agentes</dt><dd>{p.agentFocus.slice(0,4).join(', ')}</dd></div></dl></article>)}</div>
    <div className="system-context"><Sparkles size={16}/><div><b>Contexto inyectado a los 22 agentes</b><pre>{buildSectorContext(selected)}</pre></div></div>
  </section>
}

export function CognitiveCore(){
  return <>
    <div className="cognitive-grid">{cognitiveCapabilities.map(c=><section className="panel cognitive-card" key={c.id}><div className="cognitive-icon">{c.id==='memory'?<Database size={20}/>:c.id==='knowledge'?<FileSearch size={20}/>:c.id==='router'?<Network size={20}/>:<BrainCircuit size={20}/>}</div><div><span className="ready"><i/> OPERATIVO</span><h2>{c.name}</h2><p>{c.detail}</p></div></section>)}</div>
    <div className="dashboard-columns">
      <section className="panel"><div className="panel-head"><div><span className="eyebrow">PLATAFORMA ABIERTA</span><h2>Router multi-modelo</h2></div><span className="pill">provider-agnostic</span></div><div className="provider-list">{modelProviders.map(p=><div key={p.name}><div><b>{p.name}</b><small>{p.modes.join(' · ')}</small></div><span>{p.state}</span></div>)}</div></section>
      <section className="panel"><div className="panel-head"><div><span className="eyebrow">CONTEXTO CONTROLADO</span><h2>Context pipeline</h2></div><span className="pill">tenant scoped</span></div><div className="pipeline-list">{contextPipeline.map((x,i)=><div key={x}><span>{String(i+1).padStart(2,'0')}</span><b>{x}</b><ChevronRight size={14}/></div>)}</div></section>
    </div>
    <div className="dashboard-columns">
      <section className="panel"><div className="panel-head"><div><span className="eyebrow">GOBIERNO RAG</span><h2>Reglas de evidencia</h2></div><ShieldCheck size={18}/></div><div className="rule-list">{knowledgeRules.map(r=><div key={r}><CheckCircle2 size={15}/><span>{r}</span></div>)}</div></section>
      <section className="panel"><div className="panel-head"><div><span className="eyebrow">AUDITORÍA</span><h2>Backlog crítico identificado</h2></div><TriangleAlert size={18}/></div><div className="audit-list">{auditBacklog.map(a=><div key={a.item}><span className={a.priority==='P0'?'p0':'p1'}>{a.priority}</span><div><b>{a.item}</b><small>{a.impact}</small></div></div>)}</div></section>
    </div>
  </>
}

export function KnowledgeGovernance(){
  return <div className="knowledge-governance">
    <section className="panel"><div className="panel-head"><div><span className="eyebrow">BIBLIOTECA CORPORATIVA</span><h2>Tipos de conocimiento</h2></div><Layers3 size={18}/></div><div className="library-grid">{corporateLibrary.map(x=><span key={x}>{x}</span>)}</div></section>
    <section className="panel"><div className="panel-head"><div><span className="eyebrow">RECUPERACIÓN SEGURA</span><h2>Política RAG</h2></div></div><div className="rule-list">{knowledgeRules.map(r=><div key={r}><CheckCircle2 size={15}/><span>{r}</span></div>)}</div></section>
  </div>
}

export function ExecutiveResponseCard({department}:{department:string}){
  const kpis=useMemo(()=>[
    {label:'Impacto estimado',value:'Alto',meta:'cruza 4 departamentos'},
    {label:'Confianza',value:'92%',meta:'evidencia suficiente'},
    {label:'Riesgo',value:'Medio',meta:'requiere aprobación'},
  ],[])
  return <div className="executive-response">
    <div className="response-head"><div className="response-orb"><WandSparkles size={17}/></div><div><b>Respuesta ejecutiva</b><small>{department} · análisis contextual</small></div></div>
    <div className="response-kpis">{kpis.map(k=><div key={k.label}><span>{k.label}</span><b>{k.value}</b><small>{k.meta}</small></div>)}</div>
    <div className="response-insight"><b>Conclusión</b><p>Antes de ejecutar, WAE valida datos faltantes, evidencia corporativa, permisos, impacto financiero y dependencias entre departamentos.</p></div>
    <div className="response-actions"><button>Ver evidencia</button><button>Revisar impacto</button><button className="primary-action">Preparar acción</button></div>
  </div>
}

export function MultimodalSupport(){
  const modes=['Texto','Imagen','Audio','Video','Voz','OCR','Diagramas','Planos','Fotografía','Capturas','Escaneos','Presentaciones']
  return <section className="panel"><div className="panel-head"><div><span className="eyebrow">DOCUMENT INTELLIGENCE</span><h2>Entrada multimodal</h2></div><span className="pill">12 modalidades</span></div><div className="library-grid multimodal">{modes.map(x=><span key={x}>{x}</span>)}</div></section>
}
